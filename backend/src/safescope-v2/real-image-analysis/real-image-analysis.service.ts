import { Injectable } from '@nestjs/common';
import { 
  RealImageAnalysisInput, 
  RealImageAnalysisResult, 
  VisualSignal,
  ImageInput
} from './real-image-analysis.types';

@Injectable()
export class RealImageAnalysisService {
  private readonly advisoryBoundary = "SafeScope real image analysis is advisory only and based on metadata, captions, and simulated vision findings. It does not make regulatory determinations.";

  private readonly signalFamilies = [
    {
      family: 'machine_guarding_visual',
      signals: [
        { id: 'visible_missing_guard', terms: ['missing guard', 'unguarded', 'no guard', 'guard removed'], conflictTerms: ['guard installed', 'guarded', 'guard in place'] },
        { id: 'visible_installed_guard', terms: ['guard installed', 'guarded', 'guard in place'], conflictTerms: ['missing guard', 'unguarded', 'no guard'] },
        { id: 'visible_nip_point', terms: ['nip point', 'pinch point', 'in-running nip'] },
        { id: 'visible_rotating_part', terms: ['rotating part', 'moving parts', 'rotating shaft'] }
      ]
    },
    {
      family: 'electrical_visual',
      signals: [
        { id: 'visible_damaged_cord', terms: ['damaged cord', 'frayed cord', 'exposed copper'], conflictTerms: ['cord intact', 'good condition'] },
        { id: 'visible_exposed_wire', terms: ['exposed wire', 'live conductor'] },
        { id: 'visible_wet_area_near_electrical', terms: ['wet area near electrical', 'water near panel'] }
      ]
    },
    {
      family: 'slips_trips_falls_visual',
      signals: [
        { id: 'visible_spill', terms: ['spill', 'leaking', 'puddle'], conflictTerms: ['no spill', 'clean', 'dry'] },
        { id: 'visible_wet_surface', terms: ['wet surface', 'wet floor', 'slippery'], conflictTerms: ['dry floor', 'dry surface'] },
        { id: 'visible_trip_hazard', terms: ['trip hazard', 'uneven surface', 'hose across walkway'] },
        { id: 'visible_poor_housekeeping', terms: ['poor housekeeping', 'cluttered area', 'debris'] }
      ]
    },
    {
      family: 'fall_protection_visual',
      signals: [
        { id: 'visible_open_edge', terms: ['open edge', 'unprotected edge', 'hole in floor'], conflictTerms: ['guarded edge', 'covered hole'] },
        { id: 'visible_missing_guardrail', terms: ['missing guardrail', 'no railing'], conflictTerms: ['guardrail present', 'railing installed'] },
        { id: 'visible_harness_or_lanyard', terms: ['harness', 'lanyard', 'tie-off'] }
      ]
    },
    {
      family: 'ppe_visual',
      signals: [
        { id: 'visible_no_eye_protection', terms: ['no eye protection', 'no safety glasses'], conflictTerms: ['wearing safety glasses', 'eye protection worn'] },
        { id: 'visible_no_head_protection', terms: ['no head protection', 'no hard hat'], conflictTerms: ['wearing hard hat', 'hard hat worn'] },
        { id: 'visible_no_high_visibility', terms: ['no high visibility', 'no vest'], conflictTerms: ['wearing vest', 'hi-vis worn'] }
      ]
    },
    {
      family: 'emergency_egress_visual',
      signals: [
        { id: 'visible_blocked_exit', terms: ['blocked exit', 'exit obstructed'], conflictTerms: ['exit clear', 'unobstructed exit'] },
        { id: 'visible_blocked_extinguisher', terms: ['blocked fire extinguisher', 'extinguisher obstructed'] },
        { id: 'visible_blocked_egress_route', terms: ['blocked egress', 'obstructed walkway'] }
      ]
    },
    {
      family: 'hazcom_visual',
      signals: [
        { id: 'visible_unlabeled_container', terms: ['unlabeled container', 'no label', 'missing label'], conflictTerms: ['labeled container', 'label legible'] },
        { id: 'visible_damaged_label', terms: ['damaged label', 'illegible label'] },
        { id: 'visible_spill_container', terms: ['leaking container', 'spill from drum'] }
      ]
    },
    {
      family: 'mobile_equipment_visual',
      signals: [
        { id: 'visible_pedestrian_equipment_interaction', terms: ['pedestrian near equipment', 'worker near forklift'] },
        { id: 'visible_blind_spot', terms: ['blind spot', 'poor visibility area'] },
        { id: 'visible_missing_separation', terms: ['no pedestrian barrier', 'missing physical separation'] }
      ]
    }
  ];

