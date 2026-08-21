# KG-5D — Production SHADOW preflight, second pass, and evidence-sufficiency adjudication

**Performed:** 2026-08-21 · **Repository:** `/Users/mckinley/Desktop/Safety_InSite`
**Branch:** `release/insite-rc-2026-08-18` · **HEAD:** `5f050858227ca11cf90d2f6bf64148e70a018b64`
**Upstream divergence:** 0 ahead / 0 behind `origin/release/insite-rc-2026-08-18`
**Starting status:** `KG_PROGRAM_CONVERGED — ROOT_CAUSE_GOVERNANCE_ESTABLISHED — PRODUCTION_SHADOW_PROTOCOL_READY`

**Scope:** read-only production inspection, telemetry-integrity root cause, evidence-sufficiency
adjudication, traffic-population decision, `KG5D-DISC-01` disposition, and a bounded Stage-1
experiment design. **No implementation change. No production mutation. Nothing enabled.**

**Documentation hashes at entry:**

| File | sha256 |
|---|---|
| `docs/INSITE_ENGINEERING_BLUEPRINT.md` | `abfe45f4c3544871046135be34ea74815fe48b90330e4ef8a1def54328b44b0e` |
| `docs/INSITE_CURRENT_STATE.json` | `cf1234f70c3d8fe99807c11599e5870efb9ef776d433fd3a1a36c5cbc9fde117` |

---

## 1 — What was executed against production, and why each is read-only

| # | Command / call | Reads | Writes | Can it change release or feature state? |
|---|---|---|---|---|
| 1 | `render whoami` | CLI identity | none | no |
| 2 | `render services -o json` | service config | none | no |
| 3 | `render deploys list <srv>` | deploy history | none | no — `deploys create` was NOT used |
| 4 | `GET /v1/services/<srv>/env-vars` | env var keys | none | no — GET only |
| 5 | `GET /v1/logs?...` | retained log records | none | no |
| 6 | `psql "<prod>" -f q*.sql`, each wrapped in `BEGIN READ ONLY; … COMMIT;` | schema catalogs + aggregate counts | **server-refused** | no |

`transaction_read_only = on` was asserted **inside** the first session and printed as evidence, so
read-only is enforced by PostgreSQL, not by intention. Every statement issued was `SELECT`.
No customer prose, no email, no name and no credential was printed into any artifact.

---

## 2 — Q1 Production identity `VERIFIED 2026-08-21`

| Fact | Value |
|---|---|
| Service | `safety-insite-backend` · `srv-d7kl74jeo5us73deaor0` |
| URL | `https://safescope-backend.onrender.com` |
| Plan / instances / region | `free` · 1 · `oregon` |
| Auto-deploy | yes, on commit, tracking `main` |
| Live deploy | `dep-da1rvprncjis73f3q390`, status `live` |
| Live commit | `97941ca23c0be880395fe0d51ceb72ca22d8bfaa`, finished `2026-08-18T02:15:28Z` |
| `main` == `origin/main` == live commit | **yes** |
| `standards/cutover/` in live commit | **absent** |
| `standards/releases/`, `standards/display/` in live commit | **absent** |
| Latest migration file in live commit | `1800000008000-RefreshTokens.ts` |

**The live commit does not correspond to release-capable code.** It predates the entire governed
subsystem. Confirmed independently in the repository: `backend/src/standards/cutover/`,
`standards/releases/`, `standards/display/`, `citation-structure.ts`,
`knowledge-release-provenance.ts` and five migrations are **untracked at HEAD** (0 paths tracked,
all present on disk). 46 migrations on disk, 41 tracked at HEAD, 40 in the live commit.

---

## 3 — Q2 Production schema `VERIFIED 2026-08-21, read-only`

