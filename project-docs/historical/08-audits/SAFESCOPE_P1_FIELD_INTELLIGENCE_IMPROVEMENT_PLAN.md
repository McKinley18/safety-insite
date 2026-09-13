# SafeScope P1 Field Intelligence Improvement Plan

## Executive summary

SafeScope Field Realism Pack v2 now has 100 passing field-realism cases and is included in the production readiness verification flow. The next step is not to loosen the benchmark or chase higher apparent confidence. The next step is to make SafeScope more field-intelligent by addressing three P1 gaps identified in the improvement backlog: bloodborne/sharps support, jurisdiction-hold behavior, and mobile equipment versus machine guarding/LOTO disambiguation.

This plan is intentionally implementation-focused but non-invasive. It defines the records, evidence questions, controls, scenario disambiguation, and regression protections needed before changing production reasoning.

## Current baseline

| Metric | Value |
| --- | ---: |
| Field Realism Pack v2 total cases | 100 |
| Pass count | 100 |
| Fail count | 0 |
| Unknown-domain cases | 15 |
| Jurisdiction ambiguity cases | 6 |

### Domain distribution snapshot

| Domain | Count |
| --- | ---: |
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

### Jurisdiction distribution snapshot

| Jurisdiction | Count |
| --- | ---: |
| msha | 32 |
| osha_construction | 16 |
| osha_general_industry | 51 |
| unclear | 1 |

## P1A: Bloodborne/sharps support

### Problem

FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 passed because SafeScope preserved advisory behavior, but it routed to `unknown`. A discarded sharp in a restroom is a recognizable field condition requiring bloodborne-pathogen/sharps reasoning, cleanup controls, exposure determination, and disposal verification.

### Implementation objective

Add a bloodborne/sharps domain path that can recognize discarded sharps, contaminated materials, possible needlestick exposure, cleanup/disposal controls, PPE, and post-exposure escalation without declaring a violation.

### Expected behavior after improvement

- Primary domain should route to a dedicated `bloodborne_pathogens` or `sharps_exposure` domain/subdomain.
- SafeScope should ask whether a needlestick, contact with blood/OPIM, cleanup assignment, PPE, disposal container, and exposure-control procedure are known.
- Corrective action should remain advisory: restrict access, use trained cleanup personnel, use sharps container, document exposure evaluation, and verify disposal.
- Standards matching should remain evidence-bound and qualified-review gated.

## P1B: Jurisdiction hold behavior

### Problem

Several benchmark cases intentionally include MSHA/OSHA boundary ambiguity. They pass because advisory guardrails are preserved, but SafeScope often still selects a likely jurisdiction such as `msha` or `osha_general_industry` when the safer field behavior is to clearly hold jurisdiction as requiring confirmation.

### Jurisdiction cases to review

| Case ID | Title | Current jurisdiction | Review objective |
| --- | --- | --- | --- |
| FIELD-V2-JURISDICTION-AMBIGUOUS-001 | ambiguous shop observation with no jurisdiction context | osha_general_industry | Add stronger hold/confirm language before specific standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-MINE-CONTRACTOR-001 | contractor shop near mine with jurisdiction uncertainty | msha | Add stronger hold/confirm language before specific standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-CONSTRUCTION-PLANT-001 | construction work inside operating plant with jurisdiction uncertainty | msha | Add stronger hold/confirm language before specific standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-MSHA-OSHA-MOBILE-SHOP-001 | mobile equipment repair shop with MSHA OSHA jurisdiction uncertainty | msha | Add stronger hold/confirm language before specific standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-RAIL-SPUR-MINE-PLANT-001 | rail spur near mine plant with jurisdiction uncertainty | msha | Add stronger hold/confirm language before specific standards or corrective-action specificity. |
| FIELD-V2-JURISDICTION-PUBLIC-ROAD-HAUL-TRUCK-001 | haul truck crossing public road with jurisdiction uncertainty | msha | Add stronger hold/confirm language before specific standards or corrective-action specificity. |

### Implementation objective

Add a jurisdiction uncertainty layer that distinguishes `likelyJurisdiction` from `jurisdictionNeedsConfirmation`. The system may still show a likely jurisdiction for routing, but final field-facing output should clearly state that jurisdiction must be confirmed before relying on standards.

### Expected behavior after improvement

- Ambiguous shop/public road/rail spur/contractor/construction-inside-plant cases should surface jurisdiction confirmation questions.
- SafeScope should avoid confident jurisdiction language when mine property, employer control, worker status, public road status, or construction/operator responsibility is unknown.
- The output should preserve advisory-only posture and qualified review.

## P1C: Mobile equipment vs machine guarding/LOTO disambiguation

### Problem

Some cases pass but route to broad or surprising domains because SafeScope blends moving vehicle exposure, fixed machinery guarding, stored-energy maintenance, and crush/pinch-point conditions. This is a field-intelligence issue, not a validator failure.

### High-value routing cases

