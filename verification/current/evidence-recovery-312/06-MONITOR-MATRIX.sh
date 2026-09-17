#!/bin/bash
set -u; cd /Users/mckinley/Desktop/Safety_InSite/backend
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
BASE_DB="postgresql://postgres:s312@127.0.0.1:15442/evidencetest"
export EVIDENCE_DATABASE_URL="$BASE_DB"
export EVIDENCE_SOURCE_S3_ENDPOINT="http://127.0.0.1:19010" EVIDENCE_SOURCE_S3_BUCKET="s312a-live"
export EVIDENCE_SOURCE_S3_ACCESS_KEY_ID="s312local" EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY="s312localsecret" EVIDENCE_SOURCE_S3_FORCE_PATH_STYLE=true
export BACKUP_S3_ENDPOINT="http://127.0.0.1:19010" BACKUP_S3_BUCKET="s312a-recovery"
export BACKUP_S3_ACCESS_KEY_ID="s312local" BACKUP_S3_SECRET_ACCESS_KEY="s312localsecret" BACKUP_S3_FORCE_PATH_STYLE=true
P(){ docker exec s312a-pg psql -U postgres -d evidencetest -Atq "$@"; }
out(){ node scripts/ops/reconcile-evidence-recovery.js --json /tmp/m.json >/dev/null 2>&1; echo -n "exit=$? "; python3 -c "
import json;d=json.load(open('/tmp/m.json'))
c={k:v for k,v in d.get('counts',{}).items() if v}
print(f\"outcome={d['outcome']} {c}\")"; }
# Self-resetting: a state matrix that inherits another suite's leftovers measures the leftovers.
docker exec s312a-pg psql -U postgres -d evidencetest -q -c "truncate storage_objects, security_audit_events;" >/dev/null 2>&1
node -e 'const {S3Client,ListObjectsV2Command,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
(async()=>{for(const b of ["s312a-live","s312a-recovery"]){const l=await c.send(new ListObjectsV2Command({Bucket:b}));for(const o of (l.Contents||[]))await c.send(new DeleteObjectCommand({Bucket:b,Key:o.Key}));}})();' 2>/dev/null
sleep 1
# seed exactly one protected object so PROTECTED is a real state rather than an empty one
BS="SYNTHETIC baseline protected object"
SS=$(printf '%s' "$BS"|shasum -a 256|awk '{print $1}'); KS="evidence/2026-09-18/babababa-0000-4000-8000-000000000001"
docker exec s312a-pg psql -U postgres -d evidencetest -Atq -c "insert into storage_objects (category,\"objectKey\",\"ownerUserId\",\"parentType\",\"parentId\",\"contentType\",\"downloadName\",\"sizeBytes\",sha256,\"createdByUserId\") values ('evidence','$KS','12121212-1212-4121-8121-121212121212','inspection','13131313-1313-4131-8131-131313131313','text/plain','b.txt',${#BS},'$SS','12121212-1212-4121-8121-121212121212');" >/dev/null
node -e 'const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});c.send(new PutObjectCommand({Bucket:"s312a-live",Key:process.argv[1],Body:Buffer.from(process.argv[2])})).then(()=>0);' "$KS" "$BS" 2>/dev/null
node scripts/ops/reconcile-evidence-recovery.js --apply >/dev/null 2>&1

pass=0;fail=0; ck(){ if echo "$2" | grep -q "$3"; then pass=$((pass+1)); echo "PASS  $1  — $2"; else fail=$((fail+1)); echo "FAIL  $1  — got: $2"; fi; }

echo "=== PROTECTED ==="; ck "all live objects captured" "$(out)" "outcome=PROTECTED"
echo ""; echo "=== UNPROTECTED (a live object with no recovery copy) ==="
B="SYNTHETIC unprotected"; S=$(printf '%s' "$B"|shasum -a 256|awk '{print $1}'); K="evidence/2026-09-18/eeeeeeee-0000-4000-8000-000000000001"
P -c "insert into storage_objects (category,\"objectKey\",\"ownerUserId\",\"parentType\",\"parentId\",\"contentType\",\"downloadName\",\"sizeBytes\",sha256,\"createdByUserId\") values ('evidence','$K','99999999-9999-4999-8999-999999999999','inspection','99999999-9999-4999-8999-999999999999','text/plain','u.txt',${#B},'$S','99999999-9999-4999-8999-999999999999');" >/dev/null
node -e 'const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});c.send(new PutObjectCommand({Bucket:"s312a-live",Key:process.argv[1],Body:Buffer.from(process.argv[2])})).then(()=>0);' "$K" "$B" 2>/dev/null
ck "LIVE_UNBACKED surfaced" "$(out)" "LIVE_UNBACKED"

echo ""; echo "=== MISMATCH (live bytes disagree with the recorded digest) ==="
# Two distinct mismatch shapes, and they are detected by different means.
# (a) SIZE divergence is caught immediately, without downloading anything.
P -c "update storage_objects set \"sizeBytes\"=999999 where \"objectKey\"='$K';" >/dev/null
ck "size divergence caught without a capture" "$(out)" "DIGEST_MISMATCH"
P -c "update storage_objects set \"sizeBytes\"=${#B} where \"objectKey\"='$K';" >/dev/null
# (b) CONTENT divergence at equal size is caught once the bytes have been hashed at capture.
#     The reconciler deliberately does NOT re-download every live object on every run.
P -c "update storage_objects set sha256='$(printf '0%.0s' {1..64})' where \"objectKey\"='$K';" >/dev/null
node scripts/ops/reconcile-evidence-recovery.js --apply >/dev/null 2>&1
ck "content divergence caught after capture hashes the bytes" "$(out)" "DIGEST_MISMATCH"
P -c "delete from storage_objects where \"objectKey\"='$K';" >/dev/null

echo ""; echo "=== SOURCE_UNAVAILABLE ==="
ck "unreachable source -> UNKNOWN, exit 2" "$(EVIDENCE_SOURCE_S3_ENDPOINT=http://127.0.0.1:19099 out)" "exit=2 outcome=UNKNOWN"
echo ""; echo "=== DESTINATION_UNAVAILABLE ==="
ck "unreachable destination -> UNKNOWN, exit 2" "$(BACKUP_S3_ENDPOINT=http://127.0.0.1:19099 out)" "exit=2 outcome=UNKNOWN"
echo ""; echo "=== INCOMPLETE_SCAN (database unreachable) ==="
ck "unreadable ledger -> UNKNOWN, exit 2" "$(EVIDENCE_DATABASE_URL=postgresql://postgres:s312@127.0.0.1:15999/evidencetest out)" "exit=2 outcome=UNKNOWN"
echo ""; echo "=== BAD CREDENTIAL ==="
ck "wrong source credential -> UNKNOWN, exit 2" "$(EVIDENCE_SOURCE_S3_ACCESS_KEY_ID=0000000000000000000000000000dead out)" "exit=2 outcome=UNKNOWN"
echo ""; echo "$pass passed, $fail failed"; [ $fail -eq 0 ] || exit 1
