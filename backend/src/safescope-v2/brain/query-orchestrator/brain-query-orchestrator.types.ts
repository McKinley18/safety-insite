import {
  SafeScopeBrainQuery,
  SafeScopeBrainQueryResult,
} from '../safescope-brain.types';
import {
  SafeScopeMechanismBrainQueryResult,
} from '../mechanism-brain/mechanism-brain.service';
import {
  SafeScopeControlsBrainResult,
} from '../controls-brain/controls-brain.service';
import {
  SafeScopeEvidenceBrainQueryResult,
} from '../evidence-brain/evidence-brain.service';
import {
  SafeScopeScenarioDisambiguationResult,
} from '../scenario-disambiguation/scenario-disambiguation.types';
import {
  SafeScopeEvidenceGapIntelligenceResult,
} from '../evidence-gap-intelligence/evidence-gap-intelligence.types';
import {
  SafeScopeDecisionConfidenceResult,
} from '../decision-confidence/decision-confidence.types';
import {
  SafeScopeLearningMemoryRecord,
  SafeScopeLearningMemorySummary,
} from '../learning-memory/learning-memory.types';
import {
  SafeScopeImprovementCandidateResult,
} from '../improvement-candidate-engine/improvement-candidate-engine.types';
import {
  SafeScopeObservationUnderstandingResult,
} from '../observation-understanding/observation-understanding.types';

export type SafeScopeBrainQueryOrchestratorInput = SafeScopeBrainQuery & {
  scenarioLabel?: string;
};

export type SafeScopeBrainCompartmentSummary = {
  compartment:
    | 'observation_understanding'
    | 'regulatory_brain'
    | 'mechanism_brain'
    | 'controls_brain'
    | 'evidence_brain'
    | 'scenario_disambiguation'
    | 'evidence_gap_intelligence'
    | 'decision_confidence'
    | 'learning_memory'
    | 'improvement_candidate_engine';
  topRecordId?: string;
  topLabel?: string;
  topScore?: number;
  matchCount: number;
  reasonCodes: string[];
};

export type SafeScopeBrainSituationalAwarenessPacket = {
  engine: 'safescope_brain_query_orchestrator';
  mode: 'read_only_situational_awareness';
  input: SafeScopeBrainQueryOrchestratorInput;

  regulatory: SafeScopeBrainQueryResult;
  mechanism: SafeScopeMechanismBrainQueryResult;
  controls: SafeScopeControlsBrainResult;
  evidence: SafeScopeEvidenceBrainQueryResult;
  scenarioDisambiguation: SafeScopeScenarioDisambiguationResult;
  evidenceGapIntelligence: SafeScopeEvidenceGapIntelligenceResult;
  decisionConfidence: SafeScopeDecisionConfidenceResult;
  learningMemorySummary: SafeScopeLearningMemorySummary;
  relatedLearningMemories: SafeScopeLearningMemoryRecord[];
  improvementCandidateResult: SafeScopeImprovementCandidateResult;
  observationUnderstanding: SafeScopeObservationUnderstandingResult;

  summary: {
    likelyCitation?: string;
    likelyMechanism?: string;
    observationPrimaryEntityKind?: SafeScopeObservationUnderstandingResult['summary']['primaryEntityKind'];
    observationPrimaryEntityLabel?: string;
    observationPrimaryCondition?: SafeScopeObservationUnderstandingResult['summary']['primaryCondition'];
    observationLikelyDomainHints: string[];
    observationLikelyMechanismHints: string[];
    observationNegativeDomainHints: string[];
    observationEvidenceGaps: string[];
    selectedScenarioId?: string;
    selectedScenarioLabel?: string;
    scenarioConfidence?: 'low' | 'moderate' | 'high';
    scenarioHumanReviewRecommended?: boolean;
    evidenceGapDisposition: SafeScopeEvidenceGapIntelligenceResult['recommendedDisposition'];
    evidenceGapHighestSeverity?: SafeScopeEvidenceGapIntelligenceResult['highestSeverity'];
    evidenceGapCriticalQuestions: string[];
    decisionConfidenceLevel?: SafeScopeDecisionConfidenceResult['confidenceLevel'];
    defensibilityScore?: number;
    decisionRecommendedDisposition?: SafeScopeDecisionConfidenceResult['recommendedDisposition'];
    decisionWarnings: string[];
    learningMemoryRecordCount: number;
    learningMemoryCorrectionTargets: string[];
    learningMemoryRecommendedBacklog: string[];
    improvementCandidateCount: number;
    improvementCandidateTopTargets: string[];
    improvementCandidateCriticalCount: number;
    improvementCandidateHighCount: number;
    likelyControls: string[];
    criticalEvidenceQuestions: string[];
    compartmentSummaries: SafeScopeBrainCompartmentSummary[];
    reasoningNotes: string[];
  };

  boundary: {
    readOnly: true;
    canCreateCitation: false;
    canDeclareViolation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
    canModifyProductionReasoning: false;
    requiresQualifiedReview: true;
  };
};
