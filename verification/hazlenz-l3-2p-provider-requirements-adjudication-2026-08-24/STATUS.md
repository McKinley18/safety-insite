# L3-2p — PROVIDER-REQUIREMENTS ADJUDICATION: SAFETY-OUTCOME vs MODEL-OUTPUT DETERMINISM

> ## `PROVIDER_REQUIREMENTS_REFINED — SAFETY_OUTCOME_REQUIREMENTS_PRESERVED`
> ## `P-02 AND P-08 MEASURED SOMETHING BROADER THAN THEY REQUIRE — THE REFINEMENT IS STRICTLY STRONGER ON SAFETY`
> ## `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **ADJUDICATION ONLY.** Zero production files,
prompt bytes, schema bytes, validator semantics, binder semantics, scorers or historical harnesses
modified. **Zero inference of any kind — hosted or local. Zero API cost. No credential read.**
Nothing committed, pushed or deployed; no stash operation; **no sealed corpus opened**; L3-3 not
begun; no provider selected; no historical provider result rewritten.

§47.8 route 2 named this phase in advance: *"`P-08` may be unobtainable from any current hosted model
… if so, `PROVIDER_REQUIREMENTS.md` itself needs a decision, and **changing a requirement is the
user's call, never a response to a provider failing it**."* The user made that call. This is that
adjudication, and it is executed on **frozen artifacts only** — every number below is recomputed by
`analysis/adjudicate.js` from run files that already existed at `a7b21a26`.

---

## 1 — What `P-02` was for, and what it came to measure

### 1.1 The written requirement is a SCHEMA requirement `RECOVERED`

`PROVIDER_REQUIREMENTS.md`, unaltered:

| # | Requirement | Why, from measured evidence |
|---|---|---|
| P-02 | **High schema adherence** — ≥99% valid against a strict schema after ≤1 retry | the L3-2 acceptance gate |

Three things are recoverable from that row and its neighbours, and all three matter.

**It names a schema, not a validator.** P-01 immediately above it cites `L3-INV-07` explicitly.
**P-02 cites no invariant at all** — its justification is *"the L3-2 acceptance gate"*, a
programme threshold, not an architectural contract.

**It was originally measured as schema adherence.** `PROVIDER_SELECTION.md` scored it for the
selected provider as *"**100%** — 0 malformed outputs, 0 retries in 81 analyses"*. That is a
parse/shape metric: did structured output come back conformant.

**Nothing in `L3-INV-01`…`L3-INV-12` requires a provider validity RATE.** The invariant set, read
from `contracts/authority-map.json`, contains no rate, no threshold and no reproducibility clause.
`L3-INV-02` (evidence-bound findings) is guaranteed by the **validator**, whatever the provider does.

### 1.2 What the qualification phases actually measured `NEW_EVIDENCE`

`L3-2n/adapter/score.js` and its byte-identical `L3-2o` successor count a rejection as:

```js
if (r.validationState && r.validationState !== 'VALID') { t.rj++; ... }
```

That is **whole-proposal acceptance by `deterministic-safety-validator.ts`**, which enforces
semantic properties a JSON schema cannot express. The code that decided both qualifications,
`UNGROUNDED_CORRECTIVE_ACTION`, requires `correctiveActionIntent.groundedInEvidence` to match a span
of the candidate's own evidence by **exact `sourceId:startOffset:endOffset` identity**. No schema
keyword can state that.

> **The requirement says "valid against a strict schema"; the metric says "accepted by the
> deterministic safety validator". Those are different properties, and the second is strictly
> broader.** Under §24 this is `INSTRUMENTATION`: the measurement does not measure the contract it
> names. Under §22 the required response is to repair the measurement, **not** to change correct
> production behaviour — and correct production behaviour here is the validator, which this phase
> does not touch.

### 1.3 On the cohort actually used, "≥99%" is arithmetically a ZERO gate `MEASURED`

The qualification cohort has **24 rows**. 23/24 = 95.8%; 24/24 = 100%. **There is no attainable value
between 95.8% and 100%**, so on this cohort `≥99%` is not a 99% quality threshold — it is
`zero rejections of any kind`. The same collapse holds at the original 81-analysis cohort
(80/81 = 98.8%).

