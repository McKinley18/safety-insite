#!/bin/bash
# §314 / BR-8 — THE IDEMPOTENCY AND EVIDENCE-DIGEST INTEGRITY GATES, against the repaired product.
#
# Same rig, same real HTTP, same real S3-semantics object store as 01-BEFORE.sh. Every case that
# 01-BEFORE demonstrated as a defect appears here as a gate.
set -u
cd /Users/mckinley/Desktop/Safety_InSite/backend
RIG=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s314
. "$RIG/lib.sh"
. "$RIG/reset.sh"

mkpng A /tmp/s314-A.png; mkpng B /tmp/s314-B.png
SHA_A=$(sha_of_file /tmp/s314-A.png); SHA_B=$(sha_of_file /tmp/s314-B.png)
LEN_A=$(wc -c < /tmp/s314-A.png | tr -d ' '); LEN_B=$(wc -c < /tmp/s314-B.png | tr -d ' ')
echo "payload A sha=$SHA_A len=$LEN_A"
echo "payload B sha=$SHA_B len=$LEN_B"
ck "A != B in content"                 "$([ "$SHA_A" != "$SHA_B" ] && echo different || echo same)" "different"
ck "A and B are EQUAL LENGTH (length is not integrity)" "$LEN_A" "$LEN_B"

T=$(reg "s314-after-a-$$@internal-acceptance.invalid"); I=$(mkinsp "$T")
reason_of() { python3 -c "import sys,json
try: print(json.load(sys.stdin).get('reason',''))
except Exception: print('')"; }

echo ""
echo "==================== 1. COMPLETED REPLAY — same id, same payload ===================="
X1="s314-same-$$"
O1=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X1" | jid); K1=$(key_of "$O1")
AUD1=$(PG -c "select count(*) from security_audit_events where action='file_upload_completed' and \"resourceId\"='$O1';")
O1R=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X1" | jid)
AUD2=$(PG -c "select count(*) from security_audit_events where action='file_upload_completed' and \"resourceId\"='$O1';")
ck "replay returns the SAME object"            "$O1R" "$O1"
ck "exactly ONE storage_object row"            "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X1';")" "1"
ck "NO duplicate upload audit side effect"     "$AUD2" "$AUD1"
ck "digest unchanged"                          "$(sha_of "$O1")" "$SHA_A"
ck "live bytes still equal the stored digest"  "$(S3 sha "$K1")" "$(sha_of "$O1")"
ck "exactly ONE object in the store for it"    "$(S3 has "$K1")" "yes"

echo ""
echo "==================== 2. SAME ID / DIFFERENT PAYLOAD — completed row ===================="
X2="s314-diff-ready-$$"
O2=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X2" | jid); K2=$(key_of "$O2")
R2=$(upload_raw "$T" "$I" /tmp/s314-B.png "$X2")
C2=$(upload_code "$T" "$I" /tmp/s314-B.png "$X2")
echo "  replay-with-B -> HTTP $C2 reason=$(echo "$R2" | reason_of)"
ck "refused deterministically with 409"     "$C2" "409"
ck "reason is PAYLOAD_MISMATCH"             "$(echo "$R2" | reason_of)" "PAYLOAD_MISMATCH"
ck "evidence A was NOT replaced by B"       "$(S3 sha "$K2")" "$SHA_A"
ck "stored digest still describes A"        "$(sha_of "$O2")" "$SHA_A"
ck "DB digest EQUALS live bytes"            "$([ "$(sha_of "$O2")" = "$(S3 sha "$K2")" ] && echo AGREE || echo DIVERGED)" "AGREE"

echo ""
echo "==================== 3. THE BR-8 CASE — interrupted first attempt, replay carries B ===================="
X3="s314-br8-$$"
echo "  stopping the object store so the FIRST PUT genuinely fails"
docker stop s314-minio >/dev/null 2>&1; sleep 1
C3A=$(upload_code "$T" "$I" /tmp/s314-A.png "$X3")
O3=$(PG -c "select id from storage_objects where \"clientRequestId\"='$X3';"); K3=$(key_of "$O3")
echo "  first attempt (bytes A, store down) -> HTTP $C3A ; row $O3 status $(status_of "$O3")"
ck "row records sha256(A)"  "$(sha_of "$O3")" "$SHA_A"
ck "row status is failed"   "$(status_of "$O3")" "failed"
docker start s314-minio >/dev/null 2>&1; sleep 6
R3=$(upload_raw "$T" "$I" /tmp/s314-B.png "$X3")
C3B=$(upload_code "$T" "$I" /tmp/s314-B.png "$X3")
echo "  replay carrying bytes B -> HTTP $C3B reason=$(echo "$R3" | reason_of)"
ck "divergent replay REFUSED"            "$C3B" "409"
ck "reason is PAYLOAD_MISMATCH"          "$(echo "$R3" | reason_of)" "PAYLOAD_MISMATCH"
ck "B's bytes were NOT written"          "$(S3 has "$K3")" "no"
ck "row was not falsely completed"       "$(status_of "$O3")" "failed"
echo "  now the LEGITIMATE resume — the same identifier replayed with the SAME bytes A"
C3C=$(upload_code "$T" "$I" /tmp/s314-A.png "$X3")
echo "  replay carrying bytes A -> HTTP $C3C"
ck "legitimate resume succeeds"                    "$C3C" "201"
ck "row is ready"                                  "$(status_of "$O3")" "ready"
ck "live bytes are A"                              "$(S3 sha "$K3")" "$SHA_A"
ck "DB DIGEST EQUALS LIVE BYTES (the invariant)"   "$([ "$(sha_of "$O3")" = "$(S3 sha "$K3")" ] && echo AGREE || echo DIVERGED)" "AGREE"
ck "still exactly ONE row for the identifier"      "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X3';")" "1"

