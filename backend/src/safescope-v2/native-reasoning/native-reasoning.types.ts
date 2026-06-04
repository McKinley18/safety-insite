import { ExpertObservationOutput } from '../types/knowledge-expansion.types';
import { MechanismIntelligenceOutput } from '../mechanism-intelligence/mechanism-intelligence.types';
import { EvidenceSufficiencyOutput } from '../evidence-sufficiency/evidence-sufficiency.types';
import { ExposureIntelligenceOutput } from '../exposure-intelligence/exposure-intelligence.types';
import { SafeScopeActionQualityOutput } from '../action-quality/action-quality.types';
import { SafeScopeCausalChainOutput } from '../causal-chain/causal-chain.types';
import { SafeScopeControlEffectivenessOutput } from '../control-effectiveness/control-effectiveness.types';
import { SafeScopeHazardDomainIntelligenceOutput } from '../hazard-domain-intelligence/hazard-domain-intelligence.types';
import { SafeScopeSafetyHealthDomainMatrixOutput } from '../safety-health-domain-matrix/safety-health-domain-matrix.types';
import { SafeScopeRegulatoryApplicabilityOutput } from '../regulatory-applicability/regulatory-applicability.types';

export type SafeScopeNativeReasoningMode =
  | "offline_capable"
  | "online_enhanced"
  | "validated";

export type SafeScopeNativeReasoningInput = {
  observationText: string;
  classification: string;
  risk?: any;
  suggestedStandards?: any[];
  evidenceTexts?: string[];
  knowledgeBrain?: any;
  aiEvidenceContract?: any;
  intelligence?: any;
};

export type SafeScopeNativeReasoningResult = {
  enabled: true;
  engine: "safescope_native";
  mode: SafeScopeNativeReasoningMode;
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
  actionQuality: SafeScopeActionQualityOutput;
  causalChain: SafeScopeCausalChainOutput;
  hazardDomainIntelligence: SafeScopeHazardDomainIntelligenceOutput;
  safetyHealthDomainMatrix: SafeScopeSafetyHealthDomainMatrixOutput;
  regulatoryApplicability: SafeScopeRegulatoryApplicabilityOutput;
  controlEffectiveness: SafeScopeControlEffectivenessOutput;
  exposureIntelligence: ExposureIntelligenceOutput;
};
