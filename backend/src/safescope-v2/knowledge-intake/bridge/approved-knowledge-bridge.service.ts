import { KnowledgeRecord } from '../knowledge-intake.types';
import { ApprovedKnowledgeQueryService } from '../query/approved-knowledge-query.service';
import {
  ApprovedKnowledgeBridgeInput,
  ApprovedKnowledgeBridgeReference,
  ApprovedKnowledgeBridgeResult,
} from './approved-knowledge-bridge.types';

function compactText(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ').trim();
}

export class ApprovedKnowledgeBridgeService {
  constructor(private readonly queryService = new ApprovedKnowledgeQueryService()) {}

  getApprovedKnowledgeContext(input: ApprovedKnowledgeBridgeInput): ApprovedKnowledgeBridgeResult {
    const enabled = input.enabled === true;

    if (!enabled) {
      return this.disabledResult(input, 0);
    }

    const queryText =
      input.query?.text ||
      input.hazardObservation ||
      input.classification ||
      '';

    const query = this.queryService.query({
      ...input.query,
      text: queryText,
      limit: input.limit || input.query?.limit || 5,
    });

    const references = query.matches.map((match): ApprovedKnowledgeBridgeReference => ({
      recordId: match.record.recordId,
      citation: match.record.citation,
      title: match.record.title,
      sourceAuthority: match.record.sourceAuthority,
      sourceUrl: match.record.sourceUrl,
      sourceBoundary: match.record.sourceBoundary,
      standardIntent: match.record.standardIntent,
      evidenceNeeded: match.record.evidenceNeeded,
      applicabilityTriggers: match.record.applicabilityTriggers,
      score: match.score,
      matchedFields: match.matchedFields,
    }));

    return {
      engine: 'safescope_approved_knowledge_bridge',
      mode: 'disabled_by_default_read_only',
      enabled: true,
      classification: input.classification,
      approvedRecordCountAvailable: query.totalApprovedRecordsAvailable,
      references,
      recordsUsed: query.matches.map((match) => match.record),
      reasoningUseBoundary: {
        canSupplementReasoning: true,
        canCreateCitations: false,
        canDeclareViolations: false,
        canOverrideRegulations: false,
        canBypassHumanReview: false,
        canUseUnapprovedRecords: false,
        productionReasoningModified: false,
      },
      bridgeNotes: [
        'Approved knowledge bridge is read-only.',
        'Only human-reviewed approved records may be returned.',
        'Bridge output may supplement future reasoning context but cannot create citations, declare violations, override regulations, or bypass qualified review.',
        'This service is not wired into production SafeScope reasoning by default.',
      ],
    };
  }

  private disabledResult(input: ApprovedKnowledgeBridgeInput, approvedRecordCountAvailable: number): ApprovedKnowledgeBridgeResult {
    return {
      engine: 'safescope_approved_knowledge_bridge',
      mode: 'disabled_by_default_read_only',
      enabled: false,
      classification: input.classification,
      approvedRecordCountAvailable,
      references: [],
      recordsUsed: [],
      reasoningUseBoundary: {
        canSupplementReasoning: false,
        canCreateCitations: false,
        canDeclareViolations: false,
        canOverrideRegulations: false,
        canBypassHumanReview: false,
        canUseUnapprovedRecords: false,
        productionReasoningModified: false,
      },
      bridgeNotes: [
        'Approved knowledge bridge is disabled by default.',
        'No approved records were queried or supplied to reasoning.',
        'Production SafeScope reasoning behavior is unchanged.',
      ],
    };
  }
}
