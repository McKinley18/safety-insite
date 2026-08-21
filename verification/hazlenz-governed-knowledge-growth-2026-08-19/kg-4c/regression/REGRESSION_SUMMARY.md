# KG-4C regression summary

Measured on the KG-4C regression environment (`test_kg4c_regression_20260821`, 46 migrations,
35 records, manifest `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`) and the
recorded KG source corpora, read-only.

| Suite | Recorded baseline | KG-4C result |
|---|---|---|
| `test:kg3f-retrieval-determinism` | 170/170 | **170/170** |
| `test:kg3f-ranking-adversarial` | 54/54 | **54/54** |
| `test:kg3f-56-14132-predicate` | 16/16 | **16/16** |
| `test:kg3e-citation-granularity` | 48/48 | **48/48** |
| `test:approval-contract` | 57/57 | **57/57** |
| `test:kg3f-shadow-invariance` | 7/7, `29469550cea4d2fd…` | **7/7, digest reproduced** |
| `test:kg4a-cutover-contract` | 146/146 | **146/146** |
| `test:kg4a-governed-resolution` | 99/99 | **99/99** |
| `test:kg4a-provenance-pinning` | 53/53 | **53/53** |
| `test:kg4a-default-off` | 51/51 | **51/51** |
| `test:kg4b-shadow-contract` | 123/123 | **123/123** |
| `test:kg4b-shadow-adversarial` | 84/84 | **84/84** |
| `test:kg4b-shadow-determinism` | 18/18, `0bce5a71…` | **18/18, digest reproduced** |
| `test:kg4b-privacy-review` | 26/26 | **26/26** |
| `test:governed-corpus-matrix` | 60/60 | **60/60** |
| `test:release-integrity-and-approval` | 44/44 | **44/44** |
| `test:regulatory-release-lifecycle` | pass | **42/42** on its owned database |
| `test:hazlenz-core` | 28 of 30 suites | **28 of 30**, the two documented failures only |
| backend `npm run build` | exit 0 | **exit 0** |
| `frontend-next` `npx tsc --noEmit` | exit 0 | **exit 0** |

## New KG-4C suites

| Suite | Result |
|---|---|
| `test:kg4c-production-shadow-contract` | **438/438** |
| `test:kg4c-disabled-deployment` | **80/80** |
| `test:kg4c-db-ownership` | **31/31** |

## Count deltas, explained

No recorded baseline moved. Three counts are new (`438`, `80`, `31`) and belong to suites that did
not exist before this slice. `test:regulatory-release-lifecycle` reports 42/42 — it previously
reported "pass" without a count in the blueprint, and the assertion set is unchanged; only the
ownership claim was added ahead of its first mutation.

`test:kg4b-shadow-adversarial` (84/84) and `test:kg4b-shadow-determinism` (18/18) were each run
twice: once before the ownership incident and once after the corpus was restored. Both produced
identical results, which is the restoration proof.

## Not run

* **Browser suites** (KG-4A 240, KG-4B 576) — require a live backend, an isolated frontend and real
  Chromium with two authenticated accounts. KG-4C added no code to the customer request path and
  touched no display, payload, persistence or report code. A reasoned assessment of unchanged risk,
  not a claim of coverage.
* **`test:kg4b-default-off`** (48/48) — requires a live server running SHADOW.
  `test:kg4a-default-off` (51/51, static) passed, and `test:kg4c-disabled-deployment` adds 80
  in-process checks over nine disabled configurations.
* **`test:entitlement-boundary`** — the documented pre-existing HTTP 429 / hang. The auth throttle
  was **not** weakened.
