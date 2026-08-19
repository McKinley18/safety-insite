# V5-C05 — Phase 0: Baseline and Protection

Date: 2026-08-16. Audit directory: `verification/hazlenz-v5-c05-flow-unification-2026-08-16/`.

## Repository state

- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` — matches expected HEAD. CONFIRMED.
- Working-tree counts (measured, not assumed): `git status --porcelain=v1` → **97 modified, 15 deleted,
  160 untracked** (the untracked count is 1 higher than the midpoint audit's 159 because this session's
  own `verification/hazlenz-v5-midpoint-audit-2026-08-16/` directory is itself untracked — expected and
  benign). Modified/deleted counts (97/15) are **identical** to the midpoint audit's measurements,
  confirming the working tree has not drifted between sessions.

## Protected / key file hashes (git blob hash of current working-tree content)

| File | Blob hash |
|---|---|
| `backend/src/safescope-v2/engine/deterministic-classifier.ts` (protected V4) | `c0dacf4145e9ffd35fc630617a1858e16b26c027` |
| `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service.ts` (C03) | `c7dbb56ae982954d03dfd0f7e01d936d5fb7cfd1` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` (protected V4) | `8872593bb3db55e1960e27571b0e4171c5a51498` |
| `backend/src/safescope-v2/safescope-v2.service.ts` (protected V4) | `eb5cc6dadc19244cbcf9d7bd8ee4ccb4291f27f7` |
| `backend/src/safescope-v2/safescope-v2.controller.ts` | `f8de31945e3670d9174a5166eb38f5d5b605f247` |
| `backend/src/inspection/inspection.service.ts` (C01) | `be32fdd2a8ef1dd66efb04d29609d22314c693e6` |
| `backend/src/inspection/entities/inspection-finding.entity.ts` (C01, `riskSnapshot` column) | `5a5c922aa29f877548eac04fa898a718071ea319` |
| `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` (C02) | `0200f08de4d3610eb934ca64356041e4aeccedb7` |
| `backend/src/safescope-v2/evidence/finalization-gate.ts` (C03) | `a86f61cb251ffe1d0619d67b2995591622491649` |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` (C02) | `952ca110b970e0e951cd4b4ee74e02fc9a9bb4fd` |
| `frontend-next/app/inspection-workspace/page.tsx` (canonical flow) | `e421a5af67df882423da601fa334f984480382ae` |
| `frontend-next/app/inspection/page.tsx` (legacy flow) | `675b3060c7bf8233f516e534c51286f5b278e88e` |
| `frontend-next/app/inspection-review/page.tsx` (legacy flow) | `b4c161294745f06f1b20c967fef47eff0008c3d0` |
| `frontend-next/app/command-center/page.tsx` (dashboard / primary CTA) | `b921cc9ac673c9df1f4ac3677f36f98ec4c7bc3a` |
| `frontend-next/app/inspections/page.tsx` (canonical entry picker) | `758813e4d3211ee1be3180accf9fa6520f7e0239` |

These hashes are recorded pre-edit and will be re-checked post-edit for the protected V4/C01/C02/C03
files, which C05 must not modify.

## C04 deletion state (confirmed unchanged)

`git status` still shows `D` (deleted) for `backend/scripts/validate-safescope-corrective-action-control-
map.ts`, `backend/scripts/validate-safescope-governance-report-adapter.ts`,
`backend/src/safescope-v2/corrective-action-control-map/*`,
`backend/src/safescope-v2/governance-report-adapter/*`.

## Current frontend route map (initial pass, pre-implementation)

| Route | Reachable from | Notes |
|---|---|---|
| `/command-center` | Bottom nav "Home" tab | Dashboard; hosts the "Start Inspection" CTA at `command-center/page.tsx:419` linking to `/inspection` |
| `/inspections` | Bottom nav "Inspect" tab | Canonical entry picker: "Quick Inspection" and "Full Inspection" cards, both routing to `/inspection-workspace` (`inspections/page.tsx:53,66`) via `router.push(workflow.route)` |
| `/inspection-workspace` | `/inspections` only | Canonical flow. Uses `@/lib/canonicalWorkflowApi` (server-backed persistence). Has C01's `riskSnapshot` consumption wired in. |
| `/inspection` | `command-center/page.tsx:419`, `inspection-cover/page.tsx:222` | Legacy flow. Uses `secureStorage`, `reportStorage`, `inspectionContext`, `offlineInspectionWiring` (local-first, offline-capable). Does **not** consume `riskSnapshot`. |
| `/inspection-review` | `/inspection/page.tsx:789` (`router.push`) | Legacy flow review step. Reads shared `safeScopeResult.risk`, not per-finding `riskSnapshot`. |
| `/inspection-cover` | `/inspection-review/page.tsx` (`goToCoverPage`), `AppShell.tsx` route grouping | Legacy flow's report cover-page config step; links back to `/inspection`. |
| `/inspection-quick` | **No inbound links found anywhere in `frontend-next/app` or `frontend-next/components`** | Third, independent, self-contained quick-capture implementation using `@/lib/inspection/quickReviewService` (a third HazLenz-adjacent service, distinct from both other flows) and its own localStorage-based state. Appears fully orphaned/unreachable from any navigation. Full classification deferred to `V5_C05_FLOW_CENSUS.md`. |

Full route/component/persistence census and legacy-vs-canonical capability diff: see
`V5_C05_FLOW_CENSUS.md` and `V5_C05_LEGACY_CANONICAL_DIFF.md`.

## Disposable database for browser verification

Per repository instructions, `DATABASE_URL` must be explicitly exported for every database-targeting
command in this session — `backend/.env` contains `DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/
safescope"`, and dotenv fills in that value whenever `DATABASE_URL` is absent (not merely `unset`) at
process start, per the mechanism documented in `verification/hazlenz-v5-c03-evidence-finalization-2026-
08-16/DB_SAFETY_PROOF.md`. This session follows the same explicit-export discipline established there.

- Disposable database name: `c05_flowunif_20260816`
- Host/port: `127.0.0.1:5432` (same local Postgres instance, different database name from `safescope`)
- Resolved-target proof (before any migration):
  ```
  RESOLVED_HOST: 127.0.0.1
  RESOLVED_PORT: 5432
  RESOLVED_DBNAME: c05_flowunif_20260816
  ```
- `safescope` migrations-table row count immediately before creating/migrating the disposable DB: **35**.
- Migrations applied to disposable DB only, via `DATABASE_URL` explicitly exported to the disposable
  connection string for the `npm run migration:run` command. Post-migration counts:
  - `c05_flowunif_20260816` migrations count: **35** (all migrations applied fresh, including
    `FindingScopedRiskSnapshot1800000005700`, confirming C01's schema is present).
  - `safescope` migrations count: **35** (unchanged — confirms `safescope` was not touched).

This disposable database will be used to run backend/frontend dev servers for real browser verification
in Phases 1, 7, 9, and 12. It will be torn down (dropped) at the end of C05 per the required-artifacts
teardown item.

## Constraints observed in Phase 0

- No commits made.
- No pushes.
- No production code modified yet.
- No frozen V4 artifacts modified.
- No destructive git operations run.
- `safescope` (the real development database) was not connected to for any mutation — only read for its
  migration count as a before/after integrity check.
