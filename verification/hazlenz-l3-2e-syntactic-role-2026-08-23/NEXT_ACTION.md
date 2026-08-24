# L3-2e — what remains, and the exact next action

## Is L3-3 eligible?

**No.** Two high-consequence misses on fresh sealed evidence, against a gate of zero. Everything the
clarification axis carries now passes, and family coverage went from 15 to 23 of 24, but the
high-consequence gate is the one that has never been negotiable.

## What L3-2e settled, so the next phase does not re-derive it

* **Syntactic role works, and it is the right treatment.** `predicate-role.ts` closed all five
  proven deletions and both proven false admissions while every paired counter-fixture kept refusing.
  On the L3-2c set, detection went 47 → **53 of 54**.
* **The clarification axis is finished.** TP 3, FP 0, FN 0 on fresh sealed evidence, and 8 of 9
  observation-availability cases correct. `could not observe` is no longer collapsed into
  `insufficient evidence` in either direction.
* **`D-NG-04` was never an oscillation.** A clause-position ablation showed removing the negation
  changes nothing and moving the clause changes everything. §34.5's account is superseded.
* **Nine families entered sealed evidence for the first time.**

## The remaining blockers, root-caused, NOT applied

All were found **after** the sealed holdout was opened. Specified and deliberately not implemented —
the same refusal L3-2b made for `H-AM-05`, L3-2c for `DISC-03`, L3-2d for its own two.

### 1. `L3_2E_SCOPE_CONTRADICTION` — the highest-value item, and it is fenced

`negation-scope.ts::hasPredicate()` decides whether a comma ends a negation's scope, and it recognises
a predicate only through a closed list of **auxiliaries** plus a participle regex needing five letters
before the suffix. Measured:

> "…at the manway, and the fitter **was** inside the vessel" → scope correctly ends at the comma
> "…at the manway, and the fitter **went** inside the vessel" → scope runs to the end of the sentence

`went`, `climbed`, `entered`, `operated`, `fell`, `broken`, `torn`, `cut` are all invisible to it. This
deleted `D-NG-04` at the binder on the L3-2d regression set — a high-consequence confined-space
finding the provider had classified **correctly**.

> **It surfaced because the E2 repair works.** The model now quotes the hazard clause narrowly and
> correctly instead of retreating, so the candidate reaches the binder for the first time.
> `checkNegationAddressed` steps aside for a broad quote and not for a correct narrow one. **A repair
> that improves provider behaviour can expose a binder defect that was always there** — a programme
> lesson worth carrying, and only per-stage capture makes it visible.

This is the **seventh** instance of §32.5's closed-vocabulary pattern, and it sits in the one module
L3-2e was forbidden to change.

**Recommended fix:** give `hasPredicate()` the same structural treatment `predicate-role.ts` now
applies — a clause carries a predicate when a subject is followed by a finite verb, decided by
position and morphology rather than list membership. Paired fixtures already exist: RC-08's negated
list must still cross its commas while `D-NG-04`'s second clause must end the scope.

### 2. `L3-2E-DISC-06` — the head test is still lexical

`nounPhraseHead` returns `issued` for "no hearing protection **issued**", and
`HAZARD_NEGATION_OBJECTS.find(o => head.includes(o))` matches `issue` inside it. A correct
noise-exposure finding is deleted, and that is the single reason one family remains
`NOT_YET_SEALED_VALIDATED`.

**Recommended fix:** two small, independent corrections — match the head **whole-word** rather than by
substring, and skip trailing past-participles when resolving the head, since they post-modify rather
than head the phrase.

### 3. `L3-2E-DISC-05` — an incomplete terminator list, introduced here

`NP_TERMINATORS` omits `against`, so "no deficiencies **against** the storage standard" resolves its
head to `standard` and a genuinely negated hazard is no longer refused. A precision regression this
phase introduced. It produced no false ACTIVE on the sealed set, but it weakens a real guard.

**Recommended fix:** complete the preposition set. Better, derive the head as the last content word
before **any** preposition, rather than before a listed one — the same polarity lesson, one level down.

### 4. `L3-2E-DISC-07` — nominal corrections, introduced here

`CORRECTED` now requires an asserted predicate, so "drew a **replacement** from the store" is refused.
Requiring a verb is too strict when the correction is expressed as a noun phrase.

**Recommended fix:** accept a correction noun as an object of an action verb, not only a correction
verb. Keep the negation guard.

### 5. The two remaining high-consequence misses

* **`E-FLD-147`** — *"An active floor opening is marked with standard warning tape next to an
  unprotected edge."* The model called warning tape a control. Provider stage; the binder then
  correctly refused `CONTROLLED`, leaving nothing. Measured `UNCHANGED_AND_CORRECT` against the
  retired rule, so it is not an L3-2e regression. It is a genuine reasoning error about what
  constitutes a control, and it is close to `DISC-02`'s territory without being caused by it.
* **`E-OA-07`** — *"The methane monitor read zero at the face, and the roof bolter was operating under
  a section of unsupported roof…"* The clause-position class on `msha` ground-control wording. Eight
  of nine observation-availability cases pass; this one does not.

## `DISC-02` — still leave it

Five sealed holdouts, **zero measured losses**, precision risk only, and it can never delete a hazard.
Every fatal check this programme has added deleted a correct hazard before it earned its place —
L3-2e itself introduced two such regressions while repairing two others. Adding a seventh fatal check
is not the trade to make.

## Holdout status

`holdout-l32e.json`, sha256
`b9da20bacb9548167b80f0da6a55e5f3059a5318e809ba23a204706702818e06`, **has now been opened and is
retired for gate use.** It remains valid as a development set.

An L3-2f acceptance run needs a sixth sealed set. **Stride `i % 5 === 3` is the only one left
untouched** — 40 scenarios covering `mobile_equipment`, the last field family no sealed set has drawn
from. After that the field dataset is exhausted and a genuinely independent source must be found.

## Unresolved limitations, carried forward

* **The complement is still authored by the implementer** — five phases running, and now with a
  targeted family complement on top. Every precision, clarification and family-coverage number in
  L3-2b…L3-2e rests on scenarios the implementer wrote. This is the largest methodological weakness
  in the programme and it has never been closed.
* **`noise_exposure` is `NOT_YET_SEALED_VALIDATED`**, and eight further families passed their scenario
  under a permitted alternative label rather than their own.
* **The field dataset will be exhausted after one more stride.**
* **Production provider selection remains OPEN** — unchanged since L3-2.
* **The selected model is coding-tuned**, single-host, no SLA. P-10 and P-12 remain unmet.

## Exact recommended next action

> **Open L3-2f — a single slice that lifts the closed-vocabulary treatment into
> `negation-scope.ts::hasPredicate()` (the recorded scope contradiction) and corrects the three small
> head-resolution and nominal-correction defects above, then re-measures the two remaining
> high-consequence misses. Accept against a NEWLY SEALED holdout built with stride `i % 5 === 3` over
> the last unused field scenarios plus a fresh complement. Do not begin L3-3 until L3-2f closes with
> zero high-consequence misses, the clarification axis still at 100/100, and `noise_exposure`
> sealed-validated.**

The scope contradiction is the item to lead with: it is the only one of the five that has been shown
to delete a **high-consequence** finding, and it is the seventh appearance of a pattern this
programme has now proven it knows how to fix.
