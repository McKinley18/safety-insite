# KG-4B Phase 20 — regression

## KG-1 → KG-4A preservation

| Suite | Expected | KG-4B | Database ownership |
|---|---|---|---|
| retrieval determinism, 9 layouts | 170/170 | **170/170** | own layout DBs |
| mirrored ranking adversarial | 54/54 | **54/54** | KG-3F corpus, read-only |
| 56.14132 predicate matrix | 16/16 | **16/16** | none (pure) |
| citation granularity | 48/48 | **48/48** | own clean DB — see the note below |
| approval contract | 57/57 | **57/57** | own `test_kg3f_contract_run` |
| governed shadow invariance (KG-3F) | 7/7 | **7/7** | disposable per-layout clones |
| customer-path disconnection (KG-3F) | 9/9 | **9/9** | regression DB |
| standards backing contract | 35/35 | **35/35** | regression DB |
| reviewer approval | 62/62 | **62/62** | regression DB |
| regulatory release lifecycle | 42 | **42 ok, 0 failures** | **mutating — see below** |
| governed corpus matrix | 60/60 | **60/60** | own `test_kg4b_mut_governed_corpus_matrix` |
| release integrity + approval | 44/44 | **44/44** | own `test_kg4b_mut_release_integrity` |
| KG-3D corpus remediation | 31/31 | **31/31** | own clone of the KG-3F corpus |
| safescope standards | 15/15 | **15/15** | regression DB |
| standards corpus integrity | pass | **all invariants passed** | regression DB |
| guided finding response | 28 | **28** | regression DB |
| evidence foundation | 35 | **35** | regression DB |
| hazlenz evidence boundary | 13 | **13** | regression DB |
| hazlenz knowledge index | pass | **Validation Passed** | regression DB |
| knowledge release provenance (KG-1) | 27/27 | **27/27** | regression DB + server :4341 |
| canonical workflow | pass | **pass** | ″ |
| finding-scoped reviews | pass | **pass** | ″ |
| persisted decomposition findings | pass | **pass** | ″ |
| **`test:hazlenz-core`** | 28 of 30 | **28 of 30** | ″ |
| backend build | exit 0 | **exit 0** | — |
| frontend `tsc --noEmit` | exit 0 | **exit 0** | — |

### KG-4A suites

| Suite | KG-4A | KG-4B |
|---|---|---|
| `test:kg4a-cutover-contract` | 146 | **146/146** |
| `test:kg4a-governed-resolution` | 99 | **99/99** |
| `test:kg4a-provenance-pinning` | 53 | **53/53** |
| `test:kg4a-default-off` | 51 | **51/51** |
| `verify:kg4a-record-source` | 31 | **31/31** |

### KG-4B suites

| Suite | Result |
|---|---|
| `test:kg4b-shadow-contract` (pure) | **123/123** |
| `test:kg4b-shadow-adversarial` (own DB) | **84/84** |
| `test:kg4b-shadow-determinism` (7 own DBs) | **18/18** |
| `test:kg4b-privacy-review` | **26/26** |
| `test:kg4b-default-off` (live SHADOW server) | **48/48** |
| `run:kg4b-shadow-corpus` (43 analyses, real HTTP) | **145/145** |
| browser shadow invariance (real Chromium) | **576/576** |
| **total KG-4B** | **1020** |

## The two documented baseline failures — unchanged

Byte-identically the same two, and only those two:

* `Golden Hardening Scenarios Test` → *"7. LOTO energized maintenance (Not Guarding alone)"*
* `HazLenz Production Path Regression` → *"FAIL tagged but not locked"*

## `MSHA-TRAFFIC-01`

The adjudicated 30/31 regulatory-correctness divergence is **preserved and not reverted**. The
protected gold set is read-only and hash-verified (`93184abc…647cd3`) by every harness that reads it,
including KG-4B's corpus loader.

## Manifest determinism

A clean seed reproduces **35 records / `14a34feaa670d5d0…`** — identical to the value KG-4A recorded
after sourcing `30 CFR 56.14132(b)(1)`. The pre-KG-4A `bee47ebe…` describes a 34-record corpus that no
longer exists and is **not** treated as an invariant.

## A database-ownership finding

**`test:regulatory-release-lifecycle` is a MUTATING suite.** It replaces every row in
`regulatory_releases` with its own `kg2-fixture-release.*` fixtures. Running it against the shared
regression database destroyed `federal-core-2026-07-30.1` there, and the citation-granularity suite —
run afterwards against the same database — correctly reported 23/48 because the release it needs no
longer existed.

Attributed by control: granularity is **48/48** on its own freshly seeded database, and **48/48**
against both approval-bearing corpora. This is the KG-4B hard guardrail catching a real violation in
my own regression ordering, not a product regression. `test:regulatory-release-lifecycle` should own a
disposable database like the other mutating suites.

## `test:entitlement-boundary` — the documented caveat

**Not run.** KG-4B modified no entitlement or authentication behaviour and the suite references zero
KG modules. Its documented pre-existing condition — HTTP 429 on `/auth/register` from the 5/60s
throttle, then a hang — **was reproduced incidentally**: account registration and repeated logins hit
it throughout KG-4B.

The response was to **wait the window out** (13 s between registrations, a bounded 6-attempt backoff
in every harness) and to **pace the classify throttle at 28/60s** rather than raise either limit.
**Authentication throttling is unchanged.** Classified as the pre-existing infrastructure
characteristic KG-3C documented, not a KG-4B regression.
