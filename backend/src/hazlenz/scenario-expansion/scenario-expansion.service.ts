import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ScenarioRecord } from './scenario-expansion.types';

@Injectable()
export class ScenarioExpansionService {
  private scenarios: ScenarioRecord[] = [];

  constructor() {
    const registryPath = path.resolve(__dirname, '../../../../safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json');
    if (fs.existsSync(registryPath)) {
      const data = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      this.scenarios = data.records;
    }
  }

  search(criteria: { domainId?: string, mechanism?: string, scenarioFamily?: string, text?: string }): ScenarioRecord[] {
    return this.scenarios.filter(s => {
      if (criteria.domainId && s.domainId !== criteria.domainId) return false;
      if (criteria.mechanism && s.mechanismOfHarm !== criteria.mechanism) return false;
      if (criteria.scenarioFamily && s.scenarioFamily !== criteria.scenarioFamily) return false;
      
      if (criteria.text) {
        const lowerText = criteria.text.toLowerCase();
        return s.evidenceSignals.some(signal => lowerText.includes(signal.toLowerCase()));
      }
      return true;
    });
  }
}
