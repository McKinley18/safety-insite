# State persistence model

## Current classification

| Store | Current role | Risk |
|---|---|---|
| auth localStorage | session source | token exposure |
| `offlineInspectionStore` | offline inspection source/queue | can masquerade as completed persistence |
| `reportStorage` | local report source | merged with cloud records |
| `cloudReports` | backend client | model conflicts with local shape |
| `safetyCalendar` | local first-class tasks/events | not cross-device or durable |
| offline HazLenz fallback | advisory analysis | can be mistaken for server analysis |
| offline queue | temporary sync queue | idempotency contract absent |

## Required separation

Server state must be authoritative for finalized inspections, findings, analyses, reviews, reports and corrective actions. Local records must carry `local`, `queued`, `sync_failed`, or `synced` status plus tenant/user namespace and server ID. UI success must mean a committed server response. Logout must clear or cryptographically isolate user data.

This requires a durable API and an offline synchronization design larger than a safe Phase 3 patch. Under the stop condition, existing production behavior was documented but not broadly rewritten.
