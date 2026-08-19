# Reproduction commands

```sh
DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase9_persisted_multihazard NODE_ENV=test npm run migration:run
NODE_ENV=test PORT=4231 DATABASE_URL=...phase9_persisted_multihazard JWT_SECRET=phase9-secret STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=/tmp/safety-insite-phase9 DEV_AUTH_BYPASS=false DEV_FORCE_EXPERT=true TYPEORM_SYNCHRONIZE=false npm start
npm run build
API_BASE_URL=http://127.0.0.1:4231 npm run test:persisted-decomposition-findings
DATABASE_URL=...phase9_persisted_multihazard API_BASE_URL=http://127.0.0.1:4231 npm run test:canonical-workflow
npx tsc --noEmit
npx eslint app/inspection-workspace/page.tsx lib/canonicalWorkflowApi.ts
npm run build
node verification/safety-insite-persisted-multihazard-lifecycle-2026-08-03/browser_guarding_persisted.cjs
node verification/safety-insite-persisted-multihazard-lifecycle-2026-08-03/browser_report_check.cjs
```

All disposable services must be stopped after verification.
