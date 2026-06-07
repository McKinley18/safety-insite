import { ConfidenceGovernanceService } from '../confidence-governance/confidence-governance.service';
import { CausalRiskService } from '../causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../evidence-sufficiency-core/evidence-sufficiency.service';
import { OutputPolicyService } from '../output-policy/output-policy.service';
import { DefensibleCorrectiveActionService } from '../defensible-corrective-action/dca.service';
import { HumanReviewLearningGovernanceService } from '../human-review-learning-governance/hrlg.service';
import { SourceBackedApplicabilityGovernanceService } from '../source-backed-applicability-governance/sbag.service';
import { ApprovedSourceKnowledgeIntakeGovernanceService } from '../approved-source-knowledge-intake-governance/approved-source-knowledge-intake-governance.service';
import { ApprovedKnowledgePromotionWorkflowGovernanceService } from '../approved-knowledge-promotion-workflow-governance/approved-knowledge-promotion-workflow-governance.service';
import { ApprovedKnowledgePromotionService } from '../approved-knowledge-promotion-v1/approved-knowledge-promotion-v1.service';
import { HazardInformationAbsorptionService } from '../hazard-information-absorption/hazard-information-absorption.service';
import { ApprovedKnowledgeRetrievalOutputV1Service } from '../approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { FieldOutputComposerV1Service } from '../field-output-composer-v1/field-output-composer-v1.service';
import { ApprovedKnowledgeRegistryWriteGuardService } from '../approved-knowledge-registry-write-guard/approved-knowledge-registry-write-guard.service';
import { LearningCandidateQueueService } from '../learning-candidate-queue/learning-candidate-queue.service';
import { GovernanceReportAdapterService } from '../governance-report-adapter/governance-report-adapter.service';
import { EvidenceQuestionGenerationService } from '../evidence-question-generation/evidence-question-generation.service';
import { CorrectiveActionControlMapService } from '../corrective-action-control-map/corrective-action-control-map.service';
import { ApprovedKnowledgeRegistryValidator } from '../approved-knowledge-registry/approved-knowledge-registry.validator';
import { ConfidenceIntelligenceService } from '../confidence/confidence-intelligence.service';

import { TrendIntelligenceService } from '../trend-intelligence/trend-intelligence.service';
import { OperationalReasoningService } from '../reasoning/operational-reasoning.service';
import { ControlIntelligenceService } from '../control-intelligence/control-intelligence.service';
import { DecisionExplainabilityService } from '../explainability/decision-explainability.service';
import { EvidenceQualityService } from '../evidence-quality/evidence-quality.service';
import { StandardsReasoningService } from '../standards-reasoning/standards-reasoning.service';
import { CorrelationIntelligenceService } from '../correlation-intelligence/correlation-intelligence.service';
import { EnergyTransferIntelligenceService } from '../energy-intelligence/energy-transfer-intelligence.service';
import { BarrierIntelligenceService } from '../barrier-intelligence/barrier-intelligence.service';
import { ActionEffectivenessService } from '../action-effectiveness/action-effectiveness.service';
import { EventSequenceService } from '../event-sequence/event-sequence.service';
import { OperationalStateService } from '../operational-state/operational-state.service';
import { HumanFactorsService } from '../human-factors/human-factors.service';
import { ContradictionIntelligenceService } from '../contradiction-intelligence/contradiction-intelligence.service';
import { CounterfactualIntelligenceService } from '../counterfactual-intelligence/counterfactual-intelligence.service';
import { SiteMemoryService } from '../site-memory/site-memory.service';
import { HazardGraphService } from '../hazard-graph/hazard-graph.service';
import { ExposurePathService } from '../exposure-path/exposure-path.service';
import { ConfidenceCalibrationService } from '../validation/confidence-calibration.service';
import { ReasoningDriftService } from '../validation/reasoning-drift.service';
import { WorkspaceLearningService } from '../learning/workspace-learning.service';
import { SafeScopeLearningMemoryService } from '../learning-memory/learning-memory.service';
import { SafeScopeLearningGovernanceService } from '../learning/learning-governance.service';
import { ConfinedSpaceIntelligenceService } from '../reference-intelligence/confined-space/confined-space-intelligence.service';
import { LotoIntelligenceService } from '../reference-intelligence/loto/loto-intelligence.service';
import { MobileEquipmentIntelligenceService } from '../reference-intelligence/mobile-equipment/mobile-equipment-intelligence.service';
import { TrenchingIntelligenceService } from '../reference-intelligence/trenching/trenching-intelligence.service';
import { ElectricalIntelligenceService } from '../reference-intelligence/electrical/electrical-intelligence.service';
import { LiftingRiggingIntelligenceService } from '../reference-intelligence/lifting-rigging/lifting-rigging-intelligence.service';
import { HazcomGhsIntelligenceService } from '../reference-intelligence/hazcom-ghs/hazcom-ghs-intelligence.service';
import { CrossDomainInteractionService } from '../reference-intelligence/cross-domain/cross-domain-interaction.service';
import { ApplicabilityIntelligenceService } from '../applicability/applicability-intelligence.service';
import { ScenarioIntelligenceService } from '../brain/scenario-intelligence/scenario-intelligence.service';
import { StandardFamilyMapperService } from '../brain/standard-family-mapper/standard-family-mapper.service';
import { CitationReviewBrainService } from '../brain/citation-review-brain/citation-review.service';
import { RiskReasoningBrainService } from '../brain/risk-reasoning/risk-reasoning.service';
import { ObservationContextService } from '../brain/observation-context/observation-context.service';
import { NarrativeGeneratorService } from '../brain/narrative-generator/narrative.service';
import { CalibrationMeta } from '../types/safescope-intelligence.types';
import { EvidenceGapQuestionGeneratorService } from '../brain/evidence-gap-question-generator/evidence-gap-question.service';
import { CorrectiveActionBrainService } from '../brain/corrective-action-brain/corrective-action.service';
import { ExecutiveJudgmentService } from '../executive-judgment/executive-judgment.service';
import { ObservationUnderstandingService } from '../understanding/observation-understanding.service';

