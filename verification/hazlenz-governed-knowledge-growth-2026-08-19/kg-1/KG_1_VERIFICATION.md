# KG-1 — Knowledge Release Provenance · Verification Record

| Item | Value |
|---|---|
| Slice | KG-1 (closes architecture gap **G1** only) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Branch | `release/insite-rc-2026-08-18` (upstream `origin/release/insite-rc-2026-08-18`) |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Disposable DB | `test_kg1_provenance_verify_20260819` on `127.0.0.1:5432` |
| Production / `safescope` dev DB | **not touched** (no connection opened, no command executed against it) |

---

## 1. Starting repository state (Phase 0)

Recorded before any edit:

```
HEAD      5f050858227ca11cf90d2f6bf64148e70a018b64
branch    release/insite-rc-2026-08-18
upstream  origin/release/insite-rc-2026-08-18
status    ?? verification/hazlenz-governed-knowledge-growth-2026-08-19/   (architecture artifacts, intentionally uncommitted)
```

Protected tags verified present and still pointing at their original commits:

| Tag | Tag object | Target commit |
|---|---|---|
| `insite-hazlenz-verified-baseline-2026-08-19` | `02fb8248` | `e9f968f7` |
| `insite-inspection-ui-verified-2026-08-19` | `b25103b0` | `4c7a501d` |
| `insite-visual-acceptance-verified-2026-08-19` | `7bf58ec6` | `5f050858` |

Four pre-existing stashes present and untouched (`stash@{0}`–`stash@{3}`).

The five governed-knowledge architecture artifacts were read before any implementation change
and were not modified.

---

## 2. Provenance flow map (Phase 1)

Traced from source, not assumed:

```
POST /safescope-v2/classify            reasoning + standards retrieval (SafeScopeV2Service
  |                                     -> ApplicableStandardsService). Stateless; persists
  |                                     nothing about knowledge scoping.
  v
POST /inspections/observations/:id/analyses
  |    InspectionService.addAnalysis()  <-- AUTHORITATIVE PERSISTENCE LAYER
  |    writes hazlenz_analyses row: engineVersion (client-supplied literal
  |    "hazlenz-production"), traceId, idempotencyKey, requestVersion, resultSnapshot
  v
InspectionService.reconcileDecompositionFindings()   (same transaction)
  |    materialises / updates one inspection_findings row per decomposed hazard,
  |    setting selectedAnalysisId + originatingAnalysisId
  v
POST .../reviews  -> human_reviews          (review references analysisId)
  v
POST .../findings/finalize
  |    InspectionService.finalizeFinding(): updates the existing current finding, or
  |    creates a new revision from review.analysisId
  v
POST /inspections/:id/reports
  |    CanonicalReportsService.generate() -> snapshotInspection() builds a FROZEN jsonb
  |    sourceSnapshot containing observations, `analyses` (whole rows), `reviews`,
  |    `findings` (whole rows via spread), correctiveActions; sha256 fingerprint; PDF
  |    rendered from that snapshot and stored by sha256 in inspection_report_versions
  v
GET .../versions/:n/download   serves the stored PDF bytes
```

Answers to the Phase 1 questions:

1. **Where is `engineVersion` captured?** Not server-derived at all — it arrives in
   `CreateAnalysisSnapshotDto` and the frontend hardcodes the literal `"hazlenz-production"`
   (`frontend-next/lib/canonicalWorkflowApi.ts:336`). It is therefore *not* a usable model for
   knowledge provenance, which must be server-measured and unspoofable.
2. **Do findings already reference a stable analysis id?** Yes — `selectedAnalysisId` and
   `originatingAnalysisId` (both `uuid`, nullable) already exist on `inspection_findings`.
3. **Are findings copied/transformed/regenerated during review/finalization?** Both.
   `reconcileDecompositionFindings` updates an existing finding in place when its `hazardKey`
   matches and re-derives its whole content; `finalizeFinding` updates the current finding, or
   creates a new revision when none is current.
4. **Are reports regenerated from live findings, or snapshotted?** **Snapshotted.**
   `inspection_report_versions.sourceSnapshot` is an immutable jsonb copy, fingerprinted by
   sha256, with the rendered PDF stored alongside. This is what makes historical provenance
   preservable without any report-side recomputation.
