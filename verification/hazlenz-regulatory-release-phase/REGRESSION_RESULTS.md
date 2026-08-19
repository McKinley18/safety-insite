# Regression results

- Backend TypeScript production build: PASS
- Frontend production build and TypeScript: PASS
- Modified frontend lint: PASS
- Evidence foundation: PASS, 35 assertions
- Evidence boundary: PASS, 13 assertions
- Canonical inspection persistence: PASS, 19 scenarios
- Cross-user denials: PASS, 4 checks
- Mass assignment rejection: PASS
- Private storage/report persistence: PASS, 12 scenarios
- Immutable report versions: PASS, 2 versions and distinct checksums
- Foreign report download: PASS, 404
- Billing/entitlements: PASS, 24/24
- Password-reset delivery boundary: PASS
- Storage provider: PASS, 4 scenarios
- Standards clean migration: PASS, 26/26
- Standards seed first run: PASS, 19 rows
- Standards seed idempotency: PASS, 0 inserts on intelligence rerun

Canonical workflow registration/login exercises real JWT authentication. The older aggregate auth-flow harness still assumes a development token is returned by the reset endpoint; the provider-specific delivery suite is the canonical check and passed.