export type SafeScopeIntelligenceOrchestratorInput = {
  fusedText: string;
  promotedPrimary: any;
  classifierResult: any;
  evidenceTexts?: string[];
  visualAttachments?: any[];
  expandedContext: any;
  primaryStandardsResult: any;
  generatedActions: any[];
  additionalHazards: any[];
  priorFindings?: any[];
  workspaceId?: string;
  standardsFeedback?: any[];
  correctiveActionOutcomes?: any[];
  supervisorValidations?: any[];
};

export class SafeScopeIntelligenceOrchestrator {
  private confidenceEngine = new ConfidenceIntelligenceService();
  private governanceEngine = new ConfidenceGovernanceService();
  private trendEngine = new TrendIntelligenceService();
  private reasoningEngine = new OperationalReasoningService();
  private controlEngine = new ControlIntelligenceService();
  private explainabilityEngine = new DecisionExplainabilityService();
  private evidenceQualityEngine = new EvidenceQualityService();
  private standardsReasoningEngine = new StandardsReasoningService();
  private correlationEngine = new CorrelationIntelligenceService();
  private energyEngine = new EnergyTransferIntelligenceService();
  private barrierEngine = new BarrierIntelligenceService();
  private actionEffectivenessEngine = new ActionEffectivenessService();
  private eventSequenceEngine = new EventSequenceService();
  private operationalStateEngine = new OperationalStateService();
  private humanFactorsEngine = new HumanFactorsService();
  private contradictionEngine = new ContradictionIntelligenceService();
  private counterfactualEngine = new CounterfactualIntelligenceService();
  private siteMemoryEngine = new SiteMemoryService();
  private hazardGraphEngine = new HazardGraphService();
  private exposurePathEngine = new ExposurePathService();
  private confidenceCalibrationEngine = new ConfidenceCalibrationService();
  private reasoningDriftEngine = new ReasoningDriftService();
  private workspaceLearningEngine = new WorkspaceLearningService();
  private learningMemoryEngine = new SafeScopeLearningMemoryService();
  private learningGovernanceEngine = new SafeScopeLearningGovernanceService();
  private confinedSpaceEngine = new ConfinedSpaceIntelligenceService();
  private lotoEngine = new LotoIntelligenceService();
  private mobileEquipmentEngine = new MobileEquipmentIntelligenceService();
  private trenchingEngine = new TrenchingIntelligenceService();
  private electricalEngine = new ElectricalIntelligenceService();
  private liftingRiggingEngine = new LiftingRiggingIntelligenceService();
  private hazcomGhsEngine = new HazcomGhsIntelligenceService();
  private crossDomainEngine = new CrossDomainInteractionService();
  private applicabilityEngine = new ApplicabilityIntelligenceService();
  private scenarioEngine = new ScenarioIntelligenceService();
  private standardMapper = new StandardFamilyMapperService();
  private citationReviewEngine = new CitationReviewBrainService();
  private riskEngine = new RiskReasoningBrainService();
  private observationContextEngine = new ObservationContextService();
  private observationUnderstandingEngine = new ObservationUnderstandingService();
  private narrativeEngine = new NarrativeGeneratorService();
  private questionGenerator = new EvidenceGapQuestionGeneratorService();
  private correctiveActionEngine = new CorrectiveActionBrainService();
  private causalRiskEngine = new CausalRiskService();
  private evidenceSufficiencyEngine = new EvidenceSufficiencyService();
  private outputPolicyEngine = new OutputPolicyService();
  private dcaEngine = new DefensibleCorrectiveActionService();
  private hrlgEngine = new HumanReviewLearningGovernanceService();
  private sbagEngine = new SourceBackedApplicabilityGovernanceService();
  private askigEngine = new ApprovedSourceKnowledgeIntakeGovernanceService();
  private akpwgEngine = new ApprovedKnowledgePromotionWorkflowGovernanceService();
  private akrwgEngine = new ApprovedKnowledgeRegistryWriteGuardService();
  private promotionEngine = new ApprovedKnowledgePromotionService();
  private absorptionEngine = new HazardInformationAbsorptionService();
  private retrievalEngine = new ApprovedKnowledgeRetrievalOutputV1Service();
  private composerEngine = new FieldOutputComposerV1Service();
  private lcqEngine = new LearningCandidateQueueService();
  private adapterEngine = new GovernanceReportAdapterService();
  private evgEngine = new EvidenceQuestionGenerationService();
  private controlMapEngine = new CorrectiveActionControlMapService();
  private executiveJudgmentEngine = new ExecutiveJudgmentService();

