# §204 — POST-120 CLOSURE REPORT

Written 2026-09-07, immediately after batch `204-D-BATCH-3-U19` completed the headline denominator.
Supersedes `SF-08-POST-RECORDING-CLOSURE-204.md` (written at 74/120) as the current synthesis; that
document remains immutable evidence and is not edited.

**TERMINAL STATE:**
`EXPERT_HAZLENZ_DEVELOPMENT_SEMANTIC_ADJUDICATION_COMPLETE — REMEDIATION_REQUIRED`

**THIS IS NOT AN ACCEPTANCE STATE.** 120/120 means the defined HEADLINE semantic instrument is
fully adjudicated. It does not mean Expert HazLenz is validated, and no quality claim in this
document extends beyond the §199 twelve-row cohort as executed on a single provider in a single run.

**STATUS.** Synthesis of already-recorded results. Supplies no verdict, implies no verdict, and
pre-commits no open product-owner decision beyond the two rulings §9 states are now evidence-
supported. Provider calls 0. Database operations 0. No prompt, contract, or priority mutation. No
production or customer activation. No successor promotion. No commit, push, tag, or deploy.

**SEQUENTIAL ADJUDICATION IS STOPPED.** The 66 deferred supplementary slots (56 verifier sub-axis
fields, 2 refused-declaration questions, and the carried remainder) are NOT opened for
completeness. They remain deferred under the §202 product-owner decision.

---

## 1. FINAL HEADLINE COUNT

| | |
|---|---|
| **SUPPLIED** | **120 / 120** |
| **REMAINING** | **0 / 120** |
| Supplementary (deferred by §202 product-owner decision) | 0 / 66 |
| Structurally prefilled `NOT_EXERCISED` (governed axes N, S, T × 8 facts) | 24 |
| Excluded by product-owner decision (SG-01 / SG-02 row axes) | 8 |
| Frozen §200 arithmetic reproduced | 152 total / 24 prefilled / 128 open, denominator ruled 120 |

Every verdict carries attribution `PRODUCT_OWNER`. No model-authored verdict is representable:
`recordVerdict` refuses any attribution but the exact string, refuses writes into the 24 structural
slots, and refuses any out-of-vocabulary value. Counts are as reported by the recorder, not
recomputed by a second path.

**Batches applied, in order:** `204-A-U01`, `-U02`, `-U03`, `-U04`, `-U04-CORRECTION`, `-U05`,
`-U05-COMPLETION`, `-U06`, `-U07`, `-U08`, `-U09`, `-U12`, `-SF08`, `204-D-BATCH-1`,
`204-D-BATCH-2`, `204-D-BATCH-3-U18`, `204-D-BATCH-3-U19`. Ledger:
`VERDICT-LEDGER-204.jsonl`. Additive product-owner reasoning is recorded on 16 of the 21 review
units; U01, U02, U03, U11, U20 and U21 carry none.

---

## 2. VERDICT DISTRIBUTION BY AXIS

### 2.1 Row axes — 10 adjudicable rows × 4 = 40 slots

| Axis | n | CORRECT | PARTIALLY_CORRECT | INCORRECT | NOT_EXERCISED |
|---|---|---|---|---|---|
| A — FIRST_PASS_GAP_RECALL | 10 | 8 | 0 | 1 | 1 |
| B — FIRST_PASS_GAP_PRECISION | 10 | 9 | 0 | 1 | 0 |
| H — MULTI_GAP_PRESERVATION | 10 | 3 | 0 | 1 | 6 |
| I — FALSE_GAP_SUPPRESSION | 10 | 3 | 0 | 1 | 6 |
| **Row total** | **40** | **23** | **0** | **4** | **13** |

`AMBIGUOUS` was never used on any axis in the whole instrument.

### 2.2 Fact axes — 8 projected facts

| Axis | n | CORRECT | PARTIALLY_CORRECT | INCORRECT |
|---|---|---|---|---|
| C — OWED_PROPERTY_SEMANTIC_CORRECTNESS | 8 | 7 | 1 | 0 |
| D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE | 8 | 8 | 0 | 0 |
| E — BRANCH_PLAUSIBILITY | 8 | 5 | 3 | 0 |
| F — DECISION_DIVERGENCE_VALIDITY | 8 | 4 | 3 | 1 |
| G — AFFECTED_DECISION_CORRECTNESS | 8 | 7 | 0 | 1 |
| L — VERIFIER_TARGET_BINDING | 8 | 8 | 0 | 0 |
| M — CLARIFICATION_RESOLUTION_SUFFICIENCY | 8 | 6 | 1 | 1 |
| **Five-value fact total** | **56** | **45** | **8** | **3** |

| Axis Q — OWED_PROPERTY_LOSS_IMPACT | n=8 |
|---|---|
| `NO_OBSERVABLE_LOSS` | 7 (U02, U05, U07, U14, U16, U17, U19) |
| `CLARIFICATION_INSUFFICIENCY` | 1 (U09 / SF-06) |
| every other scale member | 0 |

| Axis R — SAFETY_CLASSIFICATION | n=8 |
|---|---|
| `PLAUSIBLY_LIFE_CRITICAL` | 4 (U05, U09, U16, U17) |
| `SAFETY_SIGNIFICANT` | 2 (U14, U19) |
| `ORDINARY_NON_ESCALATING` | 2 (U02, U07) |
| `INDETERMINATE` | 0 |

| Axis R — PRIORITY_FLOOR_IMPACT | n=8 |
|---|---|
| `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` | 7 (all but U07) |
| `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` | 1 (U07) |
| `INDETERMINATE` | 0 |

