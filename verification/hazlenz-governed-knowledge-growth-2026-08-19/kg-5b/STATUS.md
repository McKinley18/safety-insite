# KG-5B — Production-safe governed release construction + operator activation/rollback

**Date:** 2026-08-21 · **Start HEAD:** `5f050858227ca11cf90d2f6bf64148e70a018b64` · **End HEAD:** unchanged
**Branch:** `release/insite-rc-2026-08-18` · **Nothing committed, pushed, merged, deployed or activated.**
**Verdict:** `KG_5B_COMPLETE — READY_FOR_EXPLICIT_PRODUCTION_RELEASE_OPERATIONS`

Production was not touched at all — not read, not written, not migrated. Every measurement below was
taken on disposable `test_kg5b_*` databases created by this task.

---

## 1 — The two blockers, and what closed them

### `KG5A-DISC-01` — release construction mutated and depended on the whole live corpus

**Root cause, established from the code rather than from the symptom.** There was no such thing as a
governed *candidate record*. The only representation of a governed standard was a row in
`standards_master` — the same table serving 2,390 legacy customer-facing rows on the LEGACY
retrieval path. So the only way to build a release was to write the governed records *into the live
customer corpus* and then snapshot the entire table (`finalize-regulatory-release.ts` selects
`FROM standards_master` with no `WHERE` clause). Every measured harm — five rewritten live rows, a
renamed citation, a unique-index collision, a corpus left at 2,396 rows with a duplicate pair — is a
consequence of that one architectural fact.

**What replaced it:**

```
version-controlled governed source set   governed-source-set.ts        zero DB access
  -> explicit release membership         release-definition.ts + definitions/*.json
    -> session-scoped governed staging   TEMP table, ON COMMIT DROP, one transaction
      -> immutable release records       regulatory_release_records
        -> deterministic manifest        release-manifest.ts           UNCHANGED
          -> reviewer decisions          release-record-review.service UNCHANGED
            -> finalization gates        regulatory-release-lifecycle  UNCHANGED (+ CAS)
              -> operator activation     scripts/regulatory-release.ts NEW
```

This is the task's **Option C** — governed source records **plus** an explicit membership manifest —
with one refinement: **the governed staging table is TEMPORARY**. Four properties follow, and a
persisted staging table would have cost something to obtain each of them:

1. **No seventh migration.** Phase 21 requires `97941ca2` to still start against the migrated
   schema; every table KG-5B does not add is one fewer thing that can break that.
2. **It cannot drift.** Staging is materialized from the version-controlled sources microseconds
   before it is read, so "staging is stale" is not a reachable state.
3. **It cannot leak.** `ON COMMIT DROP` gives most of Phase 5's atomicity for free.
4. **It orders and types exactly like `standards_master`.** This is the load-bearing one. The
   manifest folds rows in `ORDER BY agency_code, citation` under the database's own collation, and
   `pg` maps column types to JS values (`integer` → number, `simple-array` text → comma-joined
   string, `date` → `Date`). Reproducing `14a34fea…` from an in-memory array would mean
   reimplementing ICU collation and pg's type mapping and hoping they agree. Staging in the same
   database makes the reproduction **structural**.

The persisted, inspectable artifact a staging table would have provided already exists and is
better: a **provisional** release with its records written — a real lifecycle state, reviewable
through the existing `review:release-record` command, impossible to mistake for a finalized release.

### `KG5A-DISC-03` — no operator CLI for activation or rollback

`npm run release` — subcommands `status`, `sources`, `prepare`, `activate`, `rollback`. See §5.

---

## 2 — Files changed

**New (10):**

| Path | What it is |
|---|---|
| `backend/src/standards/releases/governed-source-set.ts` | the authoritative governed candidate set, derived from version-controlled sources with **zero database access** |
| `backend/src/standards/releases/release-definition.ts` | explicit release membership: types, loader, validation |
| `backend/src/standards/releases/definitions/federal-core-2026-07-30.1.json` | the 35-member definition, with pinned manifest and per-record checksums |
| `backend/src/standards/releases/governed-release-builder.ts` | the construction engine: membership → staging → manifest → immutable records, one transaction |
| `backend/src/standards/seed/standards-intelligence-projection.ts` | the ONE definition of the source→row projection, extracted verbatim from the sync script |
| `backend/src/standards/seed/legacy-corpus-guard.ts` | makes the old unsafe pipeline refuse before its first write |
| `backend/src/safescope-v2/standards/safescope-standards.data.ts` | the curated 8 standards as importable DATA (byte-identical to the array the seed declared inline) |
| `backend/scripts/regulatory-release.ts` | the operator CLI (`KG5A-DISC-03`) |
| `backend/scripts/test-kg5b-release-construction.ts` | 102 checks |
| `backend/scripts/test-kg5b-operator-cli.ts` · `test-kg5b-approval-continuity.ts` · `rehearse-kg5b-operator-sequence.ts` | 65 + 29 checks, 58 rehearsal assertions |

