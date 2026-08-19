# Integration and persistence results

Against clean `phase7_readiness_20260803`:

- 30 TypeORM migrations applied successfully.
- Canonical workflow: PASS, 25 scenarios; persisted 1 site, 1 inspection, 1 observation, 3 analyses, exactly 1 current analysis, 2 findings, 1 task, 1 action; mass assignment rejected.
- Canonical organization authorization: PASS, 11 assertions; Organization B/foreign access denied with 404 policy.
- Private storage/report regression: PASS, 12 scenarios; two report versions, distinct checksums, two storage objects, cross-user download 404.
- Upload security: PASS for MIME/signature, extension, active-content, traversal, and empty-file checks.
- Database snapshot after tests: 3 inspections, 4 analyses, 2 current analyses, 3 findings, 1 task, 1 report, 2 report versions, 1 audit log, 5 security audit events. Counts include separate regression fixtures.
