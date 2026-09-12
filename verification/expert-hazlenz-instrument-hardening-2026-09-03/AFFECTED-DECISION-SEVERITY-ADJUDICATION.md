# §151 — `HAZARD_SEVERITY` Over-Selection: Adjudication of a Separate Residual Axis

**Zero provider calls. $0.00. The enum and the prompt were NOT changed during this phase.**

---

## 1. The complete occurrence set — and it is larger than §150 reported

§150's report said "four occurrences across two probes". **That undercounted.** A sweep of every
emitted clarification in §147, §148, §149 and §150 finds **seven occurrences across three probes**;
§148 produced none.

| # | § | row | question (opening) | decision the answer actually blocks | best member | authored / expected | HAZARD_SEVERITY valid? |
|---|---|---|---|---|---|---|---|
| 1 | 147 | **CR-B1** | *"**What is** the amp-hour capacity … and is the confirmed extract rate sufficient?"* | whether the ventilation control is adequate | `REQUIRED_CONTROL` | — (FORBIDDEN row) | **no** |
| 2 | 147 | **CR-G1** | *"**How many** cases are moved per shift?"* | nothing today — advisory vs engineering control is a magnitude refinement | — (should not have been asked) | — (FORBIDDEN row) | **no** |
| 3 | 149 | **US-B1** | *"**What is** the maximum intended load posted … and the actual imposed load per m²?"* | whether the supplied record's stated condition is met | `REGULATORY_INTERPRETATION` | `REGULATORY_INTERPRETATION` | **no** |
| 4 | 150 | **RB-C1** | *"**Has** the ground-bearing capacity … been assessed or verified?"* | whether the lift may proceed from this set-up | `REQUIRED_CONTROL` | `REQUIRED_CONTROL` | **no** |
| 5 | 150 | **RB-D1** | *"**Have** the materials … been decontaminated?"* | whether the second person is exposed | `EXPOSURE` | `EXPOSURE` | **no** |
| 6 | 150 | **RB-E1** | *"**What is** the minimum clearance required?"* | whether the sprinkler design basis reaches this configuration | `APPLICABILITY` | `APPLICABILITY` | **no** |
| 7 | 150 | **RB-F1** | *"**What is** the truck's rated payload capacity?"* | nothing today — the load is over the sideboards whatever the plate says | — (should not have been asked) | — (FORBIDDEN row) | **no** |

> ### **SEVEN OF SEVEN. NOT ONE IS A CORRECT USE OF THE MEMBER.**
>
> Every clarification this programme has ever seen labelled `HAZARD_SEVERITY` is either **a question
> that should not have been asked** (2, arguably 3) or **a question that should have carried a
> different label** (4, arguably 5). The member has never once been right.

Its appearance is therefore a **reliable marker of a defect** — which is a useful diagnostic, and an
indictment of the member as currently defined.

---

## 2. The boundary tests

The authorization asks specifically about the boundaries. Measured, not asserted:

| boundary | occurrences | addressed by an existing collision rule? |
|---|---|---|
| `HAZARD_SEVERITY` ↔ `HAZARD_EXISTENCE` | **0 of 7** | **yes** — §139's rule, and it is working |
| `HAZARD_SEVERITY` ↔ **`REQUIRED_CONTROL`** | **3 of 7** (CR-B1, RB-C1, RB-D1 partly) | **NO — unaddressed** |
| `HAZARD_SEVERITY` ↔ `APPLICABILITY` | 1 of 7 (RB-E1) | no |
| `HAZARD_SEVERITY` ↔ `REGULATORY_INTERPRETATION` | 1 of 7 (US-B1) | no |
| `HAZARD_SEVERITY` ↔ `EXPOSURE` | 1 of 7 (RB-D1) | no |
| `HAZARD_SEVERITY` ↔ *should not exist* | 2 of 7 (CR-G1, RB-F1) | the seven shapes name it; the label does not |

