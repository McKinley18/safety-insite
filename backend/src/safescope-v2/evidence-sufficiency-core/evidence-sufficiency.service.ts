import { Injectable } from '@nestjs/common';
import {
  ConfidenceLevel,
  EvidenceSufficiencyOutput,
  FactScores,
  SufficiencyLevel,
} from './evidence-sufficiency.types';

type ScoreReason = {
  key: keyof FactScores;
  score: number;
  strongest?: string;
  weakest?: string;
  missing?: string;
  question?: string;
  trace: string;
};

@Injectable()
export class EvidenceSufficiencyService {
  private readonly engineVersion = '0.1.0';

  async evaluateEvidenceSufficiency(
    observationUnderstanding: any,
    causalRiskReasoning: any,
    fusedText: string
  ): Promise<EvidenceSufficiencyOutput> {
    const text = this.normalize(fusedText);
    const scores = this.scoreFacts(observationUnderstanding, causalRiskReasoning, text);

    const factScores: FactScores = {
      observationClarity: scores.find(s => s.key === 'observationClarity')?.score ?? 0,
      equipmentClarity: scores.find(s => s.key === 'equipmentClarity')?.score ?? 0,
      taskClarity: scores.find(s => s.key === 'taskClarity')?.score ?? 0,
      exposureClarity: scores.find(s => s.key === 'exposureClarity')?.score ?? 0,
      energyClarity: scores.find(s => s.key === 'energyClarity')?.score ?? 0,
      controlFailureClarity: scores.find(s => s.key === 'controlFailureClarity')?.score ?? 0,
      mechanismClarity: scores.find(s => s.key === 'mechanismClarity')?.score ?? 0,
      jurisdictionClarity: scores.find(s => s.key === 'jurisdictionClarity')?.score ?? 0,
      evidenceSupport: scores.find(s => s.key === 'evidenceSupport')?.score ?? 0,
    };

    const overallScore = this.average(Object.values(factScores));
    const missingCriticalFacts = Array.from(new Set(scores.map(s => s.missing).filter(Boolean) as string[]));
    const recommendedReviewerQuestions = Array.from(new Set(scores.map(s => s.question).filter(Boolean) as string[]));
    const strongestFacts = Array.from(new Set(scores.map(s => s.strongest).filter(Boolean) as string[]));
    const weakestFacts = Array.from(new Set(scores.map(s => s.weakest).filter(Boolean) as string[]));

    const sufficiencyLevel = this.levelFromScore(overallScore, factScores, missingCriticalFacts);
    const maximumSupportedConfidence = this.maximumSupportedConfidence(sufficiencyLevel, factScores);
    const shouldDowngradeConfidence = ['weak', 'insufficient'].includes(sufficiencyLevel) || maximumSupportedConfidence !== 'high';

    return {
      engine: 'safescope_evidence_sufficiency_engine',
      version: this.engineVersion,
      sufficiencyLevel,
      overallScore,
      factScores,
      strongestFacts,
      weakestFacts,
      missingCriticalFacts,
      recommendedReviewerQuestions,
      confidenceImpact: {
        shouldDowngradeConfidence,
        downgradeReason: shouldDowngradeConfidence
          ? this.buildDowngradeReason(sufficiencyLevel, missingCriticalFacts, factScores)
          : 'Evidence supports high-confidence reasoning if other reasoning layers agree.',
        maximumSupportedConfidence,
      },
      reasoningTrace: [
        'Evaluated observation clarity, equipment, task, exposure, energy, controls, mechanism, jurisdiction, and evidence support.',
        ...scores.map(s => s.trace),
        `Computed overall evidence sufficiency score: ${overallScore}.`,
        `Assigned sufficiency level: ${sufficiencyLevel}.`,
        'Preserved advisory-only boundary and qualified-review requirement.',
      ],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private scoreFacts(observationUnderstanding: any, causalRiskReasoning: any, text: string): ScoreReason[] {
    const u = observationUnderstanding ?? {};
    const causal = causalRiskReasoning ?? {};
    const scenario = u.scenarioUnderstanding?.topScenario ?? {};
    const topMechanism = u.mechanismCandidates?.[0] ?? {};

    const equipmentCategory = this.value(u.equipment?.category);
    const equipmentSpecific = this.value(u.equipment?.specificEquipment);
    const equipmentComponent = this.value(u.equipment?.component);
    const taskType = this.value(u.task?.taskType);
    const workerExposed = u.exposure?.workerExposed;
    const proximity = this.value(u.exposure?.proximity);
    const primaryEnergy = this.value(u.energy?.primaryEnergySource || causal.primaryEnergySource);
    const failedControls = [
      ...(Array.isArray(u.controls?.failedControls) ? u.controls.failedControls : []),
      ...(Array.isArray(u.controls?.missingControls) ? u.controls.missingControls : []),
    ].filter(Boolean);
    const causalFailedControl = this.value(causal.failedOrMissingControl);
    const mechanism = this.value(scenario.mechanism || topMechanism.mechanism || causal.mechanismOfInjury);
    const jurisdiction = this.value(u.jurisdiction?.detected);

    return [
      this.scoreObservationClarity(text),
      this.scoreEquipmentClarity(equipmentCategory, equipmentSpecific, equipmentComponent, text),
      this.scoreTaskClarity(taskType, text),
      this.scoreExposureClarity(workerExposed, proximity, text),
      this.scoreEnergyClarity(primaryEnergy, text),
      this.scoreControlFailureClarity(failedControls, causalFailedControl, text),
      this.scoreMechanismClarity(mechanism, topMechanism?.confidence, causal, text),
      this.scoreJurisdictionClarity(jurisdiction, text),
      this.scoreEvidenceSupport(u, causal, text),
    ];
  }

  private scoreObservationClarity(text: string): ScoreReason {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const hasHazardSignal = this.includesAny(text, [
      'unguarded', 'not locked out', 'floor hole', 'confined space', 'tank', 'suspended load',
      'unlabeled', 'chemical', 'damaged', 'leaking', 'employees', 'worker', 'mechanic',
      'fall exposure', 'energized', 'blocked', 'trench', 'excavation'
    ]);

    if (wordCount >= 10 && hasHazardSignal) {
      return {
        key: 'observationClarity',
        score: 0.9,
        strongest: 'Observation contains clear hazard context.',
        trace: 'Observation clarity is strong.',
      };
    }

    if (wordCount >= 6 || hasHazardSignal) {
      return {
        key: 'observationClarity',
        score: 0.55,
        weakest: 'Observation is limited and may not support strong conclusions.',
        missing: 'clear hazard description',
        question: 'Clarify what specific condition or activity made the observation hazardous.',
        trace: 'Observation clarity is partial.',
      };
    }

    return {
      key: 'observationClarity',
      score: 0.15,
      weakest: 'Observation is too vague for strong reasoning.',
      missing: 'clear hazard description',
      question: 'Describe the observed hazard, involved equipment, task, and exposed worker.',
      trace: 'Observation clarity is insufficient.',
    };
  }

  private scoreEquipmentClarity(category: string, specific: string, component: string, text: string): ScoreReason {
    if (category !== 'unknown') {
      return {
        key: 'equipmentClarity',
        score: component !== 'unknown' || specific !== 'unknown' ? 0.9 : 0.75,
        strongest: `Equipment context identified: ${category}.`,
        trace: `Equipment clarity identified as ${category}.`,
      };
    }

    if (this.includesAny(text, ['tank', 'floor hole', 'suspended load', 'chemical container', 'hose', 'conveyor', 'ladder'])) {
      return {
        key: 'equipmentClarity',
        score: 0.65,
        strongest: 'Equipment or physical hazard context is inferable from text.',
        trace: 'Equipment clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'equipmentClarity',
      score: 0.2,
      weakest: 'Equipment or physical hazard source is unclear.',
      missing: 'equipment or hazard source',
      question: 'Confirm the equipment, material, opening, space, or energy source involved.',
      trace: 'Equipment clarity is weak.',
    };
  }

  private scoreTaskClarity(taskType: string, text: string): ScoreReason {
    if (taskType !== 'unknown') {
      return {
        key: 'taskClarity',
        score: 0.85,
        strongest: `Task/activity identified: ${taskType}.`,
        trace: `Task clarity identified as ${taskType}.`,
      };
    }

    if (this.includesAny(text, ['servicing', 'maintenance', 'inspection', 'enter', 'lifting', 'handling', 'working', 'operation'])) {
      return {
        key: 'taskClarity',
        score: 0.65,
        strongest: 'Task/activity is inferable from observation text.',
        trace: 'Task clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'taskClarity',
      score: 0.25,
      weakest: 'Task or activity is unclear.',
      missing: 'task or activity',
      question: 'Confirm what task or activity was occurring at the time of the observation.',
      trace: 'Task clarity is weak.',
    };
  }

  private scoreExposureClarity(workerExposed: boolean | 'unclear', proximity: string, text: string): ScoreReason {
    const exposureNegated =
      this.includesAny(text, [
        'worker exposure access and proximity are not described',
        'worker exposure is not described',
        'employee exposure is not described',
        'exposure is not described',
        'access and proximity are not described',
        'proximity is not described',
        'not described',
        'not clearly established',
        'unknown exposure',
      ]);

    if (workerExposed === true && !exposureNegated) {
      return {
        key: 'exposureClarity',
        score: proximity !== 'unknown' && proximity !== 'not_established' ? 0.9 : 0.78,
        strongest: 'Worker exposure is identified.',
        trace: 'Exposure clarity is strong.',
      };
    }

    if (
      !exposureNegated &&
      this.includesAny(text, ['employee', 'worker', 'mechanic', 'employees nearby', 'working nearby', 'stands below', 'handling'])
    ) {
      return {
        key: 'exposureClarity',
        score: 0.7,
        strongest: 'Worker exposure is inferable from text.',
        trace: 'Exposure clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'exposureClarity',
      score: 0.2,
      weakest: 'Worker exposure is not clearly established.',
      missing: 'worker exposure',
      question: 'Confirm whether a worker was exposed and how close they were to the hazard.',
      trace: exposureNegated ? 'Exposure clarity is weak because the observation states exposure/proximity is not described.' : 'Exposure clarity is weak.',
    };
  }

  private scoreEnergyClarity(primaryEnergy: string, text: string): ScoreReason {
    if (primaryEnergy !== 'unknown') {
      return {
        key: 'energyClarity',
        score: 0.88,
        strongest: `Energy source identified: ${primaryEnergy}.`,
        trace: `Energy clarity identified as ${primaryEnergy}.`,
      };
    }

    const atmosphericConfinedSpaceSignal = this.includesAny(text, [
      'confined space',
      'tank',
      'vessel',
      'limited ventilation',
      'atmospheric test',
      'oxygen deficiency',
      'toxic atmosphere',
      'engulfment',
      'entrapment',
    ]);

    if (atmosphericConfinedSpaceSignal) {
      return {
        key: 'energyClarity',
        score: 0.78,
        strongest: 'Atmospheric or confined-space hazard energy is inferable from text.',
        trace: 'Energy clarity is supported by confined-space atmospheric hazard context.',
      };
    }

    if (this.includesAny(text, ['energized', 'pressurized', 'fall', 'suspended', 'moving', 'rotating', 'confined space', 'chemical'])) {
      return {
        key: 'energyClarity',
        score: 0.62,
        strongest: 'Energy source is inferable from text.',
        trace: 'Energy clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'energyClarity',
      score: 0.2,
      weakest: 'Energy source is unclear.',
      missing: 'energy source',
      question: 'Confirm whether the equipment was energized, running, pressurized, elevated, suspended, or otherwise hazardous.',
      trace: 'Energy clarity is weak.',
    };
  }

  private scoreControlFailureClarity(failedControls: string[], causalFailedControl: string, text: string): ScoreReason {
    const causalKnown = causalFailedControl !== 'unknown' && causalFailedControl !== 'none';
    if (failedControls.length > 0 || causalKnown) {
      return {
        key: 'controlFailureClarity',
        score: 0.9,
        strongest: 'Missing or failed control is identified.',
        trace: 'Control failure clarity is strong.',
      };
    }

    if (this.includesAny(text, ['no guard', 'unguarded', 'not locked out', 'no cover', 'no atmospheric test', 'no attendant', 'no permit', 'no rescue plan', 'unlabeled', 'no sds', 'damaged', 'blocked'])) {
      return {
        key: 'controlFailureClarity',
        score: 0.72,
        strongest: 'Control failure is inferable from text.',
        trace: 'Control failure clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'controlFailureClarity',
      score: 0.2,
      weakest: 'Missing or failed control is unclear.',
      missing: 'missing or failed control',
      question: 'Confirm what control was missing, failed, bypassed, damaged, or not used.',
      trace: 'Control failure clarity is weak.',
    };
  }

  private scoreMechanismClarity(mechanism: string, mechanismConfidence: number | undefined, causal: any, text: string): ScoreReason {
    if (mechanism !== 'unknown') {
      return {
        key: 'mechanismClarity',
        score: typeof mechanismConfidence === 'number' ? Math.max(0.7, Math.min(0.95, mechanismConfidence)) : 0.82,
        strongest: `Mechanism of injury identified: ${mechanism}.`,
        trace: `Mechanism clarity identified as ${mechanism}.`,
      };
    }

    if (this.value(causal.mechanismOfInjury) !== 'unknown') {
      return {
        key: 'mechanismClarity',
        score: 0.72,
        strongest: `Causal-risk layer identified mechanism: ${causal.mechanismOfInjury}.`,
        trace: 'Mechanism clarity is supported by causal-risk reasoning.',
      };
    }

    if (this.includesAny(text, ['fall', 'struck by', 'shock', 'startup', 'chemical exposure', 'whipping', 'cave in', 'engulfment'])) {
      return {
        key: 'mechanismClarity',
        score: 0.6,
        strongest: 'Mechanism is inferable from text.',
        trace: 'Mechanism clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'mechanismClarity',
      score: 0.15,
      weakest: 'Mechanism of injury is unclear.',
      missing: 'mechanism of injury',
      question: 'Confirm how the worker could be harmed: fall, struck-by, caught-in, shock, exposure, startup, or other mechanism.',
      trace: 'Mechanism clarity is weak.',
    };
  }

  private scoreJurisdictionClarity(jurisdiction: string, text: string): ScoreReason {
    if (jurisdiction !== 'unknown' && jurisdiction !== 'unclear') {
      return {
        key: 'jurisdictionClarity',
        score: 0.85,
        strongest: `Jurisdiction identified: ${jurisdiction}.`,
        trace: `Jurisdiction clarity identified as ${jurisdiction}.`,
      };
    }

    if (this.includesAny(text, ['msha', 'mine', 'osha', 'construction', 'general industry'])) {
      return {
        key: 'jurisdictionClarity',
        score: 0.65,
        strongest: 'Jurisdiction is inferable from text.',
        trace: 'Jurisdiction clarity is partially supported by text fallback.',
      };
    }

    return {
      key: 'jurisdictionClarity',
      score: 0.25,
      weakest: 'Jurisdiction/site type is unclear.',
      missing: 'jurisdiction or site type',
      question: 'Confirm jurisdiction/site type before relying on standards mapping.',
      trace: 'Jurisdiction clarity is weak.',
    };
  }

  private scoreEvidenceSupport(u: any, causal: any, text: string): ScoreReason {
    const evidenceGaps = [
      ...(Array.isArray(u.evidenceGaps) ? u.evidenceGaps : []),
      ...(Array.isArray(causal.missingEvidence) ? causal.missingEvidence : []),
    ].filter(Boolean);

    const photoOrDocumentSignal = this.includesAny(text, ['photo', 'picture', 'documented', 'tag', 'label', 'sds', 'permit', 'test']);

    if (evidenceGaps.length === 0 && photoOrDocumentSignal) {
      return {
        key: 'evidenceSupport',
        score: 0.85,
        strongest: 'Supporting evidence signal is present and no major evidence gaps were reported.',
        trace: 'Evidence support is strong.',
      };
    }

    if (evidenceGaps.length <= 2) {
      return {
        key: 'evidenceSupport',
        score: 0.62,
        strongest: 'Evidence support is usable but should be reviewed.',
        trace: 'Evidence support is partial.',
      };
    }

    return {
      key: 'evidenceSupport',
      score: 0.35,
      weakest: 'Evidence gaps remain.',
      missing: 'supporting evidence',
      question: 'Confirm whether photos, measurements, records, tags, permits, SDS, tests, or other supporting evidence exist.',
      trace: 'Evidence support is weak.',
    };
  }

  private levelFromScore(score: number, factScores: FactScores, missingCriticalFacts: string[]): SufficiencyLevel {
    const criticalWeak =
      factScores.observationClarity < 0.3 ||
      factScores.exposureClarity < 0.3 ||
      factScores.mechanismClarity < 0.3;

    if (score >= 0.78 && !criticalWeak && missingCriticalFacts.length <= 1) return 'sufficient';
    if (score >= 0.58 && !criticalWeak) return 'partially_sufficient';
    if (score >= 0.35) return 'weak';
    return 'insufficient';
  }

  private maximumSupportedConfidence(level: SufficiencyLevel, factScores: FactScores): ConfidenceLevel {
    if (level === 'sufficient') return 'high';
    if (level === 'partially_sufficient') return 'moderate';
    if (level === 'weak') return 'low';
    return 'insufficient';
  }

  private buildDowngradeReason(level: SufficiencyLevel, missingFacts: string[], factScores: FactScores): string {
    if (level === 'insufficient') {
      return 'Evidence is insufficient for strong classification, risk, standards, or corrective-action confidence.';
    }

    if (level === 'weak') {
      return 'Evidence is weak; SafeScope should ask reviewer questions before presenting strong reasoning.';
    }

    if (missingFacts.length > 0) {
      return `Evidence is partially sufficient but missing: ${missingFacts.join(', ')}.`;
    }

    return 'Evidence supports only moderate confidence based on one or more unclear critical facts.';
  }

  private average(values: number[]): number {
    if (!values.length) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
  }

  private normalize(raw: string): string {
    return String(raw || '')
      .toLowerCase()
      .replace(/[_/().,;:]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private value(input: unknown): string {
    if (typeof input !== 'string' || !input.trim()) return 'unknown';
    return input.trim().toLowerCase();
  }

  private includesAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}
