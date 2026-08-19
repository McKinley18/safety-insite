# Authorization report

## Implemented policy

- Independent records: owner-only.
- Organization sites: visible to active members; update/archive restricted to manager/admin.
- Organization drafts: creator, active assignee, manager/admin.
- Completed organization inspections: shared organization visibility.
- Foreign resources: consistent 404 for canonical resource routes.
- Client ownership fields: rejected by whitelist/forbid validation.
- Nested task/action/inspection parents: validated in the database scope.
- Foreign assignees: rejected.

## A1/A2/B1 evidence

Passing real controller/database suite:

- A1 manager and A2 member share Organization A.
- B1 belongs to Organization B.
- A2 sees A’s organization site but cannot rename it.
- A2 cannot see A1’s draft until assigned.
- After assignment, A2 can update the draft with the correct version.
- B1 cannot read the site or draft.
- A1 cannot assign B1 to the inspection.
- B1 cannot create a task under A’s inspection.
- A1 cannot assign an organization task to B1.

Result: 11 assertions passed; foreign-denial policy 404.

## Incomplete scope

This is not a complete inventory of every legacy active controller. Reports, direct files, several administrative/diagnostic routes, knowledge administration, review queues, exports, and legacy audit routes still require explicit platform-support/global-resource policy tests. No claim of complete authorization coverage is made.

