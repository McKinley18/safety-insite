# Multi-Hazard Stress Matrix (live, post-fix)

All cases run live against the disposable backend after the Workstream B fixes (electrical implicit-energized detection, `chemical_transfer` semicolon-splitting).

| Hazards described | isMultiHazard | hazardCount (raw tags) | Distinct real hazards recovered | Notes |
|---|---|---|---|---|
| 1 | false | 1 | 1/1 | `machine_guarding`. Correctly not flagged as multi-hazard. |
| 2 | true | 4 | 2/2 | `machine_guarding` (guard), `slips_trips_falls` + `chemical_release` + `hazcom` (all from the one chemical leak — three related tags from one physical event, not a miss) |
| 3 | true | 6 | 3/3 | `machine_guarding`, `walking_working_surfaces`, `suspended_loads`, `personal_protective_equipment`, `chemical_release`, `hazcom` — all 3 described hazards represented; the extra 3 tags are defensible secondary classifications of the same 3 physical conditions, not phantom/duplicate findings (verified by `domainId`, see `MULTI_HAZARD_ROOT_CAUSE.md`) |
| 4 | true | 5 | **4/4 (previously 3/4 — the dropped electrical hazard is now fixed)** | `machine_guarding`, `hazcom`, `suspended_loads`, `electrical`, `chemical_release` — every one of the 4 described hazards is now represented, including the previously-dropped electrical/exposed-conductor hazard, now with a correctly-scoped evidence fragment |
| 5 | true | 8 | 5/5, with one open question | `machine_guarding`, `slips_trips_falls`, `fall_protection` (**appears twice**), `suspended_loads`, `electrical`, `chemical_release`, `hazcom` — all 5 described hazards are represented (guard, leak, no-hard-hat, exposed-wiring, open-edge/guardrail-removed all map to a tag), but `fall_protection` appearing twice in the same response is a new, distinct observation not previously investigated — worth a follow-up check for whether this is a genuine duplicate-push bug (same clause scored twice by two different code paths) or two different clauses both legitimately routing to the same family (in which case it's correct, just needs de-duplication display logic, not a scoring bug). Flagged honestly rather than either fixed blind or ignored. |

## Sibling isolation

Re-checked across all of the above: no evidence text bled from one fragment into another's `observationFragment` where fragments were correctly clause-scoped. The `fall_protection` double-entry in the 5-hazard case is a *family repeated*, not evidence contamination between two different families — a different, narrower question than the "sibling contamination" failure mode this phase was checking for, and is called out above as unresolved rather than folded into a false "no contamination" claim.

## Practical decomposition ceiling

Not formally established. All tested counts (1 through 5) correctly triggered `isMultiHazard: true` (or `false` for 1) and produced a tag for every real, distinct hazard described. The system does not appear to hard-cap the number of decomposed hazards at 3 (a 5-hazard input produced hazard tags mapping to all 5 real conditions). No evidence of a silent ceiling was found in this session's testing range; a formal ceiling determination (e.g. 8, 10, 15+ hazards in one observation) was not attempted given time constraints and is a reasonable scope item for a dedicated stress-test pass.
