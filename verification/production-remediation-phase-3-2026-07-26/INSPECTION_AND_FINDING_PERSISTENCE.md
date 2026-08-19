# Inspection and finding persistence

Status: **not implemented; pilot blocker**.

The backend inspection controller supports only create/list and uses a `Hazard` child, but its module is not imported by `AppModule`. It has no site FK, lifecycle, draft/resume, idempotency, HazLenz snapshot, human-review audit, finding finalization, or completion semantics. Frontend inspection state is primarily local/offline. Report `Finding` and audit-entry finding are competing models.

The required lifecycle and canonical finding parent are product decisions. Activating the existing module would expose an incomplete API and incorrectly imply durable workflow support.
