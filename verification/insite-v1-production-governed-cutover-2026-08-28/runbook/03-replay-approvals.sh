#!/usr/bin/env bash
# STEP 3 — REPLAY THE PRESERVED 64 AUTHORIZED REVIEWER APPROVE DECISIONS (PHASE 5).
#
# Materialization reproduces release CONTENT. It does NOT recreate approvals — `prepare` leaves all
# 64 records `mechanically_validated`. Each decision is replayed SEPARATELY, one record at a time,
# through `npm run review:release-record -- approve`, which is the ONLY mechanism that records a
# reviewer decision (no bulk path, no HTTP endpoint) and which:
#   * requires --expected-checksum and REFUSES on a stale/different version (`checksumMatches`);
#   * requires a named reviewer (`reviewerIdentified`);
#   * approves only from `mechanically_validated` (`frozenStateEligible`);
#   * is append-only and idempotent (`already_approved` is a no-op success, not a duplicate row);
#   * serializes on a per-release advisory lock inside one transaction.
#
# No decision is invented: every (citation, checksum, reviewer) triple comes from the preserved
# ledger. Before a single approval is sent, the SET of record checksums in the production snapshot
# is proven EQUAL to the SET of checksums in the preserved ledger — a checksum-level equality that
# needs no citation normalization and that no rejected record can pass.
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target

DECISIONS="$REPO_ROOT/verification/insite-v1-reviewer-governance-2026-08-28/APPROVAL_DECISIONS.json"
PAIRS="$(mktemp -t insite-replay-pairs)"
trap 'rm -f "$PAIRS"' EXIT

echo
echo "=== PRE-REPLAY BINDING PROOF (read-only) ==="
SNAPSHOT="$(psql_ro "
SELECT citation, \"citationKey\", \"recordChecksum\", \"reviewState\"
  FROM regulatory_release_records WHERE \"releaseId\" = '${RELEASE_ID}' ORDER BY citation")"

python3 - "$DECISIONS" "$PAIRS" <<PY
import json, sys
decisions = json.load(open(sys.argv[1]))
snapshot  = json.loads(r'''$SNAPSHOT''')
fail = []
if len(decisions) != $EXPECTED_MEMBERS:
    fail.append(f"ledger holds {len(decisions)} decisions, expected $EXPECTED_MEMBERS")
if not all(d["decision"] == "approved" for d in decisions):
    fail.append("ledger contains a decision that is not 'approved'")
reviewers = {d["reviewerId"] for d in decisions}
if reviewers != {"$REVIEWER_ID"}:
    fail.append(f"ledger reviewer identities are {reviewers}, expected exactly {{'$REVIEWER_ID'}}")
dec_sums = [d["recordChecksum"] for d in decisions]
if len(set(dec_sums)) != len(dec_sums):
    fail.append("ledger contains duplicate record checksums")
if len(snapshot) != $EXPECTED_MEMBERS:
    fail.append(f"production snapshot holds {len(snapshot)} records, expected $EXPECTED_MEMBERS")
snap_sums = {r["recordChecksum"] for r in snapshot}
if snap_sums != set(dec_sums):
    fail.append(f"snapshot checksums != ledger checksums; "
                f"{len(snap_sums - set(dec_sums))} in snapshot only, "
                f"{len(set(dec_sums) - snap_sums)} in ledger only")
bad_state = [r["citation"] for r in snapshot
             if r["reviewState"] not in ("mechanically_validated", "reviewer_approved")]
if bad_state:
    fail.append(f"records not eligible for substantive review: {bad_state}")
if fail:
    print("\nSTOP — PRE-REPLAY BINDING PROOF FAILED:", file=sys.stderr)
    for f in fail: print("  -", f, file=sys.stderr)
    print("\nDo NOT substitute a newly generated approval. No approval was sent.", file=sys.stderr)
    sys.exit(1)
by_sum = {r["recordChecksum"]: r["citation"] for r in snapshot}
with open(sys.argv[2], "w") as fh:
    for d in sorted(decisions, key=lambda d: d["recordChecksum"]):
        fh.write(f'{by_sum[d["recordChecksum"]]}\t{d["recordChecksum"]}\n')
print(f"BINDING PROOF OK — {len(decisions)} preserved decisions bind 1:1, by exact record "
      f"checksum, to the {len(snapshot)} records production materialized. Reviewer: $REVIEWER_ID")
PY

