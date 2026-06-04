import { KnowledgeRecord } from '../knowledge-intake.types';
import { ApprovedKnowledgeBridgeReference } from '../bridge/approved-knowledge-bridge.types';

export type ApprovedKnowledgeIntegrationRequest = {
  enabled?: boolean;
  reasoningEngine?: 'safescope_native' | 'test_harness';
  classification?: string;
  hazardObservation?: string;
  jurisdictionHint?: string;
  limit?: number;
};

export type ApprovedKnowledgeIntegrationContext = {
  engine: 'safescope_approved_knowledge_integration_adapter';
  mode: 'disabled_by_default_context_adapter';
  enabled: boolean;
  reasoningEngine: 'safescope_native' | 'test_harness' | 'unspecified';
  classification?: string;
  jurisdictionHint?: string;
  approvedRecordCountAvailable: number;
  references: ApprovedKnowledgeBridgeReference[];
  recordsUsed: KnowledgeRecord[];
  adapterUseBoundary: {
    readOnly: true;
    disabledByDefault: true;
    canProvideContext: boolean;
    canModifyNativeReasoning: false;
    canCreateCitations: false;
    canDeclareViolations: false;
    canOverrideRegulations: false;
    canBypassHumanReview: false;
    canUseUnapprovedRecords: false;
  };
  integrationNotes: string[];
};
