# Commands run

Representative exact commands (all databases were disposable):

```text
pwd
git branch --show-current
git rev-parse HEAD
git status --short
node --version
npm --version
docker exec safety-insite-postgres psql ... closure_20260729_clean
DATABASE_URL=postgresql://[redacted] NODE_ENV=test npm run migration:run
npm run build
npm run test:evidence-foundation
npm run test:hazlenz-evidence-boundary
node verification/.../run-corpus.mjs original
node verification/.../run-corpus.mjs holdout
npm run build
npx eslint app/inspection-workspace/page.tsx lib/canonicalWorkflowApi.ts
node scripts/check-evidence-foundation-release.mjs
API_BASE_URL=http://127.0.0.1:4200 npm run test:canonical-workflow
API_BASE_URL=http://127.0.0.1:4200 npm run test:private-storage-reports
npm run test:password-reset-delivery
npm run billing:regression
git diff --check
shasum -a 256 [five protected HazLenz files]
```

One legacy auth-flow invocation failed because it expected a development reset token while the running server correctly used the test delivery provider. The provider-specific password-reset suite passed. This is a harness/environment mismatch, not a production-path regression.

The first final frontend build attempt was blocked by the managed sandbox when Turbopack tried to bind a local worker port (`Operation not permitted`). The identical command was rerun with the required execution approval and passed.
