#!/bin/bash
# §315 / BR-9 — THE HARD GATES, on a disposable rig.
#
# Every case runs the REAL scripts (verify-evidence-digest-integrity.js, check-backup-health.js)
# against a disposable PostgreSQL and a real S3-compatible object store. MinIO matters for the same
# reason it did at §314: it overwrites silently, exactly as R2 does.
set -u
A=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s315
. "$A/lib.sh"

mkpayload A "$A/A.bin"; mkpayload B "$A/B.bin"
SHA_A=$(sha_of "$A/A.bin"); SHA_B=$(sha_of "$A/B.bin")
LEN_A=$(wc -c < "$A/A.bin" | tr -d ' '); LEN_B=$(wc -c < "$A/B.bin" | tr -d ' ')
echo "payload A sha=$SHA_A len=$LEN_A"
echo "payload B sha=$SHA_B len=$LEN_B"
ck "A and B differ in content"      "$([ "$SHA_A" != "$SHA_B" ] && echo different || echo same)" "different"
ck "A and B are EQUAL byte length"  "$LEN_A" "$LEN_B"

echo ""
echo "==================== 1. NORMAL: every active object matches ===================="
reset_rig
add_object 11111111-1111-1111-1111-111111111111 evidence/2026-09-18/obj-1 "$A/A.bin"
add_object 22222222-2222-2222-2222-222222222222 evidence/2026-09-18/obj-2 "$A/B.bin"
gate --json "$A/r1.json" >/dev/null 2>&1; E=$?
ck "gate exit 0"                "$E" "0"
ck "state INTEGRITY_HOLDS"      "$(state_of "$A/r1.json")" "INTEGRITY_HOLDS"
ck "2 MATCHED"                  "$(python3 -c "import json;print(json.load(open('$A/r1.json'))['counts']['MATCHED'])")" "2"
health --json "$A/h1.json" >/dev/null 2>&1
ck "health integrity half HOLDS" "$(ihalf_of "$A/h1.json")" "INTEGRITY_HOLDS"

echo ""
echo "==================== 2. EQUAL-LENGTH CORRUPTION (the BR-9 case) ===================="
# obj-1's row still says digest(A); its live bytes become B — same length, different content.
S3 put evidence/2026-09-18/obj-1 "$A/B.bin" >/dev/null
gate --json "$A/r2.json" >/dev/null 2>&1; E=$?
ckne "gate exit is not 0"        "$E" "0"
ck "state DIGEST_MISMATCH"       "$(state_of "$A/r2.json")" "DIGEST_MISMATCH"
ck "1 MISMATCHED"                "$(python3 -c "import json;print(json.load(open('$A/r2.json'))['counts']['MISMATCHED'])")" "1"
ck "sizes are equal, so size alone would have passed" "$LEN_A" "$LEN_B"
health --json "$A/h2.json" >/dev/null 2>&1; HE=$?
ck "health integrity half DIGEST_MISMATCH" "$(ihalf_of "$A/h2.json")" "DIGEST_MISMATCH"
ckne "AGGREGATE is not HEALTHY"            "$(overall_of "$A/h2.json")" "HEALTHY"
ckne "health exit is not 0"                "$HE" "0"
# restore
S3 put evidence/2026-09-18/obj-1 "$A/A.bin" >/dev/null
gate --json "$A/r2b.json" >/dev/null 2>&1
ck "restored: back to INTEGRITY_HOLDS"     "$(state_of "$A/r2b.json")" "INTEGRITY_HOLDS"

echo ""
echo "==================== 3. NEVER-CAPTURED OBJECT (no recovery generation) ===================="
# Proves integrity verification is independent of recovery capture: this object has NO generation in
# the recovery bucket at all, and its corruption must still be detected.
reset_rig
add_object 33333333-3333-3333-3333-333333333333 evidence/2026-09-18/fresh "$A/A.bin"
ck "recovery bucket is empty for it"  "$(node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,ListObjectsV2Command}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19040",forcePathStyle:true,credentials:{accessKeyId:"s315local",secretAccessKey:"s315localsecret"}});
c.send(new ListObjectsV2Command({Bucket:"s315-recovery"})).then(l=>console.log((l.Contents||[]).length));' 2>/dev/null)" "0"
S3 put evidence/2026-09-18/fresh "$A/B.bin" >/dev/null
gate --json "$A/r3.json" >/dev/null 2>&1; E=$?
ck "never-captured corruption DETECTED" "$(state_of "$A/r3.json")" "DIGEST_MISMATCH"
ckne "gate exit is not 0"               "$E" "0"
health --json "$A/h3.json" >/dev/null 2>&1
ckne "AGGREGATE is not HEALTHY"         "$(overall_of "$A/h3.json")" "HEALTHY"

