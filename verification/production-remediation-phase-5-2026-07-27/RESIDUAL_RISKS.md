# Residual risks

1. Development database is not adoptable: 0 migrations and canonical tables absent.
2. S3-compatible production storage was not exercised with real credentials.
3. Two backend high and three frontend production high dependency findings remain.
4. Legacy reports/local calendar/report-edit paths still treat browser storage as durable.
5. Legacy `/reports`, `/pdf/:id`, and attachment routes coexist with canonical reports and need retirement/strict quarantine.
6. Full UI controls after site creation are not yet wired to the canonical workflow, although browser-context API persistence is proven.
7. Auth regression script conflicts with the intentional login throttle (expected 401 became 429); browser login and password-delivery tests pass, but the suite must become throttle-aware without weakening rate limiting.
8. Malware scanning and object lifecycle jobs are not implemented.
9. Synchronous PDF generation needs load/timeout measurement.
10. HazLenz remains advisory and has not received accuracy remediation.
