# L3 RUN-2 ACCEPTANCE FAILURE — ROOT-CAUSE CONSOLIDATION

**Zero provider calls. `$0.00`.** Derived entirely from evidence Run 2 already produced.
**The frozen acceptance result is not reinterpreted:** `L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`,
`SCORABLE = TRUE`, `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL` — unchanged, and nothing below
contradicts it.

The ledger **reproduces the frozen scorer exactly** on every gate (G1 1/1 · G2 4/4 · G3 13/13 ·
G4 4/4 · G5 1/1 · G6 1/1 · G7 0/0 · G8 0/0 · G9 14/14 · G10 0/0). It fails closed and refuses to
emit a ledger on any mismatch.

## Two structural facts that constrain every attribution — proven, not assumed

**1. The scored tier is the VALIDATED tier; the binder cannot reach the scorer.**
Every scorer-visible field derives from the deterministic validator (gate declaration §6). The
semantic binder is recorded separately per `D-58` and never merged. Measured: the scored candidate
count equals the **validated** tier on **93/93** rows and equals the **bound** tier on only
**86/93**; the binder rejected or demoted on **4** rows and the scored fields did not move with it.
**Layer `E. BINDER` is structurally excluded as a root cause — it cannot reach, not merely
"unlikely".**

**2. The validator is byte-frozen (`942ac7cc`) and deterministic.**
Both processes ran it over identical frozen input. Therefore **wherever A and B disagree, the
proposal differed** — no pipeline stage can manufacture divergence.

## Attribution — 30 distinct failing rows

| layer | rows |
|---|---|
| `A. PROVIDER_REASONING` (cross-process non-determinism) | **11** |
| `B. PROVIDER_STATE_RESOLUTION` (false ACTIVE) | **4** |
| `C. PROVIDER_CLARIFICATION_DECISION` (under- and over-asking) | **14** |
| `D. PROVIDER_EVIDENCE_SELECTION` | **1** |
| `E. BINDER` · `F. VALIDATOR` · `G. RESULT_MAPPING` · `H. SCORER` · `I. CONTRACT` | **0** |
| `J. INDETERMINATE` | **0** |

**Provider-origin 30 / 30. Pipeline-origin 0 / 30. Indeterminate 0 / 30.**

The validator rejecting genuinely malformed model output is **the validator working, not a validator
defect** — and the reverse test also holds: no provider error was attributed to the binder merely
because the binder later rejected it (the binder rejected on 4 rows and none of those rejections
reached a gate).

---

# The four root causes

## `RC-1` — CLARIFICATION CALIBRATION IS WRONG IN BOTH DIRECTIONS `DETERMINISTIC`

| | |
|---|---|
| gates | **G3** (13 misses of 30) · **G2** (4 imprecise of 21 raised) |
| rows | **17** (3 overlap `RC-2`) |
| layer | `C. PROVIDER_CLARIFICATION_DECISION` |
| reproducible | **13/13 G3 misses fail identically in process B** — not sampling noise |
| severity | **HIGH** — G3 is the largest substantive deficit in the run |

The model raised **21** clarifications where the frozen truth owes **30**. Of the 21, **17 landed on
rows that owed one** and **4 landed on rows that did not**. So it simultaneously **under-asks**
(13 missed) and **over-asks** (4 spurious). This is a calibration failure, not a capability absence.

**The carrier mechanism is NOT the cause, and this is measured rather than argued.** On all 13 G3
misses the model expressed **no clarification in either carrier** — candidate-borne `false` and
proposal-level count `0` on every one. **Nothing existed to be dropped downstream.** Only 1 of the 13
had zero validated candidates, so `D-56`'s
`CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE` mechanism cannot explain the other 12 either.
`D-57`'s proposal-level carrier exists and was available on every row; **the model used it zero
times out of 21** — consistent with `D-62`, which recorded the same zero usage on both prior
providers.

**The over-asking concentrates on one authored family:** 3 of the 4 G2 violations are `F4`
(`DECIDED_NON_ACTIVE`, truth `UNKNOWN`), where the model asserted `INSUFFICIENT_EVIDENCE` and
attached a question to it. The 4th is an independent gauntlet row.

**Known before Run 2?** **No — and this is the important part.** `D-62` recorded clarification recall
at **5/5 (100%) with 100% precision** for both prior providers. That was measured on a **24-scenario
locked cohort containing only 5 clarification rows**. Run 2 is the **first adequately powered
measurement** — 30 `DEN_A` rows, 24 of them independent — and it returns **56.67%**.
**This is not a regression. It is a first-time measurement at scale that contradicts an
under-powered prior estimate.** `D-59`'s refusal to activate the carrier is **not overturned**: the
Run-2 misses had no question to carry, so a second carrier would have changed nothing.