5. **Where can provenance be captured once and propagated without recomputation?**
   `InspectionService.addAnalysis()`. Findings are created in the same transaction and can
   inherit the in-memory analysis row; the report snapshot spreads whole finding/analysis rows,
   so it inherits automatically.

---

## 3. What the current runtime can truthfully record (Phase 4) — **Case B**

Measured, not inferred.

**Retrieval is not release-scoped.** `ApplicableStandardsService` issues three
`standards_master` query builders (`applicable-standards.service.ts:870`, `:1222`, `:1281`),
every one of them filtered by `.where("s.is_active = true")` plus jurisdiction predicates on
`agency_code`/`scope_code`. **None filters on `release_id` or `reviewer_approved`.** Candidates
are additionally drawn from `safescope_knowledge_chunks` (`:1073`) and from in-code knowledge
shards, neither of which carries a release id.

**No release-control plane exists.** `grep -rn "regulatory_releases" src` outside migrations
returns a single hit — the write in `standards/seed/finalize-regulatory-release.ts`. Nothing
transitions a release to active; nothing reads the table at runtime (gaps G2/G3).

**Measured on the disposable DB after running `npm run seed:safescope-standards`:**

```
regulatory_releases:
  releaseId                  releaseVersion  status       recordCount  approvedBy  approvedAt
  federal-core-2026-07-30.1  2026-07-30.1    provisional  26           (null)      (null)

standards_master:
  release_id                 reviewer_approved  deprecation_status  count
  federal-core-2026-07-30.1  false              active              26

rows a KG-3 style filter (reviewer_approved = true AND deprecation_status = 'active') returns:  0
rows the CURRENT live filter (is_active = true) returns:                                       26
```

The only release that exists is **`provisional`**, has never been approved or activated, and
**zero** of its 26 records are `reviewer_approved`. The live path returns all 26 regardless.
Recording `federal-core-2026-07-30.1` as "the release that governed this analysis" would
therefore be a false statement about the system: that release governs nothing today.

**Conclusion: `knowledgeReleaseId = NULL` for every analysis produced by the current runtime.**
This is Case B in the KG-1 brief and it is the truthful answer. No release was fabricated,
no newest/most-recent release was selected, no retrieval behaviour was changed to make the
field non-null.

> Note: `IMPLEMENTATION_BACKLOG.md`'s KG-1 entry says "Populate it from the resolved active
> release at analysis time" and lists "an analysis persists a non-null `knowledgeReleaseId`"
> as a test. That expectation is **superseded** — it presumes the active pointer that KG-2/KG-3
> have not yet built, and the same backlog's own G2/G3 findings establish it does not exist.
> Honouring it literally would have required fabricating provenance.

---

## 4. Data model (Phase 2)

| Table | Column | Type | Null | Default | Backfill |
|---|---|---|---|---|---|
| `hazlenz_analyses` | `knowledgeReleaseId` | `varchar(120)` | YES | none | none |
| `inspection_findings` | `knowledgeReleaseId` | `varchar(120)` | YES | none | none |

Report provenance needs **no new column**: `inspection_report_versions.sourceSnapshot` already
persists whole finding and analysis rows, so the new field is carried into every report snapshot
by construction. A derived `knowledgeProvenance` summary block is written into that same frozen
snapshot.

Additive · nullable · backward-compatible · reversible · no backfill · non-destructive.

---

## 5. Authoritative capture point (Phase 3) and propagation (Phases 6–7)

```
InspectionService.resolveKnowledgeReleaseId()          <-- the ONLY resolution site
  -> resolveKnowledgeReleaseProvenance()               (inspection/knowledge-release-provenance.ts)
  -> describeLiveKnowledgeRetrievalScoping()           returns { mode: 'unscoped_corpus' } -> NULL
       |
       v
hazlenz_analyses.knowledgeReleaseId                    AUTHORITATIVE
       |
       +--> reconcileDecompositionFindings(), create branch:  = analysis.knowledgeReleaseId
       +--> reconcileDecompositionFindings(), update branch:  = analysis.knowledgeReleaseId
       |         (this branch re-derives the finding's whole content from that analysis)
       +--> finalizeFinding(), new-revision branch:           = reviewedAnalysis?.knowledgeReleaseId ?? null
       +--> finalizeFinding(), update branch:                 DELIBERATELY UNCHANGED
       |         (finalization is a human review act, not a re-analysis; a legacy NULL stays NULL)
       v
inspection_findings.knowledgeReleaseId                 INHERITED, never independently resolved
       |
       v
inspection_report_versions.sourceSnapshot
       - per-finding knowledgeReleaseId (carried by the existing row spread)
       - knowledgeProvenance = { knowledgeReleaseIds[], findingsWithoutKnowledgeRelease, findingCount }
         derived ONLY from those persisted findings — never from a "current" release lookup
```

