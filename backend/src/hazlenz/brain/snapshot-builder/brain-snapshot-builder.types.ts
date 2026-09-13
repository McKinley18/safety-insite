import { HazLenzBrainSituationalAwarenessPacket } from '../query-orchestrator/brain-query-orchestrator.types';
import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';
import {
  HazLenzIndustryScope,
  HazLenzMineScope,
} from '../hazlenz-brain.types';

export type HazLenzBrainSnapshotInput = {
  hazardObservation: string;
  siteType?: string;
  taskContext?: string;
  industryContext?: string;
  equipmentInvolved?: string;
  jurisdiction: HazLenzJurisdiction;
  hazardDomain: HazLenzReasoningDomain;
  mechanismId?: string;
  primaryCitation?: string;
};

export type HazLenzBrainSnapshot = {
  engine: 'safescope_brain_snapshot_builder';
  mode: 'read_only_reasoning_context_snapshot';
  generatedAt: string;
  input: HazLenzBrainSnapshotInput;
  queryContext: {
    jurisdiction: HazLenzJurisdiction;
    industryScope: HazLenzIndustryScope;
    mineScope: HazLenzMineScope;
    hazardDomain: HazLenzReasoningDomain;
    mechanismId?: string;
    text: string;
  };
  situationalAwarenessPacket: HazLenzBrainSituationalAwarenessPacket;
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
