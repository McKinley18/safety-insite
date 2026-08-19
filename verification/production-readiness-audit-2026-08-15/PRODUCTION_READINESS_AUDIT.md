# Safety InSite — Production Readiness & Release Validation Audit

**Date:** 2026-08-15
**Repo HEAD (before and after):** `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (branch `main`) — unchanged
**Mode:** Diagnosis/verification only. No production code was modified.
**HazLenz foundation status:** Treated as a protected, immutable regression baseline (V3 227/228 engineering-closed; V4 228/228 governance-closed). Not re-optimized or second-guessed in this pass — see the Environment Matrix / Release Gate docs for the protected-hash verification.

## Scope and method

A disposable PostgreSQL database (`phase128_prodaudit_20260815`) and disposable backend/frontend processes were used throughout; the original `safescope` development database was never targeted by any mutating command (verified via `select current_database()` before each migration/seed step, and confirmed still present and untouched at teardown). All 34 backend migrations were run cleanly against the disposable DB. A disposable frontend instance was pointed at the disposable backend (its `NEXT_PUBLIC_API_BASE_URL`/`NEXT_PUBLIC_API_URL` were overridden via shell environment only — `frontend-next/.env.local`, which points at a real remote backend host, was never modified).

Verification combined: the repository's own existing integration test-script suite (13 scripts run live against the disposable stack — `test-entitlement-boundary`, `test-authenticated-entitlement-path`, `test-canonical-workflow`, `test-finding-scoped-reviews`, `test-persisted-decomposition-findings`, `test-canonical-organization-authorization`, `test-private-storage-reports`, `test-auth-flow`, `test-auth-rate-limit`, `test-storage-provider`, `test-production-environment`, `test-risk-policy`, `test-guided-finding-response`, `test-evidence-foundation`); direct API/curl exercises (IDOR probes, entitlement grants, task/calendar checks, malformed-input error-handling checks); direct PostgreSQL inspection (schema, FK/cascade rules, live row-level evidence for defects); and real Playwright/Chromium browser automation against the live UI (registration → login → the actual primary inspection launcher → site creation → observation capture → live HazLenz AI review, at both desktop 1440×900 and mobile 390×844 viewports), with screenshots retained under `screenshots/`.

## Domain-by-domain summary

**1. Build/Static Integrity — PASS.** Backend `tsc` and frontend `next build` (26/26 static pages) both succeed cleanly.

**2. Database/Migrations — PASS.** All 34 migrations applied cleanly to a fresh disposable DB; `migration:show` confirms zero pending.

**3. Authentication/Authorization — PASS.** IDOR-tested (inspections and sites both correctly return 404, not 403, to cross-user access, including well-formed requests with valid `version` fields, avoiding existence leakage); registration/login rate-limited (5/min) with no information leakage in the 429 body; organization-scoped authorization independently verified (11 assertions).

**4. Account/Subscription/Entitlements — PASS, with 1 P2 finding (PRA-001).** Backend enforcement of the `fullSafeScope` (Pro+) entitlement gating `/safescope-v2/classify` is correct and clean (402 `PAID_SUBSCRIPTION_REQUIRED` for free tier; immediate success after a Pro-equivalent grant; expiry and cross-user isolation both verified). The actual primary UI launcher (`/inspections` → `/inspection-workspace`) surfaces this denial gracefully. A separate, older `/inspection` route (still linked from `command-center`) does not, and displays the raw JSON error body — see PRA-001 and PRA-005.

**5. Primary Inspection Journey — PASS for single-hazard, safe/control, and ambiguity-with-clarification scenarios; FAILS at finalization for multi-hazard (scenario B) — P1 (PRA-002).** A real end-to-end browser walkthrough of the actual primary launcher flow succeeded (register → login → create site → Quick Inspection → capture observation → live HazLenz AI review). Reload/recovery mid-inspection was verified via durable analysis-state reload and a full reopen→edit→re-finalize→re-report cycle. The one required sub-scenario that fails is B (multi-hazard): when HazLenz correctly decomposes one observation into multiple distinct findings sharing a single human review (the explicitly-designed "split" disposition), the inspection can never be transitioned to `completed` — see PRA-002.

**6. HazLenz Integration — PASS.** Not re-litigated as a recognition-quality question (that is out of scope; V4's 228/228 result stands as the trusted foundation). What was verified is integration/rendering correctness: a live browser test showed multi-hazard decomposition (3 distinct findings from one observation), structured fact extraction with per-fact source attribution, and live clarification-question rendering, all working correctly end to end through the real UI.

**7. Risk Review — 1 P2 finding (PRA-006).** `test-risk-policy.ts` (10/10) confirms the risk-policy unit logic (level normalization, urgency mapping, material-change detection) is correct in isolation. However, tracing the actual guided-inspection flow found that risk assessment is captured **once per analysis/human-review**, not per finding: `app/inspection-workspace/page.tsx` holds a single, non-indexed `reviewerRisk` state object, and `inspection_findings` has no risk-related columns at all. Live DB evidence: a 3-finding multi-hazard decomposition had exactly one shared risk object whose reasoning was scoped to only one of the three represented hazard families. This is exactly the "observation-scoped risk where finding-scoped risk is required" pattern the audit brief asked to be checked for.

**8. Corrective Actions/Tasks — PASS, with 1 P3 finding (PRA-003).** Task creation, calendar projection, and status transitions all verified live via direct API calls. Corrective-action creation and cross-user 404 denial were verified via `test-canonical-workflow.ts`. The CSV export endpoint does not quote/escape fields (malformed-CSV and classic CSV-injection risk) — PRA-003, low severity, JSON export remains a safe workaround.

**9. Finding Lifecycle/Persistence — PASS, tied to PRA-002.** Historical/active finding-key separation, stale-write 409 conflict handling, and idempotent analysis replay are all verified working correctly. Finalization itself is blocked in the multi-finding-shared-review case — see PRA-002.

**10. Reports/PDF — PASS.** A real end-to-end report-generation test (12 scenarios) passed: genuine Puppeteer-rendered PDFs (`%PDF-` magic bytes verified), immutable versioning across source changes, idempotent no-op regeneration, cross-user 404 denial, checksum integrity, and audit-log persistence. (One verification-infrastructure hiccup occurred and was self-corrected: the disposable backend was initially launched without `STORAGE_LOCAL_ROOT`, causing a local-storage-only error that cannot occur in production, where `STORAGE_PROVIDER=s3` is enforced by the fail-fast config gate.)

**11. Concurrency/Reload/Recovery — PASS.** Concurrent analysis-version writes resolve correctly (no corrupted double-apply); stale-write conflicts correctly return 409; 8 concurrent entitlement-gated requests resolved consistently; mid-inspection reload and a full reopen/edit/re-finalize cycle both verified.

**12. Error Handling — PASS.** Unhandled (non-`HttpException`) exceptions produce a clean, generic `{"statusCode":500,"message":"Internal server error"}` with no stack trace or internal detail leakage — confirmed live by triggering a genuine unhandled DB-level error via a malformed UUID route parameter. (Minor, non-security observation: such routes return 500 rather than a more semantically correct 400, since no `ParseUUIDPipe` validates the param first — not filed as a tracked issue given its triviality and the absence of any information disclosure.)

**13. Frontend/UX Release Blockers — PASS, with 1 P2 finding (PRA-005) already covered under Domain 5.** Desktop and mobile viewports both render correctly with no layout breakage observed. A sweep for stale "SafeScope/Sentinel" naming across every browser-visited page (register, login, command-center, inspections, inspection-workspace, including error/status copy) found none — branding is consistently "Safety InSite / Powered by HazLenz AI" throughout.

**14. Security/Privacy Basics — PASS.** This was a targeted audit, not a penetration test, and no destructive/external testing was performed. Findings: IDOR-clean (404, not 403, avoiding existence leakage); rate-limiting present and non-leaky; the production-environment fail-fast config gate independently verified (8/8 assertions: insecure dev flags, weak/blocklisted JWT secrets, non-HTTPS URLs, non-S3 storage, wildcard/non-exact CORS origins, and out-of-range proxy-hop counts are all rejected at boot); local storage provider rejects path traversal and refuses to instantiate outside test mode; unhandled exceptions do not leak internals; CSV export lacks escaping (PRA-003, low severity).

**15. Production Configuration — PASS.** See the Environment Matrix document for the full variable-by-variable breakdown. The fail-fast production-config guard is a strong, independently-verified positive control. Local dev `.env` has no Stripe keys configured — noted as a local-environment observation only, not confirmed against (and out of scope to confirm against) the actual production deployment's real environment.

**16. Data Integrity — PASS, with 1 P3 finding (PRA-007).** A full foreign-key/cascade-rule audit of the disposable DB schema found a deliberate, sound pattern: `CASCADE` scoped narrowly to genuinely-dependent child records, `RESTRICT` used pervasively for anything referenced by users/findings/reports/tasks/corrective-actions to prevent accidental data loss. Zero orphaned `inspection_findings` rows found. One gap: `corrective_actions` (an older table predating the canonical relational schema) has no FK constraints to user/site/finding/inspection despite referencing them by ID — a latent structural risk with no currently-observed live impact.

## Issues found (see `PRODUCTION_READINESS_ISSUES.json` for full detail)

| ID | Severity | Domain | Title |
|---|---|---|---|
| PRA-002 | **P1** | 5, 9 | Inspection finalization blocked for multi-hazard findings sharing one review |
| PRA-001 | P2 | 4 | Raw JSON error surfaced to free-tier users on the older `/inspection` route |
| PRA-005 | P2 | 5, 13 | Two parallel, architecturally-different inspection entry points both reachable |
| PRA-006 | P2 | 7 | Risk assessment shared across split findings instead of captured per finding |
| PRA-003 | P3 | 8 | Corrective-actions CSV export lacks field escaping |
| PRA-004 | P3 | 1 | Dead/unwired duplicate reports-PDF code checked into git (incl. `.bak`/`.broken`) |
| PRA-007 | P3 | 16 | `corrective_actions` lacks FK constraints to referenced entities |

**P0: 0 · P1: 1 · P2: 3 · P3: 3**

## What this audit deliberately did not do

Per the explicit "do not move the goalposts" instruction: this audit does not treat architecture cleanliness, missing unit-test coverage, UI polish, code-refactoring opportunities, or future HazLenz reasoning/risk-layer work as release blockers. PRA-004 and PRA-007 are noted as real but non-blocking (P3) precisely because they have no demonstrated current impact. PRA-002 is the sole release blocker, and it was held to a high evidentiary bar: live reproduction, DB-state proof that the underlying data was valid, root-cause code identification, and a passing corroborating control ruling out a general finalization failure.

See `PRODUCTION_READINESS_RELEASE_GATE.md` for the gate decision and minimum remediation path, `PRODUCTION_READINESS_ENVIRONMENT_MATRIX.md` for the full configuration inventory, and `PRODUCTION_READINESS_TEST_RESULTS.json` for the complete, itemized test-execution log.
