# Free Tier Contract — Verified 2026-08-16

Method: traced enforcement in `backend/src/billing/plan-entitlements.ts` (source of truth for
entitlements), `backend/src/auth/entitlements/entitlement.guard.ts` /
`entitlement.service.ts` (runtime enforcement), and every controller using
`@RequireEntitlement(...)`, then confirmed with live `curl` requests against the disposable
backend at `http://127.0.0.1:4001` using `verify-free-20260816@example.com`
(`Verify!Pass1234`). Login response for this user: `planCode: "free"`,
`billingEntitlements` all `false` except `quickCapture`, `hazlenzPreview`,
`evidenceGapPrompts` (`exportLevel: "basic"`). No active `EntitlementGrant` row applies to
this account.

## What Free users can actually do (verified)

| Capability | Evidence |
|---|---|
| Register, log in, hold a session (JWT) | `POST /auth/login` returns 200 with a valid free-tier token. |
| Quick Capture inspection workflow | `quickCapture: true` in entitlements; frontend `app/inspections/page.tsx` allows the "Quick Inspection" workflow tile for `planCode === "free"`. |
| HazLenz **preview**-level hazard review | `hazlenzPreview: true`. The full classify pipeline is NOT reachable (see below) — preview-tier behavior is UI/limited-summary only, not the `/safescope-v2/classify` endpoint. |
| Evidence-gap prompts | `evidenceGapPrompts: true`. |
| List/view corrective actions | `GET /actions` → `200 {"data":[],...}` with Free token. |
| **Create and self-assign corrective actions** (full CRUD, due dates, assignment) | `POST /actions` with a valid body → `201 Created` using the Free token (verified live — see Gaps section). No entitlement guard exists on `corrective-actions.controller.ts` at all. |
| Export corrective actions (`GET /actions/export`) | Same controller, `JwtGuard` only — no entitlement check. |
| List/view generated reports (if any exist) | `GET /inspection-reports` → `200 []` with Free token (list/get are not entitlement-gated; only *generation* is). |
| Basic regulatory lookups (`/regulatory/parts`, `/regulatory/sections`, `/regulatory/section`) | `RegulatoryController` is `JwtGuard`-only, no entitlement gate. (Live test returned `500 Internal Server Error` for both Free and Pro tokens — this is a pre-existing service defect unrelated to plan enforcement; the guard layer passed for both tiers identically.) |
| `GET /dashboard/executive-summary` | Controller has no `@RequireEntitlement` on this route (guard passes for any authenticated user). Live test returned `500` for both Free and Pro — same pre-existing service defect, not a permission block. |

## What Free users are explicitly blocked from (verified via 402)

| Capability | Verified result |
|---|---|
| Full HazLenz classification (`POST /safescope-v2/classify`) | `402 Payment Required`, `code: "PAID_SUBSCRIPTION_REQUIRED"`, `entitlement: "fullSafeScope"`. |
| Standards matching (`POST /standards/match`) | `402`, `entitlement: "fullSafeScope"`. |
| Guided (full) inspection workflow | `guidedInspection: false`; frontend disables the "Full Inspection" tile; backend would 402 on `fullSafeScope`-gated calls the guided flow depends on. |
| Cloud report generation (`POST /inspections/:id/reports`) | `402`, `entitlement: "cloudReports"`. |
| Legacy PDF export | `402`, `entitlement: "cloudReports"` (also permanently `410 Gone` regardless of tier — legacy PDF generation is retired code). |
| Corporate/company analytics dashboard (`GET /dashboard/corporate-summary`) | `402`, `entitlement: "analytics"`. |
| Analytics module, audit trail, knowledge library, taxonomy, supervisor validation, transparency, control-verifications, action-engine, audit-session, notifications, organization/team-member management | All gated by `analytics`, `auditTrail`, `supervisorValidation`, `teamMembers`, or `cloudReports` — all `false` on the Free plan. Not independently curl-tested beyond the representative endpoints above; enforcement mechanism (same `EntitlementGuard`) is identical, so behavior is inferred with high confidence from code, not separately observed. |

## Admin/platform actions

`POST /admin/entitlement-grants` requires `user.platformRole === 'platform_admin'`, independent
of billing tier. Verified: Free token → `403 Forbidden` ("Platform administrator access is
required."). Anonymous → `401`.

## Anonymous (no token)

Every tested endpoint rejects anonymous requests with `401 Unauthorized` ("No token
provided"). `DEV_AUTH_BYPASS` was confirmed **off** on this instance — an anonymous request to
a protected route was rejected rather than silently assigned a synthetic dev identity, which is
the behavior `backend/src/auth/guards/jwt.guard.ts` produces only when
`DEV_AUTH_BYPASS !== 'true'`.

## Note on the entitlement model vs. enforcement

The plan model defines `correctiveActionAssignments` as an Expert-tier-only entitlement
(`PROTECTED_AREA_ENTITLEMENTS.team_actions`), but the corrective-actions controller and service
enforce no entitlement at all — Free users have full production access to this capability today.
See `SUBSCRIPTION_PERMISSION_MATRIX.md` for detail.
