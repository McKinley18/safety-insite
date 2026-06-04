import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';
import { KnowledgeReviewService } from '../src/safescope-v2/knowledge-intake/review/knowledge-review.service';
import { ApprovedKnowledgeQueryService } from '../src/safescope-v2/knowledge-intake/query/approved-knowledge-query.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const quarantinedDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/quarantined',
);

const fixturePath = path.join(quarantinedDir, '_fixture-approved-query-test.json');
const reviewService = new KnowledgeReviewService();

function runTsNode(scriptPath: string): void {
  execFileSync('npx', ['ts-node', '--project', 'backend/tsconfig.json', scriptPath], {
    cwd: path.join(__dirname, '../..'),
    stdio: 'inherit',
  });
}

const baseRecord: KnowledgeRecord = {
  recordId: 'fixture-approved-query-test',
  sourceAuthority: 'OSHA',
  sourceType: 'cfr',
  authorityTier: 'federal_regulation',
  citation: '29 CFR 1910.212',
  title: 'Machine guarding approved query fixture',
  sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.212',
  retrievedAt: '2026-05-30T10:00:00Z',
  jurisdiction: 'US_FEDERAL',
  hazardDomains: ['mechanical'],
  applicabilityTriggers: ['machine guarding', 'point of operation', 'employee exposure'],
  standardIntent: 'Guard machine parts that expose employees to injury from point of operation hazards.',
  evidenceNeeded: ['Guard condition', 'employee access path', 'equipment operating state'],
  nonApplicabilityQuestions: ['Is there employee exposure to the moving part?'],
  sourceBoundary: 'mandatory',
  reviewStatus: 'unreviewed',
  approvedForUse: false,
};

try {
  const pending = reviewService.review(baseRecord, {
    reviewerId: 'fixture-query-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'mark_pending_review',
    rationale: 'Fixture query record is ready for controlled approved-bundle testing.',
    reviewedAt: '2026-05-30T14:00:00Z',
  });

  const approved = reviewService.review(pending.record, {
    reviewerId: 'fixture-query-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'approve_by_human',
    rationale:
      'Fixture query record was reviewed for source boundary, citation, applicability triggers, and evidence requirements.',
    reviewedAt: '2026-05-30T14:15:00Z',
  });

  fs.writeFileSync(fixturePath, `${JSON.stringify(approved.record, null, 2)}\n`);

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
  runTsNode('backend/scripts/validate-approved-safescope-knowledge-export.ts');

  const queryService = new ApprovedKnowledgeQueryService();

  const machineGuarding = queryService.query({
    text: 'machine guarding',
    hazardDomain: 'mechanical',
    limit: 5,
  });

  assert(machineGuarding.totalApprovedRecordsAvailable >= 1, 'Expected at least one approved record available.');
  assert(machineGuarding.matchCount >= 1, 'Expected at least one machine guarding match.');
  assert(
    machineGuarding.matches.some((match) => match.record.recordId === 'fixture-approved-query-test'),
    'Expected fixture record to match machine guarding query.',
  );
  assert(machineGuarding.guardrails.readOnly === true, 'Query service must be read-only.');
  assert(machineGuarding.guardrails.approvedRecordsOnly === true, 'Query service must use approved records only.');
  assert(machineGuarding.guardrails.cannotApproveRecords === true, 'Query service must not approve records.');
  assert(machineGuarding.guardrails.cannotDeclareViolations === true, 'Query service must not declare violations.');

  const citation = queryService.query({
    citation: '1910.212',
    limit: 5,
  });

  assert(citation.matchCount >= 1, 'Expected citation query to match approved fixture.');

  const empty = queryService.query({ limit: 5 });
  assert(empty.matchCount >= 1, 'Empty approved query should return available approved records up to limit.');

  console.log('✅ SafeScope approved knowledge query validation passed.');
} finally {
  if (fs.existsSync(fixturePath)) {
    fs.unlinkSync(fixturePath);
  }

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
}
