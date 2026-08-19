# Local Storage Workflow Audit

## Migrated in Phase 6

The active `/reports` screen now lists canonical server reports and immutable versions. Download uses an authenticated API call and validates PDF content. It no longer presents locally generated report objects as durable server records.

## Permitted local state

- Theme and display preference
- Local draft recovery and offline queue, provided the UI labels it unsynced
- Offline knowledge bundle/cache
- Authentication token under the current architecture

## Remaining conflicts

The guided inspection route, quick/offline inspection wiring, `reportStorage`, `reportGenerationService`, `evidenceStorage`, `actionStorage`, `safetyCalendar`, and workspace/dev organization helpers still contain local-first assumptions. Some may be dormant or transitional, but they are not all proven incapable of presenting local state as durable.

The Phase 6 browser gate independently verifies persisted server/database state and report reauthentication, so it does not pass due to stale local state. However, much of the workflow after site creation is exercised through real API calls from the browser context rather than every existing interactive form.

This residual divergence blocks a supervised pilot GO until the chosen inspection UI is fully wired to canonical persistence and stale local writes are conflict-safe.

