# Service commands

Disposable database/storage:

```text
docker start safescope-db
docker start hazlenz-completion-minio
DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase8_critical_20260803 NODE_ENV=test npm run migration:run
```

Backend:

```text
NODE_ENV=test PORT=4230 DATABASE_URL=postgresql://user:password@127.0.0.1:5432/phase8_critical_20260803 JWT_SECRET=<redacted> PASSWORD_RESET_PROVIDER=test STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=/tmp/safety-insite-phase8 DEV_AUTH_BYPASS=false DEV_FORCE_EXPERT=true TYPEORM_SYNCHRONIZE=false npm start
```

Frontend production build/start:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4230 NEXT_PUBLIC_API_URL=http://127.0.0.1:4230 npm run build
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4230 NEXT_PUBLIC_API_URL=http://127.0.0.1:4230 npm start -- -p 3001
```

Services were stopped after testing; secrets are intentionally omitted.
