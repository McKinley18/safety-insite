# Findings

## P-001 — Critical — Database — Active schema cannot support the application

**Evidence:** Read-only inspection found 10 public tables, zero applied migration records, and no report/action/inspection/audit tables. `backend/src/users/user.entity.ts` defines an integer ID, while the database has UUID.  
**Reproduce:** Query `information_schema.tables`, `migrations`, and `information_schema.columns`.  
**Affected:** `backend/src/database/`, active entities, local PostgreSQL.  
**Impact:** Registration, reports, actions, and most authenticated workflows can fail or corrupt assumptions.  
**Remediation:** Create a clean canonical migration baseline from reviewed entities, migrate a copy, verify data transforms, then promote with backup/rollback.  
**Blocking:** Local operation, pilot, production.

## P-002 — Critical — Security — Same-origin active SVG upload

**Evidence:** `backend/src/upload/upload.controller.ts` accepts `image/svg+xml` using only caller MIME/extension; `backend/src/main.ts` serves `/uploads` as static same-origin content.  
**Reproduce:** Inspect allowlists and static middleware.  
**Impact:** A permitted user can store script-capable SVG and expose it from the trusted backend origin.  
**Remediation:** Reject SVG or sanitize and rasterize in an isolated service; sniff magic bytes; serve user content from a cookieless isolated origin with attachment headers.  
**Blocking:** Public production.

## P-003 — High — Authorization — Organization IDOR risk

**Evidence:** `GET /organization/:id` uses `JwtGuard` but no role or membership check; service `findOne(id)` queries arbitrary IDs.  
**Reproduce:** Authenticate as one organization and request another known UUID (not executed to avoid cross-user access).  
**Impact:** Organization metadata exposure across tenants.  
**Remediation:** Require same-org membership or explicit platform-admin authority; return indistinguishable 404.  
**Blocking:** Pilot and production.

## P-004 — High — Deployment — Docker/CI configuration is broken

**Evidence:** `docker-compose.yml` maps backend `3000:3000`, app listens on 4000; GitHub workflow uses `working-directory: frontend` and `frontend/package-lock.json`, but active app is `frontend-next`.  
**Reproduce:** Inspect files.  
**Impact:** Clean-clone startup and CI cannot be trusted.  
**Remediation:** Correct ports/healthchecks, add frontend service, update CI, and test from a clean clone.  
**Blocking:** Pilot and production.

## P-005 — High — HazLenz — Citation evidence gates are unsafe

**Evidence:** Novel evaluation: 16 prohibited citation-family promotions and only 67/102 acceptable cases. API controller can synthesize a visible standard when `primaryCitation` exists but arrays are empty.  
**Reproduce:** Run `run-novel-hazlenz-evaluation.mjs`.  
**Impact:** Users may receive unsupported regulatory assertions.  
**Remediation:** Make evidence/applicability decisions canonical, remove boundary promotion repair, require hydrated authoritative text and jurisdiction evidence before promotion.  
**Blocking:** Unsupervised HazLenz and public safety claims.

## P-006 — High — HazLenz — Safe/uncertain state handling is unreliable

**Evidence:** Eight safe-state suppression failures; nine prohibited promotions in insufficient/contradictory variants; 56 clarification mismatches.  
**Impact:** False violations, missed questions, or false certainty.  
**Remediation:** Represent observed fact, negation, temporal state, source, control state, and contradiction explicitly; gate citation/action/risk output from that model.  
**Blocking:** Unsupervised HazLenz.

## P-007 — High — Operations — Runtime memory exceeds deployment envelope

**Evidence:** Existing backend health reported 688 MB RSS; isolated audit startup reported 866 MB RSS; run peaked near 845 MB. Docker sets 512 MB old-space and documentation describes constrained Render runtime.  
**Impact:** OOM restarts and cold-start instability.  
**Remediation:** Split heavy reasoning into worker/service, lazy-load immutable indexes, profile retained objects, set measured memory tier and load gates.  
**Blocking:** Pilot at current hosting size; production.

## P-008 — High — Security — Known vulnerable production dependencies

**Evidence:** 2026-07-26 `npm audit --omit=dev`: backend 14 total (4 high); frontend 4 total (3 high), including Next 16.2.6, PostCSS, platform Express/Multer chain, Axios.  
**Impact:** DoS, SSRF/path disclosure, authorization bypass, upload resource exhaustion depending on reachable use.  
**Remediation:** Upgrade to patched compatible releases, regenerate locks, rerun build/audit/security tests.  
**Blocking:** Public production.

