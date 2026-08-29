# InSite v1.0 — governed-cutover emergency-stop authority repair

**Date:** 2026-08-29 · **Repository HEAD:** `45251d38a4e800bbff461708aa4c77061feade56`, branch
`main`, `origin/main` at the same SHA, ahead/behind `0/0`. **Production SHA:** `45251d38…`.
**HEAD is unchanged by this operation** — nothing was committed, pushed, tagged or deployed.

```
TERMINAL = HAZLENZ_GOVERNED_KILL_SWITCH_AUTHORITY_REPAIR_ACCEPTED
           -- COMMIT_PUSH_DEPLOY_AND_BOUNDED_CUTOVER_REQUIRED
```

**The repair exists ONLY in the local worktree.** Production is running `45251d38…`, which still
contains the defect. Customer governed mode remains OFF in production and no
`GOVERNED_CUTOVER_*` variable exists there, so the defect is not currently reachable by any
customer — but it would have been reachable the moment the bounded cutover was performed, which is
why it was repaired before rather than after.

---

## 1. The defect, exactly as reproduced

`GOVERNED_CUTOVER_KILL_SWITCH` was a **delivery brake, not an emergency stop.** It was consulted
inside `orchestrateShadowRequest()` and nowhere else that mattered. The two call sites that decide
**durable** state — `resolveInspectionReleaseBinding()` (reached from
`safescope-v2.controller.ts` `classify`) and `resolveKnowledgeReleaseId()`
(`inspection.service.ts:537`) — both read `resolveCutoverEnablement(...).effectiveMode`, and that
function did not know the switch existed.

Reproduction: `backend/scripts/reproduce-governed-kill-switch-defect.ts`
(`npm run reproduce:governed-kill-switch-defect`). Deterministic, database-free, network-free,
provider-free. Configuration under test — the exact bounded cutover the 2026-08-29 preparation
derived, in production runtime semantics:

```
NODE_ENV                           = production
GOVERNED_CUTOVER_MODE              = GOVERNED_WITH_FALLBACK
GOVERNED_CUTOVER_PRODUCTION_ACK    = I_ACKNOWLEDGE_GOVERNED_CUTOVER
GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST = e9a25131-dfa4-40ce-90ff-8ab3d884d8ef
GOVERNED_CUTOVER_KILL_SWITCH       = engaged
principal                          = e9a25131-… (allowlisted)
active release                     = federal-core-2026-08-28.1
```

**Measured BEFORE the repair** — full transcript:
`transcripts/01-defect-reproduction-BEFORE-repair.txt`

| decision point | measured with the stop ENGAGED | required |
|---|---|---|
| `resolveCutoverEnablement().effectiveMode` | `GOVERNED_WITH_FALLBACK` | `LEGACY` |
| `resolveCutoverEnablement().reason` | `ACCOUNT_ALLOWLISTED` | an explicit stop reason |
| `modeInfluencesCustomerOutput()` | `true` | `false` |
| `resolveInspectionReleaseBinding()` | `federal-core-2026-08-28.1` / `BOUND_TO_ACTIVE_RELEASE` / `newlyBound=true` | `null` / `GOVERNED_MODE_INACTIVE` |
| `inspection.knowledgeReleaseId` after the call | **`federal-core-2026-08-28.1` — WRITTEN** | `NULL` |
| durable writes attempted | **1** | 0 |
| database statements issued | 3 (incl. the active-release pointer read) | 0 |
| `GovernedCutoverContext.create()` | a live `GOVERNED_WITH_FALLBACK` context | `null` |

`DEFECT REPRODUCED — 5 passed, 11 failed`. The 5 passes are the **positive control**: the same
configuration with the switch released does govern, does bind, and does persist the release id — so
the 11 failures are a real brake failure, not a globally inert subsystem.

**Why it mattered.** The binding is *write-once* (`WHERE "knowledgeReleaseId" IS NULL`). An operator
pulling the emergency stop mid-incident would have stopped governed content reaching the customer
while every new inspection continued to acquire a permanent governed release id — provenance the
incident was supposed to prevent, and which no later rollback removes.

## 2. Root cause

