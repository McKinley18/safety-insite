import { ReviewCoreKnowledgeNormalizerService, SEED_RECORDS } from '../src/safescope-v2/knowledge-architecture';

const service = new ReviewCoreKnowledgeNormalizerService();

function validate() {
  console.log('Running Validation...');

  // 1. Assert Seed Records Exist
  if (!SEED_RECORDS || SEED_RECORDS.length !== 12) {
    throw new Error('Validation Failed: Missing or incorrect number of seed records');
  }
  console.log('Seed records count: ' + SEED_RECORDS.length);

  // Iterate through all records
  SEED_RECORDS.forEach((record, index) => {
    // 2. Assert Required Fields
    if (!record.id || !record.title || !record.content || !record.domain || !record.tags || !record.authorityTier || !record.status || !record.fingerprint || !record.createdAt || !record.updatedAt || !record.guardrails) {
        throw new Error(`Validation Failed: Missing required fields in record ${index}`);
    }

    // 3. Assert Guardrails (are "true" in sense of passing validation i.e. no prohibited issues)
    if (record.guardrails.prohibitedLanguage !== false || record.guardrails.confidentialData !== false || record.guardrails.isDuplicate !== false) {
        throw new Error(`Validation Failed: Guardrails violation in record ${index}`);
    }

    // 4. Validate Duplicate Detection
    const isDuplicate = service.detectPotentialDuplicates(record, SEED_RECORDS.filter((_, i) => i !== index));
    // Based on the seed records, they have unique content, so should not be duplicates of each other
    if (isDuplicate) {
        throw new Error(`Validation Failed: False duplicate detected in record ${index}`);
    }

    // 5. Validate Classification
    const domain = service.classifyDraft(record);
    if (!domain) {
        throw new Error(`Validation Failed: Classification failed in record ${index}`);
    }

    // 6. Validate Routing
    const facets = service.routeToRetrievalFacets(record);
    if (!facets || facets.length === 0) {
        throw new Error(`Validation Failed: Routing failed in record ${index}`);
    }

    // 7. Validate Normalizer
    const normalized = service.normalizeRecord(record);
    if (!normalized.title || !normalized.content) {
        throw new Error(`Validation Failed: Normalization failed in record ${index}`);
    }
  });

  console.log('Validation Successful');
}

try {
    validate();
} catch (e) {
    console.error(e);
    process.exit(1);
}
