# EXPERT HAZLENZ — Prompt v6 Bounded Hosted Hazard-Actuality Confirmation

Frozen measurement of the §113/D-125 accepted local prompt-v6 hazard-actuality repair, against the
real, unmodified `AnthropicExpertProvider` (Claude Sonnet 5). No prompt/schema/normalization change
made during or because of this run; nothing discovered was repaired. Decision log: D-126.
Blueprint: §114.

## 1. Exact terminal

```
EXPERT_HAZLENZ_V6_HAZARD_ACTUALITY_REPAIR_FAILED -- HOSTED_OVERROUTING_REMAINS
```

Terminal B: targeted `R6`/`U-A` over-routing remains, while **every** recall control survived.

## 2. Git state

- HEAD: `37a5d1b50abe836eb19dd24ee18ad10557bda131` (unchanged, as expected)
- Branch: `main`; `origin/main`: `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`
- Nothing committed, pushed, tagged, or deployed.

## 3. Files changed

**Added:** `backend/scripts/probe-expert-hosted-v6-hazard-actuality-confirmation.ts` (probe-only, permanent adapter, no bypass); this verification directory.
**Modified:** `docs/INSITE_CURRENT_STATE.json`, `docs/INSITE_ENGINEERING_BLUEPRINT.md` (§114 + D-126).
**Expert-core / production:** ZERO changes. Prompt v6 frozen throughout.

## 4. Provider/model/prompt/contract

`anthropic` / `claude-sonnet-5` (responded identity confirmed `claude-sonnet-5` on all 9) / `hazlenz.expert.prompt.v6` (system prompt sha256 `b58225b4d4fc8154fed66f5d81696bf4b9319300b0f2f0e4f2d97a66f2a981d4`) / `hazlenz.expert.analysis.v2`. Thinking disabled, max output 8000, P2 deterministic control ABSENT.

## 5. Calls planned/attempted/completed

9 planned (7 primary + 2 optional), 9 attempted, **9 completed clean**, 0 transport failures, 0 retries. No tenth call.

## 6. Projected worst-case spend

**$0.8587** for all 9 calls, computed from the real `buildAnthropicRequestBody` bodies before any call. Ceiling $3.00 → **SPEND GATE PASS**.

## 7. Actual spend

**$0.284080**

## 8. Input/output tokens

Input **82,470** / output **11,914**.

## 9. Latency

p50 **13,231 ms**, max **21,808 ms** (call 9, R4). Per-call latency recorded in `results/v6-confirmation-summary.json`.

## 10. R6 repetition 1

`HTTP 200`, 13,231 ms, in 9,143 / out 1,132, $0.0296, `VALID`, outcome `ANALYZED`. cand=1 clar=2 ins=0 dis=0.

- **Candidate** `machine_guarding` / `ACTIVE`: *"Guard removal creates a machine guarding gap at the point of operation. Although lockout/tagout is controlled per the deterministic finding, the guard-removed condition is a separate physical hazard exposure that exists for the duration the guard is off, independent of the energy control status."*
- **Clarification 1**: *"Is work being performed inside the guarded area now, and will the guard be reinstalled before the lockout is removed and the press re-energized?"*
- **Clarification 2**: *"Are only authorized employees performing work inside the guard opening while the lockout is in effect?"*

Score: `MACHINE_GUARDING_CANDIDATE_PRESENT=true`, `REINSTATEMENT_TIMING_CLARIFICATION_PRESENT=true`, `REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT=true`, `OTHER_UNSUPPORTED_TYPED_CONTENT=false`, **clean=false**.

## 11. R6 repetition 2

`HTTP 200`, 11,875 ms, in 9,143 / out 1,046, $0.0287, `VALID`, `ANALYZED`. cand=1 clar=2 ins=0 dis=0.

- **Candidate** `machine_guarding` / `ACTIVE`: *"With the guard removed, the machine's point of operation or moving parts are currently unguarded even though lockout/tagout is in place. Guarding and energy control are distinct hazard families - the guard removal is a current physical exposure to anyone who could contact the machine, separate from the isolation status of the stored energy."*
- **Clarification 1**: *"Is the guard still off the press, and if so, is the work area barricaded or is access otherwise restricted while it remains removed?"*
- **Clarification 2**: *"What task is being performed with the guard removed, and is any other machine in the area still energized nearby?"*

