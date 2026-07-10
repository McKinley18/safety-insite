import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../jwt-secret.util';
import { getBillingEntitlements, normalizeBillingTier } from '../../billing/plan-entitlements';

function getDevBypassTier() {
  if (process.env.NODE_ENV === 'production') return 'free';
  if (process.env.DEV_FORCE_EXPERT === 'true') return 'expert';
  if (process.env.DEV_FORCE_PRO === 'true') return 'pro';
  return 'free';
}

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (
      process.env.DEV_AUTH_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      const tier = normalizeBillingTier(getDevBypassTier());
      const active = tier !== 'free';

      request.user = {
        userId: 1,
        email: 'dev@sentinelsafety.local',
        type: tier === 'expert' ? 'company' : tier === 'pro' ? 'pro' : 'individual',
        role: 'Auditor',
        planCode: tier,
        effectivePlanCode: tier,
        subscriptionTier: tier,
        billingTier: tier,
        subscriptionStatus: active ? 'active' : 'none',
        billingStatus: active ? 'active' : 'none',
        billingEntitlements: getBillingEntitlements(tier),
        hasPaidAccess: active,
        hasProAccess: tier === 'pro' || tier === 'expert',
        hasExpertAccess: tier === 'expert',
        organizationId: request.headers['x-dev-organization-id'] || null,
      };

      return true;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, getJwtSecret());
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
