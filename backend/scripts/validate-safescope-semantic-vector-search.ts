import { SemanticVectorSearchService } from '../src/safescope-v2/semantic-vector-search/semantic-vector-search.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function validate() {
  console.log('--- Testing SafeScope Semantic Vector Search Prototype ---');

  const service = new SemanticVectorSearchService();
  await service.onModuleInit(); // Manually initialize to load default catalog

  // Case 1: Exact Match Search
  console.log('  Testing Case 1: Exact match query');
  const results1 = service.query({
    query: 'One or more methods of machine guarding shall be provided to protect the operator and other employees in the machine area from hazards such as those created by point of operation, ingoing nip points, rotating parts, flying chips and sparks.',
    limit: 1,
  });

  assert(results1.length === 1, 'Should return exactly 1 result.');
  assert(results1[0].id === 'osha-1910-212', 'Should match osha-1910-212.');
  assert(results1[0].score > 0.95, `Score should be extremely high, got ${results1[0].score}`);

  // Case 2: Fuzzy/Semantic Match Query (Walking surface slipping)
  console.log('  Testing Case 2: Fuzzy/Semantic match query (Slippery surface)');
  const results2 = service.query({
    query: 'Slippery walking walkway surface near the aggregate washing plant has standing water and grease',
    limit: 3,
  });

  assert(results2.length > 0, 'Should find semantic matches.');
  assert(results2[0].id === 'osha-1910-22', `Should match the slips, trips, falls standard (got: ${results2[0].id}).`);
  assert(results2[0].score > 0.15, `Should yield a solid cosine similarity score (got: ${results2[0].score}).`);
  assert(results2[0].metadata?.standard === '29 CFR 1910.22(a)(1)', 'Metadata should be intact.');

  // Case 3: Fuzzy/Semantic Match Query (MSHA machine parts guarding)
  console.log('  Testing Case 3: Fuzzy/Semantic match query (Moving parts guarding)');
  const results3 = service.query({
    query: 'A miner could make contact with the head tail and takeup pulley because moving parts are unguarded',
    limit: 3,
  });

  assert(results3.length > 0, 'Should find matches.');
  assert(results3[0].id === 'msha-56-14107', `Should rank MSHA 56.14107 first (got: ${results3[0].id}).`);
  assert(results3[0].metadata?.agency === 'MSHA', 'Metadata agency should be MSHA.');

  // Case 4: Non-matching query filtering
  console.log('  Testing Case 4: Non-matching query filtering via minScore');
  const results4 = service.query({
    query: 'extraneous words that share zero overlap with standard safety citations',
    minScore: 0.25,
  });

  assert(results4.length === 0, 'Should filter out low-relevance results.');

  // Case 5: Custom document indexing
  console.log('  Testing Case 5: Custom safety policy indexing and query');
  service.indexDocuments([
    {
      id: 'custom-hard-hat-policy',
      text: 'Sentinel safety mandatory hard hat policy. All employees must wear class E protective helmets while inside aggregate stockpiles.',
      metadata: { agency: 'Internal', standard: 'Site Rule #12' }
    }
  ]);

  const results5 = service.query({
    query: 'wear a protective helmet stockpiles',
    limit: 1,
  });

  assert(results5.length === 1, 'Should find custom document.');
  assert(results5[0].id === 'custom-hard-hat-policy', 'Should resolve custom hard hat policy.');

  console.log('✅ SafeScope Semantic Vector Search validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
