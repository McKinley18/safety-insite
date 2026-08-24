#!/bin/zsh
# L3-2o PROVIDER QUALIFICATION -- already-open diagnostic material ONLY.
# FOUR SEPARATE PROCESSES PER MODEL, section 38.3. The shim is restarted between every run.
# Mirrors L3-2n/adapter/run-qual.sh; only the shim and the model variable differ.
set -u
S="$1"; MODEL="$2"; TAG="$3"
BACKEND="/Users/mckinley/Desktop/Safety_InSite/backend"
export ANTHROPIC_MODEL_ID="$MODEL"
export SHIM_PORT=11438
export L3_OLLAMA_ENDPOINT="http://127.0.0.1:11438"
export L3_OLLAMA_MODEL="$MODEL"
export L3_OLLAMA_TIMEOUT_MS=300000

run_one () {
  local LABEL="$1" SCRIPT="$2" VAR="$3"
  echo "=========== $TAG / $LABEL ($VAR) -> $MODEL ==========="
  export TRANSPORT_LOG="$S/transport/transport-$TAG-$LABEL.jsonl"
  node "$S/adapter/anthropic-ollama-shim.js" > "$S/adapter/shim-$TAG-$LABEL.log" 2>&1 &
  local SHIM_PID=$!
  sleep 2
  ( cd "$BACKEND" && ONLY="$VAR" OUT="$S/results/$TAG-$LABEL.json" \
      ./node_modules/.bin/ts-node --transpile-only "scripts/$SCRIPT" ) \
      > "$S/adapter/run-$TAG-$LABEL.log" 2>&1
  echo "exit=$? label=$LABEL shim_pid=$SHIM_PID"
  kill -TERM $SHIM_PID 2>/dev/null; wait $SHIM_PID 2>/dev/null; sleep 1
}

run_one SHIPPED_A activate-l32j-shipped-corpus.ts     V_PRE_ACTIVATION
run_one SHIPPED_B activate-l32j-shipped-corpus.ts     V_PRE_ACTIVATION
run_one WC09      diagnose-l32k-shipped-residual.ts   D_WC09_LADDER
run_one CS05_B    diagnose-l32k-shipped-residual.ts   D_CS05_LADDER_B
echo "$TAG COMPLETE"
