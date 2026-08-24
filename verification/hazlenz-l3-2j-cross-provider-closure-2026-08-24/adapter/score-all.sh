#!/bin/zsh
set -u
SCR="$1"
BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
V="/Users/mckinley/Desktop/Safety_InSite/verification"
cd "$BACKEND"

# --- merge the Gemini locked-harness variants into ONE row set (rows verbatim, no marshalling
#     beyond concatenation -- the scorers accept at most two input paths). Same method as L3-2h. ---
python3 - "$SCR" <<'PY'
import json, sys, os
SCR = sys.argv[1]
labels = ['V_B_LADDER', 'V_A_LADDER', 'V_S_STRUCT', 'V_B_LADDER_REPEAT']
base = None; rows = []
for lab in labels:
    p = f"{SCR}/l32j4-gemini-{lab}.json"
    if not os.path.exists(p): continue
    d = json.load(open(p))
    if base is None: base = {k: v for k, v in d.items() if k != 'rows'}
    else: base.setdefault('variants', []).extend(d['variants'])
    # V_B_LADDER_REPEAT re-uses the V_B_LADDER variant id; rename it so the scorer can see the pair.
    for r in d['rows']:
        if lab == 'V_B_LADDER_REPEAT': r = {**r, 'variant': 'V_B_LADDER_REPEAT'}
        rows.append(r)
base['rows'] = rows
base['provider'] = 'google:gemini-3.1-pro-preview'
json.dump(base, open(f"{SCR}/l32j4-gemini-locked-merged.json", 'w'), indent=2)
print(f"merged {len(rows)} rows from {labels}")
PY

echo "############## GEMINI -- locked scorers, byte-unmodified ##############"
echo "===== order sensitivity ====="
IN1="$SCR/l32j4-gemini-locked-merged.json" OUT="$SCR/gemini-order-sensitivity-shipped-ladder.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/score-l32g-order-sensitivity.ts
echo "===== fact coherence ====="
IN1="$SCR/l32j4-gemini-locked-merged.json" OUT="$SCR/gemini-fact-coherence-drift-control.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/score-l32g-fact-coherence.ts
echo "===== resolution ablation (HC gate, R0/R1/R2) ====="
IN="$SCR/l32j4-gemini-locked-merged.json" OUT="$SCR/gemini-resolution-drift-control.json" \
  ./node_modules/.bin/ts-node --transpile-only scripts/rederive-l32g-resolution.ts
echo "SCORING COMPLETE"
