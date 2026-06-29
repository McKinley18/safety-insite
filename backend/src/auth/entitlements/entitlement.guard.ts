import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingFeatureKey, hasEntitlement, normalizeBillingTier } from '../../billing/plan-entitlements';

export const REQUIRED_ENTITLEMENT_KEY = 'requiredEntitlement';
export type EntitlementKey = BillingFeatureKey;

export const RequireEntitlement = (entitlement: EntitlementKey) =>
  SetMetadata(REQUIRED_ENTITLEMENT_KEY, entitlement);

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const entitlement = this.reflector.getAllAndOverride<EntitlementKey>(
      REQUIRED_ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!entitlement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user || {};
    const effectivePlanCode = normalizeBillingTier(
      user.planCode ||
        user.effectivePlanCode ||
        user.tier ||
        user.billingTier ||
        user.subscriptionTier,
    );

    if (hasEntitlement(effectivePlanCode, entitlement)) return true;

    throw new ForbiddenException(
      `Your current plan does not include ${String(entitlement)}.`,
    );
  }
}
