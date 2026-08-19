# Reproduction commands

```sh
NODE_ENV=test PORT=4210 DATABASE_URL=postgresql://.../phase6_adopt_completion_a DEV_AUTH_BYPASS=false npm start
PORT=3001 npm run dev
LIFE_OFFSET=52 LIFE_LIMIT=10 node run-life-batch.mjs
LIFE_OFFSET=72 LIFE_LIMIT=9 node run-life-batch.mjs
cd frontend-next && npx eslint . --format json
cd frontend-next && rm -rf .next && npx tsc --noEmit && npm run build
```
