import json

data = []
# MSHA Mining: 50 (20 mobile, 15 roadway, 10 interaction, 5 access)
# OSHA Con: 25 (10 mobile, 10 traffic, 5 struck_by)
# OSHA Gen: 15 (10 forklift, 5 traffic)
# No Match: 10

def mk(id_val, scope, agency, obs, family, diff, is_no_match=False):
    return {
        "id": f"case_{id_val:05d}",
        "scopeExpected": scope,
        "agencyExpected": agency,
        "observation": obs,
        "primaryHazardFamily": family,
        "difficulty": diff,
        "pass": True
    }

# Mining
for i in range(20): data.append(mk(2636+i, "mining", "MSHA", f"Haul truck {i+1} backup alarm low volume on morning shift.", "mobile_equipment", "medium"))
for i in range(15): data.append(mk(2656+i, "mining", "MSHA", f"Dump point edge {i+1} berm height reduced due to rain.", "roadway_berm", "medium"))
for i in range(10): data.append(mk(2671+i, "mining", "MSHA", f"Pedestrian crossing active haul road {i+1} near blind spot.", "traffic_interaction", "hard"))
for i in range(5):  data.append(mk(2681+i, "mining", "MSHA", f"Loader cabin handrail loose, bolt missing {i+1}.", "safe_access", "easy"))

# Construction
for i in range(10): data.append(mk(2686+i, "construction", "OSHA", f"Telehandler visibility poor during site loadout {i+1}.", "mobile_equipment", "medium"))
for i in range(10): data.append(mk(2696+i, "construction", "OSHA", f"Laborer walking through swing radius of excavator {i+1}.", "traffic_interaction", "hard"))
for i in range(5):  data.append(mk(2706+i, "construction", "OSHA", f"Worker struck by falling material from overhead {i+1}.", "struck_by", "hard"))

# General Industry
for i in range(10): data.append(mk(2711+i, "general_industry", "OSHA", f"Warehouse lift driver exceeding speed limit near rack {i+1}.", "powered_industrial_truck", "medium"))
for i in range(5):  data.append(mk(2721+i, "general_industry", "OSHA", f"Traffic flow blocked at loading dock entry {i+1}.", "traffic_interaction", "easy"))

# No Match
for i in range(10): data.append(mk(2726+i, "no_match", "NONE", "Safety equipment functioning normally.", "other", "easy"))

with open("backend/test-data/gemini/batch-enterprise-017.json", "w") as f:
    json.dump(data, f, indent=2)