The value is never taken from client input: no request field was added, and the resolver is a
server-side measurement. This is also why `engineVersion`'s client-supplied pattern was not
copied.

**Mixed provenance** is represented, not collapsed: a report spanning two analyses lists both
release ids. Verified by test (`["kg1-fixture-release.A","kg1-fixture-release.B"]`).

---

## 6. Migration verification (Phase 10)

All commands run with `DATABASE_URL` explicitly exported to the disposable target in the same
invocation, with the resolved host + database printed and checked first. `backend/.env` sets
`DATABASE_URL=.../safescope`; a shell-exported value overrides it because `dotenv` merges
non-destructively.

| Step | Result |
|---|---|
| `createdb … kg1_provenance_verify_20260819` (later renamed `test_kg1_provenance_verify_20260819`) | created |
| `npm run migration:run` | 42 migrations applied, incl. `KnowledgeReleaseProvenance1800000010000` |
| Column check | both columns `character varying(120)`, `is_nullable = YES` |
| `migration:revert` | `KnowledgeReleaseProvenance1800000010000 has been reverted successfully`; `information_schema.columns` count for the column → **0** |
| Rows inserted under the reverted (pre-migration) schema | analysis `5555…`, finding `6666…` |
| `migration:run` forward again | applied successfully |
| Pre-migration rows re-read | both readable, `knowledgeReleaseId IS NULL` → **true** |

Forward-compatible and reversible, proven by execution rather than assertion.

Database rename note: the DB was renamed to a `test_`-prefixed name mid-run so it satisfies the
disposable-database allowlist in `scripts/grant-test-entitlement.ts`. All 42 migrations and the
pre-migration rows survived the rename (verified by re-query).

---

## 7. Provenance test matrix (Phases 11–13) — `npm run test:knowledge-release-provenance`

New suite: `backend/scripts/test-knowledge-release-provenance.ts`. Run against the disposable DB
with the API server on `127.0.0.1:4231` pointed at the same DB.

**Result: 27/27 checks passed.**

| Group | Checks |
|---|---|
| Resolver semantics | live scoping measured `unscoped_corpus`; live → NULL; genuine single-release → that id; single-release with unusable id → NULL |
| Live production path | analysis records NULL; 2 findings materialised; findings inherit NULL; reload re-serialises NULL |
| Deterministic propagation (fixture) | analysis records X; 3-hazard decomposition → all 3 findings record X; re-analysis records X; update branch preserves X |
| No retroactive rewrite | after a newer release B is used elsewhere, the release-A findings still read A |
| Finalization | finalized findings preserve their analysis provenance |
| Report | report generates; snapshot carries `knowledgeProvenance`; **mixed provenance lists both A and B**; every snapshot finding carries its own release |
| Regeneration | re-reading the stored report reproduces historical provenance; **regenerating after the latest release changed does not adopt the newer release C** |
| Legacy rows | unversioned findings and analyses load cleanly as NULL; report stays valid and reports them as unversioned; cleared provenance is reported unknown, never back-filled |

The deterministic (non-NULL) path is exercised through a **test-only subclass** that substitutes
a `single_release` scoping fixture. No production semantics were invented to make it non-null:
production has exactly one implementation of `resolveKnowledgeReleaseId()` and it returns NULL.

**Multi-hazard (Phase 12)** is covered by the 3-hazard decomposition case: all three findings from
one analysis inherit the same release, none generates provenance independently, and none
substitutes a newer release.

**Report (Phase 13):** the report generated successfully (`status: generated`, sha256 recorded,
`%PDF-` header validated by the service). Finding content, standards, risk and corrective actions
are untouched by this slice — `grep` confirms **no** reference to `knowledgeReleaseId` or
`knowledgeProvenance` anywhere under `backend/src/reports/` except `canonical-reports.service.ts`;
`canonical-report-pdf-renderer.ts` and the report DTOs are unmodified, so no layout or
customer-facing content change is possible. Provenance is internal report metadata, as KG-1
specifies.

