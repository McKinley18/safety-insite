# Offline assessment

Repository inspection found localStorage-backed helpers for offline inspections/findings/photos/report drafts/queued operations, but no complete durable synchronization proof. The safe supported contract is currently draft/local persistence only with online authentication required for analysis, clarification, finalization, tasks, and reports. Reconnect idempotency, conflicts, stale writes, quota handling, and authentication recovery remain NOT TESTED; UI must not imply server persistence while offline.
