# V5-C03 Finalization Pipeline Trace

Date: 2026-08-16 · Traced via direct code reading and grep, not inferred. All line numbers refer to HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.

## Headline finding (drives the whole C03 design)

**`resultStage` and `mayFinalize` are computed by `classify()` but have zero downstream consumers today** — not in the frontend (`frontend-next` has zero matches for `resultStage` anywhere, confirmed by repo-wide grep), not in `inspection.service.ts`'s finding-persistence/review/completion pipeline (zero matches for `resultStage`/`mayFinalize`), and not in any `display/*.ts` post-processor. The only readers in the whole repository are two backend test scripts (`hazlenz-clarification-gauntlet.ts`, `hazlenz-independent-standards-audit.ts`) that assert on the raw `/safescope-v2/classify` HTTP response directly. This was already flagged, in narrower form, by the C04 comment left in `intelligence-orchestrator.service.ts` ("this top-level verdict is never read by safescope-v2.service.ts's resultStage/mayFinalize decision").

This matters enormously for scope and risk: it means **PRA-002 (finding review/completion) cannot currently be affected by `resultStage`/`mayFinalize` by construction**, because nothing in that pipeline reads them. It also means the field the task's Phase 8 ("clarification behavior") actually cares about for user-visible effect is a *different* field than the one Phase 5 names for finalization — see below.

## Two separate, differently-named "clarification questions" fields

- **`clarifyingQuestions`** (plural) — computed inside protected `safescope-v2.service.ts` (`buildStructuredClarifyingQuestions()`, line 592), carries `safetyDecisive`/`blocksFinalization` metadata driven by a hardcoded 5-ID allowlist (`machine-energy-state`, `machine-controls`, `electrical-damage-exposure`, `gap-conveyor-loto`, `gap-p4-roof-rib-ground-control`) plus a few inline regex overrides for those same 5 IDs (line 604-625). This is what drives `resultStage`/`mayFinalize` (line 4733). **Not read by any frontend file** (repo-wide grep: zero matches for `clarifyingQuestions` in `frontend-next`).
- **`clarificationQuestions`** (singular) — set *exclusively* by `evidence-foundation.ts`'s `applyEvidenceFoundation()` (a non-protected, C02-owned file) from `ApplicabilityDecision.missingPredicates`, capped at 3. **This is what the frontend actually displays**: `guided-finding-response.ts` (line 48) builds its questions from `response?.clarificationQuestions || response?.clarifyingQuestions` — preferring the C02-owned field — and `inspection-workspace/page.tsx` (line 883) reads `analysis.guidedFinding?.clarificationQuestions || analysis.clarificationQuestions`. `safescope-v2.service.ts` itself never sets this field (confirmed: the only `clarificationQuestions` match inside that file is an unrelated per-hazard `reviewerQuestions` alias at line 1609, not the top-level response field).

## Stage-by-stage trace

