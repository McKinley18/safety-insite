# InSite Whole-Application Visual Acceptance + UX Consistency — Final Report

## Baseline

| Item | Value |
|---|---|
| Starting SHA | `4c7a501d361f4e5f340ae58af6976303452fc2a5` |
| Protected UI checkpoint tag | `insite-inspection-ui-verified-2026-08-19` → `4c7a501d` |
| Protected HazLenz baseline tag | `insite-hazlenz-verified-baseline-2026-08-19` → `e9f968f7` |
| Branch | `release/insite-rc-2026-08-18` |
| Starting worktree | clean (`git status --short` empty) |
| Stashes at start | 4 (2026-07-07 ×2, 2026-06-19 ×2) |

### Environment safety (established before any mutable work)

The repository `.env` resolves `DATABASE_URL` to the **protected `safescope`
development database**, and `frontend-next/.env.local` points the browser at
`http://localhost:4000`, which is the backend bound to that database. Running the
app as configured would therefore have driven verification traffic straight into
the protected DB.

All work was instead pinned to the disposable stack:

| Component | Target |
|---|---|
| Frontend | `http://localhost:3010`, launched with explicit `NEXT_PUBLIC_API_BASE_URL=http://localhost:4010` |
| API | `http://localhost:4010` (PID 2205), `DATABASE_URL=…/insite_full_qa_20260818` |
| Database | `insite_full_qa_20260818` (disposable) — printed and confirmed before every DB-dependent command |

`:4000` (bound to `safescope`) was never used. Every harness additionally
self-guards, refusing to start unless `DATABASE_URL` matches
`test|closure|phase<N>|_qa_`, and `visual-acceptance-lib.mjs` adds an explicit
refusal if the URL ends in `/safescope`.

Two further environment notes, both established by measurement rather than
assumption:

- `NEXT_PUBLIC_DISABLE_AUTH=true` in `.env.local` enables a local auth bypass
  that signs in any email with no password and grants `role: admin, type: pro`.
  It is correctly gated (`&& NODE_ENV !== "production"`), but it makes screenshots
  unrepresentative, so the whole phase ran with the bypass **off** and real
  authentication against the disposable backend.
- The `:4010` backend's CORS allowlist is exactly `http://localhost:3010`. An
  earlier attempt on port 3020 produced a misleading "Server is waking up"
  message on invalid credentials; that was a CORS artifact of the port choice,
  **not** a product defect, and is not recorded as one. On the allowed origin the
  message is correctly "Sign in failed. Check your email and password."

## Route inventory

22 `page.tsx` routes exist. Classification, cross-checked against inbound links
in the shipped navigation:

| Classification | Count | Routes |
|---|---|---|
| PUBLIC | 5 | `/`, `/about`, `/pricing`, `/legal`, `/hazlenz` |
| AUTH | 4 | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| PRIMARY_PRODUCT | 5 | `/command-center`, `/inspections`, `/inspection-workspace`, `/reports`, `/safety-calendar` |
| SETTINGS_ACCOUNT | 2 | `/settings`, `/profile` |
| SECONDARY_PRODUCT | 2 | `/upgrade`, `/unlock` |
| LEGACY | 4 | `/inspection`, `/inspection-quick`, `/inspection-review`, `/inspection-cover` |

**Legacy cluster.** Both launchers on `/inspections` ("Quick Inspection" and
"Full Inspection") now route to `/inspection-workspace`; `/inspection-quick` has
zero inbound references anywhere in `app/`, `components/` or `lib/`. The four
legacy routes still render on direct navigation and do **not** redirect, so there
was no redirect to verify. They were captured for classification and deliberately
not polished. `/inspection-review` renders with no page-level `<h1>`.

## Defects found and fixed

### 1. Competing primary CTAs on the command centre (P1, hierarchy + semantics)

*Symptom.* The dashboard hero paired a blue "Start Inspection" with an orange
"View Reports". The orange out-weighted the intended primary and reused the
app's warning colour for a benign navigation link.

*Root cause.* `variant="accent"` plus hard-coded `!bg-orange-500 !text-white`.

*Fix.* "View Reports" now uses the same secondary treatment the landing hero
already pairs with this exact blue primary, so the hierarchy reads primary →
secondary. No new colour was invented.

*Files.* `app/command-center/page.tsx`.

### 2. White-on-dark secondary button unreadable in dark mode (P1, contrast)

*Symptom.* The landing hero's "Sign in" button measured **1.03:1** in dark mode —
near-black label on a dark surface — on the first screen a prospective customer
sees. The fix for defect 1 initially inherited the same flaw (measured 1.93:1).

