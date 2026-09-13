# Whole-product local validation — §276

**Terminal: `SAFETY_INSITE_LOCAL_PRODUCT_ACCEPTANCE_COMPLETE_WITH_LIVE_GAPS —
CONTROLLED_RELEASE_VERIFICATION_REQUIRED`**

| | |
|---|---|
| Date | 2026-09-13 |
| Branch | `beta/expert-hazlenz-validated-candidate-2026-09-12` |
| Supersedes | §275, whose terminal was `SAFETY_INSITE_LOCAL_PRODUCT_ACCEPTANCE_BLOCKED — REMEDIATION_REQUIRED` |
| Successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — **unchanged** |
| Machine-readable companion | `WHOLE-PRODUCT-VALIDATION.json` |
| Evidence package | `verification/current/local-product-validation-276/` |
| Provider spend | **$0.375220** of the $1.50 cumulative ceiling, **3** analyses of 6 across §§275–276 |
| Production changes | **0**. No push, no deploy, no production migration, no production write |

**§275's results are preserved, not overwritten.** Every check in the JSON carries its §275
status under `section275` beside its §276 outcome. Four §275 failures and six NOT_EXECUTED
areas are recorded as *found in §275 → remediated in §276 → retested*, with the retest named.

---

## The question this section asked

> Can a real controlled-beta user use Safety InSite end to end without encountering broken,
> confusing, inconsistent or unprofessional product behavior?

**Locally, yes.** The two defects that blocked §275 are closed and retested, the six areas
§275 never drove are driven, and a clean uninterrupted walkthrough passes 25 of 25 steps
with no development bypass. What remains is four **P2** items — three of them product
decisions rather than engineering gaps — and the live/external gaps that by definition
cannot be closed on localhost.

### What changed the terminal

1. **Corrective actions now reach the calendar (D-007).** §275 measured nine pieces of
   persisted due work against **0 EVENTS** on screen. §276 measures **35 on the server, 32
   displayed** — the three absent ones are completed items the page's own filter hides —
   and the same picture survives a full stack restart byte for byte.
2. **The report and the application agree about severity (D-008).** §275's report called a
   finding **Critical** while the screen the inspector approved called it **High**. §276's
   report states the reviewer's band and labels HazLenz's escalation as
   `HazLenz analysis: Critical`, beside a risk distribution counting **Critical 0**.

---

## How this was validated

The stack was run as a real application and driven in a browser. Nothing below was read out
of source.

