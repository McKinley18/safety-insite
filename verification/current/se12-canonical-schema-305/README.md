# §305 — SE-12: one canonical schema contract, and what the sweep found

## What SE-12 was, as a consequence rather than a statistic

Production's schema was created by TypeORM `synchronize`; migrations were baselined over it later.
The migration history has therefore never described production. §305A proved that is not academic:
on a database built from migrations, `DELETE /auth/me` failed with
`relation "notifications" does not exist`. **Account deletion — a core individual function and a
data-protection obligation — was lost in any environment rebuilt by replaying history.**

## The canonical contract

`backend/src/database/canonical-schema.manifest.json` — **68 tables**, digest
`3a51b1a21294f40649a57ab0f0857fb2816e5e695a7cabe35c05043b9185bf60`.

Generated **from a fresh migration replay**, deliberately. The manifest is then by construction a
statement about the migration history — the thing SE-12 says nobody could trust — and production is
compared against it as a separate, falsifiable claim.

| scope | tables |
|---|---|
| `ACTIVE_INDIVIDUAL_BETA` | 18 |
| `SHARED_INFRASTRUCTURE` | 46 |
| `DEFERRED_COMPANY_TEAM` | 3 |
| `RETIRED_COMPATIBILITY` | 1 |

One shared extractor (`src/database/canonical-schema.ts`) serves the manifest, both proofs and the
gate — so all four mean the same thing by "the schema". It compares types (with length and
precision), nullability, primary keys, foreign keys **with their actions**, unique constraints and
indexes; it normalizes away **generated constraint and index names**, because production's
`PK_beb994737756c0f18a1c1f8669c` and a migration's `PK_invitation_id` are the same key. Comparing
names would report drift on every synchronize-era object and drown the real differences — which is
precisely the failure mode that let SE-12 survive.

## The convergence migration

`1800000025000` converges from **either side**: a no-op where production already holds canonical
state, the repair everywhere else. Its statements were **generated** from a normalized production
extract rather than written from memory, which is why they are verbose and boring — a transcription,
not a design. Three deliberate exceptions:

- **`user.password` / `user.legacy_id`** — production-only, declared by no entity, read by nothing.
  Preserved in production (§305 forbids dropping production data) and **not** replicated. A canonical
  contract should describe intent, not history.
- **`notifications`** — given a real contract rather than a copy. §305 says not to "merely create an
  empty table matching its name", and production's is a bare table with a primary key and nothing
  else. Canonically: `userId` **uuid**, foreign key to `user(id)` **ON DELETE CASCADE**, index on
  `("userId", "createdAt")` — exactly the shape of `findMine`. `tenantId` stays `varchar NOT NULL`
  because an individual has no organization and is written under the synthetic `user:<id>` tenant;
  typing it as uuid would make notifications impossible for the very users Beta v1 is for.
  *CASCADE here and RESTRICT for invitations at §304 is not inconsistency: a notification is derived
  per-user data with no audit standing, an invitation is a credential whose disappearance destroys
  evidence.*
- **`safescope_knowledge_ingestion_runs.warnings`** — the one column where **production is the stale
  side**. Entity and migrations say `text[]`; production holds `jsonb`. Converged by
  add-populate-swap rather than a cast: `translate(x::text,'[]','{}')::text[]` would round-trip most
  values and silently corrupt any string containing a brace or a comma.

Risky conversions are guarded the §304 way — count first, name a **quantity** and never a value,
raise before mutating if the truth cannot be established.

## Three-way proof, machine-compared

| | result |
|---|---|
| empty database → all migrations → manifest | **0 material differences**, digest reproducible across independent replays |
| restored current production → pending convergence → manifest | **0 material differences** |
| entity contract vs the converged schema | checked; residual contradictions registered as `SC-2` |

`"Application boots"` was never accepted as evidence.

## Backup and restore

`pg_dump` 18.3 against the direct Neon endpoint: **7 926 023 bytes**, sha256
`202eaba63b48dc31c2743734baebcb74e764fba1c8f77e6a2e819b7b2bef87af`, taken immediately before
convergence. Restored into **PostgreSQL 17.11** — the exact production major.minor — with **0
errors**, 78 tables, 56 migrations, 7 244 rows. An earlier backup in the same session was verified by
**per-table content checksum** with ordering pinned `COLLATE "C"`: **78/78 tables content-identical**,
aggregate `a63fc57102779eaac35f27b02bbffd69` on both sides.

## The gate, watched to fail

`npm run check:canonical-schema`, wired into `hazlenz:precommit`. Against the **pre-§305 migration
history** it reports **68 material differences**, including the missing `notifications` table that
broke account deletion (`01-WATCHED-TO-FAIL-PRE-305.txt`). After §305: **0**.

## SE-14 — what the SE-13 generalization sweep found

