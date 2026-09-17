#!/bin/bash
# §313 — BR-7 account-deletion evidence erasure, proven against the REAL application.
# Synthetic users and synthetic evidence only. No production state is touched.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
B=http://127.0.0.1:4313
# the seeder mints a session with the app's own signing key
set -a; . /private/tmp/claude-501/-Users-mckinley/3999473d-2617-42ee-8e24-6f8816b78c7f/scratchpad/s313/app.env; set +a
PG() { docker exec s313-pg psql -U postgres -d erasuretest -Atq "$@"; }
S3() { node -e "
const {S3Client,ListObjectsV2Command,HeadObjectCommand,GetObjectCommand}=require('@aws-sdk/client-s3');
const c=new S3Client({region:'auto',endpoint:'http://127.0.0.1:19020',forcePathStyle:true,credentials:{accessKeyId:'s313local',secretAccessKey:'s313localsecret'}});
const [op,arg]=process.argv.slice(1);
(async()=>{
 if(op==='count'){const l=await c.send(new ListObjectsV2Command({Bucket:'s313-live'}));console.log((l.Contents||[]).length);}
 if(op==='has'){try{await c.send(new HeadObjectCommand({Bucket:'s313-live',Key:arg}));console.log('yes');}catch(e){console.log('no');}}
 if(op==='sha'){try{const r=await c.send(new GetObjectCommand({Bucket:'s313-live',Key:arg}));const a=[];for await(const x of r.Body)a.push(x);
   console.log(require('crypto').createHash('sha256').update(Buffer.concat(a)).digest('hex'));}catch(e){console.log('ABSENT');}}
})();" "$@" 2>/dev/null; }
pass=0; fail=0
ck(){ if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — $3"; else fail=$((fail+1)); echo "FAIL  $1  — expected '$3', got '$2'"; fi; }

# --- helpers -------------------------------------------------------------------------------------
reg() { # email label -> token   (seeded directly: register/login are rate-limited 5/60s, which is
         # production abuse control and not what §313 is testing. The user row and its bcrypt hash
         # are real, and DELETE /auth/me verifies that hash exactly as it would for any customer.)
  node /Users/mckinley/Desktop/Safety_InSite/backend/tmp-s313-seed.js "$1" \
    | python3 -c "import sys,json
try: print(json.load(sys.stdin)['token'])
except Exception: print('')"
}
mksite() { curl -s -X POST "$B/sites" -H "Authorization: Bearer $1" -H 'content-type: application/json' \
  -d '{"name":"S313 Synthetic Site"}' | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('id',''))
except Exception: print('')"; }
mkinsp() { local sid; sid=$(mksite "$1")
  curl -s -X POST "$B/inspections" -H "Authorization: Bearer $1" -H 'content-type: application/json' \
    -d "{\"title\":\"S313 synthetic inspection\",\"siteId\":\"$sid\"}" | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('id',''))
except Exception: print('')"; }
upload() { # token inspectionId label -> storage object id
  python3 - "$3" <<'PYX'
import sys,struct,zlib
lbl=sys.argv[1].encode()
def chunk(t,d):
    c=t+d; return struct.pack('>I',len(d))+c+struct.pack('>I',zlib.crc32(c)&0xffffffff)
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',1,1,8,2,0,0,0))
png+=chunk(b'IDAT',zlib.compress(bytes([0,lbl[0]%256,lbl[-1]%256,len(lbl)%256])))+chunk(b'IEND',b'')
open('/tmp/s313-%s.png'%sys.argv[1],'wb').write(png)
PYX
  curl -s -X POST "$B/inspections/$2/evidence" -H "Authorization: Bearer $1" \
    -F "file=@/tmp/s313-$3.png;type=image/png" | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('id',''))
except Exception: print('')"
}
key_of() { PG -c "select \"objectKey\" from storage_objects where id='$1';"; }
status_of() { PG -c "select status from storage_objects where id='$1';"; }
# DELETE /auth/me is throttled at 5 requests / 60s. That is production abuse control and must not be
# weakened for a test, so the suite BUDGETS its deletions across windows and refuses to accept a 429
# as a result — a rate-limited delete that silently counted as "accurate" would make this suite lie.
del_account() {
  local out; out=$(curl -s -X DELETE "$B/auth/me" -H "Authorization: Bearer $1" -H 'content-type: application/json' -d '{"password":"S313-proof!x9"}')
  if echo "$out" | grep -q "ThrottlerException"; then
    echo "  RATE LIMITED — waiting out the window and retrying once" >&2
    sleep 62
    out=$(curl -s -X DELETE "$B/auth/me" -H "Authorization: Bearer $1" -H 'content-type: application/json' -d '{"password":"S313-proof!x9"}')
  fi
  echo "$out"
}

echo "  (clearing the DELETE /auth/me rate-limit window before starting)"
sleep 62
echo "==================== SETUP (rig reset — the suite must be repeatable) ===================="
docker exec s313-pg psql -U postgres -d erasuretest -q -c "truncate storage_objects, security_audit_events, inspection_report_versions, inspection_reports, observations, inspection, site, agreement_acceptances, refresh_tokens, notifications, organization_memberships, entitlement_grants, inspection_assignments, audit_logs restart identity cascade; delete from \"user\";" >/dev/null 2>&1
node -e 'const {S3Client,ListObjectsV2Command,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19020",forcePathStyle:true,credentials:{accessKeyId:"s313local",secretAccessKey:"s313localsecret"}});
(async()=>{const l=await c.send(new ListObjectsV2Command({Bucket:"s313-live"}));for(const o of (l.Contents||[]))await c.send(new DeleteObjectCommand({Bucket:"s313-live",Key:o.Key}));console.log("  rig reset");})();' 2>/dev/null
TA=$(reg "s313-a-$$@internal-acceptance.invalid" A); TB=$(reg "s313-b-$$@internal-acceptance.invalid" B)
echo "  user A token len ${#TA} | user B token len ${#TB}"
IA=$(mkinsp "$TA"); IB=$(mkinsp "$TB")
OA1=$(upload "$TA" "$IA" a1); OA2=$(upload "$TA" "$IA" a2); OB1=$(upload "$TB" "$IB" b1)
KA1=$(key_of "$OA1"); KA2=$(key_of "$OA2"); KB1=$(key_of "$OB1")
SHB1=$(S3 sha "$KB1")
echo "  A objects: $OA1 $OA2 | B object: $OB1"
ck "three synthetic objects exist in the live bucket" "$(S3 count)" "3"

echo ""
echo "==================== 1. WRONG-OWNERSHIP ISOLATION ===================="
RESP=$(del_account "$TA")
echo "  DELETE /auth/me (A) -> $(echo "$RESP" | head -c 120)"
ck "A object 1 erased from R2"            "$(S3 has "$KA1")" "no"
ck "A object 2 erased from R2"            "$(S3 has "$KA2")" "no"
ck "B object UNTOUCHED in R2"             "$(S3 has "$KB1")" "yes"
ck "B object byte-identical"              "$(S3 sha "$KB1")" "$SHB1"
ck "A metadata marked deleted"            "$(status_of "$OA1")" "deleted"
ck "B metadata still ready"               "$(status_of "$OB1")" "ready"
ck "B can still read its own evidence"    "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$OB1" -H "Authorization: Bearer $TB")" "200"
ck "A's evidence is unservable"           "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$OA1" -H "Authorization: Bearer $TB")" "404"
ck "audit records account_evidence_erased x2" "$(PG -c "select count(*) from security_audit_events where action='account_evidence_erased' and \"actorUserId\"=(select id from \"user\" where email like 'deleted-%' order by \"deletedAt\" desc limit 1);")" "2"
ck "erasure completion recorded"          "$(PG -c "select count(*) from security_audit_events where action='account_evidence_erasure_complete';")" "1"

