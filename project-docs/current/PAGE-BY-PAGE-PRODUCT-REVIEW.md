# Page-by-page product review — §279, §280, §281

Every active customer-facing route in Safety InSite, what it is for, and where its review stands.

**§280** carried out the product-owner decisions D-031 to D-037 and reviewed batch 2, the inspection
spine. Batch 2 evidence: `verification/current/page-review-280/`.

**§281** carried out D-038 to D-041 and reviewed batch 3, the HazLenz presentation. Batch 3
evidence: `verification/current/page-review-281/`.

**The inventory below is now derived from CUSTOMER REACHABILITY, not from filesystem presence.**
That distinction is the whole of D-038: this document listed three routes as active customer-facing
pages that no customer could open, and batch 1 reviewed one of them as active. A `page.tsx` on disk
proves a route compiles and nothing else. Every row is now classified by
`frontend-next/scripts/measure-281-route-reachability.mjs`, which requires an anchor crawl AND a
source-reachability fixpoint to both miss a route before it will call it an orphan.

**No page is marked PASS on automated route tests.** A page reaches PASS only after it has been
opened in a real browser, at the four required widths, with populated, empty and error states
looked at. The measurement scripts produce evidence; a person produces the verdict.

Status values: `NOT_REVIEWED` · `REVIEW_IN_PROGRESS` · `ADJUSTMENTS_REQUIRED` · `PASS` ·
`PASS_WITH_LIMITATION` · `BLOCKED`

Machine-readable companion: `verification/current/page-review-279/PAGE-INVENTORY.json`.
Batch 1 evidence: `verification/current/page-review-279/`. Batch 2: `verification/current/page-review-280/`.

---

## How the review is run

The real localhost stack, a real account, synthetic data, **no development bypass** — the session
comes from the login form and `DEV_AUTH_BYPASS=false`. The database is a registered disposable one,
created and torn down by run id under the §277 ownership rules; the original development database is
never migrated or written to.

`frontend-next/scripts/review-279-page-batch.mjs` captures, per page and per width: a full-page
screenshot, horizontal overflow with the element responsible, console errors, failed requests,
interactive controls with no accessible name, text below the contrast floor, under-sized touch
targets, heading structure, and retired brand wording.

### Two instrument corrections made during batch 1, and why they matter

The first run reported **22** objective observations. **Eighteen were the instrument, not the
product.**

1. The contrast check walked up from a text node looking for a solid background colour. A gradient
   panel's computed `backgroundColor` is transparent, so it walked straight past the login hero to
   the white body and reported *white text on white* at a ratio of 1.0 — for every line of a panel
   that is perfectly legible. A backdrop this method cannot evaluate is now reported as NOT
   MEASURED, never as a failure.
2. The touch-target check flagged every inline text link, which is the height of its own text by
   definition. It now only considers controls presented as buttons.

That left **4**, all the same finding at four widths: three controls at 3.86:1. All three are
`disabled`, and WCAG 1.4.3 exempts inactive controls — so the confirmed count is **0**.

**Batch 1 has zero automated contrast defects.** The number only became true after the instrument
was fixed twice; reporting the first 22 would have sent someone to repair text that is fine.

### And one defect no measurement found

The dashboard's seven-day strip renders the weekday and the date as two absolutely positioned spans
in opposite corners of one cell. At 390px the cells are ~40px wide and the two **overlap**: Sunday
the 13th read as `SUN3`, Monday the 14th as `MON4`. Every automated check passed it — each span fits
its own box; they simply occupy the same one. It was found by enlarging a screenshot and looking.
Fixed in batch 1.

---

## Review batches, in order

| # | Batch | Pages | Why this grouping |
|---|---|---|---|
| **1** | **Foundation** | Login · Dashboard · App shell / navigation · Inspection hub · New inspection · Settings | Everything after this inherits the shell, the card, the button and the spacing. Fixing them later is thirty edits instead of three. **Done.** |
| **2** | **The inspection spine** | `/inspection` · `/inspection-workspace` · `/field-capture` | The core workflow, and the largest single surface in the product. **Done at §280.** |
| **3** | **HazLenz presentation** | Eight HazLenz states within `/inspection-workspace` | It turned out not to be the concision question. **Done at §281** — the finding is that the product was WITHHOLDING what the engine had already said |
| 4 | Closing an inspection | `/inspection-complete` · `/reports` | Where an inspection becomes a record. `/inspection-review` was retired at §281 (D-038) |
| 5 | Follow-through | `/safety-calendar` · corrective actions · tasks | The D-007 surfaces |
| 6 | Account and commerce | `/profile` · `/pricing` · `/upgrade` · `/unlock` · plan and entitlement surfaces | Lower risk, and the plan surfaces depend on billing configuration |
| 7 | Public and system | `/` · `/about` · `/hazlenz` · `/legal` · `/register` · `/forgot-password` · `/reset-password` · 404 · error and loading states | Signed-out surfaces plus the system states the product does not yet have |

---

## Active customer-facing pages

**Classification is measured, not asserted.** `REACHABILITY` below is the class
`measure-281-route-reachability.mjs` assigned, from `verification/current/page-review-281/route-reachability.json`:

- `ACTIVE_REACHABLE` — a breadth-first crawl of visible anchors, from `/` signed out or
  `/command-center` signed in, arrives here.
- `ACTIVE_DEEP_LINK` — **not** anchor-crawlable, but navigated to from code a reachable route can
  execute: a `router.push`, a link inside a closed menu, a state the crawl did not reach, or an
  entry from outside the product entirely (a password-reset email).
- `LEGACY_ORPHAN` — neither. **There are currently none.**

| Route | Page | Purpose | User | Access | Reachability | Status |
|---|---|---|---|---|---|---|
| `/login` | Sign in | Authenticate | any | public | `ACTIVE_REACHABLE` | **ADJUSTMENTS_REQUIRED** |
| `/command-center` | Dashboard | Home: due work, week at a glance, counts | inspector | auth | `ACTIVE_REACHABLE` | **ADJUSTMENTS_REQUIRED** — counters repaired at §281 (D-041) |
| *(shell)* | Navigation / header / tab bar | Primary navigation on every page | inspector | auth | `SHELL` | **ADJUSTMENTS_REQUIRED** — active-item highlight repaired at §281 |
| `/inspections` | Inspection hub | Choose a workflow, pick site and regulatory context, open saved inspections | inspector | auth | `ACTIVE_REACHABLE` | **ADJUSTMENTS_REQUIRED** |
| `/settings` | Settings | Sites, billing, theme, report storage, risk matrix, HazLenz scope, **version** | inspector | auth | `ACTIVE_REACHABLE` | **ADJUSTMENTS_REQUIRED** |
| `/inspection-workspace` | Observation entry, HazLenz, findings, review, actions | The core workflow, and the largest surface in the product | inspector | auth | `ACTIVE_DEEP_LINK` | **ADJUSTMENTS_REQUIRED** — HazLenz step reviewed at §281 |
| `/field-capture` | Field capture | Offline-capable observation and photo capture | inspector | auth | `ACTIVE_REACHABLE` | **PASS_WITH_LIMITATION** — batch 2 |
| `/inspection-complete` | Inspection completion | Close out and generate the report | inspector | auth | `ACTIVE_DEEP_LINK` | NOT_REVIEWED — batch 4 |
| `/reports` | Report history | Generated reports | inspector | auth | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 4 |
| `/safety-calendar` | Safety Calendar | Scheduled corrective actions and follow-up tasks | inspector | auth | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 5 |
| `/profile` | Account | The signed-in user's account | inspector | auth | `ACTIVE_DEEP_LINK` | NOT_REVIEWED — batch 6 |
| `/upgrade` | Upgrade | Plan upgrade entry (5 lines — a redirect shim) | inspector | auth | `ACTIVE_DEEP_LINK` | NOT_REVIEWED — batch 6 |
| `/unlock` | Unlock | PIN / local vault unlock | inspector | auth | `ACTIVE_DEEP_LINK` | NOT_REVIEWED — batch 6 |
| `/pricing` | Pricing | Plans (11 lines — delegates to a component) | prospect | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 6 |
| `/register` | Create account | Sign up | prospect | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |
| `/forgot-password` | Forgot password | Request a reset | any | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |
| `/reset-password` | Reset password | Complete a reset | any | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |
| `/` | Home (marketing) | Product landing | prospect | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |
| `/about` | About | What the product does | prospect | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |
| `/hazlenz` | HazLenz | What the engine does | prospect | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |
| `/legal` | Legal | Legal index | any | public | `ACTIVE_REACHABLE` | NOT_REVIEWED — batch 7 |

