# Phase 0-1 — Stripe Object Truth

## Baseline
- Branch: main
- HEAD at start: 0cbb66413ad1e8a386163e6916e30b4f734af628
- git status: clean (only pre-existing untracked verification/ dirs from prior sessions)
- Billing file hashes (unchanged from prior verified state):
  - billing.service.ts: a9b981b8a4744ab87424f57e64e0263df07e3f87dc60d512dfaf79031f6c1b8b
  - billing.controller.ts: a5535300268346780b4cd26acf852a8593d058bff69a074440aaa2f56f306f1a
  - user-subscription.entity.ts: 05b40cc9257d9edfbea36443fdac7412199e866310e041a3a5f7a4b82a1c1756
  - plan-entitlements.ts: ec134aea381d3c3b3045ff4b2e2811c9782197ce392f3ec8e187f9bf0bcb0cbe
  - subscription-status.ts: e96a48b230abb206f040fd7fa757935444c3bf4fddb675f63cc57462669913a5
- Stripe SDK: `stripe@22.1.1` (backend/package.json). No `apiVersion` pinned in `new Stripe(...)` construction (billing.service.ts:55) — account default version is used.

## Disposable test subscription used for this investigation
- InSite user: 21999623-56a1-4021-a6dd-baeefd99384d (insite-verify-18dad399@example.com)
- Stripe customer: cus_V5hhBlH77JeVNw
- Stripe subscription: sub_1U5WJA1CARzecF19eGki4lwj (Pro, price_1U5SDX1CARzecF19oJHtuay5, $6.99/mo)
- This subscription was upgraded to Pro and then cancelled through the Stripe Customer Portal in the prior verification session (before this phase began).

## Stripe API version actually in effect
`GET /v1/subscriptions/:id` response header: **`stripe-version: 2026-04-22.dahlia`**

This is the account's live default API version (no version pinned by our SDK client), confirmed via raw HTTP response header, not inferred.

## Raw subscription object (sanitized, live GET as of this session)
Top-level fields of interest:
```
id: sub_1U5WJA1CARzecF19eGki4lwj
status: active
cancel_at_period_end: false          <-- our code reads this; it is FALSE
cancel_at: 1789673694                <-- our code never reads this; it IS SET (= Sep 17, 2026)
canceled_at: 1786995378              <-- our code never reads this; it IS SET
ended_at: null
current_period_start: <MISSING>      <-- our code reads this; does not exist at top level
current_period_end: <MISSING>        <-- our code reads this; does not exist at top level
billing_mode: {"type": "flexible", "flexible": {"proration_discounts": "included"}}
cancellation_details: {"reason": "cancellation_requested", "feedback": "other", ...}
```

`items.data[0]` (single Pro item — this account has exactly one subscription item):
```
id: si_V5hizB9fIZD55b
price: price_1U5SDX1CARzecF19oJHtuay5 (Pro Monthly, $6.99)
current_period_start: 1786995294
current_period_end: 1789673694   <-- equals cancel_at exactly
quantity: 1
```

## Conclusive explanation

**BL-01 (period dates don't populate):** Confirmed root cause. Under API version `2026-04-22.dahlia` with `billing_mode.type = "flexible"`, Stripe no longer returns `current_period_start`/`current_period_end` on the top-level Subscription object at all (this is Stripe's "Flexible Billing Mode," which supports multiple items with independent billing cycles, so a single subscription-level period no longer makes sense). These fields now live only on each subscription item: `items.data[].current_period_start` / `items.data[].current_period_end`. `billing.service.ts` (`upsertSubscriptionFromStripeSubscription`) reads the top-level fields, which are `undefined` on every event under this API version — hence `null` in our DB on every write, including the very first `customer.subscription.created` event.

**BL-02 (cancellation state discrepancy):** Confirmed root cause, and confirmed NOT cosmetic. The Stripe Customer Portal's cancellation configuration (`bpc_1U5SiQ1CARzecF19d8iV0Cfc`, the account's default/only config) is explicitly set to `subscription_cancel.mode: "at_period_end"` — Portal cancellations in this account are always scheduled, never immediate. When the Portal scheduled the cancellation, Stripe represented it via `cancel_at = 1789673694` (exactly equal to the item's `current_period_end`) and `canceled_at = 1786995378` (the moment cancellation was requested) — **`cancel_at_period_end` stayed `false`**. This was verified directly in both raw webhook event payloads (`evt_1U5WKV1CARzecF19f8FT2Tg9`, `evt_1U5WKW1CARzecF19qnUDvWs4`, both `customer.subscription.updated`) and a fresh live `GET` of the subscription — the data was present in the webhook payload the entire time; `billing.service.ts` simply never read `cancel_at`/`canceled_at`. In API version `2026-04-22.dahlia` with flexible billing mode, `cancel_at` (a general-purpose future timestamp, not restricted to period-end) is the authoritative field for "is this subscription scheduled to stop," and `cancel_at_period_end` is effectively vestigial for Portal-driven period-end cancellations in this mode.

The Portal UI ("Cancels Sep 17") was telling the truth the whole time.

## Portal configuration (authoritative cancellation behavior)
```
GET /v1/billing_portal/configurations -> bpc_1U5SiQ1CARzecF19d8iV0Cfc (default, active)
features.subscription_cancel:
  enabled: true
  mode: "at_period_end"
  proration_behavior: "none"
  cancellation_reason.enabled: true (too_expensive / switched_service / unused / other)
```
No subscription schedule (`schedule: null`) is used for this cancellation — it is a direct `cancel_at` timestamp on the subscription itself, not a `SubscriptionSchedule` object. Resuming (Phase 6, L6) is therefore expected to be a direct `cancel_at: null` update on the subscription (Stripe's standard "renew" action in the Portal), not schedule manipulation.

## Authoritative field model for this API version (used to design the fix)
| Concern | Authoritative source |
|---|---|
| Subscription is active | `status === 'active' \| 'trialing'` |
| Currently entitled (until when) | `status` combined with `cancel_at` / `ended_at` |
| Billing period start/end | `items.data[<pro item>].current_period_start` / `current_period_end` (NOT top-level) |
| Scheduled to stop (and when) | `cancel_at` (timestamp or null) — NOT `cancel_at_period_end` for this API version/billing mode |
| Cancellation requested at | `canceled_at` |
| Subscription actually ended | `ended_at` (non-null) and/or `status === 'canceled'` |
