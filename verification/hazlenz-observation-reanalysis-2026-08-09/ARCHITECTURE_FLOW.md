# Implemented flow

`Review` workspace → `Revise observation` → authenticated `PATCH /inspections/observations/:id` with observation version → persisted `Observation.version += 1` and `observation_updated` audit → `Reanalyze with HazLenz AI` → real `/safescope-v2/classify` → `POST /inspections/observations/:id/analyses` → existing transactional reconciliation/materialization → refreshed persisted findings → finding-scoped review/finalization/report flow.

The endpoint authorizes through the observation's inspection scope and returns 404 for foreign users. Completed inspections are reopened to draft by the explicit UI revision action before the update; no historical analysis, finding, review, or report row is overwritten.