| Case ID | Title | Current domain | Desired refinement |
| --- | --- | --- | --- |
| FIELD-V2-OSHA-CONSTRUCTION-FORKLIFT-LOAD-VISIBILITY-001 | telehandler load blocks forward visibility | machine_guarding_loto | Route to construction mobile equipment visibility / struck-by planning, not machine_guarding_loto. |
| FIELD-V2-OSHA-GI-POWERED-DOOR-CRUSH-POINT-001 | powered overhead door crush point uncertainty | mobile_equipment | Route to powered-door crush/pinch-point or machine motion hazard, not vehicle mobile equipment. |
| FIELD-V2-OSHA-GI-MACHINE-JAM-CLEARING-001 | machine jam clearing with unclear energy control | machine_guarding_loto | Keep as machine guarding/LOTO only when maintenance or stored energy is active/unclear. |
| FIELD-V2-OSHA-GI-CONVEYOR-TRAINING-ONLY-001 | conveyor safety mentioned only in training records | machine_guarding | Preserve no-active-exposure/training-only distinction. |
| FIELD-V2-MSHA-MOBILE-NO-PEDESTRIAN-001 | parked loader with no pedestrian exposure | mobile_equipment | Preserve no-pedestrian-exposure trap while still recognizing mobile equipment context. |

### Implementation objective

Add clearer mechanism separation for vehicle struck-by, pedestrian interface, backing/visibility, fixed machine nip/crush, stored-energy maintenance, powered door crush point, and training-only/no-exposure cases.

## Files likely needing changes

