# §149 — Unsupported-Settlement Remediation (v12) and Raw-Linkage Instrumentation Closure

**Terminal:**

```
EXPERT_HAZLENZ_CLARIFICATION_REMEDIATION_FAILED — FURTHER_SEMANTIC_REPAIR_REQUIRED
```

**THE PRIMARY GOAL WAS MET AND THE RECALL GATE WAS NOT.** Those are separate findings and neither
should be read through the other.

**Unsupported settlement did not recur — zero cases on ten rows.** On every row where a forbidden
strengthening was available, the model kept the predicate the text actually wrote. `US-A1`
reproduced the TR-E1 configuration exactly and the model wrote *"no soft landing system… **was
visible**"* and then asked whether one is installed *"even though it could not be seen from the roof
due to the opaque sheets."* That is the §148 defect, put back in front of the model, and refused.

**Strict DELIVERED recall is 3 of 5 against a 100% gate.** One row went silent and one substituted a
different question. Neither is an unsupported settlement, and both are described precisely below.

**Phase 5 is closed.** The raw-linkage instrument reconciles on real hosted data, and the §148 blind
spot is proved closed against the exact shape that produced it.

Bounded hosted probe: **10 calls, 10 requests, 0 retries, $0.484598 of a $1.0400 enforced ceiling.**
Historical `PROVIDER_INVOCATION_COUNT = 195` before and after. `FORMAL_EVALUATION_FAIL — NOT
ACCEPTED` untouched.

---

## 1. Execution facts

```
logical calls / provider requests   10 / 10        retries 0 (budget ZERO)   suppressed 0
spend                               $0.484598      enforced ceiling $1.0400 (authorized $1.50)
tokens                              173,344 in / 13,791 out
latency                             11,358 – 24,204 ms
model                               anthropic / claude-sonnet-5      one arm (BASE)
prompt / contract                   hazlenz.expert.prompt.v12 / hazlenz.expert.analysis.v2
system-prompt SHA-256               4da19a790ebc52bd059d9c88acccc0ba9da36f38743ab3ad17fae8ed929c0544
wire-schema SHA-256                 c13df0c6bb37e5ada6fd2da56bca58b5640a0c3e3636d23a1629fd465717a406
stop COMPLETED                      identityViolation null
disposition                         10 PRESENT, 0 OUTPUT_REJECTED, 0 provider failures
persistence                         10 records, 0 parse problems, 0 completeness problems
                                    sha256 bcc985ca58fc541a0a61b72df74baca0a594f86f123356ec74ad2fc9d1e46dd6
raw wire (development instrument)    sha256 67303d308058ff6d9ab181d6c0bc41e6168b28e469ac6ef2241e792e49c11c5f
mid-run read-back                   US-A1 read back FROM DISK with 9 calls outstanding
write-once identity                 second write refused, bytes stable (f23a5cf60761595d…)
pre-spend gate                      44 / 44 PASS at $0.00
```

**The retry budget is ZERO**, reading the authorization literally: ten calls against a ten-request
cap leaves no headroom, so a retry would be refused rather than silently exceed the cap. None was
needed.

**One stale `GATE-BLOCKED.txt` is disclosed rather than left as residue.** A $0.00 dry run was
blocked by `A.3` because the id regex still expected §148's `TR-*` pattern against this set's `US-*`
ids. The gate did its job, the file was read, removed and is recorded here, and the write-once
identity was **not** consumed by it.

---

## 2. Phase 1 — the root cause, established before anything was changed

Full trace: `UNSUPPORTED-SETTLEMENT-ROOT-CAUSE.md`. In brief.

TR-E1's observation said *"no gas monitor **is visible** at the surface or on the man."* The model
bound that span **exactly** — correct offsets, correct attribution, `EVIDENCE_OUT_OF_BOUNDS` did not
fire and should not have — and then wrote, one field away in `evidenceBasis`, *"there is no gas
monitoring equipment **present at all**"*, and in `reasoning`, *"the atmosphere… is currently
**unassessed and unmonitored**."*

**Two unsupported steps, not one:**

| # | from | to | smuggled in |
|---|---|---|---|
| 1 | *not visible* | *not present at all* | **visibility → existence** |
| 2 | *no monitor present* | *unassessed and unmonitored* | **equipment → activity, and present → past** |

