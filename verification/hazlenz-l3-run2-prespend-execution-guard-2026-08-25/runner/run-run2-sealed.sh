#!/bin/zsh
# L3 RUN-2 SINGLE-USE SEALED ACCEPTANCE -- two isolated processes (section 38.3), A then B.
#
# Each process runs ALL 93 rows and gets its OWN freshly started frozen shim. The shim, the
# driver's frozen stages, the prompt, the schema, the validator, the binder and the input builder
# are all unmodified. Only the process label and the output path differ between A and B.
#
# `D-K` PROCESS-PAIR COORDINATION. Both processes share ONE global abort file, DK_ABORT_FLAG.
# By `D-G.2` the complete Run-2 measurement requires set equality of evaluated row ids with
# expected row ids in EVERY required process, so the first required unevaluated row in EITHER
# process already makes the complete measurement impossible. Therefore:
#   * the runner checks the flag BETWEEN ROWS and issues no new request once it exists;
#   * process B inherits the flag written by process A and, if A aborted, issues ZERO requests;
#   * this shell refuses to start B at all when the flag is already set, so not one further
#     provider connection is opened.
# This is exactly the Run-1 pattern being prevented: in Run 1, process B issued 92 further calls
# after complete-run scorability had already become impossible in process A.
#
# THE FLAG MUST NOT PRE-EXIST. A stale flag would silently zero the run, so this script refuses to
# start when one is present. It never deletes it -- deciding to discard a previous abort record is
# a governance act, not a shell convenience.
#
# THIS SCRIPT DOES NOT AUTHORIZE ITS OWN EXECUTION. Running it transmits Run-2 rows and flips
# RUN2_HOLDOUT_SPENT to TRUE permanently, whatever the result (section 29.8, `D-H`).
set -u
R="/Users/mckinley/Desktop/Safety_InSite"
G="$R/verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25"
P="${RUN2_RUN_DIR:?RUN2_RUN_DIR must be set to the authorized Run-2 acceptance run directory}"
SHIM="$R/verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js"

export ANTHROPIC_MODEL_ID="claude-sonnet-5"
export L3_OLLAMA_MODEL="claude-sonnet-5"
export L3_OLLAMA_TIMEOUT_MS=300000
export SPEND_LOG="$P/spend/SPEND_TRANSITION.jsonl"
export DK_ABORT_FLAG="$P/spend/D_K_ABORT.json"
export DK_ABORT_LOG="$P/spend/D_K_ABORT.jsonl"

mkdir -p "$P/spend" "$P/results" "$P/runner" "$P/transport"

if [[ -e "$DK_ABORT_FLAG" ]]; then
  echo "REFUSING TO START: a D-K abort flag already exists at $DK_ABORT_FLAG"
  echo "A stale flag would zero this run. Clearing it is a governance decision, not a shell action."
  exit 2
fi

run_one () {
  local LABEL="$1" PORT="$2"
  if [[ -e "$DK_ABORT_FLAG" ]]; then
    echo "=========== process $LABEL NOT STARTED -- D-K global abort already established ==========="
    cat "$DK_ABORT_FLAG"
    echo "0 provider connections opened for process $LABEL."
    return 0
  fi
  echo "=========== RUN-2 SEALED ACCEPTANCE process $LABEL -> claude-sonnet-5 (port $PORT) ==========="
  export SHIM_PORT="$PORT"
  export L3_OLLAMA_ENDPOINT="http://127.0.0.1:$PORT"
  export TRANSPORT_LOG="$P/transport/transport-$LABEL.jsonl"
  node "$SHIM" > "$P/runner/shim-$LABEL.log" 2>&1 &
  local SHIM_PID=$!
  sleep 2
  ( cd "$R/backend" && PROCESS_LABEL="$LABEL" OUT="$P/results/raw-process-$LABEL.json" \
      ./node_modules/.bin/ts-node --transpile-only "$G/runner/run-run2-acceptance.ts" ) \
      > "$P/runner/run-$LABEL.log" 2>&1
  local RC=$?
  echo "process $LABEL exit=$RC shim_pid=$SHIM_PID"
  kill -TERM $SHIM_PID 2>/dev/null; wait $SHIM_PID 2>/dev/null; sleep 1
}

run_one A 11441
run_one B 11442

if [[ -e "$DK_ABORT_FLAG" ]]; then
  echo "D-K FIRED. SCORABLE = FALSE. HOLDOUT_SPENT stays TRUE. Offsets stay RETIRED. No automatic rerun."
  cat "$DK_ABORT_FLAG"
fi
echo "RUN-2 SEALED ACCEPTANCE RUN COMPLETE"
