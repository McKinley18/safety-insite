import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgeRegistrySearchService {
  private approvedRecords: ApprovedKnowledgeRecord[] = [];

  constructor() {
    const registryDir = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/registry');
    if (fs.existsSync(registryDir)) {
      const files = fs.readdirSync(registryDir).filter(f => f.endsWith('.json'));
      files.forEach(file => {
          const data = JSON.parse(fs.readFileSync(path.join(registryDir, file), 'utf-8'));
          if (data.records) {
              this.approvedRecords.push(...data.records);
          }
      });
    }
  }

  search(criteria: { domainId?: string, hazardFamily?: string, scenarioFamily?: string, mechanism?: string, standardFamily?: string, text?: string }): ApprovedKnowledgeRecord[] {
    return this.approvedRecords.filter(record => {
      if (criteria.domainId && record.mapping.domainId !== criteria.domainId) return false;
      if (criteria.hazardFamily && !record.mapping.hazardFamilies.includes(criteria.hazardFamily)) return false;
      if (criteria.standardFamily && record.mapping.standardFamily !== criteria.standardFamily) return false;
      
      if (criteria.text) {
        const lowerText = criteria.text.toLowerCase();
        return record.mapping.applicabilitySignals.some(signal => lowerText.includes(signal.toLowerCase()));
      }
      return true;
    });
  }
}
