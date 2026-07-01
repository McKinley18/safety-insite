import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./safescope";
import { authHeaders } from "./auth";
import {
  getPlanDisplayName,
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
  | "none";

export type BillingTier = PlanCode;

export type BillingResponse = {
  tier: BillingTier;
  planCode?: BillingTier;
  label?: string;
  monthlyPrice?: number;
  status: BillingStatus;
  subscriptionStatus?: BillingStatus;
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
  return {
    tier: "expert",
    planCode: "expert",
    label: getBillingTierDisplayName("expert"),
    monthlyPrice: getBillingTierPrice("expert"),
    status: "active",
    subscriptionStatus: "active",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    billingConfigured: false,
    entitlements: {},
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

  const response = await apiFetch(`${API_BASE_URL}/billing/me`, {
    headers: authHeaders(),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Billing details could not be loaded.");
  }

  return (await response.json()) as BillingResponse;
}

export async function createCheckoutSession(tier: BillingCheckoutTier) {
  const response = await apiFetch(`${API_BASE_URL}/billing/checkout`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ tier }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Billing checkout could not be started.");
  }

  return response.json() as Promise<{ url?: string; sessionId?: string; tier?: BillingCheckoutTier }>;
}

export async function createPortalSession() {
  const response = await apiFetch(`${API_BASE_URL}/billing/portal`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
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
