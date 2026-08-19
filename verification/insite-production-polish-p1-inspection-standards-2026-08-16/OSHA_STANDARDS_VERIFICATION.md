# OSHA Authoritative Text Verification

## Real citation exercised

`29 CFR 1910.303` (electrical, general requirements) — produced live by HazLenz as a candidate standard (`29 CFR 1910.303(g)(2)(i)`, "Lockout / Stored Energy") for a real observation submitted through `/inspection-workspace` ("The rotating shaft coupling on the conveyor drive near the main production floor has no fixed guard installed...").

## Chain proven end-to-end, live in the browser

1. **Finding** — real finding generated and finalized through the actual wizard (`machine_guarding_loto`), not a fixture.
2. **Citation** — `29 CFR 1910.303(g)(2)(i)` rendered as the finding's candidate standard.
3. **Authoritative record** — `GET /regulatory/section?citation=...` resolved against the disposable database's real, live-ingested `regulatory_section` row (source: `https://www.govinfo.gov/bulkdata/ECFR/title-29/ECFR-title29.xml`, real government bulk XML, no AI generation).
4. **Exact subsection** — the corpus is section-granularity; HazLenz's citation is subsection-granularity. Exact match correctly missed; the parent-section fallback resolved to `29 CFR 1910.303` and the UI disclosed this explicitly ("Showing the full text of 29 CFR 1910.303 — this specific subsection (29 CFR 1910.303(g)(2)(i)) is not separately available...") rather than silently presenting the section as if it were the exact cited subsection.
5. **Official text panel** — clicking "Standard detail" on the real citation heading, in the real wizard, expanded a panel containing real, verbatim § 1910.303 text ("(a) The conductors and equipment required or permitted by this subpart shall be acceptable only if approved... (b) —(1) Electric equipment shall be free from recognized hazards...").

## What is NOT claimed

- Independent verification against the CFR itself outside this pipeline (e.g. manually cross-checking against a second, unrelated OSHA source) was not performed — out of scope for a local-only verification pass, consistent with the prior phase's stated limitation.
- Paragraph-level `(g)(2)(i)` text specifically was not available (see `STANDARDS_TEXT_FOUNDATION.md` — scope explicitly disclosed rather than fabricated).
