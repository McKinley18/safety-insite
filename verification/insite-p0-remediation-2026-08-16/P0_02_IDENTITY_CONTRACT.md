# P0-02 — Identity Contract

## Invariant

Every finding-specific action must carry and persist the exact durable finding identity (`inspection_findings.id`) from UI selection through backend mutation and back to rendering. Array position/order must never substitute for this identity.

## Status per stage (canonical `/inspection-workspace` flow)

| Stage | Scoped by durable finding ID? |
|---|---|
| UI selection (`selectedFindingId`) | Yes — correct, unaffected by this fix |
| Risk editor state (`reviewerRisk`/`proposedRisk`) | Yes — re-derived from `finding.riskSnapshot` per selection, correct |
| Request payload (`saveHumanReview`, `finalizePersistedFinding`) | Yes — `findingId`/`reviewId` correctly scoped, correct |
| Backend mutation | Yes — verified via direct DB inspection across 3 sequential finalize calls, correct |
| **Rendering (candidate-standard panel)** | **No, pre-fix** — read from a single shared per-observation object regardless of `selectedFindingId`. **This is the fix target.** |

## Fix

`frontend-next/app/inspection-workspace/page.tsx`: added `resolveSelectedFindingStandard(analysis, findings, selectedFindingId)`, which:

1. Returns `analysis.guidedFinding.primaryStandard` unchanged when there is only one finding for the observation (no ambiguity possible) or none is selected.
2. Otherwise, determines which hazard `primaryStandard` was actually computed for via `multiHazardDecomposition.primaryHazard.domainId`, slugified with the same algorithm the backend uses for `hazardKey` (`InspectionService.stableHazardKey`), and returns `primaryStandard` only when the selected finding's own `hazardKey` matches that domain.
3. Falls back to matching against `findingCandidates`/`additionalStandards` by the same slugified-family key, for forward-compatibility if those arrays are populated by a future change.
4. Returns `null` — rendered as "No standard established for this finding yet" — when none of the above match, rather than ever falling back to a sibling's content.

The panel JSX was changed to read from this resolved value instead of the raw shared `analysis.guidedFinding.primaryStandard`.

This is a pure frontend, read-path change — no backend endpoint, persisted schema, or write path was modified. The already-correct `reviewerRisk`/finalize write path is untouched.