| Fact | Value |
|---|---|
| `migrations` rows | **40** |
| Latest applied | `RefreshTokens1800000008000` |
| `InspectionRegulatoryContext` (1800000009000) | **not applied** |
| `KnowledgeReleaseProvenance` (1800000010000) | **not applied** |
| `RegulatoryReleaseLifecycle` (1800000011000) | **not applied** |
| `RegulatoryReleaseRecords` (1800000012000) | **not applied** |
| `RegulatoryReleaseRecordReviews` (1800000013000) | **not applied** |
| `ApprovalProvenanceContract` (1800000014000) | **not applied** |
| `regulatory_releases` | exists (pre-KG shape, from `1800000004000`) |
| `regulatory_release_records` | **does not exist** |
| `regulatory_release_record_reviews` | **does not exist** |
| `knowledge_release_events` | **does not exist** |
| any `knowledgeRelease*` column, any table | **zero** |
| `standards_master` rows | **2,390** |

**New detail not previously recorded:** `regulatory_releases` exists but carries the *pre-lifecycle*
column set — `id, releaseId, releaseVersion, status, manifestChecksum, parserVersion, recordCount,
approvedBy, approvedAt, createdAt`. It has **no active-pointer column** (`isActive` / `activatedAt` /
`activatedBy` all absent). The table's presence must not be read as partial KG-2 readiness; the
lifecycle pointer that `pinGovernedRelease()` depends on does not exist in production.

---

## 4 — Q3 Production release state `VERIFIED 2026-08-21, read-only`

`regulatory_releases`: **0 rows.** No provisional release, no finalized release, no active release,
no manifest identity, no record count. Nothing to enumerate.

## 5 — Q4 Production review state `VERIFIED 2026-08-21, read-only`

**The review substrate does not exist.** `regulatory_release_records` and
`regulatory_release_record_reviews` are both absent, so the correct statement is not "zero
approvals" — it is that no approval, re-attestation, revocation, approval digest or
`NEW_REVIEW_REQUIRED` state **can** be represented in production today. The expected 27 reviewed
checksums are therefore not merely unrepresented; there is no table capable of holding them.

## 6 — Q5 Feature-control state `VERIFIED 2026-08-21, read-only`

34 environment variables on the production service. `GOVERNED_CUTOVER_*` count: **0**.
No `GOVERNED_CUTOVER_MODE`, no `..._PRODUCTION_ACK`, no `..._PRODUCTION_SHADOW_ACK`,
no `..._SHADOW_STAGE`, no `..._KILL_SWITCH`, no `..._OBSERVABILITY`, no allowlist of either kind.
`NODE_ENV=production`, `TYPEORM_SYNCHRONIZE=false`.

Resolves to `LEGACY` / `DEFAULT_NO_CONFIGURATION`. **Doubly closed:** no variable is set *and* the
code that would read them is absent from the live commit. **SHADOW remained OFF and CUTOVER remained
OFF throughout this preflight; nothing was set, changed or unset.**

---

## 7 — Q7 Observation population `VERIFIED 2026-08-21, read-only`

Production carries two distinct identity tables. This cost time in this pass and is recorded so it
does not cost it again:

* **`"user"` (singular) is the live auth table** — 26 rows, 15 with `deletedAt IS NULL`, 11
  soft-deleted, across 8 `organization` rows. Carries `role`, `planCode`, `subscriptionStatus`.
* **`users` (plural) is a vestigial 1-row table** with a different column set and no `deletedAt`. It
  is **not** the account population. A count taken against it reports 1 and is wrong.

**Stage-1 account reverified:** `e9a25131-dfa4-40ce-90ff-8ab3d884d8ef` exists in `"user"`,
`role=Auditor`, `planCode=company`, `subscriptionStatus=active`, not soft-deleted, and is the
**only live user in its organization**. `GOVERNED_CUTOVER_ORG_ALLOWLIST` must still remain unset —
`countNamedPrincipals()` sums both lists against the `STAGE_1_SINGLE_ACCOUNT` ceiling of 1, so
setting it would fail the stage gate regardless of how few members the organization has.

**Natural traffic, measured:**

| Table | Rows |
|---|---|
| `inspection` | 1 |
| `observations` | 1 |
| `hazlenz_analyses` | 1 |
| `inspection_findings` | 1 |
| `inspection_reports` | 1 |
| `inspection_report_versions` | 1 |

