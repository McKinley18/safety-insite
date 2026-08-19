# Next phase recommendation

1. Create an explicit migration-baseline adoption procedure for existing databases, then add schema-diff CI.
2. Complete A/B integration tests for every protected route, including nested IDs and administrative APIs.
3. Configure and test production password-reset delivery without token logging.
4. Build the authenticated capture → HazLenz → human review → finalize → report → action/calendar E2E gate.
5. Plan/test Nest 11 migration to clear platform-express/Multer advisories.
6. Resolve Next/PostCSS/Sharp and jsPDF/DOMPurify advisories as compatible releases become available.
7. Move uploads to private durable object storage with authorized retrieval and retention cleanup.
8. Burn down active-route hook/type/accessibility lint debt while enforcing the 526/120 ceiling.
9. Add readiness, metrics, error reporting, backups and restore validation.
10. Only then begin the separate HazLenz precision/safety stabilization roadmap.
