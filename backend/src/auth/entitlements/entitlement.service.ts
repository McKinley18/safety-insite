import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { EntitlementGrant } from '../../billing/entitlement-grant.entity';
import { BillingFeatureKey, hasEntitlement, normalizeBillingTier } from '../../billing/plan-entitlements';

@Injectable()
export class EntitlementService {
  constructor(
    @InjectRepository(EntitlementGrant)
    private readonly grants: Repository<EntitlementGrant>,
  ) {}

  async hasFeature(user: any, feature: BillingFeatureKey): Promise<boolean> {
    const userId = String(user?.userId || '');
    const jwtTier = normalizeBillingTier(
      user?.planCode || user?.effectivePlanCode || user?.subscriptionTier,
    );
    if (hasEntitlement(jwtTier, feature)) return true;
    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return false;
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
