# §151 — §150 Row Re-Adjudication, Fixture-Defect Taxonomy, and Residual-Failure Classification

**Zero provider calls. $0.00. v13 FROZEN throughout.** No prompt, contract, arbitration, normalizer
or candidate semantics were touched during this adjudication.

**Historical §150 numbers are preserved and are NOT replaced by anything in this document.** The
adjudicated figures below are a separately labelled DIAGNOSTIC.

All §147, §148, §149 and §150 artifacts verified byte-identical against their own recorded hashes
before this adjudication began.

---

## 1. The fixture-defect taxonomy

Eight classes were specified by the authorization. Two more were required by what the evidence
actually contained, and they are marked **NEW**.

| class | name | definition |
|---|---|---|
| **A** | PRESUPPOSITION LEAK | the observation linguistically or logically presupposes the supposedly missing fact |
| **B** | UNSTATED-PREMISE DERIVATION | a FORBIDDEN row claims deterministic derivability but needs a premise not present in the evidence |
| **C** | GENUINE DECISION-CRITICAL GAP MISLABELLED FORBIDDEN | the row contains a real missing fact that could change a contract-valid `affectedDecision` |
| **D** | TAXONOMY / FAMILY ALIAS DEFECT | authored truth and the deterministic/Expert layers name the same hazard differently with no accepted mapping |
| **E** | AFFECTEDDECISION MIS-SPECIFICATION | the authored expected label does not correspond to the decision the question actually changes |
| **F** | DENOMINATOR CONTAMINATION | a row is counted in a metric despite not creating a valid opportunity for it |
| **G** | OBSERVATION / EVIDENCE INTERNAL CONTRADICTION | the authored observation and evidence cannot both be true for the scored proposition |
| **H** | SCORER BLINDNESS | the scorer reads normalized output for a property that exists only at an earlier stage |
| **I** | **SELECTOR OVER-SPECIFICATION** — NEW | the row's decision has **two or more equally exact missing facts**, and the answer key names one of them as *the* expected question |
| **J** | **ADVERTISED-ABSENCE WORDING IN A NEGATIVE CONTROL** — NEW | a FORBIDDEN row's observation states in terms that a fact is unknown, drawing attention to an absence the row then requires silence about |

Classes **I** and **J** are additions and each was forced by a real row. **I** is the defect behind
RB-D1 and it is invisible to every gate the programme has: a selector can be perfectly well-formed,
counterfactually sound and still be one of several correct answers. **J** is a *weakness* rather than
an automatic defect — §149's US-J1 carried advertised-absence wording and the model correctly stayed
silent — so it is recorded and never used on its own to invalidate a row.

**Class H is already discharged.** It is the §148 raw-linkage blind spot, closed in §149 Phase 5 and
re-verified in §150. No new instance was found.

---

## 2. The defects found, row by row

Six defects across four rows. Each names the exact text that creates it.

### 2.1 RB-H1 — class **C**. The most serious, and it invalidates a negative control.

> *"…and the CIP caustic circuit **shares the same header upstream of the near valve**."*

I wrote that clause as hazard-establishing colour. **It states a connection and says nothing about
that circuit's operational state**, and the state is decision-critical: with the CIP shut down and
drained, valve-and-tag isolation on an opened exchanger is arguable; with it live or capable of being
run, a fitter is inside a vessel with caustic behind two manual valves and no positive isolation.
Those are different current actions.

**Why the authored verdict cannot be trusted:** the row was authored FORBIDDEN on the claim that
"everything a decision turns on is stated". It is not. The model asked *"Is the CIP caustic circuit …
currently running, pressurized, or otherwise capable of being operated while the exchanger is open?"*
and **was right**.

**Historical literal score preserved:** yes — §150 FORBIDDEN silence stays 3/5 literal.
**Corrected prospective disposition:** the row leaves the FORBIDDEN denominator. It is a REQUIRED row
if reused at all, and it is not reused.

*(The row's second question — whether a positive isolation method is available or planned — is weaker
and closer to the documentation shape, but it lands on a control already invalidated by the first.)*

### 2.2 RB-D1 — class **I** (NEW). Two equally exact selectors, one named.

The decision is: **is the second person's bare arm exposed to cytotoxic residue?** Two missing facts
resolve it and the observation supplies neither:

