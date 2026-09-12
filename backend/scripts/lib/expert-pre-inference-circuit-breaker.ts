/**
 * §198 -- THE SYSTEMATIC PRE-INFERENCE REJECTION CIRCUIT BREAKER. ZERO PROVIDER CALLS.
 *
 * ==================== THE DEFECT THIS EXISTS TO PREVENT ====================
 *
 * §197 issued TWELVE requests and received twelve byte-identical HTTP 400s, every one of them
 * before generation began. The first rejection established the incompatibility completely; the
 * remaining eleven established nothing at all.
 *
 * It cost $0.00 because nothing reached inference, so no money was wasted — but that is luck, not
 * design. §187A had already paid the same lesson at fifteen calls, and §192's preregistration wrote
 * the rule for its own case: "a credit rejection stops the run on FIRST occurrence rather than
 * reproving the account condition 39 times." §197's stopping rules covered credit rejection, the
 * call ceiling and the spend ceiling. They did not cover this.
 *
 * ==================== THE LINE THIS BREAKER MUST NOT CROSS ====================
 *
 * A pre-inference rejection is a statement about OUR REQUEST. An inference-time failure is a
 * statement about THE MODEL, and it is exactly the behaviour a cohort exists to sample. Collapsing
 * the second into the first would silently truncate a run over what may be ordinary variation —
 * two rows that both produced malformed output, say — and would destroy the very observations the
 * run was convened to collect.
 *
 * So the breaker fires ONLY on attempts that carry `reachedInference: false`, and a single
 * inference-reaching attempt between two rejections BREAKS THE STREAK. Similar error text is never
 * sufficient on its own; the normalized signature must genuinely match.
 */

export const PRE_INFERENCE_CIRCUIT_BREAKER_VERSION =
  'hazlenz.expert.pre-inference-circuit-breaker.v1' as const;

/** Consecutive identical pre-inference rejections that stop a run. */
export const CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP = 2;

export const SYSTEMATIC_PRE_INFERENCE_REJECTION = 'SYSTEMATIC_PRE_INFERENCE_REJECTION' as const;

/**
 * One attempt, as the executor knows it at the moment it decides whether to issue the next one.
 *
 * `reachedInference` is the field the whole design turns on. It is NOT derived from the HTTP status
 * or from the error text: a 400 that consumed output tokens reached inference, and a 200 carrying no
 * tool_use block did too. The executor sets it from provider-returned usage and response shape, and
 * the breaker trusts nothing else.
 */
export interface AttemptSignatureInput {
  readonly reachedInference: boolean;
  readonly httpStatus: number | null;
  /** The provider's own error type, e.g. `invalid_request_error`. Never our classification. */
  readonly providerErrorType: string | null;
  readonly providerErrorMessage: string | null;
  /** Which execution stage issued it — a first-pass rejection and a verifier one are not the same. */
  readonly stage: string;
  /** The identity of the request CONTRACT, not of the row. Two rows sharing a schema share this. */
  readonly requestContractId: string;
}

/**
 * Normalise an error message so that the SAME incompatibility produces the SAME signature and a
 * DIFFERENT one does not.
 *
 * What is removed is only what varies between two reports of one identical problem: request ids,
 * timestamps, uuids, quoted row or analysis identifiers, and bare numbers. What is kept is the
 * structural path and the words — `tools.0.custom`, `maxItems`, `not supported` — because those are
 * what make two rejections the same rejection.
 *
 * The index inside `tools.0.custom` is deliberately NOT stripped: a rejection on `tools.0` and one
 * on `tools.1` are different problems in a request carrying two tools.
 */