**Structural, not a missing `if`.** The switch was born in KG-4C as a shadow control and lived in
`production-shadow-authorization.ts`. That module *imports* `cutover-mode.ts`, so `cutover-mode.ts`
— which produces the authoritative "may this request enter governed mode?" answer — **could not**
consult the switch without a circular import. The brake was therefore only ever reachable from
modules *downstream* of the authority decision, and release binding and provenance assignment are
not downstream of it: they are two of its four consumers.

Verified by grep at HEAD: no kill-switch reference existed in `cutover-mode.ts`,
`inspection-release-binding.ts`, `inspection.service.ts` or `safescope-v2.controller.ts`.

## 3. The repair

**One canonical answer, with the brake inside it.** The emergency stop was extracted to a new
import-free module at the bottom of the cutover dependency graph, and applied in the one function
every consumer already calls.

| file | change |
|---|---|
| `backend/src/standards/cutover/cutover-kill-switch.ts` | **NEW.** The env constant, the runtime latch, `resolveKillSwitch`, `engageRuntimeKillSwitch`, `resetRuntimeKillSwitch` — moved verbatim from KG-4C. Imports nothing. |
| `backend/src/standards/cutover/cutover-mode.ts` | `resolveCutoverEnablement()` now consults the stop and returns `LEGACY` / `enabled:false` / `KILL_SWITCH_ENGAGED`. Adds `killSwitch` and `standing` to `CutoverEnablement`. The KG-4A allowlist boundary is factored out unchanged into `standingEnablement()`. |
| `backend/src/standards/cutover/production-shadow-authorization.ts` | Re-exports the moved primitives under their original names (**one** latch, not two); `SHADOW_KILL_SWITCH_ENV` becomes an alias for `CUTOVER_KILL_SWITCH_ENV`; the `PRINCIPAL_ELIGIBILITY` lock now reads `enablement.standing.enabled`. |
| `backend/src/standards/cutover/shadow-request-orchestration.ts` | Consumes the canonical decision instead of re-reading the environment; the kill-switch branch moves **above** the legacy fast path so a stopped governed request still reports `SHADOW_SKIPPED / KILL_SWITCH_ENGAGED` rather than being indistinguishable from an ordinary legacy request. |

**Deliberately not done.** No kill-switch check was added to `inspection-release-binding.ts`,
`inspection.service.ts` or `safescope-v2.controller.ts`. Four consumers independently interpreting
one environment variable is exactly the shape that produced this defect; there is now one
interpretation and the consumers inherit it.

**Rejected alternative.** Inlining the environment read into `cutover-mode.ts` (which would have
kept that module import-free) was rejected as materially weaker: it duplicates the parse, and it
leaves the in-process **runtime latch** — the one the circuit breaker pulls automatically, with no
operator present — unable to stop governed authority at all.

**Reason codes.** `KILL_SWITCH_ENGAGED` is its own reason. `MODE_IS_LEGACY` and
`NO_ALLOWLIST_CONFIGURED` are not overloaded: both describe a configuration that was never governed,
and reporting either during an incident would send an operator to fix a mode or an allowlist that is
still exactly as they left it. `configuredMode` and `standing` preserve the untouched configuration
for observability, so *"the brake stopped this"* and *"this was reconfigured"* stay distinguishable.

**Evaluation order.** The stop is evaluated **after** `MODE_IS_LEGACY` (on a legacy server there is
no governance to stop, and claiming a brake is holding something back would be false) and **before**
everything else, including `NOT_ALLOWLISTED` and `NO_PRINCIPAL`.

## 4. Behaviour after the repair

`transcripts/02-defect-reproduction-AFTER-repair.txt` — the **same** script, **same** expectations,
none relaxed:

```
REPAIRED — 16 passed, 0 failed
resolveCutoverEnablement       -> effectiveMode=LEGACY reason=KILL_SWITCH_ENGAGED enabled=false
resolveInspectionReleaseBinding-> releaseId=null reason=GOVERNED_MODE_INACTIVE newlyBound=false
inspection.knowledgeReleaseId  -> null
durable writes attempted       -> 0
database statements issued     -> 0
GovernedCutoverContext.create  -> null
```

