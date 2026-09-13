import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeRegistryValidator } from '../approved-knowledge-registry/approved-knowledge-registry.validator';

@Injectable()
export class ApprovedKnowledgeRegistryIoService {
  
  validateRegistry(): any {
    const registryPath = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/approved-knowledge-registry.v1.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    const registryDir = path.resolve(__dirname, '../../../../safescope-data/approved-knowledge/registry');
    const draftFiles = fs.existsSync(registryDir)
      ? fs.readdirSync(registryDir).filter((file) => file.endsWith('.json'))
      : [];

    let invalidCount = 0;
    let duplicateKeyCollisions = 0;
    let advisoryGuardrailFailures = 0;
    const seen = new Set<string>();

    for (const record of Array.isArray(registry.records) ? registry.records : []) {
      const errors = ApprovedKnowledgeRegistryValidator.validate(record);
      if (errors.length) {
        invalidCount += 1;
      }

      const recordKey = String(record?.recordId || '').trim().toLowerCase();
      if (recordKey) {
        if (seen.has(recordKey)) duplicateKeyCollisions += 1;
        seen.add(recordKey);
      }

      if (!record?.governance?.advisoryOnly || !record?.governance?.doesNotDeclareViolation || !record?.governance?.doesNotCreateCitation || !record?.governance?.requiresQualifiedReview) {
        advisoryGuardrailFailures += 1;
      }
    }

    return {
        approvedCount: Array.isArray(registry.records) ? registry.records.length : 0,
        draftCandidateCount: draftFiles.length,
        rejectedCount: 0,
        retiredCount: 0,
        invalidCount,
        duplicateKeyCollisions,
        advisoryGuardrailFailures
    };
  }
}
