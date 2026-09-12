# Expert HazLenz — Hosted Development Remediation Probe

**§140. ONE bounded hosted DEVELOPMENT probe against the §139-remediated contract. 16 logical calls,
16 provider requests, 0 retries, $0.559102 of a $2.08 enforced ceiling.**

**This is not a formal evaluation, not a rerun of the spent cohort, not a replacement cohort, not an
acceptance run, not a threshold-tuning exercise, and not evidence that M14 is repaired.** No frozen
scorer was applied. No formal measure was computed. No formal gate status is claimed.

The immutable historical result is untouched: **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**, cohort
`hazlenz.expert.formal.cohort.65.v1+d7c8f9c15f0a`, `FORMAL_COHORT_SPENT = TRUE`,
`PROVIDER_INVOCATION_COUNT = 195`. No reserved material was opened. The spent 65-row cohort was not
read, imported, reused or mimicked.

---

## 1. Terminal

```
EXPERT_HAZLENZ_HOSTED_REMEDIATION_PROBE_INCOMPLETE — LINKAGE_CONTRACT_REMEDIATION_REQUIRED
```

**Why this terminal and not `PASSED`.** Six of the seven development advancement criteria are met,
and the clarification, citation and grounding behaviour the probe was built to test is not
materially defective — so `FAILED` would misstate the evidence. But the authorization makes
`relatesToCandidateKey` its own axis with its own three-way classification, and the measured
classification is **`LINKAGE_PARTIAL`** resting on **three opportunities, one of them taken**. The
cross-collection arbitration stage fired **zero times** because no contradiction ever arose to
arbitrate. On this evidence the arbitration feature is **unexercised, not proven**, and the
authorization is explicit that a probe whose primary remaining weakness is linkage returns
`INCOMPLETE` rather than `PASSED`.

Criterion 2 (TRUE-GAP retention) is also **not cleanly met** under the strict reading — see §4.2. It
is reported honestly rather than resolved in the repair's favour.

---

## 2. Confinement

```
PROVIDER_INVOCATION_COUNT (historical formal)  195 before, 195 after — this probe does not touch it
provider requests this operation               16 (16 logical calls, 1 arm, 0 retries)
spend this operation                           $0.559102     enforced ceiling $2.08     authorized $3.00
tokens                                         190,231 in / 17,864 out
model identity                                 anthropic / claude-sonnet-5 (bound before spend, verified per response)
prompt identity                                hazlenz.expert.prompt.v7
system-prompt SHA-256                          d0506f67022196c9f0ac8d155e46992d602d459829d638f59f5a412f4b0bd2c5
wire-schema SHA-256                            65d6fe4cbe1e52d3e0d1c851c5061a0c3aab283acee0901149a1a579a6c0c870
analysis contract                               hazlenz.expert.analysis.v2
reserved material                              NOT OPENED
spent formal cohort                            NOT read, NOT imported, NOT reused, NOT mimicked
new formal cohort                              NONE
M14_REMEDIATION_STATUS                         NOT_ATTEMPTED
scorer / truth / threshold changes             NONE
production / database / customer activation    NONE
commit / push / tag / deploy                   NONE
```

The spend ceiling is the **lower** of the two the authorization allows: 20 requests priced at the
existing frozen worst case (`WORST_CASE_REQUEST_USD = $0.104`) is `$2.08`, below the authorized
`$3.00`, so `$2.08` was enforced. Enforcement is prospective — checked before each request against
the worst case that request could cost — so neither ceiling was reachable.

---

## 3. Phase 0 — pre-spend gate

**30 of 30 checks passed at $0.00 before a provider object was constructed.** The gate ran the whole
cohort harness in `DISABLED` mode, which builds every request and validates every row while
`providerInvocationCount()` is asserted still zero.

