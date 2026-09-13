/**
 * §268 — THE OPERATIONAL CONTROLS: THE KILL SWITCH AND THE SPEND CEILINGS.
 *
 * ===============================================================================================
 * WHY THESE ARE ONE MODULE AND WHY THEY ARE PURE.
 *
 * They answer the same question at the same moment — MAY THIS EXECUTION REACH A PROVIDER — and both
 * answers must be reached BEFORE the pre-spend claim, so a refusal writes nothing and costs
 * nothing. Keeping them together keeps that ordering in one place instead of two.
 *
 * Everything here is pure: configuration in, decision out. No repository, no clock of its own, no
 * environment read at call time. That is what lets the whole control surface be proven on literals
 * in the unit tier, including the arithmetic of the ceilings, without a database or a provider.
 *
 * ===============================================================================================
 * THE KILL SWITCH DISABLES EXPERT EXECUTION, NOT SAFETY INSITE.
 *
 * §268 draws this distinction explicitly and it is a product decision, not a convenience:
 *
 *   DISABLED           no Expert execution may reach a provider. The request is refused before the
 *                      claim, so no execution row is written and nothing is falsely recorded as
 *                      having run.
 *   STILL AVAILABLE    the deterministic HazLenz workflow, which is the customer-authoritative path
 *                      and does not touch a provider; reading existing Expert analyses under the
 *                      normal authority rules; and settling an analysis that is already awaiting
 *                      confirmation.
 *
 * SETTLEMENT STAYS AVAILABLE WHILE EXECUTION IS DISABLED, and that is deliberate. Disabling
 * execution while blocking settlement would strand every analysis already in
 * ANALYSIS_AWAITING_CONFIRMATION: a reviewer could neither settle the classification nor finalize
 * the finding that rests on it, and the inspection could not be completed. The kill switch exists
 * to stop spend and stop new advisory output; a human settling a conclusion the product ALREADY
 * obtained spends nothing and resolves work that is already in flight.
 *
 * ===============================================================================================
 * THE DEFAULT IS EXPLICIT IN PRODUCTION, AND PERMISSIVE NOWHERE THAT MATTERS.
 *
 * §268 requires the production default to be explicit. So in production the variable must be
 * present and must be exactly `true` or `false`; an absent or unrecognised value is a boot failure,
 * enforced by `validateProductionEnvironment`. That is the opposite of the usual convenience
 * default, and the reason is that "someone forgot to set it" and "someone decided it" must not
 * produce the same running system for a control whose whole purpose is to be reached in an
 * emergency.
 *
 * Outside production the default is enabled, because every local suite and every developer would
 * otherwise have to set it to do ordinary work, and a control everybody sets blindly is a control
 * nobody reads.
 *
 * ===============================================================================================
 * WHY THE CEILINGS ARE COUNTED IN EXECUTIONS AND IN DOLLARS, AND WHY BOTH.
 *
 * A count is the control that always works: it is knowable BEFORE the request runs, it does not
 * depend on the provider reporting usage, and it cannot be defeated by an unusually expensive
 * analysis. A cost ceiling is the control that means what the business actually cares about, but it
 * is necessarily retrospective — the cost of the request being authorized is not known until after
 * it has been made. Each covers the other's blind spot, so both are enforced and either can refuse.
 *
 * §255 measured material per-analysis cost and an unconditional verifier leg, so ONE ANALYSIS IS
 * NOT ONE PROVIDER CALL. The ceilings are expressed per ANALYSIS and the accounting is expressed
 * per LEG, and the two are never conflated.
 */

/** The one place the disabled-execution reason is worded, so route and audit agree. */
export const EXPERT_EXECUTION_DISABLED_MESSAGE =
  'Expert analysis is temporarily unavailable. Your deterministic HazLenz analysis is unaffected '
  + 'and this observation can still be reviewed, finalized and reported. No analysis was run and '
  + 'nothing was charged.';

export const EXPERT_EXECUTION_ENABLED_VAR = 'EXPERT_EXECUTION_ENABLED';