First and last analysis share one timestamp: `2026-08-19T11:38:38Z`. **Lifetime production traffic is
one analysis.** Natural traffic is not low; it is effectively nil.

---

## 8 — Q6 / PHASE 4 — Telemetry integrity, mechanism established

### 8.1 The path, from source

```
buildShadowEventV2()            field-by-field construction; never spreads a caller object
  -> assertShadowEventV2PrivacySafe()   allowlist + per-field length + type + canary
  -> JSON.stringify(event)      ONE string; JSON escaping makes an embedded newline "\n"
    -> StdoutJsonlSink.write()  console.log(serialized)  = one line + "\n"
      -> container stdout
        -> Render built-in collector
          -> one Render record, line stored verbatim in a single opaque `message` string
```

`emitShadowEvent()` is gated on `GOVERNED_CUTOVER_OBSERVABILITY === 'enabled'` (exact, after trim);
anything else returns `SUPPRESSED_DISABLED` and writes nothing.

### 8.2 The event cannot be split, and cannot be large — established, not assumed

* **No multiline serialization.** `JSON.stringify` emits no literal newline. Verified against **80
  real v2 events** captured through the running product (KG-4D 32, KG-4E 24 + 24): **0 lines contain
  a raw newline or carriage return.**
* **Hard per-field cap.** `MAX_FIELD_LENGTH = 200` is enforced on every string field **before**
  serialization, and a violation **throws and drops the event** — it never truncates one. An
  oversized event is therefore an absent event, never a corrupt one.
* **No field type can grow.** Across all 80 real events the longest string of any field is **64
  bytes** (a sha256 hex digest). Every field is a citation, a digest, a UUID, an enum or a number.
* **Analytic worst case ≈ 6,585 bytes** with all 28 string fields simultaneously at the 200-char cap
  — a state no field type can actually reach.
* **Measured size:** 1,494–1,710 bytes over 80 events (mean 1,644, max 1,710).

**Conclusion for the application half: the emitter is proven incapable of producing a split,
multiline or unbounded event.** Truncation, if it exists, is not created here.

### 8.3 The 319-byte observation is not evidence of a limit

Re-measured independently in this pass rather than inherited. Full retained window paged from the
Render logs API:

| Measurement | Value |
|---|---|
| Distinct log records examined | **2,900** |
| Window | `2026-08-18T00:27:34Z` → `2026-08-21T18:22:47Z` |
| `message` bytes | min 0 · p50 163 · p90 189 · p99 252 · **max 317** |
| Longest line | a NestJS `ModuleTokenFactory` WARN, ANSI escapes intact |
| Build-log records (`type=build`) in the deploy window | 29, **max 105 bytes** |

**The 317/319-byte ceiling is a property of what this application currently logs, not of what the
pipeline can carry.** Nothing in the retained window — application or build — approaches 1.7 KB, so
the window contains no counter-example and no confirming example. It cannot settle the question in
either direction, and inferring truncation from it would be the same error as inferring a limit.

### 8.4 What is *not* established

Render's public logging documentation states **no** maximum log line length, no per-message size
limit and no truncation or splitting behaviour. It does document, newly recorded here, an ingestion
rate limit of **6,000 application log lines per minute per running instance, with excess dropped** —
not a size limit, and far above any Stage-1 rate, but it belongs in the retention/telemetry contract.

So the residual uncertainty is **exactly one link**: whether Render's collector and log store carry a
single ~1,700-byte stdout line into one `message` field intact. Source inspection, existing logs,
existing evidence and local reproduction **cannot** reach that link — it is on the far side of a
boundary this repository does not own.

### 8.5 Why this does NOT trigger the Phase-5 probe gate

A single controlled production SHADOW event is **not** necessary, and more decisively it is
**currently impossible**:

1. **The probe cannot be constructed.** Emitting a production SHADOW event requires the cutover code
   to exist in production. It does not — the live commit contains no `standards/cutover/`. There is
   no environment-variable combination that produces a shadow event from `97941ca2`. The probe is
   therefore not gated on authorization; it is gated on operations 1–5, which are unauthorized here.
