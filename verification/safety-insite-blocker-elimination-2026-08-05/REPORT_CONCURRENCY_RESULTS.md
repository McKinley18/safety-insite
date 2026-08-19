# Report concurrency

Ten simultaneous unchanged-source POST requests against the same completed inspection all returned HTTP 201, version `2`, the same version ID `626fee68-0466-4e34-9212-ec05b0232411`, and the same checksum `c10a1d143b10df1fa021c055f02f514821260d25537684199376991b99b1bd20`. No new version rows were created.

The fix uses a SHA-256 source fingerprint, a partial unique index on `(reportId, sourceFingerprint)`, and a PostgreSQL advisory transaction lock per inspection. Duplicate unchanged requests replay the existing immutable version.
