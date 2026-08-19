# Environment summary

Backend: `NODE_ENV=test PORT=4230 DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase8_critical_20260803 JWT_SECRET=<redacted> PASSWORD_RESET_PROVIDER=test STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=<redacted> DEV_AUTH_BYPASS=false DEV_FORCE_EXPERT=true TYPEORM_SYNCHRONIZE=false npm start`.

Frontend production build: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4230 NEXT_PUBLIC_API_URL=http://127.0.0.1:4230 npm run build`; served on port 3001. Chromium used fresh contexts. Disposable PostgreSQL and MinIO services were started and will be stopped.
