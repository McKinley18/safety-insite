# Reproduction

The harness lives in `harness/` and is **not** part of the release package — it was run from a
disposable clean checkout, never from the working tree.

```bash
# 1. isolated baseline (no unstaged/ignored file can contribute)
CLEAN=$(mktemp -d)
git -C /Users/mckinley/Desktop/Safety_InSite archive e723b62d7c773f281600fcbd40082d9b8ad12683 | tar -x -C "$CLEAN"
ln -s /Users/mckinley/Desktop/Safety_InSite/backend/node_modules "$CLEAN/backend/node_modules"
cp harness/hazlenz-capability-runner.ts harness/hazlenz-e2e-workflow.ts "$CLEAN/backend/scripts/"

# 2. production-shaped disposable corpus (clone; the source is READ-ONLY and never written)
createdb -T test_kg5b_prodshape_20260821 test_hazlenz_capability_prodshape_20260822

# 3. capability matrix — declared regulatory context
cd "$CLEAN/backend"
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_hazlenz_capability_prodshape_20260822"
npx ts-node scripts/hazlenz-capability-runner.ts contracts/hazlenz-acceptance-matrix.json out/baseline.jsonl

# 4. Phase-10 experiment — every scenario forced to `unknown`
npx ts-node scripts/hazlenz-capability-runner.ts contracts/hazlenz-acceptance-matrix.json out/unknown.jsonl unknown

# 5. diagnostics
npx ts-node scripts/hazlenz-capability-runner.ts contracts/diag-mine-routing.json out/diag-mine.jsonl
npx ts-node scripts/hazlenz-capability-runner.ts contracts/diag-overfit.json    out/diag-overfit.jsonl

# 6. score (scoring is a separate program so expectations cannot be tuned while results are visible)
python3 harness/score.py out/baseline.jsonl out/scored.json

# 7. full-product workflows through the REAL API
export NODE_ENV=development PORT=4320 \
       JWT_SECRET="<32+ chars>" STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT="$(mktemp -d)"
npx ts-node -T src/main.ts &            # port 4320 — never 4000 (pre-existing dev backend)
API_BASE_URL=http://127.0.0.1:4320 npx ts-node -T scripts/hazlenz-e2e-workflow.ts

# 8. regression baseline
npx ts-node -T src/safescope-v2/tests/hazlenz-core-regression.ts   # expect 28/30, the two documented failures
npx ts-node scripts/test-kg3f-56-14132-predicate.ts               # expect 16/16 — and note RC-03
```

## Database safety
`safescope`, `sentinel_dev`, `sentinel_safety` were never a target. The clean checkout carries **no
`.env`**, so the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope`
database) could not be picked up; `DATABASE_URL` was named explicitly on every invocation.
`test_kg5b_prodshape_20260821` was used only as a `createdb -T` template and its row count was
re-verified at 2,390 afterwards.

## Entitlements
The paid-surface entitlement needed by the workflow harness was granted through the repository's own
guarded helper `scripts/grant-test-entitlement.ts`, which refuses unless `NODE_ENV=test` and the
database name is an allow-listed disposable one on localhost. **This is test-harness state, not
release-package state**, and no billing or authorization guard was bypassed or modified.
