# Phase 16 — Full Regression

## Full V4 228-case matrix (final, post-implementation)

Re-ran the paced 228-case live matrix (same method as `P1_POST_P0_228_BASELINE.md`) after all four P1 fixes were implemented.

**Result: 228/228** — Positive 76/76, Negative 76/76, Ambiguity 38/38, Safe/control 38/38. `Failing rows: []`. Consistent with the requirement that standards-presentation/citation changes must not alter recognition semantics — confirmed: zero degradation.

## Protected/tracked file hash verification (post-implementation)

All hashes recomputed via `git hash-object` and compared against `P1_BASELINE.md`'s recorded pre-P1 values:

| Surface | Result |
|---|---|
| V4 recognition core (`safescope-v2.service.ts`, `multi-hazard-decomposition.service.ts`, `deterministic-classifier.ts`, taxonomy JSON) | Byte-identical to the P1 baseline (which already reflects the P0-03 fix). No P1 change touched any of these files. |
| V5-C01 (`inspection-finding.entity.ts`, `inspection.service.ts`, `finding-risk.mapping.ts`) | Byte-identical, unchanged. |
| V5-C02 (5 evidence-foundation files) | Byte-identical, unchanged. |
| V5-C03 (`finalization-gate.ts`) | Byte-identical, unchanged. |
| V5-C04 (dead/placeholder cleanup) | All 6 deletion-set files remain absent, as before. |
| V5-C05 (primary inspection flow, 4 files) | Byte-identical, unchanged. |
| P1-02 (`corrective-action-brain/corrective-action.service.ts`) | Byte-identical, unchanged. |

None of this phase's edits (`backend/src/auth/entitlements/entitlement.service.ts`; `frontend-next/lib/inspection/standardDisplay.ts`; `frontend-next/components/inspection/SafeScopeStandardsSection.tsx`; `frontend-next/lib/cloudReports.ts`; `frontend-next/lib/auth.ts`) intersect any protected surface above.

## PRA-002 (finding review/completion gate)

`backend/src/inspection/inspection.service.ts` (PRA-002's fix location) is byte-identical to baseline — confirmed above under V5-C01. Live-exercised in this phase (not merely hash-checked): transitioned a real inspection `draft → in_review` (`201`, clean), then attempted `in_review → completed` with un-reviewed auto-generated multi-hazard candidate findings still pending — correctly rejected with a clean, typed `400 {"message":"Every current finding requires a completed human review before finalization.","error":"Bad Request","statusCode":400}`, not a crash. This is the completion gate functioning as designed, not a defect.

## P0 closure scenario re-runs

- **P0-01 (PDF export)**: fix location `frontend-next/lib/inspection/reportExportService.ts`, not touched by any P1 edit — unchanged.
- **P0-02 (finding identity / standards-panel isolation)**: fix location `frontend-next/app/inspection-workspace/page.tsx`, not touched by any P1 edit — unchanged. Additionally, this phase's Phase 14 work (`P1_IDENTITY_COVERAGE.md`) independently re-exercised and extended the underlying identity invariant (three-finding middle-first, duplicate-label disambiguation) against the live canonical persistence API — both passed with zero crossover, reinforcing rather than merely re-confirming P0-02.
- **P0-03 (corrective-action generator false-positive)**: fix location `backend/src/safescope-v2/safescope-v2.service.ts`, confirmed byte-identical above — unchanged. The 228/228 V4 result also directly re-exercises this file's classification-adjacent behavior at full scale (the file's `buildEnhancedGeneratedActions` runs downstream of every classify call in the matrix).

## Authorization regression

No authorization/guard logic was weakened. The one backend change (`entitlement.service.ts`) added a stricter input-format check before a database query — it can only ever make entitlement checks *more* conservative (reject more inputs, never grant access it wouldn't have granted before), and was proven not to affect real-UUID users (228/228 matrix ran fully authenticated throughout; real-user classify access confirmed `201` before and after — see `P1_AUTH_VERIFICATION.md`).

## Performance non-regression

See `P1_IMPLEMENTATION_REPORT.md` for the comparison against the recorded baseline (p50 51.9ms / p95 147.5ms) — none of this phase's changes touch the classify hot path (`safescope-v2.service.ts` untouched), so no latency-relevant code moved; measured to confirm rather than assumed.
