# KG-4A Phase 20 — regression

## KG-1 → KG-3F preservation

| Suite | KG-3F | KG-4A | Database |
|---|---|---|---|
| retrieval determinism, 9 layouts | 170/170 | **170/170** | `SOURCE_DB=test_kg3f_remediation_20260820` (own layout DBs) |
| mirrored ranking adversarial | 54/54 | **54/54** | KG-3F corpus (read-only) |
| 56.14132 predicate matrix | 16/16 | **16/16** | none (pure) |
| citation granularity | 48/48 | **48/48** | KG-3F corpus **and** the KG-4A corpus containing the new record |
| approval contract | 57/57 | **57/57** | `test_kg3f_contract_20260820` → disposable `test_kg3f_contract_run` |
| governed shadow invariance | 7/7 | **7/7** | disposable per-layout clones |
| shadow report digest | `29469550cea4d2fd…` | **`29469550cea4d2fd`** on all 4 layouts | byte-identical |
| customer-path disconnection | 9/9 | **9/9** — *meaning changed, see below* | 3 databases |
| standards backing contract | 35/35 | **35/35** | `test_kg4a_regression_20260820` |
| reviewer approval | 62/62 | **62/62** | ″ |
| release integrity + approval | 44/44 | **44/44** | own DB `test_kg4a_mut_release_integrity` |
| regulatory release lifecycle | 42/42 | **pass** (all ok) | ″ |
| governed corpus matrix | 60/60 | **60/60** | own DB `test_kg4a_mut_governed_corpus_matrix` |
| KG-3D corpus remediation | 31/31 | **31/31** | own DB cloned from the KG-3F corpus |
| safescope standards | 15/15 | **15/15** | regression DB |
| standards corpus integrity | pass | **pass** | ″ |
| guided finding response | 28 | **28** | ″ |
| evidence foundation | 35 | **35** | ″ |
| hazlenz evidence boundary | 13 | **13** | ″ |
| hazlenz knowledge index | pass | **pass** | ″ |
| knowledge release provenance (KG-1) | 27/27 | **27/27** | regression DB + server :4330 |
| canonical workflow | pass | **pass** — 25 scenarios, 4 cross-user denials | ″ |
| finding-scoped reviews | pass | **pass** | ″ |
| persisted decomposition findings | pass | **pass** | ″ |
| **`test:hazlenz-core`** | 28 of 30 | **28 of 30** | ″ |
| build (`npm run build`) | exit 0 | **exit 0** | — |
| frontend `tsc --noEmit` | exit 0 | *not re-run — no frontend file changed (18/18 hashes verified)* | — |

## The two documented baseline failures — unchanged

Byte-identically the same two, and only those two:

* `Golden Hardening Scenarios Test` → *"7. LOTO energized maintenance (Not Guarding alone)"* —
  `Evidence gaps do not contain expected keyword "LOTO"`
* `HazLenz Production Path Regression` → *"FAIL tagged but not locked"*

## `MSHA-TRAFFIC-01`

The adjudicated 30/31 regulatory-correctness divergence is **preserved and not reverted**. The
protected gold-set artifact is read-only and hash-verified (`93184abc…647cd3`) by the harnesses that
consume it.

## Two suites that needed attention — both attributed

1. **`test:kg3d-corpus-remediation`** fails on a *clean seed* with
   `BASELINE: 1910.36 carried synthesized placeholder provenance`. It requires KG-3D's historical
   pre-remediation releases, which a clean seed does not contain. **Attributed by control**: the same
   failure reproduces identically on a control database seeded with the KG-4A record removed. Against
   a corpus that holds its fixtures it is **31/31**. Not a KG-4A regression, and not in KG-3F's own
   regression list.
2. **`test:knowledge-release-provenance`** genuinely failed mid-slice —
   *"All 3 multi-hazard findings inherit the analysis release"* — because KG-4A's per-finding
   narrowing was applied where there was no per-finding information to narrow by. **Fixed in
   production code, not in the test**: narrowing now applies only when a governed mode actually
   stamped findings. Back to **27/27**. Its fixture subclass was updated for the base method's new
   async signature; its semantics are unchanged.

## `test:entitlement-boundary` — the documented caveat

**Not run.** KG-4A modified no entitlement or authentication behaviour, and the suite references zero
KG modules. Its documented pre-existing condition — HTTP 429 on the first `/auth/register` from the
5/60s throttle, followed by a hang — **was reproduced incidentally** during KG-4A's own E2E work: both
account registrations and repeated logins hit the same throttle.

The response was to **wait the window out** (13 s between registrations; a bounded 6-attempt backoff
in the E2E and browser harnesses), **not** to weaken the throttle. Authentication throttling is
unchanged. This is classified as the pre-existing infrastructure characteristic KG-3C documented, not
as a KG-4A regression.

## KG-3F Phase 16 (CP-8) — a change of meaning, recorded not hidden

`test:kg3f-customer-path-disconnection` still reports **9/9**, and the pass is technically correct but
**no longer means what it meant in KG-3F**: KG-4A's resolver lives under `standards/`, which CP-8
excludes, and the cutover flag is read inside `standards/cutover/`, which CP-7 does not scan. Meanwhile
the customer path *does* now import `standards/cutover/governed-cutover-context`.

The surviving KG-3F claim is the narrow one: **no customer module imports the governed resolver,
lifecycle, review service or approval contract directly.** The broader claim — governed data is
unreachable from the customer path — is **deliberately superseded**, because building that reachability
under control is what KG-4A is for.

`test:kg4a-default-off` replaces it with the stronger, mode-aware claim and asserts transitive
reachability explicitly. **The KG-3F suite was left unmodified** — it is KG-3F evidence, and rewriting
it to describe KG-4A's architecture would destroy the record of what was true before.

## KG-4A's own suites

| Suite | Result |
|---|---|
| `test:kg4a-cutover-contract` (pure) | **146/146** |
| `test:kg4a-governed-resolution` (own DB) | **99/99** |
| `test:kg4a-provenance-pinning` (own DB) | **53/53** |
| `test:kg4a-default-off` (own DB) | **51/51** |
| `test:kg4a-governed-e2e` (real HTTP) | **35/35** |
| `verify:kg4a-record-source` | **31/31** |
| browser display contract (real Chromium) | **240/240** |
| **total** | **655** |
