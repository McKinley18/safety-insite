# Component isolation matrix

| Component | Status | Evidence and boundary |
|---|---|---|
| Input/evidence normalization | VERIFIED_WITH_LIMITATIONS | Production-path and evidence-boundary regressions pass; field-language coverage remains limited. |
| Observation parsing/classification | VERIFIED_WITH_LIMITATIONS | Frozen and adjudicated family recall pass; 60-scenario audit found family confusion in incomplete/ambiguous notes. |
| Multi-hazard decomposition | VERIFIED_WITH_LIMITATIONS | State-aware regressions pass; action and display association require further proof. |
| Mechanism reasoning | NOT_SUFFICIENTLY_VALIDATED | Rich fields exist, but many narratives use generic `unknown` pathways. |
| Temporal/state reconciliation | VERIFIED_WITH_LIMITATIONS | State safety metrics pass; solvent historical/current distinction remains limited. |
| Clarification generation | VERIFIED_WITH_LIMITATIONS | Recall is 100%; necessity and partial-answer usefulness need qualified review. |
| Standard applicability/citation | VERIFIED_WITH_LIMITATIONS | Protected tests pass; applicability depth and authority coverage are incomplete. |
| Corrective-action generation | ACTIVE_INVESTIGATION | 37/60 engineering action outputs classified WEAK; cross-family leakage is present. |
| Response composition | VERIFIED_WITH_LIMITATIONS | Placeholder regression passes; substantive quality is not yet professionally validated. |
| Controller/projection | VERIFIED_WITH_LIMITATIONS | API fields are preserved; Chromium proof pending/partial. |
| Persistence/review/authorization/reports | VERIFIED_STABLE | Prior lifecycle, authorization, report immutability and concurrency artifacts remain valid; untouched this iteration. |
| Frontend rendering | ACTIVE_INVESTIGATION | Real browser audit required to establish visibility of enriched fields. |
