# F–J — HazLenz autonomy / clarification audit (live endpoint)

| Case | Context | Finding(s) | Standard | Questions (id → class, engine flag) | Verdict |
|---|---|---|---|---|---|
| A-clear-loto | osha-general-industry | lockout_tagout (ACTIVE) | 1910.147 SUPPORTED | none | useful analysis, no clarification |
| A-clear-guard | osha-general-industry | machine_guarding (ACTIVE) | 1910.212(a)(1) SUPPORTED | none | useful analysis, no clarification |
| A-clear-fall-con | osha-construction | fall_protection (ACTIVE) | 1926.501 SUPPORTED | none | useful analysis, no clarification |
| A-clear-elec | osha-general-industry | electrical (ACTIVE) | 1910.303 SUPPORTED | none | useful analysis, no clarification |
| A-clear-silica | osha-construction | silica_respirable_dust (ACTIVE) | 1926.1153 SUPPORTED | none | useful analysis, no clarification |
| A-clear-exit | osha-general-industry | emergency_egress (ACTIVE) | 1910.36 SUPPORTED | none | useful analysis, no clarification |
| A-clear-hazcom | osha-general-industry | hazcom (ACTIVE) | 1910.1200 SUPPORTED | none | useful analysis, no clarification |
| A-clear-trench | osha-construction | excavation_trenching (ACTIVE) | 1926.652(a)(1) SUPPORTED | none | useful analysis, no clarification |
| A-clear-msha-guard | msha | machine_guarding (ACTIVE) | 56.14107(a) SUPPORTED | none | useful analysis, no clarification |
| A-clear-noise | osha-general-industry | noise_exposure (ACTIVE) | 1910.95 SUPPORTED | none | useful analysis, no clarification |
| A-clear-msha-loto-inferred | unknown | lockout_tagout (ACTIVE) | 56.12016 SUPPORTED | none | useful analysis, no clarification |
| A-clear-multi | osha-general-industry | electrical (ACTIVE); slips_trips_falls (ACTIVE); lockout_tagout (ACTIVE) | 1910.303 SUPPORTED, 1910.147 SUPPORTED | none | useful analysis, no clarification |
| B-amb-maint | osha-general-industry | none | 1910.147 UNKNOWN | predicate-29-cfr-1910-147-hazardous-energy-present-or-capable → DECISION_CRITICAL<br>predicate-29-cfr-1910-147-energy-not-isolated-and-locked → DECISION_CRITICAL | correctly asks / says insufficient |
| B-amb-trench | osha-construction | excavation_trenching (ACTIVE) | 1926.652(a)(1) UNKNOWN | predicate-29-cfr-1926-652-a-1--worker-cave-in-exposure → DECISION_CRITICAL<br>predicate-29-cfr-1926-652-a-1--protective-system-absent → DECISION_CRITICAL | correctly asks / says insufficient |
| B-amb-cord | osha-general-industry | electrical (ACTIVE) | none | electrical-damage-exposure → CONFIDENCE_IMPROVING [engine: blocksFinalization] | correctly asks / says insufficient |
| B-amb-loud | osha-general-industry | none | none | evidence-sufficiency-insufficient → DECISION_CRITICAL | correctly asks / says insufficient |
| B-amb-guard | osha-general-industry | machine_guarding (ACTIVE) | none | machine-energy-state → CONFIDENCE_IMPROVING [engine: blocksFinalization]<br>machine-task → CONFIDENCE_IMPROVING<br>machine-controls → CONFIDENCE_IMPROVING [engine: blocksFinalization] | correctly asks / says insufficient |
| B-amb-jur | unknown | fall_protection (ACTIVE) | 56.15005 UNKNOWN, 1910.28 UNKNOWN, 1926.501 UNKNOWN | jurisdiction → DECISION_CRITICAL | correctly asks / says insufficient |
| B-amb-crane | osha-construction | cranes_hoists (ACTIVE); suspended_loads (ACTIVE) | 1926.1425 UNKNOWN | predicate-29-cfr-1926-1425-permitted-task-exception-absent → CONFIDENCE_IMPROVING | correctly asks / says insufficient |

## Burden metrics

```json
{
 "observations": 19,
 "findings": 20,
 "questions_total": 11,
 "engine_flagged_blocking": 3,
 "optional": 8,
 "DECISION_CRITICAL": 6,
 "CONFIDENCE_IMPROVING": 5,
 "NONESSENTIAL": 0,
 "REDUNDANT": 0,
 "REPEATED_CONTEXT": 0,
 "clear_total": 12,
 "clear_without_clarification": 12,
 "clear_pct": 100.0,
 "ambiguous_total": 7,
 "ambiguous_correctly_asking": 7
}
```
