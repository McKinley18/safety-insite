import { ApprovedKnowledgeCitationNormalizationService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.service';
import { ApprovedKnowledgeCitationNormalizationValidator } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.validator';
import { ApprovedKnowledgeRecord } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-record.types';

async function validate() {
  const service = new ApprovedKnowledgeCitationNormalizationService();
  
  console.log('--- Testing Citation Normalization ---');
  const oshaNorm = service.normalize('§1910.22', 'OSHA');
  if (oshaNorm.canonical !== '1910.22') throw new Error(`OSHA normalization failed: ${oshaNorm.canonical}`);
  
  const oshaNorm2 = service.normalize('29 CFR 1910.147', 'OSHA');
  if (oshaNorm2.canonical !== '1910.147') throw new Error(`OSHA normalization failed: ${oshaNorm2.canonical}`);
  
  const mshaNorm = service.normalize('30 CFR 56.14107', 'MSHA');
  if (mshaNorm.canonical !== '56.14107') throw new Error(`MSHA normalization failed: ${mshaNorm.canonical}`);
  
  const placeholderNorm = service.normalize('placeholder_review_required', 'UNKNOWN');
  if (!placeholderNorm.isPlaceholder) throw new Error('Placeholder not detected');
  console.log('[PASS] Normalization logic verified.');

  console.log('--- Testing Deduplication Logic ---');
  const existing: ApprovedKnowledgeRecord[] = [
    {
      recordId: 'rec-1',
      mapping: { domainId: 'machine_guarding' } as any,
      authority: { citation: '1910.212', agency: 'OSHA' } as any
    } as any
  ];

  // True duplicate
  const trueDup = service.evaluateOverlap({
      mapping: { domainId: 'machine_guarding' } as any,
      authority: { citation: '§1910.212', agency: 'OSHA' } as any
  }, existing);
  if (trueDup.status !== 'duplicate_blocked') throw new Error(`Expected duplicate_blocked, got ${trueDup.status}`);
  
  // Shared citation allowed
  const sharedAllowed = service.evaluateOverlap({
      mapping: { domainId: 'lockout_tagout' } as any,
      authority: { citation: '1910.212', agency: 'OSHA' } as any
  }, existing);
  if (sharedAllowed.status !== 'shared_citation_allowed') throw new Error(`Expected shared_citation_allowed, got ${sharedAllowed.status}`);

  // Placeholder
  const placeholder = service.evaluateOverlap({
      authority: { citation: 'placeholder_review_required', agency: 'UNKNOWN' } as any
  }, existing);
  if (placeholder.status !== 'placeholder_review_required') throw new Error(`Expected placeholder_review_required, got ${placeholder.status}`);

  console.log('[PASS] Deduplication and overlap governance verified.');

  console.log('✅ SafeScope regulatory deduplication and citation normalization validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