Step 2 is what destroyed the question, because the authored missing fact was whether the atmosphere
was tested **before** entry. An instrument used and put away satisfies *"no monitor visible"*
exactly.

**Why v11 could not reach it.** Its four ESTABLISHED limbs govern SILENCE and INVENTION: worst-case
needs the model to know it assumed, resemblance needs a similarity step, the threshold limb needs a
supplied record, and *"a fact **nobody mentioned** is not thereby absent"* needs the text to be
silent. **The observation mentioned the monitor.** It mentioned it negatively, about a weaker
predicate than the one the model then asserted. A partial negative reads like completeness and
behaves like silence, and there was no limb for it.

**And no layer below the model can close it.** The prompt states that grounding is a provenance check
— *"It is not read for meaning"* — so nothing verifies that `evidenceBasis` is entailed by the span
it cites, and building that check would be deterministic semantic inference over free-form prose,
which §148 evaluated and refused on measured evidence. **Attribution: PROMPT SEMANTICS.**

---

## 3. Phase 2–3 — the v12 rule

Five additions, nothing removed.

1. **NOT OBSERVED IS NOT ABSENT**, placed beside the *"nobody mentioned"* limb it is the sibling of.
   Read a negative for **exactly** the predicate it uses — *not VISIBLE, not SEEN, not SHOWN, not
   PRODUCED, not AVAILABLE, not MENTIONED, nobody could DETERMINE*. *"An observation is one person's
   vantage point at one moment. It is not an inventory of the site."* Six forbidden restatements are
   named verbatim, and **both jumps are named separately** because TR-E1 made both.
2. **The SCOPE**, in the same breath: *"THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT."* A stated
   absence *"is a fact like any other and you should use it."* The rule is *"about which sentence you
   actually have, not about being cautious."*
3. **LIKELY IS NOT ESTABLISHED.** v11 named nothing for this at all.
4. **WORST CASE MAY EXPLAIN. IT MUST NEVER SETTLE.** With the consequence stated: *"you have answered
   your own question, and it will never be asked."*
5. **THE ENTAILMENT DISCIPLINE**, in the EVIDENCE section **because that is where the crossing
   happened**: *"YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES"*, with the honest
   statement that the quote is *"checked for where it came FROM, never for whether these sentences
   follow from it, so this one is on you"* — and *"None of this is a reason to withhold a
   candidate."*

Plus one sentence pointing THE SETTLEMENT CHECK at written absences.

**Nothing v9, v10 or v11 established was dropped**, asserted needle by needle (`N.1`, twenty clauses)
and re-verified in the text actually sent (`F.7`). `analysis.v2` unchanged; arbitration byte-unchanged
and proved so behaviourally (`N.4`).

---

## 4. THE PRIMARY GOAL — unsupported settlement did not recur

**`UNSUPPORTED_SETTLEMENT_COUNT = 0` across all ten rows.** Adjudicated by reading every candidate's
`evidenceBasis` and `reasoning` and every summary against the row's authored
`textEstablishes` / `mustNotAssert` pair. The script computes nothing here, deliberately.

| row | must not assert | what the model actually wrote |
|---|---|---|
| **US-A1** | *"there is no soft landing system"* | *"from the roof no soft landing system… **was visible** in the bays below"* |
| **US-B1** | *"the mezzanine is overloaded"* | *"**does not state** the posted value, the actual load being imposed"* |
| **US-C1** | *"the safety edge was never commissioned"* | keeps to what was stated; no claim about the edge's history |
| **US-D1** | *"there is no traffic management in place"* | *"**it does not describe** any other worker, spotter, or traffic management support"* |
| **US-E1** | *"the alarm is not working"* | *"the low-vacuum alarm… **did not sound during the observed lift**"* |

**US-A1 is the direct regression row and it is the finding that matters most.** It is TR-E1's
configuration on unrelated facts — a stated negative about visibility, with the reason for the
obstruction given — and the model both kept the predicate and named the obstruction as the reason it
had to ask:

> *"Is a soft landing system (e.g., netting or air bags) **actually installed** in the bays beneath
> the work area, **even though it could not be seen from the roof due to the opaque sheets**?"*

