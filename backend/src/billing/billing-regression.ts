import {
  BILLING_PLAN_DEFINITIONS,
  getBillingEntitlements,
  normalizeBillingTier,
  resolveTierForPriceId,
} from "./plan-entitlements";
import { resolveAccessTier, normalizeStripeSubscriptionStatus } from "./subscription-status";

let failures = 0;

function assert(condition: boolean, label: string, details?: unknown) {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }

  failures += 1;
  console.error(`FAIL ${label}`, details);
}

const originalProPrice = process.env.STRIPE_PRO_PRICE_ID;
const originalExpertPrice = process.env.STRIPE_EXPERT_PRICE_ID;

process.env.STRIPE_PRO_PRICE_ID = "price_pro_test";
process.env.STRIPE_EXPERT_PRICE_ID = "price_expert_test";

assert(normalizeBillingTier("free") === "free", "normalize free");
assert(normalizeBillingTier("plus") === "pro", "normalize plus -> pro");
assert(normalizeBillingTier("company") === "expert", "normalize company -> expert");
assert(resolveTierForPriceId("price_pro_test") === "pro", "resolve pro price");
assert(resolveTierForPriceId("price_expert_test") === "expert", "resolve expert price");
assert(getBillingEntitlements("expert").priorityAiFeatures === true, "expert entitlements");
assert(getBillingEntitlements("free").hazlenzPreview === true, "free preview entitlement");
assert(BILLING_PLAN_DEFINITIONS.pro.priceMonthly === 6.99, "pro price constant");
assert(BILLING_PLAN_DEFINITIONS.expert.priceMonthly === 11.99, "expert price constant");
assert(normalizeStripeSubscriptionStatus("ACTIVE") === "active", "normalize stripe status");
assert(resolveAccessTier("pro", "active") === "pro", "active tier access");
assert(
  resolveAccessTier("expert", "canceled", new Date(Date.now() + 60_000)) === "expert",
  "canceled period-end grace",
);
assert(resolveAccessTier("expert", "unpaid") === "free", "unpaid drops to free");

process.env.STRIPE_PRO_PRICE_ID = originalProPrice;
process.env.STRIPE_EXPERT_PRICE_ID = originalExpertPrice;

if (failures > 0) {
  process.exit(1);
}

console.log("Billing regression: 12 passed, 0 failed");
