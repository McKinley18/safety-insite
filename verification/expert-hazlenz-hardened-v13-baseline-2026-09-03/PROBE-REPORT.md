# §152 — Hardened-Instrument Hosted Baseline. v13 Frozen, No Remediation.

**Terminal:**

```
EXPERT_HAZLENZ_HARDENED_V13_BASELINE_FAILED — CLARIFICATION_RECALL_DEFECT_REMAINS
```

**Phase 9 CASE C.** And the reason it is CASE C rather than CASE A is the headline finding:

> ## THE §151 v14 DIAGNOSIS DID NOT SURVIVE ITS OWN FALSIFIER.
>
> `HAZARD_SEVERITY` was selected **0 times in 9 clarifications**. The pre-registered probe row
> `HS-R1` — authored in §151 with *"EXPECTED FAIL under v13"* and *"a silent result FALSIFIES it and
> v14 should not be built"* written into the fixture **before any data existed** — **stayed silent.**
>
> **v14 must not be built.** The defect it was designed to repair did not appear.

And a different defect did: **strict delivered recall is 4 of 7** on the valid denominator.

Bounded baseline: **16 calls, 16 requests, 0 retries, $0.827866 of a $1.6640 enforced ceiling.**
Historical `PROVIDER_INVOCATION_COUNT = 195` unchanged. v13, `analysis.v2` and arbitration
byte-unchanged; **v14 remains unimplemented.**

---

## 1. Run identity and execution facts

```
operation                           hardened-v9-v13-baseline
fixture set / digest                v9 / 434c127c44a8d6d8592c1b6e6c1cd01599428143f44737b19335a3123a7fe194
fixture file sha256                 09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb
prompt / contract                   hazlenz.expert.prompt.v13 / hazlenz.expert.analysis.v2
prompt module sha256                02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa  (= §150)
system-prompt sha256                c4b3162439988e74186c36f75ee1f14875835e1cc832251a8d7365a4b158e3f3  (= §150)
wire-schema sha256                  15e2b80947355954f105f8b34bf8cf00c6c1153a82c2255b9e8151ccd66c4a97
model                               anthropic / claude-sonnet-5      one arm (BASE)
sampling                            temperature / top_p / top_k NOT SENT (removed on this model,
                                    HTTP 400); NO seed parameter exists
reproducibility                     NOT REPRODUCIBLE BY SEED. One replicate. No variance measured.
logical calls / requests            16 / 16        retries 0 (budget ZERO)   suppressed 0
spend                               $0.827866 of an enforced $1.6640 (authorized $2.50)
tokens                              292,688 in / 24,249 out
latency                             13,200 – 38,229 ms
stop COMPLETED                      identityViolation null
disposition                         16 PRESENT, 0 OUTPUT_REJECTED, 0 provider failures
persistence                         16 records, 0 parse problems, 0 completeness problems
mid-run read-back                   HS-A1 read back FROM DISK with 15 calls outstanding
write-once identity                 second write refused, bytes stable
pre-spend gate                      45 / 45 PASS at $0.00
```

**The sampling line is the most important caveat in this report.** One replicate, no seed, no
variance control. Every count below is a single observation.

---

## 2. Instrument integrity — the fixture was not touched

```
set digest  before 434c127c…  after 434c127c…   UNCHANGED
file sha256 before 09195af8…  after 09195af8…   UNCHANGED
linter after execution                          PASS
```

Both are checked because the digest covers the signed rows and the file hash covers everything else.
**No fixture was modified after the first provider request** — which is precisely the failure §151
found four times, and it did not happen here. The budget was declared in the probe script rather than
in the fixture module, so the reviewed material stayed byte-identical from §151 through this run.

---

## 3. PHASE 6 — the falsifier, applied before interpretation

| | |
|---|---|
| `HAZARD_SEVERITY_USAGE_COUNT` | **0** |
| `HAZARD_SEVERITY_USAGE_RATE` | **0.0** of 9 labelled clarifications |
| label usage | `REQUIRED_CONTROL` 6 · `EXPOSURE` 2 · `REGULATORY_INTERPRETATION` 1 |
| `HS-R1`, the pre-registered probe | **SILENT** — the outcome its own fixture declared falsifying |

### 3.1 The trigger was present, and the model routed it correctly

This is not a case of the set failing to offer the opportunity. **`HS-D1`'s emitted question opens
literally *"What is the total aggregate quantity (in gallons/litres)…"*** — the exact surface form
§151 identified as the routing trigger, on the exact structure (aggregation against a supplied
record) that produced §149's `US-B1` failure.

