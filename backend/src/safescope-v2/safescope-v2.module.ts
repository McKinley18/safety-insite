import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SafescopeV2Service } from "./safescope-v2.service";
import { SafescopeV2Controller } from "./safescope-v2.controller";
import { ActionEngineModule } from "../action-engine/action-engine.module";
import { ApplicableStandardsModule } from "../applicable-standards/applicable-standards.module";
import { ContextExpansionService } from "./context/context-expansion.service";
import { EvidenceFusionService } from "./evidence/evidence-fusion.service";
import { SafeScopeFeedback } from "./feedback/safescope-feedback.entity";
import { SafeScopeFeedbackService } from "./feedback/safescope-feedback.service";
import { SafeScopeFeedbackController } from "./feedback/safescope-feedback.controller";
import { SafeScopeReasoningSnapshot } from "./snapshots/reasoning-snapshot.entity";
import { ReasoningSnapshotService } from "./snapshots/reasoning-snapshot.service";
import { ReasoningSnapshotController } from "./snapshots/reasoning-snapshot.controller";
import { SafeScopeSupervisorValidation } from "./validation/supervisor-validation.entity";
import { SupervisorValidationService } from "./validation/supervisor-validation.service";
import { SupervisorValidationController } from "./validation/supervisor-validation.controller";
import { SafeScopeAuditRecordEntity } from "./persistence/audit-record.entity";
import { SafeScopePersistenceService } from "./persistence/persistence.service";
import { SafeScopePersistenceController } from "./persistence/persistence.controller";
import { CryptographicAuditService } from "./persistence/cryptographic-audit.service";
import { SafeScopeKnowledgeModule } from "../safescope-knowledge/safescope-knowledge.module";
import { StandardsIntelligenceService } from "./standards-intelligence/standards-intelligence.service";
import { Standard } from "../standards/entities/standard.entity";

// SafeScope v2 Core Services
import { HazardTaxonomyCoverageService } from "./hazard-taxonomy-coverage/hazard-taxonomy-coverage.service";
import { ApprovedKnowledgeRegistrySearchService } from "./approved-knowledge-registry/approved-knowledge-registry-search.service";
import { ScenarioExpansionService } from "./scenario-expansion/scenario-expansion.service";
import { ScenarioEvaluationService } from "./scenario-evaluation/scenario-evaluation.service";
import { FieldEvidenceWeightingService } from "./field-evidence-weighting/field-evidence-weighting.service";
import { MultiHazardDecompositionService } from "./multi-hazard-decomposition/multi-hazard-decomposition.service";
import { ObservationNarrativeSynthesisService } from "./observation-narrative-synthesis/observation-narrative-synthesis.service";
import { CrossDomainCausalChainService } from "./cross-domain-causal-chain/cross-domain-causal-chain.service";
import { CorrectiveActionStrategyRankingService } from "./corrective-action-strategy-ranking/corrective-action-strategy-ranking.service";
import { RiskVerificationResidualRiskService } from "./risk-verification-residual-risk/risk-verification-residual-risk.service";
import { HumanReviewFeedbackLoopService } from "./human-review-feedback-loop/human-review-feedback-loop.service";
import { SourceFreshnessGovernanceService } from "./source-freshness-governance/source-freshness-governance.service";
import { JurisdictionApplicabilityDecisionTreeService } from "./jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.service";
import { AuditReadyReasoningTraceService } from "./audit-ready-reasoning-trace/audit-ready-reasoning-trace.service";
import { SemanticSynonymExpansionService } from "./semantic-synonym-expansion/semantic-synonym-expansion.service";
import { SemanticVectorSearchService } from "./semantic-vector-search/semantic-vector-search.service";
import { VisualEvidenceReasoningService } from "./visual-evidence-reasoning/visual-evidence-reasoning.service";
import { RealImageAnalysisService } from "./real-image-analysis/real-image-analysis.service";
import { ApprovedKnowledgeRetrievalOutputV1Service } from "./approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service";

// SafeScope v2 Management Services
import { ReviewerCandidateConsoleService } from "./reviewer-candidate-console/reviewer-candidate-console.service";
import { ReviewerCandidateConsoleController } from "./reviewer-candidate-console/reviewer-candidate-console.controller";
import { SourceIngestionApprovedUpdateWorkflowService } from "./source-ingestion-approved-update-workflow/source-ingestion-approved-update-workflow.service";
import { RoleBasedApprovalGatesService } from "./role-based-approval-gates/role-based-approval-gates.service";
import { WorkspaceGovernanceAccessService } from "./workspace-governance-access/workspace-governance-access.service";
import { OfflineReasoningMobileResilienceService } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service";
import { RegulatoryCrawlerService } from "./regulatory-crawler/regulatory-crawler.service";

