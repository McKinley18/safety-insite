# Browser report

## Passed authenticated subset

Repository Playwright test, Chromium, mobile viewport 390×844:

1. Register isolated user through real API.
2. Log in through UI.
3. Verify token persistence.
4. Open `/inspections`.
5. Create durable site through UI.
6. Start Quick Inspection.
7. Verify returned inspection and site IDs in UI context.
8. Verify inspection through authenticated backend request.
9. Reload twice and verify site and inspection count remain.
10. Remove authentication and verify backend denial.

Result: pass.

## Blocked full gate

The required observation → HazLenz → review → finding → action → completed inspection → immutable PDF → authorized object download flow cannot pass because the canonical report and private object storage stages stopped. The interactive in-app browser connector also failed independently with `Cannot redefine property: process`; the repository’s installed Playwright runner was used instead.

The passed subset is evidence for durable site/draft integration, not proof of inspection-to-report release readiness.