echo ""
echo "==================== 4. NO-RESURRECTION — replay after the customer deleted the file ===================="
X4="s314-resurrect-$$"
O4=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X4" | jid); K4=$(key_of "$O4")
curl -s -o /dev/null -X DELETE "$B/files/$O4" -H "Authorization: Bearer $T"; bump
ck "file is tombstoned"                "$(status_of "$O4")" "deleted"
ck "bytes gone from the store"         "$(S3 has "$K4")" "no"
R4=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X4")
C4=$(upload_code "$T" "$I" /tmp/s314-A.png "$X4")
echo "  replay of the deleted file's identifier -> HTTP $C4 reason=$(echo "$R4" | reason_of)"
ck "resurrection REFUSED"                    "$C4" "409"
ck "reason is EVIDENCE_RETIRED"              "$(echo "$R4" | reason_of)" "EVIDENCE_RETIRED"
ck "erased bytes NOT restored"               "$(S3 has "$K4")" "no"
ck "tombstone still stands"                  "$(status_of "$O4")" "deleted"
ck "no second row was created instead"       "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X4';")" "1"
ck "file still unservable"                   "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$O4" -H "Authorization: Bearer $T")" "404"

echo ""
echo "==================== 5. CROSS-USER SAME IDENTIFIER ===================="
TB=$(reg "s314-after-b-$$@internal-acceptance.invalid"); IB=$(mkinsp "$TB")
X5="s314-shared-$$"
O5A=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X5" | jid); K5A=$(key_of "$O5A")
O5B=$(upload_raw "$TB" "$IB" /tmp/s314-B.png "$X5" | jid); K5B=$(key_of "$O5B")
ckne "B did NOT receive A's object"          "$O5B" "$O5A"
ck "A's bytes untouched"                     "$(S3 sha "$K5A")" "$SHA_A"
ck "B's own bytes stored correctly"          "$(S3 sha "$K5B")" "$SHA_B"
ck "A's digest still true"                   "$([ "$(sha_of "$O5A")" = "$(S3 sha "$K5A")" ] && echo AGREE || echo DIVERGED)" "AGREE"
ck "B's digest still true"                   "$([ "$(sha_of "$O5B")" = "$(S3 sha "$K5B")" ] && echo AGREE || echo DIVERGED)" "AGREE"
ck "B cannot read A's object"                "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$O5A" -H "Authorization: Bearer $TB")" "404"

echo ""
echo "==================== 6. CROSS-OPERATION SAME IDENTIFIER ===================="
I2=$(mkinsp "$T")
X6="s314-crossop-$$"
O6A=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X6" | jid)
R6=$(upload_raw "$T" "$I2" /tmp/s314-A.png "$X6")
C6=$(upload_code "$T" "$I2" /tmp/s314-A.png "$X6")
echo "  same identifier, DIFFERENT inspection -> HTTP $C6 reason=$(echo "$R6" | reason_of)"
ck "cross-operation replay REFUSED"     "$C6" "409"
ck "reason is OPERATION_MISMATCH"       "$(echo "$R6" | reason_of)" "OPERATION_MISMATCH"
ck "caller was NOT handed the other inspection's object" "$(echo "$R6" | jid)" ""
ck "first object still bound to its own inspection"      "$(PG -c "select \"parentId\" from storage_objects where id='$O6A';")" "$I"

echo ""
echo "==================== 7. CONCURRENT DUPLICATES ===================="
X7="s314-concurrent-$$"
for n in 1 2 3 4 5; do
  ( upload_code "$T" "$I" /tmp/s314-A.png "$X7" > /tmp/s314-c$n.code 2>/dev/null ) &
