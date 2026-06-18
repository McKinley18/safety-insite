export type BillingPlanCode = 'basic' | 'pro';

export const BILLING_PLANS = {
  basic: {
    planCode: 'basic',
    label: 'Basic',
    stripePriceEnv: null,
    legacyStripePriceEnv: null,
  },

  pro: {
    planCode: 'pro',
    label: 'Pro',
    stripePriceEnv: 'STRIPE_PRO_PRICE_ID',
    // Backward-compatible fallback while Render/Stripe envs are being renamed.
    legacyStripePriceEnv: 'STRIPE_PLUS_PRICE_ID',
  },
} as const;

export function normalizeBillingPlan(plan?: string): BillingPlanCode {
  const normalized = String(plan || '').trim().toLowerCase();

  if (normalized === 'pro' || normalized === 'plus') return 'pro';

  return 'basic';
}
