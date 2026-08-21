# KG-4D — final status

**KG-4D is COMPLETE.**

> ## `KG_4D_COMPLETE — READY_FOR_EXPLICIT_PRODUCTION_SHADOW_AUTHORIZATION`

The six KG-4C safety modules are now **reachable from and active on the real customer request path**,
and every property KG-4C could only assert in isolation has been re-proven through the running
product. Nothing was committed, pushed or deployed; production was not touched; production SHADOW
remains disabled and `GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` has never been set anywhere.

## The correction KG-4D adopts

KG-4C reported `READY_FOR_EXPLICIT_PRODUCTION_SHADOW_AUTHORIZATION` while its own final report
recorded that **none of the six modules was reachable from a customer request**. Those two
statements do not sit together: verified-but-unwired safety machinery protects nothing, and a
readiness label that outruns the integration is the kind of claim this programme exists to refuse.
KG-4D therefore opened with the stronger operational conclusion — *production shadow was not yet
authorized* — and the label is earned only now that the wiring exists and has been verified end to
end. `KG4D-DISC-01`.

## The integration seam

**One boundary**, `orchestrateShadowRequest()` in
`backend/src/standards/cutover/shadow-request-orchestration.ts`, called from exactly one place:
`safescope-v2.controller.ts` `classify()`, after the AI analysis is complete. Plus two narrow hooks
in `inspection.service.ts` for the persistence-side provenance gate.

```
authenticated request
  -> HazLenz analysis (unchanged, one model call)
  -> orchestrateShadowRequest()
       mode -> eligibility -> production locks -> kill switch -> circuit breaker
       LEGACY:  runPipeline(null, pristine) ............... returns it, nothing else executes
       SHADOW:  run 1 pristine, no context ................ THE CUSTOMER PAYLOAD
                run 2 copy, no context ................... legacy probe A
                run 3 copy, no context ................... legacy probe B  -> volatile set
                run 4 copy, with context ................. shadow payload  -> compare(2,4)
                invariance -> provenance -> telemetry -> metrics -> breaker
  -> returns run 1, always
```

**The property that matters most:** in SHADOW the customer receives the output of a run the governed
resolver never touched. Shadow invisibility is therefore *structural*, not a conclusion the
comparison happens to support. The comparison still runs — measuring the gap is the whole point of a
shadow — but it no longer guards the customer.

Runs 2–4 are all copies so that copy artifacts (a JSON copy drops functions and class references)
appear identically on both sides and cancel out of the comparison.

## Registered commands

```
npm run test:kg4d-orchestration              # 151/151  pure
npm run test:kg4d-default-off                # 119/119  reachability + inertness + inventory
npm run test:kg4d-db-ownership-blackbox      #  19/19   OWNS 3 disposable databases
npm run test:kg4d-integration-e2e            #  42/42   real HTTP + real DB rows
npm run run:kg4d-customer-capture            #          capture harness
npm run compare:kg4d-customer-capture        #          empirical-volatility comparison
```

`backend/package.json`: **+6 entries**, all prior entries preserved.

## Results

| Phase | Result |
|---|---|
| 1 — request-path trace | one seam identified: `classify()` after analysis, before serialization |
| 2 — authorization wired | server-derived only; 10 body forgeries + 3 header forgeries rejected |
| 3 — LEGACY invariance | **8/8 identical** vs a true pre-integration baseline; 0 governed-key leaks |
| 4 — shadow execution | 32 real v2 events over 9 analyses, genuine mismatch distribution |
| 5 — invariance enforcement | 10 injected mutations all detected; customer still gets legacy payload |
| 6 — provenance in real rows | analysis and finding `knowledgeReleaseId` **NULL**, with an active release and 35 approvals present |
| 7 — telemetry | 0 fields outside the v2 allowlist; **0 of 14** privacy canaries in real events |
| 8 — telemetry fail-open | sink throw, timeout, serialization failure, shadow-branch throw: customer unaffected |
| 9 — metrics | eligible/executed/skipped exact; no customer identity in any label |
| 10 — circuit breaker | latches on a hard invariant; next eligible request runs LEGACY; no auto-reset |
| 11 — kill switch | real server, fully-eligible principal: HTTP 201, **0 shadow events**, no governed keys |
| 13 — HTTP authorization matrix | 42/42 |
| 14 — Stage-1 cohort | eligible vs non-eligible: **8/8 identical**, no eligibility bleed |
| 15 — browser (mandatory) | **128/128**, 4 views × reload, real Chromium, 43 forbidden terms, 16 screenshots |
| 18 — performance | 0.688 ms mean per comparison; 3.56 events/analysis; **0 duplicate event keys** |
| 19 — DB ownership black-box | **19/19**, independent verifier, sentinel digests unchanged |
| 20 — mutating-suite inventory | 14 suites classified; 5 gaps closed; **0 unprotected** |
| 22 — default-off authority | **119/119** — reachability AND inertness |

