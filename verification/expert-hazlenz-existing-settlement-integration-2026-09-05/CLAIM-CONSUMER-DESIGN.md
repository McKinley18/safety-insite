# §182 — CLAIM QUEUE CONSUMER: DESIGN

`consumeSettlementClaims(requests, ledger, analysisId)`. Zero provider calls, zero database
operations, and it changes no status.

---

## What it consumes, and what it is not

§181 traced `CHALLENGE_FACT_VALIDITY` from the verifier instruction — *"the observation already
settles it"*, HR-04's own sentence — through `parseOwedFactDeclarations`, into an `ArbitrationRequest`
typed `settles: false`, carried into observability, and read by **nothing**. That queue now has a
consumer.

Its job is **not** to decide whether the claim is correct. It has no means to: it reads the fact's
status and identity, copies the provider's words, attaches the settlement guidance, and stops.

## The seven jobs, and where each is discharged

| # | job | mechanism |
|---|---|---|
| 1 | preserve the claim | `providerReason` copied verbatim, never parsed |
| 2 | bind it to the exact factKey | `factKey` on the claim; `FACT_NOT_IN_LEDGER` if absent |
| 3 | preserve the reason/evidence statement | `providerReason` + `evidenceDigest` over that exact text |
| 4 | expose the settlement target where present | `acceptableEvidence` projected, plus `acceptableEvidenceAbsent` |
| 5 | produce a reviewable development record | `SettlementClaim` with `reviewState: 'AWAITING_HUMAN_REVIEW'` |
| 6 | preserve fact state as UNRESOLVED | `ledgerUnchanged: true` typed as the literal; P3 asserts the status |
| 7 | reject invalid / stale / mismatched claims | four `CLAIM_REFUSAL_CODES` |

`ledgerUnchanged: true` is a **literal type**, not a boolean field. A caller cannot read the result as
a mutation, and a future edit that made the consumer mutate would have to change the interface.

## The four refusals

- **`FACT_NOT_IN_LEDGER`** — a claim about a fact that was never admitted (D6).
- **`FACT_NOT_UNRESOLVED`** — a claim about a fact already `COVERED`, `SETTLED_BY_EVIDENCE` or
  `REJECTED_BY_ARBITRATION` (P11e). A settled fact cannot be re-challenged into a review queue.
- **`CLAIM_REASON_MISSING`** — a challenge with no reason, matching the existing
  `CHALLENGE_WITHOUT_A_REASON` behaviour one layer up.
- **`CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE`** — the request must carry `settles: false` and
  `factStatusUnchanged: true`. If a caller hands over an object claiming otherwise, it did not come
  from the producer we trust, and the consumer refuses it rather than believing it (P11f).

That last one is worth dwelling on: it is a check that the *shape of the claim agrees with the
contract that produced it*, which is cheap, structural, and catches a whole class of "someone
constructed this by hand" errors.

## What the consumer must never do, and does not

- **Never** call `transition(..., SETTLED_BY_EVIDENCE, ...)` merely because a claim exists — it calls
  `transition` not at all.
- **Never** infer evidence sufficiency — there is no comparison in the function.
- **Never** merge sibling claims — each request produces its own claim keyed by its own `factKey`;
  D1–D5 drive the sibling cases.
- **Never** substitute an adjacent fact — substitution remains unrepresentable in the ledger, and the
  consumer adds no path to it.

## acceptableEvidence: shown, caveated, never strengthened

The claim carries the projected criterion — `requirement`, `examples`, `insufficientExamples` — with
provenance stripped exactly as the existing projection does, plus two additions:

**`acceptableEvidenceAbsent: boolean`** — so null is *visible as null* rather than merely missing.
Review remains possible with a null criterion (P16b): the human decides, and the absence of governed
guidance does not block them.

**`settlementGuidanceCaveat`** — a fixed sentence carried on every claim:

> *acceptableEvidence states what the governed record recognises as verification. It does NOT state
> that this evidence settles this property. §181 found the governed registry contains no
> functional-test verification method, so a criterion shown here may be incapable of settling a
> protective-function fact. Deciding that is the reviewer's judgement.*

This exists because of the §181 finding, and it is the honest answer to "what happens when governed
guidance is coarse". The criterion is preserved **verbatim** — `physical_inspection` is shown as the
example even for a securement fact, because that is what the governed record says (P17b). The code
does not upgrade it, paraphrase it, or supplement it. It tells the reviewer what it is and what it is
not, and leaves the judgement where it belongs.

A reviewer looking at HR-04 would therefore see: a securement fact, a criterion whose only example is
`physical_inspection`, and a caveat saying the registry has no functional-test method. That is enough
to refuse settlement on informed grounds — which is the outcome the architecture should make easy.

## Observability

`observeSettlementReview` produces one record reconstructing the whole decision: factKey, claimId,
claim origin, provider reason, criterion and its absence flag, status before, reviewer provenance,
decision, whether an authority was minted and why not, whether a transition was attempted, refusal
codes, and status after.

`NEVER_PROJECTED_TO_PROVIDER` names the fields that must not travel back into a provider request —
`reviewDecision`, `reviewerProvenance`, `reviewerId`, `rationale`, `authorityMinted`,
`factStatusAfterReview` — recorded as an exported constant so a later edit that projects one
contradicts a published list (P19).
