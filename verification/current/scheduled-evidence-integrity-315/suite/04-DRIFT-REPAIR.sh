#!/bin/bash
# §315 — THE INSTALLED-RUNNER DRIFT, AND WHAT IT WAS ACTUALLY COSTING.
#
# §315 found that the installed launchd runner had been carrying the §312A copy of
# reconcile-evidence-recovery.js since §312A, while the checkout moved to the §313 copy. The §313
# change is not cosmetic: it taught the reconciler that `account_evidence_erased` — the action BR-7
# account deletion writes — is an AUTHORIZED ERASURE.
#
# This proves the consequence rather than asserting it: the same synthetic account-erased object is
# put in front of BOTH versions, and only the current one writes the erasure tombstone that refuses a
# later restore. Both are run from copies, so nothing installed or checked out is modified.
set -u
A=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s315
. "$A/lib.sh"
cd /Users/mckinley/Desktop/Safety_InSite/backend

STALE="$A/reconcile-STALE-5538df3b.js"
CURRENT=scripts/ops/reconcile-evidence-recovery.js
git -C /Users/mckinley/Desktop/Safety_InSite show 5538df3b:backend/scripts/ops/reconcile-evidence-recovery.js > "$STALE"
echo "  stale copy  (what launchd was running): $(shasum -a 256 "$STALE" | cut -d' ' -f1 | cut -c1-16)…"
echo "  current     (what the checkout has)   : $(shasum -a 256 "$CURRENT" | cut -d' ' -f1 | cut -c1-16)…"

# One synthetic object, erased the way ACCOUNT DELETION erases: row tombstoned, bytes gone from the
# live bucket, and an `account_evidence_erased` audit row recording the authority.
setup() {
  reset_rig
  mkpayload A "$A/A.bin"
  add_object cccccccc-cccc-cccc-cccc-cccccccccccc evidence/2026-09-18/acct "$A/A.bin"
  # capture a recovery generation FIRST, so there is something an erasure must retire
  node "$CURRENT" --apply >/dev/null 2>&1
  PG -c "update storage_objects set status='deleted', \"deletedAt\"=now() where id='cccccccc-cccc-cccc-cccc-cccccccccccc';" >/dev/null
  PG -c "insert into security_audit_events (action,\"resourceType\",\"resourceId\") values ('account_evidence_erased','storage_object','cccccccc-cccc-cccc-cccc-cccccccccccc');" >/dev/null
  S3 del evidence/2026-09-18/acct >/dev/null
}

tombstones() { node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,ListObjectsV2Command}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19040",forcePathStyle:true,credentials:{accessKeyId:"s315local",secretAccessKey:"s315localsecret"}});
c.send(new ListObjectsV2Command({Bucket:"s315-recovery"})).then(l=>console.log((l.Contents||[]).filter(o=>/erasure|tombstone/i.test(o.Key)).length));' 2>/dev/null; }

echo ""
echo "==================== THE STALE RUNNER (pre-§313, what launchd was executing) ===================="
setup
NODE_PATH=/Users/mckinley/Desktop/Safety_InSite/backend/node_modules node "$STALE" --apply > "$A/drift-stale.txt" 2>&1; SE=$?
echo "  outcome: $(grep -oE 'PROTECTED|ATTENTION_REQUIRED|UNKNOWN' "$A/drift-stale.txt" | tail -1)  exit=$SE"
grep -E "erasure tombstones written|RECOVERY_ONLY_EXPECTED|MISSING_LIVE" "$A/drift-stale.txt" | head -4
STALE_TOMBS=$(tombstones)
echo "  erasure tombstones in recovery storage: $STALE_TOMBS"
ck "the STALE runner wrote NO erasure tombstone" "$STALE_TOMBS" "0"
ck "and it still reported PROTECTED — silently"  "$(grep -oE 'PROTECTED|ATTENTION_REQUIRED|UNKNOWN' "$A/drift-stale.txt" | tail -1)" "PROTECTED"

echo ""
echo "==================== THE CURRENT RUNNER (what §315 installed) ===================="
setup
node "$CURRENT" --apply > "$A/drift-current.txt" 2>&1; CE=$?
echo "  outcome: $(grep -oE 'PROTECTED|ATTENTION_REQUIRED|UNKNOWN' "$A/drift-current.txt" | tail -1)  exit=$CE"
grep -E "erasure tombstones written|MISSING_LIVE_ERASURE_AUTHORIZED" "$A/drift-current.txt" | head -4
CUR_TOMBS=$(tombstones)
echo "  erasure tombstones in recovery storage: $CUR_TOMBS"
ck "the CURRENT runner wrote the erasure tombstone" "$CUR_TOMBS" "1"
node "$CURRENT" --json "$A/drift-current-2.json" > "$A/drift-current-2.txt" 2>&1
echo "  second pass (steady state): $(python3 - "$A/drift-current-2.json" <<'PYJ'
import json,sys
d=json.load(open(sys.argv[1]))
print(d['outcome'], {k: v for k, v in d['counts'].items() if v})
PYJ
)"
ck "steady state classifies it MISSING_LIVE_ERASURE_AUTHORIZED" \
   "$(python3 -c "import json;print(json.load(open('$A/drift-current-2.json'))['counts']['MISSING_LIVE_ERASURE_AUTHORIZED'])")" "1"
ck "and the run is PROTECTED"  "$(python3 -c "import json;print(json.load(open('$A/drift-current-2.json'))['outcome'])")" "PROTECTED"

echo ""
echo "==================== AND THE TOMBSTONE REFUSES A RESTORE ===================="
node "$CURRENT" --restore cccccccc-cccc-cccc-cccc-cccccccccccc > "$A/drift-restore.txt" 2>&1; RE=$?
echo "  $(grep -iE 'REFUSED|restored' "$A/drift-restore.txt" | head -2)"
ck "restore of erased evidence is REFUSED" "$(grep -ci 'REFUSED' "$A/drift-restore.txt")" "1"
ckne "and it exits non-zero"               "$RE" "0"

echo ""
echo "==================== THE INSTALLED RUNNER IS NOW THE CURRENT ONE ===================="
ck "installed reconcile matches the checkout" \
   "$(shasum -a 256 ~/.safety-insite/runner/reconcile-evidence-recovery.js | cut -d' ' -f1)" \
   "$(shasum -a 256 "$CURRENT" | cut -d' ' -f1)"
ck "installed integrity gate matches the checkout" \
   "$(shasum -a 256 ~/.safety-insite/runner/verify-evidence-digest-integrity.js | cut -d' ' -f1)" \
   "$(shasum -a 256 scripts/ops/verify-evidence-digest-integrity.js | cut -d' ' -f1)"
ck "installed health check matches the checkout" \
   "$(shasum -a 256 ~/.safety-insite/runner/check-backup-health.js | cut -d' ' -f1)" \
   "$(shasum -a 256 scripts/ops/check-backup-health.js | cut -d' ' -f1)"

rm -f "$STALE"
echo ""
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
