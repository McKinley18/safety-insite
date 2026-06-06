import { SourceIngestionStagingService } from '../src/safescope-v2/source-ingestion-staging/source-ingestion-staging.service';

async function validate() {
  const service = new SourceIngestionStagingService();
  
  // Test Case: OSHA source
  const oshaMetadata = {
    agency: 'OSHA',
    jurisdiction: 'osha_general_industry',
    sourceUrl: 'http://osha.gov/standard/1910.147',
    citation: '1910.147',
    title: 'LOTO Standard',
    effectiveDate: '2026-01-01',
    revisionDate: '2026-01-01'
  };
  
  const result = service.stageSource(oshaMetadata);
  
  if (result.status !== 'staged_only') {
    console.error('Expected status staged_only');
    process.exit(1);
  }
  
  if (result.missingMetadata.length > 0) {
    console.error('Expected no missing metadata for complete source');
    process.exit(1);
  }
  
  console.log('✅ Source ingestion staging validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
