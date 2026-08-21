# KG-3E finding — checksum-bound approval does not cover the reviewer's evidence pointer

**Severity: governance gap. Not a cutover blocker on its own, but it weakens the guarantee the
approval mechanism is understood to give.** Found in Phase 5, while repairing MSHA provenance.

## What was expected

KG-3B's contract, restated in the KG-3E brief: *"If remediation changes a checksum after approval,
the prior approval MUST become ineffective automatically."* KG-3D demonstrated this working — its
§5.3 control-tag change to `1910.303` invalidated that record's approval unprompted, and the record
had to be re-reviewed and re-approved.

Phase 5 therefore assumed that repairing a record's `source_url` would change its checksum and
invalidate its approval, and the seed comments were written on that basis.

## What actually happens

Three MSHA records had their `sourceUrl` repointed from `govinfo.gov/.../CFR-2023-title30-vol1`
(the 2023 annual print edition) to the eCFR title-30 URLs their own source registration declares.
Their checksums did not move:

| Citation | KG-3D checksum | KG-3E checksum after URL repair |
|---|---|---|
| `30 CFR 47.41(a)` | `0705c5304b04…` | `0705c5304b04…` — **unchanged** |
| `30 CFR 62.120` | `ff19c04db075…` | `ff19c04db075…` — **unchanged** |
| `30 CFR 62.130` | `11a1fcb6f70c…` | `11a1fcb6f70c…` — **unchanged** |

The cause is the manifest projection in `src/standards/releases/release-manifest.ts`:

```
RELEASE_MANIFEST_SELECT_COLUMNS =
  id, agency_code, citation, part_number, subpart, title, standard_text,
  plain_language_summary, scope_code, source_key, source_name, source_type,
  authority_tier, allowed_use, requires_approval, approved_for_auto_ingestion,
  hazard_codes, required_controls, keywords, severity_weight, is_active
```

`source_key`, `source_name`, `source_type`, `authority_tier` and `allowed_use` are covered.
**`source_url` and `retrieval_date` are not.**

## Why it matters

A reviewer's approval attests to a comparison: *this stored text accurately restates this source
document, retrieved on this date.* The checksum binds the first half of that statement and not the
second. The consequences:

1. **A record's evidence pointer can be changed after approval without the approval being
   re-examined.** The `source_url` could be repointed from the correct section to a different
   section, a different title, or a dead link, and the record would still resolve as
   `APPROVED_GOVERNED_CONTENT`.
2. **`retrieval_date` can be advanced without any re-retrieval.** A record could present itself as
   "verified as of" a recent date while the approval behind it was made against a document fetched
   long before.
3. It means the approval mechanism's guarantee is narrower than the natural reading of
   "checksum-bound, exact-version approval". It is exact-version with respect to *content and source
   identity*, not with respect to *the evidence the reviewer actually consulted*.

This is not a live exploit — nothing in the product mutates `source_url` at runtime, and the field is
set only by the seed pipeline. It is a gap between what the governance says it enforces and what it
enforces.

## What KG-3E did

**Did not change the projection.** Adding `source_url` and `retrieval_date` to
`RELEASE_MANIFEST_SELECT_COLUMNS` would alter **every checksum in the corpus**, invalidate every
approval including KG-3D's seven, and change the manifest checksum that KG-3A, KG-3B, KG-3C and
KG-3D all recorded as a stable reproduction anchor. That is a governance-architecture change and it
needs its own slice, its own migration of recorded manifests, and its own re-approval pass. Doing it
inside a corpus-remediation slice would have destroyed the comparability of every prior measurement.

**Did do:**

1. Corrected the three seed comments, which had asserted the opposite and would have shipped as
   misleading documentation in production source.
2. Recorded the actual observed behaviour with the checksum evidence above.
3. Noted the one place it materially helped: because the URL repair did not invalidate them, the
   KG-3D approvals for `47.41(a)` and `62.120` remained checksum-identical and became legitimate
   carry-forward candidates rather than casualties of a provenance fix.
4. Carried it to KG-3F as a recommended contract change.

## Recommended remedy (KG-3F)

Extend the checksummed projection to `source_url` and `retrieval_date`, in a slice that also:

- re-records the manifest anchors in the KG-1…KG-3E verification records, with the old and new
  values side by side so prior reproductions stay checkable;
- re-affirms every existing approval against the new checksums, individually and with evidence, as
  KG-3E did for this release;
- adds a regression asserting that changing only `source_url` invalidates a prior approval — the
  assertion that would have caught this.
