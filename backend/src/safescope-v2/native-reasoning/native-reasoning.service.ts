import {
  SafeScopeNativeReasoningInput,
  SafeScopeNativeReasoningResult,
} from "./native-reasoning.types";
import { SafeScopeExpertObservationService } from './expert-observation.service';
import { SafeScopeMechanismIntelligenceService } from '../mechanism-intelligence/mechanism-intelligence.service';
import { SafeScopeEvidenceSufficiencyService } from '../evidence-sufficiency/evidence-sufficiency.service';
import { ExposureIntelligenceService } from '../exposure-intelligence/exposure-intelligence.service';
import { SafeScopeActionQualityService } from '../action-quality/action-quality.service';
import { SafeScopeCausalChainService } from '../causal-chain/causal-chain.service';
import { SafeScopeControlEffectivenessService } from '../control-effectiveness/control-effectiveness.service';
import { SafeScopeHazardDomainIntelligenceService } from '../hazard-domain-intelligence/hazard-domain-intelligence.service';
import { SafeScopeSafetyHealthDomainMatrixService } from '../safety-health-domain-matrix/safety-health-domain-matrix.service';
import { SafeScopeRegulatoryApplicabilityService } from '../regulatory-applicability/regulatory-applicability.service';

function unique(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    ),
  );
}

export class SafeScopeNativeReasoningService {
  private expertObservationService = new SafeScopeExpertObservationService();
  private mechanismIntelligenceService = new SafeScopeMechanismIntelligenceService();
  private evidenceSufficiencyService = new SafeScopeEvidenceSufficiencyService();
  private exposureIntelligenceService = new ExposureIntelligenceService();
  private actionQualityService = new SafeScopeActionQualityService();
  private causalChainService = new SafeScopeCausalChainService();
  private controlEffectivenessService = new SafeScopeControlEffectivenessService();
  private hazardDomainIntelligenceService = new SafeScopeHazardDomainIntelligenceService();
  private safetyHealthDomainMatrixService = new SafeScopeSafetyHealthDomainMatrixService();
  private regulatoryApplicabilityService = new SafeScopeRegulatoryApplicabilityService();