**Modified (6):**

| Path | Change |
|---|---|
| `backend/src/safescope-v2/standards/safescope-standards.seed.ts` | imports the extracted data; carries the corpus guard |
| `backend/src/standards/seed/sync-standards-intelligence-to-master.ts` | imports the extracted projection; carries the corpus guard |
| `backend/src/standards/seed/finalize-regulatory-release.ts` | carries the corpus guard |
| `backend/src/standards/releases/regulatory-release-lifecycle.service.ts` | **additive** compare-and-swap precondition (§6) |
| `backend/scripts/test-kg4d-default-off.ts` | new `OPERATOR CMD` category in the mutating-suite inventory (§8) |
| `backend/package.json` | 5 script entries. **No dependency change.** |

---

## 3 — The legacy corpus non-mutation contract (Phase 4)

Measured on a production-shaped disposable database holding the reconciled **2,390-row** corpus with
`source_key` NULL on every row, before and after a real (non-dry-run) `prepare`:

| Property | Result |
|---|---|
| legacy row count | **2390 → 2390** |
| whole-corpus per-row digest | **unchanged** |
| citations | **unchanged** — no rename |
| titles | **unchanged** |
| `standard_text` | **unchanged** |
| source metadata | **unchanged** |
| rows with `source_key` | **0 → 0** |
| rows with `release_id` | **0 → 0** |
| rows with `normalized_record_checksum` | **0 → 0** |
| rows with `transformation_version` | **0 → 0** |
| duplicate `(agency_code, citation)` pairs created | **0** |
| legacy corpus rows READ during construction | **0** |
| staging table surviving the transaction | **0** |

The contract is **enforced, not documented**: every statement governed construction issues passes
through `assertNoLegacyCorpusWrites()`, which throws on any `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE`/
`ALTER`/`DROP` naming `standards_master`. Verified in both directions — the guard rejects each
mutation shape and permits a `SELECT`.

**And the old pipeline can no longer reach production either.** `legacy-corpus-guard.ts` refuses
`seed:safescope-standards` before its first write on any corpus holding regulations the governed
source set does not name. Against a production-shaped clone: **exit 1, 2,390 rows untouched, 0 with
`source_key`.**

> The guard was first wired only into the sync and the finalizer — stages two and three — and that
> was measurably not enough. It fired correctly at stage two, by which point stage one had already
> inserted five rows and rewritten `title` and `standardText` on `1910.219`, `1910.146` and
> `1910.36`: three of the five live rows KG-5A recorded as damaged, with the corpus at 2,395. **A
> guard placed after the first mutation is not a guard.** It now sits at stage one.

The guard has exactly one exemption: a database carrying a **KG-4C ownership marker**. That marker
is written *into* the database by a suite that claimed it, and claiming requires a `test_*` name,
absence from `PROTECTED_DATABASE_NAMES`, and `KG_TEST_DB_INITIALIZE_OWNERSHIP` naming it exactly —
so production can never carry one. This composes the two guards rather than weakening either. It is
needed: `test:governed-corpus-matrix` installs a deliberate fixture row (`99 CFR 9999.1(a)`) to
prove placeholder provenance never confers backing, and refusing that would be one guard disabling
a test that protects a different invariant.

---

## 4 — Reproduction: clean vs production-shaped (Phases 8, 9)

**Both corpora produce a byte-identical release.**

| | empty corpus | 2,390-row production-shaped corpus |
|---|---|---|
| manifest | `14a34fea…c2ece5b` | `14a34fea…c2ece5b` |
| records | 35 | 35 |
| placeholder-provenance records | 0 | 0 |
| review state | 35 `mechanically_validated`, 0 approved | identical |
| every per-record checksum | — | **identical** |
| every approval digest | — | **identical** |
| legacy corpus rows read | 0 | 0 |

**The manifest KG-5A measured is reproduced exactly: `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`.**
The architecture changed; the manifest projection did not. `release-manifest.ts` is untouched, the
column list and ordering are untouched, and the 35 record checksums pinned in the release definition
were reproduced rather than asserted — a mismatch on any one of them refuses the whole construction.

