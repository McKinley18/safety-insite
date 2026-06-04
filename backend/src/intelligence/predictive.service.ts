import { Injectable } from '@nestjs/common';

type PredictiveFinding = {
  severity: number;
  likelihood: number;
  hazard: string;
};

type PredictiveAlert = {
  type: 'HIGH_RISK';
  message: string;
};

@Injectable()
export class PredictiveService {
  calculateRisk(findings: PredictiveFinding[]): number {
    if (!findings.length) return 0;

    const scores: number[] = findings.map(
      (finding: PredictiveFinding) =>
        finding.severity * finding.likelihood,
    );

    const avg =
      scores.reduce((a: number, b: number) => a + b, 0) /
      scores.length;

    return Math.round(avg);
  }

  generateAlerts(
    findings: PredictiveFinding[],
  ): PredictiveAlert[] {
    const alerts: PredictiveAlert[] = [];

    findings.forEach((finding: PredictiveFinding) => {
      const risk =
        finding.severity * finding.likelihood;

      if (risk >= 15) {
        alerts.push({
          type: 'HIGH_RISK',
          message: `High risk hazard: ${finding.hazard}`,
        });
      }
    });

    return alerts;
  }
}
