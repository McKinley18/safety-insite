# Global knowledge governance

## Decision

Regulatory standards, source registry, citation aliases, applicability rules, shared HazLenz knowledge, and rule/model versions are global. Normal users have authenticated read-only access. Tenant-specific knowledge is deferred.

## Write model

- Users submit corrections/feedback into `KnowledgeReviewQueue`; they never mutate published records.
- Platform administrators triage, approve, reject, and publish.
- Controlled ingestion service identities may create draft versions and publish only through a reviewed manifest/release process.
- Every publish records actor/process, source URL/document, source hash, effective date, jurisdiction, prior version, review decision, and release identifier.
- Published records are immutable; correction creates a new version and retires the old version without removing historical report references.

HazLenz analyses reference exact standard/knowledge/rule versions. Opening an old inspection hydrates the stored snapshot, not current rules.

## Administrative access

No customer-content browsing is implied by platform admin. Knowledge administration is a separate platform permission. A production UI is not required for the pilot; an audited CLI or protected internal endpoint is sufficient.

## Context and alternatives

Tenant-owned regulatory copies were rejected because they fragment authority and complicate updates. Direct user editing was rejected for safety and provenance. Tenant-specific operational procedures may be added later as a distinct overlay, never as replacement regulatory text.

## Migration and impacts

The five extra SafeScope knowledge tables are preserved and mapped into global canonical tables after source/version review. Unknown provenance is quarantined or left legacy read-only. Frontend feedback becomes submission status. Backend review/admin routes require platform permission and immutable audit events.

## Testing, risks, deferred work

Test read access, write denial, feedback isolation, admin publish, service identity scope, version immutability, source provenance, and old-snapshot hydration. Expert governance, corpus completeness, and tenant overlays remain deferred from the foundation implementation.
