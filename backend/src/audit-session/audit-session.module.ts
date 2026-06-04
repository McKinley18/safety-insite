import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditSessionController } from './audit-session.controller';
import { AuditSessionService } from './audit-session.service';
import { AuditAnalysisService } from './audit-analysis.service';
import { AuditSession } from './audit-session.entity';
import { AuditEntry } from './audit-entry.entity';
import { AuditEntryAttachment } from './entities/audit-entry-attachment.entity';
import { AuditEntryFinding } from './entities/audit-entry-finding.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditSession,
      AuditEntry,
      AuditEntryAttachment,
      AuditEntryFinding,
    ]),
  ],
  controllers: [AuditSessionController],
  providers: [AuditSessionService, AuditAnalysisService],
  exports: [AuditSessionService],
})
export class AuditSessionModule {}
