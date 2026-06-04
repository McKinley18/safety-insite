import { Injectable } from '@nestjs/common';

export type ExpandedContext = {
  environment: string;
  exposureType: string[];
  inferredActivities: string[];
  probableConsequences: string[];
  controlFailures: string[];
  operationalState: string[];
  humanFactors: string[];
  reasoning: string[];

  contextConfidence: {
    score: number;
    band: 'low' | 'medium' | 'high';
    missingSignals: string[];
  };
};

@Injectable()
export class ContextExpansionService {
  expand(text: string, classification?: string, evidenceThemes: string[] = []): ExpandedContext {
    const normalized = text.toLowerCase();
    const themes = evidenceThemes.map((theme) => theme.toLowerCase());

    const exposureType = new Set<string>();
    const inferredActivities = new Set<string>();
    const probableConsequences = new Set<string>();
    const controlFailures = new Set<string>();
    const operationalState = new Set<string>();
    const humanFactors = new Set<string>();
    const reasoning: string[] = [];

    let environment = 'general industry';

    /*
     * ENVIRONMENT INFERENCE
     */

    if (
      normalized.includes('walkway') ||
      normalized.includes('aisle') ||
      normalized.includes('travelway')
    ) {
      exposureType.add('pedestrian exposure');
      inferredActivities.add('worker movement');
      reasoning.push('Travelway exposure inferred from walkway terminology.');
    }

    if (
      normalized.includes('forklift') ||
      normalized.includes('loader') ||
      normalized.includes('haul truck')
    ) {
      exposureType.add('mobile equipment interaction');
      inferredActivities.add('material handling');
      reasoning.push('Mobile equipment exposure inferred.');
    }

    if (
      normalized.includes('maintenance') ||
      normalized.includes('repair')
    ) {
      inferredActivities.add('maintenance activity');
      operationalState.add('maintenance mode');
      reasoning.push('Maintenance activity inferred.');
    }

    /*
     * ELECTRICAL
     */

    if (
      normalized.includes('wire') ||
      normalized.includes('electrical') ||
      normalized.includes('energized') ||
      normalized.includes('live wire')
    ) {
      probableConsequences.add('electrocution');
      probableConsequences.add('burn injury');

      controlFailures.add('electrical isolation failure');

      reasoning.push('Electrical exposure context inferred.');

      if (
        normalized.includes('hanging') ||
        normalized.includes('damaged')
      ) {
        controlFailures.add('physical protection failure');
        operationalState.add('active exposure condition');

        reasoning.push('Damaged or unsecured conductor condition inferred.');
      }
    }

    /*
     * FALLS
     */

    if (
      normalized.includes('edge') ||
      normalized.includes('ladder') ||
      normalized.includes('elevated')
    ) {
      probableConsequences.add('fall injury');
      controlFailures.add('fall protection deficiency');

      reasoning.push('Fall exposure inferred.');
    }

    /*
     * HOUSEKEEPING
     */

    if (
      normalized.includes('oil') ||
      normalized.includes('debris') ||
      normalized.includes('clutter')
    ) {
      probableConsequences.add('slip or trip injury');

      controlFailures.add('poor housekeeping');

      reasoning.push('Housekeeping exposure inferred.');
    }

    /*
     * HUMAN FACTORS
     */

    if (
      normalized.includes('unguarded') ||
      normalized.includes('missing')
    ) {
      humanFactors.add('hazard recognition failure');

      reasoning.push('Missing safeguard condition inferred.');
    }

    if (
      normalized.includes('blocked') ||
      normalized.includes('obstructed')
    ) {
      humanFactors.add('workspace obstruction');

      reasoning.push('Obstructed access condition inferred.');
    }

    /*
     * EVIDENCE FUSION ENHANCEMENT
     */

    if (themes.includes('pedestrian mobile-equipment interaction')) {
      exposureType.add('pedestrian struck-by exposure');
      inferredActivities.add('mobile equipment movement near pedestrians');
      probableConsequences.add('struck-by injury');
      controlFailures.add('traffic segregation failure');
      operationalState.add('active mobile equipment exposure');
      reasoning.push('Evidence fusion identified pedestrian and mobile equipment interaction.');
    }

    if (themes.includes('visibility restriction')) {
      controlFailures.add('line-of-sight restriction');
      humanFactors.add('reduced hazard visibility');
      reasoning.push('Evidence fusion identified a visibility restriction.');
    }

    if (themes.includes('electrical exposure along travel path')) {
      exposureType.add('pedestrian electrical contact exposure');
      probableConsequences.add('electrocution');
      controlFailures.add('hazard present along travel path');
      reasoning.push('Evidence fusion identified electrical exposure along a travel path.');
    }

    if (themes.includes('walking-working surface contamination')) {
      exposureType.add('walking-working surface exposure');
      probableConsequences.add('slip or trip injury');
      controlFailures.add('contaminated travel surface');
      reasoning.push('Evidence fusion identified walking-working surface contamination.');
    }

    if (themes.includes('mobile equipment near fall exposure')) {
      exposureType.add('equipment interaction near fall exposure');
      probableConsequences.add('fall from elevation');
      probableConsequences.add('struck-by injury');
      controlFailures.add('mobile equipment operating near unprotected edge');
      reasoning.push('Evidence fusion identified mobile equipment near fall exposure.');
    }

    /*
     * CLASSIFICATION ENHANCEMENT
     */

    if (classification === 'Electrical') {
      probableConsequences.add('arc flash injury');
      exposureType.add('unexpected contact exposure');
    }

    if (classification === 'Powered Mobile Equipment') {
      probableConsequences.add('struck-by injury');
      probableConsequences.add('caught-between injury');
    }

    const detectedSignals = [
      exposureType.size,
      inferredActivities.size,
      probableConsequences.size,
      controlFailures.size,
      operationalState.size,
      humanFactors.size,
    ].filter(Boolean).length;

    const possibleSignals = 6;

    const score = Number(
      Math.min(detectedSignals / possibleSignals, 1).toFixed(2),
    );

    let band: 'low' | 'medium' | 'high' = 'low';

    if (score >= 0.75) {
      band = 'high';
    } else if (score >= 0.4) {
      band = 'medium';
    }

    const missingSignals: string[] = [];

    if (!inferredActivities.size) {
      missingSignals.push('work activity');
    }

    if (!operationalState.size) {
      missingSignals.push('operational state');
    }

    if (!humanFactors.size) {
      missingSignals.push('human factors');
    }

    if (!controlFailures.size) {
      missingSignals.push('control failure indicators');
    }

    return {
      environment,
      exposureType: [...exposureType],
      inferredActivities: [...inferredActivities],
      probableConsequences: [...probableConsequences],
      controlFailures: [...controlFailures],
      operationalState: [...operationalState],
      humanFactors: [...humanFactors],
      reasoning,

      contextConfidence: {
        score,
        band,
        missingSignals,
      },
    };
  }
}
