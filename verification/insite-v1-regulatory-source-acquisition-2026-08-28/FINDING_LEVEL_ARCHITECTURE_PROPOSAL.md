# Routing customer finding citations through the governed standards authority

**Proposal for the next phase. Nothing here was implemented; `evidence-foundation.ts` is
unmodified and no replacement library was created.**

## The target path

```
customer finding
  → deterministic hazard (multiHazardDecomposition.hazards)
  → selected jurisdiction/context (inspection.regulatoryContext, USER_CONFIRMED or inferred)
  → governed standards authority (72 records, version-controlled, deterministically materialized)
  → applicability / matching (evidence predicates decide WHICH governed record applies)
  → validated citation + provenance (sourceUrl, retrievalDate, review state, approval digest)
  → finding persistence (sourceCandidate.standardCandidates)
  → report
```

The corpus half of that path now exists and is proven to materialize deterministically. What does
not exist is the join between the hazard family plus jurisdiction and the governed record.

## What should happen to `evidence-foundation.ts`

Its 30 citations are not the valuable part — the corpus has 72 now. **Its applicability predicates
are the valuable part**, and they should be retained, not retired:

| asset | disposition | why |
|---|---|---|
| the applicability predicates (`servicing`, `energyCapable`, `jurisdictionUnknown` gates, contradiction handling, the honest `UNKNOWN` jurisdiction predicate) | **RETAIN as applicability evidence** | These encode the reasoning that decides whether a rule applies to *this* observation. They are the part no corpus can supply, and the KG-3F work that made them jurisdiction-honest is exactly what the governed path needs. |
| the hard-coded citation strings | **CONVERT to governed mapping metadata** | A predicate should resolve to a governed record by family + jurisdiction, not carry a citation literal. Three citations it emits today (`1926.1425`, `56.12025`, `56.15005`) had no governed record at all until this phase — two are now governed and `56.12025` remains an orphan to reconcile. |
| the decision/status model (`SUPPORTED`, `NOT_SUPPORTED`, `CONTRADICTED`, `UNKNOWN`, `NOT_APPLICABLE`) and `missingPredicates` | **RETAIN and reuse verbatim** | It already produces the honest "candidate, not assertion" semantics the backing contract expects, and the finding UI already renders it. |
| the module as a deterministic fallback | **RETAIN until parity is measured** | If the governed join is unavailable — corpus unloaded, release not activated — the finding must not silently lose its citation. Retire only after a measured parity run shows the governed path reproduces or improves on every citation this module emits today. |
| explanation text | **RETAIN** | `explanation` and `missingPredicates` are what let the customer see *why* a standard was selected, which the target path lists as a required customer-visible step. |

**Do not delete it, and do not build a second library beside it.** The migration is: predicates
stay, citation literals become lookups.

## The join, concretely

1. **Key the governed corpus by (hazard family, jurisdiction).** The records already carry
   `hazardFamilies` and `scope`; the coverage matrix in
   `backend/src/safescope-v2/tests/hazlenz-regulatory-coverage-matrix.ts` is the authored, reviewed
   statement of which provision governs which family in which regime, and it is already gate-tested
   against the governed set.
2. **Resolve the jurisdiction once per observation**, exactly as `applyFindingScopedStandards()`
   already does — the inspection's `regulatoryContext` first, with provenance preserved so an
   inferred regime stays labelled `HAZLENZ_INFERRED`.
3. **Run the existing predicates** to decide whether the family's provision applies to this
   finding's evidence, and carry `missingPredicates` forward when it does not.
4. **Attach the governed record's provenance**, not just its citation: `sourceUrl`,
   `retrievalDate`, review state and approval digest, so `resolveStandardsBacking()` can return
   `APPROVED_GOVERNED_CONTENT` the moment reviewer approval exists — and `UNAPPROVED_CONTENT`
   honestly until then.
5. **Measure parity before retiring anything**: every citation `evidence-foundation.ts` emits today
   for the frozen 56-row corpus must still be emitted, or its removal must be justified case by
   case.

## What this predicts, measured against today's numbers

The bounded real-workflow result was **16 matched / 1 no-standard-applicable / 26 expected-but-missing**.
All 26 missing groups belong to families that now have governed records in all applicable regimes.
The join is therefore expected to convert most of them — but the honest expectation is *not* 43/43:

* families whose applicability genuinely requires context the observation may not carry
  (silica exposure assessment, noise dose, respiratory necessity) should resolve to
  `needs_more_evidence` candidates with a clarification question, not to asserted citations;
* pinning a jurisdiction correctly *reduces* matches, as the previous phase measured (16 → 13 → 7);
* `NO_STANDARD_APPLICABLE` is a correct answer for 5 of the 72 matrix cells and must stay one.

**The success criterion for the next phase is not a coverage percentage.** It is that every citation
a customer sees is one the governed authority actually holds, for the jurisdiction their inspection
declared, with provenance they can check — and that `wrong-jurisdiction` and `wrong-standard` both
stay at zero, where this phase and the last one measured them.
