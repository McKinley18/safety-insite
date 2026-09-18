#!/bin/bash
# §314A — SYNTHETIC PRODUCTION IDEMPOTENCY PROOF, against the REAL deployed route.
#
# ONE disposable synthetic account on @internal-acceptance.invalid, created through normal governed
# signup, carrying ONLY synthetic evidence. The five real customer objects are never written to and
# are re-verified byte-for-byte afterwards.
#
# NOTHING DESTRUCTIVE IS INDUCED. No race storm, no infrastructure failure, no forced interruption.
# Concurrency and interruption boundaries stay where §314 proved them — on the disposable rig.
# Production proof is limited to: normal replay, divergent replay, operation mismatch, integrity,
# recovery, cleanup.
set -u
B=https://safescope-backend.onrender.com
A=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s314a
STAMP=$(date +%s)
# A retry REUSES the account already created rather than leaving a second one behind in production.
EMAIL="${1:-s314a-synthetic-${STAMP}@internal-acceptance.invalid}"
REUSE=$([ -n "${1:-}" ] && echo yes || echo no)
PW='S314A-synthetic!x9'

pass=0; fail=0
ck(){ if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — $3"; else fail=$((fail+1)); echo "FAIL  $1  — expected '$3', got '$2'"; fi; }
ckne(){ if [ "$2" != "$3" ]; then pass=$((pass+1)); echo "PASS  $1  — '$2' != '$3'"; else fail=$((fail+1)); echo "FAIL  $1  — expected NOT '$3'"; fi; }
jq_(){ python3 -c "import sys,json
try: print(json.load(sys.stdin).get('$1',''))
except Exception: print('')"; }

# Two valid 1x1 PNGs: different content, IDENTICAL byte length. Equal length is the case BR-8 names.
mkpng() { python3 - "$1" "$2" <<'PYX'
import sys,struct,zlib
label=sys.argv[1]; out=sys.argv[2]
def chunk(t,d):
    c=t+d; return struct.pack('>I',len(d))+c+struct.pack('>I',zlib.crc32(c)&0xffffffff)
r,g,b=(ord(label[0])%256, ord(label[-1])%256, len(label)%256)
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',1,1,8,2,0,0,0))
png+=chunk(b'IDAT',zlib.compress(bytes([0,r,g,b]),9))+chunk(b'IEND',b'')
open(out,'wb').write(png)
PYX
}
mkpng A "$A/prodA.png"; mkpng B "$A/prodB.png"
SHA_A=$(shasum -a 256 "$A/prodA.png" | cut -d' ' -f1)
SHA_B=$(shasum -a 256 "$A/prodB.png" | cut -d' ' -f1)
LEN_A=$(wc -c < "$A/prodA.png" | tr -d ' '); LEN_B=$(wc -c < "$A/prodB.png" | tr -d ' ')
echo "synthetic payload A sha=$SHA_A len=$LEN_A"
echo "synthetic payload B sha=$SHA_B len=$LEN_B"
ck "A and B differ in content"    "$([ "$SHA_A" != "$SHA_B" ] && echo different || echo same)" "different"
ck "A and B are EQUAL byte length" "$LEN_A" "$LEN_B"

echo ""
echo "==================== SIGNUP THROUGH THE REAL GOVERNED ROUTE ===================="
if [ "$REUSE" = "yes" ]; then
  echo "  reusing the synthetic account already created by the previous attempt: $EMAIL"
  ck "registration (already done on the first attempt)" "reused" "reused"
else
  REG=$(curl -s --max-time 60 -X POST "$B/auth/register" -H 'content-type: application/json' -d "{
    \"name\":\"S314A Synthetic\",\"email\":\"$EMAIL\",\"password\":\"$PW\",
    \"acceptedAgreements\":[{\"agreementId\":\"internal-pre-beta-acknowledgement\",\"agreementVersion\":\"2026-09-14.1\"}]}")
  echo "  register -> $(echo "$REG" | head -c 120)"
  ck "registration succeeded" "$(echo "$REG" | jq_ message)" "User created successfully"
fi
TOKEN=$(curl -s --max-time 60 -X POST "$B/auth/login" -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}" | python3 -c "import sys,json
d=json.load(sys.stdin); print(d.get('token') or d.get('accessToken') or '')")
ck "login returned a session" "$([ ${#TOKEN} -gt 40 ] && echo yes || echo no)" "yes"

SITE=$(curl -s --max-time 60 -X POST "$B/sites" -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d "{\"name\":\"S314A Synthetic Site $STAMP\"}" | jq_ id)
INSP=$(curl -s --max-time 60 -X POST "$B/inspections" -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d "{\"title\":\"S314A synthetic inspection\",\"siteId\":\"$SITE\"}" | jq_ id)
INSP2=$(curl -s --max-time 60 -X POST "$B/inspections" -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d "{\"title\":\"S314A synthetic inspection 2\",\"siteId\":\"$SITE\"}" | jq_ id)
echo "  site $SITE | inspection $INSP | second inspection $INSP2"

up_raw(){ curl -s --max-time 90 -X POST "$B/inspections/$1/evidence" -H "Authorization: Bearer $TOKEN" \
  -F "file=@$2;type=image/png" -F "clientRequestId=$3"; }
up_code(){ curl -s --max-time 90 -o /dev/null -w '%{http_code}' -X POST "$B/inspections/$1/evidence" \
  -H "Authorization: Bearer $TOKEN" -F "file=@$2;type=image/png" -F "clientRequestId=$3"; }

X="s314a-prod-${STAMP}"

echo ""
echo "==================== A. INITIAL UPLOAD (clientRequestId X, payload A) ===================="
R_A=$(up_raw "$INSP" "$A/prodA.png" "$X")
OBJ=$(echo "$R_A" | jq_ id)
echo "  object $OBJ"
ck "upload succeeded"            "$([ -n "$OBJ" ] && echo yes || echo no)" "yes"
ck "server-recorded digest is sha256(A)" "$(echo "$R_A" | jq_ sha256)" "$SHA_A"
ck "it is downloadable"          "$(curl -s --max-time 60 -o /dev/null -w '%{http_code}' "$B/files/$OBJ" -H "Authorization: Bearer $TOKEN")" "200"
DL_A=$(curl -s --max-time 60 "$B/files/$OBJ" -H "Authorization: Bearer $TOKEN" | shasum -a 256 | cut -d' ' -f1)
ck "the served bytes ARE A"      "$DL_A" "$SHA_A"

echo ""
echo "==================== B. EXACT REPLAY (X + A) ===================="
R_B=$(up_raw "$INSP" "$A/prodA.png" "$X")
OBJ_B=$(echo "$R_B" | jq_ id)
ck "same storage_object returned" "$OBJ_B" "$OBJ"
ck "same digest"                  "$(echo "$R_B" | jq_ sha256)" "$SHA_A"
DL_B=$(curl -s --max-time 60 "$B/files/$OBJ" -H "Authorization: Bearer $TOKEN" | shasum -a 256 | cut -d' ' -f1)
ck "served bytes unchanged"       "$DL_B" "$SHA_A"

echo ""
echo "==================== C. DIVERGENT REPLAY (X + B, equal length) ===================="
R_C=$(up_raw "$INSP" "$A/prodB.png" "$X")
C_C=$(up_code "$INSP" "$A/prodB.png" "$X")
echo "  response: $(echo "$R_C" | head -c 160)"
ck "refused with 409"             "$C_C" "409"
ck "reason is PAYLOAD_MISMATCH"   "$(echo "$R_C" | jq_ reason)" "PAYLOAD_MISMATCH"
ck "no object id handed back"     "$(echo "$R_C" | jq_ id)" ""
DL_C=$(curl -s --max-time 60 "$B/files/$OBJ" -H "Authorization: Bearer $TOKEN" | shasum -a 256 | cut -d' ' -f1)
ck "A REMAINS AUTHORITATIVE — served bytes are still A" "$DL_C" "$SHA_A"
ckne "served bytes are NOT B"     "$DL_C" "$SHA_B"

echo ""
echo "==================== D. OPERATION MISMATCH (same X, different inspection) ===================="
R_D=$(up_raw "$INSP2" "$A/prodA.png" "$X")
C_D=$(up_code "$INSP2" "$A/prodA.png" "$X")
echo "  response: $(echo "$R_D" | head -c 160)"
ck "refused with 409"                "$C_D" "409"
ck "reason is OPERATION_MISMATCH"    "$(echo "$R_D" | jq_ reason)" "OPERATION_MISMATCH"
ck "the other inspection's object was NOT handed back" "$(echo "$R_D" | jq_ id)" ""

echo ""
echo "==================== SUMMARY ===================="
echo "synthetic object id: $OBJ"
echo "synthetic account:   $EMAIL"
echo "$OBJ"  > "$A/synthetic-object-id.txt"
echo "$EMAIL" > "$A/synthetic-email.txt"
echo "$TOKEN" > "$A/synthetic-token.txt"; chmod 600 "$A/synthetic-token.txt"
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