§29.8 is explicit that these are two different kinds of gate: *"**Hard safety gates sit at zero**
(fabricated citations, fabricated evidence, default-ACTIVE from uncertainty, unsupported findings,
unreviewed-as-governed, unsafe corrective action, silent L1 fallback). **Quality thresholds are set
above the measured baseline with margin.**" `P-02` is written as a quality threshold and **operates
as a hard-zero gate** — and "any validator rejection" is **not** on §29.8's hard-zero list.

### 1.4 The consequence, measured across every provider ever run `MEASURED`

Recomputed by `analysis/adjudicate.js` from the six frozen shipped-cohort artifacts:

| provider | aggregate validity | rejections |
|---|---|---|
| `claude-sonnet-5` A / B | **95.8% / 91.7%** | 1 / 2 |
| `gemini-3.7-flash` A `*` | 70.8% | 7 |
| `gemini-3.6-flash` A `*` | 83.3% | 4 |
| `gemini-3.1-pro-preview` `*` | **95.8%** | 1 |
| `qwen3-coder:30b` `*` | **95.8%** | 1 |

> #### `NO PROVIDER EVER MEASURED HAS PASSED P-02 AS APPLIED — INCLUDING THE ONE PROVIDER_SELECTION.md RECORDED AT P-02 = 100%`
>
> `qwen3-coder:30b` scores **95.8%** on the applied metric and **100%** on the written one. The gap
> between those two numbers is the whole finding. A requirement that no candidate has ever satisfied,
> including the incumbent, is not selecting between providers — it is rejecting all of them.

### 1.5 `P-02` AS WRITTEN IS SATISFIED AT 100% BY EVERY PROVIDER EVER MEASURED `MEASURED`

Scanning every validation issue in the eight frozen shipped-cohort and ladder artifacts —
**147 rows across all five providers** — exactly **two** validator codes have ever fired:

| code | occurrences | is it a schema property? |
|---|---|---|
| `UNGROUNDED_CORRECTIVE_ACTION` | **15** | **No.** Requires exact evidence-span identity within a candidate; no schema keyword can express it |
| `DUPLICATE_CANDIDATE` | **1** | **No.** Requires cross-candidate semantic comparison of family, state and evidence |
| `SCHEMA_INVALID` | **0** | — |
| every `NON_RETRYABLE_VALIDATION_REASONS` code (evidence fabrication, invented citation, governance, authority) | **0** | — |
| harness errors | **0** | — |

> **Zero schema failures, on every provider, on every run.** `P-02` as *written* — schema adherence
> after ≤1 retry — has a perfect record. Both qualification failures rest entirely on **two semantic
> codes that the requirement's own text does not describe.**

---

## 2 — Rejection-severity taxonomy `NEW_EVIDENCE`

The architecture already grades rejections; the metric does not.
`validation-result.types.ts` carries **three** fatality classes — `NON_BLOCKING_VALIDATION_REASONS`
(the two L3-2i codes, *recorded but not fatal*), `RETRYABLE_VALIDATION_REASONS`, and
`NON_RETRYABLE_VALIDATION_REASONS` — under §34.2's rule, lifted verbatim into the source:

> `A SUPERFLUOUS QUESTION IS DROPPED; IT NEVER DESTROYS THE ANALYSIS THAT CARRIED IT`

So the principle that a defective **auxiliary, non-authoritative** proposal element must not destroy
a correct hazard analysis is **already HazLenz architecture**, not a proposal made here. The question
this phase answers is narrower: does *provider qualification* have to weigh every rejection equally
when the *pipeline* already does not.

### 2.1 The measured split

The runner discards the entire proposal on any deciding issue (`reasoning-runner.ts`), so the
consequence of a rejection is decided by **which row it lands on**:

| class | definition | customer consequence |
|---|---|---|
| **`SAFETY_CONSEQUENTIAL`** | rejection on a row whose ground truth owed a hazard (`expectActive === true`) | the owed hazard is **not delivered**. On a high-consequence row this is a real safety loss |
| **`SAFETY_PRESERVING`** | rejection on a row that owed no hazard | the deterministic layer refused unsupported output; the customer-facing safety decision — *no hazard here* — is unchanged. §29.6 `ANALYSIS_UNAVAILABLE`, `L3-INV-05` operating as designed |

