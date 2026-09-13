import {
  HazLenzBrainQuery,
  HazLenzBrainQueryResult,
} from '../hazlenz-brain.types';
import {
  HazLenzMechanismBrainQueryResult,
} from '../mechanism-brain/mechanism-brain.service';
import {
  HazLenzControlsBrainResult,
} from '../controls-brain/controls-brain.service';
import {
  HazLenzEvidenceBrainQueryResult,
} from '../evidence-brain/evidence-brain.service';
import {
  HazLenzScenarioDisambiguationResult,
} from '../scenario-disambiguation/scenario-disambiguation.types';
import {
  HazLenzEvidenceGapIntelligenceResult,
} from '../evidence-gap-intelligence/evidence-gap-intelligence.types';
import {
  HazLenzDecisionConfidenceResult,
} from '../decision-confidence/decision-confidence.types';
import {
  HazLenzLearningMemoryRecord,
  HazLenzLearningMemorySummary,
} from '../learning-memory/learning-memory.types';
import {
  HazLenzImprovementCandidateResult,
} from '../improvement-candidate-engine/improvement-candidate-engine.types';
import {
  HazLenzObservationUnderstandingResult,
} from '../observation-understanding/observation-understanding.types';

export type HazLenzBrainQueryOrchestratorInput = HazLenzBrainQuery & {
  scenarioLabel?: string;
};

export type HazLenzBrainCompartmentSummary = {
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

export type HazLenzBrainSituationalAwarenessPacket = {
  engine: 'safescope_brain_query_orchestrator';
  mode: 'read_only_situational_awareness';
  input: HazLenzBrainQueryOrchestratorInput;

  regulatory: HazLenzBrainQueryResult;
  mechanism: HazLenzMechanismBrainQueryResult;
  controls: HazLenzControlsBrainResult;
  evidence: HazLenzEvidenceBrainQueryResult;
  scenarioDisambiguation: HazLenzScenarioDisambiguationResult;
  evidenceGapIntelligence: HazLenzEvidenceGapIntelligenceResult;
  decisionConfidence: HazLenzDecisionConfidenceResult;
  learningMemorySummary: HazLenzLearningMemorySummary;
  relatedLearningMemories: HazLenzLearningMemoryRecord[];
  improvementCandidateResult: HazLenzImprovementCandidateResult;
  observationUnderstanding: HazLenzObservationUnderstandingResult;

  summary: {
    likelyCitation?: string;
    likelyMechanism?: string;
    observationPrimaryEntityKind?: HazLenzObservationUnderstandingResult['summary']['primaryEntityKind'];
    observationPrimaryEntityLabel?: string;
    observationPrimaryCondition?: HazLenzObservationUnderstandingResult['summary']['primaryCondition'];
    observationLikelyDomainHints: string[];
    observationLikelyMechanismHints: string[];
    observationNegativeDomainHints: string[];
    observationEvidenceGaps: string[];
    selectedScenarioId?: string;
    selectedScenarioLabel?: string;
    scenarioConfidence?: 'low' | 'moderate' | 'high';
    scenarioHumanReviewRecommended?: boolean;
    evidenceGapDisposition: HazLenzEvidenceGapIntelligenceResult['recommendedDisposition'];
    evidenceGapHighestSeverity?: HazLenzEvidenceGapIntelligenceResult['highestSeverity'];
    evidenceGapCriticalQuestions: string[];
    decisionConfidenceLevel?: HazLenzDecisionConfidenceResult['confidenceLevel'];
    defensibilityScore?: number;
    decisionRecommendedDisposition?: HazLenzDecisionConfidenceResult['recommendedDisposition'];
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
    compartmentSummaries: HazLenzBrainCompartmentSummary[];
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
