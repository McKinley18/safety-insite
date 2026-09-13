# HAZLENZ INVARIANTS

**Architectural rules that must not be violated.** Every rule here was established by evidence in
the validation archive. Changing one is a product-owner decision, not an engineering decision, and
requires reopening the evidence that established it.

Explanations appear only where an unexplained rule would be misread.

---

## Authority

**1. The model authors safety semantics.** Property identity, branch meaning, what is unresolved and
what the clarification asks originate in the model. If the model did not say it, the system does not
know it.

**2. Deterministic code validates, projects and refuses.** Those three, and nothing else.

**3. Deterministic code does not invent safety meaning.** It may not repair, reconstruct, infer or
back-fill it — including by parsing generated prose, inferring a semantic role from vocabulary, or
reading meaning out of a field that failed validation. A refused declaration is refused whole.

**4. Provider output alone cannot create customer-authoritative settlement.** No model output moves a
fact out of `UNRESOLVED`.

**5. Property authority and evidence authority are distinct.** They are separately recorded human
decisions and neither implies the other.

**6. Human property confirmation is not evidence settlement.** Confirming that the property is the
right property says nothing about whether the evidence satisfies it.

**7. A human decision takes effect exactly.** An authorised confirmation, approval, correction or
decline is reflected in authoritative state as given, and is never ignored, widened or overwritten by
later model output. A reviewer who declines produces `DECLINED_KEEP_UNRESOLVED`, not a settlement.

**8. A satisfactory settlement moves exactly one fact on exactly one ledger transition.**

---

## Truth preservation

**9. Unresolved decision-critical truth must not silently disappear.** A fact that the analysis was
supposed to hold open must be visible in authoritative state, or its absence must itself be visible
as a named defect. Silence is the failure mode this system exists to prevent.

**10. Independent facts stay independent.** No safety fact may be collapsed into, substituted for, or
settled by the resolution of a sibling.

**11. Malformed safety-critical states fail closed, preserving what was identified.** RR-7: a
declaration that fails validation is refused, and the property it identified is preserved in a
`STRUCTURALLY_INVALID_DECLARATION` record rather than dropped. Preservation is not repair, and a
preserved record is not settleable.

**12. A non-semantic filler in a required field is a refusal, not a value.** `N/A` and its kin are
refused as `NON_SEMANTIC_PLACEHOLDER_VALUE`.

**13. A structurally defective provider result is named in the end state.** The user must be able to
tell "the analysis found no gap" from "the analysis did not produce a usable result".

---

## Epistemic discipline

**14. Absence of evidence is not established adverse truth** — unless the absence itself is the
substantive adverse property under analysis.

**15. Safe or adequately negated conditions must not be manufactured into decision-critical
hazards.** Restraint on an established-safe condition is as much a requirement as recall on an
unsafe one.

**16. An unknown is owed only when it is material to the decision under analysis.** A real unknown
that does not bear on the decision is not a gap. Manufacturing gaps to look thorough is a defect.

**17. Counterfactual discipline.** What is done while a fact is open is not a truth claim about
either branch and is not a third branch.

---

## Governed evidence

**18. Governed regulatory authority comes only from authorised supplied sources.** Invented,
unsupported or model-minted citations, requirements or regulatory texts may never enter an
authoritative result.

**19. An available supplied record is not thereby relevant.** An off-point source must not enter
controlling reasoning because it happened to be in the payload.

**20. Grounding supports a decision; it never settles an open fact.**

---

## Validation governance

**21. Preregistration precedes execution.** Acceptance expectations are authored and frozen before
any provider call, and may never be redefined after output is seen. Denominators, applicability,
thresholds, mandatory axes and case membership are frozen with them.

**22. Hard gates are never compensated.** A safety-critical gate is pass/fail at zero occurrence. It
may not be offset by an aggregate score, by a headline accuracy percentage, or by another gate.

**23. `NOT_EXERCISED` is never `CORRECT` and never a pass.** An axis with no genuine opportunity to
fail is recorded `NOT_EXERCISED`. Reaching a denominator is instrument completion, never acceptance.

**24. `AMBIGUOUS` on a hard-gate judgment means the gate cannot pass from that judgment,** and may
not be resolved after the fact to obtain a terminal.

**25. A structural, contract or tooling failure is never converted into a semantic verdict** about
the model or the verifier. Where output is malformed, no semantic property identity may be inferred
from it.

