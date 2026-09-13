# §279 — page-by-page product review, batch 1

Evidence for the first review batch. The verdicts live in
`project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md`; this is what they were reached from.

## How it was produced

The real localhost stack, driven in Chromium through Playwright as a real authenticated user:
`DEV_AUTH_BYPASS=false`, the session obtained from the login form, synthetic data only, on a
registered disposable database created and torn down by run id under the §277 ownership rules. The
original development database was never migrated or written to.

Producer: `frontend-next/scripts/review-279-page-batch.mjs`, `BATCH=1`.

Four widths, five routes plus the shell they all render inside: 390 · 768 · 1280 · 1440.

## Contents

| Path | What it is |
|---|---|
| `PAGE-INVENTORY.json` | Every active route, its purpose, user, access, applicability and review status; the orphan route; the absent system surfaces; the measured shell inconsistency |
| `batch-1-measurements.json` | Per page and per width: overflow, unnamed controls, contrast, touch targets, heading structure, console errors, failed requests, retired brand wording |
| `screenshots/batch-1/` | 20 full-page screenshots — 5 routes × 4 widths |
| `before-after/O-1-*` | The one defect repaired in batch 1, at the width where it appeared and at the width where nothing changed |

## What the numbers mean, and what they do not

The first run reported **22** objective observations. **Eighteen of those were the instrument.**

- The contrast check walked up from a text node looking for a solid background colour. A gradient
  panel's computed `backgroundColor` is transparent, so it walked past the login hero to the white
  body and reported white-on-white at 1.0 for every line of a panel that is perfectly legible.
- The touch-target check flagged inline text links, which are the height of their own text.

Both were corrected, and a backdrop the method cannot evaluate is now reported as NOT MEASURED
rather than as a failure. That left **4** hits — all `disabled` controls at 3.86:1, which WCAG 1.4.3
exempts. **Confirmed automated defects in batch 1: 0.**

The JSON in this package is from the corrected instrument. The first run's numbers are not preserved
because they measured the instrument, not the product; they are described here so the correction is
on the record rather than silently absorbed.

**And the one defect that mattered most was found by looking, not by measuring.** O-1 — the week
strip painting the date on top of the weekday at 390px — passed every automated check, because each
span fits its own box. They simply occupy the same one. `before-after/` is the evidence.

## Scope

Batch 1 reaches **no HazLenz output surface**; those all live inside `/inspection-workspace` and are
batch 3. **Zero provider calls.** No production contact of any kind.