| | §149 `US-B1` (v12) | §152 `HS-D1` (v13) |
|---|---|---|
| question | *"**What is** the maximum intended load posted… and the actual imposed load per m²?"* | *"**What is** the total aggregate quantity… present in the fire area?"* |
| structure | aggregation against a supplied record | aggregation against a supplied record |
| label | **`HAZARD_SEVERITY`** — wrong | **`REGULATORY_INTERPRETATION`** — correct |

**The closest available structural comparison routes correctly.** That is a direct refutation of the
surface-form limb of the §151 mechanism.

### 3.2 And the same prompt produced the defect one operation ago

| § | prompt | HAZARD_SEVERITY | clarifications |
|---|---|---|---|
| 147 | v10 | 2 | — |
| 148 | v11 | **0** | 5 |
| 149 | v12 | 1 | 5 |
| 150 | **v13** | **4** | 7 |
| **152** | **v13** | **0** | **9** |

**§150 and §152 ran the same frozen prompt and produced 4-of-7 and 0-of-9.** Whatever drives the
selection, it is **not v13** — it varies with the material, the sampling, or both.

### 3.3 Verdict

**WEAKENS, strongly — and FALSIFIES the specific pre-registered `HS-R1` prediction.**

Not recorded as a full falsification of the general tendency, for one reason stated plainly: **a
single unreplicated run with no seed control cannot exclude sampling variance**, and §150 produced
4 of 7 under the identical prompt. What is established is that the diagnosis **does not hold as a
reliable property of v13**, and that is enough to answer the question the authorization asked.

> **v14 IS NOT JUSTIFIED. Do not build it.** §151 proposed a repair for a defect that, on the first
> trustworthy instrument, did not occur — and that instrument was designed by §151 itself specifically
> to catch it.

---

## 4. PHASE 4 — REQUIRED, decomposed by mechanism

**7 of 8 rows spoke. Strict delivered recall: 4 of 7 on the valid denominator, 4 of 8 literal.**

| row | form | outcome | mechanism |
|---|---|---|---|
| **HS-A1** | not visible | **EXCLUDED — EXECUTION ANOMALY** | §4.1 |
| **HS-B1** | retained, candidate-shaped | **DISPUTED** | presupposes the imbalance rather than asking it |
| **HS-C1** | observer cannot determine | **RECOVERED** — exact fact, exact label | — |
| **HS-D1** | aggregation against a record | **RECOVERED** — exact fact, exact label | — |
| **HS-E1** | prior event | **RECOVERED** — exact fact, exact label | — |
| **HS-F1** | likely but unestablished | **MISS** | different valid question (§4.2) |
| **HS-G1** | system coverage | **RECOVERED** — second question is the authored fact | — |
| **HS-H1** | worst-case temptation | **MISS** | different valid question — **the one clean model miss** (§4.3) |

```
gap not recognized        0
unsupported settlement    0
retained but not asked    0        (see §7)
reasoned but destroyed    0
different valid question  2        HS-F1, HS-H1
fixture-confounded        1        HS-F1
execution anomaly         1        HS-A1
disputed                  1        HS-B1
```

**None of the failure mechanisms this programme has repaired recurred.** No gap went unrecognized, no
fact was settled without support, nothing was retained-but-not-asked, and nothing was destroyed
downstream. Both misses are substitutions.

### 4.1 HS-A1 — a degenerate response, and the harness could not see it

The provider returned a **literal stub**:

```json
{ "candidateKey": "placeholder", "hazardFamily": "combustible_dust",
  "assertedConditionState": "ACTIVE", "evidenceBasis": "", "reasoning": "" }
```
`expertExplanation.summary` = `"placeholder"`. Zero clarifications, zero uncertainty.

The normalizer behaved correctly — `CANDIDATE_MALFORMED`, candidate dropped — **but the call was
recorded `PRESENT`**, because a malformed item is item-level rather than analysis-fatal. So a
response consisting of the word *"placeholder"* entered the recall denominator as a miss and the
coverage denominator as an uncovered row.

**This is not a clarification defect. It is an execution anomaly, and the harness has no detector for
it.** Recorded exactly, per Phase 3; **not rerun and not substituted**. HS-A1 is excluded from the
recall denominator and reported separately.

*(Two other rows carried a single malformed item among several — `HS-J1` `CANDIDATE_MALFORMED`,
`HS-K1` `EXPLANATION_MALFORMED` — both with substantive output otherwise. Only HS-A1 is wholly
degenerate.)*

### 4.2 HS-F1 — a substitution my own wording invited

Authored fact: whether the lance has a functioning dead-man control. Asked instead: whether the
footpath beneath is closed to pedestrians.

**My observation says the footpath *"is open to pedestrians at the far end"* — which leaves the near
end genuinely ambiguous**, and the model asked about exactly that ambiguity. The question is
contract-valid and decision-critical. **Scored strictly as a miss; recorded as fixture-confounded.**

### 4.3 HS-H1 — the one clean model miss