## P-009 — High — Authentication — Password recovery is not implemented

**Evidence:** `frontend-next/app/forgot-password/page.tsx` renders a form but has no state, `onSubmit`, API call, labels, or reset backend endpoints.  
**Impact:** Users cannot recover accounts; UI makes a false functional promise.  
**Remediation:** Implement single-use hashed tokens, short expiry, neutral responses, rate limits, session invalidation, and email delivery monitoring.  
**Blocking:** Public production.

## P-010 — High — Data integrity — Report creation is non-transactional

**Evidence:** `ReportsService.create` saves report, loops findings/actions, then syncs actions without a database transaction.  
**Impact:** Partial reports/actions remain after mid-request failure or retry; duplicate actions possible.  
**Remediation:** Use a transaction and idempotency key; move expensive generation before commit or into a durable job.  
**Blocking:** Pilot and production.

## P-011 — Medium — API — Inconsistent route protection and role semantics

**Evidence:** `@Roles` appears on HazLenz controller without `RolesGuard`; role strings mix `Auditor`, `AUDITOR`, `Owner`, `ORG_OWNER`. Visual/offline endpoints omit entitlement guard used by classify.  
**Impact:** Policy drift and feature bypass.  
**Remediation:** One canonical role enum and global guard composition; endpoint authorization matrix tests.  
**Blocking:** Public production.

## P-012 — Medium — CORS — Broad Vercel substring trust

**Evidence:** Any `*.vercel.app` origin containing `safety-insite` or `sentinelsafety` is accepted.  
**Impact:** Attacker-controlled preview/project names could receive credentialed CORS.  
**Remediation:** Exact production origins; controlled preview-origin verification without credentials.  
**Blocking:** Public production.

## P-013 — Medium — Frontend quality — Lint/QA gates fail

**Evidence:** 648 lint findings; workflow checks time out on nonexistent `/actions`; no Playwright specs/config found.  
**Impact:** Type/React defects and regressions ship without a functioning gate.  
**Remediation:** Establish a zero-error baseline, repair tests around real routes, enforce in CI.  
**Blocking:** Pilot quality gate.

## P-014 — Medium — Privacy — Sensitive inspection data stored locally

**Evidence:** offline queue and reports use browser local storage/IndexedDB patterns; “encryptedStorageEnabled” only checks WebCrypto availability and does not prove encryption. JWT is stored in localStorage.  
**Impact:** XSS or shared-device access can expose tokens, photos, reports, and observations.  
**Remediation:** Minimize local sensitive data, encrypt with user-derived/session-bound keys, document retention/clear behavior, prefer secure cookies for sessions.  
**Blocking:** Product/privacy decision before public launch.

## P-015 — Medium — Data integrity — Race-prone action identifiers

**Evidence:** corrective-action `displayId` uses global `count()+2001` while column is unique.  
**Impact:** Concurrent creates collide and IDs leak global volume.  
**Remediation:** Database sequence or organization-scoped atomic counter with retry.  
**Blocking:** Production.

## P-016 — Medium — Standards — Regulatory corpus is incomplete

**Evidence:** Live `standards_master` has 19 rows; knowledge tables have eight documents and eight chunks.  
**Impact:** Broad product scope cannot be hydrated or verified from authoritative text.  
**Remediation:** Governed ingestion manifest, completeness checks by jurisdiction/family, immutable source/version metadata, expert sampling.  
**Blocking:** Unsupervised HazLenz and broad standards claims.

## P-017 — Medium — Product — Paid plan selected at registration is not purchased

**Evidence:** UI offers Pro/Expert selection and sends `selectedPlan`; backend ignores it and creates free unless a private promo/invite applies.  
**Impact:** Misleading signup and conversion failure.  
**Remediation:** Register free then explicitly enter Stripe checkout, or clearly label selection as post-registration checkout.  
**Blocking:** Public billing launch.

## P-018 — Low — Information exposure — Health endpoint leaks operational details

**Evidence:** Public `/health` exposes environment, memory, build metadata, and reports package version as `gitCommit`.  
**Impact:** Fingerprinting and misleading deployment verification.  
**Remediation:** Public liveness should be minimal; protect diagnostics; inject real commit SHA.  
**Blocking:** No.

