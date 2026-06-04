import {
  SafeScopeImprovementCandidate,
  SafeScopeImprovementCandidateInput,
  SafeScopeImprovementCandidateResult,
  SafeScopeImprovementCandidateType,
  SafeScopeImprovementCandidateUrgency,
} from './improvement-candidate-engine.types';
import {
  SafeScopeLearningMemoryRecord,
  SafeScopeLearningSignalType,
} from '../learning-memory/learning-memory.types';

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function stableCandidateId(type: string, targetKey: string): string {
  const base = `${type}|${targetKey}`;
  let hash = 0;

  for (const char of base) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `improvement-candidate-${hash.toString(16)}`;
}

function urgencyFor(supportCount: number, signals: SafeScopeLearningSignalType[]): SafeScopeImprovementCandidateUrgency {
  if (signals.includes('evidence_gap') && supportCount >= 2) return 'critical';
  if (signals.includes('citation_correction') && supportCount >= 2) return 'high';
  if (signals.includes('scenario_correction') && supportCount >= 1) return 'high';
  if (signals.includes('mechanism_correction') && supportCount >= 2) return 'high';
  if (supportCount >= 2) return 'medium';
  return 'low';
}

function candidateTypeForSignal(signal: SafeScopeLearningSignalType): SafeScopeImprovementCandidateType | undefined {
  if (signal === 'citation_correction') return 'citation_registry_candidate';
  if (signal === 'mechanism_correction') return 'mechanism_registry_candidate';
  if (signal === 'domain_correction') return 'domain_mapping_candidate';
  if (signal === 'scenario_correction') return 'scenario_disambiguation_candidate';
  if (signal === 'evidence_gap') return 'evidence_gate_candidate';
  if (signal === 'control_quality') return 'control_quality_candidate';
  if (signal === 'confidence_adjustment') return 'confidence_scoring_candidate';
  return undefined;
}

function targetKeyFor(record: SafeScopeLearningMemoryRecord, signal: SafeScopeLearningSignalType): string | undefined {
  if (signal === 'citation_correction') return record.correctedCitation ? `citation:${record.correctedCitation}` : undefined;
  if (signal === 'mechanism_correction') return record.correctedMechanism ? `mechanism:${record.correctedMechanism}` : undefined;
  if (signal === 'domain_correction') return record.correctedDomain ? `domain:${record.correctedDomain}` : undefined;
  if (signal === 'scenario_correction') return record.correctedScenarioId ? `scenario:${record.correctedScenarioId}` : undefined;
  if (signal === 'evidence_gap') return record.recommendedRegistryUpdate ? `evidence-gate:${record.recommendedRegistryUpdate}` : record.missingEvidence?.[0] ? `evidence-gate:${record.missingEvidence[0]}` : undefined;
  if (signal === 'control_quality') return record.recommendedRegistryUpdate ? `control-quality:${record.recommendedRegistryUpdate}` : undefined;
  if (signal === 'confidence_adjustment') return record.correctedCitation ? `confidence:${record.correctedCitation}` : record.correctedMechanism ? `confidence:${record.correctedMechanism}` : undefined;
  return undefined;
}

function buildTitle(type: SafeScopeImprovementCandidateType, targetKey: string): string {
  if (type === 'citation_registry_candidate') return `Review repeated citation correction for ${targetKey.replace('citation:', '')}`;
  if (type === 'mechanism_registry_candidate') return `Review repeated mechanism correction for ${targetKey.replace('mechanism:', '')}`;
  if (type === 'domain_mapping_candidate') return `Review domain mapping correction for ${targetKey.replace('domain:', '')}`;
  if (type === 'scenario_disambiguation_candidate') return `Review scenario disambiguation correction for ${targetKey.replace('scenario:', '')}`;
  if (type === 'evidence_gate_candidate') return 'Review proposed evidence gate from held or corrected findings';
  if (type === 'control_quality_candidate') return 'Review corrective-control quality improvement candidate';
  return 'Review decision confidence scoring candidate';
}

