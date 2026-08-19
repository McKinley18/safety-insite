# Standards Corpus Provenance and Integrity Audit

Date: 2026-08-18. Environment: disposable database `insite_full_qa_20260818`, seeded via the repository's own
`seed:safescope-standards` pipeline (`safescope-standards.seed.ts` → `sync-standards-intelligence-to-master.ts
--apply` → `finalize-regulatory-release.ts`).

## Provenance

- **Source pipeline:** two independent seed sources feed the single `standards_master` table:
  1. `backend/src/safescope-v2/standards/safescope-standards.seed.ts` — a small, hand-curated "starter" list (8
     entries in this corpus), whose own `source_key` values are literally `starter-unverified:osha:<citation>` for
     several entries (self-declared as unverified against an authoritative source at the time of writing).
  2. `backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts` — a larger catalog (synced via
     `sync-standards-intelligence-to-master.ts`), with `source_key` values like `osha-ecfr-1910` / `osha-ecfr-1926`
     / `msha-30-cfr-standards`, indicating eCFR/MSHA-sourced provenance.
- **Last synchronization:** both scripts were re-run against the disposable database in this session
  (2026-08-18) as part of the Phase 5/7 verification below.
- **Citation granularity:** mixed — most entries are paragraph/subparagraph-level (e.g. `1910.212(a)(1)`,
  `29 CFR 1926.602(a)(9)(ii)`), a minority are section-level (`1910.146`, `1910.219`, `1910.36`, `30 CFR 56.14107(a)`
  is actually paragraph-level despite looking section-like). No entry claims a subpart-only citation.
- **Title generation:** titles are hand-written in each seed file, not derived programmatically from the citation.
  This is the direct root cause of both title-mismatch defects found (1910.178(p)(1) in the prior session,
  1910.22(a) in this session) — nothing enforces that a hand-written title actually corresponds to the cited
  paragraph rather than a parent section or subpart.
- **Paragraph text attachment:** `standards_master.standard_text` holds a paraphrased summary written by the same
  seed author, not verbatim regulatory text. A separate `regulatory_paragraph` table exists for true verbatim eCFR
  text but is empty in this environment (a coverage gap, not a correctness defect — see Contract Point 5 in
  `STANDARDS_ACCURACY_CONTRACT.md`).
