# §147 — Clarification-Recall Root-Cause Analysis and Bounded Remediation

**Terminal:**

```
EXPERT_HAZLENZ_CLARIFICATION_RECALL_REMEDIATION_FAILED — FURTHER_SEMANTIC_REPAIR_REQUIRED
```

Root cause established (§1). Remediation designed, implemented and locally gated (§2–§3). Bounded
hosted probe executed: **10 logical calls, 10 provider requests, 0 retries, $0.420588 of a $1.2480
enforced ceiling** (§4). The repair **works on the exact defect shape it was built for** and **fails
two of the frozen gates** (§5–§7). Historical evidence untouched; `FORMAL_EVALUATION_FAIL — NOT
ACCEPTED` and `PROVIDER_INVOCATION_COUNT = 195` unchanged.

---

## 1. Root cause — ESTABLISHED

Full reconstruction: `CLARIFICATION-RECALL-ROOT-CAUSE.md`. In brief.

**Every layer below the model is excluded on direct evidence.** Across the 24 §146 calls and §142's
LP-B2, the only normalization issue anywhere is one evidence-binding failure on a *candidate*. **Not
one clarification was stripped** by normalization, arbitration, link resolution, the merge or
persistence. The questions were never emitted.

**The discriminating variable.** Every gap the model RECOVERED was one the observation
**advertised** — it says "this does not establish whether…" (EV-A5, EV-C6) or the scene carries an
epistemic marker: a painted-over label, a blank permit section, a banksman who has not returned.
Every gap it MISSED was **unmarked**, derivable only from what the text never says. Into that hole
the model puts an inference, and:

> **A settled fact is not a missing fact**, so v9's counterfactual test is never entered — and v9's
> NO-LOSS RULE cannot fire either, because it is keyed to an *acknowledged* gap ("if you find
> yourself writing 'no information about whether X'"). A resolved gap never produces that sentence.

Three settlement moves were caught in hosted output: **resemblance-to-a-programme** (LP-B2 reasoned
from a physical profile to a permit-space classification), **adverse-branch collapse** (EV-A4 assumed
the upstream sequence was not inhibited and reported the worse consequence as fact), and
**threshold-across-incomparable-bases** (EV-A6 read "above 24 feet" against a 23'6" tape, called the
distinction "worth flagging", then wrote that no decision-critical facts were missing — in the same
paragraph). A fourth, distinct mechanism appeared on EV-A2: **invariance by subsumption**, where the
fact was retained in `uncertainty` and dismissed because "it does not change the current control gap
already identified".

**Attribution: PROMPT SEMANTICS.** v9 governs the disposal of acknowledged gaps and never governs
acknowledgement itself.

---

## 2. The remediation — prompt-only, plus one observability repair

Prompt-only was sufficient, because Phase 1 excluded every other layer. **v9 → v10.
`EXPERT_ANALYSIS_CONTRACT_VERSION` stays at `analysis.v2`: the wire schema gained no field, no enum
member and no `required` entry.** Three additions, nothing removed:

1. **WHAT COUNTS AS ESTABLISHED**, placed *before* the counterfactual test — a test that asks what is
   missing is unanswerable while inference counts as evidence. It names the three caught settlement
   moves and states that *"a fact nobody mentioned is not thereby absent, and not thereby present"*
   and that **the absence is usually not announced**.
2. **The invariance limb of (c) is SCOPED**: *"JUDGE SAMENESS AGAINST THE DECISION THIS FACT GOVERNS,
   not against everything already owed on this observation."*
3. **THE SETTLEMENT CHECK**, beside the NO-LOSS RULE: re-read your own assertions and ask whether
   anything actually STATES them. *"The no-loss rule catches a gap you ADMITTED, and this check is
   the only thing that catches one you RESOLVED."* It explicitly *finds* candidates for the test and
   does not excuse them from it.

A narrower repair rides along because EV-A6 sat exactly on it: condition (b) was framed entirely
around a missing **fact** while the vocabulary offers `REGULATORY_INTERPRETATION`, which can be live
when every measurement is known. (b) now admits that case.

**No quotas, no minimum counts, no keyword triggers, no domain rules, no fixture wording, no
hardcoded EV/LP cases.** The list still starts empty, the burden still sits on asking, all seven
NOT-DECISION-CRITICAL shapes survive verbatim, and the new block says in terms that it does not lower
the bar.

**Phase 7 — observability.** §146 lost a whole row to `EVIDENCE_OUT_OF_BOUNDS` and could not say what
was quoted, because the run record stores the *validated* analysis and the raw wire is not persisted.
`ExpertNormalizationIssue` now carries an optional `offendingText`, set only on the three
evidence-binding codes, **bounded** at 240 characters with the clipped amount stated, and
**citation-redacted**. The four constraints hold by construction: it cannot contaminate accepted
output (all three codes are `ANALYSIS_FATAL`, so a populated field implies `validated === null`), it
reconstructs nothing (the text is copied verbatim from what the model sent and is never bound or
repaired), it cannot leak a credential or transport metadata (its only source is the wire item's own
`quotedText`), and citation containment is unaffected. **The §146 output was NOT reconstructed.**

---

## 3. Local gates — all green, at $0.00

| gate | result |
|---|---|
| protected suites before the probe | **36 / 36 PASS** (35 pre-existing + the new settlement suite) |
| `SOURCE_PROJECT_TSC` | **PASS** (`src/**/*` only — does **not** cover `backend/scripts/`) |
| `ACTIVE_SCRIPT_EXECUTABLE_PROOF` | **TRUE** before and after spend |
| new suite `test:expert-clarification-settlement` | **80 assertions, 0 failed** |
| probe pre-spend gate | **32 / 32 PASS at $0.00** |

The new suite is deliberate about what a zero-cost suite can prove. **It cannot prove the model now
asks the question** — that is a hosted claim. It proves the v10 semantics are present *and correctly
ordered* in both the system prompt and the wire schema (A), that **every clause of the v9 precision
text survives** needle by needle (B), that the regression set is structurally sound (C), that a
REQUIRED clarification survives the boundary and silence stays silence (D), that linkage precedence,
governed handling, citation containment and candidate routing are undisturbed (E), and the new
rejection diagnostic (F).

**Two defects the local gates caught before any spend**, both recorded rather than absorbed:

- A **fourth v9 pin** in `test-expert-projection-equivalence.ts` written with escaped dots inside a
  regex literal, which a plain `prompt.v9` grep misses. It was the pin missed in §143 too, and it
  caught the regression **both times**. Re-anchored to v10 with the reason written into the file.
- **Six fixture rows** with an allowed hazard family in no partition bucket, plus one row marking a
  family life-critical that is not present. Both surfaced on the first dry run at $0.00. `C.14b` now
  asserts row-contract completeness so the class cannot recur.

Five other v9 pins were re-anchored to v10 with in-file disclosure. **Every one gained a stated
reason; none was relaxed.** The two spent probe scripts (§144, §146) were **not edited** — their
hashes are part of their spent identity records.

---

## 4. The hosted probe — execution facts

```
logical calls / provider requests   10 / 10        retries 0        suppressed 0
spend                               $0.420588      enforced ceiling $1.2480 (authorized $2.00)
tokens                              142,634 in / 13,532 out
latency                             9,916 – 26,412 ms
model                               anthropic / claude-sonnet-5      one arm (BASE)
prompt / contract                   hazlenz.expert.prompt.v10 / hazlenz.expert.analysis.v2
system-prompt SHA-256               83cd078b0c67deacdce197d9aee7db9344a8625eb753c41b73fa83fb9fb3f12a
wire-schema SHA-256                 42586d42381e09e46d5cd3742b2a8c1e62fe7ad39475712c580292e3f8e7abca
stop COMPLETED                      identityViolation null
disposition                         10 PRESENT, 0 OUTPUT_REJECTED, 0 provider failures
persistence                         10 records, 0 parse problems, 0 completeness problems
                                    sha256 0cd48458f1a66da4d27da08c699706fe28366ea2f579316833f91769f0b8f6cd
mid-run read-back                    CR-A1 read back FROM DISK with 9 calls outstanding
write-once identity                 second write refused, bytes stable (6fbc3961a387d4c3…)
historical PROVIDER_INVOCATION_COUNT 195 before, 195 after
```

A stale `GATE-BLOCKED.txt` from the first ($0.00) dry run — the one that caught the six fixture rows
— was removed before the real run and is disclosed here rather than left as misleading residue.

---

## 5. Result — REQUIRED half

Five REQUIRED rows. **Strict adjudication, from `CLARIFICATION-ADJUDICATION.csv` and the persisted
output. A semantically different question is not recall.**

| row | shape | absence | outcome |
|---|---|---|---|
| **CR-A1** | announced, baseline control | marked | **RECOVERED** |
| **CR-E1** | asbestos presumption | marked | **SUBSTITUTED** — a different question (see §5.2) |
| **CR-E2** | threshold across incomparable bases | **unmarked** | **RECOVERED** |
| **CR-F1** | benign assumption | **unmarked** | **RECOVERED** |
| **CR-F2** | resemblance to a programme | **unmarked** | **ASKED, THEN DROPPED BY ARBITRATION** (§5.3) |

**As delivered: 3 of 5. As reasoned by the model: 4 of 5.** Both figures are reported because the
difference is not a scoring preference — it is a distinct defect, described in §5.3.

**The gate is 100%. It is not met on either reading.**

### 5.1 The repair works on the shape it was built for

This is the finding that matters most, and it is not a mechanical count.

**CR-E2 is the EV-A6 shape, generalized off its facts, unmarked, and recovered.** Ammonia at a
nameplate 4,400 kg with a common header to an unquantified second package, against a record whose
threshold is 10,000 pounds and which says interconnected vessels are one process. The model:

> *"The observation gives only the low-temperature package's nameplate charge (4,400 kg, **itself
> close to the threshold**) and states the packages are interconnected via a common header, but gives
> no charge for the high-temperature package. If the combined interconnected quantity is at or above
> threshold, the process safety management framework applies in full; if below, it does not. These
> are materially different regulatory outcomes and the observation does not state the second
> package's charge."*