Real-path telemetry, every event: `customerOutputUnchanged: true`, `shadowProvenanceNull: true`,
`outputInvarianceVerdict: INVARIANT`, `stage: STAGE_1_SINGLE_ACCOUNT`,
`eligibilitySource: ACCOUNT_ALLOWLIST`. Severity: 19 INFORMATIONAL, 13 REVIEW, **0 BLOCKING**.
Mismatch: 11 EXACT_MATCH, 8 GOVERNED_MISSING, 7 APPLICABILITY_DIFFERENCE, 6 GRANULARITY_DIFFERENCE.

## Four defects this slice found in its own work

Every one was caught by a real run rather than by inspection, and three were caught specifically by a
non-vacuity floor.

1. **`structuredClone` threw `DataCloneError` on every classify request.** The analysis result carries
   a class reference (`ApprovedKnowledgeRegistryValidator`). The first integration cloned the result
   on every pipeline invocation and turned the entire customer path into an **HTTP 500**. Found by
   the Phase 3 real-HTTP baseline — a helper test would never have seen it. Fixed by running the
   customer invocation on the original object and copying only for the comparison runs.

2. **The first "baseline" was a degraded server.** The scratch pre-integration copy contained only
   `src` and `scripts`, so `../safescope-data` resolved to nothing and the intelligence orchestrator
   fell back to a degraded advisory response. The comparison reported ~1000 differing paths per
   case. Diagnosed by testing whether the baseline server was stable across a restart (it was, 8/8)
   before blaming the integration. Fixed by rebuilding the scratch as a repo-shaped copy.

3. **The browser pass rendered the login screen, and 80 assertions passed anyway.** The harness
   guessed `token`/`authToken`/`accessToken`; the app reads `sentinel_auth_token`. Both accounts
   were shown the same empty page, so every "the two accounts are identical" check agreed. **Only
   the non-vacuity floor caught it.**

4. **Then it rendered a 404, and the assertions passed again.** `/inspections/<id>` is not a route;
   the workspace selects its inspection from `sentinel_selected_inspection_context`. Same failure
   shape, same detector. The floor was tightened from "at least one view rendered citations" to
   per-capture, plus explicit not-a-login-screen and not-a-404 checks.

> **The lesson, restated because this is the third slice to learn it.** An equality oracle over two
> broken observations reports perfect agreement. KG-4B's throttled corpus run compared two HTTP
> 429s; KG-4C's ownership suite asserted the defective behaviour was correct; KG-4D's browser pass
> compared two empty pages — twice. Every comparison needs a floor that fails when the instrument
> is measuring nothing, and the floor has to be per-observation, not per-run.

## Count deltas, explained

| Suite | Before | After | Why |
|---|---|---|---|
| `test:kg4a-default-off` | 51/51 | 51/51 | One assertion's ALLOWLIST was extended, not relaxed. KG-4A permitted customer paths to import only `governed-cutover-context` and `cutover-mode`. KG-4D adds three legitimate imports: the orchestration boundary and the two persistence hooks. The property — nothing else may be imported directly — is unchanged and still fails if violated. |
| `test:governed-corpus-matrix` · `test:reviewer-approval` · `test:standards-backing-contract` · `test:release-integrity-and-approval` · `test:kg3d-corpus-remediation` | unchanged scores | unchanged scores | Ownership guard added ahead of the first mutation; no assertion touched. They now require `KG_TEST_DB_INITIALIZE_OWNERSHIP` naming their database. |

Everything else reproduced its recorded baseline exactly.

## Production files changed

| File | Change |
|---|---|
| `standards/cutover/shadow-request-orchestration.ts` *(new)* | the one orchestration boundary |
| `standards/cutover/shadow-operational-metrics.ts` | `ShadowMetricsRegistry` + the process registry |
| `safescope-v2/safescope-v2.controller.ts` | pipeline extracted to a closure; one orchestration call |
| `inspection/inspection.service.ts` | SHADOW provenance gate on the real persistence path |

## Known caveats carried forward

* **Kill switch operational bound.** The env path takes effect on the next eligible request within a
  process that sees the new value; on a platform where environment changes require a restart, the
  kill switch requires that restart. Only the breaker's in-process latch is immediate. Unchanged
  from KG-4C and still stated honestly.
* **SHADOW costs four pipeline executions per analysis** (one customer + three comparison). Paid only
  by explicitly allowlisted principals; a LEGACY request runs the pipeline exactly once.
* **The `test_kg4b_shadow_20260820` ownership marker** added during the KG-4C incident restoration
  remains, and now protects that corpus explicitly.

## Recommended next action

**Do not enable production SHADOW yet.** The remaining gate is operational, not architectural: a
human with the authority to decide must (1) confirm the platform's log pipeline is collecting and
retaining the v2 events, (2) name the single internal Stage-1 account, and (3) set the four locks
in one deliberate change, following `kg-4c/PRODUCTION_SHADOW_RUNBOOK.md`. The technical
prerequisites are met and verified; the authorization is a decision, not a task.
