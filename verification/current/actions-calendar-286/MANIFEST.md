# §286 — Report revision presentation, zero-finding completion, severity parity, and Batch 5

**Zero provider calls** — `EXPERT_EXECUTION_ENABLED=false`, `ANTHROPIC_API_KEY` deleted from the
child environment, synthetic HazLenz states only.
**Zero production contact of any kind.** No deployment, migration, write, configuration change or
read against any live system.

| | |
|---|---|
| HEAD reviewed | `0f36d49729c914c0c50a7e9118f3663877d057ef` |
| frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` — unchanged, not promoted |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — re-verified, 22 elements, 0 failures |
| protected modules | 29/29 present, 0 accepted-evidence drift |
| disposable database | `test_insite_review_1789392629689_9311`, run `1b999c04-…` |
| disposable object storage | `…/T/insite-review-storage-1b999c04-…` |
| Free account | `review-286-free@example.test` |
| **entitled** accounts | `review-286-pro@example.test`, `review-286-other@example.test` — billing tier `free`, active Pro grant |
| frontend | production `next build` + `next start`, `NEXT_PUBLIC_FRONTEND_VERSION=1.0.0`, `DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |

---

## A. Active route inventory

`measure:281-route-reachability`, re-run before any route was treated as active.

**20 routes on disk · 20 source-reachable · 15 `ACTIVE_REACHABLE` · 5 `ACTIVE_DEEP_LINK` · ZERO
orphans.** Batch 5's customer-reachable surfaces are `/safety-calendar`, `/command-center` (due
work) and `/inspection-workspace` (where an action is created during review).

**There is no corrective-actions route.** That is the section's principal finding — see D-050.

---

## B. D-046 — report revision presentation *(implemented)*

The server's revision model is not redesigned. §277 / D-028 already retains every issued revision,
marks the predecessor superseded, links it to its successor and keeps it downloadable and
byte-identical. §285 verified all five on the server and measured that the client called neither
`GET /inspection-reports/:id/revisions` nor the per-revision download, so four of the five were
unobservable to the customer. §286 exposes what was already true.

| the customer can now determine | how |
|---|---|
| the current revision | stated on the report card — "Revision 2 · Current" |
| superseded revisions | listed in the revision history, labelled by word, not by colour |
| revision number | the customer identity throughout; no uuid is rendered |
| issue timestamp | per revision, in the history and on the card |
| which revision replaced which | `supersededByRevision` — a NUMBER, so no surface prints a uuid |
| which revision is current | `isCurrent`, exactly one |
| download of the current revision | unchanged |
| download of retained superseded revisions | new; the route existed and nothing called it |

The `/reports` copy that stated *"Finishing an inspection again replaces its report"* is corrected
on `/reports`, `/inspection-complete` and the workspace's finish panel. Every control on `/reports`
is at least 44×44.

---

## C. Issued PDF identity *(implemented)*

Newly generated PDFs carry a durable human-readable identity on the cover and on every running
footer:

```
Inspection #7
Report Revision 2
Issued 09/14/2026 09:45 AM
```

All three values are existing authoritative ones — `inspections.displayNumber`,
`inspection_report_versions.version`, and that revision's `generatedAt`. **No parallel counter is
maintained.**

**The identity is NOT in the report snapshot**, and that is the load-bearing decision: the snapshot
is what `sourceFingerprint` digests, so putting a per-revision value in it would make every
fingerprint unique and every press of Generate would manufacture a revision. It travels as a
separate renderer argument. Asserted: regenerating an unchanged inspection still replays to the
existing revision (P6).

`issuedAt` is computed **once** and used for both the printed line and the persisted `generatedAt`,
so the document and the record cannot be stamped from two clock reads.

**No already-issued PDF is re-rendered.** Nothing prints `SUPERSEDED`; that is later state, and an
immutable artifact cannot carry it without being rewritten. Supersession is identified outside the
document, in the revision history, where the checksum lets a customer match a filed copy to a row.

---

## D. Report revision identity — the four values cannot disagree

| assertion | result |
|---|---|
| revision number: library = history = artifact | **PASS** |
| checksum: library = history = actual bytes | **PASS** |
| superseded revision's recorded checksum = its retained bytes | **PASS** |
| issue time: library = history | **PASS** |
| issue time: artifact's printed stamp = server's record | **PASS** |
| the superseded artifact carries ITS OWN issue time, not the successor's | **PASS** |
| exactly one revision is `isCurrent` | **PASS** |
| revision 1 still byte-identical after revision 2 exists | **PASS** (same sha256, same length) |
| revision 1 was not rewritten to say it is superseded | **PASS** |

