# Production runbook

1. Validate environment without printing secrets.
2. Apply reviewed TypeORM migrations and record migration IDs.
3. Verify readiness and database connectivity.
4. Run authenticated smoke: login, entitlement, inspection, PNG evidence, analysis, report, owner download, unrelated-user denial.
5. Watch error rate, latency, 429s, storage failures, and audit events.
6. Disable HazLenz/uploads only through reviewed feature controls if provider or reasoning service is unsafe.
7. Preserve incident evidence and never promote unqualified regulatory records.
