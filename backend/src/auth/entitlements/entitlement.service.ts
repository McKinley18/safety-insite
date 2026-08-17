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
    const hasValidUserId = Boolean(userId) && /^[0-9a-f-]{36}$/i.test(userId);
    const subscription = hasValidUserId
      ? await this.subscriptions.findOne({ where: { userId } }).catch(() => null)
      : null;

    // Stripe webhooks update the subscription row immediately, but the JWT's
    // plan claim is only refreshed at next login. When a subscription row
    // exists, its live state is authoritative in BOTH directions: it must
    // unlock Pro features the moment a checkout completes without requiring
    // sign-out/sign-in, and — just as importantly — it must revoke Pro
    // features the moment Stripe ends the subscription, even though the
    // still-unexpired JWT keeps claiming the old plan (verified via a
    // Stripe Test Clock that a stale Pro JWT otherwise kept unlocking Pro
    // endpoints after Stripe had fully terminated the subscription: see
    // verification/insite-billing-lifecycle-2026-08-17). Only fall back to
    // the JWT's plan claim when there is no subscription row to check
    // against (e.g. an organization-seat plan carried purely on the JWT).
    if (subscription) {
      const liveTier = resolveAccessTier(
        subscription.tier,
        subscription.status,
        subscription.currentPeriodEnd,
      );
      if (hasEntitlement(liveTier, feature)) return true;
    } else {
      const jwtTier = normalizeBillingTier(
        user?.planCode || user?.effectivePlanCode || user?.subscriptionTier,
      );
      if (hasEntitlement(jwtTier, feature)) return true;
    }

    if (!hasValidUserId) return false;

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
