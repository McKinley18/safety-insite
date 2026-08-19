# AUTH-P1 — Root Cause

## Defect

`backend/src/auth/guards/jwt.guard.ts` (`JwtGuard.canActivate`), pre-fix:

```ts
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();

  if (
    process.env.DEV_AUTH_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production'
  ) {
    // ... unconditionally builds and assigns a synthetic request.user, then `return true`
  }

  const authHeader = request.headers.authorization;
  // ... only reached when the bypass branch above did NOT return first
}
```

The bypass branch is checked **first**, based only on `DEV_AUTH_BYPASS`/`NODE_ENV`, and returns before the method ever inspects `request.headers.authorization`. A real, valid `Authorization: Bearer <jwt>` header sent by an actually-logged-in developer is never read, never verified, and is silently discarded in favor of a hardcoded synthetic identity.

## Classification

**BYPASS_PRECEDENCE** — the guard's control flow makes bypass mode take precedence over presented credentials, when the correct contract is the reverse: presented credentials must be evaluated first, and bypass may only fill the gap when none were presented at all.

A second, related defect was found and fixed in the same location: **INVALID_SYNTHETIC_IDENTITY**. The synthetic bypass identity's `userId` field was the JS number literal `1`. `sites.ownerUserId`, `inspections.ownerUserId`, and other ownership columns queried directly against `request.user.userId` are Postgres `uuid`-typed. Live reproduction (see `AUTH_LIVE_REPRODUCTION.md`) confirmed that `GET /sites` and `GET /inspections` — not just the previously-patched entitlement/classify path — would independently 500 with `invalid input syntax for type uuid: "1"` under bypass mode even with **no token supplied at all** (mode C), because the synthetic identity itself was never a valid uuid. This is the same defect class the prior P1 phase found and partially patched at one call site (`entitlement.service.ts:20`); this phase fixes it at its source (the guard that manufactures the identity) rather than requiring every downstream consumer to add its own defensive uuid-format check.

## Downstream workaround status

The prior P1 fix in `backend/src/auth/entitlements/entitlement.service.ts:20` (`if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return false;`) remains in place, unmodified, per the task's explicit instruction to preserve it as defense-in-depth. It is no longer load-bearing for the specific `userId: 1` case (the guard now never emits a non-uuid `userId`), but it still correctly protects against any other malformed identity that might reach `EntitlementService.hasFeature` in the future, so it was left untouched.

`safescope-v2.controller.ts`'s `getLocalDevBypassUserId()` / the `localDevAuthBypassEnabled` branch in `getGovernanceContext()` were inspected and left untouched: this fallback only fires when `request.user` is absent or maps to the `viewer` role, which does not occur when `JwtGuard` has populated the bypass identity (role `Auditor` → `compliance_admin`, never `viewer`). It is pre-existing, already-effectively-unreachable defensive code in a different controller, not part of this defect, and touching it would be an unrelated, unnecessary change.

## First incorrect auth decision

The first incorrect decision in the request lifecycle is `JwtGuard.canActivate` choosing to evaluate `DEV_AUTH_BYPASS` before it has looked at whether the request carries any credential at all. Every downstream consequence (identity collapse, and — for the no-token case — the uuid-typed query crash) follows from that one ordering choice plus the synthetic identity's non-uuid shape.
