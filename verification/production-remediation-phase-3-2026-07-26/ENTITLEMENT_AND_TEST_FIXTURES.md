# Entitlement and test fixtures

Backend entitlement enforcement remains authoritative. Free users are denied `cloudReports`; no query parameter, frontend override or production bypass was added.

An isolated test fixture was not implemented because the durable workflow it would enable does not exist. The acceptable future design is a test-only seed command that:

- requires `NODE_ENV=test`;
- rejects production-like database names and production host configuration;
- creates a named test subscription with explicit expiry;
- is idempotent and auditable;
- verifies free, active, expired and cross-user isolation.

Pilot entitlement assignment must use a real administrative/billing process after administrative roles are defined.
