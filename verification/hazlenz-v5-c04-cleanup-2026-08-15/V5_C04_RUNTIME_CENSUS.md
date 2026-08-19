# V5-C04 Runtime Census

Date: 2026-08-16
Method: static trace + temporary `console.log('C04_INSTRUMENTATION_MARKER: ...')` instrumentation,
restarted disposable backend (DB `phase130_c04_20260816`, port 4300), real authenticated
`POST /safescope-v2/classify` requests against a multi-hazard fixture, log inspection. All
instrumentation was removed before any production edit was made.

Fixture used: "An employee reached through an unguarded rotating pulley on a running conveyor
drive while a nearby open junction box had exposed, energized wiring with bare conductors
visible."

## Target 1 — SafeScopeActionQualityService

- File: `backend/src/safescope-v2/action-quality/action-quality.service.ts`
- Construction site: `backend/src/safescope-v2/native-reasoning/native-reasoning.service.ts:31`
  (`private actionQualityService = new SafeScopeActionQualityService();`), inside
  `SafeScopeNativeReasoningService`.
- Runtime proof: instrumentation marker in `.evaluate()` did **not** fire on a real classify()
  request. Confirmed dead.
- Root cause: `SafeScopeNativeReasoningService` is itself only ever constructed at
  `backend/src/safescope-v2/safescope-v2.service.ts:52`
  (`private nativeReasoningService = new SafeScopeNativeReasoningService();`), and grepping that
  entire (hash-protected) file for `nativeReasoningService.` finds zero method calls — the field
  is assigned and never used.
- Classification: **INSTANTIATED_BUT_DEAD**
- Disposition: **DEFER_WITH_EXPLICIT_MARKER**. Cannot be removed: its only reachable caller chain
  originates inside `safescope-v2.service.ts`, one of the 6 hash-protected V4 files, which cannot
  be edited in this phase. Removing/gutting the non-protected downstream files would break that
  protected file's import and fail the backend build. A documentation-only marker was added
  instead (see below).

## Target 2 — ControlEffectivenessService (SafeScopeControlEffectivenessService)

- File: `backend/src/safescope-v2/control-effectiveness/control-effectiveness.service.ts`
- Construction site: `native-reasoning.service.ts:33`, same container as Target 1.
- Runtime proof: instrumentation marker did **not** fire. Confirmed dead, same root cause as
  Target 1.
- This is a genuinely implemented, non-trivial hierarchy-of-controls / control-quality engine
  (188 lines, real rule logic: elimination/substitution/engineering/administrative/PPE detection,
  high-risk interim-control gating, closure-readiness blockers) — it is not a stub. It is simply
  unreachable.
- Classification: **INSTANTIATED_BUT_DEAD**
- Disposition: **DEFER_WITH_EXPLICIT_MARKER**, same reasoning as Target 1. Per the task's explicit
  guidance, wiring this in now would be a product-behavior change (it would start influencing
  inspector-facing recommendations) requiring dedicated validation, and is out of scope for a
  cleanup phase in any case since the only viable insertion point is the protected file. Preserved
  in full (not gutted) for a future phase authorized to edit `safescope-v2.service.ts`.

## Container — SafeScopeNativeReasoningService

- File: `backend/src/safescope-v2/native-reasoning/native-reasoning.service.ts`
- Runtime proof: instrumentation marker on `.evaluate()` did **not** fire.
- This class itself is real and would, if wired, call into 10 sub-engines (expert-observation,
  mechanism-intelligence, evidence-sufficiency, exposure-intelligence, action-quality,
  causal-chain, control-effectiveness, hazard-domain-intelligence,
  safety-health-domain-matrix, regulatory-applicability) — an entire second, parallel
  "native reasoning" pipeline structurally similar to the live `SafeScopeIntelligenceOrchestrator`.
- Classification: **INSTANTIATED_BUT_DEAD**
- Disposition: **DEFER_WITH_EXPLICIT_MARKER** — same protected-file constraint.

## Target 3 — CorrectiveActionControlMapService

- File: `backend/src/safescope-v2/corrective-action-control-map/corrective-action-control-map.service.ts`
  (now deleted)
- Construction/call site: `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts`
  (not protected), called as `this.controlMapEngine.mapControls('hazard', 'mechanism', [])` —
  three literal dummy arguments, never real hazard data.
- Runtime proof: instrumentation marker fired once per classify() call, logging the literal args
  `{"hazardFamily":"hazard","mechanism":"mechanism","failedControls":[]}`. `mapControls()` always
  returns one fixed hardcoded object regardless of input.
