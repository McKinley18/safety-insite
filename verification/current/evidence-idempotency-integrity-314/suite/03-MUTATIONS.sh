#!/bin/bash
# §314 / BR-8 — THE MUTATION PROGRAM.
#
# Every control the repair added is removed one at a time and the suite must FAIL. A control whose
# removal the suite does not notice is a control the suite is not testing, and recording it as proven
# would be false. The source is restored from a pristine copy after each mutation and the restoration
# is verified BY DIGEST rather than by looking at the file.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
RIG=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s314
PRISTINE_SHA=$(cut -d' ' -f1 < "$RIG/pristine.sha256")
SRC=src/storage/storage.service.ts

restart() {
  pkill -f "node dist/main.js" 2>/dev/null; sleep 2
  ( set -a; . "$RIG/app.env"; set +a; nohup node dist/main.js > "$RIG/app.log" 2>&1 & )
  for i in $(seq 1 30); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4314/health)" = "200" ] && return 0
    sleep 1
  done
  echo "  app did not come up"; return 1
}

restore() {
  cp "$RIG/storage.service.ts.pristine" "$SRC"
  local now; now=$(shasum -a 256 "$SRC" | cut -d' ' -f1)
  if [ "$now" = "$PRISTINE_SHA" ]; then
    echo "  restored byte-identically ($now)"
  else
    echo "  RESTORE FAILED — $now != $PRISTINE_SHA"; exit 2
  fi
}

overall=0
for m in replay-put ownership different-payload concurrency stale-digest; do
  echo ""
  echo "=============================================================================="
  echo "MUTATION: $m"
  echo "=============================================================================="
  python3 "$RIG/mutate.py" "$m" || exit 2
  if ! npm run build >/dev/null 2>&1; then
    echo "  RESULT: mutation does not compile — recorded as DETECTED_AT_BUILD"
    restore; npm run build >/dev/null 2>&1
    continue
  fi
  restart || exit 2
  OUT=$(bash "$RIG/02-AFTER.sh" 2>&1)
  RESULT=$(echo "$OUT" | tail -2 | head -1)
  echo "  suite result: $RESULT"
  echo "$OUT" | grep '^FAIL' | sed 's/^/    /' | head -12
  echo "$OUT" > "$RIG/03-mutation-$m.txt"
  if echo "$RESULT" | grep -qE '^[0-9]+ passed, 0 failed$'; then
    echo "  >>> NOT DETECTED — the suite passed with this control removed"
    overall=1
  else
    echo "  >>> DETECTED"
  fi
  restore
done

echo ""
echo "=============================================================================="
npm run build >/dev/null 2>&1
restart >/dev/null 2>&1
FINAL=$(shasum -a 256 "$SRC" | cut -d' ' -f1)
echo "final source digest  $FINAL"
echo "pristine digest      $PRISTINE_SHA"
[ "$FINAL" = "$PRISTINE_SHA" ] && echo "SOURCE RESTORED BYTE-IDENTICALLY" || { echo "SOURCE NOT RESTORED"; overall=1; }
[ "$overall" = "0" ] && echo "ALL MUTATIONS DETECTED" || echo "AT LEAST ONE MUTATION WAS NOT DETECTED"
exit $overall
