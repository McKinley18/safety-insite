import { ApprovedKnowledgeBridgeService } from '../bridge/approved-knowledge-bridge.service';
import {
  ApprovedKnowledgeIntegrationContext,
  ApprovedKnowledgeIntegrationRequest,
} from './approved-knowledge-integration.types';

export class ApprovedKnowledgeIntegrationAdapterService {
  constructor(private readonly bridgeService = new ApprovedKnowledgeBridgeService()) {}

  getContextForReasoning(request: ApprovedKnowledgeIntegrationRequest): ApprovedKnowledgeIntegrationContext {
    const enabled = request.enabled === true;

    if (!enabled) {
      return {
        engine: 'safescope_approved_knowledge_integration_adapter',
        mode: 'disabled_by_default_context_adapter',
        enabled: false,
        reasoningEngine: request.reasoningEngine || 'unspecified',
        classification: request.classification,
        jurisdictionHint: request.jurisdictionHint,
        approvedRecordCountAvailable: 0,
        references: [],
        recordsUsed: [],
        adapterUseBoundary: {
          readOnly: true,
          disabledByDefault: true,
          canProvideContext: false,
          canModifyNativeReasoning: false,
          canCreateCitations: false,
          canDeclareViolations: false,
          canOverrideRegulations: false,
          canBypassHumanReview: false,
          canUseUnapprovedRecords: false,
        },
        integrationNotes: [
          'Approved knowledge integration adapter is disabled by default.',
          'No approved knowledge context was requested from the bridge.',
          'SafeScope native reasoning behavior is unchanged.',
        ],
      };
    }

    const bridgeResult = this.bridgeService.getApprovedKnowledgeContext({
      enabled: true,
      classification: request.classification,
      hazardObservation: request.hazardObservation,
      limit: request.limit || 5,
    });

    return {
      engine: 'safescope_approved_knowledge_integration_adapter',
      mode: 'disabled_by_default_context_adapter',
      enabled: true,
      reasoningEngine: request.reasoningEngine || 'unspecified',
      classification: request.classification,
      jurisdictionHint: request.jurisdictionHint,
      approvedRecordCountAvailable: bridgeResult.approvedRecordCountAvailable,
      references: bridgeResult.references,
      recordsUsed: bridgeResult.recordsUsed,
      adapterUseBoundary: {
        readOnly: true,
        disabledByDefault: true,
        canProvideContext: true,
        canModifyNativeReasoning: false,
        canCreateCitations: false,
        canDeclareViolations: false,
        canOverrideRegulations: false,
        canBypassHumanReview: false,
        canUseUnapprovedRecords: false,
      },
      integrationNotes: [
        'Approved knowledge integration adapter may provide read-only context only when explicitly enabled.',
        'Adapter output cannot modify native reasoning, create citations, declare violations, override regulations, or bypass qualified human review.',
        'Adapter only exposes records returned by the approved knowledge bridge.',
      ],
    };
  }
}
