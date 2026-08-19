# Reproduction commands

```sh
git diff --check
cd frontend-next && npx eslint . --format json
cd frontend-next && npx tsc --noEmit
cd frontend-next && npm run build
node verification/hazlenz-production-completion-2026-08-03-final-gates/repeatability-run.mjs
```

Start the disposable backend with the isolated `phase6_adopt_completion_a` database and `DEV_AUTH_BYPASS=false` before endpoint tests. Do not point migrations or destructive operations at the original development database.

