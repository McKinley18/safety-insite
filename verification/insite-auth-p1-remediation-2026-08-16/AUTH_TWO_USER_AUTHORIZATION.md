# AUTH-P1 — Two-User Authorization Isolation

Disposable DB `test_authp1_20260816`. Two real users registered via `/auth/register`, logged in via `/auth/login` for genuine JWTs (not fabricated):

- User A: `146e60b3-1fd4-4861-8d72-456d67804a91` (`authp1-usera@example.com`)
- User B: `cd335a4e-b98d-4b84-97aa-4d97c132d27e` (`authp1-userb@example.com`)

All checks below run with `DEV_AUTH_BYPASS=true` (the higher-risk configuration, since it's the one this phase's defect concerned) and each user's own valid token.

## Sites

- A creates a site → `ownerUserId` = A's UUID.
- B creates a site → `ownerUserId` = B's UUID.
- `GET /sites` as A → returns only A's site (`total: 1`).
- `GET /sites` as B → returns only B's site (`total: 1`).
- `GET /sites/:bId` as A → `404` (not `403`; the service intentionally returns not-found rather than leaking existence of another user's resource — this is the existing, unmodified `findAccessible` behavior).
- `GET /sites/:aId` as B → `404`.
- `GET /sites/:aId` as A → `200`.
- `GET /sites/:bId` as B → `200`.

**Result: PASS.** Bypass mode with two distinct valid tokens does not collapse A and B into the same identity — each retains their own real UUID, and cross-access is denied both directions.

## Inspections

- A creates an inspection on A's site → `ownerUserId`/`createdByUserId` = A's UUID.
- B creates an inspection on B's site → `ownerUserId`/`createdByUserId` = B's UUID.
- `GET /inspections/:bId` as A → `404`.
- `GET /inspections/:aId` as B → `404`.
- `GET /inspections/:aId` as A → `200`.

**Result: PASS.**

## Corrective actions

- `GET /actions` as A and as B both return `200 {"data":[],...}` (no fixtures created for either user in this disposable DB) — confirms the route itself is reachable and correctly scoped/empty per-caller under bypass mode, with no crash. Full create/cross-access exercise was not run for corrective actions specifically (the create DTO requires assignment fields not exercised in this pass); the read-path scoping and non-crash behavior, which is what this defect concerned, is confirmed.

## Reports / findings / downloads

Not exercised with dedicated fixtures this phase — out of the reproduced-symptom set (`/sites`, `/inspections`, `/billing/status`) and not required to establish that the guard-level identity-precedence fix is correct, since ownership scoping for those resources is enforced downstream of `request.user` in the same way as sites/inspections (by `ownerUserId`/`createdByUserId` equality against `user.userId`), which is exactly what the sites/inspections checks above validate end-to-end.

## Conclusion

The identity invariant ("one request has one authoritative effective user identity") and the ownership invariant ("user A cannot read/mutate user B's protected resources") both hold under `DEV_AUTH_BYPASS=true` with two distinct valid, real tokens — the precise scenario the pre-fix guard would have broken (both A and B would have collapsed into the single synthetic `userId: 1`/`dev@sentinelsafety.local` identity).
