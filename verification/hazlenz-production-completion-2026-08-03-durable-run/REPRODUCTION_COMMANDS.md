# Reproduction commands

```sh
cd /Users/mckinley/Desktop/Safety_InSite/backend
npm run build
NODE_ENV=test API_BASE_URL=http://127.0.0.1:4210 DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a npm run test:authenticated-entitlement-path
NODE_ENV=test SENTINEL_API_URL=http://127.0.0.1:4210 HAZLENZ_TEST_AUTH=true HAZLENZ_TEST_DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a npm run test:hazlenz-authentic-reasoning
cd ..
CORPUS_API_BASE_URL=http://127.0.0.1:4210 CORPUS_DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a node verification/hazlenz-production-completion-2026-08-03-continuation/run-independent-corpus.mjs
```

