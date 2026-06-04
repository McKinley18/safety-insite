import { Injectable } from '@nestjs/common';

@Injectable()
export class RiskService {
  calculate(severity: number, likelihood: number) {
    const score = severity * likelihood;

    let priority = 'Low';

    if (score <= 4) priority = 'Low';
    else if (score <= 9) priority = 'Medium';
    else if (score <= 15) priority = 'High';
    else priority = 'Critical';

    return {
      riskScore: score,
      priority,
    };
  }
}
