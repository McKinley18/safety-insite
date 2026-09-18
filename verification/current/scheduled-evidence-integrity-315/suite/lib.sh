# §315 rig helpers. Disposable PostgreSQL + MinIO, never the development database, never production.
case "${EVIDENCE_DATABASE_URL:-}" in
  *127.0.0.1:15433/integrity*) : ;;
  *) echo "S315 RIG GUARD: EVIDENCE_DATABASE_URL is not the disposable rig database. Source rig.env first."; exit 1 ;;
esac
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
OPS=/Users/mckinley/Desktop/Safety_InSite/backend/scripts/ops
A=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s315

pass=0; fail=0
ck(){ if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — $3"; else fail=$((fail+1)); echo "FAIL  $1  — expected '$3', got '$2'"; fi; }
ckne(){ if [ "$2" != "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — '$2' != '$3'"; else fail=$((fail+1)); echo "FAIL  $1  — expected NOT '$3'"; fi; }

PG(){ docker exec s315-pg psql -U postgres -d integrity -Atq "$@"; }

S3(){ node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,PutObjectCommand,DeleteObjectCommand,HeadObjectCommand,ListObjectsV2Command}=require("@aws-sdk/client-s3");
const fs=require("fs");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19040",forcePathStyle:true,credentials:{accessKeyId:"s315local",secretAccessKey:"s315localsecret"}});
const [op,key,file]=process.argv.slice(1);
(async()=>{
  if(op==="put")  { await c.send(new PutObjectCommand({Bucket:"s315-live",Key:key,Body:fs.readFileSync(file)})); console.log("put"); }
  if(op==="del")  { await c.send(new DeleteObjectCommand({Bucket:"s315-live",Key:key})); console.log("deleted"); }
  if(op==="has")  { try{await c.send(new HeadObjectCommand({Bucket:"s315-live",Key:key})); console.log("yes");}catch(e){console.log("no");} }
  if(op==="count"){ const l=await c.send(new ListObjectsV2Command({Bucket:"s315-live"})); console.log((l.Contents||[]).length); }
})();' "$@" 2>/dev/null; }

# Two payloads: different content, IDENTICAL byte length. The case BR-8/BR-9 both turn on.
mkpayload(){ python3 - "$1" "$2" <<'PYX'
import sys
label=sys.argv[1]; out=sys.argv[2]
body=(label*64).encode()[:256]
open(out,'wb').write(body)
PYX
}
sha_of(){ shasum -a 256 "$1" | cut -d' ' -f1; }

# Insert an ACTIVE authoritative object: DB row + live bytes that match its recorded digest.
add_object(){ # id key file status deletedAt(or NULL)
  local id="$1" key="$2" file="$3" status="${4:-ready}" del="${5:-NULL}"
  local sha size
  sha=$(sha_of "$file"); size=$(wc -c < "$file" | tr -d ' ')
  PG -c "insert into storage_objects (id,\"objectKey\",sha256,\"sizeBytes\",status,\"deletedAt\",category,\"parentType\",\"parentId\",\"ownerUserId\")
         values ('$id','$key','$sha',$size,'$status',$del,'evidence','inspection',gen_random_uuid(),gen_random_uuid());" >/dev/null
  S3 put "$key" "$file" >/dev/null
}

gate(){ node "$OPS/verify-evidence-digest-integrity.js" "$@"; }
health(){ node "$OPS/check-backup-health.js" "$@"; }
state_of(){ python3 -c "import json,sys;print(json.load(open('$1')).get('integrityState',''))" 2>/dev/null; }
overall_of(){ python3 -c "import json,sys;print(json.load(open('$1')).get('overall',''))" 2>/dev/null; }
ihalf_of(){ python3 -c "import json,sys;print(json.load(open('$1'))['integrity']['state'])" 2>/dev/null; }

reset_rig(){
  PG -c "truncate storage_objects, security_audit_events;" >/dev/null
  node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,ListObjectsV2Command,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19040",forcePathStyle:true,credentials:{accessKeyId:"s315local",secretAccessKey:"s315localsecret"}});
(async()=>{for(const b of ["s315-live","s315-recovery"]){const l=await c.send(new ListObjectsV2Command({Bucket:b}));
for(const o of (l.Contents||[])) await c.send(new DeleteObjectCommand({Bucket:b,Key:o.Key}));}})();' 2>/dev/null
}