Desktop and mobile are supported on every row; the column was dropped because it carried the same
value 21 times. `/field-capture` is the one surface where mobile is **primary**.

**20 routes on disk, 20 classified, 0 orphans.** Before §281 the same instrument read 23 on disk and
**3 orphans**.

## Routes that are not part of the active product

| Route | Classification | Disposition |
|---|---|---|
| `/inspection-quick` (570 lines) | **ORPHAN / superseded prototype** | **REMOVED at §280** under D-033, with its sole-support module |
| `/inspection` (952) · `/inspection-cover` (232) · `/inspection-review` (327) | **UNREACHABLE CLUSTER** — a closed cycle with no way in | **REMOVED at §281** under D-038, with the 98 modules that existed only to support them. Proof: `verification/current/page-review-281/D-038-CAPABILITY-AND-DEPENDENCY-PROOF.md` |

### D-038 — the closed cycle is retired: 101 files, 13,416 lines

**The full proof is in the evidence package; this is the summary and the part a reader needs.**

§280 called this "a closed 1,511-line cycle". That is the three page files. The three pages were
the entry points to a whole parallel product, and the deletion set — computed as a strict fixpoint
over the import graph, where a module is deletable only when *every* file that imports it is itself
deletable — is **101 files and 13,416 lines**.

**No capability the active workflow requires was found in it.** The active workflow runs end to end
without any of it: it reaches HazLenz through the server rather than through a client-side call,
and it generates reports server-side rather than in the browser.

**Nine product concepts existed only there, and are now gone.** They are recorded in full in the
proof document, and they are product-owner decisions rather than engineering gaps — no customer
has ever been able to reach them. In brief: report cover fields (organization, additional
inspectors), company logo on a report, a confidentiality marker, plan-tiered report packages, local
PDF export, photo annotation, a device-local offline inspection store, a 25-component HazLenz
reasoning presentation family, and post-completion report editing.

**One of those deserves its own sentence, because the natural fear is the opposite of the truth.**
Deleting 25 `HazLenz*` presentation components sounds like throwing away the engine's best
explanation of itself. It is not. Those components render an older intelligence contract, they were
reachable only from a page no customer could open, and — checked specifically — **not one of them
rendered `criticalUnknowns`, `multiHazardReview` or `confidenceLimitReason` either.** The D-040
defect was never "the good presentation is on the dead page".

**Two files the naive closure would have taken were held back**, because a *different* orphan
imports them: the photo-annotation family (kept alive by `components/reports/ReportCard.tsx`) and
`lib/offlineQueue.ts` (kept alive by `lib/localVault.ts`). Both of those are themselves dead — zero
importers anywhere — and both are raised as **D-043** rather than swept up here. D-038 authorises
retiring a named cycle, not an opportunistic clear-out of everything the work walked past.

**One persistence dependency is deliberately RETAINED.** `lib/auth.ts` still sweeps the four
device-global localStorage keys the deleted `offlineInspectionStore` used to write. A device that
ran any earlier build still holds that content — raw observation text, local findings, report
drafts, with no account namespace — and it does not expire because the writer was removed. Deleting
the sweep with the writer would reopen the cross-account leak V1-OFFLINE-ISO-01 closed.

### D-033 — the `/inspection-quick` dependency proof, and the removal

Every class of dependency the decision named, checked before anything was deleted:

| Dependency | Result |
|---|---|
| Inbound navigation | **None.** No `href`, `router.push` or `router.replace` targets it anywhere in `app/`, `components/`, `lib/`, `hooks/` or `types/` |
| Imports | **None.** Nothing imports the page module |
| API dependency | **None.** The page makes no `apiFetch`, no `fetch`, no `/api/` call — it was entirely local-storage driven |
| Test dependency | **Three enumerations**, not one of them a behavioural dependency: `check-hydration.mjs` (the only one wired to an npm script — updated), `check-visual-acceptance.mjs` and `validate-275-product-surface.mjs` (historical instruments, not wired to any script, **left untouched** so the runs they produced stay reproducible as they were) |
| Documentation dependency | Records only — this file, the baseline JSON, and frozen historical evidence. Frozen evidence is **not** edited |
| Deep-link requirement | **None.** Absent from `sw.js`, the web manifest, the sitemap and the route tables. There is no middleware |
| Product workflow dependency | **None.** Both workflow cards on `/inspections` enter `/inspection-workspace` |

**Removed:** `frontend-next/app/inspection-quick/page.tsx` (570 lines) and
`frontend-next/lib/inspection/quickReviewService.ts` (116 lines), which existed solely to support it
— it was imported by that page and by nothing else, and imported nothing itself. Every other module
the page used (`reportStorage`, `actionStorage`, `evidenceStorage`, `activityStorage`, the annotation
components, `HeroPanel`) has other consumers and was **not** touched. `check-hydration.mjs` had the
route removed from its list. The production build no longer emits the route.

## System states

| Surface | Present? |
|---|---|
| `not-found.tsx` (404) | **Yes — added at §280** (D-034). Branded, inside the app shell, two recovery actions |
| `error.tsx` (error boundary) | **Yes — added at §280** (D-034). `unstable_retry()` first, dashboard second, support digest one level down |
| `global-error.tsx` (root layout failure) | **Yes — added at §280.** Self-contained: no app styles reach it, so its palette and theming are inline |
| `loading.tsx` | **Yes — added at §280.** Segment-level only, and deliberately quiet |
| About / version surface | **Yes — added in §279**, at Settings → Version |
| Update-available UI | **Yes — added in §279** |
| Update-required UI | **Yes — added in §279** |
| Workspace draft recovery | **Yes — added at §280** (D-035) |

### D-034 — what was built, and one thing it deliberately does not say

All four share one presentation, `components/system/SystemStatePanel.tsx`, because three surfaces
saying the same thing in three voices is how they drift. Canonical branding, no raw framework
presentation, a recovery action where one is honest, consistent in both themes, responsive, and
`role="status"` / `role="alert"` with a live region so a screen reader is told the state on arrival.

**The error boundary does not tell the user their work is safe.** It cannot know — it is remounting
the tree that held it. It states the thing it *does* know, which is that anything already saved to
Safety InSite is on the server and unaffected, and says nothing about unsaved typing. A reassurance
printed there would be a guess in the product's voice at the exact moment someone is deciding
whether to trust it. D-035 is what actually protects the draft.

`error.tsx` also does not render `error.message`: Next serialises the real message to the client in
development only, so the field would be informative locally and empty in production — blank exactly
where it matters. The `digest` is shown instead, as a reference for support rather than something to
interpret.

**One limitation, recorded not repaired.** A signed-**out** visitor to an unknown URL never reaches
the 404: AppShell's guard redirects any unrecognised path to `/login` before it renders. That is
pre-existing behaviour, and who a mistyped URL belongs to when nobody is signed in is a product
decision, not a bounded repair.

---

## Batch 1 — findings

### Objective defects

| # | Page | Finding | State |
|---|---|---|---|
| **O-1** | Dashboard | Week strip at 390px painted the date **on top of** the weekday: Sunday the 13th read `SUN3`, Monday the 14th `MON4`. Both spans were absolutely positioned into opposite corners of a ~40px cell | **FIXED** — they stack below `sm`; the corner layout is untouched from `sm` up |
| **O-2** | every authenticated page | All of them share one `<title>`: *"Safety InSite — Field safety intelligence powered by HazLenz AI."* Five open tabs are indistinguishable, every bookmark and history entry carries the same name, and a screen reader announces the same sentence on arrival at every page. Only `/login` differs | OPEN — the fix is product-wide, see decision D-031 |
| **O-3** | shell | **Two competing page shells.** `sentinel-mobile-page` gives max-width 1152px / gutter 144px; `sentinel-page-shell` gives width 1120px / gutter 160px; `/reports` uses neither and comes out at 976px. Measured at 1440px. Content shifts sideways as you navigate | OPEN — shared fix, see recommendations |
| **O-4** | Inspection hub | Two different left margins inside one card: the headings begin at 121px, the form controls at 256px | OPEN |
| **O-5** | Inspection hub | The workflow cards truncate mid-sentence and leave **double terminal punctuation** — `…notes.…`. The truncated text is the description of the choice the page exists to offer | OPEN |
| **O-6** | Inspection hub | *"Regulatory context not established"* appears twice within three lines of the same footnote, which is also the only centred text on a left-aligned page | OPEN |
| **O-7** | Inspection hub | *"Saved to Safety InSite · 0 persisted inspections"* — "persisted" is engineering vocabulary on a customer surface | OPEN |
| **O-8** | New inspection | *"Include confidentiality marker"* renders as a **red** unchecked checkbox beside a blue checked one. Red is the product's error colour; an unticked option is not an error | OPEN |
| **O-9** | New inspection | A *Remove* button is offered for an empty auto-added "Additional inspector 1" row | OPEN |
| **O-10** | Settings | Subscription status renders the raw value **`none`** in lower case where every neighbouring value is title case | OPEN |
| **O-11** | Settings | *"…checkout and portal actions are unavailable until the **Stripe** environment is set."* names an internal vendor dependency to the customer | OPEN |
| **O-12** | shell (mobile) | The mobile tab bar carries four items — Home, Inspect, Reports, Calendar. **Settings is absent**, reachable on a phone only through a 14px text link inside page content | OPEN |
| **O-13** | shell | A hard-coded `v1.0` marker sits above every page, rendered `uppercase` with `tracking-[0.24em]` so it reads **`V 1 . 0`**, and it is unrelated to the build. Beside a real build identity it is now a second, wrong answer to the same question | OPEN — see D-032 |
| **O-14** | Login | The email field is not `type="email"` (it carries `inputMode="email"` only), so the browser performs no email validation and offers no email autofill affordance | OPEN |

