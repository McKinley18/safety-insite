import {
  SafeScopeRegulatoryApplicabilityInput,
  SafeScopeRegulatoryApplicabilityOutput,
  SafeScopeRegulatoryApplicabilityProfile,
  SafeScopeRegulatoryApplicabilityStatus,
  SafeScopeRegulatoryApplicabilityConfidence,
} from './regulatory-applicability.types';

type ApplicabilityProfileSpecific = {
  supporting: string[];
  missing: string[];
  nonApplicability: string[];
  moreSpecific: string[];
  evidenceNeeded: string[];
  cautions: string[];
};

function cleanText(value: any): string {
  return String(value || '').trim();
}

function lower(value: any): string {
  return cleanText(value).toLowerCase();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(cleanText).filter(Boolean)));
}

function includesAny(text: string, terms: string[]): boolean {
  const value = lower(text);
  return terms.some((term) => value.includes(lower(term)));
}

function normalizeCitation(standard: any): string {
  return (
    cleanText(standard?.citation) ||
    cleanText(standard?.standard) ||
    cleanText(standard?.id) ||
    'No candidate standard supplied'
  );
}

function getStandardTitle(standard: any): string {
  return (
    cleanText(standard?.title) ||
    cleanText(standard?.heading) ||
    cleanText(standard?.summary) ||
    'Unspecified standard title'
  );
}

function getAuthority(standard: any): string {
  const combined = `${normalizeCitation(standard)} ${getStandardTitle(standard)} ${cleanText(standard?.agency)} ${cleanText(standard?.authority)}`.toLowerCase();

  if (combined.includes('30 cfr') || combined.includes('msha')) return 'MSHA';
  if (combined.includes('29 cfr') || combined.includes('osha')) return 'OSHA';
  return cleanText(standard?.agency || standard?.authority) || 'Unknown';
}

export class SafeScopeRegulatoryApplicabilityService {
  evaluate(input: SafeScopeRegulatoryApplicabilityInput): SafeScopeRegulatoryApplicabilityOutput {
    const classification = cleanText(input.classification) || 'Unclassified';
    const evidenceTexts = input.evidenceTexts || [];
    const standards = input.suggestedStandards?.length
      ? input.suggestedStandards
      : [{ citation: 'No candidate standard supplied', title: 'No candidate standard supplied' }];

    const combined = lower([
      classification,
      input.observationText,
      evidenceTexts.join(' '),
      JSON.stringify(input.standardsIntent || {}),
      JSON.stringify(input.safetyHealthDomainMatrix || {}),
      JSON.stringify(input.hazardDomainIntelligence || {}),
    ].join(' '));

    const profiles = standards.map((standard) => this.buildProfile(standard, input, combined));

    const evidenceGapsBlockingApplicability = unique([
      ...profiles.flatMap((profile) => profile.applicabilityFactsMissing),
      ...(Array.isArray(input.evidenceSufficiency?.missingCriticalEvidence)
        ? input.evidenceSufficiency.missingCriticalEvidence
        : []),
    ]);

    const jurisdictionCautions = unique([
      ...profiles.flatMap((profile) => profile.jurisdictionSignals),
      !includesAny(combined, ['msha', 'osha', '30 cfr', '29 cfr', 'mine', 'construction', 'general industry'])
        ? 'Jurisdiction is not clearly documented; confirm MSHA/OSHA and industry context before relying on citation.'
        : '',
    ]);

    const moreSpecificStandardWarnings = unique(
      profiles.flatMap((profile) => profile.moreSpecificStandardConsiderations),
    );

    const strongest =
      profiles.find((profile) => profile.applicabilityStatus === 'likely_applicable') ||
      profiles.find((profile) => profile.applicabilityStatus === 'possibly_applicable') ||
      profiles[0];

    const confidence = this.getOverallConfidence({
      profileCount: profiles.length,
      likelyCount: profiles.filter((p) => p.applicabilityStatus === 'likely_applicable').length,
      evidenceGapCount: evidenceGapsBlockingApplicability.length,
      unknownCitation: strongest?.citation === 'No candidate standard supplied',
    });

    return {
      engine: 'safescope_regulatory_applicability',
      mode: 'deterministic_offline',
      classification,
      profiles,
      primaryApplicabilityStatus: strongest?.applicabilityStatus || 'insufficient_evidence',
      strongestCandidateCitation: strongest?.citation || 'No candidate standard supplied',
      jurisdictionCautions,
      evidenceGapsBlockingApplicability,
      moreSpecificStandardWarnings,
      confidence,
      requiresQualifiedReview:
        confidence !== 'high' ||
        Boolean(evidenceGapsBlockingApplicability.length) ||
        profiles.some((profile) => profile.applicabilityStatus !== 'likely_applicable') ||
        Boolean(input.risk?.requiresShutdown) ||
        Boolean(input.risk?.riskBand === 'High') ||
        Boolean(input.risk?.riskBand === 'Critical'),
      canInventStandards: false,
      canDeclareViolation: false,
      canFinalizeApplicabilityWithoutEvidence: false,
      canOverrideRegulations: false,
      canReduceHumanReview: false,
      sourceBoundary:
        'SafeScope regulatory applicability intelligence evaluates whether candidate standards appear factually and jurisdictionally applicable using available evidence, task/exposure signals, domain context, and missing-fact controls. It cannot invent standards, declare violations, override regulations, or finalize applicability without qualified human review.',
    };
  }

