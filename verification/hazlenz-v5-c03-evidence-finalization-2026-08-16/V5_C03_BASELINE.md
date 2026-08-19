# V5-C03 Baseline

Date: 2026-08-16 · Repo HEAD (unchanged throughout, no commits made): `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`

## Repository state at start

Branch `main`, ~268 pre-existing uncommitted-work status lines (unchanged from the C01/C02 sessions' preserved state — auth, billing, corrective-actions, inspection, reports, safescope-v2, safescope-knowledge, frontend-next, and others). Preserved untouched throughout this session; no destructive git operation was run.

## Database safety

See `DB_SAFETY_PROOF.md` for the full positive/negative proof. Summary: disposable database `phase133_c03_20260816_084114` created and verified via explicit `DATABASE_URL` export (never `unset`) before every migration/schema/test command; `safescope`'s `migrations` row count (35) confirmed identical before and after this session.

## Protected hashes (recorded before any C03 edit)

| File | SHA-256 | Matches C02 close? |
|---|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `f076a568...986a` | Yes |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `6e48b3c0...28a8` | Yes |
| `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` | `1d75b2a5...9470` | Yes |
| `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json` | `8c38d051...c12d97` | Yes |
| `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` | `2a47473a...78604` | Yes |
| `verification/hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs` | `60eb6adc...446b3` | Yes |
| `backend/src/inspection/entities/inspection-finding.entity.ts` (C01) | `6852fb0e...df34b` | Yes |
| `backend/src/inspection/inspection.service.ts` (C01) | `1f080b2d...272f87` | Yes |
| `backend/src/inspection/finding-risk.mapping.ts` (C01) | `da5821af...b28c9` | Yes |
| `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` (C02) | `c357b11e...291edb` | Yes |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` (C02) | `b4a241a8...065c12` | Yes |
| `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service.ts` (C02) | `bb83b3b7...1eea67f` | Yes |
| `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.types.ts` (C02) | `d237bf16...683633` | Yes |
| `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts` (C02) | `6fe4afb9...803fbcd3` | Yes |

All 6 V4-protected + 3 V5-C01 hashes reconfirmed byte-identical after implementation (see `V5_C03_VERIFICATION.md`). The 5 C02 files above are not protected but are flagged "do not regress" — `evidence-foundation.ts` and `shared-evidence-facts.ts` were **not edited** by C03 at all (confirmed identical hashes below); `evidence-sufficiency-core/*` and `intelligence-orchestrator.service.ts` were **not edited by C03 either** (C03 only added a new file and edited the controller — see implementation report).

## C04 deletions confirmed still absent

`backend/src/safescope-v2/corrective-action-control-map/`, `backend/src/safescope-v2/governance-report-adapter/` — both absent.

## Baseline test results (disposable backend/DB, before any C03 code edit)

| Check | Result |
|---|---|
| `test:canonical-workflow` | PASS |
| `test:finding-scoped-reviews` | PASS |
| `test:persisted-decomposition-findings` | PASS |
| `test:risk-policy` | PASS |
| `test:evidence-foundation` | PASS |
| `test:guided-finding-response` | PASS |
| `test:hazlenz-evidence-boundary` | PASS |
| Backend build (`tsc --noEmit`) | PASS |

## The proven pre-C03 disconnect (required before editing — see `c03_live_harness.ts` output and `V5_C03_SUFFICIENCY_REASON_CLASSIFICATION.md`)

Live `POST /safescope-v2/classify` calls, pre-edit:

| Fixture | `EvidenceSufficiencyService` verdict (direct probe) | Live `resultStage` / `mayFinalize` |
|---|---|---|
| "There is a problem with the equipment." | `insufficient` (0.29, bottom tier) | `final` / `true` |
| "Something unsafe was noted near the equipment area." | `insufficient` (0.29, bottom tier) | `final` / `true` |

Both present a genuinely vague, no-hazard-signal observation as `final`/`mayFinalize: true` despite `EvidenceSufficiencyService`'s own bottom-tier verdict — the exact disconnect this phase closes. Contrast: "The machine guard is missing and the operator can reach the rotating shaft while the conveyor is running." scored only `weak` (0.39, *not* `insufficient`) yet correctly finalizes both before and after — proving the disconnect fix must not treat every `sufficiencyLevel` below `sufficient` as blocking (see `V5_C03_SUFFICIENCY_REASON_CLASSIFICATION.md` for the full calibration analysis).

## Baseline scenario categories established (per task's Phase 1 list)

All 12 categories (sufficient, insufficient, clarification-required, optional enrichment, ambiguity, negation, historical, planned future, safe/controlled, failed control, multi-hazard, finding-scoped review/completion) were exercised live pre-edit via `c03_live_harness.ts` and the existing regression suite; full before/after table in `V5_C03_DECISION_MATRIX.md`.
