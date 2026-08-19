# Release blocker ledger

| ID | Description | Severity | Owner | Status | Closure evidence | Remaining dependency | Last changed |
|---|---|---|---|---|---|---|---|
| BLK-HYDR-001 | React hydration mismatch caused by pre-hydration theme mutation | High | Frontend | CLOSED | `HYDRATION_ROOT_CAUSE.md`, `HYDRATION_TEST_RESULTS.md`; dev/prod fresh+reload Chromium no hydration errors | None for this defect | 2026-08-05 |
| BLK-AUTH-001 | Reusable complete authorization/audit matrix not yet executed | Critical | Backend/security | CLOSED | `AUTHORIZATION_RESULTS.json`: 18/18 rows; entitlement denials persisted in `security_audit_events` (35 rows) | None for defined rows | 2026-08-05 |
| BLK-REPORT-001 | Report v2 historical immutability proof not yet run in this phase | High | Reports | CLOSED | `REPORT_VERSIONING_RESULTS.md`; v1/v2 checksum and storage separation regression passed | None for tested contract | 2026-08-05 |
| BLK-REPORT-002 | Concurrent report generation harness not yet run | High | Reports | CLOSED | `REPORT_CONCURRENCY_RESULTS.md`; 10 simultaneous requests returned one version ID/checksum | None for unchanged-source concurrency | 2026-08-05 |
| BLK-AI-001 | Independent HazLenz precision and historical/controlled-family adjudication | High | HazLenz | IN PROGRESS | `HAZLENZ_FINAL_PHASE_RESULTS.json`, `HAZLENZ_EIGHT_ROW_DIAGNOSTIC.md`, `HAZLENZ_PRECISION_HOLDOUT_RESULTS.json`; frozen recall 1.0000, non-safe forbidden 0, state-aware unsupported 0, life misses 0, transport 0 | Resolve 0.7778 independent holdout expected-family recall and complete qualified adjudication of historical/controlled semantics | 2026-08-08 |

The infrastructure gates remain closed. The HazLenz quality gate is not closed: the measured frozen metrics improved, but residual non-safe false promotions and limited stage coverage require further safety review and broader independent evaluation.
