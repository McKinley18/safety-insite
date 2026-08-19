# Authoritative knowledge ingestion / freshness — current capability and remaining work

Date: 2026-08-18. Scope: Section M. Verified by reading the code and the disposable database; nothing
below claims a capability that was not observed. **No crawler was built in this phase.**

## What exists today

The repository already contains a governed ingestion *scaffold* with real provenance metadata; what it
lacks is scheduling, change-detection alerting, regression-gated promotion, and coupling to the
applicability rule engine.

| Stage (target pipeline) | Exists? | Where / evidence |
|---|---|---|
| Authoritative source registry | **Yes** | `safescope_knowledge_sources` (`SafeScopeKnowledgeSource`: `agency`, `sourceType`, `trustLevel` official/…, `defaultAuthorityTier`, `baseUrl`, `status`, `lastCheckedAt`, `lastSuccessfulIngestionAt`, `lastKnownVersion`); seeded by `seed:safescope-sources`; verified by `verify-safescope-ingestion-sources.ts`. |
| Fetch/import from primary sources | **Yes (manual, allow-listed)** | Connectors in `src/safescope-knowledge/ingestion/connectors/`: `osha-ecfr.connector.ts` (`fetchAuthoritativeSource(url)` over an eCFR URL list from `source-lists/osha-ecfr-1910.json` / `-1926.json`), `msha-30-cfr.connector.ts`, `osha-standard-interpretation` (host-checked `https://www.osha.gov`), `msha-program-policy-manual`/`msha-safety-alert` (host-checked `https://www.msha.gov`), `msha-fatality`, `niosh-mining-publication`, `osha-incident-database`. Also `standards/ingestion/ingest-ecfr-standards.ts`, `ingest.cfr.bulk.ts`, `ingest:msha`. All are `npm run ingest:*` scripts run by hand. |
| Normalization | **Yes** | `reviewcore-knowledge-normalizer.service.ts`; per-connector normalization; `parserVersion` recorded on documents; `transformation_version` on `standards_master`. |
| Source metadata | **Yes** | `standards_master`: `source_key`, `source_name`, `source_type`, `authority_tier`, `source_url`, `source_publication_date`, `effective_date`, `revision_date`, `retrieval_date`; `safescope_knowledge_documents`: `sourceUrl`, `publishedAt`, `retrievedAt`, `authorityTier`, `sourceType`. |
| Content hash / version | **Yes** | `source_document_checksum` + `normalized_record_checksum` (sha256) on `standards_master`; `sourceDocumentChecksum`/`normalizedRecordChecksum` on knowledge documents and chunks; `release_id` / `regulatoryReleaseId` via `finalize-regulatory-release.ts`. |
| Change detection | **Partial** | Re-running an ingestion recomputes checksums and updates rows in place (`sync-standards-intelligence-to-master.ts` upserts by normalized citation key — fixed this phase-series to be duplicate-proof); ingestion runs are logged (`safescope_knowledge_ingestion_runs`: discovered/ingested/pendingReview/approved/skipped counts, warnings). **Missing:** a diff/alert when a checksum changes for an already-approved record, and any scheduled re-check. |
| Validation | **Partial** | `requires_approval` / `approved_for_auto_ingestion` / `reviewer_approved` / `approval_date` on `standards_master`; `approvalStatus` pending_review/approved on knowledge documents (`run-osha-ecfr-ingestion.ts` preserves an existing approved status and marks new records pending when the source metadata requires approval); reviewcore review queue + approval service + audit entity. **Missing:** an automated title/citation-consistency validator (the two hand-written-title defects found in this phase series — 1910.178(p)(1), 1910.22(a) — would have been caught by comparing the seeded title against the fetched section heading). |
| Regression | **Partial** | `test:standards-corpus-integrity` (duplicate/format/title invariants), `test:safescope-standards` (15 golden cases), gold set (25 cases, this phase). **Missing:** running these automatically as a gate of the ingestion/promotion step. |
| Promotion to active corpus | **Yes (manual)** | `is_active`, `deprecation_status`, `superseded_by_citation` on `standards_master`; `finalize-regulatory-release.ts` stamps `release_id`. |
| Distinctions preserved | **Yes** | `source_type` / `authority_tier` on both tables distinguish regulation vs agency guidance (interpretations, PPM, safety alerts) vs consensus/best practice; HazLenz-authored summaries live in `plain_language_summary`/`summary` and are labelled as such in the UI ("HazLenz standard summary" / "verbatim text not available" — verified in Phase 13 of the prior session and re-verified this phase). |
| Verbatim regulatory text | **Table exists, empty here** | `regulatory_paragraph` (eCFR verbatim) is empty in the disposable environment; the UI states this honestly rather than substituting generated prose. |

## Not connected today

- `evaluate()` (the applicability rule engine in `evidence-foundation.ts`) is **hand-authored code**. It
  cites regulations by string and is not driven by `standards_master`. Corpus freshness therefore
  updates titles/summaries/text shown to the user but does not, by itself, change *which* rules fire.
  Four Construction rules were added this phase by hand after verifying the text on osha.gov
  (`CONSTRUCTION_RULE_SOURCES.md`); that is the current — manual, reviewed — path for rule changes.
- Nothing runs on a schedule; `lastCheckedAt`/`lastKnownVersion` are only updated when a human runs a script.

## Remaining work for a routinely-updated, governed pipeline (concrete follow-up)

1. **Scheduled re-check job** (cron/worker) per registered source: fetch, checksum, compare with the stored
   `source_document_checksum`; write an ingestion run; on change, mark the record `pending_review`
   (never auto-promote a changed regulation) and raise an alert row.
2. **Consistency validator** at ingestion: fetched section heading vs stored `title`; citation format vs
   the normalized key; regime prefix (29 CFR 1910 / 1926, 30 CFR) vs `agency_code`/`scope_code`. Fail the
   run on mismatch (this is exactly the defect class found twice by hand in this phase series).
3. **Regression gate on promotion**: `finalize-regulatory-release.ts` (or the approval service) runs
   `test:standards-corpus-integrity`, `test:safescope-standards` and the gold set, and refuses to stamp a
   release when any fails.
4. **Rule ↔ corpus linkage**: for every citation string used in `evaluate()`, assert (in the corpus
   integrity regression) that a `standards_master` row exists with a verified title, so a rule can never
   cite a provision the corpus cannot describe. Today the corpus (18 rows) is smaller than the rule set;
   the UI falls back to the rule's `family` as the title and says verbatim text is unavailable.
5. **Populate `regulatory_paragraph`** from eCFR for the cited sections so Contract Point 5 (verbatim
   text) is satisfied instead of disclosed-as-missing.

None of this requires an uncontrolled crawler: sources stay allow-listed primary government hosts
(osha.gov, ecfr.gov/govinfo.gov, msha.gov), exactly as the existing connectors already enforce.