---

## E. Zero-finding completion *(implemented)*

The `NO_CURRENT_FINDING` requirement is **removed**. Nothing else about the gate is weakened:
`in_review → completed` is still the only edge, at least one observation is still required, every
ACTIVE finding still needs a completed and still-current human review, and the optimistic version
still has to match.

The four states the direction requires to stay apart were each produced from the product's own
routes and asserted:

| state | measured |
|---|---|
| no observations | NOT ready · `NO_OBSERVATION` · `zeroReportableFindings: false` |
| unresolved active finding | NOT ready · `FINDING_NEEDS_REVIEW` · 1 blocking id |
| zero reportable findings | **ready** · `observationCount: 2` · `reportableCount: 0` · `zeroReportableFindings: true` |
| completed | `status: completed`, `completedAt` stamped |

A fifth shape is also covered: an inspection whose only candidate a qualified person **dismissed**
completes and reports zero, while keeping `findingCount: 1` — so "the engine proposed nothing" and
"a person declined to confirm the proposal" stay separate facts.

**The workspace's finish handler carried a second copy of the removed requirement** (*"Save at
least one finding before generating the report."*). It was removed too — without it the repair was
unreachable: the banner would say Ready, the server would accept, and the one control that performs
it would still refuse.

---

## F. Zero-finding report language

The generated report states:

> **No reportable findings were recorded during this inspection.**

and adds a scope sentence, not a disclaimer. The existing "Basis and Limitations" note is unchanged.

**Falsified, not assumed.** Five forbidden claims are asserted ABSENT against the extracted text of
a real generated PDF, with a non-vacuity guard proving the extraction produced 3,700 characters of
real report:

| the report never | result |
|---|---|
| claims the workplace is safe | **absent** |
| claims no hazards exist | **absent** |
| claims the employer is compliant | **absent** |
| claims OSHA/MSHA compliance is established | **absent** |
| guarantees absence of unsafe conditions | **absent** |

A zero-finding report also gained an **Observations Recorded** section: without it the artifact drew
a heading over a blank page, with no record of the walk that produced no findings.

---

## G. Severity parity — the dimension §285 recorded NOT_EXERCISED

### The fixture

§285's hole was in the fixture, not the product: its findings were persisted straight through
`finalizeFinding`, which does not compute risk. Risk is computed in
`reconcileDecompositionFindings` → `computeFindingRisk` → the real `evaluateRisk`, reached only when
an analysis snapshot carries `multiHazardDecomposition.hazards[]` with usable evidence text.

The §286 fixture posts such a snapshot through the ordinary authenticated `POST .../analyses` route,
so **`riskSnapshot` is produced by the same materialization semantics the product uses**. Nothing is
hand-populated. The reviewer's band is applied through the ordinary review + finalize pair carrying
`riskAssessment`, which is what the workspace sends.

The instrument does not assert what the engine *should* compute — it **measures** the materialized
band and then chooses the reviewer's cell relative to it, so "agrees" and "differs" are real
conditions. Severity is resolved with the product's own rule (`lib/risk/effectiveSeverity.ts`, held
byte-identical to the backend by `check:effective-severity-parity`), never a re-implementation.

### The results — 9 findings across 7 scenarios

| scenario | effective | snapshot | PDF detail | PDF summary | basis |
|---|---|---|---|---|---|
| S1 HazLenz == reviewer | Critical | Critical | Critical | Critical | reviewer_confirmed |
| S2 HazLenz != reviewer | High | High | High | High | reviewer_confirmed |
| S3 reviewer changes severity | Critical | Critical | Critical | Critical | reviewer_confirmed |
| S4 reviewer leaves unchanged | High | High | High | High | reviewer_confirmed |
| S5 multi-finding · machine-guarding | Critical | Critical | Critical | Critical | reviewer_confirmed |
| S5 multi-finding · electrical | High | High | High | High | reviewer_confirmed |
| S5 multi-finding · energy-control | Moderate | Moderate | Moderate | Moderate | reviewer_confirmed |
| S6 unresolved / not rated | Not rated | Not rated | Not rated | Not rated | not_rated |
| S7 revision after severity change | High | High | High | High | reviewer_confirmed |

Surfaces measured: the effective finding record, the frozen report snapshot, and **both** places the
PDF prints a severity (the Findings Summary table and the Detailed Findings block) — reading only
one would leave the other free to disagree, which is the shape of D-008.

