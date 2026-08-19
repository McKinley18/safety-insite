# Product scope

## Decision

The first production architecture is an inspection-first safety workflow for independent professionals and small single-organization teams. It is not a general enterprise workflow platform.

## Context and options considered

The UI advertises individual and organization use, while the backend contains partial organization, report, action, regulatory, and offline systems. Options considered were individual-only, organization-only, or dual-mode. Dual-mode with a single optional organization was selected; either single-mode alternative would discard active product intent.

## Included

Authentication, password reset, independent or one-organization operation, sites, draft/completed inspections, observation capture, advisory HazLenz, human review, findings, corrective actions, tasks/calendar projection, versioned PDF reports, private evidence, pilot entitlements, audit events, and tenant isolation.

## Deferred

Multi-organization membership, complex team provisioning, private organization drafts shared by default, recurring tasks, tenant-specific knowledge, external calendar integration, report template builders, full offline synchronization, public signup/launch, and unsupervised decisions.

## Consequences and impacts

- Frontend: one clear persisted workflow and visible local/sync status.
- Backend: canonical APIs and lifecycle enforcement.
- Authorization: independent records are private; organization records follow membership roles.
- Migration: legacy competing shapes are mapped or quarantined, never silently treated as canonical.

## Testing, risks, deferred work

Acceptance requires end-to-end persistence and A1/A2/B1 coverage. The primary risk is scope creep from legacy modules; inactive features must not be activated merely because entities exist.