Score: all three named patterns `true`, `OTHER_UNSUPPORTED_TYPED_CONTENT=true`, **clean=false**.

## 12. R6 repetition 3

`HTTP 200`, 13,075 ms, in 9,143 / out 1,179, $0.0301, `VALID`, `ANALYZED`. cand=1 clar=2 ins=0 dis=0.

- **Candidate** `machine_guarding` / `ACTIVE`: *"A removed guard is a current physical exposure at the point of operation, independent of whether the energy source is isolated. If the guard remains off, personnel working at the machine face an exposure to any residual mechanical hazard (e.g., gravity-fed components, unexpected motion) not addressed by electrical/stored-energy lockout alone."*
- **Clarification 1**: *"Has the guard been reinstalled, or is work still ongoing with the guard off and lockout still in place?"*
- **Clarification 2**: *"What task is being performed now that the guard is removed, and is anyone currently positioned at the point of operation?"*

Score: `MACHINE_GUARDING_CANDIDATE_PRESENT=true`, `REINSTATEMENT_TIMING_CLARIFICATION_PRESENT=true`, `REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT=true`, `OTHER_UNSUPPORTED_TYPED_CONTENT=false`, **clean=false**.

## 13. R6 aggregate

**`R6_ALL_CLEAN = FALSE`, 0/3 clean.** The primary hard gate FAILED.

The defect is not merely persisting — it is now stated *more explicitly* than under v5. Rep 2 says outright: *"Guarding and energy control are **distinct hazard families** — the guard removal is a current physical exposure."* That is the exact `HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_CURRENT_EXPOSURE_INDEPENDENCE` reasoning §113's new prompt section was written to interdict, restated in the section's own vocabulary and then acted on anyway. Rep 3 goes further and supplies a *mechanism* the observation never states ("gravity-fed components, unexpected motion... not addressed by electrical/stored-energy lockout alone"), which is a more sophisticated version of the same move: inventing a residual hazard pathway to justify `ACTIVE`, rather than pointing at a stated current fact.

**Comparison across the three hosted measurements of this fixture:**

| | v4 (§110) | v5 (§112) | v6 (this run) |
|---|---|---|---|
| R6 clean | 0/3 | 0/3 | **0/3** |
| `machine_guarding` candidate | 3/3 | 3/3 | **3/3** |
| reinstatement/re-energization clarification | 3/3 | 3/3 | **3/3** |
| collections over-routed | 2 of 4 | 2 of 4 | **2 of 4** |

Three prompt versions and two dedicated repair phases have not moved this fixture on the hosted model.

## 14. U-A — controlled ancillary condition

**`U_A_HAZARD_ACTUALITY_CONTROL = FAIL`.** `HTTP 200`, 9,695 ms, `VALID`, `ANALYZED`. cand=**0** clar=**2** ins=0 dis=0. Routing: `clarification`.

The candidate half PASSED — the model did **not** promote the removed dead-front cover into a current `electrical` hazard, and its own summary correctly reads *"The observation describes a well-controlled electrical task... No new current [hazard]"*. That is real, measurable progress on the candidate axis for a fixture in a different hazard family than R6.

The clarification half FAILED, on one specific question:

> *"Was the lockout applied using a documented lockout/tagout procedure with a lock and tag affixed by the electrician performing the work, **or only verified with a meter**?"*

The observation states the circuit *"was locked out and tested with a meter, confirmed at zero voltage, and a second qualified electrician independently verified the zero-energy state."* The question re-litigates a step the text reports as done — the precise failure mode v6's prompt names and forbids in as many words (*"neither is a question that doubts whether a step the observation already reports as done (locked out, tested, verified, confirmed) was done — treat a stated step as done, the same as any other stated fact"*). The instruction was read and not followed.

(The second U-A clarification — whether adjacent live parts are exposed inside the same enclosure with the cover off — is defensible on its face and is **not** what fails this gate.)

## 15. U-B — stopped but not isolated (HARD recall gate)

**`U_B_CURRENT_HAZARD_RECALL = PASS`**, candidate survived. `HTTP 200`, 12,911 ms, `VALID`. cand=1 clar=1 ins=1. Routing: `candidate+clarification+insight`.

- **Candidate** `lockout_tagout` / `ACTIVE`: *"With the guard removed and the start button still functional and no energy control applied, the conveyor could be started unexpectedly, exposing anyone near the exposed drive components to a struck-by/entanglement hazard."*