- **The reviewer's band is what the compliance artifact states.** 8 reviewer-confirmed findings,
  all `reviewer_confirmed`.
- **Where HazLenz differs from the reviewer, the artifact states the reviewer's band.** 4 findings
  where the analysis band differs; HazLenz's band is retained as labelled provenance and is never
  presented as reviewer-confirmed.
- **An unrated finding says "Not rated"** and is never filled in from a lesser source.
- **S7**: a severity-affecting authoritative change produced revision 2; revision 1 still states the
  severity it was issued with (High) and revision 2 states the reviewer's new one (Critical). The
  two genuinely differ, so the assertion is not vacuous.

Non-vacuity is guarded: every surface must produce an actual reading for every measured finding.

**NOT APPLICABLE, recorded rather than passed:** the report library card and the revision history
carry no severity — they identify the report, not its contents.

**Carried forward unchanged from §285:** the frozen report snapshot is reachable through no
customer API. This instrument read it directly from the disposable database.

---

## H. Batch 5 — corrective actions and the Safety Calendar

`validate:286-actions-calendar` — **79 checks, 0 failures, 12 observations.**

### Authority

**SERVER AUTHORITATIVE** — an action's and a task's existence, title, description, due date,
priority, status, assignee, closure notes, verification stamp, and a task's optimistic `version`.
Also `editable`, which the server sends and the client copies rather than deriving.

**RECOVERABLE LOCAL PENDING STATE** — the calendar's outbox, which holds a task created while
offline under a client ref. A queue, never a second record.

**DISPLAY-ONLY DERIVED** — `Overdue`, computed in the browser against the local day and never
persisted, which is correct: whether an open item is late depends on the day it is read on.
Priority and status re-labelling for display is likewise derived.

### Exercised and passing

create · assign · due date · priority · close · closure evidence · reopen · duplicate submission ·
finding-scoped de-duplication · unauthorized access · cross-account isolation · unauthenticated
refusal (401, recorded as an HTTP status and never as a transport failure) · entitlement boundary ·
calendar placement · due-date move · overdue · future · completed · cancelled-leaves-calendar ·
multiple actions · ordering · duplicate prevention · two-read agreement · inspection work not
deletable · standalone task deletable.

### Date/time correctness

Eight boundary dates round-tripped end to end through the real API, for **both** a corrective
action and a task, with the two kinds asserted to agree: ordinary, month-end, month-start,
year-end, year-start, DST spring-forward, DST fall-back, leap day. **All held.**

The pure conversions were additionally re-run under **UTC, America/New_York, Australia/Sydney,
Pacific/Kiritimati (UTC+14) and Pacific/Midway (UTC-11)** — 25 checks each, 0 failures — so the
day-preserving behaviour is not a property of this machine's offset. The end-to-end round trips ran
only in the stack's own zone; a cross-zone end-to-end run is recorded as **not performed** rather
than implied.

### Browser review — 24 visits, 3 surfaces × 2 themes × 4 widths

**ZERO objective defects** after the repairs below. Sixteen `BELOW_NATIVE_TOUCH_GUIDELINE_44`
observations remain and are registered for the Pre-Production App-Format gate — controls between
the product's own 36px floor (§73.3) and the 44px iOS HIG / WCAG 2.5.5 (AAA) minimum.

Accessibility passes with full coverage: keyboard traversal reached **50/50, 28/28 and 69/69**
focusable controls with a visible focus change on every one; contrast measured 40–358 elements per
surface.

### Offline / intermittent connectivity (D-037 / D-042 continued)

Sequence exercised with interception counts proving each phase ran:
**ONLINE → DEGRADED (6s stall) → TIMEOUT (never answered) → OFFLINE → RECONNECT.**

| operation | OFFLINE | DATA_LOSS_RISK |
|---|---|---|
| read the calendar (already open) | PARTIAL | NONE_KNOWN |
| read the calendar (cold navigation) | REQUIRES_NETWORK | NONE_KNOWN |
| create a calendar task | PARTIAL | RECOVERABLE |
| create a corrective action | REQUIRES_NETWORK | **VULNERABLE** |
| close a corrective action | REQUIRES_NETWORK | NONE_KNOWN *(the capability is absent, not safe)* |
| change a due date | REQUIRES_NETWORK | NONE_KNOWN |
| calendar reconciliation after reconnect | PARTIAL | RECOVERABLE |

