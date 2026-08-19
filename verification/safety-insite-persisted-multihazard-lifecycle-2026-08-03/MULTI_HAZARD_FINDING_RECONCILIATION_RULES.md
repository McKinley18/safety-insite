# Finding reconciliation rules

* Identity is observation ID plus a normalized stable hazard key (`domainId`, `hazardFamily`, `hazardId`, or normalized mechanism), never display order or array index.
* A supported hazard in the next accepted analysis reuses its finding ID, updates the originating/current analysis linkage, and increments revision without erasing human history.
* A newly supported key creates exactly one new pending finding.
* A key absent from the new analysis is retained as `superseded`; historical rows are never hard-deleted and are excluded from current report snapshots.
* Material changes remain historically inspectable. Existing human decisions are not silently copied to a materially different finding; finalization requires current findings to be reviewed.
* Reconciliation is transactional with analysis persistence and runs only after stale/version/idempotency checks succeed.
* Existing legacy single-hazard rows retain the `primary` key and remain compatible.

The current implementation proves initial two-finding creation, replay deduplication, add/remove reconciliation, stale rejection, reload persistence, and current/historical counts. Per-finding risk review and complete audit coverage remain release blockers because the legacy `HumanReview` model is still observation-scoped.