// SafeScope Intelligence Orchestrator and dependencies
import { SafeScopeIntelligenceOrchestrator } from "./orchestration/intelligence-orchestrator.service";
import { ConfidenceIntelligenceService } from "./confidence/confidence-intelligence.service";
import { ConfidenceGovernanceService } from "./confidence-governance/confidence-governance.service";
import { TrendIntelligenceService } from "./trend-intelligence/trend-intelligence.service";
import { OperationalReasoningService } from "./reasoning/operational-reasoning.service";
import { MultidisciplinaryExpertService } from "./multidisciplinary-expert/multidisciplinary-expert.service";
import { ControlIntelligenceService } from "./control-intelligence/control-intelligence.service";
import { DecisionExplainabilityService } from "./explainability/decision-explainability.service";
import { EvidenceQualityService } from "./evidence-quality/evidence-quality.service";
import { StandardsReasoningService } from "./standards-reasoning/standards-reasoning.service";
import { CorrelationIntelligenceService } from "./correlation-intelligence/correlation-intelligence.service";
import { EnergyTransferIntelligenceService } from "./energy-intelligence/energy-transfer-intelligence.service";
import { BarrierIntelligenceService } from "./barrier-intelligence/barrier-intelligence.service";
import { ActionEffectivenessService } from "./action-effectiveness/action-effectiveness.service";
import { EventSequenceService } from "./event-sequence/event-sequence.service";
import { OperationalStateService } from "./operational-state/operational-state.service";
import { HumanFactorsService } from "./human-factors/human-factors.service";
import { ContradictionIntelligenceService } from "./contradiction-intelligence/contradiction-intelligence.service";
import { CounterfactualIntelligenceService } from "./counterfactual-intelligence/counterfactual-intelligence.service";
import { SiteMemoryService } from "./site-memory/site-memory.service";
import { HazardGraphService } from "./hazard-graph/hazard-graph.service";
import { ExposurePathService } from "./exposure-path/exposure-path.service";
import { ConfidenceCalibrationService } from "./validation/confidence-calibration.service";
import { ReasoningDriftService } from "./validation/reasoning-drift.service";
import { WorkspaceLearningService } from "./learning/workspace-learning.service";
import { SafeScopeLearningMemoryService } from "./learning-memory/learning-memory.service";
import { SafeScopeLearningGovernanceService } from "./learning/learning-governance.service";
import { ConfinedSpaceIntelligenceService } from "./reference-intelligence/confined-space/confined-space-intelligence.service";
import { LotoIntelligenceService } from "./reference-intelligence/loto/loto-intelligence.service";
import { MobileEquipmentIntelligenceService } from "./reference-intelligence/mobile-equipment/mobile-equipment-intelligence.service";
import { TrenchingIntelligenceService } from "./reference-intelligence/trenching/trenching-intelligence.service";
import { ElectricalIntelligenceService } from "./reference-intelligence/electrical/electrical-intelligence.service";
import { LiftingRiggingIntelligenceService } from "./reference-intelligence/lifting-rigging/lifting-rigging-intelligence.service";
import { HazcomGhsIntelligenceService } from "./reference-intelligence/hazcom-ghs/hazcom-ghs-intelligence.service";
import { CrossDomainInteractionService } from "./reference-intelligence/cross-domain/cross-domain-interaction.service";
import { ApplicabilityIntelligenceService } from "./applicability/applicability-intelligence.service";
import { ScenarioIntelligenceService } from "./brain/scenario-intelligence/scenario-intelligence.service";
import { StandardFamilyMapperService } from "./brain/standard-family-mapper/standard-family-mapper.service";
import { CitationReviewBrainService } from "./brain/citation-review-brain/citation-review.service";
import { RiskReasoningBrainService } from "./brain/risk-reasoning/risk-reasoning.service";
import { ObservationContextService } from "./brain/observation-context/observation-context.service";
import { ObservationUnderstandingService } from "./understanding/observation-understanding.service";
import { NarrativeGeneratorService } from "./brain/narrative-generator/narrative.service";
import { EvidenceGapQuestionGeneratorService } from "./brain/evidence-gap-question-generator/evidence-gap-question.service";
import { CorrectiveActionBrainService } from "./brain/corrective-action-brain/corrective-action.service";
import { CausalRiskService } from "./causal-risk/causal-risk.service";
import { EvidenceSufficiencyService } from "./evidence-sufficiency-core/evidence-sufficiency.service";
import { OutputPolicyService } from "./output-policy/output-policy.service";
import { DefensibleCorrectiveActionService } from "./defensible-corrective-action/dca.service";
import { HumanReviewLearningGovernanceService } from "./human-review-learning-governance/hrlg.service";
import { SourceBackedApplicabilityGovernanceService } from "./source-backed-applicability-governance/sbag.service";
import { ApprovedSourceKnowledgeIntakeGovernanceService } from "./approved-source-knowledge-intake-governance/approved-source-knowledge-intake-governance.service";
import { ApprovedKnowledgePromotionWorkflowGovernanceService } from "./approved-knowledge-promotion-workflow-governance/approved-knowledge-promotion-workflow-governance.service";
import { ApprovedKnowledgeRegistryWriteGuardService } from "./approved-knowledge-registry-write-guard/approved-knowledge-registry-write-guard.service";
import { ApprovedKnowledgePromotionService } from "./approved-knowledge-promotion-v1/approved-knowledge-promotion-v1.service";
import { HazardInformationAbsorptionService } from "./hazard-information-absorption/hazard-information-absorption.service";
import { FieldOutputComposerV1Service } from "./field-output-composer-v1/field-output-composer-v1.service";
import { LearningCandidateQueueService } from "./learning-candidate-queue/learning-candidate-queue.service";
import { GovernanceReportAdapterService } from "./governance-report-adapter/governance-report-adapter.service";
import { EvidenceQuestionGenerationService } from "./evidence-question-generation/evidence-question-generation.service";
import { CorrectiveActionControlMapService } from "./corrective-action-control-map/corrective-action-control-map.service";
import { ExecutiveJudgmentService } from "./executive-judgment/executive-judgment.service";

