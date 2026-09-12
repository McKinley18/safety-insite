# Expert HazLenz — Formal-Failure Root-Cause Diagnostic

> ## AMENDED 2026-09-02 — read this box before the body
>
> A follow-on zero-provider audit, `INSTRUMENT-VALIDITY-AUDIT.md`, **corrects three claims below and
> supersedes one conclusion.** The body is preserved unedited as the record of what was concluded at
> the time; the corrections are:
>
> 1. **§4.1 arithmetic is WRONG.** "20 authored gaps cap the numerator at 20" and "at most 28
>    clarifications cohort-wide" are both incorrect, because the frozen `scoreM09` performs **no
>    de-duplication of gap credit** — two clarifications may both credit one gap. The canonical
>    values are `AUTHORED_GAP_COUNT = 20` and **`MAX_POSSIBLE_M09_NUMERATOR_ON_THIS_RUN = 59`**,
>    giving a ceiling of **59/165 = 0.3576** against MIN 0.70. The conclusion that M09 was
>    mathematically unreachable **stands and is strengthened** — it now holds without any
>    one-credit-per-gap assumption. The binding constraint is the 106 structurally ineligible
>    questions, against a ceiling of 25.
> 2. **"only two assert an obligation" is WRONG** — the correct figure is **three**
>    (`GAUNTLET-007`, `AUG-05`, `SEM-15`); two of the three reached M06's numerator, the third was
>    excluded first as `EXCLUDED_NO_RECORD_ROW`.
> 3. **§6 understates the M05 input exposure.** Citation-shaped text reached the model on **all 195
>    calls**, not only on the 40 governed rows: `EXPERT_SYSTEM_PROMPT`'s own prohibition contains the
>    literal strings `"29 CFR 1910.147"` and `"30 CFR 56.12016"`, both of which match the rejecting
>    pattern.
> 4. **§3's M14 conclusion is superseded, in the same direction but on stronger ground.** A genuine
>    same-input replicate set was located in preserved evidence and computed: three byte-identical
>    inputs produced **three distinct** scored projections. It is **not** admitted as the missing
>    control (the probe's prompt file hash differs from the formal run's, and the `v6` version string
>    is demonstrably not an identity), but it shows the same-input null is non-zero, so the observed
>    0.9219 cannot be read as an order effect at all. Formal verdict:
>    **M14_CAUSE_UNIDENTIFIABLE_FROM_SPENT_RUN.**
> 5. **§11's remediation list is superseded** by the audit's §9 basis. R5 is reclassified as an
>    instrument change; R6's implication that persistence alone makes M14 answerable is rejected.
>
> The formal result is unchanged and immutable: **FORMAL_EVALUATION_FAIL — NOT ACCEPTED.**


**Operation:** zero-provider, diagnostic-only. No repair implemented.
**Run:** `formal-run-65523fbb-eea3-4322-a47b-632fa2eae341`
**Cohort:** `hazlenz.expert.formal.cohort.65.v1+d7c8f9c15f0a`
**Formal terminal under diagnosis:** FORMAL_EVALUATION_FAIL — NOT ACCEPTED (6 of 12 hard gates fail)
**Provider calls in this operation:** 0. **PROVIDER_INVOCATION_COUNT:** 195 before and after.

---

## 1. Executive diagnosis

Six hard gates failed. They are **not six independent defects.** The evidence supports **three model-behaviour causes and two evaluation-instrument causes**, and one gate whose cause cannot be determined at all from what survived the run.

| # | Cause | Class | Explains |
|---|---|---|---|
| **C1** | Collection overproduction — the model fills typed lists to a stereotyped template rather than to the evidence | ROOT CAUSE (model/contract) | M10, and the denominator half of M09; contributes to M11 spurious, M12 |
| **C2** | "Decision-critical" is defined by a *possibility* test (`could change`), never a counterfactual one | ROOT CAUSE (contract) | M10, M09 |
| **C9a** | `affectedDecision` is a bare six-member enum with **no definition of any member anywhere** in the contract, prompt or schema | ROOT CAUSE (contract) | the 11 `DECISION_MISMATCH` items in M09 |
| **C3** | Collections are generated independently with no cross-collection arbitration pass | CONTRIBUTING CAUSE (architecture) | M12, contributes to M09/M11 |
| **C7** | Governed records were attached to rows **mechanically by index**, with zero semantic relevance | ROOT CAUSE (evaluation instrument) | M07 in full; the most likely source of both M05 events |
| **C11** | The M07 denominator is a **lexical** regulatory detector that fires on ordinary safety English ("violation", "compliance", "the standard") | ROOT CAUSE (evaluation instrument) | M07 in full |
| **C6** | `CITATION_SHAPED_PATTERN` rejects the whole payload, while the prompt itself renders citation-bearing `approvedText` into the input on all 40 governed rows | CONTRIBUTING CAUSE (architecture) | M05 |
| **—** | **M14 order sensitivity** | **UNKNOWN** | the scored projections were never persisted and no determinism control exists; order-conditioned instability and general stochastic instability **cannot be separated** |

Two findings dominate everything else:

**M07 = 0/9 does not measure what its name says.** Not one of the nine adjudicated "regulatory statements" is a citation or a claim that a regulation requires anything. They are ordinary safety prose caught by a keyword lexicon — including one statement in which the model *correctly* reported a grinder as compliant, and one in which it merely restated the deterministic engine's own finding. The records they were tested against were attached by sorting citation keys alphabetically and zipping them onto the first 40 rows of the row order. A conveyor row got compressed gases; a fall-edge row got respirable silica; a confined-space row got hazard communication. Under that construction a `SUPPORTED_BY_SUPPLIED_RECORD` verdict was close to unreachable. M07 is currently a joint measurement of the model **and** an instrument that was built without semantic pairing.

**M09 was arithmetically unreachable before quality entered the picture.** Twenty gaps were authored across the cohort, so the numerator has a hard ceiling of 20. Passing at MIN 0.70 therefore requires the model to emit **at most 28 clarifications in total across all 65 rows.** It emitted **165** — 5.9× that budget. Even if every single mapped clarification had also matched its gap's `affectedDecision`, M09 would have been 16/165 = 0.0970. Overproduction, not question quality, is the dominant term.

---

## 2. Formal failure topology

| Gate | Symptom | Scorer definition (frozen) | Num/Den | Affected units | Arm | Originates | Determ. projection? | Governed attachment? | Caused by another gate? | Independent? |
|---|---|---|---|---|---|---|---|---|---|---|
| **M05** FABRICATED_CITATIONS | 2 boundary rejections, both `POPA-A-28` | count of `CITATION_SHAPED_TEXT_NOT_PERMITTED` issues **plus** any citation surviving to `merged.expertAdvisory` | 2 / — | 1 row, both arms | BASE + PERMUTED | **model generation**, caught at **validation** | No (projection is deliberately citation-free) | **Yes** — the row's only citation source is the attached record | No | Partly — shares C7 with M07 |
| **M07** GOVERNED_RECORD_GROUNDING | every detected regulatory statement unsupported | grounded ÷ all statements matching `REGULATORY_STATEMENT_MARKERS` in BASE prose | 0 / 9 | 9 prose units, 7 rows | BASE | **detector + attachment**, i.e. evaluation instrument, then model | No | **Yes, decisive** | No | No — instrument-coupled |
| **M09** CLARIFICATION_QUALITY | 5 useful of 165 | useful ÷ **all emitted clarifications**; useful = mapped to a gap AND `affectedDecision` equal | 5 / 165 | 165 clarifications, 56 rows | BASE | **model generation** (volume) + **contract** (vocabulary) | No | No | **Yes — denominator is M10's symptom** | No |
| **M10** UNNECESSARY_QUESTION_RATE | 38 of 45 not-owed rows asked | rows asking ÷ rows the key owes none | 38 / 45 | 106 clarifications on 38 rows | BASE | **model generation**, licensed by prompt | No | No | No | **Yes — the primary generative symptom** |
| **M12** INTERNAL_INCOHERENCE | ACTIVE candidate + HAZARD_EXISTENCE question on the same row | rows where any candidate is ACTIVE **and** any clarification is `HAZARD_EXISTENCE` — **row-level, not family-coupled** | 11 / 64 | 11 rows | BASE | **model generation** (no arbitration) + **scorer coarseness** | Possible (ACTIVE bias) — untestable | No | Partly — needs a clarification to exist, so M10/C1 raise its probability | No |
| **M14** ORDER_SENSITIVITY | 59 of 64 paired rows differ | BASE vs PERMUTED equality of `scoredFieldProjection` — **all collections sorted**, prose and ids excluded | 59 / 64 | 59 rows | BASE vs PERMUTED | **UNDETERMINED** | Unknown | Unknown | Unknown | **Unknown** |

