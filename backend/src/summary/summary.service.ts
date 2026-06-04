import { Injectable } from '@nestjs/common';

@Injectable()
export class SummaryService {
  generate(findings: any[]) {
    const total = findings.length;

    const high = findings.filter(f => f.priority === 'High').length;
    const critical = findings.filter(f => f.priority === 'Critical').length;

    const sorted = [...findings].sort((a, b) => b.riskScore - a.riskScore);
    const top = sorted.slice(0, 3);

    return {
      totalFindings: total,
      highRisk: high,
      criticalRisk: critical,
      topFindings: top.map(f => ({
        hazard: f.hazard,
        priority: f.priority,
      })),
    };
  }
}