The control block still passes: with the stop released, the same principal is governed, binds, and
persists the release id.

## 5. The nine-point authority contract, proven

`backend/scripts/test-governed-kill-switch-authority.ts`
(`npm run test:governed-kill-switch-authority`) — **115 passed, 0 failed**, transcript
`transcripts/04-kill-switch-authority-suite.txt`. Every section carries its own positive control.

| # | contract | result |
|---|---|---|
| 1 | no NEW customer request may become governed | `LEGACY` / `KILL_SWITCH_ENGAGED`, account **and** organization doors both closed |
| 2 | a safe inactive result is reached BEFORE any active-release lookup is authoritative | 0 database statements issued |
| 3 | no NEW inspection may bind to the active release | `releaseId=null`, `GOVERNED_MODE_INACTIVE`, `newlyBound=false` |
| 4 | no NEW `knowledgeReleaseId` may be assigned | stays `NULL`; 0 writes attempted |
| 5 | governed release-scoped standards may not become customer authority | no context created; `pinGovernedRelease()` returns `releaseId=null` / `MODE_IS_LEGACY` |
| 6 | shadow/governed delivery stops, as intended | `SHADOW_SKIPPED` / `KILL_SWITCH_ENGAGED`, customer payload still served |
| 7 | non-allowlisted behaviour remains legacy | `NOT_ALLOWLISTED`, `NO_PRINCIPAL`, `NO_ALLOWLIST_CONFIGURED` all unchanged, brake on or off |
| 8 | boot safety remains deterministic | see §7 |
| 9 | releasing the stop restores the bounded rollout | governed again, same env minus the switch; no configuration or database rewrite |

### 5.1 Phase 4 — inspection binding, all seven scenarios

| scenario | measured |
|---|---|
| **A** governed + ack + allowlisted, kill **OFF** | eligibility `GOVERNED_WITH_FALLBACK`; binds `federal-core-2026-08-28.1`; `newlyBound=true`; the inspection **receives** the release id |
| **B** same, kill **ON** | eligibility `LEGACY`; `releaseId=null`; `knowledgeReleaseId` **NULL**; **0** writes; **0** queries |
| **C** inspection already bound before the stop | keeps `federal-core-2026-07-30.1` **unchanged**; **0** writes; no clearing, backfill or rebinding; `readInspectionReleaseBinding()` still returns it, so provenance history stays verifiable during the incident |
| **D** kill ON → OFF | governed again; binds again; no configuration corruption |
| **E** non-allowlisted account | `LEGACY` / `NOT_ALLOWLISTED`, brake on or off |
| **F** no principal | `LEGACY` / `NO_PRINCIPAL`, brake on or off |
| **G** no allowlist configured | `LEGACY` / `NO_ALLOWLIST_CONFIGURED`, brake on or off |

**Write-once provenance is not falsified.** Scenario C is the explicit proof: the brake blocks NEW
binding and NEW delivery, and touches no existing row. Structurally,
`resolveInspectionReleaseBinding()` returns on `!modeInfluencesCustomerOutput(mode)` *before* the
database is reached, so there is no code path from the brake to an existing `knowledgeReleaseId`.

### 5.2 Phase 5 — governed retrieval / authority

| claim | measured |
|---|---|
| release-scoped retrieval is not selected merely because an active release exists | `GovernedCutoverContext.create()` → `null`; `pinGovernedRelease()` → `releaseId=null` / `MODE_IS_LEGACY` |
| reviewer-approved governed content is not presented through a newly governed request | no context, so no `resolveStandard()` path exists for the request |
| legacy behaviour remains available | the customer payload is still produced and returned (`SHADOW_SKIPPED`, payload preserved) |
| the 8 rejected records remain unreachable as governed authority | a `reject_correction_required` record resolves `UNAPPROVED_RECORD` with `standardText=null` **even with governance running**, and remains unreachable under the stop |
| **control (non-vacuity)** | with the stop released, `29 CFR 1910.147` resolves `APPROVED_EXACT` under the pinned release |

No citation-authority rule was weakened: the rejected-record refusal is produced by the production
rule in `governed-corpus-lookup.ts` (`effectiveState !== 'reviewer_approved'`), not by the fixture.

