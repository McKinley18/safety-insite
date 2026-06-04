import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeScopeFeedback } from './safescope-feedback.entity';
import { CreateSafeScopeFeedbackDto } from './create-feedback.dto';

@Injectable()
export class SafeScopeFeedbackService {
  constructor(
    @InjectRepository(SafeScopeFeedback)
    private readonly repo: Repository<SafeScopeFeedback>,
  ) {}

  async create(dto: CreateSafeScopeFeedbackDto) {
    const feedback = this.repo.create({
      ...dto,
      expertReviewed: false,
      promotedToGlobal: false,
    });

    return this.repo.save(feedback);
  }

  async getWorkspaceSignals(workspaceId?: string) {
    if (!workspaceId) return [];

    return this.repo.find({
      where: {
        workspaceId,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 500,
    });
  }

  async getWorkspaceStandardAdjustments(workspaceId?: string) {
    const signals = await this.getWorkspaceSignals(workspaceId);

    const byCitation = new Map<string, {
      citation: string;
      accepted: number;
      rejected: number;
      flagged: number;
      changed: number;
      adjustment: number;
      warnings: string[];
    }>();

    for (const signal of signals) {
      const current = byCitation.get(signal.citation) || {
        citation: signal.citation,
        accepted: 0,
        rejected: 0,
        flagged: 0,
        changed: 0,
        adjustment: 0,
        warnings: [],
      };

      if (signal.action === 'accepted') current.accepted += 1;
      if (signal.action === 'rejected') current.rejected += 1;
      if (signal.action === 'flagged') current.flagged += 1;
      if (signal.action === 'changed') current.changed += 1;

      byCitation.set(signal.citation, current);
    }

    for (const item of byCitation.values()) {
      item.adjustment =
        Math.min(12, item.accepted * 3) -
        Math.min(15, item.rejected * 5) -
        Math.min(8, item.flagged * 4);

      if (item.flagged > 0) {
        item.warnings.push('Previously flagged by this workspace.');
      }

      if (item.rejected > item.accepted) {
        item.warnings.push('Previously rejected more often than accepted by this workspace.');
      }
    }

    return Array.from(byCitation.values());
  }
}
