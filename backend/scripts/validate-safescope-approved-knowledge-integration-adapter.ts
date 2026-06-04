import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';
import { KnowledgeReviewService } from '../src/safescope-v2/knowledge-intake/review/knowledge-review.service';
import { ApprovedKnowledgeIntegrationAdapterService } from '../src/safescope-v2/knowledge-intake/integration/approved-knowledge-integration-adapter.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const quarantinedDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/quarantined',
);

const fixturePath = path.join(quarantinedDir, '_fixture-approved-integration-adapter-test.json');
const reviewService = new KnowledgeReviewService();

function runTsNode(scriptPath: string): void {
  execFileSync('npx', ['ts-node', '--project', 'backend/tsconfig.json', scriptPath], {
    cwd: path.join(__dirname, '../..'),
    stdio: 'inherit',
  });
}

const baseRecord: KnowledgeRecord = {
  recordId: 'fixture-approved-integration-adapter-test',
  sourceAuthority: 'OSHA',
  sourceType: 'cfr',
  authorityTier: 'federal_regulation',
  citation: '29 CFR 1910.212',
  title: 'Machine guarding integration adapter fixture',
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
  const adapter = new ApprovedKnowledgeIntegrationAdapterService();

  const disabled = adapter.getContextForReasoning({
    reasoningEngine: 'safescope_native',
    classification: 'Machine Guarding',
    hazardObservation: 'exposed conveyor nip point',
  });

  assert(disabled.engine === 'safescope_approved_knowledge_integration_adapter', 'Adapter engine name changed.');
  assert(disabled.mode === 'disabled_by_default_context_adapter', 'Adapter mode changed.');
  assert(disabled.enabled === false, 'Adapter must be disabled by default.');
  assert(disabled.references.length === 0, 'Disabled adapter must not return references.');
  assert(disabled.recordsUsed.length === 0, 'Disabled adapter must not return records.');
  assert(disabled.adapterUseBoundary.readOnly === true, 'Adapter must be read-only.');
  assert(disabled.adapterUseBoundary.disabledByDefault === true, 'Adapter must declare disabled-by-default.');
  assert(disabled.adapterUseBoundary.canProvideContext === false, 'Disabled adapter must not provide context.');
  assert(disabled.adapterUseBoundary.canModifyNativeReasoning === false, 'Adapter must not modify native reasoning.');
  assert(disabled.adapterUseBoundary.canCreateCitations === false, 'Adapter must not create citations.');
  assert(disabled.adapterUseBoundary.canDeclareViolations === false, 'Adapter must not declare violations.');
  assert(disabled.adapterUseBoundary.canOverrideRegulations === false, 'Adapter must not override regulations.');
  assert(disabled.adapterUseBoundary.canBypassHumanReview === false, 'Adapter must not bypass human review.');
  assert(disabled.adapterUseBoundary.canUseUnapprovedRecords === false, 'Adapter must not use unapproved records.');

  const pending = reviewService.review(baseRecord, {
    reviewerId: 'fixture-integration-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'mark_pending_review',
    rationale: 'Fixture integration adapter record is ready for controlled approved-context testing.',
    reviewedAt: '2026-05-30T16:00:00Z',
  });

  const approved = reviewService.review(pending.record, {
    reviewerId: 'fixture-integration-reviewer',
    reviewerRole: 'safety_professional',
    decision: 'approve_by_human',
    rationale:
      'Fixture integration adapter record was reviewed for citation, source boundary, applicability triggers, and evidence requirements.',
    reviewedAt: '2026-05-30T16:15:00Z',
  });

  fs.writeFileSync(fixturePath, `${JSON.stringify(approved.record, null, 2)}\n`);

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
  runTsNode('backend/scripts/validate-approved-safescope-knowledge-export.ts');

  const enabled = adapter.getContextForReasoning({
    enabled: true,
    reasoningEngine: 'safescope_native',
    classification: 'Machine Guarding',
    hazardObservation: 'machine guarding point of operation employee exposure',
    jurisdictionHint: 'OSHA_GENERAL_INDUSTRY',
    limit: 5,
  });

  assert(enabled.enabled === true, 'Explicitly enabled adapter should report enabled true.');
  assert(enabled.adapterUseBoundary.canProvideContext === true, 'Enabled adapter may provide approved context.');
  assert(enabled.approvedRecordCountAvailable >= 1, 'Enabled adapter should see approved records.');
  assert(enabled.references.length >= 1, 'Enabled adapter should return approved references.');
  assert(
    enabled.references.some((reference) => reference.recordId === 'fixture-approved-integration-adapter-test'),
    'Enabled adapter did not return the approved fixture reference.',
  );

  assert(enabled.recordsUsed.every((record) => record.reviewStatus === 'approved_by_human'), 'Adapter recordsUsed must be approved_by_human.');
  assert(enabled.recordsUsed.every((record) => record.approvedForUse === true), 'Adapter recordsUsed must be approvedForUse.');
  assert(enabled.adapterUseBoundary.canModifyNativeReasoning === false, 'Adapter must not modify native reasoning.');
  assert(enabled.adapterUseBoundary.canCreateCitations === false, 'Adapter must not create citations.');
  assert(enabled.adapterUseBoundary.canDeclareViolations === false, 'Adapter must not declare violations.');
  assert(enabled.adapterUseBoundary.canOverrideRegulations === false, 'Adapter must not override regulations.');
  assert(enabled.adapterUseBoundary.canBypassHumanReview === false, 'Adapter must not bypass human review.');
  assert(enabled.adapterUseBoundary.canUseUnapprovedRecords === false, 'Adapter must not use unapproved records.');

  console.log('✅ SafeScope approved knowledge integration adapter validation passed.');
} finally {
  if (fs.existsSync(fixturePath)) {
    fs.unlinkSync(fixturePath);
  }

  runTsNode('backend/scripts/export-approved-safescope-knowledge.ts');
}
