# ReviewCore Knowledge Architecture (P6)

This architecture defines the governed knowledge structure for ReviewCore, ensuring consistency, security, and traceability of all knowledge records.

## Key Components

- **Knowledge Records**: The core unit of knowledge, including metadata, content, and security guardrails.
- **Taxonomy**: A 24-domain classification system for all records.
- **Normalizer Service**: Manages normalization, classification, duplicate detection, and routing.
- **Seed Records**: 12 foundational, non-copyrighted records.

## Guardrails

- All records undergo duplicate detection before ingestion.
- Prohibited language is checked.
- Confidential data handling is enforced via guardrail fields.

## Validation

The architecture includes a mandatory validation script `backend/scripts/validate-reviewcore-knowledge-architecture-p6.ts`.