### Subjective design opportunities — for product-owner direction, not for unilateral change

| # | Page | Opportunity |
|---|---|---|
| S-1 | Dashboard | Three different background treatments stack vertically and the blue gradient ends in a hard horizontal seam across the full width, mid-page |
| S-2 | Dashboard | Four identical stat tiles: `0 REPORTS`, `0 FINDINGS`, `0 OPEN ACTIONS`, `0 OVERDUE`. **Overdue** is the one that should be able to shout, and it cannot |
| S-3 | Dashboard | Empty states read *"Nothing here."* three times and offer nothing to do next. A new account's first screen is three empty boxes |
| S-4 | Dashboard | An *Add task* form is embedded in the week strip, making the dashboard a data-entry surface as well as an overview |
| S-5 | global | Orange is used for a secondary navigation action (*View Reports*), a form submit (*Add Task*) and an offline entry point (*Open Field Capture*) — three different meanings, one colour |
| S-6 | Login | The sign-in card occupies the middle third; roughly 300px of empty gradient above and 230px below at 1280×900 |
| S-7 | Inspection hub | *Open Field Capture* (orange, filled) is visually louder than the Quick Capture / Full Inspection choice, which is the actual decision the page asks for |
| S-8 | New inspection / Settings | The hero is centred; every card beneath it is left-aligned |
| S-9 | global | Label styles alternate between `UPPERCASE TRACKED` and sentence case, sometimes within one page |
| S-10 | shell (mobile) | Emoji are used as navigation icons (🏠 📋 🗂 📅). They render as a different typeface per platform and sit oddly beside the brand mark |
| S-11 | Settings | Disabled controls at 3.86:1 are exempt from the contrast rule but are genuinely hard to read |
| S-12 | Inspection hub | "HazLenz AI" appears five times on one page. Correct terminology; the repetition is the observation |

### HazLenz presentation

Batch 1 reaches **no HazLenz output surface** — the analysis, clarification, refusal and
confirmation states all live inside `/inspection-workspace`. The concision review is batch 3.

One thing is visible already: `/inspections` names "HazLenz AI" five times and tells a Free account
three separate times which capabilities it cannot reach. That is where **D-030** will eventually
need a home — an honest statement of what the product does not analyse belongs near where a user
chooses a workflow, not buried in a legal document. **No wording was added in §279.**

### Shared visual changes worth making once

1. **One page shell.** Collapse `sentinel-mobile-page`, `sentinel-page-shell` and the `/reports`
   one-off into a single class with one max-width and one gutter (O-3). This is the single change
   with the widest reach in the product.
2. **One page-title rule.** A route-derived `<title>` set in one place, rather than 15 new
   `layout.tsx` files (O-2).
3. **One meaning per colour.** Decide what orange is *for* before the remaining batches inherit the
   current ambiguity (S-5).
4. **One empty-state component** that states what is missing and offers the action that fills it
   (S-3).
5. **Retire the hard-coded `v1.0` marker** now that the build states its own identity (O-13).

Each of these is a shared-token or shared-component change. None was made in §279: they are exactly
the kind of change that should not happen before the product owner has seen the batch.

---

---

# Batch 2 — the inspection spine (§280)

`/inspection` · `/inspection-workspace` · `/field-capture`, at 390 · 768 · 1280 · 1440, in **both
themes**, against a **production build** (`next build` + `next start`) rather than the dev server.
Populated, empty, "just started", and the five HazLenz output states. **Zero provider calls.**

Two changes to how the review is run, both of which changed the answers:

- **Production build, not dev.** The dev server adds a Next.js dev indicator (a dark circle
  bottom-left that looks like a product control in a screenshot) and cancels HMR requests on every
  navigation, which the instrument recorded as seven `NETWORK_FAILURE` observations against pages
  that had made no failing request. A production build also registers the service worker, which
  `ServiceWorkerRegistrar` deliberately refuses to do in development — without it, the entire D-037
  offline inventory measured the harness.
- **Both themes.** Batch 1 measured light only. Several defects in this codebase's history existed
  in exactly one theme.

## Instrument defects found and corrected during batch 2

§279 recorded two. Batch 2 found **five more**, and every one of them would have been filed as a
product defect.

| # | What it reported | What was actually true |
|---|---|---|
| **I-1** | Three of the five workspace surfaces were photographed, and one measured, as the wrong inspection — including one captioned "a started inspection with no observations" that was in fact the fully populated one | The row locator was `.locator("li, article, div").filter({hasText}).locator("button").last()`. The outer `div` contains **every** row, so `.last()` opened the oldest inspection while reporting it had opened the named one. Now scoped to the row's own `<li>` and its `data-testid`, and the acceptance instrument **asserts the heading matches** before measuring |
| **I-2** | Seven `NETWORK_FAILURE` observations on `/inspection-workspace` | `net::ERR_ABORTED` — requests the browser cancelled because the harness navigated away. Aborts are now counted separately from failures, and the setup navigation waits for the page to settle |
| **I-3** | The mobile tab bar overlapping the observation form at 390px | A full-page screenshot paints `position: fixed` elements at their viewport position. Measured at the real scroll bottom: **zero overlapping elements**. Not a defect |
| **I-4** | "3. Risk & fix" **not** truncated (`scrollWidth > clientWidth` said no) | Both round to 61px. Measuring a `Range` over the text node gave 62px natural in a 61px box — truncated by **one pixel**. A real defect the instrument had cleared |
| **I-5** | "+ Record another condition" as **white text on white**, ratio 1.0 — twenty observations across the HazLenz states | The contrast parser matched `rgb()`/`rgba()` only. Tailwind 4 emits CSS Color Level 4, so `bg-sky-700` computes to `lab(41.6013 -9.10804 -42.5647)`; the parser returned null, the backdrop walk stepped **past the button** to the white card behind it, and reported a solid blue button with white text as illegible. It now paints the value onto a canvas and asks the browser, which handles `lab`, `oklch`, `color()` and anything added later |

**I-5 is the serious one.** It is batch 1's contrast defect in a third disguise, and unlike the
first two it fails in **both** directions: it invented defects on modern-colour surfaces, and it
could have hidden real ones by measuring against the wrong backdrop. Batch 1's "zero contrast
defects" was partly luck. The corrected parser immediately found a genuine one — see O-20.

## Objective defects

