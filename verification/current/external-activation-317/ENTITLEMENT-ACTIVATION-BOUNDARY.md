# §317 — THE ENTITLEMENT ACTIVATION BOUNDARY

The product owner has **not** decided whether Beta participants will be free, comped or paid.
§317 therefore answers all three without making that decision. Every statement below was executed
against a database built by migrations alone.

---

## 1. WHAT HAPPENS TO A NEW USER WITH NO SUBSCRIPTION

Nothing has to happen to them. They register, sign in and use the product immediately.

Measured on the fresh participant (`GET /billing/status`):

```
tier                 free
status               none
tierSource           none
accessSource         free
hasProAccess         false
entitlements.quickCapture     true
entitlements.fullSafeScope    false
```

**What Free genuinely delivers, executed end to end:** site creation, inspection creation,
observation capture, photo evidence upload, saved history, calendar tasks, account management,
sign-out and sign-in. The Free journey completed with **zero HTTP errors and zero console errors**.

**Where Free stops, and how:** `POST /hazlenz/classify` answers `402 PAID_SUBSCRIPTION_REQUIRED`
and the workspace renders a plan notice — *"Observation saved. HazLenz AI analysis is a Pro
feature."* — followed by a statement that the observation, the photo evidence and the site details
are saved and unchanged. It is written as a plan boundary rather than as a fault, which is the §284
(S-15) decision, and it holds on a genuinely new account.

---

## 2. WHAT EXACT OPERATOR ACTION GRANTS COMPED ACCESS TODAY

**There are two paths and they are not equivalent.**

### Path A — the promo code. Configuration only, no database access, and it works today.

Set `EMPLOYER_PRO_PROMO_CODES` in the server environment. A participant who enters a listed code at
registration receives a bounded `entitlement_grants` row: source `pilot`, tier `pro`, status
`active`, `issuedByUserId` NULL, and an `endsAt` of `PROMOTIONAL_GRANT_DAYS` days — default **7**,
clamped at **30**, with the clamp reported rather than silent.

Executed at §317. The comped participant resolved to:

```
tier                 pro          tierSource   grant
accessSource         pilot        status       none
entitlementExpiresAt 2026-09-25T12:32:52.290Z   (7 days)
stripeSubscriptionId null
```

and was offered and completed the full Pro workflow, including the deterministic HazLenz review,
the standard citation, risk scoring, the corrective action and the finished report.

**Every value is server-derived.** The registering caller supplies a code and nothing else: not the
duration, not the tier, not the account, not whether a grant is created at all. There is no
parameter through which a request could reach any of those.

### Path B — the admin grant route. Needs a platform administrator, and there is no way to become one without a direct database write.

`POST /admin/entitlement-grants` and `DELETE /admin/entitlement-grants/:id` both require
`platformRole === 'platform_admin'`. `platformRole` is derived in exactly one way, in three places
that agree: `user.role === 'platform_admin' ? 'platform_admin' : null`.

**Nothing in the application ever sets `user.role` to `'platform_admin'`.** Not registration, not
the profile route — §307's security suite asserts that both reject an attempt to — not an admin UI,
because none exists. The only occurrence in the repository is a test fixture that issues
`UPDATE "user" SET role='platform_admin' WHERE id=$1` directly against the database.

Verified by execution: an ordinary participant calling either route receives
`403 "Platform administrator access is required."`

---

## 3. WHETHER COMPED ACCESS CAN BE BOUNDED AND REVOKED

**Bounded: yes, by construction.** Every grant carries `endsAt`. A promotional grant is 7 days by
default and cannot exceed 30. An operationally issued grant cannot exceed 90. An expired grant stops
conferring access because `getBillingStatus` selects only grants with `startsAt <= now < endsAt`,
and §302 made `tierSource: 'grant'` explicit so a grant-derived tier is re-verified against the
grant on every gated request rather than resting on a token that has not expired yet.

**Revoked: not without the platform-admin bootstrap above.** Emptying `EMPLOYER_PRO_PROMO_CODES`
stops NEW grants and downgrades nobody — the §302 header says so in as many words. The only
revocation route is `DELETE /admin/entitlement-grants/:id`, which requires the platform admin that
only a direct database write can create.

**So the honest statement of today's position is this:** comped access can be granted by
configuration alone, and it expires on its own, but it cannot be *withdrawn early* without either a
direct database mutation or a platform administrator who was themselves created by one.

---

## 4. WHAT PAID ACTIVATION REQUIRES

Production already holds `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRO_PRICE_ID`
(§307 secret scan, by exact value across 9,046 tracked files). So the paid path is configured in
production and is NOT configured in this verification environment, and the two therefore present
differently — a difference this document is careful not to blur.

- Public self-registration **never** grants a paid plan. The backend always creates the account on
  Free; the Stripe webhook is what promotes it. `/register` says so: *"Every account is created on
  Free. Choosing Pro takes you to secure checkout after you sign in."*
- Choosing Pro at registration carries the intent through sign-in as `/login?plan=pro`, which lands
  the participant on `/upgrade`.
- `POST /billing/create-checkout-session` requires `tier: "pro"` and a configured Stripe client;
  without one it answers `503 "Stripe billing is not configured on this server."`
- The portal requires a `stripeCustomerId`, which only exists after a real purchase.

**No real charge was made and no checkout session was created. Spend: $0.00.**

---

## 5. WHETHER ANY PATH REQUIRES DIRECT DATABASE MUTATION

| Path | Direct DB mutation required? |
|---|---|
| Free participant, from nothing to a finished report | **No.** Proven twice on migration-only databases. |
| Comped via promo code | **No.** One server environment variable. |
| Comped via the admin grant route | **Yes**, once, to create the first platform administrator. |
| Revoking a comped grant early | **Yes**, transitively — it needs the platform administrator above. |
| Paid via Stripe | **No.** |

§317 states that direct DB mutation is unacceptable as the intended Beta activation workflow. It is
not required as one: **Path A is configuration-only and is sufficient to comp an external Beta
participant.** What direct mutation is still required for is the *operator's* ability to revoke
early, and that is a gap in operator tooling rather than in the activation path. Recorded as
**EN-4**.

---

## 6. WHAT §317 DELIBERATELY DID NOT DECIDE

Whether Beta is free, comped or paid; what the promotional duration should be; whether to build a
platform-admin bootstrap or an operator console; and whether early revocation is needed during
Beta at all. Each is a product decision, and all four are now answerable from measured facts rather
than from assumptions.