2. **The question is not SHADOW-shaped.** "Can Render carry a 1.7 KB stdout line" is a property of
   the log pipeline, entirely independent of governed knowledge. Nothing about enabling SHADOW is
   required to answer it, and answering it via SHADOW would be the most expensive available route.
3. **The risk it carries is telemetry-usability, not customer safety.** SHADOW returns the pristine
   legacy payload structurally (`D-50`); a lost or truncated event degrades evidence and cannot
   degrade a customer response.
4. **It is answerable for free inside an operation that must happen anyway.** The question is settled
   by parsing the **first real event** of Stage-1, which costs one observation.

**Therefore the correct engineering response is not a probe — it is an abort gate.** Stage-1 must
carry a first-event integrity gate that aborts the run if event #1 does not retrieve as a single
complete parseable JSON object with all 35 fields. That converts an unverified assumption into a
verified precondition at zero marginal cost, and it fails closed.

---

## 9 — PHASE 8 — `KG5D-DISC-01` disposition: **A — PATH ATTRIBUTION NOT REQUIRED**

The finding's two limbs were re-derived from source, and one of them is stronger than recorded.

**Limb 1 — no resolver-path field exists.** Confirmed. Neither the 29 v1 allowlisted fields nor the
6 v2 additions names a path, and both call sites pass `findingKey: <citation>`
(`applicable-standards.service.ts:2399`, `safescope-v2.service.ts:5644`).

**Limb 2 — the `eventKey` collision is UNREACHABLE in production.** This is new. `resolveStandard()`
does memoise only the DB resolution and does emit outside the cache-miss branch, so two paths
resolving one citation in one analysis *would* push two records with identical `eventKey`. But
**Path A never receives a cutover context on any production route**:

| Call site | Arguments passed to `suggest()` | `cutover` supplied? |
|---|---|---|
| `safescope-v2.service.ts:1066` (the classify path) | 6 positional | **no** |
| `applicable-standards.controller.ts:17` (`POST /applicable-standards/suggest`) | 4 positional | **no** |

`cutover` is the **7th** parameter of `suggest()`. Its own doc comment states it: *"Undefined is the
default and the only value any customer produces today."* With `cutover` undefined, the
`if (cutover)` guard at `applicable-standards.service.ts:2392` is false and **Path A emits no shadow
events at all.**

**Empirically corroborated:** across all 80 real integrated-path v2 events — KG-4D 32/9 analyses,
KG-4E 24/7 and 24/7 — there are **80 distinct `eventKey`s, 0 duplicates, and 0 `(correlationId,
citation)` pairs occurring more than once.** The collision does not merely fail to matter; it does
not occur.

**Answer against the frozen hypotheses:**

| Hypothesis | Needs resolver path? | Evaluated from |
|---|---|---|
| H0 | no | per-observation consistency with the pinned release |
| H1 citation resolution | no | `requestedCitation` vs `governedResolvedCitation` |
| H2 approved artifact | no | `governedTextDigest` vs the frozen `payload.canonicalText` |
| H3 unreviewed fallback | no | `governedBackingState` + `fallbackState` |
| H4 resolver path | **explicitly no** — the frozen text already states the guarantee is structural and that telemetry does not re-establish it | shared `resolveStandard()` (`D-22`, `D-51`) |
| H5 badge / provenance | no | `shadowProvenanceNull`, `customerVisible` false |
| H6 no customer mutation | no | `outputInvarianceVerdict`, `customerOutputUnchanged` |
| H7 instrumentation fidelity | **explicitly no** — "resolver-path attribution is out of scope" | v2 privacy guard + correlation/finding/release attribution |
| H8 release identity | no | `releaseId` + `releaseManifestChecksum`, same query |

**Disposition A.** Stage-1 evaluates citation- and customer-contract-level behaviour correctly
without distinguishing Path A from Path B, and on the classify path the distinction is degenerate:
**every Stage-1 observation is a Path B observation.** A `resolverPath` field would be a constant.

**Preserve the current instrumentation. Add no telemetry.** This satisfies the second branch of the
recorded condition for closure: *"a recorded decision states that path-level attribution is not
required and H4 remains structural."*

