# Page-by-page product review — §279, §280

Every active customer-facing route in Safety InSite, what it is for, and where its review stands.

**§280** carried out the product-owner decisions D-031 to D-037 and reviewed batch 2, the inspection
spine. Batch 2 evidence: `verification/current/page-review-280/`.

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
| 3 | HazLenz presentation | HazLenz analysis, clarification, unresolved/refusal, human confirmation, finding review, multiple findings — all states within `/inspection-workspace` | The concision question. Needs saved/synthetic analyses; no provider calls |
| 4 | Closing an inspection | `/inspection-review` · `/inspection-complete` · `/reports` | Where an inspection becomes a record |
| 5 | Follow-through | `/safety-calendar` · corrective actions · tasks | The D-007 surfaces |
| 6 | Account and commerce | `/profile` · `/pricing` · `/upgrade` · `/unlock` · plan and entitlement surfaces | Lower risk, and the plan surfaces depend on billing configuration |
| 7 | Public and system | `/` · `/about` · `/hazlenz` · `/legal` · `/register` · `/forgot-password` · `/reset-password` · 404 · error and loading states | Signed-out surfaces plus the system states the product does not yet have |

---

## Active customer-facing pages

| Route | Page | Purpose | User | Access | Desktop | Mobile | Status |
|---|---|---|---|---|---|---|---|
| `/login` | Sign in | Authenticate | any | public | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/command-center` | Dashboard | Home: due work, week at a glance, counts | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| *(shell)* | Navigation / header / tab bar | Primary navigation on every page | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/inspections` | Inspection hub | Choose a workflow, pick site and regulatory context, open saved inspections | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/inspection-cover` | New inspection (cover) | Inspection team and report options before starting | inspector | auth | yes | yes | **BLOCKED** — reviewed in batch 1; §280 measured it UNREACHABLE from the product, see D-038 |
| `/settings` | Settings | Sites, billing, theme, report storage, risk matrix, HazLenz scope, **version** | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/inspection` | Inspection overview | A second, older inspection UI | inspector | auth | yes | yes | **BLOCKED** — see D-038: measured UNREACHABLE from the product |
| `/inspection-workspace` | Observation entry, HazLenz, findings, review, actions | The core workflow, and the largest surface in the product | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/field-capture` | Field capture | Offline-capable observation and photo capture | inspector | auth | yes | **primary** | **PASS_WITH_LIMITATION** — see batch 2 |
| `/inspection-review` | Finding review | Review findings before completion | inspector | auth | yes | yes | **BLOCKED** — see D-038: measured UNREACHABLE from the product |
| `/inspection-complete` | Inspection completion | Close out and generate the report | inspector | auth | yes | yes | NOT_REVIEWED |
| `/reports` | Report history | Generated reports | inspector | auth | yes | yes | NOT_REVIEWED |
| `/safety-calendar` | Safety Calendar | Scheduled corrective actions and follow-up tasks | inspector | auth | yes | yes | NOT_REVIEWED |
| `/profile` | Account | The signed-in user's account | inspector | auth | yes | yes | NOT_REVIEWED |
| `/upgrade` | Upgrade | Plan upgrade entry (5 lines — a redirect shim) | inspector | auth | yes | yes | NOT_REVIEWED |
| `/unlock` | Unlock | PIN / local vault unlock | inspector | auth | yes | yes | NOT_REVIEWED |
| `/register` | Create account | Sign up | prospect | public | yes | yes | NOT_REVIEWED |
| `/forgot-password` | Forgot password | Request a reset | any | public | yes | yes | NOT_REVIEWED |
| `/reset-password` | Reset password | Complete a reset | any | public | yes | yes | NOT_REVIEWED |
| `/` | Home (marketing) | Product landing | prospect | public | yes | yes | NOT_REVIEWED |
| `/about` | About | What the product does | prospect | public | yes | yes | NOT_REVIEWED |
| `/hazlenz` | HazLenz | What the engine does | prospect | public | yes | yes | NOT_REVIEWED |
| `/pricing` | Pricing | Plans (11 lines — delegates to a component) | prospect | public | yes | yes | NOT_REVIEWED |
| `/legal` | Legal | Legal index | any | public | yes | yes | NOT_REVIEWED |

## Routes that are not part of the active product

| Route | Classification | Evidence | Disposition |
|---|---|---|---|
| `/inspection-quick` | **ORPHAN / superseded prototype**, 570 lines | Zero inbound references anywhere in `app/`, `components/`, `lib/` or `hooks/`. Reachable only by typing the URL. Both workflow cards on `/inspections` route to `/inspection-workspace` instead | **REMOVED at §280** under D-033. Proof below |
| `/inspection` (952 lines) | **UNREACHABLE CLUSTER** — a second, older inspection UI | See D-038 | **NOT removed.** No removal is authorised |
| `/inspection-cover` (232) | **UNREACHABLE CLUSTER** | See D-038 | **NOT removed** |
| `/inspection-review` (327) | **UNREACHABLE CLUSTER** | See D-038 | **NOT removed** |

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

### D-038 — three more routes are unreachable, and the review had them listed as active

**This is a correction to this document's own inventory.** `/inspection`, `/inspection-cover` and
`/inspection-review` were listed above as active customer-facing pages, and `/inspection-cover` was
reviewed as one in batch 1. §280 measured them by the same standard D-033 applied to
`/inspection-quick`, and they fail it.

They form a **closed cycle** with no way in:

```
/inspection-cover --"Start Inspection"--> /inspection --> /inspection-review --> /inspection
        ^                                      |
        +-----"goToCoverPage()"----------------+
