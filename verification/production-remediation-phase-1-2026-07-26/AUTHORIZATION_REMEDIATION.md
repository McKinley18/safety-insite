# Authorization remediation

Backend inspection confirmed organization predicates for reports, report attachments, inspections, corrective actions, dashboards, and organization settings. Create paths derive organization/user IDs from JWT context rather than request ownership fields.

The corrective-action smoke test previously passed a bearer string directly to a service and never tested the real context contract. It now verifies decoded A/B organization contexts. It passed: A can create/list/update; B cannot list or update A’s action. Dashboard organization-scope smoke also passed.

Residual: a complete route-by-route A/B integration matrix was not achieved. HazLenz feedback/review, knowledge administration, notifications, audit endpoints, attachment download authorization, and several administrative endpoints require explicit guard/scoping review. Treat P-003 as partially resolved and still public-production blocking.
