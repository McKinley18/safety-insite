import json

domains_info = {
    "machine_guarding": {"entities": ["conveyor", "guard", "nip_point"], "mechanism": "entanglement"},
    "electrical": {"entities": ["panel", "cord", "live_parts", "electrical"], "mechanism": "electrical_shock"},
    "hazcom": {"entities": ["chemical", "sds", "label", "container"], "mechanism": "chemical_exposure"},
    "confined_space": {"entities": ["tank", "vessel", "confined", "space"], "mechanism": "asphyxiation"},
    "excavation_trenching": {"entities": ["trench", "trench edge", "spoil pile", "excavation", "cave-in"], "mechanism": "cave_in"},
    "fall_protection": {"entities": ["ladder", "platform", "edge", "fall", "guardrail"], "mechanism": "fall_from_height"},
    "mobile_equipment": {"entities": ["loader", "forklift", "pedestrian"], "mechanism": "struck_by_mobile_equipment"},
    "rigging_lifting": {"entities": ["sling", "rigging"], "mechanism": "struck_by_suspended_load"},
    "fire_protection": {"entities": ["extinguisher"], "mechanism": "fire_extinguisher_failure"},
    "emergency_egress": {"entities": ["exit", "blocked", "egress"], "mechanism": "egress_blockage"},
    "ppe": {"entities": ["goggles", "face shield", "ppe", "safety glasses", "grinding"], "mechanism": "exposure"},
    "material_handling": {"entities": ["pallet", "material", "aisle", "storage", "unstable"], "mechanism": "struck_by_falling_object"},
    "compressed_gas": {"entities": ["cylinder", "compressed", "air", "pneumatic", "hose", "coupling", "pressurized"], "mechanism": "explosion"},
    "hot_work": {"entities": ["welder", "hot", "work", "watch", "cutting", "grinding", "torch", "spark"], "mechanism": "fire"},
    "walking_working_surfaces": {"entities": ["floor", "hole", "walkway", "opening", "slip", "trip", "fall"], "mechanism": "slips_trips_falls"}
}

records = []
i = 0
for domain, info in domains_info.items():
    for _ in range(4):
        record = {
            "scenarioId": f"scen-{i:03d}",
            "domainId": domain,
            "scenarioFamily": f"family-{domain}",
            "hazardFamily": f"hazard-{domain}",
            "plainLanguageObservation": f"Observation for {domain} scenario {i}",
            "equipmentOrEnvironment": f"equipment-{domain}",
            "taskContext": "operation",
            "energyOrHazardSource": "source-i",
            "mechanismOfHarm": info["mechanism"],
            "exposurePattern": "pattern-i",
            "likelyControlsMissing": ["control-i"],
            "evidenceSignals": info["entities"],
            "evidenceGaps": ["gap-i"],
            "supervisorQuestions": ["question-i?"],
            "immediateActions": ["action-i"],
            "durableControls": ["control-i"],
            "knownFalsePositiveRisks": ["risk-i"],
            "advisoryBoundaryNote": "SafeScope advisory output"
        }
        records.append(record)
        i += 1

with open('safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json', 'w') as f:
    json.dump({"records": records}, f, indent=2)