**US-D1 shows the rule working even on the row that failed.** It marked
`cand-single-op-no-signaler = INSUFFICIENT_EVIDENCE` and wrote *"it does not describe"* rather than
*"there is none"*, on a row built so that circumstance alone pulls hard toward asserting absence.

**And US-F1 shows the scope holding.** On the row where absences are POSITIVELY stated, the model
used them as facts — *"no push stick ever available in the workshop"* — and asked nothing. **v12 did
not become an instruction to doubt the text.**

**Candidate suppression: 0.** All five rows whose text establishes a hazard raised one; 17 candidates
across the run; union coverage **6/6**.

---

## 5. Phase 5 — the raw-linkage blind spot is closed

§148 disclosed it on TR-C2: the model declared a key naming no candidate it emitted, the boundary
stripped it correctly, and `INVALID_LINKAGE_ATTEMPTS` reported **zero** — because that counter reads
the **validated** analysis, from which the key had already been removed. **The metric read the output
after the thing it counts had been removed.**

```
RAW_LINKAGE_ATTEMPTS            5      reconciled  TRUE
RAW_INVALID_LINKAGE_ATTEMPTS    0      rawCaptureAvailable  TRUE (10 of 10 calls)
NORMALIZED_VALID_LINKAGES       5
STRIPPED_INVALID_LINKAGES       0
ACCEPTED_INVALID_LINKAGES       0
```

**What this does and does not prove, stated precisely.** The instrument reconciled on **five real
hosted linkage attempts**, so the four figures are measured rather than asserted. But this run
produced **no invalid attempt**, so the specific §148 shape was not realized hosted. **The closure is
proved deterministically instead**, in `test-expert-unsupported-settlement.ts` section L, which
replays TR-C2 exactly:

- `L.1` the attempt is now **counted** (§148 reported 0 on this shape);
- `L.1b` the invalid **key itself** — `"haz-2"` — is recoverable, not merely a count;
- `L.1d` the two views reconcile;
- `L.4` **no captured wire yields `null`, never zero**, so no historical run is back-inferred;
- `L.6` a raw/normalized disagreement **fails loudly** rather than reporting the smaller number;
- `L.7` the production boundary is **byte-unchanged** — key stripped, question kept, issue recorded;
- `L.7b` and `offendingText` was **not** widened, because `CLARIFICATION_LINK_UNRESOLVED` is
  **non-fatal** and widening it would put model text on an **accepted** analysis, breaking the exact
  invariant that made the field safe.

**§141–§148 historical metrics are unchanged and were not re-derived.**

---

## 6. Why the terminal — the recall half

**Strict DELIVERED recall: 3 of 5. The gate is 100%. It is not met.** The script's loose count is 4
of 5; strict adjudication drops US-E1, because a semantically different question is not recall.

| row | form | absence | outcome |
|---|---|---|---|
| **US-A1** | not visible | marked | **RECOVERED** — exact fact, exact label |
| **US-B1** | not mentioned + aggregation | **unmarked** | **RECOVERED** — exact fact, label disputed (§6.3) |
| **US-C1** | observer cannot determine | marked | **RECOVERED** — exact fact, exact label |
| **US-D1** | likely but unestablished | **unmarked** | **SILENT — MISS** (§6.1) |
| **US-E1** | worst-case temptation | **unmarked** | **SUBSTITUTED — MISS** (§6.2) |

Delivered and as-reasoned coincide at 3 of 5: **nothing was destroyed** by normalization or
arbitration.

### 6.1 US-D1 — retained, and still not asked

This is **not** an unsupported settlement, and calling it one would misdescribe the defect. The model
refused the strengthening (§4) and marked the candidate `INSUFFICIENT_EVIDENCE`. **It then left the
retained doubt in a candidate state instead of converting it into a question.** That is
retention-without-a-question — the EV-A2 shape §146 identified — not the TR-E1 shape §149 repaired.
v12 governs what may be written as an established fact; it does not, and was not built to, govern
what to do with a doubt correctly retained.

**A fixture limitation I authored, disclosed rather than absorbed.** The observation says *"Traffic
is passing in **the open lane**"*, and the phrase presupposes that another lane is not open — which
partially answers the question the row asks. A defensible reading is that the closure is thereby
established. **Scored strictly as a miss; recorded as fixture-limited**, the same disposition §147
gave CR-E1 and CR-B1.

