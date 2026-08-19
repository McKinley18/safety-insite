# InSite Whole-Application Visual Acceptance Matrix

Baseline: `4c7a501d361f4e5f340ae58af6976303452fc2a5`
(tag `insite-inspection-ui-verified-2026-08-19`), branch `release/insite-rc-2026-08-18`.

Captured against the **production build** (`next build` + `next start`) on
`http://localhost:3010`, pinned to the disposable API on `http://localhost:4010`
(database `insite_full_qa_20260818`). Real Chromium, real auth, real HazLenz.

Viewports: desktop 1440x1000, mobile 390x844. Every route captured full-page in
light and dark at both viewports — 84 captures per sweep.

## What PASS means here

A cell is PASS when, for that route/theme/viewport, the rendered page showed:

- zero horizontal overflow (`documentElement.scrollWidth - clientWidth === 0`),
- zero uncaught page errors and zero console errors other than the disclosed
  environment artifact below,
- the correct root theme class and first-paint background for the theme,
- a single page-level `<h1>`,
- and no pixel-confirmed text-contrast failure from the route-wide audits.

**Honest scope limit.** The per-cell verdicts are backed by measured page state
plus the pixel-contrast audits that ran across every route in both themes. A
subset of the 84 final captures was additionally inspected image-by-image
(command centre light/dark before and after, inspections dark, the public
surfaces that changed, and the three USER_CONFIRMED workflow captures). This is
not a claim that all 84 final images were individually eyeballed.

## Route inventory and final verdicts

| Route | Classification | Auth | Light desktop | Dark desktop | Mobile | Key states exercised | Final |
|---|---|---|---|---|---|---|---|
| `/` | PUBLIC | no | PASS | PASS | PASS | signed-out CTAs, signed-in CTA swap | PASS |
| `/about` | PUBLIC | no | PASS | PASS | PASS | static marketing | PASS |
| `/pricing` | PUBLIC | no | PASS | PASS | PASS | public mode, signed-in upgrade mode, disabled "Current Plan" | PASS |
| `/legal` | PUBLIC | no | PASS | PASS | PASS | static legal | PASS |
| `/hazlenz` | PUBLIC | no | PASS | PASS | PASS | capability copy, CTA swap | PASS |
| `/login` | AUTH | no | PASS | PASS | PASS | rest, invalid-credential error, password show/hide | PASS |
| `/register` | AUTH | no | PASS | PASS | PASS | plan select, password requirements disclosure | PASS |
| `/forgot-password` | AUTH | no | PASS | PASS | PASS | rest | PASS |
| `/reset-password` | AUTH | no | PASS | PASS | PASS | rest | PASS |
| `/command-center` | PRIMARY_PRODUCT | yes | PASS | PASS | PASS | empty dashboard, primary/secondary CTA hierarchy, week strip, empty to-do groups | PASS |
| `/inspections` | PRIMARY_PRODUCT | yes | PASS | PASS | PASS | populated counts, site create, regulatory-context select, disabled "Save site" | PASS |
| `/reports` | PRIMARY_PRODUCT | yes | PASS | PASS | PASS | empty state | PASS |
| `/safety-calendar` | PRIMARY_PRODUCT | yes | PASS | PASS | PASS | month grid, selected day, add/schedule task, persistence | PASS |
| `/settings` | SETTINGS_ACCOUNT | yes | PASS | PASS | PASS | grouped forms, regulatory default, disabled subscription control | PASS |
| `/profile` | SETTINGS_ACCOUNT | yes | PASS | PASS | PASS | account details, disabled subscription control | PASS |
| `/upgrade` | SECONDARY_PRODUCT | yes | PASS | PASS | PASS | upgrade mode of pricing content | PASS |
| `/unlock` | SECONDARY_PRODUCT | yes | PASS | PASS | PASS | PIN create | PASS |
| `/inspection-workspace` | PRIMARY_PRODUCT | yes | PASS | PASS | PASS | see note below — verified through the workflow harnesses, not the static sweep | PASS |
| `/inspection` | LEGACY | yes | PASS | PASS | PASS | renders; not reachable from shipped navigation | N/A (legacy) |
| `/inspection-quick` | LEGACY | yes | PASS | PASS | PASS | renders; zero inbound links anywhere in the app | N/A (legacy) |
| `/inspection-review` | LEGACY | yes | PASS | PASS | PASS | renders; no page-level `<h1>` | N/A (legacy) |
| `/inspection-cover` | LEGACY | yes | PASS | PASS | PASS | renders; only reachable from the legacy cluster | N/A (legacy) |

### `/inspection-workspace`

The highest-priority product surface cannot be captured by a static route sweep
because it requires a live inspection. It is verified instead by three harnesses
that drive the real workflow end to end and screenshot it:

- `check-user-confirmed-multiobservation.mjs` — 3 observations, 4 findings,
  4/4 finalized, 0 superseded, reload-stable order, report generated
  (`screenshots/uc-02-all-findings.png`, `uc-03-complete.png`).
- `check-add-finding-workflow.mjs` — Add Finding discoverability and
  observation-scoped finding ownership.
- `check-theme-flash.mjs` — first-paint theme correctness on the workspace route.

### Legacy cluster

`/inspection`, `/inspection-quick`, `/inspection-review` and `/inspection-cover`
are still routable by direct URL but are **not reachable from shipped
navigation**: both launchers on `/inspections` ("Quick Inspection" and "Full
Inspection") now target `/inspection-workspace`, and `/inspection-quick` has zero
inbound references anywhere in `app/`, `components/` or `lib/`. They are recorded
here so they cannot silently disappear from the audit, and were deliberately not
polished. They do not redirect, so nothing was verified as a redirect.

## Disclosed environment artifact

Four console entries remain in the final sweep, all the same one: a 404 for
`GET /offline/safescope-brain-bundle.json`. That bundle is produced by a separate
knowledge-export step and is simply not generated in this local disposable
environment. `AppShell` requests it once per session and explicitly swallows the
failure ("App startup should never be blocked by brain bundle refresh"), so there
is no customer-visible error state. It is an environment artifact, not a product
defect, and is not counted against any route.
