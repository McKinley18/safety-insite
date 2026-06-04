import {
  SafeScopeLearningMemoryInput,
  SafeScopeLearningMemoryQuery,
  SafeScopeLearningMemoryRecord,
  SafeScopeLearningSignalType,
  SafeScopeLearningMemorySummary,
  SafeScopeLearningReviewOutcome,
} from './learning-memory.types';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase().trim();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function inferSignalTypes(input: SafeScopeLearningMemoryInput): SafeScopeLearningSignalType[] {
  const signals: SafeScopeLearningSignalType[] = [];

  if (input.originalCitation && input.correctedCitation && input.originalCitation !== input.correctedCitation) {
    signals.push('citation_correction');
  }

  if (input.originalMechanism && input.correctedMechanism && input.originalMechanism !== input.correctedMechanism) {
    signals.push('mechanism_correction');
  }

  if (input.originalDomain && input.correctedDomain && input.originalDomain !== input.correctedDomain) {
    signals.push('domain_correction');
  }

  if (input.originalScenarioId && input.correctedScenarioId && input.originalScenarioId !== input.correctedScenarioId) {
    signals.push('scenario_correction');
  }

  if ((input.missingEvidence || []).length > 0) {
    signals.push('evidence_gap');
  }

  if (typeof input.confidenceBefore === 'number' && typeof input.confidenceAfter === 'number') {
    signals.push('confidence_adjustment');
  }

  if (input.reviewerRationale) {
    signals.push('reviewer_rationale');
  }

  return uniqueStrings([...(input.signalTypes || []), ...signals]) as SafeScopeLearningSignalType[];
}

function stableMemoryId(input: SafeScopeLearningMemoryInput, index: number): string {
  const base = [
    input.source,
    input.workspaceId,
    input.snapshotId,
    input.findingId,
    input.originalCitation,
    input.correctedCitation,
    input.originalMechanism,
    input.correctedMechanism,
    input.reviewOutcome,
    index,
  ].join('|');

  let hash = 0;
  for (const char of base) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `learning-memory-${hash.toString(16)}`;
}

export class SafeScopeLearningMemoryService {
  private readonly records: SafeScopeLearningMemoryRecord[] = [];

  add(input: SafeScopeLearningMemoryInput): SafeScopeLearningMemoryRecord {
    const record: SafeScopeLearningMemoryRecord = {
      ...input,
      memoryId: stableMemoryId(input, this.records.length),
      createdAt: new Date(0).toISOString(),
      signalTypes: inferSignalTypes(input),
      governance: {
        readOnlyMemory: true,
        canModifyProductionReasoning: false,
        canAutoApproveRegistryChange: false,
        requiresQualifiedReview: true,
        auditTrailRequired: true,
      },
    };

    this.records.push(record);
    return record;
  }

  query(query: SafeScopeLearningMemoryQuery = {}): SafeScopeLearningMemoryRecord[] {
    const limit = query.limit && query.limit > 0 ? query.limit : 25;

    return this.records
      .filter((record) => {
        if (query.jurisdiction && record.jurisdiction !== query.jurisdiction) return false;
        if (query.outcome && record.reviewOutcome !== query.outcome) return false;

        if (query.domain) {
          const domain = normalized(query.domain);
          const domains = [record.originalDomain, record.correctedDomain].map(normalized);
          if (!domains.includes(domain)) return false;
        }

        if (query.citation) {
          const citation = normalized(query.citation);
          const citations = [record.originalCitation, record.correctedCitation].map(normalized);
          if (!citations.includes(citation)) return false;
        }

        if (query.mechanism) {
          const mechanism = normalized(query.mechanism);
          const mechanisms = [record.originalMechanism, record.correctedMechanism].map(normalized);
          if (!mechanisms.includes(mechanism)) return false;
        }

        if (query.scenarioId) {
          const scenarioId = normalized(query.scenarioId);
          const scenarios = [record.originalScenarioId, record.correctedScenarioId].map(normalized);
          if (!scenarios.includes(scenarioId)) return false;
        }

        return true;
      })
      .slice(0, limit);
  }

  summarize(): SafeScopeLearningMemorySummary {
    const outcomeCounts: Record<SafeScopeLearningReviewOutcome, number> = {
      accepted: 0,
      corrected: 0,
      rejected: 0,
      held_for_evidence: 0,
    };

    const signalCounts: Record<SafeScopeLearningSignalType, number> = {
      citation_correction: 0,
      mechanism_correction: 0,
      domain_correction: 0,
      scenario_correction: 0,
      evidence_gap: 0,
      control_quality: 0,
      confidence_adjustment: 0,
      reviewer_rationale: 0,
    };

    const correctionTargets: string[] = [];
    const backlog: string[] = [];

    for (const record of this.records) {
      outcomeCounts[record.reviewOutcome] += 1;

      for (const signal of record.signalTypes) {
        signalCounts[signal] += 1;
      }

      if (record.correctedCitation) {
        correctionTargets.push(`citation:${record.correctedCitation}`);
      }

      if (record.correctedMechanism) {
        correctionTargets.push(`mechanism:${record.correctedMechanism}`);
      }

      if (record.correctedDomain) {
        correctionTargets.push(`domain:${record.correctedDomain}`);
      }

      if (record.correctedScenarioId) {
        correctionTargets.push(`scenario:${record.correctedScenarioId}`);
      }

      if (record.recommendedRegistryUpdate) {
        backlog.push(record.recommendedRegistryUpdate);
      }
    }

    return {
      engine: 'safescope_learning_memory_v1',
      mode: 'read_only_governed_feedback_memory',
      totalRecords: this.records.length,
      outcomeCounts,
      signalCounts,
      topCorrectionTargets: uniqueStrings(correctionTargets).slice(0, 12),
      recommendedImprovementBacklog: uniqueStrings(backlog).slice(0, 12),
      boundary: {
        readOnly: true,
        advisoryOnly: true,
        canModifyProductionReasoning: false,
        canAutoApproveRegistryChange: false,
        requiresQualifiedReview: true,
      },
    };
  }

  list(): SafeScopeLearningMemoryRecord[] {
    return [...this.records];
  }
}
