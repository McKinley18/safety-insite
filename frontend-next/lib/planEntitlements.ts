export type PlanCode = "basic" | "plus" | "company";

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
  },
} as const;

export type EntitlementKey = keyof typeof PLAN_ENTITLEMENTS.basic;

export function normalizePlanCode(plan?: string | null): PlanCode {
  if (plan === "plus" || plan === "company") return plan;
  return "basic";
}

export function getStoredPlanCode(): PlanCode {
  if (typeof window === "undefined") return "basic";

  try {
    const user = JSON.parse(window.localStorage.getItem("sentinel_auth_user") || "{}");
    return normalizePlanCode(user.planCode || user.type);
  } catch {
    return "basic";
  }
}

export function hasPlanEntitlement(entitlement: EntitlementKey, plan?: string | null) {
  return PLAN_ENTITLEMENTS[normalizePlanCode(plan)][entitlement];
}
