import { getAuthUser } from "./auth";
export type PlanCode = "basic" | "plus" | "pro" | "company";

export const PLAN_ENTITLEMENTS = {
  basic: {
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
  },
  plus: {
    fullSafeScope: true,
    cloudReports: false,
    teamMembers: false,
    analytics: true,
    supervisorValidation: false,
    auditTrail: false,

    quickCapture: true,
    guidedInspection: true,
    advancedReview: false,
    inspectionAssignments: false,
    correctiveActionAssignments: false,
    workspaceFiltering: false,
    companyAnalytics: false,
    sharedReports: false,
  },
  company: {
    fullSafeScope: true,
    cloudReports: true,
    teamMembers: true,
    analytics: true,
    supervisorValidation: true,
    auditTrail: true,

    quickCapture: true,
    guidedInspection: true,
    advancedReview: true,
    inspectionAssignments: true,
    correctiveActionAssignments: true,
    workspaceFiltering: true,
    companyAnalytics: true,
    sharedReports: true,
    
    // New Intelligence Entitlements
    intelligenceResult: true,
    riskReasoning: true,
    reportNarrative: true,
    reviewerFeedbackSubmission: true,
  },
  pro: { // Adding "pro" alias for "plus"
    fullSafeScope: true,
    cloudReports: false,
    teamMembers: false,
    analytics: true,
    supervisorValidation: false,
    auditTrail: false,

    quickCapture: true,
    guidedInspection: true,
    advancedReview: false,
    inspectionAssignments: false,
    correctiveActionAssignments: false,
    workspaceFiltering: false,
    companyAnalytics: false,
    sharedReports: false,
    
    // New Intelligence Entitlements
    intelligenceResult: true,
    riskReasoning: true,
    reportNarrative: true,
    reviewerFeedbackSubmission: true,
  },
} as const;

export type EntitlementKey = keyof typeof PLAN_ENTITLEMENTS.basic;

export function normalizePlanCode(plan?: string | null): PlanCode {
  const normalized = String(plan || "").toLowerCase();

  if (normalized === "company") return "company";
  if (normalized === "plus" || normalized === "pro") return "pro";

  return "basic";
}

export function entitlementPlanKey(plan?: string | null): keyof typeof PLAN_ENTITLEMENTS {
  const normalized = normalizePlanCode(plan);

  if (normalized === "pro") return "pro";

  return normalized;
}

export function getPlanDisplayName(plan?: string | null) {
  const normalized = normalizePlanCode(plan);

  if (normalized === "company") return "Company";
  if (normalized === "pro" || normalized === "plus") return "Pro";

  return "Basic";
}

export function getStoredPlanCode(): PlanCode {
  const localDevDefault =
    process.env.NEXT_PUBLIC_DISABLE_AUTH === "true" ? "company" : "basic";

  if (typeof window === "undefined") return normalizePlanCode(localDevDefault);

  try {
    const user = getAuthUser<{
      planCode?: string;
      type?: string;
      plan?: string;
      subscriptionTier?: string;
    }>();

    return normalizePlanCode(
      user.planCode ||
        user.type ||
        user.plan ||
        user.subscriptionTier ||
        localDevDefault,
    );
  } catch {
    return normalizePlanCode(localDevDefault);
  }
}

export function hasPlanEntitlement(entitlement: EntitlementKey, plan?: string | null) {
  return PLAN_ENTITLEMENTS[entitlementPlanKey(plan)][entitlement];
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
    return "Company";
  }

  if (area === "guided_inspection" || area === "pro_analytics") {
    return "Pro";
  }

  return "Basic";
}
