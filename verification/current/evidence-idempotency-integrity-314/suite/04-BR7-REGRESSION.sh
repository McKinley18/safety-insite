#!/bin/bash
# §314 — BR-7 INTEGRITY GATES RE-RUN AGAINST THE §314 REPAIR.
#
# BR-7 is CLOSED and §314 must not weaken account evidence ownership, erasure authority, tombstone
# semantics, or no-resurrection. These are the §313 gates for those four properties, re-run on the
# §314 rig against the repaired storage service.
#
# DELETE /auth/me is throttled at 5 per 60s (auth.controller.ts). That is production abuse control
# and is not weakened here; the suite budgets its deletions and refuses to accept a 429 as a result.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
RIG=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s314
. "$RIG/lib.sh"
. "$RIG/reset.sh"

mkpng A /tmp/s314-A.png
SHA_A=$(sha_of_file /tmp/s314-A.png)

del_account() {
  local out
  out=$(curl -s -X DELETE "$B/auth/me" -H "Authorization: Bearer $1" -H 'content-type: application/json' -d '{"password":"S314-proof!x9"}')
  if echo "$out" | grep -q "ThrottlerException"; then
    echo "  (DELETE /auth/me rate-limit window — waiting it out; a 429 is not a product answer)" >&2
    sleep 62
    out=$(curl -s -X DELETE "$B/auth/me" -H "Authorization: Bearer $1" -H 'content-type: application/json' -d '{"password":"S314-proof!x9"}')
  fi
  echo "$out"
}
msg_of() { python3 -c "import sys,json
try: print(json.load(sys.stdin).get('message','ERR'))
except Exception: print('ERR')"; }

echo "==================== SETUP ===================="
TA=$(reg "s314-br7-a-$$@internal-acceptance.invalid"); TB=$(reg "s314-br7-b-$$@internal-acceptance.invalid")
IA=$(mkinsp "$TA"); IB=$(mkinsp "$TB")
OA1=$(upload_raw "$TA" "$IA" /tmp/s314-A.png | jid)
OA2=$(upload_raw "$TA" "$IA" /tmp/s314-A.png | jid)
OB1=$(upload_raw "$TB" "$IB" /tmp/s314-A.png | jid)
KA1=$(key_of "$OA1"); KA2=$(key_of "$OA2"); KB1=$(key_of "$OB1")
SHB1=$(S3 sha "$KB1")
ck "three synthetic objects in the store" "$(S3 count)" "3"

echo ""
echo "==================== 1. OWNERSHIP — A's deletion must not touch B ===================="
RESP=$(del_account "$TA")
echo "  DELETE /auth/me (A) -> $(echo "$RESP" | head -c 100)"
ck "A object 1 erased"                 "$(S3 has "$KA1")" "no"
ck "A object 2 erased"                 "$(S3 has "$KA2")" "no"
ck "B object UNTOUCHED"                "$(S3 has "$KB1")" "yes"
ck "B object byte-identical"           "$(S3 sha "$KB1")" "$SHB1"
ck "A rows marked deleted"             "$(status_of "$OA1")" "deleted"
ck "B row still ready"                 "$(status_of "$OB1")" "ready"
ck "B can still read its own evidence" "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$OB1" -H "Authorization: Bearer $TB")" "200"
ck "erasure audit written x2"          "$(PG -c "select count(*) from security_audit_events where action='account_evidence_erased';")" "2"
ck "erasure completion recorded"       "$(PG -c "select count(*) from security_audit_events where action='account_evidence_erasure_complete';")" "1"
ck "B's digest still true"             "$([ "$(sha_of "$OB1")" = "$(S3 sha "$KB1")" ] && echo AGREE || echo DIVERGED)" "AGREE"

echo ""
echo "==================== 2. TOMBSTONE SEMANTICS — per-file erasure by the creator ===================="
TC=$(reg "s314-br7-c-$$@internal-acceptance.invalid"); IC=$(mkinsp "$TC")
OC=$(upload_raw "$TC" "$IC" /tmp/s314-A.png | jid); KC=$(key_of "$OC")
ck "object is servable before deletion" "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$OC" -H "Authorization: Bearer $TC")" "200"
curl -s -o /dev/null -X DELETE "$B/files/$OC" -H "Authorization: Bearer $TC"; bump
ck "row tombstoned"                     "$(status_of "$OC")" "deleted"
ck "deletedAt recorded"                 "$(PG -c "select (\"deletedAt\" is not null) from storage_objects where id='$OC';")" "t"
ck "bytes gone"                         "$(S3 has "$KC")" "no"
ck "unservable to its own creator"      "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$OC" -H "Authorization: Bearer $TC")" "404"

echo ""
echo "==================== 3. NO-RESURRECTION — through the §314 replay path ===================="
# §314's own finding: before the repair, a replayed clientRequestId rewrote an erased object's bytes
# and flipped the tombstone back to 'ready'. This is the BR-7 guarantee restated as a §314 gate.
TD=$(reg "s314-br7-d-$$@internal-acceptance.invalid"); ID=$(mkinsp "$TD")
XD="s314-br7-resurrect-$$"
OD=$(upload_raw "$TD" "$ID" /tmp/s314-A.png "$XD" | jid); KD=$(key_of "$OD")
curl -s -o /dev/null -X DELETE "$B/files/$OD" -H "Authorization: Bearer $TD"; bump
ck "tombstoned"                 "$(status_of "$OD")" "deleted"
ck "bytes gone"                 "$(S3 has "$KD")" "no"
CD=$(upload_code "$TD" "$ID" /tmp/s314-A.png "$XD")
ck "replay REFUSED"             "$CD" "409"
ck "bytes NOT restored"         "$(S3 has "$KD")" "no"
ck "tombstone still stands"     "$(status_of "$OD")" "deleted"
ck "no second row created"      "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$XD';")" "1"

echo ""
echo "==================== 4. ERASURE AUTHORITY — another user cannot erase, nor resurrect ===================="
TE=$(reg "s314-br7-e-$$@internal-acceptance.invalid")
OE_OWNER=$(upload_raw "$TB" "$IB" /tmp/s314-A.png | jid); KE=$(key_of "$OE_OWNER")
ck "a non-creator DELETE is refused"    "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$B/files/$OE_OWNER" -H "Authorization: Bearer $TE")" "404"
ck "the object survives that attempt"   "$(S3 has "$KE")" "yes"
ck "its digest is still true"           "$([ "$(sha_of "$OE_OWNER")" = "$(S3 sha "$KE")" ] && echo AGREE || echo DIVERGED)" "AGREE"

echo ""
echo "==================== 5. ACTIVE-OBJECT INVARIANT AFTER ALL BR-7 ACTIVITY ===================="
STORAGE_S3_BUCKET=s314-live BACKUP_PG_CLIENT_DIR=/opt/homebrew/opt/libpq/bin node scripts/ops/verify-evidence-digest-integrity.js
ck "invariant holds (erased objects classified, not counted as failures)" "$?" "0"

echo ""
echo "==================== RESULT ===================="
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
