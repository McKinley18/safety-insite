/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafeScopeIntelligenceResult, SafeScopeNarrative, NarrativeMode } from '../types';
import { getHazLenzSuggestedStandards } from "@/lib/hazlenzStandardHelpers";
import { isDisplayableStandardCandidate } from "@/lib/inspection/standardDisplay";

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

function hasStandardsContent(content: any): boolean {
  if (!content) return false;
  if (typeof content === "string") return content.length > 0;
  if (Array.isArray(content)) return content.length > 0;
  if (typeof content === "object") return Object.keys(content).length > 0;
  return false;
}

function collectStandards(result: any): any {
  if (result?.isVague && (!result.suggestedStandards || result.suggestedStandards.length === 0)) {
    return ["No specific standard selected yet. HazLenz needs more evidence before suggesting a candidate standard."];
  }

  const hazlenzPrimary = getHazLenzSuggestedStandards(result).slice(0, 3);
  let primary: any[] = [];
  let isCandidateMode = false;
  let isFallbackMode = false;

  if (hazlenzPrimary.length) {
    primary = hazlenzPrimary;
  } else if (result?.inspectionIntelligence?.candidateStandards?.some(isDisplayableStandardCandidate)) {
    primary = result.inspectionIntelligence.candidateStandards.filter(isDisplayableStandardCandidate);
    isCandidateMode = true;
  } else if (result?.executiveJudgment?.topStandard) {
    primary = [result.executiveJudgment.topStandard];
    isFallbackMode = true;
  }

  const supporting = result?.supportingStandards || [];

  const formattedPrimary = Array.from(
    new Set(
      primary
        .map(formatStandardDisplay)
        .filter(Boolean)
    )
  ).slice(0, 8) as string[];

  const formattedSupporting = Array.from(
    new Set(
      supporting
        .map(formatStandardDisplay)
        .filter(Boolean)
    )
  ).slice(0, 8) as string[];

  if (formattedPrimary.length === 0 && formattedSupporting.length === 0) {
    return [];
  }

  const res: Record<string, string[]> = {};
  if (formattedPrimary.length > 0) {
    const key = isFallbackMode
      ? "FallbackCandidateStandard"
      : isCandidateMode
        ? "PrimaryCandidateStandards"
        : "PrimarySuggestedCandidateStandards";
    res[key] = formattedPrimary;
  }

  if (formattedSupporting.length > 0) {
    res["SupportingCandidateStandardsReferenceOnly"] = formattedSupporting;
  }

  return res;
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
      content: (result.evidenceGapQuestions?.map((q: any) => q.question) || []) as any,
      isVisible: true
    },
    standards: {
      title: 'Applicable Standards',
      content: collectStandards(result),
      isVisible: hasStandardsContent(collectStandards(result))
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
