# Corrective action and calendar architecture

## Decision

Corrective actions and user-created tasks are durable source records. Calendar/to-do is a server-side read model combining both; calendar rows are not duplicated.

## Corrective action

May belong to a finalized finding or directly to an inspection for inspection-wide actions. Fields include scope, inspection/finding, creator, owner, assignee, title, description, due date, priority, status, completion/verification data, optimistic version, and audit timestamps.

Finding-less actions must have an inspection ID and rationale. Foreign assignees are rejected. Members see organization actions; only assignee, creator before assignment, manager/admin may change substantive fields. Assignees may update progress and request/record completion; verification, when required, is a separate manager/reviewer event.

## Task

Manual task is independently user-private or organization-scoped and may optionally link to site/inspection. Recurrence and external calendar IDs are deferred. Tasks support open/completed/cancelled.

## Calendar projection

`GET /calendar` merges actions with non-null due dates and tasks into a stable discriminated shape `{kind, sourceId, date, title, status, priority, scope}`. Completing an item calls the underlying corrective-action or task endpoint. Overdue is computed as due date before the user's local current date and status not completed/cancelled; stored due dates are date-only to avoid timezone drift.

## Context and rejected alternatives

Local calendar records and dual-written calendar tables were rejected because they drift. Making every task a corrective action was rejected because personal reminders need no safety finding.

## Impacts

Migrate existing backend actions after ownership mapping; local calendar entries require an explicit import review, not silent upload. Frontend calendar becomes a projection client. Backend must scope aggregates and assignments.

## Testing, risks, deferred work

Test finding and finding-less creation, assignment, foreign assignee, status transitions, date boundaries, projection consistency, dashboard counts, archive behavior, and cross-tenant leakage. Reminders, recurrence, verification policy configuration, and external sync are deferred.
