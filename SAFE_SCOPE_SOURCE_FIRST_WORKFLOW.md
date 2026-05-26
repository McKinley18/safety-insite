# SAFE_SCOPE_SOURCE_FIRST_WORKFLOW.md

## Why Scenario-First Remediation Was Rejected
The scenario-first approach led to the creation of "placeholder" sources to satisfy scenario counts. This approach often results in generic landing page URLs (e.g., osha.gov/fatalities), fabricated titles, and synthetic mappings, which compromise the integrity and regulatory traceability of the SafeScope dataset.

## Source-First Workflow Steps
1. **Curate Tier-1/Tier-2 official sources** first.
2. **Verify URL and Title** specifically for an investigation/inspection record.
3. **Draft Source Intelligence entry** within `SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json`.
4. **Audit** using `collect-verified-source-candidates.cjs`.
5. **Map to Scenario** only after verification passes.

## Acceptance Criteria
- Must link to specific, incident-level official URL.
- Must have clearly extractable facts (title, date, summary).
- Must map to a hazard category supported by `hazard-taxonomy.ts`.

## Rejection Criteria
- Generic category/landing page URLs (e.g., osha.gov/fatalities).
- 404/broken URLs.
- Placeholder descriptions ("Based on OSHA data").
- Synthetic or future dates.

## Source Authority Tiers
- **Tier 1:** OSHA/MSHA (Direct regulatory/enforcement).
- **Tier 2:** NIOSH FACE, CSB (Official investigative/research).
- **Tier 3:** NSC/BLS (Statistical/Trend context only).

## Rules
- Batch size: 5 verified sources.
- No JSON dataset edits until verification is complete.