**Reconciliation holds**: the queued task was written on reconnect **exactly once** (server row
count 1, not 2), the browser's event total moved 56 → 57, and the stale and pending notices cleared.

---

## I. Objective defects found and repaired

### D-049 — the report's two severity presentations disagreed on an unrated finding *(repaired)*

The Findings Summary table printed **"Not rated"**; the Detailed Findings block printed **nothing**,
because the risk block sat behind `if (risk)`. A reader of the detail could not distinguish "no
rating" from "not printed". `resolveEffectiveSeverity(null)` already answers correctly, so removing
the guard prints the honest gap and invents nothing.

### D-054 — closing a corrective action answered HTTP 500 *(repaired)*

`PATCH /actions/:id/status` with `statusCode: 'closed'` threw
`QueryFailedError: relation "outcomes" does not exist` on **any database built from the migration
set**. The `Outcome` entity is declared and its module wired; **no migration creates the table**,
and `synchronize` is false in production (the application refuses to start with it enabled there).

**It failed in the worst available order.** The status write had already committed:

- the action was CLOSED in the database
- the customer was told the request FAILED
- the audit event `ACTION_STATUS_UPDATED` was never written
- the assignee was never notified

Repaired by moving the outcome-intelligence loop behind `recordClosureIntelligence`, which cannot
throw, so the closure, its audit record and its notification are always reached. A failure is
emitted as `action.closure_intelligence_failed` (severity `warning`) so the degradation is visible
to an operator instead of silent. **Verified**: closure now 200 with evidence retained, and the
operational event fires with `closureRecorded: true`.

**The missing table was deliberately NOT created** — see D-055.

### D-057 — the calendar's task forms had no programmatic labels *(repaired)*

Eight fields across two forms. Two were identified by a placeholder, which is not a label; the date
input and the priority select had neither a label nor a placeholder, so a screen reader announced
them as bare "date" and "combo box" on the form that schedules safety work.

### D-058 — the month navigation controls had no accessible name *(repaired)*

Both icon-only, announced as "button" and "button". Now `aria-label="Previous month"` /
`"Next month"`, with the decorative SVGs `aria-hidden`.

### D-059 — the calendar day badge failed WCAG AA *(repaired)*

