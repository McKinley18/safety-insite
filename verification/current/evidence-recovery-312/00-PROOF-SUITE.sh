#!/bin/bash
# §312 evidence-recovery proof suite. SYNTHETIC OBJECTS ONLY, disposable containers only.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"

export EVIDENCE_DATABASE_URL="postgresql://postgres:s312@127.0.0.1:15442/evidencetest"
export EVIDENCE_SOURCE_S3_ENDPOINT="http://127.0.0.1:19010"
export EVIDENCE_SOURCE_S3_BUCKET="s312-live"
export EVIDENCE_SOURCE_S3_ACCESS_KEY_ID="s312local"
export EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY="s312localsecret"
export EVIDENCE_SOURCE_S3_FORCE_PATH_STYLE=true
export BACKUP_S3_ENDPOINT="http://127.0.0.1:19010"
export BACKUP_S3_BUCKET="s312-recovery"
export BACKUP_S3_ACCESS_KEY_ID="s312local"
export BACKUP_S3_SECRET_ACCESS_KEY="s312localsecret"
export BACKUP_S3_FORCE_PATH_STYLE=true
export EVIDENCE_ERASURE_GRACE_HOURS=0
export EVIDENCE_RESTORE_DIR=/private/tmp/claude-501/-Users-mckinley/3999473d-2617-42ee-8e24-6f8816b78c7f/scratchpad/s312