done
wait
echo "  five simultaneous identical uploads -> codes: $(cat /tmp/s314-c1.code /tmp/s314-c2.code /tmp/s314-c3.code /tmp/s314-c4.code /tmp/s314-c5.code | tr '\n' ' ')"
O7=$(PG -c "select id from storage_objects where \"clientRequestId\"='$X7';")
K7=$(key_of "$O7")
ck "exactly ONE storage_object row"                "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X7';")" "1"
ck "row is ready"                                  "$(status_of "$O7")" "ready"
ck "DB DIGEST EQUALS LIVE BYTES"                   "$([ "$(sha_of "$O7")" = "$(S3 sha "$K7")" ] && echo AGREE || echo DIVERGED)" "AGREE"
ck "live bytes are A"                              "$(S3 sha "$K7")" "$SHA_A"
ck "no 5xx among the concurrent responses"         "$(cat /tmp/s314-c*.code | grep -c '^5' || true)" "0"

echo ""
echo "==================== 8. CONCURRENT DUPLICATES, DIVERGENT PAYLOAD ===================="
X8="s314-concurrent-diff-$$"
( upload_code "$T" "$I" /tmp/s314-A.png "$X8" > /tmp/s314-d1.code 2>/dev/null ) &
( upload_code "$T" "$I" /tmp/s314-B.png "$X8" > /tmp/s314-d2.code 2>/dev/null ) &
wait
echo "  A and B racing on one identifier -> $(cat /tmp/s314-d1.code) $(cat /tmp/s314-d2.code)"
O8=$(PG -c "select id from storage_objects where \"clientRequestId\"='$X8';"); K8=$(key_of "$O8")
ck "exactly ONE storage_object row"        "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X8';")" "1"
ck "DB DIGEST EQUALS LIVE BYTES"           "$([ "$(sha_of "$O8")" = "$(S3 sha "$K8")" ] && echo AGREE || echo DIVERGED)" "AGREE"
ck "exactly one of the two was refused"    "$(cat /tmp/s314-d1.code /tmp/s314-d2.code | grep -c '^409' || true)" "1"

echo ""
echo "==================== 9. PUT SUCCEEDED / FINALIZATION FAILED — resume must not destroy bytes ==========="
# The post-condition of that boundary is: bytes present at the key, row not yet 'ready'. It is
# constructed here rather than raced, and stated as construction: the point under test is what a
# REPLAY does when it meets that state, not how the state is reached.
X9="s314-finalfail-$$"
O9=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X9" | jid); K9=$(key_of "$O9")
PG -c "update storage_objects set status='uploading' where id='$O9';" >/dev/null
ck "constructed state: bytes present"    "$(S3 has "$K9")" "yes"
ck "constructed state: row uploading"    "$(status_of "$O9")" "uploading"
C9=$(upload_code "$T" "$I" /tmp/s314-A.png "$X9")
ck "replay completes the row"            "$C9" "201"
ck "row is ready"                        "$(status_of "$O9")" "ready"
ck "bytes were NOT destroyed"            "$(S3 has "$K9")" "yes"
ck "DB DIGEST EQUALS LIVE BYTES"         "$([ "$(sha_of "$O9")" = "$(S3 sha "$K9")" ] && echo AGREE || echo DIVERGED)" "AGREE"

echo ""
echo "==================== 10. CALLER AUTHORITY OVER DIGEST AND KEY ===================="
# The whitelist DTO rejects any field other than clientRequestId (forbidNonWhitelisted, main.ts).
POISON=$(curl -s -X POST "$B/inspections/$I/evidence" -H "Authorization: Bearer $T" \
  -F "file=@/tmp/s314-A.png;type=image/png" -F "clientRequestId=s314-poison-$$" \
  -F "sha256=deadbeef" -F "objectKey=evidence/attacker/owned" -F "status=ready"); bump
echo "  mass-assignment attempt -> $(echo "$POISON" | head -c 140)"
ck "caller-supplied metadata REFUSED"  "$(echo "$POISON" | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('statusCode',''))
except Exception: print('')")" "400"
ck "no row was created by the poisoned request" "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='s314-poison-$$';")" "0"
CLEAN=$(upload_raw "$T" "$I" /tmp/s314-A.png "s314-authority-$$" | jid)
ck "server-derived digest is sha256(the bytes)" "$(sha_of "$CLEAN")" "$SHA_A"
ck "server-derived key is category/date/uuid"   "$(key_of "$CLEAN" | grep -cE '^evidence/[0-9]{4}-[0-9]{2}-[0-9]{2}/[0-9a-f-]{36}$')" "1"

echo ""
echo "==================== 11. ACTIVE-OBJECT INVARIANT ACROSS THE WHOLE RIG ===================="
STORAGE_S3_BUCKET=s314-live BACKUP_PG_CLIENT_DIR=/opt/homebrew/opt/libpq/bin node scripts/ops/verify-evidence-digest-integrity.js
INV=$?
ck "active-object invariant holds for every ACTIVE object" "$INV" "0"

echo ""
echo "==================== RESULT ===================="
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
