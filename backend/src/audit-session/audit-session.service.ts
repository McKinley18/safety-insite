import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../auth/jwt-secret.util';
import { AuditSession } from './audit-session.entity';
import { AuditEntry } from './audit-entry.entity';

@Injectable()
export class AuditSessionService {
  constructor(
    @InjectRepository(AuditSession)
    private readonly auditSessionRepo: Repository<AuditSession>,
    @InjectRepository(AuditEntry)
    private readonly auditEntryRepo: Repository<AuditEntry>,
  ) {}

  private getAuthContext(authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      const userId = decoded.sub || decoded.userId;
      const organizationId = decoded.organizationId || decoded.tenantId || null;
      const tenantId = decoded.tenantId || decoded.organizationId || 'default';

      return {
        ...decoded,
        userId,
        sub: userId,
        organizationId,
        tenantId,
      };
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }

  private buildScope(auth: any) {
    return auth.organizationId && auth.organizationId !== 'default'
      ? { organizationId: auth.organizationId }
      : { tenantId: auth.tenantId };
  }

  async createSession(authHeader: string, dto: Partial<AuditSession>) {
    const auth = this.getAuthContext(authHeader);

    const session = this.auditSessionRepo.create({
      status: 'draft',
      standardsMode: dto.standardsMode || 'msha_hybrid',
      ...dto,
      tenantId: auth.tenantId,
      organizationId: auth.organizationId,
    });

    return this.auditSessionRepo.save(session);
  }

  async addEntry(authHeader: string, sessionId: string, dto: Partial<AuditEntry>) {
    const auth = this.getAuthContext(authHeader);

    const session = await this.auditSessionRepo.findOne({
      where: {
        id: sessionId,
        ...this.buildScope(auth),
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    const entry = this.auditEntryRepo.create({
      auditSessionId: sessionId,
      ...dto,
    });

    return this.auditEntryRepo.save(entry);
  }

  async publish(authHeader: string, sessionId: string) {
    const auth = this.getAuthContext(authHeader);

    const session = await this.auditSessionRepo.findOne({
      where: {
        id: sessionId,
        ...this.buildScope(auth),
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    session.status = 'published';
    session.publishedAt = new Date();
    return this.auditSessionRepo.save(session);
  }

  async findAll(authHeader: string) {
    const auth = this.getAuthContext(authHeader);

    return this.auditSessionRepo.find({
      where: this.buildScope(auth),
      order: { auditDate: 'DESC', id: 'DESC' },
    });
  }

  async findOne(authHeader: string, id: string) {
    const auth = this.getAuthContext(authHeader);

    const session = await this.auditSessionRepo.findOne({
      where: {
        id,
        ...this.buildScope(auth),
      },
      relations: ['entries'],
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    return session;
  }
}