  evaluate(input: SafeScopeNativeReasoningInput): SafeScopeNativeReasoningResult {
    const mode = String(
      process.env.SAFESCOPE_NATIVE_REASONING_MODE || "offline_capable",
    ) as "offline_capable" | "online_enhanced" | "validated";

    const standards = input.suggestedStandards || [];
    const evidenceTexts = input.evidenceTexts || [];
    const knowledgeMatches = input.knowledgeBrain?.matches || [];
    const missingInputs = input.aiEvidenceContract?.missingInputs || [];
    const reviewTriggers = input.aiEvidenceContract?.reviewTriggers || [];

    const hasStandards = standards.length > 0;
    const hasEvidence = evidenceTexts.length > 0;
    const hasKnowledge = knowledgeMatches.length > 0;
    const isHighRisk =
      input.risk?.riskBand === "High" ||
      input.risk?.riskBand === "Critical" ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    const reasoningSuggestions = unique([
      `${input.classification} was evaluated using SafeScope native classification, risk, evidence, standards, and source-retrieval logic.`,
      hasKnowledge
        ? "Approved SafeScope knowledge sources were available to support the assessment."
        : "No approved SafeScope knowledge source match was available for this assessment.",
      hasStandards
        ? "At least one standards candidate was available for review."
        : "No standards candidate was available; regulatory applicability requires manual review.",
      isHighRisk
        ? "High-consequence indicators require supervisor review before closure."
        : "No automatic high-consequence override was detected from the available risk signals.",
    ]);

    const standardsApplicabilityNotes = unique([
      ...standards.slice(0, 4).map((standard: any) => {
        const citation = standard?.citation || "Unspecified citation";
        const reason =
          standard?.rationale ||
          standard?.summary ||
          standard?.matchingReasons?.[0] ||
          "SafeScope matched this as a candidate standard.";
        return `${citation}: ${reason}`;
      }),
      !hasStandards
        ? "SafeScope cannot make a defensible standards recommendation without a standards candidate or approved source match."
        : "",
    ]);

    const evidenceQuestions = unique([
      !hasEvidence
        ? "Add photos, notes, measurements, or supporting evidence before finalizing."
        : "",
      ...missingInputs.map((item: string) => `Clarify: ${item}`),
      "Confirm worker exposure, task being performed, equipment state, and controls present.",
    ]);

    const correctiveActionNotes = unique([
      isHighRisk
        ? "Prioritize immediate exposure control, supervisor verification, and documented closure evidence."
        : "Corrective actions should address the hazard source, verification method, owner, and due date.",
      hasStandards
        ? "Tie corrective actions to the strongest applicable standard candidate when possible."
        : "Do not cite a standard in the corrective action until applicability is reviewed.",
    ]);

    const unsupportedClaims = unique([
      ...(input.aiEvidenceContract?.unsupportedClaims || []),
      !hasStandards && !hasKnowledge
        ? "No retrieved or curated source supports a final regulatory applicability claim."
        : "",
    ]);

    const reviewRequired =
      Boolean(input.aiEvidenceContract?.canFinalizeWithoutHumanReview === false) ||
      Boolean(unsupportedClaims.length) ||
      Boolean(reviewTriggers.length) ||
      isHighRisk ||
      !hasStandards;
    
    // Wire in expert observations
    const expertObservations = this.expertObservationService.generateExpertObservations({
        classification: input.classification,
        observationText: input.observationText || '',
        suggestedStandards: standards,
        evidenceContract: input.aiEvidenceContract || {},
        nativeReasoning: {},
        learningGovernance: {},
        learningMemory: {},
        knowledgeMatches: knowledgeMatches.map((k: any) => ({
            id: k.chunkId,
            type: k.sourceType || 'regulatory_standard',
            knowledgeType: k.knowledgeType || k.sourceType || 'regulatory_standard',
            title: k.title,
            summary: k.sectionHeading || k.excerpt || '',
            citation: k.citation,
            authorityTier: k.authorityTier || 'unreviewed',
            reviewStatus: 'approved',
            confidence: k.confidence || k.score,
        })),
    });

    const mechanismIntelligence = this.mechanismIntelligenceService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      risk: input.risk,
      suggestedStandards: standards,
      evidenceContract: input.aiEvidenceContract || {},
      expertObservations,
      knowledgeMatches,
    });

    const exposureIntelligence = this.exposureIntelligenceService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
    });

    const evidenceSufficiency = this.evidenceSufficiencyService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      evidenceTexts,
      suggestedStandards: standards,
      aiEvidenceContract: input.aiEvidenceContract || {},
      expertObservations,
      mechanismIntelligence,
      exposureIntelligence,
      risk: input.risk,
    });

    const actionQuality = this.actionQualityService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      correctiveActions: input.intelligence?.generatedActions || input.intelligence?.correctiveActions || [],
      suggestedStandards: standards,
      risk: input.risk,
      mechanismIntelligence,
      evidenceSufficiency,
    });

    const hazardDomainIntelligence = this.hazardDomainIntelligenceService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      evidenceTexts,
      suggestedStandards: standards,
      risk: input.risk,
      mechanismIntelligence,
      exposureIntelligence,
      evidenceSufficiency,
      actionQuality,
    });

    const safetyHealthDomainMatrix = this.safetyHealthDomainMatrixService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      evidenceTexts,
      suggestedStandards: standards,
      risk: input.risk,
      hazardDomainIntelligence,
      mechanismIntelligence,
      exposureIntelligence,
      evidenceSufficiency,
      actionQuality,
    });

    const regulatoryApplicability = this.regulatoryApplicabilityService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      evidenceTexts,
      suggestedStandards: standards,
      risk: input.risk,
      standardsIntent: (input.intelligence as any)?.standardsIntent,
      safetyHealthDomainMatrix,
      hazardDomainIntelligence,
      evidenceSufficiency,
    });

    const causalChain = this.causalChainService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      suggestedStandards: standards,
      risk: input.risk,
      mechanismIntelligence,
      exposureIntelligence,
      evidenceSufficiency,
      actionQuality,
    });

    const controlEffectiveness = this.controlEffectivenessService.evaluate({
      classification: input.classification,
      observationText: input.observationText || '',
      existingControls: input.intelligence?.existingControls || [],
      proposedControls: input.intelligence?.proposedControls || [],
      correctiveActions: input.intelligence?.generatedActions || input.intelligence?.correctiveActions || [],
      risk: input.risk,
      mechanismIntelligence,
      evidenceSufficiency,
      actionQuality,
      causalChain,
    });

    return {
      enabled: true,
      engine: "safescope_native",
      mode,
      onlineEnhanced: mode === "online_enhanced" || mode === "validated",
      summary:
        "SafeScope native reasoning used offline-capable deterministic safety intelligence, local/retrieved knowledge signals, evidence contracts, and human-review guardrails.",
      reasoningSuggestions,
      standardsApplicabilityNotes,
      evidenceQuestions,
      correctiveActionNotes,
      confidenceAdjustment: unsupportedClaims.length ? -0.1 : 0,
      unsupportedClaims,
      reviewRequired,
      guardrails: [
        "SafeScope native reasoning must use only deterministic logic, approved local knowledge, retrieved standards, evidence contracts, and validated workspace learning.",
        "SafeScope must not invent citations or regulatory requirements.",
        "SafeScope must preserve qualified human review for high-risk, low-confidence, conflicting, or under-supported assessments.",
        "Offline mode must remain functional without any external AI provider.",
      ],
      expertObservations,
      mechanismIntelligence,
      exposureIntelligence,
      evidenceSufficiency,
      actionQuality,
      causalChain,
      hazardDomainIntelligence,
      safetyHealthDomainMatrix,
      regulatoryApplicability,
      controlEffectiveness,
    };
  }
}
