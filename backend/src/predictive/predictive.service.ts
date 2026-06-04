import { Injectable } from '@nestjs/common';

@Injectable()
export class PredictiveService {
  generateAlerts(findings: any[]) {
    const alerts: { message: string; severity: string }[] = [];

    findings.forEach((f) => {
      if (!f) return;

      const hazard = (f.hazard || '').toLowerCase();
      const severity = (f.severity || '').toLowerCase();

      if (severity === 'high' || severity === 'critical') {
        alerts.push({
          message: `High-risk hazard detected: ${f.hazard}`,
          severity: 'high',
        });
      }

      if (hazard.includes('fall')) {
        alerts.push({
          message: 'Fall hazard trend detected',
          severity: 'medium',
        });
      }

      if (hazard.includes('electrical')) {
        alerts.push({
          message: 'Electrical hazard risk increasing',
          severity: 'high',
        });
      }
    });

    return alerts;
  }
}
