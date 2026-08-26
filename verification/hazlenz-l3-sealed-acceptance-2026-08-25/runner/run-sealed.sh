#!/bin/zsh
# L3 FINAL SINGLE-USE SEALED ACCEPTANCE -- two isolated processes (section 38.3), A then B.
# Each process runs ALL 92 rows and gets its OWN freshly started frozen shim.
# The shim, the driver, the prompt, the schema, the validator, the binder and the input builder
# are all unmodified. Only the process label and the output path differ between A and B.
set -u
R="/Users/mckinley/Desktop/Safety_InSite"
P="$R/verification/hazlenz-l3-sealed-acceptance-2026-08-25"
SHIM="$R/verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js"

export ANTHROPIC_MODEL_ID="claude-sonnet-5"
export L3_OLLAMA_MODEL="claude-sonnet-5"
export L3_OLLAMA_TIMEOUT_MS=300000
export SPEND_LOG="$P/spend/SPEND_TRANSITION.jsonl"

run_one () {
  local LABEL="$1" PORT="$2"
  echo "=========== SEALED ACCEPTANCE process $LABEL -> claude-sonnet-5 (port $PORT) ==========="
  export SHIM_PORT="$PORT"
  export L3_OLLAMA_ENDPOINT="http://127.0.0.1:$PORT"
  export TRANSPORT_LOG="$P/transport/transport-$LABEL.jsonl"
  node "$SHIM" > "$P/runner/shim-$LABEL.log" 2>&1 &
  local SHIM_PID=$!
  sleep 2
  ( cd "$R/backend" && PROCESS_LABEL="$LABEL" OUT="$P/results/raw-process-$LABEL.json" \
      ./node_modules/.bin/ts-node --transpile-only "$P/runner/run-sealed-acceptance.ts" ) \
      > "$P/runner/run-$LABEL.log" 2>&1
  local RC=$?
  echo "process $LABEL exit=$RC shim_pid=$SHIM_PID"
  kill -TERM $SHIM_PID 2>/dev/null; wait $SHIM_PID 2>/dev/null; sleep 1
}

run_one A 11441
run_one B 11442
echo "SEALED ACCEPTANCE RUN COMPLETE"
