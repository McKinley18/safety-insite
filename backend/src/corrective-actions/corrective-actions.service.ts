import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CorrectiveAction } from './entities/corrective-action.entity';
import { CreateCorrectiveActionDto, CloseCorrectiveActionDto } from './dto/corrective-action.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FixFeedbackService } from '../intelligence/fix-feedback.service';
import { OutcomeService } from '../outcomes/outcome.service';
import { isOrganizationManager } from '../common/authenticated-user';
import { InspectionFinding } from '../inspection/entities/inspection-finding.entity';
import { Inspection } from '../inspection/inspection.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Site } from '../sites/entities/site.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}


@Injectable()
export class CorrectiveActionsService {
  constructor(
    @InjectRepository(CorrectiveAction)
    private actionRepo: Repository<CorrectiveAction>,
    @InjectRepository(Inspection) private inspectionRepo: Repository<Inspection>,
    @InjectRepository(InspectionFinding)
    private findingRepo: Repository<InspectionFinding>,
    @InjectRepository(Site) private siteRepo: Repository<Site>,
    @InjectRepository(OrganizationMembership)
    private membershipRepo: Repository<OrganizationMembership>,
    private dataSource: DataSource,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private fixFeedbackService: FixFeedbackService,
    private outcomeService: OutcomeService,
  ) {}

  private getAuthContext(user?: any) {
    const userId = user?.userId || user?.id || user?.sub;
    const organizationId = user?.organizationId || null;
    const tenantId = user?.tenantId || organizationId || `user:${userId}`;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user context is required.');
    }

