# Phase 2-6 — Webhook Census, Fixes, and Full Lifecycle Verification

All testing used Stripe TEST mode against production (`https://safescope-backend.onrender.com`,
`https://safety-insite.vercel.app`). No live-mode Stripe objects were touched. Disposable test
users/customers/subscriptions only.

## Phase 2 — Webhook event census (as observed via Stripe's raw Events API)

**New subscription (Checkout completion):**
1. `checkout.session.completed` (session status `complete`, no `cancel_at`/period fields present)
2. `customer.subscription.created` (status `active`, period dates on `items.data[0]`, not top-level)

**Portal cancellation (mode: at_period_end):**
3. `customer.subscription.updated` ×2, ~1s apart — both carry `cancel_at` = the item's
   `current_period_end`, `canceled_at` set, `cancel_at_period_end: false` (see phase1 doc for why)

**Portal resume ("Don't cancel subscription" / reactivate):**
4. `customer.subscription.updated` — `cancel_at: null`, `canceled_at: null`, status still `active`

**Final termination (Stripe Test Clock advanced past cancel_at):**
5. `customer.subscription.updated` — `status: canceled`
6. `customer.subscription.deleted` — `status: canceled`, `ended_at` set

All of the above were confirmed to reach `/billing/webhook/stripe` (Render access logs show
`Stripe/1.0` user-agent requests at the corresponding timestamps) and were processed without
throwing.

## Phase 3/4 fix — implemented in commit 0f78ed83 (see repo history)

- `resolveProSubscriptionItem` / `resolveSubscriptionPeriod` / `resolveScheduledCancellation`
  helpers added to `billing.service.ts`.
- `UserSubscription.cancelAt` (timestamptz, nullable) + `lastStripeEventAt` (timestamptz,
  nullable) columns added via migration `1800000007000-AddSubscriptionCancelAtAndEventOrdering`.
- `resolveSubscriptionLifecycleState` added to `subscription-status.ts` (`active_renewing` /
  `active_cancel_scheduled` / `canceled`).
- Out-of-order webhook protection: `isStaleEvent` compares the incoming event's `created`
  timestamp against the subscription row's `lastStripeEventAt`; a stale (older) event is
  dropped instead of overwriting newer state.

## Bug found and fixed during Phase 6 verification (commits 8f6e6391, 17970820)

While exercising L7 (final termination) with a Stripe Test Clock, `billing/status` and the
live `EntitlementGuard` path both continued to report Pro access for a subscription Stripe had
already fully ended (`status: canceled`, `ended_at` set). Root cause: `resolveEffectiveTier`
(billing.service.ts) and `resolveAccessTier` (subscription-status.ts) both granted a tier when
`status === 'canceled'` as long as a locally-cached `currentPeriodEnd` was still in the future —
a grace-period concept that doesn't hold once `currentPeriodEnd` correctly reflects Stripe's own
(possibly test-clock-driven, but structurally identical to any immediate-cancellation or
failed-renewal-termination) timeline rather than anything still owed relative to this server's
clock. Fixed by making `status` the sole entitlement signal (commit 8f6e6391).

A second, related bug was found in the same investigation: `EntitlementGuard` independently
checked the JWT's cached plan claim as an `OR` alongside `EntitlementService.hasFeature()`'s
live-subscription check, and `hasFeature()` itself checked the JWT claim first. Either path let
a JWT issued while Pro keep unlocking Pro endpoints for its full remaining lifetime after Stripe
had ended the subscription and the webhook had already synced the termination to the DB — i.e.
re-login was silently required to actually lose access. Reproduced with a captured valid JWT
(issued while genuinely Pro) replayed against a Pro-gated endpoint after test-clock termination:
request succeeded (400, past the entitlement gate) before the fix, correctly blocked (402) after
it. Fixed by making `EntitlementService.hasFeature()` the single source of truth — a live
`UserSubscription` row's state is authoritative in both directions when one exists; the JWT
claim is only a fallback when there is no subscription row at all (commit 17970820).

## Phase 6 — Full lifecycle (fresh disposable users, real browser + Stripe test mode)

| Case | Result | Evidence |
|---|---|---|
| L1 Free | PASS | fresh registration → tier free, `/applicable-standards/suggest` → 402 |
| L2 Free→Pro | PASS | real Checkout (card 4242...) → `/profile` shows "Renews September 17, 2026" (previously "Renewal Not available"); `currentPeriodStart`/`currentPeriodEnd` populated; Pro endpoint unlocked (400, past entitlement gate) |
| L3 Manage | PASS | Portal session opened for the correct customer/subscription ("Safety InSite Pro $6.99/month") |
| L4 Schedule cancellation | PASS | Portal cancel → InSite shows "Cancels at period end / Pro access through September 17, 2026"; `lifecycleState: active_cancel_scheduled`, `cancelAt` populated, tier stayed Pro |
| L5 Reload/relogin | PASS | page reload and a fresh server login both show identical, correct state; profile identity intact |
| L6 Resume | PASS | Portal "Don't cancel subscription" → `lifecycleState: active_renewing`, `cancelAt: null`; UI back to "active / Renews September 17, 2026"; same subscription id throughout (no duplicate) |
| L7 Final termination | PASS (after fix) | isolated Stripe Test Clock subscription bound to a dedicated disposable user via metadata; advanced past `cancel_at` → `tier: free`, `hasProAccess: false`, `lifecycleState: canceled`, Pro endpoint → 402; profile data intact; no re-login performed for this check |
| L8 Webhook replay | PASS | replayed the already-applied terminal `customer.subscription.deleted` event with a valid reconstructed signature → accepted (201), DB state unchanged |
| L9 Out-of-order defense | PASS | replayed an older `customer.subscription.created` (status active, pre-dates the terminal event) after termination was already applied → accepted (201) but *not* applied (`isStaleEvent` rejected it); state remained `free`/`canceled` |
| Stale-JWT-after-termination | PASS (after fix) | captured a valid JWT while genuinely Pro, terminated the subscription via Test Clock, replayed the *unmodified old JWT* against a Pro-gated endpoint with zero new login: 400 (blocked) before fix would have been reproduced as passing the gate — confirmed both the failure and the fix with the same script, pre- and post-deploy |

## Phase 7 — Security/ownership

- `createCheckoutSession`/`createPortalSession` derive `userId` exclusively from the
  authenticated JWT (`getUserId(user)`); no client-suppliable identifier exists on either
  endpoint's DTO. Unchanged by this work.
- Webhook processing resolves the owning user from Stripe-trusted `metadata.userId` (set
  server-side at checkout/subscription creation), never from client input.
- Cross-account isolation was exercised structurally throughout Phase 6: three independent
  disposable users (L1, L7, L9) each had subscriptions created/cancelled/terminated without any
  cross-contamination of tier, entitlement, or Stripe customer/subscription identifiers.
- `SubscriptionGuard` (`auth/guards/subscription.guard.ts`) is a separate, JWT-only mechanism
  gating the legacy `type === 'company'` path; it was not exercised by any test in this session
  and was left unmodified as out-of-scope for the individual-Pro Stripe lifecycle this task
  covers.

## Regressions

- `backend`: `tsc --noEmit` clean, `npm run build` clean, `billing-regression.ts` 25/25 passed.
- `frontend-next`: `tsc --noEmit` clean, `next build` clean (23 routes), eslint clean on changed
  files.
- `git diff --check` clean.
- Reverified profile edit persistence, authenticated `/pricing`, Free→Pro, and Manage Subscription
  all still function correctly (see Phase 6 table above — L2-L6 exercise all of these).
