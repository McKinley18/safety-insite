# SafeScope Live Regulatory Connector Hardening v1

This document outlines the architecture for SafeScope's official source connectors, specifically defining how live data is retrieved securely without bypassing governance.

## Modes of Operation

### Fixture Mode (Default)
In default operation (development, validation, CI/CD), connectors load static JSON fixtures (`safescope-data/source-audit/fixtures/`). This ensures deterministic testing of the differential comparison engine without introducing network latency or external dependencies.

### Live Mode
When explicitly enabled, connectors attempt to fetch current data from official regulatory endpoints.

**Requirements for Live Fetch:**
1. Code execution must explicitly pass `allowNetwork: true` in the connector options.
2. The environment variable `SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH="true"` must be present.

If either is missing, the `RegulatoryLiveFetchService` will safely block the request and return a 403 error.

## Deduplication and Citation Normalization
Regardless of whether a candidate comes from a fixture or a live fetch, the `RegulatoryDifferentialComparisonService` processes it. 
Live candidates are matched against the local inventory using normalized citations (e.g., `1910.212`). If the live source is already covered, it is discarded unless its revision date is newer, in which case it is staged for review.

## Reviewer-Only Promotion Path
Live fetched content **never** bypasses the staging phase. All live candidates are injected into the `ReviewerCandidateConsole` with:
- `advisoryOnly: true`
- `liveFetchUsed: true` metadata flag.
- Governance warning: `LIVE_FETCH_UNVERIFIED_CONTENT`.

Only a qualified reviewer (e.g., `compliance_admin`) can approve and promote these candidates into the approved knowledge registry.

## Supplemental Context
Not all live sources are strict regulations. Connectors for OSHA Investigation Summaries or MSHA Fatality Reports generate candidates marked as `supplemental_context_candidate` or `fatality_lesson_candidate`. These do not overwrite core safety rules but instead augment the reasoning engine's understanding of field context and accident mechanisms.

## Future Work
- Implementation of robust, source-specific HTML/XML parsers for eCFR.
- Automated scheduling for source freshness checks (cron-driven).
- Admin UI for manually triggering source audit runs.
