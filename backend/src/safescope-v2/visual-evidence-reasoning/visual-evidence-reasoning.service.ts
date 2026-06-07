import { Injectable } from '@nestjs/common';
import { 
  VisualEvidenceReasoningInput, 
  VisualEvidenceReasoningResult,
  Attachment
} from './visual-evidence-reasoning.types';

@Injectable()
export class VisualEvidenceReasoningService {

  evaluate(input: VisualEvidenceReasoningInput): VisualEvidenceReasoningResult {
    const { observationText, attachments = [] } = input;
    const lowerText = observationText.toLowerCase();
    
    let evidencePresence: 'none' | 'present' | 'partial' | 'unclear' = 'none';
    let visualSupportLevel: 'supportive' | 'partially_supportive' | 'insufficient' | 'conflicting' | 'not_evaluated' = 'not_evaluated';
    let photoEvidenceScore = 0;
    const relevantAttachmentIds: string[] = [];
    const missingVisualEvidence: string[] = [];
    const visualConsistencyFlags: string[] = [];
    const reviewerQuestions: string[] = [];
    let confidenceImpact: 'boost' | 'neutral' | 'downgrade' | 'block_confident_language' = 'neutral';
    
    const photos = attachments.filter(a => a.type === 'photo' || a.type === 'video');
    const linkedAttachmentCount = attachments.length;

    // 1. Evidence Presence
    if (attachments.length === 0) {
        evidencePresence = 'none';
    } else if (photos.length > 0) {
        evidencePresence = 'present';
    } else {
        evidencePresence = 'partial';
    }

    // 2. Deterministic Scoring and Support Level
    if (evidencePresence === 'none') {
        visualSupportLevel = 'insufficient';
        confidenceImpact = 'downgrade';
        if (this.isVisualHazard(lowerText)) {
            reviewerQuestions.push('This hazard type usually requires visual confirmation. Can relevant photos be attached?');
            missingVisualEvidence.push('General site photos of the condition.');
        }
    } else {
        // Scoring
        photos.forEach(p => {
            photoEvidenceScore += 2;
            relevantAttachmentIds.push(p.id);
            
            if (p.viewType === 'close_up') photoEvidenceScore += 2;
            if (p.viewType === 'wide_area') photoEvidenceScore += 2;
            if (p.viewType === 'control_status') photoEvidenceScore += 2;
            if (p.viewType === 'employee_exposure') photoEvidenceScore += 2;
            
            // 3. Metadata Completeness
            if (!p.caption && !p.fieldNotes) {
                reviewerQuestions.push(`Photo ${p.id} is missing a caption or notes. What does this image show?`);
            }
        });

        // 4. Hazard-Specific View Requirements
        this.checkHazardSpecificRequirements(lowerText, photos, missingVisualEvidence, reviewerQuestions);

        // 5. Consistency/Contradiction Checks
        this.checkConsistency(lowerText, photos, visualConsistencyFlags, reviewerQuestions);

        // Conflict check
        if (visualConsistencyFlags.length > 0) {
            photoEvidenceScore -= 5;
            visualSupportLevel = 'conflicting';
            confidenceImpact = 'block_confident_language';
        }

        photoEvidenceScore = Math.max(0, Math.min(10, photoEvidenceScore));

        if (visualSupportLevel !== 'conflicting') {
            if (photoEvidenceScore >= 7) {
                visualSupportLevel = 'supportive';
                confidenceImpact = 'boost';
            } else if (photoEvidenceScore >= 4) {
                visualSupportLevel = 'partially_supportive';
                confidenceImpact = 'neutral';
            } else {
                visualSupportLevel = 'insufficient';
                confidenceImpact = 'downgrade';
            }
        }
    }

    return {
      version: 'visual_evidence_reasoning_v1',
      evidencePresence,
      visualSupportLevel,
      photoEvidenceScore,
      linkedAttachmentCount,
      relevantAttachmentIds,
      missingVisualEvidence,
      visualConsistencyFlags,
      reviewerQuestions,
      confidenceImpact,
      advisoryBoundary: 'SafeScope visual evidence reasoning is based on attachment metadata and notes only. It is not an automated image recognition result.'
    };
  }

  private isVisualHazard(text: string): boolean {
      return /guard|conveyor|nip point|cord|panel|wire|label|sds|unlabeled|edge|guardrail|forklift|spill|wet floor|leak|confined space|tank/.test(text);
  }

  private checkHazardSpecificRequirements(text: string, photos: Attachment[], missing: string[], questions: string[]) {
      if (text.includes('guard') || text.includes('nip point')) {
          if (!photos.some(p => p.viewType === 'close_up')) {
              missing.push('Close-up of guard or control status.');
              questions.push('Please provide a close-up photo of the machine guard area.');
          }
          if (!photos.some(p => p.viewType === 'wide_area')) {
              missing.push('Wide-area photo showing access/exposure path.');
              questions.push('Please provide a wide-area photo showing how employees might access this equipment.');
          }
      }
      if (text.includes('fall') || text.includes('edge')) {
          if (!photos.some(p => p.viewType === 'wide_area')) {
              missing.push('Wide-area photo of the elevated edge/platform.');
              questions.push('Please provide a wide-area view of the platform/edge.');
          }
      }
      // Add more as needed per requirements
  }

  private checkConsistency(text: string, photos: Attachment[], flags: string[], questions: string[]) {
      const notes = photos.map(p => (p.caption || '') + ' ' + (p.fieldNotes || '')).join(' ').toLowerCase();
      
      const checkConflict = (obsPattern: RegExp, photoPattern: RegExp, label: string) => {
          if (obsPattern.test(text) && photoPattern.test(notes)) {
              flags.push(`Consistency Conflict: ${label}`);
              questions.push(`Observation says ${label.split(' vs ')[0]}, but photo notes indicate ${label.split(' vs ')[1]}. Please verify.`);
          }
      };

      // Word boundaries are important
      checkConflict(/\b(unguarded|missing guard|no guard)\b/i, /\b(guarded|guard installed|guard in place)\b/i, 'unguarded vs guarded');
      checkConflict(/\b(unlabeled|no label)\b/i, /\b(labeled|label visible)\b/i, 'unlabeled vs labeled');
      checkConflict(/\b(wet|spill|leaking)\b/i, /\b(cleaned|dry|no spill)\b/i, 'wet vs dry');
      checkConflict(/\b(energized|live|running)\b/i, /\b(de-energized|locked out|off)\b/i, 'energized vs de-energized');
  }
}
