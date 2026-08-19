# InSite P1 Remediation — Phase 0 Baseline

Date: 2026-08-16 · Branch: `main` · HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (matches expected HEAD given in the task brief).

## Repository state

- `git rev-parse HEAD`: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Working tree carries the same substantial pre-existing uncommitted state documented in the P0 and Polish-audit baselines (100+ modified tracked files, 15 deleted tracked files, 160+ untracked paths — the in-progress "canonical" architecture migration). This is pre-existing legitimate work, not introduced by this session. No `git add`, `commit`, `stash`, `reset`, `checkout --`, or `restore` is run against it. It is preserved untouched except for the narrow P1 fixes this phase makes.

## Protected artifact hash verification (working-tree, `git hash-object`)

### Protected V4 recognition core

| File | Working-tree hash (git hash-object) | Note |
|---|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `de49db20179deadc90b657bf81de03fd66aa0502` | **Differs from the pre-P0 baseline (`eb5cc6da...`) by design** — this is the P0-03 fix (`buildEnhancedGeneratedActions`), applied and left uncommitted per the P0 implementation report. This is the correct current value entering P1. |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `8872593bb3db55e1960e27571b0e4171c5a51498` | Byte-identical to pre-P0 baseline. |
| `backend/src/safescope-v2/engine/deterministic-classifier.ts` | `c0dacf4145e9ffd35fc630617a1858e16b26c027` | Byte-identical to pre-P0 baseline. |
| `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` | `a4cde300f1778aa72b02789f2c0df984eb7fd7e2` | Byte-identical to pre-P0 baseline. |

Protected V4 artifact SHA-256 (unchanged, re-verified):
- `FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json`: `8c38d05198fc3bacc88eda436dddea6608680034b972587a11c217744bc12d97`
- `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json`: `2a47473a3c3ef82e7ff95be22850b6c1a96e1f3ae3e15346997654370b978604`
- `score_family_matrix_v4_authoritative.mjs`: `60eb6adc54f43b022b3fdd7f91f63053ff3931ab6b5107b54cc823e641a446b3`

### V5-C01 / C02 / C03 — byte-identical to prior baseline (unchanged)

`inspection-finding.entity.ts` `5a5c922aa29f877548eac04fa898a718071ea319`; `inspection.service.ts` `be32fdd2a8ef1dd66efb04d29609d22314c693e6`; `finding-risk.mapping.ts` `c083969b6e8b866f7894abad6768b9a268e84c8e`; `shared-evidence-facts.ts` `0200f08de4d3610eb934ca64356041e4aeccedb7`; `evidence-foundation.ts` `952ca110b970e0e951cd4b4ee74e02fc9a9bb4fd`; `evidence-sufficiency.service.ts` `c7dbb56ae982954d03dfd0f7e01d936d5fb7cfd1`; `evidence-sufficiency.types.ts` `59c765bba4d4894579a1b39d1d7d73b82ac7b99e`; `intelligence-orchestrator.service.ts` `774f6ec88603a7479bbe3423ca4efb58be8d7155`; `finalization-gate.ts` `a86f61cb251ffe1d0619d67b2995591622491649`.

### C04 (dead/placeholder cleanup) — deletion state confirmed still in effect

All 6 files remain absent from the working tree.

### C05 (primary inspection flow) — byte-identical to prior baseline

`inspection/page.tsx` `b7a0b32d65085cf2a7eb29149c23c5862f40e84b`; `InspectionStepRenderer.tsx` `1eb997847d192954ae0e7a0a5552e9cabe5963b2`; `InspectionStepTwo.tsx` `7d3c6032417a101fdfdaf808340bd7047b8e6f5c`; `SafeScopeInspectionStep.tsx` `feae30e1634ee4f91def37bb212c4a3368594f76`.

### P1-02 corrective-action-brain repair (from P0-03) — confirmed present

`corrective-action.service.ts` `32f057a670499f59e1de78e4b299b5805f6059e1` — matches the P0-recorded "repaired" hash.

**Conclusion:** all protected/tracked surfaces are exactly where the P0 closure left them. The only intentional delta from the last full-baseline snapshot is `safescope-v2.service.ts` (the documented P0-03 change).

## Build verification (pre-edit)

- Backend build (`npm run build` → `tsc`): **PASS**, zero errors.
- Frontend build (`npm run build` → `next build`): **PASS**, zero errors, all 26 routes compiled/prerendered.
- `git diff --check`: **PASS**, exit 0, no whitespace errors.

## Database safety

- `backend/.env` `DATABASE_URL` resolves to `postgresql://mckinley@127.0.0.1:5432/safescope` (the original development database). `DATABASE_URL` takes precedence over discrete `DB_*` vars per this repo's `dotenv/config` load order — confirmed unchanged from prior audits.
- **Disposable database created for this phase:** `test_p1_20260816` (local Postgres, role `mckinley`; matches `backend/scripts/grant-test-entitlement.ts`'s required `/^(phase[0-9]+|test)[a-z0-9_-]*$/i` allowlist so the test-entitlement-grant script can run against it under `NODE_ENV=test`). An initial `safescope_p1_20260816` database was created, found not to match that allowlist, and was dropped/replaced before any grant or migration work depended on it — no data was ever written to it beyond the schema/seed used for the (later superseded) bypass-mode reproduction run.
- All live verification in this phase runs with `DATABASE_URL` explicitly exported to `postgresql://mckinley@127.0.0.1:5432/test_p1_20260816` — never the `.env` default.
- The original `safescope` database is not read, migrated, seeded, or mutated in this phase.
- Teardown: `dropdb test_p1_20260816` at the end of this phase, recorded as executed in the final report.

## Environment

- Node v20.20.2, npm 10.8.2, Postgres accepting connections on 127.0.0.1:5432 (Homebrew local instance).
- Backend run for live verification on port 4000 against `test_p1_20260816`.