Authored fact: whether the load was given a cooling hold before the door was opened. The alarm was a
**deliberate distractor**, planted so that its silence would be equally consistent with a healthy
cycle and a dead alarm.

The model asked about **the distractor** — *"Was the over-temperature alarm's failure to sound due to
a normal cycle profile… or due to a fault?"* — and never reached the cooling hold. Its question is
valid, well-reasoned and not an unsupported settlement. But the authored fact, on a row with no
wording ambiguity and no competing selector among the three enumerated, was not asked.

**This is a genuine residual recall defect and it is the reason for CASE C.**

---

## 5. PHASE 4 — FORBIDDEN

**Literal silence: 7 of 8. Adjusted: 7 of 7.**

`HS-J1` `HS-K1` `HS-L1` `HS-N1` `HS-P1` `HS-Q1` `HS-R1` all silent — including the two
non-regression controls (`HS-K1` stated absence, `HS-L1` true deterministic derivation) and the
pre-registered magnitude probe `HS-R1`.

### 5.1 HS-M1 — a fifth fixture defect, and my own signature was false

The model asked: *"Was the internal atmosphere of the tank tested for **toxic air contaminants**
(e.g., hydrogen sulfide), and if so what was the result?"*

The supplied record requires testing for **three** things: *"oxygen content, … flammable gases and
vapours, and … potential toxic air contaminants."* **My observation states two of the three and is
silent on the third** — in an anaerobic digester sludge tank, where hydrogen sulfide is the classic
killer.

My §151 `NO_SIBLING_DECISION_CRITICAL_GAP` signature reads:

> *"I considered toxic contaminants as a sibling gap… the row states testing at three depths with a
> direct-reading instrument and continuous monitoring on the man, so the during-entry limb is closed."*

**Three *depths* is not three *analytes*. The signature is wrong, and I signed it.** The model found
the gap the standard's most important claim was supposed to have closed.

**Class C — GENUINE DECISION-CRITICAL GAP MISLABELLED FORBIDDEN.** Literal score preserved at 7/8;
attributed as a fixture defect with the model vindicated.

> **This is the finding that matters most about the hardening.** The linter cannot check whether a
> signature is *true*, only that it exists and is substantive — which §151 said in terms. **§152 is
> the first demonstration that the gap is real: a signed F3 claim was false, and nothing caught it
> but the model.**

---

## 6. PHASE 5 — the affectedDecision baseline

`LABEL_EXACT_MATCH_ON_REQUIRED_ROWS = 5/8`. Three disagreements, **none of them `HAZARD_SEVERITY`**:

| expected → emitted | count | assessment |
|---|---|---|
| `REQUIRED_CONTROL` → `REQUIRED_CONTROL` | 4 | correct |
| `REGULATORY_INTERPRETATION` → `REGULATORY_INTERPRETATION` | 1 | correct |
| `REQUIRED_CONTROL` → `EXPOSURE` | 1 | `HS-B1` — compound question; **defensible**, the second limb is about who is exposed |
| `APPLICABILITY` → `EXPOSURE` | 1 | `HS-G1` q1 — a *different question* about door use; the label fits that question |
| `APPLICABILITY` → `REQUIRED_CONTROL` | 1 | `HS-G1` q2 — the authored fact; `APPLICABILITY` is better, `REQUIRED_CONTROL` arguable |

**No disagreement is clearly wrong**, and none is destructive: `AFFECTED_DECISION_SURVIVAL = 8/8`,
`LABEL_HAZARD_EXISTENCE_ON_ESTABLISHED_HAZARD_ROWS = 0`, arbitration events 0.

**Compare §146's 3-of-6 and §150's 1-of-4.** On the hardened instrument, label accuracy is 5 of 8
with the remainder defensible — materially better than any previous measurement, and consistent with
the finding that the earlier label results were entangled with defective fixtures.

---

## 7. PHASE 7 — other axes

| readout | value |
|---|---|
| unsupported settlement | **0** — §149's closure holds |
| retained-but-not-asked | **0** — 4 retention signals on REQUIRED rows, none stranded |
| `AFFECTED_DECISION_SURVIVAL` | **8/8 = 1.0** |
| reasoned but destroyed | **0** |
| invalid clarification objects | **0** |
| forbidden-family candidates | **0** of 29 |
| duplicate candidates / over-fragmentation | none observed; `HS-B1` and `HS-M1` each emitted two candidates of one family, both substantively distinct |
| raw linkage attempts / invalid / normalized-valid / stripped | **7 / 0 / 7 / 0**, reconciled **TRUE** |
| accepted invalid linkage | **0** |
| citations input / Expert output / accepted / merged | **0 / 0 / 0 / 0** (4 supplied-record fields redacted; 0 in the captured wire) |
| protected-authority contradictions | **0** |
| true contradictions | **NOT_EXERCISED** — denominator 0, per §150's corrected semantics; never reported as 100% |
| clarifications per call | 0.563 |
| deterministic union coverage | **NOT INTERPRETABLE — see §7.1** |
| protected suites, before and after | **23 / 23 identical, 1,739 assertions** |
| `SOURCE_PROJECT_TSC` | **PASS** |

