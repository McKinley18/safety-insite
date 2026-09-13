Continue from the current clean Sentinel_Safety repo state.

Build SafeScope Visual Evidence Reasoning v1.

Current baseline:
- main is clean and synced with origin/main.
- Latest commit should include Semantic Synonym Expansion v1.
- SafeScope already has evidence weighting, multi-hazard decomposition, narrative synthesis, causal chains, corrective action ranking, residual risk verification, human review feedback loop, source freshness governance, jurisdiction decision tree, audit-ready trace, source ingestion workflow, reviewer candidate console backend/frontend/API wiring, and semantic synonym expansion.

Goal:
Implement a deterministic visual evidence reasoning layer that evaluates attached inspection evidence metadata and field photo notes. This is NOT full image recognition yet. It should prepare the system for future photo AI by reasoning over photo presence, photo metadata, captions/notes, linked findings, and consistency with the written observation.

Create new system:
backend/src/safescope-v2/visual-evidence-reasoning/
- visual-evidence-reasoning.types.ts
- visual-evidence-reasoning.service.ts
- visual-evidence-reasoning.validator.ts

Create validator:
backend/scripts/validate-safescope-visual-evidence-reasoning-v1.ts

Core service behavior:
Accept input object:
{
  observationText: string;
  taxonomyRoute?: any;
  evidenceWeighting?: any;
  multiHazardAnalysis?: any;
  semanticSynonymExpansion?: any;
  attachments?: Array<{
    id: string;
    type: 'photo' | 'video' | 'document' | 'note';
    fileName?: string;
    capturedAt?: string;
    linkedFindingId?: string;
    caption?: string;
    fieldNotes?: string;
    locationTag?: string;
    viewType?: 'wide_area' | 'close_up' | 'control_status' | 'employee_exposure' | 'equipment_id' | 'tag_label' | 'unknown';
  }>;
  context?: any;
}

Output should include:
{
  version: 'visual_evidence_reasoning_v1';
  evidencePresence: 'none' | 'present' | 'partial' | 'unclear';
  visualSupportLevel: 'supportive' | 'partially_supportive' | 'insufficient' | 'conflicting' | 'not_evaluated';
  photoEvidenceScore: number;
  linkedAttachmentCount: number;
  relevantAttachmentIds: string[];
  missingVisualEvidence: string[];
  visualConsistencyFlags: string[];
  reviewerQuestions: string[];
  confidenceImpact: 'boost' | 'neutral' | 'downgrade' | 'block_confident_language';
  advisoryBoundary: string;
}

Deterministic logic:
1. If no attachments exist:
   - evidencePresence = none
   - visualSupportLevel = insufficient
   - confidenceImpact = downgrade
   - Ask for relevant photos when the hazard normally benefits from visual confirmation.

2. If attachments exist but none are photos/videos:
   - evidencePresence = partial
   - visualSupportLevel = partially_supportive or insufficient
   - Ask for photo evidence.

3. If photos are present but missing captions/fieldNotes/viewType:
   - evidencePresence = present
   - visualSupportLevel = partially_supportive
   - Ask for close-up/wide/context photos depending on hazard type.

4. If observation includes visual-state hazards, ask for specific views:
   - machine guarding/conveyor/nip point/unguarded: close-up of guard/control status + wide area showing access/exposure.
   - electrical/damaged cord/panel/live/energized: close-up of condition + control status + barricade/access view.
   - hazcom/unlabeled/SDS/container: close-up of label/container + surrounding area.
   - fall/open edge/guardrail/hole: wide area + edge/guardrail detail + exposure path.
   - mobile equipment/pedestrian/blind spot: traffic path + pedestrian exposure + signage/barricade.
   - spill/wet floor/leak: wide area + source + post-cleanup dry verification.
   - confined space/atmosphere/testing: entry point + permit/testing documentation if attached.

