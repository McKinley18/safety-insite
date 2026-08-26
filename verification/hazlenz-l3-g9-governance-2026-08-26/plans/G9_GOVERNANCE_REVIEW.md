# G9 PRODUCT-GOVERNANCE REVIEW — RECOMMENDATION ONLY, G9 NOT AMENDED

**Zero provider calls. `$0.00`. No unspent corpus opened. G9 is not modified by this phase.**

## 1. What G9 actually is — measured, not assumed

The frozen projection, verbatim from `ea5e50ae…`:

```
material(res) = { state: assertedState, clar: raisedClarification, any: hasCandidate }
denominator 93 (all rows) · unit: one holdout row · threshold 100% · HARD
```

**G9 compares three fields. It does NOT compare evidence spans or offsets, corrective-action text,
rationale or wording, candidate keys, hazard family, candidate count, binder outcomes, or validator
issue codes.**

> **This refutes the premise that motivated the review.** G9 **cannot** be failed by wording, span or
> representational variation, because it never looks at them. Category **`G9-S3`
> (`NON_MATERIAL_REPRESENTATIONAL_DIVERGENCE`) is structurally empty for G9 by construction** — not
> empty by luck on this corpus. **G9 is already a decision-level gate, not a structural one.**

**And it carries no redundant strictness.** `hasCandidate` was **measured** to be fully determined by
`assertedState` across all 186 records (`state` is null exactly when no candidate exists), and
dropping it changes the result by **zero rows** (counterfactual **D** = 14 divergent, identical to
the frozen 14).

| property | does G9 measure it? |
|---|---|
| **A.** exact structural reproducibility | **NO** — spans, wording, families, counts all ignored |
| **B.** decision reproducibility | **YES — this is what it measures** |
| **C.** safety-outcome reproducibility | **PARTLY** — G9 is a *superset* of C; it additionally counts non-ACTIVE state distinctions |
| **D.** customer-visible reproducibility | **NOT DIRECTLY** — depends on what the product surfaces |

## 2. Original product intent — recovered from history, not inferred from the implementation

**The two-isolated-processes requirement is a measurement control, not the product requirement.**
§38.3 established it after a same-process repeat control manufactured **3/24 false variance** from
server-side cache/slot reuse. The rule exists so that measured variance is attributable to the
**provider** rather than to the harness. It says nothing about how much variance the product may
tolerate.

**The 100% threshold was calibrated against providers that had determinism controls.** Cross-process
reproducibility was repeatedly measured at **0/24** on the local Ollama path with `temperature = 0`
and a fixed `seed` (§37, §38.3, confirmed by a third independent measurement), and at **0/24 to
2/24** for Gemini. **100% was an observed, achieved property of the providers in evidence at the
time G9 was pre-registered** — not an aspiration.

**The risks G9 was built to prevent**, assessed against the historical record:

| risk | G9 catches it? |
|---|---|
| same observation → different hazard recognition | **YES** (`hasCandidate`, `state`) |
| same observation → `ACTIVE` vs non-`ACTIVE` | **YES** — the core case |
| same observation → clarification vs none | **YES** (`raisedClarification`) |
| same observation → materially different risk conclusion | **YES** |
| same observation → different regulatory interpretation | **NO** — regulatory refs are not compared |
| wording-only differences | **NO — correctly not counted** |
| evidence-span differences not altering support | **NO — correctly not counted** |
| corrective-action wording not altering safety meaning | **NO — correctly not counted** |

**`PRODUCT_REQUIREMENT` vs `CURRENT_SCORER_IMPLEMENTATION`:** the pre-registered requirement is
*"material safety-outcome reproducibility"* (`D-84`, §51.3). The implementation is the three-field
projection. **The implementation is narrower than a naive reading of the label** — it excludes
everything representational — **and slightly broader in one respect**: it counts a distinction
between *surfacing a non-active candidate* and *surfacing nothing*, which is arguably traceability
rather than safety outcome. That single gap is the whole of the legitimate governance question.

## 3. Materiality of the 14 divergences

| class | count | meaning |
|---|---|---|
| **`G9-S1`** SAFETY_DECISION_DIVERGENCE | **7** | `ACTIVE` asserted in exactly one process, and/or a clarification raised in exactly one process. **A customer could receive a materially different safety conclusion.** |
| **`G9-S2`** MATERIAL_REASONING_DIVERGENCE | **7** | Both processes agree there is **no active hazard** *and* agree on the clarification decision; they differ only in whether a non-active candidate (`NEGATED` / `CORRECTED` / `INSUFFICIENT_EVIDENCE`) was surfaced at all. Traceability and downstream processing differ; **the safety conclusion does not**. |
| **`G9-S3`** NON_MATERIAL_REPRESENTATIONAL | **0** | **Structurally impossible for G9.** |

