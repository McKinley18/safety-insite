# Report model and persistence

Status: **blocked by explicit report-reconciliation stop condition**.

The active `Report` entity stores company/site strings, JSON narrative and frontend report JSON. Historical/canonical migrations define a different required report shape and lack complete parity with the active entity. Reports also exist in local browser storage and cloud merging logic.

The repository does not decide whether a report is immutable generated evidence, mutable metadata, a serialized frontend document, or a regenerated inspection projection. Therefore versioning, generation status, inspection FK, file retention and archival cannot be added safely.

Required decision: make reports immutable versioned artifacts derived from a finalized inspection, persist metadata/status/object key, and authorize retrieval through the inspection organization. A reviewed data mapping is required for legacy report rows.