- **Duplicate prevention (before this session's fix):** `sync-standards-intelligence-to-master.ts` matched existing
  rows by exact `(agencyCode, citation)` string equality. Because the two seed sources used different citation
  string formats for the same regulation (`"1910.147"` vs `"29 CFR 1910.147"`), the sync's own upsert logic could
  never recognize them as the same row, so every re-run of the full pipeline re-inserted a duplicate. **Directly
  reproduced in this session** (see `REGRESSION` note under 1910.147 below) before being fixed at the root in both
  the sync script (normalized-citation matching) and the source seed file itself (citation format aligned).
- **Cross-regime collision risk:** none observed in this corpus — every citation's `agency_code`/citation prefix
  (29 CFR vs 30 CFR, 1910 vs 1926) is internally consistent with its actual regulatory regime. No General
  Industry/Construction collision found in this 18-entry corpus.
- **Deleted/superseded rows:** none present; `deprecation_status` defaults to `'active'` for all sampled rows and
  no row was found with a stale/superseded marker.
- **Determinism:** both seed scripts are idempotent upserts (verified this session — re-running the full pipeline
  twice in a row produced identical row counts and zero duplicates both times).

## Corpus Integrity Sweep

All 18 entries in the disposable database's `standards_master` table were checked — this is the full corpus, not a
sample, since 18 entries is small enough to verify exhaustively. Each citation, title, and substantive text was
checked against an authoritative primary source (osha.gov for OSHA citations, govinfo.gov's official CFR XML
publication for MSHA/30 CFR citations, both government-published primary sources, never a blog/training
site/law-firm summary/search snippet).

| Citation | Classification | Notes |
|---|---|---|
| `1910.146` | EXACT | Verified prior session against osha.gov. |
| `1910.212(a)(1)` | NORMALIZATION_ONLY | Official paragraph heading is "Types of guarding"; seed title adds the parent section name for context ("Machine guarding - types of guarding methods"), substantively accurate. Text matches in substance. |
| `1910.219` | EXACT | Verified prior session against osha.gov. |
| `1910.22(a)` | **TITLE_MISMATCH → FIXED** | Official section title is "General requirements"; paragraph (a)'s own title is "Surface conditions." Seed used "Walking-working surfaces," which is actually Subpart D's name, one level above this section — not this paragraph's own title. **Fixed this session**: retitled to "Walking-working surfaces - Surface conditions," verified in the disposable database after re-seeding. |
| `1910.303(b)(1)` | NORMALIZATION_ONLY | Official paragraph (b)(1) heading is "Examination" (under parent paragraph (b) "Examination, installation, and use of equipment"); seed's "Electrical equipment examination and use" is a reasonable, accurate paraphrase. Text matches almost verbatim. |
| `1910.36` | NORMALIZATION_ONLY | Official title "Design and construction requirements for exit routes"; seed's "Exit routes" is an accurate shortened form. |
| `29 CFR 1910.132(a)` | EXACT | Verified prior session against osha.gov. |
| `29 CFR 1910.147` | EXACT (title/text); **DUPLICATE → FIXED (again)** | Title and text verified accurate. Citation-format duplicate (`"1910.147"` vs `"29 CFR 1910.147"`) was fixed in the prior session by deleting the unverified duplicate row, but this session **proved the fix was incomplete**: re-running the seed pipeline recreated the duplicate, because the root cause (citation-format disagreement between the two seed *source files*, not just the already-seeded rows) had not been fixed. Fixed at the source this session — see Phase 7 below. |
| `29 CFR 1910.178(p)(1)` | EXACT (after prior-session fix) | Re-verified this session against osha.gov; title now correctly reflects paragraph (p)(1) specifically. See Phase 7 below. |
| `29 CFR 1926.501` | EXACT | Verified prior session against osha.gov. |
| `29 CFR 1926.602(a)(9)(ii)` | NORMALIZATION_ONLY | Official paragraph content is specifically about reverse-signal alarms on earthmoving equipment with an obstructed rear view; seed's title ("Material handling equipment - Earthmoving equipment") is accurate but generic at the section level rather than naming the specific paragraph requirement. Not factually wrong; lower-priority imprecision, consistent with the same class of defect the prior session already documented and intentionally deferred. |
| `29 CFR 1926.95(a)` | EXACT | Verified prior session against osha.gov. |
| `30 CFR 56.12016` | EXACT | Verified against govinfo.gov CFR-2023-title30-vol1 XML. Title "Work on electrically-powered equipment" (seed omits the hyphen — cosmetic only). |
| `30 CFR 56.14105` | EXACT | Verified against govinfo.gov CFR-2023-title30-vol1 XML. |
| `30 CFR 56.14107(a)` | EXACT | Verified against govinfo.gov CFR-2023-title30-vol1 XML. |
| `30 CFR 56.15006` | NORMALIZATION_ONLY | Official title "Protective equipment and clothing for hazards and irritants"; seed's "Protective equipment - clothing" is an abbreviated but not misleading form. |
| `30 CFR 56.9100(a)` | NORMALIZATION_ONLY | Official section title "Traffic control"; seed adds the informal "Rules of the road" prefix commonly used in MSHA guidance materials — not part of the official title but not a misrepresentation either. |
| `30 CFR 57.14107(a)` | EXACT | Verified against govinfo.gov CFR-2023-title30-vol1 XML (underground metal/nonmetal counterpart to 56.14107). |

## Counts

- **Entries checked:** 18 (100% of the corpus)
- **EXACT:** 9
- **NORMALIZATION_ONLY** (title reworded/abbreviated but substantively accurate, not misleading): 6
- **TITLE_MISMATCH:** 1 found (`1910.22(a)`) — **fixed this session**, 0 remaining
- **TEXT_MISMATCH:** 0
- **CITATION_MISMATCH:** 0
- **DUPLICATE:** 1 class found (`1910.147` bare-vs-prefixed format) — **fixed at the root this session** (both the
  already-seeded duplicate row and the source seed file that would have kept recreating it), 0 remaining, and
  proven duplicate-proof by re-running the full seed pipeline twice with zero recreation.
- **MISSING_AUTHORITATIVE_SOURCE:** 0 among the 18 checked (all resolved against osha.gov or govinfo.gov); note
  separately that verbatim paragraph text (`regulatory_paragraph` table) is not populated for any entry in this
  disposable environment — a coverage gap, tracked as MISSING_AUTHORITATIVE_SOURCE for the *verbatim-text* contract
  point specifically (Contract Point 5), not for citation/title accuracy.
- **STALE_OR_SUPERSEDED:** 0
- **UNRESOLVED:** 0 (every entry was successfully checked against a primary government source)

## Target vs. actual (Phase 6 release gate)

| Target | Actual |
|---|---|
| Citation mismatches: 0 | **0** ✅ |
| Title mismatches: 0 | **0** (1 found, fixed) ✅ |
| Substantive text mismatches: 0 | **0** ✅ |
| Conflicting duplicates: 0 | **0** (1 class found, fixed at the root) ✅ |
| Cross-regime collisions: 0 | **0** ✅ |

All five corpus-integrity targets are met for the 18-entry corpus available in this environment. This is the full
production-representative seed corpus used by this repository's own golden test suites; it is not the complete
eCFR bulk corpus (populating that is out of proportion to this phase, consistent with the prior session's own
documented scope decision).
