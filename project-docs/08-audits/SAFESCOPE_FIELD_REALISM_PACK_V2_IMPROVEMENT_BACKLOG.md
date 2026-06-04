# SafeScope Field Realism Pack v2 Improvement Backlog

## Executive summary

SafeScope Field Realism Pack v2 now contains 100 messy, realistic safety observations and all cases pass the current validator. That is a strong benchmark result, but the result set still reveals improvement opportunities. The most important gaps are not validator failures; they are routing, taxonomy, jurisdiction-hold, and knowledge-depth opportunities that will make SafeScope more field-intelligent without weakening advisory-only guardrails.

## Current benchmark status

| Metric | Value |
| --- | --- |
| Total cases | 100 |
| Pass count | 100 |
| Fail count | 0 |
| Unknown-domain cases | 15 |
| Moderate/low confidence cases | 0 |

### Domain distribution

| Domain | Count |
| --- | --- |
| confined_space | 2 |
| cranes_rigging_hoisting | 4 |
| electrical | 5 |
| emergency_preparedness | 2 |
| environmental_exposure | 1 |
| excavation_trenching | 3 |
| fall_protection | 5 |
| fire_protection | 1 |
| ground_control | 1 |
| hazardous_materials | 6 |
| health_exposure | 2 |
| health_respiratory | 4 |
| machine_guarding | 7 |
| machine_guarding_loto | 6 |
| material_handling | 1 |
| mobile_equipment | 13 |
| ppe | 3 |
| roof_rib_control | 3 |
| slip_trip_fall | 3 |
| slips_trips_falls | 2 |
| tools_equipment | 3 |
| unknown | 15 |
| ventilation | 3 |
| welding_cutting_hot_work | 5 |

### Jurisdiction distribution

| Jurisdiction | Count |
| --- | --- |
| msha | 32 |
| osha_construction | 16 |
| osha_general_industry | 51 |
| unclear | 1 |

### Confidence / risk distribution

| Confidence / Risk | Count |
| --- | --- |
| unavailable | 100 |

## Unknown-domain cases

| ID | Title | Jurisdiction | Confidence / Risk | Recommended review |
| --- | --- | --- | --- | --- |
| FIELD-V2-OSHA-LOTO-ACTIVE-001 | active LOTO exposure during maintenance | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-OSHA-GI-HEAT-STRESS-001 | hot warehouse work with missing exposure data | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-JURISDICTION-AMBIGUOUS-001 | ambiguous shop observation with no jurisdiction context | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-FALSE-ELECTRICAL-PANEL-CLOSED-001 | closed electrical panel with housekeeping issue nearby | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-FALSE-FALL-NO-EXPOSURE-001 | guarded mezzanine with no employee exposure | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-OSHA-CONSTRUCTION-REBAR-IMPALEMENT-001 | uncapped vertical rebar near walking path | osha_construction | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-OSHA-GI-FALLING-OBJECT-NO-EXPOSURE-001 | stored material secured with no employee exposure | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-JURISDICTION-MINE-CONTRACTOR-001 | contractor shop near mine with jurisdiction uncertainty | msha | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-MSHA-COAL-UG-SCOOP-BATTERY-001 | battery scoop charging with ventilation uncertainty | msha | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-MSHA-MNM-UG-ORE-PASS-BARRICADE-001 | ore pass opening with unclear barricade condition | msha | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-OSHA-GI-ROBOT-CELL-GATE-BYPASS-001 | robot cell gate bypass rumor without confirmation | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-OSHA-GI-ERGONOMICS-REPETITIVE-LIFT-001 | repetitive lifting complaint with missing weight data | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 | discarded sharp found in restroom | osha_general_industry | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-JURISDICTION-RAIL-SPUR-MINE-PLANT-001 | rail spur near mine plant with jurisdiction uncertainty | msha | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |
| FIELD-V2-UNKNOWN-PHOTO-ONLY-001 | photo only unclear condition requiring evidence hold | unclear | unavailable | Add or refine domain, mechanism, evidence, and control mapping. |

## Moderate/low confidence cases

No moderate/low confidence cases identified.

## Surprising routing cases

