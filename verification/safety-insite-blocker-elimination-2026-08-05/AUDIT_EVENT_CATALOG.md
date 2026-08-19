# Audit event catalog

The phase exercised and/or verified these structured events:

- `entitlement_denied` in `security_audit_events` for paid-feature denials (35 disposable rows).
- `inspection_created`, `analysis_created`, `finding_materialized`, `finding_review_created`, and `inspection_finalized` in the canonical inspection path.
- `report_generated` for each generated immutable report version.
- `report_generation_duplicate_replayed` for unchanged duplicate requests.
- Existing storage authorization events for report object access and denial.

Events include actor, organization where available, action, resource type/id, and non-sensitive metadata. The matrix verified foreign and unauthenticated denial behavior without resource disclosure.
