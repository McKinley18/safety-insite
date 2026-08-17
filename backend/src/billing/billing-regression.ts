import {
  BILLING_PLAN_DEFINITIONS,
  getBillingEntitlements,
  getConfiguredStripePriceIdForTier,
  isValidStripePriceId,
  normalizeBillingTier,
  resolveTierForPriceId,
} from "./plan-entitlements";
import { resolveAccessTier, normalizeStripeSubscriptionStatus } from "./subscription-status";
import { hasActivePaidAccess, hasProAccess } from "./subscription-status";

let failures = 0;
let passes = 0;

function assert(condition: boolean, label: string, details?: unknown) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return;
  }

  failures += 1;
  console.error(`FAIL ${label}`, details);
}

const originalProPrice = process.env.STRIPE_PRO_PRICE_ID;
const originalLegacyExpertPrice = process.env.STRIPE_EXPERT_PRICE_ID;

process.env.STRIPE_PRO_PRICE_ID = "price_pro_test";
process.env.STRIPE_EXPERT_PRICE_ID = "price_legacy_expert_test";

assert(normalizeBillingTier("free") === "free", "normalize free");
assert(normalizeBillingTier("plus") === "pro", "normalize plus -> pro");
assert(normalizeBillingTier("company") === "pro", "normalize legacy company -> pro");
assert(normalizeBillingTier("expert") === "pro", "normalize retired expert -> pro");
assert(resolveTierForPriceId("price_pro_test") === "pro", "resolve pro price");
assert(resolveTierForPriceId("price_legacy_expert_test") === "pro", "legacy expert price resolves to pro");
assert(getBillingEntitlements("pro").priorityAiFeatures === true, "pro entitlements include former expert features");
assert(getBillingEntitlements("free").hazlenzPreview === true, "free preview entitlement");
assert(BILLING_PLAN_DEFINITIONS.pro.priceMonthly === 6.99, "pro price constant");
assert(normalizeStripeSubscriptionStatus("ACTIVE") === "active", "normalize stripe status");
assert(normalizeStripeSubscriptionStatus("paused") === "paused", "normalize paused status");
assert(resolveAccessTier("pro", "active") === "pro", "active tier access");
assert(hasActivePaidAccess({ tier: "free", status: "none" }) === false, "free does not unlock paid access");
assert(hasProAccess({ tier: "pro", status: "active" }) === true, "active pro unlocks pro");
assert(hasActivePaidAccess({ tier: "pro", status: "past_due" }) === false, "past_due does not unlock paid access");
assert(hasActivePaidAccess({ tier: "pro", status: "incomplete" }) === false, "incomplete does not unlock paid access");
assert(hasActivePaidAccess({ tier: "pro", status: "unpaid" }) === false, "unpaid does not unlock paid access");
assert(hasActivePaidAccess({ tier: "pro", status: "paused" }) === false, "paused does not unlock paid access");
assert(
  resolveAccessTier("pro", "canceled", new Date(Date.now() + 60_000)) === "pro",
  "canceled period-end grace",
);
assert(resolveAccessTier("pro", "unpaid") === "free", "unpaid drops to free");
assert(normalizeBillingTier("local-dev-bypass-user") === "free", "non-tier local dev value normalizes free");

assert(isValidStripePriceId("price_1AbC23") === true, "valid price id accepted");
assert(isValidStripePriceId("prod_1AbC23") === false, "product id rejected as price id");
assert(isValidStripePriceId(null) === false, "null price id rejected");

const originalLegacyPlusPrice = process.env.STRIPE_PLUS_PRICE_ID;
process.env.STRIPE_PRO_PRICE_ID = "";
process.env.STRIPE_PLUS_PRICE_ID = "prod_legacy_not_a_price";
assert(
  getConfiguredStripePriceIdForTier("pro") === null,
  "legacy product id is never used as a checkout price",
);
process.env.STRIPE_PLUS_PRICE_ID = originalLegacyPlusPrice;

process.env.STRIPE_PRO_PRICE_ID = originalProPrice;
process.env.STRIPE_EXPERT_PRICE_ID = originalLegacyExpertPrice;

if (failures > 0) {
  process.exit(1);
}

console.log(`Billing regression: ${passes} passed, 0 failed`);
