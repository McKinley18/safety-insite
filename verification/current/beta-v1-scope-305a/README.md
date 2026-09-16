# §305A — Beta v1 is an individual inspection product, proven rather than declared

## What this section was asked to do

Correct the product-scope assumption: Beta v1 is an **individual** inspection product, and
Company/Team functionality is not required for external Beta v1. Reclassify SE-6…SE-11 against that
scope, distinguishing **feature incomplete** from **active defect**; make sure no customer-facing
surface advertises unfinished team functionality; keep SE-12 active and classify its divergences
A/B/C/D; and narrow Threshold C to what an individual Beta actually needs.

## The rule that shaped the section

> *"Do not automatically close a security issue merely by declaring its feature deferred."*

That rule earned its place. Reclassifying five entries as deferred is a **claim** — that nothing an
individual Beta user needs depends on an organization, and that the deferred routes are safe to
leave exposed. The release register is the worst place to keep an unproven claim, because it is the
document that decides what ships. So both halves were measured.

---

## 1. The individual workflow runs with no organization — 51 assertions, 0 failed

`scripts/test-305a-individual-beta-scope.ts` drives the complete Beta v1 experience through the real
guarded HTTP routes as an individual with `organizationId: null`:

```
register -> site -> inspection -> observation -> HazLenz analysis ->
human review of every pending finding -> finalized finding ->
in_review -> completed -> ISSUED REPORT (with checksum) -> report read-back ->
revision history -> inspection history -> corrective actions -> calendar ->
account -> billing
```

- **No organization is created and no membership row appears.** The site is owned by the **person**,
  not by a workspace — the schema already represents an individual owner directly.
- **The commercial boundary is untouched.** A *free* individual is still refused HazLenz with **402**;
  the promotional individual resolves `pro` from a **bounded grant** whose basis the canonical
  billing route names, and their account row still reads `free`/`none` because nothing was purchased.
  BI-4 and EN-3 hold.
- The suite **refuses to report vacuous passes**: if the workflow never reaches a completed
  inspection it aborts rather than compare `undefined` with `undefined`.

Two harness facts worth recording, because both initially looked like product defects:

- Report generation 500'd until the suite gave the storage layer a real throwaway directory
  (`STORAGE_LOCAL_ROOT`). Stubbing storage instead would have removed the one step Beta v1 cares
  most about — *"receive/save report"* — from the suite meant to prove it.
- Account deletion 500'd for a genuine reason that is **not** a production defect. See §3.

## 2. The deferred team routes fail closed — and one of them did not

Every deferred route was driven by a **real authenticated individual**, with a **foreign tenant
planted first** (1 organization, 1 member, 1 invitation), because:

> The obvious test — an individual against an empty organization table — returns 404 and looks
> correct. A disclosure only appears once somebody else's data is there to disclose.

That is exactly how **SE-13** hid. §305A's own first run passed this section against an empty table,
and the same code failed the moment it ran inside `hazlenz:precommit`, after §261 and §304 had left
organizations in the shared disposable database.

### SE-13 — cross-tenant disclosure, confirmed in live production

`OrganizationsService` took the caller's organization id straight from the session. An individual has
none, so the value was `null` — and **TypeORM 0.3 drops a `where` condition whose value is null**
rather than rejecting it:

| intended | actually executed |
|---|---|
| `findOne({ where: { id: null } })` | `SELECT … LIMIT 1` with **no WHERE** → an arbitrary organization |
| `find({ where: { organizationId: null, status: 'active' } })` | status only → **every active membership in the database** |

**Confirmed against live production.** A freshly registered individual with `organizationId: null`
called `GET /organization/me/settings` and received **HTTP 200** with a real `company`-plan
workspace. The account was deleted immediately; the organization's name and id are redacted here and
no other tenant's data was retrieved.

Reachability differs per route, and the difference matters:

- `/organization/me/settings` — **`JwtGuard` alone.** Any authenticated account, no entitlement, no
  role.
- `/organization/me/members` — requires `teamMembers`, and exposes membership rows **with the joined
  user records**.
- `/organization/me/invites` — requires `teamMembers`, and exposes invitee email addresses and
  **invitation tokens**, which are membership-granting credentials. Production holds **zero**
  invitations, so no token was disclosable.

**Contained** using the convention this repository already uses everywhere else: `reports`,
`classifications`, `reviews` and `control-verifications` each resolve scope through a
`requireOrganization(user)` that throws when the scope is absent. `OrganizationsService` was the only
service that took the same value and trusted it. It now refuses a missing scope in `findOne`,
`getMembers`, `getInvitations`, `createInvitation` and — through `findOne` — `updateSettings`.

