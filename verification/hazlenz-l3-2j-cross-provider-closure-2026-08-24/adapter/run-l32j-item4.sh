#!/bin/zsh
# L3-2j item (4) -- cross-provider closure on the SHIPPED v6 LADDER.
#
# FIVE SEPARATE PROCESSES, section 38.3. The noise-floor control never shares a process with the
# variant it controls, and the shim is restarted between every run so no client-side state is shared.
#
#   1 SHIPPED_A     activate-l32j-shipped-corpus.ts  ONLY=V_PRE_ACTIVATION  -- shipped prompt+schema
#   2 SHIPPED_B     the same again, OWN PROCESS                             -- NOISE FLOOR
#   3 V_B_LADDER    locked harness, the shipped ladder                      -- second instrument
#   4 V_A_LADDER    locked harness, section 36.7 variant A                  -- ORDER SENSITIVITY
#   5 V_S_STRUCT    locked harness, structural                              -- MODEL-DRIFT CONTROL
#                                                                             vs the frozen L3-2h rows
set -u
SCRATCH="$1"
BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
export GEMINI_MODEL_ID='gemini-3.1-pro-preview'
export THINKING_LEVEL='low'
export SHIM_PORT=11435
export L3_OLLAMA_ENDPOINT="http://127.0.0.1:11435"
export L3_OLLAMA_MODEL="gemini-3.1-pro-preview"
export L3_OLLAMA_TIMEOUT_MS=300000

run_one () {   # $1 label   $2 script   $3 ONLY value
  local LABEL="$1" SCRIPT="$2" VAR="$3"
  echo "=================== $LABEL ($VAR) ==================="
  export TRANSPORT_LOG="$SCRATCH/transport-$LABEL.jsonl"
  node "$SCRATCH/gemini-ollama-shim.js" > "$SCRATCH/shim-$LABEL.log" 2>&1 &
  local SHIM_PID=$!
  sleep 2
  ( cd "$BACKEND" && ONLY="$VAR" OUT="$SCRATCH/l32j4-gemini-$LABEL.json" \
      ./node_modules/.bin/ts-node --transpile-only "scripts/$SCRIPT" ) \
      > "$SCRATCH/run-$LABEL.log" 2>&1
  echo "exit=$? label=$LABEL pid_of_shim=$SHIM_PID"
  kill $SHIM_PID 2>/dev/null
  wait $SHIM_PID 2>/dev/null
  sleep 1
}

run_one SHIPPED_A  activate-l32j-shipped-corpus.ts   V_PRE_ACTIVATION
run_one SHIPPED_B  activate-l32j-shipped-corpus.ts   V_PRE_ACTIVATION
run_one V_B_LADDER ablate-l32g-state-separation.ts   V_B_LADDER
run_one V_A_LADDER ablate-l32g-state-separation.ts   V_A_LADDER
run_one V_S_STRUCT ablate-l32g-state-separation.ts   V_S_STRUCT
echo "ALL RUNS COMPLETE"