| Area | Likely files/directories | Reason |
| --- | --- | --- |
| Taxonomy/domain definitions | backend/src/safescope-v2/**/taxonomy*, backend/src/safescope-v2/**/classification* | Add bloodborne/sharps and normalize routing. |
| Mechanism Brain | backend/src/safescope-v2/brain/**, mechanism registries | Add sharps, jurisdiction ambiguity, powered door/crush, mobile visibility mechanisms. |
| Evidence Brain | backend/src/safescope-v2/brain/**evidence**, evidence registries | Add critical evidence questions for sharps, jurisdiction, and ambiguity. |
| Controls Brain | backend/src/safescope-v2/brain/**controls**, control registries | Add advisory controls for sharps cleanup/disposal and jurisdiction hold outputs. |
| Scenario disambiguation | backend/src/safescope-v2/**scenario** | Add scenario records for sharps, jurisdiction ambiguity, powered door crush, mobile visibility, no-exposure traps. |
| Validators/regression tests | backend/scripts/validate-safescope-field-realism-pack-v2.ts and related scripts | Lock improved behavior without weakening existing guardrails. |
| Benchmark data | safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json | Add/adjust expected terms only when behavior is intentionally improved. |

## New registry/Brain records needed

### Bloodborne/sharps
- Record: discarded sharp / contaminated sharp object.
- Record: possible needlestick or contact exposure.
- Record: sharps cleanup and disposal.
- Record: blood/OPIM contaminated material cleanup.

### Jurisdiction ambiguity
- Record: mine contractor shop boundary uncertainty.
- Record: public road haulage boundary uncertainty.
- Record: rail spur / mine plant boundary uncertainty.
- Record: construction activity inside operating plant.
- Record: maintenance shop serving mine equipment but location/control unclear.

### Mobile vs guarding/LOTO
- Record: mobile equipment backing/pedestrian interface.
- Record: mobile equipment load visibility.
- Record: mobile equipment present with no pedestrian exposure.
- Record: fixed machine jam clearing / stored energy uncertainty.
- Record: powered overhead door crush point.
- Record: conveyor training-only/no active exposure.

## New evidence questions needed

| Area | Evidence questions |
| --- | --- |
| Bloodborne/sharps | Was there a needlestick or contact exposure? Was the sharp contaminated or unknown? Who is assigned cleanup? Is a sharps container available? Was PPE used? Was the area restricted? Was exposure reporting initiated if contact occurred? |
| Jurisdiction | Is the location on mine property? Who controls the work area? Are miners exposed? Is the road public or private? Is the contractor under mine operator control? Is construction work part of mining operations or a separate project? |
| Mobile equipment | Was equipment moving, backing, loading, or parked? Were pedestrians present? Was a travel path shared? Were alarms/spotters/radio/traffic controls used? Was visibility obstructed? |
| Machine guarding/LOTO | Was the machine operating? Was guarding removed? Was maintenance/cleaning/jam clearing underway? Was energy isolated? Was stored energy released? |
| No-exposure traps | Were employees exposed at the time? Is the condition barricaded, tagged out, stored, or inactive? What must be verified before treating it as active exposure? |

## New controls needed

- Bloodborne/sharps: restrict access, use trained cleanup, use puncture-resistant sharps container, PPE, exposure reporting, disinfect/decontaminate area, verify disposal.
- Jurisdiction ambiguity: hold standards selection, confirm controlling employer/location/worker status, document jurisdiction basis, require qualified review.
- Mobile equipment visibility/backing: separate pedestrians, spotter/radio controls, traffic plan, route designation, backup alarm/camera verification, visibility assessment.
- Machine jam/LOTO: stop equipment, isolate energy, verify zero energy, clear jams only under procedure, restore guarding, supervisor verification.
- No-exposure traps: maintain barricade/tagout/storage controls, verify exposure before escalation, avoid violation language.

## New scenario disambiguation records needed

| Scenario | Purpose |
| --- | --- |
| discarded-sharp-restroom-cleanup | Prevent sharps from routing unknown and provide evidence/control logic. |
| jurisdiction-mine-contractor-shop | Hold MSHA/OSHA conclusion until location/control/exposure facts are known. |
| jurisdiction-public-road-haulage | Prevent overconfident MSHA routing for public-road haul truck cases. |
| construction-inside-operating-plant | Separate construction standards, plant operations, and MSHA/OSHA ambiguity. |
| telehandler-load-visibility | Route to mobile equipment visibility rather than machine_guarding_loto. |
| powered-door-crush-point | Route to powered-door crush/pinch hazard rather than mobile equipment. |
| conveyor-training-only | Preserve training-only/no active exposure distinction. |
| mobile-equipment-no-pedestrian-exposure | Preserve no-exposure trap while still recognizing equipment context. |

## Regression cases to protect

| Case ID | Title | Current domain | Current jurisdiction | Protection purpose |
| --- | --- | --- | --- | --- |
| FIELD-V2-OSHA-GI-BLOODBORNE-SHARPS-001 | discarded sharp found in restroom | unknown | osha_general_industry | Verify new sharps/bloodborne path. |
| FIELD-V2-JURISDICTION-AMBIGUOUS-001 | ambiguous shop observation with no jurisdiction context | unknown | osha_general_industry | Verify stronger jurisdiction hold/confirmation behavior. |
| FIELD-V2-JURISDICTION-MSHA-OSHA-MOBILE-SHOP-001 | mobile equipment repair shop with MSHA OSHA jurisdiction uncertainty | mobile_equipment | msha | Verify stronger jurisdiction hold/confirmation behavior. |
| FIELD-V2-JURISDICTION-MINE-CONTRACTOR-001 | contractor shop near mine with jurisdiction uncertainty | unknown | msha | Verify stronger jurisdiction hold/confirmation behavior. |
| FIELD-V2-JURISDICTION-CONSTRUCTION-PLANT-001 | construction work inside operating plant with jurisdiction uncertainty | fall_protection | msha | Verify stronger jurisdiction hold/confirmation behavior. |
| FIELD-V2-JURISDICTION-RAIL-SPUR-MINE-PLANT-001 | rail spur near mine plant with jurisdiction uncertainty | unknown | msha | Verify stronger jurisdiction hold/confirmation behavior. |
| FIELD-V2-JURISDICTION-PUBLIC-ROAD-HAUL-TRUCK-001 | haul truck crossing public road with jurisdiction uncertainty | mobile_equipment | msha | Verify stronger jurisdiction hold/confirmation behavior. |
| FIELD-V2-OSHA-CONSTRUCTION-FORKLIFT-LOAD-VISIBILITY-001 | telehandler load blocks forward visibility | machine_guarding_loto | osha_construction | Protect routing disambiguation. |
| FIELD-V2-OSHA-GI-POWERED-DOOR-CRUSH-POINT-001 | powered overhead door crush point uncertainty | mobile_equipment | osha_general_industry | Protect routing disambiguation. |
| FIELD-V2-OSHA-GI-MACHINE-JAM-CLEARING-001 | machine jam clearing with unclear energy control | machine_guarding_loto | osha_general_industry | Protect routing disambiguation. |
| FIELD-V2-OSHA-GI-CONVEYOR-TRAINING-ONLY-001 | conveyor safety mentioned only in training records | machine_guarding | osha_general_industry | Protect no-exposure/training-only trap. |
| FIELD-V2-MSHA-MOBILE-NO-PEDESTRIAN-001 | parked loader with no pedestrian exposure | mobile_equipment | msha | Protect no-exposure/training-only trap. |

## Validation commands

```bash
cd ~/Sentinel_Safety
cd backend && npx ts-node scripts/validate-safescope-field-realism-pack-v2.ts
cd ..
cd backend && npx ts-node scripts/validate-safescope-mind-vs-memory.ts
cd ..
cd backend && npm run audit:safescope-findings
cd ..
cd backend && npm run build
cd ..
./scripts/verify-production-readiness.sh
git status --short
git diff --stat
```

## Commit strategy

1. Commit this plan only.
2. Implement P1A bloodborne/sharps support in a separate commit.
3. Implement P1B jurisdiction hold behavior in a separate commit.
4. Implement P1C mobile/guarding/LOTO disambiguation in a separate commit.
5. After each P1 commit, run full production readiness and restore unrelated generated files.
6. Do not push/deploy unless explicitly requested.

## Do-not-change guardrails

- Do not weaken advisory-only language.
- Do not declare violations from benchmark observations.
- Do not invent standards when exposure, jurisdiction, task, or equipment state is incomplete.
- Do not remove qualified-review requirements.
- Do not remove missing-evidence language just to raise apparent confidence.
- Do not loosen false-positive traps unless the validator is clearly checking registry metadata rather than final generated decision fields.
- Do not force uncertain cases into a specific domain just to reduce unknown counts.
- Preserve human review for jurisdiction ambiguity, incomplete evidence, and no-exposure traps.
