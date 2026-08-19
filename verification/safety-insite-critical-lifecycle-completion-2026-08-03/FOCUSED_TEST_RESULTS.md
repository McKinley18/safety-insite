# Focused tests

- Backend `npm run build`: PASS.
- Backend `npm run test:canonical-workflow`: PASS (25 scenarios).
- Backend `npm run test:canonical-authorization` from prior clean phase: PASS (11 assertions, 404 foreign policy).
- Backend `npm run test:private-storage-reports` from prior clean phase: PASS (12 scenarios, two checksums).
- Backend `npm run test:upload-security`: PASS.
- Backend `npm run test:guided-finding-response`: PASS, 27 assertions.
- Backend `npm run test:risk-policy`: PASS, 10/10.
- Frontend typecheck: PASS.
- Frontend production build: PASS.
- HazLenz corpus baseline reused unchanged; reasoning source was not modified.
