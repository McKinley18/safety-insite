import { Injectable } from '@nestjs/common';
import {
  ActionItem,
  ActionStrength,
  DefensibleCorrectiveActionOutput,
} from './dca.types';

@Injectable()
export class DefensibleCorrectiveActionService {
  private readonly engineVersion = '0.1.0';

  async evaluateDCA(
    confidenceGovernance: any,
    evidenceSufficiency: any,
    causalRiskReasoning: any,
    observationUnderstanding: any,
    calibrationMeta: any,
    outputPolicy: any,
    fusedText: string
  ): Promise<DefensibleCorrectiveActionOutput> {
    const text = String(fusedText || '').toLowerCase();

    const actionStrength = this.resolveActionStrength(outputPolicy, confidenceGovernance);
    const mechanism = this.value(
      causalRiskReasoning?.mechanismOfInjury ||
      calibrationMeta?.mechanism ||
      observationUnderstanding?.scenarioUnderstanding?.topScenario?.mechanism ||
      observationUnderstanding?.mechanismCandidates?.[0]?.mechanism
    );

    const failedControl = this.value(
      causalRiskReasoning?.failedOrMissingControl ||
      [
        ...(Array.isArray(observationUnderstanding?.controls?.failedControls) ? observationUnderstanding.controls.failedControls : []),
        ...(Array.isArray(observationUnderstanding?.controls?.missingControls) ? observationUnderstanding.controls.missingControls : []),
      ].join(', ')
    );

    const exposure = this.exposureSummary(observationUnderstanding, causalRiskReasoning, text);
    const priority = this.priorityFromRisk(calibrationMeta, causalRiskReasoning, confidenceGovernance, mechanism, text);

    const missingEvidenceBeforeFinalAction = Array.from(new Set([
      ...(Array.isArray(evidenceSufficiency?.missingCriticalFacts) ? evidenceSufficiency.missingCriticalFacts : []),
      ...(Array.isArray(confidenceGovernance?.blockingEvidenceGaps) ? confidenceGovernance.blockingEvidenceGaps : []),
    ].filter(Boolean).map(String)));

    const reviewerQuestions = Array.from(new Set([
      ...(Array.isArray(evidenceSufficiency?.recommendedReviewerQuestions) ? evidenceSufficiency.recommendedReviewerQuestions : []),
      ...this.mechanismReviewerQuestions(mechanism, text, observationUnderstanding),
    ]));

    const blockedActions: string[] = [];
    const assignedReviewNeeds: string[] = [
      'Qualified safety review is required before final reliance or closure.',
    ];

    const canGenerateCorrectiveAction =
      outputPolicy?.allowedOutputModes?.canGenerateCorrectiveActionText === true ||
      confidenceGovernance?.outputPermissions?.canSupportCorrectiveAction === true;

    const hasClearHazardControlBasis = this.hasClearHazardControlBasis(
      mechanism,
      failedControl,
      observationUnderstanding,
      causalRiskReasoning,
      text
    );

    const effectiveActionStrength: ActionStrength =
      actionStrength === 'questions_only' && hasClearHazardControlBasis
        ? 'cautious'
        : actionStrength;

    const questionsOnly =
      !hasClearHazardControlBasis && (
        effectiveActionStrength === 'questions_only' ||
        evidenceSufficiency?.sufficiencyLevel === 'insufficient' ||
        outputPolicy?.allowedOutputModes?.mustAskReviewerQuestionsFirst === true && !canGenerateCorrectiveAction
      );

    if (questionsOnly) {
      blockedActions.push('Final corrective actions are blocked until critical facts are confirmed.');
      blockedActions.push('SafeScope may ask reviewer questions but should not present strong corrective-action language.');
      return this.output({
        actionStrength: 'questions_only',
        immediateActions: [],
        interimControls: [],
        permanentCorrectiveActions: [],
        verificationActions: [],
        assignedReviewNeeds,
        actionRationale: 'Evidence is not sufficient to support final corrective-action language. Reviewer questions must be answered first.',
        blockedActions,
        missingEvidenceBeforeFinalAction,
        reviewerQuestions: reviewerQuestions.length ? reviewerQuestions : ['Describe the hazard, exposure, energy source, failed control, and supporting evidence.'],
        languagePolicyApplied: 'questions_only',
        confidenceLimits: confidenceGovernance?.maximumSupportedConfidence || 'insufficient',
      });
    }

    const profile = this.actionProfile(mechanism, failedControl, exposure, priority, text);

    const immediateActions = this.allowedImmediate(outputPolicy, hasClearHazardControlBasis)
      ? [profile.immediate]
      : [];

    const interimControls = this.allowedImmediate(outputPolicy, hasClearHazardControlBasis)
      ? [profile.interim]
      : [];

    const permanentCorrectiveActions = this.allowedPermanent(outputPolicy, effectiveActionStrength, hasClearHazardControlBasis)
      ? [profile.permanent]
      : [];

    const verificationActions = [profile.verification];

    if (this.exposureUnclear(observationUnderstanding, evidenceSufficiency, text)) {
      reviewerQuestions.push('Confirm whether workers were exposed, how close they were, and whether access to the hazard is possible during normal or foreseeable work.');
      assignedReviewNeeds.push('Confirm exposure/proximity before finalizing action priority.');
    }

    if (this.jurisdictionUnclear(observationUnderstanding, evidenceSufficiency, text)) {
      assignedReviewNeeds.push('Confirm site jurisdiction before any standards or compliance mapping is used.');
      blockedActions.push('Compliance, citation, or regulatory conclusion language is blocked until jurisdiction and applicability are reviewed.');
    }

    if (this.supportingEvidenceWeak(evidenceSufficiency)) {
      assignedReviewNeeds.push('Attach or review supporting evidence before final closure.');
      reviewerQuestions.push(this.supportingEvidenceQuestion(mechanism, text));
    }

    return this.output({
      actionStrength: effectiveActionStrength,
      immediateActions,
      interimControls,
      permanentCorrectiveActions,
      verificationActions,
      assignedReviewNeeds: Array.from(new Set(assignedReviewNeeds)),
      actionRationale: this.rationale(mechanism, failedControl, exposure, causalRiskReasoning, effectiveActionStrength),
      blockedActions: Array.from(new Set(blockedActions)),
      missingEvidenceBeforeFinalAction,
      reviewerQuestions: Array.from(new Set(reviewerQuestions)),
      languagePolicyApplied: outputPolicy?.allowedLanguageStrength || effectiveActionStrength,
      confidenceLimits: confidenceGovernance?.maximumSupportedConfidence || effectiveActionStrength,
    });
  }

