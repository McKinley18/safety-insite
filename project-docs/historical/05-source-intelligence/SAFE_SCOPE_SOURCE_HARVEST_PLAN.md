# SAFE_SCOPE_SOURCE_HARVEST_PLAN.md

## Why Manual/LLM Candidate Generation Failed
Manual or Gemini-only candidate generation proved prone to hallucinated URLs, category-page selection, and generic placeholder data. A repeatable, automated harvesting flow ensures that candidates are validated against live official sources with explicit content extraction before ingestion into the verification pool.

## Source Harvesting Flow
1. **Seed Definition:** Define specific incident-level URLs in `SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json`.
2. **Extraction:** `harvest-source-candidates.cjs` fetches content, follows redirects, and extracts raw text.
3. **Filtering:** Reject non-200 responses, landing pages, and content that lacks incident-specific metadata.
4. **Validation:** Produce an audit report and a draft candidate file for human verification.
5. **Ingestion:** Only after manual review are vetted records moved to `SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json`.

## Acceptance Criteria
- Valid HTTP 200 response.
- Content must contain incident-specific facts.
- No category or search landing pages.
- Evidence text > 25 words.

## Future Integration
Once a candidate is validated by `audit-source-quality.cjs`, it is promoted to the master verification pool.
