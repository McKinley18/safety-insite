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
import { CryptographicAuditService } from './cryptographic-audit.service';

@Injectable()
export class SafeScopePersistenceService {
  private readonly persistenceMode: 'file' | 'database';
  private auditTableReady?: Promise<void>;
  private readonly dataPath = path.resolve(__dirname, '../../../../../safescope-data/persistence/audit_records.json');
  private readonly cryptoSigner = new CryptographicAuditService();

  constructor(
    @Optional()
    @InjectRepository(SafeScopeAuditRecordEntity)
    private readonly repository?: Repository<SafeScopeAuditRecordEntity>,
  ) {
    const envMode = process.env.SAFE_SCOPE_PERSISTENCE_MODE;
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
    
    this.persistenceMode = (envMode as any) || (isProduction ? 'database' : 'file');

    if (this.persistenceMode === 'file') {
      this.ensureDirectory();
    } else if (this.persistenceMode === 'database' && !this.repository) {
        // In staging/production, we must not silently fall back if DB is the target but unavailable
        console.error('FATAL: SafeScope persistence configured for database but repository is unavailable.');
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

  private isMissingAuditTableError(error: any): boolean {
    return (
      error?.code === '42P01' ||
      error?.driverError?.code === '42P01' ||
      String(error?.message || '').includes('safescope_audit_records')
    );
  }

  private async ensureDatabaseAuditTable(): Promise<void> {
    if (!this.repository || this.persistenceMode !== 'database') {
      return;
    }

    if (!this.auditTableReady) {
      this.auditTableReady = (async () => {
        try {
          await this.repository!.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        } catch (error) {
          console.warn('[SafeScope persistence] pgcrypto extension could not be ensured; continuing with database UUID support.', error);
        }

        await this.repository!.query(`
          CREATE TABLE IF NOT EXISTS "safescope_audit_records" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "type" varchar(50) NOT NULL,
            "workspaceId" varchar NULL,
            "inspectionId" varchar NULL,
            "observationId" varchar NULL,
            "traceId" varchar NULL,
            "actorId" varchar NULL,
            "actorRole" varchar NULL,
            "status" varchar NOT NULL DEFAULT 'active',
            "payload" jsonb NOT NULL,
            "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
            "createdAt" timestamp NOT NULL DEFAULT now(),
            "updatedAt" timestamp NOT NULL DEFAULT now()
          )
        `);

        await this.repository!.query('CREATE INDEX IF NOT EXISTS "idx_safescope_audit_records_type_status" ON "safescope_audit_records" ("type", "status")');
        await this.repository!.query('CREATE INDEX IF NOT EXISTS "idx_safescope_audit_records_workspace" ON "safescope_audit_records" ("workspaceId")');
        await this.repository!.query('CREATE INDEX IF NOT EXISTS "idx_safescope_audit_records_trace" ON "safescope_audit_records" ("traceId")');
      })();
    }

    return this.auditTableReady;
  }


  async save(record: Omit<SafeScopeAuditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SafeScopeAuditRecord> {
    if (this.repository && this.persistenceMode === 'database') {
      await this.ensureDatabaseAuditTable();
      const entity = this.repository.create(record as any) as any;
      const saved = await this.repository.save(entity);
      const mapped = this.mapEntityToType(saved);
      
      // Cryptographically sign the record
      this.cryptoSigner.signRecord(mapped);
      
      // Update entity with signature metadata
      entity.metadata = mapped.metadata;
      await this.repository.save(entity);
      
      return mapped;
    }

    const records = this.loadFromFile();
    const newRecord: SafeScopeAuditRecord = {
      ...record,
      id: 'audit-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Cryptographically sign before writing to file
    this.cryptoSigner.signRecord(newRecord);

    records.push(newRecord);
    this.saveToFile(records);
    return newRecord;
  }

  async find(filter: AuditRecordFilter, user?: UserGovernanceContext): Promise<SafeScopeAuditRecord[]> {
    if (user && filter.workspaceId && filter.workspaceId !== user.workspaceId) {
        throw new ForbiddenException('Cross-workspace access is blocked.');
    }
    const effectiveWorkspaceId = user?.workspaceId || filter.workspaceId;

    let results: SafeScopeAuditRecord[] = [];

    if (this.repository && this.persistenceMode === 'database') {
      try {
        await this.ensureDatabaseAuditTable();

        const query = this.repository.createQueryBuilder('record');
        if (filter.type) query.andWhere('record.type = :type', { type: filter.type });
        if (effectiveWorkspaceId) query.andWhere('record.workspaceId = :workspaceId', { workspaceId: effectiveWorkspaceId });
        if (filter.inspectionId) query.andWhere('record.inspectionId = :inspectionId', { inspectionId: filter.inspectionId });
        if (filter.observationId) query.andWhere('record.observationId = :observationId', { observationId: filter.observationId });
        if (filter.traceId) query.andWhere('record.traceId = :traceId', { traceId: filter.traceId });
        if (filter.status) query.andWhere('record.status = :status', { status: filter.status });
        
        const entities = await query.getMany();
        results = entities.map(e => this.mapEntityToType(e));
      } catch (error) {
        if (this.isMissingAuditTableError(error)) {
          console.warn('[SafeScope persistence] audit table missing or unavailable; returning empty optional audit records.', error);
          results = [];
        } else {
          throw error;
        }
      }
    } else {
      let records = this.loadFromFile();
      results = records.filter(r => {
        if (filter.type && r.type !== filter.type) return false;
        if (effectiveWorkspaceId && r.workspaceId !== effectiveWorkspaceId) return false;
        if (filter.inspectionId && r.inspectionId !== filter.inspectionId) return false;
        if (filter.observationId && r.observationId !== filter.observationId) return false;
        if (filter.traceId && r.traceId !== filter.traceId) return false;
        if (filter.status && r.status !== filter.status) return false;
        return true;
      });
    }

    // Verify cryptographic signature of all retrieved records
    results.forEach(r => this.cryptoSigner.verifyRecord(r));
    return results;
  }

  async getById(id: string, user?: UserGovernanceContext): Promise<SafeScopeAuditRecord | undefined> {
    let record: SafeScopeAuditRecord | undefined;

    if (this.repository && this.persistenceMode === 'database') {
      await this.ensureDatabaseAuditTable();
      const entity = await this.repository.findOne({ where: { id } as any });
      record = entity ? this.mapEntityToType(entity) : undefined;
    } else {
      const records = this.loadFromFile();
      record = records.find(r => r.id === id);
    }

    if (record && user && record.workspaceId && record.workspaceId !== user.workspaceId) {
        throw new ForbiddenException('Cross-workspace access is blocked.');
    }

    // Verify cryptographic signature if loaded successfully
    if (record) {
      this.cryptoSigner.verifyRecord(record);
    }

    return record;
  }

  async updateStatus(id: string, status: string, metadataUpdate: Record<string, any> = {}, user?: UserGovernanceContext): Promise<SafeScopeAuditRecord | undefined> {
    if (this.repository && this.persistenceMode === 'database') {
      await this.ensureDatabaseAuditTable();
      const entity = await this.repository.findOne({ where: { id } as any });
      if (entity) {
        if (user && entity.workspaceId && entity.workspaceId !== user.workspaceId) {
            throw new ForbiddenException('Cross-workspace access is blocked.');
        }
        entity.status = status;
        entity.metadata = { ...entity.metadata, ...metadataUpdate };
        
        const mapped = this.mapEntityToType(entity);
        // Recalculate and sign the updated state
        this.cryptoSigner.signRecord(mapped);
        
        entity.metadata = mapped.metadata;
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
      
      // Recalculate and sign the updated state
      this.cryptoSigner.signRecord(records[index]);
      
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
