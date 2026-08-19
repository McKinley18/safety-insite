# Authorization route matrix

| Route family | Authentication | Scope/mutation policy | Evidence |
|---|---|---|---|
| evidence upload | JWT | editable parent inspection | report/storage integration |
| file get/delete | JWT | parent/scope; delete creator only | cross-user 404 |
| report generate | JWT + cloudReports | accessible completed inspection | browser + API |
| report list/get/download | JWT | report parent inspection/scope | cross-user 404 |
| branding upload | JWT + teamMembers | organization manager/admin | static review/build |
| entitlement grant/revoke | JWT | platform_admin only | ordinary user 403 |
| legacy report | legacy routes remain | no canonical object access | quarantine report |
| sites/inspections/findings/actions/tasks | JWT | canonical individual/org scope | A1/A2/B1 11 assertions |

Foreign-resource policy is 404 for tenant records. Entitlement administration uses 403 for missing administrative privilege.

Residual: the complete inventory of every legacy HazLenz/knowledge/diagnostic endpoint remains broader than the affected Phase 5 route matrix.
