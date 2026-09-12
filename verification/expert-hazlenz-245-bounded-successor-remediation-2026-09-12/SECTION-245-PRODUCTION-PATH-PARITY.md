# §245 — Slice 1, Production Executable Path

Zero provider calls. Zero database operations. No production code modified.

## The instruction and the answer

Slice 1 required establishing one production-callable Expert HazLenz execution path corresponding
to the candidate under evaluation, and closing the discrepancy architecturally rather than
documenting it. The narrowest such architecture was to be determined, not assumed.

It was determined. **No narrow architecture exists.** The discrepancy §244 described as a caller
difference is not a caller difference. Production and acceptance do not run one contract through
two builders; they run two different contracts, only one of which is in the shipped tree, and
neither of which has a customer-path caller.

## Finding 1 — the candidate's contract lives entirely outside the production build

The transitive import closure of the §243 assembly (`scripts/lib/expert-243-assembly.ts`, the module
the acceptance executor calls) is **42 modules and 17,898 lines, all under `scripts/lib/`.** It
reaches into `src/` for five leaf modules only: `expert-contract.types.ts`, `expert-prompt.ts`,
`owed-facts/owed-fact-ledger.ts`, `owed-facts/owed-fact.types.ts` and
`owed-facts/verifier-v3-development-boundary.ts`.

The closure carries the whole semantic stack under acceptance: the vNext → §210J → §233 → §235 →
§237 → §239 first-pass contract, the §212/§214/§218 verifier contract and payload, scope
containment, disposition closure, governed citation reuse and the posture projection.

## Finding 2 — production cannot call it, by deliberate design

`backend/tsconfig.json` declares `"rootDir": "./src"` and `"include": ["src/**/*"]`. Its own comment
states the intent verbatim: without the pinned root, "a single import from `src/` into a sibling
directory (a verification helper under `scripts/`, say) silently moves the whole build" and
"Declaring the root turns that into a compile error naming the offending file."

So a production import of the candidate's contract is not merely absent. It is a compile error the
repository was configured to produce on purpose. The candidate's 42 modules are not shippable where
they live.

## Finding 3 — the `src/` Expert implements a different contract, not the same one

`buildExpertWireSchema` in `src/safescope-v2/expert-hazlenz/expert-prompt.ts` emits these root
properties:

    expertHazardCandidates, decisionCriticalClarifications, crossHazardInsights,
    disagreements, expertExplanation, uncertainty, outcome, contractVersion, analysisId

A count of the candidate's load-bearing field names in that same 113 KB module returns **zero**:

| Symbol | Occurrences in `expert-prompt.ts` |
|---|---|
| `driverRole` | 0 |
| `immediateSafetyPosture` | 0 |
| `requiredBy` | 0 |
| `unresolvedFactDeclarations` | 0 |

The shipped contract has no posture, no driver roles, no unresolved-fact declarations and no basis
entries. It carries `decisionCriticalClarifications` where the candidate carries
`unresolvedFactDeclarations` plus an owed-fact ledger. These are not two versions of one contract.
They are two products.

## Finding 4 — the Expert layer has no production caller in either form

| Entry point | Instantiated or called from |
|---|---|
| `new AnthropicExpertProvider(...)` | `scripts/` only, 10 occurrences, all probes and executors |
| `runExpertAnalysis(...)` | `scripts/` only |
| `mergeExpertIntelligence(...)` | `scripts/` and `src/.../fixtures/` only |

No service, controller, module or route under `src/` reaches the Expert layer. §244 reported that
the experiment posture contracts have no production caller. The broader fact is that **the Expert
HazLenz layer has no production caller at all**, in either the `src/` contract or the `scripts/lib/`
contract. There is no path to point at.

## Finding 5 — the protected composite is majority non-shippable

The 29-module protected composite (`scripts/verify-229-protected-identities.ts`) binds **21 modules
under `scripts/lib/` and 8 under `src/`.** The identity that defines the protected candidate is
therefore, by the repository's own build configuration, mostly code the product cannot contain.

## What closing Slice 1 would actually require

1. **A product decision on which contract is the product.** The `src/` contract and the §239
   contract are incompatible at the root of the wire schema. One must be retired. That is broad
   semantic redevelopment, which this authorization forbids.
2. **Promotion of ~42 modules and ~17,898 lines** from `scripts/lib/` into `src/`, subject to the
   `expert-hazlenz/` purity guard that forbids network primitives, endpoints, credentials and vendor
   names in that directory.
3. **Construction of a customer-path entry point that does not exist** — service, module and
   controller wiring from an inspection request through to `runExpertAnalysis` and the authority
   merge.
4. **Re-derivation of the protected composite identity**, because promotion changes 21 of 29 module
   paths. The §243 composite cannot survive the move, and must not be retrofitted.

Each of the four is larger than any slice in this authorization, and the first is explicitly
excluded by it.

## Disposition

**SCOPE EXCEEDED.** Slice 1 cannot be closed architecturally within the bounded authorization, and
the remaining slices inherit the question, because each of them modifies a contract whose status as
the product is undecided. Slice 5's candidate identity requires "proof that both resolve to the same
semantic implementation"; no such proof can be constructed, and the v2 freeze would correctly fail.

The decision required is not an engineering one. It is: **which Expert HazLenz contract is the
product, and is the programme funding its promotion into the shipped tree?**
