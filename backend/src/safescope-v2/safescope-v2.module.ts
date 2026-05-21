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
import { SafeScopeKnowledgeModule } from "../safescope-knowledge/safescope-knowledge.module";
import { StandardsIntelligenceService } from "./standards-intelligence/standards-intelligence.service";
import { Standard } from "../standards/entities/standard.entity";

@Module({
  imports: [
    ActionEngineModule,
    ApplicableStandardsModule,
    SafeScopeKnowledgeModule,
    TypeOrmModule.forFeature([
      SafeScopeFeedback,
      SafeScopeReasoningSnapshot,
      SafeScopeSupervisorValidation,
      Standard,
    ]),
  ],
  controllers: [
    SafescopeV2Controller,
    SafeScopeFeedbackController,
    ReasoningSnapshotController,
    SupervisorValidationController,
  ],
  providers: [
    SafescopeV2Service,
    StandardsIntelligenceService,
    ContextExpansionService,
    EvidenceFusionService,
    SafeScopeFeedbackService,
    ReasoningSnapshotService,
    SupervisorValidationService,
  ],
})
export class SafescopeV2Module {}
