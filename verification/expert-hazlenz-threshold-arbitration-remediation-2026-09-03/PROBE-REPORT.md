# §148 — Settlement-Threshold Narrowing (Workstream A) and the `affectedDecision` / Arbitration Policy Decision (Workstream B)

**Terminal:**

```
EXPERT_HAZLENZ_CLARIFICATION_REMEDIATION_FAILED — FURTHER_SEMANTIC_REPAIR_REQUIRED
```

Two separate workstreams, kept separate throughout and reported separately here.

**Workstream A succeeded on the defect it was built for.** The v10 threshold clause was made
conjunctive and operative (v10 → **v11**), and all **five** matched FORBIDDEN controls stayed silent —
including `TR-B3`, the CR-D1 structural analog built with proximity as the *only* remaining foothold —
**while both genuinely live threshold rows still asked.** §147's precision regression is closed and
the v10 recovery was not reverted.

**Workstream B reached a documented policy decision, backed by measurement rather than argument.**
Five options were evaluated; **A is retained byte-unchanged and E is adopted alongside it**.
`analysis.v2` is unchanged, `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE` is unchanged, and the repair
ships in the prompt.

**The probe nevertheless fails the recall gate, on one row.** `TR-E1` went silent on an unmarked
missing fact and the model settled it adversely in its own summary — the §147 defect class, on a row
with no threshold in it at all. **Strict delivered recall is 4 of 5 against a 100% gate.**

Bounded hosted probe: **10 calls, 10 requests, 0 retries, $0.453496 of a $1.2480 enforced ceiling.**
Historical `PROVIDER_INVOCATION_COUNT = 195` before and after. `FORMAL_EVALUATION_FAIL — NOT
ACCEPTED` untouched.

---

## 1. Execution facts

```
logical calls / provider requests   10 / 10        retries 0        suppressed 0
spend                               $0.453496      enforced ceiling $1.2480 (authorized $2.00)
tokens                              158,028 in / 13,744 out
latency                             12,727 – 29,393 ms
model                               anthropic / claude-sonnet-5      one arm (BASE)
prompt / contract                   hazlenz.expert.prompt.v11 / hazlenz.expert.analysis.v2
system-prompt SHA-256               d3ef737724eb609db7b7c18809969e815fe2b79e107c5bcbd830128a6ac799e6
wire-schema SHA-256                 2a369ca1717beb2192e5c21147d49cf02ca5d3fa4cd213bb3ae85ff23a1f2a4a
stop COMPLETED                      identityViolation null
disposition                         10 PRESENT, 0 OUTPUT_REJECTED, 0 provider failures
persistence                         10 records, 0 parse problems, 0 completeness problems
                                    sha256 3727a5ecaa9ba12374c34403128b32705930ac1e5a18572c6e9a1edeffdab51c
mid-run read-back                   TR-A1 read back FROM DISK with 9 calls outstanding
write-once identity                 second write refused, bytes stable (4e209b98fde9bfd2…)
raw wire (development instrument)    sha256 017857d10810677c26c9b73add3c8432969e200c115a7662c81f792a0a7b16bc
pre-spend gate                      38 / 38 PASS at $0.00
```

No `GATE-BLOCKED.txt` was produced, and the $0.00 dry run created no artifact other than the empty
evidence directory — the write-once identity was not consumed by it.

---

## 2. Workstream A — the repair

The §147 root cause of CR-D1 is precise and was not re-litigated: v10's third ESTABLISHED bullet
qualified a threshold as unsettled *"when the facts sit close to the value, **or** when the two are
not measured on the same basis."* Both qualifiers were **illustrative and disjunctive**. On CR-D1
neither actually held — 1,050 mm was mid-band and the observation stated the record's own datum — and
the model reached the clause anyway, because a disjunction of two soft descriptions is satisfied by
any reading that half-resembles either limb.

**v11 states the settled reading FIRST and affirmatively, then makes reopening CONJUNCTIVE:**

