# Remediation summary

Resolved or materially reduced:

- P-001: canonical authentication schema now uses UUID user IDs and `passwordHash`; a non-destructive compatibility migration adds reset fields and backfills legacy `password`.
- P-002: SVG/HTML and spoofed image uploads are rejected by MIME, extension, and signature; filenames are server-generated; static responses are attachment-only, nosniff, and sandboxed.
- P-003: reports, inspections, dashboards and corrective actions use authenticated organization scope; the stale corrective-action scope smoke test was repaired and now proves cross-org list/update denial.
- P-004: Docker backend port is 4000; synchronize is disabled and prohibited in production; a tested startup sequence is documented.
- P-008: Axios and TypeORM were patch-upgraded. Backend vulnerabilities fell from 14 to 12.
- P-009: password recovery now has hashed, expiring, single-use tokens and an explicit development delivery mode.
- Frontend stale `/actions` checks now exercise `/command-center`, `/safety-calendar`, and current inspection/report routes.
- Next.js and matching lint config were patch-upgraded to 16.2.12.

Residual risk: the full entity-to-migration schema remains broader than the repaired active path, Nest’s vulnerable transitive upload stack needs a planned major upgrade, frontend legacy lint remains 526 errors/120 warnings, and full authenticated inspection-to-report browser automation is not yet present.
