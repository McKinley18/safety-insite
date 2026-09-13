import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { requireAuthenticatedUser } from '../../common/authenticated-user';
import { InspectionService } from '../../inspection/inspection.service';
import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import {
  runExpertHazLenzAnalysis, EXPERT_PRODUCTION_ENTRY_VERSION,
  type ExpertHazLenzResult, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../expert-hazlenz/expert-hazlenz-analysis';
import {
  FIRST_PASS_CONTRACT_259_VERSION,
} from '../expert-hazlenz/contract/expert-259-control-identity-contract';
import {
  PROJECTION_239_VERSION,
} from '../expert-hazlenz/contract/expert-239-posture-projection';
import {
  ADMISSION_252_VERSION,
} from '../expert-hazlenz/contract/expert-252-structural-admission';
import { POSTURE_FIELD } from '../expert-hazlenz/contract/expert-233-posture-contract';
import { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import { ExpertAnalysisService, type AuthoritativeExpertResult } from './expert-analysis.service';
import { ExpertAnalysisContextService } from './expert-analysis-context';
import {
  EXPERT_SEMANTIC_TRANSPORT, expertTransportIsSubstituted,
} from './expert-semantic-transport.provider';
import {
  EXPERT_CANDIDATE_IDENTITY_259, TransmittedCandidateMismatchError,
  assertTransmittedCandidateIsFrozen259,
} from './expert-candidate-provenance';
import type { ExecutionClaimOutcome } from './expert-analysis-authority';

/**
 * §262 — THE AUTHORITATIVE SERVER-SIDE EXPERT EXECUTION.
 *
 * ---------------------------------------------------------------------------------------------
 * THE ONE STATEMENT THIS SERVICE EXISTS TO MAKE TRUE.
 *
 *   THE ANALYSIS STORED AS server_authored IS THE ANALYSIS THE SERVER ACTUALLY OBTAINED FROM THE
 *   FROZEN §259 EXPERT EXECUTION PATH.
 *
 * Everything below is in service of that sentence, and each clause of it is carried by a different
 * mechanism rather than by this class being careful:
 *
 *   "the server actually obtained"  the result is the return value of `runExpertHazLenzAnalysis`,
 *                                   invoked here. There is no parameter, field or code path by
 *                                   which a caller can supply one.
 *   "from the frozen path"          the entry point is called directly. No lower-level provider
 *                                   function is reachable from this file, so the admission,
 *                                   projection and verifier orchestration cannot be bypassed.
 *   "§259"                          the system prompt the transport ACTUALLY received is digested
 *                                   and checked against the frozen element before anything is
 *                                   attributed to the candidate.
 *   "stored as server_authored"     the producer literal lives in `ExpertAnalysisService`, behind a
 *                                   database CHECK constraint requiring a real execution row.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS A SECOND CLASS AND NOT MORE METHODS ON `ExpertAnalysisService`.
 *
 * §261 states, as a checkable property of that class, that it has NO provider dependency: its
 * constructor takes a data source, two repositories and `InspectionService`, and nothing else.
 * That property is what makes "persistence cannot spend" structural. Adding the transport to it
 * would delete the property in exchange for one fewer file. So the authority/persistence class
 * stays provider-free and this class is the ONLY thing in the product that can reach a provider —
 * which is also what makes the provider-entry count below a complete count.
 *
 * ---------------------------------------------------------------------------------------------
 * THE ORDER, AND WHY THE PRE-SPEND CLAIM COMES FIRST.
 *
 *   authenticate -> authorize the observation -> CLAIM the execution -> load server context ->
 *   build the §259 request -> invoke the entry point -> deterministic outcome ->
 *   derive product state -> compute confirmation once -> persist atomically -> audit -> respond.
 *
 * The claim is written before the context is loaded and long before the transport is touched, so a
 * duplicate request is adjudicated by a unique index while both callers are still upstream of any
 * spend. Every guard that existed before §261 protected the WRITE, which happens after the money is
 * gone; this one protects the spend itself.
 *
 * A CONTEXT FAILURE SETTLES THE EXECUTION RATHER THAN LEAVING IT RUNNING. An execution stuck in
 * ANALYSIS_RUNNING would block that idempotency key forever and would misreport, to anyone reading
 * the table, that an Expert call is in flight. Failures are recorded with a distinct `failureKind`
 * so a context defect is never mistaken for a provider outage.
 */
@Injectable()
export class ExpertAnalysisExecutionService {
  constructor(
    private readonly authority: ExpertAnalysisService,
    private readonly context: ExpertAnalysisContextService,
    private readonly inspections: InspectionService,
    @Inject(EXPERT_SEMANTIC_TRANSPORT)
    private readonly transport: ExpertSemanticTransport,
  ) {}

  async execute(
    rawUser: unknown,
    observationId: string,
    request: {
      readonly idempotencyKey: string;
      /** §267. Absent means the server derives the execution version. See `claimExecution`. */
      readonly requestVersion?: number | null;
      readonly taskContext?: string | null;
      readonly answeredClarifications?: ReadonlyArray<{
        readonly clarificationId: string; readonly answer: string;
      }>;
    },
  ): Promise<ExpertExecutionOutcome> {
    const user = requireAuthenticatedUser(rawUser);
    // The existing tenant choke point, and the ONLY authorization this path performs. A caller
    // whose workspace does not reach this observation gets NotFound here and never learns whether
    // the observation exists, which is the behaviour every other observation route already has.
    const { observation, inspection } = await this.inspections.authorizeObservation(
      user, observationId,
    );

    const claim = await this.authority.claimExecution(user, observationId, {
      idempotencyKey: request.idempotencyKey,
      requestVersion: request.requestVersion ?? null,
    });
    if (!claim.mayCallProvider) {
      // NOT AN ERROR. A duplicate request's honest answer is the authoritative outcome that already
      // exists, or the fact that one is in flight. Nothing here reaches the transport.
      return this.reuse(claim.outcome, claim.execution);
    }

    const execution = claim.execution;
    let serverContext: Awaited<ReturnType<ExpertAnalysisContextService['build']>>;
    try {
      serverContext = await this.context.build(
        user, observation, inspection, execution.id,
        {
          taskContext: request.taskContext ?? null,
          answeredClarifications: request.answeredClarifications ?? [],
        },
      );
    } catch (error) {
      const failed = await this.authority.markExecutionFailed(user, observationId, execution.id, {
        kind: 'SERVER_CONTEXT_UNAVAILABLE',
        detail: describeFailure(error),
      });
      return { outcome: 'FAILED', claim: claim.outcome, execution: failed, analysis: null };
    }

    // The recording wrapper sits between the entry point and the injected transport, so what it
    // digests is the request that was actually sent rather than a rebuild of it.
    const recorder = new RecordingTransport(this.transport);
    let result: ExpertHazLenzResult;
    try {
      result = await runExpertHazLenzAnalysis(serverContext.request, recorder);
    } catch (error) {
      // The entry point documents that it does not throw; if it ever does, that is an execution
      // failure and not an analysis. It is never converted into a result.
      const failed = await this.authority.markExecutionFailed(user, observationId, execution.id, {
        kind: 'EXPERT_ENTRY_POINT_THREW',
        detail: describeFailure(error),
        attempts: recorder.legs,
      });
      return { outcome: 'FAILED', claim: claim.outcome, execution: failed, analysis: null };
    }

    // ---- PROVIDER/TRANSPORT FAILURE. A persisted OUTCOME with no analysis row, so nothing can
    // ---- render as a result. Distinguished from a refusal, which means the provider DID answer.
    if (result.status === 'PROVIDER_FAILED') {
      const failed = await this.authority.markExecutionFailed(user, observationId, execution.id, {
        kind: result.failure?.kind ?? 'PROVIDER_FAILED',
        detail: result.failure?.detail ?? '',
        attempts: recorder.legs,
      });
      return { outcome: 'FAILED', claim: claim.outcome, execution: failed, analysis: null };
    }

    // ---- THE CANDIDATE BINDING, EXECUTION-DERIVED. Checked before anything is attributed to §259.
    try {
      assertTransmittedCandidateIsFrozen259(recorder.firstPassSystemPromptSha);
    } catch (error) {
      if (!(error instanceof TransmittedCandidateMismatchError)) throw error;
      const failed = await this.authority.markExecutionFailed(user, observationId, execution.id, {
        kind: 'TRANSMITTED_CANDIDATE_NOT_FROZEN_259',
        detail: error.message,
        attempts: recorder.legs,
      });
      return { outcome: 'FAILED', claim: claim.outcome, execution: failed, analysis: null };
    }

    const authoritative = this.toAuthoritativeResult(result, recorder, serverContext);
    try {
      const persisted = await this.authority.persistAuthoritativeAnalysis(
        user, observationId, execution.id, authoritative,
      );
      return {
        outcome: 'EXECUTED',
        claim: claim.outcome,
        execution: persisted.execution,
        analysis: persisted.analysis,
      };
    } catch (error) {
      // PERSISTENCE FAILED AFTER THE PROVIDER ANSWERED. The transaction rolled back, so no analysis
      // exists and the execution is still ANALYSIS_RUNNING — which would be a false claim that a
      // call is in flight. It is settled as failed with its own kind, so the provenance that an
      // answer WAS obtained and could not be stored is not erased.
      //
      // A conflict is re-raised as itself after settling: "a newer analysis request already exists"
      // is a client-visible fact, not a server fault, and must not be flattened into a 500.
      const failed = await this.authority.markExecutionFailed(user, observationId, execution.id, {
        kind: error instanceof ConflictException
          ? 'PERSISTENCE_CONFLICT' : 'PERSISTENCE_FAILED_AFTER_PROVIDER_ANSWERED',
        detail: describeFailure(error),
        attempts: recorder.legs,
      }).catch(() => null);
      if (error instanceof ConflictException) throw error;
      return {
        outcome: 'FAILED', claim: claim.outcome,
        execution: failed ?? execution, analysis: null,
      };
    }
  }

  private async reuse(
    outcome: ExecutionClaimOutcome, execution: ExpertAnalysisExecution,
  ): Promise<ExpertExecutionOutcome> {
    const analysis = execution.analysisId
      ? await this.authority.loadAnalysisForExecution(execution)
      : null;
    return {
      outcome: outcome === 'ALREADY_RUNNING' ? 'REUSED_RUNNING' : 'REUSED_SETTLED',
      claim: outcome,
      execution,
      analysis,
    };
  }

  /**
   * PROJECT THE FROZEN RESULT ONTO WHAT PERSISTENCE STORES.
   *
   * THIS IS A CARRIER, NOT A MAPPER, AND THE DISTINCTION IS THE H3/H4 GUARANTEE. The admitted
   * analysis is placed in `resultSnapshot.analysis` WHOLE, exactly as the §235 normalizer produced
   * it — container changes only, never a repaired or invented value. There is no field list here,
   * so `declarationId`, `resumeCondition.resolvedByDeclarationIds`, `controlId` and
   * `dischargingControlRef` survive because nothing in this method is capable of touching them.
   * Adding a per-field copy would be exactly the flattening §259 was about.
   *
   * WHY `result.posture` IS READ BY BRANCH. The frozen entry point returns the whole §239
   * projection on a COMPLETE result and only the projected posture object on a refusal. That is its
   * shape and §262 may not change it, so this reads it as it is and refuses to guess: a COMPLETE
   * result whose `posture` is not a projection is a drift in the entry point, and it aborts rather
   * than storing a plausible-looking snapshot.
   */
  private toAuthoritativeResult(
    result: ExpertHazLenzResult,
    recorder: RecordingTransport,
    serverContext: Awaited<ReturnType<ExpertAnalysisContextService['build']>>,
  ): AuthoritativeExpertResult {
    const complete = result.status === 'COMPLETE';
    const projection = complete ? asProjection(result.posture) : null;
    const admittedAnalysis = projection?.normalization?.analysis ?? null;
    const projectedPosture = complete
      ? projection?.posture ?? null
      : (result.posture as Record<string, unknown> | null);

    return {
      status: result.status,
      admission: result.admission,
      // The confirmation rule reads a POSTURE, and the posture it must read is the one deterministic
      // admission accepted — not the one the provider wrote. On a §239-projected posture the
      // `requiredBy` entries are the projection's own drivers, so a driver role the projection
      // refused cannot reach the rule. The wrapper exists only because the rule's convenience
      // entry point takes an analysis and reads the posture field off it.
      admittedAnalysis: projectedPosture === null ? null : { [POSTURE_FIELD]: projectedPosture },
      resultSnapshot: {
        kind: 'EXPERT_HAZLENZ_SERVER_AUTHORED_ANALYSIS',
        candidateIdentity: EXPERT_CANDIDATE_IDENTITY_259,
        contractVersion: result.contractVersion,
        entryVersion: result.entryVersion,
        status: result.status,
        admission: result.admission,
        // WHOLE. See the method comment: nothing maps this.
        analysis: admittedAnalysis,
        posture: projectedPosture,
        admittedFacts: result.admittedFacts,
        declarationRefusals: result.declarationRefusals,
        postureRefusalCodes: result.postureRefusalCodes,
        conformanceViolations: result.conformanceViolations,
        roleJustificationCodes: result.roleJustificationCodes,
        semanticInventions: result.semanticInventions,
        verifier: {
          reached: result.verifier.reached,
          factKey: result.verifier.factKey,
          notReachedBecause: result.verifier.notReachedBecause,
        },
        basis: serverContext.basis,
      },
      engineVersion: FIRST_PASS_CONTRACT_259_VERSION,
      candidateIdentity: EXPERT_CANDIDATE_IDENTITY_259,
      contractVersion: result.contractVersion,
      entryVersion: EXPERT_PRODUCTION_ENTRY_VERSION,
      admissionVersion: ADMISSION_252_VERSION,
      projectionVersion: PROJECTION_239_VERSION,
      systemPromptSha: recorder.firstPassSystemPromptSha,
      wireSchemaSha: recorder.firstPassWireSchemaSha,
      // The transport owns the vendor; the core never learns which one answered, so the product
      // records the SEAM that answered rather than inventing a vendor name here.
      providerId: expertTransportIsSubstituted()
        ? 'local-deterministic-transport' : 'hosted-expert-semantic-transport',
      respondedModel: null,
      postureRefusalCodes: result.postureRefusalCodes,
      conformanceViolations: result.conformanceViolations,
      roleJustificationCodes: result.roleJustificationCodes,
      declarationRefusals: result.declarationRefusals,
      verifier: {
        reached: result.verifier.reached,
        factKey: result.verifier.factKey,
        notReachedBecause: result.verifier.notReachedBecause,
      },
      // RAW PROVIDER OUTPUT LIVES ONLY HERE, on the execution record, behind the same access control
      // as the analysis it produced. It is never placed in `resultSnapshot`, which is returned to
      // the client, and never in generic audit metadata.
      rawFirstPass: recorder.rawFirstPass,
      rawVerifier: recorder.rawVerifier,
    };
  }
}

export type ExpertExecutionOutcomeKind =
  /** This request owned the execution, reached the frozen entry point, and settled it. */
  | 'EXECUTED'
  /** A duplicate: an execution under this identity is in flight. Nothing was spent. */
  | 'REUSED_RUNNING'
  /** A duplicate: an execution under this identity already settled. Nothing was spent. */
  | 'REUSED_SETTLED'
  /** This request owned the execution and it failed without producing an analysis. */
  | 'FAILED';

export interface ExpertExecutionOutcome {
  readonly outcome: ExpertExecutionOutcomeKind;
  readonly claim: ExecutionClaimOutcome;
  readonly execution: ExpertAnalysisExecution;
  readonly analysis: HazLenzAnalysis | null;
}

/**
 * Records what was ACTUALLY transmitted and what came back, without altering either.
 *
 * It is a pass-through: every request reaches the wrapped transport unchanged and every response is
 * returned unchanged. Its only effect is that provenance is derived from the executed request
 * rather than from a second assembly that could have drifted from it.
 */
class RecordingTransport implements ExpertSemanticTransport {
  legs = 0;
  firstPassSystemPromptSha: string | null = null;
  firstPassWireSchemaSha: string | null = null;
  rawFirstPass: Record<string, unknown> | null = null;
  rawVerifier: Record<string, unknown> | null = null;

  constructor(private readonly inner: ExpertSemanticTransport) {}

  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    this.legs += 1;
    if (request.leg === 'FIRST_PASS') {
      this.firstPassSystemPromptSha = sha256(request.systemPrompt);
      this.firstPassWireSchemaSha = sha256(JSON.stringify(request.wireSchema));
    }
    const response = await this.inner.send(request);
    const captured = asRecord(response.toolInput);
    if (request.leg === 'FIRST_PASS') this.rawFirstPass = captured;
    else this.rawVerifier = captured;
    return response;
  }
}

const sha256 = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

/**
 * The frozen entry point's COMPLETE branch returns the §239 projection result. Read structurally,
 * and refuse rather than assume: a COMPLETE result carrying something else means the entry point
 * changed under this service, and storing a snapshot built from a guess would be worse than failing.
 */
function asProjection(value: unknown): {
  readonly posture: Record<string, unknown> | null;
  readonly normalization: { readonly analysis: Record<string, unknown> | null };
} {
  const record = value as Record<string, unknown> | null;
  if (record === null || typeof record !== 'object'
    || typeof record.admitted !== 'boolean'
    || typeof record.normalization !== 'object' || record.normalization === null) {
    throw new Error('EXPERT_EXECUTION_262_ABORT: a COMPLETE result did not carry the §239 posture '
      + 'projection. The frozen entry point\'s result shape changed and this service must not '
      + 'infer a snapshot from an unrecognised one.');
  }
  return record as unknown as {
    posture: Record<string, unknown> | null;
    normalization: { analysis: Record<string, unknown> | null };
  };
}

function describeFailure(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 2000);
  return String(error).slice(0, 2000);
}
