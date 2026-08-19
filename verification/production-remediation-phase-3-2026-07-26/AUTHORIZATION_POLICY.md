# Authorization policy

## Status

A safe boundary is known: B1 must never access Organization A data, client ownership fields must not be trusted, nested access inherits its parent, and foreign-resource responses should consistently be 404. The internal Organization A policy is not determinable.

## Required policy choices

| Resource | Safe known classification | Unresolved |
|---|---|---|
| Profile/reset/subscription | user-private | platform support access |
| Organization/membership/billing | organization administrative | roles and membership model |
| Site | organization-scoped | A2 create/update/archive rights |
| Inspection/finding/report | parent-inherited organization scope | creator privacy vs collaboration |
| Corrective action/task | organization-scoped | assignee vs manager mutation rights |
| Evidence/report file | parent-inherited private | same-org download rights |
| Standards | authenticated global read-only | public access |
| Knowledge sources/review queues | global administrative or hybrid | platform-admin identity and tenant review |
| Diagnostics/maintenance | global administrative, disabled by default | platform-admin mechanism |

No platform-admin claim or global roles guard exists consistently. Role strings are not canonical. Therefore an A1/A2/B1 matrix cannot truthfully specify same-organization and administrative results.

Required decision: adopt a membership table with explicit roles (member, manager, organization administrator), define a separately asserted platform-admin claim, and document every resource’s collaboration level before route changes.
