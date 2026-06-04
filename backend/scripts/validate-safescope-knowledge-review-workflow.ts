import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';
import { KnowledgeReviewService } from '../src/safescope-v2/knowledge-intake/review/knowledge-review.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function expectFailure(name: string, fn: () => void): void {
  try {
    fn();
    throw new Error(`${name}: expected failure but passed`);
  } catch (error: any) {
    if (String(error?.message || '').includes('expected failure but passed')) {
      throw error;
    }
  }
}

const service = new KnowledgeReviewService();

const baseRecord: KnowledgeRecord = {
  recordId: 'test-knowledge-record',
  sourceAuthority: 'OSHA',
  sourceType: 'cfr',
  authorityTier: 'federal_regulation',
  citation: '29 CFR 1910.212',
  title: 'Machine guarding',
  sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.212',
  retrievedAt: '2026-05-30T10:00:00Z',
  jurisdiction: 'US_FEDERAL',
  hazardDomains: ['mechanical'],
  applicabilityTriggers: ['machine guarding', 'point of operation'],
  standardIntent: 'Guard machine parts that can expose employees to injury.',
  evidenceNeeded: ['Guard condition', 'employee access path', 'equipment state'],
  nonApplicabilityQuestions: ['Is there employee exposure to the moving part?'],
  sourceBoundary: 'mandatory',
  reviewStatus: 'unreviewed',
  approvedForUse: false,
};

const pending = service.review(baseRecord, {
  reviewerId: 'reviewer-001',
  reviewerRole: 'safety_professional',
  decision: 'mark_pending_review',
  rationale: 'Record is ready for qualified review after source and citation check.',
  reviewedAt: '2026-05-30T11:00:00Z',
});

assert(pending.newStatus === 'pending_review', 'Expected pending_review status.');
assert(pending.approvedForUse === false, 'Pending review must not approve record.');
assert(pending.record.approvedForUse === false, 'Pending review record must not be approved.');

const approved = service.review(pending.record, {
  reviewerId: 'reviewer-001',
  reviewerRole: 'safety_professional',
  decision: 'approve_by_human',
  rationale: 'Citation, source boundary, applicability intent, and evidence requirements were reviewed and accepted by a qualified reviewer.',
  reviewedAt: '2026-05-30T11:15:00Z',
});

assert(approved.newStatus === 'approved_by_human', 'Expected approved_by_human status.');
assert(approved.approvedForUse === true, 'Human approval should approve record for use.');
assert(approved.record.approvedForUse === true, 'Approved record should have approvedForUse true.');

const rejected = service.review(baseRecord, {
  reviewerId: 'reviewer-002',
  reviewerRole: 'compliance_manager',
  decision: 'reject',
  rationale: 'Record needs source correction before it can be used.',
  reviewedAt: '2026-05-30T11:30:00Z',
});

assert(rejected.newStatus === 'rejected', 'Expected rejected status.');
assert(rejected.approvedForUse === false, 'Rejected record must not be approved.');

expectFailure('approval without pending review', () => {
  service.review(baseRecord, {
    reviewerId: 'reviewer-003',
    reviewerRole: 'safety_professional',
    decision: 'approve_by_human',
    rationale: 'Attempting to approve without pending review should fail.',
    reviewedAt: '2026-05-30T12:00:00Z',
  });
});

expectFailure('approval with short rationale', () => {
  service.review(pending.record, {
    reviewerId: 'reviewer-004',
    reviewerRole: 'safety_professional',
    decision: 'approve_by_human',
    rationale: 'ok',
    reviewedAt: '2026-05-30T12:15:00Z',
  });
});

expectFailure('approval of prohibited boundary', () => {
  service.review(
    {
      ...pending.record,
      sourceBoundary: 'prohibited',
    },
    {
      reviewerId: 'reviewer-005',
      reviewerRole: 'system_admin',
      decision: 'approve_by_human',
      rationale: 'This should fail because prohibited records cannot be approved.',
      reviewedAt: '2026-05-30T12:30:00Z',
    },
  );
});

console.log('✅ SafeScope knowledge review workflow validation passed.');
