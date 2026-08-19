# Frontend workflow tests

The former checks targeted removed `/actions` and `/company` pages and could not test the current product.

Repaired Playwright checks now verify meaningful state on `/command-center`, `/safety-calendar`, `/inspection`, `/inspection-review`, `/inspections`, and `/reports`. Both checks pass on port 3001 and assert no dependency on `/actions`.

The in-app browser connection failed with `Cannot redefine property: process`; repository Playwright was used as the documented fallback.

Residual: these are route/workflow-surface checks, not a complete authenticated capture → HazLenz → review → finalize → PDF → follow-up test. That broader E2E gate remains required.
