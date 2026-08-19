# Production Polish P2 — Visual Design

## Typography scale (7 sizes total, down from 11 distinct sizes in the legacy jsPDF renderer)

| Role | Size | Weight |
|---|---|---|
| Report title (cover) | 28pt | Bold |
| Section heading | 16pt | Bold |
| Subsection heading | 11pt | Bold |
| Body | 10pt | Regular |
| Metadata label | 8.5pt | Bold, uppercase, letter-spaced |
| Table text | 9pt | Regular/Bold (header) |
| Footer/caption | 8pt | Regular |

## Color palette (print-safe, grayscale-legible)

- Ink `#0F172A` — headings, body text.
- Muted `#475569` — labels, metadata, de-emphasized text.
- Faint `#94A3B8` — footer, record reference.
- Hairline `#E2E8F0` — rules, table borders.
- Panel `#F8FAFC` — table header background, empty bar-track background.
- Risk: Critical `#B91C1C`, High `#C2410C`, Moderate `#B45309`, Low `#15803D` — all dark, high-contrast on white; every risk badge pairs the color with the bold text label ("CRITICAL"/"HIGH"/...) so meaning survives grayscale printing/scanning, never color alone.

## Findings numbering

`Finding 1`, `Finding 2`, ... — a plain array index over the immutable snapshot's finding list, in creation order. Deterministic for any given generated report version (the snapshot is immutable once generated); a UUID never appears as a finding's primary identifier anywhere in the body.

## Risk presentation

Each finding shows a colored, bold-labeled risk badge (band) plus a numeric detail line: `Severity N · Likelihood N · Score N`, taken verbatim from `riskSnapshot.operationalRisk`. No client-or-renderer-side recalculation.

## Standards presentation

Citation shown bold, in a distinct accent color (`#0369A1`), on its own line — e.g. `29 CFR 1910.212(a)(3)(ii) — Point of operation guarding`. Any accompanying explanatory text is on its own line, italic, muted, and explicitly prefixed `HazLenz standard summary:` — never presented as verbatim/official regulatory text (the underlying source is HazLenz's own reasoning output, not a paragraph-level regulatory-text store). The whole block is omitted, not filled with a placeholder, when no standard was matched — confirmed live for Report C's Finding 1 (see `REPORT_STANDARDS_VERIFICATION.md`).

## HazLenz internals — excluded by construction

The redesigned renderer never reads `resultSnapshot`'s deep orchestrator fields (mechanism chains, evidence-fact arrays, `resultStage`, `mayFinalize`, confidence/debug metadata, reasoning-snapshot IDs, supervisor questions, repeat-intelligence). Only three HazLenz-derived values ever reach the page: the finding's own conclusion (written by the reviewing inspector at finalization), the qualified-person review decision/rationale, and the compact standard citation/summary described above. This is a stricter exclusion than simply gating jargon behind a report tier (the legacy jsPDF renderer's approach) — the new renderer has no code path that could print orchestrator internals at all.

## Branding

"InSite" is the sole product identity in the cover mark and running header. "HazLenz" (as "HazLenz AI" / "HazLenz standard summary") appears only where AI-derived content is specifically being labeled, per the brief. No occurrence of "SafeScope," "Sentinel," or "ReviewCore" anywhere in generated report output (grep-verified against all three generated PDFs' extracted structure and the renderer source itself).

## Header / footer

Running header (every page except the cover): `InSite · <Site Name> · Inspection Report`. Footer: `Inspection date <date> · Generated <date> · Page X of Y` — X/Y both count only content pages (the cover page intentionally carries no page number, a standard title-page convention), fixed this phase after an off-by-one bug was found live (see `REPORT_PAGINATION_VERIFICATION.md`).
