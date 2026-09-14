# §280 — page-by-page product review, batch 2 (the inspection spine)

Evidence for the second review batch and for the product-owner decisions D-031 to D-037. The
verdicts live in [`../../../project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md`](../../../project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md);
this is what they were reached from.

## How it was produced

A **production build** (`next build` + `next start`), driven in Chromium through Playwright as a
real authenticated user: no development bypass, the session obtained from the login form, synthetic
data only, on a registered disposable database created and torn down by run id under the §277
ownership rules. The original development database was never migrated or written to.

Two deliberate departures from batch 1, and both changed the answers:

- **A production build, not the dev server.** The dev server adds a Next.js dev indicator that looks
  like a product control in a screenshot, cancels HMR requests on every navigation (recorded as
  seven `NETWORK_FAILURE` observations against pages that had made no failing request), and —
  decisively — does **not** register the service worker, without which the whole D-037 offline
  inventory measured the harness rather than the product.
- **Both themes.** Batch 1 measured light only.

Producers:

| Script | Produces |
|---|---|
| `backend/scripts/review/review-stack.ts` | The stack. Registered disposable database, migrated, `DEV_AUTH_BYPASS=false`, `EXPERT_EXECUTION_ENABLED=false`, and **`ANTHROPIC_API_KEY` deleted from the child environment** — a provider call is not merely not made, it is not possible |
| `frontend-next/scripts/review-seed-synthetic.mjs` | The account, a site, a populated inspection and an empty one — all through the real authenticated API, never written into the database directly |
| `frontend-next/scripts/review-seed-hazlenz-states.mjs` | Five saved synthetic HazLenz analyses with their reviews and findings |
| `frontend-next/scripts/review-279-page-batch.mjs` | `BATCH=2` and `BATCH=2H`, four widths × two themes |
| `frontend-next/scripts/validate-280-workspace-draft-persistence.mjs` | The D-035 acceptance |
| `frontend-next/scripts/measure-280-offline-inventory.mjs` | The D-037 readings |

## Contents

| Path | What it is |
|---|---|
| `batch-2-measurements.json` | Per page, theme and width: overflow, unnamed controls, contrast, touch targets, heading structure, landmark count, document title, console errors, failed requests, navigation aborts, retired brand wording |
| `batch-2H-measurements.json` | The same, for the five HazLenz output states |
| `draft-persistence-acceptance.json` | D-035, 11 cases including a control and a falsification |
| `offline-inventory.json` | D-037 readings, per route, connected and offline |
| `screenshots/batch-2/` | 40 full-page screenshots — 5 surfaces × 2 themes × 4 widths |
| `screenshots/batch-2-hazlenz/` | 40 — 5 HazLenz states × 2 themes × 4 widths |
| `screenshots/system-states/` | The 404 in both themes at two widths; the offline state of each route; the draft restore |
| `before-after/` | The step-label truncation, the instrument's false white-on-white, and the empty-state action |

## What the numbers mean, and what they do not

**Both batches finish at zero objective observations across 80 page/theme/width visits.** That
number is only worth anything alongside the five instrument defects corrected to reach it, every
one of which would otherwise have been filed against the product:

1. The row locator opened the **wrong inspection** — three of five workspace surfaces were
   photographed as an inspection they were not, including one captioned "a started inspection with
   no observations" that was the fully populated one.
2. `net::ERR_ABORTED` from the harness's own navigation, counted as network failures.
3. The mobile tab bar "overlapping" the form — an artifact of full-page screenshots and
   `position: fixed`. Measured at the real scroll bottom: zero overlapping elements.
4. `scrollWidth > clientWidth` **cleared** a step label that was truncated. Measuring a `Range` over
   the text node found it: 62px of text in a 61px box.
5. The contrast parser matched `rgb()` only, so Tailwind 4's `lab()` values were unreadable to it;
   it walked past a solid blue button to the white card behind and reported a legible control as
   white-on-white at ratio 1.0. **This one fails in both directions** — it invents defects and it
   can hide them. Batch 1's "zero contrast defects" was partly luck. The corrected parser
   immediately found a genuine unreadable control.

And a **fixture** defect that was one step from becoming a product verdict: the first HazLenz
fixture wrote only the analysis snapshot, and all five states rendered an identical near-empty
panel. Written up as it stood that read as "the product does not show unresolved states". It was the
fixture — the HazLenz step draws its standards from a persisted **finding**, which the fixture had
not created.

## Zero provider calls

The stack ran with `EXPERT_EXECUTION_ENABLED=false` and no provider key in its environment. The
HazLenz states are saved synthetic snapshots written through the ordinary authenticated API. **No
conclusion in those fixtures says anything about HazLenz** — not whether the engine would reach it,
not whether it is correct. The only question they are admissible for is what the product shows.

## Scope

No production contact of any kind. No production migration, no production write, no deploy, no
push. D-030 untouched. D-024b containment not weakened. No HazLenz semantics tuned.
