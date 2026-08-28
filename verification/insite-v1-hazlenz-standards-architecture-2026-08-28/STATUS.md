# HazLenz deterministic standards architecture and coverage closure — 2026-08-28

```
TERMINAL = HAZLENZ_STANDARDS_COVERAGE_BLOCKED
           — AUTHORITATIVE_SOURCE_MATERIAL_REQUIRED
```

The architecture is sound, materializable and jurisdiction-safe. It is blocked on
regulatory source material that is not in the repository and that must not be
guessed, fabricated or copied from an uncontrolled source.

**No production source file was changed by this phase.**

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main` |
| commit / push / tag / deploy / reset / restore / clean / stash / rebase | **none performed** |
| production mutated | **no** |
| provider calls | **0** |
| stashes / tags | 4 / 24, untouched |

Production-authority hashes, unchanged by this phase:

| path | SHA-256 |
|---|---|
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `efd27758e699573843a70e066a6179a5b9fb4f4dc30d9b6cc6053a69ab305a81` |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` | `d7d091d858048baf8d73a652621c698cf67e3628a118096fd332dada64d386c2` |
| `backend/src/applicable-standards/applicable-standards.service.ts` | `9b52adf4b663ec1dfff603334b2f83a179ebd93e562082968d99dac4acb4ab68` |

## 2. Phase 1 — the authoritative standards architecture, determined by execution

There are **three** standards mechanisms, and they are not layers of one system.

| # | mechanism | what it is | what it feeds | size |
|---|---|---|---|---|
| 1 | **governed source set** (`standards/releases/governed-source-set.ts`) | the authoritative governed record set, derived purely from two version-controlled artifacts (`SAFESCOPE_CURATED_STANDARDS`, 8 records; `STANDARDS_INTELLIGENCE_SEED`, 35 unique citations) with **zero database access** | `standards_master` via the seed pipeline, and governed releases | **35 records** |
| 2 | **`standards_master`** | the retrieval corpus `ApplicableStandardsService.suggest()` queries | analysis-level `suggestedStandards` / `primaryStandards` | 35 when seeded; **documented at 2,390 legacy eCFR rows in production** |
| 3 | **`evidence-foundation.ts`** | a code-resident applicability rule set, DB-free | **customer FINDING citations** (`sourceCandidate.standardCandidates`), which the finding view and the report PDF read | **30 citations, ~12 families** |

### Answers to the questions this phase asked

