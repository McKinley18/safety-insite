import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
        organizationId: decoded.organizationId || decoded.workspaceId || decoded.tenantId || 'default',
        tenantId: decoded.tenantId || decoded.organizationId || decoded.workspaceId || 'default',
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
      .where('action.organizationId = :organizationId', {
        organizationId: auth.organizationId,
      });

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

    const sites = await this.siteRepo.find({
      where: { organizationId: auth.organizationId },
      order: { createdAt: 'DESC' },
    });

    const rankings = await Promise.all(
      sites.map(async (site) => {
        const actions = await this.actionRepo.find({
          where: {
            organizationId: auth.organizationId,
            siteId: site.id,
          },
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
