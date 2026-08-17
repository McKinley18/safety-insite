import { BillingSubscriptionStatus, BillingTier, normalizeBillingTier } from "./plan-entitlements";

export type StripeSubscriptionStatus = BillingSubscriptionStatus;

export function normalizeStripeSubscriptionStatus(status?: string | null): StripeSubscriptionStatus {
  const normalized = String(status || "").trim().toLowerCase();

  if (
    normalized === "active" ||
    normalized === "trialing" ||
    normalized === "past_due" ||
    normalized === "canceled" ||
    normalized === "unpaid" ||
    normalized === "incomplete" ||
    normalized === "incomplete_expired" ||
    normalized === "paused"
  ) {
    return normalized;
  }

  return "none";
}

/**
 * Entitlement is derived from Stripe's `status` alone. This previously also
 * granted access when `status === "canceled"` but `currentPeriodEnd` was
 * still in the future, as a grace window for an already-paid-for period.
 * Verified via a Stripe Test Clock (see
 * verification/insite-billing-lifecycle-2026-08-17) that this let Pro access
 * survive after Stripe had genuinely ended the subscription — Stripe's own
 * `status` transition is the entitlement-ending event; comparing a cached
 * period-end timestamp against server wall-clock time doesn't reliably
 * agree with it (this account's only cancellation path keeps `status`
 * "active" until the exact cancel_at moment, so there is no real cancelled-
 * but-still-owed window to protect).
 */
export function resolveAccessTier(
  subscriptionTier?: string | null,
  status?: string | null,
  _currentPeriodEnd?: Date | string | null,
): BillingTier {
  const tier = normalizeBillingTier(subscriptionTier);
  const normalizedStatus = normalizeStripeSubscriptionStatus(status);

  if (normalizedStatus === "active" || normalizedStatus === "trialing") {
    return tier;
  }

  return "free";
}

export type BillingAccessInput = {
  tier?: string | null;
  status?: string | null;
  currentPeriodEnd?: Date | string | null;
  cancelAtPeriodEnd?: boolean | null;
};

export function hasActivePaidAccess(input: BillingAccessInput): boolean {
  return resolveAccessTier(input.tier, input.status, input.currentPeriodEnd) !== "free";
}

export function hasProAccess(input: BillingAccessInput): boolean {
  const tier = resolveAccessTier(input.tier, input.status, input.currentPeriodEnd);
  return tier === "pro";
}

// Truthful, Stripe-derived lifecycle presentation state — distinct from the
// entitlement question ("does this tier unlock features right now") answered
// by hasActivePaidAccess/hasProAccess above. A subscription can be fully
// entitled (status active) while also being scheduled to stop in the future.
export type SubscriptionLifecycleState =
  | "active_renewing"
  | "active_cancel_scheduled"
  | "canceled";

export function resolveSubscriptionLifecycleState(input: {
  status?: string | null;
  cancelAt?: Date | string | null;
}): SubscriptionLifecycleState {
  const normalizedStatus = normalizeStripeSubscriptionStatus(input.status);
  const isCurrentlyEntitled = normalizedStatus === "active" || normalizedStatus === "trialing";

  if (!isCurrentlyEntitled) {
    return "canceled";
  }

  return input.cancelAt ? "active_cancel_scheduled" : "active_renewing";
}