  private buildProfile(
    standard: any,
    input: SafeScopeRegulatoryApplicabilityInput,
    combined: string,
  ): SafeScopeRegulatoryApplicabilityProfile {
    const citation = normalizeCitation(standard);
    const standardTitle = getStandardTitle(standard);
    const agencyOrAuthority = getAuthority(standard);
    const standardText = lower(`${citation} ${standardTitle} ${cleanText(standard?.summary)} ${cleanText(standard?.rationale)} ${cleanText(standard?.matchingReasons?.join?.(' '))}`);
    const full = `${combined} ${standardText}`;

    const jurisdictionSignals = this.getJurisdictionSignals(full, agencyOrAuthority);
    const taskSignals = this.getTaskSignals(full);
    const exposureSignals = this.getExposureSignals(full);
    const equipmentOrProcessSignals = this.getEquipmentOrProcessSignals(full);

    let profileSpecific: ApplicabilityProfileSpecific = this.genericApplicability(full);

    if (this.isMachineGuarding(full)) {
      profileSpecific = this.machineGuardingApplicability(full);
    } else if (this.isLockout(full)) {
      profileSpecific = this.lockoutApplicability(full);
    } else if (this.isElectrical(full)) {
      profileSpecific = this.electricalApplicability(full);
    } else if (this.isConfinedSpace(full)) {
      profileSpecific = this.confinedSpaceApplicability(full);
    } else if (this.isHazcom(full)) {
      profileSpecific = this.hazcomApplicability(full);
    } else if (this.isFallProtection(full)) {
      profileSpecific = this.fallProtectionApplicability(full);
    } else if (this.isSilica(full)) {
      profileSpecific = this.silicaApplicability(full);
    }

    const applicabilityFactsSupporting = unique([
      ...jurisdictionSignals,
      ...taskSignals,
      ...exposureSignals,
      ...equipmentOrProcessSignals,
      ...profileSpecific.supporting,
    ]);

    const applicabilityFactsMissing = unique([
      ...profileSpecific.missing,
      ...(input.evidenceSufficiency?.sufficientForStandardsRecommendation === false
        ? ['Evidence sufficiency layer indicates standards recommendation is not yet fully supported.']
        : []),
    ]);

    const status = this.getStatus({
      citation,
      supportingCount: applicabilityFactsSupporting.length,
      missingCount: applicabilityFactsMissing.length,
      nonApplicabilityCount: profileSpecific.nonApplicability.length,
    });

    return {
      citation,
      standardTitle,
      agencyOrAuthority,
      applicabilityStatus: status,
      confidence: this.getProfileConfidence(status, applicabilityFactsSupporting.length, applicabilityFactsMissing.length),
      jurisdictionSignals,
      taskSignals,
      exposureSignals,
      equipmentOrProcessSignals,
      applicabilityFactsSupporting,
      applicabilityFactsMissing,
      nonApplicabilityIndicators: unique(profileSpecific.nonApplicability),
      moreSpecificStandardConsiderations: unique(profileSpecific.moreSpecific),
      evidenceNeededBeforeCitation: unique(profileSpecific.evidenceNeeded),
      cautionBeforeUse: unique([
        ...profileSpecific.cautions,
        'Do not declare a violation from candidate matching alone.',
        'Confirm exact jurisdiction, task, exposure, equipment state, and standard text before final citation.',
      ]),
      recommendedUse: this.getRecommendedUse(status),
    };
  }

