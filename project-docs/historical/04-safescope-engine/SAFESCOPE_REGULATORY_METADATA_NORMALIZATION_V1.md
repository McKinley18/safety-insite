# SafeScope Regulatory Metadata Normalization v1

This document outlines the architecture for the `RegulatoryMetadataNormalizationService`, which analyzes SafeScope records containing unknown or placeholder metadata and provides deterministic suggestions to stage them for promotion.

## Purpose
Currently, many draft records in SafeScope contain placeholder metadata (e.g., `agency: UNKNOWN`, `citation: source_review_required`). To progress these drafts toward approval, we must accurately attach official regulatory citations and jurisdictions.

This service acts as an intelligent, read-only mapping layer. It evaluates hazard families and titles to suggest normalized metadata, determining each draft's "promotion readiness".

## Operation
The service consumes the local `RegulatorySourceInventory` and analyzes every record. For those with unknown metadata:
1.  **Keyword and Hazard Family Analysis:** It applies strict, deterministic rules to map records (e.g., 'confined_space' maps to 'OSHA 1910.146', 'trench' maps to 'OSHA Construction Subpart P').
2.  **Confidence Scoring:** It assigns a confidence level (`high`, `medium`, `low`) to its suggestion based on the clarity of the mapping.
3.  **Readiness Classification:** Each record receives a `promotionReadiness` state:
    *   `ready_for_reviewer`: Has complete metadata and is ready for human approval.
    *   `needs_source_lookup`: Has a suggested mapping, but requires a reviewer to fetch/verify the actual text.
    *   `duplicate_or_overlap`: Has complete metadata but overlaps with an existing citation.
    *   `unsafe_to_promote`: Cannot be safely promoted (e.g., already approved, fundamentally flawed).
    *   `insufficient_metadata`: Unable to determine metadata deterministically.

## Governance Boundaries
-   **No Live Fetching:** This service strictly uses static, deterministic rules. It does not hit external APIs.
-   **No Auto-Promotion:** Generated suggestions are output to a JSON report. The service **never** modifies the active `ReviewerCandidateConsole` database or the approved registry.
-   **Advisory First:** Suggestions that receive a `high` confidence score still require the `needs_source_lookup` state to force a human to actually pull and verify the live regulatory text.

## Output Structure
The generated `regulatory-metadata-normalization-v1.json` provides a complete map of all analyzed candidates, their original (broken) state, the generated suggestion, and their governance warnings. This acts as a punch-list for safety reviewers to systematically process the draft backlog.
