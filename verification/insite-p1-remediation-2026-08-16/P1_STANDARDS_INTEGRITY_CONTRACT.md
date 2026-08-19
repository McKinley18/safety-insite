# P1-02 / P1-03 — Standards Label Integrity Contract and Interactive Citations

## Label integrity (Phase 6/7)

Per `P1_STANDARDS_DATA_TRACE.md`, no verbatim regulatory text is reachable in the current live data path for either OSHA or MSHA. Therefore:

- **Production change**: `frontend-next/lib/inspection/standardDisplay.ts` — `getStandardDisplayText()`'s top-priority label (sourced from `standardText`/`regulatoryText`/`regulationText`/`fullText`) renamed from `"Official standard text"` to `"HazLenz standard summary"`. A code comment documents why (paraphrase-only source fields, no wired verbatim store) so a future contributor doesn't silently reintroduce the false claim. The `"Summary"` and `"HazLenz explanation"` tiers (lower-priority fallbacks, already honestly named) are unchanged.
- No content is currently labeled as official/authoritative regulatory language anywhere in the display path. This is not a placeholder for a future tier that doesn't yet exist — no dead/inert "verbatim" tier was added, since one cannot honestly be exercised today (see "Gap for future work" below).
- Scope note: the lower-confidence "vague input" candidate list in `SafeScopeStandardsSection.tsx` (shown only when `isVague` is true) renders citation text as a plain, non-interactive label, unchanged by this phase — it surfaces low-confidence candidates pending more evidence, not confirmed applicable standards, and was judged out of scope for the citation-interactivity fix to keep the change narrowly targeted at the primary/supporting standard cards the audit specifically flagged.

## Interactive citations (Phase 8)

- **Production change**: `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` — added `StandardCitationHeading`, a small client component (`useState` expand/collapse) that replaces the previously static citation `<p>`. It renders the citation/title as a clickable, visually-affordant button (dotted underline, hover state, explicit "Standard detail" / "Hide standard detail" label) that expands an "Official regulation text" panel in place, directly beneath the citation, without navigating away from the finding — consistent with the existing `<details>`-based progressive-disclosure pattern already used elsewhere in the same component ("Why this matched", "Match Details").
- Expanded panel content is the honest unavailable-text state (see below), always placed above the existing HazLenz-summary block so the two are visually and semantically separated: citation/subsection → official-text availability → HazLenz's own summary/explanation, matching the requested drill-down order.
- No route change, no external navigation, no new dependency — an in-place expand/collapse, per the task's preference for a lightweight detail experience.

## Behavior when authoritative text is unavailable (Phase 7)

Exact copy shown in the expanded panel:

> **Official regulation text**
> The verbatim text of [citation] is not currently available in HazLenz's local standards corpus. The summary below is a HazLenz-authored overview, not the official regulation language — consult the cited regulation directly for the verbatim requirement.

This does not fabricate or silently fetch/generate paraphrased text under an official label — it states plainly that the local corpus lacks the verbatim text and directs the user to the authoritative source.

## Gap documented for future standards-data work

Two pre-existing, code-complete-but-unwired capabilities could close this gap without more infrastructure work:
1. `RegulatorySection`/`regulatory-sync.service.ts` — the entity and sync service exist, but no migration provisions the `regulatory_section` table (confirmed absent from all 35 migrations; verified live via `psql`). Adding that migration and running a real sync would give the app genuine verbatim CFR/MSHA text for at least the citations it covers.
2. `msha-30-cfr.connector.ts` / `osha-ecfr.connector.ts` — real ingestion connectors exist and can fetch actual government XML, but the currently-seeded knowledge corpus was populated by a separate, HazLenz-authored "starter reference" seed script instead of by running these connectors.

Neither was exercised in this phase: provisioning a new table and/or making live outbound calls to government sources to backfill real regulatory text is a distinct, larger body of work than a P1 label/interactivity fix, and doing it hastily risked exactly the kind of unverified fabrication this phase was tasked with avoiding. This is recorded as backlog, not silently worked around.
