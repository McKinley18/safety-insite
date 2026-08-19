# Report versioning and immutability

The authenticated private-storage regression passed against disposable PostgreSQL `phase12_blocker` and the real backend. Unchanged duplicate generation returned the same version-1 identity. A legitimate reopen, title revision, re-review, and re-finalization created report version 2.

- Report ID: `2c134a92-3a24-42db-9ec2-b8943efe9c3e`
- Version 1 checksum: `fa9665ed10817ee93bdd14ff0e504312d68c053ae061640a5ee89e27cc68728a`
- Version 2 checksum: `c10a1d143b10df1fa021c055f02f514821260d25537684199376991b99b1bd20`
- Version 1 and version 2 used distinct storage objects; the downloaded version-1 PDF remained authorized for the owner and denied (`404`) to the foreign user.
- Database persistence: one report row, two version rows, five ready storage objects across disposable fixtures, and report-generation audit events.

The original version-1 bytes and snapshot were not overwritten by version 2; the regression compares version identities/checksums and persisted snapshots.