**Cross-measure row overlap** (BASE arm, 65 rows):

| | M14 | M12 | M10 | M02 | M11 spurious |
|---|---|---|---|---|---|
| M12 (11 rows) | **11 (100 %)** | — | 5 | — | 9 |
| M10 (38 rows) | 36 (95 %) | 5 | — | — | 20 |
| M02 (10 rows) | 9 | — | — | — | — |
| M01 true misses (8 rows) | 8 (100 %) | 1 | — | — | — |
| M07 rows (9) | 8 | — | — | — | — |

Every M12 row and every M01-miss row is also order-sensitive. The five rows that were **not** order-sensitive are `GAUNTLET-004`, `POPA-A-24`, `POPA-A-26`, `POPA-A-27`, `POPA-A-29` — and **three of those five emitted zero clarifications and minimal content.** Stability tracks output volume. That is consistent with C1 but does not prove it: a row that emits almost nothing has almost nothing that can differ.

---

## 3. M14 — order sensitivity: what can and cannot be established

### 3.1 What the gate actually compares

`scoredFieldProjection` (`expert-measure-scorers.ts:348`) is **order-insensitive by construction**:

```
candidates      = map(hazardFamily|assertedConditionState|relationshipToDeterministic).sort()
clarifications  = map(affectedDecision).sort()
insights        = map(interactionKind|participants.sort().join('+')).sort()
disagreements   = map(target|disagreementType).sort()
+ outcome
```

Every collection is sorted; prose, ids, confidence, criticality and evidence are excluded. **M14 therefore did not fail because arrays came back in a different order.** It failed because the *semantic content* of the projection differed between two generations: a different set of hazard families or condition states, a different multiset of `affectedDecision` labels, a different set of interaction kinds, or a different `outcome`.

This immediately eliminates hypotheses **B (array-order priming), E (schema property ordering), I (id/collection-key instability)** and **K (the scorer projection itself)** as sufficient explanations — none of them can survive a sort. It also eliminates **G (normalization instability)** and **H (merge/projection instability)** as *sole* causes for the same reason, unless they alter membership rather than order, for which there is no evidence.

### 3.2 Why the remaining hypotheses cannot be separated

The per-row differences the user asked to classify by collection and semantic type **do not exist in any surviving artifact.**

- `ATTEMPT-LEDGER.json` persists `rowId, arm, callId, processId, layerStatus, failureKind, attemptCount, latencyMs, tokens, costUsd, modelIdentity` and per-attempt telemetry. **No model output content.**
- `EVALUATION-RESULT.json` persists M14 evidence as `{rowId, verdict: "ORDER_SENSITIVE"}` and nothing more.
- `ADJUDICATION-QUEUE.json` preserves only the **BASE** arm's 9 regulatory prose units and 165 clarification questions. **No PERMUTED content of any kind survives, and no candidate, insight or disagreement survives from either arm.**

So the aggregate counts the user requested (`expertCandidates` diffs, `crossHazardInsights` diffs, `affectedDecision` diffs, …) are **not computable**, now or later, from this run. This is a direct consequence of the `CohortRunRecord[]` persistence defect and it is the single largest analytic cost that defect imposed.

### 3.3 ORDER-CONDITIONED vs GENERAL STOCHASTIC INSTABILITY — explicitly unresolved

**These cannot be distinguished, and the reason is structural rather than an oversight in this analysis.**

`P2_DETERMINISM_CONTROL = ABSENT` for `claude-sonnet-5` on this adapter: no seed, and temperature/top_p/top_k are unavailable and not sent. There is therefore **no same-input control arm anywhere in the run.** The CROSS_PROCESS arm issued 65 calls but all 64 pairs were rejected for `sameProcess`, so M17 produced `NO_OPPORTUNITY` and contributes no evidence here either — and in any case it would have measured process boundaries, not input identity.

To attribute the 59 differences to permutation one must know how often two *identical* inputs would differ. That number was never measured. Under an uncontrolled sampler a same-input divergence rate approaching 0.92 on a projection this fine-grained is entirely plausible, and so is a much lower one. **The evidence does not discriminate.** Any statement that "permutation caused 59 of 64 rows to change" is unsupported by this run, and this report does not make it.

What can be said: **M14 as constructed is not a clean order-sensitivity measure on a provider with no determinism control.** It measures *total* run-to-run projection instability, of which order effects are an unknown share. That is the same class of error as the G9 lesson that made M17 a reported measure rather than a gate — and it was not applied to M14.

### 3.4 Ranked M14 hypotheses

| Rank | Hypothesis | Evidence for | Evidence against | Verdict |
|---|---|---|---|---|
| 1 | **F — general stochastic instability unrelated to permutation** | `P2_DETERMINISM_CONTROL = ABSENT`; no same-input control exists; the projection is fine-grained enough that one changed condition state or one extra clarification flips a row | none available | **UNRESOLVED — cannot be excluded and cannot be confirmed** |
| 2 | **J — output volume creates surface area for divergence** | 3 of the 5 stable rows emitted zero clarifications; the modal row emits 3 clarifications and multiple candidates; every M12 and M01-miss row is order-sensitive | correlational only; low-volume rows have less that *can* differ, so the association is expected under any cause | **PARTIALLY SUPPORTED as an amplifier, not established as a cause** |
| 3 | **A/C/D — prompt/finding/record order dependence** | the user prompt is a flat serialization; `deterministicFindings`, `authoritativeSources` and `governedStandards` all render in array order; the system prompt says "Work through these in order" | the projection sorts everything, so ordering must change *content* to register; no per-row diff survives to test it | **UNRESOLVED** |
| 4 | **B, E, I, K — array priming, schema property order, id instability, scorer projection** | — | eliminated by the sort in `scoredFieldProjection` | **UNSUPPORTED** |
| 5 | **G/H — normalization or merge instability** | — | both are pure functions of their inputs (`normalizeExpertOutput` takes an injected `nowIso` precisely so replay is byte-reproducible); nothing suggests membership-altering nondeterminism | **UNSUPPORTED** |

### 3.5 Design elements that unnecessarily expose reasoning to input order

Recorded as design observations, independent of whether they caused M14:

- `EXPERT_SYSTEM_PROMPT`: *"Work through these in order. Fill the typed lists FIRST; write the summary LAST."* — sequential-reasoning language.
- `buildExpertUserPrompt` renders `deterministicFindings`, `authoritativeSources` and `governedStandards` as positional lists with no canonical sort and no semantic grouping.
- `renderDeterministicDispositionBlock` appends a second, differently-shaped view of deterministic material **after** the closing instructions, so the same family can appear in two prompt sections (`DETERMINISTIC FINDINGS ALREADY ESTABLISHED` and `DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED`) with different framing. That is duplicate facts in multiple prompt sections, retained deliberately for byte-identity with the §118 prototype.
- `outcome` was already moved last for a measured reason (§104). The same reasoning — that generation order determines commitment order — has not been applied to the four collections, which are still emitted in a fixed schema order with candidates first.

---

## 4. M09 and M10 — clarification failure

### 4.1 The shared arithmetic

