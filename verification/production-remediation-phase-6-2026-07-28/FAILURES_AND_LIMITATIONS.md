# Failures and Limitations

- The eventual hosted S3 account, credentials, DNS, backup, and retention policy were unavailable. TLS MinIO proves the S3 protocol and application boundary, not the deployment account.
- The complete existing UI is not canonical: guided/quick inspection, local evidence, local calendar/action, and offline report helpers remain.
- The browser gate uses the real UI for authentication, site creation, reports, persistence, and downloads, but uses real API calls from browser context for several intermediate workflow steps.
- Four moderate NestJS 10 findings remain and require a separately planned major migration or formal risk acceptance.
- The active-route matrix is strong for canonical Phase 4–6 routes but not exhaustive for every legacy analytics/regulatory/review module.
- Production email-provider credentials were not available; prior fail-closed provider boundary and test delivery passed.
- Raw restored schema dumps require normalization for semantically equivalent PostgreSQL cast syntax.
- No destructive test was performed against the original development database.

