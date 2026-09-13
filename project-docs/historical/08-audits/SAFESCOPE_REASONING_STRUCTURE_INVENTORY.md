# SafeScope Reasoning Structure Inventory

## 1. Executive Summary
SafeScope currently functions as a hybrid expert reasoning system. Finding descriptions are processed via a sequence of classification and analysis services. The logic is largely deterministic, relying on a mix of ad-hoc keyword detection and increasingly centralized registry-based lookup for taxonomies, standards applicability, and corrective action templates.

## 2. Current Reasoning Flow
1. **Intake:** `SafeScopeReasoningOrchestratorService.reason()` takes `SafeScopeReasoningRequest`.
2. **Jurisdiction:** `assessJurisdiction()` identifies MSHA/OSHA based on keywords.
3. **Classification:** `classifyHazard()` detects the hazard domain using a registry-based taxonomy model.
4. **Analysis:** `ApplicabilityAnalysisService` analyzes regulatory standards fit.
5. **Corrective Action:** `CorrectiveActionReasoningService` uses template registries to generate recommendations.
6. **Confidence:** `calculateConfidence()` calibrates results based on signals and evidence gaps.
7. **Result:** Produces `SafeScopeReasoningResult`.

## 3. Current Inputs
- `findingDescription` (text observation)
- `siteType` (mine/facility)
- `taskContext` (task description)
- `industryContext` (authority context)
- `equipmentInvolved` (equipment description)
- `enableApprovedKnowledgeContext` (bool)
- `photosAvailable` (bool)

## 4. Current Outputs
- `hazardClassification` (primary domain, reasons)
- `applicabilityAnalysis` (standards fit)
- `correctiveActionReasoning` (recommended actions)
- `confidence` (level, reasons)
- `equipmentTaskMechanismContext` (failure mode match)
- `primaryCitation` (canonical citation if applicable)

## 5. Current Registries and Knowledge Sources
- `SAFESCOPE_TAXONOMY_REGISTRY` (domains/aliases)
- `STANDARDS_APPLICABILITY_REGISTRY` (citations/rationale)
- `CORRECTIVE_ACTION_TEMPLATE_REGISTRY` (recommendation templates)
- `SAFESCOPE_MECHANISM_REGISTRY` (failure modes)

## 6. Current Decision Points
- Domain routing (expert language vs taxonomy lookup)
- Citation selection based on jurisdiction and domain
- Corrective action template selection
- Confidence calibration (high/mod/low)
- Mechanism ID normalization

## 7. Current Weaknesses
- **Taxonomy Mismatch:** Domain naming conventions differ between registries and benchmark expectations.
- **Citation Fidelity:** Not all domain/context permutations have authoritative primary citations mapped.
- **Action Specificity:** Keyword matching for corrective actions is still prone to false negatives due to strict string matching.
- **Mechanism Normalization:** Descriptive labels still frequently leak into reports instead of canonical IDs.

## 8. What Should Be Improved First
The highest priority is **Taxonomy and Mechanism ID alignment**. The reasoning engine must be strictly forced to output canonical IDs for domains and mechanisms that map 1:1 with the audit benchmark requirements, ensuring the evaluator can reliably score the output.

## 9. Files Reviewed
- `backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts`
- `backend/src/safescope-v2/taxonomy/safescope-taxonomy.registry.ts`
- `backend/src/safescope-v2/standards/standards-applicability.registry.ts`
- `backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts`
- `backend/src/safescope-v2/mechanism-intelligence/safescope-mechanism.registry.ts`

## 10. Do Not Touch / Preserve
- All core `backend/src/safescope-v2/` service files without explicit review.
- Existing benchmark structure (`safescope-data/benchmarks/`).
