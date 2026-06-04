import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Standard } from './entities/standard.entity';
import { standards } from './seed/standards.seed';
import { CorrectiveActionTemplate } from './entities/corrective-action-template.entity';
import { StandardMapper } from './standard.mapper';

@Injectable()
export class StandardsSeedService {
  constructor(
    @InjectRepository(Standard)
    private standardRepo: Repository<Standard>,
    @InjectRepository(CorrectiveActionTemplate)
    private correctiveTemplateRepo: Repository<CorrectiveActionTemplate>,
  ) {}

  async seedDefaults() {
    let created = 0;
    let updated = 0;

    for (const item of standards) {
      if (!item || !item.citation) {
        console.warn('Skipping invalid standard seed row:', item);
        continue;
      }

      try {
        const existing = await this.standardRepo.findOne({
          where: { citation: item.citation },
        });

      const payload = StandardMapper.toEntity(item);

      if (existing) {
        await this.standardRepo.save(
          this.standardRepo.create({
            ...existing,
            ...payload,
          }),
        );
        updated += 1;
      } else {
        await this.standardRepo.save(
          this.standardRepo.create(payload as Standard),
        );
        created += 1;
        }
      } catch (error: any) {
        console.error('Standards seed failed for citation:', item.citation, error?.message || error);
        throw new Error(`Standards seed failed for ${item.citation}: ${error?.message || 'unknown error'}`);
      }
    }

    const standardRecords = await this.standardRepo.find();

    for (const standard of standardRecords) {
      const exists = await this.correctiveTemplateRepo.findOne({
        where: { standardId: standard.id },
      });

      if (exists) continue;

      await this.correctiveTemplateRepo.save(
        this.correctiveTemplateRepo.create({
          hazardCategoryCode: standard.hazardCodes?.[0] || 'general',
          standardId: standard.id,
          title: `Corrective action for ${standard.citation}`,
          recommendedAction: `Correct the condition related to ${standard.title} and document verification.`,
          lowCostOption: 'Remove exposure, barricade the area if needed, and complete a documented field correction.',
          bestPracticeOption: 'Create a permanent engineered or administrative control, assign ownership, and verify completion.',
          verificationSteps: 'Verify the hazard was corrected, photograph the corrected condition, and document the responsible person/date.',
          estimatedRiskReduction: 70,
        }),
      );
    }

    return { ok: true, created, updated, total: standardRecords.length };
  }
}
