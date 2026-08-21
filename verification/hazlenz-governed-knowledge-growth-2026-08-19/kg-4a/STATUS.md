# KG-4A — final status

**KG-4A is COMPLETE.** All twenty-two phases are done.

> ## `KG_4A_COMPLETE — READY_FOR_ISOLATED_CUTOVER_VERIFICATION`

This does **not** mean production ready, deploy, activate for customers, or enable governed mode
globally. It means the next slice may exercise the controlled-cutover mechanism **in an isolated
environment under explicit enablement**.

Nothing was committed, pushed or deployed. No production system was modified. No release was
activated for customer use. **Default customer behaviour remains LEGACY.**

| Phase | State |
|---|---|
| 0 — preservation + KG-3F baseline reproduction | **done** — `baseline/` |
| 1 — current customer-path trace | **done** — `contracts/PHASE1_CUSTOMER_PATH_MAP.md` |
| 2 — cutover mode contract | **done** — 4 modes, default LEGACY |
| 3 — fallback contract | **done** — 84-row table, `contracts/fallback-matrix.json` |
| 4 — applicability uncertainty contract | **done** — axis independence proven, not asserted |
| 5 — 56.14132(b)(1) source decision | **done** — **GOVERNED**, 31/31 clause review, checksum-bound approval |
| 6 — governed resolution result type | **done** — one canonical contract, no loose booleans |
| 7 — release provenance propagation | **done** — incl. an anti-spoofing gate found and closed |
| 8 — mixed-provenance analysis | **done** — existing schema sufficient, no migration |
| 9 — release snapshot consistency | **done** — pin verified against a real activation race |
| 10 — fallback failure modes | **done** — 13 modes, no raw 500, `failure-matrix/` |
| 11 — observability | **done** — categorical, privacy-guarded, silent by default |
| 12 — shadow comparison contract | **done** — structurally unable to alter customer output |
| 13 — controlled enablement boundary | **done** — two independent locks, both default OFF |
| 14 — rollback contract | **done** — mode-only, future requests only, history intact |
| 15 — report contract | **done** — full lifecycle to a real generated report |
| 16 — browser contract | **done** — **240/240**, real Chromium, 4 themes, 2 modes |
| 17 — concurrency | **done** — activation race, approval race, parallel analyses |
| 18 — tenancy / security | **done** — enablement does not leak between accounts |
| 19 — performance | **done** — 0.793 ms/analysis, no N+1 |
| 20 — regression | **done** — no new unexplained regression |
| 21 — default-off proof | **done** — **51/51**, incl. a falsification check |

## Hard acceptance criteria — 20/20

| # | Criterion | State |
|---|---|---|
| 1 | LEGACY preserves current behaviour | **MET** — context is `null`; `suggest()` byte-identical |
| 2 | SHADOW cannot alter customer output | **MET** — structurally: it returns `null` backing input |
| 3 | governed/fallback behaviour explicitly defined | **MET** — 84 rows, machine-readable |
| 4 | applicability and backing remain separate | **MET** — both independence predicates, all rows |
| 5 | citation-only behaviour truthful | **MET** — every citation-only row discloses |
| 6 | no neighbouring regulation substituted | **MET** — `resolvedCitation === requestedCitation` always |
| 7 | governed provenance only on real influence | **MET** — 84/84 + server-side gate |
| 8 | mixed-provenance analyses truthful | **MET** — measured live: 2 governed, 2 fell back |
| 9 | one analysis, one pinned release | **MET** — activation race tested |
| 10 | fallback deterministic | **MET** — repeated calls identical, 13 modes |
| 11 | rollback without rewriting history | **MET** — mode-only |
| 12 | observability explains decisions | **MET** — one line per decision |
| 13 | enablement server-controlled, defaults OFF | **MET** — 8 environments, all LEGACY |
| 14 | cross-account enablement isolation | **MET** — same server, opposite results |
| 15 | report/UI semantics truthful | **MET** — 240/240 browser, report provenance |
| 16 | KG-3F determinism intact | **MET** — 170/170 · 54/54 · 16/16 · 48/48 |
| 17 | approval/provenance contract intact | **MET** — 57/57, digest unchanged |
| 18 | default behaviour disconnected | **MET** — 51/51 incl. falsification |
| 19 | production untouched | **MET** |
| 20 | unrelated work untouched | **MET** — 18/18, 4 stashes, 23 tags, HEAD |

## Registered commands

```
npm run test:kg4a-cutover-contract        # 146/146  pure
npm run test:kg4a-governed-resolution     #  99/99   owns test_kg4a_resolution_run
npm run test:kg4a-provenance-pinning      #  53/53   owns test_kg4a_gate_run
npm run test:kg4a-default-off             #  51/51   owns test_kg4a_defaultoff_run
npm run test:kg4a-governed-e2e            #  35/35   real HTTP, two accounts
npm run verify:kg4a-record-source         #  31/31   56.14132(b)(1) clause review
npm run report:kg4a-performance           #          owns test_kg4a_perf_run
```

`backend/package.json`: **+6 entries**, all prior entries preserved.

## Recommended KG-4B scope

1. **Isolated cutover verification.** Run a full inspection programme end-to-end in
   `GOVERNED_WITH_FALLBACK` with a real allowlisted account in an isolated environment. Measure
   shadow mismatch distribution across all 27 hazard families before any customer is enabled.
2. **Run SHADOW first, for real.** It is the only mode that produces the mismatch corpus needed to
   size the gap, and it cannot hurt anyone. This is the highest-value next step.
3. **Close `GOVERNED_RECORD_ABSENT`.** KG-3F's 137 declared-but-unemitted citations and 132
   not-safe-to-govern records are the population behind that reason code. The rule-to-corpus map
   already ranks them.
4. **Resolve the 42 duplicate declarations and 39 parent/child ambiguities** — they are what generate
   `APPROVED_SECTION_ONLY`, now measurable per citation.
5. **Operational surface for the mismatch feed** — reason-code counts per release, so a cutover
   decision is made on data rather than on confidence.
6. **Do not pursue `GOVERNED_STRICT` as a customer mode** until emitted-approved coverage is far
   above 23/160.
