import { SafeScopeIntelligenceResult, SafeScopeNarrative, NarrativeMode } from '../types';

export type DisplaySection = {
  title: string;
  content: string | string[] | any;
  isVisible: boolean;
};

export type SafeScopeDisplayAdapter = {
  summary: DisplaySection;
  scenario: DisplaySection;
  evidence: DisplaySection;
  risk: DisplaySection;
  correctiveActions: DisplaySection;
  auditTrace: DisplaySection;
  guardrails: DisplaySection;
  narrative: SafeScopeNarrative | null;
};

export const createDisplayAdapter = (
  result: SafeScopeIntelligenceResult,
  mode: 'simple' | NarrativeMode
): SafeScopeDisplayAdapter => {

  return {
    summary: {
      title: 'Summary',
      content: result.scenarioIntelligence?.confidenceSignals.reasoning || ['No summary available'],
      isVisible: true
    },
    scenario: {
      title: 'Scenario',
      content: result.scenarioIntelligence ? `Scenario: ${result.scenarioIntelligence.scenarioFamilyId}` : 'No scenario identified',
      isVisible: mode !== 'simple'
    },
    evidence: {
      title: 'Evidence Gaps',
      content: result.evidenceGapQuestions?.map((q: any) => q.question) || [],
      isVisible: true
    },
    risk: {
      title: 'Risk Reasoning',
      content: result.riskReasoning ? `Level: ${result.riskReasoning.initialRiskLevel} (Worst case: ${result.riskReasoning.credibleWorstCaseOutcome})` : 'No risk reasoning',
      isVisible: ['professional', 'audit', 'report'].includes(mode)
    },
    correctiveActions: {
      title: 'Corrective Actions',
      content: result.correctiveActionReasoning?.permanentCorrections || [],
      isVisible: ['professional', 'audit', 'report'].includes(mode)
    },
    auditTrace: {
      title: 'Audit Trace',
      content: result.observationContext?.trace || [],
      isVisible: mode === 'audit'
    },
    guardrails: {
      title: 'Governance',
      content: result.advisoryGuardrails || {},
      isVisible: ['simple', 'professional', 'audit'].includes(mode)
    },
    narrative: result.narrative || null
  };
};
