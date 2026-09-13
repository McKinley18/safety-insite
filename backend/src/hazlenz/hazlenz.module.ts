import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HazLenzService } from "./hazlenz.service";
import { HazLenzController } from "./hazlenz.controller";
import { ActionEngineModule } from "../action-engine/action-engine.module";
import { ApplicableStandardsModule } from "../applicable-standards/applicable-standards.module";
import { EvidenceFusionService } from "./evidence/evidence-fusion.service";
import { HazLenzFeedback } from "./feedback/hazlenz-feedback.entity";
import { HazLenzFeedbackService } from "./feedback/hazlenz-feedback.service";
import { HazLenzFeedbackController } from "./feedback/hazlenz-feedback.controller";
import { HazLenzReasoningSnapshot } from "./snapshots/reasoning-snapshot.entity";
import { ReasoningSnapshotService } from "./snapshots/reasoning-snapshot.service";
import { ReasoningSnapshotController } from "./snapshots/reasoning-snapshot.controller";
import { HazLenzSupervisorValidation } from "./validation/supervisor-validation.entity";
import { SupervisorValidationService } from "./validation/supervisor-validation.service";
import { SupervisorValidationController } from "./validation/supervisor-validation.controller";
import { HazLenzAuditRecordEntity } from "./persistence/audit-record.entity";
import { HazLenzPersistenceService } from "./persistence/persistence.service";
import { HazLenzPersistenceController } from "./persistence/persistence.controller";
import { HazLenzKnowledgeModule } from "../hazlenz-knowledge/hazlenz-knowledge.module";
import { Standard } from "../standards/entities/standard.entity";
import { HazLenzKnowledgeIndexService } from "./knowledge-index/hazlenz-knowledge-index.service";
import { HazLenzKnowledgeRouterService } from "./knowledge-router/hazlenz-knowledge-router.service";
import { HazLenzKnowledgeShardService } from "./knowledge-shards/hazlenz-knowledge-shard.service";
import { KnowledgeReviewQueueModule } from "./knowledge-architecture/knowledge-review-queue.module";
import { ReviewerCandidateConsoleService } from "./reviewer-candidate-console/reviewer-candidate-console.service";
import { ReviewerCandidateConsoleController } from "./reviewer-candidate-console/reviewer-candidate-console.controller";
import { RoleBasedApprovalGatesService } from "./role-based-approval-gates/role-based-approval-gates.service";
import { WorkspaceGovernanceAccessService } from "./workspace-governance-access/workspace-governance-access.service";
import { OfflineReasoningMobileResilienceService } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service";
import { VisualEvidenceReasoningService } from "./visual-evidence-reasoning/visual-evidence-reasoning.service";
import { RealImageAnalysisService } from "./real-image-analysis/real-image-analysis.service";
import { InspectionModule } from "../inspection/inspection.module";

@Module({
  imports: [
    ActionEngineModule,
    ApplicableStandardsModule,
    // Lets the classify endpoint resolve a persisted inspection's regulatory context
    // authoritatively (InspectionModule does not import this module -- no cycle).
    InspectionModule,
    HazLenzKnowledgeModule,
    KnowledgeReviewQueueModule,
    TypeOrmModule.forFeature([
      HazLenzFeedback,
      HazLenzReasoningSnapshot,
      HazLenzSupervisorValidation,
      HazLenzAuditRecordEntity,
      Standard,
    ]),
  ],
  controllers: [
    HazLenzController,
    HazLenzFeedbackController,
    ReasoningSnapshotController,
    SupervisorValidationController,
    ReviewerCandidateConsoleController,
    HazLenzPersistenceController,
  ],
  providers: [
    HazLenzService,
    EvidenceFusionService,
    HazLenzFeedbackService,
    ReasoningSnapshotService,
    SupervisorValidationService,
    ReviewerCandidateConsoleService,
    HazLenzPersistenceService,
    HazLenzKnowledgeShardService,
    HazLenzKnowledgeRouterService,
    HazLenzKnowledgeIndexService,
    WorkspaceGovernanceAccessService,
    RoleBasedApprovalGatesService,
    VisualEvidenceReasoningService,
    RealImageAnalysisService,
    OfflineReasoningMobileResilienceService,
  ],
  // §262. Exported so the authoritative Expert execution path can run the DETERMINISTIC analysis
  // server-side rather than receiving one in a request body. Exporting the service does not export
  // the route: the classify endpoint's guard profile is unaffected, and the Expert route carries
  // that same profile independently.
  exports: [HazLenzService],
})
export class HazLenzModule {}