§305A established that TypeORM drops a `where` predicate whose value is null. §305 swept the 39
scope predicates built from possibly-null authority values. Most were already guarded — `reports`,
`classifications`, `reviews` and `control-verifications` resolve scope through
`requireOrganization`; `inspection.assign` refuses before querying; corrective-actions wraps its
membership lookup in an explicit check; and route-parameter lookups are bounded by **§303's
`UuidParam`**, which rejects a non-UUID before it can reach a query.

Two were not. `NotificationsService` and `AuditController` each decoded the JWT as
`{ sub, tenantId, role }`. **This product signs neither `sub` nor `tenantId`** — it signs `userId`
and `organizationId`. Both were `undefined` on every request:

```
findMine          ->  find({ where: {}, take: 50 })    the 50 most recent notifications of ALL users
markRead          ->  findOne({ where: { id } })       any notification readable AND mutable by id
getAuditByTenant  ->  find({ where: {}, take: 100 })   the 100 most recent audit rows of EVERY tenant
```

`/audit` is **mounted** — 401, not 404; `AuditModule` is imported transitively by classifications,
corrective-actions, reviews and taxonomy.

**Neither was exploitable today, and neither was protected.** The notifications table is empty in
production — a coincidence maintained by a second bug, which stops holding the moment a corrective
action creates a notification. The audit route requires `['owner','admin'].includes(auth.role)`, and
the signed role is an `OrganizationRole` or `individual` — none of which match. That is the **SE-9**
vocabulary mismatch. Repair SE-9 and the audit route begins disclosing every tenant's audit trail the
same day. A safety property that depends on a table staying empty, or on a role check no role
satisfies, is not a safety property.

Contained by reading the claims the product actually signs, **failing closed** without an identity,
and deriving the tenant exactly as `CorrectiveActionsService` derives it when it *writes* these rows.
The audit route's role check is left exactly as strict as it was — widening it would be building
deferred Company/Team authorization, which §305 forbids.

## The non-vacuous isolation gate

§305 requires isolation proven against a **real resource owned by someone else**, and that
requirement is the whole lesson of SE-13: a test with nothing to leak passes for the wrong reason.
So user B is given a real notification **first**, and user B's ability to see it is asserted **before**
user A's inability:

```
D2-1  user B sees their own notification          200, present
D2-2  user A cannot read it                       200, absent
D2-3  user A cannot mark it read                  401
D2-4  and it is genuinely untouched               read=false
D2-5  /audit discloses no other tenant's rows     401
D2-6  user B can still delete their account       200
D2-7  the ON DELETE CASCADE removed it            0 rows
```

## OB-1 — closed

`deleteAccount`'s bare `catch {}` discarded the cause, so a failed deletion produced no signal
anywhere; §305 hit that wall diagnosing SE-12 and had to instrument the method by hand. It now emits
`auth.account_deletion_failed` carrying the failure **kind** only — no message, no identifier, no SQL
— the same discipline `report.generation_failed` already follows. The client contract is unchanged.

Proven against a **real induced fault**: the suite renames the `notifications` relation away, drives
a real deletion, and asserts the 500 discloses nothing, exactly one event reaches the operator with
`failureKind: QueryFailedError`, and the account survives intact rather than half-removed.

## Live post-convergence

Production migrated to `1800000025000` (57/57) and deployed at `dc9782e0`; `GET /health` read back
five consecutive times; `aheadOfBuild: []`. Order was **migrate then deploy**, with the intermediate
state measured — the serving build reported READY with `aheadOfBuild: ["1800000025000"]`, the
supported code-rollback shape.

Against the live product: production matches the canonical manifest with **0 material differences**;
`notifications.userId` is `uuid` with `FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE
CASCADE`; SE-13 still 401; SE-5 still 400; verify-invite still a bounded 404; registration still
resolves `free`/`none` (EN-3); site create/read 201/200; inspection create 201; **account deletion
200**. `serverErrorsInWindow` 0 throughout, monitoring `CONFIGURED`, no alert.

### What the production verification does not cover

`/notifications` and `/audit` could not be exercised in production: both sit behind paid
entitlements (`cloudReports`, `auditTrail`), no promotional code is configured in the production
environment, and creating a paid account would mean a commercial charge. They are verified by the
suite above — two real users, a real resource owned by B — running the identical deployed code, and
they are unreachable in production today without a paid subscription.

## Closure limits, stated plainly

- Production retains `RETIRED_COMPATIBILITY` tables and the two tolerated legacy columns, so its raw
  digest is **not** equal to the manifest digest. The **material** comparison over enforced scope is
  0 differences. Both numbers are recorded rather than the flattering one.
- `SC-2` remains open: six `standards_master` columns the entity declares and **no** database has,
  and timestamp-vs-timestamptz mismatches. Both exist identically in production *and* in a fresh
  replay, so neither affects rebuild equivalence — which is what SE-12 is about.
