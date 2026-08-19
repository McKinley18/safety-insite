# Test commands and results

- `git diff --check` — PASS.
- `git rev-parse HEAD` — `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.
- `npx tsc --noEmit` in `frontend-next` — PASS (prior validated run).
- `npm run build` in `frontend-next` — PASS (prior validated run).
- Backend build — PASS (prior validated run).
- Narrative regression — PASS.
- Guided finding response — PASS (27 assertions).
- Evidence-boundary regression — PASS (13 assertions).
- Production-path regression — PASS (15 assertions).
- Temporal reconciliation regression — PASS (3 assertions).
- Real Chromium fallback audit — 20 authenticated capture-page attempts; 0 reached HazLenz response rendering because the canonical Next/review transition did not expose an actionable analysis control in the tested state. Browser console contained repeated development HMR WebSocket errors; no application page exception was captured.

The in-app browser connector was attempted first and failed during bootstrap with `Cannot redefine property: process`; Playwright-controlled installed Chromium was used as the documented fallback. Disposable PostgreSQL database `phase_hlz_response_audit` was used and stopped afterward. Original development database was not touched.
