# §182 — SETTLEMENT AUTHORITY PRODUCER: DESIGN

One new file: `backend/src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts`. No existing
source file was modified. Zero provider calls, zero database operations.

---

## The invariant, and how it is made structural

> **`PROVIDER_SETTLEMENT_AUTHORITY = NEVER`**

```
provider claim  ->  reviewable record  ->  HUMAN decision  ->  authority  ->  transition
                                            ^^^^^^^^^^^^^
                                    a provider cannot produce this
```

Every arrow after the first requires something a provider response cannot contain. The producer,
`mintSettlementAuthority`, refuses on seven independent codes; a provider claim fails at least two of
them (`DECISION_DOES_NOT_APPROVE_SETTLEMENT`, `REVIEW_PROVENANCE_NOT_HUMAN`) before any other check
matters.

## Why the authority is a branded object rather than a boolean

The authorization asked for "a typed development authority object rather than a boolean", and the
reason is forgeability. A boolean is trivially fabricated by any caller; an interface is fabricated by
any caller who writes a matching object literal.

So the brand is a **real module-private symbol**, not a type-only declaration:

```ts
const SETTLEMENT_AUTHORITY_BRAND: unique symbol = Symbol('hazlenz.expert.settlement-authority');
```

Because it is never exported, code outside this module cannot construct an object carrying that key.
The brand therefore holds **at runtime as well as at compile time** — a forged authority is not merely
a type error a cast could silence, it is an impossible value.

(The first draft used `declare const … : unique symbol`, a type-only brand. It failed at runtime with
`SETTLEMENT_AUTHORITY_BRAND is not defined`, which is exactly the right failure: a type-only brand
would have been a compile-time fiction with no runtime substance.)

## Scope: one fact, one claim, one use, no future implication

```ts
readonly factKey: string;                 // binds it to ONE fact
readonly claimId: string;                 // binds it to ONE claim
readonly evidenceDigest: string;          // binds it to ONE exact reviewed text
readonly scope: 'SINGLE_FACT_SINGLE_CLAIM_SINGLE_USE';
readonly impliesFutureSufficiency: false; // a literal type, not a comment
```

`impliesFutureSufficiency: false` is typed as the literal so no future code can set it true without
changing the interface. It answers requirement 6 directly: **an approval says this evidence settled
this fact this once**, and says nothing about the next identical-looking evidence.

Requirement 5 — "cannot settle sibling facts" — is enforced at application time, not merely at mint
time. Proof P9 hands an authority minted for the securement fact to the presence fact and gets
`AUTHORITY_NOT_FOR_THIS_CLAIM` + `AUTHORITY_NOT_FOR_THIS_FACT`, with **both** facts left `UNRESOLVED`.

## Review provenance

`HUMAN_REVIEW` is the only permitted value. The refused list is deliberately enumerated rather than
left as "anything else":

```
PROVIDER_DECLARATION · MODEL_ADJUDICATION · HISTORICAL_EVALUATION_LABEL
AUTOMATED_MATCHER · DERIVED_HEURISTIC
```

Two of those are specific programme scars rather than hypotheticals. `HISTORICAL_EVALUATION_LABEL` is
the §162/§169 disposition that must never re-enter the loop it judges — already why
`ADJUDICATION_LABEL` sits in `PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES`. `AUTOMATED_MATCHER` is the
keyword scorer §160/§161 retired. Naming them makes an accidental promotion a *refusal with a code*
rather than an omission nobody notices. Proof P2 drives all five.

## Decisions

`APPROVE_SETTLEMENT` · `REJECT_SETTLEMENT` · `LEAVE_UNRESOLVED` — small, closed, authority-bearing,
with exactly one approving member (`SETTLEMENT_APPROVING_DECISIONS`, exported as data so a test can
assert on it).

There is no `PARTIAL_MATCH_PERCENT`, no `CONFIDENCE_THRESHOLD`, no score of any kind. A reviewer who
is unsure returns `LEAVE_UNRESOLVED`, which produces the same outcome as doing nothing — and which is
the right answer whenever the governed criterion cannot settle the property in front of them, a
situation §181 showed will be common.

`RATIONALE_MISSING` and `REVIEWER_IDENTITY_MISSING` fail closed. An approval with a blank rationale is
not a review.

## Replay and staleness — the minimal identity, and why it exists

The authorization asked for the smallest development-scoped identity necessary. Two digests:

- **`claimId`** = sha256 over `(contract version, analysisId, factKey, providerReason)`. The same
  claim always yields the same id; a different reason yields a different one.
- **`evidenceDigest`** = sha256 over the reason text alone, so an approval **cannot be replayed
  against edited evidence** (`REVIEWED_EVIDENCE_DIGEST_MISMATCH` at mint, `AUTHORITY_EVIDENCE_DIGEST_MISMATCH`
  at application).

Ledger revision: rather than invent a revision subsystem, application compares the fact's current
status against `factStatusAtClaim` and refuses `LEDGER_MOVED_SINCE_CLAIM`; the pre-existing
`transition()` independently throws on a terminal status. Duplicate application is caught by
`appliedClaimIds`, carried **by the caller** rather than in module state, so replay protection is
explicit at the call site instead of hidden global memory.

Every case in the authorization's staleness list is proven: wrong factKey (P7), wrong claimId (P8,
P11), modified evidence (P8b, P11b), already-resolved fact (P11c), duplicate decision (P10), and a
fact absent from the ledger (P11d).

## What the producer refuses to decide

Whether the evidence actually settles the fact. `CLARIFICATION_EVIDENCE_SUFFICIENCY =
SEMANTIC_JUDGMENT_REQUIRED` is untouched (P18c), and P18/P18b assert that no similarity, embedding,
score, threshold or comparison of the provider's reason against the criterion exists anywhere in the
module — checked with comments stripped, so the file is not punished for describing what it refuses
to do.

## One residual, reported rather than hidden

`transition()` remains exported and directly callable in-process with `'ADMISSIBLE_EVIDENCE'`. §182
did not change that, because doing so would alter an existing contract that the §170 and §181 proof
suites depend on — and the authorization says to stop and report if an active contract would need to
change.

The safety property that matters still holds and is proven: **no provider input can reach that call.**
The provider path (`applyAdmittedDeclarations`) mints `ADMITTED_BINDING` only, and
`owed-fact-binding.ts` contains no occurrence of `'ADMISSIBLE_EVIDENCE'` (R1b, P10). The residual is
that *development code in the same process* can call the raw transition — which is how the §170/§181
suites exercise the state machine, and is a known property of an inactive development module rather
than a customer-reachable path.

If a future stage wants that closed, the narrowest fix is to stop exporting `transition()` and route
every caller through typed authorities — a change to an existing contract, and therefore a separate
authorization.
