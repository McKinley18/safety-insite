# SafeScope Hazard Universe Coverage Map

This document maps the breadth of safety and health hazards that SafeScope is designed to reason about. It ensures that the engine's intelligence is grounded in physical and regulatory mechanics rather than memorized scenarios.

## Core Hazard Families

| Family | Subtypes | Hazardous Energy/Agent | Preferred Controls |
| :--- | :--- | :--- | :--- |
| **Machine Guarding** | Rotating parts, nip points | Mechanical rotation | Engineering enclosure, interlocks |
| **Lockout/Tagout** | Unexpected startup | Electrical, hydraulic, etc. | Physical energy isolation (locks) |
| **Electrical** | Energized parts, arc flash | Electrical | Enclosure, insulation, GFCI |
| **Fall Protection** | Open edges, floor holes | Gravity | Guardrails, passive protection |
| **Mobile Equipment** | Powered industrial trucks | Kinetic | Physical segregation, barriers |
| **HazCom** | Unlabeled chemicals, SDS gaps | Chemical agents | Substitution, ventilation, labeling |
| **Confined Space** | Permit required entry | Atmospheric, engulfment | Ventilation, monitoring, isolation |
| **Respiratory** | Silica dust, welding fumes | Airborne particulates | Wet methods, LEV, respirators |
| **Fire Prevention** | Hot work, welding | Thermal fire | Removal of combustibles, fire watch |
| **Noise** | High decibel areas | Noise | Engineering reduction, hearing protection |
| **Heat/Cold Stress** | Outdoor work, boilers | Thermal (ambient) | Rest, water, shade, acclimation |
| **Pressure** | Hydraulic/pneumatic leaks | Stored pressure | De-pressurization, shielding |

## Generalization Intelligence Principles

SafeScope uses these principles to reason about unseen observations:

1.  **Energy/Agent Identification:** Identify the specific source of potential harm (e.g., gravity, kinetic, chemical).
2.  **Exposure Path Analysis:** Determine how a person or environment interacts with that energy.
3.  **Control Hierarchy Application:** Prioritize engineering and isolation over administrative and PPE controls.
4.  **Evidence Sufficiency:** Flag when critical facts (e.g., voltage, height, gas levels) are missing.
5.  **Advisory Boundaries:** Maintain strict advisory limits, especially for health hazards requiring technical measurement.

## Human Review Triggers

SafeScope mandates qualified human review when:
- Multiple energy sources are present (Group LOTO).
- IDLH atmospheres are possible (Confined Space).
- Complex engineering calculations are required.
- Visual evidence contradicts narrative descriptions.
- Health exposure limits require professional hygiene assessment.
