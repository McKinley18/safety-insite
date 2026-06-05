import { SafeScopeNarrative, NarrativeMode, SafeScopeIntelligenceResult } from '../types';

export type ReportSection = {
  header: string;
  body: string | string[];
};

export const mapNarrativeToReportSections = (
  result: SafeScopeIntelligenceResult,
  mode: NarrativeMode
): ReportSection[] => {
  if (!result.narrative) return [];

  const narrative = result.narrative;
  const sections: ReportSection[] = [];
//...

  sections.push({ header: narrative.findingTitle, body: narrative.findingSummary });
  sections.push({ header: 'Scenario Reasoning', body: narrative.scenarioExplanation });
  
  if (result.riskReasoning && mode !== 'concise') {
    sections.push({ 
        header: 'Risk Assessment', 
        body: `Risk Level: ${result.riskReasoning.initialRiskLevel.toUpperCase()}. Worst Case: ${result.riskReasoning.credibleWorstCaseOutcome.replace(/_/g, ' ')}.` 
    });
  }

  if (mode !== 'concise') {
    sections.push({ header: 'Recommended Corrective Actions', body: [narrative.immediateActionNarrative, narrative.permanentCorrectionNarrative] });
  }

  if (mode === 'audit') {
    sections.push({ header: 'Audit Appendix', body: narrative.auditAppendixNarrative });
  }

  sections.push({ header: 'Qualified Review Disclaimer', body: narrative.qualifiedReviewDisclaimer });

  return sections;
};