@Module({
  imports: [
    ActionEngineModule,
    ApplicableStandardsModule,
    SafeScopeKnowledgeModule,
    TypeOrmModule.forFeature([
      SafeScopeFeedback,
      SafeScopeReasoningSnapshot,
      SafeScopeSupervisorValidation,
      SafeScopeAuditRecordEntity,
      Standard,
    ]),
  ],
  controllers: [
    SafescopeV2Controller,
    SafeScopeFeedbackController,
    ReasoningSnapshotController,
    SupervisorValidationController,
    ReviewerCandidateConsoleController,
    SafeScopePersistenceController,
  ],
  providers: [
    SafescopeV2Service,
    StandardsIntelligenceService,
    ContextExpansionService,
    EvidenceFusionService,
    SafeScopeFeedbackService,
    ReasoningSnapshotService,
    SupervisorValidationService,
    ReviewerCandidateConsoleService,
    SafeScopePersistenceService,
    CryptographicAuditService,
    HazardTaxonomyCoverageService,
    ApprovedKnowledgeRegistrySearchService,
    ScenarioExpansionService,
    ScenarioEvaluationService,
    FieldEvidenceWeightingService,
    MultiHazardDecompositionService,
    ObservationNarrativeSynthesisService,
    CrossDomainCausalChainService,
    CorrectiveActionStrategyRankingService,
    RiskVerificationResidualRiskService,
    HumanReviewFeedbackLoopService,
    SourceFreshnessGovernanceService,
    JurisdictionApplicabilityDecisionTreeService,
    AuditReadyReasoningTraceService,
    SemanticSynonymExpansionService,
    SemanticVectorSearchService,
    VisualEvidenceReasoningService,
    RealImageAnalysisService,
    ApprovedKnowledgeRetrievalOutputV1Service,
    SourceIngestionApprovedUpdateWorkflowService,
    RoleBasedApprovalGatesService,
    WorkspaceGovernanceAccessService,
    OfflineReasoningMobileResilienceService,
    RegulatoryCrawlerService,
    SafeScopeIntelligenceOrchestrator,
    ConfidenceIntelligenceService,
    ConfidenceGovernanceService,
    TrendIntelligenceService,
    OperationalReasoningService,
    MultidisciplinaryExpertService,
    ControlIntelligenceService,
    DecisionExplainabilityService,
    EvidenceQualityService,
    StandardsReasoningService,
    CorrelationIntelligenceService,
    EnergyTransferIntelligenceService,
    BarrierIntelligenceService,
    ActionEffectivenessService,
    EventSequenceService,
    OperationalStateService,
    HumanFactorsService,
    ContradictionIntelligenceService,
    CounterfactualIntelligenceService,
    SiteMemoryService,
    HazardGraphService,
    ExposurePathService,
    ConfidenceCalibrationService,
    ReasoningDriftService,
    WorkspaceLearningService,
    SafeScopeLearningMemoryService,
    SafeScopeLearningGovernanceService,
    ConfinedSpaceIntelligenceService,
    LotoIntelligenceService,
    MobileEquipmentIntelligenceService,
    TrenchingIntelligenceService,
    ElectricalIntelligenceService,
    LiftingRiggingIntelligenceService,
    HazcomGhsIntelligenceService,
    CrossDomainInteractionService,
    ApplicabilityIntelligenceService,
    ScenarioIntelligenceService,
    StandardFamilyMapperService,
    CitationReviewBrainService,
    RiskReasoningBrainService,
    ObservationContextService,
    ObservationUnderstandingService,
    NarrativeGeneratorService,
    EvidenceGapQuestionGeneratorService,
    CorrectiveActionBrainService,
    CausalRiskService,
    EvidenceSufficiencyService,
    OutputPolicyService,
    DefensibleCorrectiveActionService,
    HumanReviewLearningGovernanceService,
    SourceBackedApplicabilityGovernanceService,
    ApprovedSourceKnowledgeIntakeGovernanceService,
    ApprovedKnowledgePromotionWorkflowGovernanceService,
    ApprovedKnowledgeRegistryWriteGuardService,
    ApprovedKnowledgePromotionService,
    HazardInformationAbsorptionService,
    FieldOutputComposerV1Service,
    LearningCandidateQueueService,
    GovernanceReportAdapterService,
    EvidenceQuestionGenerationService,
    CorrectiveActionControlMapService,
    ExecutiveJudgmentService,
  ],
})
export class SafescopeV2Module {}
