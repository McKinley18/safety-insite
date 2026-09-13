import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Standard } from "../standards/entities/standard.entity";
import { CorrectiveActionTemplate } from "../standards/entities/corrective-action-template.entity";
import { RegulatorySection } from "../regulatory/entities/regulatory-section.entity";
import { HazLenzKnowledgeChunk } from "../hazlenz-knowledge/entities/hazlenz-knowledge-chunk.entity";
import { HazLenzKnowledgeDocument } from "../hazlenz-knowledge/entities/hazlenz-knowledge-document.entity";
import { ApplicableStandardsController } from "./applicable-standards.controller";
import { ApplicableStandardsService } from "./applicable-standards.service";
import { HazLenzKnowledgeShardService } from "../safescope-v2/knowledge-shards/hazlenz-knowledge-shard.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Standard,
      CorrectiveActionTemplate,
      RegulatorySection,
      HazLenzKnowledgeChunk,
      HazLenzKnowledgeDocument,
    ]),
  ],
  controllers: [ApplicableStandardsController],
  providers: [ApplicableStandardsService, HazLenzKnowledgeShardService],
  exports: [ApplicableStandardsService, HazLenzKnowledgeShardService],
})
export class ApplicableStandardsModule {}
