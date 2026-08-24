#!/bin/zsh
# L3-2k -- the ONE unresolved provider-side question: does Gemini's F-WC-09 ACTIVE candidate SURVIVE
# the semantic binder? Section 42's 13/13 is a MODEL-ASSERTED metric that stops before the binder, so
# it cannot answer this. Two isolated processes, section 38.3, shim restarted between them.
set -u
SCRATCH="$1"; BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
export GEMINI_MODEL_ID='gemini-3.1-pro-preview' THINKING_LEVEL='low' SHIM_PORT=11435
export L3_OLLAMA_ENDPOINT="http://127.0.0.1:11435" L3_OLLAMA_MODEL="gemini-3.1-pro-preview" L3_OLLAMA_TIMEOUT_MS=300000
for V in D_WC09_LADDER D_WC09_LADDER_REPEAT; do
  export TRANSPORT_LOG="$SCRATCH/l32k-transport-gemini-$V.jsonl"
  node "$SCRATCH/gemini-ollama-shim.js" > "$SCRATCH/l32k-shim-$V.log" 2>&1 &
  SP=$!; sleep 2
  ( cd "$BACKEND" && ONLY="$V" OUT="$SCRATCH/l32k-gemini-$V.json" \
      ./node_modules/.bin/ts-node --transpile-only scripts/diagnose-l32k-shipped-residual.ts )
  echo "exit=$? variant=$V"
  kill $SP 2>/dev/null; wait $SP 2>/dev/null; sleep 1
done
