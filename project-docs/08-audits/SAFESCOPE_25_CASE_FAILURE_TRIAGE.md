# SafeScope 25-Case Benchmark Failure Triage

## 1. Current Benchmark Status

- Total cases: 25
- Pass: 4
- Review: 0
- Fail: 21
- Average weighted score: 15.68
- Production readiness: Passed

## 2. Interpretation

The 25-case benchmark did not indicate a regression in the original SafeScope foundation. The original 4 hardened benchmark cases continue to pass. The 21 new failures identify missing taxonomy, mechanism, standards, and corrective action coverage for additional safety domains.

## 3. Hardened Domains Already Working

| Domain | Example Case | Status |
| :--- | :--- | :--- |
| machine_guarding | MNM-SURFACE-CONVEYOR-001 | Pass |
| trenching_and_excavation | OSHA-CONST-EXCAVATION-001 | Pass |
| roof_control | COAL-UG-ROOF-001 | Pass |
| electrical | OSHA-GI-ELECTRICAL-001 | Pass |

## 4. Primary Missing Domains

| Domain / Family | Representative Cases | Main Gap |
| :--- | :--- | :--- |
| fall_protection | MSHA-MNM-SURF-FALL-001, OSHA-CONST-FALL-001, OSHA-CONST-SCAFF-001 | Taxonomy, mechanism, citation, actions |
| mobile_equipment | MSHA-MNM-SURF-MOBILE-001, MSHA-COAL-UG-HAUL-001, OSHA-CONST-STRIKE-001, OSHA-GI-FORK-001 | Taxonomy, mechanism, jurisdiction-specific citations |
| hazardous_energy_loto | MSHA-MNM-MAINT-LOTO-001, OSHA-GI-LOTO-001 | Needs separation from ordinary machine guarding |
| walking_working_surfaces / slip_trip_fall | MSHA-MNM-SURF-HOUSE-001, OSHA-GI-WWS-001 | Taxonomy, standards, actions |
| emergency_egress / emergency_preparedness | MSHA-COAL-UG-ESCAPE-001 | Taxonomy, standards, actions |
| ventilation | MSHA-COAL-UG-VENT-001 | Taxonomy, mechanism, standards |
| health_respiratory / silica | OSHA-CONST-SILICA-001 | Health hazard reasoning |
| hazcom / hazardous_materials | OSHA-GI-HAZCOM-001 | Chemical hazard reasoning |
| confined_space | OSHA-GI-CONFINED-001 | Permit-space reasoning |

## 5. Highest-Leverage Implementation Order

### Patch 1: Fall Protection + Walking-Working Surfaces

Target cases:
- MSHA-MNM-SURF-FALL-001
- OSHA-CONST-FALL-001
- OSHA-CONST-SCAFF-001
- OSHA-CONST-LADDER-001
- MSHA-MNM-SURF-HOUSE-001
- OSHA-GI-WWS-001

### Patch 2: Mobile Equipment / Struck-By

Target cases:
- MSHA-MNM-SURF-MOBILE-001
- MSHA-COAL-UG-HAUL-001
- OSHA-CONST-STRIKE-001
- OSHA-GI-FORK-001

### Patch 3: Hazardous Energy / LOTO

Target cases:
- MSHA-MNM-MAINT-LOTO-001
- OSHA-GI-LOTO-001

### Patch 4: Emergency / Underground Mining Specialty

Target cases:
- MSHA-COAL-UG-RIB-001
- MSHA-COAL-UG-VENT-001
- MSHA-COAL-UG-ESCAPE-001

### Patch 5: Health / Chemical / Confined Space

Target cases:
- OSHA-CONST-SILICA-001
- OSHA-GI-HAZCOM-001
- OSHA-GI-CONFINED-001

## 6. Next Recommended Patch

The next SafeScope code patch should focus only on fall protection, walking-working surfaces, scaffolds, and ladders.

Expected improvement:
- Raise multiple 0-score cases into review/pass range.
- Keep the original 4 benchmark cases passing.
- Preserve production readiness.

## 7. Do Not Do Yet

- Do not expand beyond 25 cases.
- Do not add AI/ML logic.
- Do not reorganize folders.
- Do not hardcode answers only to the benchmark descriptions.
- Do not commit domain logic until benchmark expansion is committed separately.
