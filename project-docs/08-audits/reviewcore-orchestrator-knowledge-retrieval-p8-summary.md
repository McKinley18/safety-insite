# ReviewCore Orchestrator Knowledge Retrieval Integration (P8)

## Purpose
Integrate governed knowledge retrieval into the reasoning orchestrator output as source-governed metadata to provide context without replacing existing reasoning logic.

## Summary of Integration
- Added `governedKnowledgeRetrieval` block to `SafeScopeReasoningResult`.
- Updated `SafeScopeReasoningOrchestratorService` to call `ReviewCoreKnowledgeRetrievalService` and populate the metadata block.
- Implemented P8 validator (`validate-reviewcore-orchestrator-knowledge-retrieval-p8.ts`) to ensure correct retrieval, guardrail compliance, and no prohibited final-decision language.

## Retrieval Capabilities
- Surface evidence needs when no matches are found.
- Include matched record metadata for hazards.
- Maintain strict advisory-only guardrails.

## Next Phase
- Monitor retrieval quality and refine seed records as needed based on field observations.
- Integrate retrieval into the `SafescopeV2Service` surface if needed for frontend display.