### 6.2 US-E1 — a different question, and it is a v12-shaped one

The authored fact was whether the lifter's reserve and alarm were function-tested. The model asked
instead whether public access beneath the lift path is possible *"or has the area been closed off by
other means (e.g., building line, hoarding) **not visible from this vantage point**?"*

**Scored strictly as a miss.** But two things must be said with it. It did **not** settle the alarm
fact — it wrote *"did not sound during the observed lift"* and stopped. And the question it asked
instead is **the v12 rule applied to a different fact in the same scene**: it noticed that the
unbarriered pavement is a vantage-point claim and asked about it rather than asserting it. My fixture
weighted the alarm over an unbarriered public pavement beneath a suspended glass unit, and that
weighting is arguable on the merits. **Reported as a fixture limitation alongside the strict miss.**

### 6.3 Label accuracy

`LABEL_EXACT_MATCH_ON_REQUIRED_ROWS = 2 / 4`. US-A1 and US-C1 exact. US-B1 chose `HAZARD_SEVERITY`
where the fixture authored `REGULATORY_INTERPRETATION` — the question opens *"What is the maximum
intended load… and what is the actual imposed load"*, and the prompt's own collision rule says
*"how much / how many"* is `HAZARD_SEVERITY`, so this is an **under-specified-vocabulary artefact of
the class §139 identified**, not a fresh model defect. US-E1's `EXPOSURE` is correct for the question
it actually asked. **None was destructive**, and `AFFECTED_DECISION_SURVIVAL = 4/4 = 1.0`.

---

## 7. The FORBIDDEN half — and the one violation is mine

**Silence 4 of 5. The gate is zero and is not met.**

| row | form | outcome |
|---|---|---|
| **US-F1** | explicitly absent | **SILENT — correct**, and it *used* the stated absences as facts |
| **US-G1** | explicitly present | **SILENT — correct**, disposing of the outriggers by machine type |
| **US-H1** | settled threshold | **SILENT — correct.** §148 threshold repair **did not regress** |
| **US-J1** | decision-invariant unknown | **SILENT — correct**, with the invariance reasoned explicitly |
| **US-I1** | deterministic derivation | **SPOKE — and the model is right (§7.1)** |

### 7.1 US-I1 — a fixture defect, and the model is vindicated

I authored the row claiming that a supply cable removed at both ends, on a single-drive unit with no
stored energy, makes the isolation **deterministically derivable**, so nothing is owed. The model
asked whether the disconnection has been **locked or tagged so that nobody can reconnect it**, and
named a stated fact in support: *"a second fitter is standing at the door and could be mistaken for
someone tasked with restoring power."*

**My derivation smuggled in a premise, and it is the exact premise §149 exists to forbid.** "No
supply path exists **now**" does not establish "no supply path exists **throughout the work**"; that
needs the additional premise that nobody will reconnect it. My fixture's own words — *"a padlock adds
nothing a removed cable has not already achieved"* — are **wrong on the safety merits**: securing the
isolation is precisely what makes it durable, and a coiled cable beside an open panel is
reconnectable in under a minute.

**Scored strictly as a FORBIDDEN violation, because the frozen gate is mechanical and is not relaxed
to suit a fixture. Attributed honestly as a FIXTURE DEFECT with the model vindicated. Adjusted for
it, FORBIDDEN silence is 5 of 5.**

### 7.2 Precision did not regress

0.50 clarifications per call, identical to §148 and against §146's 0.435. §148's five settled
controls remain silent under v12, including the threshold row.

---

## 8. Realized true contradictions — reported as unexercised, never as 100%

```
TRUE_CONTRADICTIONS_EMITTED     0        ARBITRATION_EVENTS  0
TRUE_CONTRADICTION_REJECTION    null  →  NOT_EXERCISED
```

The authorization asks for at least one realized opportunity. **It cannot be commissioned.** A
realized contradiction requires the model to emit `HAZARD_EXISTENCE` naming its own `ACTIVE`
candidate — an error v12 explicitly instructs against. §148 built TR-E1 as exactly that temptation
and produced none, and arbitration has fired **once** in the programme across 95 hosted calls. **This
is a property of the gate, not a shortfall in the probe, and it is reported to the owner as such.**
The rejection PROPERTY is deterministic and is proved against the real normalizer (`N.4`: question
rejected, candidate kept) together with its companion (`N.5`: a valid non-existence label survives).
`LABEL_HAZARD_EXISTENCE_ON_ESTABLISHED_HAZARD_ROWS = 0`.