echo ""
echo "==================== 2. ZERO-OBJECT ACCOUNT ===================="
TZ=$(reg "s313-z-$$@internal-acceptance.invalid" Z)
RZ=$(del_account "$TZ")
ck "zero-object deletion succeeds cleanly" "$(echo "$RZ" | python3 -c "import sys,json
try: print(json.load(sys.stdin)['message'])
except Exception: print('ERR')")" "Account deleted successfully"

echo ""
echo "==================== 3. ONE-OBJECT ACCOUNT ===================="
TO=$(reg "s313-o-$$@internal-acceptance.invalid" O); IO=$(mkinsp "$TO"); OO=$(upload "$TO" "$IO" o1); KO=$(key_of "$OO")
RO=$(del_account "$TO")
ck "one-object deletion reports success"  "$(echo "$RO" | python3 -c "import sys,json
try: print(json.load(sys.stdin)['message'])
except Exception: print('ERR')")" "Account deleted successfully"
ck "its object is gone"                   "$(S3 has "$KO")" "no"

echo ""
echo "==================== 4. REPEATED / IDEMPOTENT DELETE ===================="
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$B/auth/me" -H "Authorization: Bearer $TO" -H 'content-type: application/json' -d '{"password":"S313-proof!x9"}')
ck "repeat DELETE on a deleted account is refused" "$CODE" "401"
ck "B object STILL untouched after all deletions"  "$(S3 has "$KB1")" "yes"
ck "live bucket holds only B's object"             "$(S3 count)" "1"

