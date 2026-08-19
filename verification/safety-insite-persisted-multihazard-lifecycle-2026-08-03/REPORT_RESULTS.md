# Reports and PDF

Owner Chromium download returned HTTP 200, `%PDF-`, and bytes matching the persisted checksum. Duplicate generation for an unchanged inspection returned the same report ID/version/checksum and did not create a second version. Foreign authenticated access returned HTTP 404.

The fresh filtered report `report-latest-filtered.pdf` is 2597 bytes and SHA-256 `b4ba17023eb5ca7cfde03429d48f4b3ec03861a62d19808c85e74130d57875e4`; Quick Look visual inspection showed current findings only, hazard-specific actions, readable spacing, and no overlap/clipping. Historical report mutation and report version 2 after a legitimate source change remain unverified.