**Membership is independent of the corpus.** With an unrelated row inserted, five unrelated rows
deleted and the physical row order randomised, the manifest and the membership are unchanged.

---

## 5 — The operator CLI (`KG5A-DISC-03`, Phases 14, 15, 17, 18)

```
npm run release -- status   [--release-id <id>]
npm run release -- sources
npm run release -- prepare  --release-id <id> [--dry-run]
npm run release -- activate --release-id <id> --expected-manifest <sha256>
                            --expected-current <id|none> --actor <name> [--reason <t>] [--dry-run]
npm run release -- rollback --release-id <id> --expected-current <id>
                            --actor <name> [--reason <t>] [--dry-run]
```

**The safety model: state what you believe, and be refused if you are wrong.**

### Activation refusal matrix — every row measured through the real CLI

| Input | Outcome |
|---|---|
| unknown release id | exit 2 · `UNKNOWN_RELEASE` |
| **prefix** of a real release id (`federal-core`) | exit 2 · `UNKNOWN_RELEASE` — no prefix matching |
| wrong `--expected-manifest` | exit 2 · `MANIFEST_MISMATCH` |
| stale `--expected-current` | exit 2 · `STALE_EXPECTED_CURRENT` |
| no record approved | exit 2 · gate `governedRecordsPresent` |
| missing `--release-id` / `--expected-manifest` / `--expected-current` / `--actor` | exit 2 · `USAGE` |
| a flag given no value, swallowing the next flag | exit 2 · `USAGE` |
| no subcommand · unknown subcommand · `--latest` | exit 2 |
| a release with no version-controlled definition (`prepare`) | exit 2 · `RELEASE_DEFINITION_INVALID` |

**No refusal moved the pointer.** There is no `activate --latest`, no fuzzy lookup, no automatic
release creation, and no `publish` that bundles prepare/approve/finalize/activate.

### Rollback

`R1 active → activate R2 → rollback explicitly to R1`: the pointer returned to R1; **R2 was
retained**, marked `rolled_back`, kept its manifest, and its 20 records were byte-identical before
and after. Refusals measured: stale `--expected-current`, and rolling back to the release that is
already active.

### Dry run — zero writes, proven by digest

`activate --dry-run` and `rollback --dry-run` report target release, target manifest, current
pointer, all eight gates, `wouldSucceed` and the refusal reason. A digest over release rows, records,
reviews and the lifecycle-event count is **identical before and after**, and **no lifecycle event is
emitted** — a rehearsal must never appear in the audit log as a pointer move.

---

## 6 — Concurrency (Phase 16) — and a real defect found here

**The defect.** The CLI's first design read the active pointer, compared it against
`--expected-current`, and only then called `activate()`/`rollbackTo()`. Two operators acting on the
same stale reading both passed that comparison, both serialized correctly on the advisory lock, and
**both committed** — so the second silently moved the pointer off the release the first had just
activated. Every individual transaction was atomic and the end state still had exactly one active
release; the system was nonetheless **last-writer-wins**, which is what Phase 16 forbids.

**A precondition checked outside the lock is not a precondition.** `PointerMoveOptions
.expectedCurrentReleaseId` moves the comparison **inside** the transaction, after
`pg_advisory_xact_lock`. It is additive: the key absent means "no belief stated" and preserves
pre-KG-5B behaviour exactly, so every existing caller is unaffected. `null` is a real belief and is
enforced like any other. A lost race raises `ReleasePointerConflict` and is **audited**, on the same
terms as a gate refusal.

**Measured after the fix** (stable across three consecutive runs):

| Race | Result |
|---|---|
| `activate R3` vs `rollback to R2`, both from the same believed pointer | exactly one succeeded; the loser exit 2 `STALE_EXPECTED_CURRENT`; **one** active release; the committed pointer is the winner's target |
| two identical `activate R1` | at most one reported `activated`; **one** active release |

---

## 7 — SHADOW: no-active vs active (Phase 20), and `KG5B-DISC-01`

Same 35 governed citations, legacy inputs taken from the same database's live `standards_master`;
the only variable is the active pointer.

