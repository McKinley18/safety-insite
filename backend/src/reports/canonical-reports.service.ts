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
import { renderInspectionReportPdf, type ReportArtifactIdentity } from './canonical-report-pdf-renderer';
import { emitOperationalEvent } from '../observability/operational-events';

/**
 * §277 / D-028. The renderer's identity, and part of the report fingerprint.
 *
 * Bumped from `/2` because §276 corrected two things a compliance artifact carries: the
 * product brand on the cover and in the running header (D-013), and the severity a finding
 * states along with the basis line under it (D-008). A report issued by `/2` states a brand
 * the product does not have, and may state a number no reviewer chose.
 *
 * Bumping this does NOT rewrite those artifacts -- nothing rewrites an issued report. It
 * means the next generation for an inspection produces a NEW REVISION rendered by `/3`,
 * with its own id, timestamp and checksum, and marks the `/2` artifact superseded beside it.
 * Both remain retrievable, and the history says which was issued when.
 *
 * Change this deliberately, when a renderer correction must reach reports that already
 * exist. It is not a build number and must not track one: a value that moved on every
 * deploy would re-issue every report in the product for no stated reason.
 */
const GENERATOR_VERSION = 'safety-insite-pdf/3';

function pdfFromSnapshot(
  snapshot: Record<string, any>,
  identity: ReportArtifactIdentity,
): Promise<Buffer> {
  return renderInspectionReportPdf(snapshot, identity);
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
        /**
         * §285 — THE CUSTOMER-FACING RECORD NUMBER, so the report can name the inspection the way
         * the rest of the product does.
         *
         * Without it the PDF cover had nothing to print but the uuid, and printed the first eight
         * characters of it as "Record reference 438D5D3C". That is an internal identifier on the
         * one artifact a customer files with a client or a regulator, and it contradicts the
         * identity rule the completion screen already states: the record is "Inspection #7", and
         * the checksum is integrity metadata rather than a name.
         */
        displayNumber: inspection.displayNumber ?? null,
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
    /**
     * §277 / D-028. The fingerprint covers the GENERATOR as well as the snapshot.
     *
     * It used to cover the snapshot alone, so an unchanged inspection returned its existing
     * artifact however much the renderer had changed underneath -- and §276 measured the
     * consequence: the brand and severity corrections could not reach a report that had
     * already been issued, because nothing about the inspection had moved.
     *
     * D-028 settles it: an authoritative renderer, severity or branding correction that
     * requires a report to change produces a NEW REVISION. Including the generator version
     * here is what makes that happen, and it happens deliberately -- someone has to bump
     * `GENERATOR_VERSION` -- rather than on every unrelated deploy.
     *
     * The previously issued artifact is not touched. It is superseded, which is the whole
     * of D-028's other half.
     */
    const sourceFingerprint = this.snapshotFingerprint({ ...sourceSnapshot, generatorVersion: GENERATOR_VERSION });

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
        /**
         * Every revision, newest first -- used for the next version number, which must keep
         * counting past revisions that are already superseded.
         */
        const allRevisions = await versionRepo.find({ where: { reportId: report.id }, order: { version: 'DESC' } });
        /**
         * §277 / D-028. Only the revisions that are CURRENT stop being current.
         *
         * This was `allRevisions`, and it re-pointed every already-superseded row at the new
         * revision -- so after a third issue, revision 1 claimed to have been superseded by
         * revision 3 when it was actually superseded by revision 2. That is history being
         * rewritten by a later event, which is the precise thing an immutable-artifact rule
         * exists to prevent. A superseded revision keeps the pointer it was given.
         */
        const superseded = allRevisions.filter(revision => revision.status === 'generated');
        const replacement = await versionRepo.save(versionRepo.create({
          reportId: report.id, version: (allRevisions[0]?.version || 0) + 1, status: 'generating',
          sourceInspectionVersion: inspection.version, sourceFingerprint, sourceSnapshot,
          storageObjectId: null, sha256: null, sizeBytes: null, generatorVersion: GENERATOR_VERSION,
          generatedByUserId: user.userId, generatedAt: null, failureReason: null, supersededByVersionId: null,
        }));

        /**
         * §286 — THE ARTIFACT AND THE RECORD STATE THE SAME ISSUE TIME.
         *
         * `issuedAt` is computed ONCE, here, and is both printed into the PDF and persisted as the
         * revision's `generatedAt`. Stamping `new Date()` separately after the render — which is
         * what this did — would have put a time on the document a second or two ahead of or behind
         * the time in the record, and the §286 requirement is that the revision number, checksum,
         * issue time and current/superseded status cannot disagree across the server record, the
         * report library and the artifact. A near-miss is still a disagreement.
         *
         * The revision NUMBER is `replacement.version`, already allocated above from the report's
         * own sequence. Nothing here maintains a parallel counter.
         */
        const issuedAt = new Date();
        const pdf = await pdfFromSnapshot(sourceSnapshot, {
          revision: replacement.version,
          issuedAt,
        });
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
        // The SAME instant the artifact prints. See `issuedAt` above.
        replacement.generatedAt = issuedAt;
        await versionRepo.save(replacement);

        /**
         * THE SWITCH. Only now, with the replacement proven to exist and verify, do the
         * previous revisions stop being the inspection's CURRENT report -- and they stop
         * atomically, so no reader ever observes two current ones.
         *
         * §277 / D-028: AN ISSUED REPORT IS AN IMMUTABLE ARTIFACT.
         *
         * This used to `delete` the previous rows and destroy their PDFs. That made the
         * replacement indistinguishable from a correction of the original, and it destroyed
         * the record of what the customer had actually been given -- for a compliance
         * artifact that may already have been filed with a client or a regulator, the
         * question "what did the report say when we issued it?" has to remain answerable.
         *
         * The rows are retained and marked `superseded`, each pointing at the revision that
         * replaced it, and their artifacts are NOT retired. `currentSnapshot()` already
         * selects the highest-numbered `generated` row, so the current report is unambiguous
         * without any read-path change, and the orphan sweep below stops treating those
         * artifacts as orphans because their parent row still exists.
         *
         * No migration was needed: `status: 'superseded'` was already in the column's
         * vocabulary and `supersededByVersionId` was already on the table. The schema had
         * been built for this; only the write path had not used it.
         */
        if (superseded.length) {
          for (const stale of superseded) {
            stale.status = 'superseded';
            stale.supersededByVersionId = replacement.id;
          }
          await versionRepo.save(superseded);
        }
        for (const orphan of await this.orphanedReportArtifactIds(user)) {
          if (orphan !== object.id && !retireAfterCommit.includes(orphan)) retireAfterCommit.push(orphan);
        }

        await auditRepo.save(auditRepo.create({
          actorUserId: user.userId, organizationId: user.organizationId, action: 'report_generated',
          resourceType: 'inspection_report_version', resourceId: replacement.id,
          metadata: {
            reportId: report.id, version: replacement.version, inspectionId, sourceFingerprint,
            supersededRevisionIds: superseded.map(stale => stale.id),
            supersededRevisions: superseded.length,
            // §277 / D-028. Every revision is retained; none is destroyed.
            retainedRevisions: superseded.length + 1,
            generatorVersion: GENERATOR_VERSION,
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
      // §268. The audit row below records it for the customer's history; this records it for the
      // operator. Only the failure KIND crosses into the log — the message can carry a database
      // error or a storage path, so it is deliberately not emitted.
      emitOperationalEvent('report.generation_failed', {
        inspectionId,
        failureKind: error instanceof Error ? error.name : 'UnknownError',
        previousReportPreserved: true,
      });
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
      const versions = report.versions || [];
      const current = this.currentSnapshot(versions);
      return {
        id: report.id,
        inspectionId: report.inspectionId,
        createdAt: report.createdAt,
        /** When the report artifact the customer can download now was produced. */
        reportUpdatedAt: current?.generatedAt || null,
        status: current?.status || 'missing',
        checksum: current?.sha256 || null,
        sizeBytes: current?.sizeBytes || null,
        /**
         * §286 / D-046 — THE REVISION THE CUSTOMER WOULD DOWNLOAD, AND WHETHER THERE ARE OTHERS.
         *
         * Carried on the card so the library can state "Revision 2" and offer history only where
         * history exists, without a per-card round trip that would make a list of twenty reports
         * twenty-one requests. The full history is still a separate read; this is only enough to
         * label the card truthfully and decide whether the history control is meaningful.
         *
         * `issuedRevisionCount` counts artifacts that exist, so a failed generation beside one
         * good revision does not advertise a history with nothing retrievable in it.
         */
        revision: current?.version ?? null,
        issuedRevisionCount: versions.filter(version => this.isIssued(version)).length,
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
   * Download one REVISION by its number.
   *
   * §277 / D-028. A `superseded` revision is downloadable, because it is the immutable
   * artifact that was actually issued. Before §277 a replaced revision was deleted outright
   * and this answered 404 for it; now it answers with the bytes that were given out, and
   * only a revision that never finished generating is genuinely absent.
   *
   * §286 / D-046. This used to say "the product never builds this URL". It does now: the
   * report library's revision history offers each retained revision for download, which is
   * the guarantee D-028 already provided on the server and the customer could not reach.
   * Nothing about the route's authorization or its answer changed -- it was always correct,
   * and was simply never called.
   */
  async download(rawUser: unknown, reportId: string, versionNumber: number) {
    await this.accessibleReport(rawUser, reportId);
    const version = await this.versions.findOne({ where: { reportId, version: versionNumber } });
    if (!version || !this.isIssued(version)) {
      throw new NotFoundException('Report version not found.');
    }
    return this.storage.read(rawUser, version.storageObjectId as string);
  }

  /**
   * §277 / D-028 — THE REVISION HISTORY OF ONE REPORT.
   *
   * Newest first. Each entry states its own identity, checksum, generation time, generator
   * and whether it is the current revision or was superseded by a named later one, so
   * "history can distinguish revisions" is answerable from one read rather than inferred.
   *
   * §286 / D-046 — AND IT IS NOW A CUSTOMER-FACING READ.
   *
   * §285 measured that this route existed and the client called neither it nor the
   * per-revision download, so from the customer's side four of D-028's five guarantees were
   * unobservable: an inspector who had filed revision 1 with a client could not see that it
   * existed, could not tell which revision they had filed, and could not retrieve it.
   *
   * Two things changed for that. First, `supersededByRevision` carries the NUMBER of the
   * revision that replaced this one, alongside the existing uuid. The product-owner
   * direction is explicit that a raw uuid may not be the customer's primary identifier for a
   * revision, and "Replaced by Revision 2" is only expressible if the number travels with the
   * link. Second, `downloadable` states whether these bytes can still be retrieved, so the
   * surface offers a download exactly when `download()` would answer with one rather than
   * inferring it from a status vocabulary the client would then own a second copy of.
   *
   * `revisionCount` counts EVERY row including a failed generation, because it is the length
   * of this list. `issuedRevisionCount` counts the ones that actually became artifacts, which
   * is the number a customer surface means by "how many revisions are there".
   */
  async revisions(rawUser: unknown, reportId: string) {
    const report = await this.accessibleReport(rawUser, reportId);
    const versions = await this.versions.find({ where: { reportId }, order: { version: 'DESC' } });
    const current = this.currentSnapshot(versions);
    const numberByRevisionId = new Map(versions.map(version => [version.id, version.version]));
    const inspection = await this.dataSource.getRepository(Inspection)
      .findOne({ where: { id: report.inspectionId } });
    return {
      reportId: report.id,
      inspectionId: report.inspectionId,
      /** The customer's name for the record this is a report of. Never a uuid. */
      inspectionNumber: inspection?.displayNumber ?? null,
      currentRevisionId: current?.id || null,
      /** The customer-facing revision number of the report they would download now. */
      currentRevision: current?.version ?? null,
      revisionCount: versions.length,
      issuedRevisionCount: versions.filter(version => this.isIssued(version)).length,
      revisions: versions.map(version => ({
        revisionId: version.id,
        revision: version.version,
        status: version.status,
        isCurrent: current ? version.id === current.id : false,
        checksum: version.sha256,
        sizeBytes: version.sizeBytes,
        generatedAt: version.generatedAt,
        generatorVersion: version.generatorVersion,
        supersededByRevisionId: version.supersededByVersionId,
        /** The NUMBER of the replacing revision, so no surface has to print a uuid to say so. */
        supersededByRevision: version.supersededByVersionId
          ? numberByRevisionId.get(version.supersededByVersionId) ?? null
          : null,
        /** True exactly when `download(reportId, revision)` would return these bytes. */
        downloadable: this.isIssued(version),
        sourceInspectionVersion: version.sourceInspectionVersion,
        failureReason: version.failureReason,
      })),
    };
  }

  /**
   * A revision whose artifact exists and is still retrievable.
   *
   * `superseded` is deliberately included: §277 / D-028's whole point is that the bytes the
   * customer was actually given remain downloadable after a successor exists. Only a
   * generation that never finished has nothing behind it.
   */
  private isIssued(version: InspectionReportVersion) {
    return Boolean(version.storageObjectId) && ['generated', 'superseded'].includes(version.status);
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
   * `versionId` remains the INTERNAL snapshot identity: the audit events, the frozen-snapshot
   * verification suites and the diagnostics all address a snapshot row, and removing their handle
   * would blind them. It is not customer identity and no product surface renders it.
   *
   * §286 / D-046 — `version` IS NOW CUSTOMER-FACING, and is mirrored as `revision`.
   *
   * It was described here as an internal sequence no surface renders, on the v1.0 contract that an
   * inspection has one report and there is therefore nothing to number. That contract was never
   * what the server did -- §277 / D-028 has retained every issued revision since -- and §285
   * measured the consequence: `/reports` told the customer their report had been REPLACED while the
   * server held both. The number is the same number it always was; what changed is that the
   * customer is now allowed to see it, so it is emitted under a name that says what it is.
   */
  private metadata(
    report: InspectionReport,
    version: InspectionReportVersion,
    inspection?: { id: string; displayNumber?: number | null; completedAt?: Date | null } | null,
  ) {
    return {
      reportId: report.id, inspectionId: report.inspectionId, versionId: version.id,
      version: version.version,
      /** The same number under its customer-facing name. See the comment above. */
      revision: version.version,
      status: version.status, sourceInspectionVersion: version.sourceInspectionVersion,
      generatedAt: version.generatedAt, checksum: version.sha256, sizeBytes: version.sizeBytes,
      generatorVersion: version.generatorVersion, failureReason: version.failureReason,
      /** Customer-facing: the inspection's record number, and the two timestamps that differ. */
      inspectionNumber: inspection?.displayNumber ?? null,
      inspectionCompletedAt: inspection?.completedAt ?? null,
      reportUpdatedAt: version.generatedAt,
    };
  }
}
