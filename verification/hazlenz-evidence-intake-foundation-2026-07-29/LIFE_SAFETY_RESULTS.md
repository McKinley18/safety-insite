# Life-safety results

## Outcome

The final production-path rerun had zero life-safety failures in both datasets:

- Original corpus: 165 cases; 120 PASS, 45 NEEDS REVIEW, 0 FAIL; 0 life-safety misses.
- Independent holdout: 80 cases; 67 PASS, 13 NEEDS REVIEW, 0 FAIL; 0 life-safety misses.

The eight original critical misses were eliminated by evidence-family predicates, not scenario-ID matching. The implemented families cover material operating/energy state, employee exposure, protective state, jurisdiction, work activity, and threshold facts for guarding, hazardous energy, electrical, ground control, backup alarms, falls, excavation, crane fall zones/power lines, scaffolds, silica, noise, egress, and HazCom labeling.

## Safety rule

A standard is definitive only when its material predicates are supported. Unknown predicates retain a candidate and targeted question. Contradicted predicates suppress definitive promotion. Unresolved material fact contradictions downgrade an otherwise supported decision to UNKNOWN.

## Residual limitation

Forty-five original and thirteen holdout cases remain NEEDS REVIEW. These are advisory outcomes rather than unsafe assertions, but the qualified reviewer remains a required release control. The offline authoritative standards pack is not yet complete for every predicate family.