| | No active release | Release active |
|---|---|---|
| comparisons | 35 | 35 |
| `resolverHealth` | `NO_ACTIVE_RELEASE` ×35 | **`OK` ×35** |
| `governedBackingState` | `NO_ACTIVE_RELEASE` ×35 | `APPROVED_EXACT` ×27, `UNAPPROVED_RECORD` ×8 |
| `RESOLVER_FAILURE` | 35 | **0** |
| `INTEGRITY_FAILURE` / `CITATION_DIFFERENCE` / `GRANULARITY_DIFFERENCE` | 0 | **0** |
| severity | `REVIEW` ×35 | `INFORMATIONAL` ×12, `REVIEW` ×8, `BLOCKING` ×15 |

The left column reproduces KG-5A's finding and the production preflight exactly — a 100 %
resolver-failure rate. **Activation drives it to zero**, which is the property the release exists to
deliver, and it does so on a corpus that was never touched.

### `KG5B-DISC-01` — 15 CONTENT_DIFFERENCE / BLOCKING against production's real corpus

**This is a new finding and it changes the Stage-1 picture.** KG-5A's "release active" column showed
`EXACT_MATCH` on all 35 — but only because it ran against a corpus that had been **replaced by the
governed rows**, the very step KG-5A then proved unsafe. Under KG-5B the legacy corpus is untouched
by construction, so this comparison reports, for the first time, what Stage-1 SHADOW would actually
report in production.

15 of the 27 approved records classify `CONTENT_DIFFERENCE` → `BLOCKING`: production carries the full
eCFR section dump (56,026 bytes for `1910.1200`) where the governed record carries the reviewed,
clause-accurate 1,141-byte artifact.

**It is not a release defect.** Every BLOCKING record resolved with `resolverHealth: OK` and
`governedBackingState: APPROVED_EXACT`; every digest reproduces; the corpus is byte-identical. It is
the corpus content divergence the KG-5A review packet already documented, measured through the
shadow classifier.

**Cross-checked two independent ways.** KG-5A's reconciliation found **18**
`PRODUCTION_ROW_CONTENT_DIFFERS`. Three of those (`1910.219`, `30 CFR 56.14105`, `30 CFR 56.15006`)
are `NEW_REVIEW_REQUIRED` and never reach a content comparison — they resolve `UNAPPROVED_RECORD`
first. **18 − 3 = 15.** The two measurements agree exactly.

**What it means.** `BLOCKING` is defined as "would put a materially wrong claim in front of a
customer *if governed mode were enabled*". It does not block SHADOW, which is customer-invisible,
and it does not block activation with the cutover variables absent. **It must be adjudicated before
any governed DELIVERY.** Classification: `MUST_ADJUDICATE_BEFORE_GOVERNED_DELIVERY`, alongside
`KG4E-DISC-03`.

---

## 8 — Atomicity, idempotency, gates, provenance, approvals

**Atomicity (Phase 5).** A failure was injected at each of the seven named construction stages —
`source_set_built`, `membership_resolved`, `staging_populated`, `manifest_computed`,
`release_row_written`, `records_written`, `before_commit`. Every one: threw, left **no** partial
release (release rows, records, reviews and event counts identical before and after), and left **no**
staging table. A retry after all seven injected failures produced the pinned manifest and 35 records.

**Idempotency (Phase 10).** A second `prepare` reports `idempotent_no_op` with the same manifest; 35
records and 1 release row remain; the legacy corpus is still unchanged. A run that would produce a
*different* manifest is refused (`MANIFEST_WOULD_CHANGE`), as is re-preparing a release that has left
`draft`/`provisional` (`RELEASE_IMMUTABLE`).

**Citation canonicalization without legacy renaming (Phase 6).** `1910.147` ≡ `29 CFR 1910.147` ≡
`OSHA 1910.147` ≡ `§ 1910.147`; `30 CFR 56.14107(a)` ≡ `56.14107(a)`; subsection paths preserved
across prefixes. Distinct: `1926.50` ≠ `1926.501` (the near-prefix collision), parent ≠ child,
sibling subsections, cross-agency, `1910.303` ≠ `1910.303(b)(1)` — both of which are in the release.
No substring-equivalence shortcut. KG-3F semantics preserved unchanged; **the canonicalization
happens entirely between governed source records and renames no legacy row**, which is structural
rather than a guard that could be forgotten.

**Provenance independence (Phase 7).** All 35 records carry a real source registry key (0
placeholders), a source identity digest, a substantive content digest, an approval digest and
`approvalContractVersion 2` — while production's `standards_master.source_key` stays NULL on all
2,390 rows. `standardId` is NULL on every governed record, because a governed record captures no
live corpus row; it is in neither checksum projection, so no digest is affected.