**The one collision §139 fixed is the one that no longer fails, and every failure is on a boundary no
rule covers.** §139 resolved `HAZARD_SEVERITY` ↔ `HAZARD_EXISTENCE` by pointing *"how much / how many
/ how long / how far"* at `HAZARD_SEVERITY`. That rule is doing exactly what it was written to do —
and it is now the largest single contributor to the defect, because it routes on **surface form**.

**Five of the seven questions open with "What is…" or "How many…".** The rule sends them to
`HAZARD_SEVERITY` regardless of what their answers decide.

---

## 3. The mechanism — and it is structural, not stylistic

Surface form explains five. It does not explain **RB-C1** (*"Has … been assessed"*) or **RB-D1**
(*"Have … been decontaminated"*), which are yes/no questions with no magnitude wording at all. So
there is a second driver, and it is in the definition itself.

```
HAZARD_SEVERITY  --  the hazard exists; how bad is the consequence or how large is the
                     magnitude? Use only when the answer changes what is done now.
```

Compare the other five members. Each is defined by **WHAT THE MISSING FACT IS ABOUT** — existence,
who is exposed, whether a framework governs, which control is required, what a record means.
**`HAZARD_SEVERITY` alone is defined by WHAT THE ANSWER CHANGES ABOUT THE CONSEQUENCE.** That is a
different axis, and it overlaps all five of the others.

Now put its two clauses beside the entry test for the collection:

- *"the hazard exists"* — satisfied on **all seven** rows; every one carries an `ACTIVE` candidate.
- *"the answer changes what is done now"* — **this is condition (c) and (d) of the counterfactual
  test.** A clarification cannot be emitted at all unless its two answers lead to different current
  outcomes.

> ### **`HAZARD_SEVERITY`'s DEFINITION IS ENTAILED BY THE ADMISSION TEST FOR THE COLLECTION.**
>
> Any clarification legal enough to exist satisfies both of its clauses, because the test that admits
> it requires two materially different outcomes — and two different outcomes read as two differently
> severe outcomes. **The member is not a category the model must choose; it is a description of every
> clarification.**

The model's own prose confirms it is routing on consequence framing: RB-C1's `whyItMatters` reaches
for *"a materially different **and more dangerous** outcome"*; RB-D1's for *"the current PPE is
**inadequate**"*; RB-F1's says outright that the answer sets *"the **severity** of the overload
exposure"*.

---

## 4. Classification against the six candidate causes

| | cause | verdict |
|---|---|---|
| **A** | prompt routing bias | **CONTRIBUTING** — the *"how much / how many"* collision rule routes on surface form and accounts for 5 of 7 |
| **B** | **enum-definition overlap** | **PRIMARY** — `HAZARD_SEVERITY` is defined on a different axis from the other five and its definition is entailed by the admission test (§3) |
| **C** | under-specified definitions | **CONTRIBUTING** — no rule says what to do when a *"how much"* question's answer decides a **control**, which is the dominant collision at 3 of 7 |
| **D** | fixture expectation error | **REFUTED** — all seven expected labels were re-derived from the decision each question blocks and all seven are correct. The disagreement is **one-directional** |
| **E** | harmless alternative classification | **REFUTED** — 2 of 7 accompany a question that should not exist; §139 made the field load-bearing; §148 proved a wrong label can **destroy** a question |
| **F** | safety-relevant routing defect | **NOT YET, BUT ADJACENT** — see §5 |

**On D, and it matters.** §139's own test is that *bidirectional* disagreement between two labellers
signals an under-specified vocabulary while a *one-directional* skew signals a biased labeller. This
skew is one-directional and total: 7 of 7 toward one member, and never away from it. By §139's own
reasoning that is model-side. **But the model is being pulled by a definition that is true of
everything** — so the honest reading is that a biased labeller and an over-broad definition are
producing the same signal, and the definition is the half that can be repaired without guessing.

---

## 5. Why this is not yet a safety defect, and why that is not reassuring

**`HAZARD_SEVERITY` is not an arbitration trigger.** `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE`
fires on `HAZARD_EXISTENCE` and nothing else, so a `HAZARD_SEVERITY` mislabel cannot destroy a
question today. `AFFECTED_DECISION_SURVIVAL` was 4/4 in §150 and 5/5 in §149 with these labels in
place.

