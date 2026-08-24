# L3-2b Phase 2 — root cause, demonstrated before any patch

Full pipeline traces: `rootcause/pipeline-traces.json`. Each case was run through the real provider
and every stage was captured separately: raw proposal → mechanical binding → deterministic validator
→ semantic binder → final outcome.

> **The L3-2 hypothesis was partly wrong, and the traces say so.** `NEXT_ACTION.md` attributed `B08`
> to the selectivity check. On re-execution `B08` failed through **`SEMANTIC_NEGATION_UNADDRESSED`**
> instead. Both failure modes are real and which one fires depends on how the model happened to
> choose its spans — so both are remediated, and the mis-attribution is recorded rather than quietly
> corrected.

## The single dominant root cause — clause segmentation

```ts
function clauseAround(text, start, end) {
  const isBoundary = (ch) => '.;:!?'.includes(ch);   // <-- the defect
  ...
}
```

`clauseAround()` recognises **only sentence-terminal punctuation** as a clause boundary. A field note
or a compound sentence therefore collapses into one "clause", and any negation anywhere in it is
treated as governing every span in it. Three of the five reproductions fail through exactly this.

### B08 — `SEMANTIC_NEGATION_UNADDRESSED` on a sibling clause

> An employee on a rolling scaffold at nine feet was using an angle grinder **without** a face shield
> **while** a propane forklift idled directly underneath refueling from a portable cylinder.

The model's spans were **already narrow and correct**:

| candidate | evidence |
|---|---|
| `personal_protective_equipment / ACTIVE` | "using an angle grinder without a face shield" |
| `compressed_gas_cylinders / ACTIVE` | "a propane forklift idled directly underneath refueling from a portable cylinder" |

The sentence contains no `.;:!?`, so `clauseAround()` returned the whole sentence for the second
span. `without` — which belongs to the PPE clause and is correctly inside the *first* span — was read
as governing the *second*. The cylinder hazard was deleted.

**Exact decision rule at fault:** `checkNegationAddressed` asks "does a negation token appear anywhere
in `clauseAround(span)`", which is a proximity test, not a scope test. `while` is not a boundary.

### C11 — the same rule, across bare commas

> welding on the mezz rail, **no** fire watch, cardboard and pallets stacked under where the sparks
> were landing, extinguisher in the area was last inspected 2 yrs ago per the tag

`no` scopes over "fire watch" only. With commas not treated as boundaries, it governed the whole
note. **Note the trap:** commas cannot simply become boundaries, because RC-08's own sentence —
"with **no** guardrail, safety net or personal fall arrest system in use" — is a *negated list*
where scope legitimately crosses commas. Any repair must separate a negated list from a new clause.

### A10 — the same rule again

> The welding bay had **no** local exhaust ventilation in use during stainless welding, **and
> separately** the exit door … **was** blocked by a stack of gas cylinders.

Both candidates were correct and independent. `no` from clause one deleted the egress hazard.

## D02 — vocabulary gap, and a conceptual error

> The line **was shut down**, the main disconnect **was locked out** with each worker's personal lock,
> and voltage **was verified absent** at the load side before work began.

`CONTROLLED` was refused because `CONTROL_IN_PLACE_TOKENS` contains none of *shut down*, *locked out*,
*de-energized*, *isolated* or *verified*. `locked out` exists only in `REMOVAL_TOKENS`.

**Exact decision rule at fault:** `checkStateSupported` treats energy isolation as evidence of
removal-from-service but not as evidence of a control being in place. Isolation **is** a control in
place — that is the whole point of lockout/tagout — so the vocabulary partition itself was wrong.

## B10 — subjective impression accepted as an assertion

> The rail on the platform did not look right to me.

Raw proposal: `walking_working_surfaces / ACTIVE`, evidence = the whole sentence, `clarification: null`.
The deterministic validator passed it (the span is real, the state is legal, evidence exists) and the
semantic binder raised **nothing** — it has no check for this at all.

**Exact decision rule at fault:** there is none. No stage tests whether the evidence establishes a
*fact* rather than an *impression*. `did not look right to me` reports the observer's confidence, not
the rail's condition. This is the one genuine model error of L3-2, and the pipeline had no gate to
catch it.

**Also observed:** this scenario is non-deterministic — within this single trace run the provider
returned `ACTIVE` on one call and `INSUFFICIENT_EVIDENCE` on another. Both must be handled; only the
gate makes the safe answer reliable.

## Clarification under-production — root cause

Across 66 holdout scenarios and all five reproductions: **0 clarifications**, `clarification: null`
every time.

**Exact cause:** `L3_SYSTEM_PROMPT` never tells the model when to ask. `clarification` exists as a
schema slot with a shape requirement (`unresolvedFact`, `affectedDecision`, ≥2 `branches`,
`question`) and no positive trigger. The validator punishes a malformed clarification and nothing
rewards a needed one, so producing `null` is always the locally safe choice for the model.

## New discovery — the analysis id is inside the prompt

`buildUserPrompt()` emits `ANALYSIS ID: ${input.analysisId}` as the first line. The model has no use
for it: `bindProposal()` sets `analysisId` from the **input**, never from the model, and the validator
compares against the input.

Its only effect is to change the prompt bytes whenever the id changes — which is why these
reproductions (ids `rootcause:B08`) diverged from the holdout run (ids
`l3-2-holdout-2026-08-22:B08`) on the same observation text. **A volatile identifier in the prompt is
a reproducibility defect**, and it plausibly contributes to the measured 65/66. Removing it costs
nothing.

## Remediation targets, restated from evidence

| # | Target | Root cause |
|---|---|---|
| R1 | negation scope | `clauseAround()` is proximity, not scope; only `.;:!?` bound a clause |
| R2 | evidence selectivity | non-minimal evidence treated as non-supporting; rejection is candidate-fatal |
| R3 | state vocabularies | isolation language absent from control-in-place |
| R4 | clarification | no positive trigger anywhere in prompt or pipeline |
| R5 | reproducibility | volatile analysis id inside the prompt |