    return {
      ...user,
      userId,
      sub: user?.sub || userId,
      organizationId: organizationId ? String(organizationId) : null,
      tenantId: String(tenantId),
    };
  }

  private normalizePriority(priority: any): 'low' | 'medium' | 'high' | 'urgent' {
    const value = String(priority || 'medium').toLowerCase();

    if (value === 'critical' || value === 'urgent') return 'urgent';
    if (value === 'high') return 'high';
    if (value === 'low') return 'low';
    return 'medium';
  }

  private normalizeStatus(status: any): 'open' | 'in_progress' | 'closed' | 'cancelled' {
    const value = String(status || 'open').toLowerCase().replace(/\s+/g, '_');

    if (value === 'completed' || value === 'closed') return 'closed';
    if (value === 'in_progress') return 'in_progress';
    if (value === 'cancelled' || value === 'canceled') return 'cancelled';
    return 'open';
  }

  private buildFilter(
    statusCode?: string,
    priorityCode?: string,
    organizationId?: string | null,
    ownerUserId?: string,
    assignedToUserId?: string,
  ) {
    const where: any = organizationId ? { organizationId } : { organizationId: IsNull(), ownerUserId };

    if (assignedToUserId) where.assignedToUserId = assignedToUserId;
    if (statusCode) where.statusCode = statusCode;
    if (priorityCode) where.priorityCode = priorityCode;
    return where;
  }

  async findAll(
    user: any,
    options: { page?: number | string; limit?: number | string; statusCode?: string; priorityCode?: string; assignedToMe?: boolean },
  ): Promise<{ data: CorrectiveAction[], meta: { total: number, page: number, limit: number } }> {
    const auth = this.getAuthContext(user);
    const page = toPositiveInt(options.page, 1);
    const limit = Math.min(toPositiveInt(options.limit, 20), 100);
    const skip = (page - 1) * limit;
    const { statusCode, priorityCode, assignedToMe } = options;
    const where = this.buildFilter(
      statusCode,
      priorityCode,
      auth.organizationId,
      String(auth.userId),
      assignedToMe ? String(auth.userId) : undefined,
    );

    const [data, total] = await this.actionRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit }
    };
  }

  async export(user: any, statusCode?: string, priorityCode?: string) {
    const auth = this.getAuthContext(user);
    const where = this.buildFilter(
      statusCode,
      priorityCode,
      auth.organizationId,
      String(auth.userId),
    );
    return this.actionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async create(user: any, dto: CreateCorrectiveActionDto) {
    const auth = this.getAuthContext(user);
    const scope = auth.organizationId
      ? { organizationId: auth.organizationId }
      : { organizationId: IsNull(), ownerUserId: String(auth.userId) };
    let inspection: Inspection | null = null;
    if (dto.inspectionId) {
      inspection = await this.inspectionRepo.findOne({
        where: { id: dto.inspectionId, ...scope } as any,
      });
      if (!inspection) throw new NotFoundException('Inspection not found.');
    }
    if (dto.findingId) {
      const finding = await this.findingRepo.findOne({
        where: { id: dto.findingId },
      });
      if (!finding ||
          (inspection && finding.inspectionId !== inspection.id) ||
          !(await this.inspectionRepo.findOne({
            where: { id: finding.inspectionId, ...scope } as any,
          }))) {
        throw new NotFoundException('Finding not found.');
      }
      if (!inspection) inspection = await this.inspectionRepo.findOne({
        where: { id: finding.inspectionId, ...scope } as any,
      });
    }
    if (dto.siteId) {
      const site = await this.siteRepo.findOne({
        where: { id: dto.siteId, ...scope } as any,
      });
      if (!site || site.archivedAt || (inspection && inspection.siteId !== site.id)) {
        throw new NotFoundException('Site not found.');
      }
    }
    const assigneeId = dto.assignedToUserId || String(auth.userId);
    if (auth.organizationId) {
      const membership = await this.membershipRepo.findOne({
        where: {
          userId: assigneeId,
          organizationId: auth.organizationId,
          status: 'active',
        },
      });
      if (!membership) throw new NotFoundException('Assignee not found.');
      if (assigneeId !== String(auth.userId) && !isOrganizationManager(auth)) {
        throw new ForbiddenException('Manager access is required to assign another member.');
      }
    } else if (assigneeId !== String(auth.userId)) {
      throw new NotFoundException('Assignee not found.');
    }
    const action = this.actionRepo.create({
      ...(dto as any),
      inspectionId: inspection?.id || dto.inspectionId || null,
      assignedToUserId: assigneeId,
      priorityCode: this.normalizePriority(dto.priorityCode),
      statusCode: this.normalizeStatus((dto as any).statusCode),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      tenantId: auth.tenantId,
      organizationId: auth.organizationId,
      ownerUserId: String(auth.userId),
      displayId: `ACT-${randomUUID().slice(0, 8).toUpperCase()}`,
    } as any) as unknown as CorrectiveAction;
    return this.dataSource.transaction(async manager => {
      const saved = await manager.getRepository(CorrectiveAction).save(action);
      await manager.getRepository(AuditLog).save(manager.getRepository(AuditLog).create({
        tenantId: auth.tenantId,
        actorUserId: String(auth.userId),
        entityType: 'CORRECTIVE_ACTION',
        entityId: saved.id,
        actionCode: 'ACTION_CREATED',
        afterJson: saved,
      }));
      return saved;
    });
  }

  async updateStatus(
    user: any,
    id: string,
    body: { statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled'; closureNotes?: string },
  ) {
    const auth = this.getAuthContext(user);

    const action = await this.actionRepo.findOne({
      where: auth.organizationId
        ? { id, organizationId: auth.organizationId }
        : { id, organizationId: IsNull(), ownerUserId: String(auth.userId) },
    });
    if (!action) throw new NotFoundException('Action not found.');
    if (auth.organizationId &&
        action.ownerUserId !== String(auth.userId) &&
        action.assignedToUserId !== String(auth.userId) &&
        !isOrganizationManager(auth)) {
      throw new NotFoundException('Action not found.');
    }

    const before = { ...action };
    action.statusCode = body.statusCode;

    if (body.statusCode === 'closed') {
      action.closureNotes = body.closureNotes || action.closureNotes;
      action.verifiedAt = new Date();
      action.verifiedByUserId = String(auth.userId);
    }

    const updated = await this.actionRepo.save(action);

    // 🔷 OIL: Record Outcome
    if (updated.statusCode === 'closed') {
        const outcome = await this.outcomeService.recordOutcome({
            actionId: updated.id,
            category: updated.category || 'unknown',
            originalRecommendation: updated.originalSuggestion,
            userActionTaken: { title: updated.title, description: updated.description, closureNotes: updated.closureNotes },
            verificationStatus: 'VERIFIED_STRONG',
            verificationMethod: 'SUPERVISOR_SIGNOFF',
            location: updated.siteId || 'Facility Floor'
        });

        // 🔷 ESCALATION: Auto-escalate if recurrence detected
        if (outcome.recurrenceDetected) {
            updated.priorityCode = 'urgent';
            await this.actionRepo.save(updated);
        }

        // 🔷 FEEDBACK LOOP: Record successful remediation (only if no recurrence)
        if (updated.reportId && updated.category && !outcome.recurrenceDetected) {
            await this.fixFeedbackService.recordFeedback({
                reportId: updated.reportId,
                category: updated.category,
                originalSuggestion: updated.originalSuggestion,
                userAction: {
                    title: updated.title,
                    description: updated.description,
                    closureNotes: updated.closureNotes
                },
                approved: true
            });
        }
    }

    await this.auditService.log({
      tenantId: auth.tenantId,
      actorUserId: String(auth.userId),
      entityType: 'CORRECTIVE_ACTION',
      entityId: updated.id,
      actionCode: 'ACTION_STATUS_UPDATED',
      beforeJson: before,
      afterJson: updated,
    });

    if (updated.assignedToUserId && before.statusCode !== updated.statusCode) {
      await this.notificationsService.create({
        tenantId: auth.tenantId,
        userId: updated.assignedToUserId,
        type: 'system',
        title: 'Corrective action status updated',
        message: `${updated.title || 'Corrective action'} is now ${updated.statusCode}.`,
        entityType: 'CORRECTIVE_ACTION',
        entityId: updated.id,
      });
    }

    return updated;
  }

  async upsertFromReportAction(input: {
    reportId: string;
    findingId?: string;
    action: any;
    finding?: any;
    user?: any;
  }) {
    const auth = this.getAuthContext(input.user);
    const organizationId = auth.organizationId;
    const tenantId = auth.tenantId;
    const userId = String(auth.userId);
    const action = input.action || {};
    const sourceActionId = action.id ? String(action.id) : null;

    const title =
      action.title ||
      action.description ||
      action.suggestedFixes?.[0] ||
      'Corrective action';

    const description =
      action.description ||
      action.title ||
      action.suggestedFixes?.join('; ') ||
      title;

    const existing = await this.actionRepo.findOne({
      where: {
        reportId: input.reportId,
        findingId: input.findingId || null,
        title,
        organizationId,
      } as any,
    });

    const record = (existing || this.actionRepo.create({
      reportId: input.reportId,
      findingId: input.findingId || undefined,
      tenantId,
      organizationId,
      ownerUserId: userId,
      displayId: `ACT-${String((await this.actionRepo.count()) + 2001).padStart(4, '0')}`,
    } as any)) as CorrectiveAction;

    record.title = title;
    record.description = description;
    record.priorityCode = this.normalizePriority(action.priority || action.priorityCode);
    record.statusCode = this.normalizeStatus(action.status || action.statusCode);
    record.dueDate = action.dueDate || action.due ? new Date(action.dueDate || action.due) : record.dueDate;
    record.assignedToUserId = action.assignedToUserId || record.assignedToUserId;
    record.assignedToName = action.assignedToName || action.assignedRole || record.assignedToName;
    record.category =
      action.category ||
      input.finding?.hazardCategory ||
      input.finding?.safeScopeResult?.classification ||
      record.category;
    record.originalSuggestion = {
      ...(typeof action.originalSuggestion === 'object' && action.originalSuggestion ? action.originalSuggestion : {}),
      sourceActionId,
      findingId: input.findingId,
      source: action.source || action.generatedBy || 'Report Package',
      closureEvidence: action.closureEvidence || action.verificationEvidence || null,
    };
    record.siteId = action.siteId || record.siteId;
    record.source = action.source || action.generatedBy || 'Report Package';

    return this.actionRepo.save(record);
  }

  async syncReportActions(reportId: string, frontendReport: any, user?: any) {
    const findings = Array.isArray(frontendReport?.findings) ? frontendReport.findings : [];
    const savedActions = [];

    for (const finding of findings) {
      const findingId = finding?.id ? String(finding.id) : undefined;
      const actions = [
        ...(Array.isArray(finding?.correctiveActions) ? finding.correctiveActions : []),
        ...(Array.isArray(finding?.selectedGeneratedActions) ? finding.selectedGeneratedActions : []),
        ...(Array.isArray(finding?.manualActions) ? finding.manualActions : []),
      ];

      const unique = new Map<string, any>();

      for (const action of actions) {
        const key = String(action?.id || action?.title || action?.description || JSON.stringify(action));
        if (!unique.has(key)) unique.set(key, action);
      }

      for (const action of unique.values()) {
        const saved = await this.upsertFromReportAction({
          reportId,
          findingId,
          action,
          finding,
          user,
        });
        savedActions.push(saved);
      }
    }

    return savedActions;
  }

  async generateDueDateAlerts(user: any) {
    const auth = this.getAuthContext(user);
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    const actions = await this.actionRepo.find({
      where: auth.organizationId
        ? { organizationId: auth.organizationId }
        : { organizationId: IsNull(), ownerUserId: String(auth.userId) },
      order: { dueDate: 'ASC' },
    });

    let created = 0;

    for (const action of actions) {
      if (!action.assignedToUserId || !action.dueDate) continue;
      if (action.statusCode === 'closed' || action.statusCode === 'cancelled') continue;

      const due = new Date(action.dueDate).getTime();
      const isOverdue = due < now;
      const isDueSoon = due >= now && due <= now + oneDay;

      const type = isOverdue ? 'overdue_action' : isDueSoon ? 'due_soon_action' : null;
      if (!type) continue;

      const existing = await this.notificationsService.findExistingForEntity({
        tenantId: auth.tenantId,
        userId: action.assignedToUserId,
        type: type as any,
        entityType: 'CORRECTIVE_ACTION',
        entityId: action.id,
      });

      if (existing) continue;

      await this.notificationsService.create({
        tenantId: auth.tenantId,
        userId: action.assignedToUserId,
        type: type as any,
        title: isOverdue ? 'Corrective action overdue' : 'Corrective action due soon',
        message: `${action.title || 'Corrective action'} is ${isOverdue ? 'overdue' : 'due within 24 hours'}.`,
        entityType: 'CORRECTIVE_ACTION',
        entityId: action.id,
      });

      created += 1;
    }

    return { ok: true, created };
  }

  async close(id: string, dto: CloseCorrectiveActionDto, user?: any) {
    const auth = this.getAuthContext(user);
    const action = await this.actionRepo.findOne({
      where: auth.organizationId
        ? { id, organizationId: auth.organizationId }
        : { id, organizationId: IsNull(), ownerUserId: String(auth.userId) },
    });
    if (!action) throw new Error('Action not found');
    
    const before = { ...action };
    action.statusCode = 'closed';
    action.closureNotes = dto.closureNotes;
    action.verifiedAt = new Date();
    const updated = await this.actionRepo.save(action);

    // 🔷 OIL: Record Outcome
    const outcome = await this.outcomeService.recordOutcome({
        actionId: updated.id,
        category: updated.category || 'unknown',
        originalRecommendation: updated.originalSuggestion,
        userActionTaken: { title: updated.title, description: updated.description, closureNotes: updated.closureNotes },
        verificationStatus: 'VERIFIED_STRONG',
        verificationMethod: 'SUPERVISOR_SIGNOFF',
        location: updated.siteId || 'Facility Floor'
    });

    // 🔷 ESCALATION: Auto-escalate if recurrence detected
    if (outcome.recurrenceDetected) {
        updated.priorityCode = 'urgent';
        await this.actionRepo.save(updated);
    }

    // 🔷 FEEDBACK LOOP: Record successful remediation (only if no recurrence)
    if (updated.reportId && updated.category && !outcome.recurrenceDetected) {
        await this.fixFeedbackService.recordFeedback({
            reportId: updated.reportId,
            category: updated.category,
            originalSuggestion: updated.originalSuggestion,
            userAction: {
                title: updated.title,
                description: updated.description,
                closureNotes: updated.closureNotes
            },
            approved: true
        });
    }

    await this.auditService.log({
      tenantId: auth.tenantId,
      actorUserId: String(auth.userId),
      entityType: 'CORRECTIVE_ACTION',
      entityId: updated.id,
      actionCode: 'ACTION_CLOSED',
      beforeJson: before,
      afterJson: updated,
    });
    return updated;
  }
}