**Finalization gates (Phase 13).** All eight evaluated on the production-shaped database. Before any
approval, `governedRecordsPresent` is the **only** failing gate. `manifestChecksumVerifies`,
`recordCountMatches` and `releaseRecordsPresent` pass against the persisted snapshot. An unknown
release fails `releaseExists` and claims nothing else. A deliberately tampered snapshot row fails
`manifestChecksumVerifies` — proving the gate reads the snapshot rather than trusting the stored
number. No gate consults `standards_master` normalization: the corpus is still pristine after the
gates run.

**Approval continuity (Phase 11).** Field by field against the KG-5A release: **zero** records moved
`recordChecksum`, `substantiveContentDigest`, `sourceIdentityDigest`, `approvalDigest`,
`approvalContractVersion`, `citationKey`, `reviewState`, the frozen manifest payload or the frozen
approval payload. The KG-5A review packet therefore applies **unchanged**: 27 REATTEST,
8 NEW_REVIEW_REQUIRED, 0 EXCLUDE, every row still naming a record at the same checksum and the same
three digests.

**Stage-1 approval scope (Phase 12).** Measured, not assumed, and **without lowering any gate**. With
0 approved, activation is refused on `governedRecordsPresent`. With the 27 REATTEST records approved
one at a time through the existing reviewer command — and a wrong `--expected-checksum` refused —
all eight gates pass at **27 of 35**. The threshold is `governedRecords > 0`, and
`regulatory-release-lifecycle.service.ts` records that as a deliberate KG-3B governance decision
(requiring universal review would make the gate a proxy for corpus completeness), not accidental
coupling. It was not changed. Every recorded approval is v2 and names the record's own
`approvalDigest`.

---

## 9 — Full operator rehearsal (Phase 19)

`npm run rehearse:kg5b-operator-sequence` — **58/58 assertions**, on a disposable database built to
production's exact pre-KG shape (40 migrations, latest `RefreshTokens1800000008000`, 2,390 legacy
rows). **46 reviewed commands run; 0 ad-hoc Node snippets required.**

1 migrations applied (40 → 46, corpus digest unchanged) · 2 prepare dry-run then real (35 records,
`14a34fea…`, provisional, 0 approved) · 3 legacy corpus verified unchanged · 4 status · 5 review +
**27 approvals appended one at a time**, wrong checksum refused · 6 SHADOW with no active release ·
7 finalization gates via dry run, 0 writes · 8 activate · 9 pointer verified · 10 SHADOW with the
release active · 11 rollback dry run + the no-prior-release refusal · 12 second release prepared,
approved, activated, then explicit rollback to the first · 13 pointer and history verified, both
releases retained, every pointer move auditable with a named operator.

After all of it: **2,390 rows, digest unchanged, 0 with `source_key`.**

---

## 10 — Migrations and old-code compatibility (Phase 21)

**KG-5B adds no migration.** The six KG-5A rehearsed are unchanged — `git status` shows zero
modifications under `backend/src/database/migrations/`, and the count is still 46.

Proven directly: a full column-level schema dump of a production-shaped database is **byte-identical
before and after** a real governed `prepare`, **0** `kg_governed%` tables survive, and the migration
count is still 46. KG-5A's finding that `97941ca2` starts safely against the migrated schema
therefore carries forward unchanged — there is no new schema for it to be incompatible with.

---

## 11 — Packaged-tree reproduction (Phase 22)

An isolated tree was built with `git archive HEAD | tar -x` — **no git metadata was mutated** — and
overlaid with the KG-5A `KG_RELEASE_REQUIRED` + `KG_VERIFICATION_ONLY` + `BLUEPRINT_DOCUMENTATION`
paths plus the 18 KG-5B paths, and the KG-5A/KG-5B evidence directories.

* **24 modified tracked files, zero theme files, zero unrelated files** (KG-5A had 22; KG-5B adds
  the two tracked seed files it modified).
* All 31 `UNRELATED_FRONTEND_THEME_WORK` / `UNRELATED_OTHER` paths verified **byte-identical to
  HEAD or absent** — 0 deviations.
* The `KG5A-DISC-02` hunk (the unrelated `<option value="unknown" disabled>` line) is excluded.

