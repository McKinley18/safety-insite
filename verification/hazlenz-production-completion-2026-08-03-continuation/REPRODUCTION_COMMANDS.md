# Reproduction commands

```sh
cd /Users/mckinley/Desktop/Safety_InSite/backend
npm run build
NODE_ENV=test API_BASE_URL=http://127.0.0.1:4210 DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a npm run test:entitlement-boundary
NODE_ENV=test API_BASE_URL=http://127.0.0.1:4210 DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a npm run test:authenticated-entitlement-path
NODE_ENV=test API_BASE_URL=http://127.0.0.1:4210 HAZLENZ_TEST_AUTH=true HAZLENZ_TEST_DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a npm run test:hazlenz-clarification-gauntlet
NODE_ENV=test SENTINEL_API_URL=http://127.0.0.1:4210 HAZLENZ_TEST_AUTH=true HAZLENZ_TEST_DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a npm run test:hazlenz-authentic-reasoning
```

Do not run these commands against the original development database.

