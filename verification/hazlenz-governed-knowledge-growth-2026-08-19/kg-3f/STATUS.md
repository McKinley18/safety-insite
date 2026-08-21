# KG-3F — final status

**KG-3F is COMPLETE.** All nineteen phases are done. Final readiness classification:

> ## `KG_3F_COMPLETE — READY_FOR_CONTROLLED_CUTOVER_DESIGN`

Controlled cutover design has **not** been started, per instruction. Nothing was committed, pushed
or deployed.

| Phase | State |
|---|---|
| 0 — preservation + KG-3E baseline reproduction | **done** |
| 1 — full `suggest()` pipeline trace | **done** — `phase1-suggest-pipeline-trace.md` |
| 2 — deterministic candidate-universe design | **done** |
| 3 — adversarial 9-layout determinism harness | **done** — 98/170 before, **170/170** after |
| 4 — semantic ranking regression + keyword scoring defect | **done** — **54/54** |
| 5–7 — 56.14132 predicate reconciliation | **done** — **16/16**, `phase5-7-56-14132-adjudication.md` |
| **8–10 — approval checksum / provenance contract** | **done** — **57/57**, `phase8-10-approval-provenance-contract.md` |
| 11–12 — declared-but-unemitted inventory + rule-to-corpus map | **done** — full schema, 160 citations |
| 13 — governed shadow across layouts | **done** — byte-identical, now a registered harness |
| **14 — hazard-family cutover readiness** | **done** — 27 families, **0 blocked** |
| **15 — Standard Detail browser regression** | **done** — **376/376**, real Chromium, 4 themes |
| **16 — customer-path disconnection proof** | **done** — **9/9** on three databases |
| **17 — full regression** | **done** — no new unexplained regression |
| **18 — adversarial determinism repeat** | **done** — 170/170 · 54/54 · 16/16 after every edit |
| **19 — preservation** | **done** — HEAD, stashes, tags, 18/18 unrelated files all unchanged |

## Hard acceptance criteria — 16/16

| # | Criterion | State |
|---|---|---|
| 1 | `suggest()` invariant to physical row order | **MET** — 170/170 across 9 layouts |
| 2 | determinism does not reduce semantic correctness | **MET** — improved (silica 15→51) |
| 3 | 1910.303 granularity contract intact | **MET** — 48/48 |
| 4 | 56.14132(a) no longer falsely backed | **MET** |
| 5 | (b)(1) not promoted without its conditions | **MET** — 16/16 |
| 6 | emitted coverage truthful | **MET** — 23/23, by correcting the citation, not fabricating a record |
| 7 | checksum/provenance semantics defined + tested | **MET** — 57/57, 10-class matrix |
| 8 | substantive changes invalidate approval | **MET** — incl. granularity + force, which v1 missed |
| 9 | historical approvals not silently rewritten | **MET** — append-only, explicit reaffirmation |
| 10 | rule-to-corpus gaps measured | **MET** — 160 citations, full schema |
| 11 | approved-only shadow deterministic | **MET** — byte-identical, sha256 `29469550cea4d2fd…` |
| 12 | hazard-family readiness measured | **MET** — 27 families, 0 blocked |
| 13 | Standard Detail truthful | **MET** — 376/376, both axes independent |
| 14 | customer retrieval disconnected | **MET** — 9/9 |
| 15 | production untouched | **MET** |
| 16 | unrelated work untouched | **MET** — 18/18 |

## Registered verification commands

```
npm run test:kg3f-retrieval-determinism          # 170/170  (SOURCE_DB=…)
npm run test:kg3f-ranking-adversarial            # 54/54
npm run test:kg3f-56-14132-predicate             # 16/16
npm run test:approval-contract                   # 57/57    KG-3F Phases 8–10
npm run test:kg3f-shadow-invariance              # 7/7      KG-3F Phases 13+18
npm run test:kg3f-customer-path-disconnection    # 9/9      KG-3F Phase 16
npm run report:kg3f-family-readiness <release>   # KG-3F Phase 14
npm run report:kg3f-rule-to-corpus <release>     # 160-citation governance map
npm run probe:kg3f-retrieval                     # single-DB retrieval probe
```

`backend/package.json` delta: **26 insertions, 0 deletions**, all prior entries preserved
(22 from the earlier session + 4 registered here).

## Production files changed by KG-3F (cumulative)

| File | Change |
|---|---|
| `applicable-standards/citation-structure.ts` *(new)* | structured CFR citation identity |
| `applicable-standards/applicable-standards.service.ts` | structured `isCitationMatch`; terminal tie-break; `ORDER BY` ×3; `s.keywords` selected; capped keyword scoring |
| `safescope-v2/evidence/shared-evidence-facts.ts` | `rearViewState`, `reverseWarningAlternative`, `hornState` extraction |
| `safescope-v2/evidence/evidence-foundation.ts` | 56.14132 split into the (a) horn rule and the (b)(1)/section backing rule |
| `standards/releases/approval-contract.ts` *(new)* | **the approval/provenance contract + `canonicalDigest`** |
| `database/migrations/1800000014000-ApprovalProvenanceContract.ts` *(new)* | additive, reversible; 10 nullable columns + 2 indexes |
| `standards/releases/regulatory-release-record.entity.ts` | approval identity alongside manifest identity |
| `standards/releases/regulatory-release-record-review.entity.ts` | decision-time binding + `supersedesDecisionId` |
| `standards/releases/release-record-review.service.ts` | `approvalDigestMatches` gate; digests recorded on decisions; **carry-forward corrected to match on `approvalDigest`**; `describeContractReaffirmationCandidates()`; `describeLiveCorpusDrift()` |
| `standards/seed/finalize-regulatory-release.ts` | stamps the approval identity from the same in-memory normalized row the manifest covers |

**Manifest identity preserved:** a clean seeded finalization still reproduces
`bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2`.

## Adjudicated divergence — not a regression

`MSHA-TRAFFIC-01` 31/31 → **30/31**, classified
`PROTECTED_BASELINE_EXPECTATION_ADJUDICATION_REQUIRED`. The protected gold-set artifact is preserved
byte-for-byte (sha256 `93184abc…647cd3`). Full record: `MSHA-TRAFFIC-01-adjudication.md`.

## Known non-KG-3F items

* **Two documented baseline failures** reproduce byte-identically and only those two:
  `Golden Hardening Scenarios Test` (*"7. LOTO energized maintenance (Not Guarding alone)"*) and
  `HazLenz Production Path Regression` (*"FAIL tagged but not locked"*). 28 of 30 suites pass.
* **`test:entitlement-boundary` not run to completion.** Fails at its first `/auth/register` with
  HTTP 429 (the throttler is 5/60s per IP) and then hangs — the pre-existing infrastructure
  characteristic KG-3C documented. The suite contains **zero** references to any KG module and no
  KG-3F change touches it.

## Next slice

Controlled cutover **design** — explicitly not started here. See the final report for the
recommended shape.
