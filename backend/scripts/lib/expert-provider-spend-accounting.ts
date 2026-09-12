/**
 * §188 -- PROVIDER SPEND ACCOUNTING. Separates the BUDGET GUARD from ACTUAL SPEND.
 *
 * DEVELOPMENT/VERIFICATION HARNESS ONLY. Not reachable from production. Zero provider calls.
 *
 * ==================== THE DEFECT THIS EXISTS TO PREVENT ====================
 *
 * §187A's harness kept ONE counter and used it for two incompatible purposes:
 *
 *     spent += call.ok ? cost : WORST_VERIFIER_USD;      // probe-…-2026-09-05.ts:448
 *     …
 *     TOTAL_ACTUAL_COST_USD: Number(spent.toFixed(5)),   // …:520
 *
 * The `? :` is a correct BUDGET GUARD: a call whose real cost is unknown must be assumed to have
 * cost the frozen worst case, or a failing run could overrun its ceiling without noticing. It is a
 * wrong SPEND REPORT: all fifteen §187A verifier calls were rejected with HTTP 400 before any
 * inference and consumed ZERO tokens, so they cost nothing, yet each was charged $0.064.
 *
 *     actual   $0.26255  (five first-pass calls, provider-returned usage)
 *     reported $1.22255  = $0.26255 + 15 x $0.064
 *
 * The reservation was not wrong. Reporting the reservation under the name `TOTAL_ACTUAL_COST_USD`
 * was. This module keeps both numbers and makes it impossible to print one under the other's name.
 *
 * ==================== THE RULE ====================
 *
 * ACTUAL SPEND IS PROVIDER-RETURNED USAGE AND NOTHING ELSE. A call that returned no usage adds
 * zero to actual spend, whatever its HTTP status. A synthetic worst-case charge is a reservation,
 * it lives only in the guard, and it is never reported as money.
 */

export interface ProviderPricing {
  readonly inputUsdPerMTok: number;
  readonly outputUsdPerMTok: number;
}

export interface ProviderCallOutcome {
  /** Whether the provider returned a usable response. Does not by itself decide cost. */
  readonly ok: boolean;
  /** Provider-returned usage. `null` means the provider reported none, which costs nothing. */
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
  /**
   * The frozen worst case reserved for this call before it was issued. Retained in the guard when
   * the call returned no usage, so an unattributable failure cannot silently free budget.
   */
  readonly worstCaseUsd: number;
}

export interface SpendLedgerReport {
  /**
   * Money actually spent, from provider-returned usage only. This is the figure that may be
   * reported as cost, and the only one.
   */
  readonly actualProviderSpendUsd: number;
  /**
   * The conservative budget position: actual spend for calls that reported usage, plus the frozen
   * worst case for every call that did not. Governs the ceiling. NEVER a spend figure.
   */
  readonly budgetReservedUsd: number;
  readonly callsAttempted: number;
  /** Attempted calls that returned zero provider-reported usage. */
  readonly callsWithNoProviderUsage: number;
  /**
   * `budgetReservedUsd - actualProviderSpendUsd`. Non-zero means synthetic reservations are
   * standing, and is exactly the quantity §187A misreported as money.
   */
  readonly syntheticReservationUsd: number;
  readonly accountingRule: string;
}

const ACCOUNTING_RULE =
  'ACTUAL SPEND = provider-returned usage only; a call reporting no usage adds zero. '
  + 'BUDGET RESERVED = actual spend plus the frozen worst case for every call that reported no '
  + 'usage. The reserved figure governs the ceiling and is never reported as money spent.';

export function computeCallCostUsd(
  outcome: Pick<ProviderCallOutcome, 'inputTokens' | 'outputTokens'>, pricing: ProviderPricing,
): number {
  return ((outcome.inputTokens ?? 0) / 1e6) * pricing.inputUsdPerMTok
    + ((outcome.outputTokens ?? 0) / 1e6) * pricing.outputUsdPerMTok;
}

/**
 * Two counters, one ledger. The guard question is asked against the RESERVED position and the
 * report is produced from the ACTUAL position, so neither can be read as the other.
 */
export class ProviderSpendLedger {
  private actualUsd = 0;
  private reservedUsd = 0;
  private attempted = 0;
  private noUsage = 0;

  constructor(private readonly pricing: ProviderPricing) {}

  /**
   * Ask BEFORE issuing a call. Uses the reserved position, deliberately: the ceiling must hold even
   * when a run is failing and its real costs are unknown.
   */
  wouldExceedCeiling(worstCaseUsd: number, ceilingUsd: number): boolean {
    return this.reservedUsd + worstCaseUsd > ceilingUsd + 1e-9;
  }

  /** Record a call AFTER it returns. Returns the cost actually attributable to it. */
  record(outcome: ProviderCallOutcome): number {
    this.attempted += 1;
    const cost = computeCallCostUsd(outcome, this.pricing);
    const reportedUsage = (outcome.inputTokens ?? 0) > 0 || (outcome.outputTokens ?? 0) > 0;

    // Actual spend follows the provider, never the HTTP status and never the reservation.
    this.actualUsd += cost;

    if (reportedUsage) {
      this.reservedUsd += cost;
    } else {
      // No usage came back. It cost nothing, but the guard keeps the worst case rather than
      // assuming a failure is free budget.
      this.noUsage += 1;
      this.reservedUsd += outcome.worstCaseUsd;
    }
    return cost;
  }

  report(): SpendLedgerReport {
    const actual = Number(this.actualUsd.toFixed(5));
    const reserved = Number(this.reservedUsd.toFixed(5));
    return {
      actualProviderSpendUsd: actual,
      budgetReservedUsd: reserved,
      callsAttempted: this.attempted,
      callsWithNoProviderUsage: this.noUsage,
      syntheticReservationUsd: Number((reserved - actual).toFixed(5)),
      accountingRule: ACCOUNTING_RULE,
    };
  }
}

/**
 * The §187A formula, preserved EXACTLY so the regression can prove what the defect produced rather
 * than describing it. Never call this to report cost. It exists to be asserted against.
 */
export function legacySingleCounterTotalUsd(
  outcomes: readonly ProviderCallOutcome[], pricing: ProviderPricing,
): number {
  let spent = 0;
  for (const o of outcomes) {
    spent += o.ok ? computeCallCostUsd(o, pricing) : o.worstCaseUsd;
  }
  return Number(spent.toFixed(5));
}