| Gate | Packaged tree |
|---|---|
| backend `npm run build` | exit 0 |
| `frontend-next npx tsc --noEmit` | exit 0 |
| `test:approval-contract` | 57/57 |
| `test:kg3e-citation-granularity` | 48/48 |
| `test:kg3f-retrieval-determinism` | 170/170 |
| `test:kg3f-ranking-adversarial` | 54/54 |
| `test:kg3f-56-14132-predicate` | 16/16 |
| `test:kg3f-shadow-invariance` | 7/7 |
| `test:kg4a-cutover-contract` | 146/146 |
| `test:kg4a-governed-resolution` | 99/99 |
| `test:kg4a-default-off` | 51/51 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg4b-shadow-adversarial` | 84/84 |
| `test:kg4b-shadow-determinism` | 18/18 |
| `test:kg4b-privacy-review` | 26/26 |
| `test:kg4c-production-shadow-contract` | 438/438 |
| `test:kg4c-disabled-deployment` | 80/80 |
| `test:kg4c-db-ownership` | 31/31 |
| `test:kg4d-orchestration` | 151/151 |
| `test:kg4d-default-off` | **121/121** |
| `test:kg4d-db-ownership-blackbox` | 19/19 |
| `test:kg4e-report-field-exclusion` | 9/9 |
| `test:kg4e-report-provenance` | 32/32 |
| `test:kg4e-telemetry-privacy-v2` | 0 fields outside the v2 allowlist |
| `compare:kg4e-report-invariance` | 8/8 invariant, 0 forbidden terms |
| `test:regulatory-release-lifecycle` | 42/42 |
| `test:governed-corpus-matrix` | 60/60 |
| `test:release-integrity-and-approval` | 44/44 |
| `test:reviewer-approval` | 62/62 |
| `test:standards-backing-contract` | 35/35 |
| **`test:kg5b-release-construction`** | **102/102** |
| **`test:kg5b-operator-cli`** | **65/65** |
| **`test:kg5b-approval-continuity`** | **29/29** |
| **`rehearse:kg5b-operator-sequence`** | **58/58** |

`test:kg3d-corpus-remediation` needs the KG-3D two-release remediation corpus, not the standard
seeded one; run on a migrated clone of `test_kg3d_remediation_20260819` it is **31/31**.

**No unexplained regression.** Three suites failed on first run and each was diagnosed to a fixture
condition, not a code change: `test:kg3e-citation-granularity` and `test:kg4e-report-field-exclusion`
were re-run against databases an earlier destructive suite had already mutated (48/48 and 9/9 on
pristine clones), and `test:kg5b-approval-continuity` / the rehearsal needed the KG-5A evidence
directory, which postdates the KG-5A worktree classification and had to be overlaid explicitly.

### `test:kg4d-default-off`: a real classification gap, corrected

The KG-4D mutating-suite inventory flagged `regulatory-release.ts` as `NEEDS GUARD`. That was a
true report of a category the inventory did not have. The KG-4C ownership guard refuses any database
not named `test_*` — exactly right for a verification suite, exactly wrong for an operator command
that exists to activate a release **in production**. Marking it "guarded" would be false; leaving it
"NEEDS GUARD" reports a hazard that does not exist.

The `OPERATOR CMD` category is therefore stated, and the exemption is **earned, not granted**: a
script qualifies only if it is on a one-entry allowlist **and** carries the substitute safety
property that replaces the ownership guard — it refuses to mutate unless the operator states the
exact state they believe they are acting on. Two new assertions hold the allowlist to exactly one
entry and re-check the safety property, so a second exemption cannot be added without a reviewable
diff. 119 → **121/121**.

---

## 12 — Preservation

| | |
|---|---|
| HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — unchanged |
| branch | `release/insite-rc-2026-08-18` — unchanged, upstream 0/0 |
| commits / pushes / merges / deploys | **none** |
| production | untouched — not read, not written, not migrated |
| production migrations | **not applied** |
| production SHADOW | **OFF** — no `GOVERNED_CUTOVER_*` variable set anywhere |
| production governed release | **not created, not activated** |
| original `safescope` database | untouched |
| stashes | 4, unchanged |
| tags | 23, unchanged targets |
| gold set | `93184abc…647cd3` — unchanged |
| prior KG evidence | unchanged; `test_kg5a_*`, `test_kg4b_*`, `test_kg4e_*`, `test_kg3d_*` databases were used only as **read-only templates** |
| mutation targets | disposable `test_kg5b_*` databases only, created by this task |

## 13 — Evidence

`contracts/kg5a-reference-release-records.json` · `contracts/approval-continuity.json` ·
`contracts/operator-rehearsal.json` · `contracts/packaged-tree-manifest.json` ·
`phase0-baseline.txt` · `phase22-regression.txt` · `phase22-packaged-tree.txt` ·
`PRODUCTION_RELEASE_RUNBOOK.md`
