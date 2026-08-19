# Version ownership map

The authoritative observation version is the observation returned by `GET /inspections/:inspectionId` (and the response to `PATCH /inspections/observations/:id`). The workspace previously copied that value into local inspection state without a post-mutation refresh. The corrected path refreshes the inspection after PATCH and uses the refreshed observation for subsequent edits; reanalysis independently refreshes before creating an analysis snapshot and derives the next request version from persisted snapshots plus the local monotonic counter.

No server-side concurrency check was changed. A stale independent editor still receives `409 Conflict`.
