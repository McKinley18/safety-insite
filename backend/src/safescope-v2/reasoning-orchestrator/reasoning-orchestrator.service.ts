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
import { InspectionIntelligenceService } from '../inspection-intelligence/inspection-intelligence.service';
import { MineContextService } from '../inspection-intelligence/mine-context.service';
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
    private readonly inspectionIntelligenceService = new InspectionIntelligenceService(),
    private readonly mineContextService = new MineContextService(),
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

    if (primaryCitation === undefined && hazardClassification.primaryDomain === 'electrical') {
      hazardClassification.primaryDomain = 'unknown';
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
      );
    }

    const canonicalMechanism = this.resolveCanonicalMechanism(
      hazardClassification.primaryDomain,
      combined,
    );
    const resolvedMechanism = {
      mechanismId:
        canonicalMechanism ||
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

    let brainSnapshot: any = this.brainSnapshotBuilderService.build({
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

    if (primaryCitation === undefined && hazardClassification.primaryDomain === 'unknown') {
      brainSnapshot = undefined;
    }

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

    const inspectionIntelligence = this.inspectionIntelligenceService.analyze({
      observation: combined,
      jurisdiction: jurisdictionAssessment.likelyJurisdiction,
      primaryDomain: hazardClassification.primaryDomain,
      primaryCitation,
    });

    if (inspectionIntelligence.conditionAssessment.status !== 'uncontrolled') {
      primaryCitation = undefined;
      brainSnapshot = undefined;
      confidence.level = 'low';
      confidence.reasons.push('The observation is controlled, non-hazardous in context, or lacks enough evidence for a confident finding.');
      correctiveActionReasoning.recommendations = [];
      correctiveActionReasoning.summary = {
        totalRecommendations: 0,
        immediateCount: 0,
        engineeringCount: 0,
        administrativeCount: 0,
        ppeCount: 0,
        verificationCount: 0,
      };
    }

    if (
      inspectionIntelligence.conditionAssessment.status === 'uncontrolled'
      && inspectionIntelligence.conditionAssessment.controlledDomains.includes(hazardClassification.primaryDomain)
      && inspectionIntelligence.hazardCandidates[0]
    ) {
      hazardClassification.primaryDomain = inspectionIntelligence.hazardCandidates[0].domain;
      hazardClassification.reasons.push('Primary ranking was corrected because the initially classified domain is explicitly controlled in the observation.');
      primaryCitation = inspectionIntelligence.candidateStandards[0]?.citation;
    }

    if (['controlled', 'no_hazard_signal'].includes(inspectionIntelligence.conditionAssessment.status)) {
      hazardClassification.primaryDomain = 'unknown';
      hazardClassification.reasons.push('No uncontrolled hazard condition remains supported after control-state and context review.');
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
      inspectionIntelligence,
    };
  }

  private buildEquipmentReasoningSummary(
    equipmentTaskMechanismContext: SafeScopeReasoningResult['equipmentTaskMechanismContext'],
    equipmentArchetypeContext: SafeScopeReasoningResult['equipmentArchetypeContext'],
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
            .map((match) => `Secondary specific context: ${match.equipmentLabel} / ${match.componentLabel} / ${match.failureModeLabel}.`),
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
          .map((match) => `Secondary specific context: ${match.equipmentLabel} / ${match.componentLabel} / ${match.failureModeLabel}.`),
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
    const mineContext = this.mineContextService.assess(text);

    const explicitCrossJurisdictionBoundary =
      /\b(construction|mine|msha)\s+(versus|vs\.?|or)\s+(general industry|facility|shop|manufacturing|non-mine|osha)\b/.test(text) ||
      /\b(construction|mine|non-mine|workplace)\b[^.;]{0,60}\b(context|type|jurisdiction)\b[^.;]{0,30}\b(not stated|not established)\b/.test(text);

    if (holdReason) {
      reasons.push(`Jurisdiction hold: ${holdReason}`);
    }

    if (holdReason && explicitCrossJurisdictionBoundary) {
      return {
        likelyJurisdiction: 'unclear',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    if (mineContext.detected) {
      reasons.push(...mineContext.reasons);
      return {
        likelyJurisdiction: 'msha',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    const constructionContext = includesAny(text, ['construction', 'construction site', 'jobsite', 'job site', 'commercial building site', 'renovation', 'steel erection']);
    const generalIndustryContext = includesAny(text, ['manufacturing', 'warehouse', 'general industry', 'facility', 'industrial plant', 'plant', 'shop floor', 'shop', 'factory', 'fabrication', 'fabrication floor', 'assembly']);

    if (constructionContext) {
      reasons.push('Construction activity terms were detected.');
      return {
        likelyJurisdiction: 'osha_construction',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    if (generalIndustryContext) {
      reasons.push('General industry facility terms were detected.');
      return {
        likelyJurisdiction: 'osha_general_industry',
        reasons,
        requiresHumanConfirmation: true,
      };
    }

    if (includesAny(text, ['excavation', 'trench', 'roofing', 'steel erection'])) {
      reasons.push('A construction-specific work activity was detected without a conflicting facility context.');
      return {
        likelyJurisdiction: 'osha_construction',
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

    // Enforce closed-panel and generic safety constraints: closed, undamaged, dry panel with no exposed parts
    const cleanText = normalizedText.replace(/\bundamaged\b/gi, '');
    const rawIncludesAny = (t: string, terms: string[]) => terms.some((term) => t.includes(term));
    if (
      cleanText.includes('closed') &&
      rawIncludesAny(cleanText, ['panel', 'enclosure', 'cabinet', 'box', 'disconnect']) &&
      !includesAny(cleanText, ['exposed', 'bare', 'open', 'damaged', 'missing', 'water', 'wet', 'leak', 'sparks', 'heat', 'smoke', 'troubleshooting', 'testing'])
    ) {
      if (includesAny(cleanText, ['blocked', 'blocking', 'obstructed', 'obstructing', 'pallets', 'boxes', 'bins', 'clearance', 'stacked'])) {
        return '29 CFR 1910.303(g)(1)';
      }
      return undefined;
    }

    // Generic electrical panel nearby with no active hazards: return undefined to prevent false positive
    if (
      domain === 'electrical' &&
      !includesAny(cleanText, ['exposed', 'bare', 'open', 'damaged', 'missing', 'blocked', 'obstructed', 'clearance', 'boxes', 'pallets', 'water', 'wet', 'leak', 'sparks', 'heat', 'smoke', 'troubleshooting', 'testing', 'temporary power', 'gfci', 'uninsulated'])
    ) {
      return undefined;
    }

    if (
      (jurisdiction === 'osha_construction' || jurisdiction === 'unclear') &&
      domain === 'electrical' &&
      rawIncludesAny(normalizedText, ['temporary power', 'gfci', 'temporary construction power', 'missing gfci', 'outdoor extension cord', 'generator outlets'])
    ) {
      return '29 CFR 1926.404(b)(1)(ii)';
    }

    if (
      (jurisdiction === 'osha_general_industry' || jurisdiction === 'unclear') &&
      domain === 'electrical' &&
      rawIncludesAny(cleanText, ['extension cord', 'flexible cord', 'power cord', 'damaged cord', 'cord insulation'])
    ) {
      return '29 CFR 1910.305(g)(1)(iii)';
    }

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
      includesAny(normalizedText, ['compressed gas cylinder', 'oxygen cylinder', 'acetylene cylinder', 'gas cylinder', 'cylinder valve cap', 'valve cap', 'unsecured cylinder', 'cylinder restraint'])
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
      includesAny(normalizedText, ['welding', 'cutting', 'brazing', 'fuel gas', 'acetylene', 'oxygen and fuel gas', 'oxygen and acetylene'])
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

    if (domain === 'hazardous_materials') {
      if (jurisdiction === 'msha') {
        return '30 CFR 47.41';
      }
      if (jurisdiction === 'osha_construction') {
        return '29 CFR 1926.59';
      }
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

    if (
      jurisdiction === 'osha_construction' &&
      (domain === 'excavation_trenching' || includesAny(normalizedText, ['trench', 'excavation'])) &&
      rawIncludesAny(normalizedText, [
        'ladder',
        'egress',
        'ramp',
        'stairway',
        'stairs',
        'lateral travel',
        'exit',
      ]) &&
      !normalizedText.includes('shoring') &&
      !normalizedText.includes('shielding') &&
      !normalizedText.includes('sloping')
    ) {
      return '29 CFR 1926.651(c)(2)';
    }

    if (
      (jurisdiction === 'osha_general_industry' || jurisdiction === 'unclear') &&
      domain === 'electrical' &&
      rawIncludesAny(normalizedText, ['dead-front', 'dead front', 'cabinet box opening', 'missing dead-front', 'inner cover missing'])
    ) {
      return '29 CFR 1910.305(b)(1)';
    }

    if (
      (jurisdiction === 'osha_general_industry' || jurisdiction === 'unclear') &&
      domain === 'electrical' &&
      rawIncludesAny(normalizedText, ['blocked panel', 'panel blocked', 'blocked access', 'working space', 'pallets blocking', 'stored boxes electrical'])
    ) {
      return '29 CFR 1910.303(g)(1)';
    }

    if (
      (jurisdiction === 'osha_general_industry' || jurisdiction === 'unclear') &&
      domain === 'electrical' &&
      rawIncludesAny(normalizedText, ['energized troubleshooting', 'voltage testing', 'working on live parts', 'qualified person electrical'])
    ) {
      return '29 CFR 1910.333';
    }

    if (
      jurisdiction === 'osha_construction' &&
      domain === 'electrical' &&
      rawIncludesAny(normalizedText, ['temporary power', 'gfci', 'temporary construction power', 'missing gfci', 'outdoor extension cord', 'generator outlets'])
    ) {
      return '29 CFR 1926.404(b)(1)(ii)';
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

    // Cylinder / Gas precision check: force generic unlabeled containers/tanks/bottles/buckets/jugs/unknown liquids to route to hazardous_materials (HazCom) and prevent incorrect routing to confined_space or compressed_gas.
    const hasGenericContainerOrLabel = /(container|bottle|bucket|jug|tank|storage|label|unlabeled|no label|unknown liquid)/i.test(normalizedText);
    const hasCylinderTerms = /(oxygen|compressed gas|gas cylinder|cylinder|acetylene|argon|propane|valve cap|regulator|cylinder cart|unsecured cylinder|upright cylinder|tank valve|gas bottle)/i.test(normalizedText);
    const hasStrongCompetingDomains = /(electrical|conductor|wire|breaker|panel|guard|nip point|pinch point|conveyor|scaffold|fall protection|harness|lanyard|exit|egress|fire extinguisher|whipcheck|hydraulic|vocs|chemical vapors|solvent vapors|atmospheric contaminant|air contaminants|toxic gas|gas exposure|ergonomics|musculoskeletal|manual lifting|heavy lifting|lifting hazard|msd|silica|concrete dust|dust exposure|respiratory exposure|confined space|entry permit|entry controls|asphyxiation|oxygen deficiency|scaffold|scaffolding|base plate|mudsill|planking|ladder|escapeway|escape route|ventilation|airflow|methane|gas buildup|ventilation curtain|rib|loose rib|rib control|roof\/rib|roof fall)/i.test(normalizedText);

    if (
      /\b(?:worker|employee|entrant) (?:enters|entered|inside|in) (?:a )?(?:tank|vessel|silo|pit)\b/i.test(normalizedText) &&
      /\b(unknown atmosphere|atmosphere|oxygen|toxic|ventilation|entry)\b/i.test(normalizedText)
    ) {
      return 'confined_space';
    }

    if (
      /\b(used oil|oil|chemical|fuel) (?:container|drum|tote)\b/i.test(normalizedText) &&
      /\b(open|leaking|spill|release|near (?:a )?floor drain|drain|storm drain|soil|waterway)\b/i.test(normalizedText)
    ) {
      return 'environmental_release';
    }

    if (hasGenericContainerOrLabel && !hasCylinderTerms && !hasStrongCompetingDomains) {
      return 'hazardous_materials';
    }

    if (normalizedText.includes('scaffold') || normalizedText.includes('scaffolding')) {
      return 'scaffolds';
    }

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
      includesAny(normalizedText.replace(/heavy-duty/gi, ''), [
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
        'fire extinguishers',
        'extinguisher',
        'extinguishers',
        'fire protection',
        'fire suppression',
        'blocked extinguisher',
        'blocked extinguishers',
        'fire alarm',
        'fire alarms',
        'emergency exit blocked',
        'flammable storage',
        'hot work fire watch',
        'fire watch',
        'ignition source',
        'ignition sources',
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
        'chemical',
        'acid',
        'bleach',
        'corrosive',
        'cleaner',
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
        'electrical panel',
        'electrical enclosure',
        'electrical cabinet',
        'disconnect switch',
        'junction box',
        'extension cord',
        'gfci',
        'energized',
        'live parts',
        'dead-front',
        'dead front',
        'busbar',
        'busbars',
        'plug',
        'receptacle',
        'shock potential',
        'shock hazard',
        'electrical',
        'voltage testing',
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
        if (text.includes('field-v2-osha-trench-egress-missing-001') || text.includes('trench egress') || text.includes('trench-egress') || text.includes('trench_egress') || text.includes('field-v2-osha-electrical-cord-damaged-001') || text.includes('heavy-duty')) {
          console.error("[DIAGNOSTIC determineDomain] matched entry canonical:", entry.canonical, "on alias:", entry.aliases.find(alias => text.includes(alias)));
        }
        return entry.canonical;
      }
    }

    return 'unknown';
  }



  private getJurisdictionHoldReason(text: string): string | undefined {
    const normalizedText = normalized(text);

    const ambiguousShop = includesAny(normalizedText, ['shop', 'shop observation', 'repair shop', 'maintenance shop']) &&
      includesAny(normalizedText, ['jurisdiction', 'unclear', 'ambiguous', 'unknown', 'no jurisdiction context', 'mine versus', 'mine vs', 'mine or']);

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

    const explicitlyUnclearBoundary =
      /\b(construction|mine|msha)\s+(versus|vs\.?|or)\s+(general industry|facility|shop|manufacturing|non-mine|osha)\b/.test(normalizedText) ||
      /\b(mine|non-mine|construction|general industry|workplace)\b[^.;]{0,60}\b(context|type|jurisdiction)\b[^.;]{0,30}\b(unclear|unknown|not stated|not established)\b/.test(normalizedText) ||
      /\b(platform|scaffold|roof)\b[^.;]{0,50}\bcontext\b[^.;]{0,20}\b(unclear|unknown)\b/.test(normalizedText);

    if (
      ambiguousShop ||
      mineContractor ||
      constructionPlant ||
      mobileShopBoundary ||
      railSpurBoundary ||
      publicRoadBoundary ||
      explicitlyUnclearBoundary
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
    } else if (domain === 'compressed_gas') {
      gaps.push({
        field: 'compressedGasCylinderFacts',
        reason: 'Cylinder review requires contents, service status, restraint, upright position, valve protection, impact exposure, and storage compatibility.',
        importance: 'high',
      });
    } else if (domain === 'noise_exposure') {
      gaps.push({
        field: 'noiseExposureFacts',
        reason: 'Noise review requires source, duration, sound level or dosimetry, hearing protection, and hearing-conservation program status.',
        importance: 'high',
      });
    } else if (domain === 'heat_stress') {
      gaps.push({
        field: 'heatStressFacts',
        reason: 'Heat-stress review requires environmental conditions, workload, duration, water/rest/shade access, acclimatization, and symptom status.',
        importance: 'high',
      });
    } else if (domain === 'cold_stress') {
      gaps.push({
        field: 'coldStressFacts',
        reason: 'Cold-stress review requires temperature, wind/wet conditions, duration, warming access, protective clothing, and symptom status.',
        importance: 'high',
      });
    } else if (domain === 'dropped_objects') {
      gaps.push({
        field: 'droppedObjectFacts',
        reason: 'Dropped-object review requires elevation, tool/material securement, toe-board or containment status, and personnel exposure below.',
        importance: 'high',
      });
    } else if (domain === 'ground_control') {
      gaps.push({
        field: 'groundControlFacts',
        reason: 'Ground-control review requires highwall/face condition, loose material, recent examination, scaling controls, and worker setback.',
        importance: 'high',
      });
    } else if (domain === 'water_drowning') {
      gaps.push({
        field: 'waterDrowningFacts',
        reason: 'Water-hazard review requires distance to water, fall prevention, flotation protection, rescue equipment, and work-alone status.',
        importance: 'high',
      });
    } else if (domain === 'environmental_release') {
      gaps.push({
        field: 'environmentalReleaseFacts',
        reason: 'Release-pathway review requires material identity, container condition, quantity, drain/soil/water pathway, and containment status.',
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

    const hasGenericContainerOrLabel = /(container|bottle|bucket|jug|tank|storage|label|unlabeled|no label|unknown liquid)/i.test(healthExposureText);
    const hasCylinderTerms = /(oxygen|compressed gas|gas cylinder|cylinder|acetylene|argon|propane|valve cap|regulator|cylinder cart|unsecured cylinder|upright cylinder|tank valve|gas bottle)/i.test(healthExposureText);

    if (hasGenericContainerOrLabel && !hasCylinderTerms) {
      gaps.push({
        field: 'chemicalContainerSubstanceFacts',
        reason: 'Identification reviews require confirmation of what substance is stored inside the container/tank, whether it is a hazardous chemical, and whether a product name or hazard label is present.',
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
      if (gap.field === 'chemicalContainerSubstanceFacts') {
        return 'What substance is inside the container or tank, and is it a chemical or secondary container?';
      }
      const domainQuestionByField: Record<string, string> = {
        compressedGasCylinderFacts: 'What gas is in the cylinder, and are restraint, valve protection, impact protection, and compatible storage verified?',
        noiseExposureFacts: 'What are the noise level and duration, and what engineering, administrative, and hearing-protection controls are in place?',
        heatStressFacts: 'What are the heat conditions, workload, duration, acclimatization status, and water/rest/shade provisions?',
        coldStressFacts: 'What are the temperature, wind/wet conditions, exposure duration, warming provisions, clothing, and symptoms?',
        droppedObjectFacts: 'What is stored at elevation, how is it secured, and are people exposed below?',
        groundControlFacts: 'Has a competent person examined the highwall or ground condition, and are setback, barricading, or scaling controls in place?',
        waterDrowningFacts: 'What prevents a fall into the water, and are PFDs and immediately available rescue equipment provided?',
        environmentalReleaseFacts: 'What material and quantity could reach the drain, soil, or water, and what containment is present?',
      };
      if (domainQuestionByField[gap.field]) return domainQuestionByField[gap.field];
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

    if (domain === 'hazardous_materials') {
      questions.push('What substance is inside the container or tank, and is it a chemical or secondary container?');
      questions.push('Does the container have any label, product name, or hazard warnings present?');
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
        'without a face shield',
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
      hasAny(['compressed gas cylinder', 'oxygen cylinder', 'acetylene cylinder', 'gas cylinder', 'unsecured cylinder', 'cylinder valve cap']) &&
      hasAny(['unsecured', 'not secured', 'missing valve cap', 'without valve cap', 'stored', 'storage', 'walkway', 'traffic', 'impact'])
    ) {
      reasonCodes.push('priority-compressed-gas-cylinder-storage');
      return { domain: 'compressed_gas', mechanismId: 'cylinder_projectile_or_gas_release', reasonCodes };
    }

    if (
      hasAny(['loose tools', 'tools stored loose', 'tools are stored loose', 'unsecured tools', 'loose material', 'dropped object', 'falling object']) &&
      hasAny(['elevated platform', 'platform', 'overhead', 'above workers', 'work below', 'people below'])
    ) {
      reasonCodes.push('priority-dropped-object-exposure');
      return { domain: 'dropped_objects', mechanismId: 'struck_by_falling_object', reasonCodes };
    }

    if (
      hasAny(['highwall', 'mine face', 'pit wall']) &&
      hasAny(['loose material', 'cracking', 'fractured', 'sloughing', 'unstable', 'falling rock'])
    ) {
      reasonCodes.push('priority-highwall-ground-control');
      return { domain: 'ground_control', mechanismId: 'fall_of_ground_or_material', reasonCodes };
    }

    if (
      hasAny(['open water', 'pond', 'water edge', 'working near water', 'drowning hazard']) &&
      hasAny(['employee', 'worker', 'crew', 'without flotation', 'no pfd', 'fall into water', 'unprotected edge'])
    ) {
      reasonCodes.push('priority-water-drowning-exposure');
      return { domain: 'water_drowning', mechanismId: 'fall_into_water_and_drowning', reasonCodes };
    }

    if (
      hasAny(['used oil', 'oil container', 'chemical container', 'fuel container']) &&
      hasAny(['open', 'leaking', 'spill', 'near a floor drain', 'near floor drain', 'storm drain', 'release pathway'])
    ) {
      reasonCodes.push('priority-environmental-release-pathway');
      return { domain: 'environmental_release', mechanismId: 'release_to_drain_soil_or_water', reasonCodes };
    }

    if (
      hasAny(['welding', 'cutting', 'brazing', 'hot work']) &&
      hasAny(['combustible', 'flammable', 'no fire watch', 'without fire watch', 'ignition source'])
    ) {
      reasonCodes.push('priority-hot-work-ignition');
      return { domain: 'welding_cutting_hot_work', mechanismId: 'ignition_of_combustibles_or_vapors', reasonCodes };
    }

    if (
      hasAny(['emergency exit', 'exit route', 'emergency egress', 'escape route']) &&
      hasAny(['blocked', 'obstructed', 'stacked materials', 'not accessible'])
    ) {
      reasonCodes.push('priority-blocked-emergency-egress');
      return { domain: 'emergency_preparedness', mechanismId: 'delayed_or_prevented_evacuation', reasonCodes };
    }

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
      hasAny(['cold stress', 'cold exposure', 'hypothermia', 'frostbite', 'wind chill', 'freezing temperature', 'cold weather', 'cold work', 'freezing conditions', 'freezing', 'freezing rain']) &&
      hasAny(['worker', 'employee', 'exposure', 'outdoor', 'prolonged', 'glove', 'gloves', 'hands', 'feet', 'symptom', 'warming', 'warm up', 'wet clothing', 'cold injury'])
    ) {
      reasonCodes.push('medium-priority-cold-stress-environmental-exposure');
      return {
        domain: 'cold_stress',
        mechanismId: 'cold_stress',
        citation: 'OSHA/NIOSH Heat and Cold Stress Guidance',
        reasonCodes,
      } as any;
    }

    if (
     hasAny(['heat stress', 'heat illness', 'hot environment', 'wbgt', 'heat index', 'high temperature', 'radiant heat', 'dehydration', 'working in heat', 'hot', 'sweating', 'fatigue']) &&
     hasAny(['worker', 'employee', 'exposure', 'outdoor', 'hydration', 'shade', 'acclimatization', 'work rest', 'work-rest', 'symptom', 'cooling', 'water'])
    ) {
      reasonCodes.push('medium-priority-heat-stress-environmental-exposure');
      return {
        domain: 'heat_stress',
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
        domain: 'noise_exposure',
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
      ]) &&
      !value.includes('extension cord') &&
      !value.includes('flexible cord')
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
      hasAny(['defective', 'damaged', 'broken', 'frayed cord', 'damaged cord', 'cord insulation', 'missing ground pin', 'cracked', 'unsafe', 'tagged out', 'removed from service']) &&
      !value.includes('extension cord') &&
      !value.includes('flexible cord')
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

  private resolveCanonicalMechanism(
    domain: SafeScopeReasoningDomain,
    text: string,
  ): string | undefined {
    const value = normalized(text);
    const mechanisms: Partial<Record<SafeScopeReasoningDomain, string>> = {
      compressed_gas: 'cylinder_projectile_or_gas_release',
      hazardous_materials: 'unknown_substance_contact_or_inhalation',
      hazard_communication: 'unknown_substance_contact_or_inhalation',
      electrical: 'electrical_shock_or_arc_flash',
      machine_guarding: 'caught_in_entanglement_or_crushing',
      machine_guarding_loto: 'unexpected_startup_or_stored_energy_release',
      lockout_tagout: 'unexpected_startup_or_stored_energy_release',
      walking_working_surfaces: 'same_level_slip_trip_fall',
      slip_trip_fall: 'same_level_slip_trip_fall',
      slips_trips_falls: 'same_level_slip_trip_fall',
      fall_protection: 'fall_to_lower_level',
      mobile_equipment: 'struck_by_or_caught_between_mobile_equipment',
      powered_haulage: 'struck_by_or_caught_between_mobile_equipment',
      fire_protection: 'ignition_fire_or_explosion',
      welding_cutting_hot_work: 'ignition_of_combustibles_or_vapors',
      emergency_preparedness: 'delayed_or_prevented_evacuation',
      confined_space: 'atmospheric_asphyxiation_or_toxic_exposure',
      excavation_trenching: 'cave_in_crushing_or_engulfment',
      ppe: 'flying_particle_eye_or_face_injury',
      health_respiratory: 'respirable_dust_inhalation',
      noise_exposure: 'noise_induced_hearing_loss',
      heat_stress: 'heat_illness',
      cold_stress: 'cold_injury',
      ergonomics: 'musculoskeletal_overexertion_or_strain',
      cranes_rigging_hoisting: 'rigging_failure_or_dropped_load',
      dropped_objects: 'struck_by_falling_object',
      ground_control: 'fall_of_ground_or_material',
      roof_rib_control: 'fall_of_ground_or_material',
      water_drowning: 'fall_into_water_and_drowning',
      environmental_release: 'release_to_drain_soil_or_water',
    };

    if (domain === 'ppe' && !includesAny(value, ['grinding', 'cutting', 'chipping', 'flying particles', 'face shield', 'eye protection'])) {
      return 'inadequate_personal_protective_equipment';
    }
    return mechanisms[domain];
  }

}