- Consumer trace: output flows into `GovernanceReportAdapterService.adapt()` (Target 3b, below)
  and directly into the orchestrator's returned object as `controlMap`, which is spread into the
  final API response (`response.controlMap`, confirmed present in the raw JSON of a live classify()
  call before this phase's fix) and persisted into `hazlenz_analyses.resultSnapshot`.
- Frontend consumers: zero (`grep -rn "controlMap" frontend-next/` — no matches).
- Other backend consumers: zero (`grep -rn "CorrectiveActionControlMapService" backend/src` —
  only its own definition file and the one orchestrator construction/import site).
- Classification: **PLACEHOLDER_STUB** (live, called every request, output reaches the wire and
  persistence, but is 100% hardcoded and ignores its inputs).
- Disposition: **REMOVE**. Call site, field, import, and returned-object key removed from
  `intelligence-orchestrator.service.ts`; the service and its types file deleted entirely
  (zero other consumers existed). Matches the task's own menu: "remove from the production path."

## Target 3b (discovered while tracing Target 3's consumer) — GovernanceReportAdapterService

- File: `backend/src/safescope-v2/governance-report-adapter/governance-report-adapter.service.ts`
  (now deleted)
- Not one of the 4 explicitly named targets, but directly downstream of Target 3 and required by
  the task's own Phase 1 methodology ("trace input → ... → consumer"). The task frames its 4
  targets as "at minimum," not exclusive.
- Construction/call site: same orchestrator, `this.adapterEngine.adapt(outputPolicy,
  evidenceSufficiency, causalRiskReasoning, {}, evg, controlMap)`.
- Runtime proof: instrumentation marker fired once per classify() call.
- Behavior: 4 of its 6 parameters are effectively unused; 6 of 8 output fields are hardcoded
  generic strings (`content: 'Low evidence'`, `content: 'Yes'`, `content: 'None mapped'`,
  `content: 'Pending'`, etc.) regardless of the actual case.
- Consumer trace: output (`adapter`) reaches the orchestrator's returned object and is spread into
  the final API response (`response.adapter`). Zero frontend consumers, zero other backend
  consumers.
- Classification: **PLACEHOLDER_STUB**
- Disposition: **REMOVE**, same reasoning and same edit as Target 3.

## Target 4 — Evidence sufficiency (top-level verdict vs. finalize/clarification gate)

- Computation site: `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts`,
  `const evidenceSufficiency = await this.evidenceSufficiencyEngine.evaluateEvidenceSufficiency(...)`,
  where `evidenceSufficiencyEngine = new EvidenceSufficiencyService()` from
  `evidence-sufficiency-core/evidence-sufficiency.service.ts`.
- Runtime proof: temporary instrumentation logged the actual returned object on a live request —
  a real, well-formed, non-placeholder computation:
  `sufficiencyLevel: "partially_sufficient"`, `overallScore: 0.72`,
  `confidenceImpact: { shouldDowngradeConfidence: true, maximumSupportedConfidence: "moderate" }`,
  plus concrete per-fact scores, strongest/weakest facts, and reviewer questions.
- Internal consumption: confirmed genuinely consumed as real input to `actionQuality`,
  `hazardDomainIntelligence`, `safetyHealthDomainMatrix`, `regulatoryApplicability`, and
  `causalChain` within the same orchestrator, plus `controlEffectiveness` inside (dead)
  `native-reasoning.service.ts`. **Not dead code.**
- Display fate: `evidenceSufficiency` is explicitly listed in
  `backend/src/safescope-v2/display/hazlenz-display-sanitizer.ts`'s `HIDDEN_STANDARD_OUTPUT_FIELDS`
  set, alongside several other heavy internal reasoning blocks (`dca`, `nativeReasoning`,
  `observationUnderstanding`, `confidenceGovernance`, etc.). This hiding is intentional,
  documented, correct API-surface-size control — not a defect, and not the issue the audit
  flagged.
- Finalize-gating fate: `backend/src/safescope-v2/safescope-v2.service.ts` (hash-protected)
  computes `resultStage`/`mayFinalize` from `unresolvedContradictions.length` and
  `clarifyingQuestions.some(q => q.blocksFinalization)` only. A whole-file grep for the literal
  string `evidenceSufficiency` in that file returns **zero matches**. The computed sufficiency
  verdict — including its `shouldDowngradeConfidence`/`maximumSupportedConfidence` signals — never
  reaches the finalize/clarification decision.
- Classification: **LIVE_BUT_UNUSED_OUTPUT** (specifically: its top-level verdict is unused for
  finalize-gating; the computation as a whole is live and real).
- Disposition: **KEEP** the computation (cheap, genuinely consumed by 6 sibling engines, correctly
  hidden from display). **DEFER_WITH_EXPLICIT_MARKER** for wiring the verdict into
  `resultStage`/`mayFinalize` — that is a clarification/finalization product-behavior change,
  explicitly out of scope for C04 ("Do NOT wire it into stop-asking behavior during C04 unless the
  change is trivial and already semantically validated"), and the only insertion point is the
  hash-protected file in any case. Intentionally left for V5-C02/C03.

## Instrumentation cleanup

All 6 temporary `console.log('C04_INSTRUMENTATION_MARKER: ...')` lines (5 in the target files, 1
added mid-investigation in the orchestrator to capture the evidence-sufficiency object) were
removed before any production edit was made. Confirmed via
`grep -rn "C04_INSTRUMENTATION_MARKER" backend/src` returning zero matches.
