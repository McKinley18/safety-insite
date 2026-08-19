# Reproduction commands

Backend: `NODE_ENV=test PORT=4211 DATABASE_URL=postgresql://.../phase6_adopt_completion_b DEV_AUTH_BYPASS=false TYPEORM_SYNCHRONIZE=false npm start`.

Frontend build: `npx tsc --noEmit && NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4211 NEXT_PUBLIC_API_URL=http://127.0.0.1:4211 npm run build`; serve with `npm start -- -p 3001`.

Lint: `npm run lint -- --format json` (exit 1; 502 errors, 115 warnings).
