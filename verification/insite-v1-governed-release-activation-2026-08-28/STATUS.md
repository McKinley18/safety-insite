# Governed release activation + release-scoped retrieval — 2026-08-28

```
TERMINAL = HAZLENZ_GOVERNED_RELEASE_ACTIVATION_ACCEPTED
           — PRESERVATION_CHECKPOINT_AND_PRODUCTION_CUTOVER_PLANNING_REQUIRED

LOCAL_CANDIDATE_ACTIVATION      = TRUE
PRODUCTION_CANDIDATE_ACTIVATION = FALSE
PRODUCTION_MUTATED              = FALSE
PROVIDER_CALLS                  = 0
```

`federal-core-2026-08-28.1` was activated in a disposable database, retrieval was scoped to it, and
a customer finding produced through the real HTTP workflow now carries reviewer-approved governed
regulatory authority traceable to an exact release record. The defect this phase existed to find
was found before it shipped: the release pin read the **active pointer** on every analysis, so
activating a newer release would silently have re-governed every inspection already resolved under
an older one. That is now impossible.

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` (unchanged, entry and exit) |
| upstream | `origin/main` |
| stashes / tags | 4 / 24, untouched |
| commit / push / tag / deploy / production mutation / provider call | **none** |
| production activation | **not performed, not attempted** |

### Changed-file inventory

**Production code (7 files):**

| file | change |
|---|---|
| `backend/src/standards/releases/inspection-release-binding.ts` | **new** — resolves and write-once establishes the release that governs an inspection |
| `backend/src/database/migrations/1800000018000-InspectionKnowledgeReleaseBinding.ts` | **new** — `inspection.knowledgeReleaseId`, nullable, partial index |
| `backend/src/inspection/inspection.entity.ts` | the column, documented as write-once and never back-filled |
| `backend/src/inspection/inspection.service.ts` | a provenance CLAIM is now verified against the inspection's binding, falling back to the pointer only when unbound |
| `backend/src/standards/cutover/governed-resolution.ts` | `pinGovernedRelease()` takes an optional bound release; new `PINNED_BOUND_RELEASE` reason |
| `backend/src/standards/cutover/governed-cutover-context.ts` | `create({ boundReleaseId })`, passed to the pin |
| `backend/src/standards/cutover/shadow-request-orchestration.ts` | `boundReleaseId` threaded to both context constructions |
| `backend/src/safescope-v2/safescope-v2.controller.ts` | resolves the binding once per classify, beside the existing inspection-jurisdiction resolution |

**Build configuration (1 file):** `backend/tsconfig.json` — `"rootDir": "./src"`. See §12.

**Verification (7 new files) + `backend/package.json`** (six script entries). No existing test,
scorer, threshold, expectation or gate was weakened, and `evidence-foundation.ts` is unmodified.

---

## 2. Phase 1 — activation semantics, frozen before anything was activated

Answered from `regulatory-release-lifecycle.service.ts` and then **measured** by the gate in §3.

| question | answer |
|---|---|
| what does activation mutate? | exactly two tables in one transaction: `regulatory_releases` (`status`, `activatedAt`, `deactivatedAt`, `parentReleaseId`) and an INSERT into `knowledge_release_events` |
| append-only event + pointer change, or content mutation? | **append-only event plus a pointer/status change.** No statement in the path touches `regulatory_release_records`, `regulatory_release_record_reviews`, `standards_master` or `manifestChecksum` |
| can it alter membership? | **no** |
| can it alter normalized records? | **no** |
| can it alter the review ledger? | **no** |
| can it alter the manifest checksum? | **no** |
| how is the active release selected? | `WHERE status = 'active'`, with the partial unique index `uq_regulatory_release_active` making two impossible |
| can only a validated release become active? | **yes** — eight named gates, including `manifestChecksumVerifies` (recomputed from the release's own immutable snapshot) and `governedRecordsPresent` (≥1 record whose EFFECTIVE review state is `reviewer_approved`) |
| is activation idempotent? | **yes** — `already_active`, and it writes nothing at all |
| R1 active, R2 activated? | one transaction under `pg_advisory_xact_lock`: R1 → `superseded` (retained in full), R2 → `active` with `parentReleaseId = R1` |
| can an inspection bound to R1 stay bound to R1? | **before this phase: no mechanism existed.** After: yes, and it is enforced — see §6 |
| can a rejected record become authoritative because its release is active? | **no** — authority is membership + effective review state, neither of which activation touches |

**The invariant, restated:** activation SELECTS an immutable governed release for new resolution.
It does not rewrite the release, its reviews, or any inspection's provenance.

---

## 3. Phase 2 — the activation gate, written and run BEFORE the candidate was activated

`backend/scripts/test-release-activation-acceptance.ts` — `npm run test:release-activation-acceptance`
— **43/43 PASS** (`ACTIVATION_GATE.json`).

Immutability is measured by digesting `regulatory_releases` (content columns only),
`regulatory_release_records` and `regulatory_release_record_reviews` **immediately before and
immediately after** the activation being measured.

> The gate's own first run failed 4 checks. The cause was in the gate, not the system: the baseline
> digest was captured before the suite built its synthetic fixtures, so two fixture releases showed
> up as a difference activation had not made. A before/after pair that straddles the suite's own
> setup measures the setup. The baseline was moved to immediately before the activation; nothing in
> the assertions was relaxed.

| requirement | result |
|---|---|
| A. a valid candidate release becomes active | PASS |
| B. the manifest checksum is unchanged | PASS — `680540d9…` → `680540d9…` |
| C. membership is byte-identical | PASS — 64 → 64 |
| D. every normalized record (payload, checksum, frozen review state) unchanged | PASS |
| E. the reviewer decision ledger unchanged | PASS |
| F. re-activating the active release | PASS — `already_active`, and it wrote nothing |
| G. R1 → R2 does not rewrite an inspection bound to R1 | PASS — re-resolution is byte-identical |
| H. a rejected record stays rejected after activation | PASS — all 8 |
| I. a code-resident citation cannot become governed because the active release holds the same string | PASS — 3 routes |
| J. release identity gates intact | PASS — including the superseded release still naming its own 35-record manifest |

**Negative controls, all refused by a NAMED gate:** a non-existent release (`releaseExists`); a
release with no reviewer-approved member (`governedRecordsPresent` — and it genuinely throws); a
release whose snapshot no longer reproduces its stored manifest (`manifestChecksumVerifies`). Both
the successful activation and the refusal are in the append-only event log.

---

## 4. Phase 3 — local candidate activation

Driven through the **real reviewed operator command** (`npm run release -- activate`), not an ad-hoc
script, with `--expected-manifest` and `--expected-current` supplied. A dry run was performed first
and wrote nothing (`ACTIVATION_TRANSCRIPT.txt`).

Target: `test_v1_release_activation_20260828` — created for this workflow by cloning the disposable
reviewer-governance database. Verified before execution.

| | before | after |
|---|---|---|
| active pointer | **none** | `federal-core-2026-08-28.1` |
| candidate status | `provisional` | `active` |
| candidate manifest | `680540d994ce…a668cb` | `680540d994ce…a668cb` (**identical**) |
| candidate members | 64 | 64 |
| approved review decisions | 64 | 64 |
| historical release | `provisional`, 35 members | `provisional`, 35 members (**untouched**) |
| rejected records inside the active release | 0 | **0** |

`parentReleaseId` is NULL, correctly: activation records what it actually replaced, and it replaced
nothing. The definition's `predecessorReleaseId` (`federal-core-2026-07-30.1`) is a separate,
version-controlled fact and is unchanged.

```
LOCAL_CANDIDATE_ACTIVATION = TRUE     PRODUCTION_CANDIDATE_ACTIVATION = FALSE
```

---

## 5. Phase 4 — why the customer path recorded `knowledgeReleaseId = NULL`

Measured, not asserted: `npm run diagnose:knowledge-release-null-path` (`KG1_NULL_PATH_DIAGNOSIS.json`).

The path is: `POST /safescope-v2/classify` → `orchestrateShadowRequest()` →
`GovernedCutoverContext.create()` → `pinGovernedRelease()` → `hydrateFindingScopedStandards()` →
persistence via `InspectionService.addAnalysis()` → `annotateFindingStandardsAuthority()`.

**Three independent reasons, each sufficient on its own:**

1. `GOVERNED_CUTOVER_MODE` unset → `LEGACY` / `DEFAULT_NO_CONFIGURATION` → the context is `null` and
   no code in `standards/cutover/` runs at all;
2. even with a governed mode set, no allowlist → `NO_ALLOWLIST_CONFIGURED` → effective mode `LEGACY`;
3. even with both, before this phase no release was active → `NO_ACTIVE_RELEASE` → `releaseId: null`.

`resolveKnowledgeReleaseId()` then takes the non-influencing branch and records NULL, and the
annotation resolves every candidate `LEGACY_CODE_RESIDENT_CONTENT`. All of that was **correct**.

**And the defect underneath it.** The same probe showed:

```
pinUnderGovernedMode = { releaseId: "federal-core-2026-08-28.1", reason: "PINNED_ACTIVE_RELEASE" }
```

The pin read the **active pointer**, per analysis, with no notion of what the inspection had
previously been governed by — because nowhere could an inspection record that. Release identity was
selected once per ANALYSIS. An inspection outlives its analyses.

---

## 6. Phases 5 and 6 — the failing assertion, then the smallest architecture

`backend/scripts/test-release-binding-acceptance.ts` was written **first**. Recorded
pre-implementation failure (`PRE_IMPLEMENTATION_FAILURE.txt`):

```
TSError: Cannot find module '../releases/inspection-release-binding'
error TS2554: Expected 2 arguments, but got 3        (pinGovernedRelease)
error TS2367: '...' and '"PINNED_BOUND_RELEASE"' have no overlap
```

**After implementation: 25/25 PASS** (`RELEASE_BINDING.json`), no assertion weakened.

### The architecture

```
inspection (write-once knowledgeReleaseId)
   └─ resolveInspectionReleaseBinding(mode, inspectionId)
        └─ pinGovernedRelease(ds, mode, boundReleaseId)   ← the pointer is NOT read when bound
             └─ resolveGoverned(ds, pin, citation)        ← retrieval scoped to the pinned release
                  └─ resolveFindingStandardAuthority(citation, releaseId)
                       └─ persisted finding + report provenance