---

## 8. Regression results (Phases 9, 14)

| Gate | Command | Result |
|---|---|---|
| Backend build | `npm run build` (`tsc`) | **pass**, no errors |
| HazLenz core regression | `npm run test:hazlenz-core` | **2 failing suites — identical to the frozen baseline**: `Golden Hardening Scenarios Test`, `HazLenz Production Path Regression`. No new failures, none suppressed. |
| Standards regression | `npm run test:safescope-standards` | **15 passed, 0 failed** — matches the 15/15 baseline |
| Corpus integrity | `npm run test:standards-corpus-integrity` | all invariants passed, 0 failed |
| Knowledge index | `npm run validate:hazlenz-knowledge-index` | Validation Passed (8 entries, 4 jurisdictions) |
| Persistence / multi-hazard | `npm run test:persisted-decomposition-findings` | `{"passed":true,…}` |
| Finalization / review scoping | `npm run test:finding-scoped-reviews` | `{"passed":true,…,"finalStatus":"completed"}` |
| Provenance matrix | `npm run test:knowledge-release-provenance` | **27/27 passed** |
| Report generation | via provenance suite | generated + regenerated, checksums recorded |
| Frontend type check | `npx tsc --noEmit` in `frontend-next` | **pass**, no errors (no frontend file changed) |
| Whitespace / conflict markers | `git diff --check` | clean |

The failing-suite *list* (not merely the count) matches the documented baseline recorded in
`verification/insite-release-candidate-closure-2026-08-18/` — "Golden Hardening Scenarios,
Production Path 'tagged but not locked'".

### Suite not run to completion: `test:canonical-workflow`

Fails at `POST /actions` with `402 PAID_SUBSCRIPTION_REQUIRED (correctiveActionAssignments)`.
**Pre-existing and unrelated to KG-1**, established as follows:

- The failure is a billing-guard rejection that occurs before any inspection, analysis, finding
  or report code executes.
- Every file that governs it is unmodified by this slice — `git status --short backend/src/auth
  backend/src/billing backend/scripts/grant-test-entitlement.ts backend/src/corrective-actions`
  returns empty.
- The documented way to run this suite (`DEV_FORCE_EXPERT=true`, per
  `verification/safety-insite-persisted-multihazard-lifecycle-2026-08-03/REPRODUCTION_COMMANDS.md`)
  no longer exists: `grep -rn "DEV_FORCE_EXPERT" src/` returns nothing, and its successor
  `DEV_FORCE_PRO` only tiers up the **dev-bypass** identity (`auth/guards/jwt.guard.ts:14`), not
  an authenticated user holding a real token.
- The repository's entitlement grant tool is itself broken (see Defects below), so the suite
  currently has no working way to obtain the entitlement it needs.

Not repaired here — the KG-1 brief directs that unrelated failures not be "fixed". Lifecycle
coverage is not lost: the new provenance suite exercises the same path end to end
(analysis → findings → review → finalize → complete → report → regenerate).

---

## 9. Non-behaviour-change gate (Phase 9)

KG-1 changes **85 inserted lines and zero deleted lines** across five tracked files. Nothing was
removed or rewritten. Specifically unchanged: hazard recognition, multi-hazard decomposition,
risk scoring, candidate standard retrieval, standard ranking, jurisdiction inference, regulatory
applicability logic, clarification questions, corrective actions, finalization behaviour,
substantive report content, entitlement behaviour.

Two details worth stating explicitly:

- The finding `changed` computation in `reconcileDecompositionFindings` compares conclusion,
  `sourceCandidate` and `riskSnapshot` only. Provenance was deliberately **not** added to it, so
  a provenance value can never invalidate a human review or reopen a finalized finding.
- `resolveKnowledgeReleaseId()` is a pure function with no I/O, called once per analysis inside
  the existing transaction. No added query, lock, or latency on the analysis path. The one added
  query is a single `findOne` in `finalizeFinding`, executed only when the review cites an
  analysis.

---

## 10. API compatibility (Phase 8)

- No request parameter added anywhere; `CreateAnalysisSnapshotDto` is unmodified.
- No inspection workflow step added; no customer chooses a knowledge release.
- The new field is nullable and appears only in responses that already return whole
  analysis/finding rows (`GET /inspections/:id`), so old clients ignore it.
