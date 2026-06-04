import {
  SafeScopeStandardsIntentConfidence,
  SafeScopeStandardsIntentInput,
  SafeScopeStandardsIntentOutput,
  SafeScopeStandardIntentProfile,
} from './standards-intent-intelligence.types';

function cleanText(value: any): string {
  return String(value || '').trim();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(cleanText).filter(Boolean)));
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function normalizeCitation(value: any): string {
  return cleanText(value?.citation || value?.standard || value?.id || value || 'Unspecified standard');
}

function getStandardTitle(value: any): string {
  return cleanText(
    value?.title ||
      value?.heading ||
      value?.standardTitle ||
      value?.summary ||
      value?.description ||
      'Standard intent requires qualified review',
  );
}

function getAuthority(value: any): string {
  const text = `${normalizeCitation(value)} ${getStandardTitle(value)} ${cleanText(value?.agency)} ${cleanText(value?.authority)}`.toLowerCase();

  if (text.includes('msha') || text.includes('30 cfr')) return 'MSHA';
  if (text.includes('osha') || text.includes('29 cfr')) return 'OSHA';
  if (text.includes('ansi')) return 'ANSI / consensus reference';
  if (text.includes('nfpa')) return 'NFPA / consensus reference';
  return cleanText(value?.agency || value?.authority || 'Unknown / requires source review');
}

export class SafeScopeStandardsIntentIntelligenceService {
  evaluate(input: SafeScopeStandardsIntentInput): SafeScopeStandardsIntentOutput {
    const classification = cleanText(input.classification) || 'Unclassified';
    const observationText = cleanText(input.observationText);
    const combined = `${classification} ${observationText}`.toLowerCase();

    const standards = Array.isArray(input.suggestedStandards) ? input.suggestedStandards : [];
    const matrix = input.safetyHealthDomainMatrix || {};
    const domain = input.hazardDomainIntelligence || {};
    const mechanism = input.mechanismIntelligence || {};
    const evidence = input.evidenceSufficiency || {};
    const action = input.actionQuality || {};

    const profiles = standards.length
      ? standards.slice(0, 8).map((standard: any) =>
          this.buildProfile({
            standard,
            classification,
            combined,
            matrix,
            domain,
            mechanism,
            evidence,
            action,
          }),
        )
      : [
          this.buildNoStandardProfile({
            classification,
            combined,
            matrix,
            domain,
            mechanism,
            evidence,
            action,
          }),
        ];

    const evidenceGaps = unique([
      ...(Array.isArray(evidence.missingCriticalEvidence) ? evidence.missingCriticalEvidence : []),
      ...(Array.isArray(matrix.evidenceRequired) ? matrix.evidenceRequired.slice(0, 8) : []),
      ...profiles.flatMap((profile) => profile.applicabilityEvidenceNeeded.slice(0, 4)),
    ]);

    const crossCheckHazards = unique([
      ...(Array.isArray(matrix.relatedDomains) ? matrix.relatedDomains : []),
      ...(Array.isArray(domain.relatedDomains) ? domain.relatedDomains : []),
      ...profiles.flatMap((profile) => profile.relatedHazardsToCheck),
    ]);

    const standardsCoverageGaps = unique([
      !standards.length ? 'No standard candidate was supplied; SafeScope cannot infer final regulatory applicability.' : '',
      !observationText ? 'Observation text is missing or too limited to support standard intent analysis.' : '',
      evidence.sufficientForStandardsRecommendation === false
        ? 'Evidence sufficiency layer indicates standards recommendation is not yet fully supported.'
        : '',
      action.overallRating === 'insufficient'
        ? 'Corrective action quality layer indicates controls may not yet satisfy closure intent.'
        : '',
    ]);

    const commonIntentThemes = unique([
      ...profiles.flatMap((profile) => profile.likelyRegulatoryIntent),
      ...(Array.isArray(matrix.hazardFamilies) ? matrix.hazardFamilies.map((item: string) => `Address ${item}.`) : []),
    ]).slice(0, 14);

    const mitigationIntentSummary = unique([
      ...profiles.flatMap((profile) => profile.minimumControlIntent),
      ...(Array.isArray(matrix.mitigationStrategies) ? matrix.mitigationStrategies.slice(0, 10) : []),
    ]);

    const highRisk =
      input.risk?.riskBand === 'High' ||
      input.risk?.riskBand === 'Critical' ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    const confidence = this.getConfidence({
      standardsCount: standards.length,
      evidenceGapCount: evidenceGaps.length,
      profileCount: profiles.length,
      hasDomainContext: Boolean(matrix.primaryDomain || domain.primaryDomain || mechanism.classification),
    });

    return {
      engine: 'safescope_standards_intent_intelligence',
      mode: 'deterministic_offline',
      classification,
      standardIntentProfiles: profiles,
      commonIntentThemes,
      standardsCoverageGaps,
      evidenceGapsBlockingApplicability: evidenceGaps.slice(0, 20),
      mitigationIntentSummary: mitigationIntentSummary.slice(0, 20),
      crossCheckHazards: crossCheckHazards.slice(0, 20),
      regulatoryCautionNotes: unique([
        'Standard intent analysis supports applicability review but does not declare a violation by itself.',
        'Final applicability depends on jurisdiction, task, exposure, equipment/process state, and qualified human review.',
        'Do not cite compliance or noncompliance without confirming the exact regulatory text and facts.',
        highRisk ? 'High-risk or high-consequence condition requires qualified review before closure.' : '',
      ]),
      confidence,
      requiresQualifiedReview:
        Boolean(highRisk) ||
        confidence !== 'high' ||
        Boolean(standardsCoverageGaps.length) ||
        Boolean(evidenceGaps.length) ||
        evidence.sufficientForStandardsRecommendation === false,
      canInventStandards: false,
      canDeclareViolation: false,
      canFinalizeApplicabilityWithoutEvidence: false,
      canReduceHumanReview: false,
      sourceBoundary:
        'SafeScope standards intent intelligence explains the likely safety purpose, protected persons, prevented events, evidence needs, mitigation intent, and verification expectations for candidate standards. It cannot invent standards, declare violations, override OSHA/MSHA requirements, or finalize applicability without qualified human review and adequate evidence.',
    };
  }

