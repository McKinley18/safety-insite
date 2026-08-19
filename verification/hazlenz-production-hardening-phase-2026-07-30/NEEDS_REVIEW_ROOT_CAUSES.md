# NEEDS REVIEW root causes

All 86 records were parsed from the original, holdout, and expanded result files into `NEEDS_REVIEW_RESULTS.json`.

| Overlapping cluster | Count | Safe disposition |
|---|---:|---|
| Material predicate missing | 35 | Candidate or review until observable predicate is answered |
| Standard selection/hydration limitation | 35 | Do not promote without approved source/release |
| Regulatory family absent | 32 | Unsupported-family response; governed ingestion required |
| Clarification missing/unresolved | 29 | Add only family-schema questions that can change outcome |
| Safe/corrected/control state unresolved | 25 | Preserve temporal/control uncertainty |

Counts overlap. The most frequent issues require authoritative family releases, not lower thresholds. Genuine evidence insufficiency should remain NEEDS REVIEW.

