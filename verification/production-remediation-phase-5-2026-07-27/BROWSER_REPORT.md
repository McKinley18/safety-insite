# Browser report

Repository Playwright gate result: **20 scenarios passed** at 390x844.

Verified UI login, authenticated session, UI site creation, real HazLenz classification, immutable analysis persistence, human review, finding finalization, inspection completion, report generation, PDF signature, database artifact persistence, cross-user 404, inspection amendment, second report version, and reload.

The smaller canonical persistence browser check also passed UI login, site/inspection persistence, reload, and unauthenticated denial.

The in-app browser connector failed during bootstrap (`Cannot redefine property: process`); the repository's established Playwright runner was used. The test still launched a real Chromium browser and real backend/PostgreSQL paths.

Residual: most post-site workflow interactions are API calls in the authenticated Playwright browser context because the legacy guided UI is not yet wired end-to-end to the canonical entities.