The model correctly refused to treat "merely stopped" as equivalent to verified isolation — the explicit trap this gate exists to catch. Strong pass.

## 16. U-C — incomplete control, and exact collection routing

**`U_C_DANGER_PRESERVED = PASS`.** Routing: **`candidate+clarification+insight`** (cand=1, clar=3, ins=1). Not silence.

- **Candidate** `machine_guarding` / `ACTIVE`: unguarded point-of-operation exposure given the **unbled** pneumatic energy still in the cylinder.
- **Clarifications** include *"What is the estimated or measured residual pressure in the pneumatic supply to the press cylinder right now?"* and *"...or was electrical lockout mistakenly treated as complete isolation?"*

Note this is **stronger** than the locally-measured behavior: §113 disclosed that locally U-C routed through clarification only (candidate 0/10). On the hosted model it routes through candidate **and** clarification **and** insight. The locally-disclosed routing residual did **not** transfer — it resolves in the safer direction here.

## 17. U-F — legitimate future-transition clarification (HARD gate)

**`U_F_CLARIFICATION_PRESERVED = PASS`.** cand=2 clar=2 ins=1. Routing: `candidate+clarification+insight`.

- **Clarification 1**: *"Is the area exhaust fan currently running?"* — exactly the load-bearing present-decision question.
- **Clarification 2**: *"Will the crew proceed with battery reconnection before fan status is confirmed?"*
- Two supporting candidates (`chemical_exposure`, `electrical`), both correctly marked `UNKNOWN` rather than `ACTIVE` — appropriate conditional-state discipline.

The repair did **not** over-generalize into suppressing genuine, decision-critical future-transition reasoning. Strong pass.

## 18. T5 — optional recall/routing spot-check

**`T5_DANGER_REPRESENTED = PASS`.** cand=1 clar=2 ins=1. Routing: `candidate+clarification+insight`. Not silence.

- **Candidate** `machine_guarding` / `ACTIVE`: the shear *"is not de-energized or locked out, so it remains operable and could be cycled with the point-of-operation exposed, creating an immediate amputation/crush risk if actuated."*

**The locally-disclosed T5 routing residual does NOT transfer to Sonnet.** §113 disclosed T5 routing through clarification only (candidate 0/10) on the local model, attributed to three local-only grounding/quoting artifacts. On the hosted model T5 produces a full `ACTIVE` candidate plus clarifications plus an insight. That attribution is now confirmed by direct hosted measurement, not merely inferred.

## 19. R4 — optional candidate-survival spot-check

**`R4_HOSTED_CANDIDATE_SURVIVAL = PASS`.** cand=2 clar=4 ins=1, out 2,159 tokens. Candidates: `confined_space` / `ACTIVE` and `chemical_exposure` / `ACTIVE`. Consistent with §110's and §112's R4 results; no candidate-survival regression from v6.

## 20. Routing opportunities/hits/misses/over-routing

`opportunities=18  hits=11  misses=0  overRouted=7`

**Zero misses** — no `REQUIRED` collection came back empty anywhere in the matrix. All 7 over-routings are on the two FORBIDDEN-expectation fixtures: R6 (2 collections × 3 reps = 6) and U-A (1 collection = clarifications).

## 21. Explanation-only losses

**0.**

## 22. Grounding opportunities

**10** (one per emitted candidate across all 9 calls).

## 23. Quotes emitted

**10.**

## 24. Exactly bound

**10 / 10.**

## 25. Unbindable / fabricated

**0 / 0.**

## 26. EVIDENCE_OUT_OF_BOUNDS

**0.**

## 27. Item / analysis rejection counts

Item-level rejections: **0.** Analysis-level rejections: **0.** All 9 responses normalized `VALID` with `layerStatus: PRESENT`.

## 28. Malformed responses

**0.**

## 29. Outcome/content inconsistencies

**0.**

## 30. New material defects

**None.** The only defect measured is the already-known R6/U-A over-routing class. No new, independent behavioral defect appeared on any of the 9 calls. Grounding, boundary, transport, and outcome consistency are all perfect — the cleanest hosted evidence profile of the programme to date.

## 31. Protected post-run regressions

All 14 suites re-run fresh, identical to §108-§113's baseline, zero deltas:

