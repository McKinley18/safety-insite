# Next Implementation Prompt

Continue in `/Users/mckinley/Desktop/Safety_InSite` on `main`. Do not commit or push. Preserve the intentionally dirty Phase 1–6 work and verification artifacts. Before editing, read every file in `verification/production-remediation-phase-6-2026-07-28/`, inspect git status, and verify the five hashes in `PROTECTED_HAZLENZ_HASHES.md`. Do not modify those HazLenz files or tune HazLenz reasoning.

Implement the smallest Phase 7 needed for a controlled supervised pilot:

1. Select one active inspection UI and wire every user interaction—site, draft, observation, real HazLenz analysis snapshot, human review, finding, corrective action, task/calendar projection, completion, report generation, version history, and download—to the canonical server APIs.
2. Retire or visibly isolate all conflicting `reportStorage`, `reportGenerationService`, `actionStorage`, `safetyCalendar`, `evidenceStorage`, and offline inspection paths. Local data may recover an explicitly labeled unsynced draft only. It must never appear finalized, overwrite a newer server version, or cross user/organization namespaces.
3. Complete a controller-by-controller authentication/role/tenant matrix for all active legacy and canonical routes. Add real A1/A2/B1/platform-support tests for reads, mutations, aggregates, exports, files, archived parents, and direct identifiers.
4. Configure and verify the chosen hosted private S3-compatible provider in a non-production staging environment: TLS, private bucket policy, lifecycle, backup, timeouts, unavailable-provider behavior, database/object compensation, and audit events. Do not store credentials in the repository or reports.
5. Configure and verify the production email provider in staging with enumeration resistance and no token logging.
6. Build an isolated NestJS 11 compatibility plan and test branch or document explicit risk acceptance. Do not force-upgrade the dirty worktree. Re-run npm audits.
7. Run a fully UI-driven Playwright flow against an adopted database and hosted storage. No API-assisted intermediate workflow steps: create through report version 2, reload, reauthenticate, cross-tenant deny, and directly verify database/object checksums.
8. Add deployment rollback, monitoring, object orphan reconciliation, and migration cutover runbooks.

Stop rather than weakening authorization, exposing storage, fabricating migration history, modifying the original database, or editing protected HazLenz behavior. Produce a new Phase 7 verification directory with exact evidence and conservative GO/NO-GO decisions.

