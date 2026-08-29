#!/usr/bin/env bash
# STEP 4 — FINALIZATION / VALIDATION (PHASE 6). ZERO WRITES.
#
# WHAT "FINALIZE" IS IN THIS ARCHITECTURE, established from source rather than assumed.
# `prepareGovernedRelease` writes the release at status `provisional`, and the lifecycle comment
# in `regulatory-release-lifecycle.service.ts` states the model explicitly:
#   draft -> provisional (finalized) -> active -> superseded | rolled_back
# `provisional` IS the finalized state. There is no separate governed `finalize` command:
# `seed:regulatory-release` (finalize-regulatory-release.ts) is the LEGACY corpus finalizer and is
# NOT part of the governed release path. The finalization CONTRACT — the thing that decides whether
# the release may be activated — is `evaluateActivation()`, and the reviewed, zero-write way to run
# it is `release -- activate --dry-run`, whose preview transaction is always rolled back and which
# emits no lifecycle event.
#
# This step therefore runs, all read-only:
#   a. `release -- status --release-id`      integrity + approved/total, recomputed from the snapshot
#   b. `review:release-record -- approval-checksum`  the approval-state checksum
#   c. `release -- prepare --dry-run`        the immutable-identity guard: must report
#                                            `idempotent_no_op`, proving the stored release still
#                                            reproduces 680540d9… and that re-preparing it could
#                                            not re-point the identity
#   d. `release -- activate --dry-run`       every activation gate, evaluated, writing nothing
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target
cd "$BACKEND"

echo; echo "=== (a) RELEASE STATUS ==="
npm run --silent release -- status --release-id "$RELEASE_ID"

echo; echo "=== (b) APPROVAL-STATE CHECKSUM ==="
npm run --silent review:release-record -- approval-checksum --release "$RELEASE_ID"

echo; echo "=== (c) IMMUTABLE-IDENTITY REPRODUCTION (dry run, zero writes) ==="
echo "REQUIRED: outcome = idempotent_no_op, reproducedPinnedManifest = true, recordCount = ${EXPECTED_MEMBERS}."
set +e; npm run --silent release -- prepare --release-id "$RELEASE_ID" --dry-run; echo "exit=$?"; set -e

echo; echo "=== (d) ACTIVATION GATES (dry run, zero writes, no lifecycle event) ==="
echo "REQUIRED: wouldSucceed = true, failedGates = [], writesPerformed = 0."
set +e
npm run --silent release -- activate \
  --release-id "$RELEASE_ID" \
  --expected-manifest "$EXPECTED_MANIFEST" \
  --expected-current "$EXPECTED_CURRENT" \
  --actor "$REVIEWER_ID" \
  --reason "InSite v1.0 bounded production Knowledge Governance cutover, product-owner authorized 2026-08-28. Control-plane only; customer governed mode remains LEGACY." \
  --dry-run
echo "exit=$?"
set -e

echo; echo "=== (e) SNAPSHOT INTEGRITY, RECOMPUTED IN SQL (read-only) ==="
psql_ro "
SELECT rel.\"releaseId\", rel.status, rel.\"recordCount\", rel.\"manifestChecksum\",
       (rel.\"manifestChecksum\" = '${EXPECTED_MANIFEST}')                       AS manifest_is_pinned,
       (SELECT count(*)::int FROM regulatory_release_records rr
          WHERE rr.\"releaseId\" = rel.\"releaseId\")                             AS snapshot_records,
       (SELECT count(*)::int FROM regulatory_release_records rr
          WHERE rr.\"releaseId\" = rel.\"releaseId\"
            AND rr.\"citationKey\" IN ('30cfr57.14107(a)','30cfr56.14105','29cfr1910.219',
                '29cfr1910.132(a)','29cfr1926.95(a)','30cfr56.15006',
                '29cfr1926.602(a)(9)(ii)','30cfr56.9100(a)'))                    AS rejected_members,
       (SELECT count(DISTINCT rr.\"citationKey\")::int FROM regulatory_release_records rr
          WHERE rr.\"releaseId\" = rel.\"releaseId\")                             AS distinct_citation_keys
  FROM regulatory_releases rel WHERE rel.\"releaseId\" = '${RELEASE_ID}'"

echo
echo "STEP 4 COMPLETE — nothing was written. Proceed to step 5 ONLY if every REQUIRED line above holds."
