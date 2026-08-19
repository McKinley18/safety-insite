# P0-03 — Corrective Action Trace

## Pipeline traced

`POST /safescope-v2/classify` (`backend/src/safescope-v2/safescope-v2.controller.ts`) → `SafescopeV2Service.classify()` (`backend/src/safescope-v2/safescope-v2.service.ts:939`).

Three independent corrective-action generators run on every request:

- **Generator A** — `ActionEngineService.generateActionsFromReport()`, keyed by `report.safeScope.classification` via `actionMap` lookup. **Correctly identity-scoped.**
- **Generator B** — `CorrectiveActionBrainService.evaluate()` (the P1-02-repaired file, confirmed byte-identical, untouched), keyed by `scenarioIntelligence.hazardDomain`, itself derived from `promotedPrimary.classification`. **Correctly identity-scoped.**
- **Generator C** — `SafescopeV2Service.buildEnhancedGeneratedActions()` (same file, lines 4891–5350+), a large free-text keyword-matching function producing `domainActionTitle`/`domainCorrectiveActionPatterns`. **Not identity-scoped at all** — selects a title/body purely by regex-matching the raw evidence text, independent of the finding's own computed `hazardKey`/classification.

Final assembly (pre-fix, ~line 5285):

```ts
const title = isVague
  ? "Review and control HazLenz AI-identified hazard"
  : (domainActionTitle ||                                    // Generator C — checked FIRST
     sanitizeActionText(dca.immediateActions?.[0]?.title) ||
     sanitizeActionText(dca.immediateActions?.[0]?.action) ||
     sanitizeActionText(correctiveActionReasoning.immediateActions?.[0]) || // Generator B
     sanitizeActionText(primary.title) ||                     // Generator A
     "Review and control HazLenz AI-identified hazard");
```

Generator C's output wins whenever any of its ~20 keyword-regex branches fire, silently discarding the two correctly-scoped generators' output.

## Root cause, confirmed by mechanism (two independent contamination paths, both in Generator C)

### Path 1 — full-text contamination (Finding 1: Machine Guarding)

Generator C received `fusedText` — a concatenation of `text` + `structuredEvidenceTexts` + clarification-answer evidence + `evidenceTexts` (`evidenceFusion.synthesize([...])`, line ~978). For the PRIMARY finding of a multi-hazard observation, `text` itself is the full, untrimmed multi-hazard paragraph the user typed (containing "lockout/tagout" language even though this finding's own classification is Machine Guarding). `hasHazardousEnergyActionContext` (a regex matching `lockout|loto|tagout|...`) fired on that text and was checked ahead of any machine-guarding-specific branch — of which **none existed** (`hasMachineGuardingContext` was computed at line 4919 but never consumed by the title-selection ternary).

### Path 2 — cross-turn evidence-fusion contamination (Finding 2: reclassified Walking/Working Surfaces)

Even after isolating this finding's own `text` to just "there is loose material buildup creating a slip hazard on the walkway leading to the platform" (no fall/edge/guardrail language), the corrective action was still "Provide edge fall protection". Traced to the exact composed string the legacy frontend sends as `text` (`frontend-next/lib/inspection/hazlenzInspectionService.ts`, `runInspectionHazLenzReview`):

```
Hazard category: Fall Protection
Observed condition: there is loose material buildup creating a slip hazard on the walkway leading to the platform
Location: No location provided
Evidence notes: No evidence notes provided
Regulatory scope: ...
```

Two artifacts of this template independently satisfied `hasEdgeFallProtectionContext`:

1. `Hazard category: Fall Protection` — the literal phrase "fall protection" is one of the regex's direct alternatives.
2. `Location: No location provided` / `Evidence notes: No evidence notes provided` — the "no" in these unfilled-field placeholders, combined with "platform" in the observed-condition text (which alone satisfies `hasFallOrHeightContext`), satisfied the regex's second clause (`hasFallOrHeightContext && /without|missing|no|unguarded|open/i`).

Neither of these is the reviewer's actual evidence — `"Hazard category: Fall Protection"` is the pre-classification decomposition hint (necessarily set before this finding's own reclassification runs), and the `"No ... provided"` lines are template boilerplate for empty optional fields.

## Confirmed: NOT array-index/order-based reassignment

Each finding triggers its own independent `classify()` call with its own independently-computed evidence; there is no shared candidate-action array being distributed across findings by position. Both contamination paths are input-scoping defects within a single request's own text composition, confirmed by isolating and curl-reproducing each mechanism independently.

## P1-02 preserved

`backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts` was not touched; its git blob hash (`32f057a670499f59e1de78e4b299b5805f6059e1`) is byte-identical to the recorded P1-02-repaired baseline. Its correctly-scoped output (Generator B) was being discarded by Generator C's higher priority — the fix corrects that discarding, it does not touch Generator B's own logic.