export interface ExpertOperationalConfig {
  /** FALSE means no Expert execution may reach a provider. */
  readonly executionEnabled: boolean;
  /** Maximum Expert ANALYSES a workspace may start in the rolling window. */
  readonly dailyAnalysisLimitPerWorkspace: number;
  /** Maximum accumulated Expert cost, in USD, for a workspace in the rolling window. */
  readonly dailyCostLimitUsdPerWorkspace: number;
  /** The rolling window, in hours. */
  readonly windowHours: number;
  /** Provider legs one admitting analysis is expected to consume. Authoring plus verifier. */
  readonly expectedProviderLegsPerAnalysis: number;
  /** Hard per-leg timeout, mirrored from the transport configuration for reporting. */
  readonly perLegTimeoutMs: number;
  /** Provider attempts permitted per leg. 1 means no automatic retry. */
  readonly maxAttemptsPerLeg: number;
}

function boolFromEnv(raw: string | undefined): boolean | null {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function positiveNumber(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Read the control surface from an environment. Takes the environment as an argument rather than
 * reading `process.env` directly, so the whole surface is testable on literals and so a test cannot
 * accidentally depend on the developer's own shell.
 */
export function readExpertOperationalConfig(
  env: NodeJS.ProcessEnv = process.env,
): ExpertOperationalConfig {
  const explicit = boolFromEnv(env[EXPERT_EXECUTION_ENABLED_VAR]);
  return {
    // Absent in production is a boot failure raised by validateProductionEnvironment, so by the
    // time this runs in production `explicit` is never null. The `?? true` covers development and
    // test only.
    executionEnabled: explicit ?? true,
    dailyAnalysisLimitPerWorkspace: positiveNumber(
      env.EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE, 50),
    dailyCostLimitUsdPerWorkspace: positiveNumber(
      env.EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE, 25),
    windowHours: positiveNumber(env.EXPERT_SPEND_WINDOW_HOURS, 24),
    expectedProviderLegsPerAnalysis: 2,
    perLegTimeoutMs: positiveNumber(env.EXPERT_ANTHROPIC_TIMEOUT_MS, 180_000),
    // ONE. The transport makes a single attempt per leg and reports a failure as an outcome; there
    // is no automatic retry anywhere on the product path, which is what makes an Expert analysis's
    // worst-case spend bounded by the leg count rather than by a retry policy. A retry is a
    // deliberate human act that reuses the idempotency key, so it resolves to the execution that
    // already ran instead of buying a second one.
    maxAttemptsPerLeg: 1,
  };
}

// ================================================================ the pre-spend decision

export type ExpertExecutionRefusalReason =
  | 'EXPERT_EXECUTION_DISABLED'
  | 'WORKSPACE_ANALYSIS_CEILING_REACHED'
  | 'WORKSPACE_COST_CEILING_REACHED';

export interface WorkspaceExpertUsage {
  /** Expert executions this workspace has STARTED inside the window. */
  readonly analysesInWindow: number;
  /** Accumulated recorded cost, in USD, inside the window. */
  readonly costUsdInWindow: number;
}

export type ExpertExecutionPermission =
  | { readonly permitted: true }
  | {
    readonly permitted: false;
    readonly reason: ExpertExecutionRefusalReason;
    readonly message: string;
    /** Operator-facing detail for the audit record. Never customer-facing prose. */
    readonly detail: string;
  };

/**
 * MAY THIS EXECUTION PROCEED TO A PROVIDER? Evaluated before the pre-spend claim.
 *
 * THE ORDER IS THE KILL SWITCH FIRST, and it is not cosmetic. When Expert is disabled the answer
 * must not depend on reading usage: an emergency disable has to work when the thing that made it
 * an emergency is the usage accounting itself.
 *
 * The ceilings use `>=` against the count of analyses ALREADY started, so a limit of N permits
 * exactly N analyses in the window and the (N+1)th is refused. Counting STARTED rather than
 * COMPLETED executions is deliberate: a failed or refused execution still spent provider legs, and
 * a ceiling that only counted successes would let a workspace spend without limit as long as its
 * analyses kept failing.
 */
export function evaluateExpertExecutionPermission(
  config: ExpertOperationalConfig,
  usage: WorkspaceExpertUsage,
): ExpertExecutionPermission {
  if (!config.executionEnabled) {
    return {
      permitted: false,
      reason: 'EXPERT_EXECUTION_DISABLED',
      message: EXPERT_EXECUTION_DISABLED_MESSAGE,
      detail: `${EXPERT_EXECUTION_ENABLED_VAR}=false`,
    };
  }
  if (usage.analysesInWindow >= config.dailyAnalysisLimitPerWorkspace) {
    return {
      permitted: false,
      reason: 'WORKSPACE_ANALYSIS_CEILING_REACHED',
      message: 'This workspace has reached its Expert analysis limit for now. Deterministic '
        + 'HazLenz analysis is unaffected. No analysis was run and nothing was charged.',
      detail: `analyses=${usage.analysesInWindow} limit=${config.dailyAnalysisLimitPerWorkspace} `
        + `window=${config.windowHours}h`,
    };
  }
  if (usage.costUsdInWindow >= config.dailyCostLimitUsdPerWorkspace) {
    return {
      permitted: false,
      reason: 'WORKSPACE_COST_CEILING_REACHED',
      message: 'This workspace has reached its Expert analysis limit for now. Deterministic '
        + 'HazLenz analysis is unaffected. No analysis was run and nothing was charged.',
      detail: `costUsd=${usage.costUsdInWindow.toFixed(4)} `
        + `limit=${config.dailyCostLimitUsdPerWorkspace} window=${config.windowHours}h`,
    };
  }
  return { permitted: true };
}

// ================================================================ leg-level usage accounting

export interface ExpertLegUsage {
  readonly leg: 'FIRST_PASS' | 'VERIFIER';
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
}

export interface ExpertExecutionUsage {
  readonly legs: number;
  readonly firstPassInputTokens: number | null;
  readonly firstPassOutputTokens: number | null;
  readonly verifierInputTokens: number | null;
  readonly verifierOutputTokens: number | null;
  /** NULL when no leg reported usage — a substituted transport, or a provider that did not say. */
  readonly costUsd: number | null;
}

/**
 * Fold per-leg usage into the shape the execution record stores.
 *
 * NULL IS PRESERVED AND NEVER BECOMES ZERO. A leg that reported no usage and a leg that genuinely
 * consumed nothing are different facts, and zero is the value that would quietly make an
 * unmeasured analysis look free to the cost ceiling. Only legs that actually reported usage
 * contribute to the cost, and the cost is null when none did.
 */
export function foldExpertUsage(
  legs: readonly ExpertLegUsage[],
  rates: { readonly inputUsdPerMTok: number; readonly outputUsdPerMTok: number },
): ExpertExecutionUsage {
  const pick = (leg: ExpertLegUsage['leg'], field: 'inputTokens' | 'outputTokens') => {
    const reported = legs.filter(l => l.leg === leg && l[field] !== null);
    if (reported.length === 0) return null;
    return reported.reduce((total, l) => total + (l[field] as number), 0);
  };
  const firstPassInputTokens = pick('FIRST_PASS', 'inputTokens');
  const firstPassOutputTokens = pick('FIRST_PASS', 'outputTokens');
  const verifierInputTokens = pick('VERIFIER', 'inputTokens');
  const verifierOutputTokens = pick('VERIFIER', 'outputTokens');

  const anyReported = [
    firstPassInputTokens, firstPassOutputTokens, verifierInputTokens, verifierOutputTokens,
  ].some(value => value !== null);

  const costUsd = anyReported
    ? (((firstPassInputTokens ?? 0) + (verifierInputTokens ?? 0)) / 1_000_000)
        * rates.inputUsdPerMTok
      + (((firstPassOutputTokens ?? 0) + (verifierOutputTokens ?? 0)) / 1_000_000)
        * rates.outputUsdPerMTok
    : null;

  return {
    legs: legs.length,
    firstPassInputTokens,
    firstPassOutputTokens,
    verifierInputTokens,
    verifierOutputTokens,
    costUsd,
  };
}
