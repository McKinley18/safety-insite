# Concurrency and idempotency

Implemented:

- required client idempotency key and monotonic request version
- unique observation/idempotency and observation/version indexes
- PostgreSQL transaction advisory lock per observation
- replay-safe response for repeated idempotency keys
- rejection of stale versions
- supersession of prior current analysis
- exactly one current analysis

Canonical test submitted concurrent versions 2 and 3. Version 3 remained current; version 1 was preserved; three total version records existed; duplicate current state was prevented.

