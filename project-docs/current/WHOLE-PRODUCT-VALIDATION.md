# Whole-product local validation — §275

**Terminal: `SAFETY_INSITE_LOCAL_PRODUCT_ACCEPTANCE_BLOCKED — REMEDIATION_REQUIRED`**

| | |
|---|---|
| Date | 2026-09-13 |
| Branch | `beta/expert-hazlenz-validated-candidate-2026-09-12` |
| Commit tested | `ae075555` (started from `45642bbe`) |
| Successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — **unchanged** |
| Machine-readable companion | `WHOLE-PRODUCT-VALIDATION.json` |
| Evidence package | `verification/current/local-product-validation-275/` |
| Provider spend | **$0.119524** of the $2.00 allowance, 1 analysis of 10 |
| Production changes | **0**. No push, no deploy, no production migration, no production write |

---

## The question this section asked

> Can a real controlled-beta user use Safety InSite end to end without encountering broken,
> confusing, inconsistent or unprofessional product behavior?

**Not yet.** The product is much closer than the defect list suggests — the inspection pipeline
works end to end, the report is genuinely professional, HazLenz is correctly wired and appropriately
concise, and nothing silently lost a user's work. But two defects would be obvious to a beta user
in their first session, and one of them defeats a headline promise on the landing page.

### What blocks acceptance

1. **Corrective actions never reach the calendar (D-007, P1).** The Safety Calendar's own subtitle
   promises "corrective actions, follow-ups, reminders, and due work in one lightweight schedule".
   With nine events on the server — including the two corrective actions the Pro inspection had just
   created — the page displayed **0 EVENTS, 0 OPEN, 0 OVERDUE**.
2. **The report and the application disagree about a finding's severity (D-008, P1).** The PDF that
   leaves the building called finding 2 **Critical**; the screen the inspector approved called it
   **High**; and the stored record attributes the Critical to `source: "reviewer_confirmed"` beside a
   rationale that computes to High.

Both are recorded for product-owner decision rather than repaired here, because both turn on a
product decision rather than a coding error — see *Blockers* below.

---

## How this was validated

The stack was run as a real application, not read. Every user-facing claim below was produced by
driving the running product in a browser.