It converted units, noticed the proximity to the boundary, identified the aggregation question, held
both branches open and asked. **In §146 the same shape produced silence and a paragraph explaining
why nothing was missing.**

**CR-F1 is the settlement collapse, pointed benignly, and refused.** A padlocked upstream breaker
invites "it is locked off, therefore it is dead". The model:

> *"The upstream breaker is padlocked off, which is a positive lockout indicator, but the observation
> only shows a voltage tester and insulated gloves **resting on the bench rather than being actively
> used or worn**… Because it is not established that the tester verified a de-energized state…"*

and its `whyItMatters` reaches the second half of the authored fact unprompted — *"downstream feed,
backfeed, or the terminations are on the line side of the lockout point"*. **This is the settlement
rule doing exactly what it was written to do.**

CR-A1, the announced non-regression control, recovered cleanly. **No recall regression on the easy
shape.**

### 5.2 CR-E1 — substituted, and the fixture is partly at fault

The authored gap was whether a survey or analysis rebuts the record's presumption. The model asked
instead whether the tiles fall within the record's **material description** — a scope question, not
the rebuttal condition — and resolved the authored gap in its summary: *"the survey needed to rebut
the presumption could not be produced, so the presumption of asbestos-containing material stands
unrebutted at the time of the visit."*

**That reasoning is defensible and my fixture's counterfactual is weak.** The record itself supplies
the default for the unknown branch: unrebutted means presumed ACM, so today's action is determined
whichever way the absent survey would have gone. A gap whose two answers do not change what is done
today is not decision-critical — which is the very rule §140 established with DP-B4.

**Scored strictly as a miss, and reported as a FIXTURE LIMITATION rather than a clean model defect.**
The question it asked instead is a legitimate `APPLICABILITY` question on a real scope ambiguity.

### 5.3 CR-F2 — the first hosted arbitration event in the programme

CR-F2 shows as silent. It is not.

```
CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE
decisionCriticalClarifications[0]: asks whether the hazard exists while candidate
cand-fire-explosion is asserted ACTIVE
ARBITRATION_EVENTS: 1
```

**The model noticed the unmarked absence and asked about it.** Its summary survives the drop and says
so: *"Whether the pump, plug and socket are rated for hazardous locations is not stated and is
decision-critical."* It also refused the resemblance collapse — it did not assert an area
classification.

It lost the question to an `affectedDecision` **labelling** error: it labelled a scope question
`HAZARD_EXISTENCE` while simultaneously asserting `fire_explosion` ACTIVE, and the prompt is explicit
that existence is not open once you have asserted the hazard. Arbitration then did precisely what
§141 specified and proved deterministically — **dropped the question, kept the candidate.**

Three things follow, and they should not be collapsed into one another:

1. **Arbitration is now proven on hosted evidence.** It was
   `DETERMINISTICALLY_PROVEN_HOSTED_UNEXERCISED` across 65 hosted calls in four probes. It has now
   fired once, correctly, on a real contradiction that was not commissioned.
