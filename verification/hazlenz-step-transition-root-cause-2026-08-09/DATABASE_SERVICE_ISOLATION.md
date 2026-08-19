# Database and service isolation

- PostgreSQL container: `safescope-db-response-audit`
- Disposable database: `phase_hlz_response_audit`
- Backend: disposable port 4236
- Frontend: disposable port 3007
- Storage: local test root `/tmp/safety-insite-step-transition`
- Original development database: untouched

The disposable entitlement grant used for authenticated HazLenz calls was extended only in the disposable database. Services are stopped after verification.
