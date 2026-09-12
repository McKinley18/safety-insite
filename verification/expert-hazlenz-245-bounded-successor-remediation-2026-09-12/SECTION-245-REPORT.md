# §245 — Bounded Successor Remediation: Final Report

Zero provider calls. Zero database operations. No commit, no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_BOUNDED_REMEDIATION_SCOPE_EXCEEDED —
    PRODUCT_OWNER_ARCHITECTURE_DECISION_REQUIRED

## Required report fields

| Field | Value |
|---|---|
| §243 failed candidate | b22e43957625afe696b417253ac46031f62b763a52e52b3eb9464ace0a81676e |
| §243 result | D HOLD RELEASE — PRESERVED |
| §244 package digest verified | be712eec3e4775e40bc67c279530490b2b9ed28470fbb2591e2f528af4c771b7, all 9 members match |
| Authorized remediation slices | 5 |
| Production/acceptance path unified | NO |
| Production caller now exists | NO |
| Strict-schema parity | NO |
| Request-envelope identity bound | NO |
| Driver-role representation changed | NO |
| K6 invalid combinations unrepresentable | NO |
| Decision-complete property review | NO |
| Decision-complete evidence review | NO |
| `property-authority.ts` modified | NO |
| `settlement-review.ts` modified | NO |
| Protected historical identities rewritten | NO |
| §243 preserved outputs replayed | 0 / 30 |
| Structural admission under new path | NOT MEASURED — no new path was built |
| Semantic-coherence failures structurally prevented | 0 |
| Semantic-coherence failures remaining | 8, unchanged from §243 |
| M8 historical mechanism | REMAINS |
| G5 historical mechanism | REMAINS |
| K6 M2 historical mechanism | REMAINS |
| Review-artifact failures G3/C6/C2 | REMAIN |
| Protected regressions | 0 — no code was modified |
| Candidate identity expanded | DESIGNED, NOT APPLIED |
| Provider calls | 0 |
| Hosted confirmation instrument frozen | NO |
| Hosted calls if executed | none |
| Hosted spend if executed | USD 0.00 |
| Driver-role success condition | NOT EXECUTED |
| Database operations | 0 |
| Commit / push / tag / deploy | NONE |

## Why the terminal is scope excess and not remediation

Slice 1 required one production-callable Expert path matching the candidate, closed architecturally.
Determining the narrowest such architecture was the first authorized act, and it returned a result
that changes what the remaining slices mean.

1. The §243 candidate's contract closure is **42 modules, 17,898 lines, entirely under
   `scripts/lib/`**. `backend/tsconfig.json` pins `rootDir` to `./src` and includes only `src/**/*`,
   with a comment stating that an import from `src/` into `scripts/` is deliberately made a compile
   error. The candidate's contract is not shippable where it lives.
2. The shipped `src/` Expert implements a **different contract**. `buildExpertWireSchema` emits
   `expertHazardCandidates`, `decisionCriticalClarifications`, `crossHazardInsights`,
   `disagreements`, `expertExplanation`, `uncertainty`, `outcome`, `contractVersion`, `analysisId`.
   Occurrences of `driverRole`, `immediateSafetyPosture`, `requiredBy` and
   `unresolvedFactDeclarations` in that module: **zero, all four**.
3. The Expert layer has **no customer-path caller at all**. `AnthropicExpertProvider` is instantiated
   only under `scripts/`; `runExpertAnalysis` is imported only by `scripts/`.
4. The 29-module protected composite binds **21 modules under `scripts/lib/`** and 8 under `src/`.

So the discrepancy is not a caller difference that a shared envelope closes. It is two products, one
of which has never been wired to a request. Closing it requires choosing which contract is the
product, promoting ~17,898 lines, building an entry point that does not exist, and re-deriving the
protected composite — a wider architectural change, and the first step is broad semantic
redevelopment, which this authorization forbids.

## Net advances on §244

Two findings survive whichever architecture is chosen.

**K6 is feasible, but §244's recommendation was wrong in a way that would have cost a paid call.**
§244 named `oneOf` first among acceptable discriminated-union architectures. Anthropic's
structured-output schema subset does not support `oneOf`; it supports `anyOf` and `const`. An
implementation following §244 literally would have returned HTTP 400 before generation, reproducing
the §107 `minLength` failure. The correct form is `anyOf` over six branches with `driverRole` pinned
by `const`. Verified offline through the production adapter's own pipeline, with no credential and
no network call: `anyOf` and `const` both survive the §108 keyword strip, the strict wrapper adds
`additionalProperties: false` inside each branch, and the union expresses 6 admissible pairs and 0
inadmissible, against 4 expressible today.

**Candidate identity v2, applied to the current tree, fails at six of seventeen bound elements** —
production entry point, semantic-equivalence proof, request envelope, strict-schema configuration,
output-token configuration and response schema. Three of those admit no reasonable written
declaration. A freeze that bound the executable configuration would have refused §243 before the
USD 3.02 was spent.

## Preserved and untouched

§243 remains NOT ACCEPTED and is not rewritten, amended or reinterpreted. §242A remains spent. The
§244 expectation that the proposed justification representation would have barred M8's storm fact but
not necessarily G5 is preserved unchanged and was not revised. The protected successful families —
exact controlling-property semantics, prohibited-proxy discrimination, property/evidence authority
separation, settlement authority, KR-1, governed evidence, citation suppression, RR-7, deterministic
semantic non-invention and sibling settlement independence — were not touched, and no change was made
that could alter them.

`property-authority.ts` and `settlement-review.ts` were read and left unmodified. The explicit
authorization to modify them is unspent and carries forward.

## Outputs produced, and outputs withheld

Produced: this report, `SECTION-245-IMPLEMENTATION-PLAN.md`,
`SECTION-245-PRODUCTION-PATH-PARITY.md`, `SECTION-245-REQUEST-ENVELOPE-PARITY.md`,
`SECTION-245-K6-REPRESENTABILITY.md`, `SECTION-245-CANDIDATE-IDENTITY-V2.md`, `REPORT-245.sha256`.

Withheld, because producing them would assert work that did not happen:
`SECTION-245-DRIVER-ROLE-REMEDIATION.md`, `SECTION-245-REVIEW-ARTIFACT-REMEDIATION.md`,
`SECTION-245-LOCAL-REPLAY-RESULTS.json`, `SECTION-245-PROTECTED-REGRESSION.json`,
`SECTION-245-HOSTED-CONFIRMATION-DESIGN.md`.

A replay result against an unchanged deterministic path would restate the §243 numbers under a new
heading. A protected-regression file on an unmodified tree would report the absence of a change as
evidence about a remediation. Neither is admissible.

## The decision required

Which Expert HazLenz contract is the product — the §239 contract that §233 through §243 developed
and measured, or the contract that `src/` currently ships? And if the former, is the programme
funding its promotion into the shipped tree and the construction of a customer-path entry point?

Options A, B and C, with their consequences, are set out in `SECTION-245-IMPLEMENTATION-PLAN.md`.
Engineering evidence cannot choose among them, because each assigns a different meaning to
"candidate", "acceptance" and "release".

STOP.
