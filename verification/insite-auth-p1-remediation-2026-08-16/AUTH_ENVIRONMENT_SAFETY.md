# AUTH-P1 — Environment Safety

## Defaults

`backend/.env.example`: `DEV_AUTH_BYPASS=false`, `DEV_FORCE_PRO=false`, `DEV_FORCE_EXPERT=false`. The repo's actual local `backend/.env` (not committed) sets `DEV_AUTH_BYPASS=true` for local development convenience — a deliberate developer choice, not a shipped default.

## Production guardrail (pre-existing, verified in place — not part of this phase's fix)

`backend/src/config/validate-production-environment.ts:28-33`:

```ts
if (process.env.DEV_AUTH_BYPASS === 'true' ||
    process.env.DEV_FORCE_EXPERT === 'true' ||
    process.env.DEV_FORCE_PRO === 'true' ||
    process.env.DEV_EXPOSE_RESET_TOKEN === 'true') {
  throw new Error('Development authentication and entitlement overrides are forbidden in production.');
}
```

Invoked unconditionally at boot, before the Nest application starts listening: `backend/src/main.ts:11` (`validateProductionEnvironment();`), guarded internally by `if (process.env.NODE_ENV !== 'production') return;` so it is a no-op outside production. Confirmed present and wired by direct source read; not modified this phase (no change was needed — this guardrail already fully satisfies "development flags cannot plausibly be enabled accidentally in production without safeguards").

## Defense-in-depth

`JwtGuard` itself independently re-checks `process.env.NODE_ENV !== 'production'` before ever consulting `DEV_AUTH_BYPASS` (unchanged by this phase's fix, only reordered relative to the token check). Two independent layers (boot-time hard-fail, and per-request re-check) must both be bypassed for a production deployment to ever reach bypass logic — judged adequate; no new guardrail was added, consistent with "do not make development unnecessarily difficult."

## Secrets

No secret values were printed to any verification artifact or log in this phase. The JWT secret used for local disposable-DB testing was the repository's own documented local-dev placeholder (`dev-only-secret-change-me`, present in `.env.example`/`jwt-secret.util.ts`'s fallback), not a real credential.
