/**
 * EXPERT HAZLENZ -- the FROZEN FORMAL EXECUTION BUDGET. §135.
 *
 * ==================== WHAT THE OWNER DECIDED, AND WHAT IT IS NOT ====================
 *
 * Option O3, accepted 2026-09-01:
 *
 *     PLANNED_LOGICAL_CALLS          195   (65 rows x 3 arms, measured from the harness)
 *     GLOBAL_RETRY_REQUEST_BUDGET     20   (10%, the allowance the frozen cost model already carries)
 *     HARD_PROVIDER_REQUEST_CEILING  215   (195 + 20)
 *     HARD_SPEND_CEILING_USD       22.36
 *
 * This is NOT authorization to add retry behaviour. The retry causes, the one-retry-per-logical-call
 * ceiling and every normalization decision are untouched. What changed is that the existing
 * behaviour is now COUNTED and BOUNDED.
 *
 * ==================== THE THREE NUMBERS AGREE BY CONSTRUCTION ====================
 *
 * `WORST_CASE_REQUEST_USD` is the frozen conservative per-request bound the programme already used
 * to compute `conservativeMaximumSpendUsd`: 12,000 input tokens (above any observed prompt) at the
 * frozen input rate, plus the full configured 8,000-token output cap at the frozen output rate.
 *
 *     215 requests x $0.104 = $22.36
 *
 * The spend ceiling is therefore exactly the request ceiling priced at the worst case, not a second
 * independent limit that could disagree with it. `assertBudgetInternallyConsistent()` proves that
 * rather than asserting it, so a later edit to one number without the other fails loudly.
 *
 * ==================== FAIL-CLOSED, PROSPECTIVELY ====================
 *
 * Final token usage is unknowable before a request returns, so a ceiling checked against ACTUAL
 * spend after the fact can always be overshot by one request. Both gates are therefore evaluated
 * BEFORE each request against the worst case that request could cost:
 *
 *     requestsAttempted + 1 <= HARD_PROVIDER_REQUEST_CEILING
 *     spendUsd + WORST_CASE_REQUEST_USD <= HARD_SPEND_CEILING_USD
 *
 * Because actual cost never exceeds the worst case, neither ceiling can be crossed. The run stops
 * short rather than discovering afterwards that it went over.
 */

import { MEASURED_COST_MODEL, projectedCostUsd } from
  '../../src/safescope-v2/expert-hazlenz/expert-cohort-composition';
import { RETRYABLE_EXPERT_FAILURES } from
  '../../src/safescope-v2/expert-hazlenz/expert-provider';

export const EXECUTION_BUDGET_VERSION = 'hazlenz.expert.execution.budget.v1' as const;

/** The frozen conservative per-request cost bound. Input bound and output cap are both frozen. */
export const WORST_CASE_INPUT_TOKENS = 12_000 as const;
export const WORST_CASE_REQUEST_USD =
  projectedCostUsd(WORST_CASE_INPUT_TOKENS, MEASURED_COST_MODEL.maxOutputTokensConfigured);

export const FORMAL_EXECUTION_BUDGET = {
  version: EXECUTION_BUDGET_VERSION,
  decidedBy: 'product owner, 2026-09-01, option O3',
  plannedLogicalCalls: 195,
  globalRetryRequestBudget: 20,
  hardProviderRequestCeiling: 215,
  hardSpendCeilingUsd: 22.36,
  maxRetriesPerLogicalCall: 1,
  maxAttemptsPerLogicalCall: 2,
  retryCauses: [...RETRYABLE_EXPERT_FAILURES],
  costMethodology: MEASURED_COST_MODEL.source,
  worstCaseInputTokens: WORST_CASE_INPUT_TOKENS,
  worstCaseOutputTokens: MEASURED_COST_MODEL.maxOutputTokensConfigured,
  worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
  requestCeilingEnforcementFormula:
    'BEFORE each provider request: requestsAttempted + 1 <= hardProviderRequestCeiling',
  spendCeilingEnforcementFormula:
    'BEFORE each provider request: spendUsd + worstCaseRequestUsd <= hardSpendCeilingUsd',
  retryBudgetEnforcementFormula:
    'BEFORE each RETRY request: retryRequestsAttempted + 1 <= globalRetryRequestBudget',
  ceilingDoesNotAuthorize: [
    'extra logical rows', 'extra arms', 'exploratory requests', 'callability probes', 'reruns',
  ],
  noMidRunChange:
    'Once the first formal provider request is issued these four numbers are frozen. No increase '
    + 'after spend begins, no emergency allowance, no second run because the allowance was '
    + 'exhausted, no deleted failed request, no reset counters.',
} as const;

/** Floating-point slack. Cents are the unit that matters; this only absorbs binary representation. */
const EPS = 1e-9;

export interface BudgetState {
  requestsAttempted: number;
  retryRequestsAttempted: number;
  spendUsd: number;
}

export interface BudgetVerdict { allowed: boolean; reason: string }