> **A THRESHOLD IS NOT A GAP.** … If the evidence gives you (1) the measured value, (2) the basis it
> was measured on, and (3) enough of the record to see which side or band that value occupies, then
> how the condition applies here **IS ESTABLISHED** for the decision it governs. Do the arithmetic,
> state the answer and move on. …
>
> It is unsettled **ONLY where BOTH** of these hold: **(i)** something OBJECTIVE — stated in the
> observation, in the deterministic findings, or in the record itself — gives a concrete reason the
> value or its basis may not be the comparison this record actually turns on …; **AND (ii)** resolving
> that could put these facts on the OTHER SIDE of the line. **BOTH, never either.**

Four things are named as insufficient on their own, each because it is a move that was made or was
available: **proximity** (*"near the line is a side of the line"*), the **mere existence** of another
measurement basis, **imagined** measurement uncertainty, and the availability of a **more exact
figure**. Two reopening shapes are named as still legitimate: a genuinely different **datum**, and an
**aggregate the record itself demands** but the text withholds — the second is CR-E2's shape and is
what stops the narrowing becoming a revert.

**Nothing was removed.** The worst-case-assumption bullet, the resemblance-to-a-programme bullet, the
scoped invariance limb and THE SETTLEMENT CHECK are all byte-unchanged and were verified present in
the text actually sent (`F.7`).

---

## 3. Workstream A — result. The narrowing worked, in both directions

### 3.1 All five FORBIDDEN controls stayed silent

| row | shape | outcome |
|---|---|---|
| **TR-B1** | threshold clearly SATISFIED below | **SILENT — correct** |
| **TR-B2** | record BITES and its demand is MET | **SILENT — correct** |
| **TR-B3** | **CLOSE to the boundary, fully settled** | **SILENT — correct** |
| **TR-B4** | another measurement concept exists, irrelevant | **SILENT — correct** |
| **TR-F1** | ordinary NO-GAP control, no threshold | **SILENT — correct** |

**TR-B3 is the row that decides Workstream A**, and it was built so that a pass could not be
accidental: 0.52 m/s against a 0.5 m/s minimum, with the instrument, the plane, the sash height and
the averaging each named by the record *and* by the observation in the same words. Proximity was the
only foothold left. The model computed it and moved on, in terms:

> *"The measured face velocity (0.52 m/s, averaged across nine readings at the working sash height
> with a calibrated meter) **meets** the supplied governed record's minimum of 0.5 m/s… so the primary
> control for the solvent extraction is **functioning as required**."*

That is the sentence CR-D1 wrote and then contradicted by asking anyway. Under v11 it is the whole
answer.

**TR-B2 closes a hole §147's evidence could not see.** CR-C1 proved silence on an *exception that
reached the facts* — compatible with a model that simply never asks about a rule it believes is
switched off. TR-B2 is the case where the rule plainly **applies** and is **satisfied**, and it was
also silent.

### 3.2 And both genuinely live threshold rows still asked

A narrowing that silenced the real cases would be a worse defect than the one it repaired.

**TR-C1 — BASIS_AMBIGUOUS. Recovered.** The record's action level is an eight-hour time-weighted
average; the observation reports a single instantaneous 88 dBA reading. The model named the mismatch
as the reason, not the margin:

> *"…the supplied governed record measures the hearing conservation action level as an 8-hour
> time-weighted average dose, and the observation itself notes no duration or dosimetry data was
> captured to make that comparison — so whether the action level is actually triggered remains open."*

Note that 88 is **above** 85. This is not proximity and the model did not treat it as such.

**TR-C2 — AGGREGATE_MISSING, unmarked. Recovered.** The record defines the compared quantity as the
total including below-the-hook devices and rigging; the observation gives neither weight. The model
asked for *"the combined weight of the steel fabrication, spreader beam, and chain slings"* and wrote
both branches. **This is the CR-E2 shape on unrelated facts, and its recovery is the direct evidence
that v11 narrowed rather than reverted.**

---

## 4. Workstream B — the policy decision

Five options were evaluated against the frozen architecture. Full matrix and measurements:
`backend/scripts/test-expert-affected-decision-arbitration.ts`, **41 assertions, 0 failed, $0.00**.

