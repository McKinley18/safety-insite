# Audit-history assessment

Focused database evidence confirms security-audit rows are written for selected authentication/authorization events and canonical regression state changes. The current split-hazard browser path does not emit a complete auditable chain for clarification → per-hazard review → action → task → finalization → report because those split findings are not persisted by the canonical workflow. Required coverage still needs explicit proof for stale reanalysis denials, duplicate replay semantics, per-hazard actions/tasks, report downloads, and tenant-denial events.

This is a High release blocker for defensible incident review. The next implementation must either persist the decomposition as first-class findings or explicitly constrain the canonical workflow to one finding and prevent a misleading multi-hazard report.
