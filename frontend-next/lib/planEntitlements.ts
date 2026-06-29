import { getAuthUser } from "./auth";

export type BillingTier = "free" | "pro" | "expert";
export type PlanCode = BillingTier | "basic" | "plus" | "company";

export type EntitlementKey =
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

export type PlanEntitlements = Record<EntitlementKey, boolean | string>;

const freeEntitlements: PlanEntitlements = {
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

const proEntitlements: PlanEntitlements = {
  ...freeEntitlements,
  fullSafeScope: true,
  analytics: true,
  guidedInspection: true,
  hazlenzFullReview: true,
  standardsReasoning: true,
  professionalReports: true,
  correctiveActionRecommendations: true,
  evidenceGapPrompts: true,
  exportLevel: "professional",
};

const expertEntitlements: PlanEntitlements = {
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

export const PLAN_ENTITLEMENTS: Record<BillingTier, PlanEntitlements> = {
  free: freeEntitlements,
  pro: proEntitlements,
  expert: expertEntitlements,
};

export function normalizePlanCode(plan?: string | null): BillingTier {
  const normalized = String(plan || "").trim().toLowerCase();

  if (normalized === "pro" || normalized === "plus") return "pro";
  if (normalized === "expert" || normalized === "company" || normalized === "enterprise") {
    return "expert";
  }

  return "free";
}

export function entitlementPlanKey(plan?: string | null): BillingTier {
  return normalizePlanCode(plan);
}

export function getPlanDisplayName(plan?: string | null) {
  const normalized = normalizePlanCode(plan);
  if (normalized === "pro") return "Pro";
  if (normalized === "expert") return "Expert";
  return "Free";
}

export function getPlanPricing(plan?: string | null) {
  const normalized = normalizePlanCode(plan);
  if (normalized === "pro") return 6.99;
  if (normalized === "expert") return 11.99;
  return 0;
}

export function getStoredPlanCode(): PlanCode {
  const localDevDefault =
    process.env.NEXT_PUBLIC_DISABLE_AUTH === "true" && process.env.NODE_ENV !== "production" ? "expert" : "free";

  if (typeof window === "undefined") return normalizePlanCode(localDevDefault);

  try {
    const user = getAuthUser<{
      planCode?: string;
      subscriptionTier?: string;
      billingTier?: string;
      effectivePlanCode?: string;
      type?: string;
      plan?: string;
    }>();

    return normalizePlanCode(
      user.subscriptionTier ||
        user.billingTier ||
        user.effectivePlanCode ||
        user.planCode ||
        user.type ||
        user.plan ||
        localDevDefault,
    );
  } catch {
    return normalizePlanCode(localDevDefault);
  }
}

export function hasPlanEntitlement(entitlement: EntitlementKey, plan?: string | null) {
  return Boolean(PLAN_ENTITLEMENTS[entitlementPlanKey(plan)][entitlement]);
}

export type ProtectedArea =
  | "quick_capture"
  | "guided_inspection"
  | "advanced_review"
  | "pro_analytics"
  | "company_analytics"
  | "company_workspace"
  | "knowledge_library"
  | "shared_reports"
  | "team_actions"
  | "workspace_filtering";

export const PROTECTED_AREA_ENTITLEMENTS: Record<ProtectedArea, EntitlementKey> = {
  quick_capture: "quickCapture",
  guided_inspection: "guidedInspection",
  advanced_review: "advancedReview",
  pro_analytics: "analytics",
  company_analytics: "companyAnalytics",
  company_workspace: "teamMembers",
  knowledge_library: "auditTrail",
  shared_reports: "sharedReports",
  team_actions: "correctiveActionAssignments",
  workspace_filtering: "workspaceFiltering",
};

export function canAccessProtectedArea(area: ProtectedArea, plan?: string | null) {
  return hasPlanEntitlement(PROTECTED_AREA_ENTITLEMENTS[area], plan);
}

export function requiredPlanForArea(area: ProtectedArea) {
  if (
    area === "company_analytics" ||
    area === "company_workspace" ||
    area === "knowledge_library" ||
    area === "shared_reports" ||
    area === "team_actions" ||
    area === "workspace_filtering" ||
    area === "advanced_review"
  ) {
    return "Expert";
  }

  if (area === "guided_inspection" || area === "pro_analytics") {
    return "Pro";
  }

  return "Free";
}
