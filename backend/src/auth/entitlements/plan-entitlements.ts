import {
  BILLING_PLAN_DEFINITIONS,
  BillingFeatureKey,
  BillingTier,
  getBillingEntitlements,
  getBillingPlanDisplayName,
  hasBillingEntitlement,
  normalizeBillingTier,
} from "../../billing/plan-entitlements";

export type EntitlementKey = BillingFeatureKey;
export type PlanCode = BillingTier | "basic" | "plus" | "company";

export const PLAN_ENTITLEMENTS = BILLING_PLAN_DEFINITIONS;

export function normalizePlanCode(plan?: string | null): BillingTier {
  return normalizeBillingTier(plan);
}

export function entitlementPlanKey(plan?: string | null): BillingTier {
  return normalizeBillingTier(plan);
}

export function getPlanDisplayName(plan?: string | null) {
  return getBillingPlanDisplayName(plan);
}

export function hasEntitlement(plan: string | undefined, entitlement: EntitlementKey) {
  return hasBillingEntitlement(plan || "free", entitlement);
}

export function getPlanEntitlements(plan?: string | null) {
  return getBillingEntitlements(plan);
}

export function canAccessProtectedArea(area: ProtectedArea, plan?: string | null) {
  return hasEntitlement(plan || "free", PROTECTED_AREA_ENTITLEMENTS[area]);
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