echo ""
echo "==================== 4. ACTIVE OBJECT MISSING (no authorized erasure) ===================="
reset_rig
add_object 44444444-4444-4444-4444-444444444444 evidence/2026-09-18/gone "$A/A.bin"
S3 del evidence/2026-09-18/gone >/dev/null
gate --json "$A/r4.json" >/dev/null 2>&1; E=$?
ck "state ACTIVE_OBJECT_MISSING"  "$(state_of "$A/r4.json")" "ACTIVE_OBJECT_MISSING"
ck "1 MISSING"                    "$(python3 -c "import json;print(json.load(open('$A/r4.json'))['counts']['MISSING'])")" "1"
ck "0 ERASURE_AUTHORIZED — not misclassified as an authorized erasure" "$(python3 -c "import json;print(json.load(open('$A/r4.json'))['counts']['ERASURE_AUTHORIZED'])")" "0"
ckne "gate exit is not 0"         "$E" "0"
health --json "$A/h4.json" >/dev/null 2>&1
ckne "AGGREGATE is not HEALTHY"   "$(overall_of "$A/h4.json")" "HEALTHY"

echo ""
echo "==================== 5. ERASURE-AUTHORIZED ABSENCE IS NOT CORRUPTION ===================="
reset_rig
add_object 55555555-5555-5555-5555-555555555555 evidence/2026-09-18/erased "$A/A.bin" deleted "now()"
S3 del evidence/2026-09-18/erased >/dev/null
gate --json "$A/r5.json" >/dev/null 2>&1; E=$?
ck "gate exit 0"                       "$E" "0"
ck "state INTEGRITY_HOLDS"             "$(state_of "$A/r5.json")" "INTEGRITY_HOLDS"
ck "1 ERASURE_AUTHORIZED"              "$(python3 -c "import json;print(json.load(open('$A/r5.json'))['counts']['ERASURE_AUTHORIZED'])")" "1"
ck "0 MISSING — intentional absence is not damage" "$(python3 -c "import json;print(json.load(open('$A/r5.json'))['counts']['MISSING'])")" "0"
ck "0 MISMATCHED"                      "$(python3 -c "import json;print(json.load(open('$A/r5.json'))['counts']['MISMATCHED'])")" "0"
echo "  — and a RESURRECTED erased object is still a failure:"
S3 put evidence/2026-09-18/erased "$A/A.bin" >/dev/null
gate --json "$A/r5b.json" >/dev/null 2>&1; E=$?
ck "resurrection detected"             "$(state_of "$A/r5b.json")" "RESURRECTED"
ckne "gate exit is not 0"              "$E" "0"

echo ""
echo "==================== 6. SOURCE UNAVAILABLE ===================="
reset_rig
add_object 66666666-6666-6666-6666-666666666666 evidence/2026-09-18/src "$A/A.bin"
( export EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY=wrong-secret-deliberately
  gate --json "$A/r6.json" >/dev/null 2>&1; echo "$?" > "$A/r6.code" )
ck "state SOURCE_UNAVAILABLE"     "$(state_of "$A/r6.json")" "SOURCE_UNAVAILABLE"
ck "exit 2 (indeterminate)"       "$(cat "$A/r6.code")" "2"
ck "scanComplete is false"        "$(python3 -c "import json;print(json.load(open('$A/r6.json'))['scanComplete'])")" "False"
ck "0 MATCHED — inability to read is NEVER zero mismatches" "$(python3 -c "import json;print(json.load(open('$A/r6.json'))['counts']['MATCHED'])")" "0"
( export EVIDENCE_SOURCE_S3_SECRET_ACCESS_KEY=wrong-secret-deliberately
  health --json "$A/h6.json" >/dev/null 2>&1; echo "$?" > "$A/h6.code" )
