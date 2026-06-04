export class RiskService {

  private matrix = {
    Low: { weight: 1 },
    Moderate: { weight: 2 },
    High: { weight: 3 },
    Critical: { weight: 4 },
  };

  getWeight(level: string): number {
    return this.matrix[level as keyof typeof this.matrix]?.weight || 1;
  }

  isSevere(level: string): boolean {
    return level === 'High' || level === 'Critical';
  }
}

