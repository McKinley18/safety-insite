# SafeScope Source-Grounded Collection TODO

## Purpose

Build `safescope-gauntlet.source.v1.json` only from official MSHA/OSHA source material. Do not fabricate source URLs, citations, excerpts, or case facts.

## Required source groups

### MSHA

1. MSHA Fatality Reports
- Official source: MSHA Fatality Reports
- Collect: fatality alert, preliminary accident report, final investigation report when available
- Target folder: `source-data/msha/fatality-reports`
- Use for: mobile equipment, powered haulage, falls, machinery, electrical, roof/rib, highwall, fire, explosives, confined-space-like entries, maintenance, lockout/blocking

2. MSHA Accident Injuries Dataset
- Official source: Data.gov / MSHA Accident Injuries Data Set
- Collect: CSV or downloadable dataset plus data dictionary
- Target folder: `source-data/msha/accident-injury`
- Use for: non-fatal injury patterns, accident classifications, machinery, slip/trip/fall, handling material, powered haulage

### OSHA

3. OSHA Fatality Inspection Data
- Official source: OSHA Fatality Inspection Data
- Collect: exported dataset
- Target folder: `source-data/osha/fatality-inspections`
- Use for: fatality/catastrophe cases, inspection metadata, industry context

4. OSHA Investigation Summaries
- Official source: OSHA IMIS Accident Investigation Search
- Collect: selected investigation summary pages or exported results
- Target folder: `source-data/osha/investigation-summaries`
- Use for: narrative source-grounded scenarios

5. OSHA Data Downloads
- Official source: OSHA Data
- Collect: inspection/citation/fatality datasets where useful
- Target folder: `source-data/osha/enforcement`
- Use for: standard/citation pattern validation

## Minimum source-grounded v1 target

- Exactly 100 scenarios
- At least 40 MSHA
- At least 40 OSHA
- At least 15 primary hazard families
- Every scenario must include:
  - sourceTitle
  - sourceUrl
  - sourceAgency
  - sourceDate
  - sourceExcerptShort
  - sourceReliability: official
  - sourceGroundingNotes
  - expectedCitationHints
  - prohibitedOverreach

## Quality rules

- Do not invent unsupported facts.
- Keep `sourceExcerptShort` under 25 words.
- Prefer role terms such as miner, worker, operator, mechanic, electrician.
- Do not include victim names unless unavoidable.
- Fatality-derived cases should usually be high or critical severity.
- If source details are incomplete, mark confidence limitations in `sourceGroundingNotes`.
- If a source does not support a specific citation, place likely citation references in `expectedCitationHints`, not as guaranteed citations.
