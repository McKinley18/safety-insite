#!/usr/bin/env bash
# STEP 6 — POST-ACTIVATION READ-ONLY PROOF (PHASE 8). Writes nothing. Changes no rollout config.
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target

echo; echo "=== RELEASE ==="
psql_ro "
SELECT rel.\"releaseId\", rel.status, rel.\"recordCount\", rel.\"manifestChecksum\",
       rel.\"parentReleaseId\", rel.\"activatedAt\", rel.\"deactivatedAt\",
       (rel.\"manifestChecksum\" = '${EXPECTED_MANIFEST}')          AS manifest_is_pinned,
       (rel.status = 'active')                                     AS is_active,
       (SELECT count(*)::int FROM regulatory_release_records rr
          WHERE rr.\"releaseId\" = rel.\"releaseId\")                AS snapshot_records
  FROM regulatory_releases rel ORDER BY rel.\"createdAt\""

echo; echo "=== ACTIVE POINTER (exactly one, or none) ==="
psql_ro "SELECT \"releaseId\", \"manifestChecksum\", \"activatedAt\"
           FROM regulatory_releases WHERE status = 'active'"

echo; echo "=== AUTHORITY: approvals bound to the exact reviewed checksums ==="
psql_ro "
SELECT count(*)::int                                                     AS snapshot_records,
       count(*) FILTER (WHERE eff = 'reviewer_approved')::int            AS approved,
       count(*) FILTER (WHERE eff <> 'reviewer_approved')::int           AS not_approved,
       count(*) FILTER (WHERE bound_decision IS NULL)::int               AS records_without_a_checksum_bound_decision
  FROM (
    SELECT r.\"recordChecksum\",
           CASE WHEN latest.decision = 'approved' THEN 'reviewer_approved'
                WHEN latest.decision = 'revoked' AND r.\"reviewState\" = 'reviewer_approved'
                  THEN 'mechanically_validated'
                ELSE r.\"reviewState\" END AS eff,
           latest.decision AS bound_decision
      FROM regulatory_release_records r
      LEFT JOIN LATERAL (
        SELECT v.decision FROM regulatory_release_record_reviews v
         WHERE v.\"releaseId\" = r.\"releaseId\" AND v.\"citationKey\" = r.\"citationKey\"
           AND v.\"recordChecksum\" = r.\"recordChecksum\"
         ORDER BY v.\"decidedAt\" DESC, v.\"createdAt\" DESC LIMIT 1) latest ON TRUE
     WHERE r.\"releaseId\" = '${RELEASE_ID}') x"

echo; echo "=== AUTHORITY: reviewer identity actually recorded ==="
psql_ro "
SELECT \"reviewerId\", \"reviewerRole\", decision, count(*)::int AS rows
  FROM regulatory_release_record_reviews WHERE \"releaseId\" = '${RELEASE_ID}'
 GROUP BY 1,2,3 ORDER BY 1,3"

echo; echo "=== AUTHORITY: the 8 rejected records — expected 0 rows everywhere ==="
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

echo; echo "=== INSPECTIONS: no historical rebinding, no back-fill ==="
psql_ro "
SELECT (SELECT count(*)::int FROM inspection)                                    AS inspection_rows,
       (SELECT count(*)::int FROM inspection WHERE \"knowledgeReleaseId\" IS NOT NULL)
                                                                                AS inspections_bound_to_a_release,
       (SELECT count(*)::int FROM inspection_findings)                           AS inspection_findings_rows,
       (SELECT count(*)::int FROM standards_master)                              AS standards_master_rows"

echo; echo "=== GOVERNANCE AUDIT TRAIL (summary) ==="
psql_ro "
SELECT event, outcome, actor, \"toReleaseId\", count(*)::int AS events,
       min(\"createdAt\") AS first_at, max(\"createdAt\") AS last_at
  FROM knowledge_release_events
 GROUP BY 1,2,3,4 ORDER BY min(\"createdAt\")"

echo; echo "=== GOVERNANCE AUDIT TRAIL (pointer moves, in full) ==="
psql_ro "
SELECT event, outcome, \"fromReleaseId\", \"toReleaseId\", actor, reason, details, \"createdAt\"
  FROM knowledge_release_events
 WHERE event NOT IN ('record_approval', 'record_approval_refused')
 ORDER BY \"createdAt\""

echo; echo "=== RUNTIME (public, read-only) ==="
curl -s -m 60 https://safescope-backend.onrender.com/health; echo
printf '/health/ready -> '; curl -s -m 60 -o /dev/null -w '%{http_code}\n' https://safescope-backend.onrender.com/health/ready

echo
echo "REQUIRED: active pointer = ${RELEASE_ID}; manifest_is_pinned = true; snapshot_records = ${EXPECTED_MEMBERS};"
echo "          approved = ${EXPECTED_MEMBERS}; not_approved = 0; rejected rows = 0;"
echo "          inspections_bound_to_a_release = 0; gitCommit = 45251d38a4e800bbff461708aa4c77061feade56."
echo
echo "NOT PROVEN BY THIS STEP, and not changed by it: GOVERNED_CUTOVER_MODE and the allowlists are"
echo "Render environment variables. This runbook issues no Render command, so they are UNCHANGED —"
echo "but their VALUES are not readable read-only from the CLI. Confirm in the Render dashboard"
echo "that GOVERNED_CUTOVER_MODE is unset or LEGACY and both allowlists are empty."
