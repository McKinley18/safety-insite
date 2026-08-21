# KG-5A — Production governed-release review packet

**Release:** `federal-core-2026-07-30.1` · **records:** 35 · **manifest:** `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`

> **No decision in this packet is an approval.** Every row must be decided by a named human reviewer and appended in production with `npm run review:release-record -- approve … --expected-checksum <the checksum shown> --reviewer <real id>`. Nothing here is imported, copied or backfilled: the existing verification decisions are pre-contract (`approvalDigest` NULL) and §7 forbids backfilling them.

**Why re-attestation is truthful for the REATTEST rows:** the rehearsed production release reproduces `approvalDigest` **identically on 35 of 35 records** against the KG-4B verification corpus. A reviewer re-attesting is therefore attesting to provably identical content, with the original clause-by-clause comparison recorded in the named KG phase artifact.

**Recommended:** {'REATTEST': 27, 'NEW_REVIEW_REQUIRED': 8}

| # | Citation | Jurisdiction | Evidence | Production row | Recommended | `recordChecksum` |
|---|---|---|---|---|---|---|
| 1 | `1910.219` | general_industry | — | PRODUCTION_ROW_CONTENT_DIFFERS | **NEW_REVIEW_REQUIRED** | `d90f12ba713a5ef1…` |
| 2 | `29 CFR 1910.132(a)` | general_industry | — | PRODUCTION_ROW_MISSING | **NEW_REVIEW_REQUIRED** | `15006f645f90bf9c…` |
| 3 | `29 CFR 1926.602(a)(9)(ii)` | construction | — | PRODUCTION_ROW_MISSING | **NEW_REVIEW_REQUIRED** | `6fa6e31a41ef2ee3…` |
| 4 | `29 CFR 1926.95(a)` | construction | — | PRODUCTION_ROW_MISSING | **NEW_REVIEW_REQUIRED** | `35b3ed703af6e1b4…` |
| 5 | `30 CFR 56.14105` | mining | — | PRODUCTION_ROW_CONTENT_DIFFERS | **NEW_REVIEW_REQUIRED** | `f2d30441f1f0266a…` |
| 6 | `30 CFR 56.15006` | mining | — | PRODUCTION_ROW_CONTENT_DIFFERS | **NEW_REVIEW_REQUIRED** | `de35dd40141a3311…` |
| 7 | `30 CFR 56.9100(a)` | mining | — | PRODUCTION_ROW_MISSING | **NEW_REVIEW_REQUIRED** | `d34e27050f25cf89…` |
| 8 | `30 CFR 57.14107(a)` | mining | — | PRODUCTION_ROW_MISSING | **NEW_REVIEW_REQUIRED** | `01ee27d50058a438…` |
| 9 | `1910.212(a)(1)` | general_industry | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `96627e0b577e2b9c…` |
| 10 | `29 CFR 1910.1200` | general_industry | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `a53f33a13d3155eb…` |
| 11 | `29 CFR 1910.146` | general_industry | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `64e95d964d97871c…` |
| 12 | `29 CFR 1910.147` | general_industry | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `003eac71364583a6…` |
| 13 | `29 CFR 1910.178(p)(1)` | general_industry | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `c45d1cc6c23d6987…` |
| 14 | `29 CFR 1910.22(a)` | general_industry | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `02516502072c4d61…` |
| 15 | `29 CFR 1910.28` | general_industry | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `328727df1602f48e…` |
| 16 | `29 CFR 1910.303` | general_industry | KG-3D, KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `e210f940c808a12b…` |
| 17 | `29 CFR 1910.303(b)(1)` | general_industry | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `d39c7beeda19d1b7…` |
| 18 | `29 CFR 1910.36` | general_industry | KG-3D, KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `0e13180d1ff83506…` |
| 19 | `29 CFR 1910.95` | general_industry | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `e5632e7e16402cc6…` |
| 20 | `29 CFR 1926.1153` | construction | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `a92e4e554f2ef66c…` |
| 21 | `29 CFR 1926.300(b)(2)` | construction | KG-3D, KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `b94bc1e035549d90…` |
| 22 | `29 CFR 1926.34(a)` | construction | KG-3D, KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `dbf18c496390d9da…` |
| 23 | `29 CFR 1926.416(a)(1)` | construction | KG-3D, KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `e449db0edb582c8b…` |
| 24 | `29 CFR 1926.451(g)(1)` | construction | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `5ffd58c7429b14ba…` |
| 25 | `29 CFR 1926.501` | construction | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `b540a37714810666…` |
| 26 | `29 CFR 1926.52` | construction | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `dff7561a7aee2e9d…` |
| 27 | `29 CFR 1926.59` | construction | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `d01386e464ef647e…` |
| 28 | `29 CFR 1926.652(a)(1)` | construction | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `6a827346fa01fef2…` |
| 29 | `30 CFR 47.41(a)` | mining | KG-3D, KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `0705c5304b046aa6…` |
| 30 | `30 CFR 56.12016` | mining | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `e14451d4818e9587…` |
| 31 | `30 CFR 56.14107(a)` | mining | KG-3E | PRODUCTION_ROW_MISSING | **REATTEST** | `b26287a0b2514f6e…` |
| 32 | `30 CFR 56.14132` | mining | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `d714d7a3a9ff14ef…` |
| 33 | `30 CFR 56.14132(b)(1)` | mining | KG-4A | PRODUCTION_ROW_MISSING | **REATTEST** | `388a349c2b0a6f6d…` |
| 34 | `30 CFR 62.120` | mining | KG-3D, KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `ff19c04db0758fc4…` |
| 35 | `30 CFR 62.130` | mining | KG-3E | PRODUCTION_ROW_CONTENT_DIFFERS | **REATTEST** | `11a1fcb6f70c8041…` |

## Decision key

* **REATTEST** — a clause-by-clause comparison against the authoritative source is recorded in the named KG phase, and the content the reviewer compared is byte-identical to the production record (same `substantiveContentDigest`, same `sourceIdentityDigest`, same composed `approvalDigest`). The reviewer confirms the recorded comparison and appends a **new** production decision.
* **NEW_REVIEW_REQUIRED** — no clause-by-clause review is recorded for this record. These are exactly the eight records KG-3D deferred and KG-3E carried forward as unsourced. **None of the eight is in the 23-citation emitted set**, so leaving them unapproved costs Stage-1 nothing: they resolve `UNAPPROVED_RECORD`, which the fallback contract already handles and which is never BLOCKING.
* **EXCLUDE_FROM_INITIAL_RELEASE** — recommended for **no** record. Dropping any record changes the manifest away from `14a34fea…` and severs the reproducibility link to every KG-4A–4E result. Keeping all 35 and leaving eight unapproved is strictly more conservative than shrinking the release.

## Full per-record detail

`contracts/production-release-review-packet.json` carries every field: title, source key, source name, authority tier, all three digests, approval contract version, governed text length, and the exact production-row differences.

