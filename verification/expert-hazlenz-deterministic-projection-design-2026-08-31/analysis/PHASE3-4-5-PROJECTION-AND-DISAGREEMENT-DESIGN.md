# Phases 3–5 — The minimum projection, disagreement semantics, and contract sufficiency

---

# Phase 3 — The minimum projection

## Selected shape

A new sibling array on `ExpertAnalysisInput` (extension point option 2, PHASE2):

```ts
type DeterministicDisposition = 'ACTIVE' | 'CONTROLLED' | 'NOT_APPLICABLE' | 'UNKNOWN';

interface DeterministicFamilyDisposition {
  hazardFamily: string;                    // Expert taxonomy. NEVER a citation.
  disposition: DeterministicDisposition;
  isActionable: boolean;
  confidence: number;
  controllingFacts: Array<{ fact: string; status: PredicateStatus }>;   // structured rationale
  rationale: string;                       // one derived, citation-free sentence
  evidenceQuotes: string[];                // verbatim spans that established the state facts
  provenance: 'DERIVED_FROM_PRODUCTION_ENGINE' | 'CONSTRUCTED_FOR_DIAGNOSTIC';
}
```

Prototyped at `backend/scripts/lib/expert-deterministic-projection.ts` — **diagnostic-only**,
under `scripts/`, imported by exactly one harness, wired into no production path.

## Field-by-field justification

| field | why it is required | why not more |
|---|---|---|
| `hazardFamily` | the whole point — names the family that was assessed | citation excluded, see below |
| `disposition` | carries the `NOT_APPLICABLE` state that today is indistinguishable from absence | 4 members, not `PredicateStatus`'s 5 — `NOT_SUPPORTED` never occurs at decision level |
| `isActionable` | mirrors the existing `DeterministicFindingView` flag Expert already sees | — |
| `confidence` | lets Expert weigh, and lets the scorer see whether high confidence suppresses override | — |
| `controllingFacts` | **the load-bearing field.** `moving or accessible energy = CONTRADICTED` *is* the R6 answer, and it is checkable against the observation rather than merely persuasive | — |
| `rationale` | one sentence for the prompt, **derived** from `controllingFacts` | never hand-written per family — a hand-written R6 sentence would be the forging this phase forbids |
| `evidenceQuotes` | ties the determination to observation text | — |
| `provenance` | makes a constructed diagnostic row distinguishable from a derived one | — |

## The distinction the design exists to carry

> `NO DETERMINISTIC FINDING EXISTS` **≠** `DETERMINISTIC LAYER EVALUATED THIS FAMILY AND FOUND IT NOT_APPLICABLE`

Today both render as absence (PHASE1). The projected block renders them differently, and says so
in its own header: *"These families were EVALUATED by the deterministic engine. This is different
from a family it never considered — do not treat an assessment below as a gap you must fill."*

## Two constraints that shaped it

**Citation-free by necessity.** `CITATION_SHAPED_PATTERN` refuses `\d{2} CFR \d+` in Expert output
*including prose*. `ApplicabilityDecision.citation` is `'29 CFR 1910.212(a)(1)'`. Projecting it
would invite the model to echo it and get the **entire analysis rejected** by the normalizer. A
projection that made Expert output un-normalizable would be worse than the gap it closes. Hence the
explicit family-label → Expert-family map, with unmapped families **dropped rather than guessed**.

**Structured over prose.** `controllingFacts` carries the engine's own predicate names and statuses
so Expert can see *which* predicate decided the disposition, rather than being handed a conclusion
to agree with.

---

# Phase 4 — Disagreement semantics per disposition

| deterministic disposition | Expert may | Expert must not | override requires |
|---|---|---|---|
| **ACTIVE** | agree; add cross-hazard reasoning; disagree with evidence | — | evidence, as for any disagreement |
| **CONTROLLED** | agree; add a different family; disagree | re-promote the same condition to `ACTIVE` on the underlying physical fact alone | a concrete current fact that **defeats the stated control** (e.g. the observation says the control failed, or a second source is live) |
| **NOT_APPLICABLE** | agree; add a different family; **override** | create a same-family `ACTIVE` candidate merely because the underlying physical fact exists | (1) name the challenged assessment, (2) quote the exact observation evidence, (3) identify the **current exposure/pathway** the deterministic rationale does not cover |
| **UNKNOWN** | clarify; supply additional evidence; raise a candidate when independently supported | — | nothing special — and a candidate is **not required** merely because the state is UNKNOWN |

**High deterministic confidence is explicitly not a reason to withhold an override**, and the
rendered block says so in those words. This is the anti-rubber-stamp property stated as
instruction; Phase 7/8 measure whether it holds in practice.

---

# Phase 5 — Contract sufficiency

## Is `expertDisagreements` alone a sufficient override carrier?

**No — and the reason is specific.** `ExpertDisagreement` (`expert-contract.types.ts:254-269`) is:

```ts
{ disagreementId, target, surface, targetRef, disagreementType, reasoning, confidence, recommendsReview }
```

**It has no `evidence` field and no `groundingStatus`.** A disagreement is therefore structurally
*ungrounded*: it cannot carry a quote, so it cannot be bound by `bindWireAnalysis` and cannot be
checked against the observation. Phase 4 requires an override to supply *"the exact observation
evidence."* A disagreement alone cannot.

## Is the existing contract sufficient overall?

**Yes** — because `ExpertHazardCandidate` supplies exactly what the disagreement lacks, and the two
compose:

| override requirement | carrier |
|---|---|
| name the challenged assessment | `ExpertHazardCandidate.relationshipToDeterministic = 'CONTRADICTS_DETERMINISTIC'` (already a legal enum member) — and/or `ExpertDisagreement.surface` |
| the exact observation evidence | `ExpertHazardCandidate.evidence: EvidenceReference[]` + `groundingStatus`, quote-bound and offset-validated |
| the current exposure/pathway | `ExpertHazardCandidate.reasoning` / `evidenceBasis` |
| the asserted state | `ExpertHazardCandidate.assertedConditionState` |
| the narrative challenge to authority | `ExpertDisagreement` with `surface: 'NEGATION_AND_SAFE_STATE'` or `'CONDITION_STATE_INTERPRETATION'` — both exist in `EXPERT_AUTHORITY_SURFACES` with `CHALLENGE` permitted |

So the **grounded** half of an override rides on the candidate and the **authority-challenge** half
rides on the disagreement. Both collections already exist, both are already normalized, and
`CONTRADICTS_DETERMINISTIC` is already documented in the contract as routing to a disagreement.

**Conclusion: no new output collection is required, and none is proposed.** The authorization's bar
— *"do not add another collection without proof it is required"* — is not met, so nothing is added.

## Two limitations recorded rather than fixed

1. **`ExpertDisagreement` carries no evidence.** Not changed here. It is survivable because the
   candidate carries the grounding, but if a future phase wants a *candidate-free* grounded
   override (an override that says "this is not a hazard" rather than "it is"), the disagreement
   type would need an `evidence` field. Recorded as an open contract question, not acted on.
2. **`EXPERT_CONDITION_STATES` has no member meaning "evaluated and excluded."** The projection uses
   its own `DeterministicDisposition` vocabulary rather than overloading `NEGATED`. Whether the two
   should be unified is a contract decision left open — deliberately, because
   `test-expert-contract-foundation.ts` asserts `EXPERT_CONDITION_STATES` is byte-identical to the
   Level-3 vocabulary by reading that file as data, and adding a member would break that assertion.
