# ReviewCore Knowledge Review Queue Integration Scaffold — P14

## Purpose

P14 adds a stronger backend integration scaffold around the P13 local-first queue route contract. It introduces API envelope types, role/plan guard evaluation, audit event generation, route-style wrapper methods, governance trace output, and persistence readiness reporting.

## Layers Added

- API/DTO envelope types for queue actors, requests, responses, audit events, governance traces, and persistence readiness
- Deterministic role/plan guard scaffold
- Deterministic audit event scaffold
- Route scaffold wrapping the P13 controller/store contract
- Governance trace on every route-style response
- Persistence readiness check for future database and HTTP route work

## Guard Behavior

Owner, admin, and compliance admin roles can approve eligible records when plan tier permits. Safety managers can create drafts and request more information. Field inspectors can create drafts only. Viewers cannot mutate. Individual plans cannot approve or supersede.

## Audit Behavior

Every route-style action returns an audit event with actor, role, plan, record, status, allowed/denied outcome, blockers, active retrieval eligibility, and guardrail snapshot.

## Active Retrieval Boundary

Only approved/governed records are eligible for active retrieval. Draft, pending validation, needs-review, rejected, retired, superseded, duplicate, prohibited-language, and confidential-data records remain excluded.

## Persistence Readiness

The scaffold marks route, guard, and audit layers as ready while intentionally marking database migration and durable persistence as not ready.

## Remaining Work

P15 should bind this scaffold into real NestJS providers/controllers with authenticated actor resolution, durable database tables/entities, audit log persistence, migrations, and HTTP integration tests.