**Governed axes N, S, T:** 24 slots, all `NOT_EXERCISED`, all structurally prefilled. The governed
capability was never present on a row that reached inference. That is a statement about the RUN,
not about the model.

---

## 3. OPPORTUNITY-ADJUSTED RATES

`NOT_EXERCISED` slots are removed from the denominator: an axis with no genuine opportunity to fail
is not evidence of success. Axes R (both halves) are excluded from any success rate — they are
classification and diagnostic measurement, not model pass/fail.

| Population | Exercised slots | Clean (CORRECT / NO_OBSERVABLE_LOSS) | Partial | Incorrect | Clean rate |
|---|---|---|---|---|---|
| Row axes | 27 | 23 | 0 | 4 | **85.2 %** |
| Fact five-value axes | 56 | 45 | 8 | 3 | **80.4 %** |
| Axis Q | 8 | 7 | — | 1 | **87.5 %** |
| **Pass/fail-bearing total** | **91** | **75** | **8** | **8** | **82.4 %** |
| Axis R (diagnostic, excluded above) | 16 | n/a | n/a | n/a | n/a |
| `NOT_EXERCISED` (excluded) | 13 | — | — | — | — |
| **Reconciles to** | **120** | | | | |

Per-axis opportunity-adjusted clean rates: A 8/9 = 88.9 %; B 9/10 = 90.0 %; H 3/4 = 75.0 %;
I 3/4 = 75.0 %; C 7/8; D 8/8; E 5/8 = 62.5 %; F 4/8 = 50.0 %; G 7/8; L 8/8; M 6/8 = 75.0 %;
Q 7/8.

**The two weakest axes are F (50.0 %) and E (62.5 %)** — both are branch/decision-representation
axes located in the first-pass declaration. **The two perfect axes are D and L** — evidence-span
relevance and verifier target binding, 8/8 each.

**These rates are descriptive of the §199 cohort at n=10 rows and n=8 facts.** They carry no
confidence interval, no repeat measurement, and no cross-provider replication, and they must not be
quoted as a capability figure.

---

## 4. COMPLETE SUCCESS REGISTER

Every entry names the cases it rests on and the cases that do not replicate it.

| # | Success | Cases | Non-replicating / contrary cases |
|---|---|---|---|
| **S1** | Clean single-fact recall, precision and projection on `SINGLE_REAL_UNRESOLVED_FACT` + `NEARBY_PROPERTY_COMPETITION` | SF-01 (U01 all-CORRECT, U02 all-CORRECT); SF-07 replicate (U13 all clean; U14 clean except `F`) | the SF-07 replicate is clean on 13 of 14 slots, so S1 replicates with one qualification (see F7) |
| **S2** | Clean false-gap suppression on `NO_REAL_GAP` rows | SF-03 (U03 all-CORRECT), SF-12 (U12 `B`, `I` = CORRECT) | SF-04 (U06 `B`=INCORRECT, `I`=INCORRECT) — the contrary case, and the one that defines F2 |
| **S3** | **Verifier target binding held on every adjudicated projected fact — 8 of 8** | U02, U05, U07, U09, U14, U16, U17, U19 all `L`=CORRECT | none. This is the instrument's only unbroken axis besides D |
| **S4** | **Evidence-span semantic relevance held on every adjudicated projected fact — 8 of 8** | all eight facts `D`=CORRECT | none |
| **S5** | Conjunctive decomposition preserved both conjuncts through admission | SF-08 (U15 `A`=CORRECT, `H`=CORRECT); two projected facts exist for the row, neither dropped nor merged | the instrument's only `CONJUNCTIVE_FACT` row; **unreplicated** |
| **S6** | Exact owed-property identification held on 7 of 8 facts | U02, U05, U07, U09, U14, U16, U19 `C`=CORRECT | U17 `C`=PARTIALLY_CORRECT (F4) |
| **S7** | **Semantic recall and precision survived a structurally refused declaration** | SF-05 (U10 `A`=CORRECT, `B`=CORRECT) despite the row's sole declaration being rejected for empty `decisionIfA`/`decisionIfB` | the instrument's only refused-declaration row; **unreplicated**. The refusal itself is defect F8 |
| **S8** | **The `NOT_OBSERVED_IS_NOT_ABSENT` trap was not taken** | SF-11 (U18 `A`=CORRECT, `B`=CORRECT): ten minutes without a pedestrian was not treated as establishing absence, and the absent walkway/barrier — stated facts — were not promoted into owed facts | the instrument's only `NOT_OBSERVED_IS_NOT_ABSENT` row; **unreplicated** |
| **S9** | Owed-property projection loss was **not** consequential on 7 of 8 facts, including the only conjunctive pair and the only exposure fact | `Q`=NO_OBSERVABLE_LOSS on U02, U05, U07, U14, U16, U17, U19 | U09 / SF-06 (F3) is the single counterexample and is never generalized away |

---

## 5. COMPLETE DEFECT REGISTER

