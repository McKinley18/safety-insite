import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../reports/entities/report.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepo: Repository<Report>,
  ) {}

  async getSafetyTrends(user?: any) {
    const reports = await this.reportsRepo.find({
      where: user?.organizationId ? { organizationId: user.organizationId } : {},
      order: { reportedDatetime: 'DESC' },
      take: 500,
    });

    const submittedReports = reports.filter((r) =>
      ['submitted', 'reviewed', 'closed', 'draft', 'classified', 'active'].includes(
        String(r.status || '').toLowerCase(),
      ),
    );

    const hazardFamilies = new Map<string, number>();
    const standards = new Map<string, number>();
    const priorities = new Map<string, number>();
    const areas = new Map<string, number>();

    for (const report of submittedReports) {
      const likelyStandards = Array.isArray(report.likelyStandards)
        ? report.likelyStandards
        : [];

      for (const standard of likelyStandards) {
        const family = standard.primaryFamily || standard.family || 'other';
        const citation = standard.citation || 'Review Required';
        const priority =
          standard.suggestedPriority ||
          standard.riskAssessment?.finalPriority ||
          report.severity ||
          'review';

        hazardFamilies.set(family, (hazardFamilies.get(family) || 0) + 1);
        standards.set(citation, (standards.get(citation) || 0) + 1);
        priorities.set(priority, (priorities.get(priority) || 0) + 1);
      }

      if (report.area) {
        areas.set(report.area, (areas.get(report.area) || 0) + 1);
      }
    }

    const top = (map: Map<string, number>, limit = 10) =>
      Array.from(map.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    const highRiskCount = submittedReports.filter((r) => {
      const standards = Array.isArray(r.likelyStandards) ? r.likelyStandards : [];
      return standards.some((standard) =>
        ['high', 'critical'].includes(
          String(
            standard.suggestedPriority ||
              standard.riskAssessment?.finalPriority ||
              r.severity ||
              '',
          ).toLowerCase(),
        ),
      );
    }).length;

    const repeatThreshold = 3;

    const repeatIssues = Array.from(standards.entries())
      .filter(([_, count]) => count >= repeatThreshold)
      .map(([citation, count]) => ({ citation, count }));

    const topHazard = top(hazardFamilies, 1)[0]?.label || null;

    const riskTrend =
      submittedReports.length === 0
        ? 'insufficient_data'
        : highRiskCount > submittedReports.length * 0.3
          ? 'increasing'
          : highRiskCount > submittedReports.length * 0.1
            ? 'stable'
            : 'decreasing';

    return {
      totalReports: submittedReports.length,
      classifiedReports: submittedReports.filter((r) => r.status === 'classified').length,
      topHazardFamilies: top(hazardFamilies),
      topStandards: top(standards),
      priorityDistribution: top(priorities),
      repeatAreas: top(areas),
      highRiskCount,
      repeatIssues,
      dominantHazard: topHazard,
      riskTrend,
      generatedAt: new Date().toISOString(),
    };
  }
}