| group | what it proved |
|---|---|
| A.1–A.13 | 16 rows, `validateCohortRow` 0 problems, all ids `DP-*`, role minimums met, each TRUE-GAP row carries exactly one gap, the four gaps use four distinct `affectedDecision` values, every NO-GAP control owes none |
| B.1–B.3 | no formal-cohort selector, executor, frozen-artifact path or reserved-material module is imported; rows come from one development fixture module; **every built request is the `BASE` arm** |
| C.1–C.4 | model is exactly `claude-sonnet-5`, endpoint is the vendor API host, thinking disabled, credential present (value never read, logged or persisted) |
| D.1–D.2 | 16 requests built with 0 provider invocations; prompt label is `v7` |
| E.1 | **no truth-key-only string appears in any of the 16 built requests** |
| F.1–F.3 | system prompt carries no citation-shaped text; **no built user prompt carries citation-shaped text**; and the redaction was actually exercised — 4 rows supplied records whose text carried citations before rendering |
| G.1–G.3 | ceilings internally consistent and priced from the frozen cost model |
| H.1 | the append-only run-record store was empty before the first request |

Protected suites before spend: **31 of 31 PASS** (§8).

---

## 4. Phase 4 — measured model behaviour

All 16 calls returned `PRESENT` with a validated analysis. Zero `OUTPUT_REJECTED`, zero provider
failures, zero retries, zero merge-invariant violations, zero normalization issues of any kind.

### 4.1 P1 — clarification overproduction

| readout | value |
|---|---|
| total clarifications, 16 rows | **3** |
| average per call | **0.188** |
| clarifications on NO-GAP controls | **0** |
| NO-GAP controls emitting zero clarifications | **4 of 4** |
| rows with an empty clarification list | **13 of 16** |

**This is a large, unambiguous change in the measured direction.** The formal failure pattern was 165
clarifications against 20 authored gaps, with 106 of them on rows whose answer key owed none, and a
stereotyped three-question exposure/severity/control template on the modal row. Here the template
does not appear anywhere, and the rows that owe nothing produce nothing.

Two NO-GAP rows show the counterfactual test being applied *explicitly* rather than the model simply
saying less. DP-A1: *"This is a straightforward, well-evidenced current hazard with no ambiguity
about existence, exposure, or control status, so no additional hazard candidates or clarifying
questions are warranted."* DP-B4 records the fact it declined to ask about and says why — quoted in
§4.2.

**Caveat that must not be lost: 16 rows is not 65, and one replicate is not a distribution.** This
establishes that the overproduction pattern is not reproduced on this material. It does not
establish a rate.

### 4.2 P2 — genuine-gap retention, and the one place this probe does not come out clean

Three of four TRUE-GAP controls emitted a clarification. Whether three of four emitted *the authored
gap* is a different question, and the honest answer is **two**.

| row | authored gap | emitted | verdict |
|---|---|---|---|
| **DP-B2** | whether the drive was locked out and the line bled down beyond the local OFF switch | *"Was the pump drive physically isolated (e.g., breaker locked out, energy source de-energized and verified) beyond placing the local control switch in the OFF position, or is the OFF switch the only isolation in place?"* — `REQUIRED_CONTROL`, `BLOCKING`, linked to candidate `loto-1` | **recovered exactly, label exact** |
| **DP-B3** | whether the vault has been evaluated and classified under the permit-space program | *"Has this vault been evaluated and classified as a permit-required or non-permit confined space, and if permit-required, was a permit issued for this entry?"* — `APPLICABILITY`, `BLOCKING` | **recovered exactly, label exact** |
| **DP-B4** | how long the worker has been at the dry breaking task | a **different** question, about whether an engineering control is required — `REQUIRED_CONTROL` | **authored gap NOT asked — but consciously declined; see below** |
| **DP-B1** | whether any employee has entered the unprotected trench section | **nothing** | **authored gap not asked, and no trace of it being considered** |

**DP-B4 is the more interesting of the two misses, and it argues against the fixture rather than
against the model.** The model put the authored fact in `uncertainty` with its reasoning attached:

> *"The exact duration the worker has already been exposed to dust prior to arrival is unrecorded,
> which affects cumulative exposure but does not change the current control decision."*

That is the v7 counterfactual test applied correctly and stated out loud: the fact is missing, it was
noticed, and both branches were judged to lead to the same current action. A competent professional
would say the same — dry breaking in an enclosed stairwell with no water and no vacuum needs an
engineering control whether the worker has been at it for fifteen minutes or four hours. **The
authored gap was weaker than the counterfactual test requires, and the model was right to decline
it.** That is a fixture-construction defect in this probe, disclosed as one.

