# Subscription Permission Matrix — Verified 2026-08-16

Backend under test: disposable instance at `http://127.0.0.1:4001` (never production, never
`safescope`). Users: `verify-free-20260816@example.com` (`planCode: "free"`, no grant) and
`verify-pro-20260816@example.com` (JWT actually resolves to `planCode: "expert"` via an active
`EntitlementGrant` — see `PRO_TIER_CONTRACT.md` caveat; treat the "Pro (live)" column below as
**Expert-tier** results). `DEV_AUTH_BYPASS` confirmed **off** (anonymous requests to protected
routes returned `401`, not a synthetic dev identity).

Entitlement source of truth: `backend/src/billing/plan-entitlements.ts`. Enforcement mechanism:
`backend/src/auth/entitlements/entitlement.guard.ts` (`EntitlementGuard` +
`@RequireEntitlement(key)`), checked against the JWT's plan tier OR a live active
`EntitlementGrant` row (`EntitlementService.hasFeature`).

| Route / action | Anonymous (expected / actual) | Free (expected / actual) | "Pro" test acct — actually Expert (expected / actual) |
|---|---|---|---|
| `POST /safescope-v2/classify` (`fullSafeScope`) | 401 / **401** | 402 / **402** `PAID_SUBSCRIPTION_REQUIRED` | 201 / **201** (full classification) |
| `POST /standards/match` (`fullSafeScope`) | 401 / **401** | 402 / **402** | 201 / **201** |
| `POST /inspections/:id/reports` — canonical report generation (`cloudReports`) | 401 / **401** | 402 / **402** | guard-pass / **404** ("Inspection not found" — guard passed, business 404) |
| `GET /inspection-reports` — list (no entitlement gate, JwtGuard only) | 401 / **401** | 200 / **200** `[]` | 200 / **200** `[]` |
| `GET /legacy/pdf/:id` (`cloudReports`; route body is retired) | 401 / **401** | 402 / **402** | guard-pass then 410 / **410 Gone** (retired code, not a tier effect) |
| `GET /actions` — list corrective actions (no entitlement gate) | 401 / **401** | 200 / **200** | 200 / **200** |
| `POST /actions` — create + assign corrective action (no entitlement gate) | 401 / **401** | 201 / **201** (verified — Free user created and self-assigned an action) | 201 / **201** (not separately re-tested; same unguarded controller) |
| `GET /actions/export` (no entitlement gate) | 401 / **401** | 200 / **200** (not separately curl-tested; same controller, same guard set) | 200 / **200** (inferred) |
| `GET /regulatory/parts`, `/sections`, `/section` (JwtGuard only, no entitlement) | 401 / **401** | 200 / **500** (pre-existing service defect, not a permission block — guard passed) | 200 / **500** (same defect) |
| `POST /regulatory/sync` (`SUPER_ADMIN`/`PLATFORM_ADMIN` role, not billing tier) | 401 / not tested (role-gated, out of scope for tier matrix) | 403 (expected, role-gated) | 403 (expected, role-gated) |
| `GET /dashboard/executive-summary` (no entitlement gate) | 401 / **401** | 200 / **500** (pre-existing service defect) | 200 / **500** (same defect) |
| `GET /dashboard/corporate-summary` (`analytics`) | 401 / **401** | 402 / **402** `entitlement: "analytics"` | guard-pass then 500 / **500** (pre-existing service defect, guard confirmed passed since no 402 was returned) |
| `POST /admin/entitlement-grants` (`platformRole === 'platform_admin'`, independent of billing tier) | 401 / **401** | 403 / **403** "Platform administrator access is required." | 403 / **403** (same — billing tier does not confer platform-admin rights) |
| `DELETE /admin/entitlement-grants/:id` | 401 (expected, not tested — destructive, out of scope) | 403 (expected) | 403 (expected) |

### Not curl-tested, established by code only (same `EntitlementGuard` mechanism)

These routes carry `@RequireEntitlement(...)` decorators identical in mechanism to the rows
above, so behavior is inferred with high confidence rather than independently observed:
`organizations` (`teamMembers`), `upload/logo` (`teamMembers`), `control-verifications`
(`cloudReports`), `transparency` (`cloudReports`), `action-engine` (`cloudReports`),
`audit-session` (`cloudReports`), `notifications` (`cloudReports`), `reports/executive`
(`cloudReports`), `safescope`, `match-engine`, `classifications`, `risk`, `intelligence`,
`applicable-standards`, `safescope-v2/snapshots` (all `fullSafeScope`), `safescope-knowledge`,
`audit`, `knowledge`, `taxonomy`, `safescope-source-intelligence` (all `auditTrail`,
Expert-only), `safescope-v2/validation` (`supervisorValidation`, Expert-only), `analytics`
module (`analytics`, Pro+).

## Frontend enforcement (what the UI shows)

Traced via `grep` across `frontend-next/app`, `frontend-next/components`, `frontend-next/lib`
for `isPro`, `planCode`, `entitlement`, `upgrade`, `locked`.