| Quantity | Value |
|---|---|
| Authored decision-critical gaps in the cohort | **20**, one each on 20 rows |
| Rows the key owes no clarification | 45 |
| Clarifications emitted (BASE) | **165** across 56 rows; 9 rows emitted none |
| …on rows with an authored gap | 59 |
| …on rows with **no** authored gap | **106 (64 %)** |
| Clarifications per emitting row | 1 → 4 rows, 2 → 8, 3 → **31**, 4 → 13 |
| Maximum clarifications compatible with M09 ≥ 0.70 | **28** |
| Observed / maximum | **5.9×** |

M10 counts rows; M09 counts questions. **They are the same behaviour measured two ways.** The 106 questions asked on rows owed nothing sit in M09's denominator where they can never be useful, because those rows have no gap to map to. M09 restricted to gap-bearing rows would still be 5/59 = 0.0847.

### 4.2 Why the model asks when nothing is owed

The contract does not contain an operational test for decision-criticality. It contains a **possibility** test:

> *"MISSING FACTS THAT WOULD CHANGE A DECISION → decisionCriticalClarifications. Any fact whose answer **could** change whether a hazard exists, its severity, who is exposed, whether a rule applies, what control is required, or whether work may proceed."*

Under `could`, almost any fact qualifies. The schema description repeats the same modal (`"could change"`), adds `"Independent of hazards: populate this even when the hazard list is empty"`, and supplies four worked examples:

> *"Is the equipment de-energized? Has lockout/tagout been applied? Is the pump isolated? What PPE is in use?"*

**35 of the 165 emitted clarifications, and 30 of the 149 that mapped to no gap, are near-restatements of one of those four examples.** The prompt's own illustrations are among the most reproduced unnecessary questions in the run.

There **is** a counter-pressure paragraph, and it is well written:

> *"'Will this be reinstalled / re-tested / verified at some future step?' and 'was this done correctly at the time?' are questions you could ask about almost ANY remediated condition… that genericness is itself evidence the question is not decision-critical… Do not ask a question merely because you can imagine it."*

But it is **scoped inside the `CURRENT STATE, NOT HISTORICAL STATE` section and conditioned on a remediated condition.** It has no force on an ordinary present-tense observation with no remediation history — which is what most not-owed rows are. The single global anti-overproduction sentence is *"Do not invent a hazard, a question or an interaction to fill a list either."* Against it stand the NO-LOSS RULE, `"If you find yourself writing 'no information about whether X' in the summary, X is a decisionCriticalClarification and belongs in that list too"`, `"Before returning NOTHING_TO_ADD, check that you wrote no 'no information about…' and no 'it is unclear whether…' anywhere — each of those is a question you owe"`, and `"populate this even when the hazard list is empty"`. **The incentive is asymmetric by roughly five statements to one, and every one of the five is more concrete than the one.**

**The hypothesis the user asked to test is SUPPORTED: the contract conflates "information that would be useful to know" with "information required to change the current safety decision."** It never states the counterfactual — *if the answer were X the decision would be A, and if Y it would be B; if you cannot name both branches, do not ask.*

### 4.3 The 149 NO_GAP clarifications, classified

Keyword-based, first match wins. **Approximate**: the classifier is this diagnostic's, not the adjudicator's, and no adjudication was changed.

| Bucket | Count | Example |
|---|---|---|
| removed-from-service / interim control | 22 | *"Have any interim measures (warning lines, barricades, signage, restricted access) been put in place…"* |
| procedural / permit / program / documentation | 20 | *"Can the tank's contents be identified through records, manifests…"* |
| current exposure / who is nearby | 15 | *"Do any employees work, walk, or perform tasks near this conveyor tail pulley…"* |
| PPE detail | 12 | *"…what PPE or precautions are in use?"* |
| isolation / energy control | 11 | *"Is there any mechanical, electrical, or fluid-handling equipment… that requires isolation…"* |
| verification / testing status | 10 | *"Has the vessel atmosphere been tested and confirmed safe…"* |
| severity refinement / magnitude | 9 | *"How long has this open edge existed without guardrails…"* |
| rescue / emergency provision | 5 | *"…would it be handled as an incidental spill cleanup…"* |
| historical / cause | 4 | *"Why were the forks left elevated…"* |
| future verification | 2 | *"Was the pneumatic press guard tested or verified… before the machine was returned to service?"* |
| not classified by this heuristic | 39 | *"Is the conveyor currently energized or capable of being started…"* |

Almost none are *foolish* questions. They are competent, generic due-diligence questions — which is the point: the contract asks for decision-critical facts and receives professional thoroughness, because it never told the model how to tell those apart.

### 4.4 The stereotyped shape — direct evidence for C1

`affectedDecision` across the 165 clarifications: `REQUIRED_CONTROL` 62, `HAZARD_SEVERITY` 45, `EXPOSURE` 28, `HAZARD_EXISTENCE` 20, `APPLICABILITY` 9, `REGULATORY_INTERPRETATION` 1.

Per-row sets: the single most common shape is exactly **{EXPOSURE, HAZARD_SEVERITY, REQUIRED_CONTROL}** on 11 rows; 14 rows contain all three; 20 contain {EXPOSURE, REQUIRED_CONTROL}. `REQUIRED_CONTROL` appears on **54 of the 56 emitting rows**. The modal emission is **three questions covering a severity / exposure / control triple**, largely independent of what the observation actually left open.

**That is a coverage template, not an evidence-driven question set** — and it is the clearest single piece of evidence for C1.

### 4.5 The 11 DECISION_MISMATCH items

| item | gap decision | model claimed |
|---|---|---|
| `AUG-11::accumulator-bled-status` | REQUIRED_CONTROL | HAZARD_EXISTENCE |
| `SEM-01::clar-gas-readings` | REQUIRED_CONTROL | HAZARD_SEVERITY |
| `SEM-02::arbor_pinned_or_blocked` | REQUIRED_CONTROL | HAZARD_EXISTENCE |
| `SEM-03::clar-gfci` | REQUIRED_CONTROL | HAZARD_SEVERITY |
| `SEM-04::clar-plate-rating` | HAZARD_EXISTENCE | HAZARD_SEVERITY |
| `SEM-07::clq-nitrogen-bleed-status` | REQUIRED_CONTROL | HAZARD_EXISTENCE |
| `SEM-15::clar-wand-pressure` | APPLICABILITY | HAZARD_SEVERITY |
| `SEM-16::clar-1` | HAZARD_SEVERITY | HAZARD_EXISTENCE |
| `SEM-17::disconnect-lockable` | APPLICABILITY | REQUIRED_CONTROL |
| `SEM-21::coating-lead-chromate-testing` | HAZARD_SEVERITY | HAZARD_EXISTENCE |
| `SEM-30::calibration_date` | EXPOSURE | HAZARD_SEVERITY |

Direction tally: `REQUIRED_CONTROL→HAZARD_EXISTENCE` ×3, `REQUIRED_CONTROL→HAZARD_SEVERITY` ×2, `HAZARD_SEVERITY→HAZARD_EXISTENCE` ×2, `HAZARD_EXISTENCE→HAZARD_SEVERITY` ×1, `APPLICABILITY→HAZARD_SEVERITY` ×1, `APPLICABILITY→REQUIRED_CONTROL` ×1, `EXPOSURE→HAZARD_SEVERITY` ×1.

**The disagreement is bidirectional between the same label pairs.** `HAZARD_SEVERITY` and `HAZARD_EXISTENCE` are swapped in both directions by two independent labellers. That is the signature of an **under-specified vocabulary**, not of a model biased in one direction.

The root cause is concrete and checkable: `EXPERT_AFFECTED_DECISIONS` (`expert-contract.types.ts:171`) is a bare six-member string enum. **No member is defined anywhere** — not in the type's doc comment, not in `EXPERT_SYSTEM_PROMPT`, and not in the wire schema, which passes `enum: [...EXPERT_AFFECTED_DECISIONS]` with **no per-value description**. The model must infer six boundaries; the answer-key author inferred them independently; M09 then requires exact agreement. Consider `SEM-02` — *"Has the blade arbor been mechanically pinned, blocked, or otherwise restrained against gravity-induced movement?"* Whether that is a question about the required control or about whether the hazard exists is genuinely arguable, and nothing in the contract settles it.

