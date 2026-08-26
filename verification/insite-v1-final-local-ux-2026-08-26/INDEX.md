# InSite v1.0 — Human Visual Acceptance Shortlist

**Phase:** Final Local Mobile Acceptance Cleanup (2026-08-26)
**Purpose:** the minimum set a human needs to look at before production actions begin.

The mobile-UX phase produced **236 screenshots** across 18 routes × 8 widths × 2 themes
(`verification/insite-v1-mobile-ux-2026-08-26/`). That is a machine artifact, not a review
queue. This index selects **22** of them — by reference, not by copying — and adds the
screens that package could not produce, because it measured `/inspections`, `/reports` and
`/settings` in their **empty** state and never drove the inspection workflow.

## Where the screenshot files are

**The PNGs referenced below are deliberately NOT committed to Git.** The two verification
packages hold **261 screenshots totalling 88 MB**; the deterministic evidence beside them —
the audit JSON, the contrast results, the console logs and this index — is **432 KB**. Git
history is permanent and cannot be pruned without a force push, which is forbidden, so the
binaries stay on the working machine and the reproducible evidence goes into the repository.
Nothing was deleted.

The paths below resolve on the machine that produced them:

* `verification/insite-v1-final-local-ux-2026-08-26/` — captured by this phase
* `verification/insite-v1-mobile-ux-2026-08-26/` — captured by the mobile-UX phase

To regenerate any of them from a clean checkout:

```bash
# mobile screenshots, all routes x phone widths
cd frontend-next
APP_URL=http://localhost:3040 PHONE_ONLY=1 OUT_DIR=<dir> npm run audit:mobile-responsive

# populated-state and workflow screens require a signed-in session against a
# DISPOSABLE database -- never the protected `safescope` one. See blueprint §74.6.
```

If the product owner wants this evidence in Git after all, adding it is a one-command
follow-up commit; removing 88 MB once committed is not.

## How to read this list

| column | meaning |
|---|---|
| **state** | `EMPTY` = no account data behind the page · `POPULATED` = real local records (3 sites, 3 inspections, 5 findings, 5 corrective actions, 6 tasks, 2 reports) |
| **build** | `§73` = captured by the mobile-UX phase · `THIS PHASE` = captured after the fixes below, so it shows the current build |

Anything marked `§73` is a route this phase did **not** change the rendering of. Every route
whose layout this phase touched is re-shot under `THIS PHASE`.

---

## A. Acquisition and account entry — mobile 390px

| # | screenshot | shows | state | build |
|---|---|---|---|---|
| 1 | `../insite-v1-mobile-ux-2026-08-26/after/screenshots/home--w390.png` | Landing. Eyebrow, headline, both CTAs inside the first viewport; proof strip below. | EMPTY | §73 |
| 2 | `../insite-v1-mobile-ux-2026-08-26/after/screenshots/pricing--w390.png` | Pricing. Free `$0` / Pro `$24.99`, price and CTAs in the first viewport, comparison behind progressive disclosure. | EMPTY | §73 |
| 3 | `../insite-v1-mobile-ux-2026-08-26/after/screenshots/upgrade--w390.png` | Upgrade — a **different** page from pricing: current-plan badge, four benefits, five Free limits, one CTA. | EMPTY | §73 |
| 4 | `../insite-v1-mobile-ux-2026-08-26/after/screenshots/register--w390.png` | Register. Two plan cards, 44px terms target, `Show` toggle. | EMPTY | §73 |
| 5 | `../insite-v1-mobile-ux-2026-08-26/after/screenshots/login--w390.png` | Login. Standalone auth links at full tap height. | EMPTY | §73 |

## B. The application, populated — mobile 390px, light

These are the screens the prior package could not capture. **Look hardest here.**

