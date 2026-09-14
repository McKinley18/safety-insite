import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CorrectiveAction } from './entities/corrective-action.entity';
import {
  CloseCorrectiveActionDto,
  CreateCorrectiveActionDto,
  UpdateCorrectiveActionDto,
  UpdateCorrectiveActionStatusDto,
} from './dto/corrective-action.dto';
import { AuditService } from '../audit/audit.service';
import { parseDueDate } from '../common/calendar-date';
import { NotificationsService } from '../notifications/notifications.service';
import { FixFeedbackService } from '../intelligence/fix-feedback.service';
import { OutcomeService } from '../outcomes/outcome.service';
import { isOrganizationManager } from '../common/authenticated-user';
import { isUniqueViolation } from '../common/unique-violation';
import { InspectionFinding } from '../inspection/entities/inspection-finding.entity';
import { Inspection } from '../inspection/inspection.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Site } from '../sites/entities/site.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { emitOperationalEvent } from '../observability/operational-events';

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
      // §287 / D-052. Every row carries its derived lifecycle state, so no client has to decide
      // for itself whether a closed action counts as verified — which is the inference that
      // produced the fabricated supervisor sign-off in the first place.
      data: data.map(action => this.withLifecycleState(action)),
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
    return (await this.actionRepo.find({ where, order: { createdAt: 'DESC' } }))
      .map(action => this.withLifecycleState(action));
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
    /**
     * ACCOUNT assignment is only ever what the caller explicitly asked for.
     *
     * This previously defaulted to `auth.userId`, so every corrective action was assigned to the
     * person who ran the inspection -- and the report then printed that person in its "Assigned To"
     * line and Owner column. Inspecting a hazard and being accountable for fixing it are different
     * roles, and asserting the first implies the second is a false record: nobody chose that
     * assignment, and on the first report shown to a client it names the wrong person.
     *
     * Unassigned is now representable and truthful. `assignedToUserId` is nullable (and has been
     * since the canonical foundation migration), the report already renders a missing owner as
     * "Unassigned", and the descriptive `assignedToName` carries a responsible party the customer
     * typed. Completion is not blocked by leaving it empty.
     *
     * Authorization is unchanged for a real assignment: an explicit `assignedToUserId` still has to
     * be an active member of the caller's organization, and still requires manager access to point
     * at anyone other than the caller.
     */
    const assigneeId = dto.assignedToUserId ? String(dto.assignedToUserId) : null;
    if (assigneeId) {
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
    }
    const action = this.actionRepo.create({
      ...(dto as any),
      inspectionId: inspection?.id || dto.inspectionId || null,
      assignedToUserId: assigneeId,
      // The responsible party the customer named, trimmed. Blank stays NULL rather than an empty
      // string, so "unassigned" is one value everywhere rather than two that render differently.
      assignedToName: typeof dto.assignedToName === 'string' && dto.assignedToName.trim()
        ? dto.assignedToName.trim()
        : null,
      priorityCode: this.normalizePriority(dto.priorityCode),
      statusCode: this.normalizeStatus((dto as any).statusCode),
      // §275. A bare YYYY-MM-DD must land on the day the user named, not on UTC
      // midnight, which is the previous evening west of Greenwich.
      dueDate: parseDueDate(dto.dueDate),
      tenantId: auth.tenantId,
      organizationId: auth.organizationId,
      ownerUserId: String(auth.userId),
      displayId: `ACT-${randomUUID().slice(0, 8).toUpperCase()}`,
      // §287 / D-053. Persisted so a replay can find it, and NULL when the caller sent none --
      // the unique index is partial precisely so that stays legal.
      clientRequestId: dto.clientRequestId || null,
      closedAt: null,
      closedByUserId: null,
    } as any) as unknown as CorrectiveAction;
    /**
     * §287 / D-053 — THE IDEMPOTENCY REPLAY, CHECKED BEFORE ANYTHING IS WRITTEN.
     *
     * §286 measured `POST /actions` producing two identical open actions from a repeated submit,
     * because it was the only create route in the product with no idempotency key. A double-tap, a
     * retry after a client timeout, and a response lost after a successful server commit are three
     * routes to the same duplicate, and only the first is addressable in the browser.
     *
     * Scoped to (tenantId, ownerUserId, clientRequestId) exactly as the partial unique index is, so
     * this fast path and the constraint that backstops it agree about what "the same request"
     * means. The read is not a guarantee on its own -- two concurrent submits can both miss it --
     * which is why the write below catches the unique violation and returns the winner.
     */
    const idempotencyScope = dto.clientRequestId
      ? {
        tenantId: auth.tenantId,
        ownerUserId: String(auth.userId),
        clientRequestId: dto.clientRequestId,
      }
      : null;
    if (idempotencyScope) {
      const replay = await this.actionRepo.findOne({ where: idempotencyScope as any });
      if (replay) return this.withLifecycleState(replay);
    }

    try {
      return await this.createInTransaction(auth, dto, action);
    } catch (error) {
      /**
       * The race the read above cannot close: two submits arrive together, both find nothing, both
       * insert. The index rejects the loser, and the loser's caller gets the row the winner wrote
       * -- which is the same answer a sequential replay would have received. A duplicate is
       * prevented rather than merely made less likely.
       */
      if (idempotencyScope && isUniqueViolation(error)) {
        const winner = await this.actionRepo.findOne({ where: idempotencyScope as any });
        if (winner) return this.withLifecycleState(winner);
      }
      throw error;
    }
  }

  private async createInTransaction(auth: any, dto: CreateCorrectiveActionDto, action: CorrectiveAction) {
    return this.dataSource.transaction(async manager => {
      // ONE canonical corrective action per finding. When HazLenz already wrote the finding's
      // system-generated record at finalization (source 'hazlenz_finding_scoped',
      // InspectionService.upsertCorrectiveActionForFinding), the reviewer's confirmed action for
      // the same finding replaces its text in place instead of creating a duplicate row -- the
      // human-confirmed text is the more authoritative value and the report/dashboard must not
      // list two open actions for one finding.
      if (dto.findingId) {
        const existing = await manager.getRepository(CorrectiveAction).findOne({
          where: [
            { findingId: dto.findingId, source: 'hazlenz_finding_scoped' },
            { findingId: dto.findingId, source: 'reviewer_confirmed' },
          ] as any,
          order: { createdAt: 'ASC' } as any,
        });
        if (existing) {
          const before = { ...existing };
          existing.title = action.title;
          existing.description = action.description;
          existing.priorityCode = action.priorityCode;
          existing.assignedToUserId = action.assignedToUserId;
          // The responsible party the reviewer named is the more authoritative value, exactly as
          // their action text is. Carried across on the upsert so re-saving a finding does not drop
          // the owner they entered.
          existing.assignedToName = action.assignedToName;
          if (action.dueDate) existing.dueDate = action.dueDate;
          // The finalize-time system record carries no ownership scope (it is written inside the
          // inspection transaction); adopt the reviewer's scope so it is visible/queryable exactly
          // like a user-created action (tasks, dashboard, report).
          const scopeFields = ['tenantId', 'organizationId', 'ownerUserId', 'displayId', 'siteId', 'inspectionId'] as const;
          for (const field of scopeFields) {
            if ((existing as any)[field] == null && (action as any)[field] != null) (existing as any)[field] = (action as any)[field];
          }
          (existing as any).source = 'reviewer_confirmed';
          const updated = await manager.getRepository(CorrectiveAction).save(existing);
          await manager.getRepository(AuditLog).save(manager.getRepository(AuditLog).create({
            tenantId: auth.tenantId,
            actorUserId: String(auth.userId),
            entityType: 'CORRECTIVE_ACTION',
            entityId: updated.id,
            actionCode: 'ACTION_UPDATED',
            beforeJson: before,
            afterJson: updated,
          }));
          return this.withLifecycleState(updated);
        }
      }
      const saved = await manager.getRepository(CorrectiveAction).save(action);
      await manager.getRepository(AuditLog).save(manager.getRepository(AuditLog).create({
        tenantId: auth.tenantId,
        actorUserId: String(auth.userId),
        entityType: 'CORRECTIVE_ACTION',
        entityId: saved.id,
        actionCode: 'ACTION_CREATED',
        afterJson: saved,
      }));
      return this.withLifecycleState(saved);
    });
  }

  /**
   * §286 / D-054 — THE OUTCOME-INTELLIGENCE LOOP MAY NOT FAIL A CLOSURE.
   *
   * ==================== THE DEFECT THIS EXISTS TO FIX ====================
   *
   * `PATCH /actions/:id/status` with `statusCode: 'closed'` answered **HTTP 500** on any database
   * built from the migration set, and §286 measured it end to end:
   *
   *     QueryFailedError: relation "outcomes" does not exist
   *       at OutcomeService.checkRecurrence
   *       at OutcomeService.recordOutcome
   *       at CorrectiveActionsService.updateStatus
   *
   * The `Outcome` entity is declared and its module is wired, and NO MIGRATION CREATES THE TABLE.
   * `synchronize` is false in production and the application refuses to start with it enabled
   * there, so the table cannot appear by any other route. Closing a corrective action was
   * therefore broken for every account.
   *
   * AND IT FAILED IN THE WORST AVAILABLE ORDER. The status write had already committed when the
   * throw happened, and everything after it had not:
   *
   *     the action was CLOSED in the database
   *     the customer was told the request FAILED
   *     the audit event `ACTION_STATUS_UPDATED` was never written
   *     the assignee was never notified
   *
   * A compliance product that closes a corrective action without an audit record, while telling
   * the person who closed it that nothing happened, is worse than one that simply refuses.
   *
   * ==================== THE CORRECTION ====================
   *
   * The learning loop is a SIDE-EFFECT of closure, not part of it. It is moved behind this method,
   * which never throws, so the closure, its audit record and its notification are reached whatever
   * the intelligence layer does. A failure is emitted as an operational event so the degradation is
   * visible to an operator instead of silent.
   *
   * WHAT THIS DELIBERATELY DOES NOT DO IS CREATE THE MISSING TABLE. Adding the migration would not
   * merely restore a dormant capability — it would ACTIVATE, for the first time in production, a
   * recurrence check that counts outcomes BY CATEGORY ACROSS EVERY TENANT
   * (`OutcomeService.checkRecurrence` applies no organization or owner scope) and auto-escalates a
   * customer's action to `urgent` on the strength of it. Turning that on is a product decision
   * about whether the outcome loop is per-tenant or global, and §286 raises it as D-055 rather than
   * deciding it while repairing a 500.
   */
  private async recordClosureIntelligence(action: CorrectiveAction) {
    try {
      /**
       * §287 / D-052. These were `VERIFIED_STRONG` / `SUPERVISOR_SIGNOFF`, hard-coded, on every
       * close. The learning loop was being fed a verification claim that no user had made, which
       * would in turn have weighted its confidence on a fact nobody established.
       *
       * `UNVERIFIED` is what a closure with no verification actually is, and `verificationMethod`
       * is omitted because none was used. When a verification workflow exists, the values it
       * records will come from the verification, not from the fact that someone pressed Close.
       */
      const outcome = await this.outcomeService.recordOutcome({
        actionId: action.id,
        category: action.category || 'unknown',
        originalRecommendation: action.originalSuggestion,
        userActionTaken: { title: action.title, description: action.description, closureNotes: action.closureNotes },
        verificationStatus: action.verifiedAt ? 'VERIFIED_STRONG' : 'UNVERIFIED',
        location: action.siteId || 'Facility Floor',
      });

      // ESCALATION: a hazard category that keeps coming back is not closed, whatever the last
      // record says. Reachable only when the outcome record above succeeded.
      if (outcome.recurrenceDetected) {
        action.priorityCode = 'urgent';
        await this.actionRepo.save(action);
      }

      // FEEDBACK: record a remediation that appears to have held.
      if (action.reportId && action.category && !outcome.recurrenceDetected) {
        await this.fixFeedbackService.recordFeedback({
          reportId: action.reportId,
          category: action.category,
          originalSuggestion: action.originalSuggestion,
          userAction: { title: action.title, description: action.description, closureNotes: action.closureNotes },
          approved: true,
        });
      }
    } catch (error) {
      // Only the failure KIND crosses into the log. §268 forbids content, and a database error
      // message can carry a column value.
      emitOperationalEvent('action.closure_intelligence_failed', {
        actionId: action.id,
        failureKind: error instanceof Error ? error.name : 'UnknownError',
        closureRecorded: true,
      });
    }
  }

  /**
   * §287 / D-052 — THE LIFECYCLE STATE THE CUSTOMER SEES, DERIVED, NOT STORED.
   *
   * §287's direction asks for explicit states over implied claims, and in the same breath forbids
   * a parallel state machine. Both are satisfied by DERIVING the state from the two axes the
   * authoritative model already has:
   *
   *   statusCode   open | in_progress | closed | cancelled   — the completion axis
   *   verifiedAt   set or not                                — the verification axis
   *
   * giving OPEN / IN_PROGRESS / COMPLETED / VERIFIED / CANCELLED. There is no third column that
   * could disagree with the other two, and nothing can be in a lifecycle state its `statusCode`
   * contradicts, because the state IS its `statusCode` read together with one fact.
   *
   * COMPLETED is the direction's VERIFICATION_PENDING under the name the product already uses for
   * it. Naming it "verification pending" would assert that a verification is expected, and whether
   * verification is required at all is the open product-policy question §287 registers rather than
   * settles -- so the state says what is true (the work is recorded as done, and no verification is
   * recorded) and claims nothing about what happens next.
   */
  private lifecycleState(action: CorrectiveAction): 'open' | 'in_progress' | 'completed' | 'verified' | 'cancelled' {
    if (action.statusCode === 'cancelled') return 'cancelled';
    if (action.statusCode === 'closed') return action.verifiedAt ? 'verified' : 'completed';
    return action.statusCode === 'in_progress' ? 'in_progress' : 'open';
  }

  /**
   * The action as a customer surface reads it.
   *
   * `verified` is stated as its own boolean beside the state so a client never has to infer
   * verification from the presence of a timestamp -- inference from field presence is the class of
   * error D-052 is about.
   */
  private withLifecycleState(action: CorrectiveAction) {
    return {
      ...action,
      lifecycleState: this.lifecycleState(action),
      verified: Boolean(action.verifiedAt),
      /** True when the action is closed and carries no verification. Stated, never inferred. */
      closedWithoutVerification: action.statusCode === 'closed' && !action.verifiedAt,
    };
  }

  /**
   * §287 — THE ONE AUTHORIZATION RULE FOR MUTATING A CORRECTIVE ACTION.
   *
   * Lifted verbatim out of `updateStatus`, which was the only mutator before §287 added field
   * editing. It is factored rather than copied for the reason D-008 exists: two call sites each
   * holding their own copy of an access rule is two rules, and they drift.
   *
   * The rule is unchanged and is deliberately NOT broadened here -- §287's direction says not to
   * expand Company-plan functionality. In a personal account the row must be the caller's own. In
   * an organization, the caller must be the action's owner, its assignee, or a manager; anyone
   * else gets NOT FOUND rather than FORBIDDEN, so the response cannot be used to discover that an
   * action exists in a workspace the caller cannot see.
   */
  private async accessibleForMutation(auth: any, id: string) {
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
    return action;
  }

  /**
   * §287 / D-051 — EDIT A CORRECTIVE ACTION'S FIELDS, INCLUDING ITS DUE DATE.
   *
   * §286 measured that the only mutation the server exposed for a corrective action was its
   * status: there was no route that changed a title, a priority, an assignee or a DUE DATE. The
   * calendar scenario "a changed due date moves the event" was therefore not representable for a
   * corrective action at all, only for a standalone task -- and a due date is the most-revised
   * field on a corrective action in practice.
   *
   * THE SERVER REMAINS AUTHORITATIVE. Nothing is computed on the device: the date is parsed here
   * through the shared `parseDueDate`, persisted here, and the calendar projection re-reads it. A
   * moved event is a consequence of the persisted change, never of a local edit the server has not
   * accepted.
   *
   * DATE-ONLY SEMANTICS ARE PRESERVED. `parseDueDate` turns a bare `YYYY-MM-DD` into LOCAL
   * midnight, which is the §275 repair: `new Date('2026-09-15')` is UTC midnight and therefore the
   * previous evening anywhere west of Greenwich. Sending an instant here would re-enter that
   * defect, which is why the calendar projection reads back through `toCalendarDayKey`.
   *
   * Status is NOT settable here -- see `UpdateCorrectiveActionDto`.
   */
  async update(user: any, id: string, dto: UpdateCorrectiveActionDto) {
    const auth = this.getAuthContext(user);
    const action = await this.accessibleForMutation(auth, id);
    const before = { ...action };

    if (dto.title !== undefined) action.title = dto.title.trim();
    if (dto.description !== undefined) action.description = dto.description.trim();
    if (dto.priorityCode !== undefined) action.priorityCode = this.normalizePriority(dto.priorityCode);
    if (dto.dueDate !== undefined) {
      const parsed = parseDueDate(dto.dueDate);
      if (!parsed) throw new BadRequestException('dueDate must be a calendar date.');
      action.dueDate = parsed;
    }
    // Blank stays NULL rather than an empty string, so "unassigned" is one value everywhere
    // rather than two that render differently -- the same rule `create` applies.
    if (dto.assignedToName !== undefined) {
      action.assignedToName = dto.assignedToName.trim() ? dto.assignedToName.trim() : (null as any);
    }
    if (dto.assignedToUserId !== undefined) {
      const assigneeId = dto.assignedToUserId ? String(dto.assignedToUserId) : null;
      // Identical to the create path's rule, and equally not broadened: an explicit assignment
      // still has to name an active member of the caller's organization, and still requires
      // manager access to point at anyone other than the caller.
      if (assigneeId) {
        if (auth.organizationId) {
          const membership = await this.membershipRepo.findOne({
            where: { userId: assigneeId, organizationId: auth.organizationId, status: 'active' },
          });
          if (!membership) throw new NotFoundException('Assignee not found.');
          if (assigneeId !== String(auth.userId) && !isOrganizationManager(auth)) {
            throw new ForbiddenException('Manager access is required to assign another member.');
          }
        } else if (assigneeId !== String(auth.userId)) {
          throw new NotFoundException('Assignee not found.');
        }
      }
      action.assignedToUserId = assigneeId as any;
    }

    const updated = await this.actionRepo.save(action);

    // §287 / D-054. Auxiliary, after a committed write, and unable to fail the request. The lost
    // audit row is emitted rather than swallowed. See `updateStatus` for the full reasoning.
    try {
      await this.auditService.log({
        tenantId: auth.tenantId,
        actorUserId: String(auth.userId),
        entityType: 'CORRECTIVE_ACTION',
        entityId: updated.id,
        actionCode: 'ACTION_UPDATED',
        beforeJson: before,
        afterJson: updated,
      });
    } catch (error) {
      emitOperationalEvent('action.audit_write_failed', {
        actionId: updated.id,
        actorUserId: String(auth.userId),
        actionCode: 'ACTION_UPDATED',
        failureKind: error instanceof Error ? error.name : 'UnknownError',
        stateCommitted: true,
      });
    }

    return this.withLifecycleState(updated);
  }

  async updateStatus(user: any, id: string, body: UpdateCorrectiveActionStatusDto) {
    const auth = this.getAuthContext(user);
    const action = await this.accessibleForMutation(auth, id);

    const before = { ...action };
    const wasClosed = action.statusCode === 'closed';
    action.statusCode = body.statusCode;

    /**
     * §287 / D-052 — CLOSING IS NOT VERIFYING.
     *
     * This used to stamp `verifiedAt = now` and `verifiedByUserId = the caller` on every close.
     * Nothing had been verified: the caller was frequently the same person who raised the action,
     * no independent check had occurred, and the record then read as a supervisor-verified
     * correction on a compliance artifact. §286 measured it; §287 rejects the semantics outright.
     *
     * Closure now writes the COMPLETION pair, which §287's migration added because the table had
     * nowhere to put it. The verification pair is left untouched -- and on a closed action its
     * absence is a true statement that closure was recorded and verification was not.
     *
     * `closureNotes` remains OPTIONAL, per direction: evidence must not be made mandatory merely
     * to satisfy a screen. When notes ARE supplied they replace the previous value; when they are
     * not, the previous value is preserved, which is why the audit row below carries `before` and
     * `after` rather than the product inferring anything from the field being unchanged.
     */
    if (body.statusCode === 'closed') {
      action.closureNotes = body.closureNotes || action.closureNotes;
      action.closedAt = new Date();
      action.closedByUserId = String(auth.userId);
    } else if (wasClosed) {
      // Reopened. An action that is open again was not closed at the time it would otherwise
      // still claim, so the completion stamp is cleared rather than left to contradict the status.
      // The closure NOTES are kept: they record what was done, which remains true.
      action.closedAt = null;
      action.closedByUserId = null;
    }

    const updated = await this.actionRepo.save(action);

    if (updated.statusCode === 'closed') await this.recordClosureIntelligence(updated);

    /**
     * §287 / D-054 — THE AUDIT WRITE MAY NOT TURN A COMMITTED TRANSITION INTO A 500.
     *
     * The state above is already committed. If this throws, the customer's action HAS changed
     * status and answering with an error invites exactly the retry loop D-054 exists to prevent:
     * commit succeeds, auxiliary write fails, customer sees 500, customer retries, state gets
     * confusing. §286 repaired that shape for the outcome-intelligence loop; the audit write is
     * the same shape and is repaired the same way.
     *
     * AND THE LOST AUDIT ROW IS NOT SWALLOWED. §287's direction is explicit that audit failure
     * must not silently erase required auditability. The failure is emitted as an operational
     * event carrying the actor, the resource and the transition, so an operator can see that a
     * required audit row is missing and which one it was -- the log line is the fallback record,
     * not a replacement for the audit trail.
     */
    try {
      await this.auditService.log({
        tenantId: auth.tenantId,
        actorUserId: String(auth.userId),
        entityType: 'CORRECTIVE_ACTION',
        entityId: updated.id,
        actionCode: 'ACTION_STATUS_UPDATED',
        beforeJson: before,
        afterJson: updated,
      });
    } catch (error) {
      emitOperationalEvent('action.audit_write_failed', {
        actionId: updated.id,
        actorUserId: String(auth.userId),
        actionCode: 'ACTION_STATUS_UPDATED',
        fromStatus: before.statusCode,
        toStatus: updated.statusCode,
        failureKind: error instanceof Error ? error.name : 'UnknownError',
        stateCommitted: true,
      });
    }

    // §287 / D-054. Also auxiliary, also after a committed write, also unable to fail the request.
    if (updated.assignedToUserId && before.statusCode !== updated.statusCode) {
      await this.notificationsService.create({
        tenantId: auth.tenantId,
        userId: updated.assignedToUserId,
        type: 'system',
        title: 'Corrective action status updated',
        message: `${updated.title || 'Corrective action'} is now ${updated.statusCode}.`,
        entityType: 'CORRECTIVE_ACTION',
        entityId: updated.id,
      }).catch((error: unknown) => emitOperationalEvent('action.notification_failed', {
        actionId: updated.id,
        failureKind: error instanceof Error ? error.name : 'UnknownError',
        stateCommitted: true,
      }));
    }

    return this.withLifecycleState(updated);
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
    record.dueDate = parseDueDate(action.dueDate || action.due) ?? record.dueDate;
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
    // §287 / D-052. Was `action.verifiedAt = new Date()`. Closing is not verifying; this records
    // the COMPLETION, exactly as `updateStatus` does. See the entity and the migration.
    action.closedAt = new Date();
    action.closedByUserId = String(auth.userId);
    const updated = await this.actionRepo.save(action);

    // §286 / D-054. The same hazard as `updateStatus` and the same correction: the learning loop
    // runs behind a method that cannot throw, so it can never swallow the audit record below.
    await this.recordClosureIntelligence(updated);

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
