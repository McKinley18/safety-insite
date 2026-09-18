import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./hazlenzClient";
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
  /**
   * §317. THREE FIELDS THE SERVER HAS ALWAYS SENT AND THIS TYPE DID NOT DECLARE.
   *
   * `tierSource` and `accessSource` say WHERE the tier came from and `entitlementExpiresAt` says
   * when a granted one ends. `BillingService.getBillingStatus` emits all three (§302 / EN-3), but
   * they were absent here, so nothing on a customer surface could read them -- and the account
   * surfaces rendered a comped account as though it were a paying one: "Pro · $24.99/month" beside
   * "Subscription status: none", with the end date the server already knew nowhere on the page.
   *
   * They are typed here rather than cast at the one call site, because the reason they were
   * invisible is that they were not in the contract the interface programs against.
   */
  tierSource?: "subscription" | "grant" | "account" | "none";
  accessSource?: "subscription" | "free" | "pilot" | "support" | string;
  entitlementExpiresAt?: string | null;
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

/**
 * §276. One in-flight billing read, shared, with a short freshness window.
 *
 * Part 5F measured a single Settings visit issuing **six** identical
 * `GET /billing/status` requests: the page, the billing panel, the app shell and several
 * entitlement gates each ask independently on mount, and every ask went to the network.
 * Nothing was wrong with any one caller; there was nothing coordinating them.
 *
 * De-duplication lives HERE rather than in `getVerifiedPlanCode` because several callers
 * reach this function directly. It is UI VISIBILITY ONLY: backend entitlement guards are
 * evaluated per request and are unaffected by anything cached here. The window is short on
 * purpose -- long enough to collapse one page's mount storm, too short to keep showing a
 * stale plan after an upgrade -- and `clearBillingCache()` drops it on sign-out so one
 * account can never be answered from another's response.
 */
const BILLING_FRESHNESS_MS = 5000;
let billingInFlight: Promise<BillingResponse> | null = null;
let billingCached: BillingResponse | null = null;
let billingCachedAt = 0;

export function clearBillingCache() {
  billingInFlight = null;
  billingCached = null;
  billingCachedAt = 0;
}

export async function getBillingMe(): Promise<BillingResponse> {
  if (isLocalDevAuthBypass()) {
    return getLocalDevBillingMe();
  }

  if (billingCached && Date.now() - billingCachedAt < BILLING_FRESHNESS_MS) {
    return billingCached;
  }
  if (billingInFlight) return billingInFlight;

  billingInFlight = fetchBillingMe()
    .then((value) => {
      billingCached = value;
      billingCachedAt = Date.now();
      return value;
    })
    .finally(() => {
      billingInFlight = null;
    });

  return billingInFlight;
}

async function fetchBillingMe(): Promise<BillingResponse> {
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
 * §317 (CPF-3 / O-10) — THE STATUS CODE IS NOT THE STATUS LABEL.
 *
 * `status` is the normalized Stripe vocabulary and it was rendered straight onto the account
 * surfaces, so a new account read a lower-case `none` in a row of title-case values, and a
 * struggling payment read `past_due`. These are the words the payment processor uses, not the
 * words a customer needs. Anything unmapped falls back to the raw value with its underscores
 * removed rather than to a guess, so a status this build has never seen still renders as text a
 * human can read and is never silently relabelled as something else.
 */
const BILLING_STATUS_LABELS: Record<string, string> = {
  none: "No subscription",
  active: "Active",
  trialing: "Trial",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  unpaid: "Unpaid",
  incomplete: "Payment incomplete",
  incomplete_expired: "Payment incomplete",
  paused: "Paused",
};

export function billingStatusLabel(status: string | null | undefined): string {
  const key = String(status || "none");
  return BILLING_STATUS_LABELS[key]
    || key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/**
 * Truthful status/renewal copy driven by the Stripe-derived lifecycle state.
 * Never says "Renews" once a cancellation is scheduled, and never fabricates
 * an end date when Stripe hasn't given us one yet.
 *
 * §317 — AND A GRANTED TIER IS NOT A SUBSCRIPTION, SO IT NO LONGER READS AS ONE.
 *
 * A comped or support-granted account has no Stripe subscription at all: `lifecycleState` is null
 * and `status` is `none`, so before §317 it fell through to the last branch and was described as
 * having no subscription and no renewal -- which is literally true and, for someone who has been
 * given Pro for a fixed number of days, tells them nothing they need and implies something they
 * would reasonably misread. The grant is checked FIRST, for the same reason the server checks it
 * first when deriving `tierSource`: the authority is the grant, and a description that names the
 * absent subscription instead is describing the wrong thing.
 */
export function getBillingLifecycleCopy(status: BillingResponse): {
  statusLabel: string;
  renewalLabel: string;
} {
  const lifecycleState = status.lifecycleState ?? null;
  const endDate = formatBillingDate(status.cancelAt || status.currentPeriodEnd);

  if (status.tierSource === "grant") {
    const grantEnds = formatBillingDate(status.entitlementExpiresAt);
    return {
      statusLabel: "Included access",
      // The end date is stated because it is the one fact a granted account needs and cannot
      // otherwise discover: access stops on that day with no further notice.
      renewalLabel: grantEnds
        ? `Granted access, ends ${grantEnds}. No payment method is on this account.`
        : "Granted access. No payment method is on this account.",
    };
  }

  if (lifecycleState === "active_cancel_scheduled") {
    return {
      statusLabel: "Cancels at period end",
      renewalLabel: endDate ? `Pro access through ${endDate}` : "Pro access continues until your current billing period ends.",
    };
  }

  if (lifecycleState === "active_renewing") {
    return {
      statusLabel: billingStatusLabel(status.status || "active"),
      renewalLabel: endDate ? `Renews ${endDate}` : "Renewal date not available yet.",
    };
  }

  return {
    statusLabel: billingStatusLabel(status.status),
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
