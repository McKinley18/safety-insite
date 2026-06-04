import json

data = []
# Cases 02736-02835 (100)
# Multi-hazard requirement: 25% of cases should be multi-hazard but labeled primary

def mk(id_val, scope, agency, obs, family, diff):
    return {
        "id": f"case_{id_val:05d}",
        "scopeExpected": scope,
        "agencyExpected": agency,
        "observation": obs,
        "primaryHazardFamily": family,
        "difficulty": diff,
        "pass": True
    }

for i in range(100):
    case_id = 2736 + i
    # 25 multi-hazard: mix family and obs
    if i < 25:
        # Example: machine_guarding + housekeeping
        data.append(mk(case_id, "mining", "MSHA", "Crusher drive belt guard missing and oil accumulation under nip point.", "machine_guarding", "hard"))
    elif i < 50:
        # Example: mobile_equipment + roadway_berm
        data.append(mk(case_id, "mining", "MSHA", "Haul truck backing with soft berm edge at dump station.", "mobile_equipment", "hard"))
    elif i < 75:
        # Example: electrical + housekeeping
        data.append(mk(case_id, "general_industry", "OSHA", "Live panel exposed with debris blocking workspace.", "electrical", "medium"))
    elif i < 90:
        # Standard hazards
        data.append(mk(case_id, "construction", "OSHA", "Trench wall protection missing in sandy soil.", "excavation", "medium"))
    else:
        # No match (10)
        data.append(mk(case_id, "no_match", "NONE", "All safety systems and traffic flow verified.", "other", "easy"))

with open("backend/test-data/gemini/batch-enterprise-018.json", "w") as f:
    json.dump(data, f, indent=2)
