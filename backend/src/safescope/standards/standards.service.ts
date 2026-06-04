import { Injectable } from '@nestjs/common';

export type SafeScopeStandard = {
  citation: string;
  title: string;
  recommendedActions: string[];
  hazardTags: string[];
  keywordTriggers: string[];
  equipmentTags?: string[];
  environmentTags?: string[];
  severityWeight?: number[];
  domain?: string;
};

@Injectable()
export class StandardsService {
  private standards: SafeScopeStandard[] = [];

  findAll(): SafeScopeStandard[] {
    return this.standards;
  }

  load(seed: SafeScopeStandard[]): void {
    this.standards = seed;
  }
}
