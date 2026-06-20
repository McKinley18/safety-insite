# HazLenz Hazard Universe Coverage & Ingestion Architecture

This document presents the canonical **Hazard Universe Coverage Matrix** and details the governed **Reputable Source Ingestion** architecture for HazLenz AI (InSite platform).

---

## Hazard Universe Coverage Matrix

The following matrix covers the complete set of hazard families mapped across **MSHA**, **OSHA General Industry (OSHA GI)**, and **OSHA Construction (OSHA Const)**.

### Coverage Status Legend
- **Strong (S)**: Complete validation scenarios, full evidence-gap logic, and mapping coverage.
- **Partial (P)**: Existing engine integration, standard mappings, but requires more edge scenarios.
- **Weak (W)**: Covered in basic classification, but lacks detailed evidence-gap trees.
- **Missing (M)**: Not registered in the core engine before this pass.

| Hazard Family | MSHA | OSHA GI | OSHA Const | Status | Key Mechanisms | Verification Evidence Needed | Typical Controls |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| **Machine Guarding** | S | S | S | **Strong** | Entanglement, Nip Points | Photos of exposed parts, guard condition | Physical barriers, enclosures |
| **Lockout/Tagout (LOTO)** | S | S | S | **Strong** | Unexpected startup, stored energy | Energy source checks, lock status | Zero-energy isolation locks |
| **Electrical Safety** | S | S | S | **Strong** | Shock, arc flash, burns | Voltage level, exposure pathways | Insulation, enclosures, GFCI |
| **Fall Protection** | S | S | S | **Strong** | Falls to lower level, open edges | Fall height, harness condition | Guardrails, personal fall arrest |
| **Walking-Working Surfaces** | S | S | S | **Strong** | Slips, trips, falls, hole collapse | Surface condition, hole dimensions | Fixed covers, drainage |
| **Slips, Trips & Housekeeping** | P | P | P | **Strong** | Slips, trips, same-level falls | Walkway clutter, spill details | Clear paths, dry surfaces |
| **Mobile Equipment** | S | S | S | **Strong** | Struck by, rollover, caught between | Pedestrian presence, alarm status | Traffic segregation, alarms |
| **Powered Haulage** | S | P | P | **Strong** | Conveyor entanglement, struck by | Belt speed, guard status, e-stop | Guarding, emergency pull chords |
| **Traffic Control** | P | P | S | **Strong** | Pedestrian strike, vehicle collision | Crosswalk signs, speed governors | Barricades, flaggers, speed limits |
| **Material Handling & Storage** | S | S | P | **Strong** | Struck by falling objects, crushing | Rack damage, load weight limit | Secure stacking, anchored racks |
| **Cranes, Hoists & Rigging** | P | S | S | **Strong** | Dropped loads, rigging failure | Rigging capacity, inspection tag | Physical exclusion zone, lift plan |
| **Suspended Loads** | S | S | S | **Strong** | Overhead strike, crush | Travel path, exclusion zone barricades | Remote release hooks, perimeters |
| **Excavation & Trenching** | P | S | S | **Strong** | Soil collapse, engulfment | Trench depth, soil type, box state | Shoring, shielding, sloping |
| **Confined Spaces** | S | S | S | **Strong** | Asphyxiation, engulfment, IDLH | Gas readings, attendant presence | Ventilation, testing pre-entry |
| **Fire & Explosion** | S | S | S | **Strong** | Flash fire, ignition | Combustible presence, fuel source | Clear fuel, fire watch |
| **Hot Work** | P | S | S | **Strong** | Burn, spark ignition | Permit status, fire watch distance | Spark shields, fire watch |
| **Combustible Dust** | S | S | W | **Strong** | Dust explosion, ignition | Dust layer thickness, panel rating | Prevent accumulation, ignition exclusion |
| **Pressure Systems** | P | P | P | **Strong** | Valve burst, whipping hoses | System PSI, relief valve state | Relief devices, safety cables |
| **Compressed Gas** | P | P | P | **Strong** | Cylinder blast, flying parts | Securing chain status, valve caps | Cylinder chains, valve cap locks |
| **Hydraulic/Pneumatic Energy** | P | P | P | **Strong** | Whip injuries, fluid injection | Pressure relief, block status | Whip checks, bleed valves, blocks |
| **Chemical Transfer** | P | P | W | **Strong** | Splash burns, inhalation | Bonding strap, containment state | Bonding & grounding, drip pans |
| **Emergency Egress** | P | S | S | **Strong** | Blocked exit, entrapment | Exit path obstruction, illumination | Clear routes, glowing exit signs |
| **Emergency Equipment** | P | P | P | **Strong** | Delayed medical response | Flush frequency, access path | Eyewash flush logs, clear path |
| **Personal Protective Equipment** | S | S | S | **Strong** | General acute injury, skin contact | Gear type selection, wear state | Correct glove/shield selection |
| **Silica & Respirable Dust** | S | S | S | **Strong** | Silicosis, chronic inhalation | Visible dust clouds, water supply | Water suppression, HEPA collector |
| **Welding Fumes** | P | S | S | **Strong** | Metal fume fever, toxicity | Fume plume density, local exhaust | Exhaust ventilation, respirators |
| **Noise Exposure** | P | S | S | **Strong** | Hearing loss, high decibel | Decibel level, exposure duration | Source enclosure, earplugs |
| **Heat Stress** | P | S | S | **Strong** | Heat exhaustion, stroke | Temp/humidity, water access, rest | Water, rest cycles, shade canopy |
| **Cold Stress** | P | P | P | **Strong** | Frostbite, hypothermia | Exposure duration, temp, skin state | Warm-up room, thermal gear |
| **Chemical Inhalation/Contact** | P | S | S | **Strong** | Chemical burns, toxicity | SDS availability, face shield status | Process enclosure, ventilation |
| **Respiratory Protection** | S | S | S | **Strong** | Toxic inhalation | Cartridge type, fit test records | Fit testing, respirator check |
| **Ergonomic Strain** | P | S | P | **Strong** | Musculoskeletal strain | Lift weight, repetition frequency | Lift tables, weight limit labels |
| **Biological Exposure** | P | P | P | **Strong** | Infection, pathogen contact | Pathogen source, protective suit | Isolation, sanitizing stations |
| **Illumination & Visibility** | P | S | P | **Strong** | Same-level trip, vehicle strike | Foot-candles, light fixture count | Lighting fixtures, headlights |
| **Ventilation & Air Quality** | P | S | P | **Strong** | Asphyxiation, toxic build-up | Airflow CFM, CO2 readings | HVAC fresh air intake, exhausts |
| **Contractor Coordination** | P | S | S | **Strong** | Uncoordinated startup, collision | Joint LOTO status, permit checks | ptw permit, orientation records |
| **Training & Procedures** | P | S | S | **Strong** | Competency failures | Course date, observation checklist | Hands-on competency tests |
| **Corrective Action verification** | P | S | S | **Strong** | Systemic recurrence | Verification photo, manager sign-off | Photo inspection, sign-off log |

