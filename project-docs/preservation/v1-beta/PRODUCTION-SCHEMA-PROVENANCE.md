# Production schema provenance — where production differs from migration replay

**Established at §291.** This document exists because the build-and-restore guide would otherwise
imply something untrue: that replaying the migration lineage reproduces the production schema.

**It does not.** Production has **77 tables**. A clean database built by applying all 55 migrations
to an empty PostgreSQL 17 instance has **56**. Twenty-one tables exist in production that no
migration creates.

> This is not a defect register. Most of these tables are harmless and empty. It is a *provenance*
> register, and it exists so that nobody reasons from "no migration creates X" to "X does not
> exist" — which is precisely the mistake that produced `DB-4`.

---

## How the divergence was measured

Not by inspection, and not by assumption:

```bash
docker run -d --name insite-clean -e POSTGRES_PASSWORD=… -e POSTGRES_DB=clean -p 55434:5432 postgres:17
DATABASE_URL=postgresql://…/clean node scripts/release/migrate.js      # all 55 migrations, empty DB
# then diff the two table lists
comm -23 <production tables> <clean-rebuild tables>
```

Repeat that whenever the question comes up again. It takes about a minute and it replaces an
argument with a list.

---

## The single cause

**TypeORM `synchronize`.** Every one of the twenty-one is derived from a live `@Entity` class, and
the column sets match those classes exactly — including defaults. `outcomes`, for instance, matches
`src/outcomes/outcome.entity.ts` column for column, right down to `uuid_generate_v4()`,
`'UNVERIFIED'`, `false`, `'0'`, `'1'` and a `timestamp without time zone` for `@CreateDateColumn`.
A hand-written migration does not produce that signature; `synchronize` does.

`TYPEORM_SYNCHRONIZE` is **`false`** in production now, and the application refuses to start with it
enabled there — so nothing is creating tables this way any more. **The tables it already created
remain**, and turning the switch off did not remove them.

---

## The register

All twenty-one are entity-derived. Only three hold any data.

| table | production rows | provenance |
|---|---|---|
| `classification_feedback` | 0 | entity-derived |
| `classification_rule_versions` | 0 | entity-derived |
| `classification_rules` | 0 | entity-derived |
| `control_verifications` | 0 | entity-derived |
| `corrective_action_templates` | 31 | entity-derived |
| `decision_governance_logs` | 0 | entity-derived |
| `finding` | 0 | entity-derived |
| `hazard_categories` | 0 | entity-derived |
| `hazard_standard_mappings` | 0 | entity-derived |
| `hazard_taxonomy` | 0 | entity-derived |
| `notifications` | 0 | entity-derived |
| `outcomes` | 0 | entity-derived |
| `recommendation_feedback` | 0 | entity-derived |
| `regulatory_profile` | 0 | entity-derived |
| `report` | 0 | entity-derived |
| `report_attachments` | 0 | entity-derived |
| `report_language_templates` | 0 | entity-derived |
| `safescope_audit_records` | 0 | entity-derived |
| `standard_match_feedback` | 0 | entity-derived |
| `standards` | 31 | entity-derived |
| `users` | 1 | entity-derived |

### The three that are not empty

| table | rows | what it is |
|---|---|---|
| `corrective_action_templates` | 31 | Seeded reference data for the standards library. Read by the product. |
| `standards` | 31 | A legacy standards table. The current corpus lives in `standards_master` (2 390 rows), which **is** in the lineage. |
| `users` | 1 | Orphaned. The canonical user table is `user` (45 rows, in the lineage). Nothing writes `users`. |

---

## `outcomes` — the classification §291 was asked to make

Not by assumption. Against the four options:

| | |
|---|---|
| Legacy required data structure? | **No.** It matches the current entity exactly and holds no data. |
| Dead legacy residue? | **No.** `OutcomesModule` is wired into `AppModule` and `OutcomeService.recordOutcome` runs on **every corrective-action closure**. |
| **Active feature dependency?** | **YES.** This is what it is. |
| Candidate for governed migration adoption or removal? | **Yes — and that is a product-owner decision, not taken here.** |

### The decision that is owed, stated precisely

Three options, and none of them is urgent now that `DB-4` is repaired:

1. **Adopt it into the lineage.** A `CREATE TABLE IF NOT EXISTS` migration is a no-op against
   production and makes a clean rebuild match. This makes the schema honest and is the recommended
   option.
2. **Remove it**, if the outcome-intelligence loop is not a v1 capability. It has no data, so
   removal costs nothing today and costs everything once it has some.
3. **Leave it**, and keep this register as the explanation.

§291 deliberately did **not** create a migration for it. The repair `DB-4` needed was scope, not
schema, and §291 is explicit: *do not create a migration merely to recreate an existing production
table.*

---

## The rule this register exists to enforce

> **"No migration creates it" does not mean "it does not exist."**

`DB-4` was recorded as contained on exactly that inference. Every clause of the reasoning was true
and the conclusion was false, and the cost was a cross-tenant query that nothing was stopping. If
you find yourself about to write "this cannot happen because no migration creates the table",
re-run the diff above first.