  private actionProfile(
    mechanism: string,
    failedControl: string,
    exposure: string,
    priority: ActionItem['priority'],
    text: string
  ): {
    immediate: ActionItem;
    interim: ActionItem;
    permanent: ActionItem;
    verification: ActionItem;
  } {
    if (mechanism === 'unexpected_startup' || text.includes('lockout') || text.includes('not locked out')) {
      return this.profile(
        'unexpected_startup',
        failedControl || 'energy isolation',
        exposure,
        priority,
        'Stop servicing activity and secure hazardous energy exposure',
        'Pause affected work, establish control of hazardous energy, and keep workers clear until a qualified person verifies the equipment cannot unexpectedly start or release stored energy.',
        'Use controlled access and temporary energy-control oversight until the permanent isolation method is verified.',
        'Implement and document energy isolation, lockout/tagout, try-out verification, and restart controls appropriate to the equipment and task.',
        'Verify isolation records, lock placement, try-out results, stored-energy release, and supervisor review before returning equipment to service.'
      );
    }

    if (mechanism === 'rotating_equipment_nip_point') {
      return this.profile(
        'rotating_equipment_nip_point',
        failedControl || 'guarding',
        exposure,
        priority,
        'Control access to exposed rotating equipment',
        'Keep personnel clear of the exposed nip point and stop affected operation if exposure cannot be controlled.',
        'Barricade or restrict access until guarding or equivalent protection is restored.',
        'Install, repair, or restore guarding that prevents contact with the rotating component during operation and foreseeable tasks.',
        'Verify guard condition, securement, reach prevention, and safe operation before release.'
      );
    }

    if (mechanism === 'fall_from_height' || text.includes('floor hole') || text.includes('open edge')) {
      return this.profile(
        'fall_from_height',
        failedControl || 'cover, barricade, guardrail, or fall protection',
        exposure,
        priority,
        'Protect workers from fall exposure',
        'Restrict access to the fall exposure and use temporary protection until the opening or edge is controlled.',
        'Install temporary barricade, cover, guardrail, warning control, or equivalent protection appropriate to the exposure.',
        'Provide a durable cover, guardrail system, edge protection, or other engineered control that prevents fall exposure during normal work.',
        'Verify cover rating/securement, barricade placement, guardrail condition, signage, and worker access control.'
      );
    }

    if (mechanism === 'electrical_shock') {
      return this.profile(
        'electrical_shock',
        failedControl || 'electrical isolation, guarding, labeling, or condition control',
        exposure,
        priority,
        'Control electrical exposure',
        'Keep workers away from the electrical hazard and have a qualified person evaluate energy state and condition.',
        'Use temporary barriers, access control, and qualified-person review until the electrical condition is corrected.',
        'Repair, replace, guard, label, or isolate electrical equipment based on qualified review and verified energy state.',
        'Verify de-energization where applicable, repair quality, labeling, guarding, and release by a qualified person.'
      );
    }

    if (mechanism === 'atmospheric_hazard_engulfment_or_entrapment' || text.includes('confined') || text.includes('tank')) {
      return this.profile(
        'atmospheric_hazard_engulfment_or_entrapment',
        failedControl || 'atmospheric testing, permit, attendant, ventilation, rescue planning, or entry control',
        exposure,
        priority,
        'Stop or hold confined-space entry until entry controls are verified',
        'Do not proceed with entry until atmospheric hazards, attendant coverage, entry authorization, ventilation, communication, and rescue planning are reviewed by qualified personnel.',
        'Control access to the space and maintain non-entry precautions until required entry controls are confirmed.',
        'Establish documented entry controls including atmospheric testing, ventilation as needed, attendant/rescue arrangements, communication, isolation, and authorization appropriate to the space.',
        'Verify atmospheric test results, permit/authorization, attendant assignment, rescue plan, communication, isolation, and entry records before entry proceeds.'
      );
    }

    if (mechanism === 'struck_by_falling_suspended_load') {
      return this.profile(
        'struck_by_falling_suspended_load',
        failedControl || 'load control, exclusion zone, rigging control, or communication',
        exposure,
        priority,
        'Remove workers from suspended-load line of fire',
        'Stop or hold the lift if workers are under or near the suspended load and establish an exclusion zone.',
        'Use spotters, communication controls, taglines where appropriate, and controlled access until the lift path is clear.',
        'Plan and execute lifts with verified rigging, controlled load path, exclusion zones, competent oversight, and communication.',
        'Verify rigging condition, load path, exclusion zone, lift plan, signal communication, and post-lift review.'
      );
    }

    if (mechanism === 'chemical_exposure_unknown_agent' || text.includes('unlabeled') || text.includes('chemical')) {
      return this.profile(
        'chemical_exposure_unknown_agent',
        failedControl || 'container labeling, SDS, segregation, or exposure control',
        exposure,
        priority,
        'Control unknown chemical exposure potential',
        'Isolate the container or material until contents, hazards, and handling requirements are confirmed.',
        'Restrict access, prevent use, and use interim labeling/quarantine until identity and hazards are verified.',
        'Identify the material, apply appropriate labeling, confirm SDS availability, train affected workers as needed, and correct storage/handling controls.',
        'Verify container identity, label accuracy, SDS availability, storage compatibility, and worker communication before release.'
      );
    }

    if (mechanism === 'struck_by_whipping_pressurized_line') {
      return this.profile(
        'struck_by_whipping_pressurized_line',
        failedControl || 'pressure isolation, hose restraint, inspection, or stored-energy control',
        exposure,
        priority,
        'Control pressurized line stored-energy exposure',
        'Keep workers clear and depressurize or isolate the line before handling or repair.',
        'Use temporary restraints, barricades, and pressure-control precautions until permanent correction is made.',
        'Repair or replace defective hose/line components and install pressure-rated restraints, isolation, and inspection controls.',
        'Verify depressurization, pressure rating, restraint condition, leak test, and inspection documentation.'
      );
    }

    if (mechanism === 'struck_by_mobile_equipment') {
      return this.profile(
        'struck_by_mobile_equipment',
        failedControl || 'traffic separation, visibility, signaling, or pedestrian control',
        exposure,
        priority,
        'Separate pedestrians from mobile equipment exposure',
        'Keep pedestrians out of the travel path or blind spot until traffic controls are confirmed.',
        'Use spotters, temporary barricades, communication, and controlled travel paths as interim controls.',
        'Implement durable traffic management controls such as pedestrian routes, exclusion zones, visibility controls, alarms, signage, and operator/pedestrian communication expectations.',
        'Verify traffic-control layout, blind-spot controls, signage, route separation, and worker briefing.'
      );
    }

    if (mechanism === 'caught_in_cave_in') {
      return this.profile(
        'caught_in_cave_in',
        failedControl || 'protective system, access control, competent review, or soil/wall control',
        exposure,
        priority,
        'Keep workers out of unsupported excavation exposure',
        'Remove workers from the excavation or edge exposure until protective conditions are reviewed.',
        'Restrict access and maintain setback/control zones until competent review is completed.',
        'Provide an appropriate protective system, access/egress, inspection process, spoil placement controls, and competent-person review before work continues.',
        'Verify protective system, soil/wall condition, access/egress, spoil placement, water conditions, and inspection records.'
      );
    }

    if (mechanism === 'slip_trip_fall_same_level') {
      return this.profile(
        'slip_trip_fall_same_level',
        failedControl || 'housekeeping, walking-surface condition, drainage, or warning control',
        exposure,
        priority,
        'Control walking-surface exposure',
        'Keep workers clear of the affected walking path until the surface condition is corrected or controlled.',
        'Use warning, barricade, cleanup, matting, drainage, or route control as interim protection.',
        'Correct the walking-surface condition and implement housekeeping, drainage, maintenance, or inspection controls to prevent recurrence.',
        'Verify surface condition, cleanup completion, warning removal, and supervisor review.'
      );
    }

    if (mechanism === 'delayed_emergency_response') {
      return this.profile(
        'delayed_emergency_response',
        failedControl || 'access, inspection, visibility, readiness, or emergency response control',
        exposure,
        priority,
        'Restore emergency equipment or egress readiness',
        'Clear access and identify any immediate emergency-response impairment.',
        'Use interim communication, alternate access, or temporary standby controls until readiness is restored.',
        'Restore permanent access, visibility, inspection status, signage, and readiness for the emergency equipment or route.',
        'Verify access clearance, inspection status, visibility, signage, and readiness check.'
      );
    }

    return this.profile(
      mechanism || 'unknown',
      failedControl || 'control not yet confirmed',
      exposure,
      priority,
      'Control the observed hazard pending qualified review',
      'Use conservative interim controls to keep workers away from the hazard until critical facts are confirmed.',
      'Maintain access control and supervisor review while missing facts are collected.',
      'Define the permanent corrective action after mechanism, exposure, failed control, and supporting evidence are confirmed.',
      'Verify hazard details, exposure, failed control, supporting evidence, and supervisor review before closure.'
    );
  }

