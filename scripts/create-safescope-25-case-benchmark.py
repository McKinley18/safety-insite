import json
from pathlib import Path

# Path configurations
BENCHMARK_FILE = Path("safescope-data/benchmarks/safescope-finding-audit.v1.json")
PLAN_FILE = Path("project-docs/08-audits/SAFESCOPE_25_CASE_BENCHMARK_EXPANSION_PLAN.md")

# New cases data
new_cases = [
    {
        "id": "MSHA-MNM-SURF-FALL-001",
        "title": "surface MNM elevated work platform fall hazard",
        "findingDescription": "Unprotected elevated work platform without guardrails at 6 feet.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "surface_metal_nonmetal", "workArea": "plant", "equipment": "work platform", "task": "maintenance"},
        "expected": {"hazardFamily": "fall_protection", "hazardMechanism": "fall_from_height", "equipment": "platform", "primaryCitation": "30 CFR 56.15005", "acceptableCitations": ["30 CFR 56.15005"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["guardrail", "fall protection", "verify"]}
    },
    {
        "id": "MSHA-MNM-SURF-MOBILE-001",
        "title": "surface MNM haul road missing berm/mobile equipment hazard",
        "findingDescription": "Haul road embankment lacks adequate berm for edge protection.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "surface_metal_nonmetal", "workArea": "haul road", "equipment": "haul truck", "task": "hauling"},
        "expected": {"hazardFamily": "mobile_equipment", "hazardMechanism": "run_off_embankment", "equipment": "haul road", "primaryCitation": "30 CFR 56.9300", "acceptableCitations": ["30 CFR 56.9300"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["berm", "protection", "verify"]}
    },
    {
        "id": "MSHA-MNM-MILL-ELECT-001",
        "title": "surface MNM damaged electrical cable/conductor exposure",
        "findingDescription": "Damaged insulation on a high-voltage trailing cable for a mill drive.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "surface_metal_nonmetal", "workArea": "mill", "equipment": "trailing cable", "task": "production"},
        "expected": {"hazardFamily": "electrical", "hazardMechanism": "shock_arc_flash", "equipment": "cable", "primaryCitation": "30 CFR 56.12004", "acceptableCitations": ["30 CFR 56.12004"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["de-energize", "repair", "verify"]}
    },
    {
        "id": "MSHA-MNM-SURF-HOUSE-001",
        "title": "surface MNM travelway housekeeping/slip-trip hazard",
        "findingDescription": "Accumulation of loose rocks and debris in a primary travelway.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "surface_metal_nonmetal", "workArea": "plant", "equipment": "travelway", "task": "travel"},
        "expected": {"hazardFamily": "slip_trip_fall", "hazardMechanism": "trip", "equipment": "travelway", "primaryCitation": "30 CFR 56.20003", "acceptableCitations": ["30 CFR 56.20003"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": False, "minimumCorrectiveActionElements": ["clean", "remove", "verify"]}
    },
    {
        "id": "MSHA-MNM-MAINT-LOTO-001",
        "title": "surface MNM crusher maintenance without lockout/blocking",
        "findingDescription": "Crusher maintenance being performed without energy isolation or mechanical blocking.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "surface_metal_nonmetal", "workArea": "plant", "equipment": "crusher", "task": "maintenance"},
        "expected": {"hazardFamily": "machine_guarding_loto", "hazardMechanism": "unexpected_startup", "equipment": "crusher", "primaryCitation": "30 CFR 56.14105", "acceptableCitations": ["30 CFR 56.14105"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["LOTO", "block", "verify"]}
    },
    {
        "id": "MSHA-COAL-UG-RIB-001",
        "title": "underground coal loose rib/rib control",
        "findingDescription": "Significant loose coal rib noted in the active face entry.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "coal_underground", "workArea": "face", "equipment": "rib support", "task": "mining"},
        "expected": {"hazardFamily": "roof_rib_control", "hazardMechanism": "rib_fall", "equipment": "rib", "primaryCitation": "30 CFR 75.202(a)", "acceptableCitations": ["30 CFR 75.202(a)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["barricade", "scale", "support"]}
    },
    {
        "id": "MSHA-COAL-UG-VENT-001",
        "title": "underground coal ventilation curtain/airflow concern",
        "findingDescription": "Damaged ventilation curtain obstructing required airflow at the face.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "coal_underground", "workArea": "face", "equipment": "ventilation", "task": "mining"},
        "expected": {"hazardFamily": "ventilation", "hazardMechanism": "methane_gas_buildup", "equipment": "ventilation_curtain", "primaryCitation": "30 CFR 75.333", "acceptableCitations": ["30 CFR 75.333"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["repair", "verify_flow"]}
    },
    {
        "id": "MSHA-COAL-UG-HAUL-001",
        "title": "underground coal mobile equipment/pedestrian interaction",
        "findingDescription": "No proximity detection or adequate barriers for pedestrian in haulage area.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "coal_underground", "workArea": "haulage", "equipment": "shuttle car", "task": "transport"},
        "expected": {"hazardFamily": "mobile_equipment", "hazardMechanism": "pedestrian_strike", "equipment": "haulage", "primaryCitation": "30 CFR 75.1725", "acceptableCitations": ["30 CFR 75.1725"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["barriers", "proximity_system", "verify"]}
    },
    {
        "id": "MSHA-COAL-UG-ESCAPE-001",
        "title": "underground coal escapeway obstruction",
        "findingDescription": "Primary escapeway blocked by equipment debris.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "coal_underground", "workArea": "escapeway", "equipment": "N/A", "task": "N/A"},
        "expected": {"hazardFamily": "emergency_preparedness", "hazardMechanism": "egress_blockage", "equipment": "escapeway", "primaryCitation": "30 CFR 75.380", "acceptableCitations": ["30 CFR 75.380"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["clear", "verify"]}
    },
    {
        "id": "MSHA-MNM-UG-GUARD-001",
        "title": "underground MNM conveyor guarding",
        "findingDescription": "Drive assembly unguarded on underground belt conveyor.",
        "context": {"authority": "MSHA", "industry": "mining", "mineType": "underground_metal_nonmetal", "workArea": "conveyor", "equipment": "conveyor", "task": "production"},
        "expected": {"hazardFamily": "machine_guarding", "hazardMechanism": "rotating_equipment", "equipment": "conveyor", "primaryCitation": "30 CFR 57.14107", "acceptableCitations": ["30 CFR 57.14107"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["guard", "verify"]}
    },
    {
        "id": "OSHA-CONST-FALL-001",
        "title": "construction unprotected leading edge/fall protection",
        "findingDescription": "Employees working on an unprotected leading edge at 15 feet.",
        "context": {"authority": "OSHA", "industry": "construction", "workArea": "jobsite", "equipment": "N/A", "task": "construction"},
        "expected": {"hazardFamily": "fall_protection", "hazardMechanism": "fall_from_height", "equipment": "N/A", "primaryCitation": "29 CFR 1926.501(b)(1)", "acceptableCitations": ["29 CFR 1926.501(b)(1)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["guardrail", "fall_arrest", "verify"]}
    },
    {
        "id": "OSHA-CONST-SCAFF-001",
        "title": "construction scaffold missing guardrail",
        "findingDescription": "Working platform on scaffold missing mid-rail and top-rail.",
        "context": {"authority": "OSHA", "industry": "construction", "workArea": "jobsite", "equipment": "scaffold", "task": "work"},
        "expected": {"hazardFamily": "fall_protection", "hazardMechanism": "fall_from_height", "equipment": "scaffold", "primaryCitation": "29 CFR 1926.451(g)(4)", "acceptableCitations": ["29 CFR 1926.451(g)(4)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["install_guardrails", "verify"]}
    },
    {
        "id": "OSHA-CONST-LADDER-001",
        "title": "construction ladder access/misuse",
        "findingDescription": "Extension ladder not secured at the top and extending less than 3 feet above landing.",
        "context": {"authority": "OSHA", "industry": "construction", "workArea": "jobsite", "equipment": "ladder", "task": "climbing"},
        "expected": {"hazardFamily": "slips_trips_falls", "hazardMechanism": "fall_from_ladder", "equipment": "ladder", "primaryCitation": "29 CFR 1926.1053(b)(1)", "acceptableCitations": ["29 CFR 1926.1053(b)(1)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["secure", "reposition", "verify"]}
    },
    {
        "id": "OSHA-CONST-STRIKE-001",
        "title": "construction struck-by mobile equipment",
        "findingDescription": "Backhoe operating in congested area without a spotter.",
        "context": {"authority": "OSHA", "industry": "construction", "workArea": "jobsite", "equipment": "backhoe", "task": "excavation"},
        "expected": {"hazardFamily": "mobile_equipment", "hazardMechanism": "struck_by", "equipment": "backhoe", "primaryCitation": "29 CFR 1926.602(a)(9)", "acceptableCitations": ["29 CFR 1926.602(a)(9)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["spotter", "barriers", "verify"]}
    },
    {
        "id": "OSHA-CONST-SILICA-001",
        "title": "construction silica/dust exposure",
        "findingDescription": "Dry cutting of concrete without engineering controls/water suppression.",
        "context": {"authority": "OSHA", "industry": "construction", "workArea": "jobsite", "equipment": "concrete saw", "task": "cutting"},
        "expected": {"hazardFamily": "health_respiratory", "hazardMechanism": "silica_inhalation", "equipment": "concrete saw", "primaryCitation": "29 CFR 1926.1153(c)(1)", "acceptableCitations": ["29 CFR 1926.1153(c)(1)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["water_suppression", "ventilation", "verify"]}
    },
    {
        "id": "OSHA-GI-MACHINE-001",
        "title": "general industry machine guarding/point of operation",
        "findingDescription": "Point of operation on drill press not guarded.",
        "context": {"authority": "OSHA", "industry": "general_industry", "workArea": "shop", "equipment": "drill press", "task": "drilling"},
        "expected": {"hazardFamily": "machine_guarding", "hazardMechanism": "pinch_point", "equipment": "drill press", "primaryCitation": "29 CFR 1910.212(a)(3)(ii)", "acceptableCitations": ["29 CFR 1910.212(a)(3)(ii)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["guard", "verify"]}
    },
    {
        "id": "OSHA-GI-LOTO-001",
        "title": "general industry lockout/tagout",
        "findingDescription": "Maintenance work on production line without LOTO program compliance.",
        "context": {"authority": "OSHA", "industry": "general_industry", "workArea": "production line", "equipment": "conveyor", "task": "maintenance"},
        "expected": {"hazardFamily": "machine_guarding_loto", "hazardMechanism": "unexpected_startup", "equipment": "conveyor", "primaryCitation": "29 CFR 1910.147(c)(1)", "acceptableCitations": ["29 CFR 1910.147(c)(1)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["LOTO", "energy_isolation", "verify"]}
    },
    {
        "id": "OSHA-GI-FORK-001",
        "title": "forklift/pedestrian interaction",
        "findingDescription": "Forklift operating in busy pedestrian walkway without clear delineation.",
        "context": {"authority": "OSHA", "industry": "general_industry", "workArea": "warehouse", "equipment": "forklift", "task": "transport"},
        "expected": {"hazardFamily": "mobile_equipment", "hazardMechanism": "pedestrian_strike", "equipment": "forklift", "primaryCitation": "29 CFR 1910.178(l)", "acceptableCitations": ["29 CFR 1910.178(l)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["segregation", "barriers", "verify"]}
    },
    {
        "id": "OSHA-GI-WWS-001",
        "title": "general industry walking-working surface slip/trip",
        "findingDescription": "Spilled oil in production area creating slip hazard.",
        "context": {"authority": "OSHA", "industry": "general_industry", "workArea": "production", "equipment": "N/A", "task": "N/A"},
        "expected": {"hazardFamily": "slip_trip_fall", "hazardMechanism": "slip", "equipment": "N/A", "primaryCitation": "29 CFR 1910.22(a)(2)", "acceptableCitations": ["29 CFR 1910.22(a)(2)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": False, "minimumCorrectiveActionElements": ["clean", "verify"]}
    },
    {
        "id": "OSHA-GI-HAZCOM-001",
        "title": "general industry HazCom unlabeled container",
        "findingDescription": "Chemical container in workshop missing hazard label.",
        "context": {"authority": "OSHA", "industry": "general_industry", "workArea": "workshop", "equipment": "chemical container", "task": "N/A"},
        "expected": {"hazardFamily": "hazardous_materials", "hazardMechanism": "chemical_exposure", "equipment": "chemical container", "primaryCitation": "29 CFR 1910.1200(f)(1)", "acceptableCitations": ["29 CFR 1910.1200(f)(1)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": False, "minimumCorrectiveActionElements": ["label", "verify"]}
    },
    {
        "id": "OSHA-GI-CONFINED-001",
        "title": "confined space entry controls missing",
        "findingDescription": "Employee entered permitted confined space without entry permit or monitoring.",
        "context": {"authority": "OSHA", "industry": "general_industry", "workArea": "tank", "equipment": "tank", "task": "entry"},
        "expected": {"hazardFamily": "confined_space", "hazardMechanism": "asphyxiation", "equipment": "tank", "primaryCitation": "29 CFR 1910.146(c)(1)", "acceptableCitations": ["29 CFR 1910.146(c)(1)"], "requiresCorrectiveAction": True, "requiresShutdownOrImmediateControl": True, "minimumCorrectiveActionElements": ["permit", "atmospheric_testing", "attendant", "verify"]}
    }
]

# Load existing
data = json.loads(BENCHMARK_FILE.read_text())
existing_ids = {case['id'] for case in data}

# Add new cases
added_count = 0
for case in new_cases:
    if case['id'] not in existing_ids:
        data.append(case)
        added_count += 1

# Check total count
if len(data) != 25:
    raise ValueError(f"Final count is not 25, got: {len(data)}")

# Write benchmark file
BENCHMARK_FILE.write_text(json.dumps(data, indent=2))

# Ensure directory exists
PLAN_FILE.parent.mkdir(parents=True, exist_ok=True)

# Write expansion plan
plan_content = f"""# Safescope 25-Case Benchmark Expansion Plan

## Objective
Expand the existing Safescope benchmark dataset from 4 cases to 25 cases to improve the audit engine's coverage and robustness.

## Execution
- Added 21 new cases covering MSHA and OSHA regulatory domains.
- Total cases after expansion: {len(data)}.
- Verification: Script validated final count equals 25.

## Citation Verification Notes
- Citations selected are conservative estimates based on standard regulatory interpretations.
- Specific CFR parts correspond to general hazard categories (e.g., LOTO, Machine Guarding).
- Periodic audits are recommended to ensure citation accuracy as regulatory standards evolve.
"""
PLAN_FILE.write_text(plan_content)

print(f"Benchmark updated with {added_count} new cases. Final count: {len(data)}")