| # | Defect mechanism | Cases | Non-replicating / contrary cases | Replication |
|---|---|---|---|---|
| **F1** | **Independent multi-gap loss** — a row with two genuinely independent unresolved facts did not carry both | SF-02 (U04 `A`=INCORRECT, `H`=INCORRECT) | SF-08 (U15 `H`=CORRECT) is the contrary case | 1 of 1 opportunity on `MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS` |
| **F2** | **Unsupported adverse counterfactual inflation** — a decision-neutral unknown promoted to a decision-critical owed fact | SF-04 (U06 `B`=INCORRECT, `I`=INCORRECT; U07 `F`=INCORRECT, `G`=INCORRECT, `E`=PARTIALLY_CORRECT) | SF-03, SF-12 clean on the same `NO_REAL_GAP` family | 1 of 3 `NO_REAL_GAP` rows |
| **F3** | **Temporal-qualifier loss with downstream clarification insufficiency** — the qualifier present in `missingFact`, absent from the projected `OwedFact`, followed by a clarification answerable YES while the property stayed unresolved | SF-06 (U09 `M`=INCORRECT, `Q`=CLARIFICATION_INSUFFICIENCY, `E`/`F`=PARTIALLY_CORRECT) | seven other facts `Q`=NO_OBSERVABLE_LOSS | **1 of 8 facts. Did not replicate on either discriminating test (U16 conjunctive, U19 exposure)** |
| **F4** | **Incomplete semantic partition of the declared property** — the A/B branch pair omits a materially plausible third state ("control performed but the safety state was not established") | SF-08 U17 (`C`, `E`=PARTIALLY_CORRECT) | U16 `C`/`E`=CORRECT on the sibling conjunct; U19 `E`=CORRECT, where the product owner recorded expressly that no third state is omitted | 1 of 8 facts |
| **F5** | **Clarification resolves performance, not result** — wording fails to distinguish a control performed *for the purpose of* confirming a state from one that *confirmed* it | SF-08 U17 (`M`=PARTIALLY_CORRECT) | U14 and U19 `M`=CORRECT, each recorded expressly as NOT reproducing this pattern | 1 of 8 facts |
| **F6** | **Deterministic priority floor materially understates safety significance** | `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` on 7 of 8 facts, four of them `PLAUSIBLY_LIFE_CRITICAL` projected at priority `OTHER` | U07 only | **7 of 8 — the most replicated finding in the instrument** |
| **F7** | **Decision-divergence overreach — NEW AT 120/120** — the downstream decision statement asserts more than its own branch establishes, on either side | SF-07 U14 (`F`=PARTIALLY_CORRECT: `decisionIfA` claims "no additional respiratory or engineering control is required", which effective LEV capture alone does not establish); SF-11 U19 (`F`=PARTIALLY_CORRECT: `decisionIfB` claims "the exposure pathway is otherwise controlled by procedure", which branch B does not establish) | U02, U05, U16, U17 `F`=CORRECT | **2 of 8 facts, on two different affected-decision types (`REQUIRED_CONTROL`, `EXPOSURE`) and on opposite branch sides. This is the only mechanism that replicated across families, and it was invisible at 74/120** |
| **F8** | **First-pass declaration contract non-compliance with total owed-fact loss — NEW** — the row's sole declaration was emitted with empty `decisionIfA` and `decisionIfB`, was rejected `REQUIRED_FIELD_MISSING` ×2, and the row produced **zero** admitted facts, despite semantically correct recall and precision | SF-05 (admission record: `admittedFactKeys` empty, `rejectedDeclarations` = `decl1`) | every other adjudicable row admitted at least one fact | 1 of 10 rows |

**Interaction between F7 and F8 worth stating plainly:** both concern the `decisionIf*` fields. F8 is
those fields being empty; F7 is those fields being over-claimed. Three of the ten adjudicable rows
show a defect located in the decision-divergence representation.

**No `TRUTH_SPECIFICATION_DEFECT` was recorded on any of the 21 review units.** That is a recorded
absence, not a validation of the frozen preregistration: the preregistration was never the oracle,
and only a fraction of its fields were compared field-by-field.

---

## 6. DEFECT SEPARATION BY ORIGINATING STAGE

| Stage | Defects | Slots implicated | Note |
|---|---|---|---|
| **First-pass / model semantic** | F1, F2, F4, F7 | U04 `A`,`H`; U06 `B`,`I`; U07 `E`,`F`,`G`; U17 `C`,`E`; U14 `F`; U19 `F` — 12 slots | The largest category. All four are declaration-time semantic defects, reachable by first-pass instruction change alone |
| **Representation / projection** | F3 (projection half only) | the `missingFact`-to-`OwedFact` loss on U09 | **1 of 8 facts.** Six other facts lost `missingFact` identically with `Q`=NO_OBSERVABLE_LOSS. Projection loss is real but rarely consequential on this cohort |
| **Verifier** | **NONE RECORDED** | — | `L`=CORRECT on 8 of 8. No verifier defect is established anywhere in the 120. The 56 verifier sub-axis fields that could refine this remain deferred, so this is "no defect found at headline resolution", not "verifier verified" |
| **Clarification** | F3 (clarification half), F5 | U09 `M`=INCORRECT; U17 `M`=PARTIALLY_CORRECT | 2 of 8 facts. Both are wording defects: property-faithfulness (F3) and result-versus-performance (F5) |
| **Deterministic policy** | F6 | 7 of 8 `R_PRIORITY_FLOOR_IMPACT` slots | Not a model defect. The projected priority floor is `OTHER` by deterministic policy; the model authored no priority (Ruling 5 stands) |
| **Adjudication / evidence tooling** | **T1** (see §6.1) | none of the 120 | Not an Expert model or verifier defect. Carried in `POST-120-REMEDIATION-REGISTER.md` |
| **Truth specification** | **NONE RECORDED** | — | Zero `TRUTH_SPECIFICATION_DEFECT` additives across 21 units. See the caveat in §5 |
| **First-pass contract compliance** *(structural, not semantic)* | F8 | none of the 120 directly; measured at U10 `A`/`B` and in the SF-05 admission record | A structural/contract failure. It is deliberately NOT converted into a semantic verdict — U10 `A` and `B` are CORRECT because the semantic recall and precision were correct |

