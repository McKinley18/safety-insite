import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';
import { KnowledgeReviewService } from '../src/safescope-v2/knowledge-intake/review/knowledge-review.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const quarantinedDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/quarantined',
);

const approvedBundlePath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/approved/approved-knowledge-bundle.json',
);

const fixturePath = path.join(quarantinedDir, '_fixture-approved-export-test.json');
const service = new KnowledgeReviewService();

const baseRecord: KnowledgeRecord = {
  recordId: 'fixture-approved-export-test',
  sourceAuthority: 'OSHA',
  sourceType: 'cfr',
  authorityTier: 'federal_regulation',
  citation: '29 CFR 1910.212',
  title: 'Machine guarding fixture approval test',
  sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.212',
  retrievedAt: '2026-05-30T10:00:00Z',
  jurisdiction: 'US_FEDERAL',
  hazardDomains: ['mechanical'],
  applicabilityTriggers: ['machine guarding', 'point of operation', 'employee exposure'],
  standardIntent: 'Test-only fixture for proving approved export behavior.',
  evidenceNeeded: ['Guard condition', 'employee access path', 'equipment operating state'],
  nonApplicabilityQuestions: ['Is there employee exposure to a moving machine part?'],
  sourceBoundary: 'mandatory',
  reviewStatus: 'unreviewed',
  approvedForUse: false,
};

function runTsNode(scriptPath: string): void {
  execFileSync(
    'npx',
    ['ts-node', '--project', 'backend/tsconfig.json', scriptPath],
    {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
    },
  );
}

try {
  const pending = service.review(baseRecord, {
    reviewerId: 'fixture-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'mark_pending_review',
    rationale: 'Fixture record is ready for end-to-end export validation.',
    reviewedAt: '2026-05-30T13:00:00Z',
  });

  const approved = service.review(pending.record, {
    reviewerId: 'fixture-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'approve_by_human',
    rationale:
      'Fixture record citation, source boundary, applicability triggers, and evidence requirements were reviewed for end-to-end export validation.',
    reviewedAt: '2026-05-30T13:15:00Z',
  });

  fs.writeFileSync(fixturePath, `${JSON.stringify(approved.record, null, 2)}\n`);

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
  runTsNode('backend/scripts/validate-approved-safescope-knowledge-export.ts');

  const bundle = JSON.parse(fs.readFileSync(approvedBundlePath, 'utf-8')) as {
    approvedRecordCount: number;
    records: KnowledgeRecord[];
  };

  assert(bundle.approvedRecordCount >= 1, 'Fixture export should contain at least one approved record.');
  assert(
    bundle.records.some((record) => record.recordId === 'fixture-approved-export-test'),
    'Fixture approved record was not found in approved export bundle.',
  );

  console.log('✅ SafeScope approved export fixture validation passed.');
} finally {
  if (fs.existsSync(fixturePath)) {
    fs.unlinkSync(fixturePath);
  }

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
}
