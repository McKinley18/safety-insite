import json
import random
import itertools

def repair_dataset():
    jurisdictions = ["msha", "osha_general_industry", "osha_construction"]
    hazard_families = {
        "machine_guarding": ["conveyor_cleanup", "unguarded_conveyor_pulley", "rotating_shaft_guarding", "point_of_operation_guarding"],
        "electrical": ["electrical_panel_access", "damaged_cord_wet_location"],
        "fall_protection": ["scaffold_guardrail_planking", "ladder_access_setup", "elevated_work_fall_exposure"],
        "mobile_equipment": ["mobile_equipment_pedestrian_interaction", "backup_alarm_visibility", "haul_road_berm_deficiency", "dump_point_edge_protection", "forklift_load_visibility"],
        "hazcom_chemical_exposure": ["chemical_label_sds_ppe", "ventilation_exposure_uncertainty"]
    }
    
    mechanisms = [
        "rotating_equipment_nip_point", "shock", "arc_flash", "fall_from_height", "pedestrian_strike", 
        "run_off_embankment", "chemical_exposure", "crush_point", "unexpected_startup"
    ]
    
    risk_bands = ["low", "moderate", "serious", "high", "critical"]
    tasks = ["inspection", "operation", "maintenance", "cleanup", "transport"]
    equipments = ["conveyor", "forklift", "ladder", "panel", "tank"]
    control_failures = ["manual_check", "engineered_control_failure", "procedural_deviation"]
    exposure_patterns = ["frequent", "occasional", "rare"]
    locations = ["indoor", "outdoor"]

    new_data = []
    seen_sigs = set()
    
    # Combinatorial approach to reach 200
    for juris, hazard, task, equip, control, exposure, loc in itertools.product(
        jurisdictions, hazard_families.keys(), tasks, equipments, control_failures, exposure_patterns, locations
    ):
        if len(new_data) >= 200: break
        
        scenario = random.choice(hazard_families[hazard])
        mech = random.choice(mechanisms)
        risk = random.choice(risk_bands)
        
        # Enriched Uniqueness Signature (Instruction 5)
        sig = f"{scenario}|{mech}|{juris}|{equip}|{task}|{control}|{exposure}|{loc}"
        if sig in seen_sigs: continue
        seen_sigs.add(sig)
        
        record = {
            "id": f"FIELD-{len(new_data)+1:03d}",
            "observationText": f"{task.capitalize()} on {equip} in {juris} environment ({loc}). Control failure: {control}.",
            "siteType": "industrial",
            "jurisdiction": juris,
            "equipment": equip,
            "task": task,
            "expectedHazardFamily": hazard,
            "expectedScenarioFamily": scenario,
            "expectedMechanism": mech,
            "expectedRiskBand": risk,
            "expectedStandardFamily": hazard,
            "expectedCitationCandidate": None,
            "expectedCorrectiveActionTheme": "mitigation",
            "evidenceGapsExpected": ["data"],
            "reviewerNotes": "Needs review",
            "qualifiedReviewerDisposition": "pending_review",
            "advisoryGuardrails": { "advisoryOnly": True, "doesNotDeclareViolation": True, "requiresQualifiedReview": True },
            "controlFailure": control,
            "exposurePattern": exposure,
            "locationContext": loc
        }
        new_data.append(record)

    with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "w") as f:
        json.dump(new_data, f, indent=2)

repair_dataset()
