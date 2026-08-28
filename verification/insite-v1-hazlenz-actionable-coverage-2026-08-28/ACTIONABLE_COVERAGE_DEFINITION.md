# What "actionable" means here, and why it is not the same as "recognised"

Declared before any workflow output for the corpus rows was inspected.

## The distinction

`LEVEL1_RECOGNITION_RECALL` asks: does the deterministic engine's analysis name
this hazard anywhere the customer can see?

`ACTIONABLE_FINDING_COVERAGE` asks: can the customer *do something about it*?

They came apart because of one architectural fact, established by execution and
not by reading:

```
InspectionService.addAnalysis()
  -> reconcileDecompositionFindings(manager, observation, analysis)
       const decomposition = snapshot.multiHazardDecomposition
       const hazards = decomposition?.hazards ?? []
       if (hazards.length === 0) return          // <- no finding, silently
```

That is the only engine path that writes `inspection_findings`. Nothing in
`SafescopeV2Service.classify()` ever adds to `multiHazardDecomposition.hazards`;
the pipeline only filters it. The one other writer,
`createUserAuthoredFinding()`, is the inspector's own act and is stamped
`source = 'user_authored'`.

So a hazard named only by the primary classifier appears in the analysis header
and then stops. It has no finding, therefore no standard evaluation, no risk
snapshot, no corrective action, no review, no line in the report.

## The four elements

A required hazard group has actionable coverage when a materialised,
non-superseded finding on the customer's inspection represents it AND carries:

| element | field | why it matters |
|---|---|---|
| identity | `hazardCategory` / `sourceCandidate.domainId` / `hazardKey` | the customer knows *which* hazard this is |
| evidence | `conclusion` + `sourceCandidate.observationFragment` | the customer can see *why* it was identified, and defend it |
| risk | `riskSnapshot` | significance can be assigned and prioritised |
| action | `riskSnapshot.correctiveActionIntelligence` | there is a route to a correction |

## What deliberately does NOT count

* a family named only in `classification` / `family` / `hazardCategory` on the
  analysis;
* a family named only in classifier metadata or routing notes;
* a standards citation whose family matches. A citation answers "which rule
  governs the hazard the engine already named". Counting it as coverage would
  have scored B-10 as covered on the strength of a `29 CFR 1910.147` citation
  while no hazardous-energy hazard was represented at all.

## What deliberately DOES count

No artificial one-hazard-one-record rule is imposed. A group is satisfied by any
finding that represents it, and one finding satisfies at most one group. So:

* a finding that legitimately carries related hazards is not penalised;
* two independently actionable hazards still require two findings, because one
  emission cannot be spent twice.

## Standards are scored separately

Three states, because "no applicable standard" is a legitimate outcome:

* `HAZARD_PRESENT_STANDARD_APPLICABLE_AND_MATCHED`
* `HAZARD_PRESENT_NO_STANDARD_APPLICABLE`
* `HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING`

An unrelated citation appearing on the finding is never counted as a match: the
expected-standard map is keyed by family and authored from regulatory subject
matter.
