# Corrective action and calendar model

Status: **unresolved**.

Corrective actions are backend-persisted and organization-scoped. Calendar events and personal tasks are localStorage records. No stable synchronization or projection identity connects them.

Recommended product model: corrective actions are durable source records; calendar/to-do entries are server-derived projections keyed by corrective-action ID. Personal tasks, if retained, need a distinct durable user-private entity. Until approved, no dual-write or silent local success was introduced.
