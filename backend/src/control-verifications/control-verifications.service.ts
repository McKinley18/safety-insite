
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { ControlVerification } from "./entities/control-verification.entity";

import { Report } from "../reports/entities/report.entity";

@Injectable()

export class ControlVerificationsService {

  constructor(

    @InjectRepository(ControlVerification)

    private repo: Repository<ControlVerification>,

    @InjectRepository(Report)

    private reportRepo: Repository<Report>,

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

    const report = await this.reportRepo.findOne({

      where: { id: reportId, organizationId },

    });

    if (!report) throw new NotFoundException('Report not found');

    return report;

  }

  async saveMany(reportId: string, controls: any[], user?: any) {

    await this.getScopedReport(reportId, user);

    const entities = (controls || []).map(c =>

      this.repo.create({

        reportId,

        control: c.control,

        status: c.status,

        notes: c.notes,

      })

    );

    return this.repo.save(entities);

  }

  async create(reportId: string, dto: any, user?: any) {

    await this.getScopedReport(reportId, user);

    return this.repo.save({

      reportId,

      control: dto.control,

      status: dto.status,

      notes: dto.notes,

    });

  }

  async getForReport(reportId: string, user?: any) {

    await this.getScopedReport(reportId, user);

    return this.repo.find({

      where: { reportId },

      order: { createdAt: 'DESC' },

    });

  }

}

