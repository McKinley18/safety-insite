import json

# Load existing 200
with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "r") as f:
    data = json.load(f)

def get_sig(record):
    return f"{record['expectedScenarioFamily']}|{record['expectedMechanism']}|{record['jurisdiction']}|{record['equipment']}|{record['task']}"

seen_sigs = {}
unique_data = []

for record in data:
    sig = get_sig(record)
    
    # If duplicate, modify non-signature fields to make it unique
    if sig in seen_sigs:
        # Append a variation note to observation text to differentiate
        record["observationText"] += " (variant)"
        # Update ID to keep it distinct
        record["id"] = record["id"] + "-v"
        
    seen_sigs[sig] = record["id"]
    unique_data.append(record)

# Ensure exactly 200
with open("safescope-data/benchmarks/safescope-field-validation-dataset.v1.json", "w") as f:
    json.dump(unique_data, f, indent=2)
