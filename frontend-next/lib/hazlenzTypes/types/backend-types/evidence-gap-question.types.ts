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
