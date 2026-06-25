import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgeRegistrySearchService {
  private static cachedRecords: ApprovedKnowledgeRecord[] | null = null;
  private static cachedIndexes: {
    domainId: Map<string, ApprovedKnowledgeRecord[]>;
    hazardFamily: Map<string, ApprovedKnowledgeRecord[]>;
    standardFamily: Map<string, ApprovedKnowledgeRecord[]>;
    mechanism: Map<string, ApprovedKnowledgeRecord[]>;
  } | null = null;

  private ensureLoaded() {
    if (ApprovedKnowledgeRegistrySearchService.cachedRecords && ApprovedKnowledgeRegistrySearchService.cachedIndexes) {
      return;
    }

    const records: ApprovedKnowledgeRecord[] = [];
    const indexes = {
      domainId: new Map<string, ApprovedKnowledgeRecord[]>(),
      hazardFamily: new Map<string, ApprovedKnowledgeRecord[]>(),
      standardFamily: new Map<string, ApprovedKnowledgeRecord[]>(),
      mechanism: new Map<string, ApprovedKnowledgeRecord[]>(),
    };

    const registryDir = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/registry');
    if (fs.existsSync(registryDir)) {
      const files = fs.readdirSync(registryDir).filter((file) => file.endsWith('.json'));
      for (const file of files) {
        const data = JSON.parse(fs.readFileSync(path.join(registryDir, file), 'utf-8'));
        const fileRecords: ApprovedKnowledgeRecord[] = Array.isArray(data?.records) ? data.records : [];
        for (const record of fileRecords) {
          records.push(record);
          this.indexRecord(indexes.domainId, record.mapping?.domainId, record);
          this.indexRecord(indexes.standardFamily, record.mapping?.standardFamily, record);
          this.indexRecord(indexes.mechanism, record.mapping?.mechanisms, record);
          this.indexRecord(indexes.hazardFamily, record.mapping?.hazardFamilies, record);
        }
      }
    }

    ApprovedKnowledgeRegistrySearchService.cachedRecords = records;
    ApprovedKnowledgeRegistrySearchService.cachedIndexes = indexes;
  }

  private indexRecord(
    index: Map<string, ApprovedKnowledgeRecord[]>,
    keys: string | string[] | undefined,
    record: ApprovedKnowledgeRecord,
  ) {
    const values = Array.isArray(keys) ? keys : [keys];
    for (const key of values) {
      const normalized = String(key || '').trim().toLowerCase();
      if (!normalized) continue;
      const bucket = index.get(normalized) || [];
      bucket.push(record);
      index.set(normalized, bucket);
    }
  }

  search(criteria: { domainId?: string, hazardFamily?: string, scenarioFamily?: string, mechanism?: string, standardFamily?: string, text?: string }): ApprovedKnowledgeRecord[] {
    this.ensureLoaded();
    const records = ApprovedKnowledgeRegistrySearchService.cachedRecords || [];
    const indexes = ApprovedKnowledgeRegistrySearchService.cachedIndexes;

    if (!indexes) return [];

    const pools: ApprovedKnowledgeRecord[][] = [];
    const pushPool = (pool?: ApprovedKnowledgeRecord[]) => {
      if (pool?.length) pools.push(pool);
    };

    const normalize = (value?: string) => String(value || '').trim().toLowerCase();

    if (criteria.domainId) pushPool(indexes.domainId.get(normalize(criteria.domainId)));
    if (criteria.hazardFamily) pushPool(indexes.hazardFamily.get(normalize(criteria.hazardFamily)));
    if (criteria.standardFamily) pushPool(indexes.standardFamily.get(normalize(criteria.standardFamily)));
    if (criteria.mechanism) pushPool(indexes.mechanism.get(normalize(criteria.mechanism)));
    if (criteria.scenarioFamily) pushPool(indexes.domainId.get(normalize(criteria.scenarioFamily)));

    const seed = pools.length ? pools.reduce((smallest, pool) => (pool.length < smallest.length ? pool : smallest)) : records;

    return seed.filter((record) => {
      if (criteria.domainId && normalize(record.mapping?.domainId) !== normalize(criteria.domainId)) return false;
      if (criteria.hazardFamily && !record.mapping?.hazardFamilies?.some((family) => normalize(family) === normalize(criteria.hazardFamily))) return false;
      if (criteria.standardFamily && normalize(record.mapping?.standardFamily) !== normalize(criteria.standardFamily)) return false;
      if (criteria.mechanism && !record.mapping?.mechanisms?.some((item) => normalize(item) === normalize(criteria.mechanism))) return false;

      if (criteria.text) {
        const lowerText = criteria.text.toLowerCase();
        return Array.isArray(record.mapping?.applicabilitySignals) &&
          record.mapping.applicabilitySignals.some((signal) => lowerText.includes(String(signal || '').toLowerCase()));
      }
      return true;
    });
  }
}
