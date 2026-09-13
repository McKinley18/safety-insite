# SafeScope Hazard Universe Coverage

## Summary

- Hazard universe records evaluated: 22
- Average coverage score: 95.45
- Covered: 18
- Partial: 4
- Thin: 0
- Gap: 0

## Coverage by Priority

| Priority | Records | Average Score | Thin/Gap Count |
|---|---:|---:|---:|
| core | 13 | 100.0 | 0 |
| high | 6 | 83.3 | 0 |
| medium | 3 | 100.0 | 0 |

## Hazard Universe Detail

| Hazard | Domain | Priority | Score | Band | Gaps |
|---|---|---|---:|---|---|
| Welding, cutting, hot work, fire watch, combustible exposure | welding_cutting_hot_work | high | 75 | partial | missing mechanism coverage |
| Fire protection, extinguishers, alarms, emergency equipment | fire_protection | high | 75 | partial | missing mechanism coverage |
| PPE deficiencies and exposure-specific protective equipment | ppe | high | 75 | partial | missing mechanism coverage |
| Hand tools and power tools | tools_equipment | high | 75 | partial | missing mechanism coverage |
| Machine guarding - rotating equipment and nip points | machine_guarding | core | 100 | covered | none |
| Lockout/tagout and hazardous energy control | machine_guarding_loto | core | 100 | covered | none |
| Fall protection - elevated work, leading edges, platforms, scaffolds | fall_protection | core | 100 | covered | none |
| Mobile equipment, powered haulage, pedestrian interface, traffic control | mobile_equipment | core | 100 | covered | none |
| Electrical shock, exposed conductors, damaged cables, arc flash | electrical | core | 100 | covered | none |
| Slips, trips, housekeeping, travelways, walking-working surfaces | slip_trip_fall | core | 100 | covered | none |
| Ground control, roof control, rib control, highwall and loose material | roof_rib_control | core | 100 | covered | none |
| Ventilation, methane, oxygen deficiency, air quality controls | ventilation | core | 100 | covered | none |
| Emergency preparedness, escapeways, blocked egress, emergency routes | emergency_preparedness | core | 100 | covered | none |
| Respirable dust, silica, airborne contaminants, respiratory exposure | health_respiratory | core | 100 | covered | none |
| Hazard communication, chemical labeling, SDS, chemical exposure | hazardous_materials | core | 100 | covered | none |
| Confined space entry, atmospheric testing, attendant, rescue | confined_space | core | 100 | covered | none |
| Excavation and trenching collapse, protective systems, access/egress | trenching_and_excavation | core | 100 | covered | none |
| Cranes, rigging, hoisting, suspended loads | cranes_rigging_hoisting | high | 100 | covered | none |
| Material handling, storage, stacking, falling objects | material_handling | high | 100 | covered | none |
| Ergonomics, manual lifting, awkward posture, repetitive motion | ergonomics | medium | 100 | covered | none |
| Heat stress, cold stress, environmental exposure | environmental_exposure | medium | 100 | covered | none |
| Noise exposure and hearing conservation | health_exposure | medium | 100 | covered | none |

## Interpretation

- This matrix is broader than the 25-case benchmark.
- A covered row means SafeScope has some regulatory, mechanism, control, evidence, and scenario representation.
- A partial/thin/gap row identifies where expansion should happen before claiming full hazard coverage.
- This is the roadmap for expanding SafeScope from benchmark AI behavior toward broad safety-intelligence coverage.
