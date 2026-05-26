# SAFE_SCOPE_SOURCE_EXPANSION_RULES.md

## Expansion Rules
- No placeholders allowed.
- No synthetic dates (2026+ requires verifiable source).
- No generic source titles (e.g., "Source Title #").
- No generic source URLs (must link to a specific report).
- Every new source must have a manually verifiable official URL.
- Source intelligence must include hazard description, hazard category, citation hints, and grounding notes.
- Expansion occurs in batches of 10.
- Audit `audit-source-quality.cjs` must pass before any gauntlet run.

## Source Tier Policy

### Tier 1 — Regulatory Enforcement
- **OSHA Accident Investigation Summaries, Fatality Reports, Inspection Records.**
- **MSHA Fatality Reports / Archived Fatalities.**
- *Use:* Gauntlet scenarios, citation authority, corrective actions, primary source of truth.

### Tier 2 — Investigative/Technical
- **NIOSH FACE, CSB reports, OSHA Construction Engineering reports.**
- *Use:* Gauntlet scenarios (incident-specific), hazard lessons, control recommendations, citation authority (indirect).

### Tier 3 — Contextual/Statistical
- **NSC Injury Facts, BLS data.**
- *Use:* Trend context, market risk prioritization, executive summaries.
- *Restriction:* No direct citation authority or primary incident scenario.

## Citation Strategy
- OSHA/MSHA citations are primary.
- NIOSH/CSB observations must be clearly separated from regulatory citations.
- NIOSH/CSB standards hints must be flagged as indirect citations.