## `RC-2` — ACTIVE ASSERTED WHERE TRUTH IS UNDECIDED `DETERMINISTIC`

| | |
|---|---|
| gates | **G4** (4 false ACTIVE of 21) · contributes 3 of `RC-1`'s G3 misses |
| rows | **4**, all `AUTHORED_CONTROL` |
| layer | `B. PROVIDER_STATE_RESOLUTION` |
| reproducible | **identical in process B on all 4** |
| severity | **HIGH** — a hard-zero safety gate, and `activeProhibited = true` on every one |

All four rows carry frozen truth `conditionState = INSUFFICIENT_EVIDENCE` with
`activeProhibited = true`, and the model asserted **`ACTIVE`**. **`F6` dominates: 3 of 4**
(`H2B-086/087/088`); the 4th is `F3` (`H2B-079`).

**The same mechanism causes multiple failures, and it couples to `RC-1`:** on the three `F6` rows the
model asserted `ACTIVE` **and raised no clarification** — so one behaviour trips **both** G4 and G3.
On the `F3` row it asserted `ACTIVE` **and did** raise a clarification, so that one trips G4 only.

**Neither downstream stage removed it.** The validator returned `VALID` and the **binder bound the
`ACTIVE` state on all four** (`boundStates` contains `ACTIVE`, zero binder rejections). Neither stage
can be the origin.

## `RC-3` — CROSS-PROCESS NON-DETERMINISM, WITH NO DETERMINISM CONTROL AVAILABLE

| | |
|---|---|
| gates | **G9** (14 divergent of 93 — reproducibility **84.95%**) |
| rows | **14** (11 fail G9 only) |
| layer | `A. PROVIDER_REASONING` |
| severity | **HIGH** — hard gate at 100% |

Differing scorer-visible fields: **`assertedState` 12** · **hazard recognition 10** ·
**clarification 4** (rows may differ in more than one). Exact combinations:
`hazardRecognition+assertedState` 9 · `clarification` 2 · `assertedState` 1 ·
`assertedState+clarification` 1 · all three 1.

**Origin is provably the provider.** On **9 of 14** both processes validated `VALID` and the scored
fields still differ — identical input through a deterministic validator, so the proposal differed. On
the other **5** the validator rejected on one side only, which a deterministic validator cannot do
for identical input. **Provider-origin 14/14. Pipeline-origin 0/14.**

**The structural reason is recorded in the frozen shim itself.** `anthropic-ollama-shim.js`
`76d3e039` documents, from measured 400 responses, that `temperature` is **not forwarded**
(deprecated on Claude 4.7+, rejected at non-default) and `seed` has **no Anthropic equivalent**
(`D4`, `D5`). **No determinism control exists on this provider path.** G9 requires **100%**
reproducibility across two isolated processes from a provider whose sampling cannot be pinned.

**A diagnostic observation, explicitly NOT a reclassification:** on **8 of the 14** divergent rows
**neither** process asserted `ACTIVE`; the difference is between emitting a candidate at
`NEGATED`/`CORRECTED`/`INSUFFICIENT_EVIDENCE` and emitting none at all. A and B **agree on whether
`ACTIVE` was asserted on 10 of 14**. The frozen G9 predicate counts `{assertedState, clarification,
hasCandidate}` and pre-registered that as *material*; **it counted correctly and the terminal
stands.** This is recorded because it bears on remediation, **not** to argue the gate should have
counted differently — doing that after seeing the result is precisely the prohibited move.

## `RC-4` — EVIDENCE AND CORRECTIVE-ACTION GROUNDING INSTABILITY

| | |
|---|---|
| gates | **G1** (1) · **G5** (1) · **G6** (1) — all the **same single row** · contributes 5 rows to G9 |
| rows | **5** distinct |
| layer | `D. PROVIDER_EVIDENCE_SELECTION` |
| severity | **MEDIUM-HIGH** — it produced the only high-consequence miss |

**Three of the seven failed gates collapse to one row.** `H2B-004` (independent gauntlet,
`highConsequence`): in **process A** the model emitted an evidence span whose offsets fall outside
the observation → validator `EVIDENCE_OUT_OF_BOUNDS` → `REJECTED_MODEL_OUTPUT` → **zero validated
candidates**. That single rejection produces:

* **G1** — a high-consequence row with no validated candidate is a miss;
* **G5** — the row was owed a hazard, so the rejection is safety-consequential;
* **G6** — `EVIDENCE_OUT_OF_BOUNDS` is in the frozen `NON_RETRYABLE_VALIDATION_REASONS` set;
* **G9** — process **B validated the same row `VALID` with one candidate**.

