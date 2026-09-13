import json

domains = [
    "machine_guarding", "electrical", "hazcom", "confined_space", "excavation_trenching", 
    "fall_protection", "mobile_equipment", "rigging_lifting", "fire_protection", 
    "emergency_egress", "ppe", "material_handling", "compressed_gas", "hot_work", 
    "walking_working_surfaces"
]

records = []
for i in range(60):
    domain = domains[i % len(domains)]
    record = {
        "scenarioId": f"scen-{i:03d}",
        "domainId": domain,
        "scenarioFamily": f"family-{domain}",
        "hazardFamily": f"hazard-{domain}",
        "plainLanguageObservation": f"Observation for {domain} scenario {i}",
        "equipmentOrEnvironment": f"equipment-{domain}",
        "taskContext": "operation",
        "energyOrHazardSource": "source-i",
        "mechanismOfHarm": "harm-i",
        "exposurePattern": "pattern-i",
        "likelyControlsMissing": ["control-i"],
        "evidenceSignals": ["signal-i"],
        "evidenceGaps": ["gap-i"],
        "supervisorQuestions": ["question-i?"],
        "immediateActions": ["action-i"],
        "durableControls": ["control-i"],
        "knownFalsePositiveRisks": ["risk-i"],
        "advisoryBoundaryNote": "SafeScope advisory output"
    }
    records.append(record)

with open('safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json', 'w') as f:
    json.dump({"records": records}, f, indent=2)
