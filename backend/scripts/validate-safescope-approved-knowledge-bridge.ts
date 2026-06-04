import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';
import { KnowledgeReviewService } from '../src/safescope-v2/knowledge-intake/review/knowledge-review.service';
import { ApprovedKnowledgeBridgeService } from '../src/safescope-v2/knowledge-intake/bridge/approved-knowledge-bridge.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const quarantinedDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/quarantined',
);

const fixturePath = path.join(quarantinedDir, '_fixture-approved-bridge-test.json');
const reviewService = new KnowledgeReviewService();

function runTsNode(scriptPath: string): void {
  execFileSync('npx', ['ts-node', '--project', 'backend/tsconfig.json', scriptPath], {
    cwd: path.join(__dirname, '../..'),
    stdio: 'inherit',
  });
}

const baseRecord: KnowledgeRecord = {
  recordId: 'fixture-approved-bridge-test',
  sourceAuthority: 'OSHA',
  sourceType: 'cfr',
  authorityTier: 'federal_regulation',
  citation: '29 CFR 1910.212',
  title: 'Machine guarding approved bridge fixture',
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
  const bridgeService = new ApprovedKnowledgeBridgeService();

  const disabled = bridgeService.getApprovedKnowledgeContext({
    classification: 'Machine Guarding',
    hazardObservation: 'exposed conveyor nip point',
  });

  assert(disabled.enabled === false, 'Bridge must be disabled by default.');
  assert(disabled.references.length === 0, 'Disabled bridge must not return references.');
  assert(disabled.recordsUsed.length === 0, 'Disabled bridge must not return records.');
  assert(disabled.reasoningUseBoundary.productionReasoningModified === false, 'Bridge must not modify production reasoning.');
  assert(disabled.reasoningUseBoundary.canSupplementReasoning === false, 'Disabled bridge must not supplement reasoning.');

  const pending = reviewService.review(baseRecord, {
    reviewerId: 'fixture-bridge-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'mark_pending_review',
    rationale: 'Fixture bridge record is ready for controlled approved-knowledge bridge testing.',
    reviewedAt: '2026-05-30T15:00:00Z',
  });

  const approved = reviewService.review(pending.record, {
    reviewerId: 'fixture-bridge-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'approve_by_human',
    rationale:
      'Fixture bridge record was reviewed for citation, source boundary, applicability triggers, and evidence requirements.',
    reviewedAt: '2026-05-30T15:15:00Z',
  });

  fs.writeFileSync(fixturePath, `${JSON.stringify(approved.record, null, 2)}\n`);

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
  runTsNode('backend/scripts/validate-approved-safescope-knowledge-export.ts');

  const enabled = bridgeService.getApprovedKnowledgeContext({
    enabled: true,
    classification: 'Machine Guarding',
    hazardObservation: 'machine guarding point of operation employee exposure',
    query: {
      text: 'machine guarding',
      hazardDomain: 'mechanical',
    },
    limit: 5,
  });

  assert(enabled.enabled === true, 'Enabled bridge should report enabled true.');
  assert(enabled.approvedRecordCountAvailable >= 1, 'Enabled bridge should see approved records.');
  assert(enabled.references.length >= 1, 'Enabled bridge should return approved references.');
  assert(
    enabled.references.some((reference) => reference.recordId === 'fixture-approved-bridge-test'),
    'Enabled bridge did not return the approved fixture reference.',
  );
  assert(enabled.recordsUsed.every((record) => record.reviewStatus === 'approved_by_human'), 'Bridge must only use approved_by_human records.');
  assert(enabled.recordsUsed.every((record) => record.approvedForUse === true), 'Bridge must only use approvedForUse records.');
  assert(enabled.reasoningUseBoundary.canSupplementReasoning === true, 'Enabled bridge may supplement reasoning context.');
  assert(enabled.reasoningUseBoundary.canCreateCitations === false, 'Bridge cannot create citations.');
  assert(enabled.reasoningUseBoundary.canDeclareViolations === false, 'Bridge cannot declare violations.');
  assert(enabled.reasoningUseBoundary.canOverrideRegulations === false, 'Bridge cannot override regulations.');
  assert(enabled.reasoningUseBoundary.canBypassHumanReview === false, 'Bridge cannot bypass human review.');
  assert(enabled.reasoningUseBoundary.canUseUnapprovedRecords === false, 'Bridge cannot use unapproved records.');
  assert(enabled.reasoningUseBoundary.productionReasoningModified === false, 'Bridge must not modify production reasoning.');

  console.log('✅ SafeScope approved knowledge bridge validation passed.');
} finally {
  if (fs.existsSync(fixturePath)) {
    fs.unlinkSync(fixturePath);
  }

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
}
