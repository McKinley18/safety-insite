import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../auth/jwt-secret.util';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { Site } from '../sites/entities/site.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>,
    @InjectRepository(Site) private siteRepo: Repository<Site>,
  ) {}

  private getAuthContext(authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      const userId = decoded.sub || decoded.userId;

      return {
        ...decoded,
        userId,
        sub: String(userId || ''),
        // NULL, never a 'default' sentinel. `organizationId` is a uuid column on
        // both corrective_actions and sites, so a literal 'default' made every
        // query by an individual (non-organization) account fail with Postgres
        // 22P02 `invalid input syntax for type uuid` and surface as a 500.
        // An individual account is scoped by ownerUserId instead -- the same
        // organization-or-owner scope CorrectiveActionsService already uses.
        organizationId: decoded.organizationId || decoded.workspaceId || null,
        tenantId: decoded.tenantId || decoded.organizationId || decoded.workspaceId || null,
      };
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }

  private isOpen(action: CorrectiveAction) {
    return action.statusCode !== 'closed' && action.statusCode !== 'cancelled';
  }

  private isOverdue(action: CorrectiveAction) {
    return Boolean(
      action.dueDate &&
      new Date(action.dueDate) < new Date() &&
      this.isOpen(action),
    );
  }

  async getExecutiveSummary(authHeader: string, siteId?: string) {
    const auth = this.getAuthContext(authHeader);

    const query = this.actionRepo
      .createQueryBuilder('action')
      .where(
        auth.organizationId
          ? 'action.organizationId = :organizationId'
          : 'action.organizationId IS NULL AND action.ownerUserId = :ownerUserId',
        auth.organizationId
          ? { organizationId: auth.organizationId }
          : { ownerUserId: String(auth.userId) },
      );

    if (siteId) {
      query.andWhere('action.siteId = :siteId', { siteId });
    }

    const actions = await query.getMany();
    const overdue = actions.filter((action) => this.isOverdue(action));

    return {
      organizationId: auth.organizationId,
      siteId: siteId || null,
      totalFindings: actions.length,
      openActions: actions.filter((action) => this.isOpen(action)).length,
      overdueActions: overdue.length,
      highRiskFindings: actions.filter((action) => action.priorityCode === 'high').length,
      criticalRiskFindings: actions.filter((action) => action.priorityCode === 'urgent').length,
      executiveSummaryText: `Operations tracking ${actions.length} findings across ${siteId ? 'selected site' : 'all sites'} for this workspace.`,
    };
  }

  async getCorporateSummary(authHeader: string) {
    const auth = this.getAuthContext(authHeader);

    const scope = auth.organizationId
      ? { organizationId: String(auth.organizationId) }
      : { organizationId: IsNull(), ownerUserId: String(auth.userId) };

    const sites = await this.siteRepo.find({
      where: scope,
      order: { createdAt: 'DESC' },
    });

    const rankings = await Promise.all(
      sites.map(async (site) => {
        const actions = await this.actionRepo.find({
          where: { ...scope, siteId: site.id },
        });

        return {
          siteId: site.id,
          siteName: site.name,
          riskScore: actions.filter((action) => action.priorityCode === 'urgent').length * 5,
          overdueCount: actions.filter((action) => this.isOverdue(action)).length,
          openActions: actions.filter((action) => this.isOpen(action)).length,
        };
      }),
    );

    return {
      organizationId: auth.organizationId,
      totalSites: sites.length,
      siteRankings: rankings,
    };
  }
}