| # | Page | Finding | State |
|---|---|---|---|
| **O-15** | `/inspection-workspace` | **Two `<main>` landmarks.** AppShell renders the document's `<main>` and the page rendered another inside it. Invalid, and it breaks landmark navigation and "skip to main". Also true of `/reports` and `/inspection-complete` | **FIXED** — page-level `<main>` replaced by a `<div>` on all three. A gate now catches it |
| **O-16** | every authenticated page | O-2 from batch 1: one shared `<title>` | **FIXED** — D-031 |
| **O-17** | shell | O-13 from batch 1: the hard-coded `v1.0` marker | **FIXED** — D-032 |
| **O-18** | shell | O-3 from batch 1, and **worse than recorded**: measured at 1440px the product had **four** content columns, not three — 1088px @ 176 gutter, 1120 @ 160, 976 @ 232, and **864 @ 288** for `/inspection-workspace` and `/inspection-complete`. §279 missed the fourth because those two use neither shared class, so a search for the classes could not see them. Settings → Inspection workspace moved the content **128px sideways** | **FIXED** — D-036.1. All twelve authenticated routes now measure 1120 @ 160 |
| **O-19** | `/field-capture` | **No `<h1>` at any width, in either theme.** Every heading on the page was an `<h2>`; a screen reader jumping by heading had nothing to land on | **FIXED** — `SectionHeader` gained a `headingLevel` prop (default 2, so nothing else moved) and the page title is now the document's `h1` |
| **O-20** | `/inspection-workspace` → HazLenz | **The "Confidence: … ⓘ" control is 22px tall at 390px**, in both themes, on all five HazLenz states — half the 44px both platforms publish, and the smallest control on the page. It is also the control that opens *what would raise this* and the clarification questions, so on a phone the affordance for the engine's own account of **why its confidence is limited** was the hardest thing on the screen to hit | **FIXED** — `min-h-11` below `sm`, unchanged from `sm` up |
| **O-21** | `/inspection-workspace` | **The step label "3. Risk & fix" was truncated to "3. Risk & …" at 390px** — one pixel over its cell, and the only one of the five that did not fit. It is the step where the reviewer sets the risk of a hazard | **FIXED** — labels wrap instead of truncating; the bottom borders stay on one line because the grid stretches every cell and each label sits at the bottom of its own. That survives a label the product has not written yet, and a 320px phone |
| **O-22** | `/inspection-workspace` | **The "nothing selected" state was a dead end.** It rendered the full workspace chrome — an "Inspection" heading, the advisory caveat and a five-step progress bar for work that does not exist — above one line reading *"No server-saved inspection was selected."* No action, and "server-saved inspection" is engineering vocabulary on a customer surface | **FIXED** — a real empty state naming what is missing and offering the route to `/inspections` |
| **O-23** | `/field-capture` | The same fact stated twice a screen apart: *"No drafts on this device yet."* in the status line and *"No drafts saved on this device yet."* at the bottom, neither saying what to do | **PARTLY FIXED** — the lower one is now the shared empty state with a next step. The status line is unchanged; it is informative when drafts exist |
| **O-24** | `/inspection-complete` | *"This inspection recorded no findings."* states what is empty and stops. On a **completed** safety inspection that is the sentence most in need of a meaning — a reader cannot tell a clean walkthrough from an inspection closed before anything was reviewed | **FIXED** — shared empty state, with the meaning stated |
| **O-25** | product-wide | **51 of the 54 anchors that ask for a text colour do not get one.** `globals.css` carries an unlayered `a { color: inherit; }`; Tailwind 4 puts utilities in a cascade layer, and unlayered CSS beats layered CSS whatever the specificity. Almost everywhere the inherited colour happens to be close to the intended one, which is why it survived — but the moment an anchor's intended colour differs from its parent's, the anchor is silently wrong. It bit immediately: the new empty-state action rendered #0F172A on #0F172A, **contrast ratio 1.0, a completely unreadable button**, while the identical `<button>` branch beside it was fine | **CONTAINED, not fixed** — the component now uses `!text-white`, the convention the rest of the product already uses for this. Layering the `a` rule would let 51 dormant utilities take effect at once, which is a visual change nobody has looked at. **D-039** |
| **O-26** | `/inspection`, `/inspection-cover`, `/inspection-review` | Listed in this document as active customer-facing pages; measured unreachable from the product | **FIXED at §281 (D-038)** — retired, with the 98 modules that supported only them |

## `/inspection` — review *(the page was retired at §281; this is §280's record of it)*

**Not reviewed as a product surface, because the evidence says it is not one.** It is 952 lines of a
second, older inspection UI — a dark "Upload Evidence" hero with Take Photo / Upload, a
`STEP 1 Hazard Details` bar with Back/Next, a floating "Finding Builder" panel — sharing no visual
vocabulary with the rest of Safety InSite, and reachable only by typing the URL. Reviewing its
spacing would be work spent on a page no customer can open. See D-038.

**Disposition: RETIRED at §281.** §280's reading was right and the decision followed it. This entry
is kept as the record of what batch 2 measured, not as a description of the current product.

## `/inspection-workspace` — review

**ADJUSTMENTS_REQUIRED.** Five objective defects found and fixed (O-15, O-18, O-20, O-21, O-22);
zero automated observations remain at four widths in both themes.

The product principle holds on the capture step. It asks for **one** required field — *What did you
see?* — with Photo, Where, Task being done all marked `(optional)` and Regulatory context inherited
from the inspection. That is limited user input, and it is right. Nothing on this screen should be
added without a specific reason.

Field use, at 390px:

- One-handed capture is workable: the textarea is the dominant element and the primary action sits
  directly under it.
- The **photo control is the browser's raw file input**, rendering `Choose File No file chosen` in
  the browser's own typeface — on the product's most important surface, and the one control an
  inspector standing in front of a hazard reaches for first. It is legible in both themes (the dark
  theme is handled), so this is recorded as a product opportunity rather than a defect. **S-13.**
- Long observation text behaves: the textarea grows, nothing overflows, the tab bar does not cover
  the form at the scroll bottom (I-3).
- **Accidental refresh no longer destroys work** (D-035). Accidental back-navigation is not covered
  and was not tested.

## `/field-capture` — review

**PASS_WITH_LIMITATION.** One objective defect found and fixed (O-19), one partly (O-23).

It is the only surface in the product that works with no connection, and it is **honest about what
it is**: *"HazLenz AI analysis, risk scoring, corrective actions and report generation run on Safety
InSite's servers and need a connection. Field capture never analyses anything on the device."* and
*"These live on this device, for this account only."* Sync is a button, and the page says so. That
is the standard the rest of the product's offline story should be held to.

The limitation is D-037: it is one page. Everything the inspector does after capturing — analysis,
review, findings, completion, the report — requires a network.

## HazLenz presentation — findings

Reached with **saved synthetic analyses and zero provider calls**
(`scripts/review-seed-hazlenz-states.mjs`), across five states: a straightforward finding,
clarification outstanding, unresolved/not-supported, awaiting human confirmation, and several
findings from one observation.

**Two scope statements, both load-bearing.** These fixtures say nothing whatever about HazLenz —
not whether the engine would reach these conclusions, not whether they are correct, not how often.
The only question they are admissible for is what the product **shows**. And this review covers the
**HazLenz step only**; steps 3–5 (Risk & fix, Review, Finish) were not traversed, so anything below
is about one screen.

### The fixture defect that nearly became a product verdict

The first fixture wrote only the analysis snapshot, and all five states rendered an identical,
nearly empty panel — no standard, no clarification question, no critical unknown, not even in the
simple case. Written up as it stood, that was "the product does not show unresolved states".

It was the fixture. `resolveFindingStandards` reads `finding.sourceCandidate.standardCandidates`, so
the standards, the confidence disclosure and the clarification questions nested inside it are driven
by a **persisted finding**, and an analysis with no finding has nothing to draw them from. The
fixture now creates the review and the finding the real flow creates. This is recorded because the
first reading was a tooling failure one step away from being reported as a product verdict.

### What the HazLenz step shows, measured against what the analysis contains

Each string below is in the saved snapshot; SHOWN/ABSENT is whether it reaches the DOM with every
disclosure expanded.

| State | Shown | Absent |
|---|---|---|
| A — a finding | standard citation, why it was offered, the advisory caveat | — |
| B — clarification | both clarification questions, including the decision-critical one; evidence missing | the confidence-limit reason |
| C — unresolved | both applicability explanations (UNKNOWN and NOT_SUPPORTED) | **both critical unknowns**, the missing predicates, the explicit "could not determine an applicable standard" limitation, and the "Not established" risk |
| D — confirmation | the confirmation state, the standard citation | the confidence-limit reason |
| E — several findings | one candidate's standard, one additional standard title | **the split-review instruction**, and three of the four candidates |

### Three contract fields are computed and never displayed — **CLOSED at §281 (D-040)**

*The table below is §280's finding as recorded. All three fields are now presented; see
"Batch 3 — the HazLenz presentation (§281)" above for what was built and how it measures.*

Confirmed at source, not inferred from a screenshot:

| Field | Status |
|---|---|
| `evidenceSnapshot.criticalUnknowns` | Declared in `HazLenzAnalysisResult`. **The only occurrence in the entire frontend is the type declaration.** Never rendered |
| `guidedFinding.multiHazardReview` (`requiresSplitReview`, `instruction`) | Declared. **Never rendered.** The engine's instruction that several hazards need separate review is not shown |
| `primaryStandard.confidenceLimitReason` | Read into the presentation projection at two call sites and **never consumed**. The engine's reason for limited confidence is computed and dropped before display |

The product owner's five questions, against the HazLenz step as it stands:

