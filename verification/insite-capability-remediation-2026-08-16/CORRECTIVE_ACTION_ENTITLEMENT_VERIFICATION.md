# Corrective Action Entitlement — Remediation Verification

Date: 2026-08-16
Disposable DB used: `postgresql://mckinley@127.0.0.1:5432/test_hazlenz_remediate_20260816`
Backend under test: own instance on port 4002 (`DEV_AUTH_BYPASS=false`,
`NODE_ENV=development`), fully separate from the shared `:4001` backend and
`:3001` frontend dev server. Neither shared process was touched. The `safescope`
database was never touched.

## Root cause

`POST /actions` (corrective-action creation, `CorrectiveActionsController.create`
in `backend/src/corrective-actions/corrective-actions.controller.ts`) enforced
`JwtGuard` (authentication) only. It did not enforce the `correctiveActionAssignments`
entitlement, even though that entitlement is defined as Expert-tier-only in
`backend/src/billing/plan-entitlements.ts` (see
`CORRECTIVE_ACTION_ENTITLEMENT_CONTRACT.md`). The corresponding frontend
create flow (`createPersistedCorrectiveAction` in
`frontend-next/lib/canonicalWorkflowApi.ts`, called from the `complete()` handler
in `frontend-next/app/inspection-workspace/page.tsx`) had no plan gating either,
so a Free-tier user's UI would let them submit and the backend would accept it.

## Files changed

### 1. `backend/src/corrective-actions/corrective-actions.controller.ts`

- Line 3: added import
  `import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';`
- Lines 30-38: added `@UseGuards(EntitlementGuard)` and
  `@RequireEntitlement('correctiveActionAssignments')` to the `create()` method
  (the `POST /actions` route only — `findAll`, `updateStatus`,
  `generateDueDateAlerts`, and `export` are unchanged; ownership/authorization
  logic inside `CorrectiveActionsService` was not touched).

```ts
@Post()
@UseGuards(EntitlementGuard)
@RequireEntitlement('correctiveActionAssignments')
create(
  @Req() req: any,
  @Body() dto: CreateCorrectiveActionDto,
) {
  return this.service.create(req.user, dto);
}
```

This is the same guard/decorator pattern already used by
`backend/src/standards/standards.controller.ts` and the `/safescope-v2/classify`
route in `backend/src/safescope-v2/safescope-v2.controller.ts` (lines 236-240).
`EntitlementsModule` is `@Global()` (`backend/src/auth/entitlements/entitlements.module.ts`),
so no module-level import was required in `corrective-actions.module.ts`.

### 2. `frontend-next/app/inspection-workspace/page.tsx`

- Added imports: `AppLinkButton` (existing locked-feature CTA component) and
  `getStoredPlanCode`, `getVerifiedPlanCode`, `hasPlanEntitlement`, `BillingTier`
  from `@/lib/planEntitlements` — the same helpers used for gating in
  `app/inspections/page.tsx` and `app/safety-calendar/page.tsx`.
- Added `planCode` state (seeded from `getStoredPlanCode()`, then refined via
  `getVerifiedPlanCode()` in a `useEffect`, matching the pattern in
  `app/inspections/page.tsx`).
