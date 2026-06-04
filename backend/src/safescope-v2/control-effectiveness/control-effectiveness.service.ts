import {
  SafeScopeControlEffectivenessInput,
  SafeScopeControlEffectivenessOutput,
  SafeScopeControlEffectivenessRating,
} from './control-effectiveness.types';

function clean(value: any): string {
  return String(value || '').trim();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(clean).filter(Boolean)));
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

export class SafeScopeControlEffectivenessService {
  evaluate(input: SafeScopeControlEffectivenessInput): SafeScopeControlEffectivenessOutput {
    const classification = clean(input.classification) || 'Unclassified';
    const observationText = clean(input.observationText);
    const actions = Array.isArray(input.correctiveActions) ? input.correctiveActions : [];

    const actionText = actions
      .map((action) =>
        [
          action?.title,
          action?.description,
          ...(Array.isArray(action?.steps) ? action.steps : []),
          ...(Array.isArray(action?.verificationEvidence) ? action.verificationEvidence : []),
          ...(Array.isArray(action?.suggestedFixes) ? action.suggestedFixes : []),
        ]
          .map(clean)
          .filter(Boolean)
          .join(' '),
      )
      .join(' ');

    const existingText = (input.existingControls || []).join(' ');
    const proposedText = (input.proposedControls || []).join(' ');
    const combined = `${classification} ${observationText} ${existingText} ${proposedText} ${actionText}`.toLowerCase();

    const mechanism = input.mechanismIntelligence || {};
    const evidence = input.evidenceSufficiency || {};
    const actionQuality = input.actionQuality || {};
    const causalChain = input.causalChain || {};

    const controlsIdentified: string[] = [];
    const controlsMissing: string[] = [];
    const pathwayInterruptions: string[] = [];
    const remainingExposurePathways: string[] = [];
    const hierarchyAssessment: string[] = [];
    const interimControlsNeeded: string[] = [];
    const verificationNeeded: string[] = [];
    const recurrencePreventionNotes: string[] = [];
    const closureReadinessBlockers: string[] = [];

    if (includesAny(combined, ['eliminate', 'remove hazard', 'substitute', 'redesign'])) {
      controlsIdentified.push('Elimination/substitution or redesign control identified.');
      pathwayInterruptions.push('Hazard source may be removed or materially reduced.');
      hierarchyAssessment.push('Higher-order control identified: elimination/substitution/redesign.');
    }

    if (includesAny(combined, ['guard', 'interlock', 'barrier', 'isolate', 'lockout', 'tagout', 'ventilation', 'enclosure', 'wet method', 'physical separation'])) {
      controlsIdentified.push('Engineering or isolation control identified.');
      pathwayInterruptions.push('Control may interrupt employee contact, energy transfer, or exposure pathway.');
      hierarchyAssessment.push('Higher-order control identified: engineering/isolation.');
    }

    if (includesAny(combined, ['procedure', 'training', 'sign', 'policy', 'inspection', 'rotation', 'administrative'])) {
      controlsIdentified.push('Administrative control identified.');
      hierarchyAssessment.push('Administrative controls may support implementation but should not be the only control for serious hazards.');
    }

    if (includesAny(combined, ['ppe', 'glove', 'respirator', 'hearing protection', 'goggles', 'face shield'])) {
      controlsIdentified.push('PPE control identified.');
      hierarchyAssessment.push('PPE is a last line of defense and does not eliminate the hazard source.');
    }

    if (!controlsIdentified.length) {
      controlsMissing.push('No clear control is documented.');
      closureReadinessBlockers.push('Closure cannot be supported without documented controls.');
    }

    const highRisk =
      input.risk?.riskBand === 'High' ||
      input.risk?.riskBand === 'Critical' ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    if (highRisk && !includesAny(combined, ['stop', 'shutdown', 'barricade', 'isolate', 'lockout', 'remove from service', 'keep employees out'])) {
      interimControlsNeeded.push('High-risk condition needs immediate interim protection such as stop-work, shutdown, barricading, isolation, or employee exclusion.');
      closureReadinessBlockers.push('High-risk exposure remains insufficiently controlled until interim protection is documented.');
    }

    if (includesAny(classification, ['machine', 'guarding']) && !includesAny(combined, ['guard', 'interlock', 'barrier', 'lockout', 'tagout', 'isolate'])) {
      controlsMissing.push('Machine-guarding hazard lacks documented guarding, interlock, isolation, or lockout/tagout control.');
      remainingExposurePathways.push('Employee contact with moving parts may remain possible.');
    }

    if (includesAny(classification, ['electrical']) && !includesAny(combined, ['de-energize', 'deenergize', 'cover', 'qualified', 'disconnect', 'lockout', 'test before touch'])) {
      controlsMissing.push('Electrical hazard lacks documented de-energization, enclosure, access restriction, or qualified-person control.');
      remainingExposurePathways.push('Electrical contact or arc-flash pathway may remain uncontrolled.');
    }

    if (includesAny(classification, ['fall']) && !includesAny(combined, ['guardrail', 'cover', 'anchor', 'tie off', 'travel restraint', 'platform', 'scaffold'])) {
      controlsMissing.push('Fall hazard lacks documented guardrail, cover, platform, restraint, anchor, or access control.');
      remainingExposurePathways.push('Fall-to-lower-level pathway may remain uncontrolled.');
    }

    if (includesAny(classification, ['silica', 'dust', 'welding', 'chemical', 'noise', 'heat']) && !includesAny(combined, ['ventilation', 'wet method', 'enclosure', 'sampling', 'monitoring', 'substitution', 'respirator', 'hearing protection', 'work rest'])) {
      controlsMissing.push('Health exposure hazard lacks documented source control, exposure assessment, monitoring, or verified PPE/program control.');
      remainingExposurePathways.push('Exposure route may remain uncontrolled or unverified.');
    }

    if (!includesAny(combined, ['verify', 'verification', 'photo', 'measurement', 'sample', 'monitoring', 'supervisor', 'inspect', 'test'])) {
      verificationNeeded.push('Verification evidence is needed before closure.');
      closureReadinessBlockers.push('Closure should remain blocked until control effectiveness is verified.');
    }

    if (Array.isArray(evidence.closureReadinessBlockers)) {
      closureReadinessBlockers.push(...evidence.closureReadinessBlockers);
    }

    if (Array.isArray(actionQuality.closureBlockers)) {
      closureReadinessBlockers.push(...actionQuality.closureBlockers);
    }

    if (Array.isArray(causalChain.criticalBreakPoints)) {
      for (const breakPoint of causalChain.criticalBreakPoints) {
        if (!includesAny(combined, breakPoint.toLowerCase().split(/\W+/).filter((word: string) => word.length > 4))) {
          remainingExposurePathways.push(`Causal-chain break point may not be fully addressed: ${breakPoint}`);
        }
      }
    }

    recurrencePreventionNotes.push(
      'Verify the control remains effective after implementation and is not dependent only on worker memory or PPE.',
      'Use inspection follow-up, supervisor verification, and recurrence tracking to confirm the hazard does not reappear.',
    );

    const effectivenessRating = this.getRating({
      controlsCount: controlsIdentified.length,
      missingCount: controlsMissing.length,
      remainingPathwayCount: remainingExposurePathways.length,
      interimCount: interimControlsNeeded.length,
      verificationCount: verificationNeeded.length,
      closureBlockerCount: closureReadinessBlockers.length,
      highRisk,
    });

    return {
      engine: 'safescope_control_effectiveness',
      mode: 'deterministic_offline',
      classification,
      effectivenessRating,
      controlsIdentified: unique(controlsIdentified),
      controlsMissing: unique(controlsMissing),
      pathwayInterruptions: unique(pathwayInterruptions),
      remainingExposurePathways: unique(remainingExposurePathways),
      hierarchyAssessment: unique(hierarchyAssessment),
      interimControlsNeeded: unique(interimControlsNeeded),
      verificationNeeded: unique(verificationNeeded),
      recurrencePreventionNotes: unique(recurrencePreventionNotes),
      closureReadinessBlockers: unique(closureReadinessBlockers),
      requiresQualifiedReview:
        Boolean(highRisk) ||
        effectivenessRating !== 'effective' ||
        Boolean(closureReadinessBlockers.length) ||
        Boolean(input.causalChain?.requiresQualifiedReview),
      canAssumeControlEffectiveness: false,
      canCloseWithoutVerification: false,
      canReduceHumanReview: false,
      sourceBoundary:
        'SafeScope control effectiveness intelligence evaluates whether controls plausibly interrupt the hazard, energy, exposure, and recurrence pathways. It cannot assume effectiveness, bypass verification, reduce qualified review, or finalize closure without evidence.',
    };
  }

  private getRating(input: {
    controlsCount: number;
    missingCount: number;
    remainingPathwayCount: number;
    interimCount: number;
    verificationCount: number;
    closureBlockerCount: number;
    highRisk: boolean;
  }): SafeScopeControlEffectivenessRating {
    if (!input.controlsCount) return 'insufficient_information';
    if (input.missingCount >= 2 || input.remainingPathwayCount >= 3) return 'ineffective';
    if (input.closureBlockerCount >= 2 || input.interimCount) return 'interim_only';
    if (input.missingCount || input.remainingPathwayCount || input.verificationCount) return 'partially_effective';
    if (input.highRisk && input.closureBlockerCount) return 'interim_only';
    return 'effective';
  }
}
