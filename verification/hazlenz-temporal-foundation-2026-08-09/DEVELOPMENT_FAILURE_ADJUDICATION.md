# Development-corpus failure adjudication

The 49/60 scorer misses are not a homogeneous production regression. Eleven rows append the same historical guard note to otherwise current or ambiguous observations. The expected labels collapse a compound observation to one historical state, while canonical decomposition preserves the current sibling finding as ACTIVE. The first semantic divergence is therefore in corpus expectation/projection scoring, not loss of source narrative.

| Case | Expected | Canonical finding state | Adjudication |
|---|---|---|---|
| st-002 | HISTORICAL | machine_guarding ACTIVE | SCORER/ADJUDICATION WRONG: current press exposure is explicit; historical reported guard note is a separate clause. |
| st-006 | UNKNOWN | guarding HISTORICAL plus other historical candidates | PROJECTION/ASSOCIATION DEFECT: historical suffix bleeds into unrelated sibling summary; expected UNKNOWN remains defensible, but top-level HISTORICAL is not. |
| st-008 | HISTORICAL | fall_protection ACTIVE; guard note ACTIVE | SCORER/ADJUDICATION WRONG: current open roof edge and steel erection are explicit. |
| st-014 | HISTORICAL | machine_guarding ACTIVE | SCORER/ADJUDICATION WRONG: current unguarded conveyor exposure is explicit. |
| st-020 | HISTORICAL | machine_guarding ACTIVE | SCORER/ADJUDICATION WRONG: current reachable nip point is explicit; jurisdiction is unknown, not temporal state. |
| st-026 | HISTORICAL | fall_protection ACTIVE | SCORER/ADJUDICATION WRONG: bent ladder condition is current; use is uncertain. |
| st-032 | HISTORICAL | hazcom ACTIVE | SCORER/ADJUDICATION WRONG: current label/identity evidence is present; historical guard note is unrelated. |
| st-038 | HISTORICAL | electrical ACTIVE | SCORER/ADJUDICATION WRONG: energized open panel and current troubleshooting are explicit. |
| st-044 | HISTORICAL | mobile/powered-industrial ACTIVE | SCORER/ADJUDICATION WRONG: current forklift/pedestrian exposure is explicit. |
| st-050 | HISTORICAL | powered-industrial-trucks ACTIVE | SCORER/ADJUDICATION WRONG: current haul-truck/spotter exposure is explicit. |
| st-056 | HISTORICAL | fall_protection ACTIVE | SCORER/ADJUDICATION WRONG: current open trench and absent protective system are explicit. |

The only genuine implementation concern in this set is compound top-level summarization (`st-006`): a historical sibling must not overwrite a current primary finding. Finding-level state remains authoritative. No production change is justified solely to make the other ten rows match their collapsed labels.

