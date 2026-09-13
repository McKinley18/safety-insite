export type PipelineStageStatus = 'active' | 'supporting' | 'experimental' | 'stale';

export type PipelineStage = {
  stageId: string;
  stageName: string;
  stagePurpose: string;
  status: PipelineStageStatus;
  requiredInputs: string[];
  producedOutputs: string[];
  guardrails: string[];
};

export const CANONICAL_PIPELINE_REGISTRY: PipelineStage[] = [
  {
    stageId: 'observation_context',
    stageName: 'Observation Normalization',
    stagePurpose: 'Normalize raw input for brain ingestion',
    status: 'active',
    requiredInputs: ['fusedText'],
    producedOutputs: ['observationContext'],
    guardrails: ['advisoryOnly', 'requiresQualifiedReview']
  },
  {
    stageId: 'scenario',
    stageName: 'Scenario Intelligence',
    stagePurpose: 'Map scenario family knowledge',
    status: 'active',
    requiredInputs: ['observationContext'],
    producedOutputs: ['scenarioIntelligence'],
    guardrails: ['advisoryOnly', 'requiresQualifiedReview']
  },
  {
    stageId: 'citation_level_review',
    stageName: 'Citation Level Review',
    stagePurpose: 'Map advisory regulatory candidates',
    status: 'active',
    requiredInputs: ['scenarioIntelligence'],
    producedOutputs: ['citationLevelCandidates'],
    guardrails: ['advisoryOnly', 'requiresQualifiedReview']
  },
  {
    stageId: 'evidence_gap_questions',
    stageName: 'Evidence Gap Question Generation',
    stagePurpose: 'Clarify ambiguities with targeted questions',
    status: 'active',
    requiredInputs: ['scenarioIntelligence'],
    producedOutputs: ['evidenceGapQuestions'],
    guardrails: ['advisoryOnly', 'requiresQualifiedReview']
  },
  {
    stageId: 'corrective_action',
    stageName: 'Corrective Action Reasoning',
    stagePurpose: 'Generate advisory corrective actions',
    status: 'active',
    requiredInputs: ['scenarioIntelligence'],
    producedOutputs: ['correctiveActionReasoning'],
    guardrails: ['advisoryOnly', 'requiresQualifiedReview']
  },
  {
    stageId: 'confidence',
    stageName: 'Decision Confidence',
    stagePurpose: 'Calibrate confidence in reasoning',
    status: 'active',
    requiredInputs: ['scenarioIntelligence'],
    producedOutputs: ['confidenceIntelligence'],
    guardrails: ['advisoryOnly']
  }
];
