import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { AuthenticatedUser, requireAuthenticatedUser } from '../common/authenticated-user';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { InspectionService } from '../inspection/inspection.service';
import { Inspection } from '../inspection/inspection.entity';
import { InspectionFinding } from '../inspection/entities/inspection-finding.entity';
import { Site } from '../sites/entities/site.entity';
import { StorageService } from '../storage/storage.service';
import { User } from '../users/user.entity';
import { InspectionReport } from './entities/inspection-report.entity';
import { InspectionReportVersion } from './entities/inspection-report-version.entity';
import { renderInspectionReportPdf } from './canonical-report-pdf-renderer';

const GENERATOR_VERSION = 'safety-insite-pdf/2';

function pdfFromSnapshot(snapshot: Record<string, any>): Promise<Buffer> {
  return renderInspectionReportPdf(snapshot);
}

@Injectable()
export class CanonicalReportsService {
  constructor(
    @InjectRepository(InspectionReport) private readonly reports: Repository<InspectionReport>,
    @InjectRepository(InspectionReportVersion) private readonly versions: Repository<InspectionReportVersion>,
    @InjectRepository(CorrectiveAction) private readonly actions: Repository<CorrectiveAction>,
    @InjectRepository(SecurityAuditEvent) private readonly audits: Repository<SecurityAuditEvent>,
    @InjectRepository(Site) private readonly sites: Repository<Site>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly inspections: InspectionService,
    private readonly storage: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  private async accessibleReport(rawUser: unknown, reportId: string) {
    const report = await this.reports.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found.');
    await this.inspections.findAccessible(rawUser, report.inspectionId);
    return report;
  }

  private snapshotInspection(
    inspection: any,
    actions: CorrectiveAction[],
    site: Site | null,
    preparedBy: User | null,
    assigneeNamesByUserId: Map<string, string>,
  ) {
    return JSON.parse(JSON.stringify({
      capturedAt: new Date().toISOString(),
      site: site ? { id: site.id, name: site.name } : null,
      preparedBy: preparedBy ? { id: preparedBy.id, name: preparedBy.name } : null,
      inspection: {
        id: inspection.id, title: inspection.title, status: inspection.status, version: inspection.version,
        siteId: inspection.siteId, organizationId: inspection.organizationId,
        ownerUserId: inspection.ownerUserId, completedAt: inspection.completedAt,
        // Inspection-level regulatory context (established once at setup, inherited by every
        // finding). 'unknown' means it was never established -- the report must say so rather
        // than imply a regime.
        regulatoryContext: inspection.regulatoryContext || 'unknown',
      },
      observations: (inspection.observations || []).map((observation: any) => ({
        id: observation.id, rawText: observation.rawText, evidenceSource: observation.evidenceSource,
        analyses: observation.analyses || [], reviews: observation.reviews || [],
        // Historical/superseded findings remain queryable for audit and history, but a
        // current report must contain only the findings that are current for the
        // finalized inspection. Including superseded rows here collapses history into
        // the active hazard presentation and can mislead reviewers.
        //
        // `dismissed` is excluded for a stronger reason: a dismissed row is a hazard HazLenz
        // PROPOSED and a qualified person then declined to confirm. It is deliberately retained in
        // the database so the proposal and the rejection stay auditable and measurable, but it is
        // not a finding of the inspection and must never be presented to a customer, a client or a
        // regulator as one. It carries no corrective action (upsertCorrectiveActionForFinding runs
        // only for 'finalized') and it must carry no report entry either.
        findings: (inspection.findings || []).filter((finding: any) =>
          finding.observationId === observation.id
          && finding.status !== 'superseded'
          && finding.status !== 'dismissed',
        ).map((finding: any) => ({
          ...finding,
          // Report-display convenience only: the finding's own finalization review, resolved
          // from its sibling observation's already-loaded reviews (no separate query, no
          // write to the finding record itself).
          finalReview: finding.finalReviewId
            ? (observation.reviews || []).find((r: any) => r.id === finding.finalReviewId) || null
            : null,
        })),
      })),
      // A corrective action records its assignee as a user id; assignedToName is only populated
      // when a reviewer typed a free-text name or role. The report's "Assigned To" line and the
      // corrective-action summary's Owner column must show the person who is actually
      // accountable, so the assigned user's name is resolved here (display only -- the stored
      // action row is never written to). An id with no resolvable user stays unnamed rather
      // than being shown as an opaque uuid.
      correctiveActions: actions.map(action => ({
        ...action,
        assignedToName: action.assignedToName
          || (action.assignedToUserId ? assigneeNamesByUserId.get(action.assignedToUserId) || null : null),
      })),
    }));
  }

  /**
   * KG-1 report provenance. Summarises which governed knowledge releases informed the
   * findings this report represents, derived ONLY from the provenance already persisted on
   * those findings and their analyses -- never from whichever release is "current" at export
   * time, which would make an old inspection appear to have been analysed with newer
   * knowledge. A report that legitimately spans several analyses reports each distinct
   * release rather than collapsing them into one.
   */
  private knowledgeProvenance(snapshot: Record<string, any>) {
    const findings = (snapshot.observations || []).flatMap((observation: any) => observation.findings || []);
    const releaseIds = Array.from(new Set(
      findings.map((finding: any) => finding.knowledgeReleaseId).filter(Boolean),
    )).sort();
    return {
      // Findings whose analysis could not truthfully name a single knowledge release. This
      // is the expected state until standards retrieval is release-scoped (KG-3).
      findingsWithoutKnowledgeRelease: findings.filter((finding: any) => !finding.knowledgeReleaseId).length,
      findingCount: findings.length,
      knowledgeReleaseIds: releaseIds,
    };
  }

  private snapshotFingerprint(snapshot: Record<string, any>) {
    const stable = { ...snapshot };
    delete stable.capturedAt;
    return createHash('sha256').update(JSON.stringify(stable)).digest('hex');
  }

  /**
   * Orphaned report artifacts in the acting user's scope: PDFs whose snapshot row no longer exists.
   *
   * A superseded artifact is retired AFTER the replacement transaction commits, which is the whole
   * point of the ordering -- the old report must survive until the new one is proven. That leaves a
   * narrow window in which a crash could commit the replacement and never reach the cleanup. This
   * closes it deterministically on the next generation: an artifact whose snapshot row is gone is
   * by definition unreferenced, so nothing can ever download it and nothing may keep it.
   *
   * Scoped to the acting user's own owner/organization scope, so a sweep can never reach another
   * tenant's storage.
   */
  private async orphanedReportArtifactIds(user: AuthenticatedUser) {
    const rows = await this.dataSource.query(
      `SELECT o.id
         FROM storage_objects o
    LEFT JOIN inspection_report_versions v ON v.id = o."parentId"
        WHERE o."parentType" = 'report_version'
          AND o.category = 'report'
          AND o.status = 'ready'
          AND o."deletedAt" IS NULL
          AND v.id IS NULL
          AND (${'$'}1::uuid IS NOT NULL AND o."organizationId" = ${'$'}1::uuid
               OR ${'$'}1::uuid IS NULL AND o."ownerUserId" = ${'$'}2::uuid)`,
      [user.organizationId || null, user.userId],
    );
    return rows.map((row: { id: string }) => row.id);
  }

  /**
   * Generate the inspection's report, REPLACING whatever report it currently has.
   *
   * v1.0 contract: an inspection has ONE current report. Reopening, editing and finishing again
   * does not produce "version 2" beside "version 1" -- it produces a replacement, and the report the
   * customer downloads is always the one that matches the inspection's current completed state.
   * `inspection_report_versions` survives as the internal snapshot store, and exactly one of its
   * rows is retained per report; its `version` column is now an internal sequence for audit
   * continuity and the table's uniqueness constraint, never a customer-facing number.
   *
   * REPLACEMENT SAFETY -- the ordering here is the contract, not an implementation detail:
   *
   *   1. the existing valid snapshot and its PDF are left completely untouched;
   *   2. the replacement is rendered and its bytes are stored;
   *   3. the replacement row is marked generated only after the artifact exists and verifies;
   *   4. the superseded snapshot rows are removed in the SAME transaction, so the report points at
   *      exactly one snapshot the instant the switch becomes visible;
   *   5. only after that transaction has COMMITTED are the superseded PDFs destroyed.
   *
   * If anything before the commit fails, the transaction rolls back and the customer still has the
   * report they had. The only artifact destroyed on that path is the half-made replacement, which no
   * snapshot row references. A failed generation therefore cannot leave the inspection without a
   * report, and cannot leave a partially replaced one.
   */
  async generate(rawUser: unknown, inspectionId: string) {
    const user = requireAuthenticatedUser(rawUser);
    const inspection = await this.inspections.get(user, inspectionId);
    if (!inspection) throw new NotFoundException('Inspection not found.');
    if (inspection.status !== 'completed') throw new BadRequestException('Reports may only be generated from completed inspections.');
    const actions = await this.actions.find({ where: { inspectionId } });
    const [site, preparedBy] = await Promise.all([
      inspection.siteId ? this.sites.findOne({ where: { id: inspection.siteId } }) : Promise.resolve(null),
      inspection.ownerUserId ? this.users.findOne({ where: { id: inspection.ownerUserId } }) : Promise.resolve(null),
    ]);
    const assigneeIds = Array.from(new Set(actions.map(action => action.assignedToUserId).filter(Boolean)));
    const assignees = assigneeIds.length ? await this.users.find({ where: assigneeIds.map(id => ({ id })) }) : [];
    const assigneeNamesByUserId = new Map(assignees.filter(user => user.name).map(user => [user.id, user.name]));
    const sourceSnapshot = this.snapshotInspection(inspection, actions, site, preparedBy, assigneeNamesByUserId);
    // KG-1: persisted into the frozen report snapshot alongside the per-finding provenance
    // the snapshot already carries, so regenerating or re-reading an old report reproduces
    // the historical provenance instead of recomputing it from present-day knowledge.
    sourceSnapshot.knowledgeProvenance = this.knowledgeProvenance(sourceSnapshot);
    const sourceFingerprint = this.snapshotFingerprint(sourceSnapshot);

    // Artifacts to destroy only once the replacement has COMMITTED. Populated inside the
    // transaction; consumed after it returns.
    const retireAfterCommit: string[] = [];
    // The replacement's own artifact, so a failure before commit can destroy the half-made file
    // rather than leaking it. Stored outside the transaction because `StorageService.store` commits
    // on its own connection and is therefore not rolled back with us.
    let replacementObjectId: string | null = null;

    let result: ReturnType<CanonicalReportsService['metadata']>;
    try {
      result = await this.dataSource.transaction(async manager => {
        await manager.query(`SELECT pg_advisory_xact_lock(hashtext(${'$'}1))`, [`inspection-report:${inspectionId}`]);
        const reportRepo = manager.getRepository(InspectionReport);
        const versionRepo = manager.getRepository(InspectionReportVersion);
        const auditRepo = manager.getRepository(SecurityAuditEvent);
        let report = await reportRepo.findOne({ where: { inspectionId } });
        if (!report) report = await reportRepo.save(reportRepo.create({ inspectionId, organizationId: inspection.organizationId, ownerUserId: inspection.ownerUserId, createdByUserId: user.userId, archivedAt: null }));
        const existing = await versionRepo.findOne({ where: { reportId: report.id, sourceFingerprint, status: 'generated' } });
        if (existing) {
          // The completed inspection has not changed since this report was made, so there is
          // nothing to replace. Returning the report that already exists is the correct outcome:
          // regenerating identical content would destroy a valid artifact to recreate the same one.
          await auditRepo.save(auditRepo.create({ actorUserId: user.userId, organizationId: user.organizationId, action: 'report_generation_duplicate_replayed', resourceType: 'inspection_report_version', resourceId: existing.id, metadata: { reportId: report.id, version: existing.version, inspectionId, sourceFingerprint } }));
          return this.metadata(report, existing, inspection);
        }
        const superseded = await versionRepo.find({ where: { reportId: report.id }, order: { version: 'DESC' } });
        const replacement = await versionRepo.save(versionRepo.create({
          reportId: report.id, version: (superseded[0]?.version || 0) + 1, status: 'generating',
          sourceInspectionVersion: inspection.version, sourceFingerprint, sourceSnapshot,
          storageObjectId: null, sha256: null, sizeBytes: null, generatorVersion: GENERATOR_VERSION,
          generatedByUserId: user.userId, generatedAt: null, failureReason: null, supersededByVersionId: null,
        }));

        const pdf = await pdfFromSnapshot(sourceSnapshot);
        if (pdf.length < 8 || pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Generator did not produce a valid PDF.');
        const object = await this.storage.store({
          user, category: 'report', parentType: 'report_version', parentId: replacement.id,
          organizationId: inspection.organizationId, ownerUserId: inspection.ownerUserId,
          contentType: 'application/pdf',
          // Named for the customer's record number, not for a uuid or a version counter.
          downloadName: `${this.reportDownloadName(inspection, site)}.pdf`,
          body: pdf,
        });
        replacementObjectId = object.id;
        replacement.status = 'generated'; replacement.storageObjectId = object.id;
        replacement.sha256 = object.sha256; replacement.sizeBytes = object.sizeBytes;
        replacement.generatedAt = new Date();
        await versionRepo.save(replacement);

        // THE SWITCH. Only now, with the replacement proven to exist and verify, do the previous
        // snapshots stop being the inspection's report -- and they stop atomically, so no reader
        // ever observes two.
        if (superseded.length) {
          for (const stale of superseded) if (stale.storageObjectId) retireAfterCommit.push(stale.storageObjectId);
          await versionRepo.delete(superseded.map(stale => stale.id));
        }
        for (const orphan of await this.orphanedReportArtifactIds(user)) {
          if (orphan !== object.id && !retireAfterCommit.includes(orphan)) retireAfterCommit.push(orphan);
        }

        await auditRepo.save(auditRepo.create({
          actorUserId: user.userId, organizationId: user.organizationId, action: 'report_generated',
          resourceType: 'inspection_report_version', resourceId: replacement.id,
          metadata: {
            reportId: report.id, version: replacement.version, inspectionId, sourceFingerprint,
            replacedSnapshotIds: superseded.map(stale => stale.id),
            retainedSnapshots: 1,
          },
        }));
        return this.metadata(report, replacement, inspection);
      });
    } catch (error) {
      // The transaction rolled back, so the customer's previous report is intact and still current.
      // The only thing that survived the rollback is the replacement's own artifact, because
      // storage commits on its own connection -- destroy it rather than leave an unreferenced PDF.
      if (replacementObjectId) {
        await this.storage.retireReportArtifact(user, replacementObjectId).catch(() => undefined);
      }
      await this.audits.save(this.audits.create({
        actorUserId: user.userId, organizationId: user.organizationId,
        action: 'report_generation_failed', resourceType: 'inspection_report', resourceId: inspectionId,
        metadata: {
          inspectionId,
          reason: error instanceof Error ? error.message.slice(0, 1000) : 'Report generation failed.',
          previousReportPreserved: true,
        },
      })).catch(() => undefined);
      throw error;
    }

    // COMMITTED. The customer's current report is the replacement, so the artifacts it replaced can
    // now be destroyed. A failure here leaves an unreferenced PDF, never a missing one, and the next
    // generation sweeps it (see orphanedReportArtifactIds) -- so this must not fail the request.
    for (const objectId of retireAfterCommit) {
      await this.storage.retireReportArtifact(user, objectId).catch(() => undefined);
    }
    return result;
  }

  /**
   * The report library. ONE card per inspection, because an inspection has one report.
   *
   * Each card carries what identifies the report to a person -- the inspection's record number, its
   * title and site, when the inspection was completed, how many findings it recorded, its
   * jurisdiction, and when the report itself was last updated. It deliberately does NOT carry the
   * frozen `sourceSnapshot` (measured at ~196 KB per report), any version history, or a checksum
   * presented as identity.
   */
  async list(rawUser: unknown) {
    const user = requireAuthenticatedUser(rawUser);
    const reports = await this.reports.createQueryBuilder('report')
      .leftJoinAndSelect('report.versions', 'version')
      .where(user.organizationId ? 'report.organizationId = :scope' : 'report.ownerUserId = :scope',
        { scope: user.organizationId || user.userId })
      .andWhere('report.archivedAt IS NULL')
      .getMany();

    // Human-readable context for the report list (the list previously exposed only the raw
    // inspection UUID as its heading). Read from the same scope the report itself belongs to;
    // no additional authorization surface is opened because every report row here already
    // passed the owner/organization scope filter above.
    const inspectionIds = Array.from(new Set(reports.map(report => report.inspectionId).filter(Boolean)));
    const inspections = inspectionIds.length
      ? await this.dataSource.getRepository(Inspection).find({ where: inspectionIds.map(id => ({ id })) })
      : [];
    const siteIds = Array.from(new Set(inspections.map(item => item.siteId).filter(Boolean)));
    const sites = siteIds.length ? await this.sites.find({ where: siteIds.map(id => ({ id })) }) : [];
    const siteById = new Map(sites.map(site => [site.id, site]));
    const inspectionById = new Map(inspections.map(item => [item.id, item]));

    // Finding counts, counted the same way every other customer-facing surface counts them:
    // `finalized` only. A dismissed HazLenz proposal is not a finding of the inspection, and a
    // finding still pending review is not one yet.
    const findingCounts = new Map<string, number>();
    if (inspectionIds.length) {
      const counted = await this.dataSource.getRepository(InspectionFinding)
        .createQueryBuilder('finding')
        .select('finding.inspectionId', 'inspectionId')
        .addSelect('COUNT(*)', 'total')
        .where('finding.inspectionId IN (:...ids)', { ids: inspectionIds })
        .andWhere(`finding.status = 'finalized'`)
        .groupBy('finding.inspectionId')
        .getRawMany<{ inspectionId: string; total: string }>();
      for (const row of counted) findingCounts.set(row.inspectionId, Number(row.total));
    }

    return reports.map(report => {
      const inspection = inspectionById.get(report.inspectionId);
      const site = inspection ? siteById.get(inspection.siteId) : undefined;
      const current = this.currentSnapshot(report.versions || []);
      return {
        id: report.id,
        inspectionId: report.inspectionId,
        createdAt: report.createdAt,
        /** When the report artifact the customer can download now was produced. */
        reportUpdatedAt: current?.generatedAt || null,
        status: current?.status || 'missing',
        checksum: current?.sha256 || null,
        sizeBytes: current?.sizeBytes || null,
        inspection: inspection ? {
          id: inspection.id,
          displayNumber: inspection.displayNumber,
          title: inspection.title,
          status: inspection.status,
          regulatoryContext: inspection.regulatoryContext || 'unknown',
          completedAt: inspection.completedAt,
          siteName: site?.name || null,
          findingCount: findingCounts.get(inspection.id) || 0,
        } : null,
      };
    })
      // Most recently updated report first. Ordering in SQL would have ordered by the joined
      // version rows, which is meaningless now that there is exactly one per report.
      .sort((a, b) => new Date(b.reportUpdatedAt || b.createdAt).getTime()
        - new Date(a.reportUpdatedAt || a.createdAt).getTime());
  }

  /**
   * The one report belonging to one inspection, or null when none has been generated.
   *
   * The completed-inspection page needs "does this inspection have a report, and when was it last
   * updated?" and nothing else. `list()` can answer it but walks every report in the account, so
   * this stays a direct per-inspection lookup on the same authorization path as `get`.
   */
  async forInspection(rawUser: unknown, inspectionId: string) {
    const inspection = await this.inspections.findAccessible(rawUser, inspectionId);
    const report = await this.reports.findOne({ where: { inspectionId } });
    if (!report) return null;
    const current = this.currentSnapshot(
      await this.versions.find({ where: { reportId: report.id }, order: { version: 'DESC' } }),
    );
    if (!current) return null;
    return this.metadata(report, current, inspection);
  }

  async get(rawUser: unknown, reportId: string) {
    const report = await this.accessibleReport(rawUser, reportId);
    const inspection = await this.dataSource.getRepository(Inspection)
      .findOne({ where: { id: report.inspectionId } });
    const current = this.currentSnapshot(
      await this.versions.find({ where: { reportId }, order: { version: 'DESC' } }),
    );
    return {
      id: report.id,
      inspectionId: report.inspectionId,
      createdAt: report.createdAt,
      archivedAt: report.archivedAt,
      report: current ? this.metadata(report, current, inspection) : null,
    };
  }

  /**
   * Sets `archivedAt`, which hides the report from `list()`. There is no unarchive.
   *
   * NOT part of the v1.0 customer workflow and not reachable from the product: the report is an
   * output of its inspection, not a disposable object the customer deletes independently of it.
   * Retained here only so the existing route and its audit event keep working while report/archive
   * management is decided; it destroys nothing.
   */
  async archive(rawUser: unknown, reportId: string) {
    const user = requireAuthenticatedUser(rawUser);
    const report = await this.accessibleReport(rawUser, reportId);
    if (report.archivedAt) return { reportId: report.id, archivedAt: report.archivedAt };
    report.archivedAt = new Date();
    await this.reports.save(report);
    await this.audits.save(this.audits.create({
      actorUserId: user.userId,
      organizationId: user.organizationId,
      action: 'report_archived',
      resourceType: 'inspection_report',
      resourceId: report.id,
      metadata: { inspectionId: report.inspectionId },
    }));
    return { reportId: report.id, archivedAt: report.archivedAt };
  }

  /** The inspection's current report. There is exactly one, so no version is named. */
  async downloadCurrent(rawUser: unknown, reportId: string) {
    const report = await this.accessibleReport(rawUser, reportId);
    const current = this.currentSnapshot(
      await this.versions.find({ where: { reportId }, order: { version: 'DESC' } }),
    );
    if (!current?.storageObjectId) throw new NotFoundException('Report not found.');
    return this.storage.read(rawUser, current.storageObjectId);
  }

  /**
   * Download by internal snapshot sequence. Retained for the existing verification suites that
   * address a snapshot directly; the product never builds this URL, because the customer has no
   * version to name. A sequence whose snapshot was replaced is genuinely gone and answers 404.
   */
  async download(rawUser: unknown, reportId: string, versionNumber: number) {
    await this.accessibleReport(rawUser, reportId);
    const version = await this.versions.findOne({ where: { reportId, version: versionNumber } });
    if (!version || !version.storageObjectId || version.status !== 'generated') {
      throw new NotFoundException('Report version not found.');
    }
    return this.storage.read(rawUser, version.storageObjectId);
  }

  /**
   * The single retained snapshot for a report.
   *
   * After a successful generation exactly one row exists, so this is a direct read in practice. The
   * `find`-then-pick shape is kept because a report whose only generation FAILED legitimately has
   * no generated row at all, and that must read as "no report", never as a downloadable one.
   */
  private currentSnapshot(versions: InspectionReportVersion[]) {
    return versions.filter(version => version.status === 'generated')
      .sort((a, b) => b.version - a.version)[0] || null;
  }

  /** e.g. `inspection-7-crusher-plant-report`. Never a uuid, never a checksum, never a version. */
  private reportDownloadName(inspection: { displayNumber?: number | null; id: string; title?: string }, site: Site | null) {
    const number = inspection.displayNumber ? `inspection-${inspection.displayNumber}` : `inspection-${inspection.id}`;
    const label = [site?.name, inspection.title].filter(Boolean).join(' ');
    return `${number}${label ? `-${label}` : ''}-report`;
  }

  /**
   * The report as the rest of the system sees it.
   *
   * `versionId` and `version` remain in the payload as the INTERNAL snapshot identity: the audit
   * events, the frozen-snapshot verification suites and the diagnostics all address a snapshot row,
   * and removing their handle would blind them. They are not a customer-facing sequence and no
   * product surface renders them -- the customer sees the inspection's record number, when the
   * report was last updated, and the checksum under technical details.
   */
  private metadata(
    report: InspectionReport,
    version: InspectionReportVersion,
    inspection?: { id: string; displayNumber?: number | null; completedAt?: Date | null } | null,
  ) {
    return {
      reportId: report.id, inspectionId: report.inspectionId, versionId: version.id,
      version: version.version, status: version.status, sourceInspectionVersion: version.sourceInspectionVersion,
      generatedAt: version.generatedAt, checksum: version.sha256, sizeBytes: version.sizeBytes,
      generatorVersion: version.generatorVersion, failureReason: version.failureReason,
      /** Customer-facing: the inspection's record number, and the two timestamps that differ. */
      inspectionNumber: inspection?.displayNumber ?? null,
      inspectionCompletedAt: inspection?.completedAt ?? null,
      reportUpdatedAt: version.generatedAt,
    };
  }
}
