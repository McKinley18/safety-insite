import { Injectable } from '@nestjs/common';
import { EvidenceWeightingResult, EvidenceGrade, FieldEvidenceWeightingInput } from './field-evidence-weighting.types';

@Injectable()
export class FieldEvidenceWeightingService {

  private supportingSignalsList = [
    'energized', 'live', 'running', 'started', 'de-energized',
    'locked out', 'not locked out', 'loto',
    'guarded', 'unguarded', 'guard removed', 'guard missing', 'guard in place',
    'employee exposed', 'within reach', 'employee nearby', 'employee access', 'pedestrian',
    'no exposure', 'no employees nearby',
    'cleaned up', 'contained', 'spill remains', 'leaking', 'active spill', 'wet floor', 'standing water', 'damp',
    'inspected', 'current', 'expired', 'missing tag', 'illegible tag', 'damaged cord', 'exposed wire', 'damaged',
    'unlabeled', 'no label', 'sds missing', 'labeled',
    'barricaded', 'exclusion zone established', 'no barricade', 'no exclusion zone'
  ];

  private contradictionPairs = [
    { a: 'de-energized', b: 'energized' },
    { a: 'de-energized', b: 'live' },
    { a: 'locked out', b: 'not locked out' },
    { a: 'guarded', b: 'unguarded' },
    { a: 'guarded', b: 'guard removed' },
    { a: 'guarded', b: 'guard missing' },
    { a: 'guard in place', b: 'unguarded' },
    { a: 'no exposure', b: 'employee exposed' },
    { a: 'no exposure', b: 'within reach' },
    { a: 'no employees nearby', b: 'employee nearby' },
    { a: 'cleaned up', b: 'spill remains' },
    { a: 'cleaned up', b: 'leaking' },
    { a: 'cleaned up', b: 'active spill' },
    { a: 'inspected', b: 'expired' },
    { a: 'current', b: 'expired' },
    { a: 'labeled', b: 'unlabeled' },
    { a: 'labeled', b: 'no label' },
    { a: 'barricaded', b: 'no barricade' },
    { a: 'barricaded', b: 'no exclusion zone' },
    { a: 'exclusion zone established', b: 'no exclusion zone' }
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
    const supportingSignals: string[] = [];
    
    // 1. Identify all supporting signals
    const sortedSignals = [...this.supportingSignalsList].sort((a, b) => b.length - a.length);
    let tempText = lowerText;
    sortedSignals.forEach(signal => {
        if (this.hasTerm(tempText, signal)) {
            supportingSignals.push(signal);
            const normalizedSignal = signal.toLowerCase().replace(/-/g, " ");
            tempText = tempText.replace(new RegExp(` ${normalizedSignal} `, 'g'), " [FOUND] ");
        }
    });

    // 2. Detect explicit contradictions
    this.contradictionPairs.forEach(pair => {
        if (supportingSignals.includes(pair.a) && supportingSignals.includes(pair.b)) {
            detectedContradictions.push(`Conflict: ${pair.a} vs ${pair.b}`);
        }
    });

    const contradictionPenalty = detectedContradictions.length * 10;
    
    const missingCriticalFacts: string[] = [];
    let missingFactPenalty = 0;
    
    const hasExposure = /\b(employee|person|worker|exposed|nearby|within reach|access|pedestrian)\b/i.test(observationText);
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
