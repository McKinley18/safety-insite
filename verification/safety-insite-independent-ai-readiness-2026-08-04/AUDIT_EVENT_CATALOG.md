# Audit event catalog

Implemented structured events include `finding_materialized`, `finding_materially_changed`, `finding_retained_unchanged`, `finding_superseded`, `finding_review_created`, `finding_review_finalized`, `inspection_finalized`, and existing report/task events. Metadata carries inspection, observation, finding, analysis, request version, review, and status identifiers. Events are written transactionally for reconciliation/finalization paths. A complete denial catalog and cross-tenant audit-read matrix remain incomplete.