echo
echo "=== REPLAYING ${EXPECTED_MEMBERS} DECISIONS, ONE RECORD AT A TIME ==="
cd "$BACKEND"
approved=0; already=0; failed=0; n=0
while IFS=$'\t' read -r citation checksum; do
  n=$((n+1))
  printf '[%2d/%d] %-30s ' "$n" "$EXPECTED_MEMBERS" "$citation"
  set +e
  out="$(npm run --silent review:release-record -- approve \
          --release "$RELEASE_ID" --citation "$citation" \
          --expected-checksum "$checksum" \
          --reviewer "$REVIEWER_ID" --role "$REVIEWER_ROLE" \
          --note "Replay of the preserved 2026-08-28 reviewer decision, verification/insite-v1-reviewer-governance-2026-08-28/APPROVAL_DECISIONS.json, against its own recorded record checksum." 2>&1)"
  rc=$?
  set -e
  outcome="$(printf '%s' "$out" | python3 -c 'import sys,json,re
raw=sys.stdin.read()
m=re.search(r"\{[\s\S]*\}", raw)
try: print(json.loads(m.group(0)).get("outcome","?"))
except Exception: print("UNPARSED")' 2>/dev/null || echo UNPARSED)"
  if [ "$rc" -ne 0 ]; then
    failed=$((failed+1)); echo "REFUSED (exit $rc)"; printf '%s\n' "$out"
    echo; echo "STOP — a preserved decision was refused. Nothing is substituted."; break
  fi
  case "$outcome" in
    approved)        approved=$((approved+1)); echo "approved" ;;
    already_approved) already=$((already+1)); echo "already_approved (idempotent)" ;;
    *)               failed=$((failed+1)); echo "UNEXPECTED outcome '$outcome'"; printf '%s\n' "$out"; break ;;
  esac
done < "$PAIRS"

echo
echo "REPLAY SUMMARY: approved=$approved already_approved=$already failed=$failed of $EXPECTED_MEMBERS"

echo
echo "=== POST-REPLAY EFFECTIVE STATE (read-only) ==="
psql_ro "
SELECT e.\"effectiveState\", count(*)::int AS records FROM (
  SELECT CASE WHEN latest.decision = 'approved' THEN 'reviewer_approved'
              WHEN latest.decision = 'revoked' AND r.\"reviewState\" = 'reviewer_approved'
                THEN 'mechanically_validated'
              ELSE r.\"reviewState\" END AS \"effectiveState\"
    FROM regulatory_release_records r
    LEFT JOIN LATERAL (
      SELECT v.decision FROM regulatory_release_record_reviews v
       WHERE v.\"releaseId\" = r.\"releaseId\" AND v.\"citationKey\" = r.\"citationKey\"
         AND v.\"recordChecksum\" = r.\"recordChecksum\"
       ORDER BY v.\"decidedAt\" DESC, v.\"createdAt\" DESC LIMIT 1) latest ON TRUE
   WHERE r.\"releaseId\" = '${RELEASE_ID}') e
 GROUP BY 1 ORDER BY 1"

psql_ro "
SELECT count(*)::int                                                   AS decision_rows,
       count(DISTINCT \"recordChecksum\")::int                          AS distinct_checksums,
       count(DISTINCT \"reviewerId\")::int                              AS distinct_reviewers,
       min(\"reviewerId\")                                              AS reviewer_id,
       count(*) FILTER (WHERE decision <> 'approved')::int             AS non_approve_decisions
  FROM regulatory_release_record_reviews WHERE \"releaseId\" = '${RELEASE_ID}'"

echo
echo "=== REJECTED-RECORD INTEGRITY AFTER REPLAY (read-only) ==="
echo "Expected: 0 rows — no rejected record is a member of any release or carries any decision."
psql_ro "
SELECT 'snapshot_member' AS where_found, r.\"releaseId\", r.\"citationKey\"
  FROM regulatory_release_records r
 WHERE r.\"citationKey\" IN ('30cfr57.14107(a)','30cfr56.14105','29cfr1910.219','29cfr1910.132(a)',
       '29cfr1926.95(a)','30cfr56.15006','29cfr1926.602(a)(9)(ii)','30cfr56.9100(a)')
UNION ALL
SELECT 'approval_decision', v.\"releaseId\", v.\"citationKey\"
  FROM regulatory_release_record_reviews v
 WHERE v.\"citationKey\" IN ('30cfr57.14107(a)','30cfr56.14105','29cfr1910.219','29cfr1910.132(a)',
       '29cfr1926.95(a)','30cfr56.15006','29cfr1926.602(a)(9)(ii)','30cfr56.9100(a)')"

echo
echo "REQUIRED before step 4: reviewer_approved = ${EXPECTED_MEMBERS}, every other state 0,"
echo "distinct_checksums = ${EXPECTED_MEMBERS}, non_approve_decisions = 0, rejected rows = 0."
[ "$failed" -eq 0 ] || exit 1