  private profile(
    mechanism: string,
    failedControl: string,
    exposure: string,
    priority: ActionItem['priority'],
    immediateTitle: string,
    immediateDescription: string,
    interimDescription: string,
    permanentDescription: string,
    verificationDescription: string
  ) {
    return {
      immediate: this.action('immediate', immediateTitle, immediateDescription, mechanism, failedControl, exposure, 'Supervisor field verification and worker access review.', priority),
      interim: this.action('interim', 'Maintain interim exposure controls', interimDescription, mechanism, failedControl, exposure, 'Document interim control placement and responsible person review.', priority),
      permanent: this.action('permanent', 'Complete permanent corrective action', permanentDescription, mechanism, failedControl, exposure, 'Qualified review, closeout evidence, and recurrence-prevention verification.', priority),
      verification: this.action('verification', 'Verify correction before closure', verificationDescription, mechanism, failedControl, exposure, verificationDescription, priority),
    };
  }

  private action(
    actionType: ActionItem['actionType'],
    title: string,
    description: string,
    tiedMechanism: string,
    tiedFailedControl: string,
    tiedExposure: string,
    verificationMethod: string,
    priority: ActionItem['priority']
  ): ActionItem {
    return {
      actionType,
      title,
      description,
      tiedMechanism,
      tiedFailedControl,
      tiedExposure,
      verificationMethod,
      priority,
      requiresHumanReview: true,
    };
  }