5. Contradiction/consistency flags:
   - If observation says unguarded/missing/no guard but photo notes/captions say guarded/guard installed/guard in place, flag conflict.
   - If observation says unlabeled but photo notes/captions say labeled/label visible, flag conflict.
   - If observation says wet/spill/leaking but photo notes/captions say cleaned/dry/no spill, flag conflict.
   - If observation says energized/live/running but photo notes/captions say de-energized/locked out/off, flag conflict.
   - Use word-boundary/phrase-safe matching. Do not let guarded match inside unguarded or labeled inside unlabeled.

6. Scoring:
   - Start at 0.
   - +2 for each relevant photo/video.
   - +2 for close_up when hazard requires condition detail.
   - +2 for wide_area when exposure/access/context matters.
   - +2 for control_status when control failure is alleged.
   - +2 for employee_exposure when employee exposure is alleged.
   - -5 for conflicts.
   - -2 for missing required visual evidence.
   - Clamp score 0-10.
   - supportive: score >= 7 and no conflicts.
   - partially_supportive: score 4-6 and no conflicts.
   - insufficient: score < 4 and no conflicts.
   - conflicting: any consistency conflict.

7. Must preserve advisory boundaries:
   - Do not say photo proves a violation.
   - Do not say citation.
   - Do not make enforcement/legal conclusions.
   - Say visual evidence appears supportive/insufficient/conflicting based on metadata and field notes only.

Integrate into:
backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.types.ts
backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service.ts
backend/src/safescope-v2/field-output-composer-v1/field-output-composer-v1.service.ts
backend/src/safescope-v2/audit-ready-reasoning-trace/audit-ready-reasoning-trace.service.ts

Retrieval output must include visualEvidenceReasoning.

Composer should:
- Surface visual evidence status in the field-facing output.
- Add reviewer questions for missing or conflicting visual evidence.
- Downgrade confident language if visualSupportLevel is insufficient or conflicting.
- Preserve advisory-only language.

Audit trace should:
- Include visual evidence reasoning in confidence modifiers.
- Include visual evidence reviewer questions in the reviewer checklist.
- Include visual consistency conflicts in human review gates.

Validation cases must include:
1. No attachments for unguarded conveyor -> insufficient/downgrade/questions for photos.
2. Unguarded conveyor with close-up + wide-area photos -> supportive.
3. Unguarded conveyor observation but caption says guard installed -> conflicting.
4. Wet floor spill with photo marked cleaned/dry -> conflicting or partial depending wording.
5. Electrical damaged cord with close-up and control_status -> supportive or partially_supportive.
6. Unlabeled chemical container with tag_label photo -> supportive.
7. Fall/open edge with only close-up but no wide-area exposure view -> partially_supportive with missing wide-area question.
8. Integration case verifying retrieval output includes visualEvidenceReasoning.
9. Integration case verifying composer downgrades language for conflicting visual evidence.
10. Integration case verifying audit trace includes visual evidence checklist items.

Update validation runners:
backend/scripts/run-safescope-full-validation.ts
backend/scripts/run-safescope-targeted-validation.ts

Add validator to areas:
- core
- output
- orchestrator
- governance if relevant

Update docs:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md
project-docs/04-safescope-engine/SAFESCOPE_REMAINING_AI_CLASSIFICATION_GAP_ANALYSIS.md

Archive this prompt:
project-docs/09-archive-reference/prompts/SAFESCOPE_VISUAL_EVIDENCE_REASONING_V1_PROMPT.md

Run validation:
cd backend
npm run validate:safescope:targeted:core
npm run validate:safescope:targeted:output
npm run validate:safescope:targeted:orchestrator
npm run build
npm run validate:safescope:full

cd ../frontend-next
npm run build

cd ..

Before commit, discard generated validation data churn if present:
git restore \
  safescope-data/benchmarks/safescope-precision-batch-001-results.v1.json \
  safescope-data/benchmarks/safescope-precision-batch-002-results.v1.json \
  safescope-data/benchmarks/safescope-precision-batch-003-results.v1.json \
  safescope-data/reviewer-candidates/candidates.json 2>/dev/null || true

Commit locally only:
git add relevant files
git commit -m "Add SafeScope visual evidence reasoning v1"

Do not push.
