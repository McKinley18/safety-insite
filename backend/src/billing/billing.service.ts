import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as StripePackage from 'stripe';

const StripeConstructor = (StripePackage as any).default || StripePackage;
import { UserSubscription } from './user-subscription.entity';
import {
  BILLING_PLAN_DEFINITIONS,
  BillingTier,
  getConfiguredStripePriceIdForTier,
  getBillingEntitlements,
  getBillingPlanDisplayName,
  getBillingPlanMonthlyPrice,
  normalizeBillingTier,
  resolveTierForPriceId,
} from './plan-entitlements';
import {
  hasActivePaidAccess,
  hasExpertAccess,
  hasProAccess,
  normalizeStripeSubscriptionStatus,
  resolveAccessTier,
} from './subscription-status';

type StripeClient = InstanceType<typeof StripeConstructor>;

function getUserId(user: any): string {
  const raw = user?.userId || user?.id || user?.sub;
  const userId = String(raw || '').trim();

  if (!userId) {
    throw new UnauthorizedException('Authenticated user is required.');
  }

  return userId;
}

@Injectable()
export class BillingService {
  private readonly stripe: StripeClient | null;

  constructor(
    @InjectRepository(UserSubscription)
    private readonly subscriptions: Repository<UserSubscription>,
  ) {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new StripeConstructor(process.env.STRIPE_SECRET_KEY)
      : null;
  }