2. **The `affectedDecision` accuracy defect §146 measured at 3 of 6 now has a cost.** It is no longer
   a labelling blemish: a mislabelled question is destroyed.
3. **A design question for the owner, not for me to settle unilaterally.** §141 chose to drop the
   question on the assumption that a contradiction is a semantic error. CR-F2 is a third case: a
   *correct question with a wrong label*. Whether arbitration should strip the label rather than the
   question is a contract decision, and changing it is outside this operation's authorized minimum.

---

## 6. Result — FORBIDDEN half, and a real precision regression

Five matched controls. **Silent on 2 of 5. The gate is zero unnecessary questions and is NOT met.**

| row | structure | outcome |
|---|---|---|
| **CR-C1** | threshold plainly SATISFIED | **SILENT — correct** |
| **CR-H1** | evidence resolves the apparent gap | **SILENT — correct** |
| **CR-D1** | threshold plainly NOT satisfied | **SPOKE — attributable to the v10 clause (§6.1)** |
| **CR-B1** | unknown but decision-invariant | SPOKE — disputed, fixture-limited (§6.2) |
| **CR-G1** | severity or detail only | SPOKE — disputed, borderline (§6.2) |

**CR-C1 is the anti-overcorrection control and it passed cleanly**, which matters: v10 tells the
model a threshold read across incomparable bases is not settled, and CR-C1 is the case where it
plainly *is*. The model said so:

> *"No decision-critical fact is missing: the depth (0.9 m), soil type, slope angle, spoil setback…
> are all stated plainly, so applicability of R1's exception… **are answerable from the text as
> given**."*

### 6.1 CR-D1 — the v10 threshold clause over-fires

This is the clearest new defect and it is caused by **my own change**.

> *"Is the 1,050 mm top edge height measurement based on metric-rated equipment specification, or is
> it a conversion/approximation from an imperial-rated system, and does the record's 38-45 inch range
> (965-1143 mm) apply to this scaffold configuration as installed?"*

The model computed the band itself and observed that **"1,050 mm falls within the 965-1143 mm range…
so on its face the guardrail appears compliant"** — and then asked anyway.

v10's clause has two qualifiers: a threshold is unsettled *"when the facts sit close to the value, or
when the two are not measured on the same basis."* **Neither applies.** 1,050 mm is mid-band, not
near either bound; the observation states the datum ("above the platform surface") and the record
states the same one. The clause was written for EV-A6, where the facts sat six inches from the
boundary with an unstated datum. **The model applied it to a case with neither property.**

**Precision cost, precisely located: the threshold clause needs its qualifiers made conjunctive and
operative, not illustrative.** That is the further semantic repair the terminal names.

### 6.2 The other two are disputed, and I am not reporting them as clean model defects

The §146 lesson applies unchanged: an instrument defect and a model defect are indistinguishable
until you read the output.

- **CR-B1.** The model asked for the battery's amp-hour capacity, arguing that *"'confirmed at the
  grille' only confirms airflow **presence, not sufficiency**"*. That is a real distinction and **my
  fixture over-claimed invariance** — I wrote the observation as confirming the extract, and it
  confirms only that it runs. Same class as §146's EV-C2/EV-D4.
- **CR-G1.** The model asked the shift throughput, arguing low frequency warrants an advisory and
  high frequency an engineering control. Defensible on the merits — but it labelled it
  `HAZARD_SEVERITY` while arguing it changes what is done, and it is the archetypal
  severity-refinement shape the seven forbidden shapes name. **Borderline; I score it as a genuine
  precision loss and record the dispute.**

**Adjusted for the CR-B1 fixture defect, forbidden silence would be 3 of 5. Neither reading meets the
zero-violation gate, and CR-D1 alone fails it.**

---

## 7. Regression axes — all clean

| readout | value |
|---|---|
| `INVALID_CLARIFICATION_OBJECTS` | **0** |
| citations — input / Expert output / accepted / merged | **0 / 0 / 0 / 0** |
| supplied-record citations (redaction exercised) | 8 |
| `PROTECTED_AUTHORITY_CONTRADICTIONS` | **0** |
| forbidden-family candidates emitted | **0** of 15 candidates |
| `INVALID_LINKAGE_ATTEMPTS` / `INVALID_LINKAGE_STRIPPED` | **0 / 0** |
| links populated and resolved | 5 of 7 emitted clarifications |
| deterministic regression | **none** — Expert added 2 of 2 truth-present families the engine missed |
| clarifications per call | 0.70 (§146: 0.435) |
| protected suites after | **36 / 36, identical to the pre-spend baseline** |

