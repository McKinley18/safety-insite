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
import { isUniqueViolation } from '../common/unique-violation';
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
  CreateUserAuthoredFindingDto,
} from './dto/inspection.dto';
import { HazLenzAnalysis } from './entities/hazlenz-analysis.entity';
import {
  ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION, ANALYSIS_AUDIT_RESOURCE_TYPE,
  auditMetadataForClientSuppliedAnalysisCreation,
} from '../hazlenz/expert-hazlenz-product/expert-analysis-audit';
import {
  CLIENT_SUPPLIED_ANALYSIS_STATE,
} from '../hazlenz/expert-hazlenz-product/expert-analysis-authority';
import {
  DETERMINISTIC_PRODUCER, highestReservedRequestVersion, maySupersede,
} from '../hazlenz/expert-hazlenz-product/expert-analysis-currentness';
import {
  projectAnalysesForGenericRead,
} from '../hazlenz/expert-hazlenz-product/expert-analysis-read-projection';
import {
  ExpertEffectiveDecisionService,
} from '../hazlenz/expert-hazlenz-product/expert-effective-decision.service';
import { HumanReview } from './entities/human-review.entity';
import { InspectionAssignment } from './entities/inspection-assignment.entity';
import { InspectionFinding } from './entities/inspection-finding.entity';
import { Observation } from './entities/observation.entity';
import { Inspection } from './inspection.entity';
import { materialRiskChanged, urgencyForRisk } from './risk-policy';
import { resolveKnowledgeReleaseProvenance } from './knowledge-release-provenance';
import { annotateFindingStandardsAuthority } from './finding-standards-authority-annotation';
import { readInspectionReleaseBinding } from '../standards/releases/inspection-release-binding';
import {
  resolveCutoverEnablement, modeInfluencesCustomerOutput,
} from '../standards/cutover/cutover-mode';
import { enforceShadowProvenanceInvariant } from '../standards/cutover/shadow-provenance-invariant';
import { shadowMetrics } from '../standards/cutover/shadow-operational-metrics';

/**
 * §276 / D-008 — WRITE A REVIEWER-CONFIRMED SNAPSHOT THAT IS TRUE ABOUT ITS OWN CONTENTS.
 *
 * The reviewer's matrix values are merged ON TOP of the finding's system snapshot, so the
 * finding keeps its corrective-action intelligence, hazard key and evidence. That part was
 * already right. What was wrong is that the merged object was then stamped
 * `source: 'reviewer_confirmed'` WHOLE -- including the `riskBand` key, which carries
 * HazLenz's ESCALATION band and no person ever chose.
 *
 * §275 read that record back as: Critical, attributed to `reviewer_confirmed`, beside the
 * rationale "severity 4 x likelihood 4 = 16" -- and 16 is High. The record named a person
 * as the author of a number they did not pick, and the report printed it.
 *
 * The escalation band is not discarded: it moves to `analysisRiskBand`, where it is
 * plainly HazLenz's and is still available to the report as labelled provenance. What it
 * can no longer do is sit inside a reviewer-confirmed object under a name that every
 * consumer reads as "the band".
 *
 * `resolveEffectiveSeverity` reads BOTH shapes correctly, so rows written before this
 * repair resolve to the reviewer's band without a data migration. This makes the stored
 * record honest going forward; it is not what makes the product agree with itself.
 */
function withReviewerConfirmedRisk(
  existingSnapshot: Record<string, unknown> | null,
  reviewerRisk: Record<string, unknown>,
  reviewerUserId: string,
): Record<string, unknown> {
  const base = { ...((existingSnapshot || {}) as Record<string, unknown>) };
  const analysisBand =
    (typeof base.analysisRiskBand === 'string' && base.analysisRiskBand) ||
    (typeof base.riskBand === 'string' && base.riskBand) ||
    null;
  delete base.riskBand;

  return {
    ...base,
    ...(analysisBand ? { analysisRiskBand: analysisBand } : {}),
    ...reviewerRisk,
    source: 'reviewer_confirmed',
    reviewerConfirmedByUserId: reviewerUserId,
  };
}

/**
 * KG-4A. Every governed release id stamped onto a customer-visible standard decision in a result
 * snapshot, deduplicated.
 *
 * Reads the SAME field the two customer paths write (`knowledgeReleaseId`, set only when
 * `governedProvenanceEligible`), across the same four locations they write it. In LEGACY the field
 * is never present anywhere in the snapshot, so this returns `[]` and provenance stays NULL --
 * byte-identical to KG-1.
 */
function collectGovernedReleaseIdsFromSnapshot(snapshot: unknown): string[] {
  const found = new Set<string>();
  const root = (snapshot && typeof snapshot === 'object' ? snapshot : {}) as Record<string, any>;
  const take = (items: unknown) => {
    for (const item of (Array.isArray(items) ? items : [])) {
      const id = (item as any)?.knowledgeReleaseId;
      if (typeof id === 'string' && id.trim()) found.add(id.trim());
    }
  };
  for (const key of ['primaryStandards', 'suggestedStandards', 'standardDecisions']) take(root[key]);
  for (const hazard of (Array.isArray(root?.multiHazardDecomposition?.hazards) ? root.multiHazardDecomposition.hazards : [])) {
    take((hazard as any)?.standardCandidates);
  }
  return [...found];
}

/**
 * The release one FINDING may truthfully claim.
 *
 * Constrained to the analysis's own release or NULL, never a third value: `analysisReleaseId` is
 * the only id this function can return, so the KG-1 invariant holds by construction rather than by
 * agreement between two code paths.
 *
 * `narrowPerFinding` is the important argument, and it defaults to the KG-1 behaviour.
 *
 * When the snapshot carries NO finding-level governed stamps at all -- every legacy analysis, and
 * the deterministic release fixture `test:knowledge-release-provenance` substitutes -- there is no
 * per-finding information to narrow BY. Narrowing anyway would not make provenance more truthful;
 * it would discard the analysis-level provenance KG-1 established and record NULL on findings whose
 * analysis genuinely did name a release. So in that case the finding inherits verbatim, exactly as
 * KG-1 specified.
 *
 * Only when a governed mode actually stamped some findings does the narrowing apply -- and then it
 * is required, because that is precisely the mixed case where inheriting verbatim would label a
 * fallen-back finding as governed.
 */
