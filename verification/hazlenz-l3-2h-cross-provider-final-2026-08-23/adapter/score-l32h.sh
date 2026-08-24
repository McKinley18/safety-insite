#!/bin/zsh
# Scores the Gemini run and the qwen baseline with the SAME byte-unmodified companion scorers.
# The only marshalling is concatenating the three per-variant row sets into one file, because the
# scorers accept at most two input paths. No scorer, scenario, label or resolver is touched.
set -eu
SCRATCH="/private/tmp/claude-501/-Users-mckinley/ebf95867-ea95-4c5e-a192-d5d46f500721/scratchpad"
BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
L32H="/Users/mckinley/Desktop/Safety_InSite/verification/hazlenz-l3-2h-cross-provider-2026-08-23/results"

# --- merge the three Gemini per-variant artifacts, rows verbatim ---
python3 - <<PY
import json
base=None; rows=[]
for v in ['V_S_STRUCT','V_S_STRUCT_MOVE1','V_S_STRUCT_REPEAT']:
    d=json.load(open(f"$SCRATCH/l32h-gemini-{v}.json"))
    if base is None: base={k:val for k,val in d.items() if k!='rows'}
    rows.extend(d['rows'])
base['rows']=rows
base['provider']='google:gemini-3.1-pro-preview'
json.dump(base, open("$SCRATCH/l32h-gemini-merged.json",'w'), indent=2)
print(f"merged {len(rows)} rows")
PY

cd "$BACKEND"
echo "############################## GEMINI 3.1 PRO ##############################"
echo "===== order sensitivity ====="
IN1="$SCRATCH/l32h-gemini-merged.json" OUT="$SCRATCH/gemini-order-sensitivity.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/score-l32g-order-sensitivity.ts
echo "===== fact coherence ====="
IN1="$SCRATCH/l32h-gemini-merged.json" OUT="$SCRATCH/gemini-fact-coherence.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/score-l32g-fact-coherence.ts
echo "===== resolution ablation (HC gate, R0/R1/R2) ====="
IN="$SCRATCH/l32h-gemini-merged.json" OUT="$SCRATCH/gemini-resolution.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/rederive-l32g-resolution.ts

echo ""
echo "###################### QWEN3-CODER:30B BASELINE (L3-2g/h) ######################"
# IN2 loaded after IN1, so the ISOLATED repeat overwrites the same-process one — §38.3's requirement.
echo "===== order sensitivity ====="
IN1="$L32H/baseline-repro.json" IN2="$L32H/repeat-isolated.json" \
  OUT="$SCRATCH/qwen-order-sensitivity.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/score-l32g-order-sensitivity.ts
echo "===== fact coherence ====="
IN1="$L32H/baseline-repro.json" IN2="$L32H/repeat-isolated.json" \
  OUT="$SCRATCH/qwen-fact-coherence.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/score-l32g-fact-coherence.ts
echo "===== resolution ablation (HC gate, R0/R1/R2) ====="
IN="$L32H/baseline-repro.json" OUT="$SCRATCH/qwen-resolution.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/rederive-l32g-resolution.ts
echo "SCORING COMPLETE"
