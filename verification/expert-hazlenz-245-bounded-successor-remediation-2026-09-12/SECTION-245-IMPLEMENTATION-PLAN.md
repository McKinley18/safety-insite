# §245 — Implementation Plan and Slice Disposition

Zero provider calls. Zero database operations. No production code modified. No commit.

## How this section proceeded

The authorization ordered five slices and required that Slice 1 determine the narrowest architecture
by which production and validation invoke the same contracts, and close the discrepancy rather than
document it. Slice 1 was therefore assessed first, from the source, before any code was written.

The assessment returned a result the authorization did not anticipate, and which §244 did not
establish because it did not look past the module list: production and acceptance are not two callers
of one contract. The evidence is in `SECTION-245-PRODUCTION-PATH-PARITY.md` and is summarised in the
report. Because every remaining slice modifies a contract whose standing as the product depends on
that result, no slice was implemented.

This was a stop-and-report event under the authorization's own scope-excess terminal. It was not a
decision to do less work than authorized; it is that the authorized work has a precondition the
product owner has not yet been asked to settle.

## Disposition by slice

| Slice | Subject | Disposition |
|---|---|---|
| 1 | production executable path | **SCOPE EXCEEDED** — no narrow architecture exists; requires a product decision |
| 2 | request envelope / strict schema | NOT IMPLEMENTED — root cause confirmed in source; parity has no counterparty |
| 3 | driver-role justification | NOT IMPLEMENTED — contract change to an undecided product |
| 4 | K6 representability | NOT IMPLEMENTED — representation specified and de-risked offline |
| 5 | decision-complete human review | NOT IMPLEMENTED — protected modules untouched |

## What was established, at zero spend

1. **The candidate has no production counterpart.** Its contract closure is 42 modules and 17,898
   lines under `scripts/lib/`, which `backend/tsconfig.json` deliberately excludes from the build.
2. **The shipped `src/` Expert is a different contract**, carrying none of the posture, driver-role
   or unresolved-declaration architecture the candidate is built on.
3. **The Expert layer has no customer-path caller in either form.**
4. **The strict-flag divergence is confirmed** at two call sites in the acceptance executor.
5. **The K6 union is feasible, but not as §244 specified it.** Strict mode rejects `oneOf` and
   accepts `anyOf` with `const`. Verified offline through the production adapter's own pipeline.
6. **A v2 candidate identity, applied to the current tree, fails at six of seventeen bound elements**
   — including three that no written declaration could reasonably accept.

Items 5 and 6 are net advances on §244 and survive whatever architecture is chosen.

## What was deliberately not done

No production module was modified. `property-authority.ts` and `settlement-review.ts` were read and
left untouched, notwithstanding that this section held explicit authorization to modify them; that
authorization is not spent and remains available to the successor section.

No replay was run. Replaying the 30 preserved §243 outputs measures what a changed deterministic path
would do with them, and no path was changed. Producing a replay result against an unchanged path
would report the §243 numbers under a new heading, which is the relabelling this authorization
forbids.

No protected regression suite was run as evidence. With no change in the tree there is nothing to
regress, and a green suite on an unmodified tree is not evidence about a remediation.

No hosted confirmation instrument was frozen. Freezing it is gated on local remediation passing.

## The decision required

**Which Expert HazLenz contract is the product?**

- **Option A — the §239 contract is the product.** Promote the 42 modules into `src/`, retire the
  divergent `expert-prompt.ts` contract, build the customer-path entry point, and re-derive the
  protected composite under candidate identity v2. This is the largest option and the only one that
  makes the §243 line of work shippable. It is broad semantic redevelopment and needs its own
  authorization and budget.
- **Option B — the `src/` contract is the product.** Then §233 through §243 are a research line, not a
  release candidate, and the acceptance apparatus should be re-scoped to measure what ships. The
  §243 decision stands and the remediation slices are not worth funding as written.
- **Option C — neither yet.** Fund only the customer-path entry point against whichever contract is
  chosen later, and suspend contract work until an Expert layer is actually reachable from a product
  request.

Engineering evidence cannot choose among these. Each implies a different meaning for "candidate",
"acceptance" and "release", which is why this returns to the product owner rather than proceeding
under an assumption.

## Recommended sequencing if Option A is taken

The slices remain correctly ordered and their content stands. Sequence the promotion first, then
Slice 2's envelope against a real production caller, then Slice 4's union (which needs Slice 2's
strict flag to be enforceable), then Slice 3's justification fields under the unchanged stopping
rule, then Slice 5's review artifact. Slice 3's stopping rule must not be weakened by the delay: it
remains one bounded attempt at a representational gap, not a predicted fix.
