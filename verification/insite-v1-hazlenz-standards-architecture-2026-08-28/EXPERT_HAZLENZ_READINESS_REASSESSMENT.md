# Expert HazLenz readiness — reassessment after standards architecture closure

`ARCHITECTURE ONLY. NO PROVIDER CALL WAS IMPLEMENTED OR MADE IN THIS PHASE.`

```
EXPERT_HAZLENZ_IMPLEMENTED        = FALSE
PROVIDER_CALL_IMPLEMENTED         = FALSE
PROVIDER_CALLS_MADE               = 0
AUTHORIZATION_REQUIRED_TO_PROCEED = TRUE
```

## 1. Blocker status

| # | blocker | status |
|---|---|---|
| 1 | Provider authority governance | **OPEN.** Policy decision; belongs to the account owner. |
| 2 | Attribution schema | **OPEN.** Not designed; no migration exists. |
| 3 | Fallback proof | **OPEN.** No test yet shows a provider timeout yields byte-identical Level-1 output. |
| 4 | Level-1 invariance harness | **OPEN**, and its target grew again: five gates now exist (`test:hazlenz-precision`, `test:hazlenz-level1-recall`, `test:hazlenz-actionable-coverage`, `test:hazlenz-standards-jurisdiction`, `verify:hazlenz-actionable-workflow`). The invariance assertion itself is still unwritten. |
| 5 | Cost, latency and offline behaviour | **OPEN.** Product decision. |
| 6 | Credentials and provider selection | **OPEN.** No provider configured. |
| 7 | Deterministic hazard floor | **RESOLVED** for recognition (43/43) and actionable coverage (43/43). |

**Six of seven remain open. Implementation is not authorised.**

## 2. The new constraint this phase adds

The deterministic **hazard** floor is complete on the bounded evidence. The
deterministic **regulatory** floor is not: 26 of 43 required hazard groups receive
no standard, and nine hazard families have no applicable rule at all.

That asymmetry is the single most dangerous invitation in this programme, because
an LLM will happily produce a plausible citation for every one of those nine
families. So:

1. **Expert HazLenz must never be the regulatory source of truth.** A citation that
   originates with a provider and is shown to a customer as applicable is an
   unreviewed regulatory claim wearing the product's authority.
2. **Every Expert-proposed standard must be validated against the governed
   deterministic authority before display.** A proposal that resolves to no governed
   record is a suggestion for a human reviewer, never a citation.
3. **The standards gap must not be closed by pointing Expert at it.** It is
   deterministic work: either authoritative source material enters the governed set
   through the existing release mechanism, or the family stays honestly uncited.
4. **Provider failure must leave both floors intact** — the hazard floor and whatever
   regulatory floor exists at that time.
5. **The jurisdiction gate is now part of the Expert invariance harness.** With Expert
   enabled, the measured result must remain **0 wrong-jurisdiction citations**. An
   Expert layer that cites 29 CFR to a mine operator is worse than one that cites
   nothing.

## 3. What would actually close the standards gap

Not an Expert layer. In order:

1. **Route finding-level citations through the governed corpus** instead of the
   parallel code-resident rule set. Three families (confined space, PPE, powered
   industrial trucks) would gain correct citations immediately, from records the
   repository already holds and has reviewed.
2. **Add the missing families' source material** to the governed set through
   `npm run release -- prepare`, with provenance, effective date and reviewer
   approval — nine families, listed in `STATUS.md` §8.
3. **Obtain reviewer approval for the 35 existing records.** All 35 are
   `mechanically_validated` and **0** are `reviewer_approved`, so today no record can
   present as `APPROVED_GOVERNED_CONTENT` under the backing contract.
4. **Decide the unknown-jurisdiction contract** and fix
   `ApplicableStandardsService`'s score threshold accordingly, with
   production-corpus evidence.
