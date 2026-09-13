# Security and authority

The organising rule is that **the server decides and the client displays**. Every authority question
— who you are, which workspace you are in, what your plan entitles, whether an analysis may be
asserted — is answered server-side and re-checked there. The client is never trusted to have
answered it already.

## Boot refuses a misconfigured production

`validateProductionEnvironment()` is the first statement in `bootstrap()`, before the Nest
application is constructed, and it throws rather than warning. A production instance that is
misconfigured does not start. It refuses on, among others:

- `DEV_AUTH_BYPASS`, `DEV_FORCE_PRO` or `DEV_EXPOSE_RESET_TOKEN` set to `true`
- `TYPEORM_SYNCHRONIZE=true`
- a `JWT_SECRET` shorter than 32 characters or drawn from the known development values
- `FRONTEND_URL` or `PASSWORD_RESET_FRONTEND_URL` that are not HTTPS
- `STORAGE_PROVIDER` other than `s3`, or an absent bucket
- `EXPERT_EXECUTION_ENABLED` that is absent or not exactly `"true"` / `"false"`
- `CORS_ORIGINS` that is empty or contains a non-exact origin
- `TRUST_PROXY_HOPS` outside 0–2

The Expert clause is deliberately strict about absence. A kill switch whose wiring an operator has
to discover mid-incident is not a kill switch, so "nobody set it" and "somebody decided it" must not
produce the same running system.

## Authentication

JWT with refresh tokens (`refresh_tokens`, `token-validity.service.ts`), delivered in httpOnly
cookies. `JwtGuard` protects authenticated routes; `OptionalJwtGuard` covers routes that behave
differently when signed in. Password reset requires a configured delivery provider in production —
the token is never exposed in a response, and the development escape hatch that would do so is one
of the flags boot refuses.

## Tenancy

Every workspace-scoped read and write is constrained by organization membership rather than by an
identifier supplied by the client. Cross-user and cross-organization isolation is covered by
dedicated suites (`test:cross-user-isolation`, `test:canonical-authorization`).

## Entitlements

`EntitlementGuard` with `@RequireEntitlement(...)` gates capability by plan; grants are persisted in
`entitlement_grants`, with `platform_support_grants` for operator access. Entitlement codes are
authorization tokens, not labels — the legacy `fullSafeScope` code is retained deliberately, because
renaming a live authorization discriminator can fail open or closed on billing-gated routes. That is
recorded in the [brand compatibility register](../current/BRAND-COMPATIBILITY-REGISTER.md).

Other guards in force: `RolesGuard`, `SubscriptionGuard`, `ApprovedKnowledgeRegistryWriteGuard`
(writes to the approved knowledge registry), `ReviewCoreKnowledgeReviewQueueGuard` (the knowledge
review queue), `LegacyCorpusGuard`.

## Expert settlement authority

Provider output is a **proposal**. Deterministic code decides admissibility; an unconfirmed analysis
cannot present itself as an asserted finding; and a refusal is never rendered as an available
analysis. Property authority and evidence authority are separate modules and must stay separate.

A downstream authority gate applies to actions that assert on the basis of an operational
conclusion — never to actions that reject the proposal. Rejecting is always allowed.

## Fail-closed rules

- `/health/ready` fails closed when required migrations are absent, so an un-migrated instance never
  becomes ready rather than serving broken reads. A schema *ahead* of the build is ready: that is a
  deliberate code rollback, not a fault.
- Object storage refuses unsigned reads and listing.
- The maintenance seed route — which would run `ALTER TABLE` and `synchronize(false)` against
  production, bypassing `TYPEORM_SYNCHRONIZE=false` — is gated by `ENABLE_MAINTENANCE_SEED`, which
  is `false` in production, making the route unreachable.
- Uploads are validated before storage (`test:upload-security`).
- Auto-deploy is off on both platforms, so no code reaches production without a deliberate act.
