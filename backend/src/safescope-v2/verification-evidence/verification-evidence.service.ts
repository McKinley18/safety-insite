import { Injectable } from '@nestjs/common';
import {
  VerificationEvidenceInput,
  VerificationEvidenceResult,
  VerificationEvidenceGrade,
} from './verification-evidence.types';

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

@Injectable()
export class VerificationEvidenceValidationService {
  validateVerificationEvidence(input: VerificationEvidenceInput): VerificationEvidenceResult {
    const initial = input.initialObservation || '';
    const repaired = input.repairedObservation || '';
    const photos = input.photosAvailable !== false;

    const reasons: string[] = [];
    const warnings: string[] = [];
    const remedialActionsRequired: string[] = [];
    let grade: VerificationEvidenceGrade = 'valid';

    const normInitial = initial.toLowerCase().trim();
    const normRepaired = repaired.toLowerCase().trim();

    // Rule 1: Minimal length check for repair text
    if (normRepaired.length < 10 || includesAny(normRepaired, ['fixed', 'done', 'repaired', 'ok', 'okay', 'yes', 'no']) && normRepaired.split(' ').length < 3) {
      grade = 'insufficient';
      reasons.push('The repaired state description is too brief or lacks descriptive detail.');
      remedialActionsRequired.push('Provide a detailed description of what corrective action was taken.');
    }

    // Rule 2: Explicit failure or negation check
    if (
      includesAny(normRepaired, [
        'unable to fix',
        'could not repair',
        'remains unguarded',
        'still live',
        'still energized',
        'still leaking',
        'no guard is here',
        'remains exposed',
        'failed to isolate',
        'cannot lock out',
      ])
    ) {
      grade = 'contradictory';
      reasons.push('The repaired state description explicitly states or implies that the hazard remains uncorrected.');
      remedialActionsRequired.push('Verify if the corrective action was successfully completed before attempting verification.');
    }

    // Rule 3: Guarding/LOTO specific matches
    const isGuardingHazard = includesAny(normInitial, ['unguarded', 'nip point', 'pinch point', 'pulley', 'belt', 'shaft', 'gear', 'chain', 'rotating']);
    const isGuardingRepair = includesAny(normRepaired, ['guard installed', 'guard in place', 'safely guarded', 'shield installed', 'barrier erected', 'properly guarded', 'guard bolted']);

    if (isGuardingHazard && !isGuardingRepair && grade === 'valid') {
      grade = 'insufficient';
      reasons.push('Guarding hazard was initially reported, but the repair text does not confirm a guard was installed or secured.');
      remedialActionsRequired.push('Confirm in the repair description that guards are properly installed and secured.');
    }

    const isLotoHazard = includesAny(normInitial, ['lockout', 'loto', 'not locked out', 'energized panel', 'exposed wire', 'damaged cord', 'live wires']);
    const isLotoRepair = includesAny(normRepaired, ['locked out', 'isolated', 'loto applied', 'power disconnected', 'de-energized', 'power shut off', 'cord replaced', 're-insulated']);

    if (isLotoHazard && !isLotoRepair && grade === 'valid') {
      grade = 'insufficient';
      reasons.push('Electrical or energy-isolation hazard was initially reported, but repair text does not confirm isolation or LOTO.');
      remedialActionsRequired.push('Confirm in the repair description that LOTO was applied or the energy source was safely isolated.');
    }

    // Rule 4: Visual safety checks and photos
    if (!photos && (isGuardingHazard || includesAny(normInitial, ['open edge', 'fall protection', 'scaffold', 'ladder']))) {
      warnings.push('Physical visual hazard verified without supporting photo evidence.');
    }

    const isVerificationValid = grade === 'valid';

    return {
      grade,
      isVerificationValid,
      reasons,
      warnings,
      remedialActionsRequired,
      advisoryBoundary: 'SafeScope verification evidence analysis is advisory and requires final safety professional sign-off.',
    };
  }
}
