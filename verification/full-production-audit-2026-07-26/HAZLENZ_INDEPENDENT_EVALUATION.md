# HazLenz Independent Evaluation

## Method

The audit first inspected existing test/gauntlet/seed locations to avoid reuse. It then authored 102 new observations: 34 hazard families, each with a clear violation, safe/controlled condition, and insufficient/contradictory condition. Cases cover MSHA metal/nonmetal, OSHA General Industry, OSHA Construction, ambiguous jurisdiction, electrical, guarding, LOTO, mobile equipment, PITs, falls, scaffold, excavation, confined space, respiratory, silica, noise, HazCom, walking surfaces, fire, cylinders, PPE, rigging, cranes, conveyors, housekeeping, egress, hot work, storage, ergonomics, environmental-only observations, multi-hazard prioritization, and contradictions.

Each case records expected jurisdiction, hazard family, required/prohibited citation family, candidate/clarification behavior, missing evidence, control focus, risk direction, immediate-action expectation, actual response, and automated scoring. Expectations are an audit rubric, not a substitute for regulator or qualified-counsel review.

## Results

| Metric | Result |
|---|---:|
| Cases completed | 102/102 |
| HTTP/runtime success | 102/102 |
| Automated acceptable match | 67/102 (65.7%) |
| Exact match | Not defensibly computed: output category labels are not canonicalized to rubric taxonomy |
| Required citation-family satisfied | 86/102 |
| Prohibited citation-family promotions | 16 |
| Safe-state suppression failures | 8 |
| Clarification expectation failures | 56 |
| Critical false positives | 16 prohibited-family promotions (expert severity adjudication pending) |
| Critical false negatives | At least 18 clear-violation cases failed overall rubric; exact critical subset needs expert adjudication |
| Jurisdiction errors | Not reliably extractable because production output lacks one stable canonical jurisdiction field |
| Incorrect primary-standard count | Included within prohibited/missing family failures; exact legal adjudication pending |
| Unsupported-standard count | 16 automated prohibited-family hits |
| Missing-standard count | 16 cases did not satisfy a required family |
| Contradiction failures | All three contradiction-domain cases failed overall; two expected clarification cases require manual output review |
| Confidence-calibration failures | Not scored numerically without an expert-labeled probability dataset |
| Corrective-action mismatches | Actions were returned broadly, including many safe/uncertain cases; expert scoring pending |
| Risk-calibration failures | Not reduced to a count without consequence/likelihood expert labels |
| Identical-repeat nondeterminism | 0/10 selected cases |
| Paraphrase instability | 0/10 selected cases |
| Latency | 52 ms min, 86 ms mean, 468 ms max |

By variant:

- Clear violations: 16/34 acceptable.
- Safe/controlled: 26/34 acceptable.
- Insufficient/contradictory: 25/34 acceptable.

The worst domain was contradictory evidence (0/3 acceptable). Powered industrial trucks, silica, HazCom, rigging, and housekeeping each failed two of three.

## Paired-case finding

Every family contains paired facts that change applicability: exposed versus guarded, energized versus isolated, worker entry versus no entry, employee aisle exposure versus locked containment. HazLenz did react to many pairs, but eight safe controls still failed suppression and uncertain cases produced nine prohibited-family promotions. Therefore the system does not yet reliably make the legally important transition from “candidate” to “active citation” based on the changed fact.

## Repeatability and paraphrases

Ten selected cases were rerun twice and paraphrased once. The selected outputs were stable on classification/primary citation and deterministic on the recorded semantic fields. This is a strength, but the sample is small and deterministic incorrect output remains incorrect.

## Limitations

- The service included pre-existing uncommitted HazLenz changes.
- Local expert bypass was used in a separate process; no subscription data was changed.
- Automated scoring is citation-family level and intentionally conservative.
- The live corpus is only 19 standards rows; repository text may exist elsewhere but is not a complete runtime authority store.
- Full browser rendering and human workflow testing was partly blocked by browser tooling and broken repository checks.

