#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend-next"

echo "============================================================"
echo " HazLenz AI Validation Gate"
echo "============================================================"

run_step() {
  local label="$1"
  shift
  echo ""
  echo "▶ $label"
  "$@"
  echo "✓ $label passed"
}

run_backend_ts_if_exists() {
  local script="$1"
  if [ -f "$BACKEND_DIR/$script" ]; then
    run_step "$script" bash -lc "cd '$BACKEND_DIR' && npx ts-node '$script'"
  else
    echo "• Skipping missing backend script: $script"
  fi
}

echo ""
echo "Skipped by design:"
echo "- DB-dependent precision regression scripts requiring seeded PostgreSQL."
echo "- generate/create/repair scripts that mutate or create datasets."
echo ""

run_backend_ts_if_exists "scripts/verify-safescope-production-readiness.ts"
run_backend_ts_if_exists "scripts/validate-safescope-field-realism-gauntlet.ts"
run_backend_ts_if_exists "scripts/validate-safescope-field-realism-pack-v2.ts"
run_backend_ts_if_exists "scripts/validate-safescope-brain-alignment.ts"
run_backend_ts_if_exists "scripts/validate-safescope-brain-coverage-matrix.ts"
run_backend_ts_if_exists "scripts/validate-safescope-finding-audit.ts"
run_backend_ts_if_exists "scripts/validate-safescope-evidence-gap-intelligence.ts"
run_backend_ts_if_exists "scripts/validate-safescope-decision-confidence.ts"
run_backend_ts_if_exists "scripts/validate-safescope-controls-brain.ts"
run_backend_ts_if_exists "scripts/validate-safescope-mechanism-brain.ts"
run_backend_ts_if_exists "scripts/validate-safescope-regulatory-brain.ts"
run_backend_ts_if_exists "scripts/validate-safescope-scenario-disambiguation.ts"

run_step "Backend build" bash -lc "cd '$BACKEND_DIR' && npm run build"
run_step "Frontend build" bash -lc "cd '$FRONTEND_DIR' && npm run build"

echo ""
echo "============================================================"
echo " PASS: HazLenz AI validation gate completed successfully"
echo "============================================================"
