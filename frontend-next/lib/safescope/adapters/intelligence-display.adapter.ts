import { SafeScopeIntelligenceResult } from '../types';
import { SafeScopeNarrative } from '../types';

export type DisplaySection = {
  title: string;
  content: string | string[] | any;
  isVisible: boolean;
};

export type SafeScopeDisplayAdapter = {
  summary: DisplaySection;
  scenario: DisplaySection;
  evidence: DisplaySection;
  correctiveActions: DisplaySection;
  auditTrace: DisplaySection;
  guardrails: DisplaySection;
  narrative: SafeScopeNarrative | null;
};

export const createDisplayAdapter = (
  result: SafeScopeIntelligenceResult,
  mode: 'simple' | 'professional' | 'audit'
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
      content: result.evidenceGapQuestions?.map(q => q.question) || [],
      isVisible: true
    },
    correctiveActions: {
      title: 'Corrective Actions',
      content: result.correctiveActionReasoning?.permanentCorrections || [],
      isVisible: true
    },
    auditTrace: {
      title: 'Audit Trace',
      content: result.observationContext?.trace || [],
      isVisible: mode === 'audit'
    },
    guardrails: {
      title: 'Governance',
      content: result.advisoryGuardrails || {},
      isVisible: true
    },
    narrative: result.narrative || null
  };
};
