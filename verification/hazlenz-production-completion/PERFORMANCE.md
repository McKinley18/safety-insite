# Performance

Regulatory connectors now fetch each source URL once per ingestion run rather than once per parsed record. Analysis version serialization uses a transaction-scoped advisory lock and indexed lookups. Candidate/version ordering is deterministic.

No full load, memory-growth, or query-plan benchmark was completed. Performance is not a production-ready verdict.

