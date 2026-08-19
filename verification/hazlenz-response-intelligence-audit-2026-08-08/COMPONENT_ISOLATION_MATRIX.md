# Component isolation matrix

This map separates reasoning layers so future fixes remain attributable. Status is based on direct evidence, not aggregate benchmark success.

| Component | Status | Direct evidence | Limitation / modification gate |
|---|---|---|---|
| input_normalization | VERIFIED_WITH_LIMITATIONS | Direct corpus and new audit exercise normalization; image-content reasoning is not independently proven. | Evidence attribution and image semantics need independent validation. |
| observation_parsing | VERIFIED_WITH_LIMITATIONS | New audit recognized realistic shorthand and direct observations, but parser quality was scored only through downstream outputs. | Add parser-level provenance and temporal/negation fixtures. |
| classification | VERIFIED_STABLE | Frozen family recall 100%, adjudicated ACTIVE/semantic recall 100%, and 60 new observations recognized their intended family. | Do not broaden taxonomy without negative/safe-state regression. |
| decomposition | VERIFIED_WITH_LIMITATIONS | Prior authenticated multi-hazard evidence and new sibling cases show separate families/states. | Direct mechanism completeness on three-or-more hazards remains limited. |
| mechanism_reasoning | VERIFIED_WITH_LIMITATIONS | Structured mechanismChain was present and concrete in sampled outputs. | Consequence and exposure narratives still need domain-depth review. |
| temporal_state | VERIFIED_WITH_LIMITATIONS | State-aware metrics are 100%; known solvent release temporal case remains CONTRADICTORY rather than clean HISTORICAL. | Refine temporal source ordering without changing active-sibling suppression. |
| clarification | VERIFIED_WITH_LIMITATIONS | Clarification recall is 100%; audit found targeted questions in ambiguous cases. | Question necessity and partial-answer quality need qualified review. |
| standard_applicability | VERIFIED_WITH_LIMITATIONS | Protected rules and prior regressions pass; new audit found 17/60 without a specific standard candidate. | Regulatory applicability requires qualified review and knowledge coverage expansion. |
| citation | VERIFIED_STABLE | Protected citation ranking/recovery hashes unchanged; prior dedicated regressions pass. | Modify only with traced reproducible citation defect. |
| corrective_actions | VERIFIED_WITH_LIMITATIONS | Generated actions and hierarchy fields were present across the audit. | Several action descriptions contain generic or mismatched template text; audit is not a professional adequacy proof. |
| response_composition | ACTIVE_INVESTIGATION | Before fix, narrative.service.ts emitted explicit placeholder prose for all 60 scenarios; focused regression and 12-case post-fix run pass after enrichment. | Run the full 60-case post-fix audit and frontend render verification. |
| controller_projection | VERIFIED_WITH_LIMITATIONS | Prior sibling-preservation fix and current full structured responses pass. | Confirm no field-specific UI adapter strips enriched narrative. |
| persistence_projection | VERIFIED_WITH_LIMITATIONS | Prior finding/review/report lifecycle evidence remains valid; this iteration did not change persistence. | Run persisted response snapshot with enriched narrative. |
| frontend_rendering | VERIFIED_WITH_LIMITATIONS | Existing panels render mechanism/actions, but current audit did not use Chromium. | Run authenticated browser visual/accessibility check of enriched narrative. |

## Source files

- **input_normalization**: backend/src/safescope-v2/evidence/evidence-fusion.service.ts, backend/src/safescope-v2/brain/observation-context/observation-context.service.ts
- **observation_parsing**: backend/src/safescope-v2/brain/observation-understanding/observation-understanding.service.ts
- **classification**: backend/src/safescope-v2/classifier/weighted-classifier.service.ts, backend/src/safescope-v2/hazard-universe/hazard-universe.registry.ts
- **decomposition**: backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts
- **mechanism_reasoning**: backend/src/safescope-v2/brain/scenario-intelligence/scenario-intelligence.service.ts, backend/src/safescope-v2/inspection-intelligence/inspection-intelligence.service.ts
- **temporal_state**: backend/src/safescope-v2/safescope-v2.service.ts, backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts
- **clarification**: backend/src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.service.ts, backend/src/safescope-v2/safescope-v2.service.ts
- **standard_applicability**: backend/src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts, backend/src/safescope-v2/standards-intelligence
- **citation**: backend/src/safescope-v2/brain/citation-review-brain/citation-review.service.ts, backend/src/safescope-v2/inspection-intelligence/citation-recovery
- **corrective_actions**: backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts, backend/src/safescope-v2/action-engine
- **response_composition**: backend/src/safescope-v2/brain/narrative-generator/narrative.service.ts, backend/src/safescope-v2/safescope-v2.service.ts
- **controller_projection**: backend/src/safescope-v2/display/guided-finding-response.ts, backend/src/safescope-v2/safescope-v2.controller.ts
- **persistence_projection**: backend/src/safescope-v2/persistence, backend/src/safescope-v2/finding
- **frontend_rendering**: frontend-next/components/safescope/panels/IntelligencePanel.tsx, frontend-next/components/inspection/HazLenzFindingSummary.tsx
