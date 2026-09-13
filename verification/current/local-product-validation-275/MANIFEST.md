# §275 evidence package — whole-product local validation

Produced 2026-09-13 against commit `ae075555` on
`beta/expert-hazlenz-validated-candidate-2026-09-12`, by driving the running product on localhost.

No customer data. No secrets. All test data carries the `VALIDATION-275` prefix and lives in the
disposable `test_insite_validation_275` database, which is not the development database.

## Contents

| Path | What it is |
|---|---|
| `results/route-matrix.json` | 24 routes x 4 viewports (1440/1280/768/390) = 96 checks, with per-row HTTP status, horizontal-overflow measurement, console errors, failed requests, heading structure, unlabelled controls and rendered-token leak scan |
| `results/contrast-sweep.json` | Computed-colour contrast over 19 routes in both themes, with the AA floor applied per text size, plus the count of text nodes that could not be measured because they sit on a gradient |
| `results/inspection-report-sample.pdf` | The actual generated report for the validation inspection. 6 pages, 10779 bytes, sha256 `9e6f0205a1343be91e63ce7e225fa018777c8e491fe6d0480491f00c78cf8663` — matching the checksum the server recorded |
| `results/db-reconciliation.json` | Row counts for every populated table in the validation database at the end of the run |
| `screenshots/` | A deliberate subset: primary navigation, dashboard, inspections, calendar, reports, settings and sign-in, at desktop plus one laptop, tablet and mobile capture each |

## Reading the route matrix

`result` is one of `PASS`, `DEFECT`, `FAIL`, `NOT_EXERCISED`. `NOT_EXERCISED` means an
authenticated route redirected to `/login`, so nothing about that page was measured. The first run
of this sweep logged in once per viewport, tripped the product's own login throttle, and scored 14
photographs of the sign-in page as passes; that outcome is now impossible to report as a pass.

## Reading the contrast sweep

`unmeasuredGradientBacked` is text sitting on a gradient or image, where a single flat colour is not
a defensible summary. Those are excluded rather than scored either way. The sweep also mis-parses
`lab()` colours. Its failure count is a floor on the real number, not a ceiling.

## Commands

```
APP_URL=http://localhost:3000 OUT_DIR=<dir> node scripts/validate-275-product-surface.mjs
APP_URL=http://localhost:3000 OUT_DIR=<dir> node scripts/validate-275-contrast-sweep.mjs
npm run test:calendar-date-boundary          # 25 checks, no database required
```

## Provider accounting

One Expert execution. 1 provider leg of an expected 2, stopped by deterministic structural
admission (`FIRST_PASS_NOT_ADMITTED`). **$0.119524** against a $2.00 ceiling. Token counts are
redacted in the operational event log by design.
