import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./safescope";
import { authHeaders } from "./auth";
import {
  getPlanDisplayName,
  getPlanEntitlements,
  getLocalDevPlanCode,
  getPlanPricing,
  normalizePlanCode,
  type PlanCode,
  type EntitlementKey,
} from "./planEntitlements";

export type BillingStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "none";

export type BillingTier = PlanCode;

export type SubscriptionLifecycleState =
  | "active_renewing"
  | "active_cancel_scheduled"
  | "canceled";

export type BillingResponse = {
  tier: BillingTier;
  planCode?: BillingTier;
  plan?: BillingTier;
  label?: string;
  monthlyPrice?: number;
  status: BillingStatus;
  subscriptionStatus?: BillingStatus;
  hasPaidAccess?: boolean;
  hasProAccess?: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt?: string | null;
  lifecycleState?: SubscriptionLifecycleState | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  entitlements: Partial<Record<EntitlementKey, boolean | string>>;
  billingConfigured?: boolean;
  planCatalog?: Array<{
    tier: BillingTier;
    label: string;
    priceMonthly: number;
    description: string;
  }>;
};

export type BillingCheckoutTier = "pro";

function isLocalDevAuthBypass() {
  return (
    process.env.NEXT_PUBLIC_DISABLE_AUTH === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

function getLocalDevBillingMe(): BillingResponse {
  const tier = getLocalDevPlanCode();
  const active = tier !== "free";

  return {
    tier,
    planCode: tier,
    plan: tier,
    label: getBillingTierDisplayName(tier),
    monthlyPrice: getBillingTierPrice(tier),
    status: active ? "active" : "none",
    subscriptionStatus: active ? "active" : "none",
    hasPaidAccess: active,
    hasProAccess: tier === "pro",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    lifecycleState: active ? "active_renewing" : null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    billingConfigured: false,
    entitlements: getPlanEntitlements(tier),
  };
}

export function isBillingTier(value?: string | null): value is BillingCheckoutTier {
  const normalized = String(value || "").toLowerCase();
  return normalized === "pro";
}

export async function getBillingMe() {
  if (isLocalDevAuthBypass()) {
    return getLocalDevBillingMe();
  }

  const response = await apiFetch(`${API_BASE_URL}/billing/status`, {
    headers: authHeaders(),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    const message = await readBillingError(response);
    throw new Error(message || "Billing details could not be loaded.");
  }

  return (await response.json()) as BillingResponse;
}

export async function createCheckoutSession(tier: BillingCheckoutTier) {
  const response = await apiFetch(`${API_BASE_URL}/billing/create-checkout-session`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ tier }),
  });

  if (!response.ok) {
    const message = await readBillingError(response);
    throw new Error(message || "Billing checkout could not be started.");
  }

  return response.json() as Promise<{ url?: string; sessionId?: string; tier?: BillingCheckoutTier }>;
}

export async function createPortalSession() {
  const response = await apiFetch(`${API_BASE_URL}/billing/create-portal-session`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const message = await readBillingError(response);
    throw new Error(message || "Billing portal could not be opened.");
  }

  return response.json() as Promise<{ url?: string; customerId?: string }>;
}

export function getBillingTierDisplayName(tier?: string | null) {
  return getPlanDisplayName(normalizePlanCode(tier));
}

export function getBillingTierPrice(tier?: string | null) {
  return getPlanPricing(normalizePlanCode(tier));
}

export function getBillingTierLabel(tier?: string | null) {
  return getPlanDisplayName(normalizePlanCode(tier));
}

export function hasPaidAccess(status: BillingResponse): boolean {
  if (typeof status.hasPaidAccess === "boolean") return status.hasPaidAccess;
  return isActiveBillingStatus(status.status || status.subscriptionStatus) &&
    normalizePlanCode(status.tier || status.planCode || status.plan) !== "free";
}

export function hasProAccess(status: BillingResponse): boolean {
  if (typeof status.hasProAccess === "boolean") return status.hasProAccess;
  const tier = normalizePlanCode(status.tier || status.planCode || status.plan);
  return isActiveBillingStatus(status.status || status.subscriptionStatus) && tier === "pro";
}

function isActiveBillingStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}

function formatBillingDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Truthful status/renewal copy driven by the Stripe-derived lifecycle state.
 * Never says "Renews" once a cancellation is scheduled, and never fabricates
 * an end date when Stripe hasn't given us one yet.
 */
export function getBillingLifecycleCopy(status: BillingResponse): {
  statusLabel: string;
  renewalLabel: string;
} {
  const lifecycleState = status.lifecycleState ?? null;
  const endDate = formatBillingDate(status.cancelAt || status.currentPeriodEnd);

  if (lifecycleState === "active_cancel_scheduled") {
    return {
      statusLabel: "Cancels at period end",
      renewalLabel: endDate ? `Pro access through ${endDate}` : "Pro access continues until your current billing period ends.",
    };
  }

  if (lifecycleState === "active_renewing") {
    return {
      statusLabel: status.status || "active",
      renewalLabel: endDate ? `Renews ${endDate}` : "Renewal date not available yet.",
    };
  }

  return {
    statusLabel: status.status || "none",
    renewalLabel: "Not available",
  };
}

async function readBillingError(response: Response) {
  const text = await response.text().catch(() => "");
  if (!text) return "";

  try {
    const parsed = JSON.parse(text) as { message?: unknown; code?: unknown };
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.code === "string") return parsed.code;
  } catch {
    return text;
  }

  return text;
}
