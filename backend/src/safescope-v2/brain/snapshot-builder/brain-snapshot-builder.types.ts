import { SafeScopeBrainSituationalAwarenessPacket } from '../query-orchestrator/brain-query-orchestrator.types';
import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';
import {
  SafeScopeIndustryScope,
  SafeScopeMineScope,
} from '../safescope-brain.types';

export type SafeScopeBrainSnapshotInput = {
  hazardObservation: string;
  siteType?: string;
  taskContext?: string;
  industryContext?: string;
  equipmentInvolved?: string;
  jurisdiction: SafeScopeJurisdiction;
  hazardDomain: SafeScopeReasoningDomain;
  mechanismId?: string;
  primaryCitation?: string;
};

export type SafeScopeBrainSnapshot = {
  engine: 'safescope_brain_snapshot_builder';
  mode: 'read_only_reasoning_context_snapshot';
  generatedAt: string;
  input: SafeScopeBrainSnapshotInput;
  queryContext: {
    jurisdiction: SafeScopeJurisdiction;
    industryScope: SafeScopeIndustryScope;
    mineScope: SafeScopeMineScope;
    hazardDomain: SafeScopeReasoningDomain;
    mechanismId?: string;
    text: string;
  };
  situationalAwarenessPacket: SafeScopeBrainSituationalAwarenessPacket;
  alignment: {
    citationAlignedWithNativeReasoning: boolean;
    mechanismAlignedWithNativeReasoning: boolean;
    nativePrimaryCitation?: string;
    brainLikelyCitation?: string;
    nativeMechanism?: string;
    brainLikelyMechanism?: string;
    notes: string[];
  };
  boundary: {
    readOnly: true;
    canCreateCitation: false;
    canDeclareViolation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
    canModifyProductionReasoning: false;
    requiresQualifiedReview: true;
  };
};