  private getJurisdictionSignals(text: string, agency: string): string[] {
    return unique([
      agency === 'MSHA' ? 'MSHA candidate standard detected.' : '',
      agency === 'OSHA' ? 'OSHA candidate standard detected.' : '',
      includesAny(text, ['30 cfr', 'mine', 'miner', 'msha']) ? 'Mining/MSHA context signal present.' : '',
      includesAny(text, ['29 cfr', 'osha', 'general industry']) ? 'OSHA/general industry context signal present.' : '',
      includesAny(text, ['construction', '1926']) ? 'OSHA construction context signal present.' : '',
    ]);
  }

  private getTaskSignals(text: string): string[] {
    return unique([
      includesAny(text, ['maintenance', 'service', 'repair', 'adjust', 'cleanup', 'troubleshoot'])
        ? 'Maintenance, service, cleanup, adjustment, or troubleshooting task signal present.'
        : '',
      includesAny(text, ['operation', 'operator', 'normal production'])
        ? 'Operation or normal production task signal present.'
        : '',
      includesAny(text, ['entry', 'entrant', 'attendant'])
        ? 'Confined-space entry task signal present.'
        : '',
      includesAny(text, ['cutting', 'grinding', 'drilling', 'welding'])
        ? 'Exposure-generating work activity signal present.'
        : '',
    ]);
  }

  private getExposureSignals(text: string): string[] {
    return unique([
      includesAny(text, ['employee', 'worker', 'miner', 'contractor', 'nearby', 'access'])
        ? 'Potential worker exposure signal present.'
        : '',
      includesAny(text, ['body-part access', 'reach', 'unguarded', 'exposed', 'contact'])
        ? 'Direct contact or access-to-hazard signal present.'
        : '',
      includesAny(text, ['airborne', 'dust', 'fume', 'vapor', 'gas', 'noise', 'heat'])
        ? 'Health exposure route signal present.'
        : '',
      includesAny(text, ['fall', 'edge', 'height', 'opening', 'scaffold', 'ladder'])
        ? 'Fall exposure signal present.'
        : '',
    ]);
  }

  private getEquipmentOrProcessSignals(text: string): string[] {
    return unique([
      includesAny(text, ['conveyor', 'pulley', 'rotating', 'machine', 'equipment'])
        ? 'Machine/equipment condition signal present.'
        : '',
      includesAny(text, ['energized', 'electrical', 'panel', 'breaker', 'conductor'])
        ? 'Electrical equipment/process signal present.'
        : '',
      includesAny(text, ['space', 'tank', 'vessel', 'silo', 'pit'])
        ? 'Restricted space/process vessel signal present.'
        : '',
      includesAny(text, ['chemical', 'container', 'sds', 'label', 'solvent'])
        ? 'Chemical container or hazard communication signal present.'
        : '',
    ]);
  }

