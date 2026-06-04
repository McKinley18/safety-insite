#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo
echo "Sentinel Safety Production Readiness Verification"
echo "================================================="
echo

echo "▶ Backend SafeScope verification"
cd "$ROOT_DIR/backend"
npx ts-node scripts/verify-safescope-production-readiness.ts
echo "✅ Backend SafeScope verification passed"

echo
echo "▶ Frontend production build"
cd "$ROOT_DIR/frontend-next"
npm run build
echo "✅ Frontend production build passed"

echo
echo "================================================="
echo "✅ Sentinel Safety production readiness verification passed."
echo "================================================="
echo
