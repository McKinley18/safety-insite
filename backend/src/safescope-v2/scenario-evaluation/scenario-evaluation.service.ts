import { Injectable } from '@nestjs/common';
import { EvaluatedScenario, ScenarioEvaluationResult } from './scenario-evaluation.types';
import { ScenarioRecord } from '../scenario-expansion/scenario-expansion.types';

@Injectable()
export class ScenarioEvaluationService {

  async evaluate(
    observationText: string,
    scenarios: ScenarioRecord[],
    context: any = {}
  ): Promise<ScenarioEvaluationResult> {
    
    const evaluated: EvaluatedScenario[] = scenarios.map((s, index) => {
        const matched = s.evidenceSignals.filter(signal => observationText.includes(signal));
        const missing = s.evidenceSignals.filter(signal => !observationText.includes(signal));
        
        const evidenceStrength = matched.length * 2;
        const exposure = context.employeeExposureKnown ? 5 : 2;
        const severity = 5; // Simplified
        const controlFailure = s.likelyControlsMissing.length * 3;
        
        const totalScore = evidenceStrength + exposure + severity - controlFailure;
        
        return {
            scenarioId: s.scenarioId,
            domainId: s.domainId,
            title: s.plainLanguageObservation,
            matchedSignals: matched,
            missingSignals: missing,
            evidenceStrengthScore: evidenceStrength,
            exposureScore: exposure,
            severityPotentialScore: severity,
            controlFailureScore: controlFailure,
            confidenceScore: Math.max(0, Math.min(10, totalScore / 2)),
            totalScore,
            rank: 0,
            reasoningSummary: `Evaluated based on ${matched.length} signal matches.`,
            evidenceGaps: s.evidenceGaps,
            recommendedReviewerQuestions: s.supervisorQuestions,
            advisoryBoundary: 'SafeScope advisory output'
        };
    });

    const sorted = evaluated.sort((a, b) => b.totalScore - a.totalScore)
                            .map((s, idx) => ({ ...s, rank: idx + 1 }));

    return {
        topScenario: sorted[0],
        evaluatedScenarios: sorted,
        evaluationSummary: `Evaluated ${evaluated.length} scenarios.`
    };
  }
}