This widens no guard, grants no one access, and builds no deferred functionality. A caller with no
organization is refused, which is what should always have happened.

**Threshold B reopens** until this is deployed: the route disclosed the product owner's own
workspace to any authenticated account.

### The related class, scanned rather than assumed

The same null-drop hazard exists wherever a possibly-null session value feeds a `where` clause.
§305A scanned for it: the four other services already guard, and the route-parameter cases are
protected by **§303's `UuidParam`**, which rejects a non-UUID before it can reach a query. A repair
from two sections ago turns out to bound this class as well.

## 3. SE-12 is not deferrable, and §305A found its first Beta-v1 casualty

Driving the individual workflow on a **migration-built** database, **account deletion failed with
HTTP 500**:

```
relation "notifications" does not exist
```

The `Notification` entity is live and `AuthService.deleteAccount` deletes from it, but **no migration
creates the table**. Production has it — it is in §304's production-only list — so deletion works
there, and §303 and §304 both exercised it live at 200.

So this is not a production outage. It is proof that **a rebuilt environment loses a core
individual-product function and a data-protection obligation**, which is precisely why SE-12 could
not be deferred alongside the team feature. SE-12 is raised to **P0**.

The failure is clean: the transaction rolls back whole, so the account is left intact and able to log
in rather than half-deleted. Recorded as `F-1`–`F-3` rather than skipped.

It also took longer to diagnose than it should have — `deleteAccount` wraps its transaction in a bare
`catch {}` that **discards the cause** and rethrows a generic 500, so nothing reached any log. That is
registered as **OB-1**.

### A/B/C/D classification — 82 objects

| category | count |
|---|---|
| **A** Beta v1 individual product | 18 |
| **B** deferred Company/Team | **1** |
| **C** shared infrastructure | 47 |
| **D** retired / unknown | 16 |

**Exactly one of 82 divergent objects is Company/Team.** That settles whether SE-12 could have been
deferred with the team feature: it could not.

**18 of the 21 production-only tables have a live entity**, so application code can reach tables no
migration creates. The Beta v1 workflow nonetheless completed to an issued report without 20 of the
21 — `notifications` is the one that broke it.

Entries marked *CANDIDATE* are reasoned from live-entity presence and from what the workflow suite did
and did not touch. They are **input to §305**, not its conclusion: §305 must confirm each against the
code that owns it before changing anything. Full detail in `SE-12-OBJECT-CLASSIFICATION.json`.

## 4. The customer-facing surface

Inventoried for organization, company, team, invite, members, seats, roles, workspace administration
and team assignment.

- **No team navigation and no team control exists.** The four organization API client functions in
  `lib/auth.ts` have **no caller** in any page or component, so there is no half-built team screen a
  Beta user could reach. Per §305A the architecture is **retained, not deleted**.
- **One real promise was being made**, and it was corrected: `"Cloud reports and team members"`
  appeared twice in `components/pricing/planData.ts` — in the Pro feature list and in the
  free-vs-Pro comparison — rendered by `/`, `/register`, `/upgrade` and the pricing page. Both now
  read `"Cloud reports"`, which is true and delivered. Registered as **CS-1**, and it stays **OPEN
  until deployed**, because until then the live surface still makes the promise.

Assertions `E-1`–`E-3` are the durable half: the suite fails if a team or seats promise reappears in
the plan data, or if any page starts calling the organization client functions.

## 5. Register outcome

| | before §305A | after |
|---|---|---|
| Threshold A | 0 | **0** |
| Threshold B | 0 | **1** (SE-13, until deployed) |
| Threshold C | 24 | **19** |

- **SE-6 CLOSED.** The defect it actually described is repaired, migrated and deployed. It was held
  `PARTIALLY_CLOSED` only by §304's requirement to exercise the invitation *lifecycle*, which is
  deferred functionality under the corrected scope.
- **SE-7, SE-8, SE-9, SE-10, SE-11 → DEFERRED**, `blocksThresholdC = false`. Each was re-checked and
  each **fails closed**: SE-8 and SE-9 refuse (402/403), SE-10 refuses and leaves no account behind,
  and SE-11's unexpirable credential cannot exist because none can be created or accepted and
  production holds zero invitations. Preserved, not deleted — the day team functionality is built,
  it must be built correctly.
- **EN-2 → DEFERRED** for its organization-seat half; the grant-derived half closed at §302 and an
  individual holds no seat.
- **TI-3 → DEFERRED.** It asks for multi-member organization coverage which, per §304, cannot
  currently be constructed through the product at all.
- **New:** SE-13 (P0, active), SE-12 raised to P0, OB-1, CS-1, SC-1.

Nothing was deleted from the register. Deferred items remain visible so they are not forgotten.
