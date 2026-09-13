# SafeScope Canonical Taxonomy Map v1

This document defines the canonical naming conventions for hazard families and domains within SafeScope to prevent naming drift and ensure cross-system consistency.

## Canonical Hazard Families

| Canonical Name | Primary Category | Aliases / Legacy Names (Preserve as compatibility) |
| :--- | :--- | :--- |
| `machine_guarding` | Acute Safety | `rotating_parts`, `nip_points` |
| `lockout_tagout` | Acute Safety | `energy_isolation`, `loto` |
| `electrical` | Acute Safety | `electrical_safety`, `exposed_wiring` |
| `fall_protection` | Acute Safety | `working_at_height`, `open_edges` |
| `walking_working_surfaces` | Acute Safety | `slips_trips_falls_housekeeping` |
| `mobile_equipment` | Acute Safety | `powered_industrial_trucks`, `forklifts` |
| `powered_haulage` | Acute Safety | `conveyors`, `belts` |
| `hot_work` | Acute Safety | `fire_prevention_hot_work`, `welding` |
| `pressure_systems` | Acute Safety | `pressure_hydraulic_pneumatic_energy` |
| `noise_exposure` | Chronic Health | `noise_hearing_conservation` |
| `emergency_equipment` | Readiness | `emergency_egress_response`, `safety_showers` |
| `hazcom_chemical_exposure` | Chronic Health | `chemical_inhalation_contact`, `chemical_transfer` |
| `silica_respirable_dust` | Chronic Health | `respiratory_dust_fume_exposure` |
| `cranes_hoists_rigging` | Acute Safety | `cranes_rigging_suspended_loads` |
| `confined_space` | Mixed | `tank_entry`, `atmospheric_hazard` |

## Naming Rules
1. **Lowercase/Snake_Case:** All internal IDs must be lowercase with underscores.
2. **Singular vs. Plural:** Prefer singular for mechanics (`guardrail`, `lock`) and plural for categories (`surfaces`, `loads`).
3. **No Agency Codes in IDs:** Do not include `osha_` or `msha_` in hazard family IDs (use `relatedJurisdictions` metadata instead).

## Integration Policy
- **Scenario Packs:** All `expectedHazardFamilies` must use canonical names.
- **Validators:** Assertions must use canonical names.
- **Orchestrator:** Mapping logic should resolve aliases to canonical IDs before outputting field assessment data.

## Current Source of Truth
`backend/src/safescope-v2/hazard-universe/hazard-universe.registry.ts`