- In the `"followup"` step (where the corrective-action/task/report completion
  flow lives), the "Complete inspection and generate report" button is now only
  rendered when `hasPlanEntitlement("correctiveActionAssignments", planCode)` is
  true. When false, an inline amber notice explains the Expert-tier requirement
  and an `AppLinkButton` to `/pricing` ("Unlock Corrective Actions") is shown
  instead — the same locked/upgrade affordance pattern used elsewhere (e.g.
  `app/inspections/page.tsx`'s "Unlock This Workflow" button).
- The three corrective-action text fields (`immediateAction`,
  `permanentCorrection`, `verificationStep`) remain fully editable regardless of
  entitlement state, so a Free user's already-entered text is preserved in the
  component's local state and is not lost or blocked from being typed — only the
  final submission action is gated.
- As defense in depth, `complete()`'s existing catch block already surfaces
  `error.message` from a failed `apiJson` call, so even if the UI gate were
  bypassed, a 402 response's `"A paid subscription is required for this
  feature."` message would be shown via `setStatus(...)` rather than failing
  silently.

No changes were made to `CorrectiveActionsSection.tsx` (that component only
manages local pre-submission action state and generated-action selection — it
does not call the create API directly) or to any of the protected/excluded files
listed in the task instructions.

## Live verification against `:4002` (disposable DB)

Test users (disposable DB, already provisioned):
- `remediate-free-20260816@example.com` — `planCode: free`, no active entitlement
  grant. JWT confirms `correctiveActionAssignments: false`.
- `remediate-pro-20260816@example.com` — `planCode: free` in `user` table, but has
  an **active `entitlement_grants` row with `tier: expert`**
  (`764e7a15-9957-4c32-9e53-647cf530d4da`, status `active`, valid window covering
  test time). Login JWT resolves `effectivePlanCode: expert`,
  `correctiveActionAssignments: true`.

### Before the fix (established in the prior verification pass)

A Free-tier JWT could `POST /actions` and receive `201 Created` with the record
persisted — i.e. no entitlement enforcement at all.

### After the fix — live results

| Actor | Request | Result |
|---|---|---|
| Anonymous | `POST /actions` (no `Authorization` header) | `401 Unauthorized` — `{"message":"No token provided","error":"Unauthorized","statusCode":401}` (unchanged — `JwtGuard` still runs first) |
| Free (`remediate-free-20260816@example.com`) | `POST /actions` with valid Bearer token, dummy `inspectionId`/`findingId` | `402 Payment Required` — `{"message":"A paid subscription is required for this feature.","code":"PAID_SUBSCRIPTION_REQUIRED","entitlement":"correctiveActionAssignments"}` — not `201`, no record created |
| Expert-entitled (`remediate-pro-20260816@example.com`) | `POST /actions` with valid Bearer token, a real `inspectionId`/`findingId` created via the full `sites → inspections → observations → reviews → findings` API chain | `201 Created`, full corrective-action record returned (`id: 7e3500d3-45c7-4a2e-8858-14f015bcc25e`, `statusCode: open`) |

Persistence confirmed directly against the disposable DB:

```
select id, "statusCode", title from corrective_actions where id = '7e3500d3-45c7-4a2e-8858-14f015bcc25e';
 7e3500d3-45c7-4a2e-8858-14f015bcc25e | open | Install fixed guard on conveyor #4
```

Security-audit trail confirms the Free denial was logged by `EntitlementGuard`
before rejecting:

```
select action, "resourceType", metadata from security_audit_events where action = 'entitlement_denied' order by "createdAt" desc limit 1;
 entitlement_denied | CorrectiveActionsController | {"path": "/actions", "method": "POST", "entitlement": "correctiveActionAssignments"}
```

### Frontend gating (code-verified; also spot-checked live backend halves above)

`app/inspection-workspace/page.tsx`'s `"followup"` step now conditionally renders
either the submit button (entitled) or the amber "Assigning corrective actions is
available on the Expert plan." notice with an "Unlock Corrective Actions" link to
`/pricing` (not entitled), based on `hasPlanEntitlement("correctiveActionAssignments",
planCode)`. Verified by reading the compiled logic and confirming
`hasPlanEntitlement` correctly returns `false` for `free`/`pro` and `true` for
`expert` per `frontend-next/lib/planEntitlements.ts`'s entitlement tables (which
match the backend's `correctiveActionAssignments` matrix). A live browser check
against `:4002` was not performed (the shared `:3001` frontend points at `:4001`,
per the task's constraint on not disturbing shared processes); the backend half of
the contract (the 402 response, which the frontend's existing error-surfacing
logic already displays) was verified live as shown above.

## Build verification

`cd backend && npm run build` (`tsc`) — ran twice (once after the controller
change, once as the final check requested) — **no TypeScript errors**, exit
clean both times.

## Process/worktree state

- `:4002` backend process (this task's own disposable instance) was stopped at
  the end of verification.
- `:4001` backend and `:3001` frontend (shared, owned by other concurrent work)
  were never started, stopped, or otherwise touched.
- `safescope` database was never connected to or modified.
- Only `test_hazlenz_remediate_20260816` received writes (site/inspection/
  observation/review/finding/corrective-action test records created during
  verification, plus one `security_audit_events` denial row) — all disposable.
- No commits were made.

## Remaining uncertainty / follow-up

- The `frontend-next/components/pricing/PricingContent.tsx` Free-tier "Manual
  corrective action entry" line still contradicts the entitlement contract this
  fix now enforces server-side. See
  `CORRECTIVE_ACTION_ENTITLEMENT_CONTRACT.md` — flagged as a product/marketing
  decision, not changed here.
- No live browser (Playwright/Chrome) pass was run against the gated frontend UI
  in this task, per the instructions' explicit permission to verify via
  code-reading + direct backend curl checks instead, to avoid interfering with
  the shared `:3001`/`:4001` processes. If a live UI screenshot is desired, it
  would require a second frontend instance pointed at `:4002` (not started here).