| provider | rejections | `SAFETY_CONSEQUENTIAL` | `SAFETY_PRESERVING` | validated HC |
|---|---|---|---|---|
| **`claude-sonnet-5` A** | 1 | **0** | 1 — `F-COR-01` | **13/13** |
| **`claude-sonnet-5` B** | 2 | **0** | 2 — `F-NC-01`, `F-COR-01` | **13/13** |
| `gemini-3.7-flash` A `*` | 7 | **6** — `E-OA-07`, `F-FLD-159` (HC) + 4 `REGRESSION_ACTIVE` | 1 | 7/13 |
| `gemini-3.6-flash` A `*` | 4 | **3** — `F-FLD-159` (HC) + 2 `REGRESSION_ACTIVE` | 1 | 10/13 |
| `gemini-3.1-pro-preview` `*` | 1 | **0** | 1 — `F-COR-01` | 13/13 |
| `qwen3-coder:30b` `*` | 1 | **1** — `E-FLD-147` (HC), `DUPLICATE_CANDIDATE` | 0 | 11/13 |

> **`qwen3-coder:30b` and `claude-sonnet-5` run A score the IDENTICAL 95.8% under `P-02`.** One
> destroyed a high-consequence hazard; the other destroyed nothing. **The aggregate metric cannot
> tell them apart, and §29.8's hard gates are exactly the thing it fails to see.** That is the
> demonstrated defect, and it is measured, not argued.

### 2.2 The `UNGROUNDED_CORRECTIVE_ACTION` events specifically

They are **not** equivalent in safety consequence to a rejection that destroys a correct
high-consequence hazard. The same code produced both outcomes in the same corpus: 6 destroyed
hazards on `gemini-3.7-flash`, 0 on `claude-sonnet-5`. §47.2 already recorded this — *"Same rule,
same code, materially different consequence"* — without drawing the qualification consequence.

Counting a `SAFETY_PRESERVING` rejection against a provider counts **a safety control operating
correctly** as evidence of unfitness. `L3-INV-05` and `L3-INV-08` make refusal the designed
behaviour; §29.8's hard-zero gate on *unsafe corrective action* is held **by** that refusal.

**One bounded unknown, recorded rather than glossed:** the frozen artifacts store the rejection
`code` but not the validator's `detail`, so it cannot be determined from existing evidence whether
`F-COR-01` failed on *"carries no evidence reference"* or on *"evidence is not among this
candidate's evidence"* (an exact-span mismatch). Resolving it would require re-running a provider.
**It does not change this adjudication**, which turns on which rows the rejections landed on — fully
recorded — not on the sub-mechanism. `F-COR-01` rejects on **four of the five** models measured,
which is recorded as an observation about that scenario and is **not** developed here.

---

## 3 — What `P-08` was for `RECOVERED`

| # | Requirement | Why |
|---|---|---|
| P-08 | **Deterministic-enough reproduction** — temperature control and stable behaviour at fixed settings | *evaluation must be re-runnable* |

**The stated rationale is evaluation infrastructure, not customer safety.** As with `P-02`, no
invariant is cited and none exists: nothing in `L3-INV-01`…`L3-INV-12` requires determinism,
reproducibility or seed control.

Two further recoveries bound it:

* **The acceptance run is single-use by construction.** §29.8 opens the sealed holdout *"once per
  acceptance run and then retired"*. A single-use run is **not re-runnable at any provider
  determinism level**, so `P-08`'s rationale cannot be about the sealed run. It is about the
  development and qualification loop, where what must be stable is the **conclusion**.
* **Model-output determinism was never attained even locally.** `PROVIDER_SELECTION.md` records the
  selected provider at temperature 0 with a fixed seed as **65 of 66 identical** — 98.5%, not 100%.
  `P-08` has never been met in the absolute sense by anything.

### 3.1 The `6/24` figure is a METRIC CHANGE, not a provider property `NEW_EVIDENCE` `INSTRUMENTATION`

