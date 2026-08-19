# Copy / Terminology Audit

Method: targeted source sweep of `frontend-next/app/**` and `frontend-next/components/**` for user-visible string literals (JSX text, label/placeholder/title/alt props, toast/alert/error strings), cross-checked against live screens observed during the rest of this audit.

## Legacy branding leaking into user-visible copy
**None found.** All matches for "SafeScope" / "Sentinel" / "ReviewCore" (~300 hits) are internal: variable names (`safeScopeResult`, `handleRunSafeScope`), CSS class prefixes (`sentinel-primary-button`, `sentinel-mobile-page`), component/file names (`SafeScopeInspectionStep.tsx`), and a localStorage key (`sentinel_report_storage_mode`). None render as visible text. Internal component/CSS naming still uses the legacy names — fine per the brief's instruction not to rename internal identifiers for branding alone, but worth a note for future consistency work.

## "HazLenz" spelling/capitalization
**Consistent.** All 232 user-facing occurrences use "HazLenz" correctly; no "Hazlenz," "HazLens," or "Haz Lenz" variants found in rendered text.

## Cross-screen terminology consistency
- "Finding" is used consistently as the label for an AI-detected item across the findings list, calendar, and workspace.
- "Corrective action(s)" is used consistently; no competing "action item"/"task"/"remediation" synonyms found in UI copy for the same concept.
- "Review" / "Finalize" are used consistently ("Human review required," "Finalize Findings"); no competing "Approve"/"Sign off" labels found for the same workflow stage.
- "Inspection" is used consistently as the top-level unit of work; "audit"/"walkthrough" only appear in marketing copy, not as competing in-product terms.

## Developer-oriented / overly technical text found in user-visible UI (live-confirmed for several of these during the rest of this audit)
| Location | Issue |
|---|---|
| Canonical workspace finding list | Raw `Finding ID: 6b5d1628-...` and `Analysis: a3d39741-...` UUIDs printed directly for the user |
| Inspection workspace | `Status: {inspection.status} · version {inspection.version}` — raw enum + integer |
| Report review | `Report version {report.version} · checksum {report.checksum.slice(0,12)}…` — cryptographic checksum shown to a non-technical user |
| Action details | Raw ISO-8601 timestamp (`Due: 2026-08-17T15:35:24.470Z`) instead of a formatted date |
| HazLenz review failure path | Raw JSON surfaced directly: `HazLenz AI review failed: {"statusCode":500,"message":"Internal server error"}` — confirmed live in this audit |

## Verbose inline instructional copy
No egregious multi-paragraph blocks found in the primary workflow screens; copy throughout is generally one sentence per element. One borderline case: an alert banner referencing "a newer server-backed analysis" using implementation-flavored language ("server-backed") in a user-facing warning.

## Overall assessment
Branding and core-noun terminology are in good shape — this is not where the product's polish gap is. The real issue is a recurring pattern of **raw technical identifiers (UUIDs, ISO timestamps, checksums, JSON error bodies) leaking into user-facing text**, concentrated in the canonical inspection workspace and error paths.
