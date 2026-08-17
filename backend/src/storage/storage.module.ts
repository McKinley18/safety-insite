import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { InspectionModule } from '../inspection/inspection.module';
import { FilesController } from './files.controller';
import { StorageObject } from './storage-object.entity';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageObject, SecurityAuditEvent]), InspectionModule],
  controllers: [FilesController],
  providers: [StorageService],
  exports: [StorageService, TypeOrmModule],
})
export class StorageModule {}
