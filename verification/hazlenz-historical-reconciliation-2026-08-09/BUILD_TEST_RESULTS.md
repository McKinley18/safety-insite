# Builds and tests

- Fresh migration from zero: PASS (34 migrations).
- Chromium baseline/reanalysis harness: PASS for three reconciliation cases, with API-assisted reanalysis because no observation-edit UI exists.
- New-finding review/finalization gate: PASS.
- Report v1/v2 checksum and byte comparison: PASS.
- Backend build: PASS.
- Frontend TypeScript: PASS.
- Frontend production build: PASS (existing production workflow; no frontend production changes this phase).
- `git diff --check`: PASS.