*Root cause.* `globals.css` contains `.dark :where(.bg-white) { background-color:
var(--app-surface) !important }`. These buttons sit on a hero gradient that is
dark navy in *both* themes, so the guard flipped their background to dark while
`!text-[#0B1320]` kept the label near-black.

*Fix.* Both buttons use `bg-[#FFFFFF]`, which the `.bg-white` guard does not
match, so the surface stays white in both themes (label back to 12.55:1).

*Files.* `app/page.tsx`, `app/command-center/page.tsx`.

*Note.* This was pre-existing on `/` and was found only because the fix for
defect 1 was re-measured rather than assumed correct.

### 3. Brand-blue text illegible on dark surfaces (P1, contrast) — Phase 5

See the dedicated section below.

### 4. Orange eyebrow failing on light surfaces (P2, contrast)

*Symptom.* `#F97316` measured **2.44:1** on `/reports`; `text-orange-600`
measured 3.58:1 on `/`.

*Root cause.* `components/ui/PageHeader.tsx` — a **shared primitive** (2
consumers: `/reports`, `/unlock`) — used orange-500 for its eyebrow text.

*Fix.* Light mode steps to `#C2410C` (orange-700), dark keeps `#F97316` where it
passes. The 4px accent rule beside it is non-text and keeps the brighter orange.
Same treatment applied to the two standalone instances.

*Files.* `components/ui/PageHeader.tsx`, `app/page.tsx`, `app/unlock/page.tsx`.

### 5. `text-slate-500` muted text below AA (P2, contrast)

*Symptom.* 3.75–4.21:1 in dark and 4.19–4.43:1 on light tinted cards, across
`/about`, `/register`, `/login`, `/pricing`, `/inspections` and the inspection
workspace.

*Root cause.* The dark legibility guard family in `globals.css` remaps
slate-200/300/400/600/700/800/900/950 and `text-gray-500`, but never plain
`.text-slate-500`, which therefore kept `#64748B` on dark surfaces. On light
tinted surfaces the same token sat marginally under 4.5.

*Fix.* One guard added for `.dark :where(.text-slate-500)` → `var(--app-text-soft)`,
consistent with the existing family. The intentionally-light panels
(`.week-glance-light`, `.calendar-priority-light`) declare their own `!important`
slate-500 colour later in the file and continue to win. The four light-mode
instances stepped to slate-600 individually.

*Files.* `app/globals.css`, `app/about/page.tsx`, `app/register/page.tsx`,
`app/inspection-workspace/page.tsx`.

### 6. React hydration mismatch on public routes (P1, production-only)

*Symptom.* **Minified React error #418** thrown in the production build on `/`,
`/about`, `/hazlenz`, `/legal` and `/pricing` — but only for a signed-in visitor.
React discards the server-rendered tree and re-renders it on the client.

*Root cause.* Those pages computed auth state during render —
`useState(() => hasAuthToken())`, and on `/pricing`
`useState(() => hasAuthToken() ? "upgrade" : "public")`. `hasAuthToken()` reads
`localStorage`, so it is always `false` during SSR and `true` on the client for a
signed-in user, producing different CTA text.

*Fix.* Auth state resolves after mount via `useEffect`, so the first client render
matches the server HTML. Verified 3 → 0 page errors in the production build, both
signed-out and with a token present.

*Files.* `app/page.tsx`, `app/about/page.tsx`, `app/hazlenz/page.tsx`,
`app/legal/page.tsx`, `app/pricing/page.tsx`.

*Note.* This defect is invisible in dev (React logs only a "script tag" warning)
and invisible when signed out. It was found by running the audit against the
production build and with a session present.

## Visual acceptance results

Final sweep: **84 captures** (21 routes × light/dark × desktop 1440×1000 /
mobile 390×844) against the production build, plus 4 dedicated inspection-
workspace captures.

| Measure | Result |
|---|---|
| Horizontal overflow | **0** across all 88 captures |
| Uncaught page errors | **0** |
| Console errors | 4, all one disclosed environment artifact (below) |
| Routes at final PASS | 21/21 swept + `/inspection-workspace` |

Per-route verdicts are in `VISUAL_ACCEPTANCE_MATRIX.md`, which also states
precisely what PASS is backed by and which captures were individually eyeballed.

### States exercised

