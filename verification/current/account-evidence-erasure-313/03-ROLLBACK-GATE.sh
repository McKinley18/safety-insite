#!/bin/bash
# §313 — does an ACCOUNT-DELETION erasure produce a rollback-proof tombstone, and is it refused
# after a database rollback? Uses the §312 reconciler against the §313 disposable rig.
set -u; cd /Users/mckinley/Desktop/Safety_InSite/backend
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
export EVIDENCE_DATABASE_URL="postgresql://postgres:s313@127.0.0.1:15472/erasuretest"
export EVIDENCE_SOURCE_S3_ENDPOINT="http://127.0.0.1:19020" EVIDENCE_SOURCE_S3_BUCKET="s313-live"
export EVIDENCE_SOURCE_S3_ACCESS_KEY_ID="s313local" EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY="s313localsecret" EVIDENCE_SOURCE_S3_FORCE_PATH_STYLE=true
export BACKUP_S3_ENDPOINT="http://127.0.0.1:19020" BACKUP_S3_BUCKET="s313-recovery"
export BACKUP_S3_ACCESS_KEY_ID="s313local" BACKUP_S3_SECRET_ACCESS_KEY="s313localsecret" BACKUP_S3_FORCE_PATH_STYLE=true
export EVIDENCE_ERASURE_GRACE_HOURS="${GRACE:-9999}"
PG(){ docker exec s313-pg psql -U postgres -d erasuretest -Atq "$@"; }
R(){ node scripts/ops/reconcile-evidence-recovery.js "$@" >/tmp/e.out 2>&1; local rc=$?; grep -v NodeVersionSupport /tmp/e.out; return $rc; }
st(){ R --json /tmp/e.json >/dev/null 2>&1; python3 -c "
import json;d=json.load(open('/tmp/e.json'))
f=[x for x in d['findings'] if x.get('id')=='$1']
print(f[0]['state'] if f else 'ABSENT')"; }
p=0;f=0; ck(){ [ "$2" = "$3" ] && { p=$((p+1)); echo "PASS  $1 -> $3"; } || { f=$((f+1)); echo "FAIL  $1 expected $3 got $2"; }; }
OID=$(PG -c "select id from storage_objects where status='deleted' order by \"deletedAt\" desc limit 1;")
echo "  using an account-erased object: $OID"
echo "  T0/T1/T2 already done by the proof suite (account deleted, live evidence erased)"
echo "  T3: run the recovery reconciler so it records authoritative erasure"
R --apply >/dev/null
ck "erasure recognised from account deletion" "$(st $OID)" "MISSING_LIVE_ERASURE_AUTHORIZED"
R --restore "$OID" >/dev/null 2>&1; ck "restore refused" "$([ $? -ne 0 ] && echo refused || echo allowed)" "refused"
echo "  ROLLING THE DATABASE BACK to before the erasure"
PG -c "update storage_objects set \"deletedAt\"=null, status='ready', \"deletedByUserId\"=null where id='$OID';" >/dev/null
PG -c "delete from security_audit_events where \"resourceId\"='$OID';" >/dev/null
echo "  database now says: $(PG -c "select 'status='||status||' deletedAt='||coalesce(\"deletedAt\"::text,'NULL') from storage_objects where id='$OID';")"
ck "STILL erasure-authoritative after rollback" "$(st $OID)" "MISSING_LIVE_ERASURE_AUTHORIZED"
R --restore "$OID" >/dev/null 2>&1; ck "restore STILL refused after rollback" "$([ $? -ne 0 ] && echo refused || echo allowed)" "refused"
echo ""; echo "$p passed, $f failed"; [ $f -eq 0 ] || exit 1