Of the user's six candidate explanations: **schema naming ambiguity — SUPPORTED. Prompt taxonomy ambiguity — SUPPORTED. Authored gap taxonomy too coarse — PARTIALLY SUPPORTED** (the key is internally consistent but uses the same undefined vocabulary). **Model chose wrong `affectedDecision` — UNSUPPORTED as a standalone cause**, because "wrong" presupposes a definition that does not exist. **Clarification spans multiple decisions — PARTIALLY SUPPORTED** (several questions legitimately touch two). **Scorer/contract mismatch — UNSUPPORTED**; the scorer applies the contract exactly as frozen.

### 4.6 The four unmapped gaps

| gap | row | clarifications emitted | why unmapped |
|---|---|---|---|
| `AUG-04-G1` | AUG-04 | **0** | no clarification existed to map. AUG-04 is also an M01 true miss (`chemical_exposure`) **and** an M11 MISSED (`CONFINED_SPACE_ATMOSPHERIC`) |
| `SEM-05-G1` | SEM-05 | **0** | same pattern: also an M01 true miss (`chemical_exposure`) and an M11 MISSED (`CHEMICAL_PPE_VENTILATION`) |
| `SEM-08-G1` | SEM-08 | 4 | asked four questions — attendant, CIP caustic isolation, CIP physical isolation, whether monitoring *was performed* — none asking the **oxygen concentration** the gap names |
| `SEM-19-G1` | SEM-19 | 3 | asked about the exposure-control programme, respirator adequacy and a confined space — none supplying the **dye's identity and concentration** |

Two distinct failures. On `AUG-04` and `SEM-05` the model went **silent on the whole row**: no hazard candidate, no interaction, no question. On `SEM-08` and `SEM-19` it was **voluble but off-target**, asking process/programme questions while the decisive physical measurement went unasked. `SEM-08` is instructive: it asked whether monitoring *had been performed* but never what the reading *was* — a procedural question standing in for a physical fact, which is precisely the C2 conflation.

### 4.7 Shared causal model for M09 / M10

```
C2 (possibility test, no counterfactual)  ─┐
C1 (fill-the-list template, 3-per-row)    ─┼─► 165 clarifications, 106 on not-owed rows
prompt worked examples reproduced verbatim ┘        │
                                                    ├─► M10 = 38/45   (row-level view)
                                                    └─► M09 denominator = 165 (question-level view)
C9a (affectedDecision undefined) ─────────────────► 11 of 16 mapped items fail the equality test
C1/C2 again (procedural question ≠ physical fact) ─► SEM-08-G1, SEM-19-G1 unmapped
silent-row failure (distinct) ────────────────────► AUG-04-G1, SEM-05-G1 unmapped, + M01/M11 misses
```

---

## 5. M07 — governed-record grounding

### 5.1 What the nine statements actually are

| # | row | field | trigger word | attached record | asserts obligation |
|---|---|---|---|---|---|
| 1 | GAUNTLET-005 | `expertExplanation.summary` | *violation* | 29 CFR 1910.120 HAZWOPER | no |
| 2 | GAUNTLET-007 | `clarifications[1].whyItMatters` | *violation* | 29 CFR 1910.1200 Hazard communication | **yes** |
| 3 | GAUNTLET-054 | `expertExplanation.summary` | *regulatory* | 29 CFR 1910.179 Overhead and gantry cranes | no |
| 4 | POPA-A-16 | `clarifications[0].question` | *compliance* | 29 CFR 1910.303 Electrical | no |
| 5 | POPA-A-24 | `expertExplanation.summary` | *compliance* | 29 CFR 1910.36 Exit routes | no |
| 6 | AUG-01 | `candidates[0].evidenceBasis` | *the standard* | 29 CFR 1926.1425 Cranes — keeping clear of the load | no |
| 7 | AUG-05 | `clarifications[2].whyItMatters` | *violation* | 29 CFR 1926.251 Rigging equipment | **yes** |
| 8 | SEM-15 | `clarifications[0].whyItMatters` | *regulation* | **none supplied** | **yes** |
| 9 | SRC-MSHA-057 | `clarifications[2].whyItMatters` | *violation* | **none supplied** | no |

**None is a citation. None claims a named regulation requires anything.** Statement 1 restates the deterministic engine's own hazard-communication finding. Statement 5 reports a pedestal grinder as *compliant* — correct behaviour on a negative-control row, penalised. Statement 9 uses "policy violation" about company policy. Statement 6's "the standard tolerance" is engineering usage, not a regulatory reference.

### 5.2 The attachment rule

From `COHORT-MANIFEST.json.governedAttachment.rule`, verbatim:

> **"records sorted by citationKey ASCENDING, paired by index to the first 40 rows of the frozen row order"**

