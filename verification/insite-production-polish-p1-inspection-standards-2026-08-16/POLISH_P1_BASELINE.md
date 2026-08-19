# InSite Production Polish Phase 1 — Phase 0 Baseline

Date: 2026-08-16 · Branch: `main` · HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (matches expected HEAD given in the task brief).

## Repository state

- `git rev-parse HEAD`: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Working tree carries the same substantial pre-existing uncommitted state documented in `insite-p0-remediation-2026-08-16` and `insite-p1-remediation-2026-08-16` (100+ modified tracked files, ~15 deleted tracked files, 160+ untracked paths — the in-progress "canonical" architecture migration). This is pre-existing legitimate work, not introduced by this session. No `git add`, `commit`, `stash`, `reset`, `checkout --`, or `restore` will be run against it. It is preserved untouched except for this phase's narrow, targeted polish fixes.
- Last completed phase per task brief: `INSITE_P1_REMEDIATION_CLOSED` (P0: 0, P1: 0, HazLenz V4: 228/228, both builds PASS, `git diff --check` PASS, HEAD unchanged).

## Protected / relevant artifact hashes (working-tree, `git hash-object`)

All values below are **byte-identical** to the values recorded at the close of `insite-p1-remediation-2026-08-16` (see `P1_BASELINE.md` / `P1_REGRESSION.md` there) — confirmed by direct re-hash immediately before this phase's first edit.

### Protected V4 recognition core
| File | Hash |
|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `de49db20179deadc90b657bf81de03fd66aa0502` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `8872593bb3db55e1960e27571b0e4171c5a51498` |
| `backend/src/safescope-v2/engine/deterministic-classifier.ts` | `c0dacf4145e9ffd35fc630617a1858e16b26c027` |
| `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` | `a4cde300f1778aa72b02789f2c0df984eb7fd7e2` |

### V5-C01 / C02 / C03 (byte-identical to prior baseline)
`inspection.entity.ts` `9319a9319b23dd6a8ff27fbec773b8ec1e392245`; `inspection.service.ts` `be32fdd2a8ef1dd66efb04d29609d22314c693e6`; `finding-risk.mapping.ts` `c083969b6e8b866f7894abad6768b9a268e84c8e`; `shared-evidence-facts.ts` `0200f08de4d3610eb934ca64356041e4aeccedb7`; `evidence-foundation.ts` `952ca110b970e0e951cd4b4ee74e02fc9a9bb4fd`; `evidence-sufficiency.service.ts` `c7dbb56ae982954d03dfd0f7e01d936d5fb7cfd1`; `evidence-sufficiency.types.ts` `59c765bba4d4894579a1b39d1d7d73b82ac7b99e`; `intelligence-orchestrator.service.ts` `774f6ec88603a7479bbe3423ca4efb58be8d7155`; `finalization-gate.ts` `a86f61cb251ffe1d0619d67b2995591622491649`.

### C05 (primary inspection flow, byte-identical to prior baseline)
`inspection/page.tsx` `b7a0b32d65085cf2a7eb29149c23c5862f40e84b`; `InspectionStepRenderer.tsx` `1eb997847d192954ae0e7a0a5552e9cabe5963b2`; `InspectionStepTwo.tsx` `7d3c6032417a101fdfdaf808340bd7047b8e6f5c`; `SafeScopeInspectionStep.tsx` `feae30e1634ee4f91def37bb212c4a3368594f76`.

### P1-02 corrective-action-brain repair (confirmed present, unchanged)
`corrective-action.service.ts` `32f057a670499f59e1de78e4b299b5805f6059e1`.

### P1 standards-integrity fix surfaces (this phase's most likely edit targets — recorded so post-phase diffs are attributable)
`frontend-next/lib/inspection/standardDisplay.ts` `d7384e5731030e76e44ab58c9fc732bdab69fe00`; `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` `d54872ccbb149d8b8dfaa2417a7e5033fc60e699`; `frontend-next/app/inspection-workspace/page.tsx` `90733070cb3d18112aea3e2dc1cbb4829389853b`.

**Conclusion:** all protected/tracked surfaces are exactly where the P1 closure left them. No drift since `insite-p1-remediation-2026-08-16` closed.

## Build verification (pre-edit)

- Backend build (`npm run build` → `tsc`): **PASS**, zero errors.
- Frontend build (`npm run build` → `next build`, Next.js 16.2.12/Turbopack): **PASS**, zero errors, all 26 routes compiled/prerendered.
- `git diff --check`: **PASS**, exit 0, no whitespace errors.

## Current inspection-route map (for Phase 1 scope selection)

| Route | System | Notes |
|---|---|---|
| `/inspection` → `/inspection-review` | Legacy, client-side | Reached from dashboard "Start Inspection" CTA (`command-center/page.tsx`) and `/inspection-cover`. Report state client-side; PDF export fixed in P0-01 but still a separate surface from the canonical flow. |
| `/inspections` → "Full Inspection" → `/inspection-workspace` | Canonical, server-saved | 5 explicit stages: Capture → Review → Risk → Action → Complete. Real persistence, real finding state machine, standards citation fix (P1-2/P1-3) already live here. |
| `/inspections` → "Quick Inspection" → `/inspection-quick` | Free-tier lightweight | Distinct, intentionally minimal path — not a duplicate of the above two. |

This matches `INSPECTION_SIMPLIFICATION.md` / `FIRST_TIME_USER_JOURNEY.md` / `INFORMATION_ARCHITECTURE_AUDIT.md`'s shared top finding: the dashboard's primary CTA leads to the weaker of the two full-inspection systems.

## Database safety

`backend/.env` `DATABASE_URL` resolves to the original `safescope` development database; per repo convention `DATABASE_URL` takes precedence over discrete `DB_*` vars. Any live/browser verification in this phase will use an explicitly exported `DATABASE_URL` pointing at a newly created disposable database (`test_polish1_20260816` or similar, matching the `/^(phase[0-9]+|test)[a-z0-9_-]*$/i` allowlist used by `grant-test-entitlement.ts`), never the `.env` default. The original `safescope` database will not be read, migrated, seeded, or mutated.

## No commit / no push

No commit has been made. HEAD remains `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` at the close of this baseline step.
