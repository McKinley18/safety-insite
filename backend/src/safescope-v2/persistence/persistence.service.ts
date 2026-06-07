import { Injectable, Optional, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { 
  SafeScopeAuditRecord, 
  AuditRecordFilter, 
  AuditRecordType 
} from './persistence.types';
import { SafeScopeAuditRecordEntity } from './audit-record.entity';
import { UserGovernanceContext } from '../workspace-governance-access/workspace-governance.types';

@Injectable()
export class SafeScopePersistenceService {
  private readonly useFileFallback = true; 
  private readonly dataPath = path.resolve(__dirname, '../../../../../safescope-data/persistence/audit_records.json');

  constructor(
    @Optional()
    @InjectRepository(SafeScopeAuditRecordEntity)
    private readonly repository?: Repository<SafeScopeAuditRecordEntity>,
  ) {
    if (this.useFileFallback) {
      this.ensureDirectory();
    }
  }

  private ensureDirectory() {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, JSON.stringify([], null, 2));
    }
  }

  private loadFromFile(): SafeScopeAuditRecord[] {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  private saveToFile(records: SafeScopeAuditRecord[]) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(records, null, 2));
    } catch (e) {
      console.error('Failed to save to file persistence:', e);
    }
  }

  async save(record: Omit<SafeScopeAuditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SafeScopeAuditRecord> {
    if (this.repository && !this.useFileFallback) {
      const entity = this.repository.create(record as any) as any;
      const saved = await this.repository.save(entity);
      return this.mapEntityToType(saved);
    }

    const records = this.loadFromFile();
    const newRecord: SafeScopeAuditRecord = {
      ...record,
      id: 'audit-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    this.saveToFile(records);
    return newRecord;
  }

  async find(filter: AuditRecordFilter, user?: UserGovernanceContext): Promise<SafeScopeAuditRecord[]> {
    if (user && filter.workspaceId && filter.workspaceId !== user.workspaceId) {
        throw new ForbiddenException('Cross-workspace access is blocked.');
    }
    const effectiveWorkspaceId = user?.workspaceId || filter.workspaceId;

    if (this.repository && !this.useFileFallback) {
      const query = this.repository.createQueryBuilder('record');
      if (filter.type) query.andWhere('record.type = :type', { type: filter.type });
      if (effectiveWorkspaceId) query.andWhere('record.workspaceId = :workspaceId', { workspaceId: effectiveWorkspaceId });
      if (filter.inspectionId) query.andWhere('record.inspectionId = :inspectionId', { inspectionId: filter.inspectionId });
      if (filter.observationId) query.andWhere('record.observationId = :observationId', { observationId: filter.observationId });
      if (filter.traceId) query.andWhere('record.traceId = :traceId', { traceId: filter.traceId });
      if (filter.status) query.andWhere('record.status = :status', { status: filter.status });
      
      const entities = await query.getMany();
      return entities.map(e => this.mapEntityToType(e));
    }

    let records = this.loadFromFile();
    return records.filter(r => {
      if (filter.type && r.type !== filter.type) return false;
      if (effectiveWorkspaceId && r.workspaceId !== effectiveWorkspaceId) return false;
      if (filter.inspectionId && r.inspectionId !== filter.inspectionId) return false;
      if (filter.observationId && r.observationId !== filter.observationId) return false;
      if (filter.traceId && r.traceId !== filter.traceId) return false;
      if (filter.status && r.status !== filter.status) return false;
      return true;
    });
  }

  async getById(id: string, user?: UserGovernanceContext): Promise<SafeScopeAuditRecord | undefined> {
    let record: SafeScopeAuditRecord | undefined;

    if (this.repository && !this.useFileFallback) {
      const entity = await this.repository.findOne({ where: { id } as any });
      record = entity ? this.mapEntityToType(entity) : undefined;
    } else {
      const records = this.loadFromFile();
      record = records.find(r => r.id === id);
    }

    if (record && user && record.workspaceId && record.workspaceId !== user.workspaceId) {
        throw new ForbiddenException('Cross-workspace access is blocked.');
    }
    return record;
  }

  async updateStatus(id: string, status: string, metadataUpdate: Record<string, any> = {}, user?: UserGovernanceContext): Promise<SafeScopeAuditRecord | undefined> {
    if (this.repository && !this.useFileFallback) {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (entity) {
        if (user && entity.workspaceId && entity.workspaceId !== user.workspaceId) {
            throw new ForbiddenException('Cross-workspace access is blocked.');
        }
        entity.status = status;
        entity.metadata = { ...entity.metadata, ...metadataUpdate };
        const saved = await this.repository.save(entity);
        return this.mapEntityToType(saved);
      }
      return undefined;
    }

    const records = this.loadFromFile();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      if (user && records[index].workspaceId && records[index].workspaceId !== user.workspaceId) {
          throw new ForbiddenException('Cross-workspace access is blocked.');
      }
      records[index].status = status;
      records[index].metadata = { ...records[index].metadata, ...metadataUpdate };
      records[index].updatedAt = new Date().toISOString();
      this.saveToFile(records);
      return records[index];
    }
    return undefined;
  }

  private mapEntityToType(entity: SafeScopeAuditRecordEntity): SafeScopeAuditRecord {
    return {
      id: entity.id,
      type: entity.type,
      workspaceId: entity.workspaceId,
      inspectionId: entity.inspectionId,
      observationId: entity.observationId,
      traceId: entity.traceId,
      actorId: entity.actorId,
      actorRole: entity.actorRole,
      status: entity.status,
      payload: entity.payload,
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
