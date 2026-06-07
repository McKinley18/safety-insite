import { ApprovedKnowledgeRegistrySearchService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry-search.service';
import { ApprovedKnowledgeRecord } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-record.types';
import { ApprovedKnowledgeCitationNormalizationService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.service';

async function validate() {
  const searchService = new ApprovedKnowledgeRegistrySearchService();
  const dedupService = new ApprovedKnowledgeCitationNormalizationService();
  
  const requiredDomains = [
    'machine_guarding',
    'lockout_tagout',
    'electrical',
    'fall_protection',
    'walking_working_surfaces',
    'mobile_equipment',
    'powered_haulage',
    'hazard_communication',
    'confined_space',
    'emergency_egress',
    'personal_protective_equipment',
    'slips_trips_falls_housekeeping'
  ];

  console.log('--- Verifying Domain Coverage ---');
  for (const domainId of requiredDomains) {
      const records = searchService.search({ domainId });
      if (records.length === 0) {
          throw new Error(`Domain ${domainId} has no approved source records.`);
      }
      console.log(`[PASS] Domain ${domainId} covered by ${records.length} record(s).`);
  }

  console.log('--- Verifying Record Integrity ---');
  const allRecords = searchService.search({});
  for (const record of allRecords) {
      if (!record.recordId) throw new Error('Record missing ID');
      if (!record.authority.agency) throw new Error(`Record ${record.recordId} missing agency`);
      if (!record.authority.jurisdiction) throw new Error(`Record ${record.recordId} missing jurisdiction`);
      if (!record.authority.citation) throw new Error(`Record ${record.recordId} missing citation`);
      if (!record.mapping.domainId) throw new Error(`Record ${record.recordId} missing domainId`);
      
      // Prohibited language check
      const recordStr = JSON.stringify(record).toLowerCase();
      const prohibited = ["this is a violation", "legal determination", "definitive violation"];
      for (const p of prohibited) {
          if (recordStr.includes(p)) {
              throw new Error(`Record ${record.recordId} contains prohibited language: ${p}`);
          }
      }
  }
  console.log('[PASS] All records passed integrity and governance checks.');

  console.log('--- Verifying Duplicate/Overlap Detection ---');
  const processedRecords: ApprovedKnowledgeRecord[] = [];
  const blockedDuplicates: string[] = [];
  const overlapReviews: string[] = [];
  const allowedShared: string[] = [];

  for (const record of allRecords) {
      const dedupResult = dedupService.evaluateOverlap(record, processedRecords);
      
      if (dedupResult.status === 'duplicate_blocked') {
          blockedDuplicates.push(`${record.recordId} (${dedupResult.normalizedCitation})`);
      } else if (dedupResult.status === 'overlap_review_required') {
          overlapReviews.push(`${record.recordId} (${dedupResult.normalizedCitation})`);
      } else if (dedupResult.status === 'shared_citation_allowed') {
          allowedShared.push(`${record.recordId} (${dedupResult.normalizedCitation})`);
      }
      
      processedRecords.push(record);
  }

  if (blockedDuplicates.length > 0) {
      throw new Error(`Critical duplicates found and blocked: ${blockedDuplicates.join(', ')}`);
  }

  if (overlapReviews.length > 0) {
      console.warn(`[WARN] Overlaps requiring review: ${overlapReviews.join(', ')}`);
  }

  if (allowedShared.length > 0) {
      console.log(`[INFO] Legitimate shared citations allowed: ${allowedShared.join(', ')}`);
  }

  console.log('✅ SafeScope full regulatory knowledge expansion validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