  async evaluate(input: SafeScopeIntelligenceOrchestratorInput) {
    const {
      fusedText,
      promotedPrimary,
      classifierResult,
      evidenceTexts,
      visualAttachments,
      expandedContext,
      primaryStandardsResult,
      generatedActions,
      additionalHazards,
      priorFindings,
      workspaceId,
      standardsFeedback,
      correctiveActionOutcomes,
      supervisorValidations,
    } = input;

    const observationContext = this.observationContextEngine.normalize(fusedText);
    const observationUnderstanding = this.observationUnderstandingEngine.evaluate(fusedText);
    const combined = `${fusedText} ${observationContext.normalizedText}`.toLowerCase();

    const photosAttached = (evidenceTexts || []).some((item) =>
      String(item).toLowerCase().includes('photo')
    );

    const confidenceIntelligence = this.confidenceEngine.evaluate({
      text: combined,
      classification: promotedPrimary.classification,
      classifierConfidence: promotedPrimary.confidence,
      evidenceTexts,
      evidenceTokens: promotedPrimary.evidenceTokens,
      ambiguityWarnings: [...(classifierResult.ambiguityWarnings || [])],
      expandedContext,
      suggestedStandards: primaryStandardsResult.suggestedStandards,
      photosAttached,
    });

    const operationalReasoning = this.reasoningEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      expandedContext,
      risk: promotedPrimary.risk,
    });

    const trendIntelligence = this.trendEngine.evaluate({
      classification: promotedPrimary.classification,
      location: (expandedContext as any)?.location || undefined,
      riskScore: promotedPrimary.risk?.riskScore,
      priorFindings,
    });

    const energyTransferIntelligence = this.energyEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      operationalReasoning,
      risk: promotedPrimary.risk,
    });

    const controlIntelligence = this.controlEngine.evaluate({
      classification: promotedPrimary.classification,
      risk: promotedPrimary.risk,
      generatedActions,
      suggestedStandards: primaryStandardsResult.suggestedStandards,
      trendIntelligence,
      operationalReasoning,
    });

    const barrierIntelligence = this.barrierEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      energyTransferIntelligence,
      controlIntelligence,
      operationalReasoning,
    });

    const eventSequence = this.eventSequenceEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      operationalReasoning,
      energyTransferIntelligence,
      barrierIntelligence,
    });

    const operationalState = this.operationalStateEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      eventSequence,
      energyTransferIntelligence,
    });

    const humanFactors = this.humanFactorsEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      operationalState,
      eventSequence,
      energyTransferIntelligence,
    });

    const contradictionIntelligence = this.contradictionEngine.evaluate({
      text: fusedText,
      operationalState,
      energyTransferIntelligence,
      barrierIntelligence,
      humanFactors,
    });

    const actionEffectiveness = this.actionEffectivenessEngine.evaluate({
      generatedActions,
      operationalReasoning,
      energyTransferIntelligence,
      barrierIntelligence,
      controlIntelligence,
    });

    const counterfactualIntelligence = this.counterfactualEngine.evaluate({
      classification: promotedPrimary.classification,
      operationalReasoning,
      energyTransferIntelligence,
      barrierIntelligence,
      controlIntelligence,
      actionEffectiveness,
    });

    const standardsReasoning = this.standardsReasoningEngine.evaluate({
      classification: promotedPrimary.classification,
      standards: primaryStandardsResult.suggestedStandards,
      operationalReasoning,
      expandedContext,
      risk: promotedPrimary.risk,
    });

    const hazardGraph = this.hazardGraphEngine.evaluate({
      classification: promotedPrimary.classification,
      additionalHazards,
      energyTransferIntelligence,
      humanFactors,
      operationalState,
      barrierIntelligence,
    });

    const exposurePathIntelligence = this.exposurePathEngine.evaluate({
      classification: promotedPrimary.classification,
      text: fusedText,
      operationalState,
      energyTransferIntelligence,
      humanFactors,
    });

    const correlationIntelligence = this.correlationEngine.evaluate({
      classification: promotedPrimary.classification,
      additionalHazards,
      trendIntelligence,
      controlIntelligence,
      operationalReasoning,
      priorFindings,
    });

    const siteMemory = this.siteMemoryEngine.evaluate({
      currentClassification: promotedPrimary.classification,
      currentLocation: (expandedContext as any)?.area || (expandedContext as any)?.location,
      priorFindings,
      trendIntelligence,
      correlationIntelligence,
    });

    const evidenceQuality = this.evidenceQualityEngine.evaluate({
      text: fusedText,
      evidenceTexts,
      photosAttached,
      operationalReasoning,
      confidenceIntelligence,
    });

    const applicabilityIntelligence = this.applicabilityEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      expandedContext,
      operationalReasoning,
      energyTransferIntelligence,
      barrierIntelligence,
      evidenceQuality,
      suggestedStandards: primaryStandardsResult.suggestedStandards,
      agencyMode: (expandedContext as any)?.agencyMode,
    });

    const scenarioIntelligence = this.scenarioEngine.evaluate({
      text: fusedText,
      classification: promotedPrimary.classification,
      operationalReasoning,
      risk: promotedPrimary.risk,
      suggestedStandards: primaryStandardsResult.suggestedStandards,
      evidenceGaps: evidenceQuality.gaps || [],
      confidence: confidenceIntelligence.overallConfidence || 0,
    });

    const standardFamilyCandidates = this.standardMapper.map(scenarioIntelligence);
    const citationLevelCandidates = this.citationReviewEngine.evaluate(scenarioIntelligence, evidenceQuality.gaps || []);
    const evidenceGapQuestions = this.questionGenerator.generate(scenarioIntelligence.scenarioFamilyId);
    
    const narrative = this.narrativeEngine.generate({
        scenarioIntelligence,
        evidenceGapQuestions
    } as any, 'professional');

    const correctiveActionReasoning = this.correctiveActionEngine.evaluate(
        scenarioIntelligence,
        evidenceQuality.gaps || []
    );

    const riskReasoning = this.riskEngine.evaluate(
        scenarioIntelligence,
        evidenceQuality.gaps || []
    );

    const causalRiskReasoning = await this.causalRiskEngine.analyzeCausalRisk(observationUnderstanding, fusedText);
    
    const evidenceSufficiency = await this.evidenceSufficiencyEngine.evaluateEvidenceSufficiency(
        observationUnderstanding,
        causalRiskReasoning,
        fusedText
    );

    const detectedJurisdiction = (observationContext.detectedJurisdictionSignals && observationContext.detectedJurisdictionSignals.length > 0) 
        ? observationContext.detectedJurisdictionSignals[0].toLowerCase()
        : 'unclear';
        
    let jurisdiction = 'unclear';
    if (detectedJurisdiction.includes('msha')) jurisdiction = 'msha';
    else if (detectedJurisdiction.includes('osha_construction')) jurisdiction = 'osha_construction';
    else if (detectedJurisdiction.includes('osha')) jurisdiction = 'osha_general_industry';

    const understandingTopScenario = observationUnderstanding.scenarioUnderstanding?.topScenario;
    const understandingTopMechanism = observationUnderstanding.mechanismCandidates?.[0];

    const understandingScenarioFamily =
      understandingTopScenario?.scenarioId && (understandingTopScenario as any).confidence >= 0.55
        ? understandingTopScenario.scenarioId
        : undefined;

    const scenarioSpecificMechanismOverrides = [
      'electrical_panel_access',
      'fire_extinguisher_access_inspection'
    ];

    const understandingScenarioMechanism =
      understandingTopScenario?.mechanism &&
      understandingTopScenario.mechanism !== 'unknown' &&
      (
        (understandingTopScenario as any).confidence >= 0.55 ||
        scenarioSpecificMechanismOverrides.includes(understandingTopScenario.scenarioId)
      )
        ? understandingTopScenario.mechanism
        : undefined;

    const understandingMechanism =
      understandingTopMechanism?.mechanism &&
      understandingTopMechanism.mechanism !== 'unknown' &&
      (understandingTopMechanism as any).confidence >= 0.7
        ? understandingTopMechanism.mechanism
        : undefined;

    const understandingHazardFamily =
      understandingTopScenario?.hazardFamily && (understandingTopScenario as any).confidence >= 0.55
        ? understandingTopScenario.hazardFamily
        : undefined;

    const understandingStandardFamily =
      understandingScenarioFamily === 'fall_protection_unprotected_edge' ? 'fall_protection' :
      understandingScenarioFamily === 'unexpected_startup_energy_isolation' ? 'lockout_tagout' :
      understandingScenarioFamily === 'chemical_label_sds_gap' ? 'hazard_communication' :
      understandingScenarioFamily === 'permit_required_confined_space_entry' ? 'confined_space' :
      understandingScenarioFamily === 'suspended_load_line_of_fire' ? 'cranes_rigging' :
      understandingScenarioFamily === 'pressurized_hose_failure' ? 'compressed_air_stored_energy' :
      undefined;

    const understandingRiskBand =
      understandingScenarioFamily === 'permit_required_confined_space_entry' ? 'critical' :
      understandingScenarioFamily === 'suspended_load_line_of_fire' ? 'critical' :
      understandingScenarioFamily === 'pressurized_hose_failure' ? 'high' :
      understandingScenarioFamily === 'fall_protection_unprotected_edge' ? 'high' :
      undefined;

    const calibrationMeta: CalibrationMeta = {
        hazardFamily: understandingHazardFamily || scenarioIntelligence.hazardCategory || 'unknown',
        scenarioFamily: understandingScenarioFamily || scenarioIntelligence.scenarioFamilyId,
        jurisdiction: jurisdiction,
        mechanism: understandingScenarioMechanism || understandingMechanism || scenarioIntelligence.mechanismOfInjury,
        riskBand: understandingRiskBand || riskReasoning.initialRiskLevel,
        standardFamily: understandingStandardFamily || scenarioIntelligence.candidateStandardFamily || 'unknown',
        evidenceGaps: [
          ...(scenarioIntelligence.evidenceGaps || []),
          ...(observationUnderstanding.evidenceGaps || [])
        ].filter((gap, index, all) => all.indexOf(gap) === index)
    };

    const confidenceGovernance = this.governanceEngine.govern({
      observationUnderstanding,
      causalRiskReasoning,
      evidenceSufficiency,
      scenarioIntelligence,
      riskReasoning,
      standardsReasoning,
      calibrationMeta,
      fusedText
    });

    const outputPolicy = await this.outputPolicyEngine.evaluateOutputPolicy(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      observationUnderstanding,
      calibrationMeta,
      fusedText
    );

    const dca = await this.dcaEngine.evaluateDCA(
        confidenceGovernance,
        evidenceSufficiency,
        causalRiskReasoning,
        observationUnderstanding,
        calibrationMeta,
        outputPolicy,
        fusedText
    );
    
    const hrlg = await this.hrlgEngine.evaluateHRLG(
        confidenceGovernance,
        evidenceSufficiency,
        causalRiskReasoning,
        dca,
        observationUnderstanding,
        calibrationMeta,
        outputPolicy
    );

    const sbag = await this.sbagEngine.evaluateApplicability(
        confidenceGovernance,
        evidenceSufficiency,
        causalRiskReasoning,
        dca,
        observationUnderstanding,
        calibrationMeta,
        outputPolicy,
        fusedText
    );
    
    const askig = await this.askigEngine.evaluateIntake(
        {},
        {
            observationUnderstanding,
            calibrationMeta
        }
    );
    
    const akpwg = await this.akpwgEngine.evaluatePromotion(askig);

    const akrwg = await this.akrwgEngine.evaluateWriteGuard(
        askig,
        akpwg,
        {},
        {},
        {}
    );
    
    const dummyRecord: any = {
        recordId: 'rec-1',
        version: '1.0.0',
        status: 'draft_candidate',
        authority: {
            agency: 'OSHA',
            authorityTier: 'primary_regulation',
            jurisdiction: 'osha_general_industry',
            sourceUrl: 'http://osha.gov',
            citation: '1910.147',
            title: 'LOTO',
            effectiveDate: '2026-01-01',
            revisionDate: '2026-01-01',
            sourceDateStatus: 'current'
        },
        mapping: {
            standardFamily: 'loto',
            hazardFamilies: ['energy'],
            mechanisms: ['unexpected_startup'],
            equipmentGroups: ['conveyor'],
            taskContexts: ['maintenance'],
            applicabilitySignals: ['energized'],
            requiredFacts: ['energy_source'],
            disqualifyingFacts: [],
            evidenceQuestions: ['Is energy isolated?']
        },
        applicability: {
            plainLanguageSummary: 'LOTO is required',
            appliesWhen: 'servicing',
            doesNotApplyWhen: 'normal operation',
            requiredReviewerChecks: ['LOTO check']
        },
        correctiveActionLinks: {
            preferredControlFamilies: ['isolation'],
            verificationMethods: ['zero energy check'],
            commonWeakActionsToAvoid: ['simple shutdown']
        },
        governance: {
            supersedesRecordIds: [],
            duplicateKeys: ['loto-1910.147'],
            advisoryOnly: true,
            doesNotDeclareViolation: true,
            doesNotCreateCitation: true,
            requiresQualifiedReview: true
        }
    };
    
    const promotion = await this.promotionEngine.promote(
        dummyRecord,
        {
            approvedBy: 'SafetyMgr',
            approvedAt: '2026-06-06',
            reviewerRole: 'Safety Manager',
            changeReason: 'Initial approval',
            sourceVerified: true,
            applicabilityVerified: true,
            guardrailsVerified: true,
            duplicateReviewCompleted: true
        }
    );
    
    const absorption = await this.absorptionEngine.absorb(
        fusedText,
        {}
    );
    
    const retrieval = await this.retrievalEngine.retrieve(
        fusedText,
        {
            visualAttachments,
            attachments: visualAttachments
        }
    );
    
    const composer = await this.composerEngine.compose(
        fusedText,
        {
            visualAttachments,
            attachments: visualAttachments
        }
    );
    
    const evg = this.evgEngine.generateQuestions(
        observationUnderstanding,
        {},
        {}
    );

    const controlMap = this.controlMapEngine.mapControls(
        'hazard',
        'mechanism',
        []
    );

    const lcq = this.lcqEngine.createCandidate(
        {},
        hrlg
    );

    const adapter = this.adapterEngine.adapt(
        outputPolicy,
        evidenceSufficiency,
        causalRiskReasoning,
        {}, // placeholder for applicability retrieval output
        evg,
        controlMap
    );

    const domainIntelligence = {
      confinedSpace: this.confinedSpaceEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
      loto: this.lotoEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
      mobileEquipment: this.mobileEquipmentEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
      trenching: this.trenchingEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
      electrical: this.electricalEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
      liftingRigging: this.liftingRiggingEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
      hazcomGhs: this.hazcomGhsEngine.evaluate({
        text: fusedText,
        classification: promotedPrimary.classification,
      }),
    };

    const crossDomainInteraction = this.crossDomainEngine.evaluate({
      domainIntelligence,
    });

    const workspaceLearning = this.workspaceLearningEngine.evaluate({
      workspaceId,
      classification: promotedPrimary.classification,
      priorFindings,
      standardsFeedback,
      correctiveActionOutcomes,
    });

    const confidenceCalibration = this.confidenceCalibrationEngine.evaluate({
      classification: promotedPrimary.classification,
      confidenceIntelligence,
      contradictionIntelligence,
      evidenceQuality,
      standardsReasoning,
      actionEffectiveness,
    });

    const learningGovernance = this.learningGovernanceEngine.evaluate({
      workspaceLearning,
      feedbackSignals: standardsFeedback,
      supervisorValidations,
      confidenceCalibration,
      nativeReasoning: undefined,
    });

    const reasoningDrift = this.reasoningDriftEngine.evaluate({
      classification: promotedPrimary.classification,
      confidenceCalibration,
      contradictionIntelligence,
      standardsReasoning,
      operationalReasoning,
      priorFindings,
    });

    const learningMemory = this.learningMemoryEngine.evaluate({
      classification: promotedPrimary.classification,
      workspaceLearning,
      learningGovernance,
      confidenceCalibration,
      reasoningDrift,
      priorFindings,
    });

    const decisionExplainability = this.explainabilityEngine.evaluate({
      classification: promotedPrimary.classification,
      confidenceIntelligence,
      risk: promotedPrimary.risk,
      suggestedStandards: primaryStandardsResult.suggestedStandards,
      operationalReasoning,
      trendIntelligence,
      controlIntelligence,
    });

    const executiveJudgment = this.executiveJudgmentEngine.evaluate({
      classification: promotedPrimary.classification,
      risk: promotedPrimary.risk,
      confidenceIntelligence,
      evidenceQuality,
      operationalReasoning,
      energyTransferIntelligence,
      barrierIntelligence,
      controlIntelligence,
      standardsReasoning,
      generatedActions,
      contradictionIntelligence,
      crossDomainInteraction,
      domainIntelligence,
    });

    return {
      intelligenceMetadata: {
        engineName: 'SafeScope Intelligence Orchestrator',
        engineVersion: '0.1.0',
        generatedAt: new Date().toISOString(),
        layersExecuted: [
          'observation_context',
          'observation_understanding',
          'scenario',
          'citation_level_review',
          'risk_reasoning',
          'evidence_gap_questions',
          'corrective_action',
          'confidence',
          'operational_reasoning',
          'trend',
          'energy_transfer',
          'evidence_quality',
          'control',
          'barrier',
          'event_sequence',
          'operational_state',
          'human_factors',
          'contradiction_detection',
          'action_effectiveness',
          'counterfactual',
          'standards_reasoning',
          'applicability_intelligence',
          'decision_explainability',
          'hazard_graph',
          'exposure_path',
          'correlation',
          'site_memory',
          'confidence_calibration',
          'reasoning_drift',
          'workspace_learning',
          'learning_governance',
          'learning_memory',
          'domain_intelligence',
          'cross_domain_interaction',
          'executive_judgment',
          'registry_schema_foundation',
        ],
      },
      observationContext,
      observationUnderstanding,
      narrative,
      domainIntelligence,
      scenarioIntelligence,
      riskReasoning,
      causalRiskReasoning,
      evidenceSufficiency,
      outputPolicy,
      dca,
      hrlg,
      sbag,
      askig,
      akpwg,
      akrwg,
      promotion,
      absorption,
      retrieval,
      composer,
      lcq,
      adapter,
      evg,
      controlMap,
      registryValidator: ApprovedKnowledgeRegistryValidator,
      confidenceGovernance,
      calibrationMeta,
      standardFamilyCandidates,
      citationLevelCandidates,
      evidenceGapQuestions,
      correctiveActionReasoning,
      crossDomainInteraction,
      workspaceLearning,
      learningGovernance,
      learningMemory,
      confidenceIntelligence,
      operationalReasoning,
      trendIntelligence,
      energyTransferIntelligence,
      evidenceQuality,
      controlIntelligence,
      barrierIntelligence,
      eventSequence,
      operationalState,
      humanFactors,
      contradictionIntelligence,
      actionEffectiveness,
      counterfactualIntelligence,
      standardsReasoning,
      applicabilityIntelligence,
      decisionExplainability,
      executiveJudgment,
      hazardGraph,
      exposurePathIntelligence,
      correlationIntelligence,
      siteMemory,
      confidenceCalibration,
      reasoningDrift,
    };
  }
}