### 9.1 `KG5D-DISC-02` — the consequence that WAS missing: Stage-1 observes Path B only

The same evidence yields a finding the register does not carry. §21.5 records two real customer
paths delivering deliberately different representations. **Only one of them is instrumented on the
request path.** Stage-1 will therefore produce **zero** Path A observations, and no expectation of
Path A coverage in a Stage-1 corpus is well founded.

* **Classification:** `INSTRUMENTATION` — the implementation satisfies its contracts (§17 records the
  seam as called from exactly one place); the *evidence expectation* is what was unstated.
* **Owner:** INSTRUMENTATION.
* **Customer impact:** none.
* **Release-gate impact:** does **not** block Stage-1. H4's structural guarantee is unaffected. It
  bounds what a Stage-1 corpus may be claimed to cover, and it is a **CUTOVER** consideration.
* **Do not remediate here.** Wiring Path A to the seam is an implementation change; this phase
  forbids one, and it would need its own `eventKey` cardinality analysis, because it is precisely
  the condition that makes Limb 2's collision reachable.

---

## 10 — PHASE 6 — Evidence sufficiency: the 200 is real, and it is not what it was taken for

### 10.1 Root cause: three different numbers have been conflated

`minimumSample: 200` was traced to source rather than inherited.

| Number | Where it lives | What it actually governs |
|---|---|---|
| **200 / 500** `minimumSample` | `shadow-circuit-breaker.ts:91,104,116,128` | The floor **below which a STOP threshold may not trip.** A suppression guard on the breaker. |
| **≥ 100 comparisons, ≥ 24 h** | `kg-4c/PRODUCTION_SHADOW_RUNBOOK.md` §4 | The **Stage-1 → Stage-2 promotion** gate. |
| **200 analyses / 500 comparisons + regime and family coverage** | same runbook, "Sample sufficiency", under §16 **Post-run review** | The corpus adequate to **inform a CUTOVER decision**; it additionally gates Stage 3. |

The breaker's own recorded basis is explicit that 200 is a floor on stopping, not a target for
evidence: *"The 200-observation floor is set so a single early failure cannot trip a run: 1/200 =
0.5%, comfortably under the threshold."*

And the runbook already states Stage-1's character directly: **"The first cohort is not a sample; it
is a smoke test of the mechanism in production conditions."**

**So the 200 has a defensible basis and is PRESERVED unchanged — it simply is not a Stage-1
acceptance requirement, and never was.** Nothing here weakens a threshold; the finding is that the
threshold was being applied to the wrong stage.

`stage1PreflightVerdict.nonBlockingFindings.F1` states *"The runbook sample-sufficiency minima (200
analyses / 500 comparisons) will never be met organically."* Both halves are true, and the
conclusion drawn from them was too strong: those minima do not gate Stage-1.
Classification: `INSTRUMENTATION`. This is recorded as `KG5D-DISC-03`.

### 10.2 Why a small structured corpus is SAFE, not merely sufficient

The load-bearing argument, verified in source at `shadow-circuit-breaker.ts:187`:

> *"Hard invariants first, unconditionally, with no sample floor. One is enough."*

`evaluateCircuitBreaker()` returns `STOP_SHADOW` on any hard-invariant violation **before** any rate
condition is evaluated. All seven customer-protecting conditions — `CUSTOMER_OUTPUT_MUTATED`,
`CUSTOMER_OUTPUT_UNVERIFIED`, `GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW`, `PRIVACY_SCHEMA_VIOLATION`,
`APPROVAL_INTEGRITY_IMPOSSIBLE`, `NONDETERMINISTIC_RESULT`, `CITATION_SUBSTITUTED` — are
threshold-zero with **no sample floor**.

**The rate conditions are evidence-quality conditions; the hard invariants are the safety
conditions, and they are fully armed at n = 1.** A 40-comparison Stage-1 therefore leaves every
customer protection at full strength while the rate conditions simply never arm — which is the
designed behaviour, reported as `BELOW_MINIMUM_SAMPLE:<condition>` for review rather than silently.

