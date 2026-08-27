#!/usr/bin/env node
/**
 * InSite v1.0 launch pricing consistency check.
 *
 * Launch contract:  FREE = $0,  PRO = $24.99/month,  EXPERT = NOT_A_V1_PLAN.
 *
 * This is a static source check, not a rendered-page check, because the customer-facing
 * plan/price strings are authored as literals in the components below rather than fetched
 * from the API. It exists because the register page shipped a stale price table twice
 * (Pro $6.99 / Expert $11.99, then Pro $9.99) while the pricing page had already moved on:
 * nothing in the repository asserted that the two agreed.
 *
 * Run: npm run check:launch-pricing   (from frontend-next/)
 */

import { readFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(frontendRoot, "..");

let failures = 0;
let passes = 0;

function assert(condition, label, details) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
  if (details !== undefined) console.error(`     ${details}`);
}

function read(relPath) {
  return readFileSync(join(repoRoot, relPath), "utf8");
}

// ---------------------------------------------------------------------------
// 1. Retired prices must not appear in any customer-facing source file.
// ---------------------------------------------------------------------------

// Tracked source only: .next build output, node_modules and the verification/ evidence
// archive are excluded. The verification archive deliberately preserves the historical
// $6.99 Stripe objects and must not be rewritten to match today's price.
const CUSTOMER_FACING_GLOBS = [
  "frontend-next/app",
  "frontend-next/components",
  "frontend-next/lib",
  "backend/src/billing",
];

function trackedFiles(dir) {
  return execFileSync("git", ["ls-files", dir], { cwd: repoRoot, encoding: "utf8" })
    .split("\n")
    .filter((line) => /\.(ts|tsx|js|jsx|mjs|css|json|md)$/.test(line));
}

const customerFacingFiles = CUSTOMER_FACING_GLOBS.flatMap(trackedFiles);
assert(customerFacingFiles.length > 0, "customer-facing file set is non-empty");

for (const [label, pattern] of [
  ["$6.99 (retired Pro price)", /\b6\.99\b/],
  ["$11.99 (retired Expert price)", /\b11\.99\b/],
  ["$9.99 (superseded Pro price)", /\b9\.99\b/],
]) {
  const hits = customerFacingFiles.filter((file) => pattern.test(read(file)));
  assert(hits.length === 0, `no ${label} in customer-facing source`, hits.join(", "));
}

// ---------------------------------------------------------------------------
// 2. "Expert" is permitted only as an INTERNAL_LEGACY_COMPATIBILITY reference.
//
// A retired tier name still has to be recognised on the way IN -- an existing row or an
// existing Stripe subscription may carry it -- so the normalizers and their explanatory
// comments legitimately name it. What must never exist again is Expert as something a
// customer can see or select. The allowlist is per-file and per-reason so that a new
// occurrence anywhere else fails this check.
// ---------------------------------------------------------------------------

const LEGACY_EXPERT_ALLOWLIST = new Map([
  [
    "frontend-next/lib/planEntitlements.ts",
    "normalizePlanCode() maps a persisted 'expert' plan code to 'pro'; comment explains why.",
  ],
  [
    "backend/src/billing/plan-entitlements.ts",
    "normalizeBillingTier()/resolveTierForPriceId() map retired 'expert' tier and STRIPE_EXPERT_PRICE_ID to 'pro'.",
  ],
  [
    "backend/src/billing/billing-regression.ts",
    "Asserts the retired-Expert normalization above still holds.",
  ],
  [
    "frontend-next/components/pricing/planData.ts",
    "Declares the canonical launch contract 'EXPERT = NOT_A_V1_PLAN'. The word appears only "
      + "in that declaration -- the file defines Free and Pro and no Expert plan. Pinned below "
      + "by CONTRACT_DECLARATION_ONLY so the entry cannot silently cover a real Expert plan "
      + "reintroduced into this file later.",
  ],
]);

// A file-level allowlist entry is a blunt instrument: it would let ANY future Expert
// reference into that file. planData.ts is the single source of truth for what a customer
// is offered, so it is the last file where that should be possible. Its entry above is
// therefore pinned -- every /expert/i line in it must BE the contract declaration.
const CONTRACT_DECLARATION_ONLY = new Map([
  [
    "frontend-next/components/pricing/planData.ts",
    /^\s*\/\/.*EXPERT\s*=\s*NOT_A_V1_PLAN\.?\s*$/,
  ],
]);

const expertHits = customerFacingFiles.filter((file) => /expert/i.test(read(file)));
const unexpectedExpert = expertHits.filter((file) => !LEGACY_EXPERT_ALLOWLIST.has(file));
assert(
  unexpectedExpert.length === 0,
  "'Expert' appears only in allowlisted internal-legacy files",
  unexpectedExpert.join(", "),
);
for (const [file, allowedLine] of CONTRACT_DECLARATION_ONLY) {
  const offending = read(file)
    .split("\n")
    .map((line, index) => [index + 1, line])
    .filter(([, line]) => /expert/i.test(line) && !allowedLine.test(line));
  assert(
    offending.length === 0,
    `${file} names Expert ONLY in the canonical 'EXPERT = NOT_A_V1_PLAN' contract line`,
    offending.map(([n, line]) => `line ${n}: ${line.trim()}`).join(" | "),
  );
}

for (const file of LEGACY_EXPERT_ALLOWLIST.keys()) {
  assert(
    expertHits.includes(file) || !customerFacingFiles.includes(file),
    `allowlisted legacy-Expert file still exists and still needs its entry: ${file}`,
    "If the reference is gone, delete the allowlist entry rather than leaving it stale.",
  );
}

