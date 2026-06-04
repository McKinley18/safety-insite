
export type BillingPlanCode = 'basic' | 'plus' | 'company';

export const BILLING_PLANS = {

  basic: {

    planCode: 'basic',

    label: 'Basic',

    stripePriceEnv: null,

  },

  plus: {

    planCode: 'plus',

    label: 'Plus',

    stripePriceEnv: 'STRIPE_PLUS_PRICE_ID',

  },

  company: {

    planCode: 'company',

    label: 'Company',

    stripePriceEnv: 'STRIPE_COMPANY_PRICE_ID',

  },

} as const;

export function normalizeBillingPlan(plan?: string): BillingPlanCode {

  if (plan === 'plus' || plan === 'company') return plan;

  return 'basic';

}