**DP-B1 is a genuine retention concern and is not explained away.** The model raised a spoil-pile
candidate and a surcharge interaction, and said nothing about who is exposed. Unlike DP-B4 it left
**no record of having considered and rejected the question** — `uncertainty` is empty and the summary
does not mention exposure. Whether it judged the question non-decision-critical or never formed it
cannot be determined from this run. The same reading that exonerates DP-B4 may apply (entry occurring
versus a barricaded trench both end in "install a protective system"), which would again be a fixture
weakness — but nothing here demonstrates that, and the alternative is that the counterfactual test is
now suppressing a legitimate exposure question. **On this evidence the cause is not identifiable,
and it must be resolved before a larger probe, not after.**

**Development classification for criterion 2: NOT MET under the strict reading (2 of 4), MET under
the loose reading (3 of 4).** The strict reading is the one that matters, because criterion 2 exists
precisely to falsify the repair, and grading it loosely would defeat its purpose. Both readings are
recorded so the product owner decides rather than inheriting a judgement.

### 4.3 P3 — `affectedDecision` labelling

| value | count |
|---|---|
| `APPLICABILITY` | 1 |
| `REQUIRED_CONTROL` | 2 |
| `HAZARD_EXISTENCE`, `HAZARD_SEVERITY`, `EXPOSURE`, `REGULATORY_INTERPRETATION` | 0 |

Two of three labels match the authored `affectedDecision` exactly, and both matches land on the
collision pairs §138 measured as bidirectionally confused: DP-B2's *"was this control applied"*
question is labelled `REQUIRED_CONTROL` and **not** `HAZARD_EXISTENCE`, which is the pair v7 decides
explicitly; DP-B3's scope question is `APPLICABILITY` and **not** `REQUIRED_CONTROL`. DP-B4's label
is internally consistent with the question it actually asked.

**Three labels is not a labelling measurement.** The denominator collapsed because the repair
succeeded at P1 — the same behaviour that makes P1 look good makes P3 nearly unmeasurable at this
scale. A larger probe needs rows engineered to *require* a question rather than merely permit one.

### 4.4 P4 — `relatesToCandidateKey` and arbitration — **the weakest result**

| readout | value |
|---|---|
| linkage opportunities (a clarification on a call that also emitted a candidate) | **3** |
| `relatesToCandidateKey` populated | **1** |
| valid bindings (resolves to an emitted `candidateKey`) | **1** |
| invalid / unresolved bindings | **0** |
| population rate | 0.333 |
| **arbitration events (`CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE`)** | **0** |
| surviving `HAZARD_EXISTENCE` questions (upper bound) | **0** |

**Classification: `LINKAGE_PARTIAL`.**

The opportunity definition is mechanical and is an **upper bound**, not a measurement: a clarification
emitted alongside any candidate. It does not establish that a link was semantically warranted.

What can be said: when the model did declare a link (DP-B2 → `loto-1`) it was **valid and resolved**,
and there were **zero invented or unresolvable keys**. What cannot be said: anything about whether
the arbitration stage works, because **it never fired.** The three rows built specifically to provoke
an existence-question contradiction — DP-C1, DP-C2, DP-C3 — emitted **zero clarifications between
them**, so no contradiction existed to arbitrate. Not one `HAZARD_EXISTENCE` clarification was
emitted anywhere in the probe.

That is a good product outcome and a bad experimental one. The §139 report's own open question 4 —
*"whether `relatesToCandidateKey` is populated by the model in practice"* — **remains open**, and the
arbitration stage added in Phase 3 remains **unexercised on hosted evidence**. It must not be
described as proven.

### 4.5 P5 / P6 — governed evidence

**All four negative controls abstained explicitly, in their own words, and the positive control
grounded correctly.** No mechanical inference was needed; the model said what it was doing.

