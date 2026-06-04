import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Pro Users (One-Time Payment) are always active
    if (user.type === 'pro') return true;

    // 2. Individual (Free) Users have limited access (Handled by other logic)
    if (user.type === 'individual') return true;

    // 3. Enterprise/Company Users must have 'active' status
    if (user.type === 'company' && user.subscriptionStatus !== 'active') {
      throw new ForbiddenException({
        message: 'Subscription Inactive',
        reason: 'Payment Required',
        action: 'Please update your billing information in settings.'
      });
    }

    // 4. Ensure account is not soft-deleted
    if (user.deletedAt) {
      throw new ForbiddenException('Account deactivated.');
    }

    return true;
  }
}
