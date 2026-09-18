# §314 shared rig helpers. Real HTTP against the real application; synthetic accounts only.
# RIG GUARD — backend/.env points DATABASE_URL at the DEVELOPMENT database. Every suite must source
# app.env first; this refuses to proceed otherwise rather than silently reaching development data.
case "${DATABASE_URL:-}" in
  *127.0.0.1:15432/idemtest*) : ;;
  *) echo "S314 RIG GUARD: DATABASE_URL is not the disposable rig database. Source app.env first."; exit 1 ;;
esac
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
RIG=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s314
B=http://127.0.0.1:4314
BK=s314-live
# ---------------------------------------------------------------------------------------------
# THROTTLE BUDGET. The application throttles 100 requests / 60s per IP (app.module.ts). That is
# production abuse control and §314 does not weaken it, so the suites COUNT their own HTTP calls
# and wait the window out before they would trip it. A 429 absorbed silently would make an
# integrity suite report a throttled request as a product outcome, which is the failure mode this
# avoids.
# The counter lives in a FILE, not a shell variable: the helpers below run inside $(...) command
# substitutions, and a variable incremented in a subshell never reaches the parent.
S314_COUNT_FILE="$RIG/.reqcount"
S314_WINDOW_FILE="$RIG/.reqwindow"
printf 0 > "$S314_COUNT_FILE"; date +%s > "$S314_WINDOW_FILE"
bump() {
  local n w elapsed
  n=$(( $(cat "$S314_COUNT_FILE" 2>/dev/null || echo 0) + 1 ))
  printf '%s' "$n" > "$S314_COUNT_FILE"
  if [ "$n" -ge 70 ]; then
    w=$(cat "$S314_WINDOW_FILE" 2>/dev/null || date +%s)
    elapsed=$(( $(date +%s) - w ))
    if [ "$elapsed" -lt 62 ]; then
      echo "  (throttle budget: waiting $((62 - elapsed))s for the request window)" >&2
      sleep $((62 - elapsed))
    fi
    printf 0 > "$S314_COUNT_FILE"; date +%s > "$S314_WINDOW_FILE"
  fi
}
# A 429 is the throttle, not a product answer. Any suite that sees one must fail rather than record
# it as an integrity outcome.
assert_not_throttled() {
  if [ "$1" = "429" ]; then fail=$((fail+1)); echo "FAIL  $2  — THROTTLED (429); the budget was exceeded, result is not a product outcome"; return 1; fi
  return 0
}

PG() { docker exec s314-pg psql -U postgres -d idemtest -Atq "$@"; }
S3() { node -e "
module.paths.unshift('/Users/mckinley/Desktop/Safety_InSite/backend/node_modules');
const {S3Client,ListObjectsV2Command,HeadObjectCommand,GetObjectCommand}=require('@aws-sdk/client-s3');
const c=new S3Client({region:'auto',endpoint:'http://127.0.0.1:19030',forcePathStyle:true,credentials:{accessKeyId:'s314local',secretAccessKey:'s314localsecret'}});
const [op,arg]=process.argv.slice(1);
(async()=>{
 if(op==='count'){const l=await c.send(new ListObjectsV2Command({Bucket:'s314-live'}));console.log((l.Contents||[]).length);}
 if(op==='has'){try{await c.send(new HeadObjectCommand({Bucket:'s314-live',Key:arg}));console.log('yes');}catch(e){console.log('no');}}
 if(op==='sha'){try{const r=await c.send(new GetObjectCommand({Bucket:'s314-live',Key:arg}));const a=[];for await(const x of r.Body)a.push(x);
   console.log(require('crypto').createHash('sha256').update(Buffer.concat(a)).digest('hex'));}catch(e){console.log('ABSENT');}}
 if(op==='size'){try{const r=await c.send(new GetObjectCommand({Bucket:'s314-live',Key:arg}));const a=[];for await(const x of r.Body)a.push(x);
   console.log(Buffer.concat(a).length);}catch(e){console.log('ABSENT');}}
})();" "$@" 2>/dev/null; }
pass=0; fail=0
ck(){ if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — $3"; else fail=$((fail+1)); echo "FAIL  $1  — expected '$3', got '$2'"; fi; }
ckne(){ if [ "$2" != "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — '$2' != '$3'"; else fail=$((fail+1)); echo "FAIL  $1  — expected NOT '$3'"; fi; }

reg() { node "$RIG/seed.js" "$1" 2>/dev/null | grep '^{' | python3 -c "import sys,json
try: print(json.load(sys.stdin)['token'])
except Exception: print('')"; }
mksite() {
  bump
  curl -s -X POST "$B/sites" -H "Authorization: Bearer $1" -H 'content-type: application/json' \
  -d "{\"name\":\"S314 Synthetic Site $RANDOM$RANDOM\"}" | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('id',''))
except Exception: print('')"; }
mkinsp() { bump; local sid; sid=$(mksite "$1")
  curl -s -X POST "$B/inspections" -H "Authorization: Bearer $1" -H 'content-type: application/json' \
    -d "{\"title\":\"S314 synthetic inspection\",\"siteId\":\"$sid\"}" | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('id',''))
except Exception: print('')"; }

# Distinct valid PNGs. `png A` and `png B` differ in CONTENT; `pngEq A` and `pngEq B` differ in
# content at IDENTICAL byte length, which is the case BR-8 requires (length is not integrity).
mkpng() { python3 - "$1" "$2" <<'PYX'
import sys,struct,zlib
label=sys.argv[1]; out=sys.argv[2]
def chunk(t,d):
    c=t+d; return struct.pack('>I',len(d))+c+struct.pack('>I',zlib.crc32(c)&0xffffffff)
# one 1x1 truecolour pixel whose RGB is derived from the label -> different bytes, same length
r,g,b=(ord(label[0])%256,ord(label[-1])%256,len(label)%256)
raw=bytes([0,r,g,b])
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',1,1,8,2,0,0,0))
png+=chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
open(out,'wb').write(png)
PYX
}
sha_of_file(){ shasum -a 256 "$1" | cut -d' ' -f1; }
# upload: token inspectionId file [clientRequestId] -> full JSON response
upload_raw() {
  bump
  if [ -n "${4:-}" ]; then
    curl -s -X POST "$B/inspections/$2/evidence" -H "Authorization: Bearer $1" \
      -F "file=@$3;type=image/png" -F "clientRequestId=$4"
  else
    curl -s -X POST "$B/inspections/$2/evidence" -H "Authorization: Bearer $1" -F "file=@$3;type=image/png"
  fi
}
upload_code() {
  bump
  if [ -n "${4:-}" ]; then
    curl -s -o /dev/null -w '%{http_code}\n' -X POST "$B/inspections/$2/evidence" -H "Authorization: Bearer $1" \
      -F "file=@$3;type=image/png" -F "clientRequestId=$4"
  else
    curl -s -o /dev/null -w '%{http_code}\n' -X POST "$B/inspections/$2/evidence" -H "Authorization: Bearer $1" -F "file=@$3;type=image/png"
  fi
}
jid() { python3 -c "import sys,json
try: print(json.load(sys.stdin).get('id',''))
except Exception: print('')"; }
key_of() { PG -c "select \"objectKey\" from storage_objects where id='$1';"; }
sha_of()  { PG -c "select sha256 from storage_objects where id='$1';"; }
size_of() { PG -c "select \"sizeBytes\" from storage_objects where id='$1';"; }
status_of(){ PG -c "select status from storage_objects where id='$1';"; }