echo ""
echo "  (rate-limit window)"; sleep 62
echo "==================== 5. ALREADY-MISSING OBJECT (idempotent erase) ===================="
TM=$(reg "s313-m-$$@internal-acceptance.invalid" M); IM=$(mkinsp "$TM"); OM=$(upload "$TM" "$IM" m1); KM=$(key_of "$OM")
node -e "
const {S3Client,DeleteObjectCommand}=require('@aws-sdk/client-s3');
const c=new S3Client({region:'auto',endpoint:'http://127.0.0.1:19020',forcePathStyle:true,credentials:{accessKeyId:'s313local',secretAccessKey:'s313localsecret'}});
c.send(new DeleteObjectCommand({Bucket:'s313-live',Key:process.argv[1]})).then(()=>console.log('pre-deleted'));" "$KM" 2>/dev/null
RM=$(del_account "$TM")
ck "deletion completes despite the object already being absent" "$(echo "$RM" | python3 -c "import sys,json
try: print(json.load(sys.stdin)['message'])
except Exception: print('ERR')")" "Account deleted successfully"
ck "its row is marked deleted"            "$(status_of "$OM")" "deleted"

echo ""
# DELETE /auth/me is throttled at 5 per 60s — production abuse control, not something to weaken for
# a test. Five deletions have already been spent above, so wait the window out rather than tripping it.
echo ""
echo "  (waiting out the DELETE /auth/me rate-limit window before the partial-failure case)"
sleep 62

echo "==================== 6. PARTIAL R2 FAILURE ===================="
TP=$(reg "s313-p-$$@internal-acceptance.invalid" P); IP=$(mkinsp "$TP")
OP1=$(upload "$TP" "$IP" p1); OP2=$(upload "$TP" "$IP" p2); OP3=$(upload "$TP" "$IP" p3)
KP1=$(key_of "$OP1"); KP2=$(key_of "$OP2"); KP3=$(key_of "$OP3")
echo "  stopping the object store mid-flight to force a partial failure"
docker stop s313-minio >/dev/null 2>&1
RP=$(del_account "$TP")
echo "  response: $(echo "$RP" | head -c 160)"
ck "response does NOT falsely claim complete" "$(echo "$RP" | python3 -c "import sys,json
try:
  d=json.load(sys.stdin); print('false-complete' if d.get('message')=='Account deleted successfully' else 'accurate')
except Exception: print('ERR')")" "accurate"
ck "all three rows remain erasure_pending" "$(PG -c "select count(*) from storage_objects where status='erasure_pending';")" "3"
COMPLETIONS_BEFORE=$(PG -c "select count(*) from security_audit_events where action='account_evidence_erasure_complete';")
ck "no premature completion audit for the partial account" "$COMPLETIONS_BEFORE" "4"
ck "account itself IS deleted"             "$(PG -c "select count(*) from \"user\" where email like 'deleted-%' and \"deletedAt\" is not null;")" "5"
echo "  restoring the object store and retrying deterministically"
docker start s313-minio >/dev/null 2>&1; sleep 6
UP=$(PG -c "select \"ownerUserId\" from storage_objects where id='$OP1';")
node -e '
const {NestFactory}=require("@nestjs/core");
(async()=>{
  const {AppModule}=require("./dist/app.module");
  const app=await NestFactory.createApplicationContext(AppModule,{logger:false});
  const {AuthService}=require("./dist/auth/auth.service");
  const r=await app.get(AuthService).retryAccountEvidenceErasure(process.argv[1]);
  console.log("  retry ->",JSON.stringify(r)); await app.close();
})();' "$UP" 2>/dev/null
ck "retry erases all three"                "$(PG -c "select count(*) from storage_objects where status='erasure_pending';")" "0"
ck "object 1 gone"                         "$(S3 has "$KP1")" "no"
ck "object 2 gone"                         "$(S3 has "$KP2")" "no"
ck "object 3 gone"                         "$(S3 has "$KP3")" "no"
COMPLETIONS_AFTER=$(PG -c "select count(*) from security_audit_events where action='account_evidence_erasure_complete';")
ck "completion recorded exactly once by the retry" "$COMPLETIONS_AFTER" "$((COMPLETIONS_BEFORE + 1))"
ck "B object STILL untouched"              "$(S3 has "$KB1")" "yes"

echo ""
echo "==================== 7. RETRY IS IDEMPOTENT ===================="
node -e '
const {NestFactory}=require("@nestjs/core");
(async()=>{
  const {AppModule}=require("./dist/app.module");
  const app=await NestFactory.createApplicationContext(AppModule,{logger:false});
  const {AuthService}=require("./dist/auth/auth.service");
  const r=await app.get(AuthService).retryAccountEvidenceErasure(process.argv[1]);
  console.log("  second retry ->",JSON.stringify(r)); await app.close();
})();' "$UP" 2>/dev/null
ck "second retry adds NO further completion audit" "$(PG -c "select count(*) from security_audit_events where action='account_evidence_erasure_complete';")" "$COMPLETIONS_AFTER"
ck "second retry erases nothing further"           "$(PG -c "select count(*) from storage_objects where status='erasure_pending';")" "0"
ck "B object STILL untouched"              "$(S3 has "$KB1")" "yes"

echo ""
echo "==================== RESULT ===================="
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
