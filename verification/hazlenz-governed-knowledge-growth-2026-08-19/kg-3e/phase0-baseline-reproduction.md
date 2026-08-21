# KG-3E Phase 0 — baseline reproduction

## Determinism proof (clean database, current seed sources)

`createdb test_kg3e_remediation_20260820` → `migration:run` → `seed:safescope-standards`

```
{"releaseId":"federal-core-2026-07-30.1","releaseVersion":"2026-07-30.1","status":"provisional",
 "outcome":"finalized","recordCount":27,
 "manifestChecksum":"13e003e73698175ae49d119f2dea2115a930ef68dbc5c754f486d7e3c354d85b",
 "verifiedInOnePass":true,
 "reviewState":{"unreviewed":3,"mechanically_validated":24,"reviewer_approved":0},
 "placeholderSourceRecords":3}
```

Manifest `13e003e73698175ae49d119f2dea2115a930ef68dbc5c754f486d7e3c354d85b` is **byte-identical to
the manifest KG-3D recorded** after its remediation (KG_3D_VERIFICATION.md §9.1). The KG-3D corpus
remediation therefore reproduces deterministically from the seed sources in the working tree; it was
not a hand edit to a database.

Record counts match KG-3D exactly: **27 records, 3 placeholder-source, 0 reviewer-approved in a
fresh release**.

## Retained KG-3D remediation database — end state re-verified

`test_kg3d_remediation_20260819`, release `federal-core-2026-08-19.3`:

| Metric | KG-3D reported | Re-measured at KG-3E start | Match |
|---|---|---|---|
| standards_master records | 27 | 27 | yes |
| placeholder-source (`starter-unverified:`) | 3 | 3 | yes |
| effective checksum-bound approvals | 7 | 7 | yes |
| records with no recorded `source_url` | 18 (of 27) | 17 | see note |

Effective approvals confirmed by joining the append-only decision log to the **current** record
checksum (a decision only counts when its `recordChecksum` still equals the frozen record's):

```
29 CFR 1910.303        e210f940c808  approved
29 CFR 1910.36         0e13180d1ff8  approved
29 CFR 1926.300(b)(2)  b94bc1e03554  approved
29 CFR 1926.34(a)      dbf18c496390  approved
29 CFR 1926.416(a)(1)  e449db0edb58  approved
30 CFR 47.41(a)        0705c5304b04  approved
30 CFR 62.120          ff19c04db075  approved
```

These are exactly the seven citations KG-3D reported, and each was verified as *effective* rather
than assumed from the KG-3D narrative, as the task required.

**Note on the source-URL count.** KG-3D §13 states "18 of 27 records still carry no recorded source
URL". The direct measurement is **17 null / 10 recorded**, and the ten are enumerable:
`1910.303`, `1910.36` (eCFR, retrieved 2026-08-19); `1926.300(b)(2)`, `1926.34(a)`,
`1926.416(a)(1)`, `1926.52`, `1926.59` (osha.gov standardnumber, 2026-08-18); `47.41(a)`,
`62.120`, `62.130` (govinfo, 2026-08-18). KG-3D's own §2 recorded 8 sourced records out of 26 at
baseline and then added two (`1910.36` remediated, `1910.303` new), which gives 10 of 27 — so the
"18" in its closing summary is an arithmetic slip in the prose against its own §2 figure, not a
corpus difference. The record set is identical. **KG-3E uses the measured value, 17 unsourced.**

**A provenance finding visible already at baseline** (carried into Phase 5): the three MSHA records
that are sourced point at **`govinfo.gov/content/pkg/CFR-2023-title30-vol1`** — the *2023 annual
print edition* of 30 CFR, not a current-as-of source. They were retrieved on 2026-08-18, so the
`retrieval_date` is current while the *content edition* is three years stale. That is exactly the
"stale URL but content may still be correct" case Phase 5 asks to classify separately from content
correctness.
