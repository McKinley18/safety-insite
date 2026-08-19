# Migration reconciliation report

## Clean canonical databases

- `phase5_clean`: 25/25 migrations
- `phase5_rollback`: 25/25 after revert/reapply
- canonical fingerprint: `3af88be174379a147f8044a75afd15fa0f1501f99699aba75fa7c2f1a157b3d6`
- drift between clean and rollback DB: none

## Development clones

- `phase5_clone_a`
- `phase5_clone_b`
- separately restored proof: `phase5_restore_proof`

Both clones were restored from a read-only `pg_dump` of `safescope`.

- schema fingerprint: `780299e0df6d5f9c7fcbf1c9a551f7cd2d8f7cd9a5d42b3f78db95d1f4384d4f`
- content fingerprint: `2046a65536283f730dfa5c1eccc9881d3cc78caecb94bb249dee630c744eb6fe`
- migration history: 0
- tables: 10
- deterministic: yes
- baseline adoption: rejected

Missing canonical tables include site, inspection, observations, findings, actions, tasks, storage, and canonical reports. No migration history was inserted.
