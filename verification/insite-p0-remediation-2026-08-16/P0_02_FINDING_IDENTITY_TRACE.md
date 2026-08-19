# P0-02 — Finding Identity Trace

## Identity trace, per finding, canonical `/inspection-workspace` flow

For the shared multi-hazard observation (`observationId 6cab6804-9532-4cbc-820a-065baf953976`), decomposition produced:

| Hazard | Finding ID | segmentKey | hazardKey (DB) |
|---|---|---|---|
| Machine Guarding | `5f693f2d-8ce3-4fe5-afc6-c2830176e43e` | `machine-guarding` | `machine-guarding` |
| Loto | `fb2b3070-71a3-458c-a1e6-4d8c24fc8ed2` | `lockout-tagout` | `lockout-tagout` |
| Fall Protection | `2ddb59d6-d830-40f6-a38a-000092d3afd5` | `fall-protection` | `fall-protection` |

All three share one `hazlenz_analyses` row (`analysisId 12b8f832-5cc7-40c2-b52a-5e74afa8fd2c`), which is the crux of the bug (see below).

Traced through: decomposition (`backend/src/inspection/inspection.service.ts`, `stableHazardKey()`) → finding creation (3 distinct `inspection_findings` rows, confirmed via direct DB query) → frontend selection (`selectedFindingId` React state, `app/inspection-workspace/page.tsx`) → risk editor state (`reviewerRisk`/`proposedRisk`, re-derived from `finding.riskSnapshot` on every "Review this finding" click) → request payload (`saveHumanReview(observationId, { findingId: durableFinding?.id, ... })`) → backend lookup (`finalizePersistedFinding` looks up the review by `{id, observationId}`, and the finding by its own primary key) → persisted finding (`status`, `riskSnapshot`) → response → frontend state update (`getPersistedInspection` refetch).

## First point of divergence found

**Not** in the backend write path. Live testing (three sequential "Review this finding" → risk confirm → finalize" cycles, one per hazard, in the same browser session) proved:

```
machine-guarding → finalized, riskSnapshot.overallRisk = Critical  ✓ correct
lockout-tagout    → finalized, riskSnapshot.overallRisk = Moderate ✓ correct
fall-protection   → finalized, riskSnapshot.overallRisk = High     ✓ correct
```

Each of the three `human_reviews` rows created had exactly the correct `findingId`. **No backend identity swap occurred.**

The actual, confirmed divergence is in the frontend **display** layer only, in `frontend-next/app/inspection-workspace/page.tsx`:

- `selectedFindingId` (state, set correctly by every "Review this finding" click, line ~146) — correct.
- `reviewerRisk`/`proposedRisk` (state, re-derived per finding from `finding.riskSnapshot` via `riskSnapshotToReviewerRisk()` on every click, lines ~831–839) — correct, and this is what the actual finalize submission uses.
- The "CANDIDATE STANDARD" panel (lines ~908–938, pre-fix) reads `analysis.guidedFinding?.primaryStandard` directly and unconditionally. `analysis` is a **single object for the whole observation**, populated once by the initial `analyze()` call and never touched by "Review this finding" clicks (confirmed: that click handler only sets `selectedFindingId`/`reviewerRisk`/`proposedRisk`/`reviewerRiskReason` — it never calls `setAnalysis`). `guidedFinding.primaryStandard` describes only the ONE hazard that was primary when the observation was first analyzed (`multiHazardDecomposition.primaryHazard`). Once a second/third finding is selected, this panel keeps rendering the first finding's standard, title, "why HazLenz selected this" rationale, and confidence — a real, live, reproducible display of the WRONG finding's content while a DIFFERENT finding's card is highlighted as selected.

## Root cause

**Stale/unscoped display state**, not a backend identity bug. `guidedFinding.primaryStandard`/`findingCandidates`/`additionalStandards` on the shared `analysis` object are populated per-observation, not per-finding, by this pipeline — `findingCandidates` and `additionalStandards` are in fact empty arrays in every response this pass observed for a freshly-decomposed multi-hazard observation (confirmed via direct API inspection); only `multiHazardDecomposition.hazards[]`/`primaryHazard` carry per-hazard identity (`domainId`), and only the primary hazard's standard is ever computed by this endpoint. The candidate-standard panel had no mechanism to recognize "this content belongs to a different finding than the one currently selected" and rendered whatever was last computed regardless.

## Why this matters even though the backend write was correct

A qualified reviewer working through this screen sees the selected-finding card correctly labeled `loto`, but the "why HazLenz selected this standard" explanation and citation directly below it describe `machine_guarding`. That is exactly the kind of misleading state that could cause a human reviewer to believe they are confirming one finding's standard when they are actually looking at a different finding's — a genuine "qualified human review" trust defect, matching the spirit of Phase 6's identity invariant ("...from UI selection through backend mutation and **back to rendering**") even though the specific backend-swap mechanism originally hypothesized did not reproduce.
