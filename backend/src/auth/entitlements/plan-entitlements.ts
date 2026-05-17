export type PlanCode = 'basic' | 'plus' | 'company';

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

export function normalizePlanCode(plan?: string): PlanCode {
  if (plan === 'plus' || plan === 'company') return plan;
  return 'basic';
}

export function hasEntitlement(plan: string | undefined, entitlement: keyof typeof PLAN_ENTITLEMENTS.basic) {
  return PLAN_ENTITLEMENTS[normalizePlanCode(plan)][entitlement];
}
