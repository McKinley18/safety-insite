# V5 Midpoint Audit — Phase 1: Current Capability Map

Traced against the live working tree (HEAD `24e37703` + the uncommitted C01–C04-adjacent overlay,
which is what actually executes). Artifact claims from the four closed-phase reports were spot-checked
against current code; no discrepancies found.

## Pipeline overview

`SafescopeV2Controller.classify()` (`safescope-v2.controller.ts:239`)
→ `SafescopeV2Service.classify()` (`safescope-v2.service.ts:939`, **protected V4 file**, ~3,900-line method)
→ `SafeScopeIntelligenceOrchestrator` (`orchestration/intelligence-orchestrator.service.ts`, plain-`new` graph outside NestJS DI, ~60 sub-services)
→ controller post-process chain (`safescope-v2.controller.ts:260-262`): `enforceHazLenzEvidenceBoundary` → `applyEvidenceFoundation` (C02) → `applyFinalizationGate` (C03) → `sanitizeHazLenzDisplayOutput` → `attachGuidedFindingResponse` → `enforceVerifiedControlDisplay`
→ HTTP response
→ `inspection.service.ts` persistence (`addObservationAnalysis`, `reconcileDecompositionFindings`)
→ review/finalize (PRA-002)
→ reports (`canonical-reports.service.ts`)
→ frontend (**two parallel UIs** — see Phase 8 finding: `inspection-review` legacy flow and `inspection-workspace` canonical flow).

## Per-output classification table

