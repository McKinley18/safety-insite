import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { requireAuthenticatedUser } from '../common/authenticated-user';
import { Inspection } from '../inspection/inspection.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Site } from '../sites/entities/site.entity';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './task.dto';
import { Task } from './task.entity';
import { toCalendarDayKey } from '../common/calendar-date';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(CorrectiveAction) private readonly actions: Repository<CorrectiveAction>,
    @InjectRepository(Inspection) private readonly inspections: Repository<Inspection>,
    @InjectRepository(Site) private readonly sites: Repository<Site>,
    @InjectRepository(OrganizationMembership)
    private readonly memberships: Repository<OrganizationMembership>,
  ) {}

  async create(rawUser: unknown, dto: CreateTaskDto) {
    const user = requireAuthenticatedUser(rawUser);
    const assigneeId = dto.assignedToUserId || user.userId;
    if (user.organizationId) {
      const assignee = await this.memberships.findOne({
        where: {
          userId: assigneeId,
          organizationId: user.organizationId,
          status: 'active',
        },
      });
      if (!assignee) throw new NotFoundException('Assignee not found.');
    } else if (assigneeId !== user.userId) {
      throw new NotFoundException('Assignee not found.');
    }
    if (dto.siteId) {
      const site = await this.sites.findOne({
        where: user.organizationId
          ? { id: dto.siteId, organizationId: user.organizationId }
          : { id: dto.siteId, ownerUserId: user.userId },
      });
      if (!site || site.archivedAt) throw new NotFoundException('Site not found.');
    }
    if (dto.inspectionId) {
      const inspection = await this.inspections.findOne({
        where: user.organizationId
          ? { id: dto.inspectionId, organizationId: user.organizationId }
          : { id: dto.inspectionId, ownerUserId: user.userId },
      });
      if (!inspection || inspection.archivedAt) {
        throw new NotFoundException('Inspection not found.');
      }
      if (dto.siteId && inspection.siteId !== dto.siteId) {
        throw new NotFoundException('Inspection not found for site.');
      }
    }
    if (dto.correctiveActionId) {
      const action = await this.actions.findOne({
        where: user.organizationId
          ? { id: dto.correctiveActionId, organizationId: user.organizationId }
          : { id: dto.correctiveActionId, ownerUserId: user.userId, organizationId: IsNull() },
      });
      if (!action || (dto.inspectionId && action.inspectionId !== dto.inspectionId)) {
        throw new NotFoundException('Corrective action not found.');
      }
    }
    return this.tasks.save(this.tasks.create({
      ...dto,
      organizationId: user.organizationId,
      ownerUserId: user.organizationId ? null : user.userId,
      assignedToUserId: assigneeId,
      description: dto.description || null,
      siteId: dto.siteId || null,
      inspectionId: dto.inspectionId || null,
      correctiveActionId: dto.correctiveActionId || null,
      status: 'open',
      version: 1,
      createdByUserId: user.userId,
      completedAt: null,
    }));
  }

  async list(rawUser: unknown) {
    const user = requireAuthenticatedUser(rawUser);
    return this.tasks.find({
      where: user.organizationId
        ? { organizationId: user.organizationId }
        : { ownerUserId: user.userId },
      order: { dueDate: 'ASC' },
    });
  }

  async updateStatus(rawUser: unknown, id: string, dto: UpdateTaskStatusDto) {
    const user = requireAuthenticatedUser(rawUser);
    const task = await this.tasks.findOne({
      where: user.organizationId
        ? { id, organizationId: user.organizationId }
        : { id, ownerUserId: user.userId },
    });
    if (!task) throw new NotFoundException('Task not found.');
    task.status = dto.status;
    task.completedAt = dto.status === 'completed' ? new Date() : null;
    task.version += 1;
    return this.tasks.save(task);
  }

  /**
   * §276 / D-007 — THE SERVER'S CALENDAR IS THE AUTHORITATIVE ONE.
   *
   * Every piece of persisted due work an account can see, projected onto local calendar
   * days. The browser used to compose its calendar from three device-local stores and
   * never called this route at all, so §275 measured nine rows here against zero events
   * on screen. The read path now starts with this projection, so a disagreement between
   * the device and the server is no longer representable.
   *
   * `cancelled` work is excluded. A cancelled task is not due; leaving it on the calendar
   * asks the user to act on something nobody expects to happen.
   *
   * Corrective actions with no due date are excluded because a calendar is dated, and an
   * undated action has no day to be placed on. That is a real gap rather than a filter:
   * the inspection workflow now sends the risk-derived due date it already computes.
   */
  async calendar(rawUser: unknown) {
    const user = requireAuthenticatedUser(rawUser);
    const [tasks, actions] = await Promise.all([
      this.list(user),
      this.actions.find({
        where: user.organizationId
          ? { organizationId: user.organizationId }
          : { ownerUserId: user.userId, organizationId: IsNull() },
        order: { dueDate: 'ASC' },
      }),
    ]);
    const events = [
      ...tasks
        .filter(task => task.status !== 'cancelled' && Boolean(task.dueDate))
        .map(task => ({
          kind: 'task' as const,
          sourceId: task.id,
          // A `date` column. Passed through verbatim; there is no instant to convert.
          date: String(task.dueDate),
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          owner: null as string | null,
          inspectionId: task.inspectionId,
          correctiveActionId: task.correctiveActionId,
          findingId: null as string | null,
          completedAt: task.completedAt ? task.completedAt.toISOString() : null,
          createdAt: task.createdAt ? task.createdAt.toISOString() : null,
          updatedAt: task.updatedAt ? task.updatedAt.toISOString() : null,
          version: task.version,
          /**
           * Whether the calendar itself may edit or delete this row.
           *
           * A standalone task is the user's own scheduling and is theirs to change here.
           * Work generated by an inspection is part of that inspection's record, and is
           * managed from it -- the calendar may show and complete it, not silently
           * delete it.
           */
          editable: !task.inspectionId && !task.correctiveActionId,
        })),
      ...actions
        .filter(action => Boolean(action.dueDate) && action.statusCode !== 'cancelled')
        .map(action => ({
          kind: 'corrective_action' as const,
          sourceId: action.id,
          // §275. `toISOString()` reports the UTC day, so an action due in the local
          // evening was rendering on the FOLLOWING calendar day. Tasks alongside it are a
          // `date` column passed through verbatim; this makes the two agree.
          date: toCalendarDayKey(action.dueDate) as string,
          title: action.title,
          description: action.description,
          status: action.statusCode === 'closed' ? 'completed' : action.statusCode,
          priority: action.priorityCode,
          owner: action.assignedToName || null,
          inspectionId: action.inspectionId,
          correctiveActionId: action.id,
          findingId: action.findingId || null,
          completedAt: null as string | null,
          createdAt: action.createdAt ? action.createdAt.toISOString() : null,
          updatedAt: action.updatedAt ? action.updatedAt.toISOString() : null,
          version: null as number | null,
          editable: false,
        })),
    ];
    return events.sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date)));
  }

  /**
   * §276 / D-007 — edit a task in place.
   *
   * Acceptance scenario D requires a due date to be editable and the event to MOVE: the
   * old day has to clear. With no update route the browser could only do that in its own
   * store, which is exactly the independent local calendar D-007 forbids.
   *
   * Scoped by the same ownership rule as every other task read, and it bumps `version`
   * so a concurrent edit is still detectable by whatever reads it next.
   */
  async update(rawUser: unknown, id: string, dto: UpdateTaskDto) {
    const user = requireAuthenticatedUser(rawUser);
    const task = await this.tasks.findOne({
      where: user.organizationId
        ? { id, organizationId: user.organizationId }
        : { id, ownerUserId: user.userId },
    });
    if (!task) throw new NotFoundException('Task not found.');
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description || null;
    if (dto.dueDate !== undefined) {
      // The task column is a calendar DAY. Normalising through the shared helper keeps a
      // caller that sends an instant from landing on the UTC day rather than its own.
      const dayKey = toCalendarDayKey(dto.dueDate);
      if (!dayKey) throw new BadRequestException('dueDate must be a calendar date.');
      task.dueDate = dayKey;
    }
    if (dto.priority !== undefined) task.priority = dto.priority;
    task.version += 1;
    return this.tasks.save(task);
  }

  /**
   * §276 / D-007 — delete a standalone task.
   *
   * Only a task that belongs to nothing else. A task generated by an inspection or bound
   * to a corrective action is part of that record, and removing it from the calendar
   * would remove persisted inspection follow-up with no trace of the decision. Those are
   * closed, not deleted.
   */
  async remove(rawUser: unknown, id: string) {
    const user = requireAuthenticatedUser(rawUser);
    const task = await this.tasks.findOne({
      where: user.organizationId
        ? { id, organizationId: user.organizationId }
        : { id, ownerUserId: user.userId },
    });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.inspectionId || task.correctiveActionId) {
      throw new BadRequestException(
        'This task belongs to an inspection and is managed from it. Mark it complete instead.',
      );
    }
    await this.tasks.remove(task);
    return { deleted: true, id };
  }
}