  private resolveActionStrength(outputPolicy: any, confidenceGovernance: any): ActionStrength {
    const policyStrength = outputPolicy?.allowedLanguageStrength;
    if (policyStrength === 'strong' || policyStrength === 'moderate' || policyStrength === 'cautious' || policyStrength === 'questions_only') {
      return policyStrength;
    }

    const max = confidenceGovernance?.maximumSupportedConfidence;
    if (max === 'high') return 'strong';
    if (max === 'moderate') return 'moderate';
    if (max === 'low') return 'cautious';
    return 'questions_only';
  }

  private allowedImmediate(outputPolicy: any, hasClearHazardControlBasis = false): boolean {
    if (outputPolicy?.allowedOutputModes?.canRecommendImmediateControls !== false) {
      return true;
    }

    // Even when standards/citation confidence is limited, HazLenz may recommend
    // cautious advisory immediate/interim hazard controls when the observed
    // mechanism and failed control are clear.
    return hasClearHazardControlBasis;
  }

  private allowedPermanent(outputPolicy: any, strength: ActionStrength, hasClearHazardControlBasis = false): boolean {
    if (strength === 'strong' || strength === 'moderate') {
      return outputPolicy?.allowedOutputModes?.canRecommendPermanentControls !== false;
    }

    // Cautious advisory permanent controls are allowed when the observed mechanism
    // and failed control are clear enough to recommend hazard-control direction.
    // This does not permit violation language, citation creation, or final compliance conclusions.
    if (strength === 'cautious' && hasClearHazardControlBasis) {
      return true;
    }

    return false;
  }