| # | Output | Producer | Consumer(s) | Persistence | API | Frontend | Workflow effect | Classification |
|---|---|---|---|---|---|---|---|---|
| 1 | Hazard decomposition | `multi-hazard-decomposition.service.ts` (protected, untouched) | `inspection.service.ts` `reconcileDecompositionFindings()` | `InspectionFinding` rows | `intelligence.multiHazardDecomposition.hazards[]` | "Persisted hazard findings" cards (canonical flow); banner (legacy flow, `SafeScopeInspectionStep.tsx:308`) | Drives 1:N finding creation | **LIVE_PRODUCTIZED** |
| 2 | Shared evidence facts (C02) | `evidence/shared-evidence-facts.ts` `buildEvidenceFacts()` | `evidence-foundation.ts`; `EvidenceSufficiencyService` (additive trace arg) | None directly | `evidenceFactTrace` on `evidenceSufficiency`, but that whole key is stripped by the display sanitizer | None | None (provenance only) | **LIVE_BACKEND_ONLY** |
| 3 | Standards/applicability | `ApplicableStandardsService` + `StandardApplicabilityService` (dual engine, reconciled ad hoc) | Controller response | N/A | `suggestedStandards`/`excludedStandards`/`primaryCitation` | Rendered as citations, "Why this was suggested" | Drives citation shown to user | **LIVE_PRODUCTIZED** (dual-engine consistency risk noted, pre-existing) |
| 4 | Evidence sufficiency → `resultStage`/`mayFinalize`/`finalizationGate` (C03) | `EvidenceSufficiencyService` + `evidence/finalization-gate.ts` | Controller response only | `resultSnapshot` blob (unread) | Present in raw response | **Zero matches anywhere in `frontend-next/`** | None — `inspection.service.ts` never reads these fields | **LIVE_API_ONLY** |
| 5 | Clarification (singular, `clarificationQuestions`) | `evidence-foundation.ts` | `guided-finding-response.ts`, workspace UI | N/A | Yes | Rendered, capped at 3 | Advisory, non-blocking | **LIVE_PRODUCTIZED** |
| 5b | Clarification (plural, `clarifyingQuestions`, protected V4 field) | `safescope-v2.service.ts` | Drives protected-file's own `resultStage` | N/A | Yes | Rendered as "Follow-up questions" card in legacy flow | Advisory only; not read by save/finalize | **LIVE_BUT_NON_DECISIONAL** |
| 6 | Finding-scoped risk (C01) | `InspectionService.computeFindingRisk()` (`inspection.service.ts:333`) | `reconcileDecompositionFindings()`, `finalizeFinding()` | New `inspection_findings.riskSnapshot jsonb` column | `FinalizeFindingDto.riskAssessment` | Rendered **only in canonical `/inspection-workspace` flow**; legacy `FindingsReviewList`/`RiskReviewSection`/`FindingReviewEditor` still read the pre-C01 shared `safeScopeResult.risk` object | Reviewer can override per finding — **but only in the canonical flow** | **LIVE_PRODUCTIZED (canonical flow only) / LIVE_BUT_NON_DECISIONAL (legacy flow)** — see Phase 8 |
| 7 | Second risk engine (`RiskReasoningBrainService`) | Same orchestrator | N/A | N/A | N/A | N/A | Remains observation-scoped, not extended by C01 | **LIVE_BUT_NON_DECISIONAL** |
| 8 | Control-effectiveness intelligence (dead engine) | `SafeScopeControlEffectivenessService`, instantiated only inside never-invoked `SafeScopeNativeReasoningService` | None | N/A | N/A | N/A | None | **UNREACHABLE** |
| 8b | Control-effectiveness (functional, risk-scoring level) | `risk-engine.ts` narrow regex downgrade (`safescope-v2.service.ts:4471-4477`) | Risk computation | N/A | Risk band | Shown, but not explained as control-driven | Risk computed once, early, **control-blind** to any of the live domain/control-intelligence engines | **LIVE_BUT_NON_DECISIONAL** |
| 9 | Action-quality (dead engine) | `SafeScopeActionQualityService`, same unreachable constructor chain | None | N/A | N/A | N/A | None | **UNREACHABLE** |
| 10 | Corrective-action intelligence | `CorrectiveActionBrainService`, `ActionEngineService`, `DefensibleCorrectiveActionService`, `SafeScopeCorrectiveActionReasoningService` | Controller response | Corrective action entities (via corrective-actions module) | `correctiveActionReasoning`, `generatedActions` | `SafeScopeRationaleVisualizer.tsx`, `HazLenzFindingSummary.tsx`, PDF appendix | Drives generated actions shown to user | **LIVE_PRODUCTIZED** (`ActionEngineService` output); **LIVE_BACKEND_ONLY** for the other three |
| 11 | Removed placeholder engines (C04) | `CorrectiveActionControlMapService`, `GovernanceReportAdapterService` — confirmed deleted (`D` in git status) | — | — | — | — | — | **OBSOLETE** (correctly removed) |
| 12 | Confidence/uncertainty | 9+ subsystems, 4 numeric scales; `ConfidenceGovernanceService.outputPermissions` never read | Controller response | N/A | Per-standard confidence shown; `outputPermissions`/overall uncertainty not | Per-standard confidence rendered; overall evidentiary-weakness not | None from governance layer | **LIVE_BUT_NON_DECISIONAL** |
| 13 | Historical/planned-future semantics | `conditionState` (decomposition) + regex reclassification (`safescope-v2.service.ts:4557-4621`) | `computeFindingRisk()` (returns null for HISTORICAL/SAFE_VERIFIED — correct); regex reclassification (historical only, not planned-future) | N/A | `conditionState`/`conditionStateEvidence` in `guidedFinding` | Historical: red badge shown (but stale risk band beside it — see Phase 8 #6). Planned-future: **no label assigned at all**, renders identically to unaddressed hazard | Partial — historical path only | **LIVE_PRODUCTIZED (historical, with a display bug)** / **UNREACHABLE (planned-future — computed conceptually but never labeled to the user)** |
| 14 | Report representation | `canonical-reports.service.ts:33-35` | Versioned report snapshot | Report entity | N/A | Renders `conclusion`/`status`/`riskBand` only — no standards reasoning, confidence, sufficiency, or finalization state | Permanent record omits most explainability signals present in the live UI | **REPORTING_GAP** (see Phase 2 doc) |

## Key structural facts confirmed unchanged/changed across the four closed phases

- No LLM/model call anywhere in the pipeline — deterministic TypeScript throughout.
- `resultStage`/`mayFinalize`/`finalizationGate` are now **correct** (C03) but remain a fully orphaned
  signal — zero product consumers, confirmed by full-tree grep.
- Risk is genuinely finding-scoped for the primary `evaluateRisk()` engine (C01) — but **only in the
  canonical `/inspection-workspace` flow**. The legacy `/inspection` → `/inspection-review` flow
  (reachable from the app's most prominent CTA) still exhibits the pre-C01 shared-risk behavior. This is
  the single most consequential capability-map finding of this audit — see Phase 8.
- Two placeholder engines were correctly deleted (C04); two genuinely-implemented engines
  (action-quality, control-effectiveness) remain unreachable behind a constructor chain inside the
  protected `safescope-v2.service.ts`, which no phase was authorized to edit.
- Shared evidence facts (C02) exist and are proven correct but power only two consumers so far; the bulk
  of the ~60-engine fan-out still independently re-derives facts from raw text (by design — precision-
  sensitive V4 surfaces are intentionally protected).

## Files most load-bearing for this map

`backend/src/safescope-v2/safescope-v2.controller.ts:239-262`, `safescope-v2.service.ts:939-990` (protected),
`orchestration/intelligence-orchestrator.service.ts:194,198,410-414`, `evidence/shared-evidence-facts.ts`,
`evidence/finalization-gate.ts`, `evidence/evidence-foundation.ts`, `display/guided-finding-response.ts:48`,
`display/hazlenz-display-sanitizer.ts:77`, `backend/src/inspection/inspection.service.ts:333,362-438,554-575`,
`backend/src/inspection/entities/inspection-finding.entity.ts:64`, `backend/src/reports/canonical-reports.service.ts:35`,
`frontend-next/app/inspection-workspace/page.tsx`, `frontend-next/app/inspection-review/page.tsx`,
`native-reasoning/native-reasoning.service.ts`, `action-quality/action-quality.service.ts`,
`control-effectiveness/control-effectiveness.service.ts`.
