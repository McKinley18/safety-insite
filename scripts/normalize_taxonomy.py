import json
import random

# Mapping for placeholders to real taxonomy
hazard_map = {
    "conveyor": "machine_guarding",
    "tail pulley": "machine_guarding",
    "powered door": "machine_guarding",
    "fire extinguisher": "fire_protection",
    "machinery": "lockout_hazardous_energy",
    "forklift": "mobile_equipment",
    "ladder": "fall_protection",
    "container": "hazcom_chemical_exposure",
    "cord": "electrical",
    "exit": "emergency_access_egress",
    "excavator": "excavation_trenching",
    "scaffold": "scaffolds_platforms_ladders",
    "floor": "housekeeping_walking_working_surfaces",
    "haul truck": "mobile_equipment",
    "ventilation bulkhead": "ventilation",
    "grinder": "welding_cutting_hot_work",
    "electrical panel": "electrical",
    "gas cylinder": "material_handling_struck_by",
    "concrete saw": "ppe_exposure_controls",
    "tank": "confined_space_atmospheric"
}

scenario_map = {
    "conveyor": "conveyor_cleanup",
    "tail pulley": "unguarded_conveyor_pulley",
    "powered door": "electrical_panel_access",
    "fire extinguisher": "fire_extinguisher_access_inspection",
    "machinery": "loto_ambiguity",
    "forklift": "mobile_equipment_pedestrian_interaction",
    "ladder": "ladder_access_setup",
    "container": "chemical_label_sds_ppe",
    "cord": "damaged_cord_wet_location",
    "exit": "emergency_exit_blockage",
    "excavator": "excavation_protective_system_ambiguity",
    "scaffold": "scaffold_guardrail_planking",
    "floor": "housekeeping_slip_trip",
    "haul truck": "haul_road_berm_deficiency",
    "ventilation bulkhead": "ventilation_exposure_uncertainty",
    "grinder": "hot_work_fire_watch",
    "electrical panel": "electrical_panel_access",
    "gas cylinder": "chemical_label_sds_ppe",
    "concrete saw": "workplace_exam_documentation_ambiguity",
    "tank": "confined_space_atmospheric_ambiguity"
}

with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "r") as f:
    data = json.load(f)

for record in data:
    equip = record["equipment"]
    # Simple mapping based on equipment for demonstration; 
    # real taxonomy mapping should be more robust
    mapped_hazard = hazard_map.get(equip, "workplace_exam_documentation")
    mapped_scenario = scenario_map.get(equip, "workplace_exam_documentation_ambiguity")
    
    record["expectedHazardFamily"] = mapped_hazard
    record["expectedScenarioFamily"] = mapped_scenario

with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "w") as f:
    json.dump(data, f, indent=2)
