import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeScopeReasoningSnapshot } from './reasoning-snapshot.entity';

@Injectable()
export class ReasoningSnapshotService {
  constructor(
    @InjectRepository(SafeScopeReasoningSnapshot)
    private readonly snapshotRepo: Repository<SafeScopeReasoningSnapshot>,
  ) {}

  private getUserWorkspaceIds(user: any): string[] {
    return [
      user?.organizationId,
      user?.workspaceId,
      user?.tenantId,
    ]
      .filter(Boolean)
      .map((value) => String(value));
  }

  assertSnapshotAccess(
    snapshot: SafeScopeReasoningSnapshot | null,
    user: any,
  ): void {
    if (!snapshot) {
      return;
    }

    const snapshotWorkspaceId = snapshot.workspaceId
      ? String(snapshot.workspaceId)
      : null;

    if (!snapshotWorkspaceId) {
      if (
        process.env.DEV_AUTH_BYPASS === 'true' &&
        process.env.NODE_ENV !== 'production'
      ) {
        return;
      }

      throw new ForbiddenException(
        'Reasoning snapshot is missing workspace scope.',
      );
    }

    const userWorkspaceIds = this.getUserWorkspaceIds(user);

    if (!userWorkspaceIds.includes(snapshotWorkspaceId)) {
      throw new ForbiddenException(
        'Reasoning snapshot is outside the current workspace.',
      );
    }
  }

  buildSnapshot(input: {
    reportId?: string;
    workspaceId?: string;
    classification?: string;
    intelligence?: any;
  }): Partial<SafeScopeReasoningSnapshot> {
    const intelligence = input.intelligence || {};

    return {
      reportId: input.reportId,
      workspaceId: input.workspaceId,
      classification: input.classification,
      engineVersion: intelligence.intelligenceMetadata?.engineVersion,
      intelligenceMetadata: intelligence.intelligenceMetadata,
      confidenceCalibration: intelligence.confidenceCalibration,
      reasoningDrift: intelligence.reasoningDrift,
      workspaceLearning: intelligence.workspaceLearning,
      operationalReasoning: intelligence.operationalReasoning,
      standardsReasoning: intelligence.standardsReasoning,
      decisionExplainability: intelligence.decisionExplainability,
      equipmentReasoningSummary: intelligence.equipmentReasoningSummary,
      equipmentTaskMechanismContext: intelligence.equipmentTaskMechanismContext,
      equipmentArchetypeContext: intelligence.equipmentArchetypeContext,
      fullIntelligenceSnapshot: intelligence,
      validationStatus:
        intelligence.reasoningDrift?.driftBand === 'high' ||
        intelligence.confidenceCalibration?.calibrationBand === 'limited_reliability'
          ? 'requires_review'
          : 'generated',
    };
  }

  async findOne(id: string) {
    return this.snapshotRepo.findOne({ where: { id } });
  }

  buildSnapshotSummary(snapshot: SafeScopeReasoningSnapshot | null) {
    if (!snapshot) {
      return null;
    }

    return {
      id: snapshot.id,
      reportId: snapshot.reportId,
      workspaceId: snapshot.workspaceId,
      classification: snapshot.classification,
      engineVersion: snapshot.engineVersion,
      validationStatus: snapshot.validationStatus,
      createdAt: snapshot.createdAt,
      intelligenceMetadata: snapshot.intelligenceMetadata,
      confidenceCalibration: snapshot.confidenceCalibration,
      reasoningDrift: snapshot.reasoningDrift,
      operationalReasoning: snapshot.operationalReasoning,
      standardsReasoning: snapshot.standardsReasoning,
      decisionExplainability: snapshot.decisionExplainability,
      equipmentReasoningSummary: snapshot.equipmentReasoningSummary,
      equipmentTaskMechanismContext: snapshot.equipmentTaskMechanismContext,
      equipmentArchetypeContext: snapshot.equipmentArchetypeContext,
      reviewBoundary: {
        advisoryOnly: true,
        contextOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        doesNotOverrideRegulation: true,
        requiresQualifiedReview: true,
      },
      rawSnapshotAvailable: Boolean(snapshot.fullIntelligenceSnapshot),
    };
  }

  async findSummary(id: string) {
    const snapshot = await this.findOne(id);
    return this.buildSnapshotSummary(snapshot);
  }

  async findSummaryForUser(id: string, user: any) {
    const snapshot = await this.findOne(id);
    this.assertSnapshotAccess(snapshot, user);
    return this.buildSnapshotSummary(snapshot);
  }

  async findRawForUser(id: string, user: any) {
    const snapshot = await this.findOne(id);
    this.assertSnapshotAccess(snapshot, user);
    return snapshot;
  }

  async updateValidationStatus(
    id: string,
    validationStatus: string,
  ) {
    await this.snapshotRepo.update({ id }, { validationStatus });
    return this.findOne(id);
  }

  async createSnapshot(input: {
    reportId?: string;
    workspaceId?: string;
    classification?: string;
    intelligence?: any;
  }) {
    const snapshot = this.snapshotRepo.create(this.buildSnapshot(input));
    return this.snapshotRepo.save(snapshot);
  }
}
