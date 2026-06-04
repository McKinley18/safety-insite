import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeScopeSupervisorValidation } from './supervisor-validation.entity';
import { ReasoningSnapshotService } from '../snapshots/reasoning-snapshot.service';

type SupervisorValidationDecision =
  | 'accepted'
  | 'modified'
  | 'rejected'
  | 'escalated'
  | 'insufficient_evidence';

const VALIDATION_STATUS_BY_DECISION: Record<SupervisorValidationDecision, string> = {
  accepted: 'validated_accepted',
  modified: 'validated_modified',
  rejected: 'validated_rejected',
  escalated: 'requires_escalation',
  insufficient_evidence: 'requires_more_evidence',
};

@Injectable()
export class SupervisorValidationService {
  constructor(
    @InjectRepository(SafeScopeSupervisorValidation)
    private readonly validationRepo: Repository<SafeScopeSupervisorValidation>,
    private readonly reasoningSnapshots: ReasoningSnapshotService,
  ) {}

  private getUserWorkspaceId(user: any): string | null {
    const value = user?.organizationId || user?.workspaceId || user?.tenantId;
    return value ? String(value) : null;
  }

  private normalizeDecision(value: any): SupervisorValidationDecision {
    const decision = String(value || 'accepted') as SupervisorValidationDecision;

    if (
      ![
        'accepted',
        'modified',
        'rejected',
        'escalated',
        'insufficient_evidence',
      ].includes(decision)
    ) {
      throw new ForbiddenException('Unsupported supervisor validation decision.');
    }

    return decision;
  }

  async createValidation(input: Partial<SafeScopeSupervisorValidation>) {
    const validation = this.validationRepo.create(input);
    return this.validationRepo.save(validation);
  }

  async createValidationForUser(
    input: Partial<SafeScopeSupervisorValidation>,
    user: any,
  ) {
    const snapshot = await this.reasoningSnapshots.findOne(
      String(input.reasoningSnapshotId || ''),
    );

    if (!snapshot) {
      throw new NotFoundException('Reasoning snapshot was not found.');
    }

    this.reasoningSnapshots.assertSnapshotAccess(snapshot, user);

    const userWorkspaceId = this.getUserWorkspaceId(user);

    if (!userWorkspaceId) {
      throw new ForbiddenException(
        'Supervisor validation requires workspace scope.',
      );
    }

    const decision = this.normalizeDecision(input.validationDecision);

    const validation = this.validationRepo.create({
      reasoningSnapshotId: snapshot.id,
      reportId: input.reportId || snapshot.reportId,
      workspaceId: userWorkspaceId,
      reviewerName:
        input.reviewerName ||
        user?.name ||
        user?.email ||
        String(user?.userId || 'Reviewer'),
      validationDecision: decision,
      reviewerNotes: input.reviewerNotes,
      modifiedClassification: input.modifiedClassification,
      modifiedStandards: input.modifiedStandards,
      modifiedRiskAssessment: input.modifiedRiskAssessment,
      validationMetadata: {
        ...(input.validationMetadata || {}),
        snapshotClassification: snapshot.classification,
        previousSnapshotStatus: snapshot.validationStatus,
        validatedAt: new Date().toISOString(),
        validatedByUserId: user?.userId || user?.sub || null,
        validatedByEmail: user?.email || null,
        workspaceScoped: true,
      },
    });

    const saved = await this.validationRepo.save(validation);

    await this.reasoningSnapshots.updateValidationStatus(
      snapshot.id,
      VALIDATION_STATUS_BY_DECISION[decision],
    );

    return saved;
  }

  async getValidationHistory(reasoningSnapshotId: string) {
    return this.validationRepo.find({
      where: { reasoningSnapshotId },
      order: { createdAt: 'DESC' },
    });
  }

  async getValidationHistoryForUser(reasoningSnapshotId: string, user: any) {
    const snapshot = await this.reasoningSnapshots.findOne(reasoningSnapshotId);

    if (!snapshot) {
      throw new NotFoundException('Reasoning snapshot was not found.');
    }

    this.reasoningSnapshots.assertSnapshotAccess(snapshot, user);

    const userWorkspaceId = this.getUserWorkspaceId(user);

    if (!userWorkspaceId) {
      throw new ForbiddenException(
        'Supervisor validation history requires workspace scope.',
      );
    }

    return this.validationRepo.find({
      where: {
        reasoningSnapshotId,
        workspaceId: userWorkspaceId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getWorkspaceValidationSignals(workspaceId?: string) {
    if (!workspaceId) return [];

    return this.validationRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      take: 500,
    });
  }
}
