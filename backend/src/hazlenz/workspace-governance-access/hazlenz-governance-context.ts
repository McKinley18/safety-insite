import { UnauthorizedException } from '@nestjs/common';
import { HazLenzRole, UserGovernanceContext } from './workspace-governance.types';

/**
 * THE ONE MAPPING FROM AN AUTHENTICATED PRINCIPAL ONTO THE SAFESCOPE GOVERNANCE CONTEXT.
 *
 * EXTRACTED IN §262, BEHAVIOUR UNCHANGED. Until §262 this lived as three private methods on
 * `HazLenzController` and was therefore reachable only by requests that arrived at that
 * controller. §262 adds a second server-side caller: the authoritative Expert execution path runs
 * the deterministic analysis itself, and `HazLenzService.classify` consults this context to
 * decide `run_classification`. Copying the role map into the Expert module would create a second
 * place where "which role may run an analysis" is decided, and the two would drift -- which is the
 * defect class this repository has repeatedly paid for. The controller now delegates here, so there
 * is exactly one answer for both callers.
 *
 * The role map, the fail-safe `viewer` default, the local development bypass and its production
 * guard are transcribed verbatim from the controller. Nothing was widened, narrowed or renamed.
 */
const ROLE_MAP: Record<string, HazLenzRole> = {
  'ORG_OWNER': 'owner',
  'OWNER': 'owner',
  'SUPER_ADMIN': 'admin',
  'ADMIN': 'admin',
  'SAFETY_DIRECTOR': 'safety_manager',
  'SAFETY_MANAGER': 'safety_manager',
  'SUPERVISOR': 'safety_manager',
  'AUDITOR': 'compliance_admin',
  'COMPLIANCE_ADMIN': 'compliance_admin',
  'WORKER': 'field_inspector',
  'FIELD_INSPECTOR': 'field_inspector',
  'INDIVIDUAL': 'field_inspector',
  'MEMBER': 'field_inspector',
  'MANAGER': 'safety_manager',
  'ORGANIZATION_ADMIN': 'admin',
  'VIEWER': 'viewer',
};

export function requireGovernanceUserId(user: any): string {
  const userId = user?.userId || user?.id || user?.sub;
  if (!userId) {
    throw new UnauthorizedException('Authenticated user context is required.');
  }
  return String(userId);
}

export function localDevBypassUserId(): string {
  if (
    process.env.DEV_AUTH_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return 'local-dev-bypass-user';
  }
  throw new UnauthorizedException('Authenticated user context is required.');
}

export function resolveHazLenzGovernanceContext(user: any): UserGovernanceContext {
  const normalizeRole = (value?: string) =>
    String(value || '')
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase();

  const localDevAuthBypassEnabled =
    process.env.DEV_AUTH_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production';

  const normalizedRole = user ? normalizeRole(user.role) : '';
  const mappedRole = user ? ROLE_MAP[normalizedRole] || 'viewer' : 'viewer';

  // Local/dev bypass should behave like an operational test user so the UI can exercise HazLenz.
  // Production and normal unauthenticated requests remain fail-safe as viewer.
  if (localDevAuthBypassEnabled && (!user || mappedRole === 'viewer')) {
    return {
      userId: localDevBypassUserId(),
      workspaceId: user?.organizationId || user?.workspaceId || 'dev-local-workspace',
      role: 'safety_manager',
      planTier: 'company',
      jurisdictionScopes: ['msha', 'osha_general_industry', 'osha_construction'],
      reviewerQualifications: ['local_development'],
    };
  }

  // Fail-safe defaults for missing context
  if (!user) {
    return {
      userId: requireGovernanceUserId(user),
      workspaceId: 'default',
      role: 'viewer',
      planTier: 'individual',
      jurisdictionScopes: [],
      reviewerQualifications: [],
    };
  }

  return {
    userId: requireGovernanceUserId(user),
    workspaceId: user.organizationId || user.workspaceId || 'default',
    role: mappedRole,
    planTier: user.planTier || user.planCode || user.organizationPlanCode || 'individual',
    jurisdictionScopes: [],
    reviewerQualifications: [],
  };
}