**Seven of fourteen are outright safety-decision divergences.** That is not a gate being pedantic.

## 4. Diagnostic counterfactuals — **not a rescore, not a retroactive pass**

| projection | divergent | reproducibility |
|---|---|---|
| **A** current frozen G9 | **14 / 93** | **84.95%** |
| **B** safety-decision equivalence (`assertsACTIVE` + clarification) | 7 / 93 | 92.47% |
| **C** customer-visible outcome (`assertsACTIVE` alone) | 4 / 93 | 95.70% |
| **D** state + clarification, `hasCandidate` dropped | **14 / 93** | **84.95%** |

**Counterfactual A reproduces the frozen scorer exactly.** Counterfactual **D proves G9 carries no
redundant strictness.** And decisively:

> **NO CHOICE OF G9 DEFINITION TURNS RUN 2 INTO A PASS.** Even under the most permissive projection
> (**C**), **4 rows still differ** — and **G1, G2, G3, G4, G5 and G6 failed independently of G9 and
> are untouched by any G9 projection.** Run 2 remains
> `L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`, `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`.

## 5. Recommendation — `G9_GOVERNANCE_D — INSUFFICIENT_EVIDENCE_TO_CHANGE_REQUIREMENT`

**The premise that G9 is too strict is largely refuted by measurement**, and the residual question is
too narrow and too product-dependent to resolve from a failed run.

* **The "counts wording" hypothesis is false.** G9 compares no representational field; `G9-S3` is
  empty by construction.
* **The "carries redundant strictness" hypothesis is false.** Removing the redundant `hasCandidate`
  field changes **zero** rows.
* **Half the divergences are outright safety-decision differences** (`G9-S1` = 7), which every
  candidate requirement — A, B and C alike — would count.
* **The only debatable element is `G9-S2`** (7 rows): whether *"we considered this hazard and found it
  negated/corrected"* versus *"we said nothing"* is customer-material. For a safety-inspection product
  sold on traceability, **it plausibly is**: the customer sees inconsistent reasoning for the same
  observation even though the safety verdict matches.

### The required pre-registration test

> **Would the recommended requirement have been chosen BEFORE seeing the Run-2 result, if the same
> product-risk reasoning had been applied?**
>
> **For any weakening: NO — or at best uncertain.** I cannot honestly claim a reviewer applying this
> product-risk reasoning in advance would have excluded `G9-S2`. It is a genuine trust and
> traceability property, and the only reason it is under discussion now is that a run failed.
> **Per the phase's own rule, that means G9 must not be recommended for weakening — and it is not.**

**G9 stands as frozen.** Two things follow, and neither is a change to G9:

1. **The narrow question is isolated and handed to the product owner, not answered here:** *is
   surfacing a non-active candidate versus surfacing nothing a customer-material inconsistency?* It
   must be answered against a **product specification of what the customer sees**, not against this
   run. If the product never surfaces non-active candidates, the answer is probably no; if it does,
   probably yes. **That specification does not currently exist in the blueprint** — which is itself
   the finding.
2. **Weakening G9 would buy nothing anyway.** Run 2 fails G9 under every projection and fails six
   other gates regardless.

## 6. Provider implication — `ANTHROPIC_CURRENT_PATH_REQUIRES_ARCHITECTURAL_CONTROL`

Not *compatible*: **4 rows differ on the pure safety conclusion** (`assertsACTIVE`) with no available
control, so even the most permissive requirement is missed on measured evidence.
Not *not-validated*: it **is** measured — 84.95% frozen, 95.70% at the most permissive projection.
Not *incompatible*: the failure is **architectural, not absolute**. The current architecture lets a
**single generative call determine the condition state**, so provider sampling variance propagates
directly into the safety decision. `temperature` is not forwardable and `seed` has no equivalent on
this path (`D4`/`D5`) — **there is no knob** — but there are architectures in which the provider's
variance no longer decides the state.

> **`claude-sonnet-5` cannot satisfy G9 through the current architecture. Whether it can through a
> different one is untested, and testing it is not authorized here.** No provider was called and no
> production provider is selected.
