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
