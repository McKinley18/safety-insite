# HazLenz Roadmap

## Immediate production blockers

1. **Canonical applicability decision record — Architectural.** Problem: multiple layers promote/suppress citations. Implement one typed decision per citation containing jurisdiction, controlling facts, missing facts, authority source/version, status, and reasons. Remove controller recovery. Verify with the 102-case suite and expert adjudication. Blocks production.
2. **Fact/evidence graph — Large.** Preserve observation source, negation, time, directness, control state, exposure, and contradiction instead of re-flattening to text. Verify all safe/contradictory pairs. Blocks unsupervised use.
3. **Regulatory corpus release manifest — Large.** Populate and version complete scoped text, reject unhydrated promotion, and produce coverage reports. Depends on data governance and expert review. Blocks standards claims.
4. **Memory split — Architectural.** Move heavy intelligence to a separately sized worker/service, cache compact indexes, and set timeout/circuit-breaker behavior. Verify under measured concurrent load. Blocks current hosting.

## Precision and safety stabilization

5. **Jurisdiction state machine — Medium.** Explicit unknown/multi-jurisdiction state; require resolved scope before active citation. Verify paired mine/plant/construction facts.
6. **Safe-state and contradiction gate — Medium.** No active violation, shutdown, or mandatory action when controls are affirmatively effective or facts conflict. Verify zero prohibited promotions in safety-critical pairs.
7. **Multi-hazard decomposition — Large.** Extract distinct exposure objects; select primary by imminent consequence/exposure, not keyword score. Verify multi-hazard and primary/secondary cases.
8. **Confidence calibration — Large.** Fit separate calibration curves for hazard, jurisdiction, and citation applicability on expert-labeled holdout data; abstain below thresholds.
9. **Corrective-action grounding — Medium.** Generate only after final decision and link each action to failed control/evidence/citation clause.
10. **Risk recalculation — Medium.** Calculate after final evidence state; expose consequence/likelihood inputs and uncertainty.

## Operational reliability

11. Add per-stage latency/memory/error metrics, trace IDs, structured decision logs, timeouts, and circuit breakers.
12. Add deterministic release bundles and a production diagnostic showing real commit, corpus version, and rule version.
13. Add a failure review queue populated from abstentions, overrides, and prohibited-family monitors.

## Field validation

14. Obtain independent MSHA and OSHA domain review of rubric and outputs.
15. Run anonymized field observations from multiple industries/sites; prohibit training on the held-out release gate.
16. Measure severe false positives/negatives, abstention utility, reviewer agreement, and action usefulness.

## Limited pilot readiness

Gate on: canonical schema deployed; no critical/high security findings; 100% human review; no automatic citations in final reports; corpus manifest complete for pilot scope; memory/load SLOs met; audit logs and rollback tested.

## General production readiness

Require jurisdiction-specific expert acceptance thresholds, statistically powered calibration, backup/restore drill, monitoring/on-call, privacy controls, and controlled release/rollback.

## Longer-term intelligence

Add source-aware semantic retrieval only after deterministic applicability gates; causal/multi-hazard reasoning; drift detection by domain; active learning from adjudicated corrections with governance and replayable datasets.