`D-72` records `claude-sonnet-5` at **6 of 24** rows differing and calls it *"the worst
reproducibility of any provider measured"*, against `2/24` for `gemini-3.7-flash` and `3/24` for
`gemini-3.6-flash` recorded by `L3-2n`.

**Those numbers were produced by two different comparison keys.** `L3-2o/adapter/score.js` preserves
its key; `L3-2n/adapter/score.js` contains **no noise-floor computation at all**, so its recorded
figures were produced by a definition the artifact does not carry. Recomputing both pairs under each
candidate key identifies which one `L3-2n` used:

| comparison key | 3.7-flash | 3.6-flash | `claude-sonnet-5` | 3.1-pro-prev |
|---|---|---|---|---|
| **L3-2o's 8-field key** (adds `candidateCount` + `modelStates`) | 3/24 | 5/24 | **6/24** | 2/24 |
| **L3-2n's 6-field key** — reproduces its recorded 2/24 and 3/24 **exactly** | **2/24** | **3/24** | **3/24** | **0/24** |
| **material safety outcome only** | 1/24 | 2/24 | **0/24** | **0/24** |

> #### `THE HEADLINE COMPARED SONNET-5 UNDER AN 8-FIELD KEY AGAINST GEMINI BASELINES RECORDED UNDER A 6-FIELD KEY`
>
> On `L3-2n`'s own key `claude-sonnet-5` is **3/24** — tying `gemini-3.6-flash` and one row behind
> `gemini-3.7-flash`. **It is not the worst reproducibility measured.** The two fields `L3-2o` added,
> `candidateCount` and `modelStates`, are **hazard-decomposition granularity** — how many candidates
> one hazard is split into, and in what order. That is `RC-04` territory and a real product axis, but
> it is not one of §29.8's hard gates and it was not in the baseline the ranking was made against.

This is the same failure mode §38.3 already documented one layer down — *"a cross-provider harness
that runs its repeat control in the same process … manufactures ~12% false variance and will
attribute a harness artifact to the provider"* — and the same failure `D-58` fenced when *"one number
travelled through §37 and §38 meaning something narrower than it appeared"*. The standing
`MUST_REVERIFY` entry `l32jCrossProviderClosure.measurement.shippedLadder.noiseFloorShippedInstrument`
already warns that the floor is **instrument-dependent**. It is also **key-dependent**, and that is
new.

**`D-72` is not withdrawn.** Its structural half — *on Claude 4.7 and later there is no determinism
control at all; `temperature` and `seed` are inexpressible* — is confirmed and untouched. Only the
comparative ranking clause is superseded, on new evidence, per §25.

---

## 4 — Model variance vs safety variance, row by row `MEASURED`

All six `L3-2o` differing rows, classified from the frozen artifacts:

| row | pole | what differs A → B | class |
|---|---|---|---|
| `F-CL-01` | `CLARIFICATION_REQUIRED` | `outcome` `INSUFFICIENT_EVIDENCE` → `ANALYZED`; `modelStates` **identical** `["INSUFFICIENT_EVIDENCE"]`, hazard count identical, clarification carried identically, neither run asserts | **C — derived-label only.** The runner derives `INSUFFICIENT_EVIDENCE` when the *binder* demoted rather than the *model* proposing it. Same underlying state, same customer decision |
| `F-CL-03` | `CLARIFICATION_REQUIRED` | the same flip in the other direction | **C — derived-label only** |
| `B08` | `REGRESSION_ACTIVE` | 5 → 4 candidates, all `ACTIVE` plus one `INSUFFICIENT_EVIDENCE`; hazard delivered in both | **B — decomposition granularity** |
| `H-AM-05` | `REGRESSION_ACTIVE` | 1 → 2 candidates, both `ACTIVE`; hazard delivered in both | **B — decomposition granularity** |
| `H-NG-02` | `REGRESSION_ACTIVE` | 1 → 2 candidates, B adds a **`NEGATED`** (non-asserting) candidate; hazard delivered in both | **B — decomposition granularity** |
| `F-NC-01` | `DECIDED_NON_ACTIVE` | `VALID` → `REJECTED_MODEL_OUTPUT` (`UNGROUNDED_CORRECTIVE_ACTION`) | **B — auxiliary rejected output.** A correct `NO_HAZARD_ESTABLISHED` is lost in B. **`SAFETY_PRESERVING`**: no false ACTIVE, no HC hazard lost |