| | |
|---|---|
| 1. What did HazLenz find? | Answered — the finding's conclusion and its standard |
| 2. Why does it matter? | Partly — "why offered" is shown; the risk rationale belongs to step 3 and was not reviewed |
| 3. What should I do? | Not on this step — "Continue to risk" is the only action |
| 4. **What important fact is missing?** | **Not answered.** The field designed to answer it is never rendered, and in the unresolved state the screen is nearly indistinguishable from the resolved one |
| 5. What governing rule supports it? | Answered, with confidence and applicability — though *why* confidence is limited is dropped |

**Question 4 is the significant HazLenz presentation finding of this batch**, and it is the opposite
of a concision problem: the engine states the decision-controlling unknown and the product withholds
it. Nothing here is a proposal to remove safety-critical information to shorten a page. **D-040 —
carried out at §281.**

### Presentation observations, recorded not changed

| # | Observation |
|---|---|
| S-13 | The photo control is the browser's raw file input on the product's primary surface |
| S-14 | The Expert card reads **"Expert analysis has not been run for this observation"** with a **"Run Expert review"** button. "Expert" is an internal engine-family name; the customer-facing engine is HazLenz AI |
| S-15 | On a Free account that same card showed the paid-subscription notice in the product's **error red**, beside an **enabled** "Run Expert review" button the account cannot use. Under the §280 colour rule an entitlement state is orange (unresolved), not red — and an action that cannot succeed should not be offered as though it can |
| S-16 | *"That is not a finding that there are no hazards."* — precise, and a double negative on a safety surface. **Safety-critical; must not be dropped**, only said better |
| S-17 | The advisory caveat is three lines at the top of every visit to the workspace, on every observation |
| S-18 | The two disclosures ("Not right? Revise what you wrote", "Add a finding HazLenz missed") use the browser's raw `▶` marker |

## Field and mobile usability

| Finding | Status |
|---|---|
| The confidence control was a 22px tap target at 390px | FIXED (O-20) |
| A step label truncated at 390px | FIXED (O-21) |
| The tab bar does not cover the form at the scroll bottom | Verified, not a defect (I-3) |
| Emoji as navigation icons (🏠 📋 🗂 📅) render as a different typeface per platform | Open — S-10, batch 1 |
| Accidental refresh loses work | FIXED (D-035) |
| Accidental back-navigation | **Not tested** |
| Intermittent network mid-capture | **Not tested.** Only total loss was measured (D-037) |

## Accessibility

| Finding | Status |
|---|---|
| Two `<main>` landmarks on three pages | FIXED (O-15) |
| No `<h1>` on `/field-capture` | FIXED (O-19) |
| Every page shared one `<title>` | FIXED (O-16 / D-031) |
| A 22px tap target | FIXED (O-20) |
| An unreadable action at contrast 1.0 | FIXED (O-25, contained) |
| Controls with no accessible name | None found, four widths, both themes |
| Contrast below the floor | None confirmed — **after** the parser was corrected (I-5) |
| `/inspection-complete` has no `<h1>` until its inspection loads | Open, batch 4 |

## Connectivity and data loss

Full inventory: [`OFFLINE-FIELD-OPERATION.md`](OFFLINE-FIELD-OPERATION.md).

The two findings that matter here: workspace drafts are now **RECOVERABLE** rather than
**VULNERABLE** (D-035), and `/command-center` **renders offline with all counts at zero** — a
dashboard reading `0 OVERDUE` when it cannot reach the server is indistinguishable from one that
can. A safety product must not show a clean board it has not checked. **D-041 — carried out at
§281, where the defect turned out to be larger: the counters were structurally always zero, online
as well as off.**

---

---

# Batch 3 — the HazLenz presentation (§281)

Reached with **saved synthetic analyses and zero provider calls**, across **eight** states, at
**390 / 768 / 1280 / 1440** in **both themes** — 64 visits. Evidence:
`verification/current/page-review-281/`.

**The two §280 scope statements still hold and are still load-bearing.** These fixtures say nothing
whatever about HazLenz — not whether the engine would reach these conclusions, not whether they are
correct, not how often. The only question they are admissible for is what the product **shows**.

## D-040 — the product was withholding what the engine had already said

Three fields are computed by the engine, carried in the contract, and were rendered nowhere:
`evidenceSnapshot.criticalUnknowns`, `guidedFinding.multiHazardReview`, and
`primaryStandard.confidenceLimitReason`. §280 established that by reading source. §281 fixed it.

### What was built

`lib/inspection/hazlenzDecisionPresentation.ts` projects the saved analysis into a decision view.
It **copies** — every hazard-bearing sentence on screen is the engine's own text, verbatim. The one
thing deterministic code decides is STRUCTURAL: whether the analysis contains an unresolved
decision-controlling fact, which is `criticalUnknowns` being non-empty or a question the engine
itself marked `decisionCritical`. Both are the engine's flags, read rather than judged. No safety
semantics are authored here, and none may be.

`components/inspection/HazLenzDecisionSummary.tsx` renders it, in the order a safety professional
actually reads in — not the order the contract declares its fields:

| | question | where it is answered |
|---|---|---|
| 1 | What did HazLenz find? | the heading and the flagged fragment |
| 2 | Why does it matter? | the conclusion and its risk rationale |
| **3** | **What information is still missing?** | **IMPORTANT INFORMATION NEEDED — leads the panel** |
| 4 | Is more than one hazard involved? | the multiple-hazard notice |
| 5 | What limits the conclusion? | the confidence limitation |
| 6 | What should I do next? | the settling question, or the honest absence of one |
| 7 | What rule supports it? | the standards panel below |

Question 3 leads because it is the one the product was not answering at all.

### Resolved vs needs information — three signals, not a colour

- **A WORD.** "Important information needed" is a heading, in text, first.
- **A SHAPE.** A bordered panel with a left rule. **A resolved finding renders no panel at all**, so
  there is nothing to compare against and mistake for decoration.
- **A COLOUR.** Amber, which under D-036.3 means UNRESOLVED. **Red is deliberately not used**: this
  is a state of the analysis, not a fault and not an alarm.

Every sentence is about what HazLenz could not establish, never about what the workplace is.
"HazLenz could not establish…", never "may be unsafe". Unresolved does not mean safe; unresolved
does not mean hazardous.

### Measured, per state, at 1280 in light theme (all eight behave identically in dark and at every width)

| state | resolution | unknowns shown | multi-hazard | confidence limit | confirmation | limitations | developer vocabulary |
|---|---|---|---|---|---|---|---|
| **A** a straightforward finding | *(no panel)* | — | — | — | — | — | none |
| **B** clarification outstanding | `NEEDS_INFORMATION` | question served | — | yes | — | — | none |
| **C** unresolved / not supported | `NEEDS_INFORMATION` | **2** | — | — | — | yes | none |
| **D** awaiting human confirmation | `ESTABLISHED` | — | — | yes | **yes** | — | none |
| **E** several findings from one observation | `ESTABLISHED` | — | **yes** | — | — | — | none |
| **F** confidence limited, nothing outstanding | `ESTABLISHED` | — | — | **yes** | — | — | none |
| **G** no hazard identified | `NO_HAZARD_IDENTIFIED` | — | — | — | — | yes | none |
| **H** Expert review refused | *(no panel)* | — | — | — | — | — | none |

**State A is the control that matters.** A straightforward finding renders no decision panel at
all — which is the requirement that ordinary resolved findings must not be made to look alarming.

**State F is the discriminating case.** A result with a confidence limitation and no outstanding
fact shows the limitation *without* the "important information needed" panel. If the two states had
been collapsed, the distinction would be decoration; they are not.

**Developer vocabulary: zero occurrences, all 64 visits.** `criticalUnknowns`, `multiHazardReview`,
`confidenceLimitReason`, `requiresSplitReview`, `guidedFinding`, `evidenceSnapshot`,
`resultSnapshot`, `applicabilityDecisions`, `decisionCritical`, `sourceCandidate` and
`safeScopeResult` were all checked on every visit and none reaches a customer surface.

### Two defects §281's own measurement caught in §281's own work

**The negated state described a finding that did not exist.** State G rendered "HazLenz assessment",
"HazLenz has what it needs for this conclusion" and "No standard has been established for **this
finding**" — on a screen with no finding on it. The product was describing a conclusion it had not
reached, on the one screen most likely to be misread as "all clear", and the sentence that says
otherwise was collapsed inside a disclosure. `NO_HAZARD_IDENTIFIED` is now a distinct resolution;
it renders an open panel saying what HazLenz did (*identified no hazard in what was recorded*) and,
not behind a disclosure, that **this is not a finding that the area is free of hazards**. It is
deliberately not green and carries no tick.

**A status line named a gap the page then did not show.** State B has a decision-critical question
and no separately stated unknown. The first implementation keyed the panel on `criticalUnknowns`
alone, so the status line read "HazLenz could not establish a fact this conclusion depends on" and
the page never said which fact, or offered the question that would settle it. The panel now renders
whenever the analysis is short of information by either route.

