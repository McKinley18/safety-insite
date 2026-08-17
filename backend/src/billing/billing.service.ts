import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import * as StripePackage from 'stripe';

const StripeConstructor = (StripePackage as any).default || StripePackage;
import { UserSubscription } from './user-subscription.entity';
import { EntitlementGrant } from './entitlement-grant.entity';
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
  hasProAccess,
  normalizeStripeSubscriptionStatus,
  resolveAccessTier,
  resolveSubscriptionLifecycleState,
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

// Stripe subscription items carry a `price` that is normally expanded to a
// full object on webhook/API responses, but defend against the raw string-id
// shape too.
function itemPriceId(item: any): string | undefined {
  return typeof item?.price === 'string' ? item.price : item?.price?.id;
}

/**
 * Identify the subscription item that represents our Pro plan, rather than
 * blindly reading items[0]. This product currently sells exactly one
 * recurring price per subscription, so when the configured Pro price isn't
 * found (e.g. env misconfigured, legacy price id), fall back to the sole
 * item — but never guess among multiple unmatched items.
 */
function resolveProSubscriptionItem(stripeSubscription: any): any | null {
  const items: any[] = stripeSubscription?.items?.data || [];
  if (!items.length) return null;

  const proPriceId = getConfiguredStripePriceIdForTier('pro');
  const matchedByPrice = proPriceId
    ? items.find((item) => itemPriceId(item) === proPriceId)
    : undefined;
  if (matchedByPrice) return matchedByPrice;

  return items.length === 1 ? items[0] : null;
}

/**
 * Billing period start/end moved off the top-level Subscription object under
 * Stripe's "flexible" billing mode (observed on API version
 * 2026-04-22.dahlia) and now live only on each subscription item. Prefer the
 * top-level fields when present (older API versions / classic billing mode),
 * otherwise fall back to the resolved Pro item. Never throws on missing data.
 */
function resolveSubscriptionPeriod(stripeSubscription: any): {
  start: Date | null;
  end: Date | null;
} {
  const topLevelStart = stripeSubscription?.current_period_start;
  const topLevelEnd = stripeSubscription?.current_period_end;

  if (typeof topLevelStart === 'number' && typeof topLevelEnd === 'number') {
    return { start: new Date(topLevelStart * 1000), end: new Date(topLevelEnd * 1000) };
  }

  const item = resolveProSubscriptionItem(stripeSubscription);
  const start = typeof item?.current_period_start === 'number'
    ? new Date(item.current_period_start * 1000)
    : null;
  const end = typeof item?.current_period_end === 'number'
    ? new Date(item.current_period_end * 1000)
    : null;

  return { start, end };
}

/**
 * Under API version 2026-04-22.dahlia with billing_mode "flexible", the
 * Stripe Customer Portal's at-period-end cancellation sets `cancel_at` (a
 * general future stop timestamp) and leaves `cancel_at_period_end` false.
 * Treat either signal as authoritative so this keeps working regardless of
 * which field a given API version/billing mode actually populates.
 */
function resolveScheduledCancellation(stripeSubscription: any): {
  cancelAt: Date | null;
  scheduled: boolean;
} {
  const cancelAtPeriodEndFlag = Boolean(stripeSubscription?.cancel_at_period_end);
  const rawCancelAt = stripeSubscription?.cancel_at;
  const cancelAt = typeof rawCancelAt === 'number' ? new Date(rawCancelAt * 1000) : null;

  return { cancelAt, scheduled: cancelAtPeriodEndFlag || cancelAt !== null };
}

@Injectable()
export class BillingService {
  private readonly stripe: StripeClient | null;

