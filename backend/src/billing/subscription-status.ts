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
    normalized === "incomplete_expired"
  ) {
    return normalized;
  }

  return "none";
}

export function resolveAccessTier(
  subscriptionTier?: string | null,
  status?: string | null,
  currentPeriodEnd?: Date | string | null,
  now = new Date(),
): BillingTier {
  const tier = normalizeBillingTier(subscriptionTier);
  const normalizedStatus = normalizeStripeSubscriptionStatus(status);

  if (normalizedStatus === "active" || normalizedStatus === "trialing") {
    return tier;
  }

  if (normalizedStatus === "canceled" && currentPeriodEnd) {
    const periodEnd = currentPeriodEnd instanceof Date ? currentPeriodEnd : new Date(currentPeriodEnd);
    if (Number.isFinite(periodEnd.getTime()) && periodEnd.getTime() > now.getTime()) {
      return tier;
    }
  }

  return "free";
}