### The clarification is served once, not twice

A decision-critical question now lives beside the unknown it settles, with the engine's own options,
answered in place. The standard's confidence disclosure no longer repeats it — the product owner's
constraint was not to duplicate the same unknown in competing cards, and two cards on one screen
asking the same question is exactly that.

---

## D-039 — the anchor cascade, repaired centrally

**Root cause.** `app/globals.css` carried an **unlayered** `a { text-decoration: none; color:
inherit }`. `@import "tailwindcss"` declares `@layer theme, base, components, utilities`, and
unlayered CSS beats every layer whatever the specificity. One rule silently defeated the text-colour
utility on almost every anchor in the product.

**The repair is the cascade, not the 51 call sites**: the reset moved into `@layer base`. It is
still a reset — an anchor that asks for nothing still inherits — but an anchor that *asks* now gets
what it asked for.

**Measured, not assumed.** `measure-281-anchor-styles.mjs` records computed colour, decoration,
backdrop and contrast for every visible anchor on every active route, both themes, at 390 and 1280.
The baseline was taken **after** D-038 and **before** D-039, so the diff isolates the cascade repair:
D-038 changed **0** anchors.

| | before | after |
|---|---|---|
| anchors measured | 422 | 422 |
| carrying a colour utility | 346 | 346 |
| **utility defeated (inert)** | **272** | **66** |
| appearance changed | — | **206** |
| **contrast fell below the floor** | — | **0** |
| **anchors that gained or lost orange** | — | **0 / 0** |

The 66 still "inert" are anchors whose utility resolves to the same colour as their parent anyway,
and the mobile tab bar, which carries its own deliberate `color: inherit`.

**Worst measurable contrast after the repair: 15.36:1**, against a 4.5 floor. Every change is the
authored utility taking effect: footer links to their intended `text-slate-200`, the `/hazlenz`
legal-disclaimer link to the brand blue, and navigation to its intended inactive tint.

**Orange semantics are intact** — D-036.3 gave orange one meaning and no anchor gained or lost it.

### The repair turned a feature back on

This is the result worth reading. Before:

```
Home #ffffff   Inspect #ffffff   Reports #ffffff   Calendar #ffffff   Settings #ffffff
```

After, on `/reports`:

```
Home #dbeafe   Inspect #dbeafe   Reports #ffffff   Calendar #dbeafe   Settings #dbeafe
```

`AppShell` has always styled the current page's navigation item `text-white` and the others
`text-blue-100`. The unlayered rule defeated both, so **every desktop navigation item rendered the
same colour and the "you are here" indicator's colour half did nothing.** D-039 was not only a
latent styling defect; it was disabling a shipped feature.

---

## D-041 — the dashboard was not merely wrong offline

**§280 raised this as an offline-honesty defect. It is larger than that.**

The four counters were computed from `lib/reportStorage`, `lib/actionStorage` and
`lib/activityStorage` — three device-local stores whose **only** writers were the `/inspection`
route's services, inside the cycle D-038 has now retired. The active workflow has always written to
the server and never to those stores.

Measured at §281 against a real signed-in account, **fully online**, with **seven inspections and
nine observations on the server**:

```
0 REPORTS     0 FINDINGS     0 OPEN ACTIONS     0 OVERDUE
```

This is §276 (D-007) again, one page over: the write path went to the server and the read path
composed device-local stores, and no amount of correct local code could produce a right answer.

### The vocabulary, established now for reuse

`lib/data/dataState.ts`. Five states, one rule: **unknown or unavailable data is never rendered as a
verified zero.**

| state | means | shows a number? |
|---|---|---|
| `CURRENT` | the server answered, just now | yes, uncaptioned |
| `LAST_SYNCED` | the server is unreachable; this is the last value it gave, dated | yes, **with its date** |
| `PENDING_SYNC` | local work the server has not accepted is in or out of this value | yes, with a count |
| `OFFLINE_UNAVAILABLE` | unreachable, and no trustworthy local value | **no — an em dash** |
| `SYNC_CONFLICT` | local and server disagree irreconcilably | no |

`resolveDataValue` makes the rule structural rather than a convention: a caller that did not reach
the server **cannot** emit a verified zero through it, whatever value it passes. `SYNC_CONFLICT` is
declared and deliberately unused; the module records which surfaces can currently produce each
state, so a state nothing can reach is not mistaken for one that is covered.

This is **not** the D-037 synchronisation architecture and must not grow into one. There is no
queue here and no reconciliation — only the states a surface can be in, and the discipline that each
is *said*.

### What the dashboard does now

Each counter is read from the endpoint that can answer it — inspections and reports from the
canonical API, open actions and overdue from the §276 reconciled calendar snapshot, which already
carried `serverReachable` and `servedFromCache` and whose caller was throwing them away. Only a
value the **server** supplied is cached, so a stale number can never refresh its own timestamp and
present itself as current.

**The FINDINGS tile now counts INSPECTIONS, and that is a product change.** There is no unprivileged
server aggregate for "findings across my inspections": `GET /inspections` returns bare rows,
per-inspection detail is one call each, and `/dashboard/*` is gated behind the paid `analytics`
entitlement so a Free account cannot read it. The alternative was keeping a tile that is
structurally always zero, which is the precise thing D-041 forbids. Raised as **D-044**.

Also removed: `criticalFindings`, `hazLenzReviewed`, `highPriorityActions`, `latestReports` and
`recentActivity` were computed from the same dead stores and **rendered nowhere on the page**. Dead
derivations of data that was never written.

### Acceptance — 12 cases, 3 of them deliberate falsifications

`validate:281-offline-data-state`, against a production build with a **controlling service worker**
(it refuses to run otherwise). All 12 pass.

| | case | result |
|---|---|---|
| A | the false-zero detector fires on a constructed false zero, and is quiet on an honest dash and on a dated zero | ok |
| B | `resolveDataValue` refuses a zero it did not verify | ok |
| C | **connected: the figure EQUALS the server's own count**, read independently from the API | ok |
| 1 | connected: every tile shows a figure and no caption | ok |
| 2 / 2b | offline WITH cached data: values shown and **dated**, a cached zero never bare | ok |
| 3 / 3b | offline WITHOUT data: **every tile an em dash**, and every tile says it is unavailable | ok |
| 5 | no duplicate state: one caption per tile, and it is a live region | ok |
| 4 / 4b | reconnect: back to current, caption gone, figure is the server's again | ok |
| 6 | no false zero anywhere on the board | ok |

Case C is the one that matters most: a dashboard rendering a plausible-looking number that is not
the record's number would pass "shows a number" and fails this.

---

## Batch 3 — objective defects, subjective opportunities, and one gate that fails

### Objective defects found at §281

| # | Where | What | Status |
|---|---|---|---|
| **O-27** | shell navigation | Walking into `/inspection-workspace` — the product's most-used surface — highlighted **no** navigation item. `activeRoots` matches exact segments, so `/inspection` never covered `/inspection-workspace`, and the workspace was not listed. The presence of the now-retired `/inspection` in that list is what made the omission look deliberate | **FIXED** |
| **O-28** | HazLenz step, negated result | The screen described a finding that did not exist: "HazLenz has what it needs for this conclusion" and "No standard has been established for **this finding**" on an observation with no finding. The sentence that says an absence of findings is not a finding of safety was collapsed inside a disclosure | **FIXED** (D-040) |
| **O-29** | HazLenz step, clarification result | The status line announced "HazLenz could not establish a fact this conclusion depends on" and the page never said which fact, or offered the question that would settle it | **FIXED** (D-040) |
| **O-30** | HazLenz step, every visit | `GET /expert-analyses/current` returns 402 on a Free account and the client asks anyway, on 64 of 64 visits | **FIXED.** D-045 at §283 (the client read 402 as a generic error, so the plan notice was unreachable code); S-15 decided and implemented at §284 — "Available with Pro", no enabled control, no error styling, and the client stops re-asking after a server-authoritative refusal |

### Subjective opportunities — recorded for product-owner review, not changed

Per direction: subjective changes beyond D-040 are recorded, not made.