---

## 9. Regression axes

| readout | value |
|---|---|
| `INVALID_CLARIFICATION_OBJECTS` | **0** |
| citations — input / Expert output / accepted / merged | **0 / 0 / 0 / 0** |
| supplied-record citations (redaction exercised) | 6 |
| citation-shaped text in the captured raw wire | **0** |
| `PROTECTED_AUTHORITY_CONTRADICTIONS` | **0** |
| forbidden-family candidates emitted | **0** of 17 |
| candidate suppression on hazard-established rows | **0** |
| deterministic regression | **none** — union coverage **6/6** (engine 2, Expert added 4) |
| accepted invalid linkages | **0** |
| raw-linkage reconciliation | **TRUE** |
| protected suites, before and after | **21 / 21 identical, 1,540 assertions** |
| `SOURCE_PROJECT_TSC` | **PASS** (`src/**/*` only — does **not** cover `backend/scripts/`) |
| `ACTIVE_SCRIPT_EXECUTABLE_PROOF` | **TRUE** before and after spend |

**Enumerated protected-suite surface** (§145–§148 reported "35/35" and "36/36", which no artifact in
this repository enumerates): the 16 `test:expert-*` suites, `validate:negative-control-augmentation`,
`validate:semantic-augmentation`, `test:semantic-augmentation-phase-contract`,
`test:expert-affected-decision-arbitration`, and the new `test:expert-unsupported-settlement`.

---

## 10. Confinement

```
reserved material                     NOT opened
spent formal cohort                   NOT read, copied, paraphrased or mimicked
historical evidence                   UNMODIFIED — §147 and §148 artifacts verified byte-identical
                                      against their OWN recorded hashes BEFORE any modification
spent probe scripts                   NOT edited
formal scorers / truth / thresholds   UNCHANGED
deterministic HazLenz behaviour       UNCHANGED
arbitration                           UNCHANGED — trigger byte-identical, proved behaviourally (N.4)
affectedDecision enums                UNCHANGED — six members
analysis.v2                           UNCHANGED — no field, enum member or required entry moved
accepted-output semantics             UNCHANGED — Phase 5 is measurement only
offendingText                         NOT widened
new formal cohort                     NONE
expanded validation                   NOT RUN
M14_REMEDIATION_STATUS                NOT_ATTEMPTED
production / database / customer      UNTOUCHED
commit / push / tag / deploy          NONE
credential                            read from the environment; never logged, returned or persisted
```

**Files changed:** `expert-prompt.ts` (v12 + the five additions), `package.json` (+2 scripts), seven
protected suites re-anchored v11→v12 with in-file reasons.
**Files added:** `fixtures/unsupported-settlement-probe-v7.ts`,
`scripts/lib/expert-raw-linkage-diagnostics.ts`, `scripts/test-expert-unsupported-settlement.ts`,
`scripts/probe-expert-unsupported-settlement-2026-09-03.ts`, and this evidence directory.

---

## 11. Remaining uncertainty

1. **US-D1 and US-I1 both carry fixture defects I authored**, found by reading the output. US-D1's
   observation partially answers its own question; US-I1's "deterministic derivation" was not
   deterministic. Both are scored strictly and attributed honestly.
2. **The v12 rule is proved on the shape it was built for and on ten rows.** One arm, one replicate.
   No rate, no distribution, no reproducibility claim.
3. **A residual mechanism is now isolated and is NOT the one §149 repaired.** US-D1 retained the
   doubt correctly and still asked nothing. Retention-without-a-question is a distinct target and
   would need its own operation.
4. **The raw-linkage closure is proved deterministically, not hosted** — this run produced no invalid
   attempt.
5. **The true-contradiction gate cannot be met as written** by a model that follows the contract.
   That is a finding for the owner, not a measurement.
6. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.
7. **Another expanded validation is NOT yet justified.** Two of five REQUIRED rows still fail, one on
   a mechanism v12 does not govern, and two fixture defects need repair before any larger run would
   measure the product rather than the instrument.