**Class A — customer/safety-decision differences: ZERO.** Across all 24 rows and both isolated
processes:

| axis | rows differing |
|---|---|
| `modelAssertsActive` | **0 / 24** |
| `validatedAssertsActive` | **0 / 24** |
| `candidateBorneClarification` | **0 / 24** |
| `proposalLevelClarification` | **0 / 24** |
| `validatedProposalLevelClarification` | **0 / 24** |
| `clarificationCarriedAnywhere` | **0 / 24** |
| `raisedClarification` | **0 / 24** |
| all 6 high-consequence rows, both tiers | **0 / 24** — `ACTIVE` in both runs |
| false ACTIVE across 11 negative rows | **0 in A, 0 in B** |

> #### `A PROVIDER WITH NO DETERMINISM CONTROL AT ALL REPRODUCED EVERY MATERIAL SAFETY OUTCOME EXACTLY, TWICE, IN ISOLATED PROCESSES`
>
> That is the empirical core of this adjudication. The deterministic envelope did what it was built
> to do: it absorbed the model's variance and emitted a stable safety decision. `gemini-3.7-flash`
> and `gemini-3.6-flash`, both of which *did* accept `temperature`, moved a **material safety axis**
> on 1 and 2 rows respectively — **worse than the provider with no controls at all.**

---

## 5 — Adjudication

### 5.1 `P-08` → **`P08-B`** — validated safety-outcome determinism is what the architecture requires

The architecture requires **`HAZLENZ SAFETY-OUTCOME DETERMINISM`**, not `MODEL OUTPUT DETERMINISM`.
No invariant requires the latter; §29.4 places the model's output under **SEMANTIC (validated)**
authority and `L3-INV-08` makes it *a proposal until validation succeeds*; the entire
`provider → validator → binder → outcome` sequence in `reasoning-runner.ts` exists to convert a
probabilistic proposal into a deterministic decision. Requiring the proposal itself to be
deterministic requires the pipeline to be redundant.

**`MATERIAL` outcomes, defined exactly** — every one already computed by the frozen scorer, none
invented here:

1. high-consequence disposition (`validatedAssertsActive` on `expectActive` rows);
2. false ACTIVE (`validatedAssertsActive` on non-`expectActive` rows);
3. clarification obligation — candidate-conditioned **and** scenario-level, per `D-58`;
4. final validated condition state of every delivered candidate;
5. customer-visible hazard existence (delivered vs not delivered);
6. evidence grounding — fabricated or unsupported evidence reaching output;
7. authority boundary — invented citation, governance field, or jurisdiction provenance.

**Explicitly NOT a safety pass/fail axis:** wording, rationale prose, evidence-span *selection* among
supporting spans, candidate ordering, auxiliary corrective-action text, rejected non-authoritative
fields, and the derived `outcome` label where the underlying candidate states are identical.
**Hazard-decomposition granularity is tracked and reported, not gated** — it is a real `RC-04`
product axis with no §29.8 hard gate and no established threshold, and inventing one here is exactly
what this phase was told not to do.

### 5.2 `P-02` → **`P02-C`** — multi-axis validity, with the safety-critical axes at ZERO

Not `P02-A`: the metric demonstrably fails to distinguish a rejection that destroys a
high-consequence hazard from one that destroys nothing — they score identically at 95.8%.
Not `P02-D`: no further measurement is needed; the distinction is computable from frozen artifacts
and was computed.
`P02-B` is correct as far as it goes but under-specifies; `P02-C` is `P02-B` with the axes named,
and naming them is what prevents the aggregate from re-forming.

---

## 6 — The refined requirements, exact text `SUPERSEDING — ADDITIVE`

`P-02` and `P-08` remain in `PROVIDER_REQUIREMENTS.md` **verbatim and unaltered**. `L3-2n` and
`L3-2o` results stand exactly as recorded, under the requirements that existed when they ran.
The following are **additive superseding programme criteria** for provider qualification from
`L3-2p` forward.