| # | Observation |
|---|---|
| **S-19** | The decision panel sits between the finding heading and the **Expert** card. On a phone at 390px an unresolved result therefore pushes the Expert card and the standards below the fold. That is the right priority for the unresolved case and possibly the wrong one for a resolved result with a long limitation list |
| **S-20** | "What this assessment does not cover" opens by default when the result needs information and is collapsed otherwise. That is a judgement about when a limitation is worth interrupting for, and it is a judgement, not a measurement |
| **S-21** | The resolution line is plain text rather than a badge — deliberately, because a badge reads as a severity. Whether it is prominent enough at 390px is a design call a person should make against the screenshots |
| **S-22** | S-13, S-14, S-16, S-17 and S-18 from §280 are unchanged: the raw file input, "Expert" as a customer-facing word, the advisory caveat's length, and the browser's raw `▶` disclosure markers. S-16's double negative now appears in the **negated** state's copy, where it is safety-critical and deliberately kept |

### Mobile and field use

At 390px all eight states render without horizontal overflow, with no control under the 44px touch
floor and no text below the contrast floor. The unresolved panel's answer buttons are `min-h-11`.
**The scrolling burden on an unresolved result is real and unmeasured as a burden**: the panel adds
content above the standards, which is correct prioritisation and still means more scrolling on a
phone. Recorded as S-19 rather than resolved by guess.

### Accessibility

The unknowns panel is a `<section>` with `aria-labelledby` pointing at its own heading, so it is
reachable and announced as a named region. The settling questions are a `<fieldset>` with a
`<legend>`, so each option group is announced with the question it answers. The dashboard's state
captions carry `role="status"`, so a screen-reader user is told the figure beside them is stale or
missing rather than meeting a bare em dash. The resolved/unresolved distinction never rests on
colour. **Not covered:** no screen reader was actually driven — these are structural assertions from
the DOM, not a usability observation, and they are recorded as the weaker thing they are.

### One gate that FAILS, and was not made to pass

`validate:279-update-delivery` **case D1** — "an unsupported client is shown the update-required
state" — times out waiting for the panel.

Isolated with two controls: **HEAD's version of the script fails at the same case**, and it fails on
`/settings`, `/command-center` and `/safety-calendar` alike, none of which §281 changed. So it is
not a consequence of the D-038 removal or the D-041 dashboard work.

Cases **C1–C5 and J pass**, so the version check works: a current client is told about a newer
release and dismissal sticks. What does not fire is the **background re-check on a tab left open** —
§279's Part A mechanism, which is what turns an unsupported client into one that stops writing.
That is safety-relevant. It is recorded as an open failure; the gate was not weakened.

An earlier hypothesis — that `/safety-calendar`'s polling perturbed the mocked clock — was written
down, tested, and found **wrong**. Recorded so it is not tried again.

---

## Decisions requiring product-owner direction

### Closed at §280

| id | Decision | Disposition |
|---|---|---|
| **D-031** | Page titles | **DONE.** One table (`lib/pageTitles.ts`), a four-line server layout per route, `"<Page> · Safety InSite"`. Gate: `check:page-titles`, plus a runtime assertion in the review instrument |
| **D-032** | The `v1.0` chrome marker | **DONE — removed, not repointed.** A version earns chrome on every page only if a user must act on it; nobody does. It is answered at Settings → Version from the generated identity |
| **D-033** | `/inspection-quick` | **DONE — proved orphaned, removed** with its sole-support module. Proof recorded above |
| **D-034** | 404 and error surfaces | **DONE.** `not-found`, `error`, `global-error`, `loading`, on one shared presentation |
| **D-035** | Workspace draft persistence | **DONE.** Architecture and 11-case browser acceptance below |
| **D-036** | Shared visual direction | **DONE** for the five approved items: one page shell, one title rule, one meaning for orange (with a gate), one empty-state pattern, version chrome retired |
| **D-037** | Offline field operation | **REGISTERED.** Inventory in [`OFFLINE-FIELD-OPERATION.md`](OFFLINE-FIELD-OPERATION.md). Nothing implemented, no offline claim made |

### Closed at §281

| id | Decision | Disposition |
|---|---|---|
| **D-038** | The closed `/inspection` cycle | **DONE — RETIRED.** 101 files, 13,416 lines. Dependency and capability proof in the evidence package; nine lost product concepts recorded; two held-back modules raised as D-043 |
| **D-039** | The unlayered `a { color: inherit }` | **DONE — REPAIRED CENTRALLY.** Reset moved into `@layer base`. Inert utilities 272 → 66, zero anchors below the contrast floor, orange semantics untouched — and it turned the navigation's "you are here" colour back on |
| **D-040** | The HazLenz information the product withheld | **DONE.** `criticalUnknowns`, `multiHazardReview` and `confidenceLimitReason` are presented, in decision order, with a resolved/unresolved distinction carried by word, shape and colour. Eight states measured at four widths in both themes; zero developer vocabulary on any customer surface |
| **D-041** | The false offline zero | **DONE, and the defect was larger than reported.** The counters were structurally always zero, online and off. Five-state vocabulary established; dashboard reads the record; 12-case acceptance with three falsifications |

### Open — §281 raises four; D-045 CLOSED at §283

| id | Decision |
|---|---|
| **D-042** | **Interruption and intermittent connectivity acceptance.** REGISTERED at the product owner's direction, deliberately not solved. §281 measured total loss and full reconnect only. Field connectivity is worse than online/offline: requests time out, one succeeds while another fails, the connection disappears mid-upload, connectivity returns halfway through an operation. Future acceptance must cover `online → degraded → timeout → partial success → loss → local continuation → reconnect → sync`, with special coverage for observation save, photo/evidence upload, corrective-action creation, calendar/outbox sync, duplicate submission, session expiration, update/version check, and HazLenz request interruption  **§284: carried to the formal Pre-Production Release Register by product-owner decision.** Still open; the offline/synchronization architecture was explicitly not implemented at §284 |
| **D-043** | **A second orphan cluster, found while retiring the first.** `components/reports/ReportCard.tsx` and `lib/localVault.ts` have **zero importers anywhere** — they are dead, and unrelated to the D-038 cycle. Between them they keep alive the five photo-annotation modules and `lib/offlineQueue.ts`, which is why the strict D-038 fixpoint held those back rather than deleting them. Remove, or reconnect? Note that `ReportCard` is the only thing in the tree that still renders an annotated photo, so deleting it retires photo annotation entirely (capability **C-6** in the D-038 proof)  **REVIEWED AT §284 — NOTHING DELETED OR MIGRATED.** The cluster is larger than this entry says: 8 files, 1,599 lines. `AnnotationEditor` (800 lines) has no real consumer at all — its only inbound edge is a type-only back-import from a module it itself imports — so the annotation subtree is independently unreachable, not merely held up by `ReportCard`. The decisive fact: **the server has no annotation concept whatsoever** (no column, no DTO, no route), so annotations were never persisted through the API and a component-only migration would ship annotations that appear in no report. Recommendation **B. MIGRATE_PHOTO_ANNOTATION_ONLY** with a condition — retire `localVault`/`offlineQueue`/`ReportCard` outright, retain photo annotation as a scheduled feature with server support sequenced after D-042; if it will not be scheduled, the honest answer is A. RETIRE_ALL. Full review: `project-docs/current/D-043-ORPHAN-CLUSTER-CAPABILITY-REVIEW.md` |
| **D-044** | **What the fourth dashboard tile should count.** It counted FINDINGS from a store nothing writes; it now counts INSPECTIONS, which the server answers exactly for every plan. A true findings count needs server support: `GET /inspections` returns bare rows, per-inspection detail is one call each, and `/dashboard/*` is behind the paid `analytics` entitlement. Add an unprivileged aggregate and restore the tile, keep inspections, or something else?  **REPORTED AT §284 — NOTHING CHANGED, per direction.** Current four tiles: **Inspections · Reports · Open Actions · Overdue**. Open Actions is present; the fourth metric differs — `Reports` where the preferred set asks for `Findings`. Minimal correction proposed: rename `Overdue` → `Overdue Actions` (label only, free), and schedule `Reports` → `Findings` **with** the unprivileged server aggregate it needs, because a frontend-only swap would restore exactly the structurally-zero tile §281 removed. Full note: `project-docs/current/D-044-DASHBOARD-TILES.md` |
| **D-045** | **The Expert panel calls a route the account cannot use, on every visit.** Measured on **64 of 64** HazLenz-step visits: `GET /expert-analyses/current` returns `402 PAID_SUBSCRIPTION_REQUIRED` on a Free account and the browser records an error each time. The refusal itself is correct — the guard is doing its job — but the client asks anyway, every time. This is the objective half of §280's **S-15**, which raised the same surface as a product question (an entitlement notice in error red beside an enabled button the account cannot use). **Left unchanged**: whether the panel should be offered at all on a Free account is the S-15 product decision, and §281 was directed not to redesign the Expert experience. **One thing is unexplained and is recorded rather than smoothed over:** §280's identical instrument, on the same five states, recorded **zero** console errors. Both runs used a production build and the same seed script, and Playwright's context-level console listener is live in both. The disagreement is not explained, and it bears on how much weight the "zero console errors" results in batches 1 and 2 can carry  **CLOSED AT §283 — an objective client defect, repaired; the disagreement is explained.** The 402 is `EntitlementGuard` refusing `@RequireEntitlement('fullSafeScope')` on a Free plan, and it is correct. The defect was that `expertApi` recognised 401 and 403 and **not 402**, so the server's `PAID_SUBSCRIPTION_REQUIRED` code was discarded, `EXPERT_NOT_ENTITLED` was never raised, and the panel's plan notice was unreachable code — which is why a billing sentence rendered as a red `role="alert"` beside an enabled control. The mapping now derives from the server's own code; the refusal, the guard and every HazLenz semantic are unchanged, and no server file was touched. Regression `npm run test:expert-api-failure-mapping`, falsified against the pre-repair mapping. **The §280 disagreement was not an instrument failure:** §283 ran both entitlement states on one build and one instrument — Free gives 402 and two console errors per visit, entitled gives 200 and zero, and the entitled rendering is exactly §280's screenshot including the "Show analysis record" disclosure that only appears after a successful read. §280 measured an **entitled** account. **S-15 remains the product owner's.** Evidence: `verification/current/runtime-evidence-283/` |

