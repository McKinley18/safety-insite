# Legacy adoption

Disposable databases:

- sources: `phase6_legacy_closure_a`, `phase6_legacy_closure_b`
- targets: `phase6_adopt_completion_a`, `phase6_adopt_completion_b`
- restore: `phase6_restore_completion`

Results:

- 30 canonical migrations on each target
- 47 source rows adopted on each clone
- 5 memberships mapped
- 0 quarantined in the representative fixtures
- schema fingerprint: `ee09da5d7f8e5fec3ed8c4b3605f7d3c228b49f943470a5e80bfcf22701f38b`
- content fingerprint: `9e74ad74ec5081b9611236957780531863cb6c6ef8b9c30412f03afb704aebb1`
- backup SHA-256: `1c9a113...` (full value retained in command output)
- restore reproduced fingerprints and row counts

The verifier now derives the expected migration names and requires adoption-provenance and regulatory-checksum migrations; it no longer relies on a stale hard-coded count.

The original development database was not modified.

