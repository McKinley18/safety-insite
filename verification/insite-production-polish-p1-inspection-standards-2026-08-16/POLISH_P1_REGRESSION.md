# Polish P1 — Regression Verification

## HazLenz V4 (full authoritative 228-case matrix)

**228/228 PASS**, measured live against the disposable backend (`test_polish1_20260816`), same authoritative scorer/manifest used by all prior phases (`hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs` + `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json`, both byte-identical, unmodified). Raw run script and full per-case result: `run_228_paced.mjs` / `P1_228_PACED_RESULT.json`.

**Self-correction, reported honestly**: this session's first aggregation of the 228-case run incorrectly checked a `.pass` boolean field that does not exist on the scorer's output (the real field is `outcome === 'PASS'`), producing a false `0/228` readout. This was caught by inspecting the raw per-case JSON before accepting the number, root-caused to the aggregation script (not the classifier), and the summary was recomputed correctly from the same already-captured data — no cases were re-run. `P1_228_PACED_RESULT.json` contains the corrected summary.

## Protected file hashes (`git hash-object`, before vs. after this phase's edits)

All identical, before and after every edit made this phase:

- `safescope-v2.service.ts`, `multi-hazard-decomposition.service.ts`, `deterministic-classifier.ts`, `hazard-taxonomy-coverage-map.v1.json` (V4 core)
- `inspection.entity.ts`, `inspection.service.ts`, `finding-risk.mapping.ts`, `shared-evidence-facts.ts`, `evidence-foundation.ts`, `evidence-sufficiency.service.ts`, `evidence-sufficiency.types.ts`, `intelligence-orchestrator.service.ts`, `finalization-gate.ts` (V5-C01/C02/C03)
- `inspection/page.tsx`, `InspectionStepRenderer.tsx`, `InspectionStepTwo.tsx`, `SafeScopeInspectionStep.tsx` (C05)
- `corrective-action.service.ts` (P1-02 repair)

No production edit this phase touched any protected V4/V5-C01–C05/P1-02 surface.

## V5-C01 (finding-scoped risk) / V5-C02 (shared evidence facts) live re-exercise

`scripts/test-finding-scoped-reviews.ts` run fresh against the disposable backend: `{"passed":true, ..., "finalStatus":"completed"}`. Two independent findings from one observation, two independent finalized reviews, no cross-finding contamination.

## V5-C03 (evidence finalization) / persisted decomposition

`scripts/test-persisted-decomposition-findings.ts`: `{"passed":true, ...}` — active vs. historical finding-key separation and stale-version 409 behavior both correct.

`scripts/test-evidence-foundation.ts`: `{"passed":true,"assertions":35}`.

## V5-C04 (dead/placeholder cleanup)

Not independently re-run (no live-behavior test associated — it's a deletion-state check). Confirmed by `git status`: the 6 files it deleted remain absent from the working tree; no file was reintroduced this phase.

## V5-C05 (primary inspection flow)

Hash-unchanged (see above). Additionally, this phase's own live browser testing exercised the full canonical flow (Capture → Review → Risk → Action → Complete) multiple times end-to-end through the real UI with real HazLenz analysis, clarification-question answering, fact correction, risk confirmation, and corrective-action generation — all functioned correctly after every one of this phase's edits, not just before.

## P1-02 (corrective-action benchmark)

Not independently re-run this phase (consistent with both the P0 and P1 remediation phases' own reporting convention for this file when unmodified). `corrective-action.service.ts` confirmed byte-identical to the P1-02-repaired baseline hash both before and after this phase's edits — this phase never touched it.

## PRA-002 / identity / authorization

- **PRA-002** (finding review/completion): exercised live via `test-finding-scoped-reviews.ts` (above) and this phase's own manual browser walkthrough — finding reached `completed` status correctly.
- **Identity** (three-findings middle-first, duplicate-label): not independently re-exercised this phase — `resolveSelectedFindingStandard()` (the P0-02 fix) is hash-unchanged; my only edit to its surrounding markup swapped the citation `<h3>` for the `StandardCitationHeading` component, which receives whatever citation the unmodified resolver already produces. A fresh live multi-finding sibling-switch walkthrough was not performed (see `STANDARDS_BROWSER_VERIFICATION.md`) — reported as a coverage gap, not silently assumed clean.
- **Authorization**: no auth/guard code was modified by any production change this phase (the `DEV_AUTH_BYPASS` defect discovered during Phase 2 was diagnosed but deliberately not touched — see `POLISH_P1_IMPLEMENTATION_REPORT.md`, "Discovered but out of scope"). No authorization regression risk introduced.

## Reports

Not exercised this phase (PDF export path unchanged; no `reportExportService.ts`/PDF-generation code touched). No regression risk — see `P1_POLISH_SCOPE.md`'s explicit report-redesign exclusion.

## Performance non-regression

Warmed `POST /safescope-v2/classify`, 5 samples after the 228-case matrix + 3 additional live test scripts had already warmed the process: 61.6ms / 74.3ms / 72.5ms / 69.6ms / 67.8ms — consistent with the prior phase's measured baseline (p50 ≈ 55ms, p95 ≈ 161ms) and unaffected by this phase's work, because the new standards-text lookup (`GET /regulatory/section`) is a **separate, on-demand-only endpoint**, never called from or bundled into the classify request path. Confirmed by code inspection: `getRegulatorySection()` is called only from `StandardCitationHeading`'s click handler, nowhere in the analyze/classify call chain.

## Build / static verification

- Backend build (`tsc`): **PASS**, zero errors — run fresh after every edit.
- Frontend build (`next build`, 26 routes): **PASS**, zero errors — run fresh after every edit.
- `git diff --check`: **PASS**, exit 0.
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`, unchanged throughout (no commit made).