`bg-amber-500 text-white` measured **2.13:1** (light) and **2.04:1** (dark) against the 4.5:1
minimum, on 10px bold text — one of the three states the calendar uses to tell a field user what a
day holds. Its siblings pass (red-600 4.83:1, #1D72B8 4.60:1). Repaired with the product's own
`--app-accent-strong` (#BB5609, 4.72:1 against white), introduced for exactly this failure
elsewhere. The amber stays semantic; the number becomes legible.

### D-060 — the badge carried its meaning only in colour *(repaired)*

`title` alone is a hover affordance that does not exist on touch. An `aria-label` now states the
count **and** the state.

### D-061 — the Calendar Controls disclosure was 20px high *(repaired)*

Below the product's **own** 36px floor, not merely below the 44px guideline — and it is the control
that opens every filter and the task form. Now 44px; the full-width hit area it already had means
nothing else moved.

### D-062 — three Command Center controls were below the product's own floor *(repaired)*

31px, 34px and 34px: the Home screen's route into the calendar and its quick way to put work on it.
All three now 44px. Three utility classes in one panel; nothing shared was touched.

### D-063 — due work stated its status only by tint *(repaired)*

The Priority To Do rows named type, owner, date, location and source, and never said whether the
work was late. A reader who cannot distinguish the red, amber and emerald tints read an overdue
corrective action and a scheduled one as the same row. `event.status` is now stated in text; the
tint stays, because colour is a good first signal and a bad only one.

### D-064 — a slow or hung calendar read presented "0 EVENTS" as the server's answer *(repaired)*

Measured under DEGRADED and TIMEOUT: `syncState` initialised to `serverReachable: true` with
`events: []`, so until the first snapshot resolved the page told the user, in the server's own
voice, that they had nothing due — **§275's presentation, reached through the loading path**. On an
intermittent field connection a device can sit in that state for a long time. A fourth state,
`loading`, now says nothing has been established yet. Presentation only; no sync behaviour changed
and the D-042 architecture was not built. **Verified**: `showsProgress` false → true under DEGRADED,
`stillLoading` false → true under TIMEOUT.

---

## J. Objective defects found and NOT repaired — product-owner decisions

### D-050 — THE CORRECTIVE-ACTION LIFECYCLE HAS NO CUSTOMER SURFACE *(the principal finding)*

`GET /actions`, `PATCH /actions/:id/status` and `GET /actions/export` are implemented, authorized
and working — every assertion against them in section H passes. `lib/cloudActions.ts` implements the
client for the first two. **No route imports it**, and the 20-route inventory contains no actions
surface.

A corrective action can be **raised** and can never be **closed** from the product. The customer's
only view of one after creation is the Safety Calendar (read-only; the server sends
`editable: false`) and the report PDF.

This is the §285 D-046 shape repeating on a different capability: a correct server half with no
client half. Unlike D-046, closing the gap is not a presentation decision — it is a surface that
does not exist.

### D-051 — a corrective action's due date cannot be changed once set

The only mutation the server exposes is `PATCH /actions/:id/status`. There is no route that edits
title, description, priority, assignee or **due date**. The direction's calendar scenario "changed
due date moves the event" is therefore not representable for a corrective action at all — only for
a standalone task. A due date is the most-revised field on a corrective action in practice.

### D-052 — closure evidence is optional and unverified

`statusCode: 'closed'` is accepted with no `closureNotes`, and when notes are absent the previous
value is preserved rather than recording that this closure had none. Every close stamps
`verifiedByUserId` / `verifiedAt` and records `VERIFIED_STRONG` / `SUPERVISOR_SIGNOFF` —
unconditionally, for any caller who can reach the route, including the person who raised the action.
Nothing was verified and nobody signed off. Whether closure requires evidence, and whether the
raiser may verify their own closure, is a product policy decision.

### D-053 — corrective-action creation is not idempotent

`POST /actions` carries no `clientRequestId` and no uniqueness constraint, unlike `POST /inspections`
and `POST .../observations`. A double-tap, a retry after a timeout, or an offline queue replaying
produces two identical open actions. **This is the precondition for any offline outbox for actions.**

### D-055 — the outcome loop's recurrence check is unscoped across tenants

`OutcomeService.checkRecurrence` counts outcomes **by category across every tenant** and
auto-escalates a customer's action to `urgent` on the strength of it. Creating the missing
`outcomes` table would not merely restore a dormant capability — it would activate that, in
production, for the first time. **That is why D-054 was repaired by making the loop non-fatal rather
than by adding the migration.** Whether the outcome loop is per-tenant or global is a product
decision.

### D-056 — the finalize-time corrective action is written unowned and undated

`upsertCorrectiveActionForFinding` runs inside the inspection transaction with no authenticated user
context, so the row carries no `ownerUserId`, `organizationId`, `displayId` or `dueDate`. Both
customer reads exclude it. Measured on the review database: **27 rows, every one with `ownerUserId`
NULL**. In the normal flow this is transient — finishing the inspection creates the reviewer's
confirmed action, which upserts onto the row and adopts its scope and date. It becomes permanent for
a finding finalized on an inspection the customer never finishes.

---

## K. Instrument defects found and repaired

Five, all caught **before** anything they produced was reported as a product finding.

- **I-17. Horizontal overflow was measured on bounding boxes, not on scroll.** Flagged a decorative
  blur positioned off-canvas inside a clipping ancestor while `scrollWidth === clientWidth === 390`.
  Now asks the page's own scroll width first and excludes clipped elements.
- **I-18. The contrast check ignored `background-image`.** It walked past gradient panels to the
  body colour and reported every `HeroPanel` heading at 1.10:1 white-on-white — text that is white
  on a dark gradient and among the highest-contrast in the product. A gradient's contrast cannot be
  computed from one colour, so it is now recorded as **unmeasurable**, never as a failure.
- **I-19. Focus visibility was measured with programmatic `.focus()`.** `:focus-visible` is a
  heuristic on how focus arrived; programmatic focus after a click does not satisfy it, so the check
  reported "no visible focus" for all of `/reports` including its navigation, while a direct Tab
  probe showed a real `outline: auto 1px` ring. Replaced with genuine keyboard traversal.
- **I-20. The colour parser was a regex for `rgb()` / `rgba()`.** Tailwind v4 emits modern colour
  spaces — the calendar badge resolves to `lab(72.7183 31.8672 97.9407)` — so the parser returned
  null and the badge was reported at exactly **1.00:1**, the signature of a colour compared against
  itself. The browser now does the conversion through a canvas context. **The badge's real failure
  (2.13:1) was only visible once the parser was fixed.**
- **I-21. The keyboard walk blurred each stop to read its baseline**, which clears the sequential
  focus navigation starting point, so every Tab restarted from the top: 5 unique stops on a page
  with 69 controls. Baselines are now captured before the walk, which then only reads. Coverage went
  from 5/69 to **69/69**.

Also repaired in the offline instrument: it navigated while offline, landed on the offline fallback,
found no task form and classified the outbox as `VULNERABLE` from an attempt that never happened. It
now measures the **warm** case an inspector is actually in, counts route interceptions to prove each
phase ran, reports an unattempted operation as `UNKNOWN`, and judges reconciliation on the server's
row count rather than on a title the month grid never renders.

---

## L. Gates executed

| gate | result |
|---|---|
| `measure:281-route-reachability` | **20 routes, 0 orphans** |
| `validate:286-reports-and-severity` (new) | **PASS — 63 checks, 0 failures, 3 observations** |
| `validate:286-actions-calendar` (new) | **PASS — 79 checks, 0 failures, 12 observations** |
| `review:286-actions-calendar-batch` (new) | 24 visits, **0 objective**, 16 app-format |
| `measure:286-actions-calendar-offline` (new) | 7 operations classified; full ONLINE→RECONNECT sequence exercised |
| `frontend-next: npx tsc --noEmit` · `npm run build` | **PASS** |
| `validate:279-update-delivery` | **PASS** |
| `validate:280-workspace-draft-persistence` | **PASS** |
| `validate:281-offline-data-state` | **PASS** |
| `check:page-titles` · `check:orange-semantics` · `check:expert-authority-boundary` | **PASS** |
| `check:effective-severity-parity` · `check:risk-band-parity` | **PASS** |
| `test:expert-presentation` · `test:expert-api-failure-mapping` · `test:expert-entitlement-presentation` | **PASS** |
| `test:calendar-reconciliation` | **PASS** |
| `backend: npm run build` | **PASS** |
| `backend: test:calendar-date-boundary` | **PASS** (×5 timezones, 25 checks each) |
| `backend: test:284-entitlement-denial-audit` | **PASS** |
| `backend: verify:274-successor-identity` | **PASS** — 22 elements, 0 failures |
| `backend: hazlenz:verify` | **PASS** — 29/29 protected modules, 0 accepted-evidence drift |
| `backend: brand:audit` | **PASS** |

---

## L2. A §285 gate now encodes a superseded contract — NOT edited

`validate-285-completion-and-report.mjs` asserts, at five points, that a zero-finding inspection is
REFUSED with `NO_CURRENT_FINDING`, and its recorded observation says so in words:

> *"HazLenz state G identified no hazard, so the inspection has zero findings and the completion
> contract refuses it with NO_CURRENT_FINDING."*

That was a true and correct statement of the contract **as it stood at §285**, and §285 raised the
consequence as the product question that produced this section's authorization. §286 removed the
requirement under that authorization, so those five assertions now describe behaviour the product
deliberately no longer has.

**The §285 gate was NOT edited, and it was not re-run and reported as a pass.** It is frozen
evidence of what the contract was, and rewriting it would both destroy that record and convert an
authorized policy change into a silently passing test. It is recorded here as **SUPERSEDED ON THE
COMPLETION ASSERTIONS** — its report-authority, immutability and provenance assertions are
unaffected and remain valid.

The successor is `validate:286-reports-and-severity`, whose Z1–Z9 series asserts the new contract
**and** asserts that everything the old requirement was protecting still holds: an inspection with
no observations is still refused, and an inspection with an unreviewed active finding is still
refused.

Not re-run for the same reason of honesty rather than convenience: `validate:285-dashboard-kpis`
and `review:285-completion-report-batch` were not executed in this section. Nothing in §286 touched
the D-044 dashboard counters (`dashboardCounters.ts` and `StatsGrid.tsx` are unmodified by §286),
but that is an argument from the diff, not a measurement, and is stated as such.

---

## M. Left open

**D-050** — no customer surface for the corrective-action lifecycle. The principal decision.
**D-051 / D-052 / D-053 / D-055 / D-056** — product-owner decisions, section J.
**D-042** — not implemented, per direction. Its concrete requirements are in `offline-inventory.json`.
**Report snapshot reachability** — unchanged from §285; no customer API exposes `sourceSnapshot`.
**App-Format** — 16 controls between 36px and 44px, registered for the Pre-Production gate.
**Legal register** — report revision/supersession disclosure, adequacy of the report limitation, and
confidentiality/distribution/retention, all registered and not drafted here.
