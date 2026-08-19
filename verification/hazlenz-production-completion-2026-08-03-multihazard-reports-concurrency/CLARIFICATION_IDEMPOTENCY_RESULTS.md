# Clarification idempotency

Using the real analysis endpoint, replaying an existing idempotency key returned the existing outcome. A stale request version returned HTTP 409. The endpoint’s transaction lock and unique indexes prevent duplicate current analyses. Full browser rapid-double-submit coverage remains incomplete.
