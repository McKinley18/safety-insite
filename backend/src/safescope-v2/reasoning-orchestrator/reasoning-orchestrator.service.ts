import { SAFESCOPE_TAXONOMY_REGISTRY } from '../taxonomy/safescope-taxonomy.registry';
import { STANDARDS_APPLICABILITY_REGISTRY } from '../standards/standards-applicability.registry';
import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../corrective-actions/corrective-action-template.registry';
import { ApprovedKnowledgeIntegrationAdapterService } from '../knowledge-intake/integration/approved-knowledge-integration-adapter.service';
import { SafeScopeApplicabilityAnalysisService } from './applicability/applicability-analysis.service';
import { SafeScopeCorrectiveActionReasoningService } from './corrective-actions/corrective-action-reasoning.service';
import { SafeScopeEquipmentTaskMechanismDetectorService } from '../equipment-knowledge/equipment-task-mechanism-detector.service';
import { SafeScopeEquipmentArchetypeDetectorService } from '../equipment-knowledge/equipment-archetype-detector.service';
import { SafeScopeMechanismPrecedenceResolverService } from '../mechanism-intelligence/mechanism-precedence-resolver.service';
import { SafeScopeBrainSnapshotBuilderService } from '../brain/snapshot-builder/brain-snapshot-builder.service';
import { SafeScopeTaskContext } from '../equipment-knowledge/equipment-task-mechanism.types';
import { hasAnyNonNegatedTerm } from './negation-context.util';
import { SafeScopeSafetyCalculationsService } from '../safety-calculations/safety-calculations.service';
import { ContradictionIntelligenceService } from '../contradiction-intelligence/contradiction-intelligence.service';
import { SitePolicyIsolationService } from '../site-policy-isolation/site-policy-isolation.service';
import { SitePolicyGovernanceService } from '../site-policy-isolation/site-policy-governance.service';
import { ReviewCoreKnowledgeRetrievalService } from '../knowledge-architecture/reviewcore-knowledge-retrieval.service';
import {
  SafeScopeApplicabilitySignal,
  SafeScopeJurisdiction,
  SafeScopeReasoningConfidence,
  SafeScopeReasoningDomain,
  SafeScopeReasoningEvidenceGap,
  SafeScopeReasoningRequest,
  SafeScopeReasoningResult,
  SafeScopeEquipmentReasoningSummary,
} from './reasoning-orchestrator.types';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  return hasAnyNonNegatedTerm(text, terms);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export class SafeScopeReasoningOrchestratorService {
  constructor(
    private readonly integrationAdapter = new ApprovedKnowledgeIntegrationAdapterService(),
    private readonly applicabilityAnalysisService = new SafeScopeApplicabilityAnalysisService(),
    private readonly correctiveActionReasoningService = new SafeScopeCorrectiveActionReasoningService(),
    private readonly equipmentTaskMechanismDetectorService = new SafeScopeEquipmentTaskMechanismDetectorService(),
    private readonly equipmentArchetypeDetectorService = new SafeScopeEquipmentArchetypeDetectorService(),
    private readonly mechanismPrecedenceResolverService = new SafeScopeMechanismPrecedenceResolverService(),
    private readonly brainSnapshotBuilderService = new SafeScopeBrainSnapshotBuilderService(),
    private readonly safetyCalculationsService = new SafeScopeSafetyCalculationsService(),
    private readonly contradictionIntelligenceService = new ContradictionIntelligenceService(),
    private readonly sitePolicyIsolationService = new SitePolicyIsolationService(new SitePolicyGovernanceService()),
    private readonly knowledgeRetrievalService = new ReviewCoreKnowledgeRetrievalService(),
  ) {}

  reason(request: SafeScopeReasoningRequest): SafeScopeReasoningResult {
    const combined = normalized([
      request.hazardObservation,
      request.siteType,
      request.taskContext,
      request.industryContext,
      request.equipmentInvolved,
    ].join(' '));

    const jurisdictionAssessment = this.assessJurisdiction(combined);
    const hazardClassification = this.classifyHazard(combined);
    const missingEvidence = this.identifyMissingEvidence(request, hazardClassification.primaryDomain);
    const applicabilitySignals = this.buildApplicabilitySignals(combined, request, hazardClassification.primaryDomain);

    const approvedKnowledgeContext = this.integrationAdapter.getContextForReasoning({
      enabled: request.enableApprovedKnowledgeContext === true,
      reasoningEngine: 'safescope_native',
      classification: hazardClassification.primaryDomain,
      hazardObservation: request.hazardObservation,
      jurisdictionHint: jurisdictionAssessment.likelyJurisdiction,
      limit: 5,
    });

    const applicabilityAnalysis = this.applicabilityAnalysisService.analyze({
      hazardObservation: request.hazardObservation,
      jurisdiction: jurisdictionAssessment.likelyJurisdiction,
      hazardDomain: hazardClassification.primaryDomain,
      approvedRecords: approvedKnowledgeContext.recordsUsed,
      missingEvidence,
    });

    const correctiveActionReasoning = this.correctiveActionReasoningService.reason({
      hazardObservation: request.hazardObservation,
      jurisdiction: jurisdictionAssessment.likelyJurisdiction,
      hazardDomain: hazardClassification.primaryDomain,
      employeeExposureKnown: request.employeeExposureKnown,
      equipmentInvolved: request.equipmentInvolved,
      applicabilityAnalysis,
      missingEvidence,
    });

    const normalizedTaskContext = this.normalizeTaskContext(request.taskContext);
    const equipmentContextDescription = [
      request.hazardObservation,
      request.equipmentInvolved || '',
      request.taskContext || '',
      request.industryContext || '',
      request.siteType || '',
    ].join(' ');

    const equipmentTaskMechanismContext = this.equipmentTaskMechanismDetectorService.detect({
      description: equipmentContextDescription,
      taskContext: normalizedTaskContext,
    });

    const equipmentArchetypeContext = this.equipmentArchetypeDetectorService.detect({
      description: equipmentContextDescription,
      taskContext: normalizedTaskContext,
    });

    let equipmentReasoningSummary = this.buildEquipmentReasoningSummary(
      equipmentTaskMechanismContext,
      equipmentArchetypeContext,
      '',
    );

    const contradictionIntelligence = this.contradictionIntelligenceService.evaluate({
      text: combined,
    });

    const companyPolicies = request.workspaceId ? this.sitePolicyIsolationService.resolvePolicies(
      { workspaceId: request.workspaceId, siteId: request.siteId },
      { 
        hazardFamilies: [hazardClassification.primaryDomain], 
        taskContexts: [normalizedTaskContext || ''], 
        equipmentTypes: [request.equipmentInvolved || ''] 
      }
    ) : [];

    const confidence = this.calculateConfidence(
      jurisdictionAssessment.likelyJurisdiction,
      hazardClassification.primaryDomain,
      missingEvidence,
      applicabilitySignals,
      contradictionIntelligence,
    );

    if (this.isCraneRiggingContext(combined)) {
      hazardClassification.primaryDomain = 'cranes_rigging_hoisting';
    }

    const eyeFacePpeOverride = this.resolveEyeFacePpeOverride(combined);
    if (eyeFacePpeOverride) {
      hazardClassification.primaryDomain = 'ppe';
    }

    const craneRiggingCitationOverride = this.resolveCraneRiggingCitation(combined);

    let primaryCitation = this.resolvePrimaryCitation(
      jurisdictionAssessment.likelyJurisdiction,
      hazardClassification.primaryDomain,
      combined,
    );

    if (craneRiggingCitationOverride) {
      primaryCitation = craneRiggingCitationOverride;
    }

    const highPriorityPhysicalHazardOverride = this.resolveHighPriorityPhysicalHazardOverride(combined);
    if (highPriorityPhysicalHazardOverride.domain) {
      hazardClassification.primaryDomain = highPriorityPhysicalHazardOverride.domain;
    }
    if (highPriorityPhysicalHazardOverride.citation) {
      primaryCitation = highPriorityPhysicalHazardOverride.citation;
    }
    if (highPriorityPhysicalHazardOverride.mechanismId) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: highPriorityPhysicalHazardOverride.mechanismId,
        matchedSignals: [
          ...(equipmentTaskMechanismContext.primaryMatch?.matchedSignals || []),
          ...highPriorityPhysicalHazardOverride.reasonCodes,
        ],
      } as any;
    }

    const craneRiggingMechanismOverride = this.resolveCraneRiggingMechanism(combined);
    if (craneRiggingMechanismOverride) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: craneRiggingMechanismOverride,
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'cranes_rigging_hoisting' &&
      includesAny(normalized(combined), ['damaged sling', 'rigging defect', 'overloaded sling', 'wire rope', 'shackle', 'hook', 'pre-use inspection'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'rigging_failure',
      } as any;
    }


    if (
      hazardClassification.primaryDomain === 'health_respiratory' &&
      includesAny(normalized(combined), ['silica', 'silica dust', 'respirable crystalline silica', 'concrete dust', 'dry cutting'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'silica_inhalation',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'hazardous_materials' &&
      includesAny(normalized(combined), ['chemical', 'unlabeled container', 'secondary container', 'hazcom', 'sds'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'chemical_exposure',
      } as any;
    }

    if (
      (hazardClassification.primaryDomain === 'health_exposure' || hazardClassification.primaryDomain === 'bloodborne_pathogens') &&
      includesAny(normalized(combined), [
        'bloodborne',
        'blood borne',
        'blood',
        'bodily fluid',
        'bodily fluids',
        'opim',
        'sharp',
        'sharps',
        'needle',
        'used needle',
        'needlestick',
        'needle stick',
        'biohazard',
        'exposure control plan',
        'sharps container',
        'contaminated first aid',
        'cleanup kit',
      ])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'bloodborne_pathogen_exposure',
        matchedSignals: [
          ...(equipmentTaskMechanismContext.primaryMatch?.matchedSignals || []),
          'bloodborne/sharps exposure signal',
        ],
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'confined_space' &&
      includesAny(normalized(combined), ['confined space', 'entry controls', 'atmospheric hazard', 'oxygen deficiency', 'asphyxiation'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'asphyxiation',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'electrical' &&
      includesAny(normalized(combined), ['damaged electrical cable', 'damaged conductor', 'exposed conductor', 'arc flash', 'shock'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'shock_arc_flash',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'machine_guarding' &&
      includesAny(normalized(combined), ['point of operation', 'pinch point', 'unguarded point of operation'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'pinch_point',
      } as any;
    }


    if (
      hazardClassification.primaryDomain === 'machine_guarding' &&
      this.isPoweredDoorCrushPointContext(combined)
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        equipmentId: 'powered_overhead_door',
        equipmentLabel: 'Powered Overhead Door',
        componentId: 'door_closing_zone',
        componentLabel: 'Door Closing / Crush Zone',
        failureModeId: 'powered_overhead_door_crush_point',
        failureModeLabel: 'powered_door_crush_point',
        failureModeDescription:
          'A powered overhead, dock, roll-up, or bay door creates a crush or pinch exposure where pedestrian travel, presence sensors, warning devices, manual release, or operating state are not confirmed.',
        matchedSignals: [
          ...(equipmentTaskMechanismContext.primaryMatch?.matchedSignals || []),
          'p1c-powered-door-fixed-equipment-precedence',
        ],
        likelyHazardDomains: ['machine_guarding'],
        harmMechanisms: ['crushed_by', 'caught_in_or_between', 'pinch_point'],
        evidenceQuestions: [
          'Do employees pass under or near the powered door during operation?',
          'Are photo-eyes, presence sensors, reversing edges, warning devices, and manual release verified functional?',
          'What is the door operating state, closing speed, pedestrian path, and access control?',
          'Was the condition observed during normal use, inspection, maintenance, or troubleshooting?',
        ],
      } as any;

      equipmentReasoningSummary = this.buildEquipmentReasoningSummary(
        equipmentTaskMechanismContext,
        equipmentArchetypeContext,
        combined,
      );
    }

    if (
      hazardClassification.primaryDomain === 'roof_rib_control' &&
      includesAny(normalized(combined), ['rib', 'loose rib', 'rib fall', 'rib control', 'coal rib'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'rib_fall',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'ventilation' &&
      includesAny(normalized(combined), ['ventilation', 'curtain', 'airflow', 'air flow', 'methane', 'gas buildup'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'methane_gas_buildup',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'emergency_preparedness' &&
      includesAny(normalized(combined), ['escapeway', 'escape way', 'egress', 'obstruction', 'blocked', 'lifeline'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'egress_blockage',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'ppe' &&
      this.resolveEyeFacePpeOverride(combined)
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'eye_face_ppe_gap',
        matchedSignals: [
          ...(equipmentTaskMechanismContext.primaryMatch?.matchedSignals || []),
          'high-priority-eye-face-ppe-gap',
        ],
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'machine_guarding_loto' &&
      includesAny(normalized(combined), [
        'lockout',
        'tagout',
        'loto',
        'hazardous energy',
        'unexpected startup',
        'unexpected start up',
        'stored energy',
        'maintenance',
        'servicing',
        'crusher',
        'guard removed',
      ])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'unexpected_startup',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'mobile_equipment' &&
      includesAny(normalized(combined), ['forklift', 'powered industrial truck', 'pedestrian', 'pedestrians'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'pedestrian_strike',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'industrial_hygiene' &&
      includesAny(normalized(combined), ['industrial hygiene', 'contaminant', 'vapors', 'gas', 'air quality', 'vocs', 'shop welding'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'chemical_vapors_inhalation',
      } as any;
    }

    if (
      hazardClassification.primaryDomain === 'ergonomics' &&
      includesAny(normalized(combined), ['ergonomics', 'lifting', 'musculoskeletal', 'manual lifting', 'strain', 'repetitive'])
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        ...(equipmentTaskMechanismContext.primaryMatch || {}),
        failureModeLabel: 'lifting_musculoskeletal_strain',
      } as any;
    }

    const mechanismPrecedence = this.mechanismPrecedenceResolverService.resolve({
      normalizedText: combined,
      jurisdiction: jurisdictionAssessment.likelyJurisdiction,
      hazardDomain: hazardClassification.primaryDomain,
      currentMechanismId: equipmentTaskMechanismContext.primaryMatch?.failureModeLabel,
      currentPrimaryCitation: primaryCitation,
      siteType: request.siteType,
      industryContext: request.industryContext,
      taskContext: request.taskContext,
      equipmentInvolved: request.equipmentInvolved,
    });

    if (
      mechanismPrecedence.primaryCitationOverride &&
      mechanismPrecedence.primaryCitationOverride !== primaryCitation
    ) {
      primaryCitation = mechanismPrecedence.primaryCitationOverride;
    }

    if (
      mechanismPrecedence.mechanismId &&
      mechanismPrecedence.mechanismId !== equipmentTaskMechanismContext.primaryMatch?.failureModeLabel
    ) {
      equipmentTaskMechanismContext.primaryMatch = {
        equipmentLabel:
          equipmentTaskMechanismContext.primaryMatch?.equipmentLabel ||
          request.equipmentInvolved ||
          hazardClassification.primaryDomain,
        componentLabel:
          equipmentTaskMechanismContext.primaryMatch?.componentLabel ||
          hazardClassification.primaryDomain,
        failureModeLabel: mechanismPrecedence.mechanismId,
        score: Math.max(equipmentTaskMechanismContext.primaryMatch?.score || 0, 100),
        matchedSignals: [
          ...(equipmentTaskMechanismContext.primaryMatch?.matchedSignals || []),
          ...mechanismPrecedence.reasonCodes,
        ],
        evidenceQuestions:
          equipmentTaskMechanismContext.primaryMatch?.evidenceQuestions || [],
        immediateCautions:
          equipmentTaskMechanismContext.primaryMatch?.immediateCautions || [],
      } as any;
    }

    if (mechanismPrecedence.reasonCodes.length > 0) {
      equipmentReasoningSummary = this.buildEquipmentReasoningSummary(
        equipmentTaskMechanismContext,
        equipmentArchetypeContext,
        combined,
      );
    }

    const resolvedMechanism = {
      mechanismId:
        mechanismPrecedence.mechanismId ||
        equipmentTaskMechanismContext.primaryMatch?.failureModeLabel ||
        equipmentReasoningSummary.primaryMechanismOrArchetype ||
        'unknown',
      source:
        mechanismPrecedence.reasonCodes.length > 0
          ? 'precedence_resolver'
          : equipmentTaskMechanismContext.primaryMatch?.failureModeLabel
            ? 'task_mechanism'
            : equipmentArchetypeContext.primaryMatch
              ? 'archetype'
              : 'unknown',
      reasonCodes: mechanismPrecedence.reasonCodes,
      humanReviewRecommended: mechanismPrecedence.humanReviewRecommended,
    } as const;

    const brainSnapshot = this.brainSnapshotBuilderService.build({
      hazardObservation: request.hazardObservation,
      siteType: request.siteType,
      taskContext: request.taskContext,
      industryContext: request.industryContext,
      equipmentInvolved: request.equipmentInvolved,
      jurisdiction: jurisdictionAssessment.likelyJurisdiction,
      hazardDomain: hazardClassification.primaryDomain,
      mechanismId: resolvedMechanism.mechanismId,
      primaryCitation,
    });

    const safetyCalculations = this.safetyCalculationsService.analyze(combined);

    const knowledgeRetrieval = this.knowledgeRetrievalService.retrieveForObservation({
      query: request.hazardObservation,
      facets: [hazardClassification.primaryDomain],
    });

    const governedKnowledgeRetrieval = {
      enabled: true,
      matchedRecordIds: knowledgeRetrieval.map(r => r.id),
      matchedRecordTitles: knowledgeRetrieval.map(r => r.title),
      retrievalFacets: { facets: [hazardClassification.primaryDomain] },
      matchReasons: knowledgeRetrieval.map(r => this.knowledgeRetrievalService.explainMatch(r, [hazardClassification.primaryDomain])),
      evidenceNeeds: knowledgeRetrieval.length === 0 
        ? ["No governed knowledge records matched for this hazard domain. Review requires qualified safety verification."] 
        : [],
      authoritySummary: knowledgeRetrieval.length > 0 ? "Governed knowledge records identified." : "No governed knowledge records identified.",
      advisoryLimitations: ["Governed knowledge is advisory only."],
      guardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        doesNotFinalizeApplicability: true,
        requiresQualifiedReview: true,
        doesNotOverrideRegulation: true,
      } as const,
    };

    if (knowledgeRetrieval.length === 0) {
      governedKnowledgeRetrieval.evidenceNeeds = ["No matches found. Reviewer must verify physical condition against safety standards."];
    }

    return {
      engine: 'safescope_reasoning_orchestrator_v1',
      mode: 'deterministic_test_only_advisory',
      productionReasoningModified: false,
      primaryCitation,
      governedKnowledgeRetrieval,
      requestSummary: {
        hazardObservation: request.hazardObservation,
        siteType: request.siteType,
        taskContext: request.taskContext,
        industryContext: request.industryContext,
      },
      jurisdictionAssessment,
      hazardClassification,
      approvedKnowledgeContext,
      applicabilitySignals,
      applicabilityAnalysis,
      correctiveActionReasoning,
      equipmentTaskMechanismContext,
      equipmentArchetypeContext,
      equipmentReasoningSummary,
      resolvedMechanism,
      brainSnapshot,
      missingEvidence,
      safetyCalculations,
      contradictionIntelligence,
      companyPolicies,
      confidence,
      conclusionBoundary: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
      recommendedNextQuestions: this.recommendedQuestions(jurisdictionAssessment.likelyJurisdiction, hazardClassification.primaryDomain, missingEvidence),
    };
  }

  private buildEquipmentReasoningSummary(
    equipmentTaskMechanismContext: SafeScopeReasoningResult['equipmentTaskMechanismContext'],
    equipmentArchetypeContext: SafeScopeReasoningResult['equipmentArchetypeContext'],
    hazardObservation = '',
  ): SafeScopeEquipmentReasoningSummary {
    const specific = equipmentTaskMechanismContext.primaryMatch;
    const archetype = equipmentArchetypeContext.primaryMatch;

    const guardrails = {
      contextOnly: true,
      advisoryOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    } as const;

    if (specific && archetype) {
      return {
        primaryReasoningMode: 'specific_with_archetype_support',
        primaryEquipmentContext: `${specific.equipmentLabel} / ${specific.componentLabel}`,
        primaryMechanismOrArchetype: specific.failureModeLabel,
        supportingContext: [
          `Supporting archetype: ${archetype.label}.`,
          `Specific score: ${specific.score}.`,
          `Archetype score: ${archetype.score}.`,
          ...equipmentTaskMechanismContext.matches
            .slice(1, 3)
            .map((match) => this.formatSecondarySpecificContext(match, hazardObservation))
            .filter((context): context is string => Boolean(context)),
        ],
        rankingReasons: [
          'A specific equipment/component/failure-mode match was available, so it is primary.',
          'The archetype context is retained as supporting generalized equipment reasoning.',
          `Specific matched signals: ${(specific.matchedSignals || []).join(', ') || 'none listed'}.`,
          `Archetype matched signals: ${(archetype.matchedSignals || []).join(', ') || 'none listed'}.`,
        ],
        evidenceGaps: uniqueStrings([...(specific.evidenceQuestions || []).slice(0, 4), ...(archetype.evidenceQuestions || []).slice(0, 2)]),
        cautions: uniqueStrings([...(specific.immediateCautions || []).slice(0, 3), ...(archetype.immediateCautions || []).slice(0, 2)]),
        guardrails,
      };
    }

    if (specific) {
      return {
        primaryReasoningMode: 'specific_task_mechanism',
        primaryEquipmentContext: `${specific.equipmentLabel} / ${specific.componentLabel}`,
        primaryMechanismOrArchetype: specific.failureModeLabel,
        supportingContext: equipmentTaskMechanismContext.matches
          .slice(1, 4)
          .map((match) => this.formatSecondarySpecificContext(match, hazardObservation))
            .filter((context): context is string => Boolean(context)),
        rankingReasons: [
          'A specific equipment/component/failure-mode match was available.',
          'No supporting archetype match exceeded the detection threshold.',
          `Specific matched signals: ${(specific.matchedSignals || []).join(', ') || 'none listed'}.`,
        ],
        evidenceGaps: (specific.evidenceQuestions || []).slice(0, 5),
        cautions: (specific.immediateCautions || []).slice(0, 4),
        guardrails,
      };
    }

    if (archetype) {
      return {
        primaryReasoningMode: 'archetype_fallback',
        primaryEquipmentContext: archetype.label,
        primaryMechanismOrArchetype: archetype.archetypeId,
        supportingContext: equipmentArchetypeContext.matches
          .slice(1, 4)
          .map((match) => `Secondary archetype context: ${match.label}.`),
        rankingReasons: [
          'No specific equipment/component/failure-mode match exceeded the detection threshold.',
          'A generalized equipment archetype match was available and is used as fallback context.',
          `Archetype matched signals: ${(archetype.matchedSignals || []).join(', ') || 'none listed'}.`,
        ],
        evidenceGaps: archetype.evidenceQuestions.slice(0, 5),
        cautions: archetype.immediateCautions.slice(0, 4),
        guardrails,
      };
    }

    return {
      primaryReasoningMode: 'insufficient_equipment_context',
      primaryEquipmentContext: 'unknown',
      primaryMechanismOrArchetype: 'unknown',
      supportingContext: [],
      rankingReasons: [
        'No specific task-mechanism match or generalized equipment archetype match exceeded the detection threshold.',
        'Additional equipment, component, task, exposure, and energy/movement details are needed.',
      ],
      evidenceGaps: uniqueStrings([
        ...equipmentTaskMechanismContext.evidenceGaps,
        ...equipmentArchetypeContext.evidenceGaps,
      ]),
      cautions: uniqueStrings([
        ...equipmentTaskMechanismContext.cautions,
        ...equipmentArchetypeContext.cautions,
      ]),
      guardrails,
    };
  }

  private normalizeTaskContext(taskContext: string | undefined): SafeScopeTaskContext | undefined {
    if (!taskContext) {
      return undefined;
    }

    const text = taskContext.toLowerCase();

    if (includesAny(text, ['cleanup', 'cleaning', 'shoveling', 'washdown'])) {
      return 'cleanup';
    }

    if (includesAny(text, ['maintenance', 'service', 'servicing'])) {
      return 'maintenance';
    }

    if (includesAny(text, ['repair', 'replacement', 'replace'])) {
      return 'repair';
    }

    if (includesAny(text, ['inspection', 'inspect', 'exam', 'walkdown'])) {
      return 'inspection';
    }

    if (includesAny(text, ['startup', 'start up', 'shutdown', 'shut down', 'restart'])) {
      return 'startup_shutdown';
    }

    if (includesAny(text, ['operation', 'operating', 'running', 'production'])) {
      return 'normal_operation';
    }

    return undefined;
  }

  private assessJurisdiction(text: string): SafeScopeReasoningResult['jurisdictionAssessment'] {
    const reasons: string[] = [];
    const holdReason = this.getJurisdictionHoldReason(text);

    if (holdReason) {
      reasons.push(`Jurisdiction hold: ${holdReason}`);
    }

    if (includesAny(text, ['mine', 'quarry', 'pit', 'plant', 'crusher', 'screening plant', 'haul truck', 'highwall', 'berm'])) {
      reasons.push('Mining or aggregate-site terms were detected.');
      return {
        likelyJurisdiction: 'msha',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    if (includesAny(text, ['construction', 'scaffold', 'excavation', 'trench', 'roofing', 'steel erection'])) {
      reasons.push('Construction activity terms were detected.');
      return {
        likelyJurisdiction: 'osha_construction',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    if (includesAny(text, ['manufacturing', 'warehouse', 'general industry', 'facility', 'shop floor', 'shop', 'factory'])) {
      reasons.push('General industry facility terms were detected.');
      return {
        likelyJurisdiction: 'osha_general_industry',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    reasons.push('No clear jurisdiction-specific site terms were detected.');
    return {
      likelyJurisdiction: 'unclear',
      reasons,
      requiresHumanConfirmation: true,
    };
  }

  private resolvePrimaryCitation(
    jurisdiction: SafeScopeJurisdiction,
    domain: SafeScopeReasoningDomain,
    text: string,
  ): string | undefined {
    const normalizedText = normalized(text);


    // Field Readiness Routing Pack v1: specialized citation routing must run before broad domain fallbacks.
    if (
      jurisdiction === 'osha_general_industry' &&
      includesAny(normalizedText, ['eyewash', 'eye wash', 'emergency shower', 'quick drenching', 'flushing facility']) &&
      includesAny(normalizedText, ['corrosive', 'caustic', 'chemical splash', 'blocked', 'obstructed', 'not accessible'])
    ) {
      return '29 CFR 1910.151(c)';
    }

    if (
      jurisdiction === 'osha_construction' &&
      includesAny(normalizedText, ['temporary stairway', 'stairway', 'stairs', 'handrail', 'hand rail', 'stair rail']) &&
      includesAny(normalizedText, ['missing handrail', 'missing hand rail', 'open side', 'no handrail', 'no hand rail', 'construction access'])
    ) {
      return '29 CFR 1926.1052(c)(1)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      includesAny(normalizedText, ['compressed gas cylinder', 'gas cylinder', 'cylinder valve cap', 'valve cap', 'unsecured cylinder', 'cylinder restraint'])
    ) {
      return '29 CFR 1910.101(b)';
    }

    if (
      jurisdiction === 'osha_construction' &&
      includesAny(normalizedText, ['overhead work', 'falling object', 'falling material', 'dropped object', 'tools overhead', 'materials overhead', 'toe board', 'toeboard'])
    ) {
      return '29 CFR 1926.501(c)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'ventilation' &&
      includesAny(normalizedText, ['underground metal/nonmetal', 'metal/nonmetal underground', 'underground mnm', 'part 57', '57.8520', 'ventilation tubing', 'air quality', 'contaminant buildup'])
    ) {
      return '30 CFR 57.8520';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      includesAny(normalizedText, ['welding cylinder', 'fuel gas cylinder', 'oxygen cylinder', 'acetylene', 'cylinder separation', 'oxygen and fuel gas', 'oxygen and acetylene', 'fuel gas and oxygen']) &&
      includesAny(normalizedText, ['welding', 'cutting', 'hot work', 'fuel gas', 'oxygen', 'acetylene', 'separation', 'cylinder'])
    ) {
      return '29 CFR 1910.253(b)(2)(ii)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      includesAny(normalizedText, ['bloodborne', 'blood borne', 'bodily fluid', 'bodily fluids', 'sharps', 'needle', 'contaminated needle', 'sharps container'])
    ) {
      return '29 CFR 1910.1030';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'electrical' &&
      includesAny(normalizedText, ['underground coal', 'coal mine', 'coal']) &&
      includesAny(normalizedText, ['trailing cable', 'power cable', 'damaged cable', 'cable insulation', 'cable jacket', '75.517'])
    ) {
      return '30 CFR 75.517';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      includesAny(normalizedText, ['hazcom', 'hazard communication', 'chemical storage', 'sds', 'safety data sheet', 'chemical label', 'unlabeled container'])
    ) {
      return '29 CFR 1910.1200';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'electrical' &&
      includesAny(normalizedText, ['coal', 'underground coal', 'coal mine']) &&
      includesAny(normalizedText, ['underground', 'underground mine']) &&
      includesAny(normalizedText, [
        'trailing cable',
        'power cable',
        'damaged cable',
        'electrical cable',
        'cable insulation',
        'jacket damage',
      ])
    ) {
      return '30 CFR 75.517';
    }

    // remaining-failures hardening citation guard
    if (
      jurisdiction === 'msha' &&
      domain === 'electrical' &&
      includesAny(normalizedText, [
        'damaged electrical cable',
        'damaged cable',
        'electrical cable',
        'power cable',
        'trailing cable',
        'exposed conductor',
        'damaged conductor',
        'bare conductor',
        'arc flash',
        'shock',
      ])
    ) {
      return '30 CFR 56.12004';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'machine_guarding' &&
      includesAny(normalizedText, [
        'underground mnm',
        'underground metal',
        'underground nonmetal',
        'underground conveyor',
        'underground mine conveyor',
        '57.14107',
      ])
    ) {
      return '30 CFR 57.14107';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'mobile_equipment' &&
      includesAny(normalizedText, [
        'forklift',
        'powered industrial truck',
        'pedestrian',
        'pedestrians',
      ])
    ) {
      return '29 CFR 1910.178(l)';
    }

    if (
      jurisdiction === 'osha_construction' &&
      domain === 'health_respiratory'
    ) {
      return '29 CFR 1926.1153(c)(1)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'hazardous_materials'
    ) {
      return '29 CFR 1910.1200(f)(1)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'confined_space'
    ) {
      return '29 CFR 1910.146(c)(1)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'electrical'
    ) {
      return '30 CFR 56.12004';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'machine_guarding'
    ) {
      return '29 CFR 1910.212(a)(3)(ii)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'roof_rib_control'
    ) {
      return '30 CFR 75.202(a)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'ventilation'
    ) {
      return '30 CFR 75.333';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'emergency_preparedness'
    ) {
      return '30 CFR 75.380';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'machine_guarding_loto'
    ) {
      return '30 CFR 56.14105';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'machine_guarding_loto'
    ) {
      return '29 CFR 1910.147(c)(1)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'mobile_equipment' &&
      (normalizedText.includes('haul road') ||
        normalizedText.includes('berm') ||
        normalizedText.includes('missing berm') ||
        normalizedText.includes('inadequate berm') ||
        normalizedText.includes('edge control'))
    ) {
      return '30 CFR 56.9300';
    }

    // remaining-failures hardening citation guard
    if (
      jurisdiction === 'msha' &&
      domain === 'electrical' &&
      includesAny(normalizedText, [
        'damaged electrical cable',
        'damaged cable',
        'electrical cable',
        'power cable',
        'trailing cable',
        'exposed conductor',
        'damaged conductor',
        'bare conductor',
        'arc flash',
        'shock',
      ])
    ) {
      return '30 CFR 56.12004';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'machine_guarding' &&
      includesAny(normalizedText, [
        'underground mnm',
        'underground metal',
        'underground nonmetal',
        'underground conveyor',
        'underground mine conveyor',
        '57.14107',
      ])
    ) {
      return '30 CFR 57.14107';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'mobile_equipment' &&
      includesAny(normalizedText, [
        'forklift',
        'powered industrial truck',
        'pedestrian',
        'pedestrians',
      ])
    ) {
      return '29 CFR 1910.178(l)';
    }

    if (
      jurisdiction === 'osha_construction' &&
      domain === 'health_respiratory'
    ) {
      return '29 CFR 1926.1153(c)(1)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'hazardous_materials'
    ) {
      return '29 CFR 1910.1200(f)(1)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'confined_space'
    ) {
      return '29 CFR 1910.146(c)(1)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'electrical'
    ) {
      return '30 CFR 56.12004';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'machine_guarding'
    ) {
      return '29 CFR 1910.212(a)(3)(ii)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'roof_rib_control'
    ) {
      return '30 CFR 75.202(a)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'ventilation'
    ) {
      return '30 CFR 75.333';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'emergency_preparedness'
    ) {
      return '30 CFR 75.380';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'machine_guarding_loto'
    ) {
      return '30 CFR 56.14105';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'machine_guarding_loto'
    ) {
      return '29 CFR 1910.147(c)(1)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'mobile_equipment' &&
      (normalizedText.includes('shuttle car') ||
        normalizedText.includes('underground coal') ||
        normalizedText.includes('miners on foot'))
    ) {
      return '30 CFR 75.1725';
    }

    if (
      jurisdiction === 'osha_construction' &&
      domain === 'mobile_equipment'
    ) {
      return '29 CFR 1926.602(a)(9)';
    }

    if (
      jurisdiction === 'osha_general_industry' &&
      domain === 'mobile_equipment' &&
      (normalizedText.includes('forklift') || normalizedText.includes('powered industrial truck'))
    ) {
      return '29 CFR 1910.178(l)';
    }

    if (
      jurisdiction === 'msha' &&
      domain === 'fall_protection' &&
      (normalizedText.includes('elevated platform') ||
        normalizedText.includes('open side') ||
        normalizedText.includes('fall protection') ||
        normalizedText.includes('fall from height'))
    ) {
      return '30 CFR 56.15005';
    }

    if (
      jurisdiction === 'osha_construction' &&
      domain === 'fall_protection' &&
      (normalizedText.includes('scaffold') ||
        normalizedText.includes('toprail') ||
        normalizedText.includes('midrail') ||
        normalizedText.includes('platform over 10 feet'))
    ) {
      return '29 CFR 1926.451(g)(4)';
    }

    if (
      jurisdiction === 'osha_construction' &&
      (domain === 'ladders' || domain === 'slips_trips_falls') &&
      (normalizedText.includes('ladder') ||
        normalizedText.includes('extension ladder') ||
        normalizedText.includes('landing surface') ||
        normalizedText.includes('roof access'))
    ) {
      return '29 CFR 1926.1053(b)(1)';
    }

    return STANDARDS_APPLICABILITY_REGISTRY.find(
      (s) => s.jurisdiction === jurisdiction && s.domain === domain,
    )?.primaryCitation;
  }

  private classifyHazard(text: string): SafeScopeReasoningResult['hazardClassification'] {
    const normalizedText = text.toLowerCase();

    // Alias Mapping & Domain Context Routing
    const domain = this.determineDomain(normalizedText);

    if (domain === 'unknown') {
      return {
        primaryDomain: 'unknown',
        reasons: ['No supported hazard-domain keywords were detected with enough certainty.'],
      };
    }

    return {
      primaryDomain: domain,
      reasons: [
        'Domain detected via context-aware routing.',
      ],
    };
  }

  private isTelehandlerOrForkliftVisibilityContext(text: string): boolean {
    const normalizedText = normalized(text);

    return (
      includesAny(normalizedText, [
        'telehandler',
        'reach forklift',
        'rough terrain forklift',
        'forklift',
        'powered industrial truck',
      ]) &&
      includesAny(normalizedText, [
        'blocked the operator',
        'blocked operator',
        'blocked forward view',
        'blocked view',
        'obstructed view',
        'operator visibility',
        'forward view',
        'blind spot',
        'visibility',
        'spotter',
        'traffic control',
        'laborers',
        'pedestrian',
        'pedestrians',
        'workers on foot',
        'employees on foot',
      ])
    );
  }

  private isPoweredDoorCrushPointContext(text: string): boolean {
    const normalizedText = normalized(text);

    return (
      includesAny(normalizedText, [
        'powered overhead door',
        'overhead door',
        'dock door',
        'roll up door',
        'roll-up door',
        'bay door',
        'powered door',
      ]) &&
      includesAny(normalizedText, [
        'closed quickly',
        'closing',
        'crush point',
        'pinch point',
        'photo-eye',
        'photo eye',
        'warning device',
        'manual release',
        'pass under the door',
        'pedestrian walkway',
        'employees pass under',
      ])
    );
  }

  private isTrainingOnlyNoActiveExposureContext(text: string): boolean {
    const normalizedText = normalized(text);

    return (
      includesAny(normalizedText, [
        'training records',
        'training record',
        'record review',
        'documentation issue',
        'records were incomplete',
      ]) &&
      includesAny(normalizedText, [
        'no conveyor was running',
        'no guard was missing',
        'no employee exposure',
        'no exposure',
        'not in use',
        'training only',
      ])
    );
  }

  private determineDomain(text: string): SafeScopeReasoningDomain {
    const normalizedText = normalized(text);

    // P1C: mobile equipment / fixed equipment disambiguation.
    // Telehandler/forklift visibility with travel, load, spotter, traffic, or pedestrian context is mobile equipment,
    // not LOTO, unless explicit servicing/maintenance energy-control facts dominate later.
    if (this.isTelehandlerOrForkliftVisibilityContext(normalizedText)) {
      return 'mobile_equipment';
    }

    // Powered overhead/dock doors create fixed equipment crush/pinch exposure, not mobile equipment.
    if (this.isPoweredDoorCrushPointContext(normalizedText)) {
      return 'machine_guarding';
    }

    // Preserve training/documentation-only trap: keep as machine guarding context but rely on missing exposure evidence
    // rather than escalating to LOTO or active machine exposure.
    if (this.isTrainingOnlyNoActiveExposureContext(normalizedText)) {
      return 'machine_guarding';
    }

    // P1A bloodborne/sharps field-intelligence routing.
    // Keep this before broad PPE, housekeeping, material, or unknown routing.
    if (
      includesAny(normalizedText, [
        'bloodborne',
        'blood borne',
        'blood',
        'bodily fluid',
        'bodily fluids',
        'opim',
        'sharp',
        'sharps',
        'needle',
        'used needle',
        'needlestick',
        'needle stick',
        'biohazard',
        'exposure control plan',
        'sharps container',
        'contaminated first aid',
        'cleanup kit',
      ])
    ) {
      return 'bloodborne_pathogens';
    }

    // remaining-failures hardening domain guard
    if (
      includesAny(normalizedText, [
        'damaged electrical cable',
        'damaged cable',
        'electrical cable',
        'power cable',
        'trailing cable',
        'damaged power cable',
        'exposed conductor',
        'exposed conductors',
        'damaged conductor',
        'damaged conductors',
        'bare conductor',
        'energized conductor',
        'energized conductors',
        'mill electrical',
        'shock arc flash',
        'arc flash',
      ])
    ) {
      return 'electrical';
    }

    if (
      includesAny(normalizedText, [
        'forklift pedestrian',
        'forklift/pedestrian',
        'forklift and pedestrian',
        'forklift traffic',
        'forklift operating near pedestrian',
        'forklift operating near pedestrians',
        'powered industrial truck pedestrian',
        'powered industrial truck traffic',
      ])
    ) {
      return 'mobile_equipment';
    }


    // MSHA mill electrical conductor final guard.
    if (
      includesAny(normalizedText, [
        'damaged electrical cable',
        'damaged cable',
        'electrical cable',
        'exposed conductor',
        'exposed conductors',
        'damaged conductor',
        'damaged conductors',
        'electrical conductor',
        'energized conductor',
        'mill electrical',
        'shock arc flash',
        'arc flash',
      ])
    ) {
      return 'electrical';
    }

    if (
      includesAny(normalizedText, [
        'industrial hygiene',
        'atmospheric contaminant',
        'air contaminants',
        'vocs',
        'chemical vapors',
        'solvent vapors',
        'toxic gas',
        'gas exposure',
        'multi-contaminant',
      ])
    ) {
      return 'industrial_hygiene';
    }

    if (
      includesAny(normalizedText, [
        'ergonomics',
        'musculoskeletal',
        'manual lifting',
        'manually lifting',
        'heavy lifting',
        'lifting hazard',
        'lifting',
        'heavy',
        'repetitive',
        'repetitively',
        'musculoskeletal disorder',
        'msd',
        'repetitive lifting',
        'lifting assist',
        'forceful exertion',
      ])
    ) {
      return 'ergonomics';
    }

    if (
      includesAny(normalizedText, [
        'fire extinguisher',
        'extinguisher',
        'fire protection',
        'fire suppression',
        'blocked extinguisher',
        'fire alarm',
        'emergency exit blocked',
        'flammable storage',
        'hot work fire watch',
        'fire watch',
        'ignition source',
      ])
    ) {
      return 'fire_protection';
    }

    if (
      includesAny(normalizedText, [
        'scaffold',
        'scaffolding',
        'base plate',
        'mudsill',
        'cross brace',
        'planking',
        'scaffold access',
        'tubular welded',
        'baker scaffold',
      ])
    ) {
      return 'scaffolds';
    }

    if (
      includesAny(normalizedText, [
        'silica',
        'respirable crystalline silica',
        'silica dust',
        'concrete dust',
        'dry cutting',
        'dust exposure',
        'respiratory exposure',
      ])
    ) {
      return 'health_respiratory';
    }

    if (
      includesAny(normalizedText, [
        'hazcom',
        'hazard communication',
        'unlabeled container',
        'secondary container',
        'chemical container',
        'hazardous chemical',
        'sds',
      ])
    ) {
      return 'hazardous_materials';
    }

    if (
      includesAny(normalizedText, [
        'confined space',
        'permit required confined space',
        'permit-required confined space',
        'entry controls',
        'atmospheric hazard',
        'oxygen deficiency',
        'asphyxiation',
        'attendant',
        'entry permit',
      ])
    ) {
      return 'confined_space';
    }

    if (
      includesAny(normalizedText, [
        'damaged electrical cable',
        'damaged conductor',
        'exposed conductor',
        'arc flash',
        'shock arc flash',
      ])
    ) {
      return 'electrical';
    }

    if (
      includesAny(normalizedText, [
        'point of operation',
        'pinch point',
        'unguarded point of operation',
      ])
    ) {
      return 'machine_guarding';
    }

    if (
      includesAny(normalizedText, [
        'escapeway',
        'escape way',
        'emergency egress',
        'blocked escapeway',
        'obstructed escapeway',
        'escapeway obstruction',
        'escape route',
        'lifeline',
      ])
    ) {
      return 'emergency_preparedness';
    }

    if (
      includesAny(normalizedText, [
        'ventilation',
        'ventilation curtain',
        'airflow',
        'air flow',
        'methane',
        'gas buildup',
        'methane buildup',
        'curtain',
        'stopping',
        'regulator',
      ])
    ) {
      return 'ventilation';
    }

    if (
      includesAny(normalizedText, [
        'rib',
        'loose rib',
        'rib fall',
        'rib control',
        'coal rib',
        'unsupported rib',
        'rib sloughing',
        'roof/rib',
      ])
    ) {
      return 'roof_rib_control';
    }

    if (
      includesAny(normalizedText, [
        'lockout',
        'tagout',
        'loto',
        'hazardous energy',
        'unexpected startup',
        'unexpected start up',
        'stored energy',
        'energy isolation',
        'zero energy',
        'de-energize',
        'maintenance without lockout',
        'servicing without lockout',
        'crusher maintenance',
        'crusher drive',
        'guard removed',
        'blocking',
        'blocked against motion',
      ])
    ) {
      return 'machine_guarding_loto';
    }

    if (
      includesAny(normalizedText, [
        'haul truck',
        'haul road',
        'berm',
        'missing berm',
        'inadequate berm',
        'dump point',
        'edge control',
        'mobile equipment',
        'shuttle car',
        'skid steer',
        'forklift',
        'powered industrial truck',
        'pedestrian',
        'pedestrians',
        'employees on foot',
        'miners on foot',
        'backing equipment',
        'backup alarm',
        'spotter',
        'traffic control',
        'exclusion zone',
        'pedestrian separation',
      ])
    ) {
      return 'mobile_equipment';
    }

    // 1. Context-Aware Routing (Expert Knowledge)
    if (text.includes('coal underground') && (text.includes('roof') || text.includes('loose rock') || text.includes('fractured'))) {
      return 'ground_control';
    }
    if (text.includes('trench') || (text.includes('excavation') && (text.includes('shoring') || text.includes('no protection')))) {
      return 'excavation_trenching';
    }
    if (text.includes('junction box') || (text.includes('electrical') && text.includes('energized'))) {
      return 'electrical';
    }
    if (text.includes('conveyor') && (text.includes('guard') || text.includes('nip point'))) {
      return 'machine_guarding';
    }

    // 2. Registry-Based Taxonomy Mapping
    for (const entry of Object.values(SAFESCOPE_TAXONOMY_REGISTRY)) {
      if (entry.aliases.some(alias => text.includes(alias))) {
        return entry.canonical;
      }
    }

    return 'unknown';
  }



  private getJurisdictionHoldReason(text: string): string | undefined {
    const normalizedText = normalized(text);

    const ambiguousShop =
      includesAny(normalizedText, ['shop observation', 'repair shop', 'maintenance shop']) ||
      (includesAny(normalizedText, ['shop']) &&
        includesAny(normalizedText, ['jurisdiction', 'unclear', 'ambiguous', 'unknown', 'no jurisdiction context']));

    const mineContractor =
      includesAny(normalizedText, ['contractor shop', 'mine contractor', 'contractor']) &&
      includesAny(normalizedText, ['mine', 'plant', 'near mine', 'jurisdiction', 'uncertainty']);

    const constructionPlant =
      includesAny(normalizedText, [
        'construction work inside operating plant',
        'construction inside operating plant',
        'construction in operating plant',
      ]) ||
      (includesAny(normalizedText, ['construction']) &&
        includesAny(normalizedText, ['operating plant', 'mine plant', 'plant']) &&
        includesAny(normalizedText, ['jurisdiction', 'uncertainty', 'operator responsibility']));

    const mobileShopBoundary =
      includesAny(normalizedText, ['mobile equipment repair shop', 'equipment repair shop', 'repair shop']) &&
      includesAny(normalizedText, ['msha', 'osha', 'mine', 'jurisdiction', 'boundary', 'uncertainty']);

    const railSpurBoundary =
      includesAny(normalizedText, ['rail spur', 'railroad spur', 'rail siding']) &&
      includesAny(normalizedText, ['mine', 'plant', 'jurisdiction', 'boundary', 'uncertainty', 'common carrier']);

    const publicRoadBoundary =
      includesAny(normalizedText, ['public road', 'public roadway', 'public highway']) &&
      includesAny(normalizedText, ['haul truck', 'mine truck', 'crossing', 'mine', 'plant', 'jurisdiction']);

    if (
      ambiguousShop ||
      mineContractor ||
      constructionPlant ||
      mobileShopBoundary ||
      railSpurBoundary ||
      publicRoadBoundary
    ) {
      return 'Jurisdiction is not defensible from the observation alone. Confirm mine property status, public/private road or rail boundary, controlling employer, exposed worker status, contractor/operator control, and whether construction or shop work falls under MSHA or OSHA before relying on standards.';
    }

    return undefined;
  }

  private identifyMissingEvidence(
    request: SafeScopeReasoningRequest,
    domain: SafeScopeReasoningDomain,
  ): SafeScopeReasoningEvidenceGap[] {
    const gaps: SafeScopeReasoningEvidenceGap[] = [];

    if (!request.hazardObservation.trim()) {
      gaps.push({
        field: 'hazardObservation',
        reason: 'A hazard observation is required before reasoning can occur.',
        importance: 'high',
      });
    }

    if (!request.siteType) {
      gaps.push({
        field: 'siteType',
        reason: 'Site type is needed to distinguish MSHA, OSHA General Industry, and OSHA Construction context.',
        importance: 'high',
      });
    }

    if (request.photosAvailable !== true) {
      gaps.push({
        field: 'photosAvailable',
        reason: 'Photos help confirm physical conditions and reduce uncertainty.',
        importance: domain === 'machine_guarding' || domain === 'fall_protection' ? 'high' : 'medium',
      });
    }

    if (request.employeeExposureKnown !== true) {
      gaps.push({
        field: 'employeeExposureKnown',
        reason: 'Employee exposure must be understood before applicability can be assessed defensibly.',
        importance: 'high',
      });
    }

    const healthExposureText = normalized([
      request.hazardObservation,
      request.taskContext,
      request.industryContext,
      request.equipmentInvolved,
      request.siteType,
    ].join(' '));

    if (
      (domain === 'health_exposure' || domain === 'bloodborne_pathogens') &&
      includesAny(healthExposureText, [
        'bloodborne',
        'blood borne',
        'blood',
        'bodily fluid',
        'bodily fluids',
        'opim',
        'sharp',
        'sharps',
        'needle',
        'used needle',
        'needlestick',
        'needle stick',
        'biohazard',
        'exposure control plan',
        'sharps container',
      ])
    ) {
      gaps.push({
        field: 'bloodborneSharpsExposureFacts',
        reason: 'Bloodborne/sharps review needs confirmation of needlestick or contact exposure, blood/OPIM presence, cleanup procedure, PPE, sharps container availability, area restriction, and exposure-control plan status.',
        importance: 'high',
      });
    } else if (domain === 'industrial_hygiene') {
      gaps.push({
        field: 'industrialHygieneAtmosphericFacts',
        reason: 'Industrial hygiene reviews require air sampling measurements, ventilation checks, local exhaust status, and respirator usage records to evaluate exposure levels.',
        importance: 'high',
      });
    } else if (domain === 'ergonomics') {
      gaps.push({
        field: 'ergonomicsLiftingFacts',
        reason: 'Ergonomic reviews require load weight, repetitive lift frequency, lift height, postures, duration of work, and availability of mechanical lifting aids to evaluate musculoskeletal risks.',
        importance: 'high',
      });
    } else if (domain === 'excavation_trenching') {
      gaps.push({
        field: 'excavationTrenchingFacts',
        reason: 'Excavation reviews require trench depth, soil type classification, competent person inspection records, and details of any protective systems (sloping, shoring, shielding) used.',
        importance: 'high',
      });
    } else if (domain === 'scaffolds') {
      gaps.push({
        field: 'scaffoldFacts',
        reason: 'Scaffold reviews require working height, base plate/mudsill verification, guardrail completeness, access method, and competent person daily inspection documentation.',
        importance: 'high',
      });
    } else if (domain === 'fire_protection') {
      gaps.push({
        field: 'fireProtectionFacts',
        reason: 'Fire protection reviews require extinguisher types, mounting height, monthly/annual inspection tags, accessibility/blockage status, and distance to hazard.',
        importance: 'high',
      });
    } else if (domain === 'health_exposure' && request.measurementsAvailable !== true) {
      gaps.push({
        field: 'measurementsAvailable',
        reason: 'Exposure-related conclusions often require sampling, measurements, or duration/frequency evidence.',
        importance: 'high',
      });
    }

    const jurisdictionHoldReason = this.getJurisdictionHoldReason([
      request.hazardObservation,
      request.siteType,
      request.industryContext,
      request.taskContext,
      request.equipmentInvolved,
    ].join(' '));

    if (jurisdictionHoldReason) {
      gaps.push({
        field: 'jurisdictionHoldFacts',
        reason: jurisdictionHoldReason,
        importance: 'high',
      });
    }

    return gaps;
  }

  private buildApplicabilitySignals(
    text: string,
    request: SafeScopeReasoningRequest,
    domain: SafeScopeReasoningDomain,
  ): SafeScopeApplicabilitySignal[] {
    return [
      {
        signal: 'hazard-domain-detected',
        matched: domain !== 'unknown',
        explanation:
          domain !== 'unknown'
            ? `A supported hazard domain was detected: ${domain}.`
            : 'No supported hazard domain was detected.',
      },
      {
        signal: 'employee-exposure-known',
        matched: request.employeeExposureKnown === true,
        explanation:
          request.employeeExposureKnown === true
            ? 'Employee exposure was indicated.'
            : 'Employee exposure is not confirmed.',
      },
      {
        signal: 'visual-evidence-available',
        matched: request.photosAvailable === true,
        explanation:
          request.photosAvailable === true
            ? 'Photos are available for visual confirmation.'
            : 'Photos are not available for visual confirmation.',
      },
      {
        signal: 'specific-equipment-or-condition',
        matched: Boolean(request.equipmentInvolved || includesAny(text, ['conveyor', 'pulley', 'cord', 'platform', 'forklift', 'loader', 'truck'])),
        explanation: 'Checks whether a specific equipment item or physical condition is described.',
      },
    ];
  }

  private calculateConfidence(
    jurisdiction: SafeScopeJurisdiction,
    domain: SafeScopeReasoningDomain,
    gaps: SafeScopeReasoningEvidenceGap[],
    signals: SafeScopeApplicabilitySignal[],
    contradictionIntelligence?: any,
  ): { level: SafeScopeReasoningConfidence; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (jurisdiction !== 'unclear') {
      score += 2;
      reasons.push('A likely jurisdiction was identified.');
    } else {
      reasons.push('Jurisdiction is unclear.');
    }

    if (domain !== 'unknown') {
      score += 2;
      reasons.push('A supported hazard domain was identified.');
    } else {
      reasons.push('Hazard domain is unknown.');
    }

    score += signals.filter((signal) => signal.matched).length;

    const highGaps = gaps.filter((gap) => gap.importance === 'high').length;
    score -= highGaps;

    if (contradictionIntelligence?.contradictionsDetected) {
      score -= 3;
      reasons.push('Confidence downgraded due to internal contradictions detected in the hazard description.');
    }

    if (contradictionIntelligence?.ambiguities?.length > 0) {
      score -= 1;
      reasons.push('Confidence adjusted due to semantic ambiguities in the observation.');
    }

    if (score >= 5 && highGaps === 0 && !contradictionIntelligence?.contradictionsDetected) {
      return { level: 'high', reasons };
    }

    if (score >= 3) {
      return { level: 'moderate', reasons };
    }

    return { level: 'low', reasons };
  }

  private recommendedQuestions(
    jurisdiction: SafeScopeJurisdiction,
    domain: SafeScopeReasoningDomain,
    gaps: SafeScopeReasoningEvidenceGap[],
  ): string[] {
    const questions = gaps.map((gap) => {
      if (gap.field === 'siteType') return 'What type of site is this: mine, construction site, general industry facility, or other?';
      if (gap.field === 'photosAvailable') return 'Can the user provide photos showing the hazard condition and surrounding access path?';
      if (gap.field === 'employeeExposureKnown') return 'Are employees exposed to the hazard during operation, maintenance, travel, or inspection?';
      if (gap.field === 'measurementsAvailable') return 'Are sampling results, measurements, duration, or frequency data available?';
      if (gap.field === 'jurisdictionHoldFacts') {
        return 'Confirm jurisdiction before relying on standards: is the location on mine property, who controls the work area, are miners exposed, is the road public or private, is contractor work under mine-operator control, and is construction part of mining operations or a separate project?';
      }
      return `Can the user provide more information for ${gap.field}?`;
    });

    if (jurisdiction === 'unclear') {
      questions.push('Which regulatory context appears most likely: MSHA, OSHA General Industry, or OSHA Construction?');
    }

    if (domain === 'machine_guarding') {
      questions.push('Is the moving part guarded, partially guarded, removed, damaged, or accessible during operation?');
      questions.push('For powered doors or fixed equipment, are crush/pinch zones, presence sensors, warning devices, manual release, pedestrian travel paths, and operating state verified?');
    }

    if (domain === 'lockout_tagout') {
      questions.push(
        'Have all hazardous energy sources been identified, isolated, controlled, blocked where needed, and verified before employees perform the task?',
      );
    }

    if (domain === 'fall_protection') {
      questions.push(
        'What fall protection method is in place, and is the walking/working surface, access path, anchorage, or guardrail system adequate for the task?',
      );
    }

    if (domain === 'electrical') {
      questions.push(
        'Is the electrical equipment de-energized, guarded, protected from contact or wet conditions, and reviewed by a qualified electrical person where required?',
      );
    }

    if (domain === 'powered_haulage') {
      questions.push(
        'What traffic controls, visibility controls, berms, dump-point controls, separation methods, or spotter/reverse-alarm protections are in place for the haulage activity?',
      );
    }

    if (domain === 'traffic_control') {
      questions.push(
        'What pedestrian-vehicle separation, signage, barriers, traffic pattern, visibility, and right-of-way controls are in place?',
      );
    }

    if (domain === 'mobile_equipment') {
      questions.push(
        'What operator visibility, alarm, seatbelt, pre-use inspection, braking, parking, attachment-position, and pedestrian-separation controls are in place for the equipment?',
      );
      questions.push(
        'If visibility or load position is involved, what is the travel path, load height/position, spotter use, pedestrian interface, route control, and operating state?',
      );
    }

    return Array.from(new Set(questions));
  }


  private isCraneRiggingContext(text: string): boolean {
    const normalizedText = String(text || '').toLowerCase();

    return [
      'crane',
      'derrick',
      'hoist',
      'hoisting',
      'rigging',
      'sling',
      'shackle',
      'hook',
      'wire rope',
      'suspended load',
      'hoisted load',
      'load path',
      'fall zone',
      'tag line',
      'under the load',
      'damaged sling',
      'rigging defect',
      'qualified rigger',
      'signal person'
    ].some((term) => normalizedText.includes(term));
  }

  private resolveCraneRiggingMechanism(text: string): string | undefined {
    const normalizedText = String(text || '').toLowerCase();

    if (!this.isCraneRiggingContext(normalizedText)) {
      return undefined;
    }

    const hasRiggingFailureSignal = includesAny(normalizedText, [
      'damaged sling',
      'defective sling',
      'damaged wire rope',
      'wire rope sling',
      'broken strand',
      'broken strands',
      'frayed sling',
      'frayed synthetic sling',
      'synthetic sling with missing identification',
      'missing identification',
      'missing sling identification',
      'missing sling tag',
      'missing rated capacity',
      'cut sling',
      'rigging defect',
      'defective rigging',
      'overloaded sling',
      'improper sling',
      'improper rigging',
      'shackle defect',
      'damaged shackle',
      'damaged hook',
      'hook defect',
      'pre-use inspection',
      'pre use inspection',
      'no inspection',
      'not inspected',
    ]);

    const hasRiggingContext = includesAny(normalizedText, [
      'rigging',
      'sling',
      'wire rope',
      'shackle',
      'hook',
      'hoist',
      'hoisting',
      'lifting',
      'lift a load',
      'lift a heavy load',
      'material lifting',
      'staged for use',
    ]);

    const hasSuspendedLoadSignal = includesAny(normalizedText, [
      'suspended load',
      'hoisted load',
      'under the load',
      'under suspended load',
      'load path',
      'fall zone',
      'tag line',
      'crane load',
      'standing under',
      'employee under',
    ]);

    if (hasSuspendedLoadSignal) {
      return 'struck_by_suspended_load';
    }

    if (
      includesAny(normalizedText, [
        'dropped load',
        'falling load',
        'load shift',
        'lost load control',
        'load fell',
      ])
    ) {
      return 'dropped_load';
    }

    if (hasRiggingFailureSignal && hasRiggingContext) {
      return 'rigging_failure';
    }

    if (hasRiggingContext) {
      return 'rigging_failure';
    }

    return undefined;
  }

  private resolveCraneRiggingCitation(text: string): string | undefined {
    const normalizedText = String(text || '').toLowerCase();

    if (!this.isCraneRiggingContext(normalizedText)) {
      return undefined;
    }

    if (
      normalizedText.includes('construction') ||
      normalizedText.includes('jobsite') ||
      normalizedText.includes('1926') ||
      normalizedText.includes('suspended load') ||
      normalizedText.includes('load path') ||
      normalizedText.includes('fall zone') ||
      normalizedText.includes('crane load') ||
      normalizedText.includes('under the load')
    ) {
      return '29 CFR 1926.1425';
    }

    if (
      normalizedText.includes('general industry') ||
      normalizedText.includes('1910') ||
      normalizedText.includes('sling') ||
      normalizedText.includes('damaged sling') ||
      normalizedText.includes('wire rope') ||
      normalizedText.includes('shackle') ||
      normalizedText.includes('rigging defect')
    ) {
      return '29 CFR 1910.184';
    }

    return undefined;
  }


  private resolveEyeFacePpeOverride(text: string): boolean {
    return (
      includesAny(text, [
        'without eye protection',
        'without face protection',
        'without eye and face protection',
        'without eye or face protection',
        'no eye protection',
        'no face protection',
        'no eye and face protection',
        'no eye or face protection',
        'missing eye protection',
        'missing face protection',
        'missing eye and face protection',
        'not wearing safety glasses',
        'not wearing goggles',
        'not wearing face shield',
        'grinding without eye',
        'grinding without face',
        'grinding without eye and face',
      ]) &&
      includesAny(text, [
        'grinding',
        'cutting',
        'chipping',
        'flying particles',
        'sparks',
        'face shield',
        'safety glasses',
        'goggles',
        'eye protection',
        'face protection',
        'eye and face protection',
      ])
    );
  }

  private resolveHighPriorityPhysicalHazardOverride(text: string): {
    domain?: SafeScopeReasoningDomain;
    mechanismId?: string;
    citation?: string;
    reasonCodes: string[];
  } {
    const value = normalized(text);
    const hasAny = (terms: string[]) => includesAny(value, terms);
    const reasonCodes: string[] = [];
    if (
      hasAny(['exposed energized wiring', 'exposed live wiring', 'exposed energized conductor', 'exposed conductor', 'energized wiring', 'live conductor', 'damaged electrical conductor']) &&
      hasAny(['exposed', 'energized', 'live', 'wiring', 'conductor', 'shock', 'electrical'])
    ) {
      reasonCodes.push('priority-electrical-exposed-energized-conductor');
      return {
        domain: 'electrical',
        mechanismId: 'shock',
        citation: '29 CFR 1910.303(g)(2)(i)',
        reasonCodes,
      } as any;
    }

    if (
      hasAny(['travelway housekeeping', 'housekeeping trip', 'trip hazard', 'obstructed travelway', 'walking path obstruction']) &&
      hasAny(['trip', 'travelway', 'housekeeping', 'obstruction', 'debris', 'walkway'])
    ) {
      reasonCodes.push('priority-travelway-housekeeping-trip');
      return {
        domain: 'slip_trip_fall',
        mechanismId: 'trip',
        citation: '30 CFR 56.20003',
        reasonCodes,
      } as any;
    }

    if (
      hasAny(['cold stress', 'cold exposure', 'hypothermia', 'frostbite', 'wind chill', 'freezing temperature', 'cold weather', 'cold work', 'freezing conditions']) &&
      hasAny(['worker', 'employee', 'exposure', 'outdoor', 'prolonged', 'glove', 'gloves', 'hands', 'feet', 'symptom', 'warming', 'warm up', 'wet clothing', 'cold injury'])
    ) {
      reasonCodes.push('medium-priority-cold-stress-environmental-exposure');
      return {
        domain: 'environmental_exposure',
        mechanismId: 'cold_stress',
        citation: 'OSHA/NIOSH Heat and Cold Stress Guidance',
        reasonCodes,
      } as any;
    }

    if (
      hasAny(['heat stress', 'heat illness', 'hot environment', 'wbgt', 'heat index', 'high temperature', 'radiant heat', 'dehydration', 'working in heat']) &&
      hasAny(['worker', 'employee', 'exposure', 'outdoor', 'hydration', 'shade', 'acclimatization', 'work rest', 'work-rest', 'symptom', 'cooling', 'water'])
    ) {
      reasonCodes.push('medium-priority-heat-stress-environmental-exposure');
      return {
        domain: 'environmental_exposure',
        mechanismId: 'heat_illness',
        citation: 'OSHA/NIOSH Heat and Cold Stress Guidance',
        reasonCodes,
      } as any;
    }

    if (
      hasAny(['noise', 'loud', 'decibel', 'dba', 'sound level', 'hearing conservation', 'audiogram', 'dosimetry']) &&
      hasAny(['exposure', 'worker', 'employee', 'crusher', 'saw', 'jackhammer', 'hearing protection', 'survey', 'monitoring', 'dose'])
    ) {
      reasonCodes.push('medium-priority-noise-hearing-conservation');
      return {
        domain: 'health_exposure',
        mechanismId: 'noise_induced_hearing_loss',
        citation: '29 CFR 1910.95',
        reasonCodes,
      } as any;
    }

    if (
      hasAny(['manual lifting', 'heavy lift', 'lifting heavy', 'awkward posture', 'repetitive motion', 'overexertion', 'ergonomic', 'ergonomics', 'twisting', 'material handling by hand']) &&
      hasAny(['worker', 'employee', 'lift', 'lifting', 'handling', 'repetitive', 'posture', 'reach', 'strain', 'sprain'])
    ) {
      reasonCodes.push('medium-priority-ergonomics-overexertion');
      return {
        domain: 'ergonomics',
        mechanismId: 'overexertion',
        citation: 'General Duty / Ergonomics Guidance',
        reasonCodes,
      } as any;
    }


    if (
      hasAny(['stacked unevenly', 'unevenly stacked', 'leaning into', 'leaning pallet', 'palletized material', 'unstable stack', 'improper stacking']) &&
      hasAny(['aisle', 'employee aisle', 'travelway', 'falling material', 'falling material exposure', 'material storage', 'warehouse'])
    ) {
      reasonCodes.push('high-priority-unstable-stack-collapse');
      return {
        domain: 'material_handling',
        mechanismId: 'unstable_stack_collapse',
        citation: '29 CFR 1910.176(b)',
        reasonCodes,
      };
    }

    if (
      hasAny([
        'defective portable power tool',
        'defective power tool',
        'damaged power tool',
        'damaged hand tool',
        'defective hand tool',
        'portable drill',
        'portable tool',
        'power tool',
        'hand tool',
        'tool cord',
        'damaged cord',
        'frayed cord',
        'cracked housing',
        'cracked tool',
        'broken handle',
        'missing ground pin',
        'tagged out',
        'removed from service',
      ]) &&
      hasAny([
        'defective',
        'damaged',
        'broken',
        'cracked',
        'frayed',
        'unsafe',
        'available for use',
        'tagged out',
        'removed from service',
        'cord',
        'housing',
      ])
    ) {
      reasonCodes.push('high-priority-defective-tool-contact');
      return {
        domain: 'tools_equipment',
        mechanismId: 'defective_tool_contact',
        citation: '29 CFR 1910.242(a)',
        reasonCodes,
      };
    }



    if (
      hasAny(['fire extinguisher', 'extinguisher', 'portable fire extinguisher']) &&
      hasAny([
        'blocked',
        'obstructed',
        'not accessible',
        'missing',
        'expired',
        'inspection tag',
        'monthly inspection',
        'not legible',
        'illegible',
        'unreadable',
        'label not legible',
        'tag not legible',
        'inspection tag not legible',
        'cannot be verified',
        'not identified',
        'unidentified',
      ])
    ) {
      reasonCodes.push('high-priority-fire-extinguisher-access');
      return {
        domain: 'fire_protection',
        mechanismId: 'fire_extinguisher_access_failure',
        citation: '29 CFR 1910.157(c)(1)',
        reasonCodes,
      };
    }

    if (
      hasAny([
        'welding cylinder',
        'welding cylinders',
        'fuel gas cylinder',
        'fuel gas cylinders',
        'fuel-gas cylinder',
        'fuel-gas cylinders',
        'oxygen cylinder',
        'oxygen cylinders',
        'acetylene cylinder',
        'acetylene cylinders',
        'oxygen and fuel gas',
        'oxygen and fuel-gas',
        'oxygen and acetylene',
        'fuel gas and oxygen',
        'acetylene and oxygen',
        'cylinder separation',
        'cylinders stored together',
        'oxygen and fuel gas cylinders stored together',
        'fuel gas cylinders stored together',
        'oxygen cylinders stored with fuel gas cylinders',
        'not separated',
        'separation distance',
        'noncombustible barrier',
      ]) &&
      hasAny([
        'welding',
        'cutting',
        'hot work',
        'fuel gas',
        'fuel-gas',
        'oxygen',
        'acetylene',
        'cylinder',
        'cylinders',
        'separation',
      ])
    ) {
      reasonCodes.push('high-priority-welding-cylinder-separation');
      return {
        domain: 'welding_cutting_hot_work',
        mechanismId: 'fire_explosion',
        citation: '29 CFR 1910.253(b)(2)(ii)',
        reasonCodes,
      };
    }

    if (
      hasAny(['hot work', 'welding', 'cutting', 'torch cutting', 'grinding sparks']) &&
      hasAny(['fire watch', 'combustible', 'flammable', 'sparks', 'ignition'])
    ) {
      reasonCodes.push('high-priority-hot-work-ignition');
      return {
        domain: 'welding_cutting_hot_work',
        mechanismId: 'hot_work_ignition',
        citation: '29 CFR 1910.252(a)(2)(iii)(A)',
        reasonCodes,
      };
    }

    if (
      hasAny(['eye protection', 'face shield', 'safety glasses', 'goggles']) &&
      hasAny(['without', 'no ', 'missing', 'not wearing', 'grinding', 'cutting'])
    ) {
      reasonCodes.push('high-priority-eye-face-ppe');
      return {
        domain: 'ppe',
        mechanismId: 'eye_face_ppe_gap',
        citation: '29 CFR 1910.132(d)(1)',
        reasonCodes,
      };
    }

    if (
      hasAny(['hand protection', 'gloves', 'cut resistant', 'sharp material', 'sharp metal', 'sharp edge']) &&
      hasAny(['without', 'no ', 'missing', 'not wearing', 'handling'])
    ) {
      reasonCodes.push('high-priority-hand-ppe');
      return {
        domain: 'ppe',
        mechanismId: 'hand_ppe_gap',
        citation: '29 CFR 1910.132(d)(1)',
        reasonCodes,
      };
    }

    if (
      hasAny(['grinder', 'abrasive wheel', 'cutoff wheel', 'cut-off wheel', 'grinding wheel']) &&
      hasAny(['missing guard', 'guard removed', 'no guard', 'damaged guard', 'wheel guard'])
    ) {
      reasonCodes.push('high-priority-abrasive-wheel-tool');
      return {
        domain: 'tools_equipment',
        mechanismId: 'abrasive_wheel_failure',
        citation: '29 CFR 1910.242(a)',
        reasonCodes,
      };
    }

    if (
      hasAny(['defective tool', 'damaged tool', 'broken handle', 'portable power tool', 'power tool', 'hand tool', 'tool cord', 'extension cord']) &&
      hasAny(['defective', 'damaged', 'broken', 'frayed cord', 'damaged cord', 'cord insulation', 'missing ground pin', 'cracked', 'unsafe', 'tagged out', 'removed from service'])
    ) {
      reasonCodes.push('high-priority-defective-tool');
      return {
        domain: 'tools_equipment',
        mechanismId: 'defective_tool_contact',
        citation: '29 CFR 1910.242(a)',
        reasonCodes,
      };
    }

    if (
      hasAny(['overhead storage', 'stored overhead', 'overhead stored', 'falling object', 'falling material', 'object fell', 'material fell', 'material stored overhead', 'stored above employees'])
    ) {
      reasonCodes.push('high-priority-material-falling-object');
      return {
        domain: 'material_handling',
        mechanismId: 'falling_object_material',
        citation: '29 CFR 1910.176(b)',
        reasonCodes,
      };
    }

    if (
      hasAny(['unstable stack', 'stacked unevenly', 'unevenly stacked', 'leaning into', 'leaning pallet', 'leaning into employee aisle', 'leaning into an employee aisle', 'palletized material', 'stacked material', 'material was stacked', 'improper stacking', 'stacked unevenly', 'unevenly stacked', 'stacked material', 'leaning pallet', 'improper stacking', 'rack collapse', 'pallets stacked', 'stacked boxes', 'leaning stack', 'unstable pallet'])
    ) {
      reasonCodes.push('high-priority-material-stack-collapse');
      return {
        domain: 'material_handling',
        mechanismId: 'unstable_stack_collapse',
        citation: '29 CFR 1910.176(b)',
        reasonCodes,
      };
    }

    return { reasonCodes };
  }


  private formatSecondarySpecificContext(match: any, hazardObservation: string): string | null {
    const normalized = String(hazardObservation || '').toLowerCase();
    const failureModeLabel = String(match.failureModeLabel || '');

    const panelClosed =
      /\bpanel\b[^.]*\b(closed|shut|secured)\b/.test(normalized) ||
      /\b(closed|shut|secured)\b[^.]*\bpanel\b/.test(normalized);

    const explicitExposedElectrical =
      /\b(exposed live parts|live parts exposed|open electrical panel|missing dead front|missing cover|open panel|energized troubleshooting)\b/.test(normalized);

    if (
      panelClosed &&
      !explicitExposedElectrical &&
      failureModeLabel.toLowerCase().includes('exposed live parts')
    ) {
      return null;
    }

    return `Secondary specific context: ${match.equipmentLabel} / ${match.componentLabel} / ${match.failureModeLabel}.`;
  }


}
