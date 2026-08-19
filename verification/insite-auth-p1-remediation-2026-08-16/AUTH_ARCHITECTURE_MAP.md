# AUTH-P1 — Architecture Map

## Request entry → identity → authorization → service

1. **Transport**: every protected route is decorated `@UseGuards(JwtGuard, ...)` (confirmed by repo-wide grep: ~50 controllers). A second, unrelated Passport-based guard (`JwtAuthGuard` / `JwtStrategy`, `backend/src/auth/jwt-auth.guard.ts` + `jwt.strategy.ts`) exists only for `GET /auth/me` in `auth.controller.ts` — it re-validates against the `users`/`organization_membership` tables on every call and is not affected by `DEV_AUTH_BYPASS` at all (no bypass branch exists in `JwtStrategy.validate`). It was left untouched — out of scope, not implicated in the defect.
2. **`JwtGuard`** (`backend/src/auth/guards/jwt.guard.ts`) — the actual fix location. Post-fix: token presence/validity is checked first (independent of bypass state); bypass only supplies a synthetic identity when no token was presented at all, and only outside production.
3. **`EntitlementGuard`** (`backend/src/auth/entitlements/entitlement.guard.ts`) — runs after `JwtGuard` on routes decorated `@RequireEntitlement(...)`. Reads `request.user` (now always either a real decoded JWT or the structurally-valid synthetic identity), resolves tier from the JWT payload first, then falls back to `EntitlementService.hasFeature` (DB grant lookup, uuid-guarded since the prior P1 fix). Unaffected by this phase's change except that it now always receives a uuid-shaped `userId`.
4. **`RolesGuard`** (`backend/src/auth/guards/roles.guard.ts`) — role-based access on top of the same `request.user`, unaffected.
5. **Service-layer ownership checks** — `SitesService`, `InspectionService`, etc. compare `entity.ownerUserId`/`createdByUserId` directly against `request.user.userId` (a Postgres `uuid` column in both `Site` and `Inspection` entities). This is where the second defect (non-uuid synthetic `userId`) would have surfaced as a raw 500 independent of any `EntitlementGuard` involvement — confirmed live for `/sites` and `/inspections` (see `AUTH_MATRIX.md`, mode C).
6. **Billing** (`billing.service.ts`) — `UserSubscription.userId` is `varchar`-typed (per the in-progress `AlterUserSubscriptionUserIdToVarchar`/`AlignUserSubscriptionUserId` migration work already present in the tree), so `/billing/status` would not have crashed on syntax even with the old numeric `userId: 1` — its pre-fix failure mode (per the polish-phase discovery) was specifically the identity-collapse case (mode D: a real user's status query silently running as the synthetic user), not a uuid-syntax crash.

## Frontend

`frontend-next/lib/safescope.ts:getSafeScopeAuthHeaders()` always attaches a real `Authorization: Bearer <token>` header when one exists in `localStorage`, and independently/unconditionally attaches `x-dev-organization-id` outside production. It never chooses between the two — it sends both, and (post-fix) the backend now correctly prioritizes the real token whenever present. No contradictory bypass logic was found in the frontend; no frontend change was required.

## Environment-safety layer (pre-existing, verified in place)

`backend/src/config/validate-production-environment.ts`, invoked at boot (`main.ts:11`), throws and prevents startup if `DEV_AUTH_BYPASS`/`DEV_FORCE_PRO`/`DEV_FORCE_EXPERT` are `true` under `NODE_ENV=production` — independent, boot-time defense-in-depth on top of `JwtGuard`'s own `NODE_ENV !== 'production'` check.