  constructor(
    @InjectRepository(UserSubscription)
    private readonly subscriptions: Repository<UserSubscription>,
    @InjectRepository(EntitlementGrant)
    private readonly entitlementGrants: Repository<EntitlementGrant>,
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
    const now = new Date();
    const activeGrant = await this.entitlementGrants.findOne({
      where: {
        userId,
        status: 'active',
        startsAt: LessThanOrEqual(now),
        endsAt: MoreThan(now),
      },
      order: { tier: 'ASC', endsAt: 'DESC' },
    });

    const paidTier = subscription ? subscription.tier : fallbackTier;
    const sourceTier = activeGrant?.tier === 'pro' && paidTier === 'free' ? 'pro' : paidTier;
    const sourceStatus = subscription ? subscription.status : fallbackStatus;
    const sourcePeriodEnd = subscription?.currentPeriodEnd || null;
    const paidEffectiveTier = subscription
      ? this.resolveEffectiveTier(subscription)
      : resolveAccessTier(paidTier, sourceStatus, sourcePeriodEnd);
    const tier = activeGrant?.tier === 'pro' && paidEffectiveTier === 'free' ? 'pro' : paidEffectiveTier;
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
      hasPaidAccess: activeGrant ? true : hasActivePaidAccess(accessInput),
      hasProAccess: activeGrant ? true : hasProAccess(accessInput),
      currentPeriodStart: subscription?.currentPeriodStart || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
      cancelAt: subscription?.cancelAt || null,
      lifecycleState: subscription
        ? resolveSubscriptionLifecycleState({
            status: subscription.status,
            cancelAt: subscription.cancelAt,
          })
        : null,
      stripeCustomerId: subscription?.stripeCustomerId || null,
      stripeSubscriptionId: subscription?.stripeSubscriptionId || null,
      stripePriceId: subscription?.stripePriceId || null,
      entitlements: getBillingEntitlements(tier),
      planDefinition: plan,
      billingConfigured: Boolean(this.stripe) && Boolean(getConfiguredStripePriceIdForTier('pro')),
      accessSource: activeGrant ? activeGrant.source : subscription ? 'subscription' : 'free',
      entitlementExpiresAt: activeGrant?.endsAt || null,
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

  /**
   * Entitlement is derived from Stripe's `status` alone, not from comparing
   * our locally cached `currentPeriodEnd` against server wall-clock time.
   * A scheduled cancel-at-period-end subscription stays `status: 'active'`
   * right up until Stripe itself transitions it — that transition is what
   * this must react to, immediately and without a grace window. A
   * periodEnd-based grace period previously lived here to keep Pro access
   * alive after `status` flipped to 'canceled'; verified via a Stripe Test
   * Clock (see verification/insite-billing-lifecycle-2026-08-17) that it
   * incorrectly kept Pro access active after Stripe had fully ended the
   * subscription, because `currentPeriodEnd` reflects Stripe's timeline, not
   * necessarily anything still owed relative to this server's clock — e.g.
   * an immediate cancellation, failed-renewal termination, or admin-driven
   * Stripe-side cancellation would all leave a future-dated period end on a
   * subscription Stripe already considers over.
   */
  private resolveEffectiveTier(subscription?: UserSubscription | null): BillingTier {
    if (!subscription) return 'free';

    if (subscription.status === 'active' || subscription.status === 'trialing') {
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

    const eventCreatedAt = typeof event.created === 'number' ? new Date(event.created * 1000) : new Date();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const stripeSubscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        // Stripe delivers checkout.session.completed and customer.subscription.created
        // concurrently, so this handler must not write a hardcoded status (e.g.
        // 'incomplete') — that can race with and overwrite the subscription event's
        // more current status. Fetch the live subscription and let the same
        // upsert path used for subscription events set the authoritative state.
        if (stripeSubscriptionId) {
          const subscription = await stripe.subscriptions
            .retrieve(stripeSubscriptionId)
            .catch(() => null);

          if (subscription) {
            await this.upsertSubscriptionFromStripeSubscription(subscription, event.id, eventCreatedAt);
            return;
          }
        }

        const userId = await this.resolveUserIdForStripeObject(session);
        if (!userId) return;
        await this.upsertSubscriptionFromCheckoutSession(userId, session, event.id, eventCreatedAt);
        return;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.upsertSubscriptionFromStripeSubscription(subscription, event.id, eventCreatedAt);
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

        await this.upsertSubscriptionFromStripeSubscription(subscription, event.id, eventCreatedAt);
        return;
      }

      default:
        return;
    }
  }

  /**
   * True when applying an event dated `eventCreatedAt` would overwrite state
   * already written by a newer event for this same subscription row. Stripe
   * guarantees an event's `created` timestamp reflects when Stripe generated
   * it, including on redelivery/retry, so this protects against an
   * out-of-order (stale) delivery clobbering more current state — the
   * per-event `lastStripeEventId` check above only catches exact-duplicate
   * redelivery, not reordering between two different events.
   */
  private isStaleEvent(existing: UserSubscription | null, eventCreatedAt: Date): boolean {
    if (!existing?.lastStripeEventAt) return false;
    return eventCreatedAt.getTime() < existing.lastStripeEventAt.getTime();
  }

  private async upsertSubscriptionFromCheckoutSession(
    userId: string,
    session: any,
    eventId: string,
    eventCreatedAt: Date,
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

    if (this.isStaleEvent(existing, eventCreatedAt)) return;

    await this.subscriptions.save({
      ...(existing || {}),
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      tier,
      status: 'incomplete',
      lastStripeEventId: eventId,
      lastStripeEventAt: eventCreatedAt,
    });
  }

  private async upsertSubscriptionFromStripeSubscription(
    stripeSubscription: any,
    eventId: string,
    eventCreatedAt: Date,
  ) {
    const userId = await this.resolveUserIdForStripeObject(stripeSubscription);
    if (!userId) return;

    const proItem = resolveProSubscriptionItem(stripeSubscription);
    const stripePriceId = itemPriceId(proItem);
    const resolvedPriceTier = resolveTierForPriceId(stripePriceId);
    const tier =
      resolvedPriceTier !== 'free'
        ? resolvedPriceTier
        : normalizeBillingTier(stripeSubscription.metadata?.targetTier);
    const existing = await this.subscriptions.findOne({ where: { userId } });

    if (this.isStaleEvent(existing, eventCreatedAt)) return;

    const { start: currentPeriodStart, end: currentPeriodEnd } =
      resolveSubscriptionPeriod(stripeSubscription);
    const { cancelAt, scheduled: cancelAtPeriodEnd } =
      resolveScheduledCancellation(stripeSubscription);

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
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      cancelAt,
      lastStripeEventId: eventId,
      lastStripeEventAt: eventCreatedAt,
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