### 6.1 T1 — recording-path defect, carried forward as instructed

`recordAdditive` in `backend/scripts/lib/expert-202-adjudication-grouping.ts` performs
`unit[field] = text`, i.e. **overwrite, not append**, despite the additive framing of the §204
recording path. A later batch recording additive reasoning onto a unit that already carries it
would silently destroy the earlier text; only `VERDICT-LEDGER-204.jsonl` would retain it.

**Classification: ADJUDICATION / EVIDENCE-TOOLING INTEGRITY DEFECT. It is NOT an Expert
model/verifier defect and does not touch any of the 120 verdicts.**

**Evidence loss to date: NONE OBSERVED.** Every additive recording either had a null prior value or
carried the prior value forward by caller-side concatenation (`prior + separator + new`), which was
the mitigation used in batches `204-A-SF08`, `204-D-BATCH-1`, `204-D-BATCH-2`,
`204-D-BATCH-3-U18` and `204-D-BATCH-3-U19`.

**Not repaired.** Full entry in `POST-120-REMEDIATION-REGISTER.md`, ENTRY 1.

---

## 7. SAFETY-CRITICAL DEFECTS VERSUS ORDINARY QUALITY DEFECTS

Classed by the recorded `R_SAFETY_CLASSIFICATION` of the fact each defect sits on, and by whether
the mechanism can suppress or under-state a decision-critical safety question.

### 7.1 Safety-critical

| Defect | Why safety-critical | Recorded safety classification of the affected fact(s) |
|---|---|---|
| **F8** — total owed-fact loss through contract non-compliance | The row's genuine machine-guard interlock uncertainty (whether opening the interlocked door actually stops hazardous motion) produced **no owed fact at all**. A correct semantic reading was destroyed by an empty required field. This is the most consequential single event in the instrument: complete suppression, not degradation | SF-05 has no projected fact, so no `R` slot exists — the absence is itself the finding |
| **F1** — independent multi-gap loss | A second genuinely independent decision-critical unresolved fact was not carried. The surviving fact on that row is `PLAUSIBLY_LIFE_CRITICAL` | U05 `PLAUSIBLY_LIFE_CRITICAL` (rescue capability) |
| **F3** — temporal-qualifier loss with clarification insufficiency | The clarification could be answered YES while the declared property remained unresolved, on a fact classed `PLAUSIBLY_LIFE_CRITICAL` (crane brake load test) | U09 `PLAUSIBLY_LIFE_CRITICAL` |
| **F4 / F5** — omitted "performed but not established" state, and performance-not-result clarification | Together they permit an electrical isolation to be treated as proved when only the act of testing was confirmed | U17 `PLAUSIBLY_LIFE_CRITICAL` (voltage test at point of work) |
| **F6** — priority floor under-escalation | Four `PLAUSIBLY_LIFE_CRITICAL` facts and two `SAFETY_SIGNIFICANT` facts are projected at priority `OTHER` | 7 of 8 facts |

### 7.2 Ordinary quality

| Defect | Why not safety-critical on this record |
|---|---|
| **F2** — adverse counterfactual inflation | It manufactures an owed fact where none is needed. It costs reviewer attention and false blocking, not missed hazard. The affected fact is `ORDINARY_NON_ESCALATING` (U07) |
| **F7** — decision-divergence overreach | Both instances over-claim a *reassuring* downstream conclusion, which could cause a control to be judged sufficient on weaker grounds than the branch supports. Both affected facts are `SAFETY_SIGNIFICANT`, not `PLAUSIBLY_LIFE_CRITICAL`. **Borderline: it is classed ordinary here only because the over-claim is downstream of a fact that is still correctly declared and correctly clarified. If it ever co-occurs with F4, the combination is safety-critical** |
| **T1** — recorder overwrite | Evidence-integrity only. No customer-facing or safety path touches it |

---

## 8. WHAT THE COMPLETE RECORD CHANGES VERSUS THE 74/120 READING

Three things the 74/120 report could not know, now settled by the record:

1. **Both discriminating tests it named came back clean.** It stated that U16's `Q` and U19's `Q`/`M`
   were the only remaining chances to replicate F3 outside the temporal family. U16 `Q` =
   NO_OBSERVABLE_LOSS. U19 `Q` = NO_OBSERVABLE_LOSS and `M` = CORRECT. **F3 stands unreplicated at
   1 of 8.**
2. **A new mechanism replicated that no earlier slice could see (F7).** Decision-divergence overreach
   appeared on SF-07 and SF-11 — two rows the 74/120 report had classed, respectively, as
   "cannot materially change RR-1 through RR-6" and "can". One of those two calls was wrong: the
   SF-07 pair was expected to be a pure clean replicate of SF-01 and instead supplied half of the
   only cross-family defect in the register.
3. **A new mechanism appeared on the refusal row (F8).** SF-05 was classed "might" change the
   requirements. It did: it produced the instrument's only complete loss of a decision-critical
   owed fact, and by a contract failure rather than a semantic one.

---

## 9. D08 RULINGS SUPPORTED BY THE COMPLETE RECORD

**D08 — the three structural sub-questions: RULABLE NOW, and never depended on this evidence.**
Prototype retire-vs-replay-substrate, `COVERAGE_DECISION_FORBIDDEN_INPUTS` restoration, and the fate
of the eight prototype importers are questions about which implementation survives. No semantic
adjudication result bears on any of them. The §202 drift tripwire holds the two copies meanwhile.
*This report does not rule them; it records that nothing blocks the ruling.*

