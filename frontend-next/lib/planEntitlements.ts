export type PlanCode = "basic" | "plus" | "company";

export const PLAN_ENTITLEMENTS = {
  basic: {
    fullSafeScope: false,
    cloudReports: false,
    teamMembers: false,
    analytics: false,
    supervisorValidation: false,
    auditTrail: false,
  },
  plus: {
    fullSafeScope: true,
    cloudReports: false,
    teamMembers: false,
    analytics: false,
    supervisorValidation: false,
    auditTrail: false,
  },
  company: {
    fullSafeScope: true,
    cloudReports: true,
    teamMembers: true,
    analytics: true,
    supervisorValidation: true,
    auditTrail: true,
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
