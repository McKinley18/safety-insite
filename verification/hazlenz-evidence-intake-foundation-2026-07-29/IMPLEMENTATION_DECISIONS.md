# Implementation Decisions

- Add the evidence model as a new versioned request/result structure while projecting to the existing structured observation contract.
- Use deterministic typed extraction for high-consequence facts and leave uncertain semantic extraction explicitly inferred.
- Add a single predicate ledger after evidence normalization and before final citation promotion.
- Keep existing intelligence paths as candidate sources; the ledger governs definitive promotion and can add direct-family candidates only when authoritative repository text exists.
- Persist evidence within immutable analysis snapshots in this phase; avoid a migration unless queryable correction history proves necessary.
- Re-analysis creates a new immutable analysis snapshot linked by the observation timeline.
- Extend only the canonical `/inspection-workspace`.
- Preserve offline functionality through bundled predicate definitions and question templates.
- Never hardcode case IDs or full corpus sentences.
