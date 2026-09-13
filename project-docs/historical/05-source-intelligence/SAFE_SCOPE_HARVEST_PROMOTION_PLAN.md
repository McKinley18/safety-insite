# SAFE_SCOPE_HARVEST_PROMOTION_PLAN.md

## Harvested Candidate Promotion Workflow
1. **Review**: All harvested candidates are initially marked `pending_review`.
2. **Decisioning**: Use `SAFE_SCOPE_HARVEST_PROMOTION_DECISIONS.json` to explicitly approve or reject candidates. 
3. **Audit/Preview**: `promote-harvested-candidates.cjs` validates decisions against source fidelity criteria (HTTP 200, evidence length, specific incident facts).
4. **Previewing**: Promoted records are output to `SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES_PREVIEW.json` for final human review.
5. **Merge**: After preview verification, a separate manual step merges the previewed content into `SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json`.
6. **Independence**: This workflow does not trigger automatic scenario generation or gauntlet runs.