  evaluate(input: RealImageAnalysisInput): RealImageAnalysisResult {
    const { observationText, imageInputs } = input;
    const visualSignals: VisualSignal[] = [];
    const limitations: string[] = ["Metadata analysis only", "Simulation mode active"];
    const followups: string[] = [];
    let requiresHumanVerification = false;

    imageInputs.forEach(img => {
      const combinedText = `
        ${img.fileName || ''} 
        ${img.caption || ''} 
        ${img.fieldNotes || ''} 
        ${(img.simulatedVisionFindings || []).join(' ')}
      `.toLowerCase();

      this.signalFamilies.forEach(fam => {
        fam.signals.forEach(sig => {
          // Phrase-safe matching
          const match = this.findBestMatch(combinedText, sig.terms);
          if (match) {
            const support = this.determineSupport(observationText.toLowerCase(), sig.id, sig.conflictTerms || []);
            
            visualSignals.push({
              imageId: img.id,
              family: fam.family,
              signal: sig.id,
              support: support,
              confidence: "high", // In simulation, we assume high if the term is present
              basis: [match]
            });

            if (support === "conflicts_with_observation" || support === "uncertain") {
              requiresHumanVerification = true;
            }
          }
        });
      });

      if (!img.caption && !img.fieldNotes && (!img.simulatedVisionFindings || img.simulatedVisionFindings.length === 0)) {
        followups.push(`Add caption or notes for image ${img.id}`);
      }
    });

    // Aggregate summary
    const signalCount = visualSignals.length;
    const supportsCount = visualSignals.filter(s => s.support === "supports_observation").length;
    const conflictsCount = visualSignals.filter(s => s.support === "conflicts_with_observation").length;

    let confidenceImpact: "boost" | "neutral" | "downgrade" | "block" = "neutral";
    if (conflictsCount > 0) {
      confidenceImpact = "downgrade";
      if (conflictsCount > 1) confidenceImpact = "block";
    } else if (supportsCount > 1) {
      confidenceImpact = "boost";
    }

    const imageEvidenceSummary = `Detected ${signalCount} visual signals from ${imageInputs.length} images. ${supportsCount} support observation, ${conflictsCount} conflict.`;

    return {
      version: "real_image_analysis_v1",
      imageCount: imageInputs.length,
      visualSignals,
      imageEvidenceSummary,
      visualConfidenceImpact: confidenceImpact,
      imageEvidenceLimitations: limitations,
      recommendedPhotoFollowups: followups,
      requiresHumanVerification,
      advisoryBoundary: this.advisoryBoundary
    };
  }

  private findBestMatch(text: string, terms: string[]): string | null {
    // Sort terms by length descending
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b${this.escapeRegExp(term)}\\b`, 'i');
      if (regex.test(text)) {
        // Negative phrase safety (very basic for now)
        if (new RegExp(`\\b(no|not|none|clear of)\\s+${this.escapeRegExp(term)}\\b`, 'i').test(text)) {
          continue; 
        }
        return term;
      }
    }
    return null;
  }

  private determineSupport(obsText: string, signalId: string, conflictTerms: string[]): "supports_observation" | "conflicts_with_observation" | "adds_new_concern" | "uncertain" {
    const obsLower = obsText.toLowerCase();
    
    // Check conflicts first
    for (const term of conflictTerms) {
       if (new RegExp(`\\b${this.escapeRegExp(term)}\\b`, 'i').test(obsLower)) {
         return "conflicts_with_observation";
       }
    }

    // Support mappings
    const supportMap: Record<string, string[]> = {
      'visible_missing_guard': ['unguarded', 'no guard', 'missing guard', 'conveyor'],
      'visible_installed_guard': ['guarded', 'guard installed'],
      'visible_damaged_cord': ['damaged cord', 'frayed', 'extension cord'],
      'visible_blocked_exit': ['blocked', 'egress', 'exit obstructed'],
      'visible_unlabeled_container': ['unlabeled', 'no label', 'secondary container'],
      'visible_missing_guardrail': ['missing guardrail', 'no railing', 'open edge', 'unprotected edge'],
      'visible_spill': ['spill', 'leaking', 'wet floor']
    };

    const keywords = supportMap[signalId] || signalId.split('_');
    const hasMatch = keywords.some(kw => obsLower.includes(kw));

    if (hasMatch) return "supports_observation";

    return "adds_new_concern";
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