---

## Reputable Source Ingestion Architecture

The ingestion layer ensures that new knowledge from regulatory and non-regulatory agencies (like OSHA, MSHA, NIOSH, ANSI, and NFPA) is classified, categorized, and deduplicated securely before manual approval.

### Governance Guardrails

> [!IMPORTANT]
> 1. **Zero Auto-Approval**: Ingested raw documents are placed strictly into the `records/quarantined/` directory with `approvedForUse` set to `false` and `reviewStatus` set to `'unreviewed'`.
> 2. **Regulatory Precedence**: Under no circumstances can non-regulatory sources (ANSI, NFPA, NIOSH guidelines) override official CFR regulations.
> 3. **Non-Regulatory Advisory Limitation**: Non-regulatory source boundaries must ALWAYS be classified as `'advisory'` and never as `'mandatory'`.
> 4. **No Automated Promotion**: The system strictly prevents code or agents from self-approving or self-publishing ingested source files to production.

```mermaid
graph TD
    A[Raw Scraped Source / API Input] --> B(ReputableSourceIngestionService)
    B --> C{Duplicate Check?}
    C -- Yes --|Reject Ingestion| D[duplicate_blocked Outcome]
    C -- No --> E[Credibility Classifier]
    E --> F[Hazard Domain & Family Categorizer]
    F --> G[Enforce strict 'unreviewed' / 'advisory' boundaries]
    G --> H[KnowledgeRecordValidatorService]
    H -->|Valid| I[Write to records/quarantined/]
    H -->|Invalid| J[Reject / Rejected Outcome]
```

### Verification & Validation Tests

The validation script `backend/scripts/validate-safescope-reputable-sources-ingestion.ts` asserts:
- Correct classification of primary regulations (`federal_regulation` and `mandatory`).
- Correct classification of non-regulatory standard bodies (`industry_standard`, `agency_policy` as `advisory`).
- Prevention of duplicate sources.
- Preservation of quarantine boundaries (e.g. `approvedForUse = false`).
- Compliance with standard-integrity schemas.
