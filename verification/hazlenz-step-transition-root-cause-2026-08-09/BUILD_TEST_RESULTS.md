# Build and regression results

- `npm run build` (backend): PASS.
- `npx tsc --noEmit` (frontend): PASS after removing generated `.next/dev` duplicate type artifacts; no tracked source change from that cleanup.
- `npm run build` (frontend): PASS.
- Instrumented controlled browser transition: PASS.
- Single full browser analysis scenario: PASS (HTTP 201).
- Preserved 20-scenario Chromium audit: PASS (20/20 Step 2, review visible, analysis rendered).
- `git diff --check`: PASS.

No backend, finding-review, authorization, report, or finalization source was touched, so their prior regression evidence remains applicable.
