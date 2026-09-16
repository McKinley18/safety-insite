# §304 — SE-6 invitation relationship, and what measuring production changed

## The headline: §303 got SE-6's cause wrong, and §304 measured it

§303 registered SE-6 as *"`GET /auth/verify-invite/:token` returns 500 in production for every
token — team invitation is a non-functional feature."*

§304's first act was to confirm that independently, as the section required. **It is false.**

```
production  GET /auth/verify-invite/<unknown token>
            -> 404 {"message":"Invalid or expired invitation token"}
```

Production's `invitation."organizationId"` is **already `uuid`**, already carries a foreign key to
`organization(id)`, and the relation join executes. §303 observed the 500 on a **disposable**
database and generalised it to production without probing production.

### Why the two disagree

Production's `invitation` table was created by TypeORM **`synchronize`**, before migrations were
baselined over the existing schema, and synchronize inferred `uuid` correctly from the `@ManyToOne`.
The constraint names are the fingerprint:

| | names its constraints |
|---|---|
| production | `PK_beb994737756c0f18a1c1f8669c`, `FK_5c00d7d515395f91bd1fee19f32` — TypeORM-generated |
| `1779000000000` migration | `PK_invitation_id`, `UQ_invitation_token` — hand-written |

## The defect is real, and it is not cosmetic

`1779000000000-CreateAuthWorkspaceTables` declares the column `character varying` against a `uuid`
primary key. So **every database built from migration history** gets the broken shape and
`operator does not exist: uuid = character varying` on every invitation verification.

That is every disposable verification database — meaning every integration suite in this repository
has been running against a schema production does not have — and it would be any environment ever
rebuilt by replaying migrations: a new region, a fresh staging, a restore that replays history
rather than loading a dump.

### How wide the drift goes — `SE-12`

Measured by building a database from the full migration history and diffing it against live
production, column by column (`03-PRODUCTION-VS-MIGRATION-SCHEMA-DIFF.json`):

| | |
|---|---|
| column type divergences | **36** |
| tables only in production | **21** |
| columns only in production | 19 |
| columns only from migrations | 6 |

Exactly **two** of the 36 are the uuid-vs-varchar class: `invitation."organizationId"` (repaired
here) and `user."organizationId"` (latent — nothing currently loads the user→organization relation).
The rest are length bounds, timestamp with/without time zone, one enum, one integer, one text and one
jsonb-vs-array. Registered as **SE-12** and not repaired: it needs a reconciliation programme and a
gate, not a migration.

## The repair

`1800000024000-AlignInvitationOrganizationRelation` — written to converge on one shape from **either**
starting point, so it is a **no-op against production** and the actual repair everywhere else.

- converts `organizationId` to `uuid`, with an explicit `USING` expression **guarded by a pre-count**
  of unparseable and orphaned rows. The guard names a *count* and never a value, so no token, email
  or organization name can reach a log. Production has **0 invitation rows**, so it cannot fire there.
- binds it to `organization(id)` **`ON DELETE RESTRICT`**
- indexes `organizationId` — `getInvitations` filters on it and a foreign key does not index the
  referencing side
- makes `token` unique

The entity now declares `type: 'uuid'`, an explicit `@JoinColumn` and `onDelete: 'RESTRICT'`, so the
contract cannot drift back silently the next time someone writes a migration for this table.

### Why `RESTRICT`, decided rather than inherited

An invitation is a **membership-granting credential**. If an organization could be deleted out from
under its outstanding invitations they would either dangle — pointing at an id that could later be
reissued — or, under `CASCADE`, vanish along with the evidence they were ever issued. Neither is
acceptable for a credential.

`RESTRICT` is not invented: it is what `organization_memberships`, `site`, `inspection` and
`corrective_actions` already use against `organization("id")`. Production's existing FK had no
explicit action (SQL default `NO ACTION`), which prohibits the same deletion but defers the check;
stating `RESTRICT` matches its siblings. `ON UPDATE` stays `NO ACTION` — an organization's primary key
is a generated uuid and is never mutated.

### What `down` restores, and what it deliberately does not

It drops the FK and the token index. It does **not** convert the column back to `character varying` —
that would restore the defect, onto a shape production has never had, which is not a rollback. Per
the rollback model, a wrong migration is fixed forward, and where schema must genuinely go back the
recorded backup is the reliable path.

## Backup, and proving it is real

`pg_dump` 18.3 against the **direct** Neon endpoint: 7 924 351 bytes, sha256
`1b1a5f078f54e71a339fc324f58bacabc7540e9809347572bc5d5498d9bc875f`.