/**
 * May one more PROVIDER REQUEST be issued? Evaluated before the request, never after.
 *
 * `isRetry` matters because a retry must clear the global retry allowance in addition to the two
 * ceilings every request faces.
 */
export function mayIssueRequest(state: BudgetState, isRetry: boolean): BudgetVerdict {
  const b = FORMAL_EXECUTION_BUDGET;
  if (state.requestsAttempted + 1 > b.hardProviderRequestCeiling) {
    return { allowed: false,
      reason: `PROVIDER_REQUEST_CEILING_REACHED: ${state.requestsAttempted} requests attempted, `
        + `ceiling ${b.hardProviderRequestCeiling}` };
  }
  if (state.spendUsd + WORST_CASE_REQUEST_USD > b.hardSpendCeilingUsd + EPS) {
    return { allowed: false,
      reason: `SPEND_CEILING_REACHED: $${state.spendUsd.toFixed(6)} incurred + `
        + `$${WORST_CASE_REQUEST_USD.toFixed(6)} worst case for the next request would exceed `
        + `$${b.hardSpendCeilingUsd}` };
  }
  if (isRetry && state.retryRequestsAttempted + 1 > b.globalRetryRequestBudget) {
    return { allowed: false,
      reason: `RETRY_BUDGET_EXHAUSTED: ${state.retryRequestsAttempted} retry requests attempted, `
        + `budget ${b.globalRetryRequestBudget}` };
  }
  return { allowed: true, reason: '' };
}

/**
 * The three frozen numbers must agree. 215 requests priced at the worst case IS the spend ceiling,
 * and the ceiling IS planned + retry budget. Editing one without the others fails here.
 */
export function assertBudgetInternallyConsistent(): void {
  const b = FORMAL_EXECUTION_BUDGET;
  if (b.plannedLogicalCalls + b.globalRetryRequestBudget !== b.hardProviderRequestCeiling) {
    throw new Error(`BUDGET INCONSISTENT: ${b.plannedLogicalCalls} planned + `
      + `${b.globalRetryRequestBudget} retries != ceiling ${b.hardProviderRequestCeiling}`);
  }
  const pricedCeiling = b.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD;
  if (Math.abs(pricedCeiling - b.hardSpendCeilingUsd) > 0.005) {
    throw new Error(`BUDGET INCONSISTENT: ${b.hardProviderRequestCeiling} requests at worst case `
      + `$${WORST_CASE_REQUEST_USD} = $${pricedCeiling.toFixed(4)}, but the frozen spend ceiling is `
      + `$${b.hardSpendCeilingUsd}. The two ceilings must price the same run.`);
  }
}

// ---------------------------------------------------------------- exhaustion classification

/**
 * Which retry causes are the PROVIDER's reliability and which are the MODEL's behaviour.
 *
 * The distinction decides whether an exhausted retry budget invalidates the run or is evidence
 * about the model, and it is stated here rather than improvised while looking at a failed run.
 * Transport failures say nothing about Expert; malformed, truncated and empty responses are things
 * the model did and must survive as observations rather than being written off as flakiness.
 */
export const TRANSPORT_RETRY_CAUSES = ['TIMEOUT', 'NETWORK_ERROR', 'HTTP_SERVER_ERROR'] as const;
export const MODEL_BEHAVIOUR_RETRY_CAUSES =
  ['MALFORMED_JSON', 'TRUNCATED_RESPONSE', 'EMPTY_RESPONSE'] as const;

export const RETRY_EXHAUSTION_CLASSIFICATIONS = {
  transportOnly: 'FORMAL_EVALUATION_INVALID -- PROVIDER_RELIABILITY_EXCEEDED_FROZEN_RETRY_BUDGET',
  modelBehaviourOnly: 'MODEL_BEHAVIOUR_EVIDENCE -- retry causes preserved as observations',
  mixed: 'MIXED_CAUSE -- return the exact ledger to the product owner rather than forcing a '
    + 'classification the evidence does not support',
} as const;

export function classifyRetryExhaustion(causes: readonly string[]): {
  classification: string; transport: number; modelBehaviour: number; other: number;
} {
  const transport = causes.filter(c =>
    (TRANSPORT_RETRY_CAUSES as readonly string[]).includes(c)).length;
  const modelBehaviour = causes.filter(c =>
    (MODEL_BEHAVIOUR_RETRY_CAUSES as readonly string[]).includes(c)).length;
  const other = causes.length - transport - modelBehaviour;
  let classification: string;
  if (transport > 0 && modelBehaviour === 0 && other === 0) {
    classification = RETRY_EXHAUSTION_CLASSIFICATIONS.transportOnly;
  } else if (modelBehaviour > 0 && transport === 0 && other === 0) {
    classification = RETRY_EXHAUSTION_CLASSIFICATIONS.modelBehaviourOnly;
  } else {
    classification = RETRY_EXHAUSTION_CLASSIFICATIONS.mixed;
  }
  return { classification, transport, modelBehaviour, other };
}
