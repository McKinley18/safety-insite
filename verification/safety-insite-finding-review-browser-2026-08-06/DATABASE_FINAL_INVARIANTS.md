# Database final invariants

Disposable database: `phase11_finding_browser`.

| Entity | Count |
|---|---:|
| inspections | 1 |
| observations | 1 |
| HazLenz analyses | 1 |
| current findings | 2 |
| human reviews | 2 |
| corrective actions | 2 |
| tasks | 2 |
| reports | 1 |
| report versions | 1 |
| security audit events | 13 |

Finding relationships:

| Hazard key | Finding ID | Status | Final review |
|---|---|---|---|
| electrical | `e6e0067d-e2f1-4e95-8328-0846e68eae92` | finalized | `c4884234-6046-4f6b-801d-bf77ec9c349c` |
| fall-protection | `cd87c150-60b6-402f-92ed-d7688d2a7ff3` | finalized | `9d846b28-2846-4598-84a2-3f2ac5875146` |

Audit action counts: `file_upload_completed=2`, `finding_materialized=2`, `finding_review_created=2`, `finding_review_finalized=4`, `inspection_finalized=1`, `inspection_transitioned=1`, `report_generated=1`.

Report download: HTTP 200, 2,737 bytes, SHA-256 `4fbded3c95fa14ef46d0ce980a80f735cbaba4c6490146751349e08ce582d0fd`, matching the persisted checksum. Duplicate unchanged generation returned the same report/version/checksum twice.
