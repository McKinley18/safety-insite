import { ReviewerCorrectionCaptureService } from '../src/safescope-v2/reviewer-correction-capture/reviewer-correction-capture.service';
import { ReviewerCorrection } from '../src/safescope-v2/reviewer-correction-capture/reviewer-correction-capture.types';

async function validate() {
  const service = new ReviewerCorrectionCaptureService();
  
  // Test Case: Valid accept_with_edits
  const correction: ReviewerCorrection = {
    originalSafeScopeSnapshotId: 'snap-1',
    reviewerDecision: 'accept_with_edits',
    reviewerId: 'user-1',
    reviewerRole: 'Safety Engineer',
    reviewedAt: '2026-06-06',
    changeReason: 'Corrected hazard family',
    learningCandidateRecommended: false,
    advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true
    }
  };

  const result = await service.captureCorrection(correction);
  if (result.status !== 'captured') {
      console.error('Capture failed');
      process.exit(1);
  }
  console.log('✅ Correction capture validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
