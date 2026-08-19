# Role and permission model

## Decision

Use organization roles `member`, `manager`, and `organization_admin`. Independent ownership is not a stored organization role. `platform_admin` is a separate platform claim, never inferred from organization role. Automated jobs use narrowly scoped service identities.

## Collaboration rules

- A2 may view A1's **finalized/completed** organization inspections and reports.
- A2 may not view or edit A1's draft unless assigned as collaborator/reviewer.
- Creators and assigned collaborators edit drafts. Assigned reviewers, creator, managers, and organization admins may finalize findings.
- Members may generate a report from any completed organization inspection if entitled.
- An assigned member may update/complete their corrective action. Managers/admins may reassign and manage all organization actions.
- Managers may manage sites, assignments, and workflow records but not billing or organization deletion.
- Organization admins manage membership, settings, billing, archival, and all organization workflow records.
- Platform admins do not automatically browse customer content. Support access requires a time-limited reason-bearing grant and audit event.
- Organization drafts are private-by-default. Inspection assignment is supported through an assignment table.

## Permission matrix

| Resource/action | Independent | Member | Manager | Org admin | Platform admin |
|---|---:|---:|---:|---:|---:|
| Organization settings | — | read | read/update operational | full except hard delete | no automatic access |
| Membership | — | read self/list peers | invite/list | invite/change/end | support grant only |
| Sites | own CRUD/archive | read; create if policy enabled | CRUD/archive | CRUD/archive | no automatic access |
| Draft inspection | own | own/assigned | organization | organization | support grant |
| Completed inspection/finding | own | read organization | manage/archive/reopen | manage/archive/reopen | support grant |
| HazLenz review | own | own/assigned | organization | organization | no content access by default |
| Reports | own generate/read | org generate/read | org generate/read/archive | full/archive | support grant |
| Corrective actions/tasks | own | assigned/create; org-visible | manage/reassign | full | support grant |
| Evidence | parent scope | parent scope | parent scope | parent scope | support grant |
| Billing | own | none | none | manage | operational provider support |
| Standards/knowledge | read | read | read | read | publish/admin |
| Feedback/review queue | submit/read own | submit/read own | submit/read org | submit/read org | triage/publish |
| Diagnostics/maintenance | none | none | none | tenant-safe diagnostics only | explicit platform endpoint |

## Context and alternatives

Creator-only organization data defeats collaboration; all-member draft access exposes sensitive unfinished work. Private drafts plus assignment balances both. Reusing legacy role strings was rejected because casing and meanings conflict.

## Backend and authorization impact

Centralize role enums, membership resolution, parent-scope lookup, and consistent 404 foreign-resource policy. Client-supplied user/organization/creator fields are rejected. Platform support grants must include approver, reason, expiry, customer scope, and audit log.

## Testing requirements

Every active route gets independent, A1, A2-unassigned, A2-assigned, manager, org-admin, B1, and platform-admin-with/without-grant cases, including aggregate/search/export/file leakage.

## Risks and deferred work

Custom roles and fine-grained permissions are deferred. Site creation by ordinary organization members defaults to allowed for the pilot but may become an organization setting later.
