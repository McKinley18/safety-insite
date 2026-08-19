# Legacy Route Inventory

| Reference | Classification |
|---|---|
| `/uploads/*` static serving | Removed in Phase 5; browser verified 404 |
| `/pdf/:id` | Removed; browser verified 404 |
| `/legacy/pdf/:id` | Authenticated compatibility tombstone; 401 unauthenticated, 410 authenticated |
| legacy `/reports` mutations | Moved under `/legacy/reports`; mutation/upload paths return 410 |
| `/legacy/reports/:id/explain` | Authenticated 410; fabricated explanation path retired |
| canonical `/inspection-reports/.../download` | Authenticated, parent-scoped streaming |
| frontend Reports links | Canonical authorized download helper |
| raw local report path | Not returned by canonical APIs |
| direct S3 URL | Not exposed by canonical APIs |
| `/upload/logo` | Authenticated, validated upload route; broader branding migration remains |

Repository searches also found dormant local report/evidence helpers and offline stores. They are classified in `LOCAL_STORAGE_WORKFLOW_AUDIT.md`.

