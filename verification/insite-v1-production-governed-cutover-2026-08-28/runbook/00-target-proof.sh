#!/usr/bin/env bash
# STEP 0 — CREDENTIAL BOUNDARY + READ-ONLY TARGET PROOF (PHASE 2). Writes nothing.
source "$(dirname "${BASH_SOURCE[0]}")/lib-guard.sh"
require_production_target
echo
echo "STEP 0 COMPLETE. The target is the production database at the expected schema level."