PSQL() { docker exec s312-pg psql -U postgres -d evidencetest -Atq "$@"; }
PSQL1() { PSQL "$@" | head -1; }
R() { node scripts/ops/reconcile-evidence-recovery.js "$@" > /tmp/s312.out 2>&1; local rc=$?; grep -v NodeVersionSupport /tmp/s312.out; return $rc; }
PASS=0; FAIL=0
ck() { if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "PASS  $1  — $3"; else FAIL=$((FAIL+1)); echo "FAIL  $1  — expected '$3', got '$2'"; fi; }
state() { R --json /tmp/s312.json >/dev/null 2>&1; python3 -c "
import json;d=json.load(open('/tmp/s312.json'))
f=[x for x in d['findings'] if x.get('id')=='$1']
print(f[0]['state'] if f else 'ABSENT')"; }
count() { python3 -c "
import json;d=json.load(open('/tmp/s312.json'));print(d['counts'].get('$1',0))"; }

echo "==================== SETUP (rig reset — the suite must be repeatable) ===================="
docker exec s312-pg psql -U postgres -d evidencetest -q -c "truncate storage_objects, security_audit_events;" >/dev/null 2>&1
node -e '
const {S3Client,CreateBucketCommand,ListObjectsV2Command,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
(async()=>{for(const b of ["s312-live","s312-recovery"]){try{await c.send(new CreateBucketCommand({Bucket:b}));}catch(e){}
 const l=await c.send(new ListObjectsV2Command({Bucket:b}));for(const o of (l.Contents||[]))await c.send(new DeleteObjectCommand({Bucket:b,Key:o.Key}));}
 console.log("rig reset");})();
' 2>&1 | grep -v NodeVersion

node -e '
const {S3Client,CreateBucketCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
(async()=>{for(const b of ["s312-live","s312-recovery"]){try{await c.send(new CreateBucketCommand({Bucket:b}));}catch(e){}}console.log("buckets ready");})();
' 2>&1 | grep -v NodeVersion

putlive() { node -e '
const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new PutObjectCommand({Bucket:"s312-live",Key:process.argv[1],Body:Buffer.from(process.argv[2])})).then(()=>console.log("put",process.argv[1]));
' "$1" "$2" 2>&1 | grep -v NodeVersion; }
dellive() { node -e '
const {S3Client,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new DeleteObjectCommand({Bucket:"s312-live",Key:process.argv[1]})).then(()=>console.log("deleted",process.argv[1]));
' "$1" 2>&1 | grep -v NodeVersion; }
sha() { printf '%s' "$1" | shasum -a 256 | awk '{print $1}'; }

BODY_A="SYNTHETIC evidence generation A - not customer data"
BODY_B="SYNTHETIC evidence generation B - overwritten content"
SHA_A=$(sha "$BODY_A"); SHA_B=$(sha "$BODY_B")
KEY="evidence/2026-09-17/aaaaaaaa-0000-4000-8000-000000000001"
OID=$(PSQL1 -c "insert into storage_objects (category,\"objectKey\",\"ownerUserId\",\"parentType\",\"parentId\",\"contentType\",\"downloadName\",\"sizeBytes\",sha256,\"createdByUserId\") values ('evidence','$KEY','11111111-1111-4111-8111-111111111111','inspection','22222222-2222-4222-8222-222222222222','text/plain','a.txt',${#BODY_A},'$SHA_A','11111111-1111-4111-8111-111111111111') returning id;")
putlive "$KEY" "$BODY_A" >/dev/null
echo "object id $OID"

echo ""; echo "==================== 1. LIVE_UNBACKED (nothing captured yet) ===================="
ck "live object with no recovery copy" "$(state $OID)" "LIVE_UNBACKED"

echo ""; echo "==================== 2. CAPTURE -> LIVE_MATCHED ===================="
R --apply >/dev/null
ck "after capture" "$(state $OID)" "LIVE_MATCHED"

echo ""; echo "==================== 3. ACCIDENTAL DELETE ===================="
dellive "$KEY" >/dev/null
ck "live gone, recovery copy survives" "$(state $OID)" "MISSING_LIVE_RECOVERABLE"
echo "--- a bad DELETE must NOT propagate: re-run --apply and confirm the copy is still there ---"
R --apply >/dev/null
ck "recovery copy survives a reconciliation pass" "$(state $OID)" "MISSING_LIVE_RECOVERABLE"

echo ""; echo "--- governed restore ---"
rm -f $EVIDENCE_RESTORE_DIR/$OID-*.bin
R --restore "$OID" | sed 's/^/    /'
RESTORED=$(ls $EVIDENCE_RESTORE_DIR/$OID-*.bin 2>/dev/null | head -1)
RSHA=$(shasum -a 256 "$RESTORED" 2>/dev/null | awk '{print $1}')
ck "restored bytes sha256 equals original" "$RSHA" "$SHA_A"

echo ""; echo "==================== 4. OVERWRITE: A and B must both survive ===================="
putlive "$KEY" "$BODY_A" >/dev/null
R --apply >/dev/null
putlive "$KEY" "$BODY_B" >/dev/null
PSQL -c "update storage_objects set sha256='$SHA_B', \"sizeBytes\"=${#BODY_B} where id='$OID';" >/dev/null
R --apply >/dev/null
ck "current live state identified" "$(state $OID)" "LIVE_MATCHED"
GENS=$(python3 -c "
import json;d=json.load(open('/tmp/s312.json'))
print([x['generations'] for x in d['findings'] if x.get('id')=='$OID'][0])")
ck "two independent generations retained" "$GENS" "2"
HASA=$(node -e '
const {S3Client,HeadObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new HeadObjectCommand({Bucket:"s312-recovery",Key:"evidence/objects/"+process.argv[1]})).then(()=>console.log("yes")).catch(()=>console.log("no"));
' "$SHA_A" 2>/dev/null)
HASB=$(node -e '
const {S3Client,HeadObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new HeadObjectCommand({Bucket:"s312-recovery",Key:"evidence/objects/"+process.argv[1]})).then(()=>console.log("yes")).catch(()=>console.log("no"));
' "$SHA_B" 2>/dev/null)
ck "generation A bytes still present" "$HASA" "yes"
ck "generation B bytes independently present" "$HASB" "yes"
ck "digests do not collide" "$([ "$SHA_A" != "$SHA_B" ] && echo different || echo collided)" "different"

echo ""; echo "==================== 5. RETIRED REPORT IS NOT ERASURE ===================="
PSQL -c "update storage_objects set \"deletedAt\"=now(), status='deleted' where id='$OID';" >/dev/null
PSQL -c "insert into security_audit_events (action,\"resourceType\",\"resourceId\") values ('report_artifact_retired','storage_object','$OID');" >/dev/null
R --apply >/dev/null
ck "operational retirement is NOT treated as erasure" "$(state $OID)" "RECOVERY_ONLY_EXPECTED"
TOMB=$(node -e '
const {S3Client,HeadObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new HeadObjectCommand({Bucket:"s312-recovery",Key:"evidence/erasure/"+process.argv[1]+".json"})).then(()=>console.log("yes")).catch(()=>console.log("no"));
' "$OID" 2>/dev/null)
ck "no erasure tombstone written for a retirement" "$TOMB" "no"

echo ""; echo "==================== 6. AUTHORIZED ERASURE ===================="
BODY_E="SYNTHETIC evidence for the erasure test - not customer data"
SHA_E=$(sha "$BODY_E"); KEY_E="evidence/2026-09-17/bbbbbbbb-0000-4000-8000-000000000002"
EID=$(PSQL1 -c "insert into storage_objects (category,\"objectKey\",\"ownerUserId\",\"parentType\",\"parentId\",\"contentType\",\"downloadName\",\"sizeBytes\",sha256,\"createdByUserId\") values ('evidence','$KEY_E','33333333-3333-4333-8333-333333333333','inspection','44444444-4444-4444-8444-444444444444','text/plain','e.txt',${#BODY_E},'$SHA_E','33333333-3333-4333-8333-333333333333') returning id;")
putlive "$KEY_E" "$BODY_E" >/dev/null
R --apply >/dev/null
ck "erasure fixture captured" "$(state $EID)" "LIVE_MATCHED"
PSQL -c "update storage_objects set \"deletedAt\"=now(), status='deleted', \"deletedByUserId\"='33333333-3333-4333-8333-333333333333' where id='$EID';" >/dev/null
PSQL -c "insert into security_audit_events (action,\"resourceType\",\"resourceId\") values ('file_deleted','storage_object','$EID');" >/dev/null
dellive "$KEY_E" >/dev/null
R --apply >/dev/null
ck "authorized erasure recognised" "$(state $EID)" "MISSING_LIVE_ERASURE_AUTHORIZED"
echo "--- recovery must REFUSE resurrection ---"
R --restore "$EID" | sed 's/^/    /'; RC=${PIPESTATUS[0]}
ck "restore refused after erasure" "$([ $RC -ne 0 ] && echo refused || echo allowed)" "refused"
GONE=$(node -e '
const {S3Client,HeadObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new HeadObjectCommand({Bucket:"s312-recovery",Key:"evidence/objects/"+process.argv[1]})).then(()=>console.log("present")).catch(()=>console.log("deleted"));
' "$SHA_E" 2>/dev/null)
ck "recovery bytes deleted after grace period" "$GONE" "deleted"

echo ""; echo "==================== 7. HARD GATE — DATABASE ROLLBACK MUST NOT RESURRECT ===================="
echo "    rolling the database back to BEFORE the erasure (delete the row's deletion + the audit event)"
PSQL -c "update storage_objects set \"deletedAt\"=null, status='ready', \"deletedByUserId\"=null where id='$EID';" >/dev/null
PSQL -c "delete from security_audit_events where \"resourceId\"='$EID';" >/dev/null
echo "    database now believes the object is LIVE and was never erased:"
PSQL -c "select 'deletedAt='||coalesce(\"deletedAt\"::text,'NULL')||' status='||status from storage_objects where id='$EID';" | sed 's/^/      /'
ck "erasure still authoritative after DB rollback" "$(state $EID)" "MISSING_LIVE_ERASURE_AUTHORIZED"
R --restore "$EID" >/dev/null 2>&1; RC3=$?
ck "restore STILL refused after DB rollback" "$([ $RC3 -ne 0 ] && echo refused || echo allowed)" "refused"

echo ""; echo "==================== 8. DIGEST MISMATCH ===================="
BODY_M="SYNTHETIC mismatch fixture"; SHA_M=$(sha "$BODY_M"); KEY_M="evidence/2026-09-17/cccccccc-0000-4000-8000-000000000003"
MID=$(PSQL1 -c "insert into storage_objects (category,\"objectKey\",\"ownerUserId\",\"parentType\",\"parentId\",\"contentType\",\"downloadName\",\"sizeBytes\",sha256,\"createdByUserId\") values ('evidence','$KEY_M','55555555-5555-4555-8555-555555555555','inspection','66666666-6666-4666-8666-666666666666','text/plain','m.txt',999,'$(printf '0%.0s' {1..64})','55555555-5555-4555-8555-555555555555') returning id;")
putlive "$KEY_M" "$BODY_M" >/dev/null
ck "live bytes disagree with the database record" "$(state $MID)" "DIGEST_MISMATCH"

echo ""; echo "==================== 9. RECOVERY_ONLY_SUSPECT ===================="
node -e '
const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new PutObjectCommand({Bucket:"s312-recovery",Key:"evidence/objects/"+"f".repeat(64),Body:Buffer.from("orphan")})).then(()=>console.log("planted orphan"));
' 2>&1 | grep -v NodeVersion
R --json /tmp/s312.json >/dev/null 2>&1
ck "unexplained recovery bytes flagged" "$(count RECOVERY_ONLY_SUSPECT)" "1"

echo ""; echo "==================== 10. UNKNOWN NEVER PASSES ===================="
EVIDENCE_SOURCE_S3_ENDPOINT=http://127.0.0.1:19099 R --json /tmp/s312u.json >/dev/null 2>&1; RC2=$?
UO=$(python3 -c "import json;print(json.load(open('/tmp/s312u.json'))['outcome'])" 2>/dev/null)
ck "unreachable source reports UNKNOWN" "$UO" "UNKNOWN"
ck "UNKNOWN exits non-zero" "$([ $RC2 -ne 0 ] && echo nonzero || echo zero)" "nonzero"

echo ""; echo "==================== RESULT ===================="
echo "$PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] || exit 1
