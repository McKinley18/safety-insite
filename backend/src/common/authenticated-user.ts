import { UnauthorizedException } from '@nestjs/common';

export type AuthenticatedUser = {
  userId: string;
  email?: string;
  organizationId: string | null;
  organizationRole: 'member' | 'manager' | 'organization_admin' | null;
  platformRole: 'platform_admin' | null;
  planCode?: string;
  [key: string]: unknown;
};

export function requireAuthenticatedUser(value: unknown): AuthenticatedUser {
  const user = value as Partial<AuthenticatedUser> | undefined;
  if (!user?.userId) {
    throw new UnauthorizedException('Authenticated user context is required.');
  }
  return {
    ...user,
    userId: String(user.userId),
    organizationId: user.organizationId ? String(user.organizationId) : null,
    organizationRole: user.organizationRole || null,
    platformRole: user.platformRole || null,
  } as AuthenticatedUser;
}

export function isOrganizationManager(user: AuthenticatedUser): boolean {
  return user.organizationRole === 'manager' || user.organizationRole === 'organization_admin';
}
