# §304 — production migration, deployment and live proof

## Order, and why it was that order

**Migrate first, deploy second.** The schema-readiness check derives its expectation from the
migration files shipped in the artifact, so:

- migrate first → production has 56, the serving build expects 55 → `aheadOfBuild: ["1800000024000"]`,
  which is an explicitly supported READY state (it is the normal shape of a code rollback);
- deploy first would have left the new build expecting 56 against 55 → **NOT READY**, and Render's
  health check would have restarted the instance.

Measured, not assumed — the serving build was read back between the two steps:

```
status: ready   dependencies: {database: available, schema: current}
schema: {expectedSchemaVersion: 1800000023000, expectedCount: 55, appliedCount: 55,
         aheadOfBuild: ["1800000024000"]}
GET /auth/verify-invite/<random>  ->  404      (old build, new schema, no disruption)
```

## 1. Backup, taken immediately before the migration

`pg_dump` 18.3 against the **direct** Neon endpoint (not the pooler):

| | |
|---|---|
| bytes | 7 924 351 |
| sha256 | `1b1a5f078f54e71a339fc324f58bacabc7540e9809347572bc5d5498d9bc875f` |
| duration | 6.4 s |

**Verified, not merely taken.** Restored into PostgreSQL **17.11** — the exact production
major.minor, in a container, because the local Homebrew server is 16.13 and rejects a 17 dump
feature. **0 restore errors.** Compared by per-table *content* checksum with ordering pinned
`COLLATE "C"`: **78 / 78 tables content-identical, 7 228 rows, aggregate digest
`d6baf25ddfe4c0f908187f16032c24cf` on both sides.**

That verified restore was then reused as the upgrade-path fixture — see `05-UPGRADE-PATH-PROOF.json`.

## 2. The migration

```
DRY RUN: migrations are PENDING and would be applied by this command.

applied  1800000024000  AlignInvitationOrganizationRelation1800000024000
1 migration(s) applied.
schema verification  READY
  expected schema version  1800000024000
  applied / expected       56/56
RELEASE MIGRATION OK
```

Production read back directly afterwards:

```
migrations: 56  head: AlignInvitationOrganizationRelation1800000024000
invitation."organizationId": uuid
constraints: FK_invitation_organization = FOREIGN KEY ("organizationId")
                                          REFERENCES organization(id) ON DELETE RESTRICT
             PK_beb994737756c0f18a1c1f8669c = PRIMARY KEY (id)
indexes:     PK_beb994737756c0f18a1c1f8669c, idx_invitation_organization_id, uq_invitation_token
relation join: EXECUTES
tables: 78          invitation rows: 0    organizations: 8    memberships: 8
```

Exactly what the upgrade-path proof predicted on the restored copy: the column was already `uuid` so
the conversion branch skipped, the TypeORM-named FK was replaced by the explicit `RESTRICT` one, and
`uq_invitation_token` was added. **78 tables before and after. No business row touched.**

## 3. Deployment

`c28dd43c1c54453029848a03422489073ffc2277` on both halves — Render `dep-dakub8tg1s2s73djek60`,
Vercel `dpl_6xqLaM26BQax1oNaM5S1uZRZ2w2E` (production target). `GET /health` read back **five
consecutive times**, and the schema expectation now matches the build exactly:

```
schema: {expectedSchemaVersion: 1800000024000, expectedCount: 56, appliedCount: 56, aheadOfBuild: []}
```

## 4. Live behaviour

```
404  /auth/verify-invite/<random 16-byte token>    x3, identical bounded refusal
404  /auth/verify-invite/not-a-uuid                SE-5 preserved — the token is not a UUID
                                                   and is deliberately not treated as one
404  /auth/verify-invite/<500 characters>
401  /files/not-a-uuid   unauthenticated           the guard still answers before the pipe
```

Authenticated, through a bounded synthetic `.invalid` account created and removed via the product:

```
400  /files/not-a-uuid            "The identifier in the request path is not valid."
400  /sites/not-a-uuid
400  /inspections/not-a-uuid
400  /inspection-reports/not-a-uuid
404  /files/<valid absent uuid>   "File not found."
402  /organization/me/invites     PAID_SUBSCRIPTION_REQUIRED / teamMembers   <- SE-8, unchanged
```

**SE-10 confirmed unchanged in production**, as the product owner directed:

```
400  POST /auth/register with inviteToken
     {"message":["property inviteToken should not exist"],"error":"Bad Request","statusCode":400}
```

## 5. Monitoring

`monitoring.serverErrorsInWindow` read **0 before, 0 after the probes, and 0 at the end**, with
`lastDelivery: null` throughout. **No `service.error_rate_exceeded` alert, and 0 unexpected 5xx.**

## 6. Cleanup

Through the product path: `DELETE /auth/me` → 200, and the same credentials then failed login with
401. Credentials were written to disk **before** the account was created (§301's OPS-2 lesson). The
production connection string retrieved for the read-only characterization and the migration was
deleted from disk afterwards.

**0 commercial charges. 0 platform-admin operations. 0 Expert executions. 0 provider calls. $0.**
The only direct database write was the authorised migration itself; every behavioural probe went
through supported product HTTP paths.

## What this does NOT prove

The invitation **lifecycle** was not exercised in production, and could not be: no organization can
be created (SE-7), no owner can reach the creation route (SE-8, SE-9), and no invitation can be
accepted (SE-10). Those are registered, not repaired, on the product owner's decision. What is
proven here is that the relationship the lifecycle depends on is now correct in production *and* in
the migration history, and that nothing else moved.