Empty (`/reports`, `/command-center` to-do groups), populated (`/inspections`
counts, calendar tasks, 4-finding workspace), disabled ("Save site", "Current
Plan", "Manage Subscription"), validation error (invalid credentials), selected
(calendar day, finding selection), rest/hover/focus-visible (primary buttons),
in-progress and completed (inspection finalization), signed-out vs signed-in CTA
swap on every public route.

### Disclosed environment artifact

Four console entries remain: `404 GET /offline/safescope-brain-bundle.json`. The
bundle is produced by a separate knowledge-export step and is not generated in
this local disposable environment. `AppShell` requests it once per session and
explicitly swallows the failure ("App startup should never be blocked by brain
bundle refresh"), so there is no customer-visible error state. Environment
artifact, not a product defect.

## Theme

| Check | Result |
|---|---|
| First paint, light | correct — `rgb(241, 245, 249)`, root class `light` |
| First paint, dark | correct — `rgb(7, 17, 31)`, root class `dark` |
| Wrong-theme flash | none — `check-theme-flash.mjs` passed, `routesFlashing: []` |
| `color-scheme` meta | tracks the active theme |
| Internal navigation | theme stable; no route showed a background change after paint |

The Checkpoint 2 render-blocking theme initializer is unchanged and still
correct.

## Colour / contrast

### Brand-blue (`#1D72B8`) inventory — Phase 5

110 occurrences of `text-[#1D72B8]` across 58 files. A static count decides
nothing, so every instance whose *computed* colour is the brand blue was found on
15 routes in both themes and measured from rendered pixels.

**Measured before → after**, taken directly from `manifests/blue-text-before.json`
and `manifests/blue-text-after.json`. The two runs did not reach an identical
sample set — the after run enumerated 67 instances against the before run's 65
(one additional dark eyebrow and one additional light instance) — so the sampled
count is reported per run rather than as a single shared column:

| Theme / role | Sampled before | Failures before | Sampled after | Failures after |
|---|---|---|---|---|
| dark / eyebrow | 16 | 11 | 17 | **0** |
| dark / informational | 5 | 3 | 5 | **0** |
| dark / button | 2 | 2 | 2 | **0** |
| dark / badge | 4 | 0 | 4 | 0 |
| light / all roles | 38 | 0 | 39 | **0** |
| **Total** | **65** | **16** | **67** | **0** |

Failing range before: 2.89–3.92:1 against a 4.5 target.

*Sampling note.* The 2-instance difference between the runs was not attributed to
a cause; it was not re-run, because every instance the after run reached passes
and no instance in either run is left failing. The headline result — **16
pixel-confirmed failures before, 0 after, across 67 instances enumerated in the
after run** — is unaffected.

**Semantic rule established by the measurements** (not by removing a hex value):

- brand blue used as text **on a surface that goes dark in dark mode** must take
  the established dark counterpart `#5DB7FF` — this is exactly what the shared
  `components/ui/SectionHeader.tsx` eyebrow already did, which is why every
  SectionHeader-based eyebrow passed while the ad-hoc copies failed;
- brand blue used as text **on an intentionally light chip** (`bg-[#E8F4FF]`)
  must stay `#1D72B8`, because that surface has no dark override and genuinely
  remains light.

`bg-white` cards are the trap in the middle: they look light in source but
`globals.css` flips them to the dark app surface in dark mode.

**Remaining intentional occurrences.** The two `bg-[#E8F4FF]` chips in
`PricingContent.tsx`, the "Pro tier" card eyebrow on `/`, and every instance
inside `.inspection-panel-light` / `.week-glance-light`, which force `#1D72B8`
with `!important` because those panels stay light in both themes. All measured
and passing. No blind search-and-replace was performed; 13 source sites were
changed.

### Application-wide text contrast

Two-stage audit (fast computed scan → pixel re-measurement of every candidate) on
14 routes in both themes:

| | Before | After |
|---|---|---|
| Computed-stage candidates | 89 | 74 |
| Pixel-confirmed failures | **20** | **4** |

The 4 remaining are all `disabled` controls ("Current Plan", "Save site",
"Manage Subscription" ×2) at 3.86:1. Each was confirmed to carry a real
`disabled` property, and WCAG 1.4.3 exempts inactive user-interface components.
No non-exempt text contrast failure remains.

### Primary-button context coverage — Phase 9

There are **91** `AppButton`/`AppLinkButton` call sites (`variant` defaults to
`primary`). Rather than screenshot every one, the audit enumerated every
*rendered* primary button across 16 routes × 2 themes × 2 viewports and grouped
them by the properties that actually determine legibility.

**20 distinct rendered contexts observed, 0 failures.** Contexts covered:
light-surface and dark-surface; page / card / form containers; rest and disabled
states; desktop and mobile. Best and worst measured: 9.41:1 (dark form primary —
confirming the Checkpoint 2 `AppButton` dark-label fix still holds) and 5.06:1
(light form primary). The 2 dark disabled instances were not independently
measurable and are exempt regardless.

**Honest limit.** This is coverage of every *materially distinct rendered
context* reached by this sweep — not an exhaustive audit of all 91 call sites.
Many only mount behind data or interaction this sweep does not reach. Contexts
not enumerated here include modal and sticky-action-bar placements, which did not
render on the swept routes.

## Inspection UX

Verified through the real workflow, not source inspection:

- **Add Finding** — discoverable during an active inspection; observation-scoped
  finding ownership preserved (4 active findings, 0 superseded).
- **Finding navigation** — selection, per-finding review, and reload restoration
  all stable; finding order identical across reload.
- **HazLenz hierarchy** — the Checkpoint 2 order is intact and was visually
  confirmed in dark mode: Assessment → Why HazLenz flagged this → Risk →
  Applicable Standard → Why HazLenz selected this → Standard Detail →
  Clarification.
- **Standards presentation** — the candidate standard is labelled
  "CANDIDATE STANDARD — MORE EVIDENCE REQUIRED" with "Confidence: Low" and
  "Details that would increase confidence", so a candidate is never presented as
  definite. Jurisdiction displays "Source: inspection context · confirmed",
  so an inferred jurisdiction is never shown as user-confirmed.
- **Finalization** — 4/4 findings finalized, auto-advance correct, report
  generated.
- **Workspace visual audit** — light/dark × desktop/mobile: 0 horizontal
  overflow, 0 contrast failures.

## USER_CONFIRMED multi-observation E2E — closes the Checkpoint 2 limitation

Checkpoint 2 disclosed that the multi-observation report had only been verified
with an **UNKNOWN** regulatory context. The root cause was in the harness, not the
product: the prior script called
`selectOption({ label: /General Industry/i })` — Playwright's `label` option takes
a string, not a RegExp — and a trailing `.catch(() => {})` swallowed the throw, so
the inspection was created with the default "unknown".

The new harness selects by option **value** and hard-asserts persistence before
any observation is entered.

| Item | Result |
|---|---|
| Regime selected | `osha-general-industry` (OSHA — General Industry) |
| Select value after selection | `osha-general-industry` (asserted) |
| Persisted on inspection row before observing | `osha-general-industry` (asserted; run aborts otherwise) |
| Provenance observed on the wire | `USER_CONFIRMED` — 3 samples, no other value |
| Context values observed on the wire | `osha-general-industry` only |
| Repeated jurisdiction question | none |
| Observations | 3 |
| Findings | 4 active, 0 superseded |
| Finalized | 4 / 4 |
| Order across reload | identical (`Egress, Machine guarding, Electrical, Hot work`) |
| Reports generated | 1 |
| MSHA (30 CFR) citations | **0** |
| OSHA Construction (1926.x) citations | **0** |
| Final context after report | `osha-general-industry` (no drift) |
| Result | **PASS** |

Evidence: `manifests/user-confirmed-e2e.json`,
`screenshots/uc-01-context-selected.png`, `uc-02-all-findings.png`,
`uc-03-complete.png`.

**This closes the Checkpoint 2 disclosed limitation.**

## Calendar

`check-calendar-day-task.mjs` re-run against the production build: selected day →
Add/Schedule Task → date pre-populated from the selected day
(`datePrefilledFromSelectedDay: true`), focus moved to the title field, 2 tasks
stored on the target date `2026-08-28`, both surviving reload, mobile control
visible, no horizontal overflow at 390px. **PASS.**

## Accessibility / interaction

Fixed in this phase: the contrast defects above (all non-exempt text now meets
AA), and the hydration mismatch that caused React to discard and re-render whole
subtrees on public routes.

Verified sound: every route has exactly one page-level `<h1>` (except legacy
`/inspection-review`); no horizontal overflow at 390px on any route; focus-visible
states measured on primary buttons; disabled controls carry real `disabled`
properties rather than being styled-only, so assistive technology sees them.

Remaining non-blocking observations (not fixed — outside the narrow remit of this
phase, and none is a contrast or overflow defect):

1. The login/register email field is `type="text"` with no `name` or `id`, so it
   loses mobile keyboard hints and browser autofill affordances.
2. `app/profile/page.tsx:41` declares `isAuthorized` from `hasAuthToken()` and
   never uses it — dead code. It renders nothing, so it cannot produce a
   hydration mismatch, but it is the same SSR-unsafe pattern.
3. `/inspection-review` (legacy) has no page-level `<h1>`.
4. The regulatory-context `<select>` renders label + description concatenated
   into one long option string.

## HazLenz regression

Backend is **byte-identical** to both protected checkpoints
(`git diff --name-only 4c7a501d -- backend/` is empty), so no HazLenz behaviour
could change; the gate was run to prove integration remains intact.

All commands ran against `insite_full_qa_20260818`, printed and confirmed before
execution.

| Gate | Result |
|---|---|
| Gold set (`tmp/gold-set-v3.ts`, sha256 `93184abc…`, identical to the frozen copy) | 31 cases / 24 applicable / 7 negative controls |
| Precision | **1.00 (24/24)** |
| Recall | **1.00 (24/24)** |
| Wrong-regime / wrong-family | **0** |
| False positives / false negatives | 0 / 0 |
| `test:safescope-standards` | **15 passed, 0 failed** |
| `test:hazlenz-core` | **28 pass / 2 fail** |
| Jurisdiction matrix | Jurisdiction-Unknown Standards suite PASS |
| Clarification suite | Defeated-Control / Contradiction, Condition-State Invariants PASS |
| Multi-hazard | exercised live — 3 observations decomposed into 4 findings, 0 superseded |

The 2 failures are **exactly** the two suites already failing at Checkpoint 2 —
"Golden Hardening Scenarios Test" and "HazLenz Production Path Regression" —
verified by diffing the failing-suite list against the checkpoint's own
`reg-core-qa.log`. No new failures. No expectation, scorer, threshold or
adjudication was modified.

## Builds

| Check | Result |
|---|---|
| Frontend `tsc --noEmit` | **exit 0** |
| Frontend `next build` | **exit 0** — ✓ compiled, 26/26 static pages |
| Backend `tsc --noEmit` | **exit 0** |
| Backend `npm run build` | **exit 0** |
| `git diff --check` | **PASS (clean)** |

*Caveat.* The frontend typecheck requires first deleting stale
`.next/types/* 2.ts` duplicates, which `next build` regenerates. These are
generated files inside gitignored `.next/`, the same artifact noted at
Checkpoint 2 — not a source defect. With them present `tsc` reports two duplicate
identifier errors; with them cleared it is clean.

## Repository state

**Changed files (16 modified, all frontend):**

`app/about/page.tsx`, `app/command-center/page.tsx`, `app/globals.css`,
`app/hazlenz/page.tsx`, `app/inspection-workspace/page.tsx`,
`app/inspections/page.tsx`, `app/legal/page.tsx`, `app/login/page.tsx`,
`app/page.tsx`, `app/pricing/page.tsx`, `app/register/page.tsx`,
`app/safety-calendar/page.tsx`, `app/unlock/page.tsx`,
`components/calendar/PriorityTodoPanel.tsx`,
`components/pricing/PricingContent.tsx`, `components/ui/PageHeader.tsx`

**New files:** 7 reproducible harnesses under `frontend-next/scripts/`
(`visual-acceptance-lib.mjs`, `check-visual-acceptance.mjs`,
`check-workspace-visual.mjs`, `check-user-confirmed-multiobservation.mjs`,
`audit-blue-text.mjs`, `audit-text-contrast.mjs`,
`audit-primary-button-contexts.mjs`) and this verification directory.

| Protection | State |
|---|---|
| `insite-inspection-ui-verified-2026-08-19` | → `4c7a501d` **unchanged** |
| `insite-hazlenz-verified-baseline-2026-08-19` | → `e9f968f7` **unchanged** |
| Backend vs `4c7a501d` | **byte-identical** (0 files) |
| Four pre-existing stashes | **untouched** (no stash/apply/drop/pop run) |
| Original `safescope` database | **untouched** — never targeted by any command |
| Committed | **nothing** — worktree changes only, as instructed |
| Pushed | **nothing** |
| Deployed | **nothing** |

*Local service note.* Two pre-existing Next dev servers (ports 3001, 3010) were
running at session start with no explicit API override, meaning their browsers
would have talked to `:4000`/`safescope`. The one on 3010 was stopped and
replaced with an explicitly pinned instance; the process on 3001 was left
running. A production server is currently serving the built app on port 3010.
No repository state depends on these.

---

# VISUAL_ACCEPTANCE_READY
