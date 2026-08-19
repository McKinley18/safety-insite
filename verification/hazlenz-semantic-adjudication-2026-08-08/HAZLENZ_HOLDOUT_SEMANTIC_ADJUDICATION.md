# HazLenz precision holdout semantic adjudication

Apparent legacy recall misses: **30** rows (the holdout contains duplicated templates; each row is retained).

## Adjudication counts

- EXPECTATION_ORACLE_DEFECT: 10
- TRUE_ENGINE_MISS: 20

## Per-row decisions

| Scenario | Category | Expected family/state | Adjudicated class/state | First incorrect stage |
|---|---|---|---|---|
| precision-011 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-012 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-013 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-014 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-015 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-016 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-017 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-018 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-019 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-020 | contradiction | hazard_communication / HISTORICAL_OR_CONTROLLED | EXPECTATION_ORACLE_DEFECT / HISTORICAL | oracle_family_mapping |
| precision-141 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-142 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-143 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-144 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-145 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-146 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-147 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-148 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-149 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-150 | jurisdiction | mobile_equipment / UNKNOWN_JURISDICTION | TRUE_ENGINE_MISS / UNKNOWN | evidence_extraction_and_taxonomy_routing |
| precision-161 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-162 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-163 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-164 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-165 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-166 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-167 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-168 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-169 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |
| precision-170 | multi-hazard | hot_work / MIXED | TRUE_ENGINE_MISS / ACTIVE | decomposition_filtering_after_internal_recognition |

## Qualified rationale

### precision-011

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The current condition was directly observed.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-012

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The old note is retained.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-013

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The current condition was directly observed.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-014

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The old note is retained.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-015

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The current condition was directly observed.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-016

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The old note is retained.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-017

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The current condition was directly observed.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-018

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The old note is retained.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-019

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The current condition was directly observed.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-020

- Observation: A solvent drum was reported leaking at 08:00; the current inspection at 10:00 records the container sealed and no active release. The old note is retained.
- Expected: hazard_communication (HISTORICAL_OR_CONTROLLED)
- Returned primary: slip_trip_fall (CONTRADICTORY); canonical families: slip_trip_fall, electrical, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **EXPECTATION_ORACLE_DEFECT**
- Predicate status: historical_reported_release_with_current_direct_observation_of_sealed_no_release
- First incorrect stage: oracle_family_mapping
- Rationale: The text supports a historical release context, but does not establish a hazard-communication failure (label, SDS, identity, or training gap). The frozen expected family hazard_communication is not a defensible family-level expectation. A current active chemical-release finding would also be incorrect. The response correctly withholds an active chemical-release promotion; its contradiction flag is a separate temporal-state quality issue, not a missed active HazCom hazard.
### precision-141

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-142

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-143

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-144

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-145

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-146

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-147

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-148

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-149

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-150

- Observation: A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.
- Expected: mobile_equipment (UNKNOWN_JURISDICTION)
- Returned primary: electrical (UNKNOWN); canonical families: electrical, hot_work, electrical, hot_work, electrical
- Expected family appears anywhere: no; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: potential_mobile_equipment_context_from_haul_route_and_crusher_without_exposure_or_jurisdiction_resolution
- First incorrect stage: evidence_extraction_and_taxonomy_routing
- Rationale: A haul route and crusher context is sufficient to retain a review-only mobile-equipment/traffic candidate, but not to assert an active violation or select MSHA versus construction jurisdiction. The response drops that family entirely and instead emits unrelated low-confidence hot-work/electrical fragments.
### precision-161

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-162

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-163

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-164

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-165

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-166

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-167

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-168

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-169

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.
### precision-170

- Observation: The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.
- Expected: hot_work (MIXED)
- Returned primary: controlled_condition (UNKNOWN); canonical families: controlled_condition, hazard_communication
- Expected family appears anywhere: yes; canonical projection: no
- Classification: **TRUE_ENGINE_MISS**
- Predicate status: current_active_hot_work_without_verified_fire_watch_while_adjacent_chemical_container_is_safe
- First incorrect stage: decomposition_filtering_after_internal_recognition
- Rationale: The hot-work predicate is explicit and current. The internal response recognizes hot_work in provisional/absorption structures, but the canonical decomposition is emptied by the hot-work false-positive filter because it does not treat the literal phrase “hot work” as a concrete hot-work mechanism. This incorrectly suppresses an active sibling hazard when a separate chemical fragment is controlled.

The frozen expected labels and corpus are unchanged. Rows classified as oracle defects are not silently relabeled; the state-aware metrics preserve the distinction.
