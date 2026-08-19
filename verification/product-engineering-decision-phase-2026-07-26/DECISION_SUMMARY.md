# Decision summary

## Decision

Safety InSite will be an inspection-first product supporting either an independent user or a user in one organization. Multi-organization membership is deferred. Core completed workflow data is server-authoritative. HazLenz remains advisory and its outputs are immutable snapshots subject to explicit human review.

## Selected model

- A user may have zero or one active `OrganizationMembership`.
- A site has exactly one scope: `ownerUserId` **or** `organizationId`, enforced by a database check constraint.
- An inspection inherits scope from its site and records its creator; clients cannot choose ownership fields.
- Organization drafts are private to creator, assigned collaborators, managers, and organization administrators. Finalized records are visible to all organization members.
- `Observation` is raw evidence; `Finding` is the reviewed conclusion.
- Each `HazLenzAnalysis` is an immutable snapshot. A `HumanReview` records acceptance, edits, dismissal, rationale, and reviewer.
- Reports are immutable, versioned artifacts generated synchronously from completed inspection versions for the pilot.
- Corrective actions and manually created tasks are durable records. Calendar is a combined read model, not a third source of truth.
- Private files use an S3-compatible storage abstraction and authorized backend access or short-lived signed URLs.
- Standards and shared knowledge are global/read-only to normal users. Feedback enters a review queue; only platform administrators or controlled ingestion processes publish.
- Local storage may recover drafts, but cannot represent finalization, reports, or actions as saved without server confirmation.

## Context and options

The repository contains inactive site/inspection paths, competing findings/reports, local calendar/report stores, no membership model, and 436 catalog differences. Options were: preserve the legacy shapes, build a multi-tenant collaboration platform immediately, or define a minimal inspection-first canonical model. The third option was selected because it supports existing individual and company product intent with the least authorization and migration complexity.

## Consequences

Frontend and backend APIs must be consolidated around server IDs and lifecycle states. Existing ownership fields require forward migration; ambiguous rows are quarantined. The current local-only workflow becomes draft recovery rather than production persistence.

## Testing requirements

Clean and restored-clone migrations, entity/schema parity, A1/A2/B1 authorization, lifecycle transition tests, private-file tests, entitlement tests, and a database-verified authenticated inspection-to-report browser gate are mandatory.

## Risks and deferred work

Deferred: multi-organization membership, full offline conflict resolution, tenant knowledge, recurring tasks, external calendar sync, asynchronous report jobs, public self-service launch, and unsupervised HazLenz. External choices remain for object-storage vendor, production email account, legal retention schedule, and hosting capacity.
