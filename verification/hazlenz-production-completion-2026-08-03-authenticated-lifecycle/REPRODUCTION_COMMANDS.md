# Reproduction commands

```sh
cd /Users/mckinley/Desktop/Safety_InSite/backend
npm run build

cd ../frontend-next
rm -rf .next
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4210 NEXT_PUBLIC_API_URL=http://127.0.0.1:4210 npm run build
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4210 NEXT_PUBLIC_API_URL=http://127.0.0.1:4210 npm start -- -p 3001
```

Use `NODE_ENV=test`, isolated database `phase6_adopt_completion_a`, `DEV_AUTH_BYPASS=false`, local test storage, normal UI login, and a disposable entitlement. Use Chromium with Playwright and never inject tokens into browser storage.
