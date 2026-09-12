# REMEDIATION-FAMILIES-210A

**Zero provider calls. Zero database operations. No §209 verdict reinterpreted. No §208/§208B/§209 artefact altered.**

29 distinct slots failed across G1–G7, G9 and G14. They group into **five** architecture families, and
two of those five account for 18 of the 29. Nothing here is a per-case patch: every family names one
lever that fixes several cases at once.

| Family | Slots | Gates reached | First stage | Confidence |
|---|---|---|---|---|
| **RC-A** — present-state epistemic framing | 10 | G1 G3 G4 G7 G14 | first-pass generation (governed binding inherits it) | HIGH |
| **RC-B** — verifier payload isolation | 8 | G6 | verifier input composition | HIGH |
| **RC-C** — essential qualifier / conjunct loss | 4 | G5 G7 G9 | first-pass generation and field routing | HIGH |
| **RC-E** — over-declaration / false gap | 4 | G3 G4 G9 | first-pass generation | HIGH |
| **RC-D** — structured emission / unknown framing | 3 | G1 G2 G3 | first-pass structured emission | HIGH / MEDIUM |

---

## RC-A — PRESENT-STATE EPISTEMIC FRAMING (10 slots, 5 gates)

**The single highest-yield family.** In every instance the model declared a property that is *adjacent
to* the frozen one along the same axis: it named what is **available**, what **exists**, what **can be
done**, what was **checked**, or what is **required** — instead of **what is actually the case now**.

Four sub-modes, one shape:

| Sub-mode | Case | Declared | Frozen property |
|---|---|---|---|
| AVAILABILITY_FOR_USE | AC-19 | is RPE available in the lockers | do the dressers actually wear it while cutting |
| EXISTENCE_FOR_ACTION | AC-22 | does a bleed/block method exist | what was actually done about compressed-air **and** accumulator energy before entry |
| EXISTENCE_FOR_EFFECT | AC-08 | what traffic arrangements exist | are pedestrians and trucks prevented from occupying the crossing simultaneously |
| PROCESS_FOR_STATE | AC-02 | was the guard gap checked/adjusted | what is the actual present clearance |
| REQUIREMENT_FOR_FACT | AC-22 governed | the record *requires* stored energy be dissipated | whether a method exists on **this** machine |

The G14 pair is the same error expressed against governed evidence. The frozen `bearingStatement`
performs the slide in one sentence:

> "This record describes the requirement that stored or residual energy be dissipated or restrained
> by methods such as blocking or bleeding down, **which bears on whether such a method exists on the
> machine**."

**Upstream/downstream.** `AC-19.ROW.A`, `AC-22.ROW.A`, `AC-08.FACT1.M` and `AC-02.FACT2.M` are roots.
The other six — including both G14 slots — are consequences of a property that was already
mis-framed when the governed stage received it. **G14 is not an independent governed-reasoning
defect.** The product owner expressly recorded that the provider-visible governed text *was*
sufficient to judge grounding, so this is not an evidence-supply problem and TBR-6 is not implicated.

**Lever.** One instruction change at the first pass: the declared property must be a **present state
of the work as observed**, and a capability, availability, requirement or process proxy for that
state is not the property. The governed contract additionally needs the bearing statement to
separate what a record *requires* from what it *evidences*.

**Risk.** This is a semantic instruction change. It cannot be validated by replay — it requires a
bounded provider probe on AC-08, AC-19, AC-22 and AC-02.

---

## RC-B — VERIFIER PAYLOAD ISOLATION (8 slots, G6 only)

**The cleanest result in the slice, and the only family with a perfect correlation.**

> **Every axis-L slot on a row carrying more than one admitted OwedFact drifted: 6 of 6.
> No axis-L slot passed on such a row.**

| Row shape | n | non-CORRECT |
|---|---|---|
| more than one admitted OwedFact | 6 | **6** |
| one admitted OwedFact | 7 | 2 |

The two single-fact exceptions are explained by the same mechanism through a different channel:

- **AC-03.FACT1.L** — one fact but **two clarifications**. The adjudicator: "also evaluates the
  separate liquid-identity clarification."
- **AC-22.FACT1.L** — one fact, one clarification, but **three hazard candidates**. The two
  properties named in the adjudicator's reason are exactly the other two candidates.

So sibling properties reach the verifier through **three independent channels** — sibling OwedFacts,
sibling clarifications, and the hazard-candidate block — and drift tracks the channel, not the case.

**This is a payload-composition defect, not a model-capability defect.** The verifier reached the
correct fact every time; it was given neighbouring material and used it.

**Lever.** Single-fact minimum-sufficient verifier payload (see
`SINGLE-FACT-VERIFIER-PAYLOAD-DESIGN-210A.md`). Directly implements TBR-2 and TBR-10.