| | |
|---|---|
| Backend | `npx ts-node src/main.ts`, port 4000, 146 routes mapped |
| Frontend | `npx next dev --port 3000` |
| Database | **`test_insite_validation_275`** — disposable, created for this section, 53 migrations |
| Development database | **`safescope` was never written to.** The resolved target was asserted disposable before every mutating command |
| Storage | `STORAGE_PROVIDER=local_test` into the session scratchpad |
| Authentication | **Real.** `DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DISABLE_AUTH=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |
| Entitlement | Time-limited grant through the guarded `scripts/grant-test-entitlement.ts`, which refuses outside `NODE_ENV=test` and a `test_*` database |
| Browser | Playwright 1.60 (already in `frontend-next`) plus Chrome for manual visual review |

Running under the development bypass would have measured the bypass. Two new Playwright
instruments were added beside the 34 that already existed:
`scripts/validate-275-product-surface.mjs` and `scripts/validate-275-contrast-sweep.mjs`.

### Two instrument corrections, stated because they change how to read the numbers

Both were caught by noticing that a result was too tidy to be true.

- The surface sweep first logged in **once per viewport**, tripping the product's own
  `@Throttle({ limit: 3, ttl: 60000 })` on `POST /auth/login`. Two of four viewports silently lost
  their session and the sweep scored 14 photographs of the sign-in page as passes. It now signs in
  once and reuses the session, and an authenticated route that lands on `/login` is recorded
  **NOT_EXERCISED**, never PASS.
- The contrast sweep first reported 404 failures at an improbably exact 202 per theme, including
  the login hero at 1:1 — plainly legible on screen. Two causes: it ignored gradient backgrounds
  and walked up to `body`, and Playwright's `colorScheme` does nothing here because the app reads
  `safety_insite_theme` from localStorage. It now seeds the key the app actually reads, asserts the
  theme applied, and reports gradient-backed text as **unmeasured** rather than scoring it.

The contrast sweep still cannot measure text over a gradient, and mis-parses `lab()` colours. Its
numbers are a floor on the real count, not a ceiling.

---

## Validation matrix

Full detail, with evidence pointers, is in `WHOLE-PRODUCT-VALIDATION.json`.
**14 PASS · 10 PASS_WITH_LIMITATION · 4 FAIL · 6 NOT_EXECUTED.**

| Area | Result | The short version |
|---|---|---|
| Application startup | PASS | Clean boot, database up |
| Authentication | PASS_WITH_LIMITATION | Guards hold with the bypass off; logout and expiry not driven |
| Workspace isolation | **NOT_EXECUTED** | Second user exists; no cross-tenant attempt made |
| Navigation | PASS_WITH_LIMITATION | No navigation item points at a missing page; 1 orphan route |
| Dashboard | PASS_WITH_LIMITATION | Correct zero state; two layout defects, both repaired |
| Responsive UI | PASS | 96/96 route×viewport checks, **zero horizontal overflow** at 390/768/1280/1440 |
| Theme and visual consistency | **FAIL** | Two panels unreadable in dark theme; both repaired |
| Inspection creation | PASS | Site and jurisdiction persisted |
| Observation capture | PASS | Survived a full context loss |
| HazLenz analysis | PASS | `1910.212(a)(1)` **SUPPORTED at 0.96**, `USER_CONFIRMED` |
| HazLenz concision | PASS_WITH_LIMITATION | Two one-line findings; an 83KB payload stays off the screen |
| Clarification | **NOT_EXECUTED** | No clarification-required case exercised |
| Human confirmation | PASS_WITH_LIMITATION | Risk confirmation works; Expert settlement unreachable (the run was refused) |
| Multiple findings | PASS | Two findings from one observation, not collapsed |
| Finding persistence | PASS | Restored after total local context loss |
| Corrective actions | PASS_WITH_LIMITATION | Created with a risk-derived due date; lifecycle not driven |
| Tasks | PASS_WITH_LIMITATION | Dates round-trip exactly; no UI CRUD walkthrough |
| Calendar | **FAIL** | **9 server events, 0 displayed** |
| Due dates and timezones | PASS | Off-by-one found and repaired; 25/25 regression |
| Reports | PASS | 6-page PDF, checksum matched exactly |
| PDF output formatting | **FAIL** | Professional, but mis-branded and severity-inconsistent |
| History | PASS | Saved inspection recoverable and resumable |
| Analytics and counts | **FAIL** | Calendar 0 vs 9; Inspections "3 SCHEDULED" vs 1 inspection |
| Settings | **NOT_EXECUTED** | Renders; nothing changed or verified |
| Entitlements | PASS | Free plan correctly refused with clean copy |
| Storage and images | **NOT_EXECUTED** | No upload driven |
| Error states | PASS_WITH_LIMITATION | No stack trace reached the interface in any case observed |
| Idempotency | **NOT_EXECUTED** | No double-submit driven |
| Audit trail | PASS_WITH_LIMITATION | Reviews, security events and provider usage recorded; tokens redacted |
| Accessibility baseline | PASS_WITH_LIMITATION | Nested buttons eliminated; keyboard traversal not driven |
| Browser console and network | PASS | 0 errors / 0 failed requests across 96 checks after the hydration repair |
| Restart persistence | PASS | Everything survived a full stop and start |
| Data integrity | PASS | No orphans; UI matches stored truth |
| Performance sanity | **NOT_EXECUTED** | Not measured |

---

## What genuinely works, stated plainly

It would be misleading to list only defects.

- **The inspection pipeline is complete.** Create → site and jurisdiction → observation → HazLenz
  review → confirm findings → risk matrix → corrective actions → finish → report, driven end to end
  in a browser as a real authenticated Pro user.
- **The §117 repair is live in the product.** A punch press with the guard removed, running, with
  the operator's hands in the die, *and a lockout that had since been withdrawn* resolves
  `29 CFR 1910.212(a)(1)` **SUPPORTED at 0.96** with all four predicates supported and jurisdiction
  `USER_CONFIRMED`. Before the repair this family was excluded at 0.96 by the withdrawn lockout.
  `1910.147` is correctly `CONTRADICTED`.
- **HazLenz is concise where it matters.** The classify payload is ~83KB across ~110 keys; the user
  sees two findings of one line each, each quoting their own words, with risk and citation inline.
  The presentation layer is already doing the job Phase 10 asks for.
- **Human authority is respected in the interface.** "Tick the ones that are real findings. Anything
  you leave unticked is not recorded as a finding, creates no corrective action, and does not appear
  in your report — you do not have to review it or explain why."
- **Expert refusal is honest.** "Expert analysis could not be used. The Expert layer answered and the
  answer was refused in full. No conclusion is offered." and, when absent, "That is not a finding
  that there are no hazards." The architecture contained a non-admitted provider answer, spent one
  leg instead of two, and offered the user nothing from it.
- **Nothing lost a user's work.** After the local inspection context was destroyed, the inspection
  was recoverable from the inspections list with its observation, finding and Expert state intact,
  and it survived a full restart of both processes.
- **The report is a professional artifact.** Cover page, executive summary with a risk distribution,
  inspection record, assessment prose, an explicit basis-and-limitations statement carrying the
  advisory disclaimer, and a findings table.

---

## Defect register

Severity: **P0** unsafe / security / data loss · **P1** materially broken primary workflow ·
**P2** significant UX or product defect · **P3** polish.

### Fixed in this section

| ID | Sev | Area | Defect | Fix | Verification |
|---|---|---|---|---|---|
| D-001 | P2 | Calendar / actions | A corrective action due 8pm on Sep 15 displayed on **Sep 16**. `new Date("2026-09-15")` parsed a bare date as UTC midnight on ingestion, and `toISOString().slice(0,10)` read the day back in UTC on projection. The two errors cancelled on the obvious test case, which is why it survived | `parseDueDate` / `toCalendarDayKey` in `backend/src/common/calendar-date.ts`, applied to both ends | Re-measured on the running stack: both inputs now display Sep 15. `npm run test:calendar-date-boundary` 25/25 |
| D-002 | P2 | Home | `.app-input { width: 100% }` beat every width utility a caller passed. On Home the priority select took **687px of a 935px row**, starving the task-title label to **0px** and wrapping its text into a six-line column | Width moved out of the CSS class into the components' Tailwind class list so caller overrides sort after it | Re-measured: label 549px, input 549px, select 128px, row height 128px → 53px |
| D-003 | P3 | Home | A raw date key in the interface: "Add task for 2026-09-13" | `formatCalendarDateLabel`, parsing locally so it cannot shift a day | Reads "Add task for Sunday, September 13" |
| D-004 | P2 | Inspection workspace | HazLenz's suggested risk — the number the inspector is asked to confirm — rendered at **1.07:1** in dark theme, a fixed light panel under theme-varying text | Dark counterparts for the panel background and border | Re-measured in browser |
| D-005 | P2 | Inspection complete | The completion hero measured **1.95:1**: heading, completion time, jurisdiction and report status effectively unreadable in dark theme | Dark counterparts on the success panel and its risk pills | Re-measured and visually confirmed |
| D-006 | P1 | Sign-in | Every non-OK response mapped to "Check your email and password" — so on a **429 rate limit** a user with the correct password was told it was wrong, retried, extended their own lockout, and was never told that waiting is the fix | 429 and 5xx now say what they are; registration given the same treatment | Throttle reproduced at 3 attempts/minute |
| D-012 | P2 | Inspection workspace | Nested `<button>` elements in the applicable-standard card. React reported a hydration error on every render, and a control inside a control has no defined activation behaviour; the outer one had no accessible name, only a "+" glyph | Made siblings; the card toggle now reads "Show details for 29 CFR 1910.212(a)(1)" | `document.querySelectorAll('button button').length` 2 → 0; dev overlay issues cleared |
| D-018 | P2 | Tooling | 32 `package.json` script entries pointed at `src/safescope-v2/`, deleted by §274 — the entire deterministic HazLenz battery exited MODULE_NOT_FOUND. **This is why nobody noticed the committed §117 gate was failing 9 of 16 cases** | Repointed to `src/hazlenz/` | Every file target in `package.json` now resolves; 0 missing |
| D-019 | P2 | Tooling | The brand audit matched case-sensitively against hand-written spellings and could not see `SafescopeV2Service`. It reported PASS at 390 while 987 references were present | Canonical names, case-insensitive derived patterns, and the count split into ratcheted debt (293) and register-documented retained identifiers (694) | Tier 1 measured **0** under the new matcher — nothing was hiding |

### Open — require a product-owner decision

| ID | Sev | Area | Defect | Why it is not fixed here |
|---|---|---|---|---|
| **D-007** | **P1** | Calendar | Corrective actions and tasks created by the Pro inspection workflow **never appear on the Safety Calendar**. `getSafetyCalendarEvents()` composes only from `getCompanyAssignedWork()`, `getStoredActions()` and `getPersonalCalendarEvents()` — all device-local — and never calls `GET /calendar`, while `app/inspection-workspace/page.tsx` writes through `createPersistedCorrectiveAction` and `createPersistedTask` to the server. The write path is server-side; the read path is device-local; they never meet | Reconciling a deliberately offline-first local store with the server requires deciding dedupe identity, conflict precedence, offline behaviour and ownership filtering. That is an architecture decision, not a bug fix |
| **D-008** | **P1** | Reports | The PDF called finding 2 **Critical**; the application called it **High**. `riskSnapshot.riskBand` carries the **AI escalation band**, while `overallRisk` / `operationalRisk.matrixBand` carry the **reviewer's matrix band**. The PDF renderer prefers `riskBand`; the app renders the matrix band. The stored record then attributes Critical to `source: "reviewer_confirmed"` beside the rationale "Reviewer-confirmed on the Standard 5x5 matrix: severity 4 x likelihood 4 = 16" — and 16 is High on that profile (High 10–16, Critical 17–25) | Choosing which band is authoritative on a compliance artifact is a safety-semantics decision. Both may be legitimate; what is not legitimate is two surfaces disagreeing and one of them mislabelling an AI band as reviewer-confirmed |
| **D-009** | P2 | HazLenz content | Per-finding applicability is evaluated against the decomposed `observationFragment`, not the whole observation. The fragment for finding 1 contains no energy or exposure statement, so the card reads **"Candidate · Confidence: Low · missing: moving or accessible energy"** for a finding the engine rates SUPPORTED at 0.96 on the full text. Reproduced exactly: the fragment yields `"Candidate only; missing: moving or accessible energy."`, the whole observation yields `"Supported by submitted evidence…"` | Whether applicability should read the fragment or the whole observation is a HazLenz semantic decision. The product itself draws this distinction — the Expert panel says it "reasons over the whole observation" — so the fragment scoping may be deliberate |
| D-010 | P2 | Data | Corrective-action rows written **before** the D-001 repair are stored a day early. The projection is now honest about the instant it is given, so those rows display on the earlier day rather than being accidentally corrected | A one-time data migration over existing due dates. Out of scope for a localhost validation |
| D-013 | P2 | Reports | The PDF is branded **"INSITE"** on the cover and **"InSite ·"** in the running header. The canonical product name is **Safety InSite**. The brand audit's Tier 1 covers `backend/src/pdf` and `backend/src/reports` but only looks for *retired* brands, so a wrong rendering of the *live* brand passes | Trivial to change; it is customer-facing brand copy on a compliance artifact and should be a deliberate decision, not a silent edit during a validation pass |
| D-014 | P3 | Reports | Page footers read "Page 1 of 5" while the PDF has 6 pages | Cover-page numbering convention — a deliberate choice to confirm |

### Open — bounded, not yet fixed

| ID | Sev | Area | Defect |
|---|---|---|---|
| D-011 | P3 | Navigation | `/inspection-quick` is a maintained 570-line page reachable only by typing the URL. `/inspection-workspace` reached without local context shows "No server-saved inspection was selected." with no in-page link onward — recoverable only via the tab bar |
| D-015 | P2 | Dashboard | The Inspections page reported **3 SCHEDULED** against **1** stored inspection; the number tracked the three tasks created at the time |
| D-016 | P3 | Sign-in | The error message renders *below* the "Create an account / Forgot password?" links rather than next to the control that failed |
| D-017 | P3 | Accessibility | `/inspection-review`, `/inspection-complete` and `/field-capture` render **no `<h1>`**; `/safety-calendar` has 2 unlabelled inputs; `/inspection-quick` has 2 |
| D-020 | P3 | Local dev | `frontend-next/.env.local` pointed at port **4001** with nothing listening, and there is **no tracked `.env.local.example`** to drift from. Also: starting `next dev` before the backend lets it take port 4000 |

---

## HazLenz product-path assessment

One deep OSHA General Industry machine-guarding case was driven end to end, plus one real Expert
execution. **MSHA, a second hazard domain, a safe/negated condition, an unresolved condition and a
clarification-required condition were NOT exercised** — the product-path set is narrower than
Phase 10 describes, and the conclusions below are correspondingly narrow.

| Criterion | Assessment |
|---|---|
| Relevance | **Good.** Each finding quotes the inspector's own words as its basis |
| Concision | **Good.** Two findings, one line each. The ~83KB payload does not reach the screen |
| Prioritisation | **Good.** Risk band and citation inline on each finding |
| Non-repetition | **Adequate.** The two findings overlap in subject; the second adds "no light curtain or two-hand control" |
| User language | **Mixed.** Finding 1 reads "Machine guarding". Finding 2 is rendered from an internal `mechanism` clause: *"required machine-guarding component missing, defeated or out of adjustment"* — lowercase, clause-shaped, and used as a page heading |
| Clarification discipline | Not exercised |
| Regulatory grounding | **Good.** One citation, with an expandable standard detail panel, and an explicit "No standard established" where none applied |
| Corrective action | **Weak.** "Immediate hazard control required to prevent contact/exposure to Machine Guarding hazard" is a template with the family name substituted — it names neither the guard, the press, nor what to do |
| Uncertainty | **Good.** Advisory framing is present without becoming a wall of caveats |

No Expert prompt, wire schema, admission rule, verifier, settlement or governed regulatory semantic
was changed. The single Expert execution was **refused** by deterministic structural admission
(`FIRST_PASS_NOT_ADMITTED`), which spent one provider leg instead of two and offered the user
nothing from the refused answer — the containment behaved as designed. **One refusal on one
observation is not evidence about Expert reliability in either direction**, and no conclusion is
drawn from it here.

---

## Identity and production safety

| | |
|---|---|
| Successor identity before | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` |
| Successor identity after | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` |
| `verify:274-successor-identity` | PASS — 22 elements, 0 failures |
| `hazlenz:verify` | PASS — 29/29 protected modules, **0 new accepted-evidence drift** |
| Production migrations | 0 |
| Production database writes | 0 |
| Deployments | 0 |
| Pushes | 0 |

The §117 files are outside the 29 protected modules and are not digested members of any frozen
manifest, which is why committing them did not move the candidate identity.

---

## What remains before this terminal can change

1. Decide **D-007** (calendar reconciliation) and **D-008** (authoritative severity on the report).
   These are the two that block controlled beta.
2. Decide **D-009** (fragment versus whole-observation applicability) and **D-013** (report brand).
3. Execute the six **NOT_EXECUTED** areas: workspace isolation, storage and images, idempotency,
   settings, clarification, and performance.
4. Broaden the HazLenz product-path set to MSHA, a second domain, and a negated condition.