// ---------------------------------------------------------------------------
// 3. Every customer-facing plan surface states the same two plans at the same prices.
// ---------------------------------------------------------------------------

const register = read("frontend-next/app/register/page.tsx");
assert(/id:\s*"free"\s+as\s+const/.test(register), "register offers the Free plan");
assert(/id:\s*"pro"\s+as\s+const/.test(register), "register offers the Pro plan");
assert(/price:\s*FREE_PRICE_DISPLAY/.test(register), "register prices Free from the shared plan data");
assert(
  /price:\s*`\$\{PRO_PRICE_DISPLAY\}\/mo`/.test(register),
  "register prices Pro from the shared plan data",
);
assert(
  (register.match(/\bid:\s*"(free|pro|expert|plus|company|enterprise)"/g) || []).length === 2,
  "register offers exactly two selectable plans",
);

// Plan facts now live in ONE module that both customer-facing surfaces read.
// /pricing (acquisition) and /upgrade (in-product conversion) are deliberately
// different experiences, so they are checked for shared DATA rather than shared markup.
const planData = read("frontend-next/components/pricing/planData.ts");
assert(/PRO_PRICE_DISPLAY = "\$24\.99"/.test(planData), "shared plan data prices Pro at $24.99");
assert(/PRO_PRICE_CADENCE = "\/month"/.test(planData), "shared plan data states a monthly cadence");
assert(/FREE_PRICE_DISPLAY = "\$0"/.test(planData), "shared plan data prices Free at $0");
// Count plans inside LAUNCH_PLANS only. The LaunchPlan type above it also writes
// `tier: "free" | "pro"`, and a type union is not a third plan.
const launchPlans = planData.slice(planData.indexOf("export const LAUNCH_PLANS"));
assert(
  (launchPlans.match(/\btier:\s*"(free|pro|expert|plus|company|enterprise)"/g) || []).length === 2,
  "shared plan data defines exactly two plans",
);
assert(/tier:\s*"free"/.test(launchPlans), "shared plan data defines the Free plan");
assert(/tier:\s*"pro"/.test(launchPlans), "shared plan data defines the Pro plan");
assert(
  (planData.match(/^\s*\[".*?",\s*"[^"]*",\s*"[^"]*"\],\s*$/gm) || []).length ===
    (planData.match(/^\s*\[".*?",/gm) || []).length,
  "feature comparison rows carry exactly two plan columns",
);

// Both surfaces must consume that module rather than re-authoring a price literal.
const pricing = read("frontend-next/components/pricing/PricingContent.tsx");
const upgrade = read("frontend-next/components/billing/UpgradeContent.tsx");
const landing = read("frontend-next/app/page.tsx");
for (const [label, source] of [
  ["/pricing", pricing],
  ["/upgrade", upgrade],
  ["/register", register],
  ["/ (landing)", landing],
]) {
  assert(
    /from "\.\/planData"|from "@\/components\/pricing\/planData"/.test(source),
    `${label} reads its plan facts from the shared planData module`,
  );
  // Comments are stripped first: the point is that no price is RENDERED from a
  // literal in these files, not that the word cannot appear in an explanation.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert(
    !/\$\d+\.\d{2}/.test(code),
    `${label} renders no hard-coded decimal price of its own`,
  );
}

// The two pages must not be the same experience again.
const pricingRoute = read("frontend-next/app/pricing/page.tsx");
const upgradeRoute = read("frontend-next/app/upgrade/page.tsx");
assert(
  /PricingContent/.test(pricingRoute) && !/UpgradeContent/.test(pricingRoute),
  "/pricing renders the acquisition surface",
);
assert(
  /UpgradeContent/.test(upgradeRoute) && !/PricingContent/.test(upgradeRoute),
  "/upgrade renders the conversion surface, not a second copy of /pricing",
);

// /settings and /profile render their price through getPlanPricing rather than a literal.
const entitlements = read("frontend-next/lib/planEntitlements.ts");
assert(
  /normalized === "pro"\) return 24\.99;/.test(entitlements),
  "getPlanPricing() returns 24.99 for Pro (drives the billing settings panel)",
);
// BillingTier is the EFFECTIVE union -- what a plan ever resolves to. PlanCode is wider on
// purpose: it is the accepted-input union that still names retired codes so a persisted
// value can be normalized rather than rejected (INTERNAL_LEGACY_COMPATIBILITY).
assert(
  /export type BillingTier = "free" \| "pro";/.test(entitlements),
  "frontend BillingTier union is exactly free | pro",
);
assert(
  !/export type PlanCode = [^;]*"expert"/.test(entitlements),
  "'expert' is not even an accepted legacy plan-code literal",
);

// ---------------------------------------------------------------------------
// 4. The backend contract a customer is actually billed against.
// ---------------------------------------------------------------------------

const backendPlans = read("backend/src/billing/plan-entitlements.ts");
assert(
  /export type BillingTier = "free" \| "pro";/.test(backendPlans),
  "backend BillingTier union is exactly free | pro",
);
assert(/priceMonthly:\s*24\.99/.test(backendPlans), "backend Pro priceMonthly is 24.99");
assert(/priceMonthly:\s*0,/.test(backendPlans), "backend Free priceMonthly is 0");

const checkoutDto = read("backend/src/billing/dto/create-checkout-session.dto.ts");
assert(
  /@IsIn\(\["pro"\]\)/.test(checkoutDto),
  "checkout accepts 'pro' and nothing else -- no new customer can buy a retired tier",
);

console.log(
  failures === 0
    ? `\nLaunch pricing check: ${passes} passed, 0 failed — FREE $0 / PRO $24.99 per month, EXPERT NOT_A_V1_PLAN.`
    : `\nLaunch pricing check: ${passes} passed, ${failures} FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
