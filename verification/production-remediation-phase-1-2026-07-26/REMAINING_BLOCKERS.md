# Remaining blockers

## Limited pilot

- Production password-reset delivery is not configured.
- Full route-level cross-tenant integration coverage is incomplete.
- No complete authenticated inspection-to-report-to-calendar browser gate.
- Pilot must retain mandatory human review for HazLenz.

## Public production

- Entity/migration parity and foreign-key/ownership enforcement remain incomplete beyond the repaired core path.
- Authorization matrix is incomplete for HazLenz review/knowledge/admin/audit/notification endpoints.
- Three backend and three frontend high dependency findings remain.
- Legacy frontend lint has 526 errors.
- Upload storage remains ephemeral/local with no lifecycle policy.
- Monitoring, backups/restore drill, release rollback and migration-baseline adoption are not verified.

## Unsupervised HazLenz

All blockers from the production audit remain; this phase intentionally did not tune reasoning.
