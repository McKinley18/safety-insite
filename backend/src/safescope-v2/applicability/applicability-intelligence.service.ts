export type ApplicabilityStandard = {
  citation?: string;
  heading?: string;
  title?: string;
  summary?: string;
  rationale?: string;
  text?: string;
  score?: number;
  source?: string | string[];
  matchingReasons?: string[];
  [key: string]: any;
};

export class ApplicabilityIntelligenceService {
  evaluate(input: {
    text: string;
    classification: string;
    expandedContext?: any;
    operationalReasoning?: any;
    energyTransferIntelligence?: any;
    barrierIntelligence?: any;
    evidenceQuality?: any;
    suggestedStandards?: ApplicabilityStandard[];
    agencyMode?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();
    const standards = input.suggestedStandards || [];

    const contextTokens = [
      classification,
      text,
      String(input.expandedContext?.environment || ''),
      String(input.expandedContext?.location || ''),
      String(input.expandedContext?.activity || ''),
      String(input.operationalReasoning?.summary || ''),
      String(input.energyTransferIntelligence?.dominantEnergySource || ''),
      String(input.barrierIntelligence?.barrierAdequacy || ''),
    ].join(' ').toLowerCase();

    const phase = this.detectOperationalPhase(contextTokens);
    const exposure = this.detectExposureEvidence(contextTokens);
    const jurisdiction = this.detectJurisdiction(contextTokens, input.agencyMode);

    const scored = standards.map((standard) => {
      const standardText = [
        standard.citation,
        standard.heading,
        standard.title,
        standard.summary,
        standard.rationale,
        standard.text,
        ...(standard.matchingReasons || []),
      ].join(' ').toLowerCase();

      const reasons: string[] = [];
      const exclusions: string[] = [];
      let score = Number(standard.score || 0);

      const citation = String(standard.citation || '').toLowerCase();

      if (jurisdiction === 'msha' && citation.includes('30 cfr')) {
        score += 30;
        reasons.push('MSHA jurisdiction aligns with 30 CFR citation.');
      }

      if (jurisdiction === 'osha-general' && citation.includes('1910')) {
        score += 25;
        reasons.push('OSHA general industry jurisdiction aligns with 29 CFR 1910 citation.');
      }

      if (jurisdiction === 'osha-construction' && citation.includes('1926')) {
        score += 25;
        reasons.push('OSHA construction jurisdiction aligns with 29 CFR 1926 citation.');
      }

      if (this.hasGuardingIndicators(contextTokens) && this.hasGuardingIndicators(standardText)) {
        score += 35;
        reasons.push('Machine guarding indicators align with the observed exposure.');
      }

      if (this.hasLotoIndicators(contextTokens) && this.hasLotoIndicators(standardText)) {
        score += 30;
        reasons.push('Servicing, maintenance, or energy-control indicators support LOTO applicability.');
      }

      if (this.hasElectricalIndicators(contextTokens) && this.hasElectricalIndicators(standardText)) {
        score += 30;
        reasons.push('Electrical exposure indicators align with the standard context.');
      }

      if (this.hasHousekeepingIndicators(contextTokens) && this.hasHousekeepingIndicators(standardText)) {
        score += 35;
        reasons.push('Housekeeping, material accumulation, or walking-working surface indicators align with the observed condition.');
      }

      if (this.hasAccessIndicators(contextTokens) && this.hasAccessIndicators(standardText)) {
        score += 25;
        reasons.push('Catwalk, walkway, travelway, or access indicators support safe-access applicability.');
      }

      if (this.hasConfinedSpaceIndicators(contextTokens) && this.hasConfinedSpaceIndicators(standardText)) {
        score += 30;
        reasons.push('Confined space indicators align with the standard context.');
      }

      if (exposure.workerExposure) {
        score += 15;
        reasons.push('Worker exposure or access to the hazard is indicated.');
      } else {
        score -= 15;
        exclusions.push('Worker exposure is not clearly established.');
      }

      if (phase === 'maintenance' && this.hasLotoIndicators(standardText)) {
        score += 20;
        reasons.push('Maintenance/servicing phase increases energy-control applicability.');
      }

      if (phase === 'production' && this.hasGuardingIndicators(standardText)) {
        score += 15;
        reasons.push('Production/operation phase increases guarding applicability.');
      }

      if (this.hasConfinedSpaceIndicators(standardText) && !this.hasConfinedSpaceIndicators(contextTokens)) {
        score -= 35;
        exclusions.push('Permit-required confined space conditions are not sufficiently established.');
      }

      if (this.hasTrenchingIndicators(standardText) && !this.hasTrenchingIndicators(contextTokens)) {
        score -= 35;
        exclusions.push('Excavation or trenching conditions are not sufficiently established.');
      }

      if (this.hasLotoIndicators(standardText) && !this.hasLotoIndicators(contextTokens)) {
        score -= 20;
        exclusions.push('Energy-control or servicing conditions are not sufficiently established.');
      }

      if (this.hasElectricalIndicators(standardText) && !this.hasElectricalIndicators(contextTokens)) {
        score -= 20;
        exclusions.push('Electrical exposure conditions are not sufficiently established.');
      }

      if (this.hasAccessIndicators(standardText) && !this.hasAccessIndicators(contextTokens)) {
        score -= 10;
        exclusions.push('Safe-access or travelway conditions are not strongly established.');
      }

      const applicabilityConfidence = Math.max(0, Math.min(100, score));

      return {
        ...standard,
        applicabilityScore: applicabilityConfidence,
        applicabilityReasons: reasons,
        exclusionReasons: exclusions,
        applicabilityBand:
          applicabilityConfidence >= 70
            ? 'primary'
            : applicabilityConfidence >= 45
              ? 'supporting'
              : 'excluded',
      };
    });

    const primaryApplicableStandards = scored
      .filter((standard) => standard.applicabilityBand === 'primary')
      .sort((a, b) => b.applicabilityScore - a.applicabilityScore)
      .slice(0, 3);

    const supportingStandards = scored
      .filter((standard) => standard.applicabilityBand === 'supporting')
      .sort((a, b) => b.applicabilityScore - a.applicabilityScore)
      .slice(0, 5);

    const excludedStandards = scored
      .filter((standard) => standard.applicabilityBand === 'excluded')
      .sort((a, b) => b.applicabilityScore - a.applicabilityScore)
      .slice(0, 8);

    const allScores = scored.map((standard) => standard.applicabilityScore);
    const applicabilityConfidence = allScores.length
      ? Math.round(allScores.reduce((sum, value) => sum + value, 0) / allScores.length)
      : 0;

    return {
      jurisdiction,
      operationalPhase: phase,
      exposureEvidence: exposure,
      applicabilityConfidence,
      primaryApplicableStandards,
      supportingStandards,
      excludedStandards,
      reasoning: [
        `Detected jurisdiction: ${jurisdiction}.`,
        `Detected operational phase: ${phase}.`,
        exposure.workerExposure
          ? 'Worker exposure evidence is present.'
          : 'Worker exposure evidence is limited or missing.',
      ],
    };
  }

  private detectJurisdiction(text: string, agencyMode?: string) {
    const agency = String(agencyMode || '').toLowerCase();

    if (agency.includes('msha') || text.includes('mine') || text.includes('msha')) return 'msha';
    if (agency.includes('construction') || text.includes('construction') || text.includes('excavation')) return 'osha-construction';
    return 'osha-general';
  }

  private detectOperationalPhase(text: string) {
    if (/(maintenance|servicing|repair|cleaning|jam|troubleshoot|lockout|tagout|loto)/.test(text)) return 'maintenance';
    if (/(startup|start up|commissioning)/.test(text)) return 'startup';
    if (/(shutdown|shut down)/.test(text)) return 'shutdown';
    if (/(operating|operation|running|production|conveyor|equipment in use)/.test(text)) return 'production';
    return 'unknown';
  }

  private detectExposureEvidence(text: string) {
    const workerExposure = /(employee|worker|miner|operator|person|personnel|exposed|access|near|beside|line of fire|contact|reach)/.test(text);

    return {
      workerExposure,
      exposureType: workerExposure ? 'direct_or_potential_worker_exposure' : 'not_clearly_established',
    };
  }

  private hasGuardingIndicators(text: string) {
    return /(guard|guarding|unguarded|moving part|rotating|nip point|pinch point|conveyor|belt|pulley|shaft|machine)/.test(text);
  }

  private hasLotoIndicators(text: string) {
    return /(lockout|tagout|loto|deenergize|energized|energy isolation|servicing|maintenance|unexpected startup|stored energy)/.test(text);
  }

  private hasElectricalIndicators(text: string) {
    return /(electrical|energized|panel|breaker|arc flash|conductor|wiring|voltage|shock)/.test(text);
  }

  private hasConfinedSpaceIndicators(text: string) {
    return /(confined space|permit required|tank|vessel|silo|atmosphere|engulfment|limited entry|limited exit)/.test(text);
  }


  private hasHousekeepingIndicators(text: string) {
    return /(housekeeping|material accumulation|accumulation|build up|buildup|spillage|spill|debris|mud|dust|rocks|aggregate|trash|clean|orderly|slip|trip|walking-working|walking working)/.test(text);
  }

  private hasAccessIndicators(text: string) {
    return /(catwalk|walkway|travelway|passageway|platform|stairs|ladder|access|egress|walking-working|walking working)/.test(text);
  }

  private hasTrenchingIndicators(text: string) {
    return /(trench|excavation|cave-in|spoil pile|protective system|shoring|sloping)/.test(text);
  }
}
