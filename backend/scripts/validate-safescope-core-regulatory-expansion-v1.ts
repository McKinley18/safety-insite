import * as fs from 'fs';
import * as path from 'path';
import { RegulatoryCoverageMatrixService } from '../src/safescope-v2/regulatory-source-audit/regulatory-coverage-matrix.service';
import { RegulatorySourceAuditService } from '../src/safescope-v2/regulatory-source-audit/regulatory-source-audit.service';
import { ApprovedKnowledgeCitationNormalizationService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.service';

type KnowledgeRecord = {
  recordId: string;
  status: string;
  authority?: {
    agency?: string;
    jurisdiction?: string;
    authorityTier?: string;
    citation?: string;
    sourceUrl?: string;
    title?: string;
  };
  governance?: {
    advisoryOnly?: boolean;
    doesNotDeclareViolation?: boolean;
    doesNotCreateCitation?: boolean;
    requiresQualifiedReview?: boolean;
  };
};

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeCitation(value: string | undefined): string {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

async function validate() {
  console.log('--- Testing SafeScope Core Regulatory Expansion Pack v1 ---');

  const root = path.resolve(__dirname, '../..');
  const packPath = path.join(root, 'safescope-data/approved-knowledge/draft-candidates/core-expansion-v1.json');
  const registryDir = path.join(root, 'safescope-data/approved-knowledge/registry');

  assert(fs.existsSync(packPath), 'Core expansion draft pack is missing.');
  assert(fs.existsSync(registryDir), 'Approved knowledge registry directory is missing.');

  const pack = readJson(packPath);
  assert(pack.packId === 'core-regulatory-expansion-v1', 'Unexpected core expansion packId.');
  assert(pack.status === 'draft_candidate_pack', 'Core expansion pack must remain a draft candidate pack.');
  assert(Array.isArray(pack.records), 'Core expansion pack records must be an array.');
  assert(pack.records.length >= 3, 'Core expansion pack should contain multiple source-backed records.');

  const draftRecords: KnowledgeRecord[] = pack.records;
  const registryRecords: KnowledgeRecord[] = fs
    .readdirSync(registryDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson(path.join(registryDir, file)));

  const recordsById = new Map<string, { draft?: KnowledgeRecord; approved?: KnowledgeRecord }>();

  for (const record of draftRecords) {
    recordsById.set(record.recordId, {
      ...(recordsById.get(record.recordId) || {}),
      draft: record,
    });
  }

  for (const record of registryRecords) {
    if (recordsById.has(record.recordId)) {
      recordsById.set(record.recordId, {
        ...(recordsById.get(record.recordId) || {}),
        approved: record,
      });
    }
  }

  const expectedCoreRecords = [
    {
      recordId: 'rec-msha-30-56-12',
      agency: 'MSHA',
      jurisdiction: 'msha',
      citation: '30 CFR 56.12',
    },
    {
      recordId: 'rec-osha-gi-1910-134',
      agency: 'OSHA',
      jurisdiction: 'osha_general_industry',
      citation: '1910.134',
    },
    {
      recordId: 'rec-osha-gi-1910-178',
      agency: 'OSHA',
      jurisdiction: 'osha_general_industry',
      citation: '1910.178',
    },
    {
      recordId: 'rec-osha-gi-1910-303',
      agency: 'OSHA',
      jurisdiction: 'osha_general_industry',
      citation: '1910.303',
    },
  ];

  for (const expected of expectedCoreRecords) {
    const located = recordsById.get(expected.recordId);
    assert(Boolean(located?.draft || located?.approved), `Missing core expansion record: ${expected.recordId}`);

    const record = located?.approved || located?.draft;
    assert(record?.authority?.agency === expected.agency, `${expected.recordId} agency mismatch.`);
    assert(record?.authority?.jurisdiction === expected.jurisdiction, `${expected.recordId} jurisdiction mismatch.`);
    assert(
      normalizeCitation(record?.authority?.citation) === normalizeCitation(expected.citation),
      `${expected.recordId} citation mismatch.`,
    );
    assert(record?.authority?.authorityTier === 'primary_regulation', `${expected.recordId} must be primary regulation.`);
    assert(Boolean(record?.authority?.sourceUrl), `${expected.recordId} must include a sourceUrl.`);
    assert(record?.authority?.sourceUrl !== 'source_review_required', `${expected.recordId} must not use placeholder sourceUrl.`);

    assert(record?.governance?.advisoryOnly === true, `${expected.recordId} must be advisory only.`);
    assert(record?.governance?.doesNotDeclareViolation === true, `${expected.recordId} must not declare violations.`);
    assert(record?.governance?.doesNotCreateCitation === true, `${expected.recordId} must not create citations.`);
    assert(record?.governance?.requiresQualifiedReview === true, `${expected.recordId} must require qualified review.`);

    const status = located?.approved ? 'approved_registry' : 'draft_candidate_pack';
    console.log(`[PASS] ${expected.recordId} represented via ${status}.`);
  }

  const normalizationService = new ApprovedKnowledgeCitationNormalizationService();
  const auditService = new RegulatorySourceAuditService(normalizationService);
  const matrixService = new RegulatoryCoverageMatrixService(auditService);
  const matrix = await matrixService.generateMatrix();

  assert(matrix.summary.totalCoreStandards > 0, 'Coverage matrix did not produce core standards.');
  assert(matrix.summary.missingCoreStandards >= 0, 'Coverage matrix missing count is invalid.');
  console.log(`[PASS] Coverage matrix generated. Missing core standards: ${matrix.summary.missingCoreStandards}.`);

  const allMatchedRecords = matrix.coreStandardsCoverage.flatMap((coverage) => coverage.matchedRecords);
  const sourceBacked = allMatchedRecords.filter((record) => record.sourceUrl && record.sourceUrl !== 'source_review_required');

  assert(sourceBacked.length > 0, 'Failed to find source-backed records in coverage matrix.');
  console.log('[PASS] Source-backed records discoverable.');

  const approvedPromotedRecord = registryRecords.find((record) => record.recordId === 'rec-msha-30-56-12');
  if (approvedPromotedRecord) {
    assert(approvedPromotedRecord.status === 'approved', 'Promoted MSHA record must have approved status.');
    console.log('[PASS] Promoted core expansion record remains approved and governed.');
  }

  console.log('✅ SafeScope core regulatory expansion pack validation passed.');
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
