import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report } from './entities/report.entity';
import { Finding } from './entities/finding.entity';
import { ReportAttachment } from './entities/attachment.entity';
import { StandardsService } from '../standards/standards.service';
import { ActionEngineService } from '../action-engine/action-engine.service';
import { CorrectiveActionsService } from '../corrective-actions/corrective-actions.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,

    @InjectRepository(Finding)
    private findingRepo: Repository<Finding>,

    @InjectRepository(ReportAttachment)
    private attachmentRepo: Repository<ReportAttachment>,

    private standards: StandardsService,

    @Inject(forwardRef(() => ActionEngineService))
    private actionEngine: ActionEngineService,

    private correctiveActionsService: CorrectiveActionsService,
  ) {}

  private requireOrganization(user?: any): string {
    const organizationId = user?.organizationId;

    if (!organizationId) {
      throw new UnauthorizedException('Organization context is required.');
    }

    return String(organizationId);
  }

  async create(body: any, user?: any) {
    const organizationId = this.requireOrganization(user);
    const frontendReport = body.frontendReportJson || body.report || body;

    const report = this.reportRepo.create({
      organizationId,
      createdByUserId: user?.userId ? String(user.userId) : body.createdByUserId,
      company: body.company || frontendReport.organizationName,
      site: body.site || frontendReport.siteLocation,
      inspector: body.inspector || frontendReport.leadInspector,
      confidential: body.confidential ?? frontendReport.isConfidential ?? false,
      status: 'active',
      frontendReportJson: frontendReport,
    });

    const savedReport = await this.reportRepo.save(report);

    const findings = [];
    const allActions = [];

    for (const f of frontendReport.findings || body.findings || []) {
      const matches = this.standards.match(f.hazardCategory || '');

      const finding = this.findingRepo.create({
        hazardCategory: f.hazardCategory,
        hazard: f.hazard || f.description,
        severity: f.severity,
        likelihood: f.likelihood,
        standards: f.selectedStandards || f.standards || f.safeScopeResult?.suggestedStandards || [],
        report: savedReport,
      });

      const savedFinding = await this.findingRepo.save(finding);

      const actions = await this.actionEngine.generateActionsFromReport({
        id: savedReport.id,
        category: f.hazardCategory,
        description: f.hazard || f.description || f.hazardCategory,
        riskScore: f.riskScore || 50,
        riskLevel: f.riskLevel || 'MODERATE',
        confidence: 0.9,
        patterns: f.patterns || [],
        location: f.location || body.site || frontendReport.siteLocation || 'Facility Floor',
        override: f.criticalOverride || false,
      });

      allActions.push(...actions);

      findings.push({
        ...savedFinding,
        standards: matches,
      });
    }

    const persistedActions = await this.correctiveActionsService.syncReportActions(
      savedReport.id,
      frontendReport,
      user,
    );

    return {
      ...savedReport,
      findings,
      generatedActions: allActions,
      persistedActions,
    };
  }

  async updatePackage(reportId: string, body: any, user?: any) {
    const organizationId = this.requireOrganization(user);
    const report = await this.reportRepo.findOne({
      where: { id: reportId, organizationId },
    });

    if (!report) {
      return null;
    }

    const frontendReport = body.frontendReportJson || body.report || body;

    report.company = body.company || frontendReport.organizationName || report.company;
    report.site = body.site || frontendReport.siteLocation || report.site;
    report.inspector = body.inspector || frontendReport.leadInspector || report.inspector;
    report.confidential =
      body.confidential ?? frontendReport.isConfidential ?? report.confidential;
    report.status = report.status || 'active';
    report.frontendReportJson = frontendReport;

    const saved = await this.reportRepo.save(report);
    const persistedActions = await this.correctiveActionsService.syncReportActions(
      saved.id,
      frontendReport,
      user,
    );

    return {
      ...saved,
      persistedActions,
    };
  }

  async addAttachment(reportId: string, body: any, user?: any) {
    const report = await this.findOne(reportId, user);

    if (!report) {
      return null;
    }

    const attachment = this.attachmentRepo.create({
      reportId,
      imageUri: body.imageUri,
      mimeType: body.mimeType,
      fileName: body.fileName,
    });

    return this.attachmentRepo.save(attachment);
  }

  async archive(reportId: string, user?: any) {
    const organizationId = this.requireOrganization(user);
    const report = await this.reportRepo.findOne({
      where: { id: reportId, organizationId },
    });

    if (!report) {
      return null;
    }

    report.status = 'archived';

    const frontendReportJson = report.frontendReportJson || {};
    report.frontendReportJson = {
      ...frontendReportJson,
      status: 'archived',
      archivedAt: new Date().toISOString(),
    };

    return this.reportRepo.save(report);
  }

  async findAll(user?: any) {
    const organizationId = this.requireOrganization(user);
    const reports = await this.reportRepo.find({
      where: { organizationId },
      relations: ['findings'],
      order: { reportedDatetime: 'DESC' },
    });

    return reports.filter((report) => report.status !== 'archived');
  }

  async findOne(id: string, user?: any) {
    const organizationId = this.requireOrganization(user);
    const report = await this.reportRepo.findOne({
      where: { id, organizationId },
      relations: ['findings'],
    });

    if (!report || report.status === 'archived') return null;

    const findings = (report.findings || []).map((f) => ({
      ...f,
      standards: this.standards.match(f.hazardCategory || ''),
    }));

    return {
      ...report,
      findings,
    };
  }
}
