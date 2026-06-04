import { SOURCE_AUTHORITY_REGISTRY } from './source-authority.registry';

export class SourceGovernanceValidatorService {
  validate() {
    const ids = new Set();
    for (const entry of SOURCE_AUTHORITY_REGISTRY) {
      if (ids.has(entry.sourceId)) {
        throw new Error(`Duplicate source authority ID: ${entry.sourceId}`);
      }
      ids.add(entry.sourceId);

      if (entry.authorityTier === 'binding_regulation' && !entry.citationPattern) {
        throw new Error(`Binding regulation ${entry.sourceId} must have a citation pattern.`);
      }

      if (entry.advisoryOnly && !entry.requiresQualifiedReview) {
        throw new Error(`Advisory source ${entry.sourceId} must require qualified review.`);
      }
    }
  }
}
