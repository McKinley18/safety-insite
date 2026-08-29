#!/usr/bin/env bash
# STEP 2 — MATERIALIZE THE EXACT RELEASE (PHASE 4).
#
# `npm run release -- prepare` is the reviewed governed-construction command. It:
#   * derives all 64 members from the VERSION-CONTROLLED governed source set — 0 rows read from
#     and 0 rows written to `standards_master` (`assertNoLegacyCorpusWrites` enforces this over
#     every statement the module issues);
#   * REFUSES if the computed manifest is not the pinned 680540d9… (MANIFEST_CHECKSUM_PIN_MISMATCH);
#   * REFUSES if the release id already holds a different manifest (MANIFEST_WOULD_CHANGE) or has
#     left the provisional lifecycle (RELEASE_IMMUTABLE);
#   * runs in ONE transaction and verifies the persisted snapshot in one pass;
#   * is idempotent: an identical manifest already present returns `idempotent_no_op`;
#   * approves NOTHING and activates NOTHING;
#   * can affect no release other than the one named by --release-id.
# A refusal exits 2 and prints the refusal code.
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target

echo
echo "About to run, against the target proven above:"
echo "  npm run release -- prepare --release-id ${RELEASE_ID}"
echo

cd "$BACKEND"
set +e
npm run release -- prepare --release-id "$RELEASE_ID"
rc=$?
set -e
echo "exit=$rc"

if [ "$rc" -ne 0 ]; then
  echo
  echo "HAZLENZ_PRODUCTION_GOVERNED_CUTOVER_BLOCKED — RELEASE_MATERIALIZATION_MISMATCH"
  echo "Nothing was written (construction is single-transaction). DO NOT proceed to step 3."
  exit "$rc"
fi

echo
echo "=== POST-MATERIALIZATION VERIFICATION (read-only) ==="
psql_ro "
SELECT rel.\"releaseId\", rel.status, rel.\"manifestChecksum\", rel.\"recordCount\",
       (SELECT count(*)::int FROM regulatory_release_records rr
         WHERE rr.\"releaseId\" = rel.\"releaseId\")                     AS snapshot_records,
       (rel.\"manifestChecksum\" = '${EXPECTED_MANIFEST}')              AS manifest_matches_pin,
       (SELECT count(*)::int FROM regulatory_release_records rr
         WHERE rr.\"releaseId\" = rel.\"releaseId\"
           AND rr.\"citationKey\" IN ('30cfr57.14107(a)','30cfr56.14105','29cfr1910.219',
               '29cfr1910.132(a)','29cfr1926.95(a)','30cfr56.15006',
               '29cfr1926.602(a)(9)(ii)','30cfr56.9100(a)'))            AS rejected_records_included,
       (SELECT count(*)::int FROM regulatory_release_record_reviews v
         WHERE v.\"releaseId\" = rel.\"releaseId\")                      AS decision_rows_so_far
  FROM regulatory_releases rel WHERE rel.\"releaseId\" = '${RELEASE_ID}'
"
echo
echo "REQUIRED: recordCount = ${EXPECTED_MEMBERS}, manifest_matches_pin = true,"
echo "          rejected_records_included = 0, decision_rows_so_far = 0, status = provisional."
echo "If any differs: STOP BEFORE APPROVAL REPLAY."
