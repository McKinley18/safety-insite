# User and organization model

## Decision

A user may operate independently or have one active organization membership. Multiple concurrent organization memberships are deferred.

## Selected option

- `User` exists independently of organizations.
- `OrganizationMembership(userId, organizationId, role, status, invitedByUserId, joinedAt, endedAt)` is canonical.
- A partial unique constraint permits at most one active membership per user.
- Organizations have many sites; a site never belongs to multiple organizations.
- A site is either user-private or organization-owned, never both.
- Organization context is derived from the authenticated membership and selected site, never an arbitrary client field.
- Invitations and membership management are included for the pilot because A1/A2 collaboration cannot be tested or operated without them.

## Lifecycle decisions

- Private-to-organization transfer is supported only as an explicit manager/admin operation before an inspection is completed.
- Transferring a site transfers its non-completed inspections after a preview and audit event. Completed inspections/reports are not silently re-owned; they require an explicit migration operation.
- Organization departure immediately removes access to organization records, including records created by the departing user. Managers must reassign active drafts/actions before ending membership, or the operation is rejected.
- Organization deletion is not self-service in the pilot. Administrators may archive it; hard deletion requires operator review, export, retention checks, and an empty/settled ownership plan.

## Context and alternatives

Direct `User.organizationId` is simpler but cannot represent invitation status or role history. Full many-to-many membership supports future consultants but adds context switching and authorization complexity unsupported by current needs. A membership table with a one-active-membership constraint preserves a clean upgrade path.

## Consequences

- Migration: populate memberships from defensible existing `User.organizationId`; keep legacy column read-only during transition, then remove in a later migration.
- Frontend: independent users see no organization switcher; organization users see organization identity but no multi-org selector.
- Backend: all ownership derives from membership/site scope.
- Authorization: membership status is checked on every organization-scoped request.

## Testing requirements

Zero-membership, one-membership, duplicate-active-membership rejection, invite accept/expire/revoke, departure/reassignment, private/organization site XOR, transfer preview/apply, and cross-organization denial.

## Risks and deferred work

Multi-organization consulting and organization merge/split are deferred. Legal data-retention requirements remain external.
