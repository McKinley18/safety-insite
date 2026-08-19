# Corrective Action Entitlement Contract

Date: 2026-08-16

## Authoritative source

`backend/src/billing/plan-entitlements.ts` is the canonical definition of billing
tiers and feature entitlements. `backend/src/auth/entitlements/plan-entitlements.ts`
(auth-layer) re-exports the same billing definitions and does not redefine them.
`frontend-next/lib/planEntitlements.ts` maintains an independent but currently
consistent mirror of the same tier/feature matrix (used for client-side UI gating
only — never authoritative for access control).

## Feature key: `correctiveActionAssignments`

Defined in `backend/src/billing/plan-entitlements.ts`:

- `freeEntitlements.correctiveActionAssignments = false` (line 65)
- `proEntitlements` inherits `false` from `freeEntitlements` (not overridden — Pro
  does NOT include it, lines 82-92)
- `expertEntitlements.correctiveActionAssignments = true` (line 102)

Conclusion: **corrective-action creation/assignment (`correctiveActionAssignments`)
is an Expert-tier-only capability.** Free and Pro are both excluded; only Expert
(and any active `entitlement_grants` row with `tier = 'expert'`, per
`backend/src/auth/entitlements/entitlement.service.ts`) may create a corrective
action.

This is corroborated by `backend/src/auth/entitlements/plan-entitlements.ts`:
`PROTECTED_AREA_ENTITLEMENTS.team_actions = "correctiveActionAssignments"`, and
`requiredPlanForArea("team_actions") === "Expert"` (lines 61-76).

Do not confuse this with the separate `correctiveActionRecommendations` feature
key, which is Pro-tier (`proEntitlements.correctiveActionRecommendations = true`,
line 90) and gates HazLenz's *AI-generated suggestion text* for corrective
actions — a distinct, unrelated capability from actually creating/persisting/
assigning a corrective-action record via `POST /actions`.

## Enforcement pattern used elsewhere (reference)

- `backend/src/standards/standards.controller.ts`: controller-level
  `@UseGuards(JwtGuard, EntitlementGuard)` + `@RequireEntitlement('fullSafeScope')`.
- `backend/src/safescope-v2/safescope-v2.controller.ts` `classify` route (lines
  236-240): method-level `@UseGuards(JwtGuard, EntitlementGuard, RolesGuard)` +
  `@RequireEntitlement('fullSafeScope')`.
- `EntitlementGuard` (`backend/src/auth/entitlements/entitlement.guard.ts`) checks
  the JWT's effective plan tier first, then falls back to
  `EntitlementService.hasFeature()` (an active `entitlement_grants` row), and on
  denial throws `HttpException({ message: 'A paid subscription is required for
  this feature.', code: 'PAID_SUBSCRIPTION_REQUIRED', entitlement }, 402)` after
  writing a `security_audit_events` row with `action: 'entitlement_denied'`.
  `EntitlementsModule` is `@Global()`, so `EntitlementGuard`/`EntitlementService`
  are available in every module without an explicit import.

This is the exact pattern applied to corrective-action creation (see the
verification report for the diff).

## Pricing-copy discrepancy found

`frontend-next/components/pricing/PricingContent.tsx`, Free tier "Included" list
(line 41): **"Manual corrective action entry"** is advertised as a Free-tier
feature.

This directly conflicts with the code-level entitlement contract, which requires
Expert tier for `correctiveActionAssignments` (Free is explicitly `false`, and so
is Pro). Per instructions, the entitlement system's definition is authoritative
and was used for the backend/frontend gating fix; the pricing copy was **not**
changed as part of this remediation (out of scope — it is marketing content, not
an access-control decision, and changing it either raises Free's actual access or
requires a product decision about what "Included" should say). This should be
flagged to product/marketing as a separate follow-up: either (a) Free's "Manual
corrective action entry" line should be removed/reworded (e.g., moved to a
"manually note actions in the report text" framing that doesn't imply a
persisted, assignable corrective-action record), or (b) product should decide to
intentionally lower `correctiveActionAssignments` to Free/Pro, which is a
pricing/business decision outside engineering judgment.
