# V5-C01 Architecture Decision Record: Finding-Scoped Risk

## Decision

Risk is computed independently **per decomposed hazard**, at the moment `HazLenzAnalysis` results are reconciled into `InspectionFinding` rows (`InspectionService.reconcileDecompositionFindings()`), and persisted on a new `InspectionFinding.riskSnapshot` jsonb column. `risk/risk-engine.ts`'s existing `evaluateRisk()` function is reused unmodified as the authoritative computation, called once per hazard instead of once per observation. A human reviewer may override a specific finding's risk at finalization time (`FinalizeFindingDto.riskAssessment`, new optional field), independently of any sibling finding, even when findings share one human review (preserving PRA-002).

## Why this location, not `safescope-v2.service.ts` or the orchestrator

The V5 audit's protected-hash requirement is absolute: `safescope-v2.service.ts` and `multi-hazard-decomposition.service.ts` must remain byte-identical. The natural-looking location for "compute risk per hazard" is inside `classify()`'s pipeline, right where `multiHazardDecomposition.hazards[]` first becomes available (`intelligence-orchestrator.service.ts`) — but that file is reached transitively from `safescope-v2.service.ts` and is part of the same protected recognition/reasoning surface the audit explicitly forbids touching.

Every decomposed hazard's full evidence (`observationFragment`, `mechanism`, `supportingSignals`, `conditionState`, `hazardFamily`) is already persisted verbatim into `resultSnapshot.multiHazardDecomposition.hazards[]` on the `HazLenzAnalysis` row, and that same array is already read by `InspectionService.reconcileDecompositionFindings()` (in `backend/src/inspection/inspection.service.ts`, a file this session's PRA-002 remediation already legitimately modifies and which carries no protected-hash constraint) to create/update `InspectionFinding` rows. This makes `inspection.service.ts` the correct seam: it can compute risk per hazard using exactly the same evidence the AI already produced, without executing any additional HazLenz reasoning code, without importing anything from the orchestrator, and without the classifier/decomposition engine ever being aware risk is being computed downstream of them.

## Authoritative risk engine: `risk/risk-engine.ts`'s `evaluateRisk()`

Two candidate engines existed per the V5 audit:

- `risk/risk-engine.ts` `evaluateRisk({text, classification, riskProfileId})` — a pure, synchronous, dependency-free function. Confirmed as the one whose output reaches `promotedPrimary.risk`, which is what `display/guided-finding-response.ts`'s `riskContract()` reads to build the `guidedFinding.riskAssessment` the frontend has always displayed. This is the de facto authoritative, user-visible risk engine today.
- `brain/risk-reasoning/risk-reasoning.service.ts`'s `RiskReasoningBrainService` — richer output, but only reachable through the lazy `SafeScopeIntelligenceOrchestrator` (part of the protected/off-limits surface for this phase), and its output (`riskReasoning`) is not what currently drives `guidedFinding.riskAssessment`.

`evaluateRisk()` was selected as authoritative: it is what the product already shows users, it requires no import from protected files, and it is trivially safe to call once per hazard instead of once per observation (pure function, no shared state, no I/O).

**Deferred, not implemented in C01:** `RiskReasoningBrainService` remains a second, structurally parallel risk model (see V5 Capability Audit §2/Architecture Map §3). Promoting it to finding-scoped, or reconciling it with `evaluateRisk()` into one canonical model, is out of scope for C01 and should be tracked as a follow-up (see V5-C01_IMPLEMENTATION_REPORT.md's "Deferred work").

## Family classification mapping (`finding-risk.mapping.ts`)

`evaluateRisk()`'s severity/fatality boost logic keys off exact display-style classification strings (`'Machine Guarding'`, `'Electrical'`, etc.), while decomposition produces snake_case family keys (`machine_guarding`, `electrical`). A small, new, purely-additive local lookup table (`hazardFamilyToRiskClassification()`) bridges this — it does not modify `risk-engine.ts`'s existing matching logic, and gracefully title-cases any unmapped family (moderate defaults, not a crash or fabricated boost) rather than requiring the mapping to be exhaustive.

## Persistence: one new nullable jsonb column, no new table

`InspectionFinding.riskSnapshot: jsonb | null`. Rejected alternatives:
- **A new `finding_risk` table**: unnecessary normalization for what is fundamentally one risk assessment per finding revision; would require an extra join everywhere risk is read (frontend, reports) for no benefit, given `sourceCandidate` already establishes the precedent of storing per-finding hazard evidence as jsonb on this same entity.
- **Reusing/extending `human_reviews.reviewedConclusion.reviewerRisk`**: this is exactly the PRA-006 defect's location (one review, shared across findings). Extending it would require indexing it by finding within the review, which is more complex than simply giving the finding its own column, and would conflate "what a specific human reviewer typed" with "what HazLenz computed," which the `source: 'system_generated' | 'reviewer_confirmed'` tag on `riskSnapshot` now cleanly separates instead.

`riskSnapshot` is computed once at reconciliation time (when a hazard is first materialized as a finding, or when a later analysis materially changes that hazard's evidence — reusing the existing, unmodified change-detection/invalidation path already governing `sourceCandidate`/`conclusion`). It is **not** recomputed on read, so a finalized finding's risk is not silently altered by a future change to `evaluateRisk()`'s logic — satisfying the "historically defensible" requirement without adding new invalidation machinery.

## Review workflow: per-finding override at finalization, not at review creation

`CreateHumanReviewDto`/`addReview()` were **not modified**. A shared review (PRA-002's supported "split" disposition) still produces one `HumanReview` row. Instead, `FinalizeFindingDto` gained an optional `riskAssessment` field: since `finalizeFinding()` is already called once per finding even when findings share a review (confirmed both by re-reading the persistence code and by the existing `test-finding-scoped-reviews.ts`/`test-canonical-workflow.ts` call patterns), this is the natural, already-per-finding-scoped call to attach an optional reviewer override to. When omitted, the finding keeps whichever `riskSnapshot` reconciliation already computed for it (AI default); when supplied, it is tagged `source: 'reviewer_confirmed'` and persisted per finding. `transition()` (the PRA-002 fix) was not touched at all.

## Frontend: minimal, reuses the existing finding-selection concept

`app/inspection-workspace/page.tsx` already tracked `selectedFindingId` (used to highlight a card) before this change. The fix extends the existing "Review this finding" click handler to also reset the shared `reviewerRisk`/`proposedRisk` React state from the clicked finding's own persisted `riskSnapshot` (via a new small, pure `riskSnapshotToReviewerRisk()` converter), and adds one line to each finding card showing its own risk band inline. `acceptReview()`'s submission only attaches the (now finding-specific, because it was just reset on selection) `reviewerRisk` to the payload when the call unambiguously targets exactly one finding — never broadcasting one edited value across multiple candidates in the rarer multi-candidate-in-one-call path. No new components, no new pages, no visual redesign.

## What this explicitly does not change

- `transition()` / PRA-002's completion-gate logic — untouched.
- `addReview()` / shared-review creation — untouched.
- The classifier, decomposition engine, or any file under `safescope-v2/` except reading (never writing) `resultSnapshot.multiHazardDecomposition.hazards[]`, which was already being read by pre-existing code.
- Report template structure, versioning, checksums, or immutability guarantees — one new text line was added to the existing per-finding loop in `pdfFromSnapshot()`.
