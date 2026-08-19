# Inspection lifecycle

## Decision

Inspection states are `draft`, `in_review`, `completed`, and `archived`. Finding states are `captured`, `analyzed`, `needs_review`, `finalized`, and `dismissed`.

## Transition contract

| Transition | Actor | Preconditions | Reversible |
|---|---|---|---|
| create → draft | independent/member | authorized active site | yes, archive |
| draft → in_review | creator/collaborator | at least one observation; no analysis request pending | back to draft by creator/manager if no finalized finding |
| in_review → completed | creator, assigned reviewer, manager/admin | every observation dismissed or represented by finalized finding; review rationale recorded; no pending uploads | reopen creates new inspection revision |
| completed → archived | owner/manager/admin | report/action warning acknowledged | restore by manager/admin |
| archived → active prior state | owner/manager/admin | parent site active | yes, audited |

Findings move captured → analyzed after a persisted analysis, then needs_review → finalized/dismissed by a human. HazLenz failure leaves the observation captured with an explicit failure state and permits manual finding creation. It never auto-finalizes.

## Versioning and editing

- Draft observations are mutable with optimistic version checks.
- Starting review freezes a revision snapshot.
- Editing a finalized finding creates a new finding revision and immutable review event; history remains.
- Completed inspection edits require `reopen`, increment `inspectionVersion`, invalidate no old reports, and require a new report version.
- Reports may only be generated from a completed inspection revision.

## Departure and assignment

A user cannot be removed while owning unassigned drafts or open actions. A manager/admin must reassign or archive them. Assigned collaborators/reviewers are explicit records.

## Offline behavior

Offline/local drafts may capture observations and files with client-generated idempotency keys. They remain labeled Local Draft or Sync Pending. Review, finalization, completion, analysis promotion, and report generation require server confirmation. Conflict resolution is last-server-version plus explicit user choice; automatic merges are deferred.

## Context and alternatives

More granular workflow states were rejected for pilot complexity; a single draft/final state was rejected because it cannot enforce human review. The selected four-state inspection lifecycle is simple while findings preserve review detail.

## Impacts and testing

Backend transition commands enforce permissions and transactions. Frontend buttons derive from server state and show failures. Migrations add status/version/assignment/revision fields. Test every allowed/forbidden transition, concurrent update, HazLenz failure, reopen/version behavior, departure, offline queue, and report eligibility.

## Risks and deferred work

Formal approval chains, electronic signatures, configurable workflows, and multi-stage supervisor review are deferred.
