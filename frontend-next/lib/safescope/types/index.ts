export type NarrativeMode = 'concise' | 'professional' | 'audit';

export type SafeScopeNarrative = {
  findingTitle: string;
  findingSummary: string;
  scenarioExplanation: string;
  mechanismOfInjuryNarrative: string;
  exposureNarrative: string;
  evidenceGapNarrative: string;
  followUpQuestionNarrative: string;
  standardFamilyReviewNarrative: string;
  citationCandidateReviewNarrative: string;
  correctiveActionNarrative: string;
  immediateActionNarrative: string;
  interimControlNarrative: string;
  permanentCorrectionNarrative: string;
  administrativeFollowUpNarrative: string;
  verificationNarrative: string;
  confidenceNarrative: string;
  qualifiedReviewDisclaimer: string;
  auditAppendixNarrative: string;
};

export type ScenarioIntelligence = {
  scenarioFamilyId: string;
  equipment: string;
  task: string;
  unsafeCondition: string;
  operationalState: string;
  energySource: string;
  mechanismOfInjury: string;
  exposedPersonActivity: string;
  missingOrFailedControls: string[];
  hierarchyLevel: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe' | 'unknown';
  candidateStandardFamily: string;
  evidenceGaps: string[];
  confidenceSignals: {
    score: number;
    reasoning: string[];
  };
  qualifiedReviewRequired: boolean;
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
};

export type StandardFamilyCandidateRecord = {
  id: string;
  title: string;
  jurisdictionContext: string[]; 
  candidateFamily: string;
  relatedScenarioFamilies: string[];
  relatedHazardDomains: string[];
  relatedEquipmentIndicators: string[];
  relatedTaskIndicators: string[];
  relatedMechanismOfInjuryIndicators: string[];
  relatedExposureIndicators: string[];
  relatedMissingControlIndicators: string[];
  evidenceRequired: string[];
  evidenceGaps: string[];
  confidenceBoosters: string[];
  confidenceReducers: string[];
  humanReviewTriggers: string[];
  reasoningNotes: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};

export type CitationLevelCandidateReview = {
  id: string;
  sourceId: string;
  citation: string;
  title: string;
  agency: string;
  jurisdiction: string;
  industryScope: string[];
  authorityTier: string;
  approvalStatus: string;
  relatedStandardFamily: string;
  relatedScenarioFamilies: string[];
  relatedHazardDomains: string[];
  relatedEquipmentIndicators: string[];
  relatedTaskIndicators: string[];
  relatedMechanismIndicators: string[];
  relatedExposureIndicators: string[];
  requiredEvidence: string[];
  missingEvidence: string[];
  evidenceSatisfied: boolean;
  confidence: number;
  confidenceBoosters: string[];
  confidenceReducers: string[];
  humanReviewTriggers: string[];
  applicabilityNotes: string[];
  prohibitedUses: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
  sourceTrace: string[];
};

export type CorrectiveActionReasoning = {
  scenarioFamilyId: string;
  hazardDomain: string;
  mechanismOfInjury: string;
  exposurePathway: string;
  missingOrFailedControls: string[];
  immediateActions: string[];
  interimControls: string[];
  permanentCorrections: string[];
  administrativeFollowUps: string[];
  verificationSteps: string[];
  evidenceNeededBeforeFinalizing: string[];
  responsibleRoleSuggestions: string[];
  urgencyLevel: 'low' | 'moderate' | 'high' | 'critical';
  controlHierarchyLevel: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe' | 'unknown';
  standardFamilyReviewLinks: string[];
  confidence: number;
  humanReviewTriggers: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};

export type EvidenceGapQuestionRecord = {
  id: string;
  scenarioFamilyId: string;
  hazardDomain: string;
  evidenceGapId: string;
  question: string;
  reasonForQuestion: string;
  relatedMechanismOfInjury: string;
  relatedExposurePathway: string;
  relatedMissingControl: string;
  relatedStandardFamilyCandidate: string;
  priority: 'low' | 'moderate' | 'high' | 'critical';
  answerType: 'text' | 'boolean' | 'multiple-choice' | 'photo';
  examplesOfUsefulEvidence: string[];
  confidenceImpact: string;
  humanReviewTrigger: boolean;
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};

export type SafeScopeNormalizedObservationContext = {
  rawObservation: string;
  normalizedText: string;
  matchedTerms: string[];
  detectedEquipment: string[];
  detectedTasks: string[];
  detectedUnsafeConditions: string[];
  detectedOperationalStates: string[];
  detectedEnergySources: string[];
  detectedMechanismsOfInjury: string[];
  detectedExposureSignals: string[];
  detectedControls: string[];
  detectedMissingOrFailedControls: string[];
  detectedJurisdictionSignals: string[];
  detectedIndustrySignals: string[];
  ambiguitySignals: string[];
  conflictSignals: string[];
  photoLikeDescriptionSignals: string[];
  employeeExposureKnown: boolean;
  employeeExposureUnclear: boolean;
  taskContextKnown: boolean;
  operationalStateKnown: boolean;
  confidenceSignals: {
    score: number;
    reasoning: string[];
  };
  evidenceGaps: {
    missingEvidence: string[];
    ambiguities: string[];
    conflicts: string[];
  };
  trace: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};

export type SafeScopeIntelligenceResult = {
  observationContext?: SafeScopeNormalizedObservationContext;
  narrative?: SafeScopeNarrative;
  scenarioIntelligence?: ScenarioIntelligence;
  standardFamilyCandidates?: StandardFamilyCandidateRecord[];
  citationLevelCandidates?: CitationLevelCandidateReview[];
  evidenceGapQuestions?: EvidenceGapQuestionRecord[];
  correctiveActionReasoning?: CorrectiveActionReasoning;
  confidenceIntelligence?: any;
  operationalReasoning?: any;
  trendIntelligence?: any;
  energyTransferIntelligence?: any;
  evidenceQuality?: any;
  controlIntelligence?: any;
  barrierIntelligence?: any;
  eventSequence?: any;
  operationalState?: any;
  humanFactors?: any;
  contradictionIntelligence?: any;
  actionEffectiveness?: any;
  counterfactualIntelligence?: any;
  standardsReasoning?: any;
  decisionExplainability?: any;
  hazardGraph?: any;
  exposurePathIntelligence?: any;
  correlationIntelligence?: any;
  siteMemory?: any;
  learningGovernance?: any;
  learningMemory?: any;
  advisoryGuardrails?: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};
