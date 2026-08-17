import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { EntitlementGrant } from '../../billing/entitlement-grant.entity';
import { UserSubscription } from '../../billing/user-subscription.entity';
import { BillingFeatureKey, hasEntitlement, normalizeBillingTier } from '../../billing/plan-entitlements';
import { resolveAccessTier } from '../../billing/subscription-status';

@Injectable()
export class EntitlementService {
  constructor(
    @InjectRepository(EntitlementGrant)
    private readonly grants: Repository<EntitlementGrant>,
    @InjectRepository(UserSubscription)
    private readonly subscriptions: Repository<UserSubscription>,
  ) {}

  async hasFeature(user: any, feature: BillingFeatureKey): Promise<boolean> {
    const userId = String(user?.userId || '');
    const jwtTier = normalizeBillingTier(
      user?.planCode || user?.effectivePlanCode || user?.subscriptionTier,
    );
    if (hasEntitlement(jwtTier, feature)) return true;
    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return false;

    // Stripe webhooks update the subscription row immediately, but the JWT's
    // plan claim is only refreshed at next login. Check live subscription
    // state so a completed checkout unlocks Pro features without requiring
    // the user to sign out and back in.
    const subscription = await this.subscriptions.findOne({ where: { userId } }).catch(() => null);
    if (subscription) {
      const liveTier = resolveAccessTier(
        subscription.tier,
        subscription.status,
        subscription.currentPeriodEnd,
      );
      if (hasEntitlement(liveTier, feature)) return true;
    }

    const now = new Date();
    const grant = await this.grants.findOne({
      where: {
        userId,
        status: 'active',
        startsAt: LessThanOrEqual(now),
        endsAt: MoreThan(now),
      },
      order: { endsAt: 'DESC' },
    });
    return !!grant && hasEntitlement(grant.tier, feature);
  }
}