ck "health integrity half SOURCE_UNAVAILABLE" "$(ihalf_of "$A/h6.json")" "SOURCE_UNAVAILABLE"
# The rig has no backup destination, so its DATABASE half is legitimately FAILED, and FAILED
# outranks UNKNOWN by the §312A rule. What §315 must show is that integrity cannot be HEALTHY.
ckne "AGGREGATE is not HEALTHY"               "$(overall_of "$A/h6.json")" "HEALTHY"
ck "aggregate over the integrity half alone would be UNKNOWN" \
   "$(node -e "console.log(require('$OPS/check-backup-health.js').aggregate('HEALTHY','PROTECTED','SOURCE_UNAVAILABLE'))")" "UNKNOWN"
ckne "health exit is not 0"                   "$(cat "$A/h6.code")" "0"

echo ""
echo "==================== 7. HASH / READ FAILURE ON ONE OBJECT ===================="
reset_rig
add_object 77777777-7777-7777-7777-777777777777 evidence/2026-09-18/ok   "$A/A.bin"
add_object 88888888-8888-8888-8888-888888888888 evidence/2026-09-18/bad  "$A/A.bin"
# Make exactly ONE object unreadable. An over-long key is refused by the object store with HTTP 400
# (XMinioInvalidObjectName) — a genuine READ FAILURE, and explicitly not a 404, so it cannot be
# mistaken for an absent object. An EMPTY key would instead be caught earlier as a malformed row,
# which is a different gate (case 8).
PG -c "alter table storage_objects alter column \"objectKey\" type varchar(2000);" >/dev/null
PG -c "update storage_objects set \"objectKey\"=repeat('k',1100) where id='88888888-8888-8888-8888-888888888888';" >/dev/null
gate --json "$A/r7.json" >/dev/null 2>&1; E=$?
echo "  state: $(state_of "$A/r7.json")  exit: $E"
ckne "gate exit is not 0"                "$E" "0"
ckne "state is not INTEGRITY_HOLDS"      "$(state_of "$A/r7.json")" "INTEGRITY_HOLDS"
ck "state HASH_FAILURE"                  "$(state_of "$A/r7.json")" "HASH_FAILURE"
ck "the failure was counted, not skipped" "$(python3 -c "import json;print(json.load(open('$A/r7.json'))['hashFailures'])")" "1"
ck "the one readable object still matched, and did NOT carry the verdict" \
   "$(python3 -c "import json;print(json.load(open('$A/r7.json'))['counts']['MATCHED'])")" "1"
health --json "$A/h7.json" >/dev/null 2>&1
ckne "AGGREGATE is not HEALTHY"          "$(overall_of "$A/h7.json")" "HEALTHY"

echo ""
echo "==================== 8. INCOMPLETE / PARTIAL ENUMERATION ===================="
# The gate counts the population independently of the listing, so a listing that does not account for
# every row fails closed rather than reporting "everything I managed to see matched".
#
# The truncation is REAL, not simulated: an object key containing a newline makes psql emit one row
# across two lines, so the strict parser sees two malformed lines where one row exists. That is the
# shape of every partial/malformed enumeration — fewer parsed rows than the population.
reset_rig
add_object 99999999-9999-9999-9999-999999999999 evidence/2026-09-18/e1 "$A/A.bin"
add_object aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa evidence/2026-09-18/e2 "$A/A.bin"
gate --json "$A/r8base.json" >/dev/null 2>&1
ck "baseline holds with 2 rows"        "$(state_of "$A/r8base.json")" "INTEGRITY_HOLDS"
ck "baseline counted 2 of 2"           "$(python3 -c "
import json
m=json.load(open('$A/r8base.json'))['metrics']
print(str(m['rowsListed'])+'/'+str(m['populationExpected']))")" "2/2"
PG -c "update storage_objects set \"objectKey\"=E'evidence/2026-09-18/e2\nsplit' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';" >/dev/null
gate --json "$A/r8.json" >/dev/null 2>&1; E=$?
echo "  state: $(state_of "$A/r8.json")  exit: $E"
ck "state INCOMPLETE_SCAN"             "$(state_of "$A/r8.json")" "INCOMPLETE_SCAN"
ck "exit 2 (indeterminate)"            "$E" "2"
ck "scanComplete is false"             "$(python3 -c "import json;print(json.load(open('$A/r8.json'))['scanComplete'])")" "False"
ck "0 MATCHED — a partial scan reports NOTHING as verified" "$(python3 -c "import json;print(json.load(open('$A/r8.json'))['counts']['MATCHED'])")" "0"
health --json "$A/h8.json" >/dev/null 2>&1
ck "health integrity half INCOMPLETE_SCAN" "$(ihalf_of "$A/h8.json")" "INCOMPLETE_SCAN"
ckne "AGGREGATE is not HEALTHY"            "$(overall_of "$A/h8.json")" "HEALTHY"

