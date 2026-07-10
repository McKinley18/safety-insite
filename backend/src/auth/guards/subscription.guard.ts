import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasActivePaidAccess } from '../../billing/subscription-status';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.deletedAt) {
      throw new ForbiddenException('Account deactivated.');
    }

    if (
      user.type === 'company' &&
      !hasActivePaidAccess({
        tier: user.subscriptionTier || user.billingTier || user.effectivePlanCode || user.planCode || user.type,
        status: user.billingStatus || user.subscriptionStatus,
      })
    ) {
      throw new HttpException(
        {
          message: 'A paid subscription is required for this feature.',
          code: 'PAID_SUBSCRIPTION_REQUIRED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
