
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Classification } from '../classifications/entities/classification.entity';

import { Review } from './entities/review.entity';

import { Report } from '../reports/entities/report.entity';

import { AuditService } from '../audit/audit.service';

@Injectable()

export class ReviewsService {

  constructor(

    @InjectRepository(Classification) private classificationRepo: Repository<Classification>,

    @InjectRepository(Review) private reviewRepo: Repository<Review>,

    @InjectRepository(Report) private reportRepo: Repository<Report>,

    private auditService: AuditService,

  ) {}

  private requireOrganization(user?: any): string {

    const organizationId = user?.organizationId || user?.tenantId;

    if (!organizationId) {

      throw new UnauthorizedException('Organization context is required.');

    }

    return organizationId;

  }

  async getReviewQueue(user?: any) {

    const organizationId = this.requireOrganization(user);

    return this.classificationRepo

      .createQueryBuilder('classification')

      .innerJoin(Report, 'report', 'report.id = classification.reportId')

      .where('classification.requiresHumanReview = :requiresHumanReview', { requiresHumanReview: true })

      .andWhere('classification.classificationStatus = :status', { status: 'pending' })

      .andWhere('report.organizationId = :organizationId', { organizationId })

      .orderBy('classification.createdAt', 'DESC')

      .getMany();

  }

  private async getScopedClassification(classificationId: string, user?: any) {

    const organizationId = this.requireOrganization(user);

    const classification = await this.classificationRepo

      .createQueryBuilder('classification')

      .innerJoin(Report, 'report', 'report.id = classification.reportId')

      .where('classification.id = :classificationId', { classificationId })

      .andWhere('report.organizationId = :organizationId', { organizationId })

      .getOne();

    if (!classification) throw new NotFoundException('Classification not found');

    const report = await this.reportRepo.findOne({

      where: { id: classification.reportId, organizationId },

    });

    if (!report) throw new NotFoundException('Report not found');

    return { classification, report };

  }

  async review(classificationId: string, action: any, notes: string, reviewerUserId?: string, user?: any) {

    const { classification, report } = await this.getScopedClassification(classificationId, user);

    const review = this.reviewRepo.create({

      reportId: classification.reportId,

      classificationId,

      reviewAction: action,

      notes,

      reviewerUserId: reviewerUserId || (user?.userId ? String(user.userId) : undefined),

    });

    classification.classificationStatus = action === 'approve' ? 'approved' : 'rejected';

    classification.reviewedAt = new Date();

    await this.classificationRepo.save(classification);

    const savedReview = await this.reviewRepo.save(review);

    await this.auditService.log({

      tenantId: report.organizationId,

      entityType: 'REVIEW',

      entityId: savedReview.id,

      actionCode: `REVIEW_${String(action).toUpperCase()}`,

      afterJson: savedReview,

      actorUserId: reviewerUserId || (user?.userId ? String(user.userId) : undefined),

    });

    return savedReview;

  }

}

