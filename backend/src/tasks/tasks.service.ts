import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { requireAuthenticatedUser } from '../common/authenticated-user';
import { Inspection } from '../inspection/inspection.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Site } from '../sites/entities/site.entity';
import { CreateTaskDto, UpdateTaskStatusDto } from './task.dto';
import { Task } from './task.entity';

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
    return [
      ...tasks.map(task => ({
        kind: 'task' as const,
        sourceId: task.id,
        date: task.dueDate,
        title: task.title,
        status: task.status,
        priority: task.priority,
      })),
      ...actions.filter(action => action.dueDate).map(action => ({
        kind: 'corrective_action' as const,
        sourceId: action.id,
        date: new Date(action.dueDate).toISOString().slice(0, 10),
        title: action.title,
        status: action.statusCode === 'closed' ? 'completed' : action.statusCode,
        priority: action.priorityCode,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date));
  }
}
