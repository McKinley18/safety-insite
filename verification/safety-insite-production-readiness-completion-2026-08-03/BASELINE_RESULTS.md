# Baseline results

- Backend `npm run build`: PASS.
- Frontend `npx tsc --noEmit`: PASS.
- Frontend supported production build: PASS.
- Frontend lint: FAIL, 502 errors and 115 warnings. Top rules: `@typescript-eslint/no-explicit-any` (493), `no-unused-vars` (110), hooks/state-effect findings (11).
- Production validator: PASS (8 assertions); insecure production start with `DEV_AUTH_BYPASS=true` fails closed.
- HazLenz baseline reused: 129 total, 113 PASS, 16 NEEDS REVIEW, 0 FAIL; 81/81 life-critical stable across 243 runs.
