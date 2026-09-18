#!/bin/bash
# §314 — §312 / §312A RECOVERY INTEGRATION AFTER THE BR-8 REPAIR.
#
# The question §314 asks: does a completed idempotent replay disturb evidence recovery? It must not
# produce a new generation, a DIGEST_MISMATCH, a LIVE_UNBACKED, or a recovery-only object; the
# reconciler must go on seeing the object as LIVE_MATCHED and the run as PROTECTED.
#
# This runs the REAL §312 reconciler (backend/scripts/ops/reconcile-evidence-recovery.js) against
# the §314 rig, with a recovery bucket that is separate from the live one exactly as the script
# insists on in production.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
RIG=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s314
. "$RIG/lib.sh"
. "$RIG/reset.sh"

export EVIDENCE_DATABASE_URL="$DATABASE_URL"
export EVIDENCE_SOURCE_S3_BUCKET=s314-live
export EVIDENCE_SOURCE_S3_ENDPOINT=http://127.0.0.1:19030
export EVIDENCE_SOURCE_S3_REGION=auto
export EVIDENCE_SOURCE_S3_ACCESS_KEY_ID=s314local
export EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY=s314localsecret
export EVIDENCE_SOURCE_S3_FORCE_PATH_STYLE=true
export BACKUP_S3_BUCKET=s314-recovery
export BACKUP_S3_ENDPOINT=http://127.0.0.1:19030
export BACKUP_S3_REGION=auto
export BACKUP_S3_ACCESS_KEY_ID=s314local
export BACKUP_S3_SECRET_ACCESS_KEY=s314localsecret
export BACKUP_S3_FORCE_PATH_STYLE=true
export BACKUP_PG_CLIENT_DIR=/opt/homebrew/opt/libpq/bin

# Empty the recovery bucket so the run is repeatable.
node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,ListObjectsV2Command,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19030",forcePathStyle:true,credentials:{accessKeyId:"s314local",secretAccessKey:"s314localsecret"}});
(async()=>{const l=await c.send(new ListObjectsV2Command({Bucket:"s314-recovery"}));
for(const o of (l.Contents||[])) await c.send(new DeleteObjectCommand({Bucket:"s314-recovery",Key:o.Key}));
console.log("  recovery bucket emptied ("+((l.Contents||[]).length)+")");})();' 2>/dev/null

RECOV() { node scripts/ops/reconcile-evidence-recovery.js "$@"; }
# $1 = json file, $2 = 'outcome' or a counts key.
jsonq() { python3 - "$1" "$2" <<'PYJ'
import sys, json
d = json.load(open(sys.argv[1]))
k = sys.argv[2]
print(d['counts'][k] if k in d.get('counts', {}) else d.get(k, ''))
PYJ
}
GENS() { node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,ListObjectsV2Command}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19030",forcePathStyle:true,credentials:{accessKeyId:"s314local",secretAccessKey:"s314localsecret"}});
c.send(new ListObjectsV2Command({Bucket:"s314-recovery"})).then(l=>console.log((l.Contents||[]).length));' 2>/dev/null; }

mkpng A /tmp/s314-A.png; mkpng B /tmp/s314-B.png
SHA_A=$(sha_of_file /tmp/s314-A.png)

T=$(reg "s314-recov-$$@internal-acceptance.invalid"); I=$(mkinsp "$T")
X="s314-recov-replay-$$"
O=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X" | jid); K=$(key_of "$O")
echo "  object $O"

echo ""
echo "==================== 1. CAPTURE A GENERATION ===================="
# The first --apply CLASSIFIES and THEN captures, so it correctly reports the object as
# LIVE_UNBACKED: at the moment it looked, no generation existed yet.
RECOV --apply --json "$RIG/.recov0.json" >/dev/null 2>&1
ck "first pass sees the object as LIVE_UNBACKED" "$(jsonq "$RIG/.recov0.json" LIVE_UNBACKED)" "1"
# The steady state is the NEXT classification, once the generation exists.
RECOV --json "$RIG/.recov1.json" >/dev/null 2>&1; E1=$?
ck "steady-state run is PROTECTED"   "$(jsonq "$RIG/.recov1.json" outcome)" "PROTECTED"
ck "exit code 0"                     "$E1" "0"
G1=$(jsonq "$RIG/.recov1.json" LIVE_MATCHED)
echo "  LIVE_MATCHED=$G1  DIGEST_MISMATCH=$(jsonq "$RIG/.recov1.json" DIGEST_MISMATCH)  LIVE_UNBACKED=$(jsonq "$RIG/.recov1.json" LIVE_UNBACKED)"
GEN_BEFORE=$(GENS)
echo "  recovery generations after first capture: $GEN_BEFORE"

