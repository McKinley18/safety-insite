export type BillingTier = "free" | "pro" | "expert";
export type PlanTier = BillingTier;

export type BillingSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "none";

export type BillingFeatureKey =
  | "fullSafeScope"
  | "cloudReports"
  | "teamMembers"
  | "analytics"
  | "supervisorValidation"
  | "auditTrail"
  | "quickCapture"
  | "guidedInspection"
  | "advancedReview"
  | "inspectionAssignments"
  | "correctiveActionAssignments"
  | "workspaceFiltering"
  | "companyAnalytics"
  | "sharedReports"
  | "hazlenzPreview"
  | "hazlenzFullReview"
  | "standardsReasoning"
  | "professionalReports"
  | "correctiveActionRecommendations"
  | "evidenceGapPrompts"
  | "deeperExplainability"
  | "advancedReportReview"
  | "advancedStandardsSupport"
  | "priorityAiFeatures"
  | "exportLevel";

export type BillingEntitlements = Record<BillingFeatureKey, boolean | string>;

export type BillingPlanDefinition = {
  tier: BillingTier;
  label: string;
  priceMonthly: number;
  description: string;
  stripePriceEnv: "STRIPE_PRO_PRICE_ID" | "STRIPE_EXPERT_PRICE_ID" | null;
  legacyStripePriceEnv?: "STRIPE_PLUS_PRICE_ID" | "STRIPE_COMPANY_PRICE_ID" | null;
  entitlements: BillingEntitlements;
};

const freeEntitlements: BillingEntitlements = {
  fullSafeScope: false,
  cloudReports: false,
  teamMembers: false,
  analytics: false,
  supervisorValidation: false,
  auditTrail: false,
  quickCapture: true,
  guidedInspection: false,
  advancedReview: false,
  inspectionAssignments: false,
  correctiveActionAssignments: false,
  workspaceFiltering: false,
  companyAnalytics: false,
  sharedReports: false,
  hazlenzPreview: true,
  hazlenzFullReview: false,
  standardsReasoning: false,
  professionalReports: false,
  correctiveActionRecommendations: false,
  evidenceGapPrompts: true,
  deeperExplainability: false,
  advancedReportReview: false,
  advancedStandardsSupport: false,
  priorityAiFeatures: false,
  exportLevel: "basic",
};

const proEntitlements: BillingEntitlements = {
  ...freeEntitlements,
  fullSafeScope: true,
  analytics: true,
  guidedInspection: true,
  hazlenzFullReview: true,
  standardsReasoning: true,
  professionalReports: true,
  correctiveActionRecommendations: true,
  exportLevel: "professional",
};

const expertEntitlements: BillingEntitlements = {
  ...proEntitlements,
  cloudReports: true,
  teamMembers: true,
  supervisorValidation: true,
  auditTrail: true,
  advancedReview: true,
  inspectionAssignments: true,
  correctiveActionAssignments: true,
  workspaceFiltering: true,
  companyAnalytics: true,
  sharedReports: true,
  deeperExplainability: true,
  advancedReportReview: true,
  advancedStandardsSupport: true,
  priorityAiFeatures: true,
  exportLevel: "advanced",
};

export const BILLING_PLAN_DEFINITIONS: Record<BillingTier, BillingPlanDefinition> = {
  free: {
    tier: "free",
    label: "Free",
    priceMonthly: 0,
    description: "Basic inspection capture and limited advisory review.",
    stripePriceEnv: null,
    entitlements: freeEntitlements,
  },
  pro: {
    tier: "pro",
    label: "Pro",
    priceMonthly: 6.99,
    description: "Professional inspection workflow with HazLenz AI review.",
    stripePriceEnv: "STRIPE_PRO_PRICE_ID",
    legacyStripePriceEnv: "STRIPE_PLUS_PRICE_ID",
    entitlements: proEntitlements,
  },
  expert: {
    tier: "expert",
    label: "Expert",
    priceMonthly: 11.99,
    description: "Advanced inspection and review tools with deeper explainability.",
    stripePriceEnv: "STRIPE_EXPERT_PRICE_ID",
    legacyStripePriceEnv: "STRIPE_COMPANY_PRICE_ID",
    entitlements: expertEntitlements,
  },
};

export const PLAN_ENTITLEMENTS = BILLING_PLAN_DEFINITIONS;
export const FREE_PLAN_ENTITLEMENTS = BILLING_PLAN_DEFINITIONS.free;

export type LegacyPlanCode = "basic" | "plus" | "company";
export type BillingPlanCode = BillingTier | LegacyPlanCode;

export function normalizeBillingTier(plan?: string | null): BillingTier {
  const normalized = String(plan || "").trim().toLowerCase();

  if (normalized === "pro" || normalized === "plus") return "pro";
  if (normalized === "expert" || normalized === "company" || normalized === "enterprise") {
    return "expert";
  }

  return "free";
}

export function getBillingPlanDisplayName(plan?: string | null) {
  return BILLING_PLAN_DEFINITIONS[normalizeBillingTier(plan)].label;
}

export function getBillingPlanMonthlyPrice(plan?: string | null) {
  return BILLING_PLAN_DEFINITIONS[normalizeBillingTier(plan)].priceMonthly;
}

export function getStripePriceEnvForTier(tier: BillingTier) {
  return BILLING_PLAN_DEFINITIONS[tier].stripePriceEnv;
}

export function getLegacyStripePriceEnvForTier(tier: BillingTier) {
  return BILLING_PLAN_DEFINITIONS[tier].legacyStripePriceEnv || null;
}

export function getConfiguredStripePriceIdForTier(tier: BillingTier) {
  const plan = BILLING_PLAN_DEFINITIONS[tier];
  const primary = plan.stripePriceEnv ? process.env[plan.stripePriceEnv] : null;
  const legacy = plan.legacyStripePriceEnv ? process.env[plan.legacyStripePriceEnv] : null;
  return primary || legacy || null;
}

export function getBillingEntitlements(tier?: string | null) {
  return BILLING_PLAN_DEFINITIONS[normalizeBillingTier(tier)].entitlements;
}

export function hasBillingEntitlement(
  tier: string | null | undefined,
  entitlement: BillingFeatureKey,
) {
  return Boolean(getBillingEntitlements(tier)[entitlement]);
}

export function hasEntitlement(
  tier: string | null | undefined,
  entitlement: BillingFeatureKey,
) {
  return hasBillingEntitlement(tier, entitlement);
}

export function isPaidBillingTier(tier?: string | null) {
  return normalizeBillingTier(tier) !== "free";
}

export function resolveTierForPriceId(priceId?: string | null): BillingTier {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID || priceId === process.env.STRIPE_PLUS_PRICE_ID) {
    return "pro";
  }
  if (priceId === process.env.STRIPE_EXPERT_PRICE_ID || priceId === process.env.STRIPE_COMPANY_PRICE_ID) {
    return "expert";
  }
  return "free";
}
