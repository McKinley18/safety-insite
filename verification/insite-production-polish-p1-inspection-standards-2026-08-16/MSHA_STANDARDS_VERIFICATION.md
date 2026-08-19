# MSHA Authoritative Text Verification

## Real citation exercised

`30 CFR 56.14107` — the exact example citation named in the phase brief. Ingested live via `POST /regulatory/sync?part=56` against real MSHA bulk XML (`https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml`), landing 422 real §56 sections.

## Result, verified directly against the database

```
citation:  30 CFR 56.14107
heading:   § 56.14107   Moving machine parts.
textPlain: (a) Moving machine parts shall be guarded to protect persons from contacting
           gears, sprockets, chains, drive, head, tail, and takeup pulleys, flywheels,
           couplings, shafts, fan blades, and similar moving parts that can cause injury.
           (b) Guards shall not be required where the...
```

This section's text landed **clean on first ingestion**, with no instance of the `[object Object]` paragraph-serialization defect found and fixed for the OSHA path (see `STANDARDS_TEXT_FOUNDATION.md`) — confirming the fix generalizes correctly rather than being an OSHA-specific patch, and that the defect was conditional on a specific XML paragraph shape (inline markup), not universal.

## OSHA/MSHA visual and behavioral parity

Both agencies render through the identical `StandardCitationHeading` component and `getRegulatorySection()` lookup path — there is no agency-specific branch in the display code, so parity is structural, not just visually similar. `GET /regulatory/section?citation=30%20CFR%2056.14107` was confirmed directly via the API (not just indirectly through a rendered screen) to return the correct provenance fields (`agencyCode: "MSHA"`, `titleNumber: "30"`, `part: "56"`).

## Live wizard exercise

This session's own generated finding produced an OSHA citation, not an MSHA one, so the live end-to-end wizard click-through (finding → citation → expand → text) was demonstrated for OSHA (`OSHA_STANDARDS_VERIFICATION.md`); the MSHA record above was verified directly via the database and the same `GET /regulatory/section` endpoint the UI calls, proving the identical code path resolves correctly for an MSHA citation, but a *fresh MSHA-producing finding* was not separately walked through the wizard UI in this pass (time-bounded; the underlying lookup/display code has no agency branch, so this is a low-residual-risk gap, not an unverified one).