- `frontend-next/lib/planEntitlements.ts` mirrors the backend's entitlement table exactly
  (same keys, same true/false per tier) and is the single source the UI reads from
  (`getStoredPlanCode()` / `getVerifiedPlanCode()`, the latter calling `GET /billing/me` to get
  a server-verified tier rather than trusting only the locally cached JWT).
- `app/inspections/page.tsx` — soft-blocks the "Full Inspection" (guided) workflow tile for
  non-`guidedInspection` plans: `if (!hasPlanEntitlement(workflow.entitlement, planCode)) return;`
  in the click handler, and the tile is rendered with an `allowed` flag that presumably disables
  or upsells it. This is a UI-only soft block — clicking does nothing rather than hard-erroring.
- `app/safety-calendar/page.tsx` — `canUseCompanyCalendar = hasPlanEntitlement("inspectionAssignments", planCode)` (Expert-only), gates the company-wide calendar view.
- `app/inspection-review/page.tsx` — selects a report *package* (`getReportPackageForPlan`) by
  plan code, i.e. changes what export options are shown rather than hard-blocking.
- `components/pricing/PricingContent.tsx` — marketing copy only, drives `/register?plan=` and
  `/profile?upgrade=` links; not an enforcement point.
- `lib/planEntitlements.ts` explicitly documents itself as **"UI visibility only. Backend
  entitlement guards remain the source of truth for protected API access,"** which matches what
  was found: every frontend check that maps to a backend `@RequireEntitlement` gate is backed by
  a matching `402` server-side.

## Frontend-vs-backend enforcement gaps found

**One confirmed gap: corrective action creation/assignment.**

- The entitlement model defines `correctiveActionAssignments` as an Expert-tier-only capability
  (`PROTECTED_AREA_ENTITLEMENTS.team_actions` → `requiredPlanForArea("team_actions") === "Expert"`
  in both `backend/src/auth/entitlements/plan-entitlements.ts` and the frontend mirror
  `lib/planEntitlements.ts`).
- **Backend reality:** `backend/src/corrective-actions/corrective-actions.controller.ts` is
  decorated with `@UseGuards(JwtGuard)` only — no `EntitlementGuard`, no
  `@RequireEntitlement` anywhere in the controller or `corrective-actions.service.ts` (confirmed
  by grep — zero matches for `entitlement`/`planCode`/`Entitlement` in that service). Every
  authenticated user, regardless of tier, can list, create, assign, close, and export corrective
  actions.
- **Live proof:** using the Free account's token, `POST /actions` with a valid body and
  `assignedToUserId` set to the Free user's own ID returned `201 Created`, producing a real,
  persisted, self-assigned corrective action (`id: e29464e7-546e-4106-a169-3047212622e9`,
  `displayId: ACT-D7353738`) in the disposable verification database.
- **Frontend reality:** `components/inspection/CorrectiveActionsSection.tsx` (the UI that
  renders/creates corrective actions) has **zero** plan/entitlement checks (`grep` for
  `planCode|entitlement|isPro|Expert|lock|upgrade` returns nothing), and
  `correctiveActionAssignments`/`canAccessProtectedArea`/`team_actions` are referenced nowhere
  outside their own definitions in `lib/planEntitlements.ts`. So this is not a "UI says locked,
  API accepts anyway" discrepancy — the UI never attempted to lock it either. Net effect: an
  entitlement key exists in the commercial model as an Expert-only feature, but the feature is
  fully open to every tier, in both layers, today.

**No other gap found.** For every other tested action, the frontend's soft-block (or absence of
one) was consistent with what the backend actually enforces: routes the frontend disables
(guided inspection, company calendar) correspond to routes the backend returns `402` for on the
Free account, and routes the frontend leaves open (corrective actions) are the one place the
backend also leaves open — i.e. frontend and backend agree, just not with the commercial plan
definition on file.

**Separately (not a security gap, a product/marketing inconsistency):** see
`PRO_TIER_CONTRACT.md` — the `professionalReports` entitlement (true for Pro, advertised on the
pricing page under the Pro tier) is never enforced by any backend guard; the endpoint that
actually generates a downloadable report is gated by `cloudReports`, which is Expert-exclusive.
A genuine $6.99 Pro subscriber (not tested live — no such account was available; established from
`plan-entitlements.ts`) would be sold "Professional inspection reports" but receive `402` when
actually calling `POST /inspections/:id/reports`.

## Unrelated defects observed during verification (not permission issues)

`GET /regulatory/parts` (and likely `/sections`, `/section`) and `GET /dashboard/executive-summary`
returned `500 Internal Server Error` for both Free and Expert-tier tokens alike — the entitlement
guard passed cleanly in both cases (no `401`/`402`), so this is a downstream service defect in
this disposable environment/dataset, not an access-control finding. Flagged for awareness; not
investigated further as it was out of scope for this permission-matrix task.