* **Which source is intended to be authoritative?** The governed source set (#1). It
  is the only one with registry keys, authority tier, allowed use and a release
  manifest, and it is deliberately DB-free so a release can be built without
  mutating the live corpus (the KG-5B fix for KG5A-DISC-01).
* **Which source produces customer-facing FINDING citations?** **#3, and only #3.**
  Measured: with the governed corpus fully materialized, the finding-level result
  did not move by a single citation. The finding path never consults the corpus.
* **Is `evidence-foundation.ts` the complete standards authority, a fallback, or an
  evidence helper?** By its file-level intent it is an evidence/applicability
  helper. **By its position in the product it is the de-facto authority for every
  citation a customer sees on a finding and in the report.** That mismatch is the
  central architectural finding of this phase.
* **Why was `standards_master` empty?** Because nothing had ever seeded the local
  development database or the disposable databases. Zero rows is expected in an
  unseeded disposable environment and is **not** evidence of a broken runtime — the
  intended mechanism materializes it correctly (§4). It **is** evidence that the
  development database has never represented the production standards runtime, so
  every local standards measurement before this phase ran against an empty corpus.
* **Where does the governed corpus live?** In version control, as the two source
  artifacts above. Not in a database, by design.
* **How is it materialized?** `npm run seed:safescope-standards` — three stages:
  seed the curated records, project the intelligence catalogue into
  `standards_master`, finalize a regulatory release. Guarded by
  `legacy-corpus-guard`, which refuses to run against a corpus holding rows the
  governed set does not name (i.e. production) and has **no override**.
* **What happens when the corpus is unavailable?** Analysis-level suggestions become
  empty. Finding-level citations are unaffected, because they are code-resident.
  A citation with no corpus content resolves to `CITATION_ONLY` under the
  standards-backing contract and still stands on the evidence decision that
  produced it.
* **Can a customer receive a hazard finding with no standard because the
  authoritative source failed to load?** For the finding-level path, **no** — it does
  not depend on the corpus. For the analysis-level path, **yes**, and it is empty
  today in every local environment.
* **Does jurisdiction correctly constrain the applicable corpus?** **Yes — measured,
  with zero leakage** (§7).

### The cutover posture

`DEFAULT_CUTOVER_MODE = 'LEGACY'`, and no missing variable can enable cutover. So
the governed release path is built and shadow-testable but **is not serving
customers**; analysis-level standards come from the legacy corpus.

## 3. Phase 3 — inventory of existing standards content

Measured on the materialized runtime.

| dimension | value |
|---|---|
| governed records | **35** (unique by regulatory identity) |
| by agency | OSHA **24**, MSHA **11** |
| by scope | general industry **13**, construction **11**, mining **11** |
| release | `federal-core-2026-07-30.1`, **provisional**, manifest `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b` |
| review state | **35 mechanically_validated, 0 reviewer_approved** |
| placeholder-provenance records | 0 |
| finding-level rule citations | 30, across ~12 families |
| citations emitted by rules with **no** corpus record behind them | at least 3 (`29 CFR 1926.1425`, `30 CFR 56.12025`, `30 CFR 56.15005`) |

The manifest checksum reproduces the recorded KG value exactly, so the
materialization is the reviewed content and not a re-derivation.

**0 of 35 records are reviewer-approved**, so under the standards-backing contract
no record can be presented as `APPROVED_GOVERNED_CONTENT` today.

## 4. Phase 4 — the disposable standards runtime materialized

Database `test_v1_standards_architecture_20260828`, created for this phase; target
proved against the repository's own disposable allowlist before any migration, and
`DATABASE_URL` set explicitly so it could not be redirected. Production and the
`safescope` development database were never migrated, seeded or mutated.

| requirement | result |
|---|---|
| corpus materializes through the intended supported mechanism | **VERIFIED** — 35 records via `npm run seed:safescope-standards`, no manual row insertion |
| active knowledge release is deterministic | **VERIFIED** — manifest reproduces `14a34fea…` |
| jurisdiction filtering works | **VERIFIED** — §7 |
| standards survive restart | **VERIFIED** — served across API restarts |
| inspection analysis can consume them | **PARTIAL** — the service returns correctly ranked results when a jurisdiction is resolved, and **nothing** when one is not (§6) |
| findings can persist citations and provenance | **VERIFIED** — citations persisted on findings and rendered into the report PDF in the previous phase's workflow verification |

So the terminal is **not** `HAZLENZ_STANDARDS_ARCHITECTURE_BLOCKED`: the intended
mechanism does materialize a usable standards runtime.

## 5. Phase 5 — the 43-group corpus re-run under each jurisdiction

`measurements/actionable-*.json`. The hazard floor is **jurisdiction-invariant**.

| regulatory context | actionable coverage | life-critical | standard matched | no standard applicable | expected but missing |
|---|---|---|---|---|---|
| `unknown` (legacy posture) | **43/43** | **35/35** | 16 | 1 | 26 |
| OSHA general industry | **43/43** | **35/35** | 13 | 1 | 29 |
| OSHA construction | **43/43** | **35/35** | 13 | 1 | 29 |
| MSHA | **43/43** | **35/35** | 7 | 1 | 35 |

Two findings matter more than the totals:

1. **Materializing the governed corpus changed the finding-level result by exactly
   zero.** The original 16 / 1 / 26 reproduced identically with 35 governed records
   loaded. The gap was never an empty-corpus artefact.
2. **Pinning a jurisdiction correctly *reduces* matches.** Under general industry,
   `B-03` and `B-14` (excavation) and `B-13` (silica) lose their construction
   citations — which is right: a general-industry inspection must not be handed
   `1926.652`. Under MSHA only 30 CFR can match, and the count falls accordingly.
   This is the contract working, not a regression.

Per-group classification, across all four runs:

| classification | count |
|---|---|
| `CORRECT_STANDARD_MATCH` | 16 / 13 / 13 / 7 (by context above) |
| `NO_STANDARD_APPLICABLE` | 1 |
| `STANDARD_EXPECTED_BUT_MISSING` | 26 / 29 / 29 / 35 |
| **`WRONG_STANDARD`** | **0** |
| **`WRONG_JURISDICTION`** | **0** |
| `AMBIGUOUS_REQUIRES_CLARIFICATION` | 0 asserted; the engine emits `needs_more_evidence` candidates rather than silence |

## 6. The two measured architectural defects

### 6.1 The finding-level authority does not consult the governed corpus `KNOWN_GAP`

Customer finding citations come from a code-resident rule set covering about twelve
families. Nine families that InSite recognises, materialises as findings, risk-scores
and prints in the report have **no rule at all**: hot work, fire/explosion,
compressed gas, confined space, PPE, respiratory protection, material handling,
environmental release, ventilation.

Of these, the governed corpus **already holds a record** for two —
`29 CFR 1910.146` (confined space) and `29 CFR 1910.132(a)` / `1926.95(a)` /
`30 CFR 56.15006` (PPE) — plus powered industrial trucks. Those are repairable
without new source material, but only by connecting the finding path to the corpus,
which is an architectural change, not a rule addition. **Adding more hand-written
rules would deepen the parallel library this phase exists to diagnose**, so no rule
was added.

### 6.2 The DB-backed path returns nothing when no jurisdiction is resolved `KNOWN_GAP`

Root-caused to one line. `ApplicableStandardsService.suggest()` admits a candidate
at `score >= 10`; the only jurisdiction-dependent contribution is
`if (siteType && standard.scopeCode === siteType) score += 15`. With a site type
resolved, every in-scope row clears the threshold on that bonus alone. With none
resolved, the remaining relevance signal (title words at 6, keyword tags at 4)
did not reach 10 for **any** candidate — measured: 12 candidates retrieved, 0
returned, for textbook LOTO text with `29 CFR 1910.147` present in the corpus.

The sibling path already fixed this exact defect class: `evidence-foundation.ts`
records that gating rules on a confirmed jurisdiction produced "zero standard
candidates for any finding, however textbook, until a user manually picked a
specific regulatory scope", and replaced it with gates that proceed under an
unknown regime while keeping the jurisdiction predicate honestly `UNKNOWN`.

**Not repaired here, deliberately.** The fix changes which standards every customer
sees on the legacy path, whose production corpus is documented at 2,390 rows and is
not reachable from this authorization. Changing a relevance threshold without
production-corpus evidence is exactly the "broaden a rule to make the metric pass"
this phase forbids. Recorded as a defect with its root cause and its blast radius.

**Mitigating fact:** the accepted product contract requires new inspections to carry
an explicit regulatory context (`REGULATORY_CONTEXT_OPTIONS` offers the three;
`unknown` is retained "for legacy and incomplete records"), so this state is
reachable through legacy records and the raw classify API rather than the shipping
inspection flow.

## 7. Phases 7 and 8 — jurisdiction safety and adversarial matching

`backend/src/safescope-v2/tests/hazlenz-standards-jurisdiction-gate.ts`
(SHA-256 `450fe95b9ad7504e92291732642b87bbae75b28cce708ba3c60d9c87f075427a`),
registered as the 35th suite of `npm run test:hazlenz-core` and as
`npm run test:hazlenz-standards-jurisdiction` — **16 checks, 0 failures, 0
wrong-jurisdiction citations.**

Cross-jurisdiction leakage, measured end to end over the whole 43-group corpus:

| context | citations emitted | 1910 | 1926 | 30 CFR |
|---|---|---|---|---|
| OSHA general industry | 5 | **5** | 0 | 0 |
| OSHA construction | 7 | 0 | **7** | 0 |
| MSHA | 5 | 0 | 0 | **5** |
| unknown | 17 | 5 | 7 | 5 (all three offered as conditional candidates, which is the documented behaviour) |

The gate also holds the negative controls: a verified lockout, a correctly fitted
guard, an explicitly negated hot-work statement, a covered floor opening, an
administrative training record, a secured cylinder, a walkway named only as a
location, and a filed noise survey all emit **no** citation. Adjacent-but-inapplicable
specificity is not manufactured.

## 8. Phase 6 — repair classification

Every missing group was classified before any repair was attempted.

| family | governed record available? | classification |
|---|---|---|
| confined space | **yes** (`29 CFR 1910.146`) | `REPAIRABLE_FROM_EXISTING_CORPUS` — needs the finding path connected to the corpus |
| PPE | **yes** (`1910.132(a)`, `1926.95(a)`, `56.15006`) | `REPAIRABLE_FROM_EXISTING_CORPUS` |
| powered industrial trucks | **yes** (`1910.178(p)(1)`, `56.9100(a)`, `1926.602(a)(9)(ii)`) | `REPAIRABLE_FROM_EXISTING_CORPUS` |
| hot work | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.252`, `1926.352`) |
| fire / explosion | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.157`, `1926.150`) |
| compressed gas | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.101`, `1910.253`) |
| respiratory protection | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.134`, `1926.103`) |
| ventilation / air quality | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** |
| cranes, rigging, suspended loads | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.179`/`184`, `1926.1400`-series) |
| material handling and storage | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.176`, `1926.250`) |
| environmental release | no | **`AUTHORITATIVE_SOURCE_REQUIRED`** (`1910.120`) |