**D08 — "which owed-fact implementation is canonical": NOW EVIDENCE-SUPPORTED.**
The decision rule preregistered in the 74/120 report was: *if both remaining `Q` tests return
`NO_OBSERVABLE_LOSS`, the loss ratio stands and no contract mutation is warranted.* Both returned
`NO_OBSERVABLE_LOSS`. The final ratio is **1 consequential projection loss in 8 facts (12.5 %)**,
and the single loss carries a recorded product-owner bar on generalizing it. **The existing
implementation is canonical; no successor owed-fact implementation is required by semantic
evidence.**

---

## 10. D15 REPRESENTATION RECOMMENDATION SUPPORTED BY THE COMPLETE RECORD

**Recommendation: O1 (leave `OwedFact` unchanged), with O4 (declaration-reference sidecar) as the
only defensible alternative. O2 and O5 are not evidence-supported.**

| Option | Standing on the complete record |
|---|---|
| **O1 — unchanged** | **Supported.** 7 of 8 facts show no consequential loss from `missingFact` not surviving projection, including the only conjunctive pair and the only exposure fact |
| **O4 — declaration-reference sidecar** | **Defensible.** Backward-compatible; would let a reviewer reach the declaration text without mutating the contract. Justified on reviewability grounds, not on semantic-loss grounds |
| **O2 — `OwedFact.owedProperty` required** | **NOT supported.** Already structurally `NOT MET` on R4 (backward compatibility) in §201's matrix, and the semantic record supplies no countervailing necessity. The U17 record states expressly that restoring the field would not have cured that fact's defect; the U09 and U19 records each carry an explicit bar on generalizing from the single loss |
| **O5 — additive `OwedFactV2` successor** | **NOT supported.** A successor contract is a migration and hash-pin cost incurred to fix a defect class that occurred once in eight |

**The decisive argument is not the loss ratio — it is where the defects live.** Six of the eight
defect mechanisms (F1, F2, F4, F5, F7, F8) originate before projection, in the first-pass
declaration or the clarification wording. **No representation change reaches any of them.** F6 is
deterministic policy. Only F3 has a projection component, and even there the recorded
product-owner reasoning locates the operative harm in the clarification wording.

**D15 should still be ruled together with D08, as the decision register prescribes.**

---

## 11. FINAL RR-1 THROUGH RR-6 REMEDIATION REQUIREMENTS

Amended against the complete record. None is authorized by this document.

| ID | Requirement | Answers | Stage acted on | Change at 120/120 |
|---|---|---|---|---|
| **RR-1** | **Independent-gap enumeration.** Where a row contains genuinely independent unresolved facts, each must be declared separately and survive to admission. SF-08 shows the decomposition path works when taken | F1 | first pass | unchanged; still rests on 1 opportunity |
| **RR-2** | **Decision-scope discipline — AMENDED.** Two halves. (a) *Neutrality gate:* an unknown may become a decision-critical owed fact only where a genuine material decision difference exists; adverse counterfactual branches must not be invented to manufacture that difference. (b) **NEW:** *Downstream-claim containment:* `decisionIfA` and `decisionIfB` must assert only what their own branch establishes. Neither side may import a conclusion about other controls, other exposure routes, or the mechanism producing a state | F2, **F7** | first pass | **materially strengthened.** F7 is the only cross-family mechanism in the register (2 facts, 2 affected-decision types, both branch sides) |
| **RR-3** | **Branch-partition completeness.** The branch set must exhaust the plausible resolution states of the exact declared property. For any verification-type control, "control performed but the required safety state was NOT established" is a distinct state from "performed and established" and from "not performed", and must be representable | F4 | first pass | **narrowed and better bounded.** U19's `E`=CORRECT record states expressly that no third state is omitted there, so RR-3 is a verification-control requirement, not a universal branch-triples rule |
| **RR-4** | **Property-faithful clarification wording.** A clarification must be checked against the exact declared property — including temporal qualifiers (`before` X) — not merely against its topic. A clarification answerable YES while the declared property remains unresolved is insufficient | F3 | clarification | unchanged; still 1 of 8 |
| **RR-5** | **Result-not-performance clarification.** Where the owed property is that a control *achieved* a safety state, the clarification must establish both that the control was performed and what it showed | F5 | clarification | **positively confirmed as the right shape.** U14 and U19 `M`=CORRECT are both recorded as expressly not reproducing the defect, which shows the distinction is learnable |
| **RR-6** | **Priority-floor escalation policy.** 7 of 8 adjudicated facts carry `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE`, four of them `PLAUSIBLY_LIFE_CRITICAL` projected at priority `OTHER`. **THIS REMAINS DIAGNOSTIC MEASUREMENT ONLY.** It authorizes no priority-policy mutation, no provider-controlled escalation, no provider settlement authority, and no model-authored severity authority. It is input to D14, which stays open | F6 | floor policy (D14) | **denominator now complete: 7 of 8, up from 4 of 5** |

### 11.1 One requirement does not fit RR-1 through RR-6 — stated rather than forced in

**RR-7 (proposed, not one of the six): declaration contract completeness before emission.** F8 is a
structural/contract failure, not a semantic one: a required field was empty, the declaration was
refused `REQUIRED_FIELD_MISSING`, and a correctly-recalled decision-critical safety question was
lost entirely. None of RR-1..RR-6 acts on it — they are all semantic-content requirements. The
requirement is that the first pass emit structurally complete declarations, and that a refusal of
the *sole* declaration on a row be surfaced as a loud failure rather than an empty result set.
**Folding this into RR-1..RR-6 would misclassify it as a model semantic defect; it is left named
and separate so the product owner can decide whether to adopt it as RR-7.**

