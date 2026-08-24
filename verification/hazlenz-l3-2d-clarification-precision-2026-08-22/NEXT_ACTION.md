# L3-2d — what remains, and the exact next action

## Is L3-3 eligible?

**No, and for two independent reasons — either one alone would be sufficient.**

1. Four L3-2d advancement gates fail on the fresh sealed holdout.
2. `DISC-03` and `DISC-04` are now **proven capable of high-consequence loss**, and one of them
   produced a real high-consequence miss on that holdout. Even had every D1/D2 gate passed, an
   additional semantic precision slice would be mandatory before L3-3.

## What L3-2d settled, so the next phase does not re-derive it

* **The prompt is a ranking, and the ranking is now measured, not argued.** A controlled ablation —
  model, seed, temperature, schema, user prompt and observation text held constant — is the tool.
  `ablate-l32d-prompt.ts` and the frozen historical prompts (`prompt-variants-frozen.json`, hash-
  verified) make any future prompt claim testable in minutes rather than arguable forever.
* **`L3-INV-06` divides the eight condition states exactly.** `INSUFFICIENT_EVIDENCE` and `UNKNOWN`
  say the decision was not made; the other six **are** the decision. A question on one of the six is
  not a clarification under the contract. That rule is now deterministic and cannot regress.
* **Both L3-2c blockers are closed on the sets where they were recorded.** The L3-2b holdout scores
  62/62 with zero high-consequence misses and clarification precision and recall both 100%.

## The remaining blockers, root-caused, NOT applied

Diagnosed **after** the sealed holdout was opened, and therefore specified and deliberately not
implemented — the same refusal L3-2b made for `H-AM-05` and L3-2c made for its own two blockers.

### 1. `DISC-04` / `DISC-03` — a closed vocabulary matched without regard to syntactic role

**This is now the highest-severity open defect in the programme.** On the sealed holdout:

> Main plant electrical panel is blocked by a pile of **discarded** conveyor rollers and debris.

`CORRECTION_TOKENS` contains `discarded`. Here it is an adjective on the debris, and
`checkContradiction` deleted a correct, evidence-bound, **high-consequence electrical** finding.
`DISC-03` is the same shape: `hazard` matched as a modifier inside "without **hazard** warning
labels", where the head noun is *warning labels* and their absence IS the hazard.

**Recommended fix — the treatment L3-2c already proved works, applied to the checks that still need
it.** L3-2c replaced a closed positive vocabulary in the impression gate with a structural test and
closed four false-rejection instances at once. `checkContradiction` and `checkStateSupported` are the
same shape and have never had that treatment. A correction, removal or hazard-negation token should
count only when it is the **head of the predication** the evidence makes — not when it modifies
another noun (`discarded rollers`, `hazard warning labels`) and not when it sits inside a negation
(`no LOTO **is applied**`). The existing `impression-scope.ts` segmentation and `negation-scope.ts`
governance are the machinery; neither check calls them.

Fixtures, paired as always: `D-FLD-175` and "no damage … although the earth conductor has been cut
back" must survive, while a genuine correction — "the cracked guard **was replaced** with a new one"
— must still refuse ACTIVE.

### 2. The ladder swing is smaller but not settled

`D-CR-04` and `D-NG-04` are the two halves of one oscillation:

| id | text | wrong direction |
|---|---|---|
| `D-CR-04` | "Two men were on the roof near the edge; I was too far away to see whether they were tied off to anything." | asserted **ACTIVE** where a question was owed |
| `D-NG-04` | "No flammable atmosphere was detected at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening." | retreated to **INSUFFICIENT_EVIDENCE** where the facts are plainly stated |

L3-2c pulled toward INSUFFICIENT_EVIDENCE and lost `H-NG-02`; L3-2d pulled toward ACTIVE and lost
`D-CR-04`. **Three phases have now moved this balance with prose, and each has traded one error for
the other.**

**Recommended fix — stop tuning the balance and give the ladder a discriminator.** What separates
these two is not emphasis but a checkable property: `D-NG-04` states **what was observed** (a person
inside, an agitator on line, nobody at the opening), while `D-CR-04` states **what could not be
observed** ("I was too far away to see whether"). Add that test to the ladder explicitly — *if the
observer records an inability to observe the deciding fact, take INSUFFICIENT_EVIDENCE; if the
deciding facts are recorded, classify them however the sentence opens* — and re-measure both
directions together. `D-NC-06` (a planned action drawing a question) should be covered by the
existing planned-action rule and is worth a fixture in the same pass.

### 3. `DISC-02` — leave it

No check owns "ACTIVE contradicted by control-in-place evidence". It can only let a provider error
stand, never delete a hazard, and across four sealed holdouts the provider has not made that error.
It is a precision risk with **zero measured losses**. Fixing it means adding a seventh fatal check,
and every fatal check this programme has added has deleted a correct hazard before it earned its
place. **Recommended: leave it open and keep measuring it.**

## Holdout status

`holdout-l32d.json`, sha256
`bd5f0c2d514784af0662e01f546aa9d7cd4986cd5c8dcea59980724181935af7`, **has now been opened and is
retired for gate use.** It remains valid as a development set.

An L3-2e acceptance run needs a fifth sealed set. **Strides 1 and 3 of the field dataset remain
entirely unused** — 80 scenarios covering `fall_protection` and `mobile_equipment`, two families no
Level-3 sealed set has ever tested. `i % 5 === 1` is the natural next rule and would finally widen
the independent half beyond the two families each stride yields.

## Unresolved limitations, carried forward

* **`DISC-03` and `DISC-04`: CAPABLE OF HIGH-CONSEQUENCE LOSS.** Reclassified by this phase from
  ordinary-quality debt, on measured evidence. This is the item that gates L3-3.
* **`DISC-02`: open, precision risk, zero measured losses.**
* **The complement is still authored by the implementer** — three phases running. Both independent
  sources are entirely positive hazards, so every precision and clarification number in L3-2b,
  L3-2c and L3-2d rests on scenarios the implementer wrote. A set authored by someone not
  implementing is still owed and is now the largest methodological weakness in the programme.
* **The independent source covers two hazard families per stride** — a structural property of the
  dataset, not of the selection rule. Two of six families have never appeared in any sealed set.
* **Production provider selection remains OPEN** — unchanged since L3-2; it needs a credential for at
  least two hosted candidates.
* **The selected model is coding-tuned**, single-host, no SLA. P-10 and P-12 remain unmet.
* **Borderline scenarios can flip at temperature 0 with a fixed seed** on this server. Measured
  during the L3-2d ablation; the sealed holdout still reproduced 77/77, but reproducibility must be
  measured per phase and never assumed.

## Exact recommended next action

> **Open L3-2e — a semantic precision slice that gives `checkContradiction` and `checkStateSupported`
> the syntactic-role treatment L3-2c proved on the impression gate, adds the observe/could-not-
> observe discriminator to the condition-state ladder, and is accepted against a NEWLY SEALED holdout
> built with stride `i % 5 === 1` over the unused `fall_protection` scenarios plus a fresh
> complement. Do not begin L3-3 until L3-2e closes with zero high-consequence misses, zero
> unnecessary clarifications, 100% required-clarification recall, and `DISC-03`/`DISC-04`
> demonstrated no longer capable of high-consequence loss.**

The binder fix and the ladder fix are independent and touch different files, but they must be
**measured together** — three phases have now shown that moving one of these numbers moves the other.
