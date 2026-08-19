# Production files changed

- `backend/src/main.ts`: explicit non-production loopback CORS origins, preserving exact-origin production behavior.
- `frontend-next/components/inspection/SafeScopePrimaryDecisionSection.tsx`: distinguish confirmed/direct standards from candidates and avoid claiming no standard when candidates are present.

Other dirty production files predated this lifecycle run and were preserved.