**Not a requirement on this evidence:** a dedicated owed-property field on `OwedFact`. 1 observation
of projection loss with downstream harm against 7 `NO_OBSERVABLE_LOSS` observations does not
establish it, and the U09, U14, U17 and U19 records each carry the product owner's explicit bar on
that inference.

---

## 12. BEHAVIORS THAT MUST BE PRESERVED DURING REMEDIATION

Any remediation that breaks one of these has made the system worse, and the fresh cohort must be
able to detect that.

1. **Verifier target binding (S3).** 8 of 8 `L`=CORRECT. The verifier consistently distinguished the
   projected owed property from adjacent properties — installed-versus-effective LEV, aisle width
   versus pedestrian entry, isolator-off versus proved-dead. Do not loosen the verifier instruction
   while fixing first-pass behaviour.
2. **Evidence-span selection (S4).** 8 of 8 `D`=CORRECT. Every declared span was genuinely relevant
   to why the fact was unresolved. Do not replace span selection with a broader quoting rule.
3. **False-gap suppression on genuinely sufficient text (S2).** SF-03 and SF-12 are clean. RR-1's
   push toward enumerating more independent gaps must not degrade these — RR-1 and RR-2(a) pull in
   opposite directions and the cohort must measure both.
4. **`NOT_OBSERVED_IS_NOT_ABSENT` handling (S8).** Ten minutes of no pedestrians was correctly not
   treated as absence, and stated absent controls were correctly not promoted into owed facts.
5. **Conjunctive decomposition (S5).** Both conjuncts of the SF-08 electrical condition survived
   independently to admission. RR-3 must not collapse a conjunctive pair back into one declaration.
6. **Exact owed-property targeting (S6).** 7 of 8 `C`=CORRECT, including under
   `FUNCTION_VERSUS_APPEARANCE` pressure. RR-2(b)'s containment rule must constrain the
   `decisionIf*` text without blurring the declared property itself.
7. **Deterministic priority authority (Ruling 5).** The model authored no priority anywhere in this
   run. RR-6 is measurement. Remediation must not introduce model-authored severity.
8. **Append-only, `PRODUCT_OWNER`-attributed adjudication.** `recordVerdict` refusing any other
   attribution is the reason this record can support any claim at all. Do not weaken it while
   fixing T1.

---

## 13. AREAS THAT REMAIN UNDERPOWERED DESPITE 120/120

**120/120 is instrument completion, not statistical power.** The following are unmeasured or
measured at n=1.

| Area | Status |
|---|---|
| **Governed evidence quotation (axis N), governed id binding (S), governed evidence semantic grounding (T)** | **ZERO evidence.** 24 slots, all structurally `NOT_EXERCISED`. The two governed-opportunity rows (SG-01 from §197 SF-09, SG-02 from SF-10) were **rejected before inference**, so no model output exists. The entire governed-binding stage is semantically unmeasured |
| **The 8 excluded SG-01/SG-02 row-axis slots** | Excluded by product-owner decision, not answered. Row-level behaviour under governed input is unmeasured |
| **66 supplementary slots** | Deferred. 56 verifier sub-axis fields mean the "no verifier defect" finding (§6) is at headline resolution only. `CHALLENGE_REVIEWABILITY` in particular is applicable on SF-04 and unanswered |
| **Multi-gap preservation (H)** | Exercised on only **4 of 10** rows. The one genuine multi-gap opportunity failed (F1) |
| **False-gap suppression (I)** | Exercised on only **4 of 10** rows |
| **`MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS`** | **n=1 row** (SF-02), and it failed |
| **`CONJUNCTIVE_FACT`** | **n=1 row** (SF-08). S5 is unreplicated |
| **`EXPOSURE_DECISION` / `NOT_OBSERVED_IS_NOT_ABSENT`** | **n=1 row** (SF-11). S8 is unreplicated |
| **Refused-declaration path** | **n=1 row** (SF-05). F8 is unreplicated, and U11's two refusal questions are deferred |
| **Affected-decision coverage** | 6 of 8 facts are `REQUIRED_CONTROL`; `HAZARD_SEVERITY` n=1 (U02); `EXPOSURE` n=1 (U19). Nothing else appears |
| **Provider and run variance** | Single provider (`claude-sonnet-5`), single run, no repeat sampling, no cross-provider replication. Every rate in §3 is one draw |
| **Truth-specification quality** | Zero `TRUTH_SPECIFICATION_DEFECT` recorded, but the preregistration was AI-assisted, product-owner-unreviewed, and expressly not the oracle. Its absence of recorded defects is weak evidence about it |
| **The §199 cohort itself** | Now a remediation target. It can no longer serve as its own acceptance evidence — a post-remediation pass on these twelve rows measures fitting, not capability |

---

## 14. SMALLEST BOUNDED REMEDIATION IMPLEMENTATION SLICE

The smallest change set that touches **every** established defect mechanism, ordered by blast
radius. Nothing here is authorized by this document.

**In scope (four changes, one file class each):**

1. **First-pass instruction — declaration semantics.** Adds RR-1 (independent-gap enumeration),
   RR-2(a) (neutrality gate), RR-2(b) (downstream-claim containment), RR-3 (verification-control
   third state). Reaches F1, F2, F4, F7 — 12 of the 20 defect-bearing slots.
2. **Clarification wording rules.** Adds RR-4 (property-faithful, temporal qualifiers) and RR-5
   (result-not-performance). Reaches F3's operative half and F5.
