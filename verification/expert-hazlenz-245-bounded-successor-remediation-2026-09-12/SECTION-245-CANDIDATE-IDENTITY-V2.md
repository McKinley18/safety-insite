# §245 — Candidate Identity v2, Designed and Applied to the Current Tree

Zero provider calls. Not retrofitted to §243. This design applies only to a future successor
candidate, as authorized.

## The seventeen bound elements

The authorization requires a candidate identity that binds the material executable configuration and
not merely source modules. Designed below, with the disposition each element has **in the tree as it
stands today**. That second column is the point of the exercise: the v2 freeze is a test, and running
it now tells the product owner where the candidate actually is.

| # | Bound element | Status today |
|---|---|---|
| 1 | production Expert entry point | **ABSENT** — no `src/` caller exists |
| 2 | acceptance Expert entry point | present — `scripts/execute-243-final-acceptance.ts` |
| 3 | proof both resolve to the same semantic implementation | **IMPOSSIBLE** — different contracts |
| 4 | first-pass contract identity | present on acceptance only, `contractIdentities239()` |
| 5 | verifier contract identity | present on acceptance only, §218 |
| 6 | provider request-envelope identity | **UNBOUND ANYWHERE** |
| 7 | strict-schema configuration | **DIVERGENT** — production `true`, acceptance omitted |
| 8 | provider / model identifier | shared, `EXPERT_HOSTED_INFERENCE_CONFIG.model` |
| 9 | output-token configuration | **DIVERGENT** — acceptance uses its own first-pass and verifier limits |
| 10 | response schema | **DIVERGENT** — `buildExpertWireSchema` vs `buildExpert239WireSchema` |
| 11 | property-authority implementation | shared, `src/.../owed-facts/property-authority.ts` |
| 12 | evidence-authority implementation | shared |
| 13 | settlement implementation | shared, `src/.../owed-facts/settlement-review.ts` |
| 14 | governed-evidence implementation | shared |
| 15 | review-artifact contract | present, single-target property packet only |
| 16 | driver-role / posture contract | acceptance only, `scripts/lib/` |
| 17 | K6 representability contract | independent enums, 4 inadmissible pairs expressible |

## The procedural rule, and what it returns today

The rule: **a freeze must fail when the acceptance caller and the production caller differ on any
bound element, unless the difference is declared and accepted in writing as part of the freeze.**

Applied to the current tree, the v2 freeze **fails at elements 1, 3, 6, 7, 9 and 10.** Three of those
are not differences that a declaration could reasonably accept. Element 1 has no value to compare.
Element 3 is the invariant itself. Element 10 is the response schema, where the two sides do not
share a root shape.

This is the correct behaviour and it is the finding. A freeze procedure that binds the executable
configuration reports, before any spend, that there is no production configuration to bind. §243
would have failed this check at freeze time, and the product owner would have had that information
before USD 3.02 was committed rather than after.

## What v2 must bind that §243's identity did not

§243's candidate digest hashed prior-section digests, the 29-module protected composite, ladder and
suite results, consistency results and evidence integrity — **source bytes and test outcomes**. It
did not hash the assembled provider request at all. The per-case system-prompt, user-prompt and
wire-schema digests §243 captured before transmission were the right instinct, but they sat beside
the candidate rather than inside it.

The v2 addition is therefore: promote those three per-leg digests from record to binding, add the
request envelope (6, 7, 8, 9), add the caller identity for each leg, and add the declared
equivalence at element 3 — or an explicit written statement that no equivalence exists.

## A caution on the composite

The 29-module protected composite binds 21 modules under `scripts/lib/` and 8 under `src/`. Any
architecture that promotes the contract into the shipped tree changes 21 of 29 paths and cannot
preserve the composite digest. That is not a reason to avoid the promotion; it is a reason the
promotion must carry a new composite under v2 rather than an amended §243 identity. The §243
composite `37ce9eb8…` remains frozen historical provenance and is not to be recomputed.

## Disposition

**DESIGNED, NOT APPLIED TO ANY CANDIDATE.** No successor candidate exists to freeze, and freezing
one is not authorized until the bounded repair is shown to work. The design is recorded here so that
the architecture decision can be taken with the freeze criteria already known.
