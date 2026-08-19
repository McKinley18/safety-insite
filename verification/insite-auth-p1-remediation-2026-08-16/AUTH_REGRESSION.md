# AUTH-P1 — Regression

## Scope-of-change argument

This phase's only production edit is `backend/src/auth/guards/jwt.guard.ts` (confirmed via `git diff --stat -- backend/src`, cross-checked against the session's own edit history — no other file was written). None of the protected surfaces below live in that file, so each is preserved by construction; the live checks below additionally confirm behavior, not just file identity.

| Protected surface | Status | Evidence |
|---|---|---|
| HazLenz V4 authoritative matrix (228 cases) | **228/228** (76/76 positive, 76/76 negative, 38/38 ambiguity, 38/38 safe) | Re-run live against the fixed backend + disposable DB, real login (not bypass), same frozen manifest/scorer used by the prior P1 phase. `P1_228_PACED_RESULT.json`, `run_228_paced.log`. |
| V5-C01 (finding-scoped risk) / C02 (shared evidence facts) / C03 (evidence finalization) | Untouched | File-level: `inspection.entity.ts`, `inspection.service.ts`, `finding-risk.mapping.ts`, `evidence-sufficiency.*`, `finalization-gate.ts` not in this session's diff. |
| V5-C04 (dead/placeholder cleanup) | Untouched | No files re-added/removed by this phase. |
| V5-C05 (primary inspection flow) | Untouched | Not in this session's diff; additionally live-exercised incidentally via `/inspections` create/read in `AUTH_TWO_USER_AUTHORIZATION.md`, which succeeded. |
| P1-02 (corrective-action benchmark) | Untouched | `corrective-actions.*` files not in this session's diff; `/actions` route confirmed reachable and non-crashing in all auth modes (`AUTH_MATRIX.md`). |
| P0 remediation (3 fixes) | Preserved | Not in this session's diff. |
| Prior P1 remediation (`entitlement.service.ts:20` uuid guard) | Preserved, unmodified | File not touched; still present and still correct (confirmed by reading current file content during Phase 1 mapping). |
| Production Polish P1 (inspection/standards changes) | Preserved | Not in this session's diff. |
| PRA-002 (finding review/completion) | Preserved | Not in this session's diff. |

## Additional regression scripts run

- `npx ts-node src/billing/billing-regression.ts` (against disposable DB): **24/24 passed**.
- `npx ts-node scripts/smoke-corrective-actions-organization-scope.ts`: pre-existing compile failure, unrelated to this phase (`CreateCorrectiveActionDto` now requires `assignedToUserId`/`assignedToName` that the script's fixture predates — this mismatch already existed in the working tree before this session started; not introduced by this fix). Not run; substituted with a live `/actions` HTTP check instead (`AUTH_MATRIX.md`), which passed.
- `npx ts-node scripts/smoke-entitlement-guards.ts`: pre-existing compile failure, unrelated (`ENTITLEMENT_KEY` no longer exported; script predates the current `EntitlementGuard` constructor signature). Not run; the entitlement path was instead exercised live end-to-end (`AUTH_MATRIX.md` classify 402 case, and `EntitlementGuard`/`EntitlementService` code read directly in Phase 1).

## Build / static

- Backend `npm run build` (`tsc`): **PASS**, before and after the fix.
- Frontend `npm run build` (Next.js, full static generation, 26/26 pages): **PASS**.
- `git diff --check`: **PASS** (no whitespace/conflict-marker issues).

## Performance non-regression

The fix is a pure control-flow reorder (moving an existing `if (authHeader)` check earlier in the same function) plus a string-literal change (`1` → a fixed UUID string) — no new I/O, no new computation, no change to the classify/reasoning pipeline itself. The 228-case matrix ran to completion at its expected ~2.2s/request pace with no elevated failure/timeout rate, consistent with no regression. A dedicated microbenchmark isolating warmed classify latency was not re-run in this phase (the reported ~61–74ms baseline concerns the deterministic classifier itself, which this phase's change does not touch); no plausible mechanism exists for this guard-level change to affect it.