| row | class | what the model said | verdict |
|---|---|---|---|
| **DP-D1** | relevant record | *"…which the supplied general machine guarding record (R1) requires to be guarded"* | **grounded — positive control demonstrated** |
| **DP-D2** | unrelated record | *"No respiratory or fall exposure is indicated by the text, and the supplied respiratory program record does not apply to these facts."* | **abstained** |
| **DP-D3** | no record, maximal temptation | *"No governed record was supplied, so no regulatory obligation is asserted here."* | **abstained** |
| **DP-D4** | narrower record | *"The supplied governed record (R1) addresses only portable ladder side-rail extension and explicitly does not cover fixed ladders, so it does not govern this condition and no obligation can be asserted from it…"* | **abstained; extension refused explicitly** |
| **DP-E1** | irrelevant + non-approved records | no record handle referenced at all; no regulatory assertion | **abstained** |

DP-D3 is the strongest of these. Unlabelled drums, no written program and no safety data sheets is a
textbook obligation, no record was supplied, and the model stated the abstention rather than reaching
for regulatory memory.

**Record-induced invention: zero.** Each governed row carries a forbidden family chosen to match its
record — `respiratory_protection` on DP-D2, `welding_fumes` on DP-E1 — so a candidate pulled out of
an irrelevant record would be visible in the candidate list. **No forbidden family was emitted on any
row in the probe.**

**Criterion 4: MET. Criterion 5: MET.**

### 4.6 P7 — citation behaviour

| readout | value |
|---|---|
| citation-shaped text in the model input (16 system + user prompts) | **0** |
| records that carried citation-shaped text before redaction | **4 rows / 5 records** |
| citation-shaped output refused at the boundary | **0** |
| citation-shaped text in validated Expert output | **0** |
| citation-shaped text in the **Expert-advisory block** of merged customer output | **0** |
| citation strings in the **governed-authority block** of merged output | 5 — the supplied records, copied through by design, not Expert output |

The §139 input-side repair is confirmed working on live traffic: every record reached the model under
an opaque handle with its citation tokens replaced, the model referred to records as `R1`, and no
citation-shaped string was present in any of the sixteen prompts. Nothing had to fail closed, because
nothing was emitted.

**Criterion 3: MET.**

**A measurement defect in this probe, disclosed.** The first version of this scan read the *whole*
`MergedIntelligence` and reported **four** citation-shaped strings in merged output. All four were
`governed.citations[].citation` values that the caller supplies to `mergeExpertIntelligence` as
protected authority input; they are copied through unfiltered by design and Expert never touched
them. Counting them would have been a **false defect report about the one property this probe most
needs to state accurately.** The scan is now scoped to `merged.expertAdvisory`, which is the
Expert-contributed portion, and the governed-block count is reported separately as context. The
corrected artifacts were regenerated from the persisted run records at $0.00 with no new request.

### 4.7 P8 — collection routing

| collection | items | rows with an empty list (of 16) |
|---|---|---|
| `expertHazardCandidates` | 18 | 4 |
| `decisionCriticalClarifications` | 3 | 13 |
| `crossHazardInsights` | 13 | 5 |
| `disagreements` | 5 | 12 |

Outcome was `ANALYZED` on all 16 rows; `NOTHING_TO_ADD` was never returned, including on DP-A4 — but
DP-A4 returned zero candidates, zero clarifications and zero insights, and its two disagreements are
what kept the outcome at `ANALYZED`. That is contract-correct: `NOTHING_TO_ADD` requires *every*
typed list empty.

**No underproduction was introduced.** Measured against **joint** coverage — Expert plus the
deterministic engine — exactly **one** truth-present family across all 16 rows was covered by neither
layer: `walking_working_surfaces` on DP-C1 (the standing water beside the energised cord; the
`electrical` family was covered deterministically, and the model did fold the water into a correct
`ELECTRICAL_WET_ENVIRONMENT` insight rather than a candidate).

**A second measurement defect, disclosed.** The first version of this readout compared truth-present
families against **Expert candidates alone** and reported *eight* misses. That measure is wrong for
this contract: Expert is additive and the prompt tells it not to restate a family the deterministic
engine already assessed, so it would have penalised the model for obeying the contract. Corrected to
joint coverage, and the Expert-only column is retained beside it.

**Expert additive recall is strong.** Expert supplied 15 family-level candidates across 10 rows that
the deterministic engine did not emit, including the entire `hazcom` finding on DP-D3, where the
engine emitted nothing at all.

