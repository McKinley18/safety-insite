import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { AuthenticatedUser, requireAuthenticatedUser } from '../common/authenticated-user';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { InspectionService } from '../inspection/inspection.service';
import { Inspection } from '../inspection/inspection.entity';
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
        findings: (inspection.findings || []).filter((finding: any) =>
          finding.observationId === observation.id && finding.status !== 'superseded',
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

  private snapshotFingerprint(snapshot: Record<string, any>) {
    const stable = { ...snapshot };
    delete stable.capturedAt;
    return createHash('sha256').update(JSON.stringify(stable)).digest('hex');
  }

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
    const sourceFingerprint = this.snapshotFingerprint(sourceSnapshot);
    return this.dataSource.transaction(async manager => {
      await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`inspection-report:${inspectionId}`]);
      const reportRepo = manager.getRepository(InspectionReport);
      const versionRepo = manager.getRepository(InspectionReportVersion);
      const auditRepo = manager.getRepository(SecurityAuditEvent);
      let report = await reportRepo.findOne({ where: { inspectionId } });
      if (!report) report = await reportRepo.save(reportRepo.create({ inspectionId, organizationId: inspection.organizationId, ownerUserId: inspection.ownerUserId, createdByUserId: user.userId, archivedAt: null }));
      const existing = await versionRepo.findOne({ where: { reportId: report.id, sourceFingerprint, status: 'generated' } });
      if (existing) {
        await auditRepo.save(auditRepo.create({ actorUserId: user.userId, organizationId: user.organizationId, action: 'report_generation_duplicate_replayed', resourceType: 'inspection_report_version', resourceId: existing.id, metadata: { reportId: report.id, version: existing.version, inspectionId, sourceFingerprint } }));
        return this.metadata(report, existing);
      }
      const last = await versionRepo.findOne({ where: { reportId: report.id }, order: { version: 'DESC' } });
      const version = await versionRepo.save(versionRepo.create({ reportId: report.id, version: (last?.version || 0) + 1, status: 'generating', sourceInspectionVersion: inspection.version, sourceFingerprint, sourceSnapshot, storageObjectId: null, sha256: null, sizeBytes: null, generatorVersion: GENERATOR_VERSION, generatedByUserId: user.userId, generatedAt: null, failureReason: null, supersededByVersionId: null }));
      try {
        const pdf = await pdfFromSnapshot(sourceSnapshot);
        if (pdf.length < 8 || pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Generator did not produce a valid PDF.');
        const object = await this.storage.store({ user, category: 'report', parentType: 'report_version', parentId: version.id, organizationId: inspection.organizationId, ownerUserId: inspection.ownerUserId, contentType: 'application/pdf', downloadName: `inspection-${inspection.id}-v${version.version}.pdf`, body: pdf });
        version.status = 'generated'; version.storageObjectId = object.id; version.sha256 = object.sha256; version.sizeBytes = object.sizeBytes; version.generatedAt = new Date();
        await versionRepo.save(version);
        if (last?.status === 'generated') { last.status = 'superseded'; last.supersededByVersionId = version.id; await versionRepo.save(last); }
        await auditRepo.save(auditRepo.create({ actorUserId: user.userId, organizationId: user.organizationId, action: 'report_generated', resourceType: 'inspection_report_version', resourceId: version.id, metadata: { reportId: report.id, version: version.version, inspectionId, sourceFingerprint } }));
        return this.metadata(report, version);
      } catch (error) {
        version.status = 'failed'; version.failureReason = error instanceof Error ? error.message.slice(0, 1000) : 'Report generation failed.'; await versionRepo.save(version); throw error;
      }
    });
  }

  async list(rawUser: unknown) {
    const user = requireAuthenticatedUser(rawUser);
    const query = this.reports.createQueryBuilder('report')
      .leftJoinAndSelect('report.versions', 'version')
      .where(user.organizationId ? 'report.organizationId = :scope' : 'report.ownerUserId = :scope',
        { scope: user.organizationId || user.userId })
      .andWhere('report.archivedAt IS NULL')
      .orderBy('version.version', 'DESC');
    const reports = await query.getMany();
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
    return reports.map(report => {
      const inspection = inspectionById.get(report.inspectionId);
      const site = inspection ? siteById.get(inspection.siteId) : undefined;
      return {
        ...report,
        inspection: inspection ? {
          id: inspection.id, title: inspection.title, status: inspection.status,
          regulatoryContext: inspection.regulatoryContext || 'unknown',
          completedAt: inspection.completedAt, siteName: site?.name || null,
        } : null,
      };
    });
  }

  async get(rawUser: unknown, reportId: string) {
    const report = await this.accessibleReport(rawUser, reportId);
    const versions = await this.versions.find({ where: { reportId }, order: { version: 'DESC' } });
    return { ...report, versions: versions.map(version => this.metadata(report, version)) };
  }

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

  async download(rawUser: unknown, reportId: string, versionNumber: number) {
    const report = await this.accessibleReport(rawUser, reportId);
    const version = await this.versions.findOne({ where: { reportId, version: versionNumber } });
    if (!version || !version.storageObjectId || !['generated', 'superseded'].includes(version.status)) {
      throw new NotFoundException('Report version not found.');
    }
    return this.storage.read(rawUser, version.storageObjectId);
  }

  private metadata(report: InspectionReport, version: InspectionReportVersion) {
    return {
      reportId: report.id, inspectionId: report.inspectionId, versionId: version.id,
      version: version.version, status: version.status, sourceInspectionVersion: version.sourceInspectionVersion,
      generatedAt: version.generatedAt, checksum: version.sha256, sizeBytes: version.sizeBytes,
      generatorVersion: version.generatorVersion, failureReason: version.failureReason,
    };
  }
}
