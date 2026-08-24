# L3-2f — what remains, and the exact next action

## Is L3-3 eligible?

**No.** Four high-consequence misses on fresh sealed evidence, against a gate that has never been
negotiable. Everything else the advancement gate asks for now passes — the clarification axis, false
ACTIVE, negative controls, reproducibility, customer invariance, and family coverage, which is
**complete at 24 of 24 for the first time in the programme**.

## What L3-2f settled, so the next phase does not re-derive it

* **The closed-vocabulary pattern's structural face is CLOSED.** `word-classes.ts` repaired F1, F2
  and F3 in one place, and the argument is what makes it stick: **function words are a genuinely
  closed class, so completing them is complete; lexical verbs are an open class, but FINITENESS is
  decidable from regular morphology plus the closed irregular-past inventory.** On the sealed set the
  four predicate-scope cohorts scored **21 of 21 with ZERO binder-stage deletions**.
* **`L3_2E_SCOPE_CONTRADICTION` is closed.** `D-NG-04` is recovered end to end and RC-08's coordinated
  list still crosses its comma.
* **`noise_exposure` is sealed-validated with its exact label** — 4 of 4. Family coverage is done.
* **`E-OA-07` was never `msha` wording and never clause position alone.** The identical text under
  `osha-construction` fails identically; the same clause position with ordinary vocabulary succeeds.
  §35.5's account is superseded. It and `E-FLD-147` are **one mechanism** — control adequacy, from
  opposite ends — and both are provider-stage.
* **The Level-3 contract can already express warning-versus-control.**
  `L3_CONTROL_HIERARCHY_LEVELS` has carried `administrative` and `ppe` since L3-1. This is recorded
  as **contract-sufficient, NOT architecture evidence**.
* **The field corpus is exhausted.** All five strides are opened.

## The blocker that outranks the four misses

### `THE PROMPT IS A RANKING, AND BOTH POLES ARE NOW MEASURED`

Two variants, **identical text, only its POSITION changed**, everything else held constant:

| | HC misses | clarification precision |
|---|---|---|
| **A** — absent-control material elaborated **inside** the condition-state ladder | **2** | **88.9%** |
| **B** — ladder kept terse, material moved **below** it `SHIPPED` | 4 | **100%** |

Moving nine lines out of the ladder recovered `C-CS-05`'s HYPOTHETICAL rung and **cost `E-FLD-147`
and `E-OA-07`** — the two misses this phase existed to close. The material has to sit at the ACTIVE
rung to work, and sitting there swamps the one-line rungs above it.

**Four phases have now moved this balance with prose. This is the first time both poles were measured
against each other with everything else fixed. The next phase should not look for the wording that
satisfies both.** The plausible directions are a *structural* separation of the two rungs rather than
a prose one, or accepting that this provider cannot hold both and revisiting §31.1's open provider
question — which L3-2f was forbidden to reopen and did not.

## The remaining misses, root-caused, NOT applied

All were found **after** the sealed holdout was opened. Specified and deliberately not implemented —
the same refusal L3-2b made for `H-AM-05`, L3-2c for `DISC-03`, L3-2d for its own two, L3-2e for the
scope contradiction.

### 1. `F-WC-02` — `fixed` in a REJECTION vocabulary. Lead with this one.

> "A DANGER OPEN PIT sign **is fixed** to the handrail post beside the inspection pit … and the pit
> is left open across the walkway."

The provider classified this **ACTIVE, correctly**. The **binder deleted it**:
`cited evidence asserts 'fixed' as a predicate, which contradicts ACTIVE`. `fixed` is in
`CORRECTION_TOKENS`, and "is fixed" *is* an asserted, unnegated predicate — of the **sign**, not of
the hazard. Role analysis cannot separate them, because the difference is *what* was fixed.

This is the **eighth instance of §32.5**, it is the **only binder-stage loss of the four**, and
**§35.1 already states the rule it breaks**: *a vocabulary used to REJECT must be unambiguous.* It is
the identical argument that removed bare `removed` from the rejection path at L3-2e.