| | |
|---|---|
| Backend | `npx ts-node src/main.ts`, **port 4000**, 148 routes (146 plus `PATCH`/`DELETE /tasks`) |
| Frontend | `npx next dev --port 3000` |
| Database | **`test_insite_validation_275`** — kept from §275 as instructed, 53 migrations |
| Development database | **`safescope` was never written to** |
| Storage | `STORAGE_PROVIDER=local_test` into the session scratchpad |
| Authentication | **Real.** `DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DISABLE_AUTH=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |
| Entitlement | Time-limited grants through the guarded `scripts/grant-test-entitlement.ts` |
| Browser | Playwright 1.60, already present in `frontend-next` |

**Port 4000 is confirmed canonical** — `backend/src/main.ts` defaults to it, `README.md`
documents it, and the tracked `.env.local.example` names it. The developer's untracked
`frontend-next/.env.local` was repointed from 4001 and its two development bypasses set
false. It is not committed; the tracked example already matched.

### Three instrument corrections, stated because they change how to read the numbers

§275 recorded two. §276 found three more, all of them instruments reporting something
tidier than the truth.

- **Timings measured waiting, not work.** The first performance pass wrapped a fixed
  2.5 s sleep inside the measured window, so every page "took" about 3 s and the two
  slowest results were simply the two with the longest sleep after them. The window now
  closes on a content condition; the settling delay is taken outside it. Measured again,
  navigations are 30–90 ms.
- **Redundant-call counting summed separate visits.** Keyed on the route name alone, it
  reported "`/settings` 10 requests" for a page this script visits four times. Counted per
  visit, the real number was six — still a defect, and now a true one.
- **The restart helper could return before the restart.** It polled `/health/ready` with no
  delay, so forty failed probes completed in about a second and it returned while the old
  process was still answering. One report-acceptance run measured a stale renderer and
  reported a pass. That run is not the record; the run after the helper was fixed is.

A fourth instrument error is recorded because it produced a false *failure*: the Expert
settlement probe read `analysisState` off the wrong level of the read payload and scored
`undefined` as a product defect. It was not one.

---

## Validation matrix

Full detail, with per-check §275 and §276 status, is in `WHOLE-PRODUCT-VALIDATION.json`.

**§275: 14 PASS · 10 PASS_WITH_LIMITATION · 4 FAIL · 6 NOT_EXECUTED**
**§276: 25 PASS · 9 PASS_WITH_LIMITATION · 0 FAIL · 0 NOT_EXECUTED**

| Area | §275 | §276 | The short version |
|---|---|---|---|
| Application startup | PASS | PASS | 148 routes, schema current |
| Authentication | PASS_WITH_LIM | PASS_WITH_LIM | Real login drove every pass; expiry still undriven |
| Workspace isolation | **NOT_EXECUTED** | **PASS** | 11 direct-id attempts, all 404 — never 403 |
| Navigation | PASS_WITH_LIM | PASS_WITH_LIM | No error boundary; the orphan route is unchanged |
| Dashboard | PASS_WITH_LIM | **PASS** | The three fabricated "scheduled" records are gone |
| Responsive UI | PASS | PASS | Unchanged by §276; no layout was altered |
| Theme and visual consistency | **FAIL** | **PASS** | §275's repairs re-driven; 0 console errors |
| Inspection creation | PASS | PASS | Driven five times across five contexts |
| Observation capture | PASS | PASS | Survived reloads and a restart |
| HazLenz analysis | PASS | PASS | Five new product paths |
| HazLenz concision | PASS_WITH_LIM | PASS_WITH_LIM | 826–1076 chars on screen from an ~83KB payload |
| Clarification | **NOT_EXECUTED** | **PASS_WITH_LIM** | Decision-critical path works; a predicate answer does not |
| Human confirmation | PASS_WITH_LIM | **PASS** | Expert settlement driven end to end for the first time |
| Multiple findings | PASS | PASS | Two findings, and two independent domains |
| Finding persistence | PASS | PASS | Survived a full restart |
| Corrective actions | PASS_WITH_LIM | **PASS** | Now dated, and their lifecycle was driven |
| Tasks | PASS_WITH_LIM | **PASS** | Edit and delete added and driven |
| Calendar | **FAIL** | **PASS** | **35 server events, 32 displayed** |
| Due dates and timezones | PASS | PASS | 25/25, plus a live 20:00-local boundary case |
| Reports | PASS | PASS | Checksums matched on every download |
| PDF output formatting | **FAIL** | **PASS** | Four report shapes inspected from extracted text |
| History | PASS | PASS | Recoverable and resumable |
| Analytics and counts | **FAIL** | **PASS** | Both halves closed |
| Settings | **NOT_EXECUTED** | **PASS** | A setting changed and seen to survive a reload |
| Entitlements | PASS | PASS | Guards exercised throughout |
| Storage and images | **NOT_EXECUTED** | **PASS** | Upload, integrity, refusal, delete |
| Error states | PASS_WITH_LIM | PASS_WITH_LIM | No stack trace reached the interface |
| Idempotency | **NOT_EXECUTED** | **PASS_WITH_LIM** | Every route the product uses is replay-safe |
| Audit trail | PASS_WITH_LIM | PASS_WITH_LIM | 264 security events across the pass |
| Accessibility baseline | PASS_WITH_LIM | PASS_WITH_LIM | 25 matrix cells labelled; the `<h1>` gaps remain |
| Browser console and network | PASS | PASS | Zero console errors |
| Restart persistence | PASS | PASS | Calendar digest identical across a restart |
| Data integrity | PASS | PASS | No orphans, including after an injected failure |
| Performance sanity | **NOT_EXECUTED** | **PASS_WITH_LIM** | 30–90 ms navigations; redundant calls reduced |

---

## The four product-owner decisions, as implemented

### D-007 — calendar authority

Server-persisted state is authoritative. The browser reads `GET /calendar` and reconciles it
with a pending-write outbox; the three pre-reconciliation device stores stop being calendar
sources, and the two with live writers have their records migrated onto the server once
each, tracked per record so nothing migrates twice.

The §275 root cause was **two** independent halves, and only one of them was the read path.
The inspection workflow never sent a `dueDate` when creating a corrective action, so every
one was persisted **undated** — and a calendar is dated. Repairing the read path alone would
have left the corrective actions invisible for a second reason.

A pending item is rendered as pending and never as saved; an unreachable server produces a
labelled cache rather than a silent zero; and a synced item leaves the outbox, so "collapse
to one event" is true by construction rather than by de-duplication.

### D-008 — severity authority

One rule, `resolveEffectiveSeverity`, mirrored on both sides and held together by
`npm run check:effective-severity-parity`. The reviewer's band is authoritative on every
customer-facing surface; HazLenz's escalation band is retained and labelled as HazLenz's.

Finalization no longer stamps the whole merged snapshot `reviewer_confirmed`: the analysis
band moves to `analysisRiskBand`, so the record is true about what it contains. The rule
reads §275's stored rows correctly without a data migration.

A second false attribution was found while proving the first. The report's detail line was
built from `operationalRisk`, which holds the **system's** matrix and is never rewritten by
a review — so a finding the reviewer set to 3 × 3 = 9 printed
`Severity 4 · Likelihood 4 · Risk score 16 · Reviewer-confirmed`. Every number on that line
was the machine's, on a line labelled as the person's. The line is now built from the
authoritative side only, and a band matching is **not** treated as the same cell.

### D-009 — applicability scope

Scoped evidence: the finding's own fragment **plus** unclaimed parent sentences that
explicitly co-reference its subject and name no other unit. Not fragment isolation, and not
a return to whole-observation evaluation. A sentence another finding owns is never
forwarded, which is the anti-contamination invariant the finding-scoping exists for.

§275's case now reads **SUPPORTED at 0.96** with no missing predicate, reached through
scoped evidence — the same answer the whole-observation path gives, without the leakage.
§117 remains **16/16, 0 dangerous**, and the withdrawn-lockout case still does not exclude
the guarding family.

### D-013 — report brand

Cover, running header, PDF metadata title and the unmounted legacy renderer all carry
**Safety InSite**, with HazLenz named as the engine.

The brand audit gained **Tier 1B**, which fails on a non-canonical rendering of the *live*
product name. It was verified against the deliberately reintroduced defect: with `'INSITE'`
put back on the cover it **failed**, and passed again once repaired. A first version of that
check could not see the defect at all — it recognised JSX text and prop assignments, and the
defect was a `doc.text('INSITE', ...)` call — which is exactly how a gate becomes a
decoration.

---

## What §276 found that §275 had not

Nine new defects. Six are closed and retested; three await a product decision.

| ID | Sev | Status | What |
|---|---|---|---|
| D-021 | P2 | **CLOSED** | A decision-critical jurisdiction answer was applied *and* simultaneously recorded as "Unknown question ID ignored" |
| D-022 | **P1** | **CLOSED** | Answering a clarification **damaged** the finding: it lost its standard, the hazard count rose, and `guardstate=absent_or_ineffective` was quoted back as the inspector's own words |
| D-024(a) | **P1** | **CLOSED** | On a safe observation, a hazard the engine itself assessed `SAFE_VERIFIED` was proposed and pre-ticked |
| D-025 | P2 | **CLOSED** | `check:risk-band-parity` threw ENOENT on every run — the gate that holds the browser's risk bands to the server's, silently unrunnable since §274 |
| D-026 | P3 | **CLOSED** | The profile shouted the account's own name and email back in capitals |
| D-027 | P3 | **CLOSED** | One Settings visit issued six identical `GET /billing/status` requests |
| D-023 | P2 | **OPEN — decision** | A **predicate** clarification answer changes nothing, under a panel captioned "What would raise this" |
| D-024(b) | P2 | **OPEN — decision** | A `ground_control` hazard routed at confidence **0.2** from the single word "wall" is still proposed on a safe observation |
| D-028 | P2 | **OPEN — decision** | A renderer correction does not re-issue an already-issued report |
| D-029 | P2 | OPEN | A corrective action created with no `findingId` is not deduplicated on replay |

**D-022 and D-024(a) were P1 and are closed.** Both are the same failure as D-008 in a
different place: a machine value wearing a person's label. D-022 re-labelled every
engine-extracted fact `user_confirmation` on any re-run, including one where the reviewer
never opened the fact list. D-024(a) proposed as a hazard something the engine's own
analysis recorded as verified safe.

**D-024(b) is P2, and the reasoning is recorded rather than asserted.** As first measured it
was P1: two hazards on a safe observation with one pre-ticked, so pressing Continue without
reading carried a fabricated finding into a compliance report. With the `SAFE_VERIFIED`
hazard withdrawn only one candidate remains, the confirmation step no longer appears, and
nothing is pre-selected — the reviewer must drive risk, review and save before it becomes a
finding at all. That is review noise and an unnecessary dismissal, not a record that creates
itself. The direction of the error is over-flagging, never under-reporting.

**Why D-023 and D-024(b) were not simply fixed.** Whether a reviewer's unsupported assertion
may promote a regulatory predicate — carrying a citation from Candidate to Supported with no
corroborating observation text — is a safety-semantics decision about what a human assertion
establishes. So is a minimum routing confidence chosen from a single observation, which is
the tuning §276 explicitly forbids. Both are stated with the measurement and handed over.

---

## HazLenz product-path coverage

§275 drove one deep OSHA machine-guarding case. §276 adds five, driven through the real
interface.

| Path | Domain | Outcome |
|---|---|---|
| 1 | OSHA machine guarding | §275's case, re-driven by the §276 walkthrough |
| 2 | OSHA, second domain (electrical) | Hazard proposed, standard carried, no token leak |
| 3 | MSHA | Two hazards proposed under the MSHA context |
| 4 | Safe / negated condition | **The one that found something.** See D-024 |
| 5 | Multiple independent hazards | Two independent hazards across two domains, not collapsed |
| 6 | Unresolved / clarification-required | Candidate with a stated missing predicate; the Expert execution here was **admitted** |

### Concision

Scored from the **default** screen — what the reviewer sees before expanding anything,
because "correct but buried" is invisible to any assertion made against the payload.

**826–1076 rendered characters** per path, against a classify payload of roughly 83KB. Zero
internal-token leaks after the D-022 repair. Every path quotes the inspector's own words,
states a risk band, and defers regulatory text behind a disclosure. Three advisory
statements per screen — present without becoming a wall.

Two presentation defects were repaired under the authority §276 grants (presentation before
semantics): a finding headed by HazLenz's internal `mechanism` clause now carries a hazard
name, and a reanalysis no longer injects fact tokens into the analysis text.

One **content-design limitation** is recorded rather than repaired, because presentation
cannot fix it: the corrective-action text is still a template with the hazard family
substituted — "Immediate hazard control required to prevent contact/exposure to Machine
Guarding hazard" — naming neither the machine nor the control. §275 called this weak; §276
re-measured it and it is unchanged.

### Provider accounting

**3 analyses of the 6 allowed across §§275–276. $0.375220 of the $1.50 ceiling.**

| # | Section | Outcome | Cost | Cause, classified individually |
|---|---|---|---|---|
| 1 | §275 | REFUSED | $0.119524 | `POSTURE_BASIS_REF_UNRESOLVED` + `ACTIVE_CANDIDATE_NOT_COVERED` |
| 2 | §276 (P4) | REFUSED | $0.101634 | `POSTURE_BASIS_REF_UNRESOLVED` — **one** code, a different cause list from #1 |
| 3 | §276 (P6) | **ADMITTED** | $0.154062 | Reached `ANALYSIS_AWAITING_CONFIRMATION` |

Execution 3 is the first admitted Expert execution in the product record. It named two
unresolved items — `decl-energized-status` and `cand-pinch-exposure` — on an observation
that states a guard is missing and says nothing about energy. That is what made the
human-confirmation path drivable at all, and §275's "Expert settlement unreachable"
limitation is closed on it: a reviewer settled it, the state moved to `ANALYSIS_CONFIRMED`,
`settledForUse` became true only then, and the Expert result was **byte-identical**
afterwards.

No provider call was spent to replace an unfavourable answer. No Expert prompt, wire schema,
admission rule, verifier or governed regulatory semantic was changed.

---

## Gates

| Gate | Result |
|---|---|
| backend TypeScript / build | PASS |
| frontend TypeScript / build | PASS |
| frontend lint delta | **0 new errors, 0 new warnings** |
| `brand:audit` | PASS — Tier 1 **0**, Tier 1B **0**, Tier 2 293/293, retained 694/694 |
| `hazlenz:verify` | PASS — 29/29 protected modules, 0 new accepted-evidence drift |
| `verify:274-successor-identity` | PASS — 22 elements, 0 failures, identity **unchanged** |
| `beta:readiness` · `docs:check-links` | PASS |
| §117 guarding regression | **16/16, 0 dangerous** |
| §276 scoped-evidence regression (D-009) | 22/22 |
| §276 effective-severity regression (D-008) | 48/48 |
| §276 calendar reconciliation, server (D-007) | 39/39 |
| §276 calendar reconciliation, browser (D-007) | 34/34 |
| calendar date boundary | 25/25 |
| `hazlenz:integration:test` | PASS |
| report replacement failure safety | 16/16 |
| risk-band parity · effective-severity parity · Expert authority boundary | PASS |
| §276 gap closure (A–C / D–F) | 33 pass 1 note · 27 pass 1 note 1 fail (D-023, recorded) |
| §276 report acceptance | 92 pass, 0 fail |
| §276 Expert settlement | 11/11 |
| §276 final walkthrough | **25/25** |

Two gates could not run at all and were repaired (D-025): `check:risk-band-parity` pointed
at a directory §274 deleted, and `test:expert-presentation` invoked a binary that is not
installed. The first matters here in particular — it is the check that holds the browser's
risk bands to the server's profiles, which is the arithmetic D-008 turns on.

---

## What remains

**Local, and needing a product-owner decision:** D-023, D-024(b), D-028. All P2.
**Local, bounded:** D-029, D-010, D-011, D-014, D-016, D-017.
**Live/external, and not closable on localhost:** live provider transport from a deployed
instance, and live billing — both recorded in `CURRENT-STATE.md` §10 as `UNVERIFIED_LIVE`,
unchanged by §276.

The full terminal is deliberately not claimed. P0 and P1 are zero and every mandatory
NOT_EXECUTED area is executed, but gaps remain beyond a clean local baseline and they are
named above rather than absorbed into a pass.
