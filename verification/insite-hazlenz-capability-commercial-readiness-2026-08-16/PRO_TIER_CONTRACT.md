# Pro Tier Contract — Verified 2026-08-16

## Important caveat established during verification

The provided "Pro" test account (`verify-pro-20260816@example.com`) does **not** resolve to the
`pro` billing tier at runtime. Its login response shows `subscriptionTier: "expert"`,
`planCode: "expert"`, `hasExpertAccess: true`, and `billingEntitlements` with **every** flag
`true` (`exportLevel: "advanced"`). Tracing `backend/src/billing/billing.service.ts`
(`getBillingStatus`, lines ~92–120) shows this happens because the account's active
`EntitlementGrant` row has `tier` resolving to `"expert"`, not `"pro"` — the grant-precedence
logic (`activeGrant?.tier === 'expert' ? 'expert' : ...`) then yields an Expert-tier token
regardless of the account's nominal subscription. Whether the fixture was seeded with the wrong
grant tier or is intentionally Expert was not established (would require inspecting the
disposable DB's `entitlement_grant` row, which was out of scope for a read-mostly HTTP
verification pass).

**Practical effect: every live test against this account exercises Expert-tier access, not the
$6.99 Pro plan.** The two sections below separate (1) what was *curl-verified* using this
account, from (2) what pure Pro-tier ($6.99, `tier: "pro"`) entitlements are per
`backend/src/billing/plan-entitlements.ts`, established by static code reading only.

## 1. What was live-verified with the test account (actually Expert-tier)

| Capability | Verified result |
|---|---|
| `POST /safescope-v2/classify` | `201 Created` — full classification response with hazard family, controls, citations. |
| `POST /standards/match` | `201 Created` (empty array for the sample text — endpoint reachable, not blocked). |
| `POST /inspections/:id/reports` (cloud report generation) | Guard passed — response was `404 Not Found` ("Inspection not found") for a placeholder ID, i.e. rejected by business logic, not by the entitlement guard. Confirms `cloudReports` entitlement is satisfied. |
| `GET /inspection-reports` | `200 []`. |
| Legacy PDF (`GET /legacy/pdf/:id`) | Entitlement passed; route itself returns `410 Gone` (retired code path) for all tiers that pass the guard. |
| `GET /dashboard/corporate-summary` | Guard passed (no `402`); route then threw `500 Internal Server Error` — a pre-existing service defect unrelated to entitlement enforcement, identical in nature to the `500`s seen on other authenticated dashboard/regulatory routes for the Free account. |
| `POST /admin/entitlement-grants` | `403 Forbidden` — blocked by `platformRole !== 'platform_admin'`, independent of billing tier. Confirms billing tier alone (even Expert) does not grant platform-admin rights. |

## 2. Pure Pro tier ($6.99, `tier: "pro"`) — established from code only, not independently curl-verified

From `backend/src/billing/plan-entitlements.ts`, `proEntitlements` sets these `true` (all else
inherited `false` from Free, or explicitly `false`):

**Entitled:** `fullSafeScope`, `analytics`, `guidedInspection`, `hazlenzFullReview`,
`standardsReasoning`, `professionalReports`, `correctiveActionRecommendations`
(`exportLevel: "professional"`), plus everything Free has (`quickCapture`, `hazlenzPreview`,
`evidenceGapPrompts`).

**Not entitled (same as Free):** `cloudReports`, `teamMembers`, `supervisorValidation`,
`auditTrail`, `advancedReview`, `inspectionAssignments`, `correctiveActionAssignments`,
`workspaceFiltering`, `companyAnalytics`, `sharedReports`, `deeperExplainability`,
`advancedReportReview`, `advancedStandardsSupport`, `priorityAiFeatures`.

Because `cloudReports` is **Expert-exclusive**, a pure Pro subscriber would, per code:

- Get `402 PAID_SUBSCRIPTION_REQUIRED` on `POST /inspections/:id/reports` (cloud report
  generation), `POST /legacy/pdf/:id`, `control-verifications`, `transparency`,
  `action-engine`, `audit-session`, `notifications`, `reports/executive`, and
  `legacy/reports` — every route decorated with `@RequireEntitlement('cloudReports')`.
- Still be able to run full HazLenz AI classification (`fullSafeScope`), guided inspections,
  standards matching, and corporate analytics (`analytics`).

**This is a marketing/entitlement inconsistency worth flagging, not a security gap**: the
public pricing page (`frontend-next/components/pricing/PricingContent.tsx`) advertises
"Professional inspection reports" and "Professional Workflow" under the **Pro** ($6.99) tier,
and the `professionalReports` entitlement flag is indeed `true` for Pro — but `professionalReports`
is never referenced by any backend guard (`grep -rn "professionalReports" backend/src` matches
only its definition in `plan-entitlements.ts`, never a `@RequireEntitlement`). The endpoint that
actually persists/downloads a report is gated by the *different* key `cloudReports`, which is
Expert-only. A pure Pro subscriber who reads the pricing page and expects to generate/download a
report would hit `402` on that endpoint today. This was established by static code reading
(unambiguous — `professionalReports` has zero enforcement sites, `cloudReports` gates the
generation endpoint and is absent from `proEntitlements`), not by testing a genuine `tier: "pro"`
account, since no such account was available in this verification environment.

## Summary of confidence levels

- **High confidence (curl-verified):** Expert-tier (what the "Pro" test account actually is)
  gets full HazLenz classification, standards matching, and passes the `cloudReports` guard for
  report generation.
- **High confidence (code-verified, not curl-tested):** a genuine Pro-tier account would pass
  `fullSafeScope`/`analytics`/`guidedInspection` gates but fail every `cloudReports`-gated route,
  including report generation/export — contradicting the "Professional inspection reports"
  pricing copy for that tier.
