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
| ~~`/safescope-v2/*`, `/safescope/*`, `/safescope-knowledge/*`~~ | **MIGRATED at §274.** Now `/hazlenz/*` and `/hazlenz-knowledge/*`; `/safescope/analyze` and `/safescope/feedback` were deleted with the dead v1 module. Zero active SafeScope routes remain | — | done | — |
| `reviewcore/knowledge-queue`, `legacy/pdf`, `legacy/reports` | internal/admin routes with **zero** frontend consumers | no | yes, cheaply | **migrate**; these are the cheapest route wins and nothing outside the backend calls them |

## 3. Resolved at §274 — the engine directory moved

`backend/src/safescope-v2/` is now **`backend/src/hazlenz/`**. §272 recorded this as blocked because
nine of the twenty-nine protected modules resolve under that path and two of them name it in a
comment while also being digested into the frozen §259 identity, so the directory could not move
without changing an acceptance artifact. §274 carried it out under explicit product-owner
authorisation to change the candidate identity for naming and path changes only.

What that cost, stated precisely:

- **20 of 29 protected modules changed bytes**, 37 lines in total. Every one is an import specifier
  or a doc comment naming the old directory. Zero lines are unexplained by
  `safescope-v2` → `hazlenz`, and every module kept its line count.
- **2 of the 22 §259 elements moved** — `adapter` and `envelope` — one comment line each.
- The contract version, transmitted system prompt, wire schema and contract identities are
  **byte-identical** to §259, so prompts, schema, admission, verifier, settlement and driver-role
  behaviour are unchanged as a checked fact rather than an assurance.
- Identity: `0b12adf6…` → **`8c163b31…`**. The §259 artifact is preserved unchanged as provenance;
  `PROTECTED-IDENTITIES.json` (the §229 snapshot) is likewise untouched, and successor manifests
  live under `verification/current/`.

`npm run verify:274-successor-identity` re-proves all of the above and fails on any delta that is
not the authorised rename.

## 4. Also removed at §274

- **The v1 SafeScope engine** (`backend/src/safescope/`, 42 files) — a dead subsystem that exported
  nothing, was imported only by `app.module.ts`, and whose `/safescope/analyze` and
  `/safescope/feedback` routes had zero consumers anywhere in the repository.
- **ReviewCore**, classified as a retired brand rather than an architectural concept. The evidence
  was decisive: the display sanitiser rewrites `ReviewCore` to "HazLenz AI" and the field-output
  smoke test asserts it must never reach a customer. You do not sanitise an architectural concept
  out of customer output. Its classes are now `Knowledge*` and its route is
  `/hazlenz-knowledge/review-queue`; its two physical tables keep their `reviewcore_` names.
- **`safescope-source-intelligence/`** → `hazlenz-source-intelligence/`.
- Outbound `User-Agent` headers that identified this service to OSHA/MSHA/NIOSH as
  `SentinelSafetySafeScope/0.1` now say `SafetyInSiteHazLenz/0.1`.

## 5. Still retained, and why

| identifier | reason | customer-visible |
|---|---|---|
| `safescope_*` tables (9), `reviewcore_*` tables (2) | created by applied migrations; renaming needs a data migration | no |
| `CreateSafeScope*` migration class names | TypeORM keys the `migrations` table on the recorded name. §274 renamed two of these by accident and the emitted-JavaScript comparison caught it before commit; they are restored | no |
| `safeScopeResult` | field inside persisted `finding` JSON | no — never rendered |
| `fullSafeScope` | live authorization entitlement on eight controllers | no |
| `sentinel_safescope_*`, `auditally_*` | browser storage keys; renaming orphans user data | no |
| `safescope-data/` corpus and its filenames | four of its files are digested members of frozen manifests. §274 renamed these references, the integration suite caught the resulting ENOENT, and they were restored | no |
| `safescope_native`, `safescope_understanding_engine`, … | engine-id **string values** mapped to `hazlenz_*` by the display sanitiser at the boundary | no |
| `backend/scripts/*safescope*` (220 files) | section-numbered validation instruments that are digested members of frozen manifests | no |
| the sanitiser rule table, the field-output smoke list, the brand audit's own list | these three exist **in order to** suppress retired brands and must name them | no |

## 6. Refactor rule — carried forward from the retired `docs/refactor/naming-policy.md`

That document was a second, competing statement of the same policy and was deleted in §273. Its one
rule not already stated above is preserved here verbatim in substance:

> Do not perform a broad find-and-replace across the whole repository unless imports, routes,
> storage keys, report fields and API contracts are each covered — either by a rename that follows
> the file, or by an explicit decision to leave the identifier alone.

§272 followed exactly that: contract-bearing tokens were substituted out before the rename pass and
restored afterwards, which is why the table above exists rather than a list of regressions.

**§274 did not follow it perfectly, and the record should say so.** Three things slipped through the
protection list and were caught by verification rather than by care:

1. Two applied migration class names were renamed. TypeORM keys the `migrations` table on the
   recorded name, so this would have made applied migrations look un-run against production. The
   emitted-JavaScript comparison caught it.
2. References into the `safescope-data/` corpus were renamed while the corpus itself stayed, which
   broke the taxonomy loader with an ENOENT. The integration suite caught it.
3. A historical document filename reference was renamed while the historical document kept its
   name. The documentation link check caught it.

All three are repaired and each had a verification gate standing behind it. The lesson is the rule
above, restated with teeth: on a rename of this size, enumerate the protected tokens **before** the
first pass and re-run every gate after, because the protection list is the part that is easy to get
wrong and the gates are the only thing that notices.
