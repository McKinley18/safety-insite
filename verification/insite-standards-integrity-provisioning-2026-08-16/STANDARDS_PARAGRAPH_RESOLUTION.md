# Paragraph / Subsection Resolution

## What already existed (unchanged)

The frontend (`frontend-next/lib/canonicalWorkflowApi.ts:410-440`, `frontend-next/components/inspection/SafeScopeStandardsSection.tsx`) already implements the required honest-fallback UX correctly: `getRegulatorySection(citation)` tries the exact citation against `GET /regulatory/section?citation=`, and on a miss strips the trailing `(a)(1)`-style suffix and retries against the parent section, tagging the result `matchScope: "exact" | "parent-section"`. When `matchScope === "parent-section"`, `StandardCitationHeading` shows an explicit amber disclosure: *"Showing the full text of {section} — this specific subsection ({citation}) is not separately available; the excerpt below covers the whole section."* No frontend code needed to change — the defect was purely that `regulatory_paragraph` was never populated, so an "exact" match was structurally impossible.

## What was fixed

**1. Paragraph extraction (`backend/scripts/verification-sync-regulatory-paragraphs.ts`, new)**

`RegulatorySyncService.syncRegulatoryPart()` upserts whole sections but has always hardcoded `paragraphsUpserted: 0` — nothing ever populated `regulatory_paragraph`. Wrote a standalone extractor that re-parses the same eCFR bulk XML at paragraph (`<P>`) granularity and reconstructs the outline path (a → 1 → i → A → 1) with a small state machine, since eCFR text has no structural nesting — each paragraph is a flat sibling `<P>` whose own leading characters carry its marker(s). Handles two real conventions found in the source text:
- Simple leading markers: `"(a)(1) Types of guarding. ..."` → one paragraph, path `a.1`.
- Inline markers after a heading clause: `"(a) Machine guarding—(1) Types of guarding. ..."` → split into a heading-only `(a)` record and a separate `(a)(1)` record.

Single-character ambiguity between a level-1 letter and a level-3 lowercase roman numeral (`i, v, x, l, c, d, m`) is resolved by stack context — a roman numeral only ever follows a digit-level (2) or another roman (3) entry.

Ran against the disposable DB for OSHA 1910, 1926, and MSHA Part 56: **24,911 paragraph rows** across 930 sections. Spot-checked against real fetched text: `29 CFR 1910.212(a)(1)`, `29 CFR 1910.1200(f)(1)`, `29 CFR 1926.501(b)(1)`, `30 CFR 56.14107(a)` all extracted correctly (verified against the raw eCFR source in this session — see below).

**Known limitation** (documented, not silently hidden): the marker-type disambiguation heuristic is a best-effort reconstruction of standard CFR outline convention, not a guaranteed-exact parser for every edge case in the corpus (e.g. unusual nesting orders). Rows that fail to parse a leading marker are skipped (never fabricated), so the honest-unavailable path still applies to anything the extractor can't confidently place.

**2. Backend lookup (`backend/src/regulatory/regulatory.service.ts`)**

`RegulatoryParagraph` was already registered in `TypeOrmModule.forFeature` (`regulatory.module.ts`) but never injected into `RegulatoryService`. Added the injection and a `parseCitationSuffix()` helper that splits a citation's trailing `(x)(y)...` run into `{baseCitation, paragraphPath}` (dotted form, matching the extractor's convention). `getSection(citation)` now checks `regulatory_paragraph` first when the citation has a subsection suffix; on a hit it returns a section-shaped payload (`citation, heading, textPlain, agencyCode, titleNumber, part, section`) built from the paragraph's exact text plus the parent section's heading — the exact shape `RegulatorySectionRecord` already expects, so the frontend's existing exact/parent-section branching works unmodified. On a miss it falls through unchanged to the existing whole-section lookup.

## Verified precedence (live requests against the fixed disposable-DB backend)

| Citation | Behavior | Result |
|---|---|---|
| `29 CFR 1910.212(a)(1)` | exact paragraph exists | Returns exact `(a)(1)` text only (verified against real eCFR source) |
| `29 CFR 1910.212` | no subsection requested | Returns full section text (unchanged) |
| `29 CFR 1910.212(z)(9)` | subsection doesn't exist | Returns empty/no record; frontend falls back to parent-section with disclosure banner — no fabricated text, no mislabeling |

No frontend change was required or made. No "Official standard text" label is ever attached to HazLenz's own advisory summary — that remains a separate, pre-existing, correctly-labeled code path (`standardDisplay.ts:132-172`).
