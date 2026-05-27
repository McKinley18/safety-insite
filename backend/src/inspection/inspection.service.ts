import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inspection } from './inspection.entity';

type InspectionHazardInput = {
  hazard: string;
  severity: string | number;
};

type CreateInspectionInput = {
  title: string;
  hazards?: InspectionHazardInput[];
};

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private repo: Repository<Inspection>,
  ) {}

  private requireOrganization(user?: any): string {
    const organizationId = user?.organizationId;

    if (!organizationId) {
      throw new UnauthorizedException('Organization context is required.');
    }

    return String(organizationId);
  }

  async create(data: CreateInspectionInput, user?: any) {
    const organizationId = this.requireOrganization(user);

    const inspection = this.repo.create({
      title: data.title,
      organizationId,
      createdByUserId: user?.userId ? String(user.userId) : undefined,
    });

    inspection.hazards = (data.hazards || []).map((h: InspectionHazardInput) => ({
      description: h.hazard,
      severity: String(h.severity),
    })) as unknown as Inspection['hazards'];

    return this.repo.save(inspection);
  }

  findAll(user?: any) {
    const organizationId = this.requireOrganization(user);

    return this.repo.find({
      where: { organizationId },
      relations: ['hazards'],
      order: { createdAt: 'DESC' },
    });
  }
}