### `P-02R` — SAFETY-WEIGHTED VALIDITY (supersedes `P-02` for provider qualification)

> **A. Schema conformance — `≥99%`, retained unchanged from `P-02` as written.** Structured output
> must parse and conform to the submitted schema after ≤1 retry. This is what `P-02` says and what
> `PROVIDER_SELECTION.md` measured.
>
> **B. Safety-consequential validator rejections — `ZERO`.** No rejection may land on a row whose
> ground truth owes a hazard. **This is stricter than `P-02`**, which tolerated ~1% of *any*
> rejection including hazard-destroying ones.
>
> **C. High-consequence retention at the VALIDATED tier — `100%`,** per `D-58`'s two-tier rule and
> the standing `L3-3` gate.
>
> **D. False ACTIVE — `ZERO`.** §29.8 hard gate, `L3-INV-04`. Unchanged.
>
> **E. Clarification recall — `100%` on BOTH denominators,** per `D-58`. Unchanged.
>
> **F. Evidence-integrity and authority codes — `ZERO` occurrences.** Any of
> `EVIDENCE_TEXT_MISMATCH`, `EVIDENCE_OUT_OF_BOUNDS`, `EVIDENCE_SOURCE_UNKNOWN`,
> `EVIDENCE_NEGATION_SCOPE_TRUNCATED`, `INVENTED_REGULATORY_CANDIDATE`,
> `UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE`, `REGULATORY_TEXT_NOT_PERMITTED`,
> `GOVERNANCE_FIELD_NOT_PERMITTED`, `JURISDICTION_PROVENANCE_NOT_PERMITTED`,
> `ADVISORY_SIGNAL_CANNOT_GROUND_FINDING` — i.e. every member of
> `NON_RETRYABLE_VALIDATION_REASONS` — disqualifies outright. `L3-INV-01`, `-02`, `-03`, `-09`,
> `-11`. **This axis did not exist in `P-02` at all.**
>
> **G. Auxiliary proposal conformance — `TRACKED AND REPORTED, NOT GATED`.** Safety-preserving
> rejections are recorded with code, row and count in every qualification artifact, and a rising
> rate is a reportable availability cost under §29.6. **No threshold is set**, because none is
> derivable from the architecture and inventing one would repeat `P-02`'s error.
>
> **The deterministic validator is unchanged. Every rejection still occurs, identically, and no
> rejected proposal reaches a customer. `P-02R` changes only how PROVIDER QUALIFICATION INTERPRETS a
> rejection that the pipeline already contained.**

### `P-08R` — VALIDATED SAFETY-OUTCOME REPRODUCIBILITY (supersedes `P-08` for provider qualification)

> **A. Material safety outcomes — `100%` identical across two runs in isolated processes** (§38.3),
> on the seven axes enumerated in §5.1. **This is the requirement.**
>
> **B. Provider sampling controls — `RECORD, DO NOT REQUIRE`.** Temperature/seed availability is
> recorded as a provider property. A provider that offers none is not disqualified if it satisfies
> A. A provider that offers them and still fails A **is** disqualified — which, on measured evidence,
> is the actual discriminating case.
>
> **C. Model identity — `P-07` UNCHANGED**, and §45.4's digest ceiling stands. Reproducibility of a
> conclusion is meaningless if the weights behind the label moved.
>
> **D. Comparison-key discipline — `MANDATORY`.** Any reproducibility figure must state the exact
> field list it was computed over, and cross-provider comparison must recompute **every** baseline
> under the **same** key. `L3-2p` exists because that was not done between `L3-2n` and `L3-2o`.

---

## 7 — Invariant audit — all twelve

