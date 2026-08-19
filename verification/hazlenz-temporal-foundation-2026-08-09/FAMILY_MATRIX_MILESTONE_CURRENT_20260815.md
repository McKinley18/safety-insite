# Current Candidate
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- safescope hash: `f9f74359b49f62060c64a0c0d989c8b9e980b7d05da20502dd3c389677568a19`
- multi-hazard hash: `6004daf6b6f6fb93d1c1c6fcdeea5abc137819d1a2e056dac112e0d4e51ad233`
- taxonomy-map hash: `ed0c284c3e906d8496698b945ed9c2a68673d6fa97c079e4c1aa00315bf71655`
- Disposable DB: `phase114_tier3d_20260815` (torn down after run); original `safescope` untouched.

# Authoritative Aggregate
228-case full matrix, 0 transport failures.

| Kind | Pass/Total |
|---|---|
| Positive | 67/76 |
| Negative | 76/76 |
| Ambiguity | 37/38 |
| Safe/control | 37/38 |
| **Overall** | **217/228 (95.2%)** |

# Delta From 210/228 (CURRENT_20260814)
- Positive: +7 · Negative: +0 · Ambiguity: +0 · Safe: +0
- 210 UNCHANGED_PASS, 11 UNCHANGED_FAIL, **7 RECOVERED, 0 NEW_FAIL**
- All 7 expected recoveries reproduced exactly: FM-157, FM-158, FM-163, FM-164, FM-194, FM-199, FM-200

# Confirmed Families (29/38)
chemical_inhalation_contact, chemical_transfer, cold_stress, combustible_dust, compressed_gas, confined_space, contractor_coordination, corrective_action_verification_failure, cranes_hoists_rigging, electrical, emergency_egress, excavation_trenching_ground_control, fall_protection, fire_explosion, heat_stress, hot_work, hydraulic_pneumatic_energy, illumination_visibility, lockout_tagout, machine_guarding, material_handling_storage, noise_exposure, personal_protective_equipment, respiratory_protection, silica_respirable_dust, slips_trips_falls_housekeeping, suspended_loads, training_procedure_supervision, ventilation_air_quality

# Partial Families (9/38)
biological_exposure (FM-198) · emergency_equipment (FM-134) · ergonomic_strain (FM-187) · mobile_equipment (FM-038) · powered_haulage (FM-043,044) · pressure_systems (FM-103) · traffic_control (FM-050) · walking_working_surfaces (FM-025,026) · welding_fumes (FM-155)

# Failing Families (0/38)
None.

# Remaining Positive Misses (9)
| Case | Required | Actual | Group |
|---|---|---|---|
| FM-025 | walking_working_surfaces | slip_trip_fall (primary) | RM-5 |
| FM-026 | walking_working_surfaces | fall_protection (weak entity match) | RM-4 |
| FM-038 | mobile_equipment | machine_guarding (primary) | RM-5 |
| FM-043 | powered_haulage | mobile_equipment | RM-3 |
| FM-044 | powered_haulage | machine_guarding | RM-3 |
| FM-050 | traffic_control | (none) | RM-3 |
| FM-103 | pressure_systems | confined_space (weak entity match) | RM-4 |
| FM-134 | emergency_equipment | fire_protection | RM-3 (RC09B merges here) |
| FM-187 | ergonomic_strain | walking_working_surfaces (primary) | RM-5 |

RM-3: 4 rows / 3 families · RM-4: 2 rows / 2 families · RM-5: 3 rows / 3 families.

# Residual Non-Recognition Issues
- **FM-198** (biological_exposure, safe): unchanged — `environmental_spill:ACTIVE` unsupported-active, same pre-existing mismatch. Not fixed this pass (explicitly out of scope).
- **FM-155** (welding_fumes, ambiguity): unchanged — `hot_work:ACTIVE`, adjudication tension, not a code defect. Not fixed this pass (explicitly out of scope).
- **FM-134** (emergency_equipment, positive): unchanged — actual `fire_protection`. Naturally grouped in RM-3 (RC09B merges here, not a separate track).

# Remaining Failing/Mixed Legacy Clusters
- RC02 (FM-025,026) — CURRENTLY_FAILING
- RC03 (FM-038,043,044) — CURRENTLY_FAILING
- RC04 (FM-050) — CURRENTLY_FAILING
- RC07 (FM-103) — CURRENTLY_FAILING
- RC09B (FM-134) — CURRENTLY_FAILING
- RC16 (FM-187) — CURRENTLY_FAILING
- RC20 (14 cases) — MIXED, 13/14 (only FM-198 fails)
- RC21 (6 cases) — MIXED, 5/6 (only FM-155 fails)

RC12, RC13, RC17, RC18 are now CLOSED (all constituent cases pass): RC12/RC13 closed by RM-1A/RM-2 this batch; RC17 (FM-194) closed by RM-1B; RC18 (FM-199,200) closed by RM-1C.

# Readiness
NOT_READY. 217/228 (95.2%), 0 regressions across five consecutive fix batches, negative fixtures perfect, 0 failing families (29 CONFIRMED, 9 PARTIAL). Remaining: 9 positive misses across 3 root-cause groups (RM-3/RM-4/RM-5), plus FM-198 and FM-155 (both intentionally deferred).

# Next Recommended Work
1. RM-3 (powered_haulage, traffic_control, emergency_equipment — FM-043,044,050,134): highest life-critical risk (struck-by/vehicle-interaction hazards), largest remaining row count (4), highest root-cause confidence of the three groups (existing dedicated blocks proven too narrow, not missing), family-local/LOW regression risk, narrowly verifiable against existing fixture sets. Not started this pass.
2. RM-4 (walking_working_surfaces remainder, pressure_systems — FM-026,103): taxonomy-map entity-list expansion, MEDIUM risk (shared infra).
3. RM-5 (walking_working_surfaces remainder, mobile_equipment, ergonomic_strain — FM-025,038,187): primary-classifier trace needed first, lowest root-cause confidence.
4. FM-198 and FM-155 remain deferred pending explicit authorization.