function findingReleaseId(
  hazard: Record<string, unknown>,
  analysisReleaseId: string | null,
  narrowPerFinding: boolean,
): string | null {
  if (!analysisReleaseId) return null;
  if (!narrowPerFinding) return analysisReleaseId;
  const candidates = Array.isArray((hazard as any)?.standardCandidates) ? (hazard as any).standardCandidates : [];
  // The same principle as `narrowPerFinding` itself, applied one level down: narrow only where
  // there is per-finding information to narrow BY. A hazard with no candidate list of its own
  // carries no evidence either way, and recording NULL for it would UNDERSTATE -- the finding's
  // conclusion still rests on an analysis whose customer-visible standard content came from the
  // release. Inheriting is the truthful answer; narrowing here would be guessing.
  if (!candidates.length) return analysisReleaseId;
  const consumed = candidates.some((item: any) => String(item?.knowledgeReleaseId || '').trim() === analysisReleaseId);
  return consumed ? analysisReleaseId : null;
}
import { evaluateRisk } from '../hazlenz/risk/risk-engine';
import { hazardFamilyToRiskClassification } from './finding-risk.mapping';
import { getCorrectiveActionIntelligence } from '../hazlenz/intelligence/corrective-action-intelligence';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';

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
    @InjectRepository(CorrectiveAction) private readonly correctiveActions: Repository<CorrectiveAction>,
    private readonly sites: SitesService,
    private readonly dataSource: DataSource,
    /**
     * §265. THE ONE PLACE THIS SERVICE MAY LEARN WHETHER AN EXPERT CONCLUSION IS SETTLED.
     *
     * It is injected rather than reimplemented because the alternative — reading `analysisState`
     * here and deciding what it means — is precisely the second opinion that
     * `deriveEffectiveDecision` exists to make impossible. Required, not optional: an optional
     * dependency on a safety gate is a gate that fails open the first time wiring changes.
     */
    private readonly expertAuthority: ExpertEffectiveDecisionService,
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

  /**
   * Resolves an idempotency identifier to the row it already created, for THIS user only.
   *
   * Scoped to `createdByUserId` rather than to the organisation on purpose. Authorised
   * organisation sharing governs who may READ an inspection; it does not govern whose write a
   * request is. Keying on the creator means a member of an organisation can never resolve or adopt
   * a colleague's inspection by presenting their identifier, which is the property Phase 2
   * requirement 4 asks for and is strictly narrower than the read model.
   */
  private async findByClientRequestId(user: AuthenticatedUser, clientRequestId: string) {
    return this.inspections.findOne({
      where: { createdByUserId: user.userId, clientRequestId },
    });
  }

  async create(rawUser: unknown, dto: CreateInspectionDto) {
    const user = requireAuthenticatedUser(rawUser);

    // Fast path: the identifier already resolves, so this is a replay of an attempt that landed.
    if (dto.clientRequestId) {
      const existing = await this.findByClientRequestId(user, dto.clientRequestId);
      if (existing) return existing;
    }

    const site = await this.sites.findAccessible(user, dto.siteId);

    let saved: Inspection;
    try {
      saved = await this.dataSource.transaction(async manager => {
        const repo = manager.getRepository(Inspection);
        // Allocate the customer-facing record number for THIS owner's sequence. The advisory lock
        // is per scope, so two accounts creating inspections at the same instant never wait on each
        // other, and two concurrent creates in the SAME scope are serialized rather than both
        // reading the same MAX. The lock is transaction-scoped: it is released by the same commit
        // that makes the number visible, so no window exists in which the MAX is stale.
        //
        // MAX+1 rather than a Postgres sequence because the sequence is per owner, not global --
        // one shared sequence would leak cross-tenant volume, and a sequence per owner would mean
        // creating a database object per customer. Numbers are display identity, so a gap left by a
        // rolled-back transaction is harmless; MAX+1 does not reuse a committed number.
        const scopeId = site.organizationId || site.ownerUserId;
        await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [
          `inspection-display-number:${site.organizationId ? 'org' : 'user'}:${scopeId}`,
        ]);
        const allocated = await repo.createQueryBuilder('inspection')
          .select('COALESCE(MAX(inspection."displayNumber"), 0)', 'highest')
          .where(site.organizationId ? 'inspection."organizationId" = :scopeId' : 'inspection."ownerUserId" = :scopeId', { scopeId })
          .getRawOne<{ highest: string }>();
        return repo.save(repo.create({
          title: dto.title.trim(),
          siteId: site.id,
          organizationId: site.organizationId,
          ownerUserId: site.ownerUserId,
          createdByUserId: user.userId,
          clientRequestId: dto.clientRequestId || null,
          displayNumber: Number(allocated?.highest || 0) + 1,
          status: 'draft',
          version: 1,
          regulatoryContext: dto.regulatoryContext || 'unknown',
          completedAt: null,
          completedByUserId: null,
          archivedAt: null,
        }));
      });
    } catch (error) {
      // The check above is not a lock. Two concurrent replays of the same identifier both miss it
      // and both insert; the partial unique index rejects the loser. The DATABASE is the authority
      // that one identifier means one row, so a unique violation here is the idempotent outcome,
      // not a failure -- re-read and return what won.
      if (dto.clientRequestId && isUniqueViolation(error)) {
        const winner = await this.findByClientRequestId(user, dto.clientRequestId);
        if (winner) return winner;
      }
      throw error;
    }
    if (saved.regulatoryContext !== 'unknown') {
      await this.audits.save(this.audits.create({
        actorUserId: user.userId, organizationId: saved.organizationId,
        action: 'inspection_regulatory_context_set',
        resourceType: 'inspection', resourceId: saved.id,
        metadata: { inspectionId: saved.id, regulatoryContext: saved.regulatoryContext, previous: null, provenance: 'USER_CONFIRMED', version: saved.version },
      }));
    }
    return saved;
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

  /**
   * §267 — THE GENERIC INSPECTION READ, WITH THE EXPERT READ BOUNDARY APPLIED.
   *
   * §266 measured this payload returning `server_authored` Expert rows whole — `resultSnapshot`
   * included, posture included, in any state — behind `JwtGuard` alone: no `fullSafeScope`
   * entitlement, no `effectiveDecision`, no confirmation framing. The Expert review representation
   * has a dedicated route carrying the full authority profile, and this is a second, weaker way to
   * read the same content. It stops being one here.
   *
   * DETERMINISTIC BEHAVIOUR IS UNCHANGED IN EVERY RESPECT. `client_supplied` rows pass through
   * byte-for-byte, so workspace restoration, the standards panel and the report snapshot — which
   * reaches its inspection through THIS method — all read exactly what they always did.
   *
   * THIS METHOD DOES NOT RECONSTRUCT `effectiveDecision`, deliberately. §267 forbids making
   * ordinary inspection reads derive Expert authority: doing so would put a second derivation of
   * the product's most consequential question on its least-guarded route. The projection withholds;
   * it does not interpret.
   */
  async get(rawUser: unknown, id: string) {
    const inspection = await this.findAccessible(rawUser, id);
    const loaded = await this.inspections.findOne({
      where: { id: inspection.id },
      relations: ['observations', 'observations.analyses', 'observations.reviews', 'findings', 'assignments'],
    });
    if (!loaded) return loaded;
    for (const observation of loaded.observations ?? []) {
      // Reassigned on the loaded graph rather than mapped into a new inspection object: every
      // caller of this method — the report snapshot among them — expects the entity shape, and a
      // structural rewrite here would be a far larger change than the boundary requires.
      (observation as { analyses: unknown }).analyses =
        projectAnalysesForGenericRead(observation.analyses);
    }
    return loaded;
  }

  async update(rawUser: unknown, id: string, dto: UpdateInspectionDto) {
    const inspection = await this.findAccessible(rawUser, id, true);
    if (inspection.version !== dto.version) throw new ConflictException('Inspection was modified by another request.');
    if (dto.title !== undefined) inspection.title = dto.title.trim();
    const previousContext = inspection.regulatoryContext;
    if (dto.regulatoryContext !== undefined) inspection.regulatoryContext = dto.regulatoryContext;
    inspection.version += 1;
    const saved = await this.inspections.save(inspection);
    if (dto.regulatoryContext !== undefined && dto.regulatoryContext !== previousContext) {
      const user = requireAuthenticatedUser(rawUser);
      await this.audits.save(this.audits.create({
        actorUserId: user.userId, organizationId: saved.organizationId,
        action: 'inspection_regulatory_context_set',
        resourceType: 'inspection', resourceId: saved.id,
        metadata: {
          inspectionId: saved.id, regulatoryContext: saved.regulatoryContext, previous: previousContext,
          provenance: saved.regulatoryContext === 'unknown' ? 'UNKNOWN' : 'USER_CONFIRMED', version: saved.version,
        },
      }));
    }
    return saved;
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

  /**
   * THE completion contract, evaluated once and consumed by two callers: `transition` (which
   * enforces it) and `completionReadiness` (which shows it).
   *
   * It reports the SAME facts to both, so the Finish screen can only ever say what the server would
   * actually do. It deliberately introduces NO new requirement: the rules are exactly those the
   * transition already enforced -- at least one observation, at least one current finding, and
   * every current finding carrying a completed and still-current human review. A missing corrective
   * action, an unassigned responsible person, an absent standard citation and an unanswered
   * clarification question are all permitted, and making any of them mandatory would be a policy
   * change, not a display change.
   */
  private async evaluateCompletionReadiness(inspectionId: string) {
    const observations = await this.observations.find({ where: { inspectionId }, select: ['id'] });
    const findings = observations.length
      ? await this.findings.find({
        where: observations.map(item => ({ inspectionId, observationId: item.id })),
      })
      : [];
    const active = findings.filter(finding => finding.status !== 'superseded');

    // A review that has been invalidated by re-analysis no longer completes its finding, so the
    // review's own status is checked rather than the mere presence of an id.
    const reviewIds = [...new Set(active.map(f => f.finalReviewId).filter((v): v is string => !!v))];
    const currentReviews = reviewIds.length
      ? await this.reviews.find({
        where: reviewIds.map(id => ({ id, status: 'current' as const })),
        select: ['id'],
      })
      : [];
    const currentReviewIds = new Set(currentReviews.map(review => review.id));

    const blocking = active.filter(finding =>
      !['finalized', 'dismissed'].includes(finding.status)
      || !finding.finalReviewId
      || !currentReviewIds.has(finding.finalReviewId));

    const reasons: string[] = [];
    if (!observations.length) reasons.push('NO_OBSERVATION');
    if (active.length === 0) reasons.push('NO_CURRENT_FINDING');
    if (blocking.length > 0) reasons.push('FINDING_NEEDS_REVIEW');

    return {
      ready: reasons.length === 0,
      reasons,
      message: !observations.length
        ? 'At least one observation is required.'
        : 'Every current finding requires a completed human review before finalization.',
      // What the Finish screen needs to render an actionable state, and nothing more.
      findingCount: active.length,
      reviewedCount: active.length - blocking.length,
      // The CUSTOMER-FACING count. A dismissed candidate satisfies the completion contract but is
      // not a finding of the inspection, so it must never be counted in "N findings reviewed" --
      // the readiness banner would otherwise report more findings than the report will contain.
      reportableCount: active.filter(finding => finding.status === 'finalized').length,
      blockingFindingIds: blocking.map(finding => finding.id),
    };
  }

  /** Read-only view of the completion contract, for the Finish screen. Authorization as for read. */
  async completionReadiness(rawUser: unknown, id: string) {
    await this.findAccessible(rawUser, id);
    return this.evaluateCompletionReadiness(id);
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
      // ONE evaluation of the completion contract, shared with the read-only readiness endpoint the
      // Finish screen uses. The UI must be able to show exactly what would block completion, and a
      // second implementation of "is this finishable" in the frontend would drift from this one --
      // the customer would then press Finish and meet a server error the screen never showed them.
      const readiness = await this.evaluateCompletionReadiness(id);
      if (!readiness.ready) throw new BadRequestException(readiness.message);
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

    const idempotencyScope = dto.clientRequestId
      ? { inspectionId, createdByUserId: user.userId, clientRequestId: dto.clientRequestId }
      : null;

    if (idempotencyScope) {
      const existing = await this.observations.findOne({ where: idempotencyScope });
      if (existing) return existing;
    }

    try {
      return await this.observations.save(this.observations.create({
        inspectionId,
        rawText: dto.rawText.trim(),
        evidenceSource: dto.evidenceSource || 'direct_observation',
        clientRequestId: dto.clientRequestId || null,
        version: 1,
        createdByUserId: user.userId,
      }));
    } catch (error) {
      if (idempotencyScope && isUniqueViolation(error)) {
        const winner = await this.observations.findOne({ where: idempotencyScope });
        if (winner) return winner;
      }
      throw error;
    }
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

  /**
   * The tenant choke point for every observation-scoped route.
   *
   * ONE INDISTINGUISHABLE ANSWER FOR BOTH WAYS OF NOT REACHING AN OBSERVATION. §262 measured this
   * and found it disclosing: an observation that does not exist answered "Observation not found."
   * while one belonging to ANOTHER workspace answered "Inspection not found." — the same 404, but
   * two different bodies, so a caller could enumerate which observation ids are real by reading the
   * message. Both branches now answer identically, so a cross-workspace attempt reveals nothing
   * about whether the target exists.
   *
   * The status code was already correct; this closes the message-level difference behind it, and it
   * closes it HERE rather than at any one route, so every observation route — analyses, reviews,
   * findings, user-authored findings, updates and the Expert route — gains it at once and none can
   * drift back.
   */
  private async accessibleObservation(rawUser: unknown, observationId: string) {
    const observation = await this.observations.findOne({ where: { id: observationId } });
    if (!observation) throw new NotFoundException('Observation not found.');
    try {
      const inspection = await this.findAccessible(rawUser, observation.inspectionId);
      return { observation, inspection };
    } catch (error) {
      // Only the not-found answer is normalised. An UnauthorizedException from a missing principal
      // means the caller is not authenticated at all, which is a different fact and must keep its
      // own status: converting it to 404 would tell an unauthenticated caller that the resource
      // does not exist, which is a claim the server has not established.
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Observation not found.');
      }
      throw error;
    }
  }

  async authorizeObservation(rawUser: unknown, observationId: string) {
    return this.accessibleObservation(rawUser, observationId);
  }

  /**
   * KG-1 authoritative capture point. Knowledge provenance is determined ONCE per analysis,
   * here, from the server's own measurement of how retrieval is scoped -- never from client
   * input (so it cannot be spoofed and adds no request parameter or workflow step), and
   * never recomputed per finding or at report time (so an analysis and the report that
   * represents it can never disagree about which knowledge informed them).
   *
   * Declared protected rather than private only so provenance tests can substitute a
   * deterministic release fixture; production has exactly one implementation.
   */
  protected async resolveKnowledgeReleaseId(
    snapshot?: unknown,
    principal?: { userId?: string | null; organizationId?: string | null } | null,
    /**
     * The inspection this analysis belongs to, when there is one.
     *
     * Supplied so the claim is verified against the release the SERVER bound this inspection to,
     * rather than against whatever the active pointer happens to say when the analysis is
     * persisted. Those are different releases the moment a newer one is activated, and verifying
     * against the pointer would reject a perfectly truthful claim from a re-analysis of an older
     * inspection -- or, worse, accept a claim naming a release that inspection was never governed
     * by.
     */
    inspectionId?: string | null,
  ): Promise<string | null> {
    // KG-4A SECURITY GATE, and the reason this method takes a principal.
    //
    // `snapshot` arrives in the REQUEST BODY. A client could therefore post a snapshot with a
    // `knowledgeReleaseId` it invented and, without this gate, have the server persist it as
    // governed provenance -- exactly the spoofing KG-1 forbade when it said provenance is decided
    // "never from client input". The snapshot is treated as an untrusted CLAIM about which findings
    // consumed governed content, and it is honoured only when the SERVER independently agrees that:
    //
    //   1. this principal is enabled for a mode that can influence customer output, and
    //   2. the claimed release is the one actually active on this server right now.
    //
    // Fail either check and the answer is NULL. A client that lies gains nothing; a client that
    // tells the truth adds no authority the server did not already have.
    const enablement = resolveCutoverEnablement({
      userId: principal?.userId ?? null,
      organizationId: principal?.organizationId ?? null,
    });
    if (!modeInfluencesCustomerOutput(enablement.effectiveMode)) {
      // LEGACY and SHADOW both land here. This is the only branch any customer reaches today.
      const resolved = resolveKnowledgeReleaseProvenance().knowledgeReleaseId;

      // KG-4D. The LAST gate before a release id can be persisted, wired into the REAL persistence
      // path rather than only into the contract module.
      //
      // In SHADOW this is belt-and-braces: `resolveKnowledgeReleaseProvenance()` with no argument
      // already yields NULL, and the mode check above already excluded SHADOW from the governed
      // branch. That is two mechanisms, and two mechanisms agreeing is not the same as one that
      // cannot be bypassed. If a future edit changes either of them, this coerces to the safe value
      // and REPORTS, so the breach becomes a counted hard-invariant violation that stops shadow --
      // rather than a false provenance stamp silently persisted on a real customer record.
      //
      // It coerces rather than throws: the caller is inside a customer write, and a governance bug
      // must not become a customer 500.
      if (enablement.effectiveMode === 'SHADOW') {
        const enforced = enforceShadowProvenanceInvariant('SHADOW', {
          analysisKnowledgeReleaseId: resolved,
          findingKnowledgeReleaseIds: {},
        });
        if (enforced.violated) {
          shadowMetrics.increment('shadow_provenance_violation');
          console.error(
            '[kg-4d] SHADOW provenance invariant coerced a persisted release id to NULL: ' +
            enforced.violations.join(', '),
          );
        }
        return enforced.result.analysisKnowledgeReleaseId;
      }

      return resolved;
    }

    const claimed = collectGovernedReleaseIdsFromSnapshot(snapshot);
    if (claimed.length !== 1) {
      return resolveKnowledgeReleaseProvenance(claimed.length > 1 ? {
        mode: 'unscoped_corpus',
        reason: `Snapshot claims ${claimed.length} distinct governed releases; no single release governed this analysis.`,
      } : undefined).knowledgeReleaseId;
    }

    // WHAT THE SERVER CHECKS THE CLAIM AGAINST.
    //
    // The inspection's own BINDING when it has one, and only otherwise the active pointer. The
    // binding is what actually governed retrieval for this analysis
    // (`standards/releases/inspection-release-binding.ts` resolved it before the pipeline ran), and
    // it is equally server-side, so nothing about the anti-spoofing property changes. Checking the
    // pointer instead would be wrong in both directions once a newer release is activated: a
    // truthful re-analysis of an inspection bound to R1 would be rejected because the pointer says
    // R2, and a claim naming R2 would be accepted for an inspection R2 never governed.
    let expectedReleaseId: string | null = null;
    let expectationSource = 'active-release pointer';
    const bound = await readInspectionReleaseBinding(this.dataSource, inspectionId ?? null);
    if (bound) {
      expectedReleaseId = bound;
      expectationSource = 'release bound to this inspection';
    } else {
      try {
        const rows = await this.dataSource.query(
          `SELECT "releaseId" FROM regulatory_releases WHERE status = 'active' LIMIT 1`,
        );
        expectedReleaseId = rows?.[0]?.releaseId ? String(rows[0].releaseId) : null;
      } catch {
        expectedReleaseId = null;
      }
    }
    if (!expectedReleaseId || expectedReleaseId !== claimed[0]) {
      return resolveKnowledgeReleaseProvenance({
        mode: 'unscoped_corpus',
        reason:
          `The snapshot claimed governed release '${claimed[0]}' but the ${expectationSource} is ` +
          `'${expectedReleaseId ?? 'none'}'. An unverifiable provenance claim is recorded as unknown.`,
      }).knowledgeReleaseId;
    }

    return this.resolveVerifiedKnowledgeReleaseId(snapshot, expectedReleaseId, expectationSource);
  }

  /** The truthful-claim path, reached only after the server has verified mode and release. */
  private resolveVerifiedKnowledgeReleaseId(
    snapshot: unknown, verifiedReleaseId: string, expectationSource: string,
  ): string | null {
    // KG-4A. The evidence that governed data was actually consumed is IN the snapshot: the two
    // customer paths stamp a finding-level `knowledgeReleaseId` on a standard decision only when
    // `decideFallback()` returned `governedProvenanceEligible`, i.e. only when governed content
    // changed what the customer sees. Reading it back here keeps the KG-1 rule intact -- provenance
    // is still decided ONCE, at this layer, from the server's own measurement rather than from
    // client input -- while giving that measurement something truthful to measure.
    //
    // Deliberately NOT derived from a pointer read here. "A release is active" and "this analysis
    // used it" remain different claims, and deriving provenance from the pointer would resurrect
    // exactly the false provenance KG-1 exists to prevent. The id below is the one the server
    // itself scoped retrieval to, re-checked above against the server's own record of it.
    return resolveKnowledgeReleaseProvenance({
      mode: 'single_release',
      releaseId: verifiedReleaseId,
      reason:
        `Customer-visible standard content in this analysis was supplied by governed release ` +
        `${verifiedReleaseId}, verified against the ${expectationSource} and pinned once for the ` +
        'whole analysis.',
    }).knowledgeReleaseId;
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
        // -------------------------------------------------------------------------------------
        // §267. THE ORDINAL AND THE CURRENTNESS ARE TWO DIFFERENT QUESTIONS.
        //
        //   1. IS THE ORDINAL FREE?  Asked across every producer AND across reserved-but-unwritten
        //      Expert executions. `uq_hazlenz_analysis_observation_version` does not care who wrote
        //      a row, and an Expert claim holds its ordinal for the length of two hosted legs
        //      during which it appears nowhere in this table. Consulting only this table would let
        //      a deterministic rerun allocate an ordinal an in-flight Expert execution already owns
        //      and fail on the unique index as a 500; this makes it the truthful 409 the client
        //      already knows how to resynchronise from.
        //
        //   2. WHAT DOES THIS SUPERSEDE?  Only the prior DETERMINISTIC analysis. §266 measured the
        //      collision in the other direction — Expert superseding the customer-authoritative
        //      deterministic row — and the same prohibition applies here: a deterministic rerun
        //      must not erase the Expert provenance merely because it is newer. After D1 -> E1 ->
        //      D2, D2 is the current deterministic analysis and E1 is still the current Expert one.
        const highestReserved = await highestReservedRequestVersion(manager, observationId);
        if (dto.requestVersion <= highestReserved) {
          throw new ConflictException('A newer analysis request already exists.');
        }
        const currentDeterministic = await repository.findOne({
          where: { observationId, producer: DETERMINISTIC_PRODUCER, status: 'current' },
          order: { requestVersion: 'DESC' },
          lock: { mode: 'pessimistic_write' },
        });
        if (currentDeterministic) {
          if (!maySupersede({ producer: DETERMINISTIC_PRODUCER }, currentDeterministic)) {
            throw new ConflictException('Cross-producer supersession is prohibited.');
          }
          currentDeterministic.status = 'superseded';
          await repository.save(currentDeterministic);
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
          knowledgeReleaseId: await this.resolveKnowledgeReleaseId(
            dto.resultSnapshot, user, observation.inspectionId,
          ),
          /**
           * §261. ASSIGNED BY THE SERVICE, AND THE ONLY VALUE THIS PATH MAY EVER WRITE.
           *
           * This route receives a result the client computed and held, and the server does not
           * establish that the snapshot equals the analysis it previously returned. `client_supplied`
           * states that plainly. It is written here, from a literal, rather than taken from the DTO:
           * `CreateAnalysisSnapshotDto` declares no producer field, the global ValidationPipe runs
           * with `forbidNonWhitelisted`, and `repository.create` is handed an explicit object -- so a
           * client cannot reach this value through the body, through an extra property, or through a
           * partial entity merge. There are exactly two assignment sites for `producer` in the
           * codebase and this is the one that can be reached from a request body.
           *
           * The state is ANALYSIS_AVAILABLE with `confirmationRequired` false. That is a fact rather
           * than a default: the deterministic path carries no server-authored operational conclusion,
           * so the confirmation rule does not run on it and there is nothing for a human to settle.
           * Marking legacy rows as awaiting confirmation would make the awaiting-confirmation state
           * meaningless on the rows where it carries the §255 boundary.
           */
          producer: 'client_supplied',
          analysisState: CLIENT_SUPPLIED_ANALYSIS_STATE,
          confirmationRequired: false,
          expertExecutionId: null,
        }));
        /**
         * §261. The analysis-creation audit gap, closed for the legacy producer.
         *
         * Emitted INSIDE the same transaction as the row it describes, so an audit event can never
         * outlive a rolled-back analysis and an analysis can never exist without its event. The same
         * action name the server-authored path uses, so one query covers both producers.
         */
        await manager.getRepository(SecurityAuditEvent).save(
          manager.getRepository(SecurityAuditEvent).create({
            actorUserId: user.userId,
            organizationId: user.organizationId ?? null,
            action: ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION,
            resourceType: ANALYSIS_AUDIT_RESOURCE_TYPE,
            resourceId: saved.id,
            metadata: auditMetadataForClientSuppliedAnalysisCreation({
              observationId,
              inspectionId: observation.inspectionId,
              analysis: saved,
            }),
          }),
        );
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
   * Disambiguates a hazard key that another hazard in the SAME analysis already claimed, so two
   * distinct hazards of one domain persist as two findings instead of colliding on the finding
   * table's (observationId, segmentKey, revision) unique index. The first occurrence keeps the
   * bare domain key, so single-hazard-per-domain observations (the common case) are unaffected
   * and existing findings keep their keys across re-analysis.
   */
  private uniqueHazardKey(hazardKey: string, taken: Set<string>): string {
    if (!taken.has(hazardKey)) return hazardKey;
    for (let occurrence = 2; ; occurrence++) {
      const candidate = `${hazardKey}-${occurrence}`;
      if (!taken.has(candidate)) return candidate;
    }
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

  /**
   * Corrective actions were previously read from a single flat
   * `generatedActions` array on the whole-observation classify() response by
   * positional index (actions[0]/[1]/[2] as "immediate"/"permanent"/
   * "verification"), so a multi-hazard observation's actions for finding A
   * could be displayed under finding B once index order didn't line up with
   * which hazard each action actually addressed. This computes a corrective
   * action independently for ONE decomposed hazard, consuming only that
   * hazard's own evidence, risk (from computeFindingRisk above, never
   * another finding's risk), regulatory basis (that finding's own
   * standardCandidates from the Phase 5 finding-scoped standards fix), and
   * evidence gaps -- reusing the existing, unmodified
   * getCorrectiveActionIntelligence() the same way computeFindingRisk reuses
   * evaluateRisk(). Returns null when there is no risk for this finding
   * (e.g. HISTORICAL/SAFE_VERIFIED), matching computeFindingRisk's own null
   * case, since an action with no risk basis would not be a real recommendation.
   */
  private computeFindingCorrectiveAction(
    hazard: Record<string, unknown>,
    riskSnapshot: Record<string, unknown> | null,
  ): Record<string, unknown> | null {
    if (!riskSnapshot) return null;
    const hazardFamily = String(hazard.hazardFamily || hazard.domainId || 'Safety observation');
    const displayFamily = hazardFamily.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const standardCandidates = Array.isArray(hazard.standardCandidates) ? hazard.standardCandidates as any[] : [];
    const sourceAnalysis = {
      primaryRegulatoryBasis: standardCandidates.filter(candidate => candidate?.applicability === 'direct'),
    };
    const evidenceGap = {
      criticalQuestions: Array.isArray(hazard.reviewerQuestions) ? hazard.reviewerQuestions : [],
      closureEvidenceNeeded: Array.isArray(hazard.evidenceGaps) ? hazard.evidenceGaps : [],
    };
    return getCorrectiveActionIntelligence(displayFamily, riskSnapshot, sourceAnalysis, evidenceGap) as unknown as Record<string, unknown>;
  }

  /**
   * The guided-review UI already lets a reviewer read and edit a proposed
   * corrective action per finding (persisted into that finding's own
   * human_reviews.reviewedConclusion.correctiveAction), and the system
   * independently computes one per finding (riskSnapshot.
   * correctiveActionIntelligence, from computeFindingCorrectiveAction above).
   * Neither was ever written into the canonical corrective_actions tracking
   * table that the Actions UI, dashboard, and PDF report all read from -- so
   * a finalized finding's action never appeared there at all. This builds the
   * text for that canonical record, preferring the reviewer's own edited
   * text when present (it is the more authoritative, human-confirmed value)
   * and falling back to the system-computed intelligence otherwise. Returns
   * null when neither source has anything to persist, rather than inventing
   * a generic placeholder action for every finding regardless of whether one
   * was ever produced.
   */
  private buildCorrectiveActionPayload(
    reviewedConclusion: Record<string, unknown> | null,
    riskSnapshot: Record<string, unknown> | null,
    hazardCategory: string,
  ): { title: string; description: string; priorityCode: 'low' | 'medium' | 'high' | 'urgent' } | null {
    const displayCategory = String(hazardCategory || 'Safety observation').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const reviewerAction = reviewedConclusion?.correctiveAction as Record<string, unknown> | undefined;
    if (reviewerAction && (reviewerAction.immediateAction || reviewerAction.permanentCorrection || reviewerAction.verificationStep)) {
      const description = [
        reviewerAction.immediateAction ? `Immediate: ${reviewerAction.immediateAction}` : null,
        reviewerAction.permanentCorrection ? `Permanent: ${reviewerAction.permanentCorrection}` : null,
        reviewerAction.verificationStep ? `Verification: ${reviewerAction.verificationStep}` : null,
      ].filter(Boolean).join('\n');
      const urgency = String(reviewerAction.urgency || '').toLowerCase();
      const priorityCode: 'low' | 'medium' | 'high' | 'urgent' =
        /urgent|critical/.test(urgency) ? 'urgent' : /prompt|high/.test(urgency) ? 'high' : 'medium';
      return { title: `${displayCategory} corrective action`, description, priorityCode };
    }
    const systemAction = riskSnapshot?.correctiveActionIntelligence as Record<string, any> | undefined;
    const immediate = systemAction?.immediateActions?.[0];
    if (immediate) {
      const permanent = systemAction?.preventionActions?.[0];
      const verification = systemAction?.verificationActions?.[0];
      const description = [
        immediate ? `Immediate: ${immediate.rationale}` : null,
        permanent ? `Permanent: ${permanent.rationale}` : null,
        verification ? `Verification: ${verification.rationale}` : null,
      ].filter(Boolean).join('\n');
      const priorityCode: 'low' | 'medium' | 'high' | 'urgent' =
        immediate.priority === 'critical' ? 'urgent' : immediate.priority === 'high' ? 'high' : immediate.priority === 'medium' ? 'medium' : 'low';
      return { title: immediate.title || `${displayCategory} corrective action`, description, priorityCode };
    }
    return null;
  }

  /**
   * Upserts the ONE canonical corrective_actions row for a finding (keyed by
   * findingId, never a second parallel row), so editing an existing action
   * updates it in place instead of duplicating it, and every finalize call is
   * idempotent with respect to tracking.
   */
  private async upsertCorrectiveActionForFinding(
    manager: import('typeorm').EntityManager,
    finding: InspectionFinding,
    inspectionId: string,
    reviewedConclusion: Record<string, unknown> | null,
  ) {
    const payload = this.buildCorrectiveActionPayload(
      reviewedConclusion,
      finding.riskSnapshot as Record<string, unknown> | null,
      finding.hazardCategory || finding.hazardKey,
    );
    if (!payload) return;
    const repository = manager.getRepository(CorrectiveAction);
    const existing = await repository.findOne({ where: { findingId: finding.id } });
    if (existing) {
      existing.title = payload.title;
      existing.description = payload.description;
      existing.priorityCode = payload.priorityCode;
      existing.inspectionId = inspectionId;
      await repository.save(existing);
      return;
    }
    await repository.save(repository.create({
      findingId: finding.id,
      inspectionId,
      title: payload.title,
      description: payload.description,
      priorityCode: payload.priorityCode,
      statusCode: 'open',
      source: 'hazlenz_finding_scoped',
    }));
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

    // KG-4A (Phase 8). Whether per-finding narrowing applies at all is decided ONCE, from the
    // snapshot, before the loop: it applies only when a governed mode actually stamped findings.
    // Deciding it per finding would let an analysis narrow some findings and inherit for others.
    const narrowPerFinding = collectGovernedReleaseIdsFromSnapshot(snapshot).length > 0;

    const repository = manager.getRepository(InspectionFinding);
    const current = await repository.find({
      where: { observationId: observation.id },
      order: { createdAt: 'ASC' },
    });
    const incomingKeys = new Set<string>();
    for (const [index, hazard] of hazards.entries()) {
      // One observation regularly decomposes into several DISTINCT hazards that share a domain
      // (two separate excavation defects, two separate electrical defects...). stableHazardKey
      // derives its key from the domain alone, so those hazards collided on the finding table's
      // (observationId, segmentKey, revision) unique index: the first inserted, the second threw
      // a QueryFailedError, and the whole addAnalysis transaction rolled back -- the analysis
      // could not be saved at all, surfacing to the user as "A newer analysis request already
      // exists." Repeats of a key within ONE analysis are therefore suffixed by their occurrence
      // so every decomposed hazard keeps its own finding. Numbering follows the decomposition's
      // own hazard order, so re-analysing the same observation reproduces the same keys.
      const hazardKey = this.uniqueHazardKey(this.stableHazardKey(hazard, index), incomingKeys);
      incomingKeys.add(hazardKey);
      // Finding-level governed authority. Annotated HERE because this is the only point that holds
      // both the hazard's code-resident standard candidates and `analysis.knowledgeReleaseId` --
      // the release that governed the analysis they came from. Authority is granted by release
      // membership and effective review state, never by citation-string equality, and when no
      // release governs the analysis every candidate is labelled LEGACY_CODE_RESIDENT_CONTENT.
      // This never suppresses a hazard: a finding with no governed match keeps its hazard, risk
      // and corrective action and simply says so about its standards.
      await annotateFindingStandardsAuthority(manager, hazard, analysis.knowledgeReleaseId ?? null);
      const existing = current
        .filter(item => item.hazardKey === hazardKey && item.status !== 'superseded')
        .sort((a, b) => b.revision - a.revision)[0];
      const family = String(hazard.hazardFamily || hazard.domainId || 'Safety observation');
      const mechanism = String(hazard.mechanism || hazard.observationFragment || family);
      const candidate = { ...hazard, hazardKey };
      const baseRiskSnapshot = this.computeFindingRisk(hazard, hazardKey, riskProfileId);
      const correctiveActionIntelligence = this.computeFindingCorrectiveAction(hazard, baseRiskSnapshot);
      const riskSnapshot = baseRiskSnapshot && correctiveActionIntelligence
        ? { ...baseRiskSnapshot, correctiveActionIntelligence }
        : baseRiskSnapshot;
      if (existing) {
        // Captured before mutation below so the V5-C01 risk-change comparison is
        // meaningful (unlike the pre-existing conclusion/sourceCandidate comparison
        // further down, which this change intentionally leaves untouched -- fixing
        // that is out of scope for finding-scoped risk).
        const previousRiskSnapshot = existing.riskSnapshot;
        existing.selectedAnalysisId = analysis.id;
        existing.originatingAnalysisId = existing.originatingAnalysisId || analysis.id;
        // KG-1: this branch re-derives the finding's whole content (conclusion,
        // sourceCandidate, risk) from THIS analysis, so the finding's knowledge provenance
        // follows the analysis that produced that content. Inherited, never re-resolved.
        //
        // KG-4A (Phase 8): inherited but NARROWED. A finding claims the analysis's release only
        // when its OWN standard candidates consumed governed content; otherwise NULL. The KG-1
        // invariant is preserved in the direction that matters -- a finding can never claim a
        // release its analysis did not use -- while a mixed analysis stays truthful per finding
        // instead of labelling a fallen-back finding as governed.
        existing.knowledgeReleaseId = findingReleaseId(hazard, analysis.knowledgeReleaseId, narrowPerFinding);
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
          // KG-1 + KG-4A (Phase 8): a finding carries its analysis's release only when its own
          // standard candidates actually consumed governed content. Findings cannot disagree about
          // WHICH release informed them -- one analysis pins one release -- but they may
          // truthfully differ on WHETHER governed content reached them.
          knowledgeReleaseId: findingReleaseId(hazard, analysis.knowledgeReleaseId, narrowPerFinding),
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
      // A user-authored finding is NOT part of the decomposition and must never be superseded by
      // it. Reconciliation retires findings whose hazard the latest analysis no longer emits --
      // correct for engine-derived rows, and destructive for one the inspector added precisely
      // BECAUSE the engine does not emit it. Without this guard, re-running HazLenz (a clarification
      // answer, a fact correction, a revised observation) would silently delete the inspector's own
      // finding, which is the single worst thing this feature could do.
      if (item.source === 'user_authored') continue;
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

  /**
   * Record a hazard the INSPECTOR identified that HazLenz did not propose.
   *
   * Creates a real, persisted `pending_review` finding against the existing observation, so it is
   * a first-class finding from the moment it is declared -- it survives a reload, counts in the
   * completion gate, supports a corrective action, and reaches the report -- rather than living in
   * browser state until someone saves it.
   *
   * What it deliberately does NOT do:
   *
   *   - no `riskSnapshot`. HazLenz did not assess this hazard, so there is no computed risk to
   *     inherit. The reviewer sets it on the risk matrix like any other finding.
   *   - no `standardCandidates`, no citation. A finding does not acquire regulatory support
   *     because a customer named a hazard. If a standard is ever attached it must come from the
   *     engine independently evaluating this hazard, not from this call.
   *   - no `selectedAnalysisId` / `originatingAnalysisId` / `knowledgeReleaseId`. Pointing at the
   *     observation's HazLenz analysis would claim that analysis produced this finding. It did not.
   *
   * It then enters the SAME downstream workflow as any other finding: risk, review, save.
   */
  async createUserAuthoredFinding(
    rawUser: unknown,
    observationId: string,
    dto: CreateUserAuthoredFindingDto,
  ) {
    const user = requireAuthenticatedUser(rawUser);
    const { observation, inspection } = await this.accessibleObservation(user, observationId);
    if (inspection.status === 'completed') {
      throw new ConflictException('Completed inspections must be reopened before editing.');
    }
    if (inspection.status === 'archived') {
      throw new ConflictException('Archived inspections cannot be edited.');
    }

    const hazardTitle = dto.hazardTitle.trim();
    const detail = (dto.detail || '').trim();
    // Namespaced so a user-authored key can never collide with -- or be mistaken for -- a
    // decomposition hazard key, which is what reconciliation matches on.
    const baseKey = `user-${hazardTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)}`
      .replace(/-$/, '') || 'user-finding';
    const taken = new Set(
      (await this.findings.find({ where: { observationId }, select: ['hazardKey'] }))
        .map(finding => finding.hazardKey),
    );
    const hazardKey = this.uniqueHazardKey(baseKey, taken);

    const saved = await this.findings.save(this.findings.create({
      inspectionId: inspection.id,
      observationId: observation.id,
      selectedAnalysisId: null,
      originatingAnalysisId: null,
      knowledgeReleaseId: null,
      finalReviewId: null,
      status: 'pending_review',
      source: 'user_authored',
      hazardCategory: hazardTitle,
      segmentKey: hazardKey,
      hazardKey,
      // The evidence is what the inspector wrote. `standardCandidates` is present and EMPTY on
      // purpose: the shape every reader expects, carrying no regulatory claim.
      sourceCandidate: {
        observationFragment: detail || observation.rawText,
        standardCandidates: [],
        provenance: 'user_authored',
        hazardTitle,
      },
      riskSnapshot: null,
      reviewerDisposition: 'single',
      conclusion: detail || hazardTitle,
      revision: 1,
      finalizedByUserId: null,
    }));

    // The other half of the evaluation signal. "HazLenz proposed X, the inspector rejected it" is
    // already recorded as a dismissed review; this is "HazLenz did not propose X, the inspector
    // added it". Neither is ground truth for changing the engine -- both are measurable evidence.
    await this.audits.save(this.audits.create({
      actorUserId: user.userId,
      organizationId: inspection.organizationId,
      action: 'finding_user_authored',
      resourceType: 'inspection_finding',
      resourceId: saved.id,
      metadata: {
        inspectionId: inspection.id,
        observationId: observation.id,
        findingId: saved.id,
        hazardKey,
        hazardTitle,
        hazlenzProposed: false,
        signal: 'candidate_false_negative',
      },
    }));

    return saved;
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
    // KG-1: a finding first materialized at finalization (rather than by decomposition
    // reconciliation) inherits its provenance from the analysis the review was made against.
    // Resolved by lookup, never re-derived, and NULL when the review cites no analysis.
    const reviewedAnalysis = review.analysisId
      ? await this.analyses.findOne({ where: { id: review.analysisId, observationId } })
      : null;

    // ---------------------------------------------------------------------------------------
    // §265. THE DOWNSTREAM AUTHORITY GATE — THE FIRST ACTIVATED CONSUMER OF `effectiveDecision`.
    //
    // FINALIZATION IS WHERE A POSTURE STOPS BEING ANALYSIS AND BECOMES A PRODUCT FACT. It writes a
    // finding the report reads, and on the `finalized` branch it creates a corrective action whose
    // urgency derives from that conclusion. §260 section 11 froze finalization as BLOCKED while an
    // Expert classification is unsettled, and this is the mechanism.
    //
    // IT ASKS; IT DOES NOT DECIDE. The verdict, the reason and the customer-facing sentence all come
    // from the one derivation. Nothing here reads `analysisState`, `confirmationRequired` or
    // `resultSnapshot`, so this consumer cannot prefer the raw Expert proposal over a human
    // settlement — there is no code path by which the proposal reaches it.
    //
    // IT IS SCOPED TO THE EXPERT PATH, DELIBERATELY. A review citing no analysis, or a
    // `client_supplied` one, is allowed exactly as before: the deterministic path is the
    // customer-authoritative one and §265 imposes no new precondition on it.
    //
    // IT RUNS BEFORE THE TRANSACTION OPENS. A refusal must not leave a partially written finding,
    // and the check needs no lock — it reads rows a settlement can only move FORWARD, and a
    // settlement landing after this point produces a retryable refusal rather than a wrong write.
    //
    // ---------------------------------------------------------------------------------------
    // §267. THE GATE APPLIES TO FINALIZATION AND NOT TO DISMISSAL. PRODUCT-OWNER DECISION.
    //
    // §265 put this check ahead of the finalized/dismissed branch, so it refused a DISMISSAL of a
    // finding whose review cited an unsettled Expert analysis. §266 raised that as
    // over-restriction under the standing rule that every safety remediation is checked for
    // overcorrection, and §267 decided it: THE TWO ACTS CONSUME DIFFERENT THINGS.
    //
    //   FINALIZATION asserts an authoritative finding ON THE BASIS OF an operational conclusion. It
    //   writes a finding the report reads and, on this branch, creates a corrective action whose
    //   urgency derives from that conclusion. It consumes the conclusion, so it needs it settled.
    //
    //   DISMISSAL REJECTS the proposed finding. It asserts that there is no finding here to carry
    //   forward. It does not adopt, endorse, or depend on HazLenz's posture or driver-role
    //   classification — so requiring the reviewer to settle a classification for a hazard they are
    //   REJECTING demands a decision the act does not use. It also trapped the user: a dismissed
    //   finding is how an inspection reaches completion, so the reviewer could not finish without
    //   confirming an Expert conclusion they had just declined to act on.
    //
    // WHAT DISMISSAL STILL MUST NOT DO, and does not, by construction rather than by promise:
    //
    //   * it does not mark the Expert analysis CONFIRMED or OVERRIDDEN. Nothing on this path writes
    //     `analysisState` or `settlementReviewId`; those move only through the §264 settlement
    //     transition, which is a different route with its own eligibility rule.
    //   * it does not create an effective operational conclusion. `deriveEffectiveDecision` reads
    //     the analysis state and the settlement, neither of which this touches, so the analysis
    //     remains ANALYSIS_AWAITING_CONFIRMATION and unsettled afterwards — which §267 states is
    //     the acceptable and expected outcome.
    //   * it does not rewrite `resultSnapshot`, and it implies neither "safe" nor "no hazard
    //     exists": it records one reviewer rejecting one proposed finding, attributably.
    //   * it remains separately auditable — the `finding_review_finalized` event below carries
    //     `status: 'dismissed'`, the reviewer, the review and the analysis it cited.
    //
    // THE FINALIZATION GUARD IS OTHERWISE UNTOUCHED. It is still the §260 section 11 gate, still
    // asks the one derivation, still refuses on the finalized branch, and is still the only
    // activated downstream consumer of `effectiveDecision`.
    if (status === 'finalized') {
      const expertVerdict = await this.expertAuthority.authorizeFindingFinalization(
        review.analysisId, observationId,
      );
      if (!expertVerdict.allowed) {
        throw new ConflictException(expertVerdict.refusal ?? 'This Expert analysis carries no settled '
          + 'operational conclusion, so a finding cannot be finalized from it.');
      }
    }

    return this.dataSource.transaction(async manager => {
      const repository = manager.getRepository(InspectionFinding);
      const existing = await repository.findOne({
        where: { observationId, hazardKey: segmentKey },
        order: { revision: 'DESC' },
      });
      if (existing && existing.status !== 'superseded') {
        existing.inspectionId = inspection.id;
        existing.selectedAnalysisId = review.analysisId;
        // KG-1: knowledgeReleaseId is intentionally NOT reassigned here. Finalization is a
        // human review act, not a re-analysis -- the finding keeps the provenance of the
        // analysis that produced its regulatory content. A legacy NULL therefore stays NULL
        // rather than acquiring whichever release happens to exist at finalization time.
        existing.finalReviewId = review.id;
        existing.status = status as 'finalized' | 'dismissed';
        existing.hazardCategory = dto.hazardCategory || existing.hazardCategory;
        existing.segmentKey = segmentKey;
        existing.hazardKey = segmentKey;
        // Merge, never replace: a review finalization must not be able to drop the finding's
        // own finding-scoped evidence (observationFragment, standardCandidates, jurisdiction
        // provenance) that reconcileDecompositionFindings persisted -- the report, Standard
        // Detail panel and corrective-action basis all read from it.
        existing.sourceCandidate = dto.sourceCandidate
          ? { ...((existing.sourceCandidate || {}) as Record<string, unknown>), ...dto.sourceCandidate }
          : existing.sourceCandidate;
        existing.reviewerDisposition = dto.reviewerDisposition || existing.reviewerDisposition;
        existing.conclusion = dto.conclusion.trim();
        existing.finalizedByUserId = user.userId;
        if (dto.riskAssessment) {
          // Keep the finding-scoped system fields (correctiveActionIntelligence, hazardKey,
          // evidenceUsed...) beneath the reviewer's confirmed risk values -- replacing the whole
          // snapshot silently discarded the finding's own corrective-action basis.
          existing.riskSnapshot = withReviewerConfirmedRisk(
            existing.riskSnapshot as Record<string, unknown> | null,
            dto.riskAssessment,
            user.userId,
          );
        }
        const saved = await repository.save(existing);
        await manager.getRepository(SecurityAuditEvent).save(manager.getRepository(SecurityAuditEvent).create({
          actorUserId: user.userId, organizationId: inspection.organizationId,
          action: 'finding_review_finalized', resourceType: 'inspection_finding', resourceId: saved.id,
          metadata: { inspectionId: inspection.id, observationId, findingId: saved.id, reviewId: review.id, analysisId: review.analysisId, status },
        }));
        if (status === 'finalized') {
          await this.upsertCorrectiveActionForFinding(manager, saved, inspection.id, review.reviewedConclusion);
        }
        return saved;
      }
      const saved = await repository.save(repository.create({
        inspectionId: inspection.id,
        observationId: observation.id,
        selectedAnalysisId: review.analysisId,
        originatingAnalysisId: review.analysisId,
        knowledgeReleaseId: reviewedAnalysis?.knowledgeReleaseId ?? null,
        finalReviewId: review.id,
        status,
        hazardCategory: dto.hazardCategory || null,
        segmentKey,
        hazardKey: segmentKey,
        sourceCandidate: dto.sourceCandidate || null,
        riskSnapshot: dto.riskAssessment
          ? withReviewerConfirmedRisk(null, dto.riskAssessment, user.userId)
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
      if (status === 'finalized') {
        await this.upsertCorrectiveActionForFinding(manager, saved, inspection.id, review.reviewedConclusion);
      }
      return saved;
    });
  }
}