| option | disposition |
|---|---|
| **A** reject the whole clarification | **RETAINED — byte-unchanged** |
| **B** keep the question, strip/neutralize the label | **REFUSED** |
| **C** deterministically reclassify `affectedDecision` | **REFUSED** |
| **D** reclassify only where another reading is objectively inferable | **REFUSED** |
| **E** keep fail-closed arbitration; repair label accuracy at the model | **ADOPTED, alongside A** |

### 4.1 The finding that decided it

Arbitration is fail-closed **on the LABEL, not on the semantics — and it trusts the label in BOTH
directions.** Matrix case 6 proves it: a question whose text plainly asks *"Does a fire and explosion
hazard exist here at all?"*, labelled `REQUIRED_CONTROL` and linked to an ACTIVE candidate,
**survives untouched**. The stage cannot tell a wrong label from a wrong question in either
direction, because both distinctions live in the text it does not read.

So there is **no deterministic repair that makes the stage semantically correct.** There is only a
repair that makes the LABEL correct — which is the owner's earliest-trustworthy-layer principle
arriving at option E by force rather than by preference.

### 4.2 Option B is a contract change, not a behaviour change

`affectedDecision` is a **`required` wire field** and non-nullable in the analysis type, so a
"stripped" label has no representation. The boundary already refuses an unlabelled clarification
(`CLARIFICATION_NOT_DECISION_CRITICAL`, L3-INV-06), `EXPERT_MEASURE_SCORERS` reads the field for
equality, and a neutralized label would hand the reviewer a question whose decision relationship is
unknown — **strictly worse than the arbitration it replaces**, because a question contradicting an
ACTIVE candidate would then reach the customer with no label left to contradict on.

### 4.3 Options C and D were measured, and the first argument against them FAILED

This is recorded because it happened, not because it helps.

A keyword reclassifier of the kind C would need was built and run against the seven cases. The suite
was authored expecting it to corrupt a correct label. **It did not.** In sample it decided 6 of 7 and
was **correct on all 6**, and it *would* have rescued CR-F2. That is written into the suite as
`R.4 — MEASURED, AND IT CONTRADICTS THE ARGUMENT THIS SUITE SET OUT TO MAKE`, rather than the case
being rewritten until the rule failed.

The refusal rests on what survived that:

- **`R.5`** To catch case 6, the same rule must **DESTROY** a question on a keyword match. C is not a
  rescue mechanism; it is a **new deletion mechanism**. §138 measured the cost of that class of
  guessing at **6 of 11** flagged contradictions being label artefacts.
- **`R.6`** On the ambiguous row the rule abstains — so C **degenerates to the current behaviour
  exactly where the rescue was wanted**. Option D's "objectively inferable" gate is the same inference
  grading its own confidence.
- **`R.7`** Arbitration has fired **ONCE** on hosted evidence in the entire programme (§147 CR-F2), so
  a rule that decides when to destroy a question **cannot be calibrated against any population**. C
  would ship an uncalibrated deletion authority to repair an n=1 observation.
- **`R2` — and out of sample it does corrupt.** Run against ten §147 fixture question strings authored
  days before the rule existed, it decided 6 of 10 and is **demonstrably wrong on at least 2**:
  - a question about whether a measured height meets a supplied record's band derives
    `REQUIRED_CONTROL`, because **"guardrail" contains "guard"**;
  - **the word "actually"** makes a control-effectiveness question derive `HAZARD_EXISTENCE` — *the one
    label that deletes*. Under option C, an adverb destroys a question beside any ACTIVE candidate.

  **6/6 correct in sample against 4/6 out of sample is the in-sample artefact, measured.**

### 4.4 What option E ships

v11 adds, in the system prompt and mirrored in the wire schema: the **self-check against the model's
own candidate list** before writing `HAZARD_EXISTENCE`; the **four routes** for the cases that get
mislabelled as existence; and — the part v10 never said — **the CONSEQUENCE**: *"A clarification
labelled HAZARD_EXISTENCE that names one of your own ACTIVE candidates is DISCARDED IN FULL… and the
reviewer never sees it."* The producer was previously given the rule and never told that breaking it
destroys the question.

