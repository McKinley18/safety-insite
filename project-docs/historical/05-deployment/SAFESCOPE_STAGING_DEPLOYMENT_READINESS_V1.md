# SafeScope Staging Deployment Readiness v1

This document outlines the readiness state and requirements for deploying SafeScope AI Intelligence to a staging environment.

## Readiness Summary
- **Master Validation:** 69/69 steps passed (including staging hardening).
- **Hardening Pass:** Demo/Mock fallbacks are gated; secure defaults are enforced.
- **Persistence:** Configurable between file-backed (local) and database-backed (staging/prod).

## Required Backend Environment Variables
| Variable | Required | Staging Value | Note |
|----------|----------|---------------|------|
| `NODE_ENV` | Yes | `staging` | Triggers production-safe guardrails. |
| `SAFE_SCOPE_PERSISTENCE_MODE` | Yes | `database` | **Mandatory** for staging. Disables local JSON storage. |
| `JWT_SECRET` | Yes | [SECRET] | Must be a strong, unique secret. System fails if missing in staging. |
| `DEV_AUTH_BYPASS` | No | `false` | Must be disabled. Guard logic blocks bypass when `NODE_ENV=staging`. |

## Required Frontend Environment Variables
| Variable | Required | Staging Value | Note |
|----------|----------|---------------|------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | [STAGING_API_URL] | Points to the backend staging API. |
| `NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK` | No | `false` | **Do not enable** unless explicitly testing mock UI state. |
| `NEXT_PUBLIC_DISABLE_AUTH` | No | `false` | Must be disabled for staging security. |

## Staging Deployment Checklist
1. [ ] Ensure `NODE_ENV` is set to `staging`.
2. [ ] Verify `SAFE_SCOPE_PERSISTENCE_MODE=database` is configured.
3. [ ] Confirm a valid `JWT_SECRET` is present in the environment.
4. [ ] Verify that `DEV_AUTH_BYPASS` and `NEXT_PUBLIC_DISABLE_AUTH` are `false` or unset.
5. [ ] Run `npm run build` on both backend and frontend to ensure type integrity.
6. [ ] Deploy database migrations if SafeScope persistence entities have changed.

## Manual Smoke Test Checklist
1. [ ] **Auth Check:** Attempt to access `/safescope-knowledge/review` without a token. Should be blocked.
2. [ ] **Governance Check:** Log in as a `Viewer` and attempt to approve a candidate. Should be blocked by `WorkspaceGovernanceAccessService`.
3. [ ] **Persistence Check:** Run an evaluation. Verify record exists in database, not `safescope-data/persistence/`.
4. [ ] **Offline Check:** Toggle Offline Mode. Verify advisory summary appears with "Sync Required" warning.
5. [ ] **Legal Language Check:** Submit a finding with "is a violation". Verify SafeScope blocks or flags the language.

## Known Caveats & Rollback
- **Caveat:** Local knowledge packs (seed data) are bundled. Stale packs will trigger confidence penalties.
- **Rollback:** SafeScope v2 is backward compatible with v1 finding storage. Rollback involves reverting the backend service to the previous release.

## Hard Blockers
- Missing `JWT_SECRET` in staging/production.
- Database connectivity failure when `PERSISTENCE_MODE=database`.