```

Release identity is an INPUT to regulatory resolution, not metadata added afterwards. The rules:

1. the inspection already carries a release → **use it, unchanged** (the pointer is not read, not
   even for comparison — there is no reconciliation to make, and a comparison would invite one);
2. it carries none and a release is active → that release becomes the binding, written once with
   `WHERE "knowledgeReleaseId" IS NULL` so two concurrent analyses cannot produce two bindings;
3. nothing active → no release governs the analysis. **No id is invented; nothing is written.**

There is deliberately no `rebind`/`force` parameter. Moving an inspection to a newer release is a
migration decision a person makes; an operation reachable by accident is not a decision.

`LEGACY` and `SHADOW` return before touching the database, so their inertness stays structural.

| scenario | result |
|---|---|
| 1 — new inspection, R2 active | binds to R2, pins R2, retrieval scoped to R2, finding records approved governed authority |
| 2 — inspection bound to R1, R2 active | **keeps R1**, pins R1, reads with R1 semantics; the stored binding is not rewritten. Positive control in the same suite: the same citation is REJECTED under R2, so the two releases genuinely differ |
| 3 — no active release | `NO_ACTIVE_RELEASE`, no id invented, nothing written, authority `LEGACY_CODE_RESIDENT_CONTENT`; LEGACY and SHADOW write no binding at all |
| 4 — rejected record under an active release | `REJECTED_GOVERNED_CONTENT`, retrieval refuses it |
| 5 — code rule emits an approved citation | `LEGACY_CODE_RESIDENT_CONTENT`; naming the release without resolving the member confers nothing; positive control shows genuine resolution does confer approval |

---

## 7. Phase 7 + 12 — fallback precedence and failure containment

`npm run test:governed-authority-precedence` — **42/42 PASS** (`PRECEDENCE_AND_CONTAINMENT.json`).

| authority state | presentable as reviewed regulation | reviewer identity | `corpusBacked` | disclosure |
|---|---|---|---|---|
| `APPROVED_GOVERNED_CONTENT` | **yes — the only one** | present | true | `GOVERNED_APPROVED` |
| `UNAPPROVED_GOVERNED_CONTENT` | no | withheld | false | `HAZLENZ_AUTHORED` |
| `REJECTED_GOVERNED_CONTENT` | no | withheld | false | `HAZLENZ_AUTHORED` |
| `LEGACY_CODE_RESIDENT_CONTENT` | no | withheld | false | `HAZLENZ_AUTHORED` |
| `NO_GOVERNED_MATCH` | no | withheld | false | `HAZLENZ_AUTHORED` |

**Hazard recognition is independent.** A life-critical hazard whose four citations resolve to three
different authority states is byte-identical as a hazard before and after annotation — same
mechanism, same severity, same `lifeCritical`, same citations, none removed.

**Containment, under a simulated governance outage:**

* the hazard, its severity and its citations survive;
* every candidate is left **unannotated** — never partially trusted — and an unannotated candidate
  carries no governance field at all, so absence reads as non-governed everywhere;
* a partial failure leaves each candidate either fully annotated or untouched;
* an unreadable pointer → `PIN_LOOKUP_FAILED` → `RESOLVER_UNAVAILABLE` ("unknown", not "there is
  none") → `governedProvenanceEligible: false` and no governed-verified text;
* a failed binding lookup resolves to no release rather than to the active pointer;
* no active-pointer lookup replaces a stored inspection release.

---

## 8. Phase 8 — all 64 approved members and all 8 rejected records

`npm run test:governed-release-reachability` — **514/514 PASS** (`CORPUS_REACHABILITY.json`).

This measures **governance reachability**, not hazard coverage. No hazard was fabricated to force a
regulation through the 43-case corpus; whether a regulation is ever SELECTED remains an
applicability question the hazard corpus owns.

**64 / 64 approved members** each prove: membership true; effective state `reviewer_approved`;
correct release id; checksum reconstructable from the immutable snapshot; usable content;
`APPROVED_GOVERNED_CONTENT` reachable; release-scoped retrieval resolves `APPROVED_EXACT`.
The release still folds to `680540d9…` at 64 records after every one of those reads.

**8 / 8 rejected records** each prove: not a member; cannot reach approval; inherit no reviewer
identity; inherit no checksum; never `corpusBacked`; retrieval refuses them; the citation string
alone confers nothing; and **no approved reviewer decision names them in any release**.

```
rejected records reaching approval: 0 / 8
```

---

## 9. Phases 9–11 — the real customer workflow, release-scoped

`npm run verify:release-scoped-customer-workflow` — **35/35 PASS** (`RELEASE_SCOPED_WORKFLOW.json`).

Driven over HTTP against a disposable server in `GOVERNED_WITH_FALLBACK` with one allowlisted
account, posting `POST /safescope-v2/classify` **with `inspectionId`** — the shape the product's own
front end sends. (The older `verify:hazlenz-actionable-workflow` posts without one, so it can never
exercise binding; it was run too, unchanged, and passes 66/66.)

### The distribution — measured, not prescribed

| | LEGACY baseline (release ACTIVE) | release-scoped |
|---|---|---|
| persisted findings | 19 | 3 |
| persisted standard candidates | 18 | 3 |
| authority states | `LEGACY_CODE_RESIDENT_CONTENT` × 18 | `APPROVED_GOVERNED_CONTENT` × 3 |
| inspection binding | none | `federal-core-2026-08-28.1` |
| analysis `knowledgeReleaseId` | NULL | `federal-core-2026-08-28.1` |
| `corpusBacked` | 0 | 3 |
| reviewer present | 0 | 3 |
| record checksum present | 0 | 3 |

The two runs use different observation sets and are **not** a like-for-like count comparison; the
LEGACY column's purpose is the first row of §11 — with the reviewed release ACTIVE, a legacy
customer's records are exactly what they were.

No governed count was prescribed. What is asserted is semantic: every approved claim is fully
evidenced (member of the bound release, `reviewer_approved`, checksum, reviewer, `corpusBacked`),
and every non-approved candidate claims no approval.

### Phase 10 — customer-visible content

For every `APPROVED_GOVERNED_CONTENT` candidate: the checksum it claims names a real record in the
release, and **every displayed body string is one the governed record supplies**. Nothing displayed
as approved comes from anywhere else. No non-member record summary appears as approved customer
text (8 non-member summaries checked). Non-approved candidates remain distinguishable in their own
provenance. No customer-facing wording was changed; no frontend file references `authorityState`,
`corpusBacked`, `backingStatus` or reviewer identity at all.

### Phase 11 — report, reopen, re-analysis

The report generates, the PDF downloads, and it makes **no** claim of reviewer approval, review, or
governed authority (six distinct claim strings scanned in the extracted PDF text).

An R1→R2 transition was then exercised mid-life, with a synthetic successor release activated:

| assertion | result |
|---|---|
| the reopened inspection preserves its original release | PASS — `federal-core-2026-08-28.1` |
| re-analysis records the ORIGINAL release, never the newly active one | PASS |
| no already-persisted finding was rewritten | PASS — release id, authority state, governed release and checksum all byte-identical |
| **positive control**: a NEW inspection binds to the NEWLY ACTIVE release | PASS — `workflow-fixture.successor` |

The positive control matters: without it, "the release did not change" is indistinguishable from a
dead code path.

---

## 10. Phase 13 — regression

Full table with counts in `REGRESSION_EXIT_CODES.txt`. Protected floor, measured **with the
reviewed release ACTIVE**:

| protected metric | required | measured |
|---|---|---|
| Level-1 recognition recall | 43/43 | **100.0 % (43/43)** |
| recognition life-critical | 35/35 | **35/35** |
| actionable finding coverage | 43/43 | **100.0 % (43/43)** |
| life-critical actionable coverage | 35/35 | **100.0 % (35/35)** |
| Population A precision | 100.0 % | **100.0 %** |
| forbidden emissions | 0 | **0** |
| Population B required secondary-hazard recall | — | **100.0 % (43/43)** |
| `test:hazlenz-core` | 37/37 | **37/37 suites, 0 failing** |
| KG-5B release construction | 102/102 | **102/102** |
| golden standards | 15/15 | **15/15** |
| release identity | 8/8 | **8/8** |
| finding governed authority | 17/17 | **17/17** |
| finding integration gate | 19/19 | **19/19** |
| accepted workflow | 66/66 | **66/66** |
| persisted decomposition findings | PASS | **PASS** |
| TypeScript (backend / frontend) | clean | **clean / clean** |

New gates: activation acceptance **43/43**, release binding **25/25**, corpus reachability
**514/514**, precedence + containment **42/42**, release-scoped customer workflow **35/35**.

All eight rejected-record adversarial controls were re-run in three independent places (activation
gate §3H, reachability §8, binding scenario 4) and hold in all three.

`test:kg4e-report-provenance` proves the other direction on a clean LEGACY database: **0 of 19
persisted findings and 0 of 14 analyses carry a governed release id, with the reviewed release
ACTIVE**, and no frozen report snapshot names one.

No threshold was relaxed. The unresolved-jurisdiction ranking defect is **carried forward
unrepaired**, as instructed; nothing in this phase touches ranking.

---

## 11. What activation alone changes for a customer: nothing

Worth stating on its own, because it is the safety result:

* a LEGACY customer's analyses, findings, reports and provenance are unchanged with the release
  active — 66/66 accepted workflow, 18/18 candidates still `LEGACY_CODE_RESIDENT_CONTENT`, every
  `knowledgeReleaseId` still NULL;
* governed retrieval reaches a customer only when a governed mode AND a server-side account
  allowlist are both set, which no environment does by default;
* `SHADOW` remains structurally invisible **through the modified orchestration**: a full SHADOW
  corpus was run against a disposable server (`run:kg4b-shadow-corpus`, **145 passed, 0 failed**
  across 43 cases) and every case shows customer output identical to LEGACY, carrying no governed
  telemetry keys, with citation set and order identical. The 93 resulting events then pass
  `test:kg4b-privacy-review` **26/26** — every text digest a 32-hex hash, never an excerpt.

---

## 12. A defect this phase introduced and repaired

The two new **mutating** suites were first written under `src/standards/tests/`, importing the
ownership guard from `scripts/lib/`. That single cross-directory import changed the common source
root `tsc` infers, silently moving the entire build from `dist/main.js` to `dist/src/main.js` —
`npm start` runs `node dist/main.js`, so the artifact compiled cleanly and would not have started.

Repaired properly rather than worked around: the mutating suites moved to `scripts/`, where every
other mutating suite in this repository lives, and `"rootDir": "./src"` was pinned in
`backend/tsconfig.json` so the same mistake becomes a compile error naming the offending file
instead of a layout change nobody sees.

`test:kg4d-default-off` then caught the second one: `verify-release-scoped-customer-workflow.ts`
mutates a database and had no ownership guard. It now claims its database through
`runOwnedMutatingSuite` before its first write. That gate exists precisely to prevent a suite being
pointed at a real corpus, and it worked.

---

## 13. Unresolved / not executed

**`test:approval-contract` — carried-forward defect, NOT introduced here.** It refuses with:

```
Refusing to finalize release federal-core-kg3f-contract.1: no version-controlled release
definition registers this identifier
[legacy-corpus-guard] rows=34 governed=34 foreign=0 ownedDisposable=false
```

Cause: the suite creates its work database with plain `createdb` and never writes an ownership
marker into it, so `ownedDisposable` is false and the release-identity guard's fixture exemption
does not apply. That guard (`release-identity.ts`, `finalize-regulatory-release.ts`) was added by
the **preceding** phase — both files are dated 2026-08-28 12:02, before this session's first edit,
and neither is in this phase's changed-file inventory. Repairing it would mean modifying a prior
phase's accepted governance surface and is outside this authorization.

**`test:kg4e-report-provenance`** reports 9 passed / 1 failed; the single failure is a missing
`TELEMETRY` input path. Every HARD invariant in it passed.

**"The four known failures."** The preceding two phases assert four known failures remain
byte-identical, but no reachable evidence enumerates them, and the blueprint §13 documents only
**two** (both inside `test:hazlenz-core`). This run measured `test:hazlenz-core` at **37/37 suites
with zero failing checks across 276 individual assertions**. Rather than claim byte-identity to a
set that cannot be identified from the repository, this is recorded as an open documentation gap:
**the four should be enumerated before the next phase relies on the phrase.**

**Still unverified, carried forward:** production legacy corpus behaviour; the
`safescope_knowledge_chunks` retrieval path (0 rows in every available database); the
unresolved-jurisdiction ranking defect; the `.next-onereport` include globs in
`frontend-next/tsconfig.json`, which are generated build contamination from an earlier session,
preserved untouched here.

**Not proven, and it is the next decision:** production cutover. This phase proves the mechanism in
a disposable environment. It does not prove production behaviour, and nothing here should be read
as authorising an activation, a mode change or an allowlist entry on a production server.