**No repair was performed**, for the reason the phase itself specifies: the
dominant class requires authoritative regulatory source material that is absent
from the repository, and it must not be guessed or copied from an uncontrolled
source. The three corpus-repairable families are held back with them because the
correct fix for all of them is the same architectural change — routing finding-level
citations through the governed corpus — and doing two families by hand would
entrench the parallel library instead of retiring it.

## 9. Phase 10 — regression

| suite | result |
|---|---|
| `npm run test:hazlenz-core` | **35/35 PASS**, unrelaxed (266 sub-assertions reported) |
| `npx tsc --noEmit` | clean |
| `test:hazlenz-precision` / `test:hazlenz-level1-recall` / `test:hazlenz-actionable-coverage` | PASS |
| `test:hazlenz-standards-jurisdiction` (new) | PASS, 16 checks |
| **`golden-standards-tests`** | **15 passed, 0 failed — EXECUTED FOR THE FIRST TIME** |
| `standard-applicability-regression` | PASS |
| `hazlenz-primary-citation-visible-contract-regression` | PASS |
| `validate-safescope-multi-hazard-decomposition-v1` / `-generalization-intelligence-v1` | PASS |
| `hazlenz-generalization-regression` / `-energy-isolation-negation` / `-condition-state-invariants` | PASS |

