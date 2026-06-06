import { Injectable } from '@nestjs/common';
import { ReviewerCorrection } from './reviewer-correction-capture.types';

@Injectable()
export class ReviewerCorrectionCaptureService {
  
  async captureCorrection(correction: ReviewerCorrection): Promise<{ status: string }> {
    // Placeholder implementation for capture.
    // Must validate decision-specific requirements (e.g., changeReason for edits).
    
    if (correction.reviewerDecision === 'accept_with_edits' && !correction.changeReason) {
        throw new Error('Change reason required for accept_with_edits');
    }
    if (correction.learningCandidateRecommended && correction.reviewerRole !== 'Safety Engineer') {
        throw new Error('Qualified reviewer role required for learning recommendation');
    }

    return { status: 'captured' };
  }
}
