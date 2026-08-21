# KG-4B Phase 0 — KG-4A/KG-3F foundation reproduced before any KG-4B edit

| Result | Expected | Reproduced |
|---|---|---|
| `test:kg4a-cutover-contract` | 146 | **146/146** |
| `test:kg4a-governed-resolution` | 99 | **99/99** |
| `test:kg4a-provenance-pinning` | 53 | **53/53** |
| `test:kg4a-default-off` | 51 | **51/51** |
| retrieval determinism, 9 layouts | 170 | **170/170** |
| mirrored ranking adversarial | 54 | **54/54** |
| 56.14132 predicate matrix | 16 | **16/16** |
| governed shadow invariance (KG-3F) | 7 | **7/7** |
| KG-4A changed-file manifest | 22 | **22/22 OK** |
| unrelated frontend files | 18 | **18/18 OK** |

## Manifest determinism for the CURRENT corpus

A clean `createdb` → `migration:run` → `seed:safescope-standards` on a disposable database
(`test_kg4b_manifest_check`, created and dropped) reproduces:

```
recordCount      35
manifestChecksum 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b
```

identical to the value KG-4A recorded after sourcing `30 CFR 56.14132(b)(1)`. The pre-KG-4A value
`bee47ebe…` is **not** treated as an invariant — it described a 34-record corpus that no longer
exists. Manifest identity is required to be *deterministic for the current corpus*, and it is.

## Established for KG-4B to build on

* default configuration resolves to `LEGACY` and `GovernedCutoverContext.create()` returns `null`;
* `SHADOW` returns `governedBackingInput: null` and `verifiedText: null` structurally;
* the governed resolver answers `APPROVED_EXACT` / `APPROVED_SECTION_ONLY` / `NOT_IN_RELEASE` /
  `UNAPPROVED_RECORD` / `RESOLVER_UNAVAILABLE` deterministically;
* the server-side provenance gate rejects client-supplied release ids;
* the release pin survives an activation race.
