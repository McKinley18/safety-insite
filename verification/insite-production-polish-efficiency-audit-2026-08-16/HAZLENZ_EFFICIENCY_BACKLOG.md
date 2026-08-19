# HazLenz Efficiency Backlog (Ranked)

Each item: measured cost · affected stage · duplication/waste evidence · proposed optimization · expected benefit · semantic risk · protected-V4 involvement.

## EFFICIENCY_HIGH

### EH-1. Strip or gate unconsumed service outputs from the classify response
- **Measured cost**: 55-86 KB average response for classify calls to inputs as short as 5 words (`API_PAYLOAD_AUDIT.md`); this is the single largest measured inefficiency in the audit.
- **Affected stage**: response assembly / serialization, after `SafeScopeIntelligenceOrchestrator.evaluate()`.
- **Evidence**: `SERVICE_EXECUTION_AUDIT.md` — `ObservationContextService`'s detected-entity fields, `EvidenceQuestionGenerationService`'s full output, and the `HazardInformationAbsorptionService`/`FieldOutputComposerV1Service`/`LearningCandidateQueueService` trio all traced to zero downstream readers.
- **Proposed optimization**: Confirm no non-obvious consumer exists (background jobs, analytics) then omit these fields from the HTTP response (server-side computation can stay if needed elsewhere; the point is not to serialize/transfer unread data).
- **Expected benefit**: Directly addresses both the payload-size finding and, as a side effect, the `PayloadTooLargeError` on report save (P1-4 in the polish backlog).
- **Semantic risk**: Low if consumer-trace is done first — nothing found reads these fields today.
- **Protected V4 involved?**: No.

### EH-2. Investigate the 3-way corrective-action generator merge as the likely cause of the content-mismatch defect
- **Measured cost**: Not a latency cost — a correctness cost with a direct efficiency angle (3 independent generators run unconditionally on every request; at least 2 of the 3 are candidates for elimination or conditional execution once the merge logic is understood).
- **Affected stage**: corrective-action generation (`CorrectiveActionBrainService`, `DefensibleCorrectiveActionService`, `ActionEngineService`).
- **Evidence**: `SERVICE_EXECUTION_AUDIT.md`, live defect in `CORRECTIVE_ACTION_UX_AUDIT.md`.
- **Proposed optimization**: Root-cause first (this is P0-3 in the polish backlog); once understood, likely opportunity to run one authoritative generator per hazard family rather than three unconditionally-merged ones.
- **Expected benefit**: Both a correctness fix and a per-request cost reduction (fewer generator calls).
- **Semantic risk**: Medium-high until root-caused — do not remove generators blindly, since the live defect's cause is not yet confirmed.
- **Protected V4 involved?**: No.

## EFFICIENCY_MEDIUM

### EM-1. Two independent risk-reasoning implementations run on every request
- **Evidence**: `SERVICE_EXECUTION_AUDIT.md` — legacy `evaluateRisk()` (drives user-visible risk) and `RiskReasoningBrainService.evaluate` (feeds only internal calibration/governance metadata) both run unconditionally.
- **Proposed optimization**: Confirm whether the "brain" version's output is genuinely needed on every request or could be computed on a sampled/async/deferred basis for governance purposes only.
- **Expected benefit**: Modest per-request cost reduction; each individual engine is cheap (all under the ~200ms total budget), so this is a maintainability/cost-hygiene win more than a latency emergency.
- **Semantic risk**: Low-medium — need to confirm nothing outside this trace consumes the "brain" risk band synchronously.
- **Protected V4 involved?**: No.

### EM-2. `enforceHazLenzEvidenceBoundary` runs twice per request
- **Evidence**: `controller.ts:262` and `controller.ts:268`, confirmed literal double-invocation with its own internal regex scans.
- **Proposed optimization**: Call once, reuse the result.
- **Expected benefit**: Small but free — this is pure duplicate work with no apparent reason for the second call found in this trace.
- **Semantic risk**: Low, but verify the two call sites don't intentionally operate on different inputs before deduplicating.
- **Protected V4 involved?**: No.

### EM-3. Repeated lowercase/normalization and citation-string cleanup passes
- **Evidence**: `RAW_TEXT_REGEX_WORK_AUDIT.md` — `.toLowerCase()` applied to nearly the same string at 3 separate points; citation normalization (`.toLowerCase().replace(/\s+/g,'')`) repeated 4 times in one function.
- **Proposed optimization**: Compute once, pass the normalized value down.
- **Expected benefit**: Small, cheap win; not a measured bottleneck given overall sub-200ms latencies, but free to fix alongside EM-2.
- **Semantic risk**: Low.
- **Protected V4 involved?**: No.

## EFFICIENCY_LOW

### EL-1. `ApprovedKnowledgeRetrievalOutputV1Service.retrieve` computes a rich payload but only a boolean flag is consumed
- **Evidence**: `SERVICE_EXECUTION_AUDIT.md`.
- **Proposed optimization**: If the boolean is genuinely all that's needed downstream, have the service report a boolean directly rather than computing and discarding a full payload.
- **Expected benefit**: Contributes to payload/compute reduction, secondary to EH-1.
- **Semantic risk**: Low-medium — confirm no other consumer needs the full payload first.
- **Protected V4 involved?**: No.

## DO_NOT_TOUCH (protected V4 / precision-tuned recognition surfaces)
- `backend/src/safescope-v2/safescope-v2.service.ts` (core classification orchestrator)
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` (hazard decomposition engine, including its inline negation regex at lines 25/297/524, which duplicates a shared util elsewhere but is explicitly frozen)
- `backend/src/safescope-v2/engine/deterministic-classifier.ts`
- The hazard taxonomy coverage map and the frozen 228/228 family-matrix artifacts under `verification/hazlenz-temporal-foundation-2026-08-09/`

All were confirmed byte-identical to their last recorded baseline in `POLISH_EFFICIENCY_BASELINE.md` — no drift, and no change is proposed against any of them in this backlog.

## Overall efficiency verdict
The classify pipeline itself is fast (sub-200ms warm, no LLM calls) and is not the bottleneck a user would notice. The real, measured inefficiency is **response payload size**, driven by unconsumed service output — and that same mechanism (multiple parallel generators merging output with unclear precedence) is the most plausible shared root cause behind both the payload bloat and the live-observed corrective-action content-mismatch defect. Prioritizing EH-1/EH-2 together, rather than as separate performance vs. correctness workstreams, is the recommended approach.
