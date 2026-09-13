# SafeScope Reasoning Tuning: Phase 3B Scenario Tuning

## Summary
Improved scenarioFamily routing by reordering the scenario family registry and adding broader task/equipment indicators to specific guarding scenarios.

## Metrics
- hazardFamily exact_match: 185/200 (Stable)
- scenarioFamily exact_match: 50/200 (Improved from 0/200)
- mechanism exact_match: 28/200 (Stable)
- jurisdiction exact_match: 200/200 (Preserved)

## Observations
- Reordering and expanding task/equipment indicators successfully improved scenarioFamily routing.
- High-impact mismatch pairs (e.g., conveyor_cleanup vs rotating_shaft_guarding) show improvement.

## Recommended Next Tasks
1. Further refine scenarioFamily matching rules to reduce top-level mismatches.
2. Tune mechanism mapping to reduce mismatches in generic guarding categories.