```

Two independent methods, and they agree:

1. **Source.** The only reference to `/inspection-cover` anywhere in `app/`, `components/`, `lib/`,
   `hooks/` or `types/` is `app/inspection/page.tsx:818` — from inside the cycle. The two hits in
   `AppShell.tsx` are `activeRoots`, a navigation-*highlighting* matcher, not links.
2. **Browser.** A breadth-first crawl of every `<a href>` reachable from the signed-in product
   reaches exactly eight routes: `/command-center`, `/inspections`, `/inspection-workspace`,
   `/field-capture`, `/reports`, `/safety-calendar`, `/settings`, `/profile`. None of the three
   appears. Button-driven navigation adds `/inspection-complete`; nothing pushes into the cycle.

`/inspection` is also a visibly different product: a dark "Upload Evidence" hero with Take Photo /
Upload, a `STEP 1 Hazard Details` bar with Back/Next, and a floating "Finding Builder" panel. None
of that vocabulary appears anywhere else in Safety InSite.

**No removal is authorised and none was made.** The decision is D-038 below.

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
| **O-26** | `/inspection`, `/inspection-cover`, `/inspection-review` | Listed in this document as active customer-facing pages; measured unreachable from the product | **NOT FIXED** — no removal authorised. **D-038** |

## `/inspection` — review

**Not reviewed as a product surface, because the evidence says it is not one.** It is 952 lines of a
second, older inspection UI — a dark "Upload Evidence" hero with Take Photo / Upload, a
`STEP 1 Hazard Details` bar with Back/Next, a floating "Finding Builder" panel — sharing no visual
vocabulary with the rest of Safety InSite, and reachable only by typing the URL. Reviewing its
spacing would be work spent on a page no customer can open. See D-038.

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

### Three contract fields are computed and never displayed

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
it. Nothing here is a proposal to remove safety-critical information to shorten a page. **D-040.**

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
can. A safety product must not show a clean board it has not checked. **D-041.**

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

### Open — §280 raises four, and does not decide any of them

| id | Decision |
|---|---|
| **D-038** | **`/inspection`, `/inspection-cover` and `/inspection-review` are unreachable from the product** — a closed 1,511-line cycle, proved by source and by browser crawl. This document listed all three as active and batch 1 reviewed one of them as active. Remove, reconnect, or record as retained-dead? **No removal is authorised.** Note that `/inspection-cover` carries batch 1's findings O-8 and O-9, which are findings against a page no customer can reach |
| **D-039** | **The unlayered `a { color: inherit }` makes 51 of 54 anchors' text-colour utilities inert.** Contained at the one site where it caused an unreadable control. Layering the rule is the correct fix and would let 51 dormant utilities take effect at once — a product-wide visual change that needs to be looked at, not shipped |
| **D-040** | **The HazLenz step never shows the engine's own statement of what is missing.** `criticalUnknowns` and `multiHazardReview` are declared in the contract and rendered nowhere; `confidenceLimitReason` is computed and dropped. In the unresolved state the screen is nearly indistinguishable from the resolved one. This is an **addition** of safety information the engine already produces, and where it belongs on the page is a product decision |
| **D-041** | **The dashboard renders offline with every count at zero.** `0 OVERDUE` with no connection looks exactly like `0 OVERDUE` with one. Should it refuse, or show its counts as unverified? |

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
