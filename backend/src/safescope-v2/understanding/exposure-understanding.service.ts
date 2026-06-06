import {
  SafeScopeExposureFrequency,
  SafeScopeExposureProximity,
  SafeScopeUnderstandingExposure
} from './safescope-understanding.types';

export class ExposureUnderstandingService {
  evaluate(normalizedText: string): SafeScopeUnderstandingExposure {
    const reasons: string[] = [];

    let workerExposed: boolean | 'unclear' = 'unclear';
    let proximity: SafeScopeExposureProximity = 'unknown';
    let exposurePathway = 'unknown';
    let frequency: SafeScopeExposureFrequency = 'unknown';

    if (this.hasAny(normalizedText, ['employee', 'worker', 'miner', 'operator', 'pedestrian'])) {
      workerExposed = true;
      reasons.push('Worker or employee exposure language detected.');
    }

    if (this.hasAny(normalizedText, ['within reach', 'hands near', 'can contact', 'accessible', 'access to area', 'near belt', 'near pulley'])) {
      proximity = 'within_reach';
      reasons.push('Within-reach or accessible exposure signal detected.');
    } else if (this.hasAny(normalizedText, ['beside', 'next to', 'adjacent', 'walking beside'])) {
      proximity = 'adjacent';
      reasons.push('Adjacent exposure signal detected.');
    } else if (this.hasAny(normalizedText, ['near', 'nearby'])) {
      proximity = 'nearby';
      reasons.push('Nearby exposure signal detected.');
    }

    if (this.hasAny(normalizedText, ['direct contact', 'contacting', 'handling'])) {
      proximity = 'direct_contact';
      reasons.push('Direct-contact exposure signal detected.');
    }

    if (this.hasAny(normalizedText, ['frequent', 'repeated', 'routine', 'normally'])) {
      frequency = 'frequent';
      reasons.push('Frequent exposure signal detected.');
    } else if (this.hasAny(normalizedText, ['occasional', 'sometimes'])) {
      frequency = 'occasional';
      reasons.push('Occasional exposure signal detected.');
    } else if (this.hasAny(normalizedText, ['rare', 'rarely'])) {
      frequency = 'rare';
      reasons.push('Rare exposure signal detected.');
    }

    if (normalizedText.includes('nip point') || normalizedText.includes('tail pulley') || normalizedText.includes('head pulley')) {
      exposurePathway = 'worker can contact rotating conveyor component or in-running nip point';
    } else if (normalizedText.includes('electrical') || normalizedText.includes('energized') || normalizedText.includes('cord')) {
      exposurePathway = 'worker can contact electrical energy or affected electrical equipment';
    } else if (normalizedText.includes('trench') || normalizedText.includes('excavation')) {
      exposurePathway = 'worker can be exposed to excavation wall or soil collapse';
    } else if (normalizedText.includes('forklift') || normalizedText.includes('mobile equipment')) {
      exposurePathway = 'worker can be struck by moving mobile equipment';
    } else if (normalizedText.includes('walkway') || normalizedText.includes('floor') || normalizedText.includes('slip')) {
      exposurePathway = 'worker can slip, trip, or fall while using walking surface';
    }

    if (workerExposed === 'unclear') {
      reasons.push('Worker exposure is not clearly established.');
    }

    return {
      workerExposed,
      proximity,
      exposurePathway,
      frequency,
      confidence: {
        score: reasons.length ? Math.min(0.9, 0.25 + reasons.length * 0.15) : 0.2,
        reasons
      }
    };
  }

  private hasAny(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term));
  }
}
