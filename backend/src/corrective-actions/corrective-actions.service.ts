import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../auth/jwt-secret.util';
import { CorrectiveAction } from './entities/corrective-action.entity';
import { CreateCorrectiveActionDto, CloseCorrectiveActionDto } from './dto/corrective-action.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FixFeedbackService } from '../intelligence/fix-feedback.service';
import { OutcomeService } from '../outcomes/outcome.service';

@Injectable()
export class CorrectiveActionsService {
  constructor(
    @InjectRepository(CorrectiveAction)
    private actionRepo: Repository<CorrectiveAction>,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private fixFeedbackService: FixFeedbackService,
    private outcomeService: OutcomeService,
  ) {}

  private getAuthContext(authHeader?: string, devOrganizationId?: string) {
    const token = authHeader?.replace('Bearer ', '');

    if (!token && process.env.DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
      const organizationId = devOrganizationId || 'workspace-alpha';
      return {
        userId: 'dev-user',
        sub: 'dev-user',
        organizationId,
        tenantId: organizationId,
      };
    }

    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      const userId = decoded.sub || decoded.userId;
      const organizationId = decoded.organizationId || decoded.tenantId || 'default';
      const tenantId = decoded.tenantId || decoded.organizationId || 'default';

      return {
        ...decoded,
        userId,
        sub: decoded.sub || userId,
        organizationId,
        tenantId,
      };
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }
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
    organizationId?: string,
    tenantId?: string,
    assignedToUserId?: string,
  ) {
    const where: any = {};

    if (organizationId && organizationId !== 'default') {
      where.organizationId = organizationId;
    } else if (tenantId) {
      where.tenantId = tenantId;
    }

    if (assignedToUserId) where.assignedToUserId = assignedToUserId;
    if (statusCode) where.statusCode = statusCode;
    if (priorityCode) where.priorityCode = priorityCode;
    return where;
  }

  async findAll(
    authHeader: string,
    options: { page: number; limit: number; statusCode?: string; priorityCode?: string; assignedToMe?: boolean; devOrganizationId?: string },
  ): Promise<{ data: CorrectiveAction[], meta: { total: number, page: number, limit: number } }> {
    const auth = this.getAuthContext(authHeader, options.devOrganizationId);
    const { page, limit, statusCode, priorityCode, assignedToMe } = options;
    const where = this.buildFilter(
      statusCode,
      priorityCode,
      auth.organizationId,
      auth.tenantId,
      assignedToMe ? String(auth.userId) : undefined,
    );

    const [data, total] = await this.actionRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit }
    };
  }

  async export(statusCode?: string, priorityCode?: string) {
    const where = this.buildFilter(statusCode, priorityCode);
    return this.actionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async create(authHeader: string, dto: CreateCorrectiveActionDto, devOrganizationId?: string) {
    const auth = this.getAuthContext(authHeader, devOrganizationId);
    const count = await this.actionRepo.count();
    const action = this.actionRepo.create({
      ...(dto as any),
      priorityCode: this.normalizePriority(dto.priorityCode),
      statusCode: this.normalizeStatus((dto as any).statusCode),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      tenantId: auth.tenantId,
      organizationId: auth.organizationId,
      ownerUserId: String(auth.userId),
      displayId: `ACT-${String(count + 2001).padStart(4, '0')}`,
    } as any) as unknown as CorrectiveAction;
    const saved = (await this.actionRepo.save(action)) as CorrectiveAction;
    await this.auditService.log({
      tenantId: auth.tenantId,
      actorUserId: String(auth.userId),
      entityType: 'CORRECTIVE_ACTION',
      entityId: saved.id,
      actionCode: 'ACTION_CREATED',
      afterJson: saved,
    });
    return saved;
  }

  async updateStatus(
    authHeader: string,
    id: string,
    body: { statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled'; closureNotes?: string },
  ) {
    const auth = this.getAuthContext(authHeader);

    const action = await this.actionRepo.findOne({
      where:
        auth.organizationId && auth.organizationId !== 'default'
          ? { id, organizationId: auth.organizationId }
          : { id, tenantId: auth.tenantId },
    });
    if (!action) throw new Error('Action not found');

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
        if (updated.category && !outcome.recurrenceDetected) {
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
    const organizationId = input.user?.organizationId || input.user?.workspaceId || 'default';
    const tenantId = input.user?.tenantId || organizationId;
    const userId = String(input.user?.userId || input.user?.sub || 'system');
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

  async generateDueDateAlerts(authHeader: string) {
    const auth = this.getAuthContext(authHeader);
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    const actions = await this.actionRepo.find({
      where:
        auth.organizationId && auth.organizationId !== 'default'
          ? { organizationId: auth.organizationId }
          : { tenantId: auth.tenantId },
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

  async close(id: string, dto: CloseCorrectiveActionDto) {
    const action = await this.actionRepo.findOne({ where: { id } });
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
    if (updated.category && !outcome.recurrenceDetected) {
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
      entityType: 'CORRECTIVE_ACTION',
      entityId: updated.id,
      actionCode: 'ACTION_CLOSED',
      beforeJson: before,
      afterJson: updated,
    });
    return updated;
  }
}