- whether the hatch is an interlocked airlock sealed from the chamber (**my authored selector**);
- whether the materials and hatch interior carry residue at the point of transfer (**the model's**).

**Why the authored verdict cannot be trusted:** the answer key names one of two correct answers, so a
strict "different question is not recall" reading scores a correct response as a miss. Nothing in the
row justifies preferring the interlock over the residue.

**Historical literal score preserved:** yes — §150 strict delivered recall stays 3/5 literal.
**Corrected prospective disposition:** **FIXTURE_DEFECT.** Not scoreable as a recall miss.

### 2.3 RB-B1 — class **F**. The branches converge on today's action.

Authored outcomes:

- A: *"the machine is taken out of service for repair and the finding is a maintenance defect"*
- B: *"no repair will fix it, and the control must be a changed opening method plus face and arm
  protection now"*

**These read as different and are not, on the decision that is live.** The observation establishes
that steam **is** discharging at face height, at a person with no face protection, **now**. The
immediate action — stop opening it that way, protect the face — is identical on both branches.
Whether a maintenance defect is *also* raised is a durable-fix question, not a current-action one.

**Why the authored verdict cannot be trusted:** §140's DP-B4 rule is that a gap whose two answers lead
to the same thing done today is not decision-critical. This row fails that rule while passing the
mechanical gate (`outcomeA !== outcomeB`), because the gate is a **string comparison and the defect is
semantic**. That is a finding for the linter design in §7.

**Historical literal score preserved:** yes.
**Corrected prospective disposition:** **AMBIGUOUS_DO_NOT_SCORE.** The distinction is arguable — a
reader could defend the take-out-of-service branch — so it is neither certified valid nor called a
clean fixture defect. It does not create a valid REQUIRED opportunity and is removed from that
denominator.

### 2.4 RB-C1 — class **D**. Alias, and it affects only the coverage axis.

Authored truth names the hazard `suspended_loads`; the deterministic engine emits `cranes_hoists` for
it. The Expert correctly did not duplicate a finding the engine had made, and union coverage reported
**6/7**.

**Why the authored verdict cannot be trusted — for coverage only:** the 6/7 is an alias artifact. **The
crane lift was covered.** The row's REQUIRED/FORBIDDEN verdict is unaffected.

**Historical literal score preserved:** yes — union coverage stays 6/7 as measured, with this
explanation attached.
**Corrected prospective disposition:** the row is **AUTHORING_VALID for recall**; a canonical family
mapping is required before any future set uses either name.

### 2.5 RB-F1 — class **J** (NEW), recorded as a weakness, **not** used to invalidate the row.

> *"The observation does not record the truck's rated payload, and the weighbridge ticket for this
> load was not available."*

I wrote an explicit epistemic marker into a row that then requires silence. §147 established that an
*advertised* absence is the shape the model most reliably converts into a question.

**But this does not invalidate the row.** §149's US-J1 carried the same construction — *"The
observation does not record whether the site holds a written traffic management plan"* — and the model
**stayed silent**, because there the control was observed working. A negative control that says "X is
unknown and X does not matter" is the purest available test of the invariance limb, and refusing to
author one would remove the only direct test of it.

**Corrected prospective disposition:** **AUTHORING_VALID**, with the wording weakness recorded and a
rule added to the standard: advertised-absence wording is permitted in a negative control **only when
the invariance is demonstrated in the same observation**.

### 2.6 The class that was looked for and NOT found

No instance of **A** (presupposition leak), **B** (unstated-premise derivation), **E**
(`affectedDecision` mis-specification in the *authored* key), **G** (internal contradiction) or **H**
(scorer blindness) was found in §150. A and B were the two §149 defects and both repairs held —
RB-A1 was gated on A before spend and recovered cleanly; RB-J1 was gated on B and stayed silent.

**On E specifically:** every authored label in §150 was checked against the decision its question
blocks and every one is correct. **The label disagreements in §150 are model-side, not fixture-side**,
which is what makes §6 a genuine residual axis rather than an authoring error.

---

## 3. Row-by-row re-adjudication from first principles

Each row was worked through the twelve questions without using the previous verdict as a presumption.

| row | authored | model | 7. clarification genuinely owed? | 12. authored label valid? | **verdict** |
|---|---|---|---|---|---|
| **RB-A1** | REQUIRED | asked, exact fact, exact label | **yes** | yes | **AUTHORING_VALID** |
| **RB-B1** | REQUIRED | silent | **no — branches converge on today's action** | **no** | **AMBIGUOUS_DO_NOT_SCORE** (F) |
| **RB-C1** | REQUIRED | asked, exact fact | **yes** | yes (label `REQUIRED_CONTROL` correct) | **AUTHORING_VALID** (D on coverage only) |
| **RB-D1** | REQUIRED | different valid question | **yes — but two selectors resolve it** | yes | **FIXTURE_DEFECT** (I) |
| **RB-E1** | REQUIRED | asked, equivalent via the design figure | **yes** | yes | **AUTHORING_VALID** |
| **RB-F1** | FORBIDDEN | spoke | **no** | yes | **AUTHORING_VALID** (J recorded) |
| **RB-G1** | FORBIDDEN | silent | **no** | yes | **AUTHORING_VALID** |
| **RB-H1** | FORBIDDEN | spoke ×2 | **YES — the CIP state** | **no** | **FIXTURE_DEFECT** (C) |
| **RB-I1** | FORBIDDEN | silent | **no** | yes | **AUTHORING_VALID** |
| **RB-J1** | FORBIDDEN | silent | **no** | yes | **AUTHORING_VALID** |

**7 AUTHORING_VALID · 2 FIXTURE_DEFECT · 1 AMBIGUOUS_DO_NOT_SCORE.**

Note on RB-E1: the model asked for the *required minimum clearance* rather than *whether the design
basis was re-assessed*. Those are the same decision reached through the design figure — knowing the
required clearance settles whether 700 mm is adequate — so it is scored as a recovery, not a
substitution. This is the one recovery call in the set that is a judgement rather than a match, and
it is recorded as such.

---

## 4. `ADJUDICATED_DIAGNOSTIC_SCORE` — a diagnostic, not a replacement

Computed over **AUTHORING_VALID rows only**. It does not replace anything.

```
                            LITERAL (§150, historical, UNCHANGED)   ADJUDICATED DIAGNOSTIC
strict delivered recall     3 / 5                                   3 / 3   (RB-A1, RB-C1, RB-E1)
FORBIDDEN silence           3 / 5                                   3 / 4   (RB-F1 spoke)
valid REQUIRED denominator  5                                       3
valid FORBIDDEN denominator 5                                       4
```

**Every REQUIRED miss disappears under sound adjudication.** Both were removed by fixture defects —
one selector over-specification, one converging-branch contamination — and neither was a model
failure to notice, to retain or to promote.

**One precision failure survives adjudication: RB-F1.**

---

## 5. Phase 4 — classification of the two apparent REQUIRED misses

| row | A gap not recognized | B unsupported settlement | C retained but not asked | D emitted then destroyed | E different valid question | F fixture defect | G ambiguous |
|---|---|---|---|---|---|---|---|
| **RB-B1** | — | no | **no** (nothing retained: both candidates ACTIVE, `uncertainty` empty, no mention in the summary) | no | — | contamination (F) | **G — PRIMARY** |
| **RB-D1** | no | no | no | no | **E — PRIMARY** | **I** | — |

**Neither is a demonstrated model defect.**

Two things are worth stating because they are positive results hiding inside a failed gate. **RB-B1 is
not class C**: the model retained nothing, so §150's retention-bridge result is untouched by it. And
**RB-D1 is not class D**: the raw wire shows the question was emitted and delivered — normalization and
arbitration removed nothing.

**Per the authorization's Phase 4 rule — "if both remaining misses are fixture-invalid or ambiguous,
DO NOT create v14" — no v14 change is justified by the RECALL evidence.** The residual defect
established in §6 comes from a different axis entirely.

---

## 6. Phase 5 — precision, reported both ways

```
LITERAL_FORBIDDEN_SILENCE        3 / 5     (§150 historical, UNCHANGED)
ADJUDICATED_FORBIDDEN_SILENCE    3 / 4     (RB-H1 removed as an invalid negative control)
```

Neither replaces the other.

**RB-H1 — NOT over-questioning.** Class C fixture defect; the model found a real decision-critical gap
inside a row authored FORBIDDEN. Removed from the denominator.

**RB-F1 — GENUINE OVER-QUESTIONING, and it survives adjudication.** The row is AUTHORING_VALID. The
observed defect is material standing proud of the sideboards and spilling onto a shared haul road; the
corrective action is the same at any rated payload. The model's own branches — *"stopped and unloaded"*
versus *"trimming the load"* — are a magnitude difference within one action, and its own
`whyItMatters` says the answer sets *"the **severity** of the overload exposure"*. **It labelled the
question `HAZARD_SEVERITY` itself.** That is the archetypal severity-refinement shape the seven
NOT-DECISION-CRITICAL entries name, and it is the same shape as §147's CR-G1.

**So clarification precision did genuinely regress, on one row, and it is not an instrument artifact.**
The §150 report's statement that RB-F1 is "not attributable to the bridge" is confirmed here on the
mechanical fact that the row carried **zero** `INSUFFICIENT_EVIDENCE` candidates, so the bridge's
antecedent was false.

---

## 7. What this changes about the instrument, not about the model

Three of the four §150 gates that failed were **failures of my answer key**, and the pattern across
§149 and §150 is now consistent enough to name:

> **The FORBIDDEN half keeps containing real unresolved facts I did not intend, and the REQUIRED half
> keeps naming one of several correct selectors.** §149's US-I1, §149's US-D1, §150's RB-H1, §150's
> RB-D1 — four rows in two operations, every one of them wrong in the model's favour.

That asymmetry is itself evidence. An instrument that errs consistently in one direction is not noisy;
it is **biased toward under-crediting the model**, and it cannot certify the model until that bias is
removed. The hardened standard in `FIXTURE-AUTHORING-STANDARD.md` and the linter in
`expert-fixture-linter.ts` exist for exactly this, and the standard's FORBIDDEN checklist is written
around the two classes that actually bit: **C** (a real sibling gap) and **I** (a second valid
selector).

**And one limit must be stated plainly: the linter cannot catch any of them.** C, I, A, B and the
converging-branch defect in RB-B1 are all semantic. The linter is a fail-closed gate on mechanical
defects only, and the manual-review assertions beside it are the honest form of the rest.
