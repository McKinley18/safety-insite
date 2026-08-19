# Reproduction commands

```sh
NODE_ENV=test PORT=4210 DATABASE_URL=postgresql://.../phase6_adopt_completion_a DEV_AUTH_BYPASS=false npm start
NEXT_PUBLIC_API_URL=http://127.0.0.1:4210 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4210 PORT=3001 npm run dev
node verification/hazlenz-production-completion-2026-08-03-final-gates/repeatability-18-batch.mjs
cd frontend-next && npx eslint . --format json
cd frontend-next && npx tsc --noEmit && npm run build
```

