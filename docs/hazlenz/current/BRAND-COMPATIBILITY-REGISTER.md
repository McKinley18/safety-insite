# Brand compatibility register — §272

Canonical names: **Safety InSite** (product), **HazLenz** (analysis engine). No other product or
engine brand is live.

This register exists because §272 deliberately did *not* rename everything. Each entry below is a
legacy identifier that survives on purpose, with the reason, whether a customer can see it, whether
it can be migrated before beta, and a recommendation. Enforcement of the parts that *were*
normalised is `npm run brand:audit` (backend), which fails on any retired brand reaching a
customer-visible surface and ratchets the internal count downward.

## 1. Retained: physical database objects

| identifier | why it still exists | customer-visible | safely migratable before beta | recommendation |
|---|---|---|---|---|
| `safescope_knowledge_chunks` | applied migration `1780000000000` and successors created it; it holds governed knowledge rows | no | only via a table-rename migration against production data | **keep.** The TypeORM classes were renamed to `HazLenzKnowledge*` and pin the old table name explicitly in `@Entity()`, so the code reads correctly and the storage is untouched |
| `safescope_knowledge_documents` | same | no | same | **keep**, same mechanism |
| `safescope_knowledge_sources` | same | no | same | **keep**, same mechanism |
| `safescope_knowledge_ingestion_runs` | same | no | same | **keep**, same mechanism |
| `safescope_knowledge_retrieval_logs` | same | no | same | **keep**, same mechanism |
| `safescope_reasoning_snapshots` | created by `1790000000000-CreateSafeScopeReasoningSnapshots` | no | same | **keep** |
| `safescope_supervisor_validations` | created by `1790000001000` | no | same | **keep** |
| migration class names (`CreateSafeScopeFeedback`, …) | already applied; TypeORM keys the `migrations` table on the recorded name, so renaming re-runs or orphans them | no | **no** — renaming an applied migration is a data-integrity hazard | **never rename.** These are historical records, not current naming |

## 2. Retained: persisted values and live contracts

| identifier | why it still exists | customer-visible | safely migratable before beta | recommendation |
|---|---|---|---|---|
| `safeScopeResult` | a field inside persisted `finding` JSON, read by corrective actions, site memory and workspace learning. 567 frontend references and a backend type | no — it is never rendered | needs a data migration over stored findings plus a coordinated frontend change | **migrate in a dedicated section**, not as part of a brand sweep. It is the single largest remaining item |
| `fullSafeScope` | the entitlement discriminator in `@RequireEntitlement` on eight controllers and in `plan-entitlements.ts` | no | it is an authorization token; renaming it touches the access-control path | **migrate only with an authorization test pass.** A silent mismatch here fails *open* or *closed* on billing-gated routes, so it is not cosmetic |
| `sentinel_safescope_brain_bundle_v1`, `…_meta_v1` | `localStorage` keys holding the cached offline knowledge bundle | no | renaming orphans every existing installed client's cached bundle | **keep**, or rename with a one-time read-old/write-new migration in `offlineBrainStorage.ts` |
| `auditally_personal_calendar_events` | `localStorage` key holding user-authored calendar entries | no | renaming silently discards user data | **keep** unless paired with a read-old/write-new migration |
| `/safescope-v2/*`, `/safescope/*`, `/safescope-knowledge/*` | live API route namespaces, ~70 call sites across both tiers | no | yes, mechanically — but it is a live contract change | **see the open decision below** |
| `reviewcore/knowledge-queue`, `legacy/pdf`, `legacy/reports` | internal/admin routes with **zero** frontend consumers | no | yes, cheaply | **migrate**; these are the cheapest route wins and nothing outside the backend calls them |

## 3. Retained: the protected-module boundary — an exception, recorded

`backend/src/safescope-v2/` is the HazLenz engine living under a retired brand. It is the largest
single source of legacy naming (2 639 of the 2 669 internal references the audit still counts) and
§272 did **not** rename it. The reason is mechanical, not stylistic:

- Nine of the twenty-nine protected modules resolve under `src/safescope-v2/…`, and
  `PROTECTED-IDENTITIES.json` records those paths.
- Two of them — `anthropic-expert-provider.ts` and `expert-request-envelope.ts` — **name the
  directory in a comment**. Both are also digested into the frozen §259 candidate identity
  (`0b12adf6…`). Renaming the directory forces those comments to change; changing them changes the
  file bytes; changing the bytes changes the digest; changing the digest breaks §259.
- `verify-262-candidate-identity.ts` and `test:expert-nocall-harness` resolve engine files by
  hardcoded `src/safescope-v2/…` paths.

So the rename is not blocked by effort. It is blocked by the rule that a protected module is never
edited opportunistically. Moving it is a product-owner decision with its own re-freeze, not a
formatting pass.

## 4. Open decision for the product owner

Two items were scoped, costed and deliberately left undone:

1. **Rename `backend/src/safescope-v2/` → `backend/src/hazlenz/`.** Requires editing two protected,
   §259-digested modules (comment lines only), updating `PROTECTED-IDENTITIES.json` module paths,
   updating the identity verifier's hardcoded paths, and re-freezing §259 under a successor
   identity. Behaviour-preserving; identity-changing.
2. **Migrate the `/safescope*` route namespaces.** ~70 call sites (45 backend, 26 frontend). No
   database impact and no external consumers, since public beta has not begun. Cheap, but it is a
   live API contract change and belongs in its own section with its own route tests.

Both are recommended. Neither is safe to fold into a professionalization sweep.
