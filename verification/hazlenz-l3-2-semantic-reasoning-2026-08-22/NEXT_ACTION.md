# L3-2 — unresolved limitations and the exact next action

## Is L3-3 architecturally eligible?

**Yes, architecturally. No, on quality.**

Nothing L3-2 measured contradicts the approved Level-3 architecture. The seam holds, the authority
separation holds, the contract carried real inference without weakening, and customer behaviour is
unchanged. What failed is a component *this phase built*, not the architecture and not the provider.

L3-3 (hazard decomposition and condition state becoming semantic) must not start while the
observation-interpretation stage still drops a high-consequence multi-hazard finding, because L3-3
builds directly on top of it.

## The remediation, specified but deliberately not applied

`ROOT_CAUSE_BEFORE_REMEDIATION`: both false negatives have one root cause — **`clauseAround()` treats
a comma-delimited run as a single clause**, so a negation or a sibling hazard in a neighbouring
segment is treated as governing the cited span.

1. **`SEMANTIC_NEGATION_UNADDRESSED` is too wide.** Scope the check to the comma-segment containing
   the span, extended left only across coordinators that genuinely carry negation scope
   (`or`, `nor`, and bare list continuation). `C11` is the fixture; RC-08's own sentence is the
   counter-fixture that must keep failing.
2. **`SEMANTIC_EVIDENCE_NOT_SELECTIVE` must not be candidate-fatal.** A whole-source citation on a
   genuine multi-hazard observation is weak grounding, not fabrication. It should downgrade the
   candidate — surfacing it as needing narrower evidence — rather than delete it. `B08` is the fixture.
3. **Widen the state-support vocabularies.** `D02` shows `CONTROLLED` refused on "locked out … voltage
   verified absent"; the control-in-place list omits verification and isolation language.
4. **Clarification is under-produced.** 0 of 66. `B10` proves at least one was decision-critical.
   The prompt gives clarification no positive trigger — only a schema slot.

**Every one of these must be validated against a NEW holdout.** The current one
(`41ae3c229a4e81ad…`) has been opened and is retired for gate purposes, exactly as
`EVALUATION_AND_GATES.md` requires. It stays valid as a development set.

## Other unresolved limitations

* **Production provider selection is still open** — see `PROVIDER_SELECTION.md` §4. It needs a
  credential for at least two hosted candidates so the procedure's step 2 can run.
* **Holdout provenance is good but not ideal.** Scenarios were authored and frozen by an earlier
  phase and are genuinely novel to Level 3, but they are *not* novel to Level 1, so the Level-1 side
  of the comparison is not a blind measurement. A sealed set authored by someone not implementing is
  still owed before an L3-3 acceptance run.
* **The development set was authored by this phase.** Its 15/15 result is a tuning artifact, not a
  capability claim, and is reported as such.
* **Determinism is ~98.5%, not 100%** — 1 of 66 scenarios differed across two seeded runs.
* **The selected model is coding-tuned.** Its competence here does not transfer to a production
  choice, and single-host operation leaves P-10/P-12 unmet.
* **Applicability reasoning is designed but unbuilt** (D-L32-1) — correctly, as it is L3-4 work.

## Exact recommended next action

> **Open a scoped remediation slice — L3-2b — that fixes the four semantic-binder defects above and
> nothing else, re-runs the offline suite plus the customer-invariance matrix, and is accepted
> against a NEWLY AUTHORED sealed holdout. Do not begin L3-3 until L3-2b closes with zero
> high-consequence misses through the full shipped pipeline.**

Obtaining a hosted-provider credential can proceed in parallel; it is independent of the binder work
and is what unblocks the production selection.