### 5.3 One switch, one latch

The move must not have created a second latch — an operator resetting one and leaving the other
engaged would have the illusion of an emergency stop. Asserted by identity:
`SHADOW_KILL_SWITCH_ENV === CUTOVER_KILL_SWITCH_ENV`, and the re-exported `resolveKillSwitch` /
`resetRuntimeKillSwitch` are the **same function objects**. The permissive-brake property is
re-asserted for `engaged`, `true`, `1`, `yes`, `STOP`, `off`, `false`, `0`, `please stop`; absent
and whitespace values do not engage. The **runtime latch** (`engageRuntimeKillSwitch`, what the
circuit breaker pulls) now stops governed authority with no environment change and no restart, and
an explicit reset restores the bounded rollout.

## 6. Phase 6 — boot and configuration safety

Legal modes remain exactly `LEGACY`, `SHADOW`, `GOVERNED_WITH_FALLBACK`, `GOVERNED_STRICT`. The
production acknowledgement remains required at the exact value
`I_ACKNOWLEDGE_GOVERNED_CUTOVER`. `assertCutoverConfigurationSafeForProduction()` deliberately does
**not** consult the kill switch, and this is asserted rather than assumed:

| configuration | brake released | brake engaged |
|---|---|---|
| governed mode in production, **no** acknowledgement | boot **refuses** | boot **still refuses** |
| governed mode in production, near-miss acknowledgement (`i_acknowledge_…`) | boot **refuses** | boot **still refuses** |
| unrecognised mode value in production | boot **refuses** | boot **still refuses** |
| acknowledged, well-formed governed configuration | boots | boots |

If engaging the brake suppressed these refusals, an operator could quiet a malformed production
configuration by pulling it — and the misconfiguration would go live the moment the brake was
released, which is the moment nobody is looking for it. `resolveCutoverMode()` also still reports
the **configured** mode under the brake, so rollback and emergency stop stay distinguishable.

## 7. Phase 7 — cutover regression

Run locally with `DATABASE_URL` unset. **Nothing weakened; no expectation updated; no assertion
deleted.** Transcripts in `transcripts/07-*.txt` and `transcripts/07b-*.txt`.

| suite | result | recorded floor |
|---|---|---|
| `test:kg4a-default-off` | **52 / 0** | 51 / 0 (**+1**, see below) |
| `test:kg4a-cutover-contract` | **146 / 0** | 146 / 0 |
| `test:kg4c-disabled-deployment` | **80 / 0** | 80 / 0 |
| `test:kg4c-production-shadow-contract` | **438 / 0** | 438 / 0 |
| `test:kg4d-default-off` | **121 / 0** | 121 / 0 |
| **protected floor subtotal** | **837 / 0** | **836 / 0** |
| `test:governed-kill-switch-authority` (**new**) | **115 / 0** | — |
| `test:kg4d-orchestration` | **151 / 0** | — |
| `test:kg4b-shadow-contract` | **123 / 0** | — |
| `test:kg4b-shadow-adversarial` | **84 / 0** | — |
| `test:kg4a-provenance-pinning` | **53 / 0** | — |
| **total executed** | **1,363 / 0** | |

### 7.1 The one test-file change, and why it is a tightening rather than a relaxation

`test:kg4a-default-off` carries a HARD import-purity gate whose stated purpose is *"if it ever
gained a governed import, importing it would silently become a second path to the corpus."* It was
implemented as the blunter **"`cutover-mode.ts` imports nothing at all"**, which was true and
sufficient while that module stood alone. The repair necessarily gives it one import.