- No frontend file changed; `frontend-next` type check passes unmodified. `PersistedFinding` in
  `lib/canonicalWorkflowApi.ts` is a structural type, so an extra optional response field cannot
  break it. Provenance is intentionally not surfaced in the customer UI — it is infrastructure,
  not a setup field.
- Free/Pro entitlements untouched.

---

## 11. Files changed

Tracked, modified (all additive):

| File | sha256 |
|---|---|
| `backend/src/inspection/entities/hazlenz-analysis.entity.ts` | `6d447ae8eda67e3ad079610b80ef152f30bdd8fa88f41f567e9179b61b1a9a05` |
| `backend/src/inspection/entities/inspection-finding.entity.ts` | `9d4c810e973deb98006a75984d41eab65f148e2eafd50ce4156411fc86f298de` |
| `backend/src/inspection/inspection.service.ts` | `8a5db98684f446476ad76e93bdfd6931850940fbe13954e70e1231cb47a6c0f4` |
| `backend/src/reports/canonical-reports.service.ts` | `5ba45609512066730cc73a5467c77819407066230b75e9f74c00194403a7ca57` |
| `backend/package.json` | `a2bd859d10d74e215159a95691cdb471e52f5f1e6e8098974d73ac6542137450` |

New, untracked:

| File | sha256 |
|---|---|
| `backend/src/database/migrations/1800000010000-KnowledgeReleaseProvenance.ts` | `32b306562f8354873a55d7bb6c34e21b458fa7e64f71a528d3bc685de1192e64` |
| `backend/src/inspection/knowledge-release-provenance.ts` | `9dbf8777d9a0915ea60175c7b144ecfe0e96ade25e7f2367ae8bfad978fdb621` |
| `backend/scripts/test-knowledge-release-provenance.ts` | `fa0851c57ad0da0151342ba1b0946a7e91d1f2c7620ca4977607b879acc2d60a` |

`git diff --stat -- backend/ frontend-next/` → `5 files changed, 85 insertions(+)`.

---

## 12. `backend/tmp/gold-set-v3.ts` disposition (Phase 15) — inspected only

Inspected; **not moved, not committed, not redesigned, not integrated. KG-5 not implemented.**

| Question | Finding |
|---|---|
| Genuinely required for future promotion validation? | **Yes.** 31 cases, 33 `mustNotReturn` wrong-regime guards, 7 negative controls. It is the gate the architecture names as binding on precision. |
| Generated or hand-maintained? | **Hand-maintained and independently adjudicated.** Its own header states the expectations were derived from `evidence-foundation.ts` rule predicates and `CORPUS_INTEGRITY_AUDIT.md` — "**NOT** derived by running HazLenz and copying its output". This is exactly the property that makes it irreplaceable and unregenerable. |
| Does its untracked state risk losing verification logic? | **Materially less than G9 states — see below.** |

**Correction to G9.** The architecture doc records the gold set as simply untracked, implying the
logic could be lost. In fact a **byte-identical tracked copy exists in git**:

```
backend/tmp/gold-set-v3.ts                                                           93184abc677cf7a5…
verification/insite-core-closure-standards-validation-2026-08-18/
  standards-gold-set/gold-set-script-v3.ts   (git ls-files: TRACKED)                 93184abc677cf7a5…
```

So the adjudicated content is version-controlled and recoverable. The real, narrower risks are:

1. **Drift with no detector.** The runnable copy lives in an ignored directory
   (`.gitignore:28` ignores `backend/tmp/`) and nothing binds it to the tracked copy. Three
   byte-identical duplicates already sit in `backend/tmp/` (`gold-set-v3.ts`,
   `gold-set-script.ts`, `gold-set-v3-rerun.ts`), and the tracked folder holds three *differing*
   generations (`gold-set-script.ts`, `-v2`, `-v3`). Which one is authoritative is decided by
   convention, not by mechanism.
2. **No hash gate.** Nothing verifies the file's sha256 before scoring, so an edited gold set
   would score silently — the precise failure KG-5 is meant to close.
3. **No runner.** No `package.json` script invokes it; it is run ad hoc, so it cannot be part of
   an automated promotion gate as it stands.
4. **Coupling.** It imports `../src/safescope-v2/evidence/evidence-foundation`, so a production
   refactor can break it, and nothing in CI would notice.

