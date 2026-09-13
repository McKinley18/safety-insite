import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';

import { AuthenticatedUser, requireAuthenticatedUser } from '../../common/authenticated-user';
import { isUniqueViolation } from '../../common/unique-violation';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';
import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import { HumanReview } from '../../inspection/entities/human-review.entity';
import { InspectionService } from '../../inspection/inspection.service';
import { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import {
  ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION, EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION,
  auditMetadataForAnalysisCreation,
} from './expert-analysis-audit';
import {
  SETTLEMENT_CONTRACT_VERSION, type ReplacementInput, type SettledEntry,
  type SettlementDecision, type SubjectEntry, type SubjectResolution,
  resolveConfirmationSubject, settleEntries, validateReplacements,
} from './expert-settlement-contract';
import {
  type AnalysisState, type ExecutionClaimOutcome, type ExpertExecutionState,
  type ExpertOutcomeForState, classifyExistingExecution, claimPermitsProviderSpend,
  deriveAnalysisState,
} from './expert-analysis-authority';
import {
  CONFIRMATION_RULE_VERSION, type ConfirmationDetermination, confirmationNotApplicable,
  deriveConfirmationRequiredFromAnalysis,
} from './expert-confirmation-rule';
import {
  EXPERT_PRODUCER, adjudicateExpertRequestVersion, expertRequestVersionRefusal,
  highestReservedRequestVersion, isExpertAnalysis, maySupersede,
} from './expert-analysis-currentness';
import { emitOperationalEvent } from '../../observability/operational-events';

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
    // §264. The human decision lives in the EXISTING review table rather than a competing Expert
    // review subsystem, so this class reaches it directly instead of routing settlement through
    // InspectionService.addReview, whose finding-scoped supersession semantics do not apply here.
    @InjectRepository(HumanReview)
    private readonly reviews: Repository<HumanReview>,
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
   *
   * ---------------------------------------------------------------------------------------------
   * §267 — THE EXECUTION VERSION IS DERIVED HERE, WHICH IS THE POINT AT WHICH IT BECOMES PRE-SPEND.
   *
   * §266 measured the §265 client sending `requestVersion: 1` on every Expert request while the
   * observation's deterministic analysis already held version 1. Nothing adjudicated it here, so
   * the request proceeded, TWO HOSTED LEGS WERE SPENT, and the collision was discovered by
   * `persistAuthoritativeAnalysis` on the far side of the money — surfacing as 409 "A newer
   * analysis request already exists" against an execution that had already cost real spend.
   *
   * The version is now derived by the server, inside this transaction, under the advisory lock that
   * already serialises this table. The lock is what makes read-then-allocate correct rather than
   * racy, and the execution row this method writes is what RESERVES the allocated ordinal for the
   * whole length of the provider call.
   *
   * A CLIENT-SUPPLIED VERSION IS ADJUDICATED, NOT OBEYED AND NOT IGNORED. Obeying it is the defect.
   * Ignoring it would silently execute a request whose stated identity the server disagreed with,
   * which is the same class of quiet mismatch. It is checked against the allocation and a stale or
   * invented value is refused HERE — before `mayCallProvider` can be true, and therefore with a
   * provider-entry count of zero.
   */
  async claimExecution(
    rawUser: unknown,
    observationId: string,
    claim: {
      readonly idempotencyKey: string;
      /**
       * §267. OPTIONAL, and the shipped client no longer sends it. Present only so a request that
       * states a version can be adjudicated rather than quietly overridden; `null`/absent is the
       * ordinary path and means "the server allocates".
       */
      readonly requestVersion?: number | null;
    },
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
        // §267. Derived under the lock, across BOTH the analyses table and the executions table,
        // so an Expert claim whose provider call is still in flight has genuinely reserved its
        // ordinal and a concurrent deterministic rerun cannot allocate the same one.
        const highestReserved = await highestReservedRequestVersion(manager, observationId);
        const adjudication = adjudicateExpertRequestVersion(
          highestReserved, claim.requestVersion ?? null,
        );
        if (adjudication.outcome !== 'ALLOCATED') {
          // PRE-SPEND. Thrown from inside the claim transaction, so no execution row is written, no
          // context is built and the transport is never constructed — the refusal costs nothing.
          throw new ConflictException(expertRequestVersionRefusal(adjudication));
        }
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
          requestVersion: adjudication.requestVersion,
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
   * §268 — WHAT HAS THIS WORKSPACE ALREADY SPENT IN THE WINDOW?
   *
   * Read from `expert_analysis_executions`, which is the ONLY complete record of Expert spend: an
   * execution row is written before the provider is reached and survives every outcome, including
   * the failures and refusals that cost money and produce no analysis. Counting analyses instead
   * would let a workspace spend without limit as long as its executions kept failing.
   *
   * SCOPED BY ORGANIZATION, FALLING BACK TO THE USER. `organizationId` is null for individual
   * accounts, and a null-scoped query would pool every individual account in the deployment into
   * one shared ceiling — which is both wrong and a cross-tenant coupling. Those accounts are
   * scoped by the requesting user, who IS the workspace in that case.
   *
   * `costUsd` is summed over the rows that HAVE one. A null cost means the leg reported no usage,
   * not that it was free, so nulls are excluded from the sum rather than counted as zero — and the
   * analysis-count ceiling is what bounds spend when the provider reports nothing at all.
   */
  async readWorkspaceExpertUsage(
    scope: { readonly organizationId: string | null; readonly userId: string },
    windowHours: number,
  ): Promise<{ readonly analysesInWindow: number; readonly costUsdInWindow: number }> {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    const query = this.executions.createQueryBuilder('execution')
      .select('COUNT(*)', 'analyses')
      .addSelect('COALESCE(SUM(execution."costUsd"), 0)', 'cost')
      .where('execution."createdAt" >= :since', { since });
    if (scope.organizationId) {
      query.andWhere('execution."organizationId" = :organizationId',
        { organizationId: scope.organizationId });
    } else {
      query.andWhere('execution."organizationId" IS NULL')
        .andWhere('execution."requestedByUserId" = :userId', { userId: scope.userId });
    }
    const row = await query.getRawOne<{ analyses: string; cost: string }>();
    return {
      analysesInWindow: Number(row?.analyses ?? 0),
      costUsdInWindow: Number(row?.cost ?? 0),
    };
  }

  /**
   * §268 — RECORD WHAT THE PROVIDER ACTUALLY COST, on the execution that spent it.
   *
   * Separate from `persistAuthoritativeAnalysis` on purpose. Usage must be recorded for EVERY
   * outcome — admitted, refused, unresolved and failed — because all four spend, and only the
   * first writes an analysis. Folding it into the persistence path would have accounted for
   * exactly the outcomes that are cheapest to account for and missed the ones a beta most needs
   * to see.
   *
   * It never throws into the caller: a cost figure that could not be written must not turn a
   * completed safety analysis into a failure.
   */
  async recordExecutionUsage(
    executionId: string,
    usage: {
      readonly firstPassInputTokens: number | null;
      readonly firstPassOutputTokens: number | null;
      readonly verifierInputTokens: number | null;
      readonly verifierOutputTokens: number | null;
      readonly costUsd: number | null;
      readonly legs: number;
    },
  ): Promise<void> {
    try {
      await this.executions.update({ id: executionId }, {
        firstPassInputTokens: usage.firstPassInputTokens,
        firstPassOutputTokens: usage.firstPassOutputTokens,
        verifierInputTokens: usage.verifierInputTokens,
        verifierOutputTokens: usage.verifierOutputTokens,
        costUsd: usage.costUsd === null ? null : usage.costUsd.toFixed(6),
        attempts: usage.legs,
      });
    } catch {
      // Deliberately swallowed. See the header.
    }
  }

  /**
   * THE DETERMINISTIC CONFIRMATION DETERMINATION, exposed so a caller can see it without a
   * database. Delegates to the pure rule and adds nothing: no service-level override exists, and
   * there is deliberately no parameter by which a caller could influence the answer.
   */
  determineConfirmation(admittedAnalysis: unknown): ConfirmationDetermination {
    return deriveConfirmationRequiredFromAnalysis(admittedAnalysis);
  }


  // ================================================================ §264 human settlement

  /**
   * SETTLE A PENDING EXPERT ANALYSIS. The confirmation and override action, as one transition.
   *
   * ---------------------------------------------------------------------------------------------
   * ONE METHOD FOR BOTH DECISIONS, DELIBERATELY.
   *
   * Confirm and override are not two workflows; they are two outcomes of one act with one
   * eligibility rule, one concurrency guarantee, one audit path and one state machine edge. Two
   * methods would mean two places for the eligibility check to drift and two races to get right.
   *
   * ---------------------------------------------------------------------------------------------
   * WHAT MAKES THIS SAFE UNDER CONCURRENCY.
   *
   *   1. an advisory lock on the observation, the same convention every other write on this table
   *      uses, so a settlement cannot interleave with a new analysis on the same observation;
   *   2. a CONDITIONAL state transition — `UPDATE ... WHERE analysisState = AWAITING` — whose row
   *      count decides the winner. There is no read-then-write window, and no last-write-wins;
   *   3. a partial unique index permitting one settlement row per analysis, which would refuse the
   *      second writer even if 1 and 2 were both wrong.
   *
   * The loser gets ConflictException naming the state it lost to, not a generic error.
   *
   * ---------------------------------------------------------------------------------------------
   * RETRY IS NOT RE-DECISION.
   *
   * A replayed request carrying the SAME idempotency key resolves to the row it already wrote and
   * returns it unchanged — no second review, no second audit event, no second state transition. A
   * DIFFERENT key against an already-settled analysis is a competing decision and is refused. That
   * distinction is the one §264 asks for, and it is drawn on the key rather than on timing.
   *
   * ---------------------------------------------------------------------------------------------
   * THE EXPERT RESULT IS NOT TOUCHED.
   *
   * Nothing in this method writes `resultSnapshot`, `engineVersion`, `producer`, `expertExecutionId`,
   * `confirmationRequired`, or any execution-record field. It writes `analysisState` and
   * `settlementReviewId` and nothing else, so the Expert proposal and the human decision stay
   * separately attributable and the original stays reconstructable byte for byte.
   */
  async settleExpertAnalysis(
    rawUser: unknown,
    observationId: string,
    analysisId: string,
    request: {
      readonly idempotencyKey: string;
      readonly decision: SettlementDecision;
      readonly rationale: string;
      readonly replacements?: readonly ReplacementInput[];
      readonly comment?: string | null;
    },
  ): Promise<ExpertSettlementOutcome> {
    const user = requireAuthenticatedUser(rawUser);
    const { observation, inspection } = await this.inspections.authorizeObservation(
      user, observationId,
    );

    // The analysis id is NEVER trusted as a bare key: it is resolved within the observation that
    // was just authorized, so an id from another workspace resolves to NotFound rather than a row.
    const analysis = await this.analyses.findOne({ where: { id: analysisId, observationId } });
    if (!analysis) throw new NotFoundException('Expert analysis not found.');

    // ---- eligibility, in the order that leaks the least.
    if (analysis.producer !== 'server_authored') {
      // A client-supplied snapshot carries no server-authored operational conclusion, so there is
      // nothing for this action to settle. Promoting one through the Expert authority action is
      // exactly the trust-boundary breach §260 recorded.
      throw new ConflictException(
        'This analysis was supplied by a client and carries no server-authored operational '
        + 'conclusion. The Expert confirmation action does not apply to it.');
    }
    // ---- THE REPLAY CHECK COMES BEFORE THE STATE CHECK, AND THE ORDER IS THE WHOLE POINT.
    //
    // A retry arrives AFTER the original request already moved the analysis out of
    // ANALYSIS_AWAITING_CONFIRMATION. Checking the state first would reject every successful
    // request's own retry with "not awaiting confirmation" — which is exactly the case idempotency
    // exists to handle, and the caller would have no way to tell a lost response from a rejected
    // decision. Resolving the replay first answers the retry with what it already achieved.
    const replay = await this.reviews.findOne({
      where: { analysisId: analysis.id, idempotencyKey: request.idempotencyKey },
    });
    if (replay) {
      const conclusion = replay.reviewedConclusion as { entries?: SettledEntry[] } | null;
      return {
        outcome: 'REPLAYED',
        analysis,
        review: replay,
        settledEntries: conclusion?.entries ?? [],
      };
    }

    if (analysis.analysisState !== 'ANALYSIS_AWAITING_CONFIRMATION') {
      throw new ConflictException(
        `This analysis is ${analysis.analysisState} and is not awaiting confirmation.`);
    }
    if (analysis.status !== 'current') {
      // A newer analysis has superseded this one. Settling it would record a human decision about a
      // conclusion the product has already replaced, and the reviewer would not know. Authority
      // stays analysis-specific: this refuses, and it never reaches across to the newer analysis.
      throw new ConflictException(
        'A newer Expert analysis exists for this observation. Review the current analysis instead; '
        + 'confirming a superseded one would settle a conclusion the product has already replaced.');
    }

    const execution = analysis.expertExecutionId
      ? await this.executions.findOne({
        where: { id: analysis.expertExecutionId, observationId },
      })
      : null;

    // ---- what is actually being settled, re-derived from the immutable stored posture by the
    // ---- SAME rule version that produced the flag.
    const snapshot = analysis.resultSnapshot as Record<string, unknown>;
    const subject = resolveConfirmationSubject(
      snapshot?.posture ?? null, execution?.confirmationRuleVersion ?? null,
    );
    if (!subject.ok) {
      throw new ConflictException(
        `The confirmation subject cannot be established (${subject.code}): ${subject.detail}`);
    }

    let replaced: readonly SubjectEntry[] = [];
    if (request.decision === 'classification_changed') {
      const validation = validateReplacements(subject.entries, request.replacements ?? []);
      if (!validation.ok) {
        throw new BadRequestException(`${validation.code}: ${validation.detail}`);
      }
      replaced = validation.changed;
    } else if ((request.replacements ?? []).length > 0) {
      throw new BadRequestException(
        'A confirmation accepts the classification as authored and carries no replacement. Use '
        + 'classification_changed to change it.');
    }
    const settled = settleEntries(subject.entries, replaced);

    try {
      return await this.settleInTransaction(
        user, observationId, inspection, observation, analysis, execution, request, subject, settled,
      );
    } catch (error) {
      // THE UNIQUE INDEX IS THE ADJUDICATOR, AND ITS VERDICT IS A CONFLICT, NOT A CRASH.
      //
      // Two reviewers who both read ANALYSIS_AWAITING_CONFIRMATION both proceed, and the loser's
      // INSERT is rejected by `uq_human_review_analysis_settlement` — which is exactly the
      // behaviour that makes one-settlement true, adjudicated in the database rather than by
      // application timing. Left untranslated it surfaced as a 500: the guarantee held, and the
      // loser was told the server had broken rather than that someone else had decided. §264
      // requires a deterministic already-settled result, so the driver error is translated here
      // and nowhere else.
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'This analysis was settled by another reviewer while your decision was in flight. '
          + '(Adjudicated by the one-settlement-per-analysis index.)');
      }
      throw error;
    }
  }

  private async settleInTransaction(
    user: AuthenticatedUser,
    observationId: string,
    inspection: { organizationId: string | null },
    observation: { inspectionId: string },
    analysis: HazLenzAnalysis,
    execution: ExpertAnalysisExecution | null,
    request: {
      readonly idempotencyKey: string;
      readonly decision: SettlementDecision;
      readonly rationale: string;
      readonly comment?: string | null;
    },
    subject: { readonly posture: string },
    settled: readonly SettledEntry[],
  ): Promise<ExpertSettlementOutcome> {
    return this.dataSource.transaction(async manager => {
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext($1))`,
        [`hazlenz-analysis:${observationId}`],
      );

      const reviews = manager.getRepository(HumanReview);
      const review = await reviews.save(reviews.create({
        observationId,
        findingId: null,
        idempotencyKey: request.idempotencyKey,
        status: 'current',
        analysisId: analysis.id,
        decision: request.decision,
        rationale: request.rationale.trim(),
        // BOTH SIDES ARE CARRIED, so the record is readable without interpreting the decision type
        // against the analysis, and the Expert proposal survives inside the human decision itself.
        reviewedConclusion: {
          contractVersion: SETTLEMENT_CONTRACT_VERSION,
          confirmationRuleVersion: execution?.confirmationRuleVersion ?? null,
          posture: subject.posture,
          entries: settled,
          comment: typeof request.comment === 'string' && request.comment.trim()
            ? request.comment.trim() : null,
        },
        reviewedByUserId: user.userId,
      }));

      // ---- THE TRANSITION. Conditional on the state this caller observed, so a concurrent
      // ---- settlement that already moved the row leaves this update matching zero rows.
      const nextState: AnalysisState = request.decision === 'classification_changed'
        ? 'ANALYSIS_OVERRIDDEN' : 'ANALYSIS_CONFIRMED';
      const updated: { affected?: number | null } = await manager
        .getRepository(HazLenzAnalysis)
        .createQueryBuilder()
        .update(HazLenzAnalysis)
        .set({ analysisState: nextState, settlementReviewId: review.id })
        .where('id = :id', { id: analysis.id })
        .andWhere('"analysisState" = :expected', { expected: 'ANALYSIS_AWAITING_CONFIRMATION' })
        .execute();
      if (!updated.affected) {
        // Another reviewer settled it between the read above and this write. Rolling back discards
        // the review row this transaction just created, so the loser leaves nothing behind.
        //
        // The wording differs from the index-adjudicated conflict on purpose: two guards cover this
        // race, and an operator reading a log should be able to tell which one fired without
        // reproducing it.
        throw new ConflictException(
          'This analysis was settled by another reviewer before your decision was applied. '
          + '(Adjudicated by the conditional state transition.)');
      }

      const after = await manager.getRepository(HazLenzAnalysis)
        .findOneOrFail({ where: { id: analysis.id } });

      await this.writeSettlementAudit(manager, {
        actorUserId: user.userId,
        organizationId: inspection.organizationId ?? null,
        analysis: after,
        previousState: 'ANALYSIS_AWAITING_CONFIRMATION',
        observationId,
        inspectionId: observation.inspectionId,
        execution,
        review,
        settled,
      });

      // §268. The human authority boundary being CROSSED is an operational signal, not only an
      // audit fact: an analysis sitting in ANALYSIS_AWAITING_CONFIRMATION is work the product is
      // holding, and the age of that queue is one of the two Expert numbers a beta needs to watch.
      // The decision is reported; the rationale is not, because it is customer prose.
      emitOperationalEvent('expert.confirmation.settled', {
        observationId,
        inspectionId: observation.inspectionId,
        analysisId: after.id,
        executionId: execution?.id ?? null,
        decision: request.decision,
        analysisState: after.analysisState,
        entriesSettled: settled.length,
      });

      return {
        outcome: 'SETTLED' as const,
        analysis: after,
        review,
        settledEntries: settled,
      };
    });
  }

  /**
   * THE SETTLEMENT AUDIT EVENT.
   *
   * One action name for both decisions, with `changed` as a field, so one query answers "who settled
   * an Expert classification and when" without unioning two action names — and the same query
   * distinguishes agreement from disagreement.
   *
   * NO RAW PROVIDER OUTPUT REACHES THIS METADATA. Only identifiers, the two states, and the
   * per-entry classifications, which are closed-vocabulary values rather than model prose.
   */
  private async writeSettlementAudit(
    manager: EntityManager,
    context: {
      readonly actorUserId: string;
      readonly organizationId: string | null;
      readonly analysis: HazLenzAnalysis;
      readonly previousState: AnalysisState;
      readonly observationId: string;
      readonly inspectionId: string;
      readonly execution: ExpertAnalysisExecution | null;
      readonly review: HumanReview;
      readonly settled: readonly SettledEntry[];
    },
  ): Promise<void> {
    const audits = manager.getRepository(SecurityAuditEvent);
    await audits.save(audits.create({
      actorUserId: context.actorUserId,
      organizationId: context.organizationId,
      action: EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION,
      resourceType: 'hazlenz_analysis',
      resourceId: context.analysis.id,
      metadata: {
        inspectionId: context.inspectionId,
        observationId: context.observationId,
        analysisId: context.analysis.id,
        expertExecutionId: context.analysis.expertExecutionId,
        reviewId: context.review.id,
        reviewDecision: context.review.decision,
        previousAnalysisState: context.previousState,
        newAnalysisState: context.analysis.analysisState,
        conclusionChanged: context.settled.some(entry => entry.changed),
        entriesSettled: context.settled.length,
        entriesChanged: context.settled.filter(entry => entry.changed).length,
        subject: context.settled.map(entry => ({
          refKind: entry.refKind,
          ref: entry.ref,
          expertClassification: entry.expertClassification,
          humanClassification: entry.humanClassification,
        })),
        candidateIdentity: context.execution?.candidateIdentity ?? null,
        confirmationRuleVersion: context.execution?.confirmationRuleVersion ?? null,
      },
    }));
  }

  /**
   * §265 — THE SERVER-SIDE READ THE FRONTEND WORKFLOW DEPENDS ON.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY A READ EXISTS AT ALL, WHEN §262 AND §264 SHIPPED ONLY WRITES.
   *
   * A reviewer closes the tab, comes back, and the browser holds nothing. Without a read the only
   * ways for the interface to know what state an analysis is in are to re-execute it — which spends
   * two provider legs to answer a question the database already answers — or to cache the last
   * response and keep believing it. The second is how a settled conclusion gets rendered from a
   * stale client copy, so the read is not a convenience; it is what makes "the server response is
   * authoritative" survive a page reload.
   *
   * ---------------------------------------------------------------------------------------------
   * IT RETURNS THE WHOLE AUTHORITY PICTURE IN ONE ANSWER, INCLUDING THE SUBJECT.
   *
   * The confirmation SUBJECT — which named entries a person is being asked to settle — is derived
   * here, by `resolveConfirmationSubject`, under the same rule-version check §264 applies at
   * settlement time. A frontend that had to work out for itself which parts of a posture needed
   * confirming would be re-implementing the confirmation rule in a browser, which §265 forbids in
   * the strongest terms available to it. It is the server's question; the client only renders it.
   *
   * A subject that cannot be established is returned as a NAMED REFUSAL rather than as an empty
   * list, because an empty list and "the rule version drifted" render identically otherwise, and
   * one of them means the confirm button must not be offered.
   *
   * ---------------------------------------------------------------------------------------------
   * IT AUTHORIZES THROUGH THE SAME CHOKE POINT AS EVERY OTHER OBSERVATION READ.
   *
   * `authorizeObservation` answers NotFound rather than Forbidden, so a cross-workspace caller
   * cannot learn whether the observation exists — the §262 property, unchanged, because this
   * introduces no second implementation of it.
   */
  async readExpertAnalysisForObservation(
    rawUser: unknown,
    observationId: string,
  ): Promise<ExpertAnalysisReadModel> {
    const user = requireAuthenticatedUser(rawUser);
    await this.inspections.authorizeObservation(user, observationId);

    // THE WHOLE SERVER-AUTHORED HISTORY, NEWEST FIRST. Client-supplied rows are deliberately
    // included: §265 requires a reviewer to be able to tell a legacy client-held analysis from a
    // server-authored one, and hiding the legacy rows would make that distinction unavailable
    // exactly where it matters.
    const all = await this.analyses.find({
      where: { observationId },
      order: { requestVersion: 'DESC' },
    });
    const current = all.find(row => row.status === 'current' && row.producer === 'server_authored')
      ?? null;

    if (current === null) {
      return {
        observationId,
        analysis: null,
        execution: null,
        settlement: null,
        subject: null,
        history: all,
      };
    }

    const execution = current.expertExecutionId
      ? await this.executions.findOne({
        where: { id: current.expertExecutionId, observationId },
      })
      : null;
    const settlement = current.settlementReviewId
      ? await this.reviews.findOne({
        where: { id: current.settlementReviewId, analysisId: current.id },
      })
      : null;

    // The subject is resolved ONLY where the stored flag says a person is being asked something.
    // Deriving it on an analysis that requires no confirmation would manufacture a question, and
    // deriving it on a refused one would ask about a conclusion that does not exist.
    const snapshot = current.resultSnapshot as Record<string, unknown> | null;
    const subject = current.confirmationRequired
      ? resolveConfirmationSubject(
        snapshot?.posture ?? null, execution?.confirmationRuleVersion ?? null,
      )
      : null;

    return { observationId, analysis: current, execution, settlement, subject, history: all };
  }

  /**
   * §265 MOVED THE EFFECTIVE-DECISION DERIVATION OUT OF THIS SERVICE.
   *
   * It now lives in `ExpertEffectiveDecisionService`, in a leaf module that imports nothing but the
   * two repositories it reads. The reason is structural rather than cosmetic: the first real
   * downstream consumer is finding finalization inside `InspectionService`, and this module already
   * imports `InspectionModule` — so leaving the one derivation here would have forced the consumer
   * to re-derive authority locally to avoid a module cycle. There is still exactly one
   * implementation; it is simply reachable from both sides now.
   */

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

      // ---------------------------------------------------------------------------------------
      // §267. TWO SEPARATE QUESTIONS, WHICH §261 ASKED AS ONE AND §266 MEASURED THE COST OF.
      //
      //   1. IS THE ORDINAL STILL FREE?  Asked across ALL rows, because
      //      `uq_hazlenz_analysis_observation_version` is scoped to (observationId, requestVersion)
      //      and does not care which producer wrote it. This is now a BACKSTOP rather than the
      //      product's version control: the ordinal was allocated and reserved at claim time, so
      //      reaching this branch means something raced in a way the advisory lock should have
      //      prevented, and the honest answer is to refuse rather than to reallocate. Reallocating
      //      here would silently give the analysis a different identity from the execution that
      //      paid for it.
      //
      //   2. WHAT DOES THIS ANALYSIS SUPERSEDE?  Asked ONLY WITHIN THE EXPERT FAMILY. §266 measured
      //      what the unscoped version of this question did: a successful Expert run marked the
      //      customer-authoritative DETERMINISTIC analysis `superseded`, the workspace restored the
      //      newest non-superseded row, and the deterministic UI was handed an Expert snapshot.
      //      An advisory layer had displaced the customer-authoritative record at the data level,
      //      which inverts the trust boundary §261 exists to hold. A new Expert analysis supersedes
      //      the prior EXPERT analysis and nothing else.
      const latestAnyProducer = await analyses.findOne({
        where: { observationId },
        order: { requestVersion: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      if (latestAnyProducer && execution.requestVersion <= latestAnyProducer.requestVersion) {
        throw new ConflictException('A newer analysis request already exists.');
      }
      const currentExpert = await analyses.findOne({
        where: { observationId, producer: EXPERT_PRODUCER, status: 'current' },
        order: { requestVersion: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      if (currentExpert) {
        // Checked rather than assumed. The predicate is the one place cross-producer supersession
        // is decided, so the write goes through it even where the query already constrained the
        // producer — a future change to either must be made in agreement with the other.
        if (!maySupersede({ producer: EXPERT_PRODUCER }, currentExpert)) {
          throw new ConflictException('Cross-producer supersession is prohibited.');
        }
        currentExpert.status = 'superseded';
        await analyses.save(currentExpert);
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

/** What a settlement attempt produced. `REPLAYED` is a retry resolving to its own earlier row. */
/**
 * §265 — WHAT THE READ RETURNS TO THE RESPONSE SHAPER. Entities and a subject resolution, not a
 * wire shape: the shaper decides what is product-safe to send, and keeping that decision in one
 * place is what stops a raw provider payload leaking through a read the way it cannot through a
 * write.
 */
export interface ExpertAnalysisReadModel {
  readonly observationId: string;
  readonly analysis: HazLenzAnalysis | null;
  readonly execution: ExpertAnalysisExecution | null;
  readonly settlement: HumanReview | null;
  readonly subject: SubjectResolution | null;
  readonly history: readonly HazLenzAnalysis[];
}

export interface ExpertSettlementOutcome {
  readonly outcome: 'SETTLED' | 'REPLAYED';
  readonly analysis: HazLenzAnalysis;
  readonly review: HumanReview;
  readonly settledEntries: readonly SettledEntry[];
}

export type { AnalysisState };
export { CONFIRMATION_RULE_VERSION };
