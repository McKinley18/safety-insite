import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: Partial<AuditLog>) {
    await this.auditRepository.save(this.auditRepository.create(data));
  }

  async getAuditByEntityId(entityId: string) {
    return this.auditRepository.find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAuditByTenant(tenantId: string) {
    return this.auditRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
