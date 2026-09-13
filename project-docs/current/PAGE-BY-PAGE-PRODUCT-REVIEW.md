# Page-by-page product review — §279

Every active customer-facing route in Safety InSite, what it is for, and where its review stands.

**No page is marked PASS on automated route tests.** A page reaches PASS only after it has been
opened in a real browser, at the four required widths, with populated, empty and error states
looked at. The measurement scripts produce evidence; a person produces the verdict.

Status values: `NOT_REVIEWED` · `REVIEW_IN_PROGRESS` · `ADJUSTMENTS_REQUIRED` · `PASS` ·
`PASS_WITH_LIMITATION` · `BLOCKED`

Machine-readable companion: `verification/current/page-review-279/PAGE-INVENTORY.json`.
Batch 1 evidence: `verification/current/page-review-279/`.

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
| 2 | The inspection spine | `/inspection` · `/inspection-workspace` · `/field-capture` | The core workflow, and the largest single surface in the product (3,411 lines). Review it once the visual language is settled |
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
| `/inspection-cover` | New inspection (cover) | Inspection team and report options before starting | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/settings` | Settings | Sites, billing, theme, report storage, risk matrix, HazLenz scope, **version** | inspector | auth | yes | yes | **ADJUSTMENTS_REQUIRED** |
| `/inspection` | Inspection overview | The inspection record being worked | inspector | auth | yes | yes | NOT_REVIEWED |
| `/inspection-workspace` | Observation entry, HazLenz, findings, review, actions | The core workflow. 3,411 lines — the largest surface in the product | inspector | auth | yes | yes | NOT_REVIEWED |
| `/field-capture` | Field capture | Offline-capable observation and photo capture | inspector | auth | yes | **primary** | NOT_REVIEWED |
| `/inspection-review` | Finding review | Review findings before completion | inspector | auth | yes | yes | NOT_REVIEWED |
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

Recorded, **not deleted**. §279 authorises no removal.

| Route | Classification | Evidence |
|---|---|---|
| `/inspection-quick` | **ORPHAN / superseded prototype**, 570 lines | Zero inbound references anywhere in `app/`, `components/`, `lib/` or `hooks/`. Reachable only by typing the URL. Both workflow cards on `/inspections` — "Quick Capture" and "Full Inspection" — route to `/inspection-workspace` instead |

## States the product does not have

| Surface | Present? |
|---|---|
| `not-found.tsx` (404) | **No.** Next.js' unbranded default is what a customer sees |
| `error.tsx` (error boundary) | **No** at any level. An uncaught render error has no product-owned surface |
| `loading.tsx` | **No.** Pages manage their own loading text |
| About / version surface | **Yes — added in §279**, at Settings → Version |
| Update-available UI | **Yes — added in §279** |
| Update-required UI | **Yes — added in §279** |

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

## Decisions requiring product-owner direction

| id | Decision |
|---|---|
| **D-031** | Page titles. Should each page carry its own `<title>`, and in what form — `"Dashboard · Safety InSite"`? The fix is one small route-to-title map; the *wording* is a product choice |
| **D-032** | The `v1.0` chrome marker. Retire it, or point it at the real build identity? It is currently a hand-maintained string sitting a few pixels from a generated one |
| **D-033** | `/inspection-quick`. An orphan 570-line prototype with no inbound links. Leave, remove, or finish? **No removal is authorised** without this decision |
| **D-034** | 404 and error surfaces. The product has neither. A customer meeting Next.js' default 404 sees an unbranded page — should §280 add them? |
| **D-035** | Inspection-workspace draft persistence. In-progress observation text, clarification answers and reviewer risk selections live only in component state. This is why the update-required state never reloads by itself. Closing it is a product decision, not a bounded repair |
| **D-036** | The visual direction behind S-1…S-12. These are deliberately not changed |
