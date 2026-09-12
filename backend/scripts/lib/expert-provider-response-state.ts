/**
 * §155 EXPERT HAZLENZ -- PROVIDER RESPONSE STATE MODEL. DEVELOPMENT PROTOTYPE ONLY.
 *
 * ==================== WHY THIS EXISTS, IN ONE MEASUREMENT ====================
 *
 * Across §152, §153 and §154 -- three draws of identical frozen material -- FOUR of forty-eight
 * row-executions returned content that no reviewer would call an answer:
 *
 *   §152 HS-A1   candidateKey "placeholder"   summary "placeholder"   prose fields empty
 *   §153 HS-A1   candidateKey "x"             summary "summary placis a a placeholder"
 *                                             ...beside a candidate carrying 455 characters of
 *                                             genuinely substantive prose and a real quote
 *   §153 HS-K1   summary "placeholder"        zero candidates, zero clarifications
 *   §154 HS-K1   summary "placeholder"        zero candidates, zero clarifications
 *
 * **ALL FOUR WERE RECORDED `PRESENT`.** HTTP succeeded, the JSON parsed, the wire schema was
 * satisfied, and `normalizeExpertOutput` returned VALID. The boundary was not broken -- a malformed
 * ITEM is item-scoped by deliberate design (§105), so a junk candidate is dropped and the analysis
 * survives. The consequence is that transport success and schema success TOGETHER do not establish
 * that a usable semantic response exists.
 *
 * That is the entire justification for a distinct state. `DEGENERATE_SEMANTIC_OUTPUT` must never be
 * collapsed into `SCHEMA_FAILURE`, because on the evidence the schema was satisfied every time.
 *
 * ==================== WHAT THIS MODULE IS AND IS NOT ====================
 *
 * It is a CLASSIFIER over facts another layer already produced: a provider failure kind, a layer
 * status, a normalization issue list, and the structural verdict of the frozen degenerate detector.
 * It reads no meaning, judges no hazard, and decides no policy -- `expert-degenerate-policy.ts`
 * does that, and it takes this classification as its input.
 *
 * IT LIVES UNDER `scripts/` DELIBERATELY. `SOURCE_PROJECT_TSC` compiles `src/` with a `rootDir` that
 * excludes this directory, so production code CANNOT import it even by accident. That is the
 * structural guarantee behind "the prototype must be unable to alter production behaviour" -- it is
 * enforced by the compiler, not by a convention. Promoting any of this into `src/` is a separate
 * authorization and a separate operation.
 */

import {
  detectDegenerateOutput, DEGENERATE_DETECTOR_VERSION,
  type DegenerateCheckInput, type DegenerateVerdict,
} from './expert-degenerate-output-detector';
import {
  evaluateReliabilityPostconditions, RELIABILITY_POSTCONDITION_VERSION,
  type PostconditionReport, type PostconditionInput,
} from './expert-reliability-postconditions';

export const EXPERT_RESPONSE_STATE_MODEL_VERSION =
  'hazlenz.expert.provider-response-state.v1' as const;

/**
 * THE FIVE STATES.
 *
 * Ordered from "nothing usable came back" to "usable, with a named reason to look again". The order
 * is also the classification precedence: an earlier state wins, because a response that never
 * arrived cannot also be degenerate.
 */
export const EXPERT_RESPONSE_STATES = [
  /** No valid provider response was produced at all. Nothing to inspect. */
  'TRANSPORT_FAILURE',
  /** A response exists but cannot satisfy the wire schema or the normalization boundary. */
  'SCHEMA_FAILURE',
  /**
   * Structurally processable, and NOT a substantive model answer. The §152-§154 shapes.
   * NEVER a flavour of SCHEMA_FAILURE -- see the header.
   */
  'DEGENERATE_SEMANTIC_OUTPUT',
  /** Structurally and semantically non-degenerate. The ordinary case. */
  'SUBSTANTIVE_VALID_OUTPUT',
  /**
   * Usable, and one or more DETERMINISTIC reliability postconditions found a reason to consider
   * selective verification. A WARNING IS NOT A DEFECT: this state is delivered, not withheld.
   */
  'SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING',
] as const;
export type ExpertResponseState = (typeof EXPERT_RESPONSE_STATES)[number];

/**
 * Failure kinds that mean no usable response arrived.
 *
 * `PROVIDER_REFUSAL` and `UNEXPECTED_MODEL_IDENTITY` are here even though a payload may exist: in
 * both cases nothing that can be scored as this model's analysis was produced, and the runner
 * already refuses them before the boundary.
 */