It **cannot increase question frequency**: every route leads to a different enum member on a question
already decided upon, and the prompt says so in terms (`A3.7`).

**`CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE` is not weakened, narrowed or made conditional.** Its
trigger is still label + declared link + ACTIVE, it still abstains with no declared link, it still
fires on nothing but `HAZARD_EXISTENCE`, and it still requires the candidate to be ACTIVE (`P.3`–`P.3d`).
**`affectedDecision` accuracy is now a required model-side gate** rather than a cosmetic measure.

---

## 5. Workstream B — hosted result, reported carefully

| gate | target | observed | met |
|---|---|---|---|
| affectedDecision survival | 100% | **5 / 5 = 1.0** | **yes** |
| reasoned-but-destroyed | reported separately | **0** | — |
| true contradiction rejection | 100% | **denominator 0** | **NOT EXERCISED** |
| arbitration events | — | **0** | — |

### 5.1 The survival figure is met and must not be over-read

**Zero clarifications were destroyed. Zero arbitration events fired. And the configuration the gate
exists to detect never arose** — no clarification was emitted with a `HAZARD_EXISTENCE` label naming a
candidate the model itself asserted ACTIVE. `TRUE_CONTRADICTION_REJECTION` is reported as **`null` /
NOT EXERCISED**, not as 100%: a rate with an empty denominator is not a pass.

### 5.2 TR-D1 survived — and it survived by a hair, for a principled reason

`TR-D1` is the row built to put a valid `REQUIRED_CONTROL` question beside an ACTIVE fire/explosion
candidate. **The model labelled its question `HAZARD_EXISTENCE`.** It survived anyway, and the reason
is worth stating exactly:

```
candidates emitted on TR-D1
  hotwork-fuel-vapor           hot_work         ACTIVE
  fire-explosion-vapor-space   fire_explosion   INSUFFICIENT_EVIDENCE   <- the clarification's link
  mobile-bowser-uncontrolled   fire_explosion   ACTIVE
```

The model **decomposed `fire_explosion` into two candidates**, left the vapour-space limb at
`INSUFFICIENT_EVIDENCE`, and linked its `HAZARD_EXISTENCE` question to *that* one. Arbitration
abstained because the linked candidate is not ACTIVE — which is correct, and is the §138 rule that
family-level coupling would have broken.

**So the model performed the v11 self-check correctly on its own terms**: it did not assert the
hazard it was asking about. The label is defensible; my fixture's `REQUIRED_CONTROL` is also
defensible. **This is a vocabulary-boundary dispute, not a clean model defect, and it is recorded as
one.**

But the honest reading of the survival gate is this: **an ACTIVE `fire_explosion` candidate existed on
that row, and had the model linked to it instead, the question would have been destroyed exactly as
CR-F2 was.** The gate passed on a decomposition choice, not on demonstrated routing accuracy.
**Nothing here establishes that the v11 routing disclosure prevents a CR-F2 recurrence.** It was not
tested, because the error did not occur.

### 5.3 Label accuracy, reported as its own diagnostic

`LABEL_EXACT_MATCH_ON_REQUIRED_ROWS = 2 / 5` against the authored labels. Two are disputes rather
than defects — `TR-C1` (`APPLICABILITY` vs authored `REGULATORY_INTERPRETATION`) and `TR-C2`
(`REGULATORY_INTERPRETATION` vs authored `REQUIRED_CONTROL`) sit on the exact `APPLICABILITY` /
`REGULATORY_INTERPRETATION` boundary the contract type already flags as a collision pair, and the
model's reading is defensible on both. The third, `TR-D1`, is §5.2. **None of the three was
destructive**, and §146's 3-of-6 figure is neither confirmed nor improved on five observations.

---

## 6. Why the terminal — the one row that fails

**`TR-E1` went silent, and the strict delivered recall gate is 100%.**

