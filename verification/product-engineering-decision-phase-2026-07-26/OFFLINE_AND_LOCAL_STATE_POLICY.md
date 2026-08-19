# Offline and local state policy

## Decision

The limited pilot supports local draft recovery, not full offline-first synchronization.

## State classes

| State | Authority | UI label |
|---|---|---|
| Server record | backend/database | Saved |
| Local draft not submitted | browser namespace | Local Draft |
| Submitted, awaiting response | queue | Sync Pending |
| Submission failed | queue | Sync Failed |
| Cached server record | server remains authority | Cached / last synced time |

Finalization, completion, HazLenz analysis promotion, corrective-action durability, and report generation require server confirmation. No local-only item may display a server ID, finalized/completed state, generated report, or durable calendar result.

## Namespacing and security

Local keys include user ID and scope ID (`private:userId` or `org:organizationId`). Logout removes tokens, decrypted keys, queues, cached sensitive data, and drafts unless the user explicitly exports a draft before logout. Organization departure invalidates that namespace. Stale data from a different identity is never merged.

Each queued mutation has a client idempotency key, entity type, base server version, created time, retry count, and status. Automatic conflict merge is prohibited; version conflicts require user review.

## Current conflicting paths

`reportStorage`, `cloudReports` merge behavior, `offlineInspectionStore`, `offlineInspectionWiring`, `offlineQueue`, `safetyCalendar`, `secureStorage` (currently localStorage), offline HazLenz fallback, activity/report settings, and local vault logic must be reclassified or retired. Local calendar/report stores cannot remain production sources of truth.

## Context and alternatives

Removing all draft recovery would harm field usability. Full offline synchronization requires conflict resolution, file queuing, encryption, and lifecycle reconciliation beyond pilot needs. The selected middle path preserves interruption resilience without false persistence.

## Impacts and testing

Frontend must expose state badges and use server acknowledgements. Backend needs idempotency and optimistic versions. Tests clear browser storage, switch users/scopes, interrupt requests, refresh, retry, conflict, logout, and verify database state.

## Risks and deferred work

Browser local storage remains sensitive; use minimal encrypted IndexedDB for drafts in later work. Full offline analysis/sync and cross-device draft merging are deferred.
