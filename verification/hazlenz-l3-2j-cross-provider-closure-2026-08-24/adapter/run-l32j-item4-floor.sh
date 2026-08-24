#!/bin/zsh
# The LADDER noise floor, inside the LOCKED instrument. ONLY=V_B_LADDER again, in its OWN process
# with its OWN shim, per section 38.3. Section 39.6's lesson: an order-sensitivity signal that is not
# read against a floor measured in the SAME instrument cannot carry a claim.
set -u
SCRATCH="$1"
BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
export GEMINI_MODEL_ID='gemini-3.1-pro-preview' THINKING_LEVEL='low' SHIM_PORT=11435
export L3_OLLAMA_ENDPOINT="http://127.0.0.1:11435" L3_OLLAMA_MODEL="gemini-3.1-pro-preview" L3_OLLAMA_TIMEOUT_MS=300000
export TRANSPORT_LOG="$SCRATCH/transport-V_B_LADDER_REPEAT.jsonl"
node "$SCRATCH/gemini-ollama-shim.js" > "$SCRATCH/shim-V_B_LADDER_REPEAT.log" 2>&1 &
SHIM_PID=$!
sleep 2
( cd "$BACKEND" && ONLY=V_B_LADDER OUT="$SCRATCH/l32j4-gemini-V_B_LADDER_REPEAT.json" \
    ./node_modules/.bin/ts-node --transpile-only scripts/ablate-l32g-state-separation.ts ) \
    > "$SCRATCH/run-V_B_LADDER_REPEAT.log" 2>&1
echo "exit=$?"
kill $SHIM_PID 2>/dev/null; wait $SHIM_PID 2>/dev/null
echo "LADDER FLOOR RUN COMPLETE"
