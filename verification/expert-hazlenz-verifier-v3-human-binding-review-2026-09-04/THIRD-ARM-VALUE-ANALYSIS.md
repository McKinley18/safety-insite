# Third-arm attribution — value analysis

**§168, 2026-09-04. Zero provider calls. Design analysis only; nothing was executed.**

**Recommendation: DO NOT PURCHASE NOW.** The reasoning is below, and the decisive point is not cost.

---

## A. What exact causal question would the third arm resolve?

§167's v3 arm changed three things at once against §163's v2 arm:

1. the **binding protocol** — `bindingFactKey`, closed-set membership;
2. the **per-fact declaration requirement** — every supplied key accounted for;
3. a **richer statement of the owed fact** — `whyUnresolved`, `branchA`, `branchB` and the decision
   divergence, none of which v2's packet carried.

The proposed arm — v2 substantive semantics **plus** the richer owed-fact packet **minus** the
explicit binding requirement — would separate:

```
RICHER_FACT_CONTEXT_EFFECT     vs     EXPLICIT_BINDING_EFFECT
```

Stated as a question: *would simply telling the verifier the owed fact more fully have eliminated
target displacement on HS-A1, without any binding protocol at all?*

## B. Would the answer change the product architecture decision?

**No — and this is the decisive finding.**

The binding protocol is load-bearing for a reason that has nothing to do with its effect on model
behaviour: **it is what makes deterministic coverage possible at all.**

`TARGET_COVERAGE_WARNING` is a set difference over *declared* bindings. Without a binding
declaration there is no set to difference. Coverage would then have to be decided by comparing the
question text to the owed fact's text — a semantic matcher, which is exactly what §160 retired after
finding the keyword scorer satisfiable by the observation itself, and exactly what §164's central
idea exists to avoid ("do not match meaning; require a declaration and check it deterministically").

So consider the two possible outcomes of the third arm:

| outcome | what it would mean | what would change architecturally |
|---|---|---|
| richer context alone eliminates displacement | the model does not *need* binding to behave well | **nothing.** Binding is still required for deterministic coverage accounting, which is the architecture's whole warrant |
| binding is doing the work | binding is causally necessary too | **nothing.** It is already retained |

**A measurement that cannot change the decision either way is not worth buying.** The binding
protocol stays under both outcomes.

## C. Could the architecture proceed safely with attribution bundled?

**Yes, on one condition that is already in force.** The bundling is a constraint on *claims*, not on
engineering. The claims register's §167 row already records that "binding fixed displacement"
overstates the evidence, and the supported statement is the bundled one:

> The verifier-v3 owed-fact binding package eliminated the previously observed target displacement
> and settled-silence failures on the two human-authoritative REQUIRED development rows across six
> hosted draws each.

As long as no claim attributes the movement to binding alone, bundled attribution costs the product
nothing. It costs a *paper* something, and this is not a paper.

## D. Minimum call count that would falsify the attribution hypothesis

Recorded for completeness, so a future decision does not have to re-derive it.

**Hypothesis to falsify:** *the richer owed-fact statement alone accounts for the elimination of
displacement.*

- **Arm:** v2 instruction and contract, with the v3 owed-fact block (key, `whyUnresolved`, both
  branches, divergence) present in the user prompt but **no** `bindingFactKey` field and no
  declaration requirement.
- **Case:** HS-A1 only. HS-E1's failure was silence, not displacement, and silence recovery is not
  the attribution question.
- **Draws:** **6.** §163 measured 7/10 displacement on this row. Six draws detect a shift to ≤1/6
  with the same margin §164 accepted for the original design, and the comparison is against a frozen
  baseline that has already been purchased.
- **Cost:** ~6 × $0.05 worst case ≈ **$0.34**, well inside any prior cap.

Cheap. Cheapness is not the argument for buying it, and B is the argument against.

## E. Is the information worth the spend given the stronger blocker?

**No.** The binding blocker in front of the programme is not attribution — it is **silence-side
truth**.

| | attribution gap | silence-truth gap |
|---|---|---|
| blocks a claim? | one phrasing of one claim | **every precision, specificity and over-questioning claim** |
| blocks activation? | no | **yes** — customer-facing activation cannot be justified without it |
| changes architecture? | **no** (see B) | possibly — if binding provokes questions where silence was right |
| cost to close | ~$0.34 hosted | authoring + independent human review, no hosted cost yet |
| unresolved for | one operation | **three operations running** (§166, §167, §168) |

Spending on attribution while `FALSIFIER_D_TESTABLE = FALSE` would buy a refinement to a result that
is already good enough to act on, while the thing actually gating activation stays untouched.

---

## Recommendation

```
THIRD_ARM_RECOMMENDED = FALSE
```

**Preferred default honoured:** attribution is not purchased for scientific neatness. It would be
worth buying only if the causal distinction changed an implementation decision, and §B shows it does
not — the binding protocol is retained under either outcome because deterministic coverage requires
a declaration to difference.

**Revisit if, and only if,** one of these becomes true:

1. someone proposes **removing** the binding protocol to reduce prompt size or latency — then the
   attribution question becomes load-bearing, because the proposal turns on whether binding does
   causal work;
2. a later hosted run shows displacement returning, and the richer-context hypothesis becomes a
   candidate explanation for the difference;
3. an external claim is contemplated that requires attributing the effect to a named mechanism —
   in which case the register's current bundled wording would first have to be reopened.

Until one of those holds, the $0.34 is better left unspent and the effort put into silence controls.
