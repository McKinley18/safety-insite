# Clarification/version architecture

`HazLenzAnalysis` uses `(observationId, idempotencyKey)` and `(observationId, requestVersion)` unique indexes. `InspectionService.addAnalysis` checks idempotent replay, takes a PostgreSQL advisory transaction lock per observation, rejects non-increasing request versions with HTTP 409, supersedes the current row, and writes the new row as `current`.

The browser stores clarification answers in the analysis payload and reissues authenticated classify plus analysis requests. There is no separate clarification-answer table in the inspected schema.
