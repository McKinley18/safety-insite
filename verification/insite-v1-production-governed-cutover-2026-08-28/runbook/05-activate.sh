#!/usr/bin/env bash
# STEP 5 — ACTIVATE THE RELEASE POINTER (PHASE 7).
#
# `release -- activate` moves ONLY the Knowledge Governance active-release pointer. It is the same
# code path step 4(d) already rehearsed with zero writes, minus the rollback. It:
#   * refuses UNKNOWN_RELEASE, MANIFEST_MISMATCH and STALE_EXPECTED_CURRENT before any transaction;
#   * re-checks the caller's pointer belief INSIDE the transaction, under `pg_advisory_xact_lock`;
#   * retires the previous active release and activates this one in ONE transaction, additionally
#     guarded by the partial unique index `uq_regulatory_release_active`;
#   * is idempotent (re-activating the already-active release is `already_active`);
#   * never rewrites release CONTENT;
#   * touches no environment variable, no allowlist, no Render configuration and no deployed code.
#
# It does NOT bind historical inspections. `inspection.knowledgeReleaseId` is write-once at
# inspection creation; migration 1800000018000 contains no UPDATE and no back-fill path exists.
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target
cd "$BACKEND"

echo
echo "About to move the production active-release pointer:"
echo "  release   : $RELEASE_ID"
echo "  manifest  : $EXPECTED_MANIFEST"
echo "  replacing : $EXPECTED_CURRENT"
echo "  actor     : $REVIEWER_ID"
echo

set +e
npm run --silent release -- activate \
  --release-id "$RELEASE_ID" \
  --expected-manifest "$EXPECTED_MANIFEST" \
  --expected-current "$EXPECTED_CURRENT" \
  --actor "$REVIEWER_ID" \
  --reason "InSite v1.0 bounded production Knowledge Governance cutover, product-owner authorized 2026-08-28. Control-plane activation only; customer governed mode and allowlist are NOT enabled by this step."
rc=$?
set -e
echo "exit=$rc"
[ "$rc" -eq 0 ] || { echo; echo "STOP — activation refused or failed. Do not proceed."; exit "$rc"; }

echo
echo "STEP 5 COMPLETE. Run 06-post-proof.sh."
