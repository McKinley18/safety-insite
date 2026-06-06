import { SafeScopeEnergyType, SafeScopeUnderstandingEnergy } from './safescope-understanding.types';

export class EnergyUnderstandingService {
  evaluate(normalizedText: string): SafeScopeUnderstandingEnergy {
    const sources: SafeScopeEnergyType[] = [];
    const reasons: string[] = [];

    const add = (source: SafeScopeEnergyType, reason: string) => {
      if (!sources.includes(source)) sources.push(source);
      reasons.push(reason);
    };

    if (this.hasAny(normalizedText, ['rotating', 'tail pulley', 'head pulley', 'roller', 'belt', 'shaft', 'nip point'])) {
      add('mechanical_rotation', 'Mechanical rotation signal detected.');
    }

    if (this.hasAny(normalizedText, ['moving equipment', 'forklift', 'haul truck', 'loader', 'struck by', 'backing'])) {
      add('mobile_equipment_kinetic', 'Mobile equipment kinetic energy signal detected.');
    }

    if (this.hasAny(normalizedText, ['electrical', 'energized', 'live', 'cord', 'panel', 'disconnect', 'arc flash', 'shock'])) {
      add('electrical', 'Electrical energy signal detected.');
    }

    if (this.hasAny(normalizedText, ['trench', 'excavation', 'cave-in', 'collapse', 'vertical wall', 'soil'])) {
      add('soil_collapse', 'Soil collapse or excavation energy signal detected.');
      add('gravity', 'Gravity energy signal detected.');
    }

    if (this.hasAny(normalizedText, ['fall', 'elevated', 'platform', 'ladder', 'walking surface', 'slip', 'trip'])) {
      add('gravity', 'Gravity or fall energy signal detected.');
    }

    if (this.hasAny(normalizedText, ['fire', 'extinguisher', 'hot work', 'thermal'])) {
      add('thermal_fire', 'Thermal/fire readiness or exposure signal detected.');
    }

    if (this.hasAny(normalizedText, ['chemical', 'vapors', 'corrosive', 'dust exposure'])) {
      add('chemical', 'Chemical exposure signal detected.');
    }

    const primaryEnergySource = sources[0] || 'unknown';
    const uncontrolledEnergyLikely = this.hasAny(normalizedText, [
      'unguarded',
      'missing guard',
      'guard missing',
      'guard is missing',
      'guard was missing',
      'guard removed',
      'guard is removed',
      'guard was removed',
      'removed guard',
      'no guard',
      'no fixed guard',
      'energized',
      'running',
      'moving',
      'no lockout',
      'no loto',
      'unprotected',
      'no protective system'
    ]);

    const energyTransferPath =
      primaryEnergySource === 'mechanical_rotation'
        ? 'rotating mechanical energy can transfer through contact with exposed moving part'
        : primaryEnergySource === 'electrical'
          ? 'electrical energy can transfer through contact or arc exposure'
          : primaryEnergySource === 'soil_collapse'
            ? 'soil or material can collapse into occupied excavation'
            : primaryEnergySource === 'mobile_equipment_kinetic'
              ? 'moving equipment kinetic energy can strike pedestrian or worker'
              : primaryEnergySource === 'gravity'
                ? 'gravity can cause fall, falling material, or collapse exposure'
                : 'energy transfer path requires more evidence';

    return {
      sources: sources.length ? sources : ['unknown'],
      primaryEnergySource,
      energyTransferPath,
      uncontrolledEnergyLikely,
      confidence: {
        score: reasons.length ? Math.min(0.95, 0.3 + reasons.length * 0.15) : 0.2,
        reasons: reasons.length ? reasons : ['No strong energy source signal detected.']
      }
    };
  }

  private hasAny(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term));
  }
}