3. **A deterministic pre-admission guard on declaration completeness** (RR-7, if adopted): refuse to
   emit, or loudly surface, a row whose only declaration would be rejected for a missing required
   field. Reaches F8. **Deterministic code, not a prompt change, and not a contract change.**
4. **T1 fix in the adjudication recorder only:** make the additive path genuinely additive, or rename
   it and refuse a silent non-null overwrite. Touches evidence tooling exclusively.

**Explicitly out of scope for this slice:**

- No `OwedFact` contract mutation (§10 — O1/O4, and the discriminating evidence came back clean).
- No priority-policy mutation and no escalation-authority change (RR-6 is measurement; D14 open).
- No successor promotion (D10), no hosted canary (D12), no production or customer activation.
- No governed-binding stage change — it is semantically unmeasured (§13), so there is nothing to
  remediate on evidence.

**Why this is the smallest slice:** items 1 and 2 are prompt-layer, item 3 is a guard on an
existing refusal path, item 4 is outside the product. None requires a schema change, a migration, a
hash-pin change, or a provider-authority change.

---

## 15. PROPOSED FRESH POST-REMEDIATION ACCEPTANCE COHORT (24 CASES)

**The §199 twelve cannot serve as their own acceptance evidence.** They are now a remediation
target; a post-remediation pass on them measures fitting.

**Design: 24 new rows.** Every family that produced a defect gets **n≥3** so a single result cannot
carry a requirement, and every preserved behaviour gets a guard row.

| Block | Rows | Purpose | Answers |
|---|---|---|---|
| **A — independent multi-gap** | 3 | rows with 2–3 genuinely independent decision-critical unresolved facts | RR-1 / F1 (currently n=1, failed) |
| **B — decision-neutral unknown** | 3 | sufficient text plus a genuinely decision-neutral unknown, paired against block A so inflation and suppression are measured against each other | RR-2(a) / F2, and guards S2 |
| **C — downstream-claim containment** | 3 | facts whose correct resolution supports a *narrow* downstream action, with a tempting broader conclusion available on each branch side | **RR-2(b) / F7 — the cross-family mechanism, currently n=2** |
| **D — verification-control third state** | 3 | controls where "performed but did not establish the state" is genuinely plausible; at least one non-electrical | RR-3 / F4, RR-5 / F5 |
| **E — temporal scope** | 3 | explicit temporal qualifiers in the owed property (`before`, `after`, `since`) | RR-4 / F3 |
| **F — conjunctive** | 3 | conjunctive safety conditions, at least one requiring 3 conjuncts | guards S5 (currently n=1) |
| **G — exposure / not-observed-is-not-absent** | 3 | exposure-decision rows with negative-observation traps | guards S8, extends `FP.EXPOSURE` beyond n=1 |
| **H — governed-evidence rows that must actually reach inference** | 3 | **the coverage gap**: governed records and governed source ids supplied, so axes N, S and T are exercised for the first time | §13's largest hole. **Requires the governed-stage transport failure that rejected SG-01/SG-02 to be fixed first, or this block returns `NOT_EXERCISED` again** |
| **Total** | **24** | | |

**Also required, outside the row count:** at least one row deliberately shaped to trigger a
declaration refusal, to measure F8/RR-7 behaviour on the refusal path.

**Cohort construction rules:** authored before any run and frozen; scored deterministically before
any semantic adjudication; the same axis vocabulary and the same append-only
`PRODUCT_OWNER`-attributed machinery, so pre- and post-remediation records are comparable; and the
truth specification must be marked with its provenance exactly as §199's was — **it is not the
oracle**, whoever writes it.

---

## 16. PREREGISTERED ACCEPTANCE GATES

Written before the cohort runs, or they are not gates. Each names what it measures and what
outcome fails.

| Gate | Measures | Pass condition | Fails if |
|---|---|---|---|
| **G1 — no regression on preserved behaviour** | axes D and L across all projected facts | `D` and `L` clean on **100 %** of exercised facts | any `D` or `L` verdict below CORRECT. §204 achieved 8/8 on both; a remediation that breaks either is a net loss |
| **G2 — independent-gap enumeration** | block A rows, axes A and H | `A` and `H` clean on **3 of 3** rows | any independent gap dropped. F1's mechanism must not survive |
| **G3 — inflation and suppression together** | blocks A+B, axes B and I | `B` and `I` clean on **≥5 of 6** rows, with **no `INCORRECT`** | RR-1 bought gap enumeration at the cost of false gaps. This is the gate that catches over-correction |
| **G4 — downstream-claim containment** | block C, axis F | `F`=CORRECT on **3 of 3** | any `F` below CORRECT. F7 is the only replicated cross-family mechanism; it must be eliminated, not reduced |
| **G5 — branch-partition completeness** | block D, axes C and E | `C` and `E` clean on **3 of 3** | any omitted plausible third state on a verification control |
| **G6 — clarification sufficiency** | blocks D+E, axis M and axis Q | `M`=CORRECT on **6 of 6**; **zero** `Q`=CLARIFICATION_INSUFFICIENCY across the whole cohort | any clarification answerable YES while the property stays unresolved |
| **G7 — declaration contract compliance** | every row | **zero** declarations refused for a missing required field; **zero** rows producing an empty admitted set while a genuine gap exists | any repeat of F8. This gate is binary and has no partial credit |
| **G8 — governed axes exercised at all** | block H, axes N, S, T | **≥1 fact** with N, S and T carrying a real verdict rather than structural `NOT_EXERCISED` | the governed stage again fails before inference. **A cohort that returns 24 more `NOT_EXERCISED` governed slots has not closed the §13 gap and must not be described as broader coverage** |
| **G9 — priority floor** | axis R, both halves | **measurement only — this gate does not pass or fail anything.** Record the distribution | *(deliberately non-gating: RR-6 is diagnostic; D14 is the decision, and it stays open)* |
| **G10 — adjudication integrity** | the recording path | every verdict `PRODUCT_OWNER`-attributed; append-only; no additive text lost | any attribution other than `PRODUCT_OWNER`, or any overwritten additive field (T1 must be fixed or the caller-side mitigation must be enforced) |

