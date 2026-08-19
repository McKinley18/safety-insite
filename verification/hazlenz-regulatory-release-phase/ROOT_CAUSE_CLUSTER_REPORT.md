# NEEDS REVIEW root-cause clusters

The 58 review cases comprise 45 original and 13 holdout cases.

| Cluster | Frequency | Root cause | General solution | Expected effect | Regression risk |
|---|---:|---|---|---|---|
| Required family absent | 25 | Evidence foundation covers a deliberately limited predicate-family set; some applicable families are only in legacy ranking | Add reviewed family predicates only after authoritative source hydration | Converts supported cases without guessing | High if predicates are oversimplified |
| Material clarification absent | 31 | No applicable family was generated, so no predicate-specific question existed | Derive questions from an approved family schema, not generic prompts | Better evidence collection | Medium; excessive questioning harms intake |
| Candidate pending material predicate | 7 | Correct safety behavior for fall-zone, egress, and power-line unknowns | Preserve candidate until answer; improve answer closure | Some reviews resolve after answers | Low if promotion threshold remains strict |
| Supported family not promoted | 5 | Legacy output and evidence decision can disagree or a threshold fact remains unresolved | Make structured applicability decision authoritative after hydration | Consistent API/frontend behavior | Medium |
| Jurisdiction/identity ambiguity | 7 | Site scope or covered activity is absent | Ask one jurisdiction/activity question before family evaluation | Prevents cross-jurisdiction leakage | Low |
| Safe/controlled ambiguity | 6 | Correction timing/control effectiveness not explicit | Preserve temporal state and request verification | Avoids unsafe suppression and false violations | Low |
| Multi-hazard prioritization | 4 | One observation contains multiple mechanisms but foundation selects first supported family | Decompose observations into evidence-linked hazard candidates | Better primary/secondary selection | High; deferred |

Counts overlap because one case may have multiple reasons. No cluster justifies lowering definitive-promotion thresholds.

## Decision

This phase does not add unverified regulatory families merely to improve PASS percentage. It fixes the deterministic seed packaging defect and retains conservative NEEDS REVIEW outcomes until authoritative predicates and source metadata exist.
