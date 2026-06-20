import * as fs from 'fs';
import * as path from 'path';
import { ReputableSourceIngestionService } from '../src/safescope-v2/knowledge-intake/reputable-source-ingestion.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

const service = new ReputableSourceIngestionService();
const quarantinedDir = path.join(__dirname, '../src/safescope-v2/knowledge-intake/records/quarantined');

async function testCredibilityClassification() {
  console.log('  Testing credibility classification...');

  // Test Case 1: MSHA Regulation (Federal Regulation / Mandatory)
  const res1 = await service.ingestRawSource({
    recordId: 'test-msha-reg',
    sourceAuthority: 'MSHA',
    sourceType: 'cfr',
    citation: '30 CFR 56.14107-test-unique',
    title: 'Moving machine parts guarding standard test-unique',
    sourceUrl: 'https://www.ecfr.gov/current/title-30/section-56.14107-test-unique',
    jurisdiction: 'US_FEDERAL',
    standardIntent: 'Guarding to protect persons from moving machine parts.',
  });
  assert(res1.success === true, 'MSHA regulation ingestion should succeed');
  assert(res1.record?.authorityTier === 'federal_regulation', 'Should be federal_regulation');
  assert(res1.record?.sourceBoundary === 'mandatory', 'Should be mandatory');

  // Test Case 2: NIOSH Guidance (Agency Policy / Advisory)
  const res2 = await service.ingestRawSource({
    recordId: 'test-niosh-guide',
    sourceAuthority: 'NIOSH',
    sourceType: 'policy_manual',
    citation: 'NIOSH Pub 2026-100-test-unique',
    title: 'Guidance on respirable dust control test-unique',
    sourceUrl: 'https://www.cdc.gov/niosh/pub-2026-100-test-unique',
    jurisdiction: 'US_FEDERAL',
    standardIntent: 'Advisory guidelines for dust collection systems.',
  });
  assert(res2.success === true, 'NIOSH guidance ingestion should succeed');
  assert(res2.record?.authorityTier === 'agency_policy', 'Should be agency_policy');
  assert(res2.record?.sourceBoundary === 'advisory', 'Non-regulatory must be advisory');

  // Test Case 3: ANSI Standard (Industry Standard / Advisory)
  const res3 = await service.ingestRawSource({
    recordId: 'test-ansi-std',
    sourceAuthority: 'ANSI',
    sourceType: 'technical_standard',
    citation: 'ANSI Z244.1-test-unique',
    title: 'Lockout and energy isolation standard test-unique',
    sourceUrl: 'https://www.ansi.org/z244-1-test-unique',
    jurisdiction: 'US_FEDERAL',
    standardIntent: 'Control of hazardous energy standard.',
  });
  assert(res3.success === true, 'ANSI standard ingestion should succeed');
  assert(res3.record?.authorityTier === 'industry_standard', 'Should be industry_standard');
  assert(res3.record?.sourceBoundary === 'advisory', 'Non-regulatory must be advisory');

  // Clean up test files
  const filesToDelete = ['test-msha-reg.json', 'test-niosh-guide.json', 'test-ansi-std.json'];
  for (const file of filesToDelete) {
    const filePath = path.join(quarantinedDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

async function testHazardDomainCategorization() {
  console.log('  Testing hazard domain/family categorization...');

  // Test Case 1: Electrical wiring exposure
  const res1 = await service.ingestRawSource({
    recordId: 'test-electrical-cat',
    sourceAuthority: 'OSHA',
    sourceType: 'cfr',
    citation: '29 CFR 1910.303-test',
    title: 'Electrical General Requirements',
    sourceUrl: 'https://www.osha.gov/laws-regs/regulations/1910.303-test',
    jurisdiction: 'US_FEDERAL_OSHA_GENERAL_INDUSTRY',
    standardIntent: 'Cover live terminals to prevent shock hazards and arc flash exposure.',
  });
  assert(res1.success === true, 'Should succeed');
  assert(res1.record?.hazardDomains.includes('electrical') === true, 'Should include electrical domain');

  // Test Case 2: Silica dust inhalation
  const res2 = await service.ingestRawSource({
    recordId: 'test-silica-cat',
    sourceAuthority: 'OSHA',
    sourceType: 'cfr',
    citation: '29 CFR 1910.1053-test',
    title: 'Respirable Crystalline Silica',
    sourceUrl: 'https://www.osha.gov/laws-regs/regulations/1910.1053-test',
    jurisdiction: 'US_FEDERAL_OSHA_GENERAL_INDUSTRY',
    standardIntent: 'Exposure limits for respirable crystalline silica to prevent inhalation hazards.',
  });
  assert(res2.success === true, 'Should succeed');
  assert(res2.record?.hazardDomains.includes('chemical') === true, 'Should include chemical domain (due to silica and dust)');

  // Clean up
  const filesToDelete = ['test-electrical-cat.json', 'test-silica-cat.json'];
  for (const file of filesToDelete) {
    const filePath = path.join(quarantinedDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

async function testDuplicateBlocked() {
  console.log('  Testing duplicate prevention...');

  // Ingest a temporary unique record
  const citation = 'UNIQUE-CITATION-999';
  const url = 'https://www.example.com/unique-citation-999';
  const title = 'Unique Test Citation';
  
  const res1 = await service.ingestRawSource({
    recordId: 'test-dup-1',
    sourceAuthority: 'OSHA',
    sourceType: 'cfr',
    citation,
    title,
    sourceUrl: url,
    jurisdiction: 'US_FEDERAL',
  });
  assert(res1.success === true, 'First ingestion should succeed');

  // Attempt duplicate ingestion
  const res2 = await service.ingestRawSource({
    recordId: 'test-dup-2',
    sourceAuthority: 'OSHA',
    sourceType: 'cfr',
    citation,
    title,
    sourceUrl: url,
    jurisdiction: 'US_FEDERAL',
  });
  assert(res2.success === false, 'Duplicate ingestion must fail');
  assert(res2.actionTaken === 'duplicate_blocked', 'Action taken must be duplicate_blocked');

  // Clean up
  const filePath = path.join(quarantinedDir, 'test-dup-1.json');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function testQuarantineSafetyAndPrecedence() {
  console.log('  Testing quarantine and regulatory precedence...');

  const res = await service.ingestRawSource({
    recordId: 'test-precedence-safety',
    sourceAuthority: 'ANSI',
    sourceType: 'technical_standard',
    citation: 'ANSI/ASSP Z10-test-unique',
    title: 'Occupational Health and Safety Management Systems test-unique',
    sourceUrl: 'https://www.ansi.org/z10-test-unique',
    jurisdiction: 'US_FEDERAL',
    standardIntent: 'Advisory safety management framework.',
  });

  assert(res.success === true, 'Ingestion should succeed');
  const record = res.record!;

  // 1. Quarantined records are NOT approved
  assert(record.reviewStatus === 'unreviewed', 'Status must be unreviewed');
  assert(record.approvedForUse === false, 'approvedForUse must be false');

  // 2. Non-regulatory sources are advisory (regulatory precedence preserved)
  assert(record.authorityTier === 'industry_standard', 'Must be industry_standard');
  assert(record.sourceBoundary === 'advisory', 'Non-regulatory source boundary must be advisory');

  // Clean up
  const filePath = path.join(quarantinedDir, 'test-precedence-safety.json');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function run() {
  console.log('--- Testing SafeScope Reputable Sources Ingestion ---');
  await testCredibilityClassification();
  await testHazardDomainCategorization();
  await testDuplicateBlocked();
  await testQuarantineSafetyAndPrecedence();
  console.log('✅ SafeScope reputable sources ingestion validation passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