Recommendation for KG-5 (not acted on here): promote the tracked copy to a canonical,
non-dated location, record its sha256, add a runner that refuses to score on hash mismatch, and
delete the ad-hoc duplicates.

---

## 13. Defects discovered (recorded, not fixed — outside KG-1 scope)

1. **`backend/scripts/grant-test-entitlement.ts` is broken against the current schema.** It
   inserts `tier = 'expert'`, but migration `1800000005900-RetireExpertTier` added
   `CHECK ((tier)::text = 'pro')`. Every invocation fails with
   `new row for relation "entitlement_grants" violates check constraint
   "entitlement_grants_tier_check"`. Verification-tooling defect; the one-word fix belongs in a
   separate slice. Consequence: entitlement-dependent integration suites have no working grant
   path, which is why `test:canonical-workflow` cannot currently complete.
2. **Stale documented verification convention.** `DEV_FORCE_EXPERT`, still referenced in earlier
   reproduction commands, no longer exists in the codebase; `DEV_FORCE_PRO` replaced it but only
   affects the dev-bypass identity, not authenticated users.
3. **Pre-existing dead comparison** (observed, deliberately untouched, already annotated in the
   source): in `reconcileDecompositionFindings`, `existing.conclusion` is assigned before
   `changed` compares `existing.conclusion !== mechanism`, so that term is always false. The
   existing code comment already calls this out as intentionally out of scope.

---

## 14. Limitations and remaining uncertainty

- **Every analysis produced by the current runtime records NULL.** KG-1 delivers the mechanism
  and the truthful semantics; it does not — and must not — produce non-null provenance until
  KG-2/KG-3 give the read path a real active release to be scoped to. The non-null path is
  proven by fixture, not by production traffic.
- **Report fingerprint shift (one-time, expected).** Because finding rows now carry an extra
  field and the snapshot carries a `knowledgeProvenance` block, `sourceFingerprint` differs from
  pre-KG-1 fingerprints. The first regeneration of an already-reported, otherwise-unchanged
  inspection therefore produces a **new version** instead of replaying the duplicate
  (`report_generation_duplicate_replayed`). No report *content* changes; the previously stored
  PDF and its sha256 are untouched. Unavoidable given an additive column on a snapshotted row.
- **`finalizeFinding` update branch leaves provenance unchanged by design.** If a future slice
  makes finalization able to re-derive regulatory content, that decision must be revisited.
- **The gold set was not executed in this slice.** KG-1 cannot affect standard selection (no
  retrieval code changed, proven by diff), so the gold set has no movement to detect; running it
  is KG-5's business and it has no runner today.
- **`test:canonical-workflow` did not complete** for the pre-existing entitlement-tooling reason
  documented in §8.

---

## 15. Worktree state

```
 M backend/package.json
 M backend/src/inspection/entities/hazlenz-analysis.entity.ts
 M backend/src/inspection/entities/inspection-finding.entity.ts
 M backend/src/inspection/inspection.service.ts
 M backend/src/reports/canonical-reports.service.ts
?? backend/scripts/test-knowledge-release-provenance.ts
?? backend/src/database/migrations/1800000010000-KnowledgeReleaseProvenance.ts
?? backend/src/inspection/knowledge-release-provenance.ts
?? verification/hazlenz-governed-knowledge-growth-2026-08-19/
```

Nothing committed, nothing pushed, no tag or remote touched, no deploy, no production or
`safescope` database access, no stash created or dropped. The disposable verification service was
stopped after verification.

---

## 16. Recommended next slice

**KG-2 — release lifecycle and the active pointer.** KG-1 has made provenance recordable and
honest; it currently records NULL because there is nothing true to record. KG-2 is what creates a
truthful non-null value: the `active`/`superseded`/`rolled_back` statuses, the partial unique
index guaranteeing exactly one active release, `knowledge_release_events`, and transactional
promote/rollback — with the current corpus marked as the first active release so there is a
known-good baseline.

The measurement in §3 sharpens the KG-3 warning that follows it: **all 26 `standards_master` rows
have `reviewer_approved = false`**, so switching the read path to
`release_id = :active AND reviewer_approved = true` today would return **zero** standards and
destroy recall entirely. KG-3's mandatory shadow-diff pre-work is not optional, and the approval
metadata must be resolved before that filter is enabled — not relaxed to compensate.
