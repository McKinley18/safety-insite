# EXPERT HAZLENZ — Prompt v5 Bounded Hosted Temporal-State Confirmation

Frozen measurement of the §111/D-123 accepted local prompt-v5 temporal-state repair, against the
real, unmodified `AnthropicExpertProvider` (Claude Sonnet 5). No prompt/schema/normalization change
made during or because of this run. Decision log: D-124. Blueprint: §112.

## 1. Exact terminal

```
EXPERT_HAZLENZ_V5_TEMPORAL_STATE_REPAIR_FAILED -- HOSTED_OVERROUTING_REMAINS
```

(Terminal B from the authorization's decision gate: R6 still exhibits the repaired temporal-state
overreach on the real hosted model, while every recall/uncertainty control remained intact.)

## 2. Git state

- Local HEAD: `37a5d1b50abe836eb19dd24ee18ad10557bda131` (unchanged)
- `origin/main`: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`
- Nothing committed, pushed, tagged, or deployed.

## 3. Files changed

**Added:**
- `backend/scripts/probe-expert-hosted-v5-temporal-state-confirmation.ts` (probe-only, real permanent adapter path, no diagnostic bypass)
- `docs/INSITE_CURRENT_STATE.json` — new `expertHazlenzV5TemporalStateHostedConfirmation2026_08_30` entry
- `docs/INSITE_ENGINEERING_BLUEPRINT.md` — new §112 narrative, D-124 decision-log row

**Modified:** none among Expert-core or production files. This was a frozen measurement — no repair authorized or performed.

## 4. Hosted calls attempted/completed

7 attempted, 7 completed clean (HTTP 200, 0 transport failures).

## 5. Model/prompt/contract

`anthropic` / `claude-sonnet-5` / `hazlenz.expert.prompt.v5` (system prompt sha256 `e4624f8a0e04d34c4628ba4243c39725278086e7d1c35a87ceb148ccf89c82d8`) / `hazlenz.expert.analysis.v2`. Thinking disabled, max output tokens 8000, no temperature/seed control (P2 deterministic control absent, as expected on this transport).

## 6. Tokens

Input 56,284 / output 8,567 across 7 calls.

## 7. Spend

$0.198238 of a $3.00 ceiling (worst-case pre-flight estimate: $0.6524 for all 7 calls, computed from the real request bodies before any call — see `preflight/preflight.json`).

## 8. Latency

p50 11,891ms, max 23,681ms (the R4 spot-check, which also produced the most output).

## 9–11. R6 repetitions 1–3

All three used the SAME structural shape as the §110 defect, with one change and one addition:

- **Rep 1**: 1 candidate (`machine_guarding`, "guard removal is a present physical state that constitutes a machine guarding exposure if any re-energization occurs, or if other workers approach assuming the machine is safe... distinct hazard family from lockout/tagout itself"), 2 clarifications (reinstatement-before-return-to-service; other-workers-in-area exposure).
- **Rep 2**: 1 candidate (same shape, "should be tracked separately for the duration the guard is off"), 2 clarifications (current removal status/duration/barricading; whether a *lock*, not just a tag, was applied — a new re-litigation of an already-answered fact, since the observation states "the supervisor tag applied," not that no lock exists).
- **Rep 3**: 1 candidate (same shape, "should be tracked until the guard is reinstalled and verified"), 2 clarifications (access restriction/barricading; reinstallation-and-function-test before return to service).

Per-rep content score (`RESOLVED_GUARD_CANDIDATE_PRESENT`, `REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT`, `HYPOTHETICAL_REENERGIZATION_CLARIFICATION_PRESENT`, `OTHER_UNSUPPORTED_TYPED_CONTENT`), all 3 reps identical:

```
RESOLVED_GUARD_CANDIDATE_PRESENT               = true   (all 3)
REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT    = false  (all 3)  <- IMPROVED vs §110 (was present in rep 1 of 3 there)
HYPOTHETICAL_REENERGIZATION_CLARIFICATION_PRESENT = true (all 3)
OTHER_UNSUPPORTED_TYPED_CONTENT                = true   (all 3, a NEW second clarification each rep not matching either named pattern)
```

`crossHazardInsights` and `disagreements` stayed empty all 3 reps, as in §110.

## 12. R6 aggregate

`R6_ALL_CLEAN = FALSE` (0/3 clean, not averaged). **The core defect is not resolved on the hosted target model.** The prompt-v5 repair changed *what* the model says (it explicitly reframes "guard removed" as "a distinct hazard family from lockout/tagout itself" needing independent tracking, rather than reasoning generically about "eventual reinstallation") but did not stop it from independently raising a `machine_guarding` candidate and a reinstatement-timing clarification about a condition the observation already reports as safely and verifiably controlled. One genuine improvement is measured: the exact §110 defect of re-asking an already-answered fact ("residual stored energy... beyond what was bled down") did not recur in any of the 3 reps — though rep 2 introduced a different instance of the same underlying move (asking whether a *lock*, not just a tag, was applied, when the observation already describes a completed, second-person-verified isolation).

## 13. T1 result

`T1_RESOLVED_STATE_CLEAN = TRUE`. Outcome `NOTHING_TO_ADD`, all four typed collections empty (0 candidates, 0 clarifications, 0 insights, 0 disagreements). The historical/resolved generalization control — a DIFFERENT hazard family (electrical) and different wording than R6 — passed cleanly. The repair generalizes correctly outside the exact R6 fixture.

## 14. T5 current-positive recall result

`T5_CURRENT_HAZARD_RECALLED = TRUE`. 1 candidate (`lockout_tagout`, correctly noting the missing guard plus the machine's continued cycle capability), 2 clarifications, 1 insight. The exact regression class caught during local prompt iteration (v1 wording suppressing this fixture 5/5→0/5) did NOT reproduce on the hosted model — recall is preserved.

## 15. Genuine current-state clarification result

`CURRENT_STATE_CLARIFICATION_SURVIVED = TRUE` (T3, the remediation-uncertain control). 1 candidate, 3 clarifications, including the load-bearing one: "Has the isolation lock on the feed conveyor been reapplied, and has the machine been re-isolated before any current work began?" — directly targeting the genuine, stated gap ("this walkthrough does not establish whether the lockout was reapplied"). The hard gate for this control is satisfied.

## 16. R4 spot-check result

`R4_HOSTED_CANDIDATE_SURVIVAL = PASS`. 3 candidates (`confined_space`, `chemical_exposure`, `fall_protection`), 4 clarifications, 1 insight — consistent with and stronger than §110's 3/3 `R4_HOSTED_FAILURE_NOT_REPRODUCED` result under v4. No candidate-survival regression from the prompt-v5 change.

## 17. Routing opportunities/hits/misses/over-routing

Not aggregated as a single routing-metric total this phase (the plan mixes `REQUIRED`/`FORBIDDEN`/`OPTIONAL` fixtures with a single call each, not a repeated statistical matrix as in §111's local corpus). Per-fixture: R6 (FORBIDDEN×4, 3 reps) over-routed on `expertHazardCandidates` and `decisionCriticalClarifications` in all 3 reps; T1 (FORBIDDEN×2 scored) clean; T5, T3, R4 all populated their `REQUIRED`/expected collections correctly.

## 18. Explanation-only losses

None observed — every concept the model raised on every fixture landed in a typed collection, not only in free text.

## 19–22. Grounding

Quotes emitted: 8. Exactly bound: 8. Unbindable: 0. Fabricated: 0. `EVIDENCE_OUT_OF_BOUNDS`: 0 occurrences across all 7 calls.

## 23. Analyses lost to evidence failure

0.

## 24. Malformed responses

0. Every one of the 7 calls produced a schema-valid, fully normalizable response (`layerStatus: PRESENT` on all 7).

## 25. Outcome/content inconsistencies

0. Every `outcome` value (6× `ANALYZED`, 1× `NOTHING_TO_ADD` on T1) was consistent with its own typed-collection contents.

## 26. Whether any new material defect appeared

No. The only defect measured is the ALREADY-KNOWN R6 over-routing class, now with one sub-pattern (redundant zero-energy re-litigation) eliminated and the core pattern (an independent "guard removed = current exposure" candidate plus a reinstatement-timing clarification) persisting under new phrasing. No new, independent behavioral defect was found on any of the 7 calls.

## 27. Protected post-run regressions

All 14 suites re-run fresh, identical counts to §108–§111's baseline, zero deltas:

```
expert-contract-foundation      56/0
expert-routing-contract         58/0
expert-grounding-contract       40/0
expert-anthropic-adapter-repair 30/0
expert-authority-merge          51/0
expert-provider-failure        131/0
expert-nocall-harness          141/0
l32i-clarification-carrier      61/0
l32j-carrier-activation         37/0
hazlenz-core                    PASS
hazlenz-precision               PASS (0 dangerous, 0 life-critical omissions)
hazlenz-level1-recall           PASS (17 checks)
hazlenz-actionable-coverage     PASS (17 checks)
backend tsc --noEmit            exit 0
```

## 28. Confinement

See `CONFINEMENT.txt`. No controller/service/module reference, no frontend reference, +1 hosted-adapter importer (this phase's own probe script), zero Expert-core files changed.

## 29. Production/customer mutation

None.

## 30. Provider-validation status

`EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` (unchanged — this run measured a defect that still exists, so validation cannot advance).

## 31. Customer-activation status

`EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE` (unchanged).

## 32. LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN status

`TRUE` (unchanged, still quarantined, not investigated this phase — out of scope for this run entirely).

## 33. Should the 17-measure evaluation cohort now be separately considered?

**No.** Per the authorization's explicit terms, Terminal B does not authorize the cohort, and the cohort was never a candidate outcome of this run regardless of terminal — the measured result (R6 not clean, 0/3) independently forecloses it: the cohort requires a validated provider, and provider validation cannot proceed while the fixture this whole programme exists to fix is still failing on the real target model.

## 34. Exact next recommended operation

A further LOCAL repair iteration targeting the specific residual pattern this hosted run isolated: the model now explicitly frames "guard removed" as "a distinct hazard family from lockout/tagout itself" that must be "tracked... until reinstated and verified" — a more sophisticated restatement of the same forward-reasoning-to-future-transition error, now justified by an assertion (guard-off-ness is its own hazard family, independent of the energy-control state) that the current prompt section does not address. The current-vs-historical rule as written stops the model from inventing a hazard FROM a resolved history; it does not yet stop the model from asserting that an ANCILLARY, currently-true fact (the guard happens to still be physically off) is independently hazard-worthy even while the causally relevant safety state (isolation, verified zero energy) is fully controlled. A follow-on local repair should be built and validated with the existing $0.00 contrastive-corpus instrument (T1–T6, extended if a new contrastive class is needed for "an ancillary true-but-controlled fact vs. a genuinely current hazard") BEFORE any further hosted spend is authorized. The 17-measure evaluation cohort remains BLOCKED.

---

**Required state confirmed:** `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`, `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. The 17-measure evaluation cohort remains unauthorized. 7 hosted calls made, $0.198238 spent, nothing committed, pushed, tagged, or deployed. No repair made during or because of this measurement.
