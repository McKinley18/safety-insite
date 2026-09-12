# Source-case safety-domain review — `FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1`

Performed **before** seal, on source cases only. **No provider output exists**, so nothing here could
have been influenced by model behaviour.

---

## Reviewer identity — stated plainly, because it is a limitation

**The review was performed by the same agent that authored the cases.** It is an authoring self-review
against the frozen construction policy, not an independent human safety-domain review.

That matters and is not smoothed over. This corpus feeds `M02_EXPERT_CANDIDATE_FALSE_POSITIVES`, a
**HARD GATE at 0.20**, and a forbidden-family label that a qualified reviewer would dispute would
score a correct model observation as a false positive. Author-reviews catch internal inconsistency
and policy violations; they are weakest at exactly the thing that matters most here — whether a
safety professional would agree a family is genuinely unraisable.

**Recommendation: have a qualified safety professional review the sixteen rows, and in particular
the fourteen forbidden-family determinations, before this corpus is used to produce a gate result.**
The corpus is sealed and immutable, so that review can only confirm it or find it defective — which
is the correct order. A defect found later is a finding about the corpus, recorded and reported,
never repaired to improve a score.

---

## What was reviewed, and the result

| dimension | result |
|---|---|
| **Realism** | Each observation reads as post-walkthrough field notes: concrete, a few sentences, carrying incidental detail. None names a hazard family, measure id, condition state or any evaluation vocabulary. |
| **Internal consistency** | No row asserts a fact it later contradicts. Every stated control is consistent with the state assigned to its family. |
| **Family truth** | Present families are those a reviewer would confirm from the text alone. |
| **Forbidden-family truth** | **Two determinations were rejected and downgraded during review** — see below. The surviving fourteen each carry a lure and a defeating fact, verified mechanically (`B.4`). |
| **Condition/state truth** | Six rows carry negated/safe/corrected state; each names the verifying fact (recorded zero-energy test, tag current, direct re-observation, engaged dock lock). |
| **Clarification obligation** | Three rows owe a clarification; each missing fact changes a required control rather than merely refining it. Thirteen owe none, and in each the decision-relevant facts are stated. |
| **Truth-key stability** | No row was judged ambiguous enough to make its key unstable. Two that were are recorded below. |

## The two rejections — the substantive result of this review

Both were caught by asking the one question that matters for a negative control: **could a competent
reviewer legitimately raise this family here?** If yes, it is DEFENSIBLE, never forbidden — because
forbidding it would score correct reasoning as a false positive on a hard gate.

**`AUG-04` — `lockout_tagout` rejected as forbidden.** The row describes pressure-washing inside a
6,000-gallon tank with an adjacent transfer pump isolated on the previous shift. The draft forbade
`lockout_tagout` on the ground that no energy-control activity was part of the task. **That is wrong.**
Isolating or blanking lines *into* a vessel before entry is a real and standard requirement, and a
reviewer raising it would be correct. Downgraded to **defensible**.

**`AUG-15` — `electrical` rejected as forbidden.** The row describes reaching past an opened interlock
gate on a carton sealer still under air, with the pneumatic lockout valve open. The draft forbade
`electrical` because the energy at issue is compressed air. **That is wrong.** A carton sealer is
electrically powered, and unisolated electrical energy is a genuine second source. Downgraded to
**defensible**.

Both rows remain in the corpus and contribute rows, states and (for `AUG-15`) a recorded interaction.
They simply contribute **no negative control**. The cost was two opportunities — 16 down to 14 — and
the requirement is still met with a margin of 9.

## Borderline determinations, recorded rather than hidden

- **`AUG-14`, `fall_protection` forbidden.** Dock edges are a real fall hazard when a trailer departs
  early. The row states wheel chocks and an engaged dock lock, which are the controls, so raising it
  would be noise. Judged forbidden, but it is the least clear-cut of the fourteen.
- **`AUG-07`, `chemical_exposure` forbidden.** An eyewash station implies chemicals somewhere on site.
  The row describes only the fixture, flushed and tagged, with no work in progress and no chemical
  handling or storage. Judged forbidden on that basis.
- **`AUG-16`, `machine_guarding` and `chemical_exposure` forbidden.** These rest on the observer's
  explicit statement that the space contains no process equipment and no chemical storage — an
  affirmative exclusion, not silence. That distinction is what makes them usable under the frozen
  rule, and it is worth re-checking in independent review.

## Rows carrying no negative control, by design

`AUG-04` and `AUG-15` after the rejections above. Neither was rewritten to restore an opportunity.
Rewriting a case to hit a denominator is precisely what the construction policy forbids.