| invariant | guarantee | affected? | why preserved |
|---|---|---|---|
| `L3-INV-01` no invented citations | structural | **no** | Enforced by retrieval + `INVENTED_REGULATORY_CANDIDATE`. `P-02R` **F** gates it at zero; `P-02` never named it |
| `L3-INV-02` evidence-bound findings | validator | **no** | The validator is byte-unchanged. Every evidence code is in `P-02R` **F** at zero |
| `L3-INV-03` no model governance authority | structural | **no** | `GOVERNANCE_FIELD_NOT_PERMITTED` in **F** at zero |
| `L3-INV-04` no default ACTIVE | schema+validator | **no** | `P-02R` **D** at zero, unchanged from §29.8 |
| `L3-INV-05` safe failure | design | **no — clarified** | A `SAFETY_PRESERVING` rejection **is** `L3-INV-05` operating. Recognising that is not weakening it |
| `L3-INV-06` decision-boundary clarification | schema+validator | **no** | `P-02R` **E** keeps both recall denominators at 100%; `P-08R` **A** adds reproducibility of the clarification decision, which `P-08` did not require |
| `L3-INV-07` structured output only | schema | **no** | `P-02R` **A** retains `P-02`'s ≥99% schema conformance verbatim |
| `L3-INV-08` model output is a proposal | structural | **no — this is the load-bearing one** | `P08-B` is `L3-INV-08` applied to qualification: if the proposal is not authoritative, its token-level stability cannot be a safety requirement. `P08-A` would contradict `L3-INV-08` |
| `L3-INV-09` regulatory text governed | structural | **no** | `REGULATORY_TEXT_NOT_PERMITTED` in **F** at zero |
| `L3-INV-10` no silent Level-1 fallback | design | **no** | Untouched. A rejection still yields `ANALYSIS_UNAVAILABLE`, never lexical fallback |
| `L3-INV-11` negation scope preserved | validator | **no** | `EVIDENCE_NEGATION_SCOPE_TRUNCATED` in **F** at zero |
| `L3-INV-12` deterministic signals advisory | reachability | **no** | Nothing here gives an advisory module decision authority; `control-adequacy.ts` stays recording-only per `D-65` |

**No customer-safety property weakens.** The refinement is **strictly stronger** on six axes
(**B**, **C**, **D**, **E**, **F**, and `P-08R` **A**) and relaxes exactly one thing: whether a
rejection the pipeline already contained safely, on a row that owed no hazard, disqualifies a
provider.

