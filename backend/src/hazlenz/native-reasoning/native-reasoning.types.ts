import { ExpertObservationOutput } from '../types/knowledge-expansion.types';
import { MechanismIntelligenceOutput } from '../mechanism-intelligence/mechanism-intelligence.types';
import { EvidenceSufficiencyOutput } from '../evidence-sufficiency/evidence-sufficiency.types';
import { ExposureIntelligenceOutput } from '../exposure-intelligence/exposure-intelligence.types';
import { HazLenzActionQualityOutput } from '../action-quality/action-quality.types';
import { HazLenzCausalChainOutput } from '../causal-chain/causal-chain.types';
import { HazLenzControlEffectivenessOutput } from '../control-effectiveness/control-effectiveness.types';
import { HazLenzHazardDomainIntelligenceOutput } from '../hazard-domain-intelligence/hazard-domain-intelligence.types';
import { HazLenzSafetyHealthDomainMatrixOutput } from '../safety-health-domain-matrix/safety-health-domain-matrix.types';
import { HazLenzRegulatoryApplicabilityOutput } from '../regulatory-applicability/regulatory-applicability.types';

export type HazLenzNativeReasoningMode =
  | "offline_capable"
  | "online_enhanced"
  | "validated";

export type HazLenzNativeReasoningInput = {
  observationText: string;
  classification: string;
  risk?: any;
  suggestedStandards?: any[];
  evidenceTexts?: string[];
  knowledgeBrain?: any;
  aiEvidenceContract?: any;
  intelligence?: any;
};

export type HazLenzNativeReasoningResult = {
  enabled: true;
  engine: "safescope_native";
  mode: HazLenzNativeReasoningMode;
  onlineEnhanced: boolean;
  summary: string;
  reasoningSuggestions: string[];
  standardsApplicabilityNotes: string[];
  evidenceQuestions: string[];
  correctiveActionNotes: string[];
  confidenceAdjustment: number;
  unsupportedClaims: string[];
  reviewRequired: boolean;
  guardrails: string[];
  expertObservations: ExpertObservationOutput;
  mechanismIntelligence: MechanismIntelligenceOutput;
  evidenceSufficiency: EvidenceSufficiencyOutput;
  actionQuality: HazLenzActionQualityOutput;
  causalChain: HazLenzCausalChainOutput;
  hazardDomainIntelligence: HazLenzHazardDomainIntelligenceOutput;
  safetyHealthDomainMatrix: HazLenzSafetyHealthDomainMatrixOutput;
  regulatoryApplicability: HazLenzRegulatoryApplicabilityOutput;
  controlEffectiveness: HazLenzControlEffectivenessOutput;
  exposureIntelligence: ExposureIntelligenceOutput;
};