echo ""
echo "==================== 8b. AGGREGATE PROPAGATION, asserted directly ===================="
# The rig cannot make the DATABASE half HEALTHY (it has no backup destination), so an aggregate read
# from a rig run can never isolate integrity as the sole cause. The formula is therefore asserted as
# the pure function it is — which is also the only way to show that a HEALTHY database and PROTECTED
# recovery cannot offset an integrity failure.
AGG(){ node -e "console.log(require('$OPS/check-backup-health.js').aggregate('$1','$2','$3'))"; }
ck "all three healthy -> HEALTHY"                    "$(AGG HEALTHY PROTECTED INTEGRITY_HOLDS)" "HEALTHY"
ckne "DIGEST_MISMATCH cannot be offset"              "$(AGG HEALTHY PROTECTED DIGEST_MISMATCH)" "HEALTHY"
ckne "ACTIVE_OBJECT_MISSING cannot be offset"        "$(AGG HEALTHY PROTECTED ACTIVE_OBJECT_MISSING)" "HEALTHY"
ckne "RESURRECTED cannot be offset"                  "$(AGG HEALTHY PROTECTED RESURRECTED)" "HEALTHY"
ckne "HASH_FAILURE cannot be offset"                 "$(AGG HEALTHY PROTECTED HASH_FAILURE)" "HEALTHY"
ck "INCOMPLETE_SCAN -> UNKNOWN"                      "$(AGG HEALTHY PROTECTED INCOMPLETE_SCAN)" "UNKNOWN"
ck "SOURCE_UNAVAILABLE -> UNKNOWN"                   "$(AGG HEALTHY PROTECTED SOURCE_UNAVAILABLE)" "UNKNOWN"
ck "INTEGRITY_UNKNOWN -> UNKNOWN"                    "$(AGG HEALTHY PROTECTED INTEGRITY_UNKNOWN)" "UNKNOWN"
ck "a failed database still fails even with integrity holding" "$(AGG FAILED PROTECTED INTEGRITY_HOLDS)" "FAILED"
ck "unprotected recovery still degrades"             "$(AGG HEALTHY ATTENTION_REQUIRED INTEGRITY_HOLDS)" "DEGRADED"

echo ""
echo "==================== 9. STALE / MISSING HANDED-OVER REPORT ===================="
reset_rig
add_object bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb evidence/2026-09-18/h "$A/A.bin"
gate --json "$A/handover.json" >/dev/null 2>&1
ck "the handed-over report holds" "$(state_of "$A/handover.json")" "INTEGRITY_HOLDS"
health --integrity-report "$A/handover.json" --integrity-not-before "1970-01-01T00:00:00Z" --json "$A/h9ok.json" >/dev/null 2>&1
ck "a fresh handover is accepted"  "$(ihalf_of "$A/h9ok.json")" "INTEGRITY_HOLDS"
health --integrity-report "$A/handover.json" --integrity-not-before "2099-01-01T00:00:00Z" --json "$A/h9stale.json" >/dev/null 2>&1
ck "a STALE handover is refused"   "$(ihalf_of "$A/h9stale.json")" "INTEGRITY_UNKNOWN"
ckne "and the aggregate is not HEALTHY" "$(overall_of "$A/h9stale.json")" "HEALTHY"
ck "aggregate over the integrity half alone would be UNKNOWN" \
   "$(node -e "console.log(require('$OPS/check-backup-health.js').aggregate('HEALTHY','PROTECTED','INTEGRITY_UNKNOWN'))")" "UNKNOWN"
health --integrity-report "$A/does-not-exist.json" --integrity-not-before "1970-01-01T00:00:00Z" --json "$A/h9missing.json" >/dev/null 2>&1
ck "a MISSING handover is refused" "$(ihalf_of "$A/h9missing.json")" "INTEGRITY_UNKNOWN"
echo '{"schema":"something.else.v1"}' > "$A/foreign.json"
health --integrity-report "$A/foreign.json" --integrity-not-before "1970-01-01T00:00:00Z" --json "$A/h9foreign.json" >/dev/null 2>&1
ck "a FOREIGN report is refused"   "$(ihalf_of "$A/h9foreign.json")" "INTEGRITY_UNKNOWN"

echo ""
echo "==================== RESULT ===================="
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