  private machineGuardingApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['unguarded', 'missing guard', 'exposed', 'nip point', 'pinch point', 'rotating', 'pulley'])
          ? 'Moving machine part or point-of-operation hazard appears to be exposed.'
          : '',
        includesAny(text, ['employee', 'miner', 'worker', 'access', 'reach', 'nearby'])
          ? 'Employee access or proximity to moving parts is indicated.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['guard', 'unguarded', 'missing guard', 'exposed']) ? 'Guard condition is not documented.' : '',
        !includesAny(text, ['employee', 'miner', 'worker', 'access', 'reach', 'nearby']) ? 'Employee exposure or access path is not documented.' : '',
        !includesAny(text, ['operating', 'running', 'stopped', 'locked', 'de-energized']) ? 'Equipment operating/energy state is not documented.' : '',
      ]),
      nonApplicability: unique([
        includesAny(text, ['fully guarded', 'no access', 'not accessible']) ? 'Evidence may indicate employee contact is not reasonably possible.' : '',
      ]),
      moreSpecific: unique([
        includesAny(text, ['maintenance', 'service', 'repair', 'cleanup', 'adjust']) ? 'Lockout/tagout or hazardous-energy control may be a more specific or additional standard for the task.' : '',
      ]),
      evidenceNeeded: [
        'Photograph guard condition and access path.',
        'Document whether a worker can reach the moving part.',
        'Document equipment state during the observed task.',
      ],
      cautions: [
        'Do not rely on machine-guarding applicability without confirming employee access to hazardous motion.',
      ],
    };
  }

  private lockoutApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['maintenance', 'service', 'repair', 'adjust', 'cleanup', 'troubleshoot'])
          ? 'Service, maintenance, cleanup, adjustment, or troubleshooting task is indicated.'
          : '',
        includesAny(text, ['stored energy', 'hazardous energy', 'unexpected startup', 'energization', 'zero energy', 'lockout', 'tagout'])
          ? 'Hazardous energy, stored energy, unexpected startup, or energy-control signal is present.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['maintenance', 'service', 'repair', 'adjust', 'cleanup', 'troubleshoot']) ? 'Covered task type is not documented.' : '',
        !includesAny(text, ['energy source', 'stored energy', 'hazardous energy', 'electrical', 'mechanical', 'pressure']) ? 'Energy source list is missing.' : '',
        !includesAny(text, ['lockout', 'tagout', 'locked', 'tagged', 'try/test', 'zero energy']) ? 'Lock/tag and try/test verification are not documented.' : '',
      ]),
      nonApplicability: unique([
        includesAny(text, ['normal production', 'minor servicing', 'effective guarding alternative']) ? 'Task may require review for normal-production or minor-servicing exception/alternative controls.' : '',
      ]),
      moreSpecific: unique([
        includesAny(text, ['electrical', 'panel', 'energized']) ? 'Electrical safe work practices may also apply.' : '',
        includesAny(text, ['machine', 'guard', 'conveyor', 'pulley']) ? 'Machine guarding may also apply if hazardous motion is exposed during operation.' : '',
      ]),
      evidenceNeeded: [
        'Document task type and why energy control is needed.',
        'Identify all energy sources.',
        'Document isolation points, locks/tags, stored-energy release, and try/test verification.',
      ],
      cautions: [
        'Do not apply lockout/tagout solely because equipment exists; confirm service/maintenance or hazardous-energy exposure facts.',
      ],
    };
  }

  private electricalApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['electrical', 'energized', 'panel', 'breaker', 'conductor', 'arc flash'])
          ? 'Electrical equipment or energized component signal is present.'
          : '',
        includesAny(text, ['open', 'exposed', 'missing cover', 'damaged', 'access'])
          ? 'Exposure to electrical parts or deficient enclosure/access control is indicated.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['energized', 'de-energized', 'voltage', 'panel', 'breaker']) ? 'Electrical state and equipment type are not documented.' : '',
        !includesAny(text, ['qualified', 'authorized', 'access', 'cover', 'label']) ? 'Qualified-person/access/enclosure facts are missing.' : '',
      ]),
      nonApplicability: [],
      moreSpecific: ['Lockout/tagout may apply if work involves service, maintenance, or de-energization.'],
      evidenceNeeded: [
        'Document energized/de-energized state.',
        'Document covers, labels, access restriction, and qualified-person review.',
      ],
      cautions: ['Do not declare electrical applicability without confirming equipment state and exposure route.'],
    };
  }

  private confinedSpaceApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['confined space', 'permit space', 'entry', 'entrant', 'tank', 'silo', 'vessel'])
          ? 'Restricted/confined-space or entry signal is present.'
          : '',
        includesAny(text, ['oxygen', 'atmosphere', 'engulfment', 'rescue', 'ventilation'])
          ? 'Atmospheric, engulfment, ventilation, or rescue concern is indicated.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['entry', 'entrant', 'attendant']) ? 'Entry status and affected roles are not documented.' : '',
        !includesAny(text, ['atmosphere', 'oxygen', 'monitor', 'testing']) ? 'Atmospheric testing facts are missing.' : '',
        !includesAny(text, ['permit', 'rescue', 'ventilation', 'isolation']) ? 'Permit, rescue, ventilation, or isolation controls are not documented.' : '',
      ]),
      nonApplicability: ['If no employee entry occurs, full permit-entry applicability may require additional review.'],
      moreSpecific: ['Hot work, hazcom, respiratory protection, and lockout/tagout may also apply depending on task and hazards.'],
      evidenceNeeded: [
        'Document space configuration, entry status, atmospheric readings, isolation, ventilation, attendant, permit, and rescue plan.',
      ],
      cautions: ['Do not finalize confined-space applicability without entry and atmospheric/isolation facts.'],
    };
  }

  private hazcomApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['chemical', 'container', 'label', 'sds', 'solvent', 'unlabeled'])
          ? 'Chemical identity, label, SDS, or container signal is present.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['label', 'unlabeled', 'sds', 'chemical', 'container']) ? 'Chemical container/identity/label facts are missing.' : '',
        !includesAny(text, ['employee', 'worker', 'use', 'storage', 'handling']) ? 'Employee use, storage, or handling exposure facts are missing.' : '',
      ]),
      nonApplicability: [],
      moreSpecific: ['PPE, respiratory protection, fire protection, and exposure monitoring may also apply depending on chemical hazards.'],
      evidenceNeeded: [
        'Document container label, chemical identity, SDS availability, use/storage condition, and employee exposure potential.',
      ],
      cautions: ['Do not infer chemical hazard class without SDS, label, or reliable identity evidence.'],
    };
  }

  private fallProtectionApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['fall', 'edge', 'roof', 'height', 'opening', 'scaffold', 'ladder'])
          ? 'Fall exposure, elevated work, opening, ladder, or scaffold signal is present.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['height', 'feet', 'edge', 'opening', 'scaffold', 'ladder']) ? 'Work height or fall exposure geometry is missing.' : '',
        !includesAny(text, ['guardrail', 'cover', 'harness', 'anchor', 'fall protection']) ? 'Fall protection/control facts are missing.' : '',
      ]),
      nonApplicability: [],
      moreSpecific: ['Ladder, scaffold, walking-working surface, and rescue requirements may be more specific depending on the work setup.'],
      evidenceNeeded: [
        'Document work height, edge/opening exposure, access method, fall protection system, anchor/covers/guardrails, and rescue considerations.',
      ],
      cautions: ['Do not finalize fall citation without work height, exposure geometry, and control facts.'],
    };
  }

  private silicaApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['silica', 'respirable dust', 'cutting', 'grinding', 'drilling', 'concrete'])
          ? 'Respirable silica or dust-generating task signal is present.'
          : '',
      ]),
      missing: unique([
        !includesAny(text, ['silica', 'concrete', 'stone', 'dust']) ? 'Material/agent identity is missing.' : '',
        !includesAny(text, ['duration', 'sampling', 'exposure', 'monitoring', 'wet method', 'ventilation']) ? 'Exposure duration, sampling, or control basis is missing.' : '',
      ]),
      nonApplicability: [],
      moreSpecific: ['Respiratory protection, housekeeping, ventilation, and exposure monitoring may also apply.'],
      evidenceNeeded: [
        'Document task, material, duration, dust controls, respiratory protection, and sampling or objective exposure data where needed.',
      ],
      cautions: ['Do not declare exposure-limit compliance or noncompliance without adequate sampling/objective data.'],
    };
  }

  private genericApplicability(text: string): ApplicabilityProfileSpecific {
    return {
      supporting: unique([
        includesAny(text, ['employee', 'worker', 'miner', 'exposure', 'hazard']) ? 'General worker exposure or hazard signal is present.' : '',
      ]),
      missing: unique([
        'Specific applicability facts are limited; qualified review is required.',
      ]),
      nonApplicability: [],
      moreSpecific: [],
      evidenceNeeded: [
        'Document jurisdiction, task, exposed person, hazard mechanism, equipment/process state, and applicable controls.',
      ],
      cautions: [
        'Generic standard applicability is not enough for final citation selection.',
      ],
    };
  }

  private getStatus(input: {
    citation: string;
    supportingCount: number;
    missingCount: number;
    nonApplicabilityCount: number;
  }): SafeScopeRegulatoryApplicabilityStatus {
    if (input.citation === 'No candidate standard supplied') return 'insufficient_evidence';
    if (input.nonApplicabilityCount && input.supportingCount < 3) return 'likely_not_applicable';

    // LOTO applicability should remain conservative unless energy-control facts are complete.
    if (input.citation.includes('1910.147') && input.missingCount > 0) {
      return input.supportingCount >= 2 ? 'possibly_applicable' : 'insufficient_evidence';
    }

    // HazCom applicability should remain conservative unless chemical identity, container status,
    // labeling/SDS facts, workplace use, and jurisdiction are sufficiently documented.
    if (input.citation.includes('1910.1200') && input.missingCount > 0) {
      return input.supportingCount >= 2 ? 'possibly_applicable' : 'insufficient_evidence';
    }

    // Confined-space applicability should remain conservative unless entry, space configuration,
    // atmospheric/isolation hazards, permit status, attendant/rescue controls, and jurisdiction are sufficiently documented.
    if (input.citation.includes('1910.146') && input.missingCount > 0) {
      return input.supportingCount >= 2 ? 'possibly_applicable' : 'insufficient_evidence';
    }

    if (input.supportingCount >= 4 && input.missingCount <= 1) return 'likely_applicable';
    if (input.supportingCount >= 2) return 'possibly_applicable';
    return 'insufficient_evidence';
  }

  private getProfileConfidence(
    status: SafeScopeRegulatoryApplicabilityStatus,
    supportingCount: number,
    missingCount: number,
  ): SafeScopeRegulatoryApplicabilityConfidence {
    if (status === 'likely_applicable' && supportingCount >= 4 && missingCount <= 1) return 'high';
    if (status === 'insufficient_evidence' || missingCount >= 4) return 'low';
    return 'medium';
  }

  private getOverallConfidence(input: {
    profileCount: number;
    likelyCount: number;
    evidenceGapCount: number;
    unknownCitation: boolean;
  }): SafeScopeRegulatoryApplicabilityConfidence {
    if (input.unknownCitation || !input.profileCount) return 'low';
    if (input.likelyCount && input.evidenceGapCount <= 3) return 'high';
    if (input.evidenceGapCount >= 8) return 'low';
    return 'medium';
  }

  private getRecommendedUse(status: SafeScopeRegulatoryApplicabilityStatus): string {
    if (status === 'likely_applicable') {
      return 'Use as a strong candidate standard, pending qualified review and evidence confirmation.';
    }
    if (status === 'possibly_applicable') {
      return 'Use as a candidate for review; collect missing facts before relying on citation.';
    }
    if (status === 'likely_not_applicable') {
      return 'Do not rely on this standard without resolving non-applicability indicators.';
    }
    return 'Do not rely on this standard yet; evidence is insufficient.';
  }

  private isMachineGuarding(text: string): boolean {
    return includesAny(text, ['56.14107', '1910.212', 'machine guard', 'guarding', 'moving machine', 'nip point', 'pinch point', 'conveyor', 'pulley', 'rotating']);
  }

  private isLockout(text: string): boolean {
    return includesAny(text, ['1910.147', 'lockout', 'tagout', 'loto', 'hazardous energy', 'stored energy', 'unexpected startup', 'unexpected energization', 'zero energy']);
  }

  private isElectrical(text: string): boolean {
    return includesAny(text, ['electrical', 'energized', 'conductor', 'panel', 'arc flash', 'breaker', 'shock']);
  }

  private isConfinedSpace(text: string): boolean {
    return includesAny(text, ['1910.146', 'confined space', 'permit space', 'entrant', 'attendant', 'atmosphere', 'engulfment']);
  }

  private isHazcom(text: string): boolean {
    return includesAny(text, ['1910.1200', 'hazcom', 'hazard communication', 'chemical', 'sds', 'label', 'unlabeled']);
  }

  private isFallProtection(text: string): boolean {
    return includesAny(text, ['fall protection', 'fall', 'roof', 'edge', 'opening', 'scaffold', 'ladder', 'height']);
  }

  private isSilica(text: string): boolean {
    return includesAny(text, ['silica', 'respirable dust', 'concrete cutting', 'stone cutting', 'dry cutting']);
  }
}