  private requireStripe(): StripeClient {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Stripe billing is not configured on this server.',
      );
    }

    return this.stripe;
  }

  private frontendUrl(): string {
    return (
      process.env.FRONTEND_APP_URL ||
      process.env.APP_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  async getBillingStatus(user: any) {
    const userId = getUserId(user);
    const fallbackTier = normalizeBillingTier(
      user?.subscriptionTier ||
        user?.billingTier ||
        user?.effectivePlanCode ||
        user?.planCode ||
        user?.type,
    );
    const fallbackStatus =
      normalizeStripeSubscriptionStatus(user?.subscriptionStatus || user?.billingStatus) ||
      (fallbackTier === 'free' ? 'none' : 'active');

    const subscription = await this.findSubscriptionByUserId(userId);

    const sourceTier = subscription ? subscription.tier : fallbackTier;
    const sourceStatus = subscription ? subscription.status : fallbackStatus;
    const sourcePeriodEnd = subscription?.currentPeriodEnd || null;
    const tier = subscription
      ? this.resolveEffectiveTier(subscription)
      : resolveAccessTier(sourceTier, sourceStatus, sourcePeriodEnd);
    const plan = BILLING_PLAN_DEFINITIONS[tier] || BILLING_PLAN_DEFINITIONS.free;
    const accessInput = {
      tier: sourceTier,
      status: sourceStatus,
      currentPeriodEnd: sourcePeriodEnd,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    };

    return {
      tier,
      planCode: tier,
      plan: tier,
      label: getBillingPlanDisplayName(tier),
      monthlyPrice: getBillingPlanMonthlyPrice(tier),
      status: sourceStatus,
      subscriptionStatus: sourceStatus,
      hasPaidAccess: hasActivePaidAccess(accessInput),
      hasProAccess: hasProAccess(accessInput),
      hasExpertAccess: hasExpertAccess(accessInput),
      currentPeriodStart: subscription?.currentPeriodStart || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
      stripeCustomerId: subscription?.stripeCustomerId || null,
      stripeSubscriptionId: subscription?.stripeSubscriptionId || null,
      stripePriceId: subscription?.stripePriceId || null,
      entitlements: getBillingEntitlements(tier),
      planDefinition: plan,
      billingConfigured: Boolean(this.stripe),
      planCatalog: Object.values(BILLING_PLAN_DEFINITIONS).map((definition) => ({
        tier: definition.tier,
        label: definition.label,
        priceMonthly: definition.priceMonthly,
        description: definition.description,
      })),
    };
  }

  async createCheckoutSession(user: any, tier: BillingTier) {
    const userId = getUserId(user);

    if (tier === 'free') {
      throw new BadRequestException('Free plan does not require checkout.');
    }

    const stripe = this.requireStripe();
    const priceId = getConfiguredStripePriceIdForTier(tier);

    if (!priceId) {
      throw new ServiceUnavailableException(
        `Stripe price ID is not configured for ${tier}.`,
      );
    }

    let subscription = await this.subscriptions.findOne({ where: { userId } });
    let customerId = subscription?.stripeCustomerId || undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name,
        metadata: { userId: String(userId) },
      });

      customerId = customer.id;

      subscription = await this.subscriptions.save({
        ...(subscription || {}),
        userId,
        stripeCustomerId: customerId,
        tier: 'free',
        status: 'none',
      });
    }

    const appUrl = this.frontendUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/profile?billing=success`,
      cancel_url: `${appUrl}/pricing?billing=cancelled`,
      metadata: {
        userId: String(userId),
        targetTier: tier,
      },
      subscription_data: {
        metadata: {
          userId: String(userId),
          targetTier: tier,
        },
      },
    });

    return { url: session.url };
  }

  async createPortalSession(user: any) {
    const userId = getUserId(user);
    const stripe = this.requireStripe();

    const subscription = await this.subscriptions.findOne({
      where: { userId },
    });

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException(
        'No Stripe customer exists for this user. Upgrade first.',
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${this.frontendUrl()}/profile`,
    });

    return { url: session.url };
  }

  async handleStripeWebhook(rawBody: Buffer | string, signature?: string) {
    const stripe = this.requireStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'Stripe webhook secret is not configured.',
      );
    }

    if (!signature) {
      throw new BadRequestException('Missing Stripe signature.');
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature.');
    }

    await this.applyStripeEvent(event);
    return { received: true };
  }

  private resolveEffectiveTier(subscription?: UserSubscription | null): BillingTier {
    if (!subscription) return 'free';

    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : null;

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      return normalizeBillingTier(subscription.tier);
    }

    if (
      subscription.status === 'canceled' &&
      periodEnd &&
      periodEnd.getTime() > now.getTime()
    ) {
      return normalizeBillingTier(subscription.tier);
    }

    return 'free';
  }

  private async applyStripeEvent(event: any) {
    const stripe = this.requireStripe();
    const existing = await this.subscriptions.findOne({
      where: { lastStripeEventId: event.id },
    });

    if (existing) return;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = await this.resolveUserIdForStripeObject(session);
        if (!userId) return;
        await this.upsertSubscriptionFromCheckoutSession(userId, session, event.id);
        return;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.upsertSubscriptionFromStripeSubscription(subscription, event.id);
        return;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeSubscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!stripeSubscriptionId) return;

        const stripe = this.requireStripe();
        const subscription = await stripe.subscriptions
          .retrieve(stripeSubscriptionId)
          .catch(() => null);

        if (!subscription) return;

        await this.upsertSubscriptionFromStripeSubscription(subscription, event.id);
        return;
      }

      default:
        return;
    }
  }

  private async upsertSubscriptionFromCheckoutSession(
    userId: string,
    session: any,
    eventId: string,
  ) {
    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

    const tier = normalizeBillingTier(session.metadata?.targetTier);
    const existing = await this.subscriptions.findOne({ where: { userId } });

    await this.subscriptions.save({
      ...(existing || {}),
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      tier,
      status: 'incomplete',
      lastStripeEventId: eventId,
    });
  }

  private async upsertSubscriptionFromStripeSubscription(
    stripeSubscription: any,
    eventId: string,
  ) {
    const userId = await this.resolveUserIdForStripeObject(stripeSubscription);
    if (!userId) return;

    const stripePriceId = stripeSubscription.items?.data?.[0]?.price?.id;
    const resolvedPriceTier = resolveTierForPriceId(stripePriceId);
    const tier =
      resolvedPriceTier !== 'free'
        ? resolvedPriceTier
        : normalizeBillingTier(stripeSubscription.metadata?.targetTier);
    const existing = await this.subscriptions.findOne({ where: { userId } });

    await this.subscriptions.save({
      ...(existing || {}),
      userId,
      stripeCustomerId:
        typeof stripeSubscription.customer === 'string'
          ? stripeSubscription.customer
          : stripeSubscription.customer?.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId,
      tier,
      status: normalizeStripeSubscriptionStatus(stripeSubscription.status),
      currentPeriodStart: stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
      lastStripeEventId: eventId,
    });
  }

  private async resolveUserIdForStripeObject(stripeObject: any): Promise<string | null> {
    const metadataUserId = String(stripeObject?.metadata?.userId || '').trim();
    if (metadataUserId) return metadataUserId;

    const stripeSubscriptionId =
      typeof stripeObject?.subscription === 'string'
        ? stripeObject.subscription
        : stripeObject?.subscription?.id || stripeObject?.id;

    if (stripeSubscriptionId) {
      const existingBySubscription = await this.subscriptions.findOne({
        where: { stripeSubscriptionId },
      });
      if (existingBySubscription?.userId) return existingBySubscription.userId;
    }

    const stripeCustomerId =
      typeof stripeObject?.customer === 'string'
        ? stripeObject.customer
        : stripeObject?.customer?.id;

    if (stripeCustomerId) {
      const existingByCustomer = await this.subscriptions.findOne({
        where: { stripeCustomerId },
      });
      if (existingByCustomer?.userId) return existingByCustomer.userId;
    }

    return null;
  }

  private async findSubscriptionByUserId(userId: string) {
    try {
      return await this.subscriptions.findOne({ where: { userId } });
    } catch (error: any) {
      if (error?.code === '22P02') {
        return null;
      }

      throw error;
    }
  }
}