const TRANSPORT_SHAPED = new Set([
  'TIMEOUT', 'NETWORK_ERROR', 'HTTP_CLIENT_ERROR', 'HTTP_SERVER_ERROR', 'RATE_LIMITED',
  'CREDITS_EXHAUSTED', 'EMPTY_RESPONSE', 'TRUNCATED_RESPONSE', 'PROVIDER_REFUSAL',
  'UNEXPECTED_MODEL_IDENTITY', 'PROVIDER_NOT_CALLABLE', 'NOT_CONFIGURED',
]);

/**
 * Failure kinds where a response exists but does not satisfy the contract.
 *
 * NOTE ON `MALFORMED_JSON`. It is a SCHEMA_FAILURE in this model -- a response arrived and could not
 * be read -- while `expert-provider.ts` lists it as RETRYABLE. Those are not in conflict and this
 * module does not reconcile them: the state model describes WHAT CAME BACK, the retry list decides
 * WHAT TO DO, and this prototype changes neither.
 */
const SCHEMA_SHAPED = new Set(['MALFORMED_JSON', 'SCHEMA_INVALID_STRUCTURED_OUTPUT']);

export interface ResponseStateInput {
  rowId: string;
  /** `PRESENT` | `OUTPUT_REJECTED` | `PROVIDER_FAILED` | `NOT_CONFIGURED`, from the runner. */
  layerStatus: string;
  /** The runner's failure kind, or null on a successful call. */
  failureKind: string | null;
  /** Normalization issue codes, in the runner's order. Item-scoped issues appear on PRESENT. */
  issueCodes: readonly string[];
  /** The RAW wire view. Read structurally by the detector; never read for meaning. */
  wire: DegenerateCheckInput;
  /** Everything the deterministic postconditions need beyond the wire. */
  postconditionInput: PostconditionInput;
}

export interface ResponseStateVerdict {
  rowId: string;
  state: ExpertResponseState;
  /** Why this state and not the next one. Operator-facing, never customer-facing. */
  reason: string;
  degenerate: DegenerateVerdict;
  postconditions: PostconditionReport;
  versions: {
    stateModel: string;
    detector: string;
    postconditions: string;
  };
}

export function classifyExpertResponse(input: ResponseStateInput): ResponseStateVerdict {
  const degenerate = detectDegenerateOutput(input.wire);
  const postconditions = evaluateReliabilityPostconditions(input.postconditionInput);
  const versions = {
    stateModel: EXPERT_RESPONSE_STATE_MODEL_VERSION,
    detector: DEGENERATE_DETECTOR_VERSION,
    postconditions: RELIABILITY_POSTCONDITION_VERSION,
  };
  const out = (state: ExpertResponseState, reason: string): ResponseStateVerdict =>
    ({ rowId: input.rowId, state, reason, degenerate, postconditions, versions });

  if (input.failureKind !== null && TRANSPORT_SHAPED.has(input.failureKind)) {
    return out('TRANSPORT_FAILURE', `provider failure ${input.failureKind}`);
  }
  if (input.failureKind !== null && SCHEMA_SHAPED.has(input.failureKind)) {
    return out('SCHEMA_FAILURE', `provider failure ${input.failureKind}`);
  }
  // A rejected analysis is a schema/boundary failure whatever produced it. The runner has already
  // refused to hand it on, and this classification must agree rather than second-guess it.
  if (input.layerStatus === 'OUTPUT_REJECTED') {
    return out('SCHEMA_FAILURE',
      `normalization rejected the analysis: ${input.issueCodes.join(',') || 'no code recorded'}`);
  }
  if (input.layerStatus !== 'PRESENT') {
    return out('TRANSPORT_FAILURE', `layer status ${input.layerStatus}`);
  }

  // PRESENT from here on. This is the region the §152-§154 evidence proved is not safe to trust.
  if (degenerate.DEGENERATE_PROVIDER_OUTPUT) {
    return out('DEGENERATE_SEMANTIC_OUTPUT',
      `detector signals: ${degenerate.signals.join(', ')}`);
  }
  if (postconditions.warnings.length > 0) {
    return out('SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING',
      `postconditions: ${postconditions.warnings.map(w => w.code).join(', ')}`);
  }
  // A SUSPECT row -- exactly one detector signal -- lands here on purpose. §153 fixed that a single
  // signal excludes nothing and convicts nothing; it is reported and the response is used.
  return out('SUBSTANTIVE_VALID_OUTPUT',
    degenerate.suspect ? `one detector signal (${degenerate.signals[0]}), reported, not convicting`
      : 'no detector signal, no postcondition warning');
}
