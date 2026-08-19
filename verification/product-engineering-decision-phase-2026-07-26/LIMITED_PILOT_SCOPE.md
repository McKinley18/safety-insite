# Limited pilot scope

## Decision

The smallest coherent pilot includes:

- approved users only; public registration disabled or invite-gated;
- independent or one-organization membership;
- durable sites and inspection drafts;
- observations, advisory HazLenz snapshots, explicit human reviews, and finalized findings;
- completed inspections, corrective actions, tasks/calendar projection;
- immutable versioned PDF reports;
- private evidence storage;
- explicit expiring pilot entitlements;
- audit logging, tenant boundaries, monitored password reset, backup and rollback.

HazLenz output must be labeled advisory and reports must state that a qualified user reviewed the result.

## Deferred

Multi-organization membership, configurable roles, recurring tasks, reminders, external calendars, full offline conflict resolution, tenant knowledge, report template builders, asynchronous generation unless required by measurement, public self-service signup/billing, and unsupervised HazLenz.

## Operational constraints

Pilot users are named and approved; one support owner is on call; incidents and failed analyses enter a review log; daily backups and a tested restore exist; release rollback is documented; dependency/high-risk findings and memory capacity are reviewed before launch.

## Context and consequences

This scope confirms the proposed direction. Removing reports/actions would fail the product workflow; adding enterprise administration would delay foundational safety. Frontend must remove or label deferred controls. Backend must reject unsupported operations rather than simulate them.

## Testing and risks

Pilot eligibility requires all acceptance criteria and the full persisted browser gate. Public production and unsupervised HazLenz remain separate NO-GO decisions.