Restored into **PostgreSQL 17.11** — the exact production major.minor, via container, because the
local Homebrew server is 16.13 and rejects a 17 dump feature. **0 restore errors.**

Verified by **per-table content checksum**, not row counts, with ordering pinned `COLLATE "C"`
(the §289 trap: Neon runs `C.UTF-8`, a stock container runs `en_US.utf8`, and ordering by text
reports a difference on identical data):

**78 / 78 tables content-identical, 7 228 rows, aggregate digest `d6baf25ddfe4c0f908187f16032c24cf`
on both sides.**

## Upgrade-path proof — on a production-shaped database

That verified restore *is* the fixture. Only the pending §304 migration was applied to it:

| | before | after |
|---|---|---|
| tables | 78 | **78** |
| rows | 7 228 | **7 229** |
| migrations | 55 | **56** (head `AlignInvitationOrganizationRelation1800000024000`) |

- **Tables with changed content: `migrations` only.** The +1 row is the migration's own record. No
  business row was read, written or deleted.
- **Column changes: none.** The column was already `uuid`, so the conversion branch correctly skipped
  — which is precisely the no-op behaviour the migration was written for.
- Constraints: TypeORM's unnamed-action FK replaced by `FK_invitation_organization … ON DELETE RESTRICT`.
- Indexes: `uq_invitation_token` added.

## Clean replay

The durable gate runs inside `with-disposable-db`, which builds an empty database, applies **all**
migrations from the beginning to the new head, boots the real application and drives it over HTTP.
No `synchronize` anywhere. That path is exercised on every `hazlenz:precommit`.

## The gate was watched to fail

`npm run test:304-invitation-relationship`, wired into `hazlenz:integration:inner` → `hazlenz:precommit`.

| | passed | failed |
|---|---|---|
| `01-PRE-REPAIR-MEASUREMENT.txt` (run at `05f22445` in a detached worktree) | 23 | **14** |
| after the repair | **37** | 0 |

The pre-repair log contains the literal `operator does not exist: uuid = character varying`.

## What §304 proved about the lifecycle — and what it could not

Proved, through the real product routes on a migration-built database:

- the relation join executes; a **valid token verifies (200) and the organization relation loads**
- an unknown token fails closed **404**, disclosing no driver, SQL or column-type detail
- a **used** invitation is indistinguishable from an unknown one — same 404, same message
- two tenants, two tokens, each resolving only to its own organization; B's response carries nothing
  of A's
- tokens are opaque, ≥128-bit, hex, distinct, and not derived from the organization or invitee
- the database **refuses** a duplicate token and **refuses** an invitation naming a non-existent
  organization; `RESTRICT` **refuses** deleting an organization with invitations outstanding
- SE-5 preserved (`verify-invite/:token` still accepts a non-UUID token and answers 404; a malformed
  UUID-backed identifier is still 400 and not 500) and EN-3 preserved (membership fabricates no
  subscription and invents no grant)

**Not proved, because the feature is not built.** §304 measured five independent reasons, any one of
which alone prevents the lifecycle, and on the product owner's decision registered all five rather
than building anything:

| | |
|---|---|
| **SE-7** | No route creates an organization. `OrganizationsService.create()` has no caller and no controller. An organization can only be *joined*, via an invitation, which can only be created from inside one. The bootstrap is circular. |
| **SE-8** | An owner of a `company`-plan organization is refused **402 `teamMembers`**. Entitlement resolves from the *account*; the organization's plan never reaches it. |
| **SE-9** | `OrganizationRole` is `{member, manager, organization_admin}`; the invite routes require `{ORG_OWNER, Owner, Admin, SAFETY_DIRECTOR}`. The intersection is **empty**, and the session role is `membership.role` whenever a membership exists. Two vocabularies, nothing holding them together — the HZ-5 shape. |
| **SE-10** | `RegisterDto` never declares `inviteToken`, and the global pipe runs `forbidNonWhitelisted`. Live production: `{"message":["property inviteToken should not exist"],"statusCode":400}`. **This, not SE-6, is why team invitation does not work in production.** There is also no frontend — nothing under `frontend-next` references `inviteToken` or `verify-invite`. |
| **SE-11** | Invitations **never expire**. No column, no bound, no check — only the refusal message claims one. |

§303's *conclusion* — that team invitation is non-functional — was right. Its stated *cause* was
wrong, and so was its scope: the failure is not in production's schema, and it is not one defect.

SE-6 is therefore recorded **`PARTIALLY_CLOSED`**: schema half closed and proven, workflow half
blocked on product decisions that are not engineering's to make.
