#!/usr/bin/env bash
set -euo pipefail

echo "== Sentinel Safety local verification =="

echo ""
echo "== Git status before checks =="
git status --short

echo ""
echo "== Frontend build =="
cd ~/Sentinel_Safety/frontend-next
npm run build

echo ""
echo "== Frontend browser checks =="
npm run check:company-actions
npm run check:action-workflow

echo ""
echo "== Backend build =="
cd ~/Sentinel_Safety/backend
npm run build

echo ""
echo "== Backend scoped standards smoke test =="
npx ts-node scripts/smoke-applicable-standards-scoped-source.ts

echo ""
echo "== Backend SafeScope v2 scoped classify smoke test =="
npx ts-node scripts/smoke-safescope-v2-scoped-classify.ts

echo ""
echo "== Backend corrective actions organization scope smoke test =="
npm run smoke:corrective-actions-scope

echo ""
echo "== Backend dashboard organization scope smoke test =="
npm run smoke:dashboard-scope

echo ""
echo "== Git status after checks =="
cd ~/Sentinel_Safety
git status --short

echo ""
echo "PASS: Sentinel Safety local verification completed."