No family matching, no topic matching, no relevance check. A conveyor tail-pulley row received compressed gases; an open-floor-edge row received respirable crystalline silica; a confined-space entry row received hazard communication; a masonry-scaffold row received overhead and gantry cranes. Of the seven flagged statements that had a record at all, **at most one (GAUNTLET-005's HAZWOPER record against a corrosive tank) is even adjacent to its row's subject.**

### 5.3 Verdict on the ten candidate mechanisms

| | Mechanism | Verdict |
|---|---|---|
| A | model ignored the supplied record | **UNSUPPORTED** — nothing in the nine statements engages a record at all |
| B | used the record but extended beyond it | **UNSUPPORTED** for 8 of 9; arguable only for GAUNTLET-005 |
| C | record unrelated to the assertion | **SUPPORTED — this is the dominant mechanism** |
| D | attachment paired mechanically by index | **SUPPORTED — this is the cause of C** |
| E | background regulatory memory outranked supplied evidence | **UNSUPPORTED** — the model wrote no regulation-specific content; the citation prohibition held on 194 of 195 payloads |
| F | grounding requirement optional or weak | **UNSUPPORTED** — `NEVER claim a regulation requires something unless a supplied governed record says so` is stated as a hard prohibition and appears to have been obeyed |
| G | quote binding syntactically but not semantically successful | **UNRESOLVED** — per-candidate binding statistics were not persisted |
| H | candidate/clarification generation created unsupported obligations | **PARTIALLY SUPPORTED** — only 2 of 9 assert an obligation, and both are `whyItMatters` prose on a clarification, i.e. a by-product of C1/C2 overproduction |
| I | `UNAPPROVED_RECORD` backing changed behaviour | **UNRESOLVED** — no approved-state contrast existed; `REVIEWER_APPROVED_GOVERNED_RECORDS = 0` and `APPROVED_EXACT_NOT_EXERCISED = true` |
| J | the opportunity definition selected only problematic statements | **SUPPORTED** — see below |

On **J**: `REGULATORY_STATEMENT_MARKERS` includes `/\bviolat(ion|es|e)\b/i`, `/\bcompliance\b/i`, `/\bregulatory\b/i`, `/\bthe standard\b/i`. These are ordinary safety-professional English. A safety expert who never mentions a regulation but writes "the deterministic finding of an active hazard communication violation" is placed into a denominator that then demands a supplied record substantiate it.

### 5.4 Separation of concerns

- **MODEL GROUNDING DEFECT:** at most 2 of 9 items (`GAUNTLET-007`, `AUG-05`) assert an obligation, and both are the discursive `whyItMatters` field of an unnecessary clarification. Real, small, and downstream of C1/C2.
- **COHORT RECORD-ROW RELEVANCE LIMITATION:** dominant. The instrument supplied irrelevant records by design. **The design is not repaired retroactively and this report does not propose doing so.**
- **CONTRACT/DESIGN DEFECT:** the lexical detector cannot distinguish *asserting* a regulation, *restating* the deterministic finding, and *using ordinary compliance vocabulary*.

### 5.5 What M07 proves and does not prove

**Proves:** on this cohort, prose that reads as regulatory to a keyword lexicon was not substantiated by the record that happened to be attached to that row.

**Does not prove:** that Expert fabricates regulatory obligations; that it ignores supplied governed evidence; that it prefers parametric regulatory memory; or that it would fail a grounding gate when a *relevant* record is supplied. **None of those was tested by this cohort.**

### 5.6 Reconciliation with earlier hosted grounding success

There is no contradiction. Earlier probes measured **exact quote binding against the observation text** — `bindWireAnalysis` searches `authoritativeSources[].text` for a verbatim span and resolves offsets, and the §112/§118 fixtures paired each row with material it was actually about. M07 measures something different: whether a **separately attached regulatory record** substantiates the *meaning* of a prose statement, adjudicated by a human. A model can quote the observation perfectly — grounding its hazard reasoning in the text it was given — and still have every regulatory-flavoured sentence go unsupported, **because the record it is graded against is about a different subject entirely.** Quote binding and record grounding were never the same property; only the second was exercised here, and it was exercised through a non-semantic pairing.

---

## 6. M05 — fabricated citations

Both events are `POPA-A-28`, one per arm, both `source: BOUNDARY_REJECTION`, both `layerStatus: OUTPUT_REJECTED`.

| Question | Finding |
|---|---|
| rowId / arm | `POPA-A-28`, BASE and PERMUTED |
| emitted citation string | **NOT RECOVERABLE.** `scoreM05` records `text` only for `SURVIVED_TO_MERGE`; the boundary-rejection branch records `{rowId, callId, source}`. The offending string lived in `call.issues[].detail`, inside the lost `CohortRunRecord[]` |
| present in deterministic input? | **No.** The observation is *"Autumn leaf fall around the yard drains is cleared every week under the housekeeping schedule."* The entire precision corpus contains **zero** CFR-shaped strings |
| present in the supplied governed record? | **Yes.** `29 CFR 1926.102` — Eye and face protection — was attached to this row, and its `approvedText` contains `"(29 CFR 1926.102(a)(1))"` and further paragraph references |
| model invented a plausible-looking citation? | **Cannot be determined.** Two hypotheses remain: **echo** of the supplied record, or **parametric invention**. Nothing distinguishes them |
| validator detected it before merge? | **Yes.** `normalizeExpertOutput` collects every string in the payload and rejects the whole analysis on the first `CITATION_SHAPED_PATTERN` match, before any field is adopted |
| survived because validation was permissive? | **No — the opposite.** The boundary failed closed, exactly as designed. M05 counts the *detection*, so a correctly-refused payload still fails the gate |
| in prose or a typed object? | Unknown; `collectStrings` walks the entire payload, `evidence[].quotedText` included |
| alternate arm behaved differently? | **No** — both arms rejected. Reproducible across arms on the only row where it occurred |

**Why the echo hypothesis is favoured.** All 40 attached governed records carry CFR-shaped citations in `approvedText`, and every one is rendered into the user prompt (`buildExpertUserPrompt`: `approved text: ${g.approvedText}`). The model is simultaneously told *"You may reason ABOUT these records"* and *"NEVER write a regulatory citation… anywhere."* The architecture already recognises this hazard elsewhere and defends against it — `expert-deterministic-projection.ts` states in its own header:

> *"`CITATION_SHAPED_PATTERN` refuses `\d{2} CFR \d+` anywhere in Expert OUTPUT including prose, so projecting the decision's citation would invite an echo that gets the whole analysis rejected."*

The projection channel was deliberately made citation-free for exactly this reason. **The governed-record channel was not.** That is an inconsistency inside one architecture, and `POPA-A-28` — a pure negative control about autumn leaves, handed an eye-and-face-protection record — is where it surfaced.

**Smallest architectural rule that would make this fail closed rather than fail the gate.** Neutralise citation tokens on the way *in* rather than only detecting them on the way *out*: render governed records to the model with citation strings replaced by opaque record handles (`record R1`, `record R2`), keeping title and `approvedText` semantics intact, so no CFR-shaped token exists anywhere in the model's context. The output pattern then becomes unreachable by echo, and any remaining hit is unambiguous invention. Secondarily, `scoreM05`'s boundary-rejection branch should persist the offending string so the two hypotheses are separable next time.

**Not proposed:** blacklisting the two strings; relaxing `CITATION_SHAPED_PATTERN`; downgrading M05. **Nothing is implemented in this operation.**

---

## 7. M12 — internal incoherence

11 of 64 rows: `AUG-03, AUG-12, SEM-02, SEM-03, SEM-07, SEM-09, SEM-19, SEM-21, SRC-MSHA-019, SRC-MSHA-041, SRC-OSHA-005`.

The frozen condition (`scoreM12`) is **row-level**: *any* candidate with `assertedConditionState === 'ACTIVE'` **and** *any* clarification with `affectedDecision === 'HAZARD_EXISTENCE'`. The scorer's own note records why — the clarification type carries no hazard family, so a family-coupled reading is not expressible.

**This makes the measure coarser than its name.** A row asserting an active `machine_guarding` hazard while asking an existence question about `confined_space` is scored identically to a genuine self-contradiction. Whether each of the 11 is a true contradiction **cannot be checked** — the candidate lists did not survive. All 20 `HAZARD_EXISTENCE` clarifications did survive, and they are visibly a mixture: `SEM-02`'s *"Has the blade arbor been mechanically pinned…?"* plausibly contradicts an ACTIVE candidate on the same equipment, whereas `AUG-03`'s *"How far is the weatherhead/service drop from the roof work area, and is it energized?"* is an existence question about a **different** hazard than the row's fall exposure.

Against the user's eight candidates:

| Candidate | Verdict |
|---|---|
| independent collection generation without cross-collection consistency | **SUPPORTED (C3)** — no arbitration stage exists anywhere in the pipeline; `normalizeExpertOutput` validates each collection's shape and the cross-field rules it owns (grounding vs evidence, `outcome` vs emptiness, `EXPERT_UNAVAILABLE` vs content) but performs **no candidate↔clarification semantic reconciliation** |
| model uncertain but forced to choose a candidate status | **PARTIALLY SUPPORTED** — `EXPERT_CONDITION_STATES` does offer `INSUFFICIENT_EVIDENCE` and `UNKNOWN`, and the prompt names both as real answers, so the schema is not forcing ACTIVE; but nothing stops ACTIVE and an existence question coexisting |
| candidate generated before clarification reasoning | **PARTIALLY SUPPORTED** — `expertHazardCandidates` is first in schema order and structured decoding emits properties in schema order, the exact mechanism §104 measured for `outcome`. Candidates are therefore committed before the clarification list exists |
| prompt permits "ACTIVE unless disproven" | **UNSUPPORTED** — v6 argues at length in the opposite direction (*"`assertedConditionState: ACTIVE` means active now, not 'would become active if an unstated condition also held'"*) |
| deterministic projection biases candidates toward ACTIVE | **UNRESOLVED** — the projection renders dispositions and an override protocol; whether it shifts condition state is untestable without the candidate lists |
| schema has no unresolved/provisional state | **UNSUPPORTED** — `INSUFFICIENT_EVIDENCE` and `UNKNOWN` exist |
| clarification `affectedDecision` semantics too weak | **SUPPORTED (C9a)** — the same undefined vocabulary that produced the 11 M09 mismatches decides M12's trigger; a question labelled `HAZARD_EXISTENCE` under one reading and `HAZARD_SEVERITY` under another flips this gate |
| post-generation validation checks structure but not semantic contradiction | **SUPPORTED** — confirmed by reading `expert-normalization.ts` |

**Overlap.** All 11 M12 rows are also M14 order-sensitive (100 %). Five are M10 rows; the other six (`SEM-02, SEM-03, SEM-07, SEM-09, SEM-19, SEM-21`) are all **gap-bearing rows**, so M12 is not merely a by-product of asking on rows owed nothing. Nine of 11 also produced spurious M11 insights. One is an M01 true miss. **M12 should be treated as a shared collection-arbitration defect (C3) amplified by an undefined decision vocabulary (C9a) — not as a seventh independent problem.**

---

## 8. M01 and M11 — diagnostic context

### 8.1 M01 — 44/52, eight true misses

| row | family missed |
|---|---|
| GAUNTLET-002 | `lockout_tagout` |
| AUG-04 | `chemical_exposure` |
| SEM-01 | `chemical_exposure` |
| SEM-05 | `chemical_exposure` |
| SEM-15 | `mobile_equipment` |
| SEM-31 | `chemical_exposure` |
| SEM-32 | `machine_guarding` |
| SRC-MSHA-041 | `lockout_tagout` |

**Four of eight are `chemical_exposure`** — the single largest cluster, on a measure with no threshold. Two of the eight rows (`AUG-04`, `SEM-05`) are the same rows that emitted **zero clarifications** and missed their authored gap and missed a recorded interaction. All eight are order-sensitive. *Why* each family was missed is not determinable: the candidate lists are gone, so a miss cannot be separated into "never considered", "considered and raised under a different family", or "raised and rejected at the boundary."

### 8.2 M11 — 5/11 matched, 50 spurious

Spurious insights by kind: `OTHER` 12, `MOBILE_EQUIPMENT_PEDESTRIAN` 10, `LOTO_STORED_ENERGY` 9, `CHEMICAL_PPE_VENTILATION` 7, `CONFINED_SPACE_ATMOSPHERIC` 6, `FALL_EXPOSURE_ANCHORAGE` 3, `ELECTRICAL_WET_ENVIRONMENT` 3.

Six MISSED: `AUG-04` CONFINED_SPACE_ATMOSPHERIC, `AUG-12` ELECTRICAL_WET_ENVIRONMENT, `SEM-03` ELECTRICAL_WET_ENVIRONMENT, `SEM-05` CHEMICAL_PPE_VENTILATION, `SEM-07` LOTO_STORED_ENERGY, `SEM-24` LOTO_STORED_ENERGY.

`scoreM11` counts an insight spurious when it is not the one matched to a recorded truth, so wrong-kind and wrong-participant insights are **both** a miss and a spurious — the note says so. Full classification into the user's categories (duplicate, wrong kind, unsupported, vocabulary-limited, explanation routed into insights) **is not possible**: participants and reasoning did not survive; only `{rowId, kind, verdict}` did. `OTHER` at 12 of 50 is the largest single kind and is consistent with the recorded vocabulary limitation (`EXPERT_INTERACTION_KINDS` cannot express a flammable-atmosphere/ignition-source interaction), but it does not establish it.

**Do M11 and M10 overproduction share a cause?** **PARTIALLY SUPPORTED.** 20 of the 38 M10 rows also produced spurious insights, and the schema description for `crossHazardInsights` uses the same permissive construction as the clarification one (*"Any two or more conditions that interact"*, five worked examples, *"A real interaction belongs HERE, not only in the summary"*) with no counterfactual test and no cap. 50 spurious against 11 recorded is a 4.5:1 overproduction ratio; 165 clarifications against 20 gaps is 8.25:1. Same shape, same asymmetric incentive, different collection. **The known closed-taxonomy limitation is not repaired here.**

---

## 9. Architectural causal graph

```
                    ┌──────────────────────────────────────────┐
                    │ C7  non-semantic governed-record         │
                    │     attachment (sort by citation key,    │
                    │     zip onto first 40 rows)              │
                    └───────┬──────────────────────────┬───────┘
                            │                          │
              ┌─────────────▼──────────┐   ┌───────────▼─────────────┐
              │ C11 lexical regulatory │   │ C6 citation-bearing     │
              │     detector fires on  │   │    approvedText enters  │
              │     ordinary English   │   │    the prompt on all 40 │
              └─────────────┬──────────┘   │    governed rows        │
                            │              └───────────┬─────────────┘
                        ┌───▼───┐                  ┌───▼───┐
                        │  M07  │ 0/9              │  M05  │ 2 (POPA-A-28, both arms)
                        └───────┘                  └───────┘

  ┌───────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────┐
  │ C2 possibility test   │   │ C1 fill-the-list         │   │ C9a affectedDecision   │
  │    ("could change"),  │──▶│    template (modal 3/row,│   │     enum undefined     │
  │    4 worked examples  │   │    EXPOSURE/SEVERITY/    │   │     everywhere         │
  │    reproduced 35×     │   │    REQUIRED_CONTROL)     │   └───────┬────────┬───────┘
  └───────────────────────┘   └───────┬──────────┬───────┘           │        │
                                      │          │                   │        │
                              ┌───────▼───┐  ┌───▼──────────┐  ┌─────▼──┐  ┌──▼─────┐
                              │ M10 38/45 │  │ M09 denom=165│  │M09 mism│  │M12 trig│
                              └───────────┘  └──────────────┘  │ 11 of  │  │ label  │
                                                               │  16    │  │ decides│
                                      ┌────────────────────────┴────────┴──┴────────┘
                                      │
                              ┌───────▼────────────────────┐
                              │ C3 no cross-collection     │──▶ M12 11/64
                              │    arbitration pass        │──▶ M11 50 spurious
                              └────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ C10 evaluation-harness limitation: CohortRunRecord[] lost + P2 ABSENT       │──▶ M14 UNKNOWN
  │      ⇒ no per-row diffs, no same-input control, no candidate/insight bodies │──▶ M01/M11/M12
  └─────────────────────────────────────────────────────────────────────────────┘         detail lost
```

### Candidate-cause verdicts

| | Cause | Verdict | Concrete formal evidence | Failed measures explained |
|---|---|---|---|---|
| **C1** | Collection overproduction bias | **SUPPORTED** | 165 clarifications / 20 gaps; modal 3 per row; {EXPOSURE, SEVERITY, REQUIRED_CONTROL} the most common per-row set; `REQUIRED_CONTROL` on 54 of 56 emitting rows; 50 spurious insights against 11 recorded; five pro-population statements against one anti-population sentence | M10, M09 (denominator), M11, contributes M12 |
| **C2** | Decision-criticality not operationally defined | **SUPPORTED** | prompt and schema both use *"could change"*; the four worked examples reproduced in 35 of 165 emitted clarifications; the anti-genericness paragraph is scoped to remediated conditions only | M10, M09 |
| **C3** | Independent collection reasoning, no arbitration | **SUPPORTED** | `normalizeExpertOutput` performs no candidate↔clarification semantic reconciliation; M12 11/64; six of the 11 are gap-bearing rows, so not merely an M10 by-product | M12, contributes M09/M11 |
| **C4** | Input-order coupling | **UNRESOLVED** | positional serialization and "work through these in order" are present, but `scoredFieldProjection` sorts every collection and no per-row diff survives; P2 ABSENT removes the control | M14 (unattributed) |
| **C5** | Weak governed-evidence authority | **UNSUPPORTED** | the prohibition is stated hard and appears obeyed — 194 of 195 payloads citation-free; none of the 9 flagged statements invokes a named regulation | none |
| **C6** | Citation fail-open | **UNSUPPORTED as stated; the opposite is SUPPORTED** | the boundary failed **closed** — whole-payload rejection on first match, both arms of POPA-A-28. The real defect is **fail-closed on an echo the input invited** | M05 |
| **C7** | Record-row attachment semantic weakness | **SUPPORTED** | `governedAttachment.rule` verbatim; 7 of 7 attached records topically unrelated to their flagged statement | M07, M05 |
| **C8** | State/temporal ambiguity | **PARTIALLY SUPPORTED** | v6 devotes two long sections to current-vs-historical, which is evidence the ambiguity is real and unresolved; the 22 "interim control / removed from service" and 2 "future verification" NO_GAP buckets are temporal-frame questions | M10 (partial) |
| **C9** | Schema pressure / output-contract ambiguity | **SUPPORTED, specifically as C9a** | `EXPERT_AFFECTED_DECISIONS` is a six-member enum with **no definition in the type, the prompt, or the schema description**; the 11 mismatches are bidirectional between the same label pairs | M09 (mismatch half), M12 (trigger) |
| **C10** | Evaluation-harness limitation | **SUPPORTED** | `CohortRunRecord[]` never serialized (`execute-formal-cohort-65.ts` writes only derived evidence though the harness returns `records`); `P2_DETERMINISM_CONTROL = ABSENT`; all 64 M17 pairs rejected for `sameProcess` | M14 unattributable; M01/M11/M12/M05 detail unrecoverable |
| **C11** | Lexical regulatory detector over-fires | **SUPPORTED** *(added by this diagnostic)* | all 9 items triggered by *violation / compliance / regulatory / the standard / regulation*; 0 contain a citation; only 2 assert an obligation | M07 |

---

## 10. Ranked root causes

1. **C7 + C11 — the M07 instrument.** Highest confidence, largest single distortion. M07 = 0/9 is substantially a property of the instrument. Repairing the model would not move it.
2. **C1 + C2 — clarification overproduction under a possibility test.** Highest confidence among model-behaviour causes, and the only one whose repair moves two gates (M10, M09) plus M11.
3. **C9a — `affectedDecision` undefined.** High confidence, cheap to test, gates the useful/mismatch split in M09 and the trigger for M12.
4. **C3 — no cross-collection arbitration.** Medium-high confidence; the direct cause of M12 and a contributor to M11.
5. **C6 — citation echo invited by the input.** Medium-high confidence for the mechanism, **unproven for the specific event** (string not persisted).
6. **C10 — harness evidence loss and absent determinism control.** Certain as a fact; it is why item 7 exists.
7. **M14 — UNKNOWN.** The largest numerical breach in the surface has no established cause and none can be established from this run.

---

## 11. Remediation design — **not implemented**

No product code, prompt, schema, scorer, threshold or truth was edited in this operation.

### R1 — Counterfactual decision-criticality test (addresses C2, C1)
1. Replace the possibility test with a two-branch counterfactual the model must be able to state: *name the answer that would change the decision and the answer that would not; if you cannot name both, do not ask.* Lift the anti-genericness paragraph out of the `CURRENT STATE` section into a global rule.
2. It targets the licensing rule, not the spent rows — no row, question or family is named.
3. `expert-prompt.ts` (`EXPERT_SYSTEM_PROMPT`, `decisionCriticalClarifications` schema description). `EXPERT_PROMPT_VERSION` bump. No wire-schema field moves.
4. Regression risk to protected deterministic HazLenz: **none** — Expert is additive and cannot alter deterministic output. Risk **to Expert**: suppressing genuine questions and worsening the four unmapped gaps. Must be measured, not assumed.
5. Zero-provider first: `test:expert-nocall-harness` containment; replay fixtures asserting an under-specified observation still yields a question.
6. Local-model: yes — a suppression check on the fixtures that currently produce questions.
7. Hosted probes: required. The relevant statistic is questions-per-row on not-owed rows **and** retention on gap-bearing rows, measured together.
8. New cohort eventually necessary: **yes** — M09/M10 cannot be re-measured on the spent cohort.
9. Falsified if: question volume falls but gap coverage falls with it, or not-owed rows still average ≥ 2 questions.

### R2 — Define `affectedDecision` (addresses C9a)
1. Give each of the six members a one-line operational definition with a disambiguation rule for the observed collision pairs (`REQUIRED_CONTROL` vs `HAZARD_EXISTENCE`, `HAZARD_SEVERITY` vs `HAZARD_EXISTENCE`, `APPLICABILITY` vs `REQUIRED_CONTROL`), in the type's doc comment **and** as per-value `description` in the wire schema.
2. Addresses the vocabulary both labellers had to guess; changes no member and no scorer.
3. `expert-contract.types.ts`, `expert-prompt.ts` schema builder.
4. Regression risk: none to deterministic; low to Expert.
5. Zero-provider: an inter-rater check — re-label the 16 mapped clarifications against the written definitions and measure agreement with the authored key **as a diagnostic exercise only**, never as an adjudication change.
6. Local-model: useful.
7. Hosted: required before a cohort.
8. New cohort: yes.
9. Falsified if: two independent labellers still disagree on the same pairs after the definitions exist — that would indicate the six-member vocabulary is wrong, not merely undefined.

### R3 — Facts-then-collections with one arbitration pass (addresses C3, C1, C12)
1. Generate a decisions layer first (per family: does the hazard exist now, is exposure established, what is uncertain), then derive candidates, clarifications and insights from it, then run a single arbitration pass rejecting an ACTIVE candidate that coexists with an unresolved existence question **for the same family**.
2. Structural: it removes the mechanism by which independent collections contradict each other, rather than patching the 11 rows.
3. `expert-prompt.ts` (ordering), possibly `expert-contract.types.ts` (a family-carrying field on the clarification), `expert-normalization.ts` (arbitration). **A family field on the clarification is a wire-schema change and needs its own authorization** — it would also make M12 expressible at family level, which is a *contract* change and must not be presented as a scorer relaxation.
4. Regression risk: moderate — reordering schema properties has a measured behavioural effect (§104), so this is not cosmetic.
5. Zero-provider: replay fixtures for the arbitration rule; full `test:expert-nocall-harness`.
6. Local-model: yes.
7. Hosted: required.
8. New cohort: yes.
9. Falsified if: incoherence persists at family level after arbitration, or arbitration suppresses true candidates.

### R4 — Citation-free record rendering (addresses C6, M05)
1. Render governed records to the model with opaque handles (`record R1`) instead of CFR strings, retaining title and `approvedText` meaning; keep `CITATION_SHAPED_PATTERN` exactly as frozen. Separately, persist the offending string on the boundary-rejection branch of `scoreM05`.
2. Removes the token class from the input so echo is impossible; any residual hit is unambiguous invention. Not a blacklist and not a pattern relaxation.
3. `expert-prompt.ts` (`buildExpertUserPrompt`), `expert-input-constructor.ts`; the scorer-evidence change touches `expert-measure-scorers.ts` and **is a frozen-scorer edit requiring separate authorization** — it must not ride along with a prompt change.
4. Regression risk: low; the model loses the ability to name a record by citation, which the contract already forbids it to do.
5. Zero-provider: a fixture asserting no CFR-shaped token appears anywhere in a built request when governed records are attached.
6. Local-model: yes.
7. Hosted: advisable, low priority.
8. New cohort: only for a formal M05 re-measurement.
9. Falsified if: citation-shaped output still occurs with a citation-free input — that would prove invention, not echo, and R4 would be the wrong repair.

### R5 — Semantic record attachment for any FUTURE cohort (addresses C7, C11) — **evaluation instrument, not product**
1. A future cohort should attach governed records by hazard-family relevance, and M07's denominator should identify *asserted regulatory obligations* rather than keyword hits — narrowing to `assertsObligation` alone would already have moved this run's denominator from 9 to 2.
2. Targets the instrument that produced the finding.
3. Cohort assembly and `expert-measurement-contract.ts`. **Both are frozen-governance surfaces. This is a proposal for a future cohort under separate authorization, not a change to the spent one.** The spent cohort's design is not repaired retroactively and its M07 = 0/9 stands as recorded.
4. Regression risk: none to product.
5–8. Belongs to cohort construction, not model remediation.
9. Falsified if: a relevance-matched cohort produces the same 0/9 — which would then be genuine evidence of a model grounding defect.

### R6 — M14 must become answerable (addresses C10, M14)
1. Persist both arms' `scoredFieldProjection` **and** the validated analyses. Add a same-input control arm so order effects are separable from sampler noise. Consider reporting M14 rather than gating it while `P2_DETERMINISM_CONTROL = ABSENT`, **as a pre-registration decision made before a cohort opens, never as a response to a failing result** — the G9 lesson applies to M14 exactly as it applied to M17.
2. Without a control arm, M14 measures total instability and attributes it to order by assumption.
3. Harness and execution script; the disposition question belongs to `expert-evaluation-plan.ts` and is a **governance decision for the product owner**.
4. Regression risk: none to product.
9. Falsified if: a same-input control shows near-zero divergence — which would confirm order-conditioning and make M14 a valid gate as written.

**Assessment of the user's suggested general rules.** Explicit empty-by-default collections: **supported** by the 3-per-row template. Counterfactual decision-criticality: **supported**, R1. Facts/decisions before collections: **supported**, R3, with the §104 caveat that property order has measured effects. Single arbitration pass: **supported**, R3. Canonical input representation: **not validated** — plausible but unevidenced while M14 is unattributed; implementing it now would be a speculative fix. Governed-record-only obligation rule: **already present and apparently obeyed** — not a defect to repair. Citation allowlist/binding enforcement and fail-closed citation validation: **already fail-closed**; the gap is on the input side, R4. Separate CURRENT / HISTORICAL / FUTURE: **partially supported** (C8) — v6 already argues it in prose; a typed distinction is a schema change needing its own evidence. Deterministic semantic IDs/order: **not validated**, same reason as canonical input.

---

## 12. Future formal-evaluation harness debt

Distinct from model remediation. **Must be repaired before another formal cohort runs.**

1. **Persist the complete `CohortRunRecord[]` during execution.** The harness already returns it (`expert-cohort-harness.ts:465-467`); `execute-formal-cohort-65.ts` writes `EVALUATION-RESULT.json`, `ATTEMPT-LEDGER.json` and `ADJUDICATION-QUEUE.json` and never serializes `run.records`. **This defect is not normalized: it is the reason M14 has no root cause and M01/M05/M11/M12 have no detail.**
2. **Persist each validated `ExpertAnalysis` and every merged output any frozen scorer reads** — both arms, including `call.issues[].detail` and per-candidate quote-binding statistics.
3. **Make stage-4 `buildScoringReport` reproducible after process exit**, so the frozen end-to-end path is available and no post-hoc recovery verifier is needed.
4. **Preserve append-only attempt telemetry** — already working; keep it, and fsync it as the run record already is.
5. **Retain model-identity binding and the hard provider-request ceiling** — both held (`EXECUTION_IDENTITY_MISMATCH` armed, 195 of 215).
6. **Retain prospective spend enforcement** — held; 0 prospective blocks, $6.93 of $22.36.
7. **Add an artifact-completeness preflight** that refuses to declare a cohort formally executable unless every frozen scorer's inputs are provably persisted. A single assertion over the scorer set would have caught this before spend.
8. **Decide whether M17 requires true separate OS processes.** All 64 pairs were rejected for `sameProcess`; until the harness forks, M17 can only ever be `NO_OPPORTUNITY`.
9. **Record `P2_DETERMINISM_CONTROL` explicitly for the selected provider/model before opening a cohort**, and let every measure that assumes reproducibility — M14 included, not only M17 — inherit that fact at pre-registration time.

---

## 13. Unresolved questions

1. **M14's cause.** Order-conditioned vs general stochastic instability is **undetermined and undeterminable from this run.** The projections were never persisted and no same-input control exists. This is the single most important open question in the surface.
2. **The `POPA-A-28` citation string.** Echo of the supplied record vs parametric invention — not recoverable.
3. **Whether the 11 M12 rows are true self-contradictions** or same-row/different-family artifacts of a row-level scorer. Not recoverable.
4. **Why four `chemical_exposure` recalls were missed** — never considered, mis-familied, or boundary-rejected. Not recoverable.
5. **Whether an approved-exact governed record changes grounding behaviour.** `REVIEWER_APPROVED_GOVERNED_RECORDS = 0`; never exercised.
6. **Whether M11's `OTHER` cluster (12 of 50) is the known vocabulary limitation.** Participants and reasoning not persisted.
7. **Whether the deterministic disposition block shifts candidates toward ACTIVE.** Untestable without candidate lists.
8. **Whether the `affectedDecision` vocabulary is under-defined or wrong.** R2 distinguishes these; this run cannot.

**Items 2, 3, 4, 6 and 7 are permanently unrecoverable for this cohort.** No further zero-provider analysis of these artifacts can close them; they require the harness repair plus future authorized measurement.

---

## 14. Evidence used and not used

**Used — read in full:** every artifact under `verification/expert-hazlenz-formal-evaluation-2026-09-01/`: `EVALUATION-RESULT.json` (including every measure's complete `evidence` array), `RUN-RECORD.json`, `EXECUTION.txt`, `ATTEMPT-LEDGER.json` (all 195 entries and their per-attempt records), `ADJUDICATION-QUEUE.json` (all 174 items), `ADJUDICATION-PACKET.json`, `ADJUDICATIONS.json`, `RECOVERABILITY-AUDIT.json`, `RECOVERED-MEASURES.json`, `RECOVERED-MEASURES.txt`, `RECOVERY-LEDGER.csv`, `FINAL-CLASSIFICATION.txt`; plus `verification/expert-hazlenz-formal-cohort-frozen-2026-09-01/COHORT-MANIFEST.json` (all 65 rows, truth, classes, governed attachment mapping) and `FREEZE.txt`.

**Used — read selectively, and this is stated precisely rather than overclaimed.** `docs/INSITE_CURRENT_STATE.json` (1.51 MB, 166 top-level keys) and `docs/INSITE_ENGINEERING_BLUEPRINT.md` (21,364 lines, 1.78 MB) were **not** read end to end. From the state document this diagnostic read the complete key inventory, `expertFormalEvaluationExecuted2026_09_01`, `expertFormalEvaluationFinalClassification2026_09_02`, and every `P2_DETERMINISM_CONTROL` and M17 occurrence. From the blueprint it read the targeted sections its own FUTURE-SESSION BOOTSTRAP directs a task to open — that bootstrap states explicitly that "the blueprint exists so you do not have to read all of it." **A reader should treat any blueprint-level design rationale not quoted in this report as unexamined.** No conclusion here rests on an unread passage: every causal claim is anchored to a formal artifact or to source read directly.

**Used — implementation and contract:** `expert-prompt.ts`, `expert-contract.types.ts`, `expert-normalization.ts`, `expert-measure-scorers.ts`, `expert-measurement-contract.ts`, `expert-evaluation-plan.ts`, `expert-deterministic-projection.ts`, `expert-input-constructor.ts`, `expert-provider.ts`, `expert-runner.ts`, `expert-authority-matrix.ts`, `scripts/lib/expert-cohort-harness.ts`, `scripts/execute-formal-cohort-65.ts`, `scripts/verify-formal-recovered-measures.ts`, `src/safescope-v2/tests/hazlenz-decomposition-precision-corpus.ts`.

**Source-identity check — the analysed code is the code that ran.** Every one of the 16 files whose SHA-256 the run recorded in `integrityHashesBeforeFirstCall` was re-hashed from the working tree during this diagnostic and **all 16 match byte-for-byte**, including `expert-prompt.ts`, `expert-normalization.ts`, `expert-measure-scorers.ts`, `expert-measurement-contract.ts`, `expert-deterministic-projection.ts`, `expert-cohort-harness.ts` and the anthropic adapter. Several of these files carry uncommitted modifications relative to `HEAD` (`37a5d1b5`), but those modifications were already in place when the cohort executed. Every prompt, schema, normalizer and scorer claim in this report therefore describes the exact artifact that produced the formal result, not a later edit of it.

**NOT used, because it does not exist:** the `CohortRunRecord[]`; any validated `ExpertAnalysis` from either arm; all `expertHazardCandidates`, `crossHazardInsights`, `disagreements`, `uncertainty` bodies; every field of the PERMUTED and CROSS_PROCESS arms; `call.issues[].detail` including the `POPA-A-28` citation string; per-candidate quote-binding statistics; per-row `scoredFieldProjection` values.

**NOT used, because it was prohibited:** any provider or LLM call; any reserved material; any cohort rerun; any new cohort; any hosted disambiguation of the M14 hypotheses.

**Analyst-generated and labelled as such:** the semantic bucketing of the 149 NO_GAP clarifications (§4.3) is a keyword heuristic written for this report. It is descriptive only, changed no adjudication, and no measure was recomputed from it.

**Not done:** no adjudication was reinterpreted; no scorer, truth, threshold, prompt, schema or frozen artifact was modified; no tuning against individual spent-cohort rows was performed; no remediation was implemented.
