import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { AuthenticatedUser, isOrganizationManager, requireAuthenticatedUser } from '../common/authenticated-user';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { SitesService } from '../sites/sites.service';
import {
  AssignInspectionDto,
  CreateAnalysisSnapshotDto,
  CreateHumanReviewDto,
  CreateInspectionDto,
  CreateObservationDto,
  UpdateObservationDto,
  FinalizeFindingDto,
  TransitionInspectionDto,
  UpdateInspectionDto,
} from './dto/inspection.dto';
import { HazLenzAnalysis } from './entities/hazlenz-analysis.entity';
import { HumanReview } from './entities/human-review.entity';
import { InspectionAssignment } from './entities/inspection-assignment.entity';
import { InspectionFinding } from './entities/inspection-finding.entity';
import { Observation } from './entities/observation.entity';
import { Inspection } from './inspection.entity';
import { materialRiskChanged, urgencyForRisk } from './risk-policy';
import { evaluateRisk } from '../safescope-v2/risk/risk-engine';
import { hazardFamilyToRiskClassification } from './finding-risk.mapping';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection) private readonly inspections: Repository<Inspection>,
    @InjectRepository(InspectionAssignment) private readonly assignments: Repository<InspectionAssignment>,
    @InjectRepository(Observation) private readonly observations: Repository<Observation>,
    @InjectRepository(HazLenzAnalysis) private readonly analyses: Repository<HazLenzAnalysis>,
    @InjectRepository(HumanReview) private readonly reviews: Repository<HumanReview>,
    @InjectRepository(InspectionFinding) private readonly findings: Repository<InspectionFinding>,
    @InjectRepository(OrganizationMembership) private readonly memberships: Repository<OrganizationMembership>,
    @InjectRepository(SecurityAuditEvent) private readonly audits: Repository<SecurityAuditEvent>,
    private readonly sites: SitesService,
    private readonly dataSource: DataSource,
  ) {}

  private async canAccessDraft(user: AuthenticatedUser, inspection: Inspection) {
    if (inspection.createdByUserId === user.userId) return true;
    if (inspection.organizationId && inspection.organizationId === user.organizationId && isOrganizationManager(user)) return true;
    return !!(await this.assignments.findOne({
      where: { inspectionId: inspection.id, userId: user.userId, endedAt: IsNull() },
    }));
  }

  async findAccessible(rawUser: unknown, id: string, requireEdit = false): Promise<Inspection> {
    const user = requireAuthenticatedUser(rawUser);
    const inspection = await this.inspections.findOne({ where: { id } });
    if (!inspection) throw new NotFoundException('Inspection not found.');
    const sameScope = inspection.organizationId
      ? inspection.organizationId === user.organizationId
      : inspection.ownerUserId === user.userId;
    if (!sameScope) throw new NotFoundException('Inspection not found.');
    if ((inspection.status === 'draft' || inspection.status === 'in_review') &&
        !(await this.canAccessDraft(user, inspection))) {
      throw new NotFoundException('Inspection not found.');
    }
    if (requireEdit && inspection.status === 'completed') {
      throw new ConflictException('Completed inspections must be reopened before editing.');
    }
    if (requireEdit && inspection.status === 'archived') {
      throw new ConflictException('Archived inspections cannot be edited.');
    }
    return inspection;
  }

  async create(rawUser: unknown, dto: CreateInspectionDto) {
    const user = requireAuthenticatedUser(rawUser);
    const site = await this.sites.findAccessible(user, dto.siteId);
    return this.inspections.save(this.inspections.create({
      title: dto.title.trim(),
      siteId: site.id,
      organizationId: site.organizationId,
      ownerUserId: site.ownerUserId,
      createdByUserId: user.userId,
      status: 'draft',
      version: 1,
      completedAt: null,
      completedByUserId: null,
      archivedAt: null,
    }));
  }

  async list(rawUser: unknown) {
    const user = requireAuthenticatedUser(rawUser);
    const query = this.inspections.createQueryBuilder('inspection')
      .leftJoin('inspection.assignments', 'assignment',
        'assignment.userId = :userId AND assignment.endedAt IS NULL', { userId: user.userId })
      .where(user.organizationId
        ? 'inspection.organizationId = :scopeId'
        : 'inspection.ownerUserId = :scopeId', { scopeId: user.organizationId || user.userId })
      .andWhere(`(
        inspection.status IN ('completed', 'archived')
        OR inspection.createdByUserId = :userId
        OR assignment.id IS NOT NULL
        OR :manager = true
      )`, { userId: user.userId, manager: isOrganizationManager(user) })
      .orderBy('inspection.updatedAt', 'DESC');
    return query.getMany();
  }

  async get(rawUser: unknown, id: string) {
    const inspection = await this.findAccessible(rawUser, id);
    return this.inspections.findOne({
      where: { id: inspection.id },
      relations: ['observations', 'observations.analyses', 'observations.reviews', 'findings', 'assignments'],
    });
  }

  async update(rawUser: unknown, id: string, dto: UpdateInspectionDto) {
    const inspection = await this.findAccessible(rawUser, id, true);
    if (inspection.version !== dto.version) throw new ConflictException('Inspection was modified by another request.');
    if (dto.title !== undefined) inspection.title = dto.title.trim();
    inspection.version += 1;
    return this.inspections.save(inspection);
  }

  async assign(rawUser: unknown, id: string, dto: AssignInspectionDto) {
    const user = requireAuthenticatedUser(rawUser);
    const inspection = await this.findAccessible(user, id, true);
    if (!inspection.organizationId) throw new BadRequestException('Private inspections cannot be assigned.');
    if (inspection.createdByUserId !== user.userId && !isOrganizationManager(user)) {
      throw new ForbiddenException('Only the creator or a manager may assign collaborators.');
    }
    const member = await this.memberships.findOne({
      where: { userId: dto.userId, organizationId: inspection.organizationId, status: 'active' },
    });
    if (!member) throw new NotFoundException('Organization member not found.');
    const existing = await this.assignments.findOne({
      where: { inspectionId: id, userId: dto.userId, role: dto.role },
    });
    if (existing && !existing.endedAt) return existing;
    const assignment = existing || this.assignments.create({
      inspectionId: id,
      userId: dto.userId,
      role: dto.role,
      assignedByUserId: user.userId,
    });
    assignment.endedAt = null;
    return this.assignments.save(assignment);
  }

  async transition(rawUser: unknown, id: string, dto: TransitionInspectionDto) {
    const user = requireAuthenticatedUser(rawUser);
    const inspection = await this.findAccessible(user, id);
    if (inspection.version !== dto.version) throw new ConflictException('Inspection was modified by another request.');
    const allowed: Record<string, string[]> = {
      draft: ['in_review', 'archived'],
      in_review: ['draft', 'completed', 'archived'],
      completed: ['draft', 'archived'],
      archived: ['draft'],
    };
    if (!allowed[inspection.status]?.includes(dto.status)) {
      throw new BadRequestException(`Transition ${inspection.status} -> ${dto.status} is not allowed.`);
    }
    if (inspection.status === 'completed' && dto.status === 'draft' && !isOrganizationManager(user) &&
        inspection.ownerUserId !== user.userId) {
      throw new ForbiddenException('Manager access is required to reopen this inspection.');
    }
    if (dto.status === 'in_review') {
      const count = await this.observations.count({ where: { inspectionId: id } });
      if (!count) throw new BadRequestException('At least one observation is required.');
    }
    if (dto.status === 'completed') {
      const observations = await this.observations.find({ where: { inspectionId: id }, select: ['id'] });
      if (!observations.length) throw new BadRequestException('At least one observation is required.');
      const required = observations.map(item => item.id);
      const currentFindings = await this.findings.find({
        where: required.map(observationId => ({ inspectionId: id, observationId })),
      });
      const active = currentFindings.filter(finding => finding.status !== 'superseded');
      const reviewIds = active.map(finding => finding.finalReviewId).filter((value): value is string => !!value);
      const distinctReviewIds = [...new Set(reviewIds)];
      const validReviews = distinctReviewIds.length
        ? await this.reviews.count({ where: distinctReviewIds.map(reviewId => ({ id: reviewId, status: 'current' as const })) })
        : 0;
      if (active.length === 0 || validReviews !== distinctReviewIds.length || active.some(finding =>
        !['finalized', 'dismissed'].includes(finding.status) || !finding.finalReviewId)) {
        throw new BadRequestException('Every current finding requires a completed human review before finalization.');
      }
      inspection.completedAt = new Date();
      inspection.completedByUserId = user.userId;
    }
    if (dto.status === 'archived') inspection.archivedAt = new Date();
    if (inspection.status === 'completed' && dto.status === 'draft') {
      inspection.completedAt = null;
      inspection.completedByUserId = null;
    }
      inspection.status = dto.status;
      inspection.version += 1;
    const saved = await this.inspections.save(inspection);
    await this.audits.save(this.audits.create({
      actorUserId: user.userId, organizationId: inspection.organizationId,
      action: dto.status === 'completed' ? 'inspection_finalized' : 'inspection_transitioned',
      resourceType: 'inspection', resourceId: inspection.id,
      metadata: { inspectionId: inspection.id, status: dto.status, version: inspection.version },
    }));
    return saved;
  }

  async addObservation(rawUser: unknown, inspectionId: string, dto: CreateObservationDto) {
    const user = requireAuthenticatedUser(rawUser);
    await this.findAccessible(user, inspectionId, true);
    return this.observations.save(this.observations.create({
      inspectionId,
      rawText: dto.rawText.trim(),
      evidenceSource: dto.evidenceSource || 'direct_observation',
      version: 1,
      createdByUserId: user.userId,
    }));
  }

  async updateObservation(rawUser: unknown, observationId: string, dto: UpdateObservationDto) {
    const user = requireAuthenticatedUser(rawUser);
    const { observation, inspection } = await this.accessibleObservation(user, observationId);
    if (observation.version !== dto.version) {
      throw new ConflictException('Observation was modified by another request.');
    }
    if (inspection.status === 'archived') {
      throw new ConflictException('Archived inspections cannot be edited.');
    }
    const previousVersion = observation.version;
    observation.rawText = dto.rawText.trim();
    observation.version += 1;
    const saved = await this.observations.save(observation);
    await this.audits.save(this.audits.create({
      actorUserId: user.userId,
      organizationId: inspection.organizationId,
      action: 'observation_updated',
      resourceType: 'observation',
      resourceId: observation.id,
      metadata: {
        inspectionId: inspection.id,
        observationId: observation.id,
        previousVersion,
        version: saved.version,
      },
    }));
    return saved;
  }

  private async accessibleObservation(rawUser: unknown, observationId: string) {
    const observation = await this.observations.findOne({ where: { id: observationId } });
    if (!observation) throw new NotFoundException('Observation not found.');
    const inspection = await this.findAccessible(rawUser, observation.inspectionId);
    return { observation, inspection };
  }

  async authorizeObservation(rawUser: unknown, observationId: string) {
    return this.accessibleObservation(rawUser, observationId);
  }

  async addAnalysis(rawUser: unknown, observationId: string, dto: CreateAnalysisSnapshotDto) {
    const user = requireAuthenticatedUser(rawUser);
    const { observation } = await this.accessibleObservation(user, observationId);
    const replay = await this.analyses.findOne({
      where: { observationId, idempotencyKey: dto.idempotencyKey },
    });
    if (replay) return replay;
    try {
      return await this.dataSource.transaction(async manager => {
        const repository = manager.getRepository(HazLenzAnalysis);
        await manager.query(
          `SELECT pg_advisory_xact_lock(hashtext($1))`,
          [`hazlenz-analysis:${observationId}`],
        );
        const latest = await repository.findOne({
          where: { observationId },
          order: { requestVersion: 'DESC' },
          lock: { mode: 'pessimistic_write' },
        });
        if (latest && dto.requestVersion <= latest.requestVersion) {
          throw new ConflictException('A newer analysis request already exists.');
        }
        if (latest?.status === 'current') {
          latest.status = 'superseded';
          await repository.save(latest);
        }
        const saved = await repository.save(repository.create({
          observationId,
          engineVersion: dto.engineVersion,
          traceId: dto.traceId || null,
          idempotencyKey: dto.idempotencyKey,
          requestVersion: dto.requestVersion,
          status: 'current',
          resultSnapshot: dto.resultSnapshot,
          advisoryStatus: 'advisory',
          requestedByUserId: user.userId,
        }));
        await this.reconcileDecompositionFindings(manager, observation, saved);
        return saved;
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const concurrentReplay = await this.analyses.findOne({
          where: { observationId, idempotencyKey: dto.idempotencyKey },
        });
        if (concurrentReplay) return concurrentReplay;
        throw new ConflictException('A newer analysis request already exists.');
      }
      throw error;
    }
  }

  private stableHazardKey(hazard: Record<string, unknown>, index: number): string {
    const raw = String(hazard.domainId || hazard.hazardFamily || hazard.hazardId || hazard.mechanism || `hazard-${index + 1}`)
      .trim().toLowerCase();
    return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120) || `hazard-${index + 1}`;
  }

  /**
   * V5-C01 (finding-scoped risk / PRA-006). Computes risk independently for ONE decomposed
   * hazard, consuming only that hazard's own evidence (observationFragment, mechanism,
   * supportingSignals, hazardFamily, conditionState) -- never sibling-hazard data and never
   * the whole fused observation text. Reuses the existing, unmodified risk/risk-engine.ts
   * evaluateRisk() (the authoritative engine driving persisted/user-visible risk today) as
   * a pure function; does not call, modify, or depend on the classifier or decomposition
   * engine. If a hazard carries no usable evidence text, returns null rather than
   * fabricating a risk assessment.
   */
  private computeFindingRisk(
    hazard: Record<string, unknown>,
    hazardKey: string,
    riskProfileId: 'simple_4x4' | 'standard_5x5' | 'advanced_6x6',
  ): Record<string, unknown> | null {
    const fragment = String(hazard.observationFragment || '').trim();
    const mechanism = String(hazard.mechanism || '').trim();
    const supportingSignals = Array.isArray(hazard.supportingSignals)
      ? (hazard.supportingSignals as unknown[]).map(item => String(item || '').trim()).filter(Boolean)
      : [];
    const evidenceText = [fragment, mechanism, ...supportingSignals].filter(Boolean).join('. ');
    if (!evidenceText) return null;
    const hazardFamily = String(hazard.hazardFamily || hazard.domainId || '');
    const classification = hazardFamilyToRiskClassification(hazardFamily);
    const conditionState = String(hazard.conditionState || 'UNKNOWN').toUpperCase();
    if (['HISTORICAL', 'SAFE_VERIFIED'].includes(conditionState)) {
      return null;
    }
    const risk = evaluateRisk({ text: evidenceText, classification, riskProfileId });
    return {
      ...risk,
      source: 'system_generated',
      hazardKey,
      hazardFamily,
      conditionState,
      evidenceUsed: evidenceText,
    };
  }

  private async reconcileDecompositionFindings(
    manager: import('typeorm').EntityManager,
    observation: Observation,
    analysis: HazLenzAnalysis,
  ) {
    const snapshot = analysis.resultSnapshot as Record<string, unknown>;
    const decomposition = snapshot.multiHazardDecomposition as { hazards?: unknown[] } | undefined;
    const hazards = Array.isArray(decomposition?.hazards)
      ? decomposition.hazards.filter((value): value is Record<string, unknown> => !!value && typeof value === 'object')
      : [];
    if (hazards.length === 0) return;
    const riskProfileId = (
      (snapshot.risk as any)?.operationalRisk?.profileId as 'simple_4x4' | 'standard_5x5' | 'advanced_6x6' | undefined
    ) || 'standard_5x5';

    const repository = manager.getRepository(InspectionFinding);
    const current = await repository.find({
      where: { observationId: observation.id },
      order: { createdAt: 'ASC' },
    });
    const incomingKeys = new Set<string>();
    for (const [index, hazard] of hazards.entries()) {
      const hazardKey = this.stableHazardKey(hazard, index);
      incomingKeys.add(hazardKey);
      const existing = current
        .filter(item => item.hazardKey === hazardKey && item.status !== 'superseded')
        .sort((a, b) => b.revision - a.revision)[0];
      const family = String(hazard.hazardFamily || hazard.domainId || 'Safety observation');
      const mechanism = String(hazard.mechanism || hazard.observationFragment || family);
      const candidate = { ...hazard, hazardKey };
      const riskSnapshot = this.computeFindingRisk(hazard, hazardKey, riskProfileId);
      if (existing) {
        // Captured before mutation below so the V5-C01 risk-change comparison is
        // meaningful (unlike the pre-existing conclusion/sourceCandidate comparison
        // further down, which this change intentionally leaves untouched -- fixing
        // that is out of scope for finding-scoped risk).
        const previousRiskSnapshot = existing.riskSnapshot;
        existing.selectedAnalysisId = analysis.id;
        existing.originatingAnalysisId = existing.originatingAnalysisId || analysis.id;
        existing.hazardCategory = family;
        existing.sourceCandidate = candidate;
        existing.conclusion = mechanism;
        existing.riskSnapshot = riskSnapshot;
        const changed = existing.conclusion !== mechanism || JSON.stringify(existing.sourceCandidate) !== JSON.stringify(candidate) ||
          JSON.stringify(previousRiskSnapshot) !== JSON.stringify(riskSnapshot);
        if (changed && existing.finalReviewId) {
          await manager.getRepository(HumanReview).update(
            { id: existing.finalReviewId, status: 'current' },
            { status: 'invalidated' },
          );
        }
        if (changed && (existing.status === 'finalized' || existing.status === 'dismissed')) {
          existing.status = 'pending_review';
          existing.finalReviewId = null;
          existing.finalizedByUserId = null;
        }
        await repository.save(existing);
        await manager.getRepository(SecurityAuditEvent).save(manager.getRepository(SecurityAuditEvent).create({
          actorUserId: analysis.requestedByUserId,
          organizationId: null,
          action: changed ? 'finding_materially_changed' : 'finding_retained_unchanged',
          resourceType: 'inspection_finding', resourceId: existing.id,
          metadata: { observationId: observation.id, findingId: existing.id, hazardKey, analysisId: analysis.id, requestVersion: analysis.requestVersion },
        }));
      } else {
        const created = await repository.save(repository.create({
          inspectionId: observation.inspectionId,
          observationId: observation.id,
          selectedAnalysisId: analysis.id,
          originatingAnalysisId: analysis.id,
          finalReviewId: null,
          status: 'pending_review',
          hazardCategory: family,
          segmentKey: hazardKey,
          hazardKey,
          sourceCandidate: candidate,
          riskSnapshot,
          reviewerDisposition: hazards.length > 1 ? 'split' : 'single',
          conclusion: mechanism,
          revision: 1,
          finalizedByUserId: null,
        }));
        await manager.getRepository(SecurityAuditEvent).save(manager.getRepository(SecurityAuditEvent).create({
          actorUserId: analysis.requestedByUserId,
          organizationId: null,
          action: 'finding_materialized', resourceType: 'inspection_finding', resourceId: created.id,
          metadata: { observationId: observation.id, findingId: created.id, hazardKey, analysisId: analysis.id, requestVersion: analysis.requestVersion },
        }));
      }
    }
    for (const item of current) {
      if (item.status !== 'superseded' && !incomingKeys.has(item.hazardKey)) {
        item.status = 'superseded';
        item.selectedAnalysisId = analysis.id;
        await repository.save(item);
        await manager.getRepository(SecurityAuditEvent).save(manager.getRepository(SecurityAuditEvent).create({
          actorUserId: analysis.requestedByUserId,
          organizationId: null,
          action: 'finding_superseded', resourceType: 'inspection_finding', resourceId: item.id,
          metadata: { observationId: observation.id, findingId: item.id, hazardKey: item.hazardKey, analysisId: analysis.id, requestVersion: analysis.requestVersion },
        }));
      }
    }
  }

  async addReview(rawUser: unknown, observationId: string, dto: CreateHumanReviewDto) {
    const user = requireAuthenticatedUser(rawUser);
    const { inspection } = await this.accessibleObservation(user, observationId);
    let finding: InspectionFinding | null = null;
    if (dto.findingId) {
      finding = await this.findings.findOne({ where: { id: dto.findingId, observationId, inspectionId: inspection.id } });
      if (!finding || finding.status === 'superseded') throw new NotFoundException('Current finding not found.');
      if (dto.idempotencyKey) {
        const replay = await this.reviews.findOne({ where: { findingId: finding.id, idempotencyKey: dto.idempotencyKey } });
        if (replay) return replay;
      }
      const current = await this.reviews.findOne({ where: { findingId: finding.id, status: 'current' } });
      if (current) {
        if (dto.idempotencyKey && current.idempotencyKey === dto.idempotencyKey) return current;
        current.status = 'superseded';
        await this.reviews.save(current);
      }
    }
    let analysis: HazLenzAnalysis | null = null;
    if (dto.analysisId) {
      analysis = await this.analyses.findOne({ where: { id: dto.analysisId, observationId } });
      if (!analysis) throw new NotFoundException('Analysis not found.');
    }
    const reviewedConclusion = dto.reviewedConclusion
      ? { ...dto.reviewedConclusion }
      : null;
    const proposedRisk = (analysis?.resultSnapshot as any)?.guidedFinding?.riskAssessment;
    const reviewerRisk = (reviewedConclusion as any)?.reviewerRisk;
    if (proposedRisk && reviewerRisk) {
      if (materialRiskChanged(proposedRisk, reviewerRisk) && dto.rationale.trim().length < 10) {
        throw new BadRequestException('A specific rationale is required for a material risk override.');
      }
      (reviewedConclusion as any).riskPolicy = urgencyForRisk(reviewerRisk.overallRisk);
    }
    const review = await this.reviews.save(this.reviews.create({
      observationId,
      findingId: finding?.id || null,
      idempotencyKey: dto.idempotencyKey || null,
      status: 'current',
      analysisId: dto.analysisId || null,
      decision: dto.decision,
      rationale: dto.rationale.trim(),
      reviewedConclusion,
      reviewedByUserId: user.userId,
    }));
    await this.audits.save(this.audits.create({
      actorUserId: user.userId, organizationId: inspection.organizationId,
      action: finding ? 'finding_review_created' : 'review_created',
      resourceType: 'human_review', resourceId: review.id,
      metadata: { inspectionId: inspection.id, observationId, findingId: finding?.id || null, analysisId: review.analysisId, decision: review.decision },
    }));
    return review;
  }

  async finalizeFinding(rawUser: unknown, observationId: string, dto: FinalizeFindingDto) {
    const user = requireAuthenticatedUser(rawUser);
    const { observation, inspection } = await this.accessibleObservation(user, observationId);
    const review = await this.reviews.findOne({ where: { id: dto.reviewId, observationId } });
    if (!review) throw new NotFoundException('Human review not found.');
    if (review.status !== 'current') throw new ConflictException('This review is no longer current. Refresh before finalizing.');
    if (review.findingId && review.findingId !== (dto.segmentKey || 'primary')) {
      const reviewedFinding = await this.findings.findOne({ where: { id: review.findingId, observationId } });
      if (reviewedFinding && reviewedFinding.hazardKey !== (dto.segmentKey || 'primary')) {
        throw new ConflictException('This review belongs to a different finding. Refresh before finalizing.');
      }
    }
    const status = review.decision === 'dismissed' ? 'dismissed' : 'finalized';
    const segmentKey = (dto.segmentKey || 'primary').trim().toLowerCase();
    return this.dataSource.transaction(async manager => {
      const repository = manager.getRepository(InspectionFinding);
      const existing = await repository.findOne({
        where: { observationId, hazardKey: segmentKey },
        order: { revision: 'DESC' },
      });
      if (existing && existing.status !== 'superseded') {
        existing.inspectionId = inspection.id;
        existing.selectedAnalysisId = review.analysisId;
        existing.finalReviewId = review.id;
        existing.status = status as 'finalized' | 'dismissed';
        existing.hazardCategory = dto.hazardCategory || existing.hazardCategory;
        existing.segmentKey = segmentKey;
        existing.hazardKey = segmentKey;
        existing.sourceCandidate = dto.sourceCandidate || existing.sourceCandidate;
        existing.reviewerDisposition = dto.reviewerDisposition || existing.reviewerDisposition;
        existing.conclusion = dto.conclusion.trim();
        existing.finalizedByUserId = user.userId;
        if (dto.riskAssessment) {
          existing.riskSnapshot = { ...dto.riskAssessment, source: 'reviewer_confirmed', reviewerConfirmedByUserId: user.userId };
        }
        const saved = await repository.save(existing);
        await manager.getRepository(SecurityAuditEvent).save(manager.getRepository(SecurityAuditEvent).create({
          actorUserId: user.userId, organizationId: inspection.organizationId,
          action: 'finding_review_finalized', resourceType: 'inspection_finding', resourceId: saved.id,
          metadata: { inspectionId: inspection.id, observationId, findingId: saved.id, reviewId: review.id, analysisId: review.analysisId, status },
        }));
        return saved;
      }
      const saved = await repository.save(repository.create({
        inspectionId: inspection.id,
        observationId: observation.id,
        selectedAnalysisId: review.analysisId,
        originatingAnalysisId: review.analysisId,
        finalReviewId: review.id,
        status,
        hazardCategory: dto.hazardCategory || null,
        segmentKey,
        hazardKey: segmentKey,
        sourceCandidate: dto.sourceCandidate || null,
        riskSnapshot: dto.riskAssessment
          ? { ...dto.riskAssessment, source: 'reviewer_confirmed', reviewerConfirmedByUserId: user.userId }
          : null,
        reviewerDisposition: dto.reviewerDisposition || 'single',
        conclusion: dto.conclusion.trim(),
        revision: (existing?.revision || 0) + 1,
        finalizedByUserId: user.userId,
      }));
      await manager.getRepository(SecurityAuditEvent).save(manager.getRepository(SecurityAuditEvent).create({
        actorUserId: user.userId, organizationId: inspection.organizationId,
        action: 'finding_review_finalized', resourceType: 'inspection_finding', resourceId: saved.id,
        metadata: { inspectionId: inspection.id, observationId, findingId: saved.id, reviewId: review.id, analysisId: review.analysisId, status },
      }));
      return saved;
    });
  }
}
