import json
import itertools

def generate_unique_dataset():
    jurisdictions = ["msha", "osha_general_industry", "osha_construction"]
    hazards = ["machine_guarding", "electrical", "fall_protection", "mobile_equipment", "hazcom_chemical_exposure"]
    tasks = ["inspection", "operation", "maintenance", "cleanup", "transport"]
    equipments = ["conveyor", "forklift", "ladder", "panel", "tank"]
    
    # Generate all unique combinations
    combinations = list(itertools.product(jurisdictions, hazards, tasks, equipments))
    
    new_data = []
    
    for i, (juris, hazard, task, equip) in enumerate(combinations):
        if i >= 200: break
        
        scenario_family = f"{hazard}_{task}_{equip}_{juris}_{i}"
        
        record = {
            "id": f"FIELD-{i+1:03d}",
            "observationText": f"Observation {i+1}: {task} on {equip} in {juris} environment",
            "siteType": "industrial",
            "jurisdiction": juris,
            "equipment": equip,
            "task": task,
            "expectedHazardFamily": hazard,
            "expectedScenarioFamily": scenario_family,
            "expectedMechanism": f"mechanism_{i}",
            "expectedRiskBand": "moderate",
            "expectedStandardFamily": hazard,
            "expectedCitationCandidate": None,
            "expectedCorrectiveActionTheme": "mitigation",
            "evidenceGapsExpected": ["data"],
            "reviewerNotes": "Needs review",
            "qualifiedReviewerDisposition": "pending_review",
            "advisoryGuardrails": { "advisoryOnly": True, "doesNotDeclareViolation": True, "requiresQualifiedReview": True }
        }
        new_data.append(record)

    return new_data

data = generate_unique_dataset()
with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "w") as f:
    json.dump(data, f, indent=2)
