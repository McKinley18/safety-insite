# Authorization Matrix

| Resource | Unauthenticated | Owner | Same organization | Foreign tenant | Admin mutation |
|---|---:|---:|---:|---:|---:|
| Sites | deny | allow | policy/role scoped | 404 | n/a |
| Inspections/drafts | deny | allow | assignment/manager scoped | 404 | n/a |
| Observations/analyses/reviews/findings | deny | parent inherited | parent inherited | 404 | n/a |
| Corrective actions/tasks/calendar | deny | allow | role scoped | 404 | n/a |
| Evidence/storage objects | deny | allow | parent scoped | 404 | n/a |
| Immutable reports | deny | allow | inspection scoped | 404 | n/a |
| Entitlement grants | deny | no self escalation | no ordinary member | deny | platform admin only |
| Global knowledge/taxonomy/regulatory mutations | deny | no | no | no | platform admin only |

Canonical workflow regression: 19 scenarios, four cross-user denials, and mass-assignment rejection passed. Private report regression returned 404 for a foreign-user download.
