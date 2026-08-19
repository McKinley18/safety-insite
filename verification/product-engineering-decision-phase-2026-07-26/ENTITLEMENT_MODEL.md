# Entitlement model

## Decision

Backend-managed feature entitlements are resolved from subscription state plus explicit grants. Pilot and test access use explicit records, never frontend flags or request bypasses.

## Tiers

| Capability | Free | Pro | Pilot | Test |
|---|---:|---:|---:|---:|
| Authentication/site persistence | yes, 1 active site | yes | yes | fixture |
| Inspection persistence | 3 completed/month | unlimited | unlimited during grant | fixture |
| Manual observations/findings | yes | yes | yes | yes |
| Full HazLenz analysis | no | yes | yes, supervised | fixture |
| Report generation/history/export | no | yes | yes | fixture |
| Corrective actions/calendar | yes | yes | yes | fixture |
| Offline draft recovery | yes | yes | yes | yes |
| Offline server synchronization | deferred | deferred | deferred | tested only when built |
| Advanced standards detail | no | yes | yes | fixture |

Basic authenticated release testing uses a Pilot or Test grant, so entitlement does not block the workflow while enforcement remains real.

## Records and resolution

`Subscription` reflects Stripe/customer state. `EntitlementGrant` has user ID, feature or plan bundle, source (`subscription`, `pilot`, `test`, `support`), starts/ends, status, issuer, reason, and audit timestamps. Effective access requires active user, active grant/subscription, current time within bounds, and matching user.

Pilot grants are assigned by platform administration through an audited command/admin endpoint, have mandatory expiration, and do not create Stripe state. Test grants require `NODE_ENV=test`, an allowlisted disposable database name, no production host, and explicit fixture command; otherwise startup fails.

## Context and alternatives

Plan fields on `User`, frontend plan selection, promo secrets, and query bypasses were rejected as competing authority. Stripe-only access was rejected because controlled pilots need time-bounded noncommercial grants.

## Impacts

Backend guards use one resolver; frontend renders capabilities but never authorizes. Migrate legacy plan/subscription fields into the canonical subscription/grant model, preserving raw provider identifiers for review.

## Testing, risks, deferred work

Test free quotas, pilot/pro access, expired/revoked grants, provider status, cross-user isolation, cache invalidation, and production fixture refusal. Exact commercial pricing, provider products, and grandfathering are external business decisions.