### 7.1 Union coverage 4/9 is not a coverage result

Three of the four "misses" are instrument artifacts, and the fourth is a family-choice disagreement:

- **`HS-A1`** — the degenerate response (§4.1).
- **`HS-C1`, `HS-E1`** — **the canonical family list I built in §151 is wrong.** The deterministic
  engine emits `guarding_interlocks`, `ground_control`, `slips_trips_falls`, `conveyors`,
  `confined_space`, `material_handling`, `hot_work` — **not** the Expert-side names
  (`machine_guarding`, `confined_space_entry`, `material_handling_storage`) I listed as canonical.
  The §151 linter passed because the list matched the names I used, not the names the engine emits.
  **Class D again, in the very repair that claimed to close class D.**
- **`HS-K1`** — the model raised `personal_protective_equipment` where truth also expected
  `chemical_inhalation_contact`; a genuine family-choice disagreement.

**Reported as NOT INTERPRETABLE rather than as a deterministic regression.**

---

## 8. Why CASE C, and why not CASE E

**CASE A** requires the `HAZARD_SEVERITY` defect to recur. It did not.
**CASE B** requires v13 to pass the clarification gates. It did not — recall is 4/7 against 1.0.
**CASE D** requires a valid precision defect. Adjusted precision is 7/7; the one speaking negative is
a fixture defect.

**CASE E was seriously considered and rejected.** Three instrument defects surfaced in this run — a
falsely-signed F3 claim (`HS-M1`), a wrong canonical family list, and an undetected degenerate
response — which is a real indictment of the hardening. But the primary axes remain interpretable:
**6 of 8 REQUIRED rows and 7 of 8 FORBIDDEN rows are clean**, the label baseline is unaffected by any
of the three, and the falsifier outcome rests on 9 labelled clarifications none of which is touched
by them. Calling the baseline unreliable would overstate the damage and would discard a result the
authorization specifically asked for.

**CASE C is correct**, and the authorization's own instruction applies exactly: *"Do not implement a
HAZARD_SEVERITY-only v14 without reconciling that result."* Here there is nothing to reconcile — the
`HAZARD_SEVERITY` defect did not appear at all, and a **different**, clean recall defect did.

---

## 9. Confinement

```
prompt / analysis.v2 / arbitration    UNCHANGED — v13 frozen, verified against §150's recorded hashes
v14                                   UNIMPLEMENTED — gated before spend (F.2b)
§139 collision rule                   UNTOUCHED — gated before spend (F.2c)
fixture set                           BYTE-IDENTICAL before and after, two ways
reserved material                     NOT opened
spent formal cohort                   NOT read, copied or mimicked
§147–§151 evidence                    byte-identical against recorded hashes
formal scorers / truth / thresholds   UNCHANGED
deterministic HazLenz                 UNCHANGED
expanded validation                   NOT RUN
M14_REMEDIATION_STATUS                NOT_ATTEMPTED
production / database / customer      UNTOUCHED
commit / push / tag / deploy          NONE
credential                            read from the environment; never logged, returned or persisted
```

**Files added:** `scripts/probe-expert-hardened-v13-baseline-2026-09-03.ts`, `package.json` (+1
script), and this evidence directory. **No fixture, prompt, contract or arbitration file was
modified.**

*(One cosmetic defect in the probe's own console output: `label exact (REQUIRED)` prints twice, from
a carried-forward line and the new one. The persisted artifacts are unaffected.)*

---

## 10. Remaining uncertainty

1. **One replicate, no seed, no variance control.** Sixteen rows, nine clarifications. §150 and §152
   ran the *same* prompt and produced 4-of-7 and 0-of-9 `HAZARD_SEVERITY`. **A repeat run is the
   single highest-value next measurement**, and its absence is why §3 says WEAKENS rather than
   FALSIFIES.
2. **The hardening is better but not sound.** A signed `NO_SIBLING_DECISION_CRITICAL_GAP` claim was
   false, and only the model caught it. The linter said so would happen; this is the proof.
3. **The canonical family list is wrong** and must be rebuilt from observed engine output before any
   coverage measurement is trusted.
4. **The harness cannot detect a degenerate provider response.** A `"placeholder"` body scored as
   PRESENT and contaminated two denominators.
5. **HS-H1 is one clean miss on one row.** A recall defect is established, but not characterized.
6. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.
7. **Expanded validation remains NOT AUTHORIZED**, and this result does not move it closer.
