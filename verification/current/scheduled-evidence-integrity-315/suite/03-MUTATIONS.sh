#!/bin/bash
# §315 / BR-9 — THE MUTATION PROGRAM.
#
# Every control §315 added is removed one at a time, and the gate suite plus the MO-1 suite must FAIL.
# A control whose removal nothing notices is a control nothing is testing, and recording it as proven
# would be false. Sources are restored from pristine copies, verified by digest.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
A=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s315
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"

GATE=scripts/ops/verify-evidence-digest-integrity.js
HEALTH=scripts/ops/check-backup-health.js
GATE_SHA=$(shasum -a 256 "$GATE" | cut -d' ' -f1)
HEALTH_SHA=$(shasum -a 256 "$HEALTH" | cut -d' ' -f1)
cp "$GATE" "$A/gate.pristine"; cp "$HEALTH" "$A/health.pristine"
echo "pristine gate   $GATE_SHA"
echo "pristine health $HEALTH_SHA"

restore() {
  cp "$A/gate.pristine" "$GATE"; cp "$A/health.pristine" "$HEALTH"
  local g h
  g=$(shasum -a 256 "$GATE" | cut -d' ' -f1); h=$(shasum -a 256 "$HEALTH" | cut -d' ' -f1)
  if [ "$g" = "$GATE_SHA" ] && [ "$h" = "$HEALTH_SHA" ]; then
    echo "  restored byte-identically"
  else
    echo "  RESTORE FAILED"; exit 2
  fi
}

overall=0
for m in full-hash size-only never-captured-exclusion unknown-passes incomplete-scan hash-failure aggregate-propagation mo1-dispatch; do
  echo ""
  echo "=============================================================================="
  echo "MUTATION: $m"
  echo "=============================================================================="
  python3 "$A/mutate.py" "$m" || exit 2
  if ! node --check "$GATE" >/dev/null 2>&1 || ! node --check "$HEALTH" >/dev/null 2>&1; then
    echo "  RESULT: does not parse — recorded as DETECTED_AT_PARSE"
    restore; continue
  fi
  # The tally line is selected by SHAPE, not by position. An earlier version of this harness took
  # `tail -2 | head -1`, which picked the "==== RESULT ====" separator — so every mutation matched the
  # "not all zero" test and every mutation was reported DETECTED. Two of them were not.
  GOUT=$(bash "$A/01-GATES.sh" 2>&1); GRES=$(echo "$GOUT" | grep -E "^[0-9]+ passed, [0-9]+ failed$" | tail -1)
  MOUT=$(bash "$A/02-MO1.sh" 2>&1);  MRES=$(echo "$MOUT" | grep -E "^[0-9]+ passed, [0-9]+ failed$" | tail -1)
  GFAIL=$(echo "$GRES" | sed -E 's/.*, ([0-9]+) failed$/\1/'); MFAIL=$(echo "$MRES" | sed -E 's/.*, ([0-9]+) failed$/\1/')
  echo "  gates suite: $GRES"
  echo "  MO-1  suite: $MRES"
  echo "$GOUT" | grep '^FAIL' | sed 's/^/    /' | head -6
  echo "$MOUT" | grep '^FAIL' | sed 's/^/    /' | head -4
  echo "$GOUT" > "$A/03-mutation-$m-gates.txt"; echo "$MOUT" > "$A/03-mutation-$m-mo1.txt"
  if [ "${GFAIL:-0}" = "0" ] && [ "${MFAIL:-0}" = "0" ]; then
    echo "  >>> NOT DETECTED — both suites passed with this control removed"
    overall=1
  else
    echo "  >>> DETECTED"
  fi
  restore
done

echo ""
echo "=============================================================================="
G=$(shasum -a 256 "$GATE" | cut -d' ' -f1); H=$(shasum -a 256 "$HEALTH" | cut -d' ' -f1)
echo "final gate   $G"
echo "final health $H"
if [ "$G" = "$GATE_SHA" ] && [ "$H" = "$HEALTH_SHA" ]; then echo "SOURCES RESTORED BYTE-IDENTICALLY"; else echo "SOURCES NOT RESTORED"; overall=1; fi
[ $overall -eq 0 ] && echo "ALL MUTATIONS DETECTED" || echo "AT LEAST ONE MUTATION WAS NOT DETECTED"
exit $overall
