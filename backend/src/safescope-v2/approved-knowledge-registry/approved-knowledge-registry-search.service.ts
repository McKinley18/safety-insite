import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgeRegistrySearchService {
  private approvedRecords: ApprovedKnowledgeRecord[] = [];

  constructor() {
    const registryPath = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/registry/approved-knowledge-seed-records.v1.json');
    if (fs.existsSync(registryPath)) {
      const data = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      this.approvedRecords = data.records;
    } else {
        console.error('Registry file not found!');
    }
  }

  search(criteria: { domainId?: string, hazardFamily?: string, scenarioFamily?: string, mechanism?: string, standardFamily?: string, text?: string }): ApprovedKnowledgeRecord[] {
    const matches = this.approvedRecords.filter(record => {
      if (criteria.domainId && record.mapping.domainId !== criteria.domainId) return false;
      if (criteria.hazardFamily && !record.mapping.hazardFamilies.includes(criteria.hazardFamily)) return false;
      if (criteria.standardFamily && record.mapping.standardFamily !== criteria.standardFamily) return false;

      if (criteria.text) {
        const lowerText = criteria.text.toLowerCase();
        return record.mapping.applicabilitySignals.some(signal => lowerText.includes(signal.toLowerCase()));
      }
      return true;
    });
    return matches;
  }

}