export function normaliseProviderErrorMessage(message: string | null): string {
  if (typeof message !== 'string' || message.trim().length === 0) return '(no message)';
  return message
    .replace(/req_[A-Za-z0-9]+/g, '{request-id}')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '{uuid}')
    .replace(/\b\d{4}-\d{2}-\d{2}T[\d:.]+Z?\b/g, '{timestamp}')
    // A quoted IDENTIFIER varies row to row; a quoted KEYWORD does not, and erasing the keyword
    // would destroy the very thing that makes two rejections the same rejection. So a quoted token
    // is treated as an identifier ONLY when it carries a separator or a digit — `GOV-ABRASIVE-01`,
    // `AN-197-SF-01` — and a bare word like `maxItems` or `pattern` is kept verbatim.
    //
    // Caught by §198 case K2: the first draft replaced any quoted token of eight characters or
    // more, which turned "property 'maxItems' is not supported" into "property '{identifier}' is
    // not supported" and made two DIFFERENT unsupported-keyword rejections look identical.
    .replace(/'[A-Za-z0-9]*[0-9_:.\-][A-Za-z0-9_:.\-]*'/g, "'{identifier}'")
    .replace(/\b\d{3,}\b/g, '{n}')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * The signature two rejections must share to count as the same systematic rejection.
 *
 * An attempt that reached inference has NO signature and can never contribute to a streak. That is
 * expressed by returning `null` rather than by a flag a caller might forget to check.
 */
export function preInferenceSignature(a: AttemptSignatureInput): string | null {
  if (a.reachedInference) return null;
  return [
    `stage=${a.stage}`,
    `contract=${a.requestContractId}`,
    `http=${a.httpStatus ?? 'none'}`,
    `type=${a.providerErrorType ?? 'none'}`,
    `msg=${normaliseProviderErrorMessage(a.providerErrorMessage)}`,
  ].join(' | ');
}

export interface BreakerState {
  readonly lastSignature: string | null;
  readonly consecutive: number;
  readonly tripped: boolean;
  readonly trippedOnSignature: string | null;
  readonly attemptsRecorded: number;
}

export const initialBreakerState = (): BreakerState => ({
  lastSignature: null, consecutive: 0, tripped: false, trippedOnSignature: null,
  attemptsRecorded: 0,
});

/**
 * Fold one attempt into the breaker.
 *
 * An attempt that reached inference RESETS the streak — including an attempt that reached inference
 * and then failed. That is the rule that keeps a real behavioural failure from being mistaken for a
 * transport incompatibility, and it is the reason `reachedInference` is a separate field rather
 * than something inferred from the status code.
 */
export function recordAttempt(state: BreakerState, a: AttemptSignatureInput): BreakerState {
  const sig = preInferenceSignature(a);
  const attemptsRecorded = state.attemptsRecorded + 1;
  if (sig === null) {
    return { lastSignature: null, consecutive: 0, tripped: state.tripped,
      trippedOnSignature: state.trippedOnSignature, attemptsRecorded };
  }
  const consecutive = sig === state.lastSignature ? state.consecutive + 1 : 1;
  const tripped = state.tripped || consecutive >= CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP;
  return {
    lastSignature: sig,
    consecutive,
    tripped,
    trippedOnSignature: tripped ? (state.trippedOnSignature ?? sig) : null,
    attemptsRecorded,
  };
}

/**
 * Whether the executor may issue another call.
 *
 * Deliberately a separate function from `recordAttempt`, so an executor that forgets to consult it
 * is a visibly missing line rather than a silently ignored return value.
 */
export function mayIssueNextAttempt(state: BreakerState): {
  allowed: boolean; stopReason: string | null; detail: string | null;
} {
  if (!state.tripped) return { allowed: true, stopReason: null, detail: null };
  return {
    allowed: false,
    stopReason: SYSTEMATIC_PRE_INFERENCE_REJECTION,
    detail: `${CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP} consecutive pre-inference rejections `
      + `shared one signature: ${state.trippedOnSignature}. The first established the `
      + 'incompatibility; the rest would establish nothing. Cohort consumption stopped.',
  };
}

/** Recorded in code so the classification cannot drift into prose. */
export const REJECTION_CLASSIFICATION = {
  QUALIFIES_AS_PRE_INFERENCE: [
    'unsupported schema keyword rejected before generation',
    'provider rejects the tool schema before inference',
    'account-level model-access rejection',
    'an identical request-format rejection',
  ],
  REQUIRES_SEPARATE_TREATMENT: [
    'successful inference followed by malformed model output',
    'a per-row semantic refusal',
    'stochastic model behaviour',
    'a different schema path failing',
  ],
  THE_DECIDING_FIELD: 'reachedInference — set from provider-returned usage and response shape, '
    + 'never inferred from the HTTP status or from the error text',
  SIMILAR_TEXT_IS_NOT_ENOUGH: 'the whole normalized signature must match: stage, request-contract '
    + 'identity, HTTP status, provider error type and normalized message',
} as const;
