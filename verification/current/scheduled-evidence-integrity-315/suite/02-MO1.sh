#!/bin/bash
# §315 — MO-1: a synthetic integrity failure must reach the existing alert channel.
#
# The capture endpoint stands in for the production webhook. §315 forbids configuration change, and
# pointing a test at the real channel would page whoever is on it — so what the dispatcher WOULD have
# sent is captured and inspected instead, for content and for redaction.
set -u
A=/private/tmp/claude-501/-Users-mckinley/9dbd04e2-b5ab-4421-93d3-83ca593479ec/scratchpad/s315
. "$A/lib.sh"
cd /Users/mckinley/Desktop/Safety_InSite/backend
: > "$A/alerts.jsonl"

reset_rig
add_object 11111111-1111-1111-1111-111111111111 evidence/2026-09-18/mo1 "$A/A.bin"
S3 put evidence/2026-09-18/mo1 "$A/B.bin" >/dev/null   # equal length, different content

OPERATIONAL_ALERT_WEBHOOK_URL=http://127.0.0.1:19041/alert \
  node scripts/ops/check-backup-health.js --json "$A/h-mo1.json" >/dev/null 2>"$A/h-mo1.err"
echo "  dispatcher said: $(cat "$A/h-mo1.err")"

# Each child check dispatches its OWN alert when it fails, which is correct and is why the aggregate's
# alert is selected by schema rather than by position.
AG(){ python3 -c "
import json,sys
for line in open('$A/alerts.jsonl'):
    line=line.strip()
    if not line: continue
    d=json.loads(line)
    if d.get('schema')=='safety-insite.backup-health.v1':
        v=d
        for k in sys.argv[1:]:
            v=v[k] if isinstance(v,dict) else ''
        print(v); break
" "$@"; }
ckne "at least one alert was captured"  "$(grep -c . "$A/alerts.jsonl")" "0"
ck "the AGGREGATE dispatched its own"   "$(python3 -c "
import json
print(sum(1 for l in open('$A/alerts.jsonl') if l.strip() and json.loads(l).get('schema')=='safety-insite.backup-health.v1'))")" "1"
ck "integrity state is in it"     "$(AG summary integrity)" "DIGEST_MISMATCH"
ck "failure category is in it"    "$(AG failureCategory)" "EVIDENCE_DIGEST_MISMATCH"
ck "counts are in it"             "$(AG summary integrityCounts MISMATCHED)" "1"
ck "severity is error"            "$(AG severity)" "error"

echo ""
echo "  --- redaction of the captured payload ---"
python3 - "$A/alerts.jsonl" <<'PYX'
import sys,re
raw=open(sys.argv[1]).read()
leaks=[]
if re.search(r'[a-f0-9]{64}', raw): leaks.append('a 64-hex digest')
if 'objectKey' in raw or 'evidence/20' in raw: leaks.append('an object key')
if 'downloadName' in raw or '.png' in raw: leaks.append('a download name')
if 'X-Amz' in raw or 'Signature=' in raw: leaks.append('a signed URL')
if re.search(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+', raw): leaks.append('an email address')
if 'SECRET' in raw.upper() or 'ACCESS_KEY' in raw.upper(): leaks.append('a credential')
if re.search(r'\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b', raw): leaks.append('an object identifier')
print('REDACTION:', 'CLEAN — states, counts and a failure category only' if not leaks else 'LEAKED: '+', '.join(leaks))
print('PAYLOAD  :', raw.strip()[:400])
PYX

echo ""
echo "  --- and a HEALTHY run must dispatch nothing ---"
: > "$A/alerts.jsonl"
S3 put evidence/2026-09-18/mo1 "$A/A.bin" >/dev/null   # restore
OPERATIONAL_ALERT_WEBHOOK_URL=http://127.0.0.1:19041/alert \
  node scripts/ops/verify-evidence-digest-integrity.js --json "$A/h-ok.json" >/dev/null 2>&1
ck "integrity holds again"        "$(state_of "$A/h-ok.json")" "INTEGRITY_HOLDS"
ck "no alert on a holding gate"   "$(grep -c . "$A/alerts.jsonl")" "0"

echo ""
echo "$pass passed, $fail failed"
[ $fail -eq 0 ] || exit 1
