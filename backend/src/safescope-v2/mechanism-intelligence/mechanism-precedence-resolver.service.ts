import {
  SafeScopeMechanismPrecedenceInput,
  SafeScopeMechanismPrecedenceResult,
} from './mechanism-precedence-resolver.types';

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

export class SafeScopeMechanismPrecedenceResolverService {
  resolve(input: SafeScopeMechanismPrecedenceInput): SafeScopeMechanismPrecedenceResult {
    const text = normalized([
      input.normalizedText,
      input.siteType,
      input.industryContext,
      input.taskContext,
      input.equipmentInvolved,
    ].join(' '));

    const reasonCodes: string[] = [];

    /*
     * Forklift / pedestrian interactions must outrank walking-surface
     * or slip/trip mechanisms because the dominant injury mechanism is
     * pedestrian strike/crush exposure from mobile equipment.
     */
    if (
      input.hazardDomain === 'mobile_equipment' &&
      includesAny(text, ['forklift', 'powered industrial truck', 'industrial truck']) &&
      includesAny(text, ['pedestrian', 'pedestrians', 'employee walking', 'walking employee', 'foot traffic'])
    ) {
      reasonCodes.push('forklift-pedestrian-mobile-equipment-precedence');
      return {
        mechanismId: 'pedestrian_strike',
        reasonCodes,
        confidenceImpact: 'increase',
        humanReviewRecommended: true,
      };
    }

    /*
     * Escapeway / emergency egress obstructions must outrank generic
     * housekeeping, storage, or unexpected-startup interpretations.
     */
    if (
      input.hazardDomain === 'emergency_preparedness' &&
      includesAny(text, ['escapeway', 'escape way', 'egress', 'emergency route', 'exit route', 'lifeline']) &&
      includesAny(text, ['blocked', 'obstructed', 'obstruction', 'stored material', 'storage', 'impassable'])
    ) {
      reasonCodes.push('emergency-egress-obstruction-precedence');
      return {
        mechanismId: 'egress_blockage',
        reasonCodes,
        confidenceImpact: 'increase',
        humanReviewRecommended: true,
      };
    }

    /*
     * Damaged electrical cable/conductor findings need an arc-flash/shock
     * mechanism, not a blank or generic electrical mechanism.
     */
    if (
      input.hazardDomain === 'electrical' &&
      includesAny(text, [
        'damaged electrical cable',
        'damaged cable',
        'power cable',
        'trailing cable',
        'damaged conductor',
        'damaged conductors',
        'exposed conductor',
        'exposed conductors',
        'bare conductor',
        'energized conductor',
        'energized conductors',
        'arc flash',
        'shock',
      ])
    ) {
      reasonCodes.push('damaged-conductor-shock-arc-flash-precedence');
      return {
        mechanismId: 'shock_arc_flash',
        reasonCodes,
        confidenceImpact: 'increase',
        humanReviewRecommended: true,
      };
    }

    /*
     * Underground metal/nonmetal conveyor guarding must use the 57-series
     * MSHA scope. Keep this narrow so it does not break the generic
     * rotating-machinery archetype fallback contract.
     */
    if (
      input.jurisdiction === 'msha' &&
      input.hazardDomain === 'machine_guarding' &&
      includesAny(text, ['underground', 'underground mnm', 'underground metal', 'underground metal/nonmetal']) &&
      includesAny(text, ['conveyor', 'tail pulley', 'head pulley', 'return roller', 'rotating component']) &&
      includesAny(text, ['guard', 'guarding', 'unguarded', 'exposed'])
    ) {
      reasonCodes.push('underground-mnm-conveyor-guarding-scope-precedence');
      return {
        mechanismId: 'rotating_equipment',
        primaryCitationOverride: '30 CFR 57.14107',
        reasonCodes,
        confidenceImpact: 'increase',
        humanReviewRecommended: true,
      };
    }

    return {
      mechanismId: input.currentMechanismId,
      reasonCodes,
      confidenceImpact: 'none',
      humanReviewRecommended: false,
    };
  }
}