Every emitted clarification was a legal object with both branches written, a concrete `evidenceGap`
and a vocabulary-valid `affectedDecision`. No `REGULATORY_INTERPRETATION` was claimed without a
supplied record.

---

## 8. Why this terminal

Both hosted gates fail.

- **Strict REQUIRED recall is 3 of 5 as delivered (4 of 5 as reasoned), against a 100% gate.**
- **Forbidden violations are 3 (1 clearly attributable to v10, 2 disputed), against a zero gate.**

`…— CLARIFICATION_PRECISION_REGRESSION` was considered. Its premise is that *recall improves* while
negative controls regress; recall improved on the defect shape but did not reach the gate, so that
terminal would overstate one half and understate the other.

`…— FURTHER_SEMANTIC_REPAIR_REQUIRED` is accurate on both counts, and the repairs it names are
specific rather than vague:

1. **Make the threshold clause's qualifiers conjunctive and operative** (CR-D1). The clause must not
   reach a value stated mid-band on a stated, matching datum.
2. **`affectedDecision` labelling now destroys questions** (CR-F2), and the fix is either better
   labelling guidance or an arbitration that strips the label rather than the question. **The second
   is a contract change and needs its own authorization.**
3. Nothing in the settlement rule itself needs reverting. It recovered CR-E2 and CR-F1 — the two
   unmarked cases that §146 lost — and CR-C1 and CR-H1 stayed correctly silent.

---

## 9. Instrument findings preserved from §146, unchanged

Per Phase 8, and none of these is "fixed" by suppressing valid Expert reasoning:

- **DISAGREEMENT QUALITY = VOID.** The authored opportunity denominator was not conditioned on actual
  deterministic output. **The seven substantively correct challenges are NOT model defects.** This
  probe authors no disagreement truth at all, and `C.17` fails the build if it ever does.
- **INSIGHT PRECISION = NOT_ESTABLISHED.** The four insights on "no-insight" rows name real
  mechanisms. They are not false positives.
- **NO-GAP SILENCE = 0.733 literal / 0.867 adjusted.** Both stand; neither replaces the other.
  **EV-C2 and EV-D4 remain recorded as fixture-limitation evidence.**

---

## 10. Confinement

```
reserved material                     NOT opened
spent formal cohort                   NOT read, copied, paraphrased or mimicked
historical evidence                   UNMODIFIED — §140/§142/§144/§145/§146 artifacts byte-identical
spent §142 probe script               ccb89a92… unchanged, not edited
spent §144 / §146 scripts             not edited
formal scorers / truth / thresholds   UNCHANGED
new formal cohort                     NONE
M14_REMEDIATION_STATUS                NOT_ATTEMPTED
deterministic HazLenz behaviour       UNCHANGED (CR-F2's odd deterministic families were left alone)
production / database / customer      UNTOUCHED
commit / push / tag / deploy          NONE
credential                            read from the environment; never logged, returned or persisted
```

**Files changed:** `expert-prompt.ts` (v10), `expert-normalization.ts` (`offendingText`),
six protected suites re-anchored v9→v10 with in-file reasons, `backend/package.json` (+2 scripts).
**Files added:** `fixtures/clarification-recall-probe-v5.ts`,
`scripts/test-expert-clarification-settlement.ts`,
`scripts/probe-expert-clarification-recall-2026-09-03.ts`, and this evidence directory.

---

## 11. Remaining uncertainty

1. **Ten rows, one arm, one replicate.** No rate, no distribution, no reproducibility claim. On a set
   this small 100% was a remediation gate, never a population claim — and the same smallness cuts the
   other way: three forbidden violations on five controls is a strong signal, not a rounding error.
2. **CR-E1 and CR-B1 carry fixture defects I authored**, found by reading the output. Both are
   reported as limitations rather than scored as clean model failures.
3. **Arbitration has now fired exactly once** on hosted evidence. One event proves the mechanism
   lives; it establishes nothing about frequency.
4. **`affectedDecision` accuracy remains unrepaired** and now has a demonstrated cost.
5. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.
6. **Another expanded validation is NOT yet justified.** The threshold clause needs its narrow repair
   and a re-probe first; spending an expanded validation against a contract with a known over-firing
   clause would measure the clause, not the product.
