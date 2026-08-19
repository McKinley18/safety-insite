# AUTH-P1 — Frontend / Browser Verification

Real Chromium session (`claude-in-chrome`), real local frontend (`next dev`, Next.js 16.2.12/Turbopack) pointed at the real local backend (disposable DB, `DEV_AUTH_BYPASS=true`), not mocked.

## Tooling artifact encountered and resolved

Loading the frontend via `http://127.0.0.1:3000` produced a reproducible failure: the login form's `Sign In` submission fell back to a native browser `GET /login?` instead of invoking the React `handleLogin` handler. Root cause traced via the dev server log: `⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "127.0.0.1"` — Next.js 16's `allowedDevOrigins` protection blocks HMR/dev-resource requests from an origin other than `localhost` by default, which broke client-side hydration on that origin. Confirmed as a tooling artifact, not a product defect, two ways: (1) the login page source (`frontend-next/app/login/page.tsx:25,130`) is correctly wired — `<form onSubmit={handleLogin}>` with `event.preventDefault()` as the handler's first line; (2) reloading the identical page via `http://localhost:3000/login` immediately fixed it. Per this task's own instruction ("do not modify production code to accommodate a broken test driver"), no code was changed for this — the fix was simply using the correct origin.

## Verified (via `localhost:3000`)

- **Login**: real credentials for user A submitted through the actual UI form → real JWT issued → redirected to `/command-center`. No console errors (`read_console_messages`, `onlyErrors: true` → none).
- **Session reflects real identity, not bypass identity**: `/inspections` page's "Saved Site" selector shows **"Site Owned By A"** — the exact site created earlier via the API as user A in this same disposable DB — confirming the browser session is operating as the real authenticated user, not the synthetic bypass identity, even though the backend has `DEV_AUTH_BYPASS=true` set.
- **Backend connectivity confirmed live**: network capture shows a real CORS preflight (`OPTIONS http://127.0.0.1:4000/billing/status` → `204`) from the frontend origin to the local disposable backend — not a cached/mocked response.
- **No raw 500 / no crash pages**: `/command-center` and `/inspections` both rendered their full intended UI (stat tiles, saved-site selector, bottom nav) with no error boundary, no blank screen, no visible stack trace.

## Not exercised this phase

A dedicated "development bypass with no login at all" frontend click-through (Phase 10's third scenario) was not separately driven through the UI — it is already covered at the API layer (`AUTH_MATRIX.md`, mode C, all three previously-broken routes) and the frontend has no bypass-specific UI branching to verify beyond the header-attachment logic already reviewed in `AUTH_ARCHITECTURE_MAP.md`.