Three consequences follow anyway, and the third is the one that matters:

1. **`affectedDecision` accuracy is materially worse than §146's 3-of-6 suggested**, and it cannot be
   used as a measure until this is resolved. Any scorer reading the field for equality is reading a
   field that is wrong whenever it says `HAZARD_SEVERITY`.
2. **The reviewer is told the wrong thing.** A question that decides whether a crane may lift is
   presented as a question about how bad the consequence would be.
3. **The same surface-form routing that sends *"what is X"* to `HAZARD_SEVERITY` is one definition
   away from sending *"does X have the property that creates the hazard"* to `HAZARD_EXISTENCE`** —
   which §148 proved destructive on CR-F2. The defect is currently benign because it lands on the one
   member with no consequence attached. **That is luck, not design.**

---

## 6. The unifying account, and it reaches the precision defect too

Two of the seven are not label errors at all — CR-G1 and RB-F1 are questions the seven
NOT-DECISION-CRITICAL shapes forbid, and **both were labelled `HAZARD_SEVERITY` by the model itself.**
CR-B1 is a third, disputed on fixture grounds.

> **ONE FAILURE CLASS: CONSEQUENCE-MAGNITUDE ROUTING.**
>
> The model treats *how much / how severe* as a decision-critical axis in its own right. When it is
> **labelling**, that produces `HAZARD_SEVERITY` on a question that decides a control, a scope or an
> exposure. When it is **deciding what to ask**, it produces a magnitude question the seven shapes
> forbid.
>
> Same bias, two surfaces. It accounts for **all seven `HAZARD_SEVERITY` occurrences and both
> surviving precision violations in the programme** — §147's CR-G1 and §150's RB-F1.

**This is established on AUTHORING_VALID rows** — RB-C1, RB-E1 and RB-F1 in §150, plus CR-G1 in §147 —
so it is not an artifact of the fixture defects the re-adjudication removed.

---

## 7. The minimum proposed v14 change — DEFINED, NOT IMPLEMENTED

Recorded here so the owner can authorize or refuse it. **Nothing in this operation implements it, and
v13 remains frozen.**

**Prompt-only. No enum change. No `analysis.v2` change. No arbitration change.**

1. **Re-scope the definition onto the same axis as the other five.** `HAZARD_SEVERITY` is for a
   missing fact whose answer changes **how bad the outcome is and nothing else** — where the control,
   the scope, the applicable framework and the exposed population are all already settled. If any of
   those four is what the answer decides, the label is that one.
2. **Add the collision rule that is missing**, in the same form as the four §139 already has:
   *"a 'how much / how many' question whose answer decides whether a control is adequate, whether a
   framework applies, or whether someone is exposed, is `REQUIRED_CONTROL` / `APPLICABILITY` /
   `EXPOSURE` — not `HAZARD_SEVERITY`. Ask what the answer DECIDES, not what it MEASURES."*
3. **Close the entailment.** State that *"the answer changes what is done now"* is the admission test
   for the whole collection and therefore **cannot** be what selects this member.
4. **Tie it to the seven shapes.** If the only thing the answer changes is how bad the outcome is,
   that is *severity refinement that does not change what is done now* — and the question should not
   be emitted at all. This is the limb that addresses CR-G1 and RB-F1.

**Predicted effect, stated as a prediction so it can be falsified:** `HAZARD_SEVERITY` should become
rare rather than common; the four label errors should route to `REQUIRED_CONTROL`, `EXPOSURE`,
`APPLICABILITY` and `REGULATORY_INTERPRETATION`; and the two severity-refinement over-questions should
disappear. **If `HAZARD_SEVERITY` usage does not fall, the diagnosis in §3 is wrong.**

**What must not move:** the enum (six members, same order), `analysis.v2`, arbitration, §139's working
`HAZARD_EXISTENCE` collision rule, v13's retention bridge, v12's settlement semantics, v11's threshold
rule and routing self-check, and the seven NOT-DECISION-CRITICAL shapes.