  private hasClearHazardControlBasis(
    mechanism: string,
    failedControl: string,
    observationUnderstanding: any,
    causalRiskReasoning: any,
    text: string
  ): boolean {
    const combined = [
      mechanism,
      failedControl,
      causalRiskReasoning?.initiatingCondition,
      causalRiskReasoning?.failedOrMissingControl,
      observationUnderstanding?.hazardCategory,
      observationUnderstanding?.candidateStandardFamily,
      observationUnderstanding?.classification,
      text,
    ].filter(Boolean).join(' ').toLowerCase();

    const hasMechanism =
      String(mechanism || '').trim().length > 2 ||
      /cylinder|compressed gas|pressure|stored energy|electrical|shock|arc flash|fall|slip|trip|guard|pinch|caught|struck|chemical|spill|fire|explosion|loto|lockout|traffic|mobile equipment/i.test(combined);

    const hasControlFailure =
      String(failedControl || '').trim().length > 2 ||
      /unsecured|missing|failed|damaged|exposed|unguarded|unprotected|open|leaking|spill|no guard|no restraint|no barricade|no cover|not locked out|blocked|defective/i.test(combined);

    const hasKnownHazardDomain =
      /compressed_gas|compressed gas|cylinder|electrical|fall|walking|machine|guard|chemical|hazcom|fire|explosion|loto|stored energy|mobile equipment|traffic|confined space|ppe|noise|silica|rigging|hoist|welding|ground control/i.test(combined);

    return hasMechanism && hasControlFailure && hasKnownHazardDomain;
  }

  private exposureSummary(observationUnderstanding: any, causalRiskReasoning: any, text: string): string {
    const exposed = observationUnderstanding?.exposure?.workerExposed;
    const proximity = observationUnderstanding?.exposure?.proximity;
    if (exposed === true) return `worker exposure identified${proximity ? `; proximity=${proximity}` : ''}`;
    if (this.exposureNegated(text)) return 'worker exposure/proximity not described';
    if (causalRiskReasoning?.exposedTarget) return String(causalRiskReasoning.exposedTarget);
    return 'worker exposure requires confirmation';
  }

  private exposureUnclear(observationUnderstanding: any, evidenceSufficiency: any, text: string): boolean {
    return (
      observationUnderstanding?.exposure?.workerExposed !== true ||
      this.exposureNegated(text) ||
      evidenceSufficiency?.factScores?.exposureClarity < 0.6 ||
      this.listIncludes(evidenceSufficiency?.missingCriticalFacts, 'exposure')
    );
  }

  private jurisdictionUnclear(observationUnderstanding: any, evidenceSufficiency: any, text: string): boolean {
    const detected = String(observationUnderstanding?.jurisdiction?.detected || '').toLowerCase();
    return (
      !detected ||
      detected === 'unknown' ||
      detected === 'unclear' ||
      text.includes('jurisdiction is unknown') ||
      evidenceSufficiency?.factScores?.jurisdictionClarity < 0.6 ||
      this.listIncludes(evidenceSufficiency?.missingCriticalFacts, 'jurisdiction')
    );
  }

  private supportingEvidenceWeak(evidenceSufficiency: any): boolean {
    return (
      evidenceSufficiency?.factScores?.evidenceSupport < 0.45 ||
      this.listIncludes(evidenceSufficiency?.missingCriticalFacts, 'supporting evidence')
    );
  }