### 10.3 Why 200 repetitions would be worse evidence than a structured corpus

Stage-1 traffic will be operator-generated (§11). 200 repeated low-diversity requests would exercise
one path through a 15-category taxonomy 200 times, produce a category distribution that is a
property of the operator's scenario choice rather than of the corpus, and satisfy an equality oracle
on the same comparison repeatedly — the exact vacuity class KG-4B defect 1, KG-4D and `D-54` each
caught. **Repetition inflates a denominator without adding an independent observation.**

### 10.4 The Stage-1 evidence requirement, designed around coverage

Frozen before observation. Each cell requires **at least one classified observation**; the corpus is
complete when every row is satisfied and every integrity gate holds.

| # | Coverage requirement | Min | Expected classification |
|---|---|---|---|
| C1 | Approved governed citation, reviewed artifact delivered | 3 | `EXPECTED_EQUIVALENCE` / `GOVERNED_APPROVED_EXACT` |
| C2 | Known `GOVERNED_REVIEWED_RENDERING` case (of the 15) | 3 | `EXPECTED_GOVERNED_REVIEWED_RENDERING` |
| C3 | Legacy-identical case | 3 | `EXPECTED_EQUIVALENCE` / `EXACT_MATCH` |
| C4 | Unreviewed record (of the 8 `NEW_REVIEW_REQUIRED`) | 2 | `UNAPPROVED_RECORD`, legacy preserved |
| C5 | Known unreviewed `CONTENT_DIFFERENCE` (of the 3) | 1 | `CONTENT_DIFFERENCE`, expected until review |
| C6 | Subsection citation resolving `LEGACY_UNRESOLVED` (of the 12) | 3 | `CITATION_ONLY`, no base-citation collapse |
| C7 | Citation with no governed record | 2 | `GOVERNED_MISSING` / `EXPECTED_FALLBACK` |
| C8 | OSHA General Industry (29 CFR 1910) | 1 | — |
| C9 | OSHA Construction (29 CFR 1926) | 1 | — |
| C10 | MSHA (30 CFR 56/62/47) | 1 | — |
| C11 | Multi-finding analysis (per-analysis pin, memo, mixed provenance) | 1 | — |
| C12 | HazLenz gold-set citations, of the 23 emitted | ≥ 8 | — |

Expected corpus size: **≈ 12–20 analyses yielding ≈ 30–60 citation comparisons.** The number is an
*outcome* of the coverage design, not a target.

**Integrity gates — these, not the counts, are the acceptance criteria:**

| # | Gate |
|---|---|
| G1 | Event #1 retrieves as ONE complete parseable JSON object, 35 fields, v2 allowlist clean — else **ABORT** (§8.5) |
| G2 | Every event names the intended `releaseId` **and** its `releaseManifestChecksum` |
| G3 | `outputInvarianceVerdict = INVARIANT` on every analysis; `INDETERMINATE` count **0** (`D-43`) |
| G4 | `shadowProvenanceNull = true` on every event; `knowledgeReleaseId` NULL in every written row |
| G5 | `customerOutputUnchanged = true` on every event |
| G6 | Hard-invariant violations: **0** |
| G7 | Every distinct observation classified into the §27.3 frozen taxonomy; none `UNCLASSIFIED` |
| G8 | Per-observation non-vacuity floor (`D-54`): every compared case returned a real analysis; a 429 is refused, never compared |
| G9 | Every `EXPECTED_GOVERNED_REVIEWED_RENDERING` verified against the frozen `payload.canonicalText`, not a re-derivation |

**This corpus does NOT satisfy the Stage-2 promotion gate** (≥ 100 comparisons, ≥ 24 h) and does not
claim to. Promotion to Stage 2 is a separate decision requiring its own evidence, and Stage-1
success under §27.5 does not depend on it.

### 10.5 `KG5D-DISC-04` — organic sufficiency is unreachable at this product's traffic level

