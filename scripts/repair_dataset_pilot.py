import json
import random

def repair_dataset_pilot():
    # Load dataset
    with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "r") as f:
        data = json.load(f)

    # Allowed taxonomy based on prompt
    taxonomy = {
        "conveyor_cleanup": {"hazard": "machine_guarding", "mechanism": "rotating_equipment_nip_point", "equip": "conveyor", "task": "cleanup"},
        "unguarded_conveyor_pulley": {"hazard": "machine_guarding", "mechanism": "crush_point", "equip": "conveyor", "task": "inspection"},
        "electrical_panel_access": {"hazard": "electrical", "mechanism": "shock", "equip": "panel", "task": "operation"},
        "damaged_cord_wet_location": {"hazard": "electrical", "mechanism": "shock", "equip": "cord", "task": "maintenance"},
        "ladder_access_setup": {"hazard": "fall_protection", "mechanism": "fall_from_height", "equip": "ladder", "task": "work_at_height"},
        "mobile_equipment_pedestrian_interaction": {"hazard": "mobile_equipment", "mechanism": "pedestrian_strike", "equip": "forklift", "task": "transport"},
        "chemical_label_sds_ppe": {"hazard": "hazcom_chemical_exposure", "mechanism": "chemical_exposure", "equip": "container", "task": "storage"},
        "loto_ambiguity": {"hazard": "lockout_hazardous_energy", "mechanism": "unexpected_startup", "equip": "machinery", "task": "repair"},
        "fire_extinguisher_access_inspection": {"hazard": "fire_protection", "mechanism": "fire_extinguisher_access_failure", "equip": "fire extinguisher", "task": "housekeeping"},
        "emergency_exit_blockage": {"hazard": "emergency_access_egress", "mechanism": "egress_blockage", "equip": "exit", "task": "egress"},
        "excavation_protective_system_ambiguity": {"hazard": "excavation_trenching", "mechanism": "excavation_collapse", "equip": "excavator", "task": "trenching"},
        "housekeeping_slip_trip": {"hazard": "housekeeping_walking_working_surfaces", "mechanism": "slip", "equip": "floor", "task": "housekeeping"}
    }
    
    risk_bands = ["low", "moderate", "serious", "high", "critical"]
    control_failures = ["missing_guard", "inadequate_guard", "blocked_access", "damaged_insulation", "missing_label", "missing_energy_control", "poor_housekeeping", "inadequate_separation"]
    exposure_patterns = ["employee_working_adjacent", "employee_performing_cleanup", "employee_operating_equipment", "employee_inspecting_area", "pedestrian_travel_path", "maintenance_activity_near_hazard"]
    locations = ["conveyor_tail_pulley_area", "electrical_room", "travelway", "elevated_work_platform", "maintenance_shop", "chemical_storage_area", "emergency_exit_route", "active_work_area"]

    scenario_list = list(taxonomy.keys())
    
    for i in range(20):
        record = data[i]
        scenario = random.choice(scenario_list)
        tax = taxonomy[scenario]
        
        record["expectedScenarioFamily"] = scenario
        record["expectedHazardFamily"] = tax["hazard"]
        record["expectedMechanism"] = tax["mechanism"]
        record["expectedRiskBand"] = random.choice(risk_bands)
        record["equipment"] = tax["equip"]
        record["task"] = tax["task"]
        record["controlFailure"] = random.choice(control_failures)
        record["exposurePattern"] = random.choice(exposure_patterns)
        record["locationContext"] = random.choice(locations)
        record["observationText"] = f"{tax['task'].capitalize()} on {tax['equip']} in {record['jurisdiction']} environment ({record['locationContext']}). Control failure: {record['controlFailure']}."

    with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "w") as f:
        json.dump(data, f, indent=2)

repair_dataset_pilot()