| # | Stage | File | Protected? | Input | Output | Consumer |
|---|---|---|---|---|---|---|
| 1 | Shared evidence facts built (once, text-only scope) | `orchestration/intelligence-orchestrator.service.ts` (C02 addition) | No | `fusedText`, `scopes` | `sharedEvidenceFacts.facts: EvidenceFact[]` | `EvidenceSufficiencyService` (this stage only) |
| 2 | Evidence sufficiency scored | `evidence-sufficiency-core/evidence-sufficiency.service.ts` | No | `observationUnderstanding`, `causalRiskReasoning`, `fusedText`, shared facts | `EvidenceSufficiencyOutput` (`sufficiencyLevel`, `factScores`, `missingCriticalFacts`, `confidenceImpact`, `evidenceFactTrace`) | Consumed internally by `actionQuality`, `hazardDomainIntelligence`, `safetyHealthDomainMatrix`, `regulatoryApplicability`, `causalChain` (per C04's runtime-confirmed trace) — **never by `resultStage`/`mayFinalize`** |
| 3 | Response assembly | `safescope-v2.service.ts` line 3193 | **Yes** | `promotedPrimary`, `intelligence` (spread, includes `evidenceSufficiency` as a top-level key) | `response` object | — |
| 4 | Protected clarifying-questions + resultStage gate | `safescope-v2.service.ts` lines 592-643, 4723-4750 | **Yes** | `fusedText`, `unresolvedContradictions`, hardcoded 5-ID allowlist | `response.clarifyingQuestions`, `response.resultStage`, `response.mayFinalize`, `response.humanReviewRequired`, `response.provisionalResult` | Two test scripts only (see above) |
| 5 | Evidence-boundary enforcement | `display/hazlenz-evidence-boundary.ts` via `enforceHazLenzEvidenceBoundary()` | No | `response` | citation/standards suppression | frontend (indirectly, via later stages) |
| 6 | Evidence-foundation post-process | `evidence/evidence-foundation.ts` `applyEvidenceFoundation()` | No | `response` (facts extracted from raw `request`, independent of stage 1-4's facts) | **Sets `response.clarificationQuestions`** (the field the frontend actually reads), overrides `primaryCitation`/`suggestedStandards`/`risk` in the negated-hazard branch | frontend (via stage 8-9) |
| 7 | Display sanitization | `display/hazlenz-display-sanitizer.ts` | No | `response` | strips `evidenceSufficiency` (and ~20 other internal blocks) from the client-visible payload | — |
| 8 | Citation-visibility contract | `display/*.ts` `ensureVisiblePrimaryCitationContract()` | No | sanitized response | — | — |
| 9 | Guided-finding shaping | `display/guided-finding-response.ts` `attachGuidedFindingResponse()` | No | response (post-sanitization) | `response.guidedFinding.clarificationQuestions` (from stage 6's field, preferred) | **`inspection-workspace/page.tsx`, `SafeScopeInspectionStep.tsx`** |
| 10 | Controlled-display enforcement | `display/*.ts` `enforceVerifiedControlDisplay()` | No | — | — | — |
| 11 | Final evidence-boundary re-apply | `display/hazlenz-evidence-boundary.ts` | No | — | — | HTTP response body |
| 12 | Client persists the response | `inspection.service.ts` `addObservationAnalysis()` | No | client-submitted `resultSnapshot` (i.e., whatever the client received back from stage 11 — the sanitized, guided-shaped object) | `HazLenzAnalysis.resultSnapshot` | — |
| 13 | Finding materialization | `inspection.service.ts` `reconcileDecompositionFindings()` | No | `resultSnapshot.multiHazardDecomposition.hazards[]` | `InspectionFinding[]` rows | **Does not read `resultStage`/`mayFinalize`/`clarificationQuestions` at all** — findings are created from decomposition regardless |
| 14 | Finding-scoped review (PRA-002) | `inspection.service.ts` `addReview()`/`finalizeFinding()`/`transition()` | No | reviewer decision, per finding | `HumanReview`, finding `status` | frontend inspection workspace |
| 15 | Inspection completion | `inspection.service.ts` `transition()` | No | all findings' review status | `Inspection.status` | frontend |

## Where evidence sufficiency should integrate (Phase 2 conclusion)

Two genuinely separate integration points, both **outside the protected file**, matching C02's own established pattern of controller-level post-processing (`applyEvidenceFoundation`):

1. **`resultStage`/`mayFinalize`** — currently computed once by the protected file and then untouched all the way to the HTTP response. A new, explicit, non-protected post-process step (in `safescope-v2.controller.ts`, alongside `applyEvidenceFoundation`) can *tighten* (never loosen) these fields using `response.evidenceSufficiency`'s already-computed verdict before the protected file's own value is returned. This makes the field's semantics genuinely evidence-grounded for whenever a future consumer reads it, without touching the protected file and without any risk to PRA-002 (which never reads this field).
2. **`clarificationQuestions`** (the field with real frontend effect) — already owned and produced by `evidence-foundation.ts`. This is the correct, already-non-protected place to ensure a genuinely blocking evidence deficiency surfaces as a clarification question the inspector actually sees, and where an optional/enrichment gap does not.

Neither integration point touches `inspection.service.ts` (PRA-002, finding-scoped review, finding creation) — those remain architecturally untouched by construction, which is the safest possible outcome for Phase 9's protection requirement.
