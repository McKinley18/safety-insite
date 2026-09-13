# SafeScope Core Regulatory Draft Promotion Workflow v1

This document describes the governed workflow for promoting verified regulatory draft candidates into the approved knowledge registry.

## Purpose
SafeScope employs a tiered knowledge pipeline. Draft candidates from regulatory expansion packs, ingestion ingestion engines, or manual remediation must pass through specific governance gates before becoming `approved` knowledge. This workflow defines how qualified reviewers promote these candidates safely and deterministically.

## Promotion Workflow
1.  **Draft Staging:** Records reside in `safescope-data/approved-knowledge/draft-candidates/`.
2.  **Reviewer Validation:** A qualified reviewer (e.g., `compliance_admin`) initiates the promotion process via the `RegulatoryDraftPromotionService`.
3.  **Governance Gates:**
    *   **Role Authorization:** Validates the user role (`compliance_admin`, `osha_reviewer`, etc.).
    *   **Governance Check:** Inspects the record for prohibited regulatory language (violation/citation claims) and `advisoryOnly: true` status.
    *   **Duplicate Detection:** Uses the `ApprovedKnowledgeCitationNormalizationService` to block citation duplicates or overlaps.
    *   **Metadata Validation:** Ensures required fields (citation, jurisdiction, authority tier) are complete and valid.
4.  **Deterministic Promotion:**
    *   If all checks pass, the record is moved from the draft pack to the `registry/` directory as an `approved` knowledge record.
    *   The draft pack is updated to remove the promoted record.
    *   Audit reports (`InventoryReport`, `CoverageMatrix`, `MetadataNormalizationReport`) are automatically re-generated to ensure immediate, deterministic reflection of the change.

## Governance Boundaries
- **No Auto-Promotion:** The promotion service is strictly gated; it requires explicit reviewer action.
- **Qualified Human Review:** All source-backed candidates, regardless of metadata quality, require manual review to ensure they conform to the `advisoryOnly` and non-violation guidelines.
- **Traceability:** Every promotion re-triggers the full inventory audit, ensuring an unbroken audit trail of regulatory knowledge changes.
- **Deterministic Validation:** The workflow relies on local-first file operations, ensuring the promotion process can be fully simulated and verified in CI/CD without network calls.
