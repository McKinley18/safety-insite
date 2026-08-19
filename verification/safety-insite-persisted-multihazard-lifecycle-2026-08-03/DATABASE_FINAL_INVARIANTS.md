# Final database invariant query notes

Disposable database `phase9_persisted_multihazard` had 32 migrations. Read-only completed inspection aggregation returned:

* `7e09abad-ab41-4267-988a-dd6eea6d1811`: 2 active findings, 2 actions, 2 tasks, 1 report.
* `90fded51-5dbf-4d80-ba2b-5eca811a8fe7`: 4 active findings, 4 actions, 4 tasks, 1 report.
* `e03e7e4b-91a4-46ab-a38c-83e7fb2e39f8`: 3 active findings, 3 actions, 3 tasks, 1 report.

The focused script additionally verified historical finding preservation, stale 409, monotonic analysis IDs/versions, and replay deduplication. New tasks carry `correctiveActionId`. The requested complete per-finding risk-review and audit invariants are not yet satisfied because legacy reviews are observation-scoped.
