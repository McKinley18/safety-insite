# Audit evidence

The disposable `security_audit_events` table contains durable events for the exercised actions, including 12 `finding_materialized`, 9 `finding_review_created`, 13 `finding_review_finalized` (including repeated review attempts), 3 `inspection_finalized`, 3 `inspection_transitioned`, and 3 `report_generated` events. Actor IDs were the owner, resource IDs and timestamps were populated, and no success event was emitted for the rejected partial finalization.
