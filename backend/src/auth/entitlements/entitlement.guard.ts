import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasEntitlement, PLAN_ENTITLEMENTS } from './plan-entitlements';

export const ENTITLEMENT_KEY = 'requiredEntitlement';
export type EntitlementKey = keyof typeof PLAN_ENTITLEMENTS.basic;

export const RequireEntitlement = (entitlement: EntitlementKey) =>
  SetMetadata(ENTITLEMENT_KEY, entitlement);

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const entitlement = this.reflector.getAllAndOverride<EntitlementKey>(ENTITLEMENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!entitlement) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (hasEntitlement(user?.planCode, entitlement)) return true;

    throw new ForbiddenException(`Your current plan does not include ${entitlement}.`);
  }
}
