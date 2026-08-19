# V5 Midpoint Audit — Phase 3: Finalization Signal Audit

## Consumer census: `resultStage` / `mayFinalize`

Full repo-wide grep (backend + frontend-next, excluding `node_modules`/`.next`):

| File:line | Role |
|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts:4593,4733,4737-4739,4750` (protected V4) | Original computation: `resultStage` from `unresolvedContradictions.length` or any `clarifyingQuestions[].blocksFinalization`; `mayFinalize = resultStage === 'final'`. Untyped fields on an `any` response object — no formal DTO/interface exists anywhere (`backend/src/safescope-v2/dto/`, `.../types/`, `frontend-next/lib/safescope/types/` all have zero matches). |
| `backend/src/safescope-v2/evidence/finalization-gate.ts` (C03, non-protected) | `evaluateFinalizationGate()`/`applyFinalizationGate()` — one-directional tightening only (`final`→`provisional`), fires when `sufficiencyLevel === 'insufficient'` and no `primaryCitation`. Adds `result.finalizationGate = {blockedBy, reason}`. |
| `backend/src/safescope-v2/safescope-v2.controller.ts:262` | Wires `applyFinalizationGate(applyEvidenceFoundation(...))`, wrapped by `sanitizeHazLenzDisplayOutput`. Unlike `evidenceSufficiency` (stripped), `resultStage`/`mayFinalize`/`finalizationGate`/`humanReviewRequired` are **not** in `HIDDEN_STANDARD_OUTPUT_FIELDS` — they do reach the HTTP response body. |
| Test files only: `hazlenz-clarification-gauntlet.ts`, `hazlenz-independent-standards-audit.ts`, `c03_finalization_gate_unit_tests.ts`, `c03_live_harness.ts` | Assertions only. |
| `orchestration/intelligence-orchestrator.service.ts:425` | Comment only, no logic. |

**Zero matches** for `resultStage`, `mayFinalize`, `finalizationGate`, `humanReviewRequired`, or
`provisionalResult` anywhere in `frontend-next/` source. **Zero matches** in `backend/src/inspection/**`,
`backend/src/corrective-actions/**`, or `backend/src/reports/**`. No DB column, migration, or entity
field for either name — API-response-only, not persisted in any queryable form.

## Answers

1. **API effect only, confirmed.** The fields are computed correctly (C03) and reach the HTTP response,
   but nothing reads them beyond two backend test scripts.
2. **No user-visible product effect.** Confirmed by direct grep of the entire frontend source tree.
3. **No workflow enforcement effect.** `reconcileDecompositionFindings()` builds findings from
   `multiHazardDecomposition.hazards[]` regardless of these fields. Inspection completion
   (`inspection.service.ts:176-197`) only requires every current finding to have a completed human
   review — no dependency on `resultStage`/`mayFinalize` or on unanswered clarification questions.
4. **No reporting effect.** Zero references in `backend/src/reports/**`; confirmed again in the Phase 8
   trace that the generated report and its PDF never surface these fields.

**Conclusion: "resultStage/mayFinalize remain unused by the frontend" is STILL TRUE**, unchanged since
the prior (pre-midpoint) audit. The one indirect behavioral change from C03 is that its fallback
clarification question (`buildEvidenceSufficiencyClarificationQuestion`) now populates
`clarificationQuestions` when otherwise empty — and that *singular* field is rendered
(`inspection-workspace/page.tsx:883`). So a vague-evidence case now has a narrow, indirect, single-question
user-facing effect. The `resultStage`/`mayFinalize`/`finalizationGate` fields themselves remain dead
weight: no reader, no persistence, no workflow-enforcement role, no report role.

## Option ranking (informational indicator vs. clarification UI vs. blocking vs. no integration)

- **Option A — informational indicator only** ("HazLenz needs more information before this analysis is
  considered final"). **Recommended as the next step, if any.** Low regression risk (purely additive
  read), directly answers the audit's own calibration finding that a well-evidenced case can score below
  `partially_sufficient` — an indicator framed as informational (not a hard gate) tolerates that
  calibration weakness safely, since it never blocks a real workflow action on a possibly-miscalibrated
  score.
- **Option B — clarification-focused UI** (expose the decision-critical missing evidence, let the user
  resolve it). **Second choice**, contingent on first fixing the coverage gap found in Phase 4 (the
  narrow finalization gate only recognizes 5 hardcoded hazard-family IDs as "safety-decisive" —
  see `V5_MIDPOINT_SUFFICIENCY_CALIBRATION.md`). Building a clarification UI on top of an
  under-covering gate would create a false sense of completeness for hazard families the gate doesn't
  reach.
- **Option C — block a specific UI action** (e.g., prevent finalize when `mayFinalize:false`). **Not
  recommended yet.** The scoring composition has confirmed defects (negation-blind keyword scoring
  pushing scores in the wrong direction on two of the 13 tested categories) and the narrow gate's
  known false-insufficient behavior on well-evidenced historical/planned-future cases. Blocking a real
  user action on a signal with these known miscalibrations carries meaningful workflow-disruption risk
  for insufficient safety benefit until Phase 4's findings are addressed.
- **Option D — no frontend integration yet.** Defensible as a "do nothing further" baseline, but Option A
  is strictly better: it costs little, is purely additive, and starts giving real product value to work
  C03 already paid for.

**Ranking: A > B > D > C** (informational first; enforcement last and only after calibration work).