**The disagreements channel survived empty-by-default and is producing correct work.** All five
disagreements challenge genuine deterministic over-flagging: DP-A4 challenges two ACTIVE findings on
an observation that states only good conditions; DP-A2 challenges an ACTIVE machine-guarding finding
on a condition the observation closes out; DP-D1 challenges an `UNKNOWN` on accessible energy the
observation resolves in as many words. None is a restatement dressed as a challenge.

**`crossHazardInsights` is the residual overproduction candidate.** At 13 items on 16 rows it is the
collection least affected by the empty-by-default repair, and it is where the remaining quality
questions sit: **5 of 13 fall back to `interactionKind: OTHER`**, which suggests the frozen
vocabulary does not fit what the model is finding; DP-C2 forces `MOBILE_EQUIPMENT_PEDESTRIAN` onto a
machine-guarding / lockout pair it does not describe; and DP-B3's second insight is framed on a
hypothetical (*"if an entrant were affected…"*) rather than an established condition. Most of the
thirteen do name a real mechanism — DP-C1's water-as-contact-path and DP-B1's spoil-pile surcharge
are correct and non-obvious — so this is a **precision and vocabulary question, not a volume
failure**. It is flagged for the next operation, not repaired here.

---

## 5. Phase 3 — persistence proof

```
store                     RUN-RECORDS.jsonl (append-only, fsync per record)
records on disk           16
parse problems            0
completeness problems     0
sha256                    fb8a1406b17e517648ef57fe3dec28d3ac7aedf31d9c3f384181d1fa057a0fe9
mid-run read-back proof   DP-A1 read back from disk while the store was still open and 15 calls
                          remained — provenBeforeExit = true
```

The §139 Phase 7 repair is confirmed on a live run. The first completed record was read back **from
disk** before the second request was issued, which is the property the 2026-09-01 loss requires:
records in memory prove nothing. `runRecordCompletenessProblems` returned empty — every row, every
arm, every `PRESENT` layer carrying its validated analysis, every call carrying attempt telemetry.

**The corrected diagnostics in §4 were re-derived from this file, not from process memory.** That is
the repair paying for itself within one operation: a measurement defect was found after the run and
fixed without spending a second dollar.

---

## 6. Development advancement criteria

| # | criterion | required | observed | met |
|---|---|---|---|---|
| 1 | NO-GAP clarification behaviour materially improves | ≥3 of 4 silent | **4 of 4** | **YES** |
| 2 | TRUE-GAP retention remains strong | ≥3 of 4 semantically correct | **2 of 4** strict / 3 of 4 loose | **NO (strict)** |
| 3 | no accepted unsupported citation survives validation/merge | 0 | **0** | **YES** |
| 4 | unrelated/absent governed evidence produces abstention | all negative controls | **4 of 4, explicit** | **YES** |
| 5 | relevant governed evidence still supports a grounded result | ≥1 positive control | **1 demonstrated** | **YES** |
| 6 | no protected deterministic/governed regression | before = after | **31 of 31 PASS, both** | **YES** |
| 7 | no new provider identity, budget, persistence or validation defect | none | **none** | **YES** |
| — | linkage classification | separate axis | **`LINKAGE_PARTIAL`**, 3 opportunities, 0 arbitration events | **unexercised** |

The authorization permits advancement to a larger probe **only if all seven hold**. Criterion 2 does
not hold under the strict reading, and the linkage axis is unexercised. **Advancement is therefore
not authorized by this result**, and the terminal reflects that.

---

## 7. M14 confinement

```
M14_REMEDIATION_STATUS = NOT_ATTEMPTED
```

One arm. `BASE` only, asserted by gate check B.3 against the requests the harness actually built
rather than against a promise in a comment. No permuted request was constructed or issued. No
order-sensitivity quantity was computed anywhere in the probe. No input was reordered for any reason,
so there is no difference of any kind from which an order effect could be inferred, causally or
otherwise. Nothing in this document may be read as evidence about M14.

---

## 8. Protected regression

Executed **before** the first request and again **after** the last, same 31 suites, same commands.

