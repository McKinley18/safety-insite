# Concurrency and idempotency

The focused backend regression exercised accepted analysis, duplicate replay, add/remove reconciliation, and stale analysis. It proved HTTP 409, monotonic versions, one current analysis, and no duplicate findings.

The prior browser evidence also proves two-context stale reanalysis rejection and recoverable refresh behavior. New durable finding reconciliation remained serialized by the same advisory-lock transaction. Duplicate report generation through Chromium returned the existing report (HTTP 201 response with the same report ID/version/checksum); foreign report access returned 404.

Risk review, corrective-action generation, task completion, finalization, and report generation do not yet have a complete browser-level stale/duplicate matrix after finding materialization. These are retained as High blockers rather than inferred as passed.