export class SafeScopeImprovementCandidateEngineService {
  generate(input: SafeScopeImprovementCandidateInput): SafeScopeImprovementCandidateResult {
    const minimumSupportCount = input.minimumSupportCount && input.minimumSupportCount > 0
      ? input.minimumSupportCount
      : 1;

    const limit = input.limit && input.limit > 0 ? input.limit : 25;
    const grouped = new Map<string, SafeScopeLearningMemoryRecord[]>();

    for (const memory of input.memories) {
      for (const signal of memory.signalTypes) {
        const type = candidateTypeForSignal(signal);
        const targetKey = targetKeyFor(memory, signal);

        if (!type || !targetKey) continue;

        const groupKey = `${type}|${targetKey}`;
        grouped.set(groupKey, [...(grouped.get(groupKey) || []), memory]);
      }
    }

    const candidates: SafeScopeImprovementCandidate[] = [];

    for (const [groupKey, memories] of grouped.entries()) {
      if (memories.length < minimumSupportCount) continue;

      const [typeRaw, targetKey] = groupKey.split('|');
      const type = typeRaw as SafeScopeImprovementCandidateType;
      const signalTypes = uniqueStrings(memories.flatMap((memory) => memory.signalTypes)) as SafeScopeLearningSignalType[];
      const urgency = urgencyFor(memories.length, signalTypes);
      const first = memories[0];

      candidates.push({
        candidateId: stableCandidateId(type, targetKey),
        type,
        title: buildTitle(type, targetKey),
        targetKey,
        jurisdiction: first.jurisdiction,
        domain: first.correctedDomain || first.originalDomain,
        citation: first.correctedCitation || first.originalCitation,
        mechanism: first.correctedMechanism || first.originalMechanism,
        scenarioId: first.correctedScenarioId || first.originalScenarioId,
        supportingMemoryIds: memories.map((memory) => memory.memoryId),
        supportCount: memories.length,
        signalTypes,
        urgency,
        status: urgency === 'critical' || urgency === 'high'
          ? 'ready_for_backlog'
          : 'needs_qualified_review',
        rationale: `Generated from ${memories.length} governed Learning Memory record(s). This is a candidate only and cannot modify production reasoning.`,
        recommendedAction: first.recommendedRegistryUpdate || 'Review supporting memories and decide whether a governed registry, evidence gate, or scoring update is warranted.',
        governance: {
          readOnlyCandidate: true,
          canModifyProductionReasoning: false,
          canAutoApply: false,
          canAutoApproveRegistryChange: false,
          requiresQualifiedReview: true,
          auditTrailRequired: true,
        },
      });
    }

    const sortedCandidates = candidates
      .sort((a, b) => {
        const urgencyRank = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyRank[b.urgency] - urgencyRank[a.urgency] || b.supportCount - a.supportCount;
      })
      .slice(0, limit);

    return {
      engine: 'safescope_improvement_candidate_engine_v1',
      mode: 'read_only_governed_improvement_candidates',
      input: {
        memoryCount: input.memories.length,
        minimumSupportCount,
        limit,
      },
      candidates: sortedCandidates,
      summary: {
        totalCandidates: sortedCandidates.length,
        criticalCandidates: sortedCandidates.filter((candidate) => candidate.urgency === 'critical').length,
        highCandidates: sortedCandidates.filter((candidate) => candidate.urgency === 'high').length,
        mediumCandidates: sortedCandidates.filter((candidate) => candidate.urgency === 'medium').length,
        lowCandidates: sortedCandidates.filter((candidate) => candidate.urgency === 'low').length,
        topTargets: sortedCandidates.map((candidate) => candidate.targetKey).slice(0, 10),
      },
      boundary: {
        readOnly: true,
        advisoryOnly: true,
        canModifyProductionReasoning: false,
        canAutoApply: false,
        canAutoApproveRegistryChange: false,
        requiresQualifiedReview: true,
      },
    };
  }
}