| row | shape | absence | outcome |
|---|---|---|---|
| **TR-A1** | unmarked, non-threshold | **unmarked** | **RECOVERED** |
| **TR-C1** | measurement-basis ambiguity | marked | **RECOVERED** |
| **TR-C2** | aggregate the record demands | **unmarked** | **RECOVERED** |
| **TR-D1** | ACTIVE hazard, control question | marked | **RECOVERED** (label disputed, §5.2) |
| **TR-E1** | atmospheric test before entry | **unmarked** | **SILENT — MISS** |

**Strict delivered recall: 4 of 5. As reasoned: also 4 of 5 — nothing was destroyed, so the two
figures coincide for the first time in the programme.**

### 6.1 TR-E1 is the §147 defect class, unrepaired, on a row with no threshold in it

The model settled the unmarked fact **adversely** and then had nothing to ask:

> *"…accessed only by an unsecured ladder with **no tripod, winch, gas monitor, or rescue harness in
> use** — this is an active permit-required confined space entry with an **unmonitored atmospheric
> hazard**… the observation itself establishes both the confined space and atmospheric exposures as
> present right now **with no controls in place**."*

The observation says a gas monitor is **not visible**. *"Unmonitored"* and *"no controls in place"*
are the model's inference, asserted as fact. Having resolved the question, it did not ask it — which
is **adverse-branch collapse (EV-A4) compounded by invariance-by-subsumption (EV-A2)**, the two
mechanisms v10's SETTLEMENT CHECK was written to catch. Both were verified present in the prompt
actually sent (`F.7`).

**This is not attributable to the v11 narrowing.** `TR-E1` has `thresholdShape = NONE` and supplies no
governed record, so the narrowed clause is not reachable on it. That attribution is **reasoned, not
measured**: no v10 counterfactual was run on this row, and the probe is one arm and one replicate.

### 6.2 Terminal selection

The authorization's table maps this exactly:

- *"If local gates pass but hosted targeted probe fails recall"* → **the terminal issued.**
- `— CLARIFICATION_PRECISION_REGRESSION` was considered and **rejected**: precision did not regress at
  all. 5 of 5 FORBIDDEN controls silent, 0.50 clarifications per call (§147: 0.70; §146: 0.435).
- `— AFFECTED_DECISION_ROUTING_REPAIR_REQUIRED` was considered and **rejected**: no valid
  clarification was lost to routing or arbitration.
- `— SETTLEMENT_REPAIR_FAILED` and `— ARBITRATION_POLICY_UNRESOLVED` do not apply: local gates passed
  and the policy was decided.

---

## 7. Regression axes — clean, with one linkage defect disclosed

| readout | value |
|---|---|
| `INVALID_CLARIFICATION_OBJECTS` | **0** |
| citations — input / Expert output / accepted / merged | **0 / 0 / 0 / 0** |
| supplied-record citations (redaction exercised) | 12 |
| citation-shaped text in the captured raw wire | **0** |
| `PROTECTED_AUTHORITY_CONTRADICTIONS` | **0** |
| forbidden-family candidates emitted | **0** of 17 candidates |
| deterministic regression | **none** — union coverage **7/7**, Expert added all 7 truth-present families the engine missed |
| clarifications per call | **0.50** (§147: 0.70, §146: 0.435) |
| protected suites, before and after | **20 / 20 identical** |
| `SOURCE_PROJECT_TSC` | **PASS** (`src/**/*` only — does **not** cover `backend/scripts/`) |
| `ACTIVE_SCRIPT_EXECUTABLE_PROOF` | **TRUE** before and after spend |

**One linkage defect, disclosed rather than absorbed.** On `TR-C2` the model set
`relatesToCandidateKey = "haz-2"`, which names no candidate it emitted (it emitted
`cand-manual-steering`). `CLARIFICATION_LINK_UNRESOLVED` fired, the key was stripped and **the
question was kept** — the §141 non-destructive behaviour, working. `INVALID_LINKAGE_STRIPPED = 1` in 5
emitted clarifications.

