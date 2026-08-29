#!/usr/bin/env bash
# STEP 1 — PRODUCTION PRE-CUTOVER READ-ONLY SNAPSHOT. Writes nothing. Mutates nothing.
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target

echo
echo "=== GOVERNANCE PRE-STATE (read-only) ==="
psql_ro "
WITH releases AS (
  SELECT \"releaseId\", \"releaseVersion\", status, \"manifestChecksum\", \"recordCount\",
         \"parentReleaseId\", \"activatedAt\", \"deactivatedAt\", \"createdAt\"
    FROM regulatory_releases
)
SELECT
  (SELECT count(*)::int FROM releases)                                   AS releases_in_database,
  (SELECT coalesce(json_agg(r ORDER BY r.\"createdAt\"), '[]'::json) FROM releases r)
                                                                        AS release_rows,
  (SELECT \"releaseId\" FROM releases WHERE status = 'active')            AS active_release_pointer,
  (SELECT \"manifestChecksum\" FROM releases WHERE status = 'active')     AS active_release_manifest,
  (SELECT count(*)::int FROM regulatory_release_records
     WHERE \"releaseId\" = 'federal-core-2026-08-28.1')                   AS candidate_snapshot_records,
  (SELECT count(*)::int FROM regulatory_release_record_reviews
     WHERE \"releaseId\" = 'federal-core-2026-08-28.1')                   AS candidate_decision_rows,
  (SELECT count(*)::int FROM regulatory_release_records)                 AS all_release_records,
  (SELECT count(*)::int FROM regulatory_release_record_reviews)          AS all_decision_rows,
  (SELECT count(*)::int FROM knowledge_release_events)                   AS knowledge_release_events,
  (SELECT count(*)::int FROM inspection)                                 AS inspection_rows,
  (SELECT count(*)::int FROM inspection WHERE \"knowledgeReleaseId\" IS NOT NULL)
                                                                        AS inspections_bound_to_a_release,
  (SELECT count(*)::int FROM inspection_findings)                        AS inspection_findings_rows,
  (SELECT count(*)::int FROM standards_master)                           AS standards_master_rows
"

echo
echo "=== CANDIDATE RELEASE EFFECTIVE REVIEW STATE, IF IT ALREADY EXISTS (read-only) ==="
psql_ro "
SELECT coalesce(effective.\"effectiveState\", 'RELEASE_NOT_PRESENT') AS effective_state,
       count(*)::int AS records
  FROM (
    SELECT r.\"citationKey\",
           CASE WHEN latest.decision = 'approved' THEN 'reviewer_approved'
                WHEN latest.decision = 'revoked' AND r.\"reviewState\" = 'reviewer_approved'
                  THEN 'mechanically_validated'
                ELSE r.\"reviewState\" END AS \"effectiveState\"
      FROM regulatory_release_records r
      LEFT JOIN LATERAL (
        SELECT v.decision FROM regulatory_release_record_reviews v
         WHERE v.\"releaseId\" = r.\"releaseId\" AND v.\"citationKey\" = r.\"citationKey\"
           AND v.\"recordChecksum\" = r.\"recordChecksum\"
         ORDER BY v.\"decidedAt\" DESC, v.\"createdAt\" DESC LIMIT 1) latest ON TRUE
     WHERE r.\"releaseId\" = 'federal-core-2026-08-28.1') effective
 GROUP BY 1 ORDER BY 1
"

echo
echo "=== IMMUTABLE-IDENTITY CONFLICT CHECK (read-only) ==="
echo "Expected before this operation: release_present=false."
echo "If release_present=true and stored_manifest <> ${EXPECTED_MANIFEST}: HARD STOP."
psql_ro "
SELECT (count(*) > 0)                                   AS release_present,
       max(\"manifestChecksum\")                          AS stored_manifest,
       '${EXPECTED_MANIFEST}'                           AS expected_manifest,
       max(status)                                      AS stored_status,
       max(\"recordCount\")                               AS stored_record_count
  FROM regulatory_releases WHERE \"releaseId\" = '${RELEASE_ID}'
"

echo
echo "=== REJECTED-RECORD REACHABILITY BASELINE (read-only) ==="
echo "The 8 records the reviewer ledger disposed REJECT_CORRECTION_REQUIRED must belong to no"
echo "release snapshot and carry no approval decision, in any release."
psql_ro "
SELECT r.\"releaseId\", r.citation, r.\"citationKey\"
  FROM regulatory_release_records r
 WHERE r.\"citationKey\" IN ('30cfr57.14107(a)','30cfr56.14105','29cfr1910.219','29cfr1910.132(a)',
                            '29cfr1926.95(a)','30cfr56.15006','29cfr1926.602(a)(9)(ii)','30cfr56.9100(a)')
 ORDER BY 1,2
"

echo
echo "=== PRODUCTION RUNTIME (public, read-only) ==="
curl -s -m 60 https://safescope-backend.onrender.com/health; echo
printf '/health/ready -> '; curl -s -m 60 -o /dev/null -w '%{http_code}\n' https://safescope-backend.onrender.com/health/ready

echo
echo "STEP 1 COMPLETE — nothing was written."
