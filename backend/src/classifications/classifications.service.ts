
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Classification } from './entities/classification.entity';

import { Report } from '../reports/entities/report.entity';

import { AuditService } from '../audit/audit.service';

import { TaxonomyService } from '../taxonomy/taxonomy.service';

import { RuleEngine } from './rule-engine.service';

import { EntityExtractorService } from './entity-extractor.service';

@Injectable()

export class ClassificationsService {

  constructor(

    @InjectRepository(Classification)

    private classificationRepository: Repository<Classification>,

    @InjectRepository(Report)

    private reportRepository: Repository<Report>,

    private auditService: AuditService,

    private taxonomyService: TaxonomyService,

    private ruleEngine: RuleEngine,

    private entityExtractor: EntityExtractorService,

  ) {}

  private requireOrganization(user?: any): string {

    const organizationId = user?.organizationId || user?.tenantId;

    if (!organizationId) {

      throw new UnauthorizedException('Organization context is required.');

    }

    return organizationId;

  }

  private async getScopedReport(reportId: string, user?: any): Promise<Report> {

    const organizationId = this.requireOrganization(user);

    const report = await this.reportRepository.findOne({

      where: { id: reportId, organizationId },

    });

    if (!report) throw new NotFoundException('Report not found');

    return report;

  }

  private async getScopedClassification(classificationId: string, user?: any): Promise<Classification> {

    const organizationId = this.requireOrganization(user);

    const classification = await this.classificationRepository

      .createQueryBuilder('classification')

      .innerJoin(Report, 'report', 'report.id = classification.reportId')

      .where('classification.id = :classificationId', { classificationId })

      .andWhere('report.organizationId = :organizationId', { organizationId })

      .getOne();

    if (!classification) throw new NotFoundException('Classification not found');

    return classification;

  }

  async findByReportId(reportId: string, user?: any): Promise<Classification[]> {

    await this.getScopedReport(reportId, user);

    return this.classificationRepository.find({

      where: { reportId },

      order: { createdAt: 'DESC' },

    });

  }

  async classify(reportId: string, user?: any): Promise<Classification> {

    const report = await this.getScopedReport(reportId, user);

    const narrativeText =

      typeof report.narrative === 'string'

        ? report.narrative

        : JSON.stringify(report.narrative || report.frontendReportJson || {});

    const entities = this.entityExtractor.extract(narrativeText);

    const result = this.ruleEngine.classify(narrativeText);

    const classification = this.classificationRepository.create({

      reportId,

      classifierType: 'RULE_ENGINE_V1',

      classifierVersion: '1.0.0',

      eventTypeCode: report.eventTypeCode || 'INSPECTION_FINDING',

      hazardCategoryCode: result.hazardCategoryCode,

      severityLevel: result.severityLevel,

      confidenceScore: result.confidenceScore,

      requiresHumanReview: result.requiresHumanReview,

      extractedEntities: entities,

      reasoningSummary: { ...result.reasoningSummary, extractedEntities: entities },

    });

    const saved = await this.classificationRepository.save(classification);

    await this.auditService.log({

      tenantId: report.organizationId,

      entityType: 'CLASSIFICATION',

      entityId: saved.id,

      actionCode: 'CLASSIFICATION_CREATED',

      afterJson: saved,

      metadataJson: { reportId },

    });

    return saved;

  }

  async review(

    classificationId: string,

    action: string,

    notes: string,

    reason?: string,

    user?: any,

  ): Promise<Classification> {

    const classification = await this.getScopedClassification(classificationId, user);

    const report = await this.getScopedReport(classification.reportId, user);

    classification.classificationStatus = action;

    classification.reviewedAt = new Date();

    classification.reviewReason = reason || notes;

    await this.classificationRepository.save(classification);

    await this.auditService.log({

      tenantId: report.organizationId,

      entityType: 'CLASSIFICATION',

      entityId: classification.id,

      actionCode: `REVIEW_${action.toUpperCase()}`,

      afterJson: classification,

      metadataJson: { notes, reason },

      actorUserId: user?.userId ? String(user.userId) : undefined,

    });

    return classification;

  }

}