**`golden-standards-tests` was UNVERIFIED in all three preceding phases.** Its
protected-corpus guard **permits** execution against a `test_*` database; it had
simply never had a corpus-loaded disposable database to run against. **No guard was
bypassed and the `safescope` override was not set.**

**NEW_REGRESSION: none.** The four known failures — `domain-association-regression`,
`golden-hazard-tests` (1/12), `hazlenz-vague-candidate-promotion-regression` (2),
`hazlenz-standard-return-contract-regression` (9) — are byte-identical to the prior
accepted state.

**Still UNVERIFIED:**

| surface | reason |
|---|---|
| production legacy corpus behaviour | documented at 2,390 eCFR rows with NULL `source_key`; not reachable from this authorization |
| `safescope_knowledge_chunks` retrieval path | 0 rows in both the development and the disposable database; `suggest()`'s primary retrieval could not be exercised |
| reviewer-approved governed content | 0 of 35 records approved, so `APPROVED_GOVERNED_CONTENT` was never produced |
| governed cutover modes above LEGACY | not enabled; out of scope for this phase |

## 10. Phase 11 — marketing-claim reconciliation

Read from `frontend-next/app/page.tsx`. **No wording was changed.**

| claim | verdict | required qualification |
|---|---|---|
| "the applicable MSHA and OSHA standards suggested" | **NEEDS_QUALIFICATION** | true in kind, overstated in extent: 35 governed records over three regimes, and 9 recognised hazard families receive no standard at all. "Suggested" is doing correct work — the product does not claim completeness — but a customer would reasonably read "the applicable standards" as coverage of the cited regimes. |
| "let HazLenz AI organize the hazard review and the standards behind it" | **SUPPORTED** | "the standards behind it" is accurate for the families that are covered. |
| "the standards, the corrective actions and the reports for $X a month" | **NEEDS_QUALIFICATION** | same extent issue; the feature exists and works. |
| implicit claim of complete OSHA/MSHA coverage | **UNSUPPORTED if ever made** | not currently made in the copy read. |

Recommended for the v1.0 polish phase: state the covered scope honestly — e.g.
"suggests applicable OSHA and MSHA standards for the hazard families HazLenz
covers" — and surface the coverage manifest where a prospective customer can see
which regimes and families are included. **Product scope was not silently altered
to preserve the language.**

## 11. Expert readiness

See `EXPERT_HAZLENZ_READINESS_REASSESSMENT.md`. Six blockers remain open and one
new constraint is added: Expert HazLenz must never become the regulatory source of
truth, and any Expert-proposed citation must be validated against the governed
deterministic authority before it is shown to a customer as applicable.

```
EXPERT_HAZLENZ_IMPLEMENTED = FALSE
PROVIDER_CALL_IMPLEMENTED  = FALSE
PROVIDER_CALLS_MADE        = 0
```
