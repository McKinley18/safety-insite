# Regression results

## Passed

- backend build/typecheck
- frontend production build/typecheck
- modified frontend lint: 0 errors, one expected CSS-file configuration warning
- guided response: 21/21
- evidence foundation: 35/35
- evidence boundary: 13/13
- storage provider: 4/4
- upload security
- canonical workflow: 19 scenarios
- golden hazard tests: 12/12
- standards tests: 15/15
- billing migration validation: 6/6 reported
- password-reset delivery
- authenticated browser workflow: light and dark passes
- clean migration 27/27
- upgrade/revert/reapply
- `git diff --check`

## Harness limitations/failures

- Legacy clarification gauntlet reached the real endpoint but supplies no JWT; received the correct 401. Browser verification exercised real authenticated clarification.
- Legacy auth-flow script expects a raw 64-character reset token in an API response. The enumeration-safe delivery boundary intentionally does not expose it. The focused password-reset provider suite passed.
- Some database fixture scripts reject the safe database name `hazlenz_guided_20260730` by a hard-coded naming regex; canonical browser/workflow authorization checks passed against that database.
- The complete 445-case authentic corpus was not rerun because protected reasoning files and outputs were unchanged; this phase adds a response projection. Prior verified result remains 359 PASS, 86 NEEDS REVIEW, 0 FAIL.

