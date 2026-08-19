# AUTH-P1 — Security Invariants

| Invariant | Status | Evidence |
|---|---|---|
| **Identity**: one request has one authoritative effective user identity | HOLDS | `AUTH_MATRIX.md` — every mode produces exactly one `request.user`, sourced from the token when present, from the synthetic bypass identity only otherwise. |
| **Ownership**: user A cannot read/mutate user B's protected resources | HOLDS | `AUTH_TWO_USER_AUTHORIZATION.md` — cross-access on sites and inspections denied (404) in both directions, including under `DEV_AUTH_BYPASS=true`. |
| **Token**: a valid token is never silently replaced by an unrelated user identity | HOLDS (fixed) | Pre-fix: proven false (`prefix_demo.js` reproduction). Post-fix: `AUTH_MATRIX.md` mode D — real UUID/email preserved end-to-end into a created resource's `ownerUserId`. |
| **Bypass**: development bypass cannot become a production authorization shortcut | HOLDS | `JwtGuard`'s own `NODE_ENV !== 'production'` check plus `validateProductionEnvironment()` boot-time hard-fail (`AUTH_ENVIRONMENT_SAFETY.md`) — two independent layers. |
| **Entitlement**: feature entitlement and object ownership remain separate concepts | HOLDS | `AUTH_MATRIX.md` mode E — `DEV_FORCE_PRO` escalates the synthetic identity's billing fields only; a real user's entitlement and identity are both unaffected by the flag when a token is present. |
| **Production**: development environment flags cannot weaken production behavior when disabled | HOLDS | `.env.example` defaults all three flags to `false`; `validateProductionEnvironment()` additionally forbids them outright under `NODE_ENV=production` regardless of their value. |

No invariant required a design change beyond the guard's precedence fix and the synthetic identity's uuid-shape fix; both are contained to `backend/src/auth/guards/jwt.guard.ts`.
