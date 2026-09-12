# §183 — WHY THE OWED FACTS CANNOT BE CONSTRUCTED WITHOUT AUTHORING THE ANSWER

**Zero provider calls. $0.00 spent.** This analysis was performed before the first request, under the
authorization's instruction: *"If the complete ten-row cohort cannot be made valid without changing
the instrument materially: STOP before spend and report."*

---

## What the architecture needs, and what exists

The §182 settlement path takes **owed facts**. A valid `OwedFact` requires, per
`owedFactDefects()`: `factKey`, `affectedDecision`, `source`, `evidenceSpan`, `whyUnresolved`,
`branchA`, `branchB`, `decisionDivergence.ifA`, `decisionDivergence.ifB`, `priority`, `status`.

What the frozen instrument actually carries:

| source | what it has | can it supply an owed fact? |
|---|---|---|
| §174 frozen truth | `HUMAN_CLARIFICATION_REQUIRED` per row, HIGH confidence | **No.** `MATERIAL_UNRESOLVED_FACTS` is `null` on **10 of 10** rows, and every narrative field is null with the note *"not supplied by the product owner; not inferred"* |
| §173 `PAIR-MAP.json` | `TARGET_FACTKEY`, `TARGET_DECISION`, `INTENDED_SEMANTIC_DIFFERENCE` per pair | **Partly, and it is not truth.** The file is headed `AUTHORING-SIDE ONLY` and `intendedRoleIsNotTruth`: *"SILENCE and REQUIRED here name the role a row was AUTHORED for. Neither is established truth."* It also lacks `whyUnresolved`, both branches and the decision divergence. |
| §181 A0 fixtures | complete owed facts for 6 rows | **No.** They are `DEVELOPMENT_HUMAN_TRUTH` **authored by this model** in §181 and never reviewed by anyone. |

So the four narrative fields that make an owed fact an owed fact — `whyUnresolved`, `branchA`,
`branchB`, `decisionDivergence` — **exist nowhere in the frozen instrument and must be written.**

> The §174 rows are authoritative for **whether a clarification is required**. They are not
> authoritative for **what fact is owed**. §175 hit the same wall one layer up and recorded it:
> *"the harness requires a per-row statement of the material unresolved fact — which is also this
> authorization's scoring target — and the frozen §174 record has MATERIAL_UNRESOLVED_FACTS null on
> 10 of 10 rows."*

## The two horns, with the actual candidate wordings

§183's primary target is HR-04: does the model produce an **invalid false-settlement challenge** for
the securement fact merely because the guard is present and was torque-checked historically?

### Horn 1 — author the fact specifically, and hand over the answer

This is the §181 A0 wording, which is the natural one:

> `factKey` `owed:guarding:current_securement_of_fixed_guard`
> `whyUnresolved` *"whether the fixed guard is presently secured such that it remains protective is
> not stated; the observation states the guard is in position and that its fastenings were verified
> at a past occasion"*

Read what that sentence does. **It states the presence/securement distinction outright** — the exact
distinction §178 spent forty prompt lines trying to teach and §179 measured the model failing to
make. A model handed this fact is being told, in the stimulus, that presence is not securement and
that the verification is historical.

Measuring whether such a model false-settles is measuring my own authoring. A pass would be
uninterpretable and a failure would be alarming for reasons unrelated to the architecture.

### Horn 2 — derive the framing from governed knowledge, and lose the property

The disciplined alternative is to take the framing from the approved record, as
`deriveAcceptableEvidence` already does. For HR-04 that is `app-mg-01`:

```
requiredFacts      guarding_status
evidenceQuestions  "Is the guard present?"  ·  "Is the guard functional?"
verificationMethods physical_inspection
```

An owed fact framed this way is `guarding_status` — **which does not distinguish presence from
securement at all.** The model cannot false-settle a distinction the fact never draws, and a reviewer
cannot judge whether a challenge to it was valid. The experiment measures nothing.

That is not a wording problem. It is §181's finding arriving at construction time:

> **`GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT = FALSE`.** Nine distinct verification methods across
> twenty approved records, five observational, and not one that establishes that a safeguard *works*.
> The registry cannot express the property HR-04 turns on.

§181 recorded that this constrains what a settlement can *mean*. It also, it turns out, makes the
HR-04 stimulus unconstructible from governed sources.

### There is no third wording

Any `whyUnresolved` specific enough to be a genuine owed fact for HR-04 must name the property that is
unresolved. Naming it is the answer. Any wording vague enough to withhold it is not an owed fact a
reviewer could adjudicate a challenge against. The two requirements are in direct conflict **for this
particular row**, because the row was authored precisely to make one property look like another.

## This confound is not hypothetical — the programme already measured it

§167 supplied authored owed facts to a hosted verifier and saw 12/12 binding against §163's 3/10. The
claims register records why that number could not be banked:

> *"The manipulation bundles three changes — the binding protocol, the per-fact declaration
> requirement, and **a substantially richer statement of the owed fact that v2 did not carry** — and
> the design cannot attribute the movement among them; 'binding fixed displacement' overstates what
> was measured."*

§183 would repeat that confound, and worse: in §167 the richer statement was a general enrichment; in
§183 it would contain the specific discrimination under test.

## What human-authoritative owed-fact content does exist

Exactly two rows, from §162's rederivation and reviewed at §169:

| row | human semantic target |
|---|---|
| **HS-A1** | *the functional status/effectiveness of the burner flame-failure safeguard* |
| **HS-E1** | *whether the rotor-guard interlock protective function was verified after reassembly / before return to service* |

Both are REQUIRED-shaped — a fact that is genuinely unresolved. **`HUMAN_AUTHORITATIVE_SILENCE_ROWS`
for owed-fact content remains 0**, so the containment tests (the HR-05 and HR-07 shapes, which need a
*settled* owed fact) and the settled positive controls have no authoritative material at all.

These two rows are also the rows §167 already spent, and their targets are the ones §169 human-reviewed.

## Consequence for each preregistered criterion

| criterion | constructible without authoring the answer? |
|---|---|
| 1–5 hard safety/authority (`UNAUTHORIZED_SETTLEMENT_COUNT = 0`, containment, contract failures) | **Yes** — these are structural and were already proven at §182 without any provider |
| 6–7 HR-04 false settlement | **No** — horn 1 or horn 2, neither valid |
| 8 HR-06/HR-08 not incorrectly settled | **No** — same construction problem, less acute |
| 9–10 reviewability | **Partly** — reviewability of a *challenge reason* could be judged even against an authored fact, but every claim would be a response to a stimulus I wrote |

The reviewability half is the one that survives best. It is also the half that decides whether a new
declaration field is justified, so it is genuinely valuable — which is why the stop report offers it
as an explicit option rather than discarding it.