**Recommended fix:** move `fixed` (and audit `addressed`, `applied`, `closed out`, `made good`,
`reset` on the same test) out of the rejection half of `CORRECTION_TOKENS`, leaving them in the
`checkStateSupported` admission half where a false positive only corroborates a state the model
already chose. Paired fixtures exist: "the sign is fixed to the post" must survive; "the guard was
fixed before we left" must still contradict.

### 2. The `F6` residue — two shapes still read as CONTROLLED

Tape, signs and cones are handled; these two are not.

* **`F-WC-03`** — "the missing floor plate … **was raised in the morning briefing** and the crew were
  told to step around it" → CONTROLLED. The model's own words: *"an effective control is described as
  in place and working — the crew were informed."*
* **`F-WC-09`** — "operators **have been issued gloves** and told to keep their hands clear, and the
  two-hand control **has been strapped down with tape**" → CONTROLLED. PPE offered against a
  **defeated engineering control**, which is the strongest form of the error.

### 3. `F-FLD-159` — one quoting slip cost an entire high-consequence finding

`EVIDENCE_OUT_OF_BOUNDS`; 1 of 100 quotations was not verbatim (99% verbatim rate) and the whole
proposal was rejected with no retry. That is exactly what §29.6 specifies, and **zero fabricated
quotations shipped** — the invariant did its job. But it is the first time the policy has cost a
high-consequence hazard, and it is worth deciding deliberately whether reject-without-retry should
gain a bounded re-ask for a quote that fails only verbatim binding.

### 4. `DISC-02` — still leave it

Six sealed holdouts, **zero measured losses**, precision risk only, and it can never delete a hazard.
Every fatal check this programme has added deleted a correct hazard before it earned its place.

## Holdout status

`holdout-l32f.json`, sha256 `47f92dae5f9fcbcb87c5c6f08fb4cbee3deb9dfba6a18a545d6ea844446bb2c5`,
**has now been opened and is retired for gate use.** It remains valid as a development set.

> ### `THERE IS NO SEVENTH STRIDE.`
>
> All five strides of `safescope-field-validation-dataset.v1.json` are opened: `i%5===0` L3-2b, `1`
> L3-2e, `2` L3-2c, `3` L3-2f, `4` L3-2d. **No prior field scenario may be reused as fresh evidence.**
> An L3-2g acceptance run needs a **genuinely independent new source**, and the entry contract for it
> must state where that source comes from and how it was obtained. It **may not be authored solely to
> satisfy already-known failures**, which rules out simply writing more fixtures against the four
> misses above.

## Unresolved limitations, carried forward

* **The complement is still authored by the implementer** — six phases running. Every precision,
  clarification and family-coverage number in L3-2b…L3-2f rests on scenarios the implementer wrote.
  This is the largest methodological weakness in the programme and it has never been closed. It is now
  **binding rather than merely recorded**, because there is no independent stride left to offset it.
* **Two authored development fixtures are ambiguous and were NOT tuned to** — `X-NC-03` ("the *split*
  extension lead", where `split` reads as a splitter rather than a defect) and `X-WC-02` (which names
  "the rail", plausibly a guard). They are recorded as fixture-wording weaknesses, not system defects.
* **Production provider selection remains OPEN** — unchanged since L3-2, and §36.7 is the first
  evidence that bears on it.
* **The selected model is coding-tuned**, single-host, no SLA. P-10 and P-12 remain unmet.

## Exact recommended next action

> **Do not open L3-2g on the strength of the four misses alone.** First decide §36.7: whether the
> ACTIVE and HYPOTHETICAL/INSUFFICIENT_EVIDENCE rungs can be separated **structurally** rather than by
> prose ordering, or whether the trade is a property of this provider and §31.1 should be reopened.
> **Second**, and independently of that decision, apply the `fixed` correction — it is a binder defect
> with a known, proven treatment and it needs no new evidence to justify. **Third**, before any
> acceptance run, identify and document a genuinely independent evidence source, because the current
> field corpus is exhausted and no further fresh sealed measurement is possible without one.
>
> `L3-3 must not start` until the high-consequence gate reaches **zero** with the clarification axis
> still at 100/100.

The `fixed` correction is the item to lead with among the code changes: it is the only one of the four
misses that is a **binder-stage** loss, the only one whose treatment this programme has already proven,
and the eighth appearance of a pattern it now knows how to recognise on sight.