**A and B did NOT fail for the same reason — only A failed at all.** The defect is therefore
**non-deterministic**, and it is a sub-family of `RC-3`: the same sampling instability, expressed as
a malformed evidence offset rather than a flipped state.

**A related grounding defect, recorded because it bears on remediation:**
`UNGROUNDED_CORRECTIVE_ACTION` fatally rejected **4 further rows** (2 in A, 2 in B), each on one side
only, contributing to G9. That code sits in **neither** `NON_RETRYABLE_VALIDATION_REASONS` nor
`RETRYABLE_VALIDATION_REASONS` nor `NON_BLOCKING_VALIDATION_REASONS`, so it falls through
`validationStateForIssues` to `REJECTED_MODEL_OUTPUT` — **fatal to the proposal, but invisible to
G6**, which is scoped by name to the non-retryable set. **G6 counted correctly under its frozen
definition.** This is recorded as an observation about coverage, not a claim that any gate
miscounted.

---

# Are these one defect or several?

**Several — at least two independent families, and they are largely disjoint at row level.**

| family | root causes | character | rows |
|---|---|---|---|
| **1. Systematic reasoning calibration** | `RC-1`, `RC-2` | **deterministic** — reproduces identically in both processes | 18 distinct |
| **2. Sampling non-determinism** | `RC-3`, `RC-4` | **non-deterministic** — by definition differs between processes | 17 distinct |

They cannot be the same defect: family 1 **reproduces exactly** across two isolated processes, and
family 2 **exists only because** outputs do not reproduce. Overlap is small — of the 14 G9 divergent
rows, **11 fail G9 only**; just 3 also fail another gate (1 × G1/G5/G6, 1 × G2, 1 × G3).

Fixing all of family 2 would leave **G3, G4 and most of G2 untouched**. Fixing all of family 1 would
leave **G9 at roughly its current value**.

---

# Remediation decision matrix — classification only, nothing implemented

| root cause | classification | evidence for the classification |
|---|---|---|
| **`RC-1`** clarification calibration | **`PROVIDER_CAPABILITY_LIMIT`**, with an `ARCHITECTURAL_REMEDIATION_CANDIDATE` component | The failure is **deterministic** (13/13 reproduce), so it is a stable property of the model under this frozen prompt — not noise a retry could fix. It is **not** a carrier defect: no question existed in either carrier on any of the 13. The prompt, schema and validator are frozen and cannot be changed under any current authorization, and `D-59` already **measured** that activating the second carrier *reduced* high-consequence recall 12/13 → 9/13. So no local fix is evidenced, and any prompt-level work would be an architectural change requiring its own authorization and its own non-holdout validation. |
| **`RC-2`** ACTIVE on undecided truth | **`PROVIDER_CAPABILITY_LIMIT`** | Deterministic across both processes; validator **accepted** and binder **bound** the `ACTIVE` in all four. Nothing downstream suppressed it, so there is no downstream lever. `F6` concentration (3 of 4) suggests a family-specific weakness, but **n = 4 is too small to establish a family effect** and this phase will not claim one. |
| **`RC-3`** cross-process non-determinism | **`PROVIDER_CAPABILITY_LIMIT`** — hard | The frozen shim **measured** that `temperature` is not forwardable and `seed` has no equivalent on this provider (`D4`/`D5`). There is no determinism control to tune. A 100% cross-process gate is not reachable by any local change to code we control. |
| **`RC-4`** evidence/corrective-action grounding | **`INSUFFICIENT_EVIDENCE`** to classify further | Only **1** out-of-bounds occurrence and **4** ungrounded-corrective-action occurrences, each on one side only, across 186 calls. That is a real defect but the sample cannot distinguish a systematic grounding weakness from a low-rate tail of `RC-3`. **No mechanism is asserted.** |
| **`RC-1` sub-observation:** proposal-level carrier used 0/21 | **`INSUFFICIENT_EVIDENCE`** | Consistent with `D-62`'s zero usage on two other providers, which points to the prompt rather than the provider — but Run 2 varied neither, so it cannot separate them. |

**No root cause is classified `LOCAL_REMEDIATION_CANDIDATE`.** Nothing in the evidence identifies a
defect in code this programme controls whose repair would move a failed gate. **No fix is proposed
merely because one seems obvious.**

**No root cause is classified `EVALUATION_CONTRACT_DEFECT`.** The G9 candidate-versus-null
observation and the G6 coverage observation are recorded above, but both gates counted correctly
under definitions frozen and hashed **before the corpus was opened**. Reclassifying either after
seeing the result is exactly what the pre-registered contract exists to prevent, and this phase
does not do it.
