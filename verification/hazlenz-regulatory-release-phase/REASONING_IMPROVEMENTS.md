# Generalized improvements

## Implemented

The canonical standards seed now composes both reviewed sources:

1. eight starter standards needed by the core workflow;
2. fourteen unique standards from the approved standards-intelligence release.

Three records overlap, so a clean database deterministically converges on nineteen active rows. Upserts remain keyed by agency and citation. No scenario text, expected result, or individual observation is encoded in production logic.

This fixes a runtime-environment inconsistency: disposable databases previously exercised a substantially smaller hydration registry than the original database.

## Deliberately not implemented

The review-case audit identified many absent regulatory families. They were not added because the current release lacks complete source URL, effective-date, revision, and checksum governance. Promoting new definitive families without those controls would trade fewer review outcomes for greater regulatory risk.

The established evidence synthesis, contradiction handling, safe-state logic, candidate behavior, confidence behavior, and definitive-promotion threshold remain unchanged.
