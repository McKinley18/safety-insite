# P1-02 — Phase 0: Baseline

Date: 2026-08-16. Audit directory: `verification/hazlenz-v5-p1-02-corrective-action-repair-2026-08-16/`.

## Repository state

- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` — matches expected HEAD. CONFIRMED.
- Working-tree counts: 161 untracked, 15 deleted, 100 modified — identical to the state left at the end
  of V5-C05 (this session's own prior work), confirming no drift and no unexpected changes since.

## Hashes (pre-edit)

| File | Blob hash |
|---|---|
| `backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts` (P1-02 target) | `b76b99484d232c851ab47f8d4bac59ad02d68e2e` |
| `backend/src/safescope-v2/engine/deterministic-classifier.ts` (protected V4) | `c0dacf4145e9ffd35fc630617a1858e16b26c027` |
| `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service.ts` (C03) | `c7dbb56ae982954d03dfd0f7e01d936d5fb7cfd1` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` (protected V4) | `8872593bb3db55e1960e27571b0e4171c5a51498` |
| `backend/src/safescope-v2/safescope-v2.service.ts` (protected V4) | `eb5cc6dadc19244cbcf9d7bd8ee4ccb4291f27f7` |
| `backend/src/safescope-v2/safescope-v2.controller.ts` | `f8de31945e3670d9174a5166eb38f5d5b605f247` |
| `backend/src/inspection/inspection.service.ts` (C01) | `be32fdd2a8ef1dd66efb04d29609d22314c693e6` |
| `backend/src/inspection/entities/inspection-finding.entity.ts` (C01) | `5a5c922aa29f877548eac04fa898a718071ea319` |
| `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` (C02) | `0200f08de4d3610eb934ca64356041e4aeccedb7` |
| `backend/src/safescope-v2/evidence/finalization-gate.ts` (C03) | `a86f61cb251ffe1d0619d67b2995591622491649` |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` (C02) | `952ca110b970e0e951cd4b4ee74e02fc9a9bb4fd` |
| `frontend-next/app/inspection-workspace/page.tsx` (canonical) | `e421a5af67df882423da601fa334f984480382ae` |
| `frontend-next/app/inspections/page.tsx` (canonical) | `758813e4d3211ee1be3180accf9fa6520f7e0239` |
| `frontend-next/app/command-center/page.tsx` (primary CTA) | `b921cc9ac673c9df1f4ac3677f36f98ec4c7bc3a` |
| `frontend-next/app/inspection/page.tsx` (C05-fixed legacy flow) | `b7a0b32d65085cf2a7eb29149c23c5862f40e84b` |
| `frontend-next/components/inspection/InspectionStepRenderer.tsx` (C05) | `1eb997847d192954ae0e7a0a5552e9cabe5963b2` |
| `frontend-next/components/inspection/steps/InspectionStepTwo.tsx` (C05) | `7d3c6032417a101fdfdaf808340bd7047b8e6f5c` |
| `frontend-next/components/inspection/SafeScopeInspectionStep.tsx` (C05) | `feae30e1634ee4f91def37bb212c4a3368594f76` |

All match the values recorded at the close of V5-C05 exactly — no drift.

## Authoritative benchmark — pre-edit run

Command: `cd backend && npx ts-node src/safescope-v2/tests/corrective-action-benchmark.ts`

**Result: 1 passed, 3 failed** — reproduces exactly as documented in
`verification/hazlenz-v5-midpoint-audit-2026-08-16/V5_MIDPOINT_CORRECTIVE_ACTION_TRIAGE.md` and
`verification/hazlenz-v5-c05-flow-unification-2026-08-16/V5_C05_REGRESSION.md`. Baseline reproduces;
implementation may proceed.

| # | Scenario | Result | Failing assertion(s) | Generated Immediate Action |
|---|---|---|---|---|
| 1 | Conveyor tail pulley / mechanical rotation | ❌ FAIL | tailored phrase 'Pause affected work and restrict access around'; references parsed equipment/components | "Stop access to the exposed moving interface and keep the affected equipment out of service until guarding and isolation are verified." |
| 2 | Damaged electrical cord / electrical energy | ❌ FAIL | tailored phrase 'Isolate the affected'; references parsed equipment/components | "Restrict access and remove the affected electrical equipment from service until qualified personnel assess the exposure." |
| 3 | Open platform edge / gravity | ❌ FAIL | tailored phrase 'Restrict access to the open platform edge' (equipment-reference assertion actually PASSES here) | "Stop exposed work and restrict access to the unprotected edge or elevated access point." |
| 4 | Chemical transfer / chemical exposure | ✅ PASS | — | "Confirm eye/face splash exposure controls for the chemical transfer task and review PPE/barrier controls before continuing the task." |

Notably, scenario 3's "references parsed equipment/components" assertion already **passes** — only the
exact tailored-phrase assertion fails there. Scenarios 1 and 2 fail both assertions. This distinction is
carried into Phase 1's root-cause trace.

No database was used for this phase (benchmark is a pure in-memory TypeScript script with no `DataSource`/
`AppModule` dependency, confirmed by inspection before running).
