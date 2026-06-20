import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SafescopeV2Service } from "./safescope-v2.service";
import { SafescopeV2Controller } from "./safescope-v2.controller";
import { ActionEngineModule } from "../action-engine/action-engine.module";
import { ApplicableStandardsModule } from "../applicable-standards/applicable-standards.module";
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
import { SafeScopeKnowledgeModule } from "../safescope-knowledge/safescope-knowledge.module";
import { Standard } from "../standards/entities/standard.entity";
import { HazLenzKnowledgeIndexService } from "./knowledge-index/hazlenz-knowledge-index.service";
import { HazLenzKnowledgeRouterService } from "./knowledge-router/hazlenz-knowledge-router.service";
import { HazLenzKnowledgeShardService } from "./knowledge-shards/hazlenz-knowledge-shard.service";
import { ReviewCoreKnowledgeReviewQueueModule } from "./knowledge-architecture/reviewcore-knowledge-review-queue.module";
import { ReviewerCandidateConsoleService } from "./reviewer-candidate-console/reviewer-candidate-console.service";
import { ReviewerCandidateConsoleController } from "./reviewer-candidate-console/reviewer-candidate-console.controller";
import { RoleBasedApprovalGatesService } from "./role-based-approval-gates/role-based-approval-gates.service";
import { WorkspaceGovernanceAccessService } from "./workspace-governance-access/workspace-governance-access.service";
import { OfflineReasoningMobileResilienceService } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service";
import { VisualEvidenceReasoningService } from "./visual-evidence-reasoning/visual-evidence-reasoning.service";
import { RealImageAnalysisService } from "./real-image-analysis/real-image-analysis.service";

@Module({
  imports: [
    ActionEngineModule,
    ApplicableStandardsModule,
    SafeScopeKnowledgeModule,
    ReviewCoreKnowledgeReviewQueueModule,
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
    EvidenceFusionService,
    SafeScopeFeedbackService,
    ReasoningSnapshotService,
    SupervisorValidationService,
    ReviewerCandidateConsoleService,
    SafeScopePersistenceService,
    HazLenzKnowledgeShardService,
    HazLenzKnowledgeRouterService,
    HazLenzKnowledgeIndexService,
    WorkspaceGovernanceAccessService,
    RoleBasedApprovalGatesService,
    VisualEvidenceReasoningService,
    RealImageAnalysisService,
    OfflineReasoningMobileResilienceService,
  ],
})
export class SafescopeV2Module {}