| ID | Title | Current domain | Jurisdiction | Why this deserves review |
| --- | --- | --- | --- | --- |
| FIELD-V2-OSHA-CONSTRUCTION-DROPPED-OBJECT-001 | overhead work with unsecured tools | mobile_equipment | osha_construction | Routed to mobile_equipment even though the scenario is overhead work / falling-object control. |
| FIELD-V2-OSHA-CONSTRUCTION-FORKLIFT-LOAD-VISIBILITY-001 | telehandler load blocks forward visibility | machine_guarding_loto | osha_construction | Routed to machine_guarding_loto even though the scenario is construction mobile equipment visibility. |
| FIELD-V2-MULTI-CHEMICAL-EYEWASH-NO-SPLASH-001 | corrosive storage with eyewash blocked but no spill | machine_guarding_loto | osha_general_industry | Routed to machine_guarding_loto even though the scenario is corrosive storage / eyewash access. |
| FIELD-V2-MULTI-MINE-BLASTING-MAGAZINE-001 | mine explosives magazine housekeeping with security uncertainty | welding_cutting_hot_work | msha | Routed to welding_cutting_hot_work even though the scenario is explosives magazine housekeeping/security. |
| FIELD-V2-OSHA-GI-RESPIRATOR-VOLUNTARY-USE-001 | voluntary respirator use with unclear exposure basis | slip_trip_fall | osha_general_industry | Routed to slip_trip_fall even though the scenario is respiratory exposure / voluntary respirator use. |
| FIELD-V2-MSHA-COAL-UG-SCOOP-BATTERY-001 | battery scoop charging with ventilation uncertainty | unknown | msha | Routed to unknown; should likely become battery charging / ventilation / mobile equipment energy-control logic. |
| FIELD-V2-MSHA-MNM-UG-ORE-PASS-BARRICADE-001 | ore pass opening with unclear barricade condition | unknown | msha | Routed to unknown; should likely become fall/opening/barricade or ground-control logic. |
| FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 | discarded sharp found in restroom | unknown | osha_general_industry | Routed to unknown; should likely become bloodborne pathogens / sharps exposure logic. |

## Jurisdiction ambiguity review

The benchmark intentionally includes cases where MSHA/OSHA boundaries are unclear. Passing the validator means SafeScope preserved advisory-only behavior, but several cases still choose a likely jurisdiction. Future work should make the distinction clearer between likely jurisdiction and jurisdiction requiring confirmation.

| ID | Title | Current jurisdiction | Confidence / Risk | Review note |
| --- | --- | --- | --- | --- |
| FIELD-V2-JURISDICTION-AMBIGUOUS-001 | ambiguous shop observation with no jurisdiction context | osha_general_industry | unavailable | Consider stronger hold/confirm language before standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-MINE-CONTRACTOR-001 | contractor shop near mine with jurisdiction uncertainty | msha | unavailable | Consider stronger hold/confirm language before standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-CONSTRUCTION-PLANT-001 | construction work inside operating plant with jurisdiction uncertainty | msha | unavailable | Consider stronger hold/confirm language before standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-MSHA-OSHA-MOBILE-SHOP-001 | mobile equipment repair shop with MSHA OSHA jurisdiction uncertainty | msha | unavailable | Consider stronger hold/confirm language before standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-RAIL-SPUR-MINE-PLANT-001 | rail spur near mine plant with jurisdiction uncertainty | msha | unavailable | Consider stronger hold/confirm language before standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-PUBLIC-ROAD-HAUL-TRUCK-001 | haul truck crossing public road with jurisdiction uncertainty | msha | unavailable | Consider stronger hold/confirm language before standards or corrective-action specificity. |

## Knowledge/database expansion needs

| Area | Needed expansion |
| --- | --- |
| Bloodborne pathogens / sharps | Domain, mechanisms, evidence questions, controls, disposal and exposure-response logic. |
| Explosives magazine / blasting support | MSHA-specific records for magazine housekeeping, security, separation, signage, and storage conditions. |
| Ergonomics / repetitive material handling | Weight, frequency, posture, reach, duration, recovery, and redesign controls. |
| Respiratory exposure / voluntary respirator use | Differentiate exposure-driven respiratory protection from voluntary-use documentation and comfort use. |
| Jurisdiction ambiguity | Decision layer for mine property, contractor shop, public road, rail spur, and operating-plant construction overlap. |
| Openings / ore pass / barricades | Underground opening, barricade, fall/open-hole, and travelway controls. |
| Mobile equipment vs LOTO vs machine guarding | Disambiguation between struck-by vehicle movement, stored-energy maintenance, and fixed machinery guard exposure. |
| Taxonomy normalization | Unify slip_trip_fall and slips_trips_falls naming before analytics/reports depend on domain counts. |

## Recommended priority backlog