**The decision stands independently of provider identity.** It is derived from `P-02`'s own text,
`PROVIDER_SELECTION.md`'s own measurement, §29.8's own two-kinds-of-gate rule, and the validator's
own three-class fatality model — all of which predate every provider result. Its measured effect
*disqualifies* two Gemini models and the local incumbent `qwen3-coder:30b` on axis **B**/**C**, and
it leaves Anthropic short on a different, newly discriminating axis (§8.1). **It is not a rule that
lets the closest candidate through.**

---

## 8 — Counterfactual qualification under the refined requirements `MEASURED`

Computed from frozen artifacts. **No provider was re-run. Nothing was tuned.**

| provider | `P-02R` A | B | C | D | E | F | `P-08R` A | verdict |
|---|---|---|---|---|---|---|---|---|
| **`claude-sonnet-5`** | ✓ 0 parse failures / 51 rows | **✓ 0** | **✓ 13/13 ×2** | ✓ 0/11 | ✓ 5/5 · 5/5 | **✓ 0** | **✓ 24/24** | **`P-02R` and `P-08R` PASS** |
| `gemini-3.7-flash` | ✓ | ✗ **6** | ✗ 7/13 | ✓ | ✓ | ✓ 0 | ✗ 1 row | **FAIL** |
| `gemini-3.6-flash` | ✓ | ✗ **3** | ✗ 10/13 | ✓ | ✓ | ✓ 0 | ✗ 2 rows | **FAIL** |
| `gemini-3.1-pro-preview` | ✓ | ✓ 0 | ✓ 13/13 | ✓ | ✓ | ✓ 0 | ✓ 0/24 | **`P-02R`/`P-08R` PASS — still FAILS `P-07`** (`D-67`, untouched) |
| `qwen3-coder:30b` | ✓ | ✗ **1** (`E-FLD-147`, HC) | ✗ 11/13 | ✓ | ✓ | ✓ 0 | not computable — no isolated repeat pair in the frozen set | **FAIL on B and C** |

### 8.1 `claude-sonnet-5` passes `P-02R` and `P-08R` — and is NOT thereby eligible

Two things remain, and neither is `P-02` or `P-08`:

* **Clarification precision `5/6 = 83%`, reproducibly, on `B08`.** `D-72` recorded this as an axis
  that *"discriminates for the first time"*. §29.8 puts no precision gate in the hard-zero list, and
  §44.4 treats unnecessary clarifications as a measured cost rather than a gate, so this phase does
  not invent an eligibility threshold. **Setting one is a product decision and is now the narrowest
  open question in the programme.**

  > **CORRECTED BY L3-2q (`D-78`).** This bullet originally read *"the pre-registered programme gate
  > is clarification **recall** at 100/100 — both denominators … precision has no pre-registered
  > threshold"*. **That was a misreading.** The blueprint uses `100/100` for **precision / recall**
  > (§34's outcome line: *"clarification precision and recall both 100%"*; §35.3's `TP 3 / FP 0 /
  > FN 0`), so a **100% precision figure IS pre-registered** — in the standing `L3-3 must not start
  > until` entry gate, measured on **FRESH SEALED** evidence. It has never been a provider-eligibility
  > criterion, which is the distinction L3-2q draws and this phase blurred. **Nothing in `P-02R` or
  > `P-08R` depends on the error.**
* **Every non-`P-02`/`P-08` prerequisite from §46.6 and §47.8 is unchanged and unmet**: no hosted
  adapter exists behind `HazLenzReasoningProvider` (§45.6); the organization behind the credential
  must be confirmed under the Commercial Terms; ZDR must be requested; name-level redaction must be
  decided or narrative PII egress explicitly accepted (§45.5); `P-11` egress telemetry is not
  implemented; §45.4's digest ceiling must be explicitly accepted.

> **The refinement did not hand Anthropic a pass. It moved the blocker from a metric that measured
> the wrong thing onto an axis that measures a real cost to an inspector — and onto build work that
> nobody has done.**

---

## 9 — Product interpretation

> ### `HazLenz DOES NOT REQUIRE A DETERMINISTIC AI MODEL. IT REQUIRES A DETERMINISTIC, DEFENSIBLE SAFETY ENVELOPE AROUND A PROBABILISTIC REASONING MODEL — AND L3-2o IS THE MEASUREMENT THAT PROVES THE ENVELOPE WORKS.`

* **The provider is** an internal, replaceable reasoning component behind one interface method
  (`HazLenzReasoningProvider.analyzeObservation`). It is never customer-facing, never authoritative,
  and `D-66` fixes it as an internal dependency. Its output is a **proposal** (`L3-INV-08`).
* **HazLenz is** the customer-facing system: the input builder and its redaction, the deterministic
  safety validator, the semantic evidence binder, the outcome derivation, and every deterministic
  stage §29.4 keeps — retrieval, citation identity, governed content, provenance, review,
  finalization, reporting.
* **Customer-facing** is HazLenz. Never the model.
* **What may become authoritative after acceptance** is the *validated, bound* reasoning outcome —
  never raw model output. The transition is `L3-3` onward, gated by §29.8 on fresh sealed evidence.
* **What remains deterministic** — and this is the answer to the product question: the validator,
  the binder, evidence grounding, negation scope, the authority boundary, retrieval, citation
  identity, governed text, risk scoring, persistence and reporting. **The model proposes inside that
  envelope; it never decides.**

The measurement that settles it: a provider with **no determinism control of any kind** produced
**identical material safety outcomes on all 24 rows across two isolated processes**, while two
providers that *did* accept temperature control moved a material safety axis. **Determinism at the
model is neither necessary nor sufficient. Determinism at the envelope is both.**

---

## 10 — Terminal state

> ### `PROVIDER_REQUIREMENTS_REFINED — SAFETY_OUTCOME_REQUIREMENTS_PRESERVED`

`P-02R` and `P-08R` are additive superseding qualification criteria. `P-02` and `P-08` stand
verbatim; `D-69`, `D-71` and `D-72` stand as recorded under the requirements in force when they ran.
`D-72`'s comparative-ranking clause is **superseded on new evidence** (§25) while its structural
finding is confirmed. **No validator, binder, prompt, schema, scorer, harness, invariant, threshold
or authority boundary was modified.** `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`;
`SEALED_ACCEPTANCE_CORPUS_UNTOUCHED`; `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.