**Honest limit.** The correlation is measured; the *fix* is not. Frozen evidence cannot show that
isolation removes the drift — only a bounded provider probe can. Classified
`REQUIRES_SEMANTIC_EXPERIMENT`.

---

## RC-C — ESSENTIAL QUALIFIER / CONJUNCT LOSS (4 slots)

Two distinct shapes worth keeping apart:

**MISSING_CONJUNCT (AC-18, G7+G9).** The frozen property requires the boards carry a person **and**
the materials. `missingFact`, `branchA` and the clarification all say "with a person on them". The
materials conjunct is absent from every field, so `decisionIfA` concludes work may continue from a
person-only rating. One omission, two gate failures.

**QUALIFIER_IN_WRONG_FIELD (AC-10, G5).** This one matters architecturally. The model **did** hold the
before-and-after proving qualifier — clarification `q1` asks whether the proving unit was used "before
and after that test". But `missingFact` and `branchA` say only "using a proving unit (perhaps since put
away)". **The projected OwedFact carries neither `missingFact` nor the clarification**, so the verifier
never saw the qualifier at all.

This is the **D15 loss shape that TBR-7 exists to prevent, occurring today**: semantic content present
in the model's output but routed into a field the projection drops. It is exactly what axis Q measures.

**Lever.** Conjunct- and qualifier-completeness: every essential qualifier present anywhere in the
declaration set must appear in the fields the projection actually carries forward.

---

## RC-E — OVER-DECLARATION / FALSE GAP (4 slots)

The inverse of RC-A: a property the text **answers** was declared as open. AC-05 declared padlock
ownership though the fitter's exclusive key control is established; AC-07 declared an open-panel
sound level the frozen truth does not require. `AC-07.FACT1.F` is bound to that surplus declaration,
so the over-declaration also produced the G9 overclaim — one defect, two gates again.

**Lever.** The precision half of the same present-state rule as RC-A. RC-A and RC-E are plausibly one
instruction change with two directions; they are kept separate here because that unification is a
hypothesis, and collapsing them without evidence would be exactly the over-unification the
authorization warns against.

---

## RC-D — STRUCTURED EMISSION / UNKNOWN FRAMING (3 slots)

Two different failures that look identical from the gate:

**RECOGNISED_NOT_EMITTED (AC-03, G1+G2+G3).** The model recognised the pooled-liquid gap correctly.
`CAND-SPILL` is `INSUFFICIENT_EVIDENCE` and names it; `CLAR-SPILL-ID` asks the exact right question.
But `unresolvedFactDeclarations` contains only `DECL-FAN-STATE`. **Semantic recognition succeeded;
structured emission failed.** This is not a capability defect and must not be treated as one.

**UNKNOWN_ASSERTED_AS_ESTABLISHED (AC-23, G1+G3).** All four candidates are `ACTIVE`, none
`INSUFFICIENT_EVIDENCE`; zero clarifications and zero declarations were produced. The base-slip
condition was framed as an *established active hazard* rather than an *open question*, so the
unresolved-fact path was never entered at all. Confidence MEDIUM — this is a reading of the
condition-state field, not a measurement of intent.

**Contract observation.** `assertedConditionState` is populated across the cohort with five different
values — `ACTIVE` (24), `INSUFFICIENT_EVIDENCE` (16), `UNKNOWN` (6), `CONTROLLED` (2), `CORRECTED` (1).
`UNKNOWN` and `INSUFFICIENT_EVIDENCE` appear to be used for the same epistemic situation by different
cases. That ambiguity is a plausible contributor to RC-D and is cheap to tighten.

**A detector was tested and is NOT yet reliable — reported as a negative result.** The natural
deterministic signal is "an `INSUFFICIENT_EVIDENCE` candidate, or a BLOCKING clarification, that
reaches no declaration". Measured across all 24 cases it fires on AC-03 (true positive) but also on
AC-07, AC-09, AC-11 and AC-17, of which only AC-07 failed and on a different axis. Ten cases have at
least one orphaned clarification, including cases that passed every gate. **Precision is too low to
gate on today.** If it is ever used it may only DETECT AND REFUSE — never repair, never infer the
missing declaration (TBR-5).

---

## PROPOSED REMEDIATION ORDER

1. **RC-B, verifier payload isolation.** Highest confidence, zero semantic authoring, largest token
   win, and the correlation is perfect. Isolable and replayable against frozen inputs before any
   provider call.
2. **RC-C, qualifier/conjunct completeness.** Partly deterministic — the AC-10 field-routing half can
   be detected structurally without semantic inference.
3. **RC-A + RC-E, present-state framing (both directions).** The largest family, but a genuine
   semantic instruction change requiring a bounded probe. Sequencing it after 1–2 keeps the probe
   small and its result attributable.
4. **RC-D, emission completeness and condition-state vocabulary.** Tighten the enum first; treat the
   detector as an experiment, not a gate.

G14 needs no independent remediation family: fix RC-A and the governed stage is binding a correctly
framed property.