  private mechanismReviewerQuestions(mechanism: string, text: string, observationUnderstanding: any): string[] {
    const questions: string[] = [];

    if (!mechanism || mechanism === 'unknown') {
      questions.push('Confirm the likely mechanism of injury and how the worker could be harmed.');
    }

    if (this.exposureNegated(text) || observationUnderstanding?.exposure?.workerExposed !== true) {
      questions.push('Confirm whether workers were exposed, how close they were, and whether access is possible.');
    }

    if (mechanism === 'unexpected_startup') {
      questions.push('Confirm energy isolation status, lockout method, stored-energy release, and try-out verification.');
    }

    if (mechanism === 'fall_from_height') {
      questions.push('Confirm opening/edge dimensions, fall distance, worker access, and whether cover, guardrail, barricade, or fall protection is in place.');
    }

    if (mechanism === 'atmospheric_hazard_engulfment_or_entrapment') {
      questions.push('Confirm atmospheric test results, ventilation, attendant assignment, authorization/permit status, communication, and rescue planning.');
    }

    return questions;
  }

  private supportingEvidenceQuestion(mechanism: string, text: string): string {
    if (mechanism === 'unexpected_startup' || text.includes('lockout')) {
      return 'Attach lockout/energy-control record, try-out verification, photos, or supervisor verification notes.';
    }
    if (mechanism === 'fall_from_height' || text.includes('floor hole')) {
      return 'Attach photos, measurements, cover/guardrail details, and access-control evidence.';
    }
    if (mechanism === 'atmospheric_hazard_engulfment_or_entrapment' || text.includes('confined') || text.includes('tank')) {
      return 'Attach atmospheric test records, entry authorization, attendant/rescue documentation, and isolation/ventilation evidence.';
    }
    if (mechanism === 'chemical_exposure_unknown_agent' || text.includes('chemical')) {
      return 'Attach container label details, SDS, material identification, and storage/handling evidence.';
    }
    return 'Attach photos, measurements, records, inspection notes, or other supporting evidence before closure.';
  }

  private priorityFromRisk(calibrationMeta: any, causalRiskReasoning: any, confidenceGovernance: any, mechanism: string, text: string): ActionItem['priority'] {
    const combined = [
      calibrationMeta?.riskBand,
      causalRiskReasoning?.credibleWorstCase,
      confidenceGovernance?.confidenceInputs?.riskConfidence,
      mechanism,
      text,
    ].join(' ').toLowerCase();

    if (combined.includes('critical') || combined.includes('fatal') || combined.includes('amputation') || combined.includes('confined')) return 'critical';
    if (combined.includes('high') || combined.includes('fall_from_height') || combined.includes('unexpected_startup') || combined.includes('suspended')) return 'high';
    if (combined.includes('moderate')) return 'medium';
    return 'medium';
  }

  private rationale(mechanism: string, failedControl: string, exposure: string, causalRiskReasoning: any, strength: ActionStrength): string {
    const worstCase = this.value(causalRiskReasoning?.credibleWorstCase);
    return [
      `Action strength ${strength} was selected from output policy and confidence governance.`,
      `Actions are tied to mechanism ${mechanism || 'unknown'}, failed/missing control ${failedControl || 'unknown'}, and exposure ${exposure || 'unknown'}.`,
      worstCase !== 'unknown' ? `Credible worst case considered: ${worstCase}.` : 'Credible worst case requires confirmation.',
      'All actions remain advisory and require qualified review.',
    ].join(' ');
  }

  private output(params: Omit<DefensibleCorrectiveActionOutput, 'engine' | 'version' | 'advisoryGuardrails'>): DefensibleCorrectiveActionOutput {
    return {
      engine: 'safescope_defensible_corrective_action_core',
      version: this.engineVersion,
      ...params,
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private value(value: unknown): string {
    const normalized = String(value ?? '').trim();
    return normalized || 'unknown';
  }

  private listIncludes(values: unknown, token: string): boolean {
    return Array.isArray(values) && values.join(' ').toLowerCase().includes(token);
  }

  private exposureNegated(text: string): boolean {
    return (
      text.includes('exposure, access, and proximity are not described') ||
      text.includes('exposure is not described') ||
      text.includes('proximity is not described') ||
      text.includes('worker exposure') && text.includes('not described')
    );
  }
}
