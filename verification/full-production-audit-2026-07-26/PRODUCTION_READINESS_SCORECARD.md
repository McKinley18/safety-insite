# Production Readiness Scorecard

| Area | Rating | Evidence |
|---|---|---|
| Architecture | Needs substantial work | Active and legacy SafeScope paths, duplicate entity systems, very large monolithic service, nested/abandoned frontend under backend |
| Frontend | Needs substantial work | Build passes; lint has 528 errors; placeholder reset flow; local/cloud competing persistence |
| Backend | Needs substantial work | Build and health pass; broad endpoints; partial transactions, inconsistent guards/DTOs, heavy memory |
| Database | Not ready | Live schema/entity drift, empty migrations table, most core tables absent |
| Security | Not ready | Same-origin SVG upload, dependency highs, IDOR-risk organization route, no reset lifecycle |
| Authentication | Not ready | Hashing/JWT basics exist; live schema incompatible; no reset/refresh/logout revocation |
| Authorization | Needs substantial work | Entitlement and org filters exist; `GET /organization/:id` is only JWT-protected |
| Billing | Mostly ready | Signed Stripe webhooks and backend entitlements; production configuration unverified |
| Data integrity | Not ready | Non-transactional report creation, count-based display IDs, absent FKs/tables in live schema |
| Deployment | Not ready | Docker port error, CI path error, no committed Render/Vercel blueprint |
| Reliability | Not ready | No readiness separation, retries, queues, or recovery verification |
| Performance | Needs substantial work | 52–468 ms audit classify latency, but 688–866 MB startup RSS and ~845 MB peak |
| Monitoring | Not ready | Logs and health only; no metrics, tracing, alerting, error reporting, SLOs |
| Documentation | Needs substantial work | Stale template README and `~/Sentinel_Safety` verification script |
| HazLenz hazard identification | Needs substantial work | 67/102 overall acceptable family-level results |
| HazLenz jurisdiction detection | Needs substantial work | Scope logic exists; ambiguous-jurisdiction gating remains weak |
| HazLenz standards accuracy | Not ready | 16 prohibited-family promotions; corpus only 19 standards rows |
| HazLenz clarification behavior | Not ready | 56/102 expectation mismatches |
| HazLenz corrective actions | Needs substantial work | Actions always generated in many safe/uncertain cases; grounding inconsistent |
| HazLenz risk calibration | Needs substantial work | Risk generated before later evidence/application gates; expert adjudication required |
| HazLenz confidence calibration | Needs substantial work | Confidence is recalibrated through multiple layers; no validated reliability curve |
| HazLenz operational readiness | Not ready | High memory, incomplete corpus, required human review, no production telemetry |

