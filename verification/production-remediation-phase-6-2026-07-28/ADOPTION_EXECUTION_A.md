# Adoption Execution A

Source: `phase6_legacy_a`  
Target: `phase6_adopt_a`

- Source rows adopted: 47/47
- Organization memberships created from explicit ownership: 5
- Quarantined: 0
- Migration rows: 26, all produced by canonical migration execution
- Provenance run: completed
- Orphans after adoption: 0

Two early attempts failed transactionally before success:

1. An invalid legacy standards `allowed_use` value violated the canonical constraint. The mapping was changed to the documented `reference` value.
2. A JSON serialization error was corrected to explicit JSON serialization.

Both failed attempts left zero adopted and zero provenance rows.