| Priority | Backlog item | Reason |
| --- | --- | --- |
| P1 | Add domain support for bloodborne/sharps exposures | FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 currently routes unknown. Add a sharps/bloodborne pathogens domain or subdomain with evidence questions for source, cleanup, exposure, PPE, disposal, and contaminated material handling. |
| P1 | Improve jurisdiction hold behavior | Several ambiguity cases pick MSHA or OSHA instead of holding as unclear. Add stronger jurisdiction uncertainty scoring for contractor shops, public road crossings, rail spur boundaries, and construction work inside operating plants. |
| P1 | Split mobile equipment from machine guarding/LOTO contamination | Some construction/mobile visibility and powered-door crush scenarios route into machine_guarding_loto or mobile_equipment too broadly. Add scenario disambiguation between vehicle struck-by, pinch/crush point, stored energy, and machine guarding. |
| P2 | Add explosives magazine/security housekeeping brain records | The blasting magazine scenario routes to welding_cutting_hot_work. Add MSHA explosives magazine records, mechanisms, controls, and evidence questions. |
| P2 | Add ergonomics/material-handling exposure logic | Repetitive lifting routes unknown. Add ergonomic risk, force, weight, frequency, posture, duration, and job redesign evidence logic. |
| P2 | Add ore pass/open-hole barricade logic | Ore pass barricade routes unknown. Add underground opening/barricade/fall hazard scenario records. |
| P2 | Strengthen respirator/health exposure disambiguation | Voluntary respirator use routes to slip_trip_fall. Add respiratory exposure vs voluntary PPE documentation logic. |
| P3 | Normalize slip_trip_fall and slips_trips_falls taxonomy | Both variants appear in results. Consolidate naming so analytics and reporting do not split the same family. |
| P3 | Improve no-exposure trap language | Passed no-exposure cases should remain advisory and verification-focused without implying violation or exposure. |

## Proposed next regression cases

These cases should remain locked as future regression anchors because they test the difference between passing a benchmark and producing field-trustworthy intelligence.

| Case ID | Title | Current domain | Current jurisdiction | Confidence / Risk |
| --- | --- | --- | --- | --- |
| FIELD-V2-JURISDICTION-AMBIGUOUS-001 | ambiguous shop observation with no jurisdiction context | unknown | osha_general_industry | unavailable |
| FIELD-V2-JURISDICTION-MSHA-OSHA-MOBILE-SHOP-001 | mobile equipment repair shop with MSHA OSHA jurisdiction uncertainty | mobile_equipment | msha | unavailable |
| FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 | discarded sharp found in restroom | unknown | osha_general_industry | unavailable |
| FIELD-V2-MULTI-MINE-BLASTING-MAGAZINE-001 | mine explosives magazine housekeeping with security uncertainty | welding_cutting_hot_work | msha | unavailable |
| FIELD-V2-MULTI-CHEMICAL-EYEWASH-NO-SPLASH-001 | corrosive storage with eyewash blocked but no spill | machine_guarding_loto | osha_general_industry | unavailable |
| FIELD-V2-OSHA-GI-RESPIRATOR-VOLUNTARY-USE-001 | voluntary respirator use with unclear exposure basis | slip_trip_fall | osha_general_industry | unavailable |
| FIELD-V2-OSHA-CONSTRUCTION-FORKLIFT-LOAD-VISIBILITY-001 | telehandler load blocks forward visibility | machine_guarding_loto | osha_construction | unavailable |
| FIELD-V2-MSHA-MNM-UG-ORE-PASS-BARRICADE-001 | ore pass opening with unclear barricade condition | unknown | msha | unavailable |
| FIELD-V2-MSHA-COAL-UG-SCOOP-BATTERY-001 | battery scoop charging with ventilation uncertainty | unknown | msha | unavailable |
| FIELD-V2-UNKNOWN-PHOTO-ONLY-001 | photo only unclear condition requiring evidence hold | unknown | unclear | unavailable |

## Do-not-change guardrails

- Do not weaken advisory-only language.
- Do not declare violations from benchmark observations.
- Do not invent standards when exposure, jurisdiction, task, or equipment state is incomplete.
- Do not remove missing-evidence or qualified-review requirements just to increase confidence.
- Do not loosen false-positive traps by scanning less of the final generated decision fields unless the validator is clearly checking registry metadata instead of generated output.
- Do not make broad domain routing look better by forcing every uncertain case into a specific domain.
- Preserve human review for jurisdiction ambiguity and incomplete evidence cases.
