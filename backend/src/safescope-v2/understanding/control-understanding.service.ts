import {
  SafeScopeControlHierarchyLevel,
  SafeScopeUnderstandingControls
} from './safescope-understanding.types';

export class ControlUnderstandingService {
  evaluate(normalizedText: string): SafeScopeUnderstandingControls {
    const existingControls: string[] = [];
    const failedControls: string[] = [];
    const missingControls: string[] = [];
    const reasons: string[] = [];

    const addMissing = (control: string, reason: string) => {
      if (!missingControls.includes(control)) missingControls.push(control);
      reasons.push(reason);
    };

    const addFailed = (control: string, reason: string) => {
      if (!failedControls.includes(control)) failedControls.push(control);
      reasons.push(reason);
    };

    const addExisting = (control: string, reason: string) => {
      if (!existingControls.includes(control)) existingControls.push(control);
      reasons.push(reason);
    };

    if (
      this.hasAny(normalizedText, [
        'missing guard',
        'guard missing',
        'guard is missing',
        'guard was missing',
        'unguarded',
        'guard removed',
        'guard is removed',
        'guard was removed',
        'removed guard',
        'no fixed guard',
        'no guard',
        'exposed nip point',
        'exposed in-running nip point',
        'in-running nip point',
        'exposed pulley',
        'exposed rotating shaft',
        'exposed shaft',
        'exposed coupling',
        'no coupling guard',
        'coupling guard is missing',
        'coupling guard missing',
        'coupling guard is removed',
        'coupling guard removed',
        'no coupling guard is installed',
        'no coupling guard installed',
        'completely missing',
        'is completely missing',
        'unbolted',
        'unbolted and removed',
        'is unbolted',
        'was unbolted',
        'taken off',
        'was taken off',
        'taken off and not replaced',
        'side guards removed',
        'side guard was taken off',
        'side guard was taken',
        'protective side guards',
        'missing its protective side guards',
        'without its protective side guards',
        'missing its cage guard',
        'cage guard',
        'missing its safety guard',
        'safety guard',
        'no safety wheel guard',
        'wheel guard',
        'missing its tongue guard',
        'tongue guard',
        'missing its spark shield',
        'spark shield',
        'without the protective interlocked guard',
        'interlocked guard',
        'not secured',
        'is not secured',
        'not bolted'
      ])
    ) {
      addMissing('guarding', 'Missing or removed guarding signal detected.');
    }

    if (this.hasAny(normalizedText, ['inadequate guard', 'damaged guard', 'guard not secured', 'cracked'])) {
      addFailed('guarding', 'Failed or inadequate guarding signal detected.');
    }

    if (this.hasAny(normalizedText, ['no lockout', 'no loto', 'missing energy control', 'not locked out'])) {
      addMissing('energy_isolation', 'Missing energy isolation signal detected.');
    }

    if (this.hasAny(normalizedText, ['blocked', 'obstructed', 'stored materials', 'blocked access'])) {
      addFailed('access_control', 'Blocked or obstructed access signal detected.');
    }

    if (
      this.hasAny(normalizedText, [
        'blocked electrical panel',
        'blocked panel',
        'blocked disconnect',
        'blocked breaker',
        'working clearance blocked',
        'clearance blocked',
        'stored materials in front',
        'materials in front of panel'
      ])
    ) {
      addFailed('electrical_working_clearance', 'Electrical working clearance or disconnect access issue detected.');
    }

    if (
      this.hasAny(normalizedText, [
        'damaged insulation',
        'exposed conductor',
        'frayed cord',
        'missing strain relief',
        'damaged cord',
        'wet location',
        'wet area'
      ])
    ) {
      addFailed('electrical_integrity', 'Electrical insulation, conductor, or wet-location integrity issue detected.');
    }

    if (this.hasAny(normalizedText, ['no protective system', 'no trench box', 'no shoring', 'no sloping', 'unprotected trench'])) {
      addMissing('excavation_protective_system', 'Missing excavation protective system signal detected.');
    }

    if (
      this.hasAny(normalizedText, [
        'unprotected edge',
        'no guardrail',
        'missing guardrail',
        'no fall protection',
        'not tied off',
        'no tie off',
        'fall exposure',
        'open edge'
      ])
    ) {
      addMissing('fall_protection_or_edge_protection', 'Missing fall protection or edge protection signal detected.');
    }

    if (this.hasAny(normalizedText, ['barrier present', 'guard installed', 'locked out', 'loto applied', 'barricaded'])) {
      addExisting('protective_control', 'Existing protective control signal detected.');
    }

    let strongestControlLevel: SafeScopeControlHierarchyLevel = 'unknown';
    if (missingControls.includes('energy_isolation')) strongestControlLevel = 'energy_isolation';
    else if (missingControls.includes('guarding') || failedControls.includes('guarding')) strongestControlLevel = 'guarding_barrier';
    else if (missingControls.includes('excavation_protective_system')) strongestControlLevel = 'engineering';
    else if (failedControls.includes('access_control')) strongestControlLevel = 'administrative';

    return {
      existingControls,
      failedControls,
      missingControls,
      strongestControlLevel,
      confidence: {
        score: reasons.length ? Math.min(0.95, 0.3 + reasons.length * 0.16) : 0.2,
        reasons: reasons.length ? reasons : ['No strong control status signal detected.']
      }
    };
  }

  private hasAny(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term));
  }
}
