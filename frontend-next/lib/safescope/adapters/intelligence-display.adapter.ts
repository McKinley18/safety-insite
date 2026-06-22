import { SafeScopeIntelligenceResult, SafeScopeNarrative, NarrativeMode } from '../types';

function compactValue(value: any): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(compactValue).filter(Boolean).join(" · ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const rendered = compactValue(item);
        return rendered ? `${key.replace(/([A-Z])/g, " $1").trim()}: ${rendered}` : "";
      })
      .filter(Boolean)
      .join(" · ");
  }
  return String(value);
}

function formatStandardDisplay(standard: any): string {
  if (!standard) return "";

  const citation =
    standard.citation ||
    standard.standard ||
    standard.standardNumber ||
    standard.regulation ||
    standard.id ||
    "";

  const title =
    standard.citationTitle ||
    standard.title ||
    standard.name ||
    standard.standardTitle ||
    standard.sectionTitle ||
    "";

  const summary =
    standard.summary ||
    standard.description ||
    standard.plainLanguageSummary ||
    standard.reason ||
    standard.rationale ||
    standard.applicabilityReason ||
    "";

  return [citation, title, summary].map(compactValue).filter(Boolean).join(" — ");
}

function collectStandards(result: any): string[] {
  const sources = [
    ...(result?.suggestedStandards || []),
    ...(result?.inspectionIntelligence?.candidateStandards || []),
    ...(result?.standardsReasoning?.topDefensible || []),
    ...(result?.applicabilityIntelligence?.primaryApplicableStandards || []),
    ...(result?.regulatoryApplicability?.primaryApplicableStandards || []),
  ];

  return Array.from(
    new Set(
      sources
        .map(formatStandardDisplay)
        .filter(Boolean),
    ),
  ).slice(0, 8);
}

export type DisplaySection = {
  title: string;
  content: string | string[] | any;
  isVisible: boolean;
};

export type SafeScopeDisplayAdapter = {
  summary: DisplaySection;
  scenario: DisplaySection;
  evidence: DisplaySection;
  standards: DisplaySection;
  risk: DisplaySection;
  correctiveActions: DisplaySection;
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
    standards: {
      title: 'Applicable Standards',
      content: collectStandards(result),
      isVisible: collectStandards(result).length > 0
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
    guardrails: {
      title: 'Governance',
      content: result.advisoryGuardrails || {},
      isVisible: ['simple', 'professional', 'audit'].includes(mode)
    },
    narrative: result.narrative || null
  };
};