  private buildProfile(input: {
    standard: any;
    classification: string;
    combined: string;
    matrix: any;
    domain: any;
    mechanism: any;
    evidence: any;
    action: any;
  }): SafeScopeStandardIntentProfile {
    const citation = normalizeCitation(input.standard);
    const standardTitle = getStandardTitle(input.standard);
    const agencyOrAuthority = getAuthority(input.standard);
    const text = `${input.combined} ${citation} ${standardTitle} ${cleanText(input.standard?.rationale)} ${cleanText(input.standard?.summary)} ${cleanText(input.standard?.matchingReasons?.join?.(' '))}`.toLowerCase();

    if (this.isLockout(text)) {
      return this.lockoutProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isMachineGuarding(text)) {
      return this.machineGuardingProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isElectrical(text)) {
      return this.electricalProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isFallProtection(text)) {
      return this.fallProtectionProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isConfinedSpace(text)) {
      return this.confinedSpaceProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isHazcom(text)) {
      return this.hazcomProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isSilicaDustHealth(text)) {
      return this.industrialHygieneProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    if (this.isMobileEquipment(text)) {
      return this.mobileEquipmentProfile(citation, standardTitle, agencyOrAuthority, input);
    }

    return this.genericProfile(citation, standardTitle, agencyOrAuthority, input);
  }

  private buildNoStandardProfile(input: {
    classification: string;
    combined: string;
    matrix: any;
    domain: any;
    mechanism: any;
    evidence: any;
    action: any;
  }): SafeScopeStandardIntentProfile {
    return {
      citation: 'No candidate standard supplied',
      standardTitle: 'Regulatory intent cannot be mapped without a standard candidate',
      agencyOrAuthority: 'Unknown / requires source review',
      likelyRegulatoryIntent: [
        'Prompt qualified review before making compliance claims.',
        'Use hazard recognition, evidence capture, and source retrieval before selecting standards.',
      ],
      protectedPersons: ['Potentially exposed employees, contractors, operators, or nearby workers.'],
      preventedEvents: ['Unsupported compliance conclusion.', 'Missed hazard mechanism.', 'Unverified closure.'],
      hazardMechanismsAddressed: unique([
        ...(Array.isArray(input.matrix.injuryMechanisms) ? input.matrix.injuryMechanisms : []),
        ...(Array.isArray(input.mechanism.injuryMechanisms) ? input.mechanism.injuryMechanisms : []),
        'unknown',
      ]),
      applicabilityEvidenceNeeded: unique([
        'Retrieve or select candidate OSHA/MSHA standard.',
        'Document jurisdiction, task, exposed person, equipment/process state, and hazard condition.',
        ...(Array.isArray(input.matrix.evidenceRequired) ? input.matrix.evidenceRequired.slice(0, 6) : []),
      ]),
      nonApplicabilityQuestions: [
        'Is this condition outside the cited agency jurisdiction?',
        'Is there a more specific standard that controls?',
        'Is the exposure credible based on actual task and access?',
      ],
      minimumControlIntent: [
        'Do not finalize standard selection until evidence and source support are available.',
        'Apply interim hazard controls when exposure or severity is uncertain.',
      ],
      strongComplianceIndicators: ['Qualified review completed.', 'Source-backed standard selected.', 'Facts support applicability.'],
      weakOrInsufficientIndicators: ['No standard candidate.', 'No evidence of exposure.', 'No documented task or condition.'],
      relatedHazardsToCheck: unique([
        ...(Array.isArray(input.matrix.relatedDomains) ? input.matrix.relatedDomains : []),
        'Qualified Human Review',
      ]),
      verificationEvidence: ['Source retrieval result.', 'Supervisor or competent-person review.', 'Field evidence supporting applicability.'],
      closureCautions: ['Do not close without standard review, hazard control, and verification evidence.'],
      confidence: 'low',
    };
  }

  private machineGuardingProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent employee contact with hazardous moving machine parts.',
        'Control nip points, rotating parts, pinch points, shearing, reciprocating, and other hazardous motion.',
        'Ensure guarding is effective during operation, cleanup, adjustment, troubleshooting, and maintenance interfaces.',
      ],
      protectedPersons: ['Operators.', 'Maintenance workers.', 'Clean-up workers.', 'Nearby employees or contractors.'],
      preventedEvents: ['Caught-in or caught-between event.', 'Amputation.', 'Crushing injury.', 'Laceration.', 'Unexpected contact with moving equipment.'],
      hazardMechanismsAddressed: ['mechanical_motion', 'caught_in_or_between', 'crush', 'amputation', 'laceration', 'struck_by'],
      applicabilityEvidenceNeeded: [
        'Identify moving part or nip/pinch point.',
        'Document whether employee body-part access is possible.',
        'Document equipment operating, stopped, de-energized, or locked-out state.',
        'Photograph guard condition and access path.',
        'Identify task: operation, cleanup, adjustment, maintenance, or troubleshooting.',
      ],
      nonApplicabilityQuestions: [
        'Is the moving part already guarded so employee contact is not reasonably possible?',
        'Was the equipment fully de-energized and locked/tagged during the task?',
        'Is another more specific standard controlling the condition?',
      ],
      minimumControlIntent: [
        'Install fixed, barrier, distance, or interlocked guarding that prevents contact.',
        'Use isolation and lockout/tagout when work occurs in the danger zone.',
        'Verify guard coverage and energy state before closure.',
      ],
      strongComplianceIndicators: ['Fixed guard installed.', 'No body-part access.', 'Interlock verified.', 'LOTO verified for maintenance.'],
      weakOrInsufficientIndicators: ['Warning sign only.', 'Training only.', 'PPE only.', 'Guard removed.', 'Guard with reachable gap.'],
      relatedHazardsToCheck: ['Lockout / Tagout', 'Electrical', 'Emergency Stop / Pull Cord', 'Housekeeping', 'Maintenance Access'],
      verificationEvidence: ['Before/after photos.', 'Guard coverage photo.', 'Access path photo.', 'Functional interlock test.', 'LOTO verification if applicable.'],
      closureCautions: [
        'Do not close if employees can still reach moving parts.',
        'Do not close if energy state during maintenance is unknown.',
      ],
      confidence: this.profileConfidence(input, 4),
    };
  }

  private lockoutProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent unexpected energization, startup, release of stored energy, or movement during service or maintenance.',
        'Require isolation, control, and verification of hazardous energy before employees enter the danger zone.',
      ],
      protectedPersons: ['Authorized employees.', 'Affected employees.', 'Maintenance workers.', 'Contractors.'],
      preventedEvents: ['Unexpected startup.', 'Stored-energy release.', 'Caught-in event.', 'Crush injury.', 'Shock.', 'Burn.', 'Chemical or pressure release.'],
      hazardMechanismsAddressed: ['stored_energy', 'electrical_energy', 'pressure', 'mechanical_motion', 'gravity', 'thermal_energy', 'chemical_energy'],
      applicabilityEvidenceNeeded: [
        'Document service, maintenance, clearing, adjustment, setup, or troubleshooting task.',
        'Identify all energy sources.',
        'Document isolation points, locks/tags, blocking, bleeding, and stored-energy release.',
        'Document try/test or zero-energy verification.',
      ],
      nonApplicabilityQuestions: [
        'Was the task normal production with effective alternative guarding?',
        'Was the employee exposed to hazardous energy?',
        'Were all energy sources already eliminated and verified?',
      ],
      minimumControlIntent: [
        'De-energize, isolate, lock/tag, block, bleed, release stored energy, and verify zero energy.',
        'Control group/contractor interfaces where multiple workers are exposed.',
      ],
      strongComplianceIndicators: ['Energy source list.', 'Lock/tag at isolation point.', 'Stored energy relieved.', 'Try/test documented.'],
      weakOrInsufficientIndicators: ['Stop button only.', 'Verbal instruction only.', 'No try/test.', 'Tag without isolation.', 'Unknown energy sources.'],
      relatedHazardsToCheck: ['Machine Guarding', 'Electrical', 'Pressure Systems', 'Hydraulics / Pneumatics', 'Confined Space'],
      verificationEvidence: ['LOTO photo.', 'Isolation point photo.', 'Try/test record.', 'Energy source checklist.', 'Release authorization.'],
      closureCautions: ['Do not close if energy sources or zero-energy verification are incomplete.'],
      confidence: this.profileConfidence(input, 4),
    };
  }

  private electricalProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent shock, electrocution, arc flash, burns, fire, and secondary injuries from electrical energy.',
        'Ensure energized parts are guarded, enclosed, labeled, maintained, and accessed only under appropriate controls.',
      ],
      protectedPersons: ['Qualified electrical workers.', 'Unqualified employees.', 'Maintenance workers.', 'Nearby workers.'],
      preventedEvents: ['Shock.', 'Electrocution.', 'Arc flash burn.', 'Electrical fire.', 'Secondary fall or startle injury.'],
      hazardMechanismsAddressed: ['electrical_energy', 'electrocution_or_shock', 'arc_flash_or_burn', 'fire_or_explosion', 'secondary_fall'],
      applicabilityEvidenceNeeded: [
        'Document energized/de-energized state.',
        'Document exposed conductor, open panel, missing cover, damage, access, labeling, and voltage if known.',
        'Confirm whether qualified-person controls are required.',
      ],
      nonApplicabilityQuestions: [
        'Is the equipment de-energized and verified?',
        'Is access restricted and enclosure integrity maintained?',
        'Is the condition governed by a more specific electrical work practice requirement?',
      ],
      minimumControlIntent: [
        'De-energize where feasible.',
        'Restore covers/enclosures.',
        'Restrict access to qualified persons.',
        'Use appropriate electrical safe-work controls.',
      ],
      strongComplianceIndicators: ['Cover installed.', 'Access controlled.', 'Voltage state documented.', 'Qualified review completed.'],
      weakOrInsufficientIndicators: ['Tape only.', 'Sign only.', 'Open energized panel.', 'Unknown voltage.', 'Unrestricted access.'],
      relatedHazardsToCheck: ['Lockout / Tagout', 'Fire / Hot Work', 'PPE', 'Maintenance Access'],
      verificationEvidence: ['Panel photo.', 'Cover/label photo.', 'Voltage or de-energization record.', 'Qualified review note.'],
      closureCautions: ['Do not close energized electrical concerns without qualified review and verification.'],
      confidence: this.profileConfidence(input, 4),
    };
  }

  private fallProtectionProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent falls to lower levels, falls through openings, same-level falls, and struck-by hazards from falling objects.',
        'Ensure work at elevation uses guardrails, covers, platforms, travel restraint, fall arrest, safe access, and rescue planning as applicable.',
      ],
      protectedPersons: ['Employees working at elevation.', 'Employees below elevated work.', 'Scaffold/ladder users.', 'Maintenance workers.'],
      preventedEvents: ['Fall to lower level.', 'Fall through opening.', 'Same-level fall.', 'Falling-object struck-by.', 'Suspension trauma or delayed rescue.'],
      hazardMechanismsAddressed: ['gravity', 'kinetic_energy', 'fall_to_lower_level', 'fall_same_level', 'struck_by'],
      applicabilityEvidenceNeeded: [
        'Document work height or elevation difference.',
        'Document edge, opening, ladder, scaffold, platform, or walking surface condition.',
        'Document protection method, anchorage, access route, and rescue considerations.',
      ],
      nonApplicabilityQuestions: [
        'Is the height below the applicable threshold?',
        'Is the opening protected or not accessible?',
        'Is a more specific scaffold, ladder, or walking-working surface rule applicable?',
      ],
      minimumControlIntent: [
        'Eliminate elevated work where feasible.',
        'Install guardrails, covers, platforms, or travel restraint.',
        'Verify fall arrest system, anchorage, training, inspection, and rescue planning where used.',
      ],
      strongComplianceIndicators: ['Guardrail/covers installed.', 'Rated anchor documented.', 'Scaffold/ladder inspected.', 'Rescue plan addressed.'],
      weakOrInsufficientIndicators: ['Awareness only.', 'Cone/tape only.', 'Unrated anchor.', 'No rescue plan.', 'Improvised access.'],
      relatedHazardsToCheck: ['Ladders and Scaffolds', 'Housekeeping and Walking Surfaces', 'Material Handling', 'Emergency Rescue'],
      verificationEvidence: ['Height measurement.', 'Edge/opening photos.', 'Anchor photo.', 'Scaffold/ladder inspection.', 'Rescue plan verification.'],
      closureCautions: ['Do not close if fall exposure remains or rescue/anchorage is unverified.'],
      confidence: this.profileConfidence(input, 4),
    };
  }

  private confinedSpaceProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent asphyxiation, toxic exposure, engulfment, entrapment, mechanical injury, fire/explosion, and delayed rescue in confined spaces.',
        'Require classification, atmospheric testing, isolation, ventilation, attendants, permits, communication, and rescue planning as applicable.',
      ],
      protectedPersons: ['Entrants.', 'Attendants.', 'Supervisors.', 'Rescuers.', 'Nearby workers.'],
      preventedEvents: ['Asphyxiation.', 'Toxic exposure.', 'Engulfment.', 'Entrapment.', 'Fire/explosion.', 'Multiple-fatality rescue event.'],
      hazardMechanismsAddressed: ['atmospheric_hazard', 'chemical_energy', 'engulfment_material', 'mechanical_motion', 'asphyxiation', 'inhalation_exposure'],
      applicabilityEvidenceNeeded: [
        'Document space configuration, entry requirement, access/egress limitations, and hazards.',
        'Document atmosphere readings, calibration, ventilation, isolation, permit, attendant, and rescue method.',
      ],
      nonApplicabilityQuestions: [
        'Is the space configured for continuous occupancy?',
        'Does the task require bodily entry?',
        'Are permit-space hazards eliminated or controlled before entry?',
      ],
      minimumControlIntent: [
        'Avoid entry where feasible.',
        'Classify the space.',
        'Test and monitor atmosphere.',
        'Isolate hazards, ventilate, provide attendant/communication, and verify rescue arrangements.',
      ],
      strongComplianceIndicators: ['Atmospheric test record.', 'Permit completed.', 'Isolation documented.', 'Attendant assigned.', 'Rescue plan verified.'],
      weakOrInsufficientIndicators: ['No atmospheric test.', 'No rescue plan.', 'Entrant alone.', 'Ventilation assumed.', 'No isolation record.'],
      relatedHazardsToCheck: ['Fire / Hot Work', 'Hazard Communication', 'Respiratory Protection', 'Lockout / Tagout', 'Emergency Rescue'],
      verificationEvidence: ['Permit.', 'Gas readings.', 'Calibration record.', 'Ventilation photo.', 'Isolation record.', 'Rescue/communication verification.'],
      closureCautions: ['Do not close if atmosphere, isolation, permit status, or rescue capability is unknown.'],
      confidence: this.profileConfidence(input, 5),
    };
  }

  private hazcomProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Ensure chemical hazards are identified, communicated, labeled, and understood before employee exposure.',
        'Support selection of controls, PPE, storage, emergency response, and exposure prevention based on known chemical hazards.',
      ],
      protectedPersons: ['Chemical users.', 'Nearby employees.', 'Emergency responders.', 'Maintenance and cleanup workers.'],
      preventedEvents: ['Chemical burn.', 'Inhalation exposure.', 'Skin absorption.', 'Fire/explosion.', 'Improper emergency response.'],
      hazardMechanismsAddressed: ['chemical_energy', 'atmospheric_hazard', 'thermal_energy', 'chemical_burn', 'inhalation_exposure', 'skin_absorption'],
      applicabilityEvidenceNeeded: [
        'Identify chemical/container/product.',
        'Document label status, SDS availability, hazard class, route of exposure, quantity, use, and storage condition.',
      ],
      nonApplicabilityQuestions: [
        'Is the material exempt or not a hazardous chemical?',
        'Is the container immediately used by the employee who filled it?',
        'Is another chemical-specific or process-specific requirement more applicable?',
      ],
      minimumControlIntent: [
        'Identify and label chemical.',
        'Make SDS/hazard information available.',
        'Control exposure by substitution, ventilation, containment, storage, PPE, and emergency readiness as applicable.',
      ],
      strongComplianceIndicators: ['Readable label.', 'SDS available.', 'Hazards known.', 'Compatible storage.', 'Controls matched to route and hazard.'],
      weakOrInsufficientIndicators: ['Unknown liquid.', 'No label.', 'No SDS.', 'PPE selected without chemical identity.', 'Improper storage.'],
      relatedHazardsToCheck: ['PPE', 'Fire / Hot Work', 'Respiratory Protection', 'Ventilation', 'Emergency Response', 'Exposure Monitoring'],
      verificationEvidence: ['Label photo.', 'SDS reference.', 'Chemical identity.', 'Storage photo.', 'Ventilation/PPE verification.'],
      closureCautions: ['Do not close unlabeled/unknown chemicals without identity, hazard review, and corrected labeling/storage.'],
      confidence: this.profileConfidence(input, 4),
    };
  }

  private industrialHygieneProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent harmful exposure to airborne contaminants, dusts, fumes, vapors, gases, noise, heat, or other occupational health stressors.',
        'Require exposure characterization, hierarchy-of-controls decision-making, sampling where needed, and medical/respiratory/hearing protection programs when triggered.',
      ],
      protectedPersons: ['Exposed employees.', 'Nearby employees.', 'Maintenance workers.', 'Cleanup workers.'],
      preventedEvents: ['Chronic disease.', 'Acute overexposure.', 'Respiratory illness.', 'Hearing loss.', 'Heat illness.', 'Unverified compliance claim.'],
      hazardMechanismsAddressed: ['inhalation_exposure', 'noise_induced_hearing_loss', 'heat_illness', 'skin_absorption', 'atmospheric_hazard'],
      applicabilityEvidenceNeeded: [
        'Identify agent or stressor.',
        'Document task, duration, frequency, route, exposed employees, existing controls, and sampling/measurement basis if available.',
        'Document ventilation, wet method, enclosure, respiratory protection, hearing protection, or heat controls as applicable.',
      ],
      nonApplicabilityQuestions: [
        'Is the contaminant/stressor actually present?',
        'Is exposure below action thresholds based on valid measurement?',
        'Is the task short, isolated, or fully controlled at the source?',
      ],
      minimumControlIntent: [
        'Characterize exposure.',
        'Control at the source using elimination, substitution, enclosure, wet methods, ventilation, isolation, scheduling, and verified PPE where required.',
        'Use quantitative sampling when compliance or health risk cannot be determined qualitatively.',
      ],
      strongComplianceIndicators: ['Sampling data.', 'Agent identified.', 'Controls verified.', 'Respirator/hearing/heat program elements documented where triggered.'],
      weakOrInsufficientIndicators: ['No sampling where needed.', 'PPE only.', 'Unknown agent.', 'No duration/frequency.', 'No exposure group identified.'],
      relatedHazardsToCheck: ['Respiratory Protection', 'Exposure Monitoring', 'Ventilation', 'PPE', 'Housekeeping', 'Medical Surveillance'],
      verificationEvidence: ['Sampling results.', 'Task/exposure notes.', 'Ventilation photo.', 'Fit test/training records.', 'Control verification.'],
      closureCautions: ['Do not declare health-exposure compliance without adequate exposure basis or qualified IH review when needed.'],
      confidence: this.profileConfidence(input, 5),
    };
  }

  private mobileEquipmentProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: [
        'Prevent struck-by, runover, backing, rollover, collision, and caught-between events involving powered mobile equipment.',
        'Ensure traffic controls, visibility, berms, grades, separation, communication, maintenance, and operator controls are adequate.',
      ],
      protectedPersons: ['Operators.', 'Pedestrians.', 'Spotters.', 'Maintenance workers.', 'Nearby employees or contractors.'],
      preventedEvents: ['Runover.', 'Struck-by.', 'Collision.', 'Rollover.', 'Caught-between.', 'Crushing injury.'],
      hazardMechanismsAddressed: ['kinetic_energy', 'mechanical_motion', 'gravity', 'struck_by', 'caught_in_or_between', 'crush', 'rollover'],
      applicabilityEvidenceNeeded: [
        'Document equipment type, route, grade, road condition, visibility, berms, pedestrian interaction, backing/spotting, and traffic rules.',
        'Document operating condition and separation controls.',
      ],
      nonApplicabilityQuestions: [
        'Was mobile equipment operating or capable of movement?',
        'Were pedestrians or other equipment exposed?',
        'Are traffic controls engineered and enforced?',
      ],
      minimumControlIntent: [
        'Separate pedestrians and equipment.',
        'Control traffic routes, grades, intersections, berms, backing, dumping, and visibility.',
        'Verify equipment condition, operator controls, communication, and site rules.',
      ],
      strongComplianceIndicators: ['Physical separation.', 'Traffic plan.', 'Berms maintained.', 'Visibility controls.', 'Spotting/backing rules verified.'],
      weakOrInsufficientIndicators: ['PPE only.', 'Verbal warning only.', 'No traffic plan.', 'Poor berms.', 'Pedestrians mixed with equipment.'],
      relatedHazardsToCheck: ['Powered Haulage', 'Ground Control', 'Visibility / Lighting', 'Material Handling', 'Housekeeping'],
      verificationEvidence: ['Traffic route photos.', 'Berm/grade photos.', 'Visibility documentation.', 'Pedestrian separation evidence.', 'Equipment inspection.'],
      closureCautions: ['Do not close if pedestrian/equipment interaction remains uncontrolled.'],
      confidence: this.profileConfidence(input, 4),
    };
  }

  private genericProfile(citation: string, standardTitle: string, agencyOrAuthority: string, input: any): SafeScopeStandardIntentProfile {
    const matrix = input.matrix || {};
    const domain = input.domain || {};
    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      likelyRegulatoryIntent: unique([
        'Prevent injury, illness, or uncontrolled exposure associated with the cited hazard condition.',
        'Require evidence-supported control selection and qualified review before final compliance decisions.',
        ...(Array.isArray(matrix.hazardFamilies) ? matrix.hazardFamilies.map((item: string) => `Address ${item}.`) : []),
      ]),
      protectedPersons: ['Exposed employees.', 'Nearby employees.', 'Contractors.', 'Operators.', 'Maintenance workers.'],
      preventedEvents: unique([
        ...(Array.isArray(matrix.injuryMechanisms) ? matrix.injuryMechanisms : []),
        ...(Array.isArray(matrix.healthMechanisms) ? matrix.healthMechanisms : []),
        'Injury or illness event.',
      ]),
      hazardMechanismsAddressed: unique([
        ...(Array.isArray(matrix.hazardousEnergies) ? matrix.hazardousEnergies : []),
        ...(Array.isArray(matrix.injuryMechanisms) ? matrix.injuryMechanisms : []),
        ...(Array.isArray(domain.injuryMechanisms) ? domain.injuryMechanisms : []),
      ]),
      applicabilityEvidenceNeeded: unique([
        'Document task, exposed person, hazard condition, controls present, and jurisdiction.',
        ...(Array.isArray(matrix.evidenceRequired) ? matrix.evidenceRequired.slice(0, 8) : []),
      ]),
      nonApplicabilityQuestions: [
        'Does the cited standard match the jurisdiction, hazard, equipment/process, and exposure?',
        'Is a more specific standard applicable?',
        'Is the factual exposure supported by evidence?',
      ],
      minimumControlIntent: unique([
        'Control the hazard source before relying on administrative controls or PPE.',
        ...(Array.isArray(matrix.mitigationStrategies) ? matrix.mitigationStrategies.slice(0, 8) : []),
      ]),
      strongComplianceIndicators: unique([
        ...(Array.isArray(matrix.strongControls) ? matrix.strongControls.slice(0, 8) : []),
        'Qualified review completed.',
      ]),
      weakOrInsufficientIndicators: unique([
        ...(Array.isArray(matrix.weakControls) ? matrix.weakControls.slice(0, 8) : []),
        'Insufficient evidence.',
      ]),
      relatedHazardsToCheck: unique([
        ...(Array.isArray(matrix.relatedDomains) ? matrix.relatedDomains : []),
        ...(Array.isArray(domain.relatedDomains) ? domain.relatedDomains : []),
      ]),
      verificationEvidence: unique([
        ...(Array.isArray(matrix.verificationRequirements) ? matrix.verificationRequirements.slice(0, 8) : []),
        'Before/after evidence.',
        'Supervisor verification.',
      ]),
      closureCautions: unique([
        ...(Array.isArray(matrix.closureRequirements) ? matrix.closureRequirements.slice(0, 8) : []),
        'Do not finalize applicability without qualified review and adequate evidence.',
      ]),
      confidence: this.profileConfidence(input, 3),
    };
  }

  private profileConfidence(input: any, minimumSignals: number): SafeScopeStandardsIntentConfidence {
    const matrix = input.matrix || {};
    const evidence = input.evidence || {};
    let signals = 0;

    if (matrix.primaryDomain) signals += 1;
    if (Array.isArray(matrix.hazardousEnergies) && matrix.hazardousEnergies.length) signals += 1;
    if (Array.isArray(matrix.injuryMechanisms) && matrix.injuryMechanisms.length) signals += 1;
    if (Array.isArray(matrix.evidenceRequired) && matrix.evidenceRequired.length) signals += 1;
    if (Array.isArray(input.mechanism?.injuryMechanisms) && input.mechanism.injuryMechanisms.length) signals += 1;
    if (evidence.sufficientForStandardsRecommendation === true) signals += 1;

    if (signals >= minimumSignals) return 'high';
    if (signals >= 2) return 'medium';
    return 'low';
  }

  private getConfidence(input: {
    standardsCount: number;
    evidenceGapCount: number;
    profileCount: number;
    hasDomainContext: boolean;
  }): SafeScopeStandardsIntentConfidence {
    if (!input.standardsCount || !input.hasDomainContext || !input.profileCount) return 'low';
    if (input.evidenceGapCount >= 8) return 'medium';
    return 'high';
  }

  private isMachineGuarding(text: string): boolean {
    return includesAny(text, ['machine guard', 'guarding', 'moving machine', 'nip point', 'pinch point', 'conveyor', 'pulley', 'rotating']);
  }

  private isLockout(text: string): boolean {
    return includesAny(text, ['1910.147', 'lockout', 'tagout', 'loto', 'hazardous energy', 'stored energy', 'zero energy', 'unexpected energization', 'unexpected startup', 'release of stored energy', 'energy isolation']);
  }

  private isElectrical(text: string): boolean {
    return includesAny(text, ['electrical', 'energized', 'conductor', 'panel', 'arc flash', 'breaker', 'shock']);
  }

  private isFallProtection(text: string): boolean {
    return includesAny(text, ['fall protection', 'fall', 'roof', 'edge', 'opening', 'hole', 'ladder', 'scaffold']);
  }

  private isConfinedSpace(text: string): boolean {
    return includesAny(text, ['confined space', 'permit space', 'entrant', 'atmosphere', 'oxygen', 'engulfment']);
  }

  private isHazcom(text: string): boolean {
    return includesAny(text, ['hazcom', 'hazard communication', 'sds', 'label', 'chemical', 'solvent', 'flammable']);
  }

  private isSilicaDustHealth(text: string): boolean {
    return includesAny(text, ['silica', 'dust', 'respirable', 'fume', 'vapor', 'gas', 'noise', 'heat stress', 'exposure']);
  }

  private isMobileEquipment(text: string): boolean {
    return includesAny(text, ['mobile equipment', 'powered haulage', 'haul truck', 'forklift', 'loader', 'traffic', 'pedestrian', 'backing', 'berm']);
  }
}
