# Active application map

## Runtime truth

`AppModule` imports organizations, sites, reports, billing, dashboards, uploads, standards/knowledge, legacy SafeScope and SafeScope v2. It does **not** import `InspectionModule`, although an inspection controller/service/entity exists.

| Concept | Implementation | Classification | Evidence |
|---|---|---|---|
| User | `users/user.entity.ts` | Canonical active for auth | UUID, one nullable `organizationId` |
| Organization | `organizations/entities/organization.entity.ts` | Canonical active | Direct one-to-many sites |
| Membership | no membership entity | Missing/unknown | User has only one organization FK-shaped field |
| Site | entity + empty `SitesModule` | Transitional | No controller or service |
| Inspection | `inspection/*` | Legacy but referenced | Module absent from `AppModule`; frontend uses offline store |
| Observation | frontend local inspection shape / backend `Hazard` | Competing | No durable observation endpoint |
| Finding | report `Finding`, audit-entry finding, frontend finding shapes | Competing | Different parents and fields |
| HazLenz result | HTTP response, reasoning snapshots, frontend embedded JSON | Competing | No canonical inspection-analysis FK |
| Human review | supervisor validation/review/audit/frontend state | Competing | No single workflow record |
| Report | `reports` entity/API plus local report store | Competing active | Migration columns differ from entity |
| Corrective action | backend entity/API plus frontend/calendar projections | Transitional | Backend durable, calendar relationship undefined |
| Calendar/to-do | `lib/safetyCalendar.ts` localStorage | Canonical UI, not durable | No backend calendar entity/API |
| Evidence | report attachment URI plus upload static URL | Unsafe transitional | No ownership-bearing file record |
| Entitlement | backend subscription guard | Canonical active | No safe release fixture |

## Competing frontend state

The core workflow uses `reportStorage`, `cloudReports`, `offlineInspectionStore`, `offlineInspectionWiring`, `offlineQueue`, `safetyCalendar`, and a HazLenz offline fallback. A cloud failure can therefore produce local state that looks complete. This prevents a durable release assertion.

## Stop-condition consequence

Choosing one implementation would remove or reinterpret still-routed behavior. That is a product/domain decision, not a safe integration repair.
