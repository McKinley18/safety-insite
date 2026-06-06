import { KnowledgePackValidator } from '../src/safescope-v2/knowledge-packs/knowledge-pack.validator';
import { KnowledgePack } from '../src/safescope-v2/knowledge-packs/knowledge-pack.types';

async function validate() {
  const validator = KnowledgePackValidator;
  
  // Test Case: Valid MSHA pack
  const mshaPack: KnowledgePack = {
    packId: 'msha-pack-1',
    jurisdiction: 'msha',
    authorityTier: 'primary_regulation',
    sourcePolicy: 'internal',
    approvedRecordIds: ['rec-msha-1'],
    draftCandidateIds: [],
    retiredRecordIds: [],
    validationStatus: 'valid',
    lastReviewedAt: '2026-06-06',
    governanceWarnings: []
  };

  const errors = validator.validate(mshaPack);
  if (errors.length > 0) {
      console.error('MSHA pack validation failed:', errors);
      process.exit(1);
  }
  console.log('✅ Knowledge pack validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
