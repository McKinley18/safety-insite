import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe = require('stripe');
import { User } from '../users/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { BILLING_PLANS, normalizeBillingPlan } from './billing-plans';

@Injectable()
export class BillingService {
  private stripe: any = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async getBillingStatus(user: any) {
    return {
      planCode: user?.organizationPlanCode || user?.planCode || 'basic',
      subscriptionStatus: user?.subscriptionStatus || 'active',
      organizationId: user?.organizationId || null,
    };
  }

  async createCheckoutSession(user: any, plan: string) {
    const planCode = normalizeBillingPlan(plan);

    if (planCode === 'basic') {
      throw new BadRequestException('Basic plan does not require checkout.');
    }

    const config = BILLING_PLANS[planCode];
    const priceId = config.stripePriceEnv ? process.env[config.stripePriceEnv] : null;

    if (!this.stripe || !priceId) {
      throw new BadRequestException('Billing is not configured yet.');
    }

    const successUrl = process.env.BILLING_SUCCESS_URL || 'http://localhost:3000/settings?billing=success';
    const cancelUrl = process.env.BILLING_CANCEL_URL || 'http://localhost:3000/settings?billing=cancelled';

    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user?.email,
      metadata: {
        userId: String(user?.userId || ''),
        organizationId: String(user?.organizationId || ''),
        planCode,
      },
    });
  }

  async applyPlanToOrganization(organizationId: string, planCode: string) {
    const normalized = normalizeBillingPlan(planCode);
    const org = await this.orgRepo.findOne({ where: { id: organizationId } });

    if (!org) return null;

    org.planCode = normalized;
    await this.orgRepo.save(org);

    await this.userRepo.update({ organizationId }, {
      planCode: normalized,
      subscriptionStatus: normalized === 'basic' ? 'active' : 'active',
    });

    return org;
  }
}
