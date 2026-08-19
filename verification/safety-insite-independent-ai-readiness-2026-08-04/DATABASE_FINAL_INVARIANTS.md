# Database final invariants

Fresh database migration count: 33. Read-only query after regressions:

```text
inspection_findings: 12
human_reviews: 6; finding_reviews: 6; current_reviews: 6
audit actions: finding_materialized=12, finding_retained_unchanged=2,
finding_review_created=6, finding_review_finalized=4,
finding_superseded=2, inspection_finalized=2, inspection_transitioned=2
```

Focused review regression finalized two findings independently and persisted two current review rows. Duplicate idempotent review replays did not increase review count.
