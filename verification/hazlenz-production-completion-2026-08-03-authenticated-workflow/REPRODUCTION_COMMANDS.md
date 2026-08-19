# Reproduction commands

```sh
cd /Users/mckinley/Desktop/Safety_InSite/backend
npm run build

cd ../frontend-next
npx tsc --noEmit
npm run build
npm run lint -- --format json
```

Start disposable services with the repository’s isolated test database configuration, `DEV_AUTH_BYPASS=false`, local test storage, backend on 4210, and frontend production server on 3001. Use a clean Chromium profile and normal login UI interaction; do not inject tokens or use bypass headers.