| suite | before | after | detail |
|---|---|---|---|
| `hazlenz-core` | PASS | **PASS** | Overall Result: PASS |
| `expert-contract-foundation` | PASS | **PASS** | 56 passed, 0 failed |
| `expert-authority-merge` | PASS | **PASS** | 51 passed, 0 failed |
| `expert-provider-failure` | PASS | **PASS** | 131 passed, 0 failed |
| `expert-nocall-harness` | PASS | **PASS** | 141 passed, 0 failed |
| `expert-routing-contract` | PASS | **PASS** | 67 passed, 0 failed |
| `expert-grounding-contract` | PASS | **PASS** | 41 passed, 0 failed |
| `expert-projection-equivalence` | PASS | **PASS** | 90 passed, 0 failed |
| `expert-anthropic-adapter-repair` | PASS | **PASS** | 30 passed, 0 failed |
| `expert-execution-budget` | PASS | **PASS** | 66 passed, 0 failed |
| `expert-cohort-instrument` | PASS | **PASS** | 155 passed, 0 failed |
| `expert-remediation-contract` | PASS | **PASS** | 92 passed, 0 failed |
| `hazlenz-evidence-boundary` | PASS | **PASS** | {"passed":true,"assertions":13} |
| `evidence-foundation` | PASS | **PASS** | {"passed":true,"assertions":35} |
| `guided-finding-response` | PASS | **PASS** | {"passed":true,"assertions":28} |
| `risk-policy` | PASS | **PASS** | Risk policy: 10/10 checks passed |
| `l31-reasoning-contract` | PASS | **PASS** | 49 passed, 0 failed |
| `l32-semantic-contract` | PASS | **PASS** | L3-2 semantic contract suite: 191 passed, 0 failed |
| `l32b-binder-precision` | PASS | **PASS** | L3-2b binder precision suite: 105 passed, 0 failed |
| `l32c-gate-polarity` | PASS | **PASS** | L3-2c gate polarity suite: 86 passed, 0 failed |
| `l32d-clarification-scope` | PASS | **PASS** | L3-2d clarification scope suite: 71 passed, 0 failed |
| `l32e-syntactic-role` | PASS | **PASS** | L3-2e syntactic role suite: 82 passed, 0 failed |
| `l32f-predicate-scope` | PASS | **PASS** | L3-2f predicate scope suite: 77 passed, 0 failed |
| `l32g-state-separation` | PASS | **PASS** | L3-2g state separation + binder residual: 57 assertions passed, 0 failed |
| `l32i-clarification-carrier` | PASS | **PASS** | L3-2i candidate-independent clarification carrier: 61 assertions passed, 0 failed |
| `l32j-carrier-activation` | PASS | **PASS** | L3-2j shipped carrier activation (measured and refused): 37 assertions passed, 0 failed |
| `hazlenz-understanding` | PASS | **PASS** | HazLenz hazard understanding benchmark: 25/25 passed. |
| `hazlenz-precision` | PASS | **PASS** | PASS HazLenz decomposition precision/recall gate |
| `hazlenz-level1-recall` | PASS | **PASS** | PASS HazLenz Level-1 recall gate (17 checks) |
| `hazlenz-actionable-coverage` | PASS | **PASS** | PASS HazLenz actionable-coverage gate (17 checks) |
| `hazlenz-guarding-applicability` | PASS | **PASS** | HazLenz machine-guarding applicability precedence regression: all invariants passed, 0 failed |

**31 of 31 PASS before the first request and 31 of 31 PASS after the last.** The two result sets are identical line for line, so "no protected regression" is a comparison rather than an assertion.

`hazlenz-clarification-gauntlet` and `hazlenz-authentic-reasoning` were **NOT RUN** and are not
claimed as passing: the first requires a database and no database was touched; the second is an
integration test against a live local endpoint that was not started. Neither exercises anything this
operation changed.

---

## 9. Limitations, and what this probe does not establish

1. **One replicate, one arm, sixteen rows.** No within-condition divergence was measured. No rate,
   no distribution and no reproducibility claim can be drawn from this.
2. **The linkage feature is unexercised.** Three opportunities and zero arbitration events. The
   §139 open question about `relatesToCandidateKey` population remains open, and the arbitration
   stage has still never fired on hosted evidence.
3. **DP-B1's retention miss has no identified cause.** It is either a fixture whose counterfactual
   was too weak or a genuine suppression of a legitimate exposure question. This run cannot
   distinguish them.
