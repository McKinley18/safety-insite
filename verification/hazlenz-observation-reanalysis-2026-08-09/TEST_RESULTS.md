# Builds and tests

- Backend `npm run build`: PASS.
- Frontend `rm -rf .next && npx tsc --noEmit`: PASS.
- Frontend targeted ESLint (`app/inspection-workspace/page.tsx`, `lib/canonicalWorkflowApi.ts`): PASS.
- Frontend production build: PASS.
- Real Chromium revision/reanalysis run: PASS for update and reanalysis controls.
- Stale-version test: PASS (409).
- Foreign authorization tests: PASS (404).
- `git diff --check`: PASS.