### Carried from §279, still open

| id | Decision |
|---|---|
| **D-030** | No governed electrical rule. Untouched at §280. Where an honest statement of what the product does not analyse belongs is still open |
| **S-1 … S-12** | Batch 1's subjective opportunities. Of these, **S-5** (orange) is now closed by D-036.3 and **S-3** (empty states) has a component but has not been adopted on the dashboard — that is a batch-1 page and was deliberately not touched |
| **S-13 … S-18** | Batch 2's presentation opportunities, listed above |

---

# D-035 — the draft persistence architecture

`lib/inspection/workspaceDraft.ts` · `lib/inspection/workspaceDraftKey.ts` ·
`app/inspection-workspace/page.tsx`

## The distinction, made structural rather than nominal

| | |
|---|---|
| **SERVER-AUTHORITATIVE COMMITTED STATE** | Whatever `GET /inspections/:id` returns. The record. What a report is built from and what another device sees |
| **DRAFT / LOCAL RECOVERABLE STATE** | One device's copy of what somebody typed and has not submitted. Never sent anywhere, never read by the server, and it becomes part of the record only by the user pressing the button they would have pressed anyway |

**Nothing in this module submits.** Restoring a draft fills in fields and returns the user to the
step they were on; it does not re-run analysis, create an observation or save a finding.
Auto-submitting unfinished work to make it durable was ruled out by the decision and is not done.

## What is protected

Observation text, work area, work activity, an in-progress observation revision, the clarification
answer history, the reviewer's severity/likelihood cell and confirmed risk, the reviewer's risk
reason, the three corrective-action drafts, a new action's title/detail/kind, the responsible
person, a "hazard HazLenz missed" being typed, and the selected standards and candidate
confirmations. Plus the step, the observation id and the analysis id, so a restore returns the user
to where they were rather than to step 1.

**Not protected, deliberately:** the chosen evidence **file**. A `File` handle cannot be serialised,
and re-encoding a photo into local storage would put a second copy of evidence somewhere the product
does not say evidence lives. A restored draft says the photo must be chosen again rather than
letting someone submit believing it is still attached.

## Scoping — why a draft cannot land in the wrong place

The key is `safety_insite_workspace_draft_v1:<userKey>:<inspectionId>`, where `userKey` is the same
per-account SHA-256 namespace the offline field-capture store derives. §79.4 and V1-OFFLINE-ISO-01
were both real cross-account leaks caused by device-global keys; this must not reintroduce that
shape.

The scope is then checked **twice**: the record repeats its own `userKey` and `inspectionId` in its
body, and a record whose body disagrees with the key it was found under is refused **and deleted**.
That redundancy is the point — the key alone would suffice only if nothing could ever write to the
wrong key, and "nothing can ever" is the assumption that produces this class of bug.

## Staleness — three independent guards

1. **Age.** Older than 14 days: refused and deleted.
2. **Context.** A draft naming an `observationId` the loaded inspection does not contain has its
   observation-scoped half refused — attaching a reviewer's risk judgement to the wrong hazard is
   exactly the failure this feature must not cause. The free-text capture fields survive, because
   they are still the user's own words about this inspection.
3. **Supersession.** Every successful authoritative write (observation created, revision saved,
   review finalized) advances the baseline and drops the record; completing the inspection clears
   it outright. Sign-out sweeps the prefix.

## The defect the gate caught in the first implementation

The first version autosaved whatever was on screen. On reload the server restores the observation,
the autosave sees a non-empty field and writes a "draft", and the **next** load announces *"your
unsaved work was restored"* about text saved days ago. Case E caught it.

The module now keeps a **fingerprint of the fields as the server left them**, captured on the render
after the server load and before a single draft value is applied. A draft identical to committed
state is not written, and one found on disk is deleted rather than announced. A notice that cries
wolf is a notice nobody reads on the day it matters.

# D-035 — browser acceptance result

`npm run validate:280-workspace-draft-persistence` — **11 of 11 passed.** Production build, real
sign-in through the form, no development bypass, registered disposable database, **zero provider
calls**. Evidence: `verification/current/page-review-280/draft-persistence-acceptance.json`.

| | Case | Result |
|---|---|---|
| A | An untouched workspace writes no draft | PASS |
| B | Typed work is persisted as a scoped local draft | PASS |
| B2 | Persisting a draft creates **no** server observation | PASS |
| C | A genuinely new client restores the work after a required refresh | PASS |
| C2 | The restore is disclosed as a device draft, not as saved state | PASS |
| D | The restored work submits once; a replayed submission does not duplicate it | PASS |
| E | A cleared draft is not re-offered, and the page does not rewrite one from committed state | PASS |
| **F** | **CONTROL** — the same sequence with the draft deleted **loses** the work | PASS |
| **G** | **FALSIFICATION** — a well-formed draft filed under the right key but naming another inspection is refused and deleted | PASS |
| H | An expired draft is refused and removed | PASS |
| I | Sign-out removes every workspace draft on the device | PASS |

Case C asserts the field is **empty at first paint** before restoration is expected, so a pass
cannot come from a field that was never cleared. Case G plants its record under the **exact key the
page reads** — an earlier version planted it at a key nothing reads and "passed" without the guard
ever being asked a question; that vacuous pass was corrected, not kept.

# D-036 — shared changes made

| # | Change |
|---|---|
| **1. One page shell** | `.sentinel-app-main` owns the column: content max 1120px, one gutter (1rem / 1.5rem / 2rem). It is the wrapper AppShell puts around every page, so a page cannot drift by forgetting a class — which is exactly how `/reports` and the workspace drifted. The two historical shell classes keep their names (a large body of mobile rhythm rules is keyed to them) and lose only their claim on width and gutter. `.insite-page-wide` is the deliberate opt-in wide variant. **Measured before: 1088/1120/976/864. After: 1120 on all twelve authenticated routes.** |
| **2. One page-title rule** | D-031 |
| **3. One meaning for orange** | ATTENTION / WARNING / PENDING DECISION / UNRESOLVED / OVERDUE. Six ordinary actions moved off it — *View Reports*, *Open Field Capture*, two *Add task*s, *Add Finding*, *Save to Cloud* — leaving five, all of them a capability the account cannot reach. `check:orange-semantics` enumerates every use against a register and **fails on an unregistered one**, verified by deliberately introducing one. The dashboard's *View Reports* had a comment claiming it already used the secondary treatment; the markup still said `variant="accent"`. Both now agree |
| **4. One empty-state pattern** | `EmptyState` extended to the three-part contract — what is empty, what that means, what to do next — with a link action as well as a button. Adopted on the batch-2 surfaces where the empty state was deficient. **Not** adopted on the dashboard: that is a batch-1 page and S-3 was deliberately left alone |
| **5. Version chrome retired** | D-032 |

## Gates added

| Gate | What it holds |
|---|---|
| `frontend-next: npm run check:page-titles` | Every route has a name, from one table, with no hard-coded strings and no duplicates |
| `frontend-next: npm run check:orange-semantics` | Every orange control is a recorded decision |
| `frontend-next: npm run validate:280-workspace-draft-persistence` | D-035, with a control and a falsification |
| `frontend-next: npm run measure:280-offline-inventory` | D-037 readings; refuses to run without a service worker in control |
| `backend: npm run review:stack` | The review stack: registered disposable database, `DEV_AUTH_BYPASS=false`, no provider key in the child environment |