At one analysis in the product's lifetime, the post-run sufficiency corpus (200 analyses / 500
comparisons / 100 OSHA GI / 100 OSHA Construction / 50 MSHA / 12 hazard families) will not be reached
organically at Stage 1, Stage 2 **or** Stage 3, on any timeline. Deterministic-cohort widening
cannot manufacture traffic that does not exist.

**The evidence basis for a future CUTOVER decision therefore cannot be organic production shadow as
currently designed.** This is not a Stage-1 blocker and must not expand the Stage-1 gate (§24).
It is a **CUTOVER-path** finding requiring a recorded adjudication before cutover is contemplated:
either the sufficiency table is re-derived for a low-traffic product, or the cutover decision rests
on the structured-coverage basis plus the existing KG-4B/4D/4E/5C evidence, with the limitation
stated. **Do not resolve it by padding a corpus** — KG-4B refused exactly that (§8.5, `D-35`).

* **Classification:** `DEFECT_NONBLOCKING` for SHADOW; `MUST_ADJUDICATE_BEFORE_CUTOVER`.
* **Owner:** INSTRUMENTATION (evidence design).

---

## 11 — PHASE 7 — Traffic strategy: controlled operator traffic, with the claim bounded

**Natural traffic is not sufficient and cannot become sufficient.** One analysis in the product's
lifetime. An observation window over natural traffic would accrue zero events, and §27.2 is explicit
that a hypothesis with zero qualifying observations is **UNPROVEN**, never passed. Running a window
and reporting "no discrepancies observed" would be the purest form of the vacuity error this
programme has caught three times.

**Stage-1 must use controlled operator-generated traffic**, from the single named account, and the
claim must be bounded to what that traffic can carry:

| Claim | Supported by controlled traffic? |
|---|---|
| The deployed production resolver, pinned release, feature controls and telemetry execute correctly together in production | **YES** — the request traverses all of them; who typed it is irrelevant |
| H1, H2, H3, H5, H6, H7, H8 hold on real production data and the real production release | **YES** — each is a per-observation property |
| The four locks admit exactly one principal and a non-allowlisted request produces no events | **YES** |
| A full-size v2 event survives the Render pipeline intact | **YES** — settled by G1 |
| The mismatch/severity/root-cause **distribution** under organic customer usage | **NO** — it is a property of the operator's scenario choice |
| The **rate** at which the eleven unobserved categories occur in the wild | **NO** — categories can be forced; a rate cannot be inferred |
| Behaviour under concurrent real-world load | **NO** |
| That no unanticipated observation shape exists in real customer traffic | **NO** |

**Production execution proof is not customer-population proof, and Stage-1 must claim only the
first.** It is acceptable for Stage-1 to prove production execution correctness with controlled
traffic — the runbook already frames Stage 1 as a smoke test of the mechanism, not a sample.
Organic-population evidence is a **separate, later evidence requirement** (see `KG5D-DISC-04`), not
something to be manufactured by generating volume.

---

## 12 — PHASE 3 — Expected vs actual reconciliation

