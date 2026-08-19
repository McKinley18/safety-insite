# Reproduction commands

```sh
cd /Users/mckinley/Desktop/Safety_InSite/backend
npm run build

cd ../frontend-next
npx tsc --noEmit
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4211 NEXT_PUBLIC_API_URL=http://127.0.0.1:4211 npm run build
```

Use disposable database `phase6_adopt_completion_b`, `DEV_AUTH_BYPASS=false`, normal login, and Chromium UI interaction. Analysis version checks use `POST /inspections/observations/:id/analyses` with real authenticated DTOs, idempotency keys, and request versions.
