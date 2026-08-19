# Authorization matrix

Static inventory found 39 controller files and 139 declared endpoint decorators; only the subset imported by `AppModule` is runtime-active. Runtime-active groups include auth, reports/PDF/transparency, actions, organizations, billing, standards/regulatory, HazLenz and feedback/review records, knowledge/review queues, audit/notifications, dashboards/analytics, upload, maintenance, and health.

| Group | Authentication | Scope finding | Status |
|---|---|---|---|
| Auth | Public except `/me` | account/self | tested |
| Organization | JWT; roles on mutation | `:id` and invite require JWT org equality | tested statically |
| Reports/attachments/PDF | JWT + entitlement | report service uses organization; related PDF/explain services require full verification | partial |
| Corrective actions/export | JWT + entitlement | organization predicates on list/update/export | A/B smoke pass |
| Dashboard/analytics | JWT + entitlement as marked | aggregate organization scope | smoke pass |
| Billing | JWT except signed webhooks | derives user from JWT for customer status | partial |
| HazLenz classify | JWT + entitlement | workspace/review persistence scoping inconsistent | partial |
| HazLenz feedback/snapshots/validations | JWT | workspace identifiers accepted in records; complete A/B proof absent | unverified |
| Knowledge/review/admin | JWT/entitlement varies | global regulatory corpus versus tenant governance semantics unresolved | product decision |
| Regulatory sync/maintenance | JWT plus secret/config switches | privileged global mutation; role policy incomplete | high risk |
| Upload | JWT + entitlement | created filename safe; static direct retrieval has no per-record authorization | failing |
| Health | public | no tenant data | active |

Because global knowledge ownership and same-organization collaboration rules are not specified, a defensible endpoint-by-endpoint remediation could not be completed without guessing product policy.
