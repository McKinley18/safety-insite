import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';

import { AuthenticatedUser, requireAuthenticatedUser } from '../../common/authenticated-user';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';
import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import { InspectionService } from '../../inspection/inspection.service';
import { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import {
  ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION, auditMetadataForAnalysisCreation,
} from './expert-analysis-audit';
import {
  type AnalysisState, type ExecutionClaimOutcome, type ExpertExecutionState,
  type ExpertOutcomeForState, classifyExistingExecution, claimPermitsProviderSpend,
  deriveAnalysisState,
} from './expert-analysis-authority';
import {
  CONFIRMATION_RULE_VERSION, type ConfirmationDetermination, confirmationNotApplicable,
  deriveConfirmationRequiredFromAnalysis,
} from './expert-confirmation-rule';

/**
 * §261 — THE SERVER-SIDE EXPERT INTEGRATION FOUNDATION.
 *
 * WHAT THIS SLICE IMPLEMENTS AND WHAT IT DELIBERATELY DOES NOT.
 *
 * It implements the trustworthy substrate that must exist BEFORE Expert provider execution is
 * connected to a user-facing route: the pre-spend execution claim, server-authored producer
 * assignment, the deterministic confirmation determination, the persisted-once confirmation flag,
 * explicit product state, and the analysis-creation audit event.
 *
 * It does NOT invoke the provider, and it has NO provider dependency — deliberately, and verifiably:
 * this class's constructor takes a data source, two repositories and the existing InspectionService,
 * and nothing else. `runExpertHazLenzAnalysis` is not imported here. Slice 3 adds the orchestration
 * BETWEEN `claimExecution` and `persistAuthoritativeAnalysis`, and slice 4 adds the route. The two
 * methods are shaped as the two ends of that gap so the later slices extend this class rather than
 * replace it.
 *
 * ---------------------------------------------------------------------------------------------
 * AUTHORIZATION: NO NEW MECHANISM, AND THAT IS THE POINT.
 *
 * Every entry point below routes through `InspectionService.authorizeObservation`, which resolves
 * the observation, then calls `findAccessible` on its inspection — the existing tenant choke point
 * that answers NotFound rather than Forbidden and therefore leaks no existence. An analysis or
 * execution id is NEVER trusted as a bare primary key: it is resolved as
 * `findOne({ id, observationId })` AFTER the observation has been authorized, which is the pattern
 * `addReview` already uses.
 *
 * This slice exposes no route. The later Expert route must carry the `classify` guard profile —
 * JwtGuard, EntitlementGuard('fullSafeScope'), RolesGuard and a dedicated Throttle — and must not
 * inherit the persistence route's JwtGuard-only posture. Because every method here takes the raw
 * user and authorizes internally, adding those guards is additive and cannot be skipped by a caller
 * that forgets: the tenant check happens in here regardless.
 */
@Injectable()
export class ExpertAnalysisService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ExpertAnalysisExecution)
    private readonly executions: Repository<ExpertAnalysisExecution>,
    @InjectRepository(HazLenzAnalysis)
    private readonly analyses: Repository<HazLenzAnalysis>,
    private readonly inspections: InspectionService,
  ) {}

  /**
   * THE PRE-SPEND CLAIM. This is the mechanism §260 section 16 names as the only genuinely new one.
   *
   * Inserts an execution record in ANALYSIS_RUNNING under (observationId, idempotencyKey) BEFORE any
   * provider call. Two requests with the same identity cannot both be CLAIMED, because the unique
   * index — not application logic — decides which one wins. The loser discovers the existing record
   * and learns, from its persisted state alone, whether an execution is running, already completed,
   * or already failed retryably or terminally. In every non-CLAIMED case the caller must not spend,
   * and `claimPermitsProviderSpend` is the single predicate that says so.
   *
   * WHY THE UNIQUE INDEX AND NOT A READ-THEN-WRITE CHECK. A read-then-write check has a window
   * between the read and the write, and two concurrent Expert requests that both pass the check
   * would both spend two provider legs. The index closes the window in the database, where
   * concurrency is actually adjudicated.
   *
   * WHY THE ADVISORY LOCK AS WELL. The unique index serialises requests sharing an idempotency key;
   * the advisory lock serialises DIFFERENT keys on the SAME observation, which is the existing
   * convention for this table and is what keeps `requestVersion` monotonic. The same lock name the
   * legacy path uses is taken deliberately, so a legacy analysis and an Expert execution on one
   * observation cannot interleave.
   */
  async claimExecution(
    rawUser: unknown,
    observationId: string,
    claim: { readonly idempotencyKey: string; readonly requestVersion: number },
  ): Promise<{
    readonly outcome: ExecutionClaimOutcome;
    readonly execution: ExpertAnalysisExecution;
    readonly mayCallProvider: boolean;
  }> {
    const user = requireAuthenticatedUser(rawUser);
    const { observation, inspection } = await this.inspections.authorizeObservation(
      user, observationId,
    );

    const existing = await this.executions.findOne({
      where: { observationId, idempotencyKey: claim.idempotencyKey },
    });
    if (existing) return this.describeCollision(existing);

    try {
      return await this.dataSource.transaction(async manager => {
        await manager.query(
          `SELECT pg_advisory_xact_lock(hashtext($1))`,
          [`hazlenz-analysis:${observationId}`],
        );
        const repository = manager.getRepository(ExpertAnalysisExecution);
        const claimed = await repository.save(repository.create({
          observationId,
          inspectionId: observation.inspectionId,
          // Read from the SERVER's authorized inspection, never from the caller's token. A user
          // whose token names one organization must not be able to attribute an execution to
          // another, and `findAccessible` has already established this inspection is theirs.
          organizationId: inspection.organizationId ?? null,
          analysisId: null,
          idempotencyKey: claim.idempotencyKey,
          requestVersion: claim.requestVersion,
          executionState: 'ANALYSIS_RUNNING',
          producer: 'server_authored',
          attempts: 0,
          verifierReached: false,
          requestedByUserId: user.userId,
          completedAt: null,
        }));
        return { outcome: 'CLAIMED' as const, execution: claimed, mayCallProvider: true };
      });
    } catch (error) {
      // A concurrent claimant won the unique index. Resolve to THEIR record rather than raising:
      // the caller's question is "may I spend", and the answer is a definite no with a reason.
      if (error instanceof QueryFailedError) {
        const concurrent = await this.executions.findOne({
          where: { observationId, idempotencyKey: claim.idempotencyKey },
        });
        if (concurrent) return this.describeCollision(concurrent);
      }
      throw error;
    }
  }

  private describeCollision(execution: ExpertAnalysisExecution): {
    readonly outcome: ExecutionClaimOutcome;
    readonly execution: ExpertAnalysisExecution;
    readonly mayCallProvider: boolean;
  } {
    const outcome = classifyExistingExecution(execution.executionState);
    return { outcome, execution, mayCallProvider: claimPermitsProviderSpend(outcome) };
  }

  /**
   * Resolve an execution WITHOUT trusting its id as a bare key.
   *
   * The observation is authorized first, and the execution is then required to belong to it. An
   * execution id from another workspace therefore resolves to NotFound rather than to a row: there
   * is no code path in which an execution is loaded by id alone and its tenant inferred from the
   * row it happened to find.
   */
  async loadExecutionForObservation(
    rawUser: unknown, observationId: string, executionId: string,
  ): Promise<ExpertAnalysisExecution> {
    const user = requireAuthenticatedUser(rawUser);
    await this.inspections.authorizeObservation(user, observationId);
    const execution = await this.executions.findOne({ where: { id: executionId, observationId } });
    if (!execution) throw new NotFoundException('Expert analysis execution not found.');
    return execution;
  }

  /**
   * §262. Resolve the analysis an ALREADY-SETTLED execution produced, so a duplicate request can be
   * answered with the authoritative result instead of running a second one.
   *
   * NO AUTHORIZATION IS PERFORMED OR NEEDED HERE, and that is safe for one reason: the execution
   * record was itself resolved under `findOne({ id, observationId })` after the observation was
   * authorized, so the caller has already been proven to reach this observation. The analysis is
   * then constrained to the SAME observation and the SAME execution, so an execution row whose
   * `analysisId` somehow named a foreign analysis resolves to null rather than to that analysis.
   */
  async loadAnalysisForExecution(
    execution: ExpertAnalysisExecution,
  ): Promise<HazLenzAnalysis | null> {
    if (!execution.analysisId) return null;
    return this.analyses.findOne({
      where: {
        id: execution.analysisId,
        observationId: execution.observationId,
        expertExecutionId: execution.id,
      },
    });
  }

  /**
   * THE DETERMINISTIC CONFIRMATION DETERMINATION, exposed so a caller can see it without a
   * database. Delegates to the pure rule and adds nothing: no service-level override exists, and
   * there is deliberately no parameter by which a caller could influence the answer.
   */
  determineConfirmation(admittedAnalysis: unknown): ConfirmationDetermination {
    return deriveConfirmationRequiredFromAnalysis(admittedAnalysis);
  }

  /**
   * PERSIST THE AUTHORITATIVE EXPERT RESULT. One transaction covering the analysis row, the
   * supersession of any prior `current` analysis, completion of the execution record, and the
   * audit event.
   *
   * THE PROVIDER CALL HAPPENS BEFORE THIS TRANSACTION OPENS, in the slice that adds it. A database
   * failure must never re-spend a provider call, which is why nothing in here may call out.
   *
   * THE CONFIRMATION FLAG IS COMPUTED HERE, ONCE, AND STORED. It is derived from the admitted
   * output at persistence time by the pure rule, written to the analysis row, and never recomputed
   * on read. The rule's version is written to the execution record in the same transaction, so the
   * flag and the identity of the rule that produced it cannot be separated.
   *
   * H3/H4 STRUCTURAL IDENTITY SURVIVES BECAUSE `resultSnapshot` IS WRITTEN WHOLE. The admitted
   * representation is stored as the jsonb it already is — `declarationId` per declaration,
   * `resumeCondition.resolvedByDeclarationIds`, `controlId` per required control, and
   * `dischargingControlRef` as the id rather than resolved prose. There is no field list, no mapper
   * and no projection between the admitted structure and the column, so there is nothing that could
   * flatten a structural identity to prose. That absence is the mechanism, and §261's persistence
   * tests assert it on real structures rather than trusting the claim.
   */
  async persistAuthoritativeAnalysis(
    rawUser: unknown,
    observationId: string,
    executionId: string,
    result: AuthoritativeExpertResult,
  ): Promise<{ readonly analysis: HazLenzAnalysis; readonly execution: ExpertAnalysisExecution }> {
    const user = requireAuthenticatedUser(rawUser);
    const { observation } = await this.inspections.authorizeObservation(user, observationId);

    // §262. THE RULE RUNS ONLY WHERE THERE IS AN ADMITTED OPERATIONAL CONCLUSION TO SETTLE.
    //
    // §261 ran it unconditionally, which was harmless while nothing produced a refusal through this
    // method and wrong the moment §262 did: an unreadable posture fails closed, so a REFUSED or
    // FAILED row would have been stored with `confirmationRequired = true` — asking a human to
    // confirm a classification that does not exist. The flag now means one thing on every row.
    const admitted = result.status === 'COMPLETE' && result.admission === 'ADMIT';
    const determination = admitted
      ? this.determineConfirmation(result.admittedAnalysis)
      : confirmationNotApplicable();
    const analysisState = deriveAnalysisState({
      status: result.status,
      admission: result.admission,
      confirmationRequired: determination.confirmationRequired,
    });

    return this.dataSource.transaction(async manager => {
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext($1))`,
        [`hazlenz-analysis:${observationId}`],
      );
      // Re-resolved INSIDE the transaction and constrained to this observation, so an execution id
      // belonging to another observation cannot be completed through this call.
      const executions = manager.getRepository(ExpertAnalysisExecution);
      const execution = await executions.findOne({ where: { id: executionId, observationId } });
      if (!execution) throw new NotFoundException('Expert analysis execution not found.');
      if (execution.executionState !== 'ANALYSIS_RUNNING') {
        throw new ConflictException('This Expert execution has already been settled.');
      }

      const analyses = manager.getRepository(HazLenzAnalysis);
      const latest = await analyses.findOne({
        where: { observationId },
        order: { requestVersion: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      if (latest && execution.requestVersion <= latest.requestVersion) {
        throw new ConflictException('A newer analysis request already exists.');
      }
      if (latest?.status === 'current') {
        latest.status = 'superseded';
        await analyses.save(latest);
      }

      const analysis = await analyses.save(analyses.create({
        observationId,
        // Expert does not carry `hazlenz-production`: §260 section 6 records that string as
        // explicitly insufficient. The candidate identity on the execution record is the provenance.
        engineVersion: result.engineVersion,
        traceId: result.traceId ?? null,
        idempotencyKey: execution.idempotencyKey,
        requestVersion: execution.requestVersion,
        status: 'current',
        resultSnapshot: result.resultSnapshot,
        advisoryStatus: 'advisory',
        requestedByUserId: execution.requestedByUserId,
        knowledgeReleaseId: result.knowledgeReleaseId ?? null,
        // SERVER-AUTHORED, assigned here and nowhere reachable from a request body.
        producer: 'server_authored',
        analysisState,
        confirmationRequired: determination.confirmationRequired,
        expertExecutionId: execution.id,
      }));

      execution.analysisId = analysis.id;
      execution.executionState = analysisState as ExpertExecutionState;
      execution.admission = result.admission;
      execution.candidateIdentity = result.candidateIdentity ?? null;
      execution.contractVersion = result.contractVersion ?? null;
      execution.entryVersion = result.entryVersion ?? null;
      execution.admissionVersion = result.admissionVersion ?? null;
      execution.projectionVersion = result.projectionVersion ?? null;
      execution.confirmationRuleVersion = determination.ruleVersion;
      execution.systemPromptSha = result.systemPromptSha ?? null;
      execution.wireSchemaSha = result.wireSchemaSha ?? null;
      execution.providerId = result.providerId ?? null;
      execution.respondedModel = result.respondedModel ?? null;
      execution.postureRefusalCodes = result.postureRefusalCodes ?? null;
      execution.conformanceViolations = result.conformanceViolations ?? null;
      execution.roleJustificationCodes = result.roleJustificationCodes ?? null;
      execution.declarationRefusals = result.declarationRefusals ?? null;
      execution.verifierReached = result.verifier?.reached ?? false;
      execution.verifierFactKey = result.verifier?.factKey ?? null;
      execution.verifierNotReachedBecause = result.verifier?.notReachedBecause ?? null;
      execution.rawFirstPass = result.rawFirstPass ?? null;
      execution.rawVerifier = result.rawVerifier ?? null;
      execution.completedAt = new Date();
      const settled = await executions.save(execution);

      await this.writeAnalysisCreationAudit(manager, {
        actorUserId: execution.requestedByUserId,
        organizationId: settled.organizationId,
        analysis,
        observationId,
        inspectionId: observation.inspectionId,
        execution: settled,
        determination,
      });

      return { analysis, execution: settled };
    });
  }

  /**
   * Record a provider/transport failure against a claimed execution WITHOUT creating an analysis.
   *
   * ANALYSIS_FAILED is a persisted OUTCOME, not an exception swallowed into a generic error. It must
   * be distinguishable from a refusal, because the two mean opposite things to a user: the Expert
   * layer was unavailable, versus the Expert layer answered and the answer was not admissible. A
   * user must never see a generic successful analysis in either case.
   */
  async markExecutionFailed(
    rawUser: unknown,
    observationId: string,
    executionId: string,
    failure: { readonly kind: string; readonly detail: string; readonly attempts?: number },
  ): Promise<ExpertAnalysisExecution> {
    const user = requireAuthenticatedUser(rawUser);
    await this.inspections.authorizeObservation(user, observationId);
    return this.dataSource.transaction(async manager => {
      const executions = manager.getRepository(ExpertAnalysisExecution);
      const execution = await executions.findOne({ where: { id: executionId, observationId } });
      if (!execution) throw new NotFoundException('Expert analysis execution not found.');
      if (execution.executionState !== 'ANALYSIS_RUNNING') {
        throw new ConflictException('This Expert execution has already been settled.');
      }
      execution.executionState = 'ANALYSIS_FAILED';
      execution.failureKind = failure.kind;
      execution.failureDetail = failure.detail;
      if (failure.attempts !== undefined) execution.attempts = failure.attempts;
      execution.completedAt = new Date();
      return executions.save(execution);
    });
  }

  /**
   * THE ANALYSIS-CREATION AUDIT EVENT. `addAnalysis` wrote none, while findings and reviews both
   * did — so the one act that produces the record every finding derives from was the one act with
   * no audit trail. This closes that gap for the server-authored path; the legacy path emits the
   * same action from `InspectionService`, so one query answers "when was an analysis created" across
   * both producers.
   *
   * RAW PROVIDER PAYLOADS ARE NOT LOGGED HERE. The metadata builder carries identity, provenance
   * and disposition only. The raw output lives on the execution record, under the same access
   * controls as the analysis it produced, rather than in a generic audit field that a broader
   * audience can read.
   */
  private async writeAnalysisCreationAudit(
    manager: EntityManager,
    context: {
      readonly actorUserId: string;
      readonly organizationId: string | null;
      readonly analysis: HazLenzAnalysis;
      readonly observationId: string;
      readonly inspectionId: string;
      readonly execution: ExpertAnalysisExecution;
      readonly determination: ConfirmationDetermination;
    },
  ): Promise<void> {
    const audits = manager.getRepository(SecurityAuditEvent);
    await audits.save(audits.create({
      actorUserId: context.actorUserId,
      organizationId: context.organizationId,
      action: ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION,
      resourceType: 'hazlenz_analysis',
      resourceId: context.analysis.id,
      metadata: auditMetadataForAnalysisCreation({
        observationId: context.observationId,
        inspectionId: context.inspectionId,
        analysis: context.analysis,
        execution: context.execution,
        confirmationRuleVersion: context.determination.ruleVersion,
        confirmationTriggerCount: context.determination.triggers.length,
        confirmationFailedClosed: context.determination.failedClosed,
      }),
    }));
  }
}

/**
 * What the orchestration slice will hand to persistence. Deliberately a plain data shape rather
 * than `ExpertHazLenzResult` itself, so the foundation can be exercised on fixtures without
 * importing the entry point — which is also what keeps this slice's provider-call count at zero by
 * construction rather than by discipline.
 */
export interface AuthoritativeExpertResult {
  readonly status: ExpertOutcomeForState['status'];
  readonly admission: ExpertOutcomeForState['admission'];
  /**
   * The admitted analysis, whole. The confirmation rule reads its posture; nothing else inspects it.
   */
  readonly admittedAnalysis: unknown;
  /** Written to `resultSnapshot` verbatim. Structural identities survive because nothing maps it. */
  readonly resultSnapshot: Record<string, unknown>;
  readonly engineVersion: string;
  readonly traceId?: string | null;
  readonly knowledgeReleaseId?: string | null;
  readonly candidateIdentity?: string | null;
  readonly contractVersion?: string | null;
  readonly entryVersion?: string | null;
  readonly admissionVersion?: string | null;
  readonly projectionVersion?: string | null;
  readonly systemPromptSha?: string | null;
  readonly wireSchemaSha?: string | null;
  readonly providerId?: string | null;
  readonly respondedModel?: string | null;
  readonly postureRefusalCodes?: readonly string[] | null;
  readonly conformanceViolations?: readonly unknown[] | null;
  readonly roleJustificationCodes?: readonly string[] | null;
  readonly declarationRefusals?: readonly unknown[] | null;
  readonly verifier?: {
    readonly reached: boolean;
    readonly factKey: string | null;
    readonly notReachedBecause: string | null;
  } | null;
  readonly rawFirstPass?: Record<string, unknown> | null;
  readonly rawVerifier?: Record<string, unknown> | null;
}

export type { AnalysisState };
export { CONFIRMATION_RULE_VERSION };