4. **DP-B4 revealed a fixture defect in this probe's own answer key** — an authored gap that does not
   survive the counterfactual test it was written to exercise. At least one of four TRUE-GAP rows was
   therefore not testing what it claimed to test.
5. **Two measurement defects were found and corrected after the run** (§4.6, §4.7). Both were in this
   probe's analysis code, not in the product. Both would have produced false findings — one a false
   citation defect, one a false underproduction defect. They were caught because the persisted run
   records made re-derivation possible; a third of the same kind could still be present.
6. **`PRE-SPEND-IDENTITY.json` was overwritten by the first re-measurement pass.** The probe script's
   own recorded hash therefore names the corrected script rather than the one that issued the sixteen
   requests, and that single value is **unrecoverable for this run**. Every other hash in that file
   names a file that was not edited after the spend — in particular `expert-prompt.ts`
   (`3dd1726…`), `expert-contract.types.ts` (`5705870…`) and `expert-normalization.ts`
   (`a69932b…`) are byte-identical to the values the §139 remediation report records, so the identity
   of the surfaces that shaped the model's answers is intact. The guard that prevents a recurrence
   was added **after** the last re-measurement pass of this run, so it protects the next operation
   rather than this one: from now on a publish refuses to restate an existing
   `PRE-SPEND-IDENTITY.json` and a re-measurement writes `PRE-SPEND-IDENTITY.remeasure.json`
   instead. No `.remeasure.json` file exists for this run.
7. **Semantic classifications in §4.2 and §4.5 are development readings, not scored measures.** The
   verbatim model text is recorded beside every one of them so the product owner can disagree.
8. **Nothing here bears on M07, M09, M10, M12 or any other frozen gate.** No scorer ran.
9. **No formal cohort is authorized by this operation**, and none is proposed.

---

## 10. What the next operation should resolve, in order

1. **DP-B1.** Determine whether the exposure question was declined or never formed. A small set of
   TRUE-GAP rows whose two branches lead to *visibly different actions today* would settle it.
2. **Linkage.** The feature cannot be validated by rows that produce no clarifications. Rows must be
   engineered so a question about a raised candidate is genuinely owed. If population stays low with
   real opportunity, the row-level arbitration policy the §139 report declined to adopt unilaterally
   becomes the live question again.
3. **`crossHazardInsights` precision** — `OTHER` at 5 of 13 and one forced vocabulary member.
4. **Answer-key discipline.** Authored gaps must themselves pass the counterfactual test before a
   larger probe spends on them.

---

## 11. Files

**Created**

| file | sha256 |
|---|---|
| `verification/expert-hazlenz-hosted-remediation-probe-2026-09-02/RUN-RECORDS.jsonl` | `fb8a1406b17e517648ef57fe3dec28d3ac7aedf31d9c3f384181d1fa057a0fe9` |
| `verification/…/PRE-SPEND-IDENTITY.json` | `980b26e96270e86132e9cde06157e0d0588c6d2ec29349983990f8439572d6a2` — see §9.6 |
| `verification/…/FIXTURE-MANIFEST.json` | fixture provenance, roles, truth keys, observation hashes |
| `verification/…/ATTEMPT-LEDGER.json` | budget, accounting, per-call attempts, tokens, latency, cost |
| `verification/…/RESULTS-SUMMARY.json` | every diagnostic in §4, machine-readable |
| `verification/…/PROBE-REPORT.md` | this document |
| `backend/src/safescope-v2/expert-hazlenz/fixtures/hosted-remediation-probe-v1.ts` | the 16 development rows |
| `backend/scripts/probe-expert-hosted-remediation-2026-09-02.ts` | the gate, the run, the measurement |

**Modified**

| file | change |
|---|---|
| `docs/INSITE_ENGINEERING_BLUEPRINT.md` | additive §140 section |
| `docs/INSITE_CURRENT_STATE.json` | additive §140 record |

**No production source was modified by this operation.** `expert-prompt.ts`,
`expert-contract.types.ts`, `expert-normalization.ts`, `expert-runner.ts`, the adapter, the harness,
the run-record store and the execution budget are all byte-unchanged. No scorer, truth key, threshold
or frozen artifact was touched. No historical formal evidence was modified.
