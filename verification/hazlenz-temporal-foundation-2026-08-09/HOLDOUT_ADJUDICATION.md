# First holdout adjudication (diagnostic only)

The first 20-case holdout is no longer authoritative after production changes. The ten original failures were reviewed against canonical decomposition and response fields:

| Case | Expected | Observed | Root cause | Assessment |
|---|---|---|---|---|
| tfh-01 | HISTORICAL | UNKNOWN | C, K | Resolved electrical event was retained only as SAFE_VERIFIED in decomposition; top-level projection lost historical event context. |
| tfh-04 | PLANNED_FUTURE | UNKNOWN | D, A | Scheduled maintenance restart had no hazard fragment and the top-level future rule only recognized hot work. |
| tfh-07 | HISTORICAL | UNKNOWN | C, K | Removed ladder was SAFE_VERIFIED in decomposition but historical removal context was lost at top level. |
| tfh-10 | INTERMITTENT | UNKNOWN | E, A | “Only during shift change” was not treated as recurrence; sibling mobile findings remained ACTIVE. |
| tfh-14 | PLANNED_FUTURE | UNKNOWN | D, A | Planned barricade with no decomposed hazard was not promoted to planned state. |
| tfh-15 | HISTORICAL | CONTRADICTORY | I, C | “No current leak or exposure” was incorrectly treated as a correction/current contradiction boundary. |
| tfh-16 | INTERMITTENT | UNKNOWN | E, A | Emergency-stop recurrence during shutdown was routed to an unrelated fragment and recurrence was not propagated. |
| tfh-18 | CORRECTED | UNKNOWN | F, C | Dry/verified-clear residual condition was not recognized as explicit correction. |
| tfh-19 | UNKNOWN | HISTORICAL | G, I | “Unsure whether still present” was over-promoted as historical electrical absence. |
| tfh-20 | SAFE_VERIFIED | CONTRADICTORY | H, I | Earlier energized state plus current verified lockout incorrectly preserved contradiction instead of current safe control. |

Focused generalized changes addressed the historical projection, recurrence vocabulary, uncertainty exclusion, residual-clear condition, and verified-zero-energy precedence. The planned-maintenance and emergency-stop cases still require further trace-level diagnosis; no holdout label was changed.

