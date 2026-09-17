#!/bin/bash
# §312A — a FUTURE newly-created production object, proven synthetically. No real object is created.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
export EVIDENCE_DATABASE_URL="postgresql://postgres:s312@127.0.0.1:15442/evidencetest"
export EVIDENCE_SOURCE_S3_ENDPOINT="http://127.0.0.1:19010" EVIDENCE_SOURCE_S3_BUCKET="s312a-live"
export EVIDENCE_SOURCE_S3_ACCESS_KEY_ID="s312local" EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY="s312localsecret" EVIDENCE_SOURCE_S3_FORCE_PATH_STYLE=true
export BACKUP_S3_ENDPOINT="http://127.0.0.1:19010" BACKUP_S3_BUCKET="s312a-recovery"
export BACKUP_S3_ACCESS_KEY_ID="s312local" BACKUP_S3_SECRET_ACCESS_KEY="s312localsecret" BACKUP_S3_FORCE_PATH_STYLE=true
P(){ docker exec s312a-pg psql -U postgres -d evidencetest -Atq "$@"; }
R(){ node scripts/ops/reconcile-evidence-recovery.js "$@" >/tmp/f.out 2>&1; local rc=$?; grep -v NodeVersionSupport /tmp/f.out; return $rc; }
st(){ R --json /tmp/f.json >/dev/null 2>&1; python3 -c "
import json;d=json.load(open('/tmp/f.json'))
f=[x for x in d['findings'] if x.get('id')=='$1']
print(f[0]['state'] if f else 'ABSENT')"; }
pass=0;fail=0; ck(){ [ "$2" = "$3" ] && { pass=$((pass+1)); echo "PASS  $1 -> $3"; } || { fail=$((fail+1)); echo "FAIL  $1 expected $3 got $2"; }; }
BODY="SYNTHETIC future production object - not customer data"
SHA=$(printf '%s' "$BODY" | shasum -a 256 | awk '{print $1}')
KEY="evidence/2026-09-18/dddddddd-0000-4000-8000-00000000000f"
ID=$(P -c "insert into storage_objects (category,\"objectKey\",\"ownerUserId\",\"parentType\",\"parentId\",\"contentType\",\"downloadName\",\"sizeBytes\",sha256,\"createdByUserId\") values ('evidence','$KEY','77777777-7777-4777-8777-777777777777','inspection','88888888-8888-4888-8888-888888888888','text/plain','n.txt',${#BODY},'$SHA','77777777-7777-4777-8777-777777777777') returning id;" | head -1)
node -e '
const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19010",forcePathStyle:true,credentials:{accessKeyId:"s312local",secretAccessKey:"s312localsecret"}});
c.send(new PutObjectCommand({Bucket:"s312a-live",Key:process.argv[1],Body:Buffer.from(process.argv[2])})).then(()=>0);
' "$KEY" "$BODY" 2>/dev/null
echo "a brand-new production object has just appeared (synthetically):"
ck "before reconciliation" "$(st $ID)" "LIVE_UNBACKED"
R --apply >/dev/null
ck "after reconciliation"  "$(st $ID)" "LIVE_MATCHED"
OUT=$(R --json /tmp/f.json 2>&1 | tail -1)
ck "overall outcome"       "$OUT" "PROTECTED"
echo ""; echo "$pass passed, $fail failed"; [ $fail -eq 0 ] || exit 1
