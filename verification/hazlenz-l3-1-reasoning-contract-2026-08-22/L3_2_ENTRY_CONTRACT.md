# L3-2 entry contract — the handoff L3-1 creates

**L3-2 is not authorized by this document.**

## What a provider must implement

`HazLenzReasoningProvider` (`hazlenz-reasoning-provider.ts`):

```
readonly providerId: string
analyzeObservation(input: ReasoningInput): Promise<ReasoningProviderResult>
```

`ReasoningProviderResult` is `{ok:true, proposal}` or `{ok:false, kind, detail}` where `kind` is one of
`TIMEOUT · UNAVAILABLE · MALFORMED_STRUCTURED_OUTPUT · PROVIDER_REFUSAL · TRANSIENT_ERROR ·
PERMANENT_CONFIGURATION_ERROR`. `isRetryableProviderFailure()` decides retry eligibility; the ceiling is
one retry.

## What structured output must satisfy

`ReasoningProposal` v1 (`hazlenz.l3.proposal.v1`), and then the validator. In practice the provider must:

* echo `analysisId` exactly;
* choose `hazardFamily` from `input.allowedHazardFamilies` — nothing else validates;
* choose `conditionState` from the eight `L3ConditionState` members — there is no default;
* supply `EvidenceReference` offsets that **exactly** slice `quotedText` out of a supplied source;
* keep a governing negation token inside the span when one immediately precedes it;
* reference regulatory candidates **by supplied `candidateId` only** — a citation string is refused;
* carry no governance, review, release, badge or regulatory-text field anywhere in the object;
* ground `correctiveActionIntent` in a subset of that candidate's own evidence;
* give any clarification an `unresolvedFact`, an `affectedDecision`, ≥2 `branches` and a `question`;
* never claim `USER_CONFIRMED` jurisdiction.

## What the validator returns

`validateReasoningProposal(proposal, input) → { state, issues[], validated }` where `state` is
`VALID | RETRYABLE_MODEL_OUTPUT | REJECTED_MODEL_OUTPUT`, `issues[]` carry stable `code` values from
`L3_VALIDATION_REASONS`, and `validated` is a `ValidatedReasoning` **only** when `state === 'VALID'`.
Branch on `code`, never on message prose.

## How L3-2 may dual-run without customer authority

L3-2 runs the provider and the validator **off the request path** — a harness reads observations,
builds a `ReasoningInput`, calls the provider, validates, and records the comparison. It must not
import into `intelligence-orchestrator.service.ts`, must not register a provider in a Nest module, and
must not modify `safescope-v2.service.ts:1576`. The customer continues to receive the Level-1 result.
Comparison mode is `L3_COMPARE` — **not** KG SHADOW vocabulary.

## Evidence binding — mechanical now vs semantic in L3-2

**Already mechanical (enforced by the validator):** source existence · offset bounds · exact
`quotedText` equality · immediately-preceding governing-negation truncation · corrective-action
grounding within the candidate's own evidence · candidate-id membership.

**Still semantic, and L3-2's responsibility:** whether the span the model chose is the *right* evidence
for the claim; whether a negation further away in the sentence still governs; whether two candidates
are genuinely independent hazards rather than two cues for one. The validator deliberately does not
attempt these — it enforces contracts, it does not re-interpret the observation.

## Open decisions carried into L3-2

1. provider and pinned model id (selection procedure in `PROVIDER_REQUIREMENTS.md`);
2. cost and latency budget numbers, measured from real token counts;
3. whether regulatory applicability is a second call or one combined schema;
4. sealed-holdout authorship, before the first L3-3 acceptance run.

None blocks starting L3-2.