```
expert-contract-foundation      56/0     l32i-clarification-carrier      61/0
expert-routing-contract         58/0     l32j-carrier-activation         37/0
expert-grounding-contract       40/0     hazlenz-core                    PASS
expert-anthropic-adapter-repair 30/0     hazlenz-precision               PASS (0 dangerous, 0 life-critical)
expert-authority-merge          51/0     hazlenz-level1-recall           PASS (17 checks)
expert-provider-failure        131/0     hazlenz-actionable-coverage     PASS (17 checks)
expert-nocall-harness          141/0     backend tsc --noEmit            exit 0
```

## 32. Confinement

See `CONFINEMENT.txt`. No controller/service/module reference, no frontend reference, +1 hosted-adapter importer (this phase's own probe), **zero** Expert-core/production files changed, prompt v6 frozen throughout, evidence/grounding architecture untouched.

## 33. Production/customer mutation

**None.**

## 34. Provider-validation status

`EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` (unchanged — the primary gate failed, so validation cannot advance).

## 35. Customer-activation status

`EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE` (unchanged).

## 36. LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN status

`TRUE` (unchanged as a *local* debt). This run does, however, objectively narrow its **scope**: 10/10 quotes exactly bound, 0 unbindable, 0 `EVIDENCE_OUT_OF_BOUNDS`, 0 analysis-level rejections on the hosted model — and specifically, the T5 and U-C grounding/routing residuals §113 attributed to local-only artifacts are now *confirmed* not to transfer. The debt remains open as a local-provider fact; it is now measured, not assumed, to be local-only.

## 37. Should the 17-measure evaluation cohort now be separately considered?

**No.** Terminal B does not authorize it, and the measured result forecloses it independently: the cohort requires a validated provider, and provider validation cannot proceed while the fixture this programme exists to fix fails 0/3 on the real target model for the third consecutive measurement.

## 38. Exact next recommended operation

**A strategy decision, not another prompt iteration.** This run makes the case against continuing the current approach on evidence rather than intuition:

- Three prompt versions (v4, v5, v6) and two full repair phases have produced **no movement** on hosted R6: 0/3, 0/3, 0/3, with the same candidate and the same reinstatement clarification every time.
- The local instrument reached a **perfect 350/350** on v6 and predicted none of this. The local 30B model and Sonnet 5 diverge structurally on exactly this reasoning pattern, so local acceptance is no longer evidence about hosted behavior for this defect class — and every further local iteration costs real time to produce a signal now known not to transfer.
- Sonnet 5 is not ignoring the instruction; it is **disagreeing** with it. Rep 2 restates the rule's own framing ("distinct hazard families") and then proceeds anyway, and rep 3 constructs a physical mechanism (gravity-fed components, unexpected motion) to justify the candidate. That is a considered safety judgment, not a formatting slip — and it is, on its own terms, a defensible one that a human safety professional might also make.

Options for the product owner to decide between (none authorized here):

1. **Re-examine the R6 expectation itself.** The fixture asserts that a removed guard under verified LOTO must produce *nothing*. Sonnet 5 has now argued three times, in three different ways, that the guard-off condition warrants a low-confidence advisory candidate. It is worth deciding whether the fixture or the model is right before spending more on making the model comply. Note the layer is advisory and additive — a `MODERATE`-confidence candidate with `requiresUserConfirmation: true` beside a correct deterministic finding may be acceptable product behavior even if it fails a FORBIDDEN expectation written before any hosted evidence existed.
2. **Move enforcement from the prompt to the boundary.** Every prompt attempt has been a request; `expert-normalization.ts` is where refusals actually bind. A narrowly-scoped, independently-authorized boundary rule would be enforceable in a way instructions demonstrably are not — but this touches protected architecture and needs its own authorization and its own safety analysis.
3. **Accept the current state as the product position** and record R6 as a known, bounded, non-dangerous over-routing on an advisory layer, with the recall evidence from this run (U-B, U-C, U-F, T5, R4 all passing, 0 misses, perfect grounding) as the offsetting fact.

Whichever is chosen, **the 17-measure evaluation cohort remains BLOCKED.**

---

**Required state confirmed:** `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`, `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`, `LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN = TRUE`. 17-measure cohort unauthorized. 9 hosted calls, $0.284080 spent. Nothing committed, pushed, tagged, or deployed. Nothing repaired.
