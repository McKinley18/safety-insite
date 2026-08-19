# Persistence report

## Verified durable path

The real HTTP plus PostgreSQL test persisted and reloaded:

- site
- inspection draft/lifecycle
- observation
- immutable HazLenz analysis snapshot
- immutable human review
- finalized finding
- corrective action
- task
- calendar projection

Database counts were independently checked and were exactly one for every created ID. The expanded test passed 19 scenarios and four cross-user denials.

Corrective-action create is transactional with its audit log. This change was made after a real failure showed the prior flow could persist an action and then return HTTP 500 when audit persistence failed.

## Frontend behavior

The `/inspections` route now:

- loads persisted sites and inspections from the backend;
- creates a durable site before showing success;
- requires a selected durable site;
- creates the inspection draft before navigation;
- stores only the returned server IDs and a `persistenceState: "saved"` marker;
- displays server unavailable/save failure instead of claiming success.

Legacy inspection detail, report, evidence, and calendar screens still contain local-storage paths. Finalized workflow data is therefore not yet free of competing local persistence.

