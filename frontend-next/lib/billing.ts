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
  hasExpertAccess?: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
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

export type BillingCheckoutTier = "pro" | "expert";

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
    hasProAccess: tier === "pro" || tier === "expert",
    hasExpertAccess: tier === "expert",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    billingConfigured: false,
    entitlements: getPlanEntitlements(tier),
  };
}

export function isBillingTier(value?: string | null): value is BillingCheckoutTier {
  const normalized = String(value || "").toLowerCase();
  return normalized === "pro" || normalized === "expert";
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
  return isActiveBillingStatus(status.status || status.subscriptionStatus) &&
    (tier === "pro" || tier === "expert");
}

export function hasExpertAccess(status: BillingResponse): boolean {
  if (typeof status.hasExpertAccess === "boolean") return status.hasExpertAccess;
  const tier = normalizePlanCode(status.tier || status.planCode || status.plan);
  return isActiveBillingStatus(status.status || status.subscriptionStatus) && tier === "expert";
}

function isActiveBillingStatus(status?: string | null) {
  return status === "active" || status === "trialing";
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
