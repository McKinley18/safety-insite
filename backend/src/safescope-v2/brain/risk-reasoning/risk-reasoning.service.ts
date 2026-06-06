import { RiskReasoning } from './risk-reasoning.types';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';

type SeverityEstimate = RiskReasoning['severityEstimate'];
type LikelihoodEstimate = RiskReasoning['likelihoodEstimate'];
type RiskLevel = RiskReasoning['initialRiskLevel'];
type UrgencyLevel = RiskReasoning['urgencyLevel'];

export class RiskReasoningBrainService {
  evaluate(
    scenarioIntelligence: ScenarioIntelligence,
    evidenceGaps: string[]
  ): RiskReasoning {
    const severity = this.inferSeverity(scenarioIntelligence);
    const likelihood = this.inferLikelihood(scenarioIntelligence, evidenceGaps);
    const riskLevel = this.calculateRisk(severity, likelihood);

    const riskDrivers = this.buildRiskDrivers(scenarioIntelligence, severity, likelihood);
    const missingOrFailedControls = scenarioIntelligence.missingOrFailedControls || [];

    return {
      riskReasoningId: `risk-${Date.now()}`,
      scenarioFamilyId: scenarioIntelligence.scenarioFamilyId,
      hazardDomain: scenarioIntelligence.hazardCategory || 'unknown',
      mechanismOfInjury: scenarioIntelligence.mechanismOfInjury,
      credibleWorstCaseOutcome: this.credibleWorstCaseOutcome(scenarioIntelligence, severity),
      severityEstimate: severity,
      likelihoodEstimate: likelihood,
      exposureFrequency: this.inferExposureFrequency(scenarioIntelligence, likelihood),
      exposureDuration: 'unknown',
      exposedPopulation: this.inferExposedPopulation(scenarioIntelligence),
      energySourceSeverity: this.energySeverity(severity),
      controlFailureSeverity: this.controlFailureSeverity(scenarioIntelligence),
      existingControls: [],
      missingOrFailedControls,
      uncertaintyFactors: evidenceGaps,
      evidenceGaps,
      initialRiskLevel: riskLevel,
      residualRiskLevel: 'low',
      riskDrivers,
      riskReducers: this.buildRiskReducers(scenarioIntelligence),
      urgencyLevel: this.urgencyForRisk(riskLevel),
      suggestedDueDateLogic: this.dueDateLogic(riskLevel),
      verificationRequirements: this.verificationRequirements(scenarioIntelligence),
      confidence: scenarioIntelligence.confidenceSignals.score,
      humanReviewTriggers: this.humanReviewTriggers(riskLevel, evidenceGaps),
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      }
    };
  }

  private inferSeverity(intelligence: ScenarioIntelligence): SeverityEstimate {
    const scenario = intelligence.scenarioFamilyId || '';
    const mechanism = intelligence.mechanismOfInjury || '';
    const combined = `${scenario} ${mechanism} ${intelligence.energySource || ''}`.toLowerCase();

    if (scenario.includes('excavation_protective_system') || mechanism.includes('caught_in_cave_in')) {
      return 'critical';
    }

    if (scenario.includes('electrical_panel_access')) {
      return 'moderate';
    }

    if (
      scenario.includes('conveyor_cleanup') ||
      scenario.includes('unguarded_conveyor_pulley') ||
      scenario.includes('rotating_shaft_guarding') ||
      scenario.includes('point_of_operation_guarding') ||
      mechanism.includes('rotating_equipment') ||
      mechanism.includes('cut_amputation') ||
      mechanism.includes('struck_by_mobile_equipment') ||
      mechanism.includes('electrical_shock')
    ) {
      return 'high';
    }

    if (
      combined.includes('fall_from_height') ||
      combined.includes('fall_protection') ||
      combined.includes('arc_flash')
    ) {
      return 'high';
    }

    return 'moderate';
  }

  private inferLikelihood(
    intelligence: ScenarioIntelligence,
    evidenceGaps: string[]
  ): LikelihoodEstimate {
    const scenario = intelligence.scenarioFamilyId || '';
    const text = [
      intelligence.exposedPersonActivity,
      intelligence.unsafeCondition,
      intelligence.operationalState,
      intelligence.task,
      intelligence.equipment,
      ...(intelligence.missingOrFailedControls || []),
      ...(evidenceGaps || [])
    ].join(' ').toLowerCase();

    if (
      scenario.includes('conveyor_cleanup') ||
      text.includes('cleanup') ||
      text.includes('within reach') ||
      text.includes('hands') ||
      text.includes('handling') ||
      text.includes('employee_operating_equipment') ||
      text.includes('employee_performing_cleanup') ||
      text.includes('employee_working_inside_excavation')
    ) {
      return 'likely';
    }

    if (
      scenario.includes('unguarded_conveyor_pulley') ||
      scenario.includes('rotating_shaft_guarding') ||
      scenario.includes('mobile_equipment_pedestrian_interaction') ||
      text.includes('travelway') ||
      text.includes('pedestrian') ||
      text.includes('walk') ||
      text.includes('accessible') ||
      text.includes('nearby') ||
      text.includes('beside')
    ) {
      return 'possible';
    }

    return 'possible';
  }

  private calculateRisk(severity: SeverityEstimate, likelihood: LikelihoodEstimate): RiskLevel {
    if (severity === 'critical' && ['likely', 'frequent'].includes(likelihood)) return 'critical';
    if (severity === 'critical') return 'critical';

    if (severity === 'high' && ['likely', 'frequent'].includes(likelihood)) return 'high';
    if (severity === 'high' && likelihood === 'possible') return 'high';

    if (severity === 'serious' && ['likely', 'frequent'].includes(likelihood)) return 'high';
    if (severity === 'serious') return 'moderate';

    if (severity === 'moderate' && ['likely', 'frequent'].includes(likelihood)) return 'moderate';
    if (severity === 'moderate') return 'moderate';

    return 'low';
  }

  private credibleWorstCaseOutcome(
    intelligence: ScenarioIntelligence,
    severity: SeverityEstimate
  ): string {
    const mechanism = intelligence.mechanismOfInjury || '';

    if (mechanism.includes('caught_in_cave_in')) return 'fatality_or_crushing_injury';
    if (mechanism.includes('rotating_equipment')) return 'amputation_entanglement_or_fatal_injury';
    if (mechanism.includes('cut_amputation')) return 'amputation_or_serious_laceration';
    if (mechanism.includes('electrical')) return 'shock_burn_arc_flash_or_fatality';
    if (mechanism.includes('struck_by_mobile_equipment')) return 'crushing_injury_or_fatality';
    if (mechanism.includes('fall_from_height')) return 'fall_to_lower_level_serious_injury_or_fatality';

    return severity === 'critical' ? 'fatality_or_permanent_disability' : 'serious_injury';
  }

  private inferExposureFrequency(
    intelligence: ScenarioIntelligence,
    likelihood: LikelihoodEstimate
  ): RiskReasoning['exposureFrequency'] {
    const combined = `${intelligence.task || ''} ${intelligence.exposedPersonActivity || ''}`.toLowerCase();

    if (combined.includes('routine') || likelihood === 'frequent') return 'frequent';
    if (likelihood === 'likely') return 'frequent';
    if (likelihood === 'possible') return 'occasional';
    return 'rare';
  }

  private inferExposedPopulation(intelligence: ScenarioIntelligence): number {
    const combined = `${intelligence.exposedPersonActivity || ''} ${intelligence.task || ''}`.toLowerCase();
    if (combined.includes('employees') || combined.includes('pedestrian')) return 2;
    return 1;
  }

  private energySeverity(severity: SeverityEstimate): RiskReasoning['energySourceSeverity'] {
    if (severity === 'critical') return 'critical';
    if (severity === 'high' || severity === 'serious') return 'high';
    if (severity === 'moderate') return 'moderate';
    return 'low';
  }

  private controlFailureSeverity(intelligence: ScenarioIntelligence): RiskReasoning['controlFailureSeverity'] {
    const scenario = intelligence.scenarioFamilyId || '';
    const controls = (intelligence.missingOrFailedControls || []).join(' ').toLowerCase();

    if (scenario.includes('excavation_protective_system')) return 'critical';
    if (
      controls.includes('guard') ||
      controls.includes('protective') ||
      controls.includes('separation') ||
      controls.includes('damaged') ||
      scenario.includes('point_of_operation') ||
      scenario.includes('conveyor') ||
      scenario.includes('rotating_shaft')
    ) {
      return 'high';
    }

    return 'moderate';
  }

  private buildRiskDrivers(
    intelligence: ScenarioIntelligence,
    severity: SeverityEstimate,
    likelihood: LikelihoodEstimate
  ): string[] {
    return Array.from(new Set([
      `credible severity: ${severity}`,
      `exposure likelihood: ${likelihood}`,
      intelligence.energySource ? `energy source: ${intelligence.energySource}` : '',
      intelligence.mechanismOfInjury ? `mechanism: ${intelligence.mechanismOfInjury}` : '',
      ...(intelligence.missingOrFailedControls || []).map((control) => `missing/failed control: ${control}`)
    ].filter(Boolean)));
  }

  private buildRiskReducers(intelligence: ScenarioIntelligence): string[] {
    const scenario = intelligence.scenarioFamilyId || '';

    if (scenario.includes('excavation')) {
      return ['install or verify protective system', 'keep workers out until competent review'];
    }

    if (
      scenario.includes('conveyor') ||
      scenario.includes('rotating_shaft') ||
      scenario.includes('point_of_operation')
    ) {
      return ['guard moving parts', 'isolate energy before work', 'verify access to danger zone is controlled'];
    }

    if (scenario.includes('electrical')) {
      return ['remove damaged equipment from service', 'restore clearance/access', 'restrict exposure to qualified personnel'];
    }

    if (scenario.includes('mobile_equipment')) {
      return ['separate pedestrians from equipment', 'mark travel paths', 'control line-of-fire exposure'];
    }

    return ['implement effective controls', 'verify correction'];
  }

  private urgencyForRisk(risk: RiskLevel): UrgencyLevel {
    if (risk === 'critical') return 'immediate';
    if (risk === 'high' || risk === 'serious') return 'urgent';
    if (risk === 'moderate') return 'prompt';
    if (risk === 'low') return 'scheduled';
    return 'unknown';
  }

  private dueDateLogic(risk: RiskLevel): string {
    if (risk === 'critical') return 'immediate stop-work or interim protection before exposure continues';
    if (risk === 'high' || risk === 'serious') return 'same shift or before task continues';
    if (risk === 'moderate') return 'prompt correction with supervisor verification';
    return 'scheduled correction';
  }

  private verificationRequirements(intelligence: ScenarioIntelligence): string[] {
    const scenario = intelligence.scenarioFamilyId || '';

    if (scenario.includes('excavation')) {
      return ['verify protective system, depth, soil condition, spoil placement, and worker exclusion'];
    }

    if (
      scenario.includes('conveyor') ||
      scenario.includes('rotating_shaft') ||
      scenario.includes('point_of_operation')
    ) {
      return ['verify fixed guard or equivalent safeguarding is installed and exposure is controlled'];
    }

    if (scenario.includes('electrical')) {
      return ['verify equipment condition, energized status, clearance, access, and wet-location exposure'];
    }

    if (scenario.includes('mobile_equipment')) {
      return ['verify pedestrian separation, traffic controls, visibility, and line-of-fire controls'];
    }

    return ['verify corrective action effectiveness'];
  }

  private humanReviewTriggers(risk: RiskLevel, evidenceGaps: string[]): string[] {
    const triggers: string[] = [];

    if (risk === 'critical' || risk === 'high' || risk === 'serious') {
      triggers.push('High-risk condition requires qualified review.');
    }

    if (evidenceGaps.length) {
      triggers.push('Evidence gaps remain and should be resolved before final reliance.');
    }

    return triggers;
  }
}
