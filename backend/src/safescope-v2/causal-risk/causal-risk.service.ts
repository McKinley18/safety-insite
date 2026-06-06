import { SafeScopeCausalRiskOutput } from './causal-risk.types';

type CausalRiskInput = {
  observationUnderstanding?: any;
  fusedText?: string;
};

function normalized(value: unknown): string {
  return String(value ?? '').toLowerCase().replace(/[_/().,;:]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function firstKnown(...values: unknown[]): string {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text && text !== 'unknown' && text !== 'undefined' && text !== 'null') return text;
  }
  return 'unknown';
}

export class CausalRiskService {
  evaluate(input: CausalRiskInput): SafeScopeCausalRiskOutput {
    const u = input.observationUnderstanding ?? {};
    const text = normalized(`${input.fusedText ?? ''} ${u.rawText ?? ''} ${u.normalizedText ?? ''}`);

    const topScenario = u.scenarioUnderstanding?.topScenario;
    const topMechanism = u.mechanismCandidates?.[0];

    const structuredMechanism = firstKnown(
      topScenario?.mechanism,
      topMechanism?.mechanism
    );

    const mechanismOfInjury = this.inferMechanism(text, structuredMechanism);
    const primaryEnergySource = this.inferEnergySource(text, u, mechanismOfInjury);
    const energyTransferPath = this.inferEnergyTransferPath(mechanismOfInjury, primaryEnergySource);
    const exposedTarget = this.inferExposedTarget(text, u);
    const initiatingCondition = this.inferInitiatingCondition(text, u, mechanismOfInjury);
    const failedOrMissingControl = this.inferFailedOrMissingControl(text, u, mechanismOfInjury);
    const credibleWorstCase = this.inferCredibleWorstCase(mechanismOfInjury);
    const competingMechanisms = this.inferCompetingMechanisms(mechanismOfInjury, text);
    const missingEvidence = this.inferMissingEvidence(text, u, mechanismOfInjury);

    const confidence = this.inferConfidence({
      mechanismOfInjury,
      primaryEnergySource,
      exposedTarget,
      failedOrMissingControl,
      missingEvidence,
      topScenarioConfidence: Number(topScenario?.confidence ?? 0),
      topMechanismConfidence: Number(topMechanism?.confidence ?? 0),
      text,
    });

    return {
      engine: 'safescope_causal_risk_reasoning',
      version: '0.1.0',
      primaryEnergySource,
      energyTransferPath,
      exposedTarget,
      initiatingCondition,
      failedOrMissingControl,
      mechanismOfInjury,
      credibleWorstCase,
      competingMechanisms,
      missingEvidence,
      confidence,
      reasoningTrace: [
        'Read structured observation understanding when available.',
        `Identified primary energy source: ${primaryEnergySource}.`,
        `Mapped likely energy-transfer path: ${energyTransferPath}.`,
        `Identified exposed target: ${exposedTarget}.`,
        `Identified initiating condition: ${initiatingCondition}.`,
        `Identified failed or missing control: ${failedOrMissingControl}.`,
        `Selected mechanism of injury: ${mechanismOfInjury}.`,
        `Estimated credible worst case: ${credibleWorstCase}.`,
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

  async analyzeCausalRisk(observationUnderstanding: any, fusedText: string): Promise<SafeScopeCausalRiskOutput> {
    return this.evaluate({ observationUnderstanding, fusedText });
  }

  private inferMechanism(text: string, structuredMechanism: string): string {
    if (structuredMechanism !== 'unknown') return structuredMechanism;

    if (includesAny(text, ['not locked out', 'lockout', 'energy isolation', 'start unexpectedly', 'unexpected startup'])) {
      return 'unexpected_startup';
    }

    if (includesAny(text, ['floor hole', 'roof edge', 'unprotected edge', 'lower level', 'fall exposure'])) {
      return 'fall_from_height';
    }

    if (includesAny(text, ['confined space', 'tank', 'limited ventilation', 'atmospheric test', 'rescue plan'])) {
      return 'atmospheric_hazard_engulfment_or_entrapment';
    }

    if (includesAny(text, ['suspended load', 'hoisted load', 'crane lift', 'stands below', 'load path'])) {
      return 'struck_by_falling_suspended_load';
    }

    if (includesAny(text, ['unlabeled chemical', 'chemical container', 'sds', 'hazard label', 'hazcom'])) {
      return 'chemical_exposure_unknown_agent';
    }

    if (includesAny(text, ['compressed air hose', 'pressurized hose', 'hose coupling', 'whipping'])) {
      return 'struck_by_whipping_pressurized_line';
    }

    if (includesAny(text, ['tail pulley', 'head pulley', 'nip point', 'moving conveyor', 'rotating equipment'])) {
      return 'rotating_equipment_nip_point';
    }

    if (includesAny(text, ['damaged cord', 'electrical shock', 'exposed conductor', 'energized panel'])) {
      return 'electrical_shock';
    }

    if (includesAny(text, ['forklift', 'loader', 'haul truck', 'pedestrian', 'blind spot'])) {
      return 'struck_by_mobile_equipment';
    }

    if (includesAny(text, ['walkway', 'slip', 'trip', 'spill', 'wet floor'])) {
      return 'slip_trip_fall_same_level';
    }

    if (includesAny(text, ['fire extinguisher', 'blocked extinguisher', 'emergency access'])) {
      return 'delayed_emergency_response';
    }

    if (includesAny(text, ['trench', 'excavation', 'cave in', 'protective system'])) {
      return 'caught_in_cave_in';
    }

    return 'unknown';
  }

  private inferEnergySource(text: string, u: any, mechanism: string): string {
    const structured = firstKnown(u.energy?.primaryEnergySource);
    if (structured !== 'unknown') return structured;

    if (mechanism.includes('fall') || mechanism.includes('suspended') || mechanism.includes('cave_in')) return 'gravity';
    if (mechanism.includes('unexpected_startup') || mechanism.includes('rotating_equipment')) return 'mechanical_motion';
    if (mechanism.includes('electrical')) return 'electrical';
    if (mechanism.includes('mobile_equipment')) return 'mobile_equipment_kinetic';
    if (mechanism.includes('chemical')) return 'chemical';
    if (mechanism.includes('atmospheric')) return 'atmospheric_hazard';
    if (mechanism.includes('pressurized')) return 'stored_pressure';
    if (mechanism.includes('delayed_emergency')) return 'emergency_response_time';
    if (includesAny(text, ['stored energy', 'pressurized', 'compressed air'])) return 'stored_energy';
    return 'unknown';
  }

  private inferEnergyTransferPath(mechanism: string, energy: string): string {
    if (mechanism === 'fall_from_height') return 'gravity-driven fall to lower level';
    if (mechanism === 'unexpected_startup') return 'unexpected release of hazardous energy during servicing';
    if (mechanism === 'rotating_equipment_nip_point') return 'body part drawn into rotating nip point or moving machine part';
    if (mechanism === 'electrical_shock') return 'electrical current through worker contact path';
    if (mechanism === 'struck_by_mobile_equipment') return 'kinetic energy transfer from moving equipment to worker';
    if (mechanism === 'struck_by_falling_suspended_load') return 'gravity/kinetic energy transfer from falling or swinging suspended load';
    if (mechanism === 'atmospheric_hazard_engulfment_or_entrapment') return 'hazardous atmosphere, engulfment, or entrapment during entry';
    if (mechanism === 'chemical_exposure_unknown_agent') return 'unknown chemical exposure through contact, inhalation, or ingestion pathway';
    if (mechanism === 'struck_by_whipping_pressurized_line') return 'stored pressure release causing hose whip or line-of-fire impact';
    if (mechanism === 'slip_trip_fall_same_level') return 'loss of footing or balance on walking-working surface';
    if (mechanism === 'delayed_emergency_response') return 'delayed access to emergency equipment or egress during event';
    if (mechanism === 'caught_in_cave_in') return 'soil or material collapse onto exposed worker';
    return energy === 'unknown' ? 'unknown' : `uncontrolled ${energy} transfer to exposed worker`;
  }

  private inferExposedTarget(text: string, u: any): string {
    if (u.exposure?.workerExposed === true) return 'worker_or_employee';
    if (includesAny(text, ['employee', 'worker', 'mechanic', 'pedestrian', 'employees'])) return 'worker_or_employee';
    if (includesAny(text, ['nearby', 'below', 'stands below', 'handling', 'working near'])) return 'worker_or_employee';
    return 'unknown';
  }

  private inferInitiatingCondition(text: string, u: any, mechanism: string): string {
    const controls = [
      ...(u.controls?.missingControls ?? []),
      ...(u.controls?.failedControls ?? []),
    ].join(', ');

    if (controls) return controls;
    if (mechanism === 'unexpected_startup') return 'servicing without verified energy isolation';
    if (mechanism === 'fall_from_height') return 'unprotected edge, opening, ladder, or lower-level fall exposure';
    if (mechanism === 'atmospheric_hazard_engulfment_or_entrapment') return 'entry preparation without complete permit-space controls';
    if (mechanism === 'struck_by_falling_suspended_load') return 'worker positioned in suspended-load line of fire';
    if (mechanism === 'chemical_exposure_unknown_agent') return 'chemical identity or hazard communication not available';
    if (mechanism === 'struck_by_whipping_pressurized_line') return 'damaged pressurized hose or coupling failure potential';
    if (text) return 'unsafe condition described in observation';
    return 'unknown';
  }

  private inferFailedOrMissingControl(text: string, u: any, mechanism: string): string {
    const controls = [
      ...(u.controls?.missingControls ?? []),
      ...(u.controls?.failedControls ?? []),
    ].filter(Boolean);

    if (controls.length) return Array.from(new Set(controls)).join(', ');

    if (mechanism === 'unexpected_startup') return 'energy isolation / lockout-tagout';
    if (mechanism === 'fall_from_height') return 'fall protection, cover, guardrail, or barricade';
    if (mechanism === 'atmospheric_hazard_engulfment_or_entrapment') return 'atmospheric test, permit, attendant, ventilation, or rescue plan';
    if (mechanism === 'struck_by_falling_suspended_load') return 'exclusion zone, rigging inspection, or load-path control';
    if (mechanism === 'chemical_exposure_unknown_agent') return 'container label and SDS availability';
    if (mechanism === 'struck_by_whipping_pressurized_line') return 'hose/coupling integrity and pressure isolation';
    if (mechanism === 'rotating_equipment_nip_point') return 'machine guarding';
    if (mechanism === 'electrical_shock') return 'electrical equipment condition or isolation';
    if (mechanism === 'struck_by_mobile_equipment') return 'pedestrian separation / traffic control';
    if (mechanism === 'slip_trip_fall_same_level') return 'walking-working surface condition / housekeeping';
    if (mechanism === 'delayed_emergency_response') return 'emergency equipment access or readiness';
    if (mechanism === 'caught_in_cave_in') return 'excavation protective system';
    return 'unknown';
  }

  private inferCredibleWorstCase(mechanism: string): string {
    const outcomes: Record<string, string> = {
      fall_from_height: 'serious injury or fatality from fall to lower level',
      unexpected_startup: 'amputation, crushing injury, entanglement, or fatality from unexpected hazardous energy release',
      rotating_equipment_nip_point: 'amputation, entanglement, crushing injury, or fatality',
      electrical_shock: 'shock, burn, arc-flash injury, or fatality',
      struck_by_mobile_equipment: 'crushing injury or fatality from mobile equipment impact',
      struck_by_falling_suspended_load: 'fatal crushing or struck-by injury from falling or shifting load',
      atmospheric_hazard_engulfment_or_entrapment: 'asphyxiation, toxic exposure, engulfment, entrapment, or fatality',
      chemical_exposure_unknown_agent: 'chemical burn, toxic exposure, sensitization, fire/explosion exposure, or unknown health effect',
      struck_by_whipping_pressurized_line: 'serious struck-by injury, injection injury, or eye/face trauma from pressure release',
      slip_trip_fall_same_level: 'sprain, fracture, head injury, or same-level fall injury',
      delayed_emergency_response: 'worsened injury or loss escalation due to delayed emergency response',
      caught_in_cave_in: 'fatal crushing or asphyxiation from cave-in',
    };

    return outcomes[mechanism] ?? 'unknown';
  }

  private inferCompetingMechanisms(mechanism: string, text: string): string[] {
    const map: Record<string, string[]> = {
      fall_from_height: ['slip_trip_fall_same_level', 'struck_by_falling_object'],
      unexpected_startup: ['rotating_equipment_nip_point', 'stored_energy_release', 'crush_point'],
      rotating_equipment_nip_point: ['unexpected_startup', 'rotating_equipment_entanglement', 'pinch_point'],
      electrical_shock: ['arc_flash', 'thermal_burn'],
      struck_by_mobile_equipment: ['caught_between_mobile_equipment', 'runover'],
      struck_by_falling_suspended_load: ['rigging_failure', 'dropped_load', 'crane_contact'],
      atmospheric_hazard_engulfment_or_entrapment: ['asphyxiation', 'toxic_atmosphere', 'engulfment'],
      chemical_exposure_unknown_agent: ['chemical_burn', 'inhalation_exposure', 'fire_explosion'],
      struck_by_whipping_pressurized_line: ['stored_energy_release', 'fluid_injection', 'spray_contact'],
      slip_trip_fall_same_level: ['fall_from_height'],
      delayed_emergency_response: ['fire_spread', 'egress_delay'],
      caught_in_cave_in: ['struck_by_falling_material', 'engulfment'],
    };

    return map[mechanism] ?? (text ? ['unknown_secondary_mechanism'] : []);
  }

  private inferMissingEvidence(text: string, u: any, mechanism: string): string[] {
    const missing: string[] = [];

    if (firstKnown(u.energy?.primaryEnergySource) === 'unknown' && mechanism === 'unknown') {
      missing.push('primary energy source');
    }

    if (this.inferExposedTarget(text, u) === 'unknown') {
      missing.push('worker exposure');
    }

    if (this.inferFailedOrMissingControl(text, u, mechanism) === 'unknown') {
      missing.push('failed or missing control');
    }

    if (mechanism === 'unknown') {
      missing.push('mechanism of injury');
    }

    if (firstKnown(u.jurisdiction?.detected) === 'unknown') {
      missing.push('jurisdiction');
    }

    return Array.from(new Set(missing));
  }

  private inferConfidence(input: {
    mechanismOfInjury: string;
    primaryEnergySource: string;
    exposedTarget: string;
    failedOrMissingControl: string;
    missingEvidence: string[];
    topScenarioConfidence: number;
    topMechanismConfidence: number;
    text: string;
  }): SafeScopeCausalRiskOutput['confidence'] {
    let score = 0.2;
    const reasons: string[] = [];

    if (input.mechanismOfInjury !== 'unknown') {
      score += 0.25;
      reasons.push('Mechanism of injury was identified.');
    }

    if (input.primaryEnergySource !== 'unknown') {
      score += 0.15;
      reasons.push('Primary energy source was identified.');
    }

    if (input.exposedTarget !== 'unknown') {
      score += 0.15;
      reasons.push('Worker or employee exposure was identified.');
    }

    if (input.failedOrMissingControl !== 'unknown') {
      score += 0.15;
      reasons.push('Failed or missing control was identified.');
    }

    if (input.topScenarioConfidence >= 0.55 || input.topMechanismConfidence >= 0.7) {
      score += 0.1;
      reasons.push('Structured understanding provided supporting confidence.');
    }

    score -= Math.min(0.3, input.missingEvidence.length * 0.08);
    score = Math.max(0, Math.min(0.95, Number(score.toFixed(2))));

    const level =
      score >= 0.78 ? 'high' :
      score >= 0.58 ? 'moderate' :
      score >= 0.35 ? 'low' :
      'insufficient';

    if (!reasons.length) reasons.push('Available facts are not enough for a reliable causal-risk explanation.');
    if (input.missingEvidence.length) reasons.push(`Missing evidence: ${input.missingEvidence.join(', ')}.`);

    return { level, score, reasons };
  }
}
