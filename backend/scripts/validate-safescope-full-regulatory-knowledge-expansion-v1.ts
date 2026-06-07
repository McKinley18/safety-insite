import { ApprovedKnowledgeRegistrySearchService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry-search.service';
import { ApprovedKnowledgeRecord } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-record.types';

async function validate() {
  const searchService = new ApprovedKnowledgeRegistrySearchService();
  
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
  const citations = new Set<string>();
  const duplicateCitations: string[] = [];
  for (const record of allRecords) {
      if (citations.has(record.authority.citation)) {
          duplicateCitations.push(record.authority.citation);
      }
      citations.add(record.authority.citation);
  }
  if (duplicateCitations.length > 0) {
      console.warn(`[WARN] Duplicate citations found: ${duplicateCitations.join(', ')}`);
  } else {
      console.log('[PASS] No duplicate citations found.');
  }

  console.log('✅ SafeScope full regulatory knowledge expansion validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
