# Standards Experience Audit

This is treated as the critical audit area it was flagged as. Findings combine live browser verification with a full source-code trace (delegated to a research pass; file:line citations preserved below).

## Live verification
A real machine-guarding finding was generated (`29 CFR 1910.219(c)`). The citation renders as plain styled text (blue-ish color, looks like a link) in both the "Primary standard" card and the Finding Builder summary chip. **It is not a link, button, or any other interactive element** — confirmed via accessibility-tree inspection (`generic` role, no href, no click handler) and by clicking directly on it twice with no navigation, no modal, and no network request firing. There is no click-through to any standard detail view anywhere in the exercised UI.

## Source trace: where the suggestion comes from, and what text is actually shown
- Citation suggestion is pure regex/rule matching (`backend/src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts`, `standard-applicability.service.ts`) plus a ranking pass (`inspection-citation-ranking.service.ts`) that only manipulates citation strings — no database lookup of regulatory text happens at suggestion time.
- The **content** shown for a standard (title, "standard text," summary) comes from a `standards_master` table (`backend/src/standards/entities/standard.entity.ts`), populated by two seed paths:
  - `backend/src/safescope-v2/standards/safescope-standards.seed.ts` — hand-typed condensed paraphrases (confirmed live: 19 rows, 13 OSHA / 6 MSHA in this environment).
  - `backend/src/standards/seed/sync-standards-intelligence-to-master.ts` — copies `plainLanguageSummary || title`, i.e. explicitly a summary field, never full CFR/MSHA text.
- The frontend's own display logic (`frontend-next/lib/inspection/standardDisplay.ts`) **does** contain a label hierarchy that tries to distinguish "Official standard text" from "Summary" from "HazLenz explanation" — but because the only text ever populated into `standardText` is itself a paraphrase, any standard sourced this way would be labeled **"Official standard text" while actually being a paraphrase**. This is a labeling-accuracy risk, not just a completeness gap.
- **Genuine, verbatim regulatory text does exist in the codebase** — `backend/src/safescope-knowledge/` has real eCFR/MSHA ingestion connectors (`msha-30-cfr.connector.ts`, `osha-ecfr.connector.ts`) that fetch and parse actual government XML into a `safescope_knowledge_chunks`/`documents` store, and a separate `RegulatorySection.textPlain` store fed by `regulatory-sync.service.ts`. **Neither of these is wired into the live HazLenz finding/citation flow** — confirmed no references to either service inside `safescope-v2`, and no frontend calls to their controllers.

## Verdicts (per the audit's required taxonomy)
| | Verdict | Basis |
|---|---|---|
| Standard actually exists / citation subsection format is plausible | Not independently verified against the CFR itself in this pass (would require external lookup, out of scope for a local-only audit) | — |
| Application can display **actual relevant regulatory text** | **MISSING_TEXT** | `standardText` is a paraphrase everywhere it's populated in the live path; the real-text stores are orphaned. |
| HazLenz explanation visually distinct from authoritative language | **Not achieved in practice**, despite code that tries to | The label logic exists but has nothing genuinely authoritative to label. |
| User can click through to see more | **BROKEN_LINK** (worse — no link exists at all; live-verified) | Confirmed by direct interaction. |
| User can navigate back to the finding easily | N/A — there's nowhere to navigate to | — |

**Overall, for both OSHA and MSHA: SUMMARY_ONLY, presented with a UI label that claims "Official standard text."** This is the most consequential finding in the entire audit for professional/regulatory credibility — a safety professional reading "Official standard text: [paraphrase]" could reasonably believe they are looking at verbatim CFR/MSHA language when they are not.

## Architecture implication
The real regulatory-text infrastructure (ingestion connectors, chunked knowledge store, regulatory-release governance with checksums) is substantial and appears production-intended, but is currently disconnected from the feature that would use it. Wiring the existing `safescope-knowledge` store into the finding/citation display — or at minimum relabeling `standardText` honestly as "Summary" until that wiring exists — is the two options worth carrying into the backlog.
