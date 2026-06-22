import { InspectionIntelligenceResult } from './inspection-intelligence.types';

export type CitationRankingResult = {
  suggestedStandards: any[];
  excludedStandards: any[];
};

function citationOf(candidate: any): string {
  return String(candidate?.citation || candidate?.standard || candidate?.id || '').trim();
}

function citationKey(candidate: any): string {
  return citationOf(candidate).toLowerCase().replace(/\s+/g, '');
}

function candidateText(candidate: any): string {
  return [candidate?.heading, candidate?.title, candidate?.summary, candidate?.plainLanguageSummary]
    .filter(Boolean).join(' ').toLowerCase();
}

function scopeFit(citation: string, scopes: string[]): boolean {
  if (!scopes.length || scopes.includes('all')) return true;
  if (scopes.includes('osha_general')) return /(?:29 CFR )?1910\./i.test(citation);
  if (scopes.includes('osha_construction')) return /(?:29 CFR )?1926\./i.test(citation);
  if (scopes.some((scope) => scope.startsWith('msha'))) return /(?:30 CFR )?(?:46|48|56|57|62|70|71|75|77)\./i.test(citation);
  return true;
}

export class InspectionCitationRankingService {
  rank(input: {
    observation: string;
    suggestedStandards: any[];
    excludedStandards: any[];
    inspectionIntelligence: InspectionIntelligenceResult;
    scopes: string[];
  }): CitationRankingResult {
    const observation = String(input.observation || '').toLowerCase();
    const directCandidates = input.inspectionIntelligence.candidateStandards;
    const directRanks = new Map(directCandidates.map((candidate, index) => [citationKey(candidate), index]));
    const ranked = input.suggestedStandards.map((candidate) => {
      const citation = citationOf(candidate);
      const key = citationKey(candidate);
      const text = candidateText(candidate);
      const reasons: string[] = [];
      const penalties: string[] = [];
      let score = Math.min(40, Math.max(0, Number(candidate?.score) || 0));
      let exclude = false;

      const directRank = directRanks.get(key);
      if (directRank !== undefined) {
        score += 220 - Math.min(80, directRank * 20);
        reasons.push(directRank === 0
          ? 'Direct inspection candidate for the primary observed condition and failed control.'
          : 'Inspection-specific candidate for a supported secondary hazard mechanism.');
      }

      if (scopeFit(citation, input.scopes)) {
        score += 35;
        reasons.push('Citation jurisdiction matches the selected regulatory scope.');
      } else {
        score -= 240;
        penalties.push('Citation jurisdiction does not match the selected regulatory scope.');
        exclude = true;
      }

      const evidenceFit = candidate?.evidenceFit;
      if (evidenceFit) {
        const fits = ['hazardDomainFit', 'mechanismFit', 'jurisdictionFit', 'requiredEvidencePresent', 'noDisqualifyingEvidence']
          .filter((field) => evidenceFit[field] === true).length;
        score += fits * 8;
        if (fits) reasons.push(`Legacy evidence-fit analysis satisfied ${fits} applicability factor(s).`);
      }

      this.applyDirectScenarioFit(observation, citation, reasons, penalties, (delta) => { score += delta; });

      const isPpe = /1910\.13[23478]|1926\.(?:9[5-9]|10[0-7])|(?:56|57)\.15/i.test(citation) || /personal protective equipment|eye and face|protective equipment/.test(text);
      const hasPpeIssue = /\b(ppe|safety glasses|goggles|face shield|gloves|respirator|hard hat|hearing protection)\b.*\b(missing|without|not worn|inadequate|damaged|wrong)\b|\b(without|no|missing)\b.*\b(ppe|goggles|face shield|gloves|respirator|hearing protection)\b/.test(observation);
      if (isPpe && !hasPpeIssue) {
        score -= 180; penalties.push('PPE is not the observed failed control.'); exclude = true;
      }

      const isTraining = /1910\.33[12]|1926\.21|30 CFR (?:46|48)\./i.test(citation) || /training|qualified persons/.test(text);
      const hasTrainingIssue = /\b(training|qualified person|authorized employee|certification|competency)\b.*\b(missing|not verified|unclear|expired|not trained|concern)\b/.test(observation);
      if (isTraining && !hasTrainingIssue) {
        score -= 150; penalties.push('Training or work-practice applicability is not the observed deficiency.');
      }

      const isWelding = /1910\.25[23]|1926\.35[0-4]|(?:56|57)\.46/i.test(citation) || /welding|cutting|hot work/.test(text);
      if (isWelding && !/\b(weld|welding|cutting|brazing|torch|hot work)\b/.test(observation)) {
        score -= 220; penalties.push('No welding, cutting, or hot-work context is described.'); exclude = true;
      }

      const isCompressedGas = /1910\.(?:101|104)|1926\.350|(?:56|57)\.1600[56]/i.test(citation) || /compressed gas|gas cylinder|oxygen cylinder/.test(text);
      if (isCompressedGas && !/\b(compressed gas|gas cylinder|oxygen cylinder|acetylene cylinder|cylinder|oxygen system)\b/.test(observation)) {
        score -= 220; penalties.push('No compressed-gas cylinder or gas-system evidence is described.'); exclude = true;
      }

      const isElectricalPhysicalCondition = /\b(panel|breaker|enclosure|cover plate|filler plate|energized parts?|live parts?|conductor|cord|wiring|power strip|receptacle)\b/.test(observation);
      const isBroadElectrical = /1910\.301(?:\b|\()|1910\.331(?:\b|\()/.test(citation) || /scope|definitions?/.test(text);
      if (isElectricalPhysicalCondition && isBroadElectrical) {
        score -= 110; penalties.push('Broad electrical scope/work-practice language is supporting context, not the direct physical-condition candidate.');
      }

      const isSpecialPurposeElectrical = /1910\.306(?:\b|\()/.test(citation);
      const hasSpecialPurposeEquipment = /\b(sign|outline lighting|crane|hoist|elevator|dumbwaiter|escalator|moving walk|welder|welding machine|x-ray|induction heating|dielectric heating|electrolytic cell)\b/.test(observation);
      if (isSpecialPurposeElectrical && !hasSpecialPurposeEquipment) {
        score -= 230; penalties.push('Specific-purpose electrical equipment covered by this family is not identified.'); exclude = true;
      }

      const definitionOnly = /\bdefinition(s)?\b/.test(text) || /\.2\b/.test(citation) && /definition/.test(text);
      if (definitionOnly) {
        score -= 140; penalties.push('Definition-only material is supporting context rather than the direct requirement.');
      }

      const isWalkingSurfaceCitation = /1910\.22|1926\.25|(?:56|57)\.(?:20003|11001)/.test(citation);
      const hasWalkingSurfaceFailure = /\b(walkway|floor|aisle|travelway|walking surface|passageway)\b.*\b(wet|oil|spill|slip|trip|debris|clutter|blocked|obstructed|uneven|hole)\b|\b(wet|oil|spill|slip|trip|debris|clutter|blocked|obstructed|uneven|hole)\b.*\b(walkway|floor|aisle|travelway|walking surface|passageway)\b/.test(observation);
      if (isWalkingSurfaceCitation && !hasWalkingSurfaceFailure) {
        score -= 210; penalties.push('No walking-surface, housekeeping, access-route, or same-level-fall condition supports this family.'); exclude = true;
      }

      const enriched = {
        ...candidate,
        score,
        directnessScore: score,
        matchingReasons: [...new Set([...(candidate?.matchingReasons || []), ...reasons, ...penalties.map((reason) => `Demoted: ${reason}`)])],
        evidenceFitReasons: reasons,
        citationRanking: {
          directCandidate: directRank !== undefined,
          directCandidateRank: directRank,
          directnessScore: score,
          evidenceFitReasons: reasons,
          penalties,
          outrankedBroaderCandidates: directRank === 0,
          advisoryOnly: true,
        },
      };
      return { candidate: enriched, exclude, penalties };
    });

    const active = ranked.filter((item) => !item.exclude)
      .sort((left, right) => right.candidate.directnessScore - left.candidate.directnessScore)
      .map((item) => item.candidate);
    const newlyExcluded = ranked.filter((item) => item.exclude).map((item) => ({
      ...item.candidate,
      candidateStatus: 'needs_more_evidence',
      exclusionReason: item.penalties.join(' '),
    }));
    const topScore = active[0]?.directnessScore;
    const explained = active.map((candidate, index) => ({
      ...candidate,
      citationRanking: {
        ...candidate.citationRanking,
        outrankedBroaderCandidates: index === 0 && active.some((other) => other !== candidate && other.directnessScore < topScore),
      },
    }));

    return {
      suggestedStandards: explained.slice(0, 5),
      excludedStandards: [...input.excludedStandards, ...newlyExcluded]
        .filter((candidate, index, values) => values.findIndex((item) => citationKey(item) === citationKey(candidate)) === index),
    };
  }

  private applyDirectScenarioFit(
    observation: string,
    citation: string,
    reasons: string[],
    penalties: string[],
    adjust: (delta: number) => void,
  ) {
    const direct = (pattern: RegExp, citations: RegExp, label: string) => {
      if (!pattern.test(observation)) return;
      if (citations.test(citation)) { adjust(150); reasons.push(label); }
    };
    direct(/\b(open breaker slot|missing (?:panel )?cover|missing cover plate|exposed (?:live|energized) parts?|open electrical panel)\b/, /1910\.303\(g\)\(2\)\(i\)|1926\.403\(i\)\(2\)\(i\)|(?:56|57)\.12032/, 'Direct match: exposed energized parts and enclosure/cover guarding.');
    direct(/\b(blocked|obstructed|storage|pallets?|boxes?)\b.*\b(panel|disconnect|switchboard)\b|\b(panel|disconnect|switchboard)\b.*\b(blocked|obstructed|clearance)\b/, /1910\.303\(g\)\(1\)|1926\.403\(i\)\(1\)|(?:56|57)\.12004/, 'Direct match: electrical equipment access and working-space obstruction.');
    direct(/\b(damaged|frayed|cut|exposed insulation)\b.*\bcord\b|\bcord\b.*\b(damaged|frayed|cut|wet)\b/, /1910\.(?:305\(g\)|334\(a\)\(2\)\(ii\))|1926\.(?:404\(b\)\(1\)\(ii\)|405)/, 'Direct match: flexible-cord condition, use, and electrical exposure.');
    direct(/\b(daisy[- ]chain|power strip|temporary wiring|overloaded extension)\b/, /1910\.305\(g\)|1926\.405/, 'Direct match: flexible or temporary wiring configuration.');
    direct(/\b(rotating shaft|rotating coupling|exposed shaft|unguarded shaft)\b/, /1910\.219|1910\.212|1926\.300|(?:56|57)\.14107/, 'Direct match: exposed rotating machine component.');
    direct(/\b(conveyor|tail pulley|head pulley|nip point)\b.*\b(guard|unguarded|missing|exposed|cleanup)\b/, /1910\.212|1926\.300|(?:56|57)\.14107|(?:56|57)\.12016/, 'Direct match: conveyor guarding or servicing exposure.');
    direct(/\bpoint of operation\b/, /1910\.212\(a\)\(3\)|1926\.300/, 'Direct match: point-of-operation guarding.');
    direct(/\b(wet|oil|spill|slippery)\b.*\b(floor|walkway|aisle)\b/, /1910\.22|1926\.25|(?:56|57)\.20003/, 'Direct match: walking-working surface contamination.');
    direct(/\b(floor hole|floor opening|open hole|uncovered opening)\b/, /1910\.(?:28|29)|1926\.50[12]|(?:56|57)\.11012/, 'Direct match: floor-opening cover or guard protection.');
    direct(/\b(platform|edge)\b.*\b(without|missing|no|unguarded)\b.*\b(guardrail|fall protection|fall arrest)\b/, /1910\.28|1926\.501|(?:56|57)\.15005/, 'Direct match: elevated edge/platform fall protection.');
    direct(/\b(damaged|broken|defective)\b.*\bladder\b|\bladder\b.*\b(damaged|broken|defective)\b/, /1910\.23|1926\.1053|(?:56|57)\.11011/, 'Direct match: ladder condition and continued use.');
    direct(/\b(unlabeled|no label|missing label)\b.*\b(chemical|container|drum|bottle)\b/, /1910\.1200|1926\.59/, 'Direct match: workplace chemical-container labeling.');
    direct(/\b(crusher|screen|drill)\b.*\bnoise\b|\bnoise exposure\b.*\bcrusher\b/, /30 CFR 62\./, 'Direct match: mining occupational-noise exposure and monitoring.');

    if (/\bpanel|breaker|enclosure\b/.test(observation) && /1910\.306/.test(citation)) {
      penalties.push('General panel/breaker evidence does not establish specific-purpose electrical equipment.');
    }
  }
}
