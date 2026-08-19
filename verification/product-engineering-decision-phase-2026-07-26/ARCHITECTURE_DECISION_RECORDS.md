# Architecture decision records

## ADR-001 — Individual or one organization

- **Decision/context:** Users may be independent or have one active membership. Current direct organization field lacks role history; multi-org is unneeded for first release.
- **Options:** direct nullable FK; one-active membership; unrestricted many-to-many.
- **Selected/why:** one-active membership preserves simplicity and future migration.
- **Rejected:** direct FK cannot model invitation/role; many-to-many adds context switching.
- **Consequences/impacts:** membership migration, JWT context update, no org switcher.
- **Authorization/tests:** membership-derived scope; zero/one/duplicate/leave tests.
- **Risks/deferred:** consultants across organizations deferred.

## ADR-002 — XOR site ownership and inherited scope

- **Decision/context:** Site is owned by one user or one organization; inspection descendants inherit.
- **Options:** user only, org only, dual nullable without constraint, XOR.
- **Selected/why:** XOR supports both modes without ambiguous ownership.
- **Consequences:** check constraints, server-derived ownership, controlled transfer.
- **Testing:** mass assignment, transfer, B1, archived parents.
- **Risk:** legacy ambiguous rows go to quarantine.

## ADR-003 — Private drafts, collaborative finalized records

- **Decision:** Organization drafts are creator/assignment/manager/admin only; finalized records are organization-readable.
- **Rejected:** creator-only blocks teams; all-member drafts expose unfinished work.
- **Consequences:** assignment entity and state-aware authorization.
- **Testing:** A2 assigned/unassigned and manager/admin matrix.

## ADR-004 — Observation, analysis, review, finding separation

- **Decision:** Raw observation, immutable HazLenz snapshot, immutable human decision, and reviewed finding are separate.
- **Why:** preserves evidence and accountability; HazLenz remains advisory.
- **Rejected:** embedded mutable JSON and regenerated-on-open results.
- **Consequences:** new tables and explicit selection/version links.
- **Testing:** immutability, manual fallback, revisions, historical hydration.

## ADR-005 — Four-state inspection lifecycle

- **Decision:** draft → in_review → completed → archived, with audited reopen creating a new revision.
- **Rejected:** binary state lacks review gate; complex configurable workflow is premature.
- **Consequences:** transition commands, optimistic versions, report eligibility.
- **Testing:** every transition/actor/precondition.

## ADR-006 — Immutable versioned reports

- **Decision:** one inspection revision produces durable immutable PDF report versions with PostgreSQL metadata and object storage.
- **Selected generation:** synchronous for pilot with timeout; queue if measurements fail.
- **Rejected:** local-only, mutable, regenerate-on-read, DB blobs.
- **Testing:** failure/idempotency/version/file authorization.

## ADR-007 — Actions/tasks are sources; calendar is projection

- **Decision:** corrective actions and tasks persist; calendar merges them.
- **Rejected:** local calendar and dual-write calendar rows.
- **Consequences:** server calendar endpoint and local import review.
- **Testing:** projection consistency and completion delegation.

## ADR-008 — Private S3-compatible storage

- **Decision:** metadata in PostgreSQL; objects private; backend authorization and ≤60-second signed URLs.
- **Rejected:** ephemeral/local disk and DB blobs.
- **Migration impact:** replace static uploads and raw URI fields.
- **Testing:** type/signature/size, scope, expiry, cleanup.
- **Open external:** provider/region/key policy.

## ADR-009 — Subscription plus explicit entitlement grants

- **Decision:** one backend resolver combines provider subscription and expiring Pilot/Test grants.
- **Rejected:** user plan flags, frontend overrides, hidden bypasses.
- **Consequences:** canonical grant table, production-impossible fixture.
- **Testing:** free/pro/pilot/test/expired/cross-user.

## ADR-010 — Global governed knowledge

- **Decision:** standards/shared knowledge global and user read-only; feedback enters review queue; admin/ingestion publishes versions.
- **Rejected:** tenant copies and direct edits.
- **Consequences:** provenance/version release model and global admin role.
- **Testing:** publication authority and historical references.

## ADR-011 — Draft recovery, not full offline sync

- **Decision:** local drafts/queue are visibly provisional; finalized state requires server.
- **Rejected:** local source of truth and removal of all recovery.
- **Consequences:** namespace isolation, idempotency, conflict UI.
- **Testing:** interruption, user switch, logout, conflict, DB confirmation.

## ADR-012 — Clone-first quarantine reconciliation

- **Decision:** forward-only migration on two restores; unknown ownership/provenance quarantined; exact fingerprint before baseline.
- **Rejected:** reset, guessed owner, ad hoc migration history.
- **Consequences:** mapping manifest, operator report, restore drill.
- **Testing:** row conservation, repeatability, rollback, app workflow.

## ADR-013 — Invite-only limited pilot

- **Decision:** approved accounts, explicit pilot grants, qualified review, no public launch.
- **Why:** foundational workflow can be validated without representing HazLenz/public operations as ready.
- **Deferred:** public self-service and unsupervised decisions.
