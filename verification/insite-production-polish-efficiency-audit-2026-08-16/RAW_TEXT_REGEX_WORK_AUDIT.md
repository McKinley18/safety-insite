# Raw Text / Regex Work Audit

Method: source trace of the classify call chain (`safescope-v2.controller.ts:241` → `safescope-v2.service.ts:939` → `deterministic-classifier` [PROTECTED] → `reasoning-orchestrator.service.ts` → `SafeScopeIntelligenceOrchestrator.evaluate()`, `orchestration/intelligence-orchestrator.service.ts:170`, ~50 chained engine services). The protected V4 recognition core was read for call-order understanding only — no changes proposed or implied against it.

## Concrete duplication instances found (file:line)

| Instance | Classification | Note |
|---|---|---|
| `service.ts:351-355` vs. `service.ts:4553-4556` — near-identical historical-electrical-exposure regex (`prior\|previously\|yesterday\|...`) reimplemented twice in the same file | SHARED_FACT_CANDIDATE | Same file, same fact, computed twice |
| `service.ts:4562-4567` — planned/future temporal regex rebuilds a `temporalNarrative` string from scratch rather than reusing `observationContext.normalizedText` already built at `orchestrator.ts:192` | SHARED_FACT_CANDIDATE | — |
| `negation-context.util.ts` shared correctly by `evidence/shared-evidence-facts.ts`, `standards-intelligence.service.ts`, `brain/scenario-disambiguation.service.ts`, `brain/query-orchestrator.service.ts`, `brain/snapshot-builder.service.ts` | **JUSTIFIED** | This is the good pattern — a real shared utility, not duplicated |
| `multi-hazard-decomposition.service.ts:25,297,524` reimplements inline negation regex instead of the shared util above | **PRECISION_PROTECTED** | Frozen V4 file — explicitly out of scope to touch or consolidate per Phase 27 |
| `observation-context.service.ts:4` (`.toLowerCase()`) → `orchestrator.ts:192` rebuilds a `combined` text → `orchestrator.ts:205` lowercases again for `confidenceEngine` | SHARED_FACT_CANDIDATE | Overlapping lowercase passes on nearly the same string |
| `display/hazlenz-evidence-boundary.ts:52,57,62-64` re-derives "no exposure"/"electrical-only" facts via its own fresh regex on `request.text`, duplicating facts already computed upstream by `negation-context.util.ts` and the protected decomposition service | SHARED_FACT_CANDIDATE | — |
| `controller.ts:262` and `controller.ts:268` — `enforceHazLenzEvidenceBoundary` (and its internal regex scans above) is invoked **twice** on the same request | SHARED_FACT_CANDIDATE | Literal double-execution of the same function, not just similar logic |
| `service.ts:1050, 1061, 1139, 1143` — citation-string normalization (`.toLowerCase().replace(/\s+/g,'')`) repeated 4 times in one function for standards matching | SHARED_FACT_CANDIDATE | — |
| `evidence/shared-evidence-facts.ts` (`buildEvidenceFacts`, called at `orchestrator.ts:198`) | **JUSTIFIED / partial consolidation** | By its own comment, this only feeds `evidenceSufficiency` additively — it is evidence of an *intentional but incomplete* consolidation effort already underway, not a defect to newly flag |

## What was explicitly NOT touched or recommended for change
Per the audit's protected-recognition rule, no consolidation, regex migration, or threshold change is proposed against `deterministic-classifier.ts`, `multi-hazard-decomposition.service.ts`, or `safescope-v2.service.ts`'s core classification logic. Any duplication inside those files is labeled PRECISION_PROTECTED / DO_NOT_TOUCH in `HAZLENZ_EFFICIENCY_BACKLOG.md`, not proposed as a fix.

## Overall read
There is real, measurable duplication, but it is concentrated in **unprotected** orchestration/evidence-boundary code (controller-level double-invocation, repeated lowercase/normalization passes, repeated citation-string cleanup) — exactly the category the brief calls SHARED_FACT_CANDIDATE. None of it showed up as a dominant cost in the timing data (`HAZLENZ_PIPELINE_TIMINGS.md` — all corpus items completed well under 200ms), so this is a code-quality/maintainability finding more than a measured-performance emergency at current request volumes.
