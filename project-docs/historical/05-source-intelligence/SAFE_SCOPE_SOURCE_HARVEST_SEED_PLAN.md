# SAFE_SCOPE_SOURCE_HARVEST_SEED_PLAN.md

## Purpose
This document outlines the workflow for harvesting new official source candidates. 

## Workflow
1. **Seed Discovery:** Manually identify specific, high-fidelity incident/investigation URLs from tier-appropriate domains.
2. **Seed Entry:** Add these to `SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json`.
3. **Validation:** Run `validate-harvest-seeds.cjs` to ensure structural compliance.
4. **Harvesting:** Run `harvest-source-candidates.cjs` to extract content and audit the harvest.
5. **Human Review:** Verify extracted evidence against the official page.
6. **Promotion:** Promote validated records to the master verified candidate pool.

## Seed Acceptance Criteria
- Must be a verifiable, specific URL (no landing/search pages).
- Must belong to approved domains (cdc.gov, csb.gov, msha.gov, etc.).
- No guessing of URLs (e.g., MSHA slugs or OSHA accidentsearch IDs).

## Rules
- Seed files remain separate from verified candidates to allow for large-scale discovery without polluting the validated repository.
- Harvested candidates must pass `audit-source-quality.cjs` before becoming verified candidates.
