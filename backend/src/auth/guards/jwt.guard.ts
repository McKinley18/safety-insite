import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../jwt-secret.util';
import { getBillingEntitlements, normalizeBillingTier } from '../../billing/plan-entitlements';
import { TokenValidityService } from '../token-validity.service';

function getDevBypassTier() {
  if (process.env.NODE_ENV === 'production') return 'free';
  if (process.env.DEV_FORCE_PRO === 'true') return 'pro';
  return 'free';
}

// Stable, structurally-valid (UUID-shaped) placeholder so bypass-mode identity
// never trips uuid-typed ownership columns (sites.ownerUserId, inspections.ownerUserId, etc).
const DEV_BYPASS_USER_ID = '00000000-0000-4000-8000-000000000001';

function isDevBypassEnabled() {
  return (
    process.env.DEV_AUTH_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly tokenValidity: TokenValidityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // A supplied token always takes precedence over dev bypass: a real, valid
    // identity must never be silently replaced by the synthetic bypass user.
    if (authHeader) {
      const token = authHeader.split(' ')[1];

      let decoded: any;
      try {
        decoded = jwt.verify(token, getJwtSecret());
      } catch {
        throw new UnauthorizedException('Invalid token');
      }

      // Signature/expiry alone aren't enough: a deleted account or a
      // post-issuance password change must reject the token immediately,
      // not merely once it naturally expires.
      await this.tokenValidity.assertTokenNotRevoked(decoded);

      request.user = decoded;
      return true;
    }

    if (isDevBypassEnabled()) {
      const tier = normalizeBillingTier(getDevBypassTier());
      const active = tier !== 'free';

      request.user = {
        userId: DEV_BYPASS_USER_ID,
        email: 'dev@sentinelsafety.local',
        type: tier === 'pro' ? 'pro' : 'individual',
        role: 'Auditor',
        planCode: tier,
        effectivePlanCode: tier,
        subscriptionTier: tier,
        billingTier: tier,
        subscriptionStatus: active ? 'active' : 'none',
        billingStatus: active ? 'active' : 'none',
        billingEntitlements: getBillingEntitlements(tier),
        hasPaidAccess: active,
        hasProAccess: tier === 'pro',
        organizationId: request.headers['x-dev-organization-id'] || null,
      };

      return true;
    }

    throw new UnauthorizedException('No token provided');
  }
}
