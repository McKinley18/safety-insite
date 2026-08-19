# Synchronization verification

The real authenticated Chromium run used one persisted inspection and three sequential UI revision/reanalysis cycles:

| Cycle | Version before | PATCH | Version after save | Classify | Snapshot | Current finding result |
|---|---:|---:|---:|---:|---:|---|
| 1 | 1 | 200 | 2 | 201 | 201 | electrical retained; machine-guarding superseded |
| 2 | 2 | 200 | 3 | 201 | 201 | electrical retained; mobile-equipment added; guarding superseded |
| 3 | 3 | 200 | 4 | 201 | 201 | mobile-equipment retained; powered-industrial-trucks added; prior electrical/guarding superseded |

The deliberate stale-write regression used the current version for one independent update (200), then reused that old version for a second update (409, `Conflict: Observation was modified by another request.`). Thus sequential same-session edits succeed and genuine stale writes remain rejected.

The run recorded no hydration errors. One unrelated offline bundle request returned 404; it did not affect the authenticated workflow or analysis responses.
