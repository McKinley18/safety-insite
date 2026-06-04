# SafeScope Field Realism Pack v2 Results

## Summary

| Metric | Value |
|---|---:|
| Total cases | 100 |
| Pass count | 100 |
| Fail count | 0 |

## Domain Distribution

| Domain | Count |
|---|---:|
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
| health_exposure | 3 |
| health_respiratory | 4 |
| machine_guarding | 8 |
| machine_guarding_loto | 5 |
| material_handling | 1 |
| mobile_equipment | 13 |
| ppe | 3 |
| roof_rib_control | 3 |
| slip_trip_fall | 3 |
| slips_trips_falls | 2 |
| tools_equipment | 3 |
| unknown | 14 |
| ventilation | 3 |
| welding_cutting_hot_work | 5 |

## Jurisdiction Distribution

| Jurisdiction | Count |
|---|---:|
| msha | 32 |
| osha_construction | 16 |
| osha_general_industry | 51 |
| unclear | 1 |

## Confidence / Risk Distribution

| Confidence / Risk | Count |
|---|---:|
| high | 68 |
| low | 1 |
| moderate | 31 |

## Failed or Weak Cases

No failed or weak cases identified.

## Case Results

| ID | Title | Domain | Jurisdiction | Confidence / Risk | Status | Failure reason |
|---|---|---|---|---|---|---|
| FIELD-V2-MSHA-GUARDING-VAGUE-001 | vague conveyor guarding observation | machine_guarding | msha | high | pass |  |
| FIELD-V2-MSHA-GUARDING-CLEANUP-LOTO-001 | cleanup around conveyor with guarding and LOTO ambiguity | machine_guarding | msha | high | pass |  |
| FIELD-V2-OSHA-LOTO-ACTIVE-001 | active LOTO exposure during maintenance | unknown | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-LOTO-TRAINING-ONLY-001 | LOTO mentioned only in training context | machine_guarding_loto | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-ELECTRICAL-WET-001 | wet floor near electrical equipment with uncertainty | electrical | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-FIRE-EXTINGUISHER-NO-HOTWORK-001 | blocked fire extinguisher without hot work | fire_protection | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-SILICA-NEGATED-001 | generic dirt dust should not become silica | health_respiratory | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-CONFINED-NO-ENTRY-001 | tank present but no entry | confined_space | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-CONFINED-ACTUAL-ENTRY-001 | tank entry with missing atmospheric evidence | confined_space | osha_general_industry | high | pass |  |
| FIELD-V2-MSHA-MOBILE-BACKING-001 | mobile equipment backing near pedestrian | mobile_equipment | msha | high | pass |  |
| FIELD-V2-OSHA-FORKLIFT-PEDESTRIAN-001 | forklift turning through shared pedestrian aisle | mobile_equipment | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-FORKLIFT-TRAINING-001 | forklift operator training documentation issue | mobile_equipment | osha_general_industry | moderate | pass |  |
| FIELD-V2-MSHA-BERM-EDGE-001 | haul truck near dump edge with unclear berm condition | mobile_equipment | msha | high | pass |  |
| FIELD-V2-OSHA-FALL-CLEAR-MISSING-001 | open-sided platform with no guardrail | fall_protection | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-LADDER-SETUP-001 | portable ladder set on uneven surface | slips_trips_falls | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-SCAFFOLD-GUARDRAIL-001 | scaffold platform missing midrail | fall_protection | osha_construction | high | pass |  |
| FIELD-V2-OSHA-HAZCOM-SDS-001 | secondary chemical bottle with missing SDS | hazardous_materials | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-CHEMICAL-SPILL-001 | unknown liquid leaking from container | hazardous_materials | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-SILICA-ACTIVE-CUTTING-001 | concrete cutting dust with missing controls | health_respiratory | osha_construction | high | pass |  |
| FIELD-V2-OSHA-HOTWORK-COMBUSTIBLES-001 | hot work near combustibles without fire watch documented | welding_cutting_hot_work | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-CYLINDER-OXY-FUEL-001 | oxygen and acetylene cylinders stored together | welding_cutting_hot_work | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-RIGGING-DEFECT-001 | damaged sling found before lift | cranes_rigging_hoisting | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-SUSPENDED-LOAD-001 | worker standing under suspended load | cranes_rigging_hoisting | osha_construction | high | pass |  |
| FIELD-V2-OSHA-EYEWASH-BLOCKED-001 | eyewash blocked near corrosive storage | hazardous_materials | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-HAND-PPE-001 | sharp metal handling without gloves | ppe | osha_general_industry | moderate | pass |  |
| FIELD-V2-MSHA-COAL-UG-RIB-001 | underground coal rib sloughing near travelway | roof_rib_control | msha | high | pass |  |
| FIELD-V2-MSHA-COAL-METHANE-001 | coal section methane reading uncertainty | ventilation | msha | high | pass |  |
| FIELD-V2-MSHA-MNM-UG-VENT-001 | underground metal nonmetal ventilation obstruction | ventilation | msha | high | pass |  |
| FIELD-V2-MSHA-ESCAPEWAY-BLOCKED-001 | underground escapeway partially blocked | emergency_preparedness | msha | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-TRENCH-001 | construction trench with unclear protective system | excavation_trenching | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-FALL-ROOF-001 | roof edge work with missing fall protection detail | ground_control | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-SCAFFOLD-ACCESS-001 | scaffold access ladder missing | fall_protection | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-DROPPED-OBJECT-001 | overhead work with unsecured tools | mobile_equipment | osha_construction | high | pass |  |
| FIELD-V2-OSHA-GI-NOISE-MISSING-DOSIMETRY-001 | high noise complaint without measurements | health_exposure | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-HEAT-STRESS-001 | hot warehouse work with missing exposure data | unknown | osha_general_industry | moderate | pass |  |
| FIELD-V2-MSHA-COLD-STRESS-001 | cold weather maintenance with missing duration | environmental_exposure | msha | moderate | pass |  |
| FIELD-V2-OSHA-GI-UNKNOWN-VAGUE-001 | vague unsafe condition note | hazardous_materials | osha_general_industry | moderate | pass |  |
| FIELD-V2-JURISDICTION-AMBIGUOUS-001 | ambiguous shop observation with no jurisdiction context | unknown | osha_general_industry | moderate | pass |  |
| FIELD-V2-MULTI-ELECTRICAL-WET-PEDESTRIAN-001 | wet floor, open panel, and pedestrian route | electrical | osha_general_industry | high | pass |  |
| FIELD-V2-FALSE-ELECTRICAL-PANEL-CLOSED-001 | closed electrical panel with housekeeping issue nearby | unknown | osha_general_industry | high | pass |  |
| FIELD-V2-FALSE-FALL-NO-EXPOSURE-001 | guarded mezzanine with no employee exposure | unknown | osha_general_industry | moderate | pass |  |
| FIELD-V2-MSHA-CONVEYOR-NO-EXPOSURE-001 | conveyor guarded and no employee exposure | machine_guarding | msha | moderate | pass |  |
| FIELD-V2-OSHA-PPE-EYE-NO-GRINDER-DEFECT-001 | eye protection missing but grinder condition not defective | ppe | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GRINDER-GUARD-NO-PPE-ISSUE-001 | grinder guard missing but PPE not the main issue | ppe | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-HAZCOM-UNKNOWN-DRUM-001 | unknown drum with partial label | hazardous_materials | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-HOTWORK-NEGATED-COMBUSTIBLES-001 | combustibles near heater with hot work negated | slip_trip_fall | osha_general_industry | moderate | pass |  |
| FIELD-V2-MSHA-MOBILE-NO-PEDESTRIAN-001 | parked loader with no pedestrian exposure | mobile_equipment | msha | moderate | pass |  |
| FIELD-V2-OSHA-EMERGENCY-EXIT-BLOCKED-001 | emergency exit route blocked by pallets | emergency_preparedness | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-MULTI-CHEM-FIRE-TRIP-001 | multi-hazard chemical storage with trip and fire concerns | machine_guarding_loto | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-MATERIAL-STORAGE-FALLING-001 | unstable material storage near employee walkway | material_handling | osha_general_industry | high | pass |  |
| FIELD-V2-MSHA-COAL-UG-BELT-SPILLAGE-001 | underground coal belt spillage near travelway | machine_guarding_loto | msha | high | pass |  |
| FIELD-V2-MSHA-COAL-UG-ROOF-BOLT-001 | loose roof bolt plate near coal travelway | roof_rib_control | msha | high | pass |  |
| FIELD-V2-MSHA-MNM-UG-GROUND-CONTROL-001 | metal nonmetal underground loose ground near heading | roof_rib_control | msha | high | pass |  |
| FIELD-V2-MSHA-MNM-UG-ELECTRICAL-CABLE-001 | damaged trailing cable with unclear energized status | tools_equipment | msha | high | pass |  |
| FIELD-V2-MSHA-SURFACE-HIGHWALL-001 | surface highwall loose material with unclear exclusion zone | mobile_equipment | msha | high | pass |  |
| FIELD-V2-MSHA-SURFACE-DUMP-BERM-001 | dump point berm appears low with truck exposure | mobile_equipment | msha | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-EXCAVATION-LADDER-001 | construction trench with missing ladder access detail | excavation_trenching | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-REBAR-IMPALEMENT-001 | uncapped vertical rebar near walking path | unknown | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-CRANE-SWING-RADIUS-001 | crane swing radius not clearly barricaded | cranes_rigging_hoisting | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-POWERLINE-CRANE-001 | crane operating near overhead power line | cranes_rigging_hoisting | osha_construction | high | pass |  |
| FIELD-V2-OSHA-GI-MACHINE-JAM-CLEARING-001 | machine jam clearing with unclear energy control | machine_guarding_loto | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-MACHINE-GUARD-REMOVED-NO-WORK-001 | machine guard removed but machine tagged out | tools_equipment | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-ELECTRICAL-PANEL-BLOCKED-001 | electrical panel access blocked by stored boxes | electrical | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-BATTERY-CHARGING-001 | forklift battery charging area with eyewash uncertainty | mobile_equipment | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-PRESSURE-HOSE-001 | compressed air hose damaged near workstation | tools_equipment | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-FALLING-OBJECT-NO-EXPOSURE-001 | stored material secured with no employee exposure | unknown | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-CHEMICAL-NO-LEAK-001 | closed labeled chemical containers with no leak | hazardous_materials | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-HOTWORK-PERMIT-OK-001 | hot work permit present with controls documented | welding_cutting_hot_work | osha_general_industry | moderate | pass |  |
| FIELD-V2-JURISDICTION-MINE-CONTRACTOR-001 | contractor shop near mine with jurisdiction uncertainty | unknown | msha | moderate | pass |  |
| FIELD-V2-JURISDICTION-CONSTRUCTION-PLANT-001 | construction work inside operating plant with jurisdiction uncertainty | fall_protection | msha | moderate | pass |  |
| FIELD-V2-MULTI-FORKLIFT-SPILL-ELECTRICAL-001 | forklift traffic, spill, and electrical panel access conflict | mobile_equipment | osha_general_industry | high | pass |  |
| FIELD-V2-MULTI-SCAFFOLD-HOTWORK-FALL-001 | scaffold hot work with fall and fire controls unclear | fall_protection | osha_construction | high | pass |  |
| FIELD-V2-MULTI-CONFINED-HOTWORK-ENTRY-001 | tank entry with hot work planned but not started | ventilation | osha_general_industry | high | pass |  |
| FIELD-V2-MSHA-MULTI-GUARDING-ELECTRICAL-WET-001 | mine plant guarding issue with wet electrical area nearby | electrical | msha | high | pass |  |
| FIELD-V2-JURISDICTION-MSHA-OSHA-MOBILE-SHOP-001 | mobile equipment repair shop with MSHA OSHA jurisdiction uncertainty | mobile_equipment | msha | moderate | pass |  |
| FIELD-V2-MSHA-COAL-UG-BELT-GUARD-NO-EXPOSURE-001 | underground coal belt guard removed but area barricaded | machine_guarding | msha | moderate | pass |  |
| FIELD-V2-MSHA-COAL-UG-SCOOP-BATTERY-001 | battery scoop charging with ventilation uncertainty | unknown | msha | high | pass |  |
| FIELD-V2-MSHA-COAL-UG-CABLE-HANGING-001 | coal mine cable hanging low near travelway | electrical | msha | high | pass |  |
| FIELD-V2-MSHA-MNM-UG-ORE-PASS-BARRICADE-001 | ore pass opening with unclear barricade condition | unknown | msha | high | pass |  |
| FIELD-V2-MSHA-MNM-UG-REFUGE-ROUTE-001 | refuge route sign missing with travelway open | slip_trip_fall | msha | high | pass |  |
| FIELD-V2-MSHA-SURFACE-CRUSHER-DUST-WATER-001 | crusher dust with water spray not confirmed | health_respiratory | msha | high | pass |  |
| FIELD-V2-MSHA-SURFACE-CONVEYOR-PULLCORD-001 | conveyor emergency stop pull cord slack | machine_guarding | msha | high | pass |  |
| FIELD-V2-MSHA-SURFACE-WELDING-CYLINDER-TRUCK-001 | welding cylinders in service truck with cap and securement uncertainty | welding_cutting_hot_work | msha | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-SILICA-HOUSEKEEPING-001 | construction dust cleanup with silica uncertainty | health_respiratory | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-LADDER-NO-EXPOSURE-001 | ladder stored damaged but not in use | slips_trips_falls | osha_construction | moderate | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-FORKLIFT-LOAD-VISIBILITY-001 | telehandler load blocks forward visibility | mobile_equipment | osha_construction | high | pass |  |
| FIELD-V2-OSHA-CONSTRUCTION-EXCAVATION-SPOIL-PILE-001 | excavation spoil pile near edge | excavation_trenching | osha_construction | high | pass |  |
| FIELD-V2-OSHA-GI-CONVEYOR-TRAINING-ONLY-001 | conveyor safety mentioned only in training records | machine_guarding | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-LOCKOUT-ENERGY-STORED-AIR-001 | stored air pressure during maintenance prep | machine_guarding | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-ROBOT-CELL-GATE-BYPASS-001 | robot cell gate bypass rumor without confirmation | unknown | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-ERGONOMICS-REPETITIVE-LIFT-001 | repetitive lifting complaint with missing weight data | unknown | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-RESPIRATOR-VOLUNTARY-USE-001 | voluntary respirator use with unclear exposure basis | slip_trip_fall | osha_general_industry | high | pass |  |
| FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 | discarded sharp found in restroom | health_exposure | osha_general_industry | moderate | pass |  |
| FIELD-V2-OSHA-GI-POWERED-DOOR-CRUSH-POINT-001 | powered overhead door crush point uncertainty | machine_guarding | osha_general_industry | high | pass |  |
| FIELD-V2-JURISDICTION-RAIL-SPUR-MINE-PLANT-001 | rail spur near mine plant with jurisdiction uncertainty | unknown | msha | moderate | pass |  |
| FIELD-V2-JURISDICTION-PUBLIC-ROAD-HAUL-TRUCK-001 | haul truck crossing public road with jurisdiction uncertainty | mobile_equipment | msha | moderate | pass |  |
| FIELD-V2-MULTI-NOISE-FORKLIFT-CO-001 | forklift area with noise and possible carbon monoxide concern | health_exposure | osha_general_industry | high | pass |  |
| FIELD-V2-MULTI-CHEMICAL-EYEWASH-NO-SPLASH-001 | corrosive storage with eyewash blocked but no spill | machine_guarding_loto | osha_general_industry | high | pass |  |
| FIELD-V2-MULTI-MINE-BLASTING-MAGAZINE-001 | mine explosives magazine housekeeping with security uncertainty | welding_cutting_hot_work | msha | high | pass |  |
| FIELD-V2-UNKNOWN-PHOTO-ONLY-001 | photo only unclear condition requiring evidence hold | unknown | unclear | low | pass |  |