| # | Expected (blueprint / JSON) | Actual, verified 2026-08-21 | Disposition |
|---|---|---|---|
| R1 | Live commit `97941ca2`, no cutover subsystem | identical | `EXPECTED_EXPLAINED` |
| R2 | Governed subsystem untracked in git | identical — 5 dirs/files + 5 migrations untracked | `EXPECTED_EXPLAINED` (`STAGE1-OP-01` B1) |
| R3 | Six migrations unapplied | identical — 40 applied, latest `RefreshTokens1800000008000` | `EXPECTED_EXPLAINED` (B3) |
| R4 | `regulatory_releases` zero rows | identical | `EXPECTED_EXPLAINED` (B4) |
| R5 | Records/reviews tables absent | identical | `EXPECTED_EXPLAINED` (B4) |
| R6 | Zero `GOVERNED_CUTOVER_*` in production | identical — 0 of 34 | `EXPECTED_EXPLAINED` |
| R7 | `standards_master` 2,390 rows | identical | `EXPECTED_EXPLAINED` (B5) |
| R8 | 15 live users / 11 soft-deleted / 8 orgs | identical, in `"user"` — **not** `users` | `EXPECTED_EXPLAINED`, recorded to prevent rediscovery |
| R9 | Stage-1 account valid | identical; also sole live user in its org | `EXPECTED_EXPLAINED` |
| R10 | Longest production log line ≈ 319 B | **317 B** over 2,900 records, re-measured | `EXPECTED_EXPLAINED` |
| R11 | Full-size line fidelity unverified | still unverified; **mechanism now established** (§8) | `INSTRUMENTATION`, resolved by gate G1 |
| R12 | `regulatory_releases` presumed absent-or-empty | exists, **pre-lifecycle shape, no active pointer** | `EXPECTED_EXPLAINED`, newly recorded |
| R13 | `KG5D-DISC-01` open, path attribution undecided | resolved **A**; collision unreachable | `INSTRUMENTATION` — closed |
| R14 | Path A and Path B both instrumented on the request path | **Path A emits no shadow events on any route** | `INSTRUMENTATION` — `KG5D-DISC-02` |
| R15 | ~200 observations is the Stage-1 minimum | 200 is a **breaker stop floor**; Stage-1's own gate is coverage | `INSTRUMENTATION` — `KG5D-DISC-03` |
| R16 | Sufficiency corpus reachable by widening stages | unreachable at this traffic level at any stage | `DEFECT_NONBLOCKING` — `KG5D-DISC-04` |
| R17 | Render documents no line limit | confirmed; **also documents 6,000 lines/min/instance, excess dropped** | `EXPECTED_EXPLAINED`, newly recorded |
| R18 | Backend scripts 178 / migrations 46 | **201 scripts**, 46 migrations | `EXPECTED_EXPLAINED`, drift |
| R19 | Worktree 114 entries | **127 entries** | `EXPECTED_EXPLAINED`, drift |

**No difference in this table is classified `BLOCKER`.** The five blockers to Stage-1 are unchanged
and are `STAGE1-OP-01`'s B1–B5, all reconfirmed by direct measurement.

---

## 13 — Preservation

| Obligation | Verified |
|---|---|
| No production writes | **yes** — every session `BEGIN READ ONLY`, `transaction_read_only=on` asserted and printed |
| No migrations applied | **yes** — 40 before, 40 after |
| SHADOW remained OFF | **yes** — 0 `GOVERNED_CUTOVER_*`, unchanged |
| CUTOVER remained OFF | **yes** |
| No release lifecycle mutation | **yes** — `regulatory_releases` 0 rows before and after; no CLI verb executed |
| No env var created, changed or removed | **yes** — GET only |
| No deploy | **yes** — `render deploys create` never invoked |
| No commit / push / merge / tag | **yes** |
| SafeScope dev DB untouched | **yes** — never connected to |
| 4 stashes | **yes** — `stash@{0}`–`stash@{3}`, unchanged |
| 23 tags, targets intact | **yes** — incl. `insite-visual-acceptance-verified-2026-08-19` → `5f050858` |
| Unrelated frontend theme work | **yes** — `kg-3e/unrelated-worktree-changes.sha256` **18/18 OK** |
| Prior evidence directories | **yes** — read only; nothing edited or re-scored |

---

## 14 — Terminal state

```
PRODUCTION_SHADOW_PREFLIGHT_BLOCKED — NO_GOVERNED_RELEASE_AND_SUBSYSTEM_NOT_DEPLOYED_IN_PRODUCTION
```

Stage-1 SHADOW cannot produce interpretable evidence in the current production state, for a reason
that is a release-management operation and not a defect: the governed subsystem is absent from the
live commit, the five KG migrations are unapplied, the review substrate does not exist, and there is
no governed release to shadow against. With no active release every comparison would classify
`RESOLVER_FAILURE` / `resolverHealth: NO_ACTIVE_RELEASE`, measuring nothing about the governed/legacy
gap.

**The telemetry-integrity question did NOT block, and did not require a probe.** The evidence
requirement, the traffic strategy, the `KG5D-DISC-01` disposition and the Stage-1 experiment design
are all settled and frozen, so nothing in this preflight needs revisiting once operations 1–11 run.

**No self-authorization is claimed beyond this state.**