echo ""
echo "==================== 2. A COMPLETED REPLAY, THEN RE-RECONCILE ===================="
OR=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X" | jid)
ck "replay returned the same object"  "$OR" "$O"
RECOV --apply --json "$RIG/.recov2.json" >/dev/null 2>&1; E2=$?
GEN_AFTER=$(GENS)
echo "  recovery generations after the replay: $GEN_AFTER"
ck "run is still PROTECTED"                 "$(jsonq "$RIG/.recov2.json" outcome)" "PROTECTED"
ck "exit code 0"                            "$E2" "0"
ck "NO new recovery generation"             "$GEN_AFTER" "$GEN_BEFORE"
ck "DIGEST_MISMATCH count is 0"             "$(jsonq "$RIG/.recov2.json" DIGEST_MISMATCH)" "0"
ck "LIVE_UNBACKED count is 0"               "$(jsonq "$RIG/.recov2.json" LIVE_UNBACKED)" "0"
ck "RECOVERY_ONLY_SUSPECT count is 0"       "$(jsonq "$RIG/.recov2.json" RECOVERY_ONLY_SUSPECT)" "0"
ck "UNKNOWN count is 0"                     "$(jsonq "$RIG/.recov2.json" UNKNOWN)" "0"
ck "object is still LIVE_MATCHED"           "$(jsonq "$RIG/.recov2.json" LIVE_MATCHED)" "$G1"

echo ""
echo "==================== 3. A REFUSED DIVERGENT REPLAY MUST ALSO LEAVE RECOVERY ALONE =========="
C3=$(upload_code "$T" "$I" /tmp/s314-B.png "$X")
ck "divergent replay refused"  "$C3" "409"
RECOV --apply --json "$RIG/.recov3.json" >/dev/null 2>&1; E3=$?
GEN3=$(GENS)
ck "still PROTECTED"                "$(jsonq "$RIG/.recov3.json" outcome)" "PROTECTED"
ck "exit code 0"                    "$E3" "0"
ck "still NO new generation"        "$GEN3" "$GEN_BEFORE"
ck "DIGEST_MISMATCH still 0"        "$(jsonq "$RIG/.recov3.json" DIGEST_MISMATCH)" "0"
ck "live bytes are still A"         "$(S3 sha "$K")" "$SHA_A"

echo ""
echo "==================== 4. DETECTION MATRIX FOR EQUAL-LENGTH DIVERGENCE ===================="
# POSITIVE CONTROL, and it found something. The live bytes are replaced OUT OF BAND — straight into
# the object store, bypassing the application — with a payload of IDENTICAL LENGTH and a different
# digest. That is the case BR-8 names when it says content length is not integrity.
#
# This section asserts what each detector ACTUALLY does, measured rather than assumed, because one of
# them does less than the register currently claims.
node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");const fs=require("fs");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19030",forcePathStyle:true,credentials:{accessKeyId:"s314local",secretAccessKey:"s314localsecret"}});
c.send(new PutObjectCommand({Bucket:"s314-live",Key:process.argv[1],Body:fs.readFileSync("/tmp/s314-B.png"),ContentType:"image/png"})).then(()=>console.log("  live bytes replaced out-of-band, SAME LENGTH, different digest"));
' "$K"
sleep 1
ck "the divergence is real (live bytes are now B)" "$(S3 sha "$K")" "$(sha_of_file /tmp/s314-B.png)"
ck "the database still records A"                  "$(sha_of "$O")" "$SHA_A"

node scripts/ops/verify-object-consistency.js >/dev/null 2>&1; VOC_SHALLOW=$?
STORAGE_S3_BUCKET=s314-live node scripts/ops/verify-object-consistency.js --deep >/dev/null 2>&1; VOC_DEEP=$?
STORAGE_S3_BUCKET=s314-live BACKUP_PG_CLIENT_DIR=/opt/homebrew/opt/libpq/bin node scripts/ops/verify-evidence-digest-integrity.js >/dev/null 2>&1; S314_GATE=$?
RECOV --json "$RIG/.recov4.json" >/dev/null 2>&1; RECON=$?

echo "  verify-object-consistency (presence+size)  exit=$VOC_SHALLOW"
echo "  verify-object-consistency --deep           exit=$VOC_DEEP"
echo "  reconcile-evidence-recovery (the SCHEDULED monitor) exit=$RECON outcome=$(jsonq "$RIG/.recov4.json" outcome)"
echo "  §314 active-object invariant gate          exit=$S314_GATE"

ck "--deep object consistency DETECTS it"          "$VOC_DEEP" "1"
ck "§314 invariant gate DETECTS it"                "$S314_GATE" "1"
# MEASURED, NOT DESIRED. Both of these miss equal-length divergence, and that is recorded here as
# the finding it is rather than asserted away. The reconciler compares the live object's LENGTH from
# a bucket listing and then compares recovery-generation digests against the ROW digest; it never
# re-hashes the live bytes, so A->B at equal length is invisible to it. §314 does not repair it:
# that is §312/BR-5 surface, it is CLOSED, and widening this section into it would be scope
# expansion. It is reported for a product-owner decision.
ck "presence+size consistency MISSES it (measured)"      "$VOC_SHALLOW" "0"
ck "the scheduled recovery monitor MISSES it (measured)" "$RECON" "0"

echo "==================== RESULT ===================="
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
