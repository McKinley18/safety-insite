# InSite P0 Remediation — Phase 0 Baseline

Date: 2026-08-16 · Branch: `main` · HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (matches expected HEAD given in the task brief).

## Repository state

- `git rev-parse HEAD`: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- `git rev-list --count HEAD`: 620
- Working tree carries the same substantial uncommitted state documented in the prior audit's `POLISH_EFFICIENCY_BASELINE.md` (100+ modified tracked files, 15 deleted tracked files, 160+ untracked paths including the in-progress "canonical" architecture migration: `backend/src/config/`, `backend/src/storage/`, `backend/src/tasks/`, `backend/src/reports/canonical-reports.*`, `frontend-next/app/inspection-workspace/`, 20+ new migrations, entitlements module, organization membership, sites controller/service, etc.). This is pre-existing legitimate in-progress work, not introduced by this session. No `git add`, `commit`, `stash`, `reset`, `checkout --`, or `restore` will be run against it. It will be preserved untouched except for the narrow P0 fixes this phase makes.

## Protected artifact hash verification (re-verified against the 2026-08-16 Production Polish audit's recorded baseline)

### Protected V4 recognition core — byte-identical, no drift

| File | git blob (SHA-1) | SHA-256 | Match |
|---|---|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `eb5cc6dadc19244cbcf9d7bd8ee4ccb4291f27f7` | `f076a568396a76e810191fd3b82b40acb342bd6781ee072ef4254e33ad5c986a` | ✅ |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `8872593bb3db55e1960e27571b0e4171c5a51498` | `6e48b3c0fb0f38d651cbc747eb056b78a4aa413b44b2769ed16075febe1828a8` | ✅ |
| `backend/src/safescope-v2/engine/deterministic-classifier.ts` | `c0dacf4145e9ffd35fc630617a1858e16b26c027` | (not separately recorded) | ✅ (blob match) |
| `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` | `a4cde300f1778aa72b02789f2c0df984eb7fd7e2` | `1d75b2a517d359d59860f00a17868ac2116821a1540df4dea43bbd9da3359470` | ✅ (SHA-256 match; blob hash not previously recorded but is the correct current value) |
| `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json` | — | `8c38d05198fc3bacc88eda436dddea6608680034b972587a11c217744bc12d97` | ✅ |
| `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` | — | `2a47473a3c3ef82e7ff95be22850b6c1a96e1f3ae3e15346997654370b978604` | ✅ |
| `verification/hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs` | — | `60eb6adc54f43b022b3fdd7f91f63053ff3931ab6b5107b54cc823e641a446b3` | ✅ |

### V5-C01 (Finding-Scoped Risk) — byte-identical, no drift

| File | git blob (SHA-1) |
|---|---|
| `backend/src/inspection/entities/inspection-finding.entity.ts` | `5a5c922aa29f877548eac04fa898a718071ea319` |
| `backend/src/inspection/inspection.service.ts` | `be32fdd2a8ef1dd66efb04d29609d22314c693e6` |
| `backend/src/inspection/finding-risk.mapping.ts` | `c083969b6e8b866f7894abad6768b9a268e84c8e` |

### V5-C02 (Shared Evidence-Fact Foundation) — reference hashes, unchanged from prior audit

| File | git blob (SHA-1) |
|---|---|
| `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` | `0200f08de4d3610eb934ca64356041e4aeccedb7` |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` | `952ca110b970e0e951cd4b4ee74e02fc9a9bb4fd` |
| `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service.ts` | `c7dbb56ae982954d03dfd0f7e01d936d5fb7cfd1` |
| `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.types.ts` | `59c765bba4d4894579a1b39d1d7d73b82ac7b99e` |
| `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts` | `774f6ec88603a7479bbe3423ca4efb58be8d7155` |

### V5-C03 (Evidence Sufficiency / Finalization) — reference hash, unchanged

| File | git blob (SHA-1) |
|---|---|
| `backend/src/safescope-v2/evidence/finalization-gate.ts` | `a86f61cb251ffe1d0619d67b2995591622491649` |

### C04 (Dead/Placeholder Intelligence Cleanup) — deletion state confirmed still in effect

All 6 files remain ABSENT from the working tree: `corrective-action-control-map.{service,types}.ts`, `governance-report-adapter.{service,types}.ts`, `validate-safescope-corrective-action-control-map.ts`, `validate-safescope-governance-report-adapter.ts`.

### C05 (Primary inspection flow) — byte-identical, no drift

| File | git blob (SHA-1) |
|---|---|
| `frontend-next/app/inspection/page.tsx` | `b7a0b32d65085cf2a7eb29149c23c5862f40e84b` |
| `frontend-next/components/inspection/InspectionStepRenderer.tsx` | `1eb997847d192954ae0e7a0a5552e9cabe5963b2` |
| `frontend-next/components/inspection/steps/InspectionStepTwo.tsx` | `7d3c6032417a101fdfdaf808340bd7047b8e6f5c` |
| `frontend-next/components/inspection/SafeScopeInspectionStep.tsx` | `feae30e1634ee4f91def37bb212c4a3368594f76` |

### P1-02 (Corrective-action narrative regression repair) — repaired state confirmed present

| File | git blob (SHA-1) | Match |
|---|---|---|
| `backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts` | `32f057a670499f59e1de78e4b299b5805f6059e1` | ✅ matches recorded "repaired" hash — this is the file this phase expects to touch for P0-03; its pre-edit hash is recorded here for the diff report. |

**Conclusion: all protected/tracked surfaces are byte-identical to the last-recorded (2026-08-16 Production Polish Audit) baseline. Zero drift entering this remediation phase.**

## Files this phase expects to modify (baseline hashes, pre-edit)

To be filled in per-P0 as root cause is established (Phases 2/5/8). Placeholder — do not assume; each P0 section's trace phase records the actual pre-edit hash of any file proven to need a change, immediately before editing it.

## Build verification (pre-edit)

- Backend build: to be run in Phase 0 completion.
- Frontend build: to be run in Phase 0 completion.
- `git diff --check`: to be run in Phase 0 completion.

## Database safety

- `backend/.env` `DATABASE_URL` resolves to `postgresql://mckinley@127.0.0.1:5432/safescope` (the original development database) — same as the prior audit found. `DATABASE_URL` takes precedence over discrete `DB_*` vars per this repo's `dotenv/config` load order.
- **Disposable database created for this phase:** `safescope_p0_20260816` (`createdb`, local Postgres, role `mckinley`, confirmed present via `psql -l`, distinct from `safescope`).
- The backend will be run for all live verification in this phase with `DATABASE_URL` explicitly exported to `postgresql://mckinley@127.0.0.1:5432/safescope_p0_20260816` — never the `.env` default.
- The original `safescope` database will only be read (if at all), never migrated, seeded, or mutated in this phase.
- Teardown: `dropdb safescope_p0_20260816` at the end of this phase, recorded as executed in the final report.

## Environment

- Node v20.20.2, npm 10.8.2, Postgres accepting connections on 127.0.0.1:5432 (Homebrew local instance).
