#!/bin/bash
# Validate SafeScope v2 Deterministic Engine
# Usage: ./scripts/validate-safescope-v2.sh

cases=(
  "exposed electrical wiring|Electrical|high|false|30 CFR 56.12016"
  "missing machine guard on pulley|Machine|high|false|30 CFR 56.14107(a)"
  "open edge on second floor|Fall|high|false|1926.501"
  "aisle blocked by boxes|Housekeeping|high|false|1910.37"
  "no hard hat|PPE|high|false|1910.135"
  "forklift operating near pedestrians|Powered Mobile Equipment|high|false|1910.178"
  "no safety glasses|PPE|high|false|1910.133"
  "oil spill on walkway|Housekeeping|high|false|56.20003"
  "damaged electrical cable|Electrical|high|false|30 CFR 56.12016"
  "unguarded gear train|Machine|high|false|30 CFR 56.14107(a)"
  "ladder not extended 3 feet|Fall|high|false|1926.1053"
  "no guardrail on mezzanine|Fall|high|true|1926.501"
  "no gloves for chemical handling|PPE|medium|false|1910.132"
  "backing vehicle no alarm|Powered Mobile Equipment|high|false|30 CFR 56.9100"
  "unlabeled chemical containers|Hazard Communication|medium|false|1910.1200"
  "temporary wiring through doorway|Electrical|high|false|1926.405"
  "blocked access to exit|Housekeeping|high|false|1910.37"
  "something feels unsafe|Review Required|low|true|"
  "equipment looks damaged|Review Required|low|true|"
  "area needs cleanup|Housekeeping|medium|false|56.20003"
  "safety gear missing|PPE|medium|false|1910.132"
  "crusher drive guard detached|Machine|high|false|30 CFR 56.14107(a)"
  "no traffic control for mobile equipment|Powered Mobile Equipment|high|false|30 CFR 56.9200"
  "live wire hanging|Electrical|high|false|1910.303"
  "person not wearing helmet|PPE|high|false|1910.135"
)

echo "--- SafeScope v2 Regression Report ---"
printf "%-35s | %-12s | %-10s | %-5s\n" "Input" "Family" "Review" "Citation"
echo "-----------------------------------------------------------------------------------"

passed=0
total=${#cases[@]}

for row in "${cases[@]}"; do
  IFS='|' read -r input expectedFamily expectedBand expectedReview expectedCitation <<< "$row"
  
  response=$(curl -s -X POST http://localhost:4000/safescope-v2/classify \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$input\"}")
  
  family=$(printf '%s' "$response" | python3 -c "import sys,json; data=sys.stdin.read().strip(); print(json.loads(data).get('classification','N/A') if data.startswith('{') else 'N/A')")
  review=$(printf '%s' "$response" | python3 -c "import sys,json; data=sys.stdin.read().strip(); print(str(json.loads(data).get('requiresHumanReview','N/A')).lower() if data.startswith('{') else 'N/A')")
  standards=$(printf '%s' "$response" | python3 -c "import sys,json; data=sys.stdin.read().strip(); print(str(json.loads(data).get('suggestedStandards',[])) if data.startswith('{') else '[]')")
  
  match=$([[ "$family" == "$expectedFamily" && "$review" == "$expectedReview" ]] && echo "✅" || echo "❌")
  if [[ "$match" == "✅" ]]; then passed=$((passed+1)); fi

  printf "%-35s | %-12s | %-10s | %-5s\n" "${input:0:33}" "$family" "$review" "$match"
done

echo "-----------------------------------------------------------------------------------"
echo "Accuracy: $((passed * 100 / total))%"


echo ""
echo "--- SafeScope v2 Ambiguity Governance Tests ---"
printf "%-45s | %-30s | %-10s\n" "Input" "Classification" "Review"
echo "------------------------------------------------------------------------------------------------"

ambiguity_cases=(
  "guardrail missing near moving conveyor"
  "forklift operating near open edge"
  "electrical cord across walkway causing trip hazard"
  "worker without hard hat near mobile equipment"
  "oil spill near electrical panel"
)

for input in "${ambiguity_cases[@]}"; do

  response=$(curl -s -X POST http://localhost:4000/safescope-v2/classify \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$input\"}")

  family=$(printf '%s' "$response" | python3 -c "import sys,json; data=sys.stdin.read().strip(); print(json.loads(data).get('classification','N/A') if data.startswith('{') else 'N/A')")
  review=$(printf '%s' "$response" | python3 -c "import sys,json; data=sys.stdin.read().strip(); print(str(json.loads(data).get('requiresHumanReview','N/A')).lower() if data.startswith('{') else 'N/A')")
  ambiguity=$(printf '%s' "$response" | python3 -c "import sys,json; data=sys.stdin.read().strip(); print(json.loads(data).get('ambiguityWarnings',[]) if data.startswith('{') else [])")

  printf "%-45s | %-30s | %-10s\n" "${input:0:43}" "$family" "$review"

  echo "  ambiguityWarnings: $ambiguity"
  echo ""

done
