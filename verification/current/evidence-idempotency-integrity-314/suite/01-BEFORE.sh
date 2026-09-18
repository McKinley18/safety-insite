#!/bin/bash
# §314 / BR-8 — THE DEFECT, DEMONSTRATED AGAINST UNMODIFIED PRODUCTION CODE.
#
# Every case below runs over real HTTP against the real application, on a disposable PostgreSQL and
# a real S3-compatible object store (MinIO). MinIO matters: LocalTestStorageProvider writes with
# flag 'wx', so a second PUT to an existing key FAILS there and the overwrite BR-8 describes cannot
# occur. R2 and MinIO both overwrite silently, so only an S3-semantics store can measure this.
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
ck "A and B are DIFFERENT bytes"            "$([ "$SHA_A" != "$SHA_B" ] && echo different || echo same)" "different"
ck "A and B are the SAME byte length"       "$LEN_A" "$LEN_B"

T=$(reg "s314-before-a-$$@internal-acceptance.invalid")
I=$(mkinsp "$T")
echo "  actor token len ${#T} | inspection $I"

echo ""
echo "==================== 1. COMPLETED REPLAY (same id, same payload) ===================="
X1="s314-complete-$$"
O1=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X1" | jid)
K1=$(key_of "$O1")
BEFORE_PUTS=$(S3 count)
O1R=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X1" | jid)
ck "replay returns the SAME storage object"     "$O1R" "$O1"
ck "exactly one storage_object row for the id"  "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X1';")" "1"
ck "live bytes still equal the stored digest"   "$(S3 sha "$K1")" "$(sha_of "$O1")"
ck "stored digest is sha256(A)"                 "$(sha_of "$O1")" "$SHA_A"

echo ""
echo "==================== 2. SAME ID / DIFFERENT PAYLOAD, first attempt READY ===================="
X2="s314-diffpayload-ready-$$"
O2=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X2" | jid)
K2=$(key_of "$O2")
CODE2=$(upload_code "$T" "$I" /tmp/s314-B.png "$X2")
echo "  replay-with-B HTTP $CODE2"
ck "A's bytes were NOT replaced by B"        "$(S3 sha "$K2")" "$SHA_A"
ck "stored digest still describes A"         "$(sha_of "$O2")" "$SHA_A"

echo ""
echo "==================== 3. THE BR-8 DEFECT — interrupted first attempt, replay carries B ===================="
# The object store is stopped so the FIRST attempt's PUT genuinely fails. That is the real
# "DB row created but PUT fails" boundary, not a constructed state: the row is created with
# sha256(A), the PUT throws, and the row is left at 'failed'.
X3="s314-br8-$$"
echo "  stopping the object store to fail the first PUT"
docker stop s314-minio >/dev/null 2>&1; sleep 1
CODE3A=$(upload_code "$T" "$I" /tmp/s314-A.png "$X3")
echo "  first attempt (bytes A, store down) -> HTTP $CODE3A"
O3=$(PG -c "select id from storage_objects where \"clientRequestId\"='$X3';")
K3=$(key_of "$O3")
ck "row exists after the failed first attempt"  "$([ -n "$O3" ] && echo yes || echo no)" "yes"
ck "row records sha256(A)"                      "$(sha_of "$O3")" "$SHA_A"
ck "row status is failed"                       "$(status_of "$O3")" "failed"
echo "  restarting the object store"
docker start s314-minio >/dev/null 2>&1; sleep 6
CODE3B=$(upload_code "$T" "$I" /tmp/s314-B.png "$X3")
echo "  replay of the SAME clientRequestId carrying bytes B -> HTTP $CODE3B"
LIVE3=$(S3 sha "$K3"); DB3=$(sha_of "$O3")
echo "  DB digest   $DB3"
echo "  live digest $LIVE3"
ck "row is now 'ready' (the product believes this object is servable)" "$(status_of "$O3")" "ready"
echo ""
echo "  >>> BR-8: does the database digest describe the live bytes?"
ck "DB DIGEST EQUALS LIVE BYTES (the invariant)"  "$([ "$DB3" = "$LIVE3" ] && echo AGREE || echo DIVERGED)" "AGREE"
ck "live bytes are A (evidence A preserved)"      "$LIVE3" "$SHA_A"

echo ""
echo "==================== 4. NO-RESURRECTION — replay after the customer deleted the file ===================="
# BR-7 is CLOSED and its no-resurrection guarantee must hold. DELETE /files/:id is the customer's
# own per-file erasure; this asks whether a replayed clientRequestId can bring the file back.
X4="s314-resurrect-$$"
O4=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X4" | jid)
K4=$(key_of "$O4")
curl -s -o /dev/null -X DELETE "$B/files/$O4" -H "Authorization: Bearer $T"
ck "file is tombstoned"                    "$(status_of "$O4")" "deleted"
ck "bytes are gone from the object store"  "$(S3 has "$K4")" "no"
CODE4=$(upload_code "$T" "$I" /tmp/s314-A.png "$X4")
echo "  replay of the deleted file's clientRequestId -> HTTP $CODE4"
ck "the erased object was NOT resurrected in the store" "$(S3 has "$K4")" "no"
ck "the tombstone still stands"                         "$(status_of "$O4")" "deleted"
ck "the deleted file is still unservable"  "$(curl -s -o /dev/null -w '%{http_code}' "$B/files/$O4" -H "Authorization: Bearer $T")" "404"

echo ""
echo "==================== 5. CROSS-USER SAME IDENTIFIER ===================="
TB=$(reg "s314-before-b-$$@internal-acceptance.invalid"); IB=$(mkinsp "$TB")
X5="s314-shared-identifier-$$"
O5A=$(upload_raw "$T" "$I" /tmp/s314-A.png "$X5" | jid)
O5B=$(upload_raw "$TB" "$IB" /tmp/s314-B.png "$X5" | jid)
K5A=$(key_of "$O5A")
ckne "B did not receive A's object" "$O5B" "$O5A"
ck "A's bytes untouched by B's upload" "$(S3 sha "$K5A")" "$SHA_A"
ck "two distinct rows share the identifier across users" "$(PG -c "select count(*) from storage_objects where \"clientRequestId\"='$X5';")" "2"

echo ""
echo "==================== 6. CROSS-OPERATION SAME IDENTIFIER (same user, other inspection) ===================="
I2=$(mkinsp "$T")
echo "  second inspection: $I2"
X6="s314-crossop-$$"
O6A=$(upload_raw "$T" "$I"  /tmp/s314-A.png "$X6" | jid)
O6B=$(upload_raw "$T" "$I2" /tmp/s314-A.png "$X6" | jid)
P6A=$(PG -c "select \"parentId\" from storage_objects where id='$O6A';")
P6B=$(PG -c "select \"parentId\" from storage_objects where id='$O6B' ;")
echo "  first upload parent  $P6A (inspection $I)"
echo "  replayed-id response $O6B -> parent $P6B (requested inspection $I2)"
ck "the second upload is bound to the inspection it was sent to" "$P6B" "$I2"

echo ""
echo "==================== RESULT ===================="
echo "$pass passed, $fail failed"