**Overall acceptance:** G1, G4, G7 and G10 are **hard gates** — failing any one blocks advancement
regardless of the others. G2, G3, G5, G6 are quality gates with the stated thresholds. G8 is a
coverage gate: failing it does not block advancement on the non-governed surface but **forbids any
claim about governed behaviour**. G9 gates nothing.

---

## 17. ESTIMATED PROVIDER CALLS, COST, HUMAN-REVIEW BURDEN, AND SHORTEST PATH

### 17.1 Provider calls

| Item | Count |
|---|---|
| First-pass calls (1 per row, 24 rows) | 24 |
| Verifier calls (1 per projected fact; ~20 expected at the §199 fact-per-row rate of 8 facts / 10 adjudicable rows) | ~20 |
| Governed-binding nomination calls (block H, governed rows only) | ~3 |
| **Single clean cohort pass** | **~47** |
| Realistic total including one re-run after a transport or scoring fix | **~95** |

**All of §204 itself used 0 provider calls,** as did §202. The cohort run is the first spend.

### 17.2 Cost

Basis: `claude-sonnet-5` as used in the recorded run, at **$2.00 / MTok input and $10.00 / MTok
output** (current first-party API rates). Token volumes estimated from the §202 grammar measurement
— the accepted capability-ABSENT request measured **63,691 bytes total** (18,679 bytes of schema),
which is roughly 16K input tokens; verifier requests are materially smaller.

| | Input | Output |
|---|---|---|
| First pass, 24 × (~16K in / ~3K out) | 384K | 72K |
| Verifier, 20 × (~8K in / ~2K out) | 160K | 40K |
| Governed nomination, 3 × (~8K in / ~1K out) | 24K | 3K |
| **Total** | **~568K** | **~115K** |
| **Cost** | **~$1.14** | **~$1.15** |

**Single cohort pass: ≈ $2.30. With re-runs and a repeat-sampling arm: under $10. Under $25 even
with a second provider for cross-provider replication.** Provider spend is not the constraint on
this programme and should not drive scoping decisions.

### 17.3 Human-review burden — this is the real constraint

| Item | Estimate |
|---|---|
| Row-axis headline slots (24 rows × 4) | 96 |
| Fact-axis headline slots (~20 facts × 13, less prefills where governed stays absent) | ~200–260 |
| **Total headline slots to adjudicate** | **~300–356** |
| Ratio to §204 | **~2.5–3.0 ×** the 120 just completed |
| Product-owner reasoning time, at the depth actually used in §204 (fact axes take materially longer than row axes) | **~12–18 hours** of concentrated judgment |
| Realistic calendar, at the batch cadence this session sustained | **several working sessions**, not one |

**Two levers reduce this without weakening the evidence, and both are product-owner decisions:**
(a) score deterministically first and adjudicate only the axes where the deterministic pass and the
frozen design disagree or where a gate is at stake; (b) reduce blocks with no defect history
(F, G) from 3 rows to 2, saving ~30 slots at the cost of leaving S5 and S8 at n=2.

### 17.4 Shortest remaining path to Expert HazLenz advancement

1. **Rule D08 (all four parts) and D15 together**, using §9 and §10. No new evidence is needed;
   both are now evidence-supported, and D15's answer is "no contract mutation".
2. **Fix the governed-stage transport failure that rejected SG-01 and SG-02 before inference.**
   This is prerequisite to G8 and to any governed claim, and it is the single largest hole in the
   record. Without it the fresh cohort repeats §13's blind spot at 3× the review cost.
3. **Implement the §14 slice** — first-pass instruction (RR-1, RR-2a, RR-2b, RR-3), clarification
   wording (RR-4, RR-5), the declaration-completeness guard (RR-7 if adopted), and the T1 recorder
   fix. No contract, priority, or authority change.
4. **Preregister the §15 cohort and the §16 gates**, frozen, before anything runs.
5. **Run and score deterministically**, then adjudicate under the same append-only machinery.
6. **Rule D14** (final escalation architecture) using RR-6's now-complete 7-of-8 measurement plus
   the fresh cohort's R distribution. Ruling 5 — deterministic priority, `urgencyNomination`
   non-authoritative — stands until then.
7. **Only then** consider D10 (successor promotion) and D12 (hosted canary). Both are downstream of
   an acceptance record that does not yet exist.

**Steps 1 and 2 are parallel and independent.** Step 2 is on the critical path for everything
governed; step 1 unblocks the owed-fact canonicalization sequencing.

---

## 18. AUTHORITY

Sequential semantic adjudication is **STOPPED** and the headline instrument is **CLOSED at
120/120**. The 66 supplementary slots are **NOT** opened. No further review unit is presented and
none is authorized automatically.

This document authorizes no remediation, no prompt or contract or priority mutation, no cohort run,
no provider call, no database operation, no representation choice, no successor promotion, no
production or customer activation, and no commit, push, tag or deploy.

**TERMINAL:** `EXPERT_HAZLENZ_DEVELOPMENT_SEMANTIC_ADJUDICATION_COMPLETE — REMEDIATION_REQUIRED`