**26. Contracts and provenance records are extended by additive successors.** A successor is built by
construction from its base and can reconstruct it exactly. A stale record is superseded by a new
record, never rewritten in place. Historical validation evidence is immutable.

**27. A schema or architecture change is never evidence that a behavioural defect is repaired.**
Only behaviour under a preregistered instrument establishes that.

**28. A single case never generalises.** One success or one failure is not an architectural
conclusion.

**29. Instrument integrity outranks cost ceilings.** A frozen experiment that collides with a spend
ceiling is resolved by the product owner raising the ceiling, never by cutting coverage or changing
the semantic request contract.

---

## Production boundary

**30. Deterministic HazLenz is the only customer-authoritative analysis path** until a product owner
authorises otherwise, and the production build must not be able to reach experiment modules.

> **§263 factual correction — the invariant is unchanged, its status clause was stale.** The §229
> text continued "Expert HazLenz has no production activation", which has been false since §246
> productionized the validated contract and §262 exposed an authenticated, entitlement-gated route.
>
> The invariant itself still holds, and §262 is what keeps it holding: an Expert analysis reconciles
> **no** findings, confirmed or not; `ANALYSIS_AWAITING_CONFIRMATION` withholds any operational
> conclusion that turns on the driver-role classification; and the API states
> `findingsReconciled: false` rather than leaving a client to infer it. Expert is activated and it
> is still not customer-authoritative. Those are different things and the distinction is the
> product's safety position, not an accident of sequencing.

---

## Status

**§263 added, removed and changed no invariant.** All thirty stand exactly as established. §263
corrected one stale STATUS CLAUSE inside invariant 30 (see the note there); the rule it states is
untouched.

Exercised end to end since §229, against the real product path rather than a harness:

| invariant | exercised by |
|---|---|
| 4 provider output alone cannot settle | §262 — an admitted analysis whose posture turns on an unresolved classification is held in `ANALYSIS_AWAITING_CONFIRMATION` and reconciles nothing |
| 9 unresolved truth must not silently disappear | §262 cases F and G — RR-7 preservation through the real route and into persistence |
| 11 RR-7 preserves what was identified | §262 case G |
| 13 a structurally defective result is named | §262 case E — refused whole, no part rendered |
| 23 `NOT_EXERCISED` is never a pass | §262 — cases C and D recorded RESERVED rather than faked; §263 — governed citation recorded as not exercised at all |
| 26 additive successors, immutable history | §263 — the evidence-integrity guard makes this checkable rather than trusted |
| 30 production boundary | §262 — activated behind the analysis-production guard profile, with no downstream authority |

## Status at §229 (historical)

All thirty stood at §229. The §228B/§228C exercise table for that section is preserved below.

Which of them have now been exercised end to end against live provider output, rather than only
asserted by a local suite:

| invariant | exercised by |
|---|---|
| 4 provider output alone cannot settle | §228B — 0 provider-only settlements across 8 cases |
| 5 property and evidence authority are distinct | §228C — evidence approved, property absent, settlement refused |
| 6 confirmation is not settlement | §228B C2 stage one — `CONFIRMED`, zero transitions |
| 7 a human decision takes effect exactly | §228B C3 correction, C4 decline |
| 8 a settlement moves exactly one fact on one transition | §228B C2 stage two |
| 9 unresolved truth must not silently disappear | §228B C1 — absence named as a structural defect |
| 10 independent facts stay independent | §228B C4 — sibling intact through an adverse outcome |
| 11 RR-7 preserves what was identified | §228B C5 |
| 12 non-semantic filler is a refusal | §228B C5 — `NON_SEMANTIC_PLACEHOLDER_VALUE` |
| 13 a structurally defective result is named | §228B C1 |
| 15 safe conditions are not manufactured into hazards | §228B C6 — zero declarations |
| 16 an unknown is owed only when material | §228B C6 — a real unknown recorded as uncertainty, not declared |
| 18–20 governed evidence boundary | §228B C7 — on-point record only, off-point absent, nothing settled |
| 22 hard gates are never compensated | §228B — no aggregate computed, 2 requirements left COVERAGE_INSUFFICIENT rather than offset |
| 23 `NOT_EXERCISED` is never a pass | §228B — 8 slots recorded `NOT_EXERCISED`, none credited |
| 26 additive successors, immutable history | §228A built from §221; §229 modified no evidence file |
| 30 production boundary | §229 — the production build emits 1,071 files and reaches no experiment module |

The remainder are structural or governance rules that no single run exercises.
