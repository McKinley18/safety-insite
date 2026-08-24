#!/bin/zsh
# L3-2h cross-provider run. THREE SEPARATE HARNESS PROCESSES per §38.3 — the noise-floor control
# (V_S_STRUCT_REPEAT) must never share a process with the variant it controls. The shim is also
# restarted between variants so no client-side state is shared either.
set -u
SCRATCH="/private/tmp/claude-501/-Users-mckinley/ebf95867-ea95-4c5e-a192-d5d46f500721/scratchpad"
BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
export GEMINI_MODEL_ID='gemini-3.1-pro-preview'
export THINKING_LEVEL='low'
export SHIM_PORT=11435

export L3_OLLAMA_ENDPOINT="http://127.0.0.1:11435"
export L3_OLLAMA_MODEL="gemini-3.1-pro-preview"
export L3_OLLAMA_TIMEOUT_MS=300000

for V in V_S_STRUCT V_S_STRUCT_MOVE1 V_S_STRUCT_REPEAT; do
  echo "=================== $V ==================="
  export TRANSPORT_LOG="$SCRATCH/transport-$V.jsonl"
  node "$SCRATCH/gemini-ollama-shim.js" > "$SCRATCH/shim-$V.log" 2>&1 &
  SHIM_PID=$!
  sleep 2
  ( cd "$BACKEND" && ONLY="$V" OUT="$SCRATCH/l32h-gemini-$V.json" \
      ./node_modules/.bin/ts-node --transpile-only scripts/ablate-l32g-state-separation.ts ) \
      > "$SCRATCH/run-$V.log" 2>&1
  echo "exit=$? variant=$V"
  kill $SHIM_PID 2>/dev/null
  wait $SHIM_PID 2>/dev/null
  sleep 1
done
echo "ALL VARIANTS COMPLETE"
