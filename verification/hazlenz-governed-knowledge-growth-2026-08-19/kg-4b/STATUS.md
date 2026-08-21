# KG-4B — final status

**KG-4B is COMPLETE.** All twenty-two phases are done.

> ## `KG_4B_COMPLETE — READY_FOR_PRODUCTION_SHADOW_PLAN`

This means only that the **next slice may design the operational production-shadow rollout**. It does
**not** authorize deployment, configuration changes, or enabling SHADOW in production. Nothing was
committed, pushed or deployed; production was not touched; `GOVERNED_CUTOVER_MODE` remains unset
everywhere outside disposable verification servers.

| Phase | State |
|---|---|
| 0 — preservation + KG-4A baseline reproduction | **done** — `baseline/` |
| 1 — shadow event contract | **done** — 29 fields, schema `kg4b.shadow-comparison.v1` |
| 2 — mismatch taxonomy | **done** — 15 categories, all proven reachable |
| 3 — customer-output invariance oracle | **done** — 43/43, volatility measured not assumed |
| 4 — realistic isolated corpus | **done** — 31 gold-set + 12 KG-4B fixtures |
| 5 — family / regime coverage | **done** — 4 regimes, 10 observation shapes |
| 6 — multi-finding / mixed provenance | **done** — SHADOW writes no governed provenance |
| 7 — release pinning under SHADOW | **done** — activation race + approval race |
| 8 — provenance spoofing adversarial | **done** — 10 attacks, all NULL |
| 9 — mismatch corpus storage | **done** — JSONL; **no production schema created** |
| 10 — deduplication / event volume | **done** — 83 events, 83 keys, 0 duplicates |
| 11 — privacy review | **done** — 14 real markers searched in actual events |
| 12 — mismatch severity | **done** — 0 blocking in this corpus |
| 13 — root-cause buckets | **done** — 11 buckets, `EXPECTED_FALLBACK` first-class |
| 14 — shadow analytics | **done** — `analytics/shadow-analytics.json` |
| 15 — shadow determinism | **done** — 7 layouts, one digest |
| 16 — failure injection | **done** — 6 modes, customer stays legacy |
| 17 — performance | **done** — 1.187 ms/analysis, no N+1 |
| 18 — report / browser invariance | **done** — 576/576, incl. reload |
| 19 — current default-off authority | **done** — 48/48 on a live SHADOW server |
| 20 — full regression | **done** — no new unexplained regression |
| 21 — preservation | **done** — HEAD, 4 stashes, 23 tags, all manifests |

## Readiness gate — 16/16

| # | Criterion | State |
|---|---|---|
| 1 | SHADOW customer output is invariant | **MET** — 43/43 payloads, 576/576 browser, incl. reload |
| 2 | mismatch events are deterministic | **MET** — 7 layouts, one digest `0bce5a71…` |
| 3 | telemetry is privacy-safe | **MET** — 14 markers, 0 found, in real serialized events |
| 4 | event volume is bounded | **MET** — one event per (analysis × distinct citation), mean 2.18 |
| 5 | mismatch taxonomy is actionable | **MET** — 15 categories × 11 root causes, all reachable |
| 6 | severity identifies blocking cases | **MET** — 4 blocking categories defined and tested |
| 7 | no unresolved blocking mismatch | **MET** — **0 blocking** in the representative corpus |
| 8 | resolver failures cannot affect customer output in SHADOW | **MET** — 6 injections, all stay legacy |
| 9 | provenance spoofing remains closed | **MET** — 10 attacks, all NULL |
| 10 | SHADOW does not write governed customer provenance | **MET** — NULL through the real persistence path |
| 11 | release pinning remains coherent | **MET** — one release per analysis through an activation race |
| 12 | performance overhead is acceptable | **MET** — 1.187 ms/analysis; telemetry 0.019 ms/event |
| 13 | default-off behaviour remains proven | **MET** — 48/48 on a live SHADOW server |
| 14 | KG-3F/KG-4A foundations intact | **MET** — 170 · 54 · 16 · 48 · 57 · 7 · 9 · all KG-4A |
| 15 | production remains untouched | **MET** |
| 16 | unrelated work remains untouched | **MET** — 18/18, 22/22, 4 stashes, 23 tags, HEAD |

## Registered commands

```
npm run test:kg4b-shadow-contract         # 123/123  pure
npm run run:kg4b-shadow-corpus            # 145/145  real HTTP, 43 analyses
npm run report:kg4b-shadow-analytics      #          aggregates + volume
npm run test:kg4b-shadow-adversarial      #  84/84   owns test_kg4b_adversarial_run
npm run test:kg4b-shadow-determinism      #  18/18   owns 7 layout databases
npm run test:kg4b-privacy-review          #  26/26
npm run test:kg4b-default-off             #  48/48   live SHADOW server
npm run report:kg4b-shadow-performance    #          owns test_kg4b_perf_run
```

`backend/package.json`: **+8 entries**, all prior entries preserved.

## The result, stated plainly

83 comparisons over 43 realistic analyses, four regimes, ten observation shapes:

* **41 exact matches (49.4%)** — governed and legacy agree on citation, availability and content
* **15 governed-missing (18.1%)** — `EXPECTED_FALLBACK`; the customer sees today's behaviour
* **14 granularity differences (16.9%)** — section-only; **no promotion occurs**
* **13 applicability differences (15.7%)** — approved text beside an unestablished trigger
* **0 blocking · 0 jurisdiction · 0 content · 0 resolver failure · 0 integrity failure**
* **54/54** events carrying both digests **agree** — where governed content exists, it is the same
  text the customer already sees

## What would have to be true before a production shadow

None of these blocks the *plan*; each belongs in it.

1. **Volume at real traffic.** 2.18 events per analysis measured here. Multiply by real analysis
   volume and decide retention before turning anything on.
2. **A durable store, if one is needed.** KG-4B deliberately created no production schema. If
   production shadow needs durable events, that schema and its retention contract are KG-4C work.
3. **`test:regulatory-release-lifecycle` must own a disposable database.** It replaces every release
   row; KG-4B's own regression ordering was caught by this.
4. **The corpus is 43 analyses, not production traffic.** `CONTENT_DIFFERENCE`,
   `JURISDICTION_DIFFERENCE`, `CITATION_DIFFERENCE`, `INTEGRITY_FAILURE`, `ORDERING_DIFFERENCE`,
   `CONTENT_EQUIVALENT` and `PROVENANCE_DIFFERENCE` were **never observed** — they are defined and
   unit-reachable but unexercised by real traffic. That is the single strongest reason to run a real
   production shadow: to find out whether they occur at all.

## Recommended KG-4C scope

1. **Design the production-shadow rollout** — enablement boundary, per-account or per-organization,
   ramp, and an explicit stop condition tied to `BLOCKING` count.
2. **Decide the event store and retention.** JSONL was right for an isolated slice; production needs
   a decision with a retention contract, and the schema is already specified by `shadow-taxonomy.json`.
3. **Build the operational mismatch feed** — reason-code and severity counts per release, so a cutover
   decision is made on data rather than confidence.
4. **Give `test:regulatory-release-lifecycle` an owned database.**
5. **Close `GOVERNED_MISSING`** — KG-3F's 137 declared-but-unemitted citations are the population
   behind 18% of this corpus.
6. **Resolve the 39 parent/child ambiguities** — they generate the `GRANULARITY_DIFFERENCE` 17%.
7. **Do not enable `GOVERNED_WITH_FALLBACK` for customers** until a production shadow has run long
   enough to exercise the seven unobserved categories.