**An instrument note falls out of it.** `linkageDiagnostics` reports
`INVALID_LINKAGE_ATTEMPTS = 0` on the same row, because that counter reads the **validated** output,
from which the broken key has already been stripped. **An invalid attempt is invisible to the
attempts counter and only the STRIPPED counter sees it.** Recorded as an instrument limitation; not
repaired here, because doing so is outside this operation's authorized minimum.

---

## 8. The one new instrument, and the observability decision it forced

§147 could not report CR-F2 properly: the question was destroyed and **its text was unrecoverable**,
because the run record stores the *validated* analysis. All §147 could quote was a surviving sentence
in the summary that happened to mention the same fact.

The §148 authorization requires delivered recall and reasoned-but-destroyed to be reported
**separately**, which is impossible without the destroyed text. So the probe wraps the provider in a
**development-only capturing decorator** and writes `RAW-WIRE.jsonl`.

**The §147 `offendingText` field was deliberately NOT broadened**, and the reason is a real
architectural boundary rather than caution. That field is safe because *"all three codes are
`ANALYSIS_FATAL`, so a populated field implies `validated === null`."*
`CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE` is **non-fatal** — extending the field to it would put
model text on an **accepted** analysis and break the very invariant that made it safe. The
observability need is real; it is met in the instrument, where it costs the product nothing.

**Production is untouched by this**: the decorator implements the `ExpertProvider` interface and lives
in the probe script. `expert-runner.ts`, `expert-normalization.ts`, the merge and the customer path
are byte-unchanged, and no production module imports the script. The captured wire is
citation-scanned before it is written (**0 hits**).

---

## 9. Confinement

```
reserved material                     NOT opened
spent formal cohort                   NOT read, copied, paraphrased or mimicked
historical evidence                   UNMODIFIED — §147 probe script f17ed58d…, fixture v5
                                      d5cb48b8… and RUN-RECORDS 0cd48458… all verified byte-identical
                                      against §147's own recorded hashes
spent probe scripts                   NOT edited
formal scorers / truth / thresholds   UNCHANGED
new formal cohort                     NONE
M14_REMEDIATION_STATUS                NOT_ATTEMPTED
deterministic HazLenz behaviour       UNCHANGED
arbitration                           UNCHANGED — trigger byte-identical
analysis.v2                           UNCHANGED — no field, enum member or required entry moved
production / database / customer      UNTOUCHED
commit / push / tag / deploy          NONE
credential                            read from the environment; never logged, returned or persisted
expanded validation                   NOT RUN
```

**Files changed:** `expert-prompt.ts` (v11 + both clause repairs), `expert-contract.types.ts`
(documentation of the §148 policy decision only — no type moved), `package.json` (+2 scripts), six
protected suites re-anchored v10→v11 with in-file reasons, `test-expert-clarification-settlement.ts`
(sections A2, A3, C2 added; A.1 and A.6 re-anchored).
**Files added:** `fixtures/threshold-arbitration-probe-v6.ts`,
`scripts/test-expert-affected-decision-arbitration.ts`,
`scripts/probe-expert-threshold-arbitration-2026-09-03.ts`, and this evidence directory.

---

## 10. Remaining uncertainty

1. **The routing repair is UNTESTED, not proven.** The CR-F2 configuration never arose in ten calls.
   Survival passed on a candidate-decomposition choice (§5.2), and one arbitration event in the whole
   programme remains the entire hosted evidence base for this stage.
2. **`TR-E1`'s attribution is reasoned, not measured.** No v10 counterfactual was run on it.
3. **Ten rows, one arm, one replicate.** No rate, no distribution, no reproducibility claim. The
   Workstream A result is strong *because the FORBIDDEN half was matched and complete*, not because
   five is a large number.
4. **Two of three label mismatches are vocabulary-boundary disputes I authored**, found by reading the
   output. §146's `affectedDecision` accuracy figure is neither confirmed nor improved.
5. **The linkage-diagnostic blind spot in §7** is disclosed and unrepaired.
6. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.
7. **Another expanded validation is NOT yet justified.** One REQUIRED row still fails on the §147
   settlement class, and an expanded run would measure that unrepaired residue rather than the
   product.
