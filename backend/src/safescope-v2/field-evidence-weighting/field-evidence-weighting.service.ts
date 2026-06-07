import { Injectable } from '@nestjs/common';
import { EvidenceWeightingResult, EvidenceGrade, FieldEvidenceWeightingInput } from './field-evidence-weighting.types';

@Injectable()
export class FieldEvidenceWeightingService {

  private contradictionSets = [
    { name: 'energy state', terms: ['de-energized', 'energized', 'live'] },
    { name: 'lockout status', terms: ['not locked out', 'locked out'] }, // Longer terms first
    { name: 'guard status', terms: ['guard removed', 'guard missing', 'unguarded', 'guarded'] },
    { name: 'exposure status', terms: ['no exposure', 'employee exposed', 'within reach', 'employee nearby', 'employee access'] },
    { name: 'spill status', terms: ['cleaned up', 'contained', 'spill remains', 'leaking', 'active spill'] },
    { name: 'inspection status', terms: ['missing tag', 'illegible tag', 'expired', 'inspected', 'current'] },
    { name: 'label status', terms: ['unlabeled', 'no label', 'sds missing', 'labeled'] },
    { name: 'barricade status', terms: ['no barricade', 'no exclusion zone', 'barricaded', 'exclusion zone established'] }
  ];

  private normalize(text: string): string {
    return ` ${text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, " ").replace(/-/g, " ")} `;
  }
  
  private hasTerm(normalizedText: string, term: string): boolean {
    const normalizedTerm = term.toLowerCase().replace(/-/g, " ");
    return normalizedText.includes(` ${normalizedTerm} `);
  }

  evaluate(input: string | FieldEvidenceWeightingInput): EvidenceWeightingResult {
    const observationText = typeof input === 'string' ? input : input.observationText;
    const lowerText = this.normalize(observationText);
    
    const detectedContradictions: string[] = [];
    let supportingSignals: string[] = [];
    
    this.contradictionSets.forEach(set => {
      const found: string[] = [];
      const remainingText = lowerText;
      
      // Order terms by length descending to match longest possible first
      const sortedTerms = [...set.terms].sort((a, b) => b.length - a.length);
      
      let tempText = remainingText;
      sortedTerms.forEach(term => {
          if (this.hasTerm(tempText, term)) {
              found.push(term);
              // Remove the found term to avoid matching shorter sub-terms
              const normalizedTerm = term.toLowerCase().replace(/-/g, " ");
              tempText = tempText.replace(new RegExp(` ${normalizedTerm} `, 'g'), " [FOUND] ");
          }
      });

      if (found.length > 1) {
        detectedContradictions.push(`Contradiction in ${set.name}: ${found.join(' vs ')}`);
      }
      supportingSignals.push(...found);
    });

    const contradictionPenalty = detectedContradictions.length * 10;
    
    const missingCriticalFacts: string[] = [];
    let missingFactPenalty = 0;
    
    const hasExposure = /\b(employee|person|worker|exposed|nearby|within reach|access)\b/.test(observationText.toLowerCase());
    if (!hasExposure) {
        missingCriticalFacts.push("Exposure to personnel is unclear.");
        missingFactPenalty += 2;
    }

    const uniqueSignals = Array.from(new Set(supportingSignals));
    const evidenceStrengthScore = Math.max(0, uniqueSignals.length * 2);
    const finalEvidenceConfidence = Math.max(0, evidenceStrengthScore - contradictionPenalty - missingFactPenalty);
    
    let evidenceGrade: EvidenceGrade = 'insufficient';
    if (contradictionPenalty > 0) {
        evidenceGrade = 'conflicting';
    } else if (finalEvidenceConfidence >= 8) {
        evidenceGrade = 'strong';
    } else if (finalEvidenceConfidence >= 4) {
        evidenceGrade = 'moderate';
    } else if (finalEvidenceConfidence > 0) {
        evidenceGrade = 'weak';
    }

    return {
      evidenceStrengthScore,
      exposureClarityScore: 5,
      controlFailureClarityScore: 5,
      energyStateClarityScore: 5,
      contradictionPenalty,
      missingFactPenalty,
      finalEvidenceConfidence,
      evidenceGrade,
      detectedContradictions,
      missingCriticalFacts,
      supportingSignals: uniqueSignals,
      weakeningSignals: detectedContradictions,
      reviewerQuestions: [
        ...detectedContradictions.map(c => `Clarify conflicting facts: ${c}`),
        ...missingCriticalFacts.map(fact => `Clarify missing fact: ${fact}`)
      ],
      advisoryBoundary: 'This evidence evaluation is advisory and based on automated text analysis.'
    };
  }
}