The assertion was **made transitive, not removed** — the same discipline the file already applies to
the KG-4D integration list (*"the permitted surface grew, by design, and the assertion below is
updated rather than relaxed"*). It now asserts:

1. `cutover-mode.ts` imports **exactly one** module, and it must be `cutover-kill-switch`; **and**
2. `cutover-kill-switch.ts` itself imports **nothing**.

A route to the corpus would need an import somewhere on that chain, and there is nowhere left to put
one. The count moves 51 → **52**: one assertion added, none removed, none weakened.

### 7.2 Suites that could not execute here, classified

Not failures of the repair; each is an input or environment prerequisite this operation is not
authorized to supply.

| suite | why it did not run |
|---|---|
| `test:kg4b-default-off` | needs a live HTTP backend on `127.0.0.1:4340` |
| `test:kg4b-shadow-determinism`, `test:kg4b-privacy-review` | require a `shadow-events.jsonl` corpus argument |
| `test:kg4e-report-field-exclusion` | requires `DATABASE_URL` (prohibited by this operation) |
| `test:kg4e-telemetry-privacy-v2` | requires an `events.jsonl` argument |

None is part of the protected 836-assertion floor.

## 8. Phase 8 — broader protected regression

### 8.1 Executed and green

| gate | result |
|---|---|
| `test:hazlenz-core` | **PASS** — 44 constituent suites, 276 assertions, 0 failures |
| `test:hazlenz-precision` (decomposition precision/recall gate) | **PASS** — 0 dangerous omissions (A+B), 0 life-critical omissions |
| `score:hazlenz-precision` | Population A = 34 rows, Population B = 22 rows / **43 required hazard groups (35 life-critical)**; **case-level precision 100.0 %**; **forbidden-family count 0**; **life-critical omission count 0** |
| `test:hazlenz-level1-recall` | **PASS** — 17 checks |
| `test:hazlenz-actionable-coverage` | **PASS** — 17 checks |
| `test:hazlenz-standards-jurisdiction` | PASS (inside `hazlenz-core`) |
| `test:hazlenz-source-authority` | **PASS** — every named provision is in the governed source set |
| `test:release-identity-immutability` | **PASS** — 8 checks |
| backend `tsc --noEmit` | **clean** |
| frontend `tsc --noEmit` | **0 source errors** — see §8.3 |

### 8.2 BLOCKED, and stated as blocked rather than waved through

These are **requirements that remain open**, not paperwork. The local development database
`safescope` has **no governed release schema** — every one of these fails on
`relation "regulatory_release_records" does not exist`, a read-only `SELECT` failure that predates
and is unrelated to this repair. Building a disposable database with a materialized governed corpus
and a replayed reviewer ledger is itself a substantial mutating operation, and this operation is
authorized to repair one defect, not to perform that.

| gate | blocker |
|---|---|
| `test:governed-release-reachability` (rejected-record reachability, 514) | governed release tables absent locally |
| `test:governed-authority-precedence` (42) | governed release tables absent locally |
| `test:finding-governed-authority` (17), `test:finding-governed-integration` (19) | database unavailable |
| `test:release-binding-acceptance` (25) | correctly **REFUSED BEFORE MUTATION** by the repository's own ownership guard: `[PROTECTED_DATABASE] database=safescope: This database is permanently protected and can never be claimed.` The protection worked as designed. |
| `test:approval-contract` | database; also the pre-existing `ownedDisposable=false` refusal recorded in the blueprint |
| `test:user-authored-findings`, `test:report-replacement-failure-safety` | database |
| **HazLenz recognition 43/43 and actionable 43/43 SCORERS** | `score:hazlenz-actionable-coverage` drives the real customer workflow against a **disposable API instance and disposable database** (`ECONNREFUSED 127.0.0.1:4231`). Neither exists here. |

**The 43/43 recognition and 43/43 actionable numbers were NOT re-measured in this operation.** The
corresponding deterministic *gates* pass and the precision scorer re-measured Population-A precision
100.0 % / forbidden 0 / life-critical omissions 0 over the same 43-group, 35-life-critical corpus —
but a passing gate is not the scorer, and this document does not claim it is.

### 8.3 Frontend

`npx tsc --noEmit` in `frontend-next` reports **3 errors, all 3 inside `.next/`** generated build
output — duplicated artifacts named `routes.d 3.ts` and `cache-life.d 3.ts`, dated 2026-08-28 14:04,
the same macOS duplicate-file family as the untracked `… 2.ts` copies already in the worktree.
**Zero source errors.** Pre-existing and unrelated.

The Next.js **production build was deliberately not run.** This repair changes no frontend file, and
running a build with `NEXT_DIST_DIR` is the known mechanism that silently rewrites
`frontend-next/tsconfig.json` — the file this operation was told to leave untouched. Its hash is
verified unchanged at `73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535`.

## 9. Phase 9 — the rollback matrix, rehearsed

All three controls measured against the **same** governed production configuration, and each one
now checked for **durable state** as well as for eligibility — the property the primary stop
previously lacked. Suite section 7.

| control | action | `effectiveMode` / reason | new release binding | new `knowledgeReleaseId` | durable writes |
|---|---|---|---|---|---|
| **PRIMARY EMERGENCY STOP** | set `GOVERNED_CUTOVER_KILL_SWITCH` | `LEGACY` / `KILL_SWITCH_ENGAGED` | none | NULL | 0 |
| **BOUNDED ROLLBACK** | clear `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` | `LEGACY` / `NO_ALLOWLIST_CONFIGURED` | none | NULL | 0 |
| **MODE ROLLBACK** | set `GOVERNED_CUTOVER_MODE = LEGACY` | `LEGACY` / `MODE_IS_LEGACY` | none | NULL | 0 |

Existing provenance is left intact by all three. None rewrites history.

### 9.1 What takes effect when — per the actual runtime environment-loading architecture

`resolveKillSwitch(env = process.env)` reads `process.env` **on every call**, and the enablement
resolver is called per request. There is no cached snapshot and no in-process environment reload.

| control | takes effect | requires a restart? |
|---|---|---|
| **runtime latch** (`engageRuntimeKillSwitch`, pulled by the circuit breaker) | the **next eligible request** | **No.** No restart, no redeploy, no database write. |
| `GOVERNED_CUTOVER_KILL_SWITCH` env var on Render | every request after the service comes back up | **Yes** — a Render environment change restarts the service; the new `process.env` exists only in the new process. |
| `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` cleared on Render | every request after restart | **Yes**, same mechanism. Carries **no boot risk** — it does not re-enter the boot guard. |
| `GOVERNED_CUTOVER_MODE = LEGACY` on Render | every request after restart | **Yes**, and it **re-enters the boot guard**: `main.ts` → `validateProductionEnvironment()` → `assertCutoverConfigurationSafeForProduction()` runs first and unconditionally at boot. |

**Operational consequence.** Under time pressure the runtime latch is the only control with no
restart and no boot risk; of the three environment controls, clearing the allowlist is the most
surgical. Any edit to `GOVERNED_CUTOVER_MODE` re-enters the boot guard, so it must not be made
without `GOVERNED_CUTOVER_PRODUCTION_ACK` present in the same change.

**The 2026-08-29 finding is now closed.** `GOVERNED_CUTOVER_KILL_SWITCH` is a complete emergency
stop for NEW governed authority in the repaired code — **in the local worktree only.** In
production, at `45251d38…`, it remains a delivery brake, and §91.6 of the blueprint stays true of
the deployed system until this repair is deployed.

## 10. Files changed

| path | change | sha256 |
|---|---|---|
| `backend/src/standards/cutover/cutover-kill-switch.ts` | **new** | `1fa2beeb05c3612f29023ab267777afd7575f541f65b1b0c545f979a516e28ae` |
| `backend/src/standards/cutover/cutover-mode.ts` | modified | `43ea724ed6976a8408672911d42f59259a0508c7e833d0682ae085235696274a` |
| `backend/src/standards/cutover/production-shadow-authorization.ts` | modified | `c3fff83982dc8d9d368bdca091765ed30885b94d20bb3e49fec668e4d1666230` |
| `backend/src/standards/cutover/shadow-request-orchestration.ts` | modified | `efe3f2c3d1b767d2ed512aa3ce96d35bdc09bb6ce3c4ac7eb71dab1c502f01e0` |
| `backend/scripts/test-kg4a-default-off.ts` | modified (§7.1) | `6d070c697ebe008211ab2ee67d19b69eceac680932a0df494d6342df7a5a22de` |
| `backend/scripts/test-governed-kill-switch-authority.ts` | **new** | `a2689660965e30adfd92357612e58156e6d30bab8d0f435cf93c30deed7f3000` |
| `backend/scripts/reproduce-governed-kill-switch-defect.ts` | **new** | `63be8f1f7b8bb6b124ca9d2ee819252a6a857495d68f9721833144b5f9231b18` |
| `backend/scripts/lib/kill-switch-fixture.ts` | **new** | `859a4e4fc6d2ddd91665b9c694f97e3464a80453d6c5c3b910f16337740ff040` |
| `backend/package.json` | two script entries added | — |
| `docs/INSITE_ENGINEERING_BLUEPRINT.md` | §92 appended | — |
| `docs/INSITE_CURRENT_STATE.json` | current-state fields only | — |
| `verification/insite-v1-governed-kill-switch-authority-repair-2026-08-29/` | **new** — this record | — |

Full unified diff of the production and test changes: `repair.diff`.

**No historical evidence was modified.** The 2026-08-28 and 2026-08-29 verification directories are
untouched; §91.6 of the blueprint still records the finding as it was measured.

## 11. Worktree state

```
HEAD                = 45251d38a4e800bbff461708aa4c77061feade56
branch              = main   upstream = origin/main   ahead/behind = 0/0
staged              = 0
modified (tracked)  = 13 modified + 1 deleted (9 pre-existing, 5 from this operation:
                      package.json, test-kg4a-default-off.ts, cutover-mode.ts,
                      production-shadow-authorization.ts, shadow-request-orchestration.ts;
                      docs/* were already modified before this operation and are updated by it)
untracked           = 2,162 entries — the pre-existing set plus 4 new source/test files and
                      this evidence directory
stashes             = 4 (untouched)
tags                = 24 (untouched)
```

Nothing was reset, restored, cleaned, stashed, rebased or force-pushed. All pre-existing
uncommitted work is preserved, including `backend/scripts/test-approval-contract.ts`, the four
frontend `check-*.mjs` scripts, `docs/*`, and the deleted `ecfr-1910-146.xml`.
`frontend-next/tsconfig.json` remains byte-identical at
`73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` — the known contamination,
deliberately untouched.

```
COMMIT / PUSH / TAG / DEPLOY                    = NONE
RENDER MUTATION / ENV VAR CHANGE                = NONE
PRODUCTION DATABASE CONNECTION / MUTATION       = NONE
DATABASE_URL REQUESTED OR USED                  = NO
DEVELOPMENT DATABASE MUTATION                   = NONE (read-only SELECTs only, which failed)
PROVIDER / LLM CALLS                            = 0
PAYMENT                                         = NONE
GOVERNED STANDARDS CORPUS / ACTIVE RELEASE      = UNCHANGED
CUSTOMER GOVERNED MODE ENABLED                  = NO
EXPERT HAZLENZ                                  = NOT STARTED
```

## 12. Remaining limitations

1. **The repair is not in production.** Production runs `45251d38…` and still has the defect.
2. **The database-backed governance suites did not run** (§8.2). Release-scoped retrieval,
   rejected-record reachability, authority precedence, inspection-binding acceptance and the
   customer-workflow suites remain a requirement before this repair is deployed.
3. **The HazLenz recognition 43/43 and actionable 43/43 scorers did not run** (§8.2). The
   deterministic gates pass; the scorers were not measured and are not claimed.
4. **No live production request exercised the repaired path.** All proof here is deterministic and
   in-process, against an in-memory fixture that records the statements issued.
5. `OPEN-4 PRE_PRODUCTION_GOVERNANCE_RECONCILIATION_REQUIRED` (four failing frontend check
   scripts) and the unresolved-jurisdiction ranking defect are carried forward unchanged.

## 13. Next authorization required

**Commit, push and deploy this repair — which are one action, not three.** `autoDeploy=yes` with
`autoDeployTrigger=commit` on `main` means pushing to `origin/main` **is** a production deployment
of `safety-insite-backend`. There is no deployment-neutral way to preserve this work on `main`.

The bounded customer cutover (the three Render variables in §91.4 of the blueprint) should be
performed **only after** this repair is deployed — the emergency stop is a precondition for the
cutover, not a follow-up to it.

Nothing in this document authorizes a commit, a push, a deploy, a Render change, a database change,
a governed-mode enablement or a universal rollout.