| # | screenshot | shows | state | build |
|---|---|---|---|---|
| 6 | `populated/light-_command-center-390.png` | Home dashboard with real tasks and actions. | POPULATED | THIS PHASE |
| 7 | `populated/light-_inspections-390.png` | Inspections list: three inspections, mixed statuses, two jurisdictions, long site names. | POPULATED | THIS PHASE |
| 8 | `populated/light-_reports-390.png` | Reports list with two generated reports. **`Download PDF` / `Delete Report` are the buttons this phase raised from 32px to 36px.** | POPULATED | THIS PHASE |
| 9 | `populated/light-_settings-390.png` | Settings with three saved sites. **The site-row Edit/Delete controls this phase un-clipped.** | POPULATED | THIS PHASE |
| 10 | `populated/light-_safety-calendar-390.png` | Calendar with six scheduled tasks across priorities. | POPULATED | THIS PHASE |
| 11 | `populated/light-_profile-390.png` | Profile. **The panel that was 442px wide in a 390px viewport, clipping Sign Out and Delete Account.** | POPULATED | THIS PHASE |

## C. The inspection workflow on a phone — 390px

| # | screenshot | shows | state | build |
|---|---|---|---|---|
| 12 | `phone-e2e/03-workspace-capture.png` | Capture step: evidence control, location, work activity, regulatory context, observation field. | POPULATED | THIS PHASE |
| 13 | `phone-e2e/04-workspace-review.png` | HazLenz Level-1 result with standards, on a phone. | POPULATED | THIS PHASE |
| 14 | `phone-e2e/05-reports-populated.png` | The generated report reachable from the phone reports list. | POPULATED | THIS PHASE |
| 15 | `populated/light-_inspection-workspace-390.png` | Workspace re-entered from a saved context. | POPULATED | THIS PHASE |

## D. Dark theme — mobile 390px

| # | screenshot | shows | state | build |
|---|---|---|---|---|
| 16 | `populated/dark-_command-center-390.png` | Dark dashboard, populated. | POPULATED | THIS PHASE |
| 17 | `populated/dark-_inspections-390.png` | Dark inspections list, populated. | POPULATED | THIS PHASE |
| 18 | `populated/dark-_settings-390.png` | Dark settings with saved sites. | POPULATED | THIS PHASE |

## E. Desktop — 1440px

| # | screenshot | shows | state | build |
|---|---|---|---|---|
| 19 | `desktop/home--w1440.png` | Landing at desktop width. | EMPTY | THIS PHASE |
| 20 | `desktop/pricing--w1440.png` | Pricing at desktop width. | EMPTY | THIS PHASE |
| 21 | `desktop/upgrade--w1440.png` | Upgrade at desktop width — confirms it is a different page from pricing. | POPULATED | THIS PHASE |
| 22 | `desktop/reports--w1440.png` | Reports at desktop width, populated. | POPULATED | THIS PHASE |

`desktop/command-center--w1440.png` and `desktop/inspections--w1440.png` are also present if
a wider desktop pass is wanted; they are not part of the minimum 22.

---

## What a reviewer is being asked to judge

The automation already answers, and a human need not re-check:

* horizontal scrolling at 320–430px — **0** across 90 phone combinations, masked and unmasked;
* touch targets below 36px — **0**, excluding inline prose links (WCAG 2.5.8) and inactive
  controls (WCAG 1.4.3), both of which the instruments now mark rather than silently drop;
* text contrast below AA — **0** pixel-confirmed at desktop and at 390px, both themes;
* hydration mismatches — **0** across 20 routes × 2 themes;
* the pricing contract — 37 assertions, all passing.

What automation cannot answer, and what this shortlist is for:

1. **Does it look like a product someone would pay $24.99/month for?**
2. **Card density on the populated lists** (#7, #8, #10) — is the information hierarchy right,
   or does everything read at the same weight?
3. **Long-text behaviour** (#7, #9) — real site names now wrap or truncate rather than push
   the layout; is the result readable?
4. **The workflow steps** (#12, #13) — is the phone capture step something an inspector would
   actually complete while standing in front of the hazard?
5. **Dark theme** (#16–#18) — coherent, or merely not-broken?
6. **Desktop** (#19–#22) — does the layout use the width, or is it a stretched phone?
