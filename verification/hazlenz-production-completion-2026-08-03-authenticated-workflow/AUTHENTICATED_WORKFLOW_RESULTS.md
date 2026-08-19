# Authenticated workflow

Real Chromium against the disposable production frontend/backend verified normal UI login, HTTP 201 authentication, command-center navigation, inspection capture, observation entry, HazLenz analysis completion, mechanism-chain display, confidence, risk, evidence gaps, and standards review. `DEV_AUTH_BYPASS=false`.

The CORS defect was corrected in `backend/src/main.ts` by explicitly allowing non-production loopback origins (`localhost` and `127.0.0.1`). Exact-origin production validation remains fail-closed.

The standards-state display correction in `frontend-next/components/inspection/SafeScopePrimaryDecisionSection.tsx` distinguishes confirmed/direct standards from candidates and uses “No confirmed standard selected” when appropriate.

Not completed in this run: end-to-end clarification persistence, risk override, corrective-action persistence, finalization/history, reports, offline synchronization, and browser authorization/failure matrix.
