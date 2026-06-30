import { InspectionIntelligenceResult } from './inspection-intelligence.types';

export type CitationRankingResult = {
  suggestedStandards: any[];
  supportingStandards: any[];
  needsMoreEvidenceStandards: any[];
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

function familyCoherencePattern(primaryFamily: string): RegExp | null {
  const family = String(primaryFamily || '').toLowerCase();
  if (!family) return null;
  if (family.includes('electrical')) {
    return /(?:1910\.(?:301|303|305|306|331|333|334)|1926\.(?:403|404|405)|(?:56|57)\.(?:12004|12013|12016|12032|12034|12037)|electrical|cord|cable|wire|panel|breaker|enclosure|live parts?|energized|work practices?)/i;
  }
  if (family.includes('hazard_communication') || family.includes('hazcom') || family.includes('chemical')) {
    return /(?:1910\.1200|1926\.59|47\.|hazard communication|hazcom|chemical|container|label|sds|spill|leak|release|drain|used oil|waste oil|unknown substance|unknown contents)/i;
  }
  if (family.includes('walking_working_surfaces') || family.includes('housekeeping') || family.includes('slip_trip_fall')) {
    return /(?:1910\.(?:22|23|28|29)|1926\.25|(?:56|57)\.(?:20003|11001)|walking-working surfaces|housekeeping|floor|walkway|aisle|travelway|slip|trip|fall|hole|opening|guardrail|ladder|egress|debris|spill|release|residue)/i;
  }
  if (family.includes('machine_guarding')) {
    return /(?:1910\.(?:212|219|147)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|lockout|tagout|servicing|unexpected startup|hazardous energy)/i;
  }
  if (family.includes('scaffold')) {
    return /(?:1926\.451|1926\.502|1926\.503|1926\.454|scaffold|scaffolding|platform|guardrail|midrail|toprail|plank|mudsill|toe board|toeboard)/i;
  }
  if (family.includes('mobile_equipment')) {
    return /(?:1910\.178|1926\.(?:601|602)|30 CFR 56\.9100|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|berm|route|blind corner)/i;
  }
  if (family.includes('fall_protection')) {
    return /(?:1910\.(?:28|29)|1926\.501|guardrail|platform|edge|roof|fall protection|fall arrest|aerial lift|scaffold|ladder)/i;
  }
  if (family.includes('fire_explosion') || family.includes('fire_protection') || family.includes('welding_cutting_hot_work')) {
    return /(?:1910\.252|1926\.352|(?:56|57)\.46|fire watch|hot work|welding|cutting|brazing|torch|combustible|ignition|natural gas|gas odor|gas leak|explosion|flame|spark|fuel gas)/i;
  }
  if (family.includes('compressed_gas')) {
    return /(?:1910\.101|1926\.350|(?:56|57)\.1600[56]|compressed gas|cylinder|oxygen|acetylene|valve cap|regulator)/i;
  }
  if (family.includes('confined_space')) {
    return /(?:1910\.146|1926\.1203|confined space|permit space|tank|vessel|manhole|atmosphere|oxygen deficiency|entry)/i;
  }
  if (family.includes('industrial_hygiene') || family.includes('health_') || family.includes('noise_exposure') || family.includes('respirable_dust_silica')) {
    return /(?:1910\.95|1926\.52|62\.110|1910\.1053|1926\.1153|silica|dust|noise|hearing|hearing conservation|dosimetry|fume|vapour|vapor|heat|cold|respirator|welding|solvent|ventilation)/i;
  }
  return null;
}

function scopeFit(citation: string, scopes: string[]): boolean {
  if (!scopes.length || scopes.includes('all')) return true;
  if (scopes.includes('osha_general') || scopes.includes('osha_general_industry')) return /(?:29 CFR )?1910\./i.test(citation);
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
    const primaryHazardFamily = String(
      input.inspectionIntelligence?.standardApplicability?.matchedRules?.[0]?.hazardFamily ||
      input.inspectionIntelligence?.hazardCandidates?.find((candidate) => candidate?.role === 'primary')?.domain ||
      (input.inspectionIntelligence?.candidateStandards?.[0] as any)?.hazardFamily ||
      ''
    ).toLowerCase();
    const needsMoreEvidencePattern = familyCoherencePattern(primaryHazardFamily);
    const hasSpillReleaseEvidence = /\b(used[- ]oil|waste[- ]oil|oily waste|oily residue|oil spill|spill|spilled|leak|leaking|release|residue|residual)\b/i.test(observation);
    const hasSurfaceOrDrainPathway = /\b(floor|walkway|aisle|travelway|walking surface|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain|floor drain|storm drain|soil|water)\b/i.test(observation);
    const hasHazComIdentityEvidence = /\b(unlabeled|no label|missing label|unknown chemical|chemical identity|sds|hazcom|hazard communication|secondary container)\b/i.test(observation);
    const hasSpillReleasePathway = hasSpillReleaseEvidence && hasSurfaceOrDrainPathway;
    const hasConfinedSpaceEvidence =
      /\b(confined space|permit space|manhole|vault|pit)\b/i.test(observation) ||
      (/\b(tank|vessel)\b/i.test(observation) && /\b(entry|enter|inside|permit|required|atmosphere|oxygen deficiency|oxygen deficient|toxic atmosphere)\b/i.test(observation));
    const hasServicingEnergyEvidence =
      /\b(lockout|loto|tagout|unexpected startup|hazardous energy|energy isolation|de-energized|isolated)\b/i.test(observation) ||
      (/\b(maintenance|servicing|cleaning machine|clearing jam|unjamming)\b/i.test(observation) && /\b(machine|equipment|conveyor|motor|circuit|press|pump|energized|powered)\b/i.test(observation));
    const hasHornEvidence = /\b(horn|horns|backup alarm|backup alarms|audible warning)\b/i.test(observation);
    const hasHotWorkEvidence = /\b(hot work|welding|cutting|brazing|torch|fuel gas)\b/i.test(observation);
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
      if (isCompressedGas && !/\b(compressed gas|gas cylinder|oxygen cylinder|acetylene cylinder|cylinders?|cylinder|oxygen system)\b/i.test(observation)) {
        score -= 220; penalties.push('No compressed-gas cylinder or gas-system evidence is described.'); exclude = true;
      }
      if (/1926\.350/i.test(citation) && !hasHotWorkEvidence) {
        score -= 220;
        penalties.push('Welding or hot-work evidence is not established for this fuel-gas standard.');
        exclude = true;
      }

      const isElectricalPhysicalCondition = /\b(panel|breaker|enclosure|cover plate|filler plate|energized parts?|live parts?|conductor|cord|wiring|power strip|receptacle)\b/.test(observation);
      const isBroadElectrical = /1910\.301(?:\b|\()|1910\.331(?:\b|\()/.test(citation) || /scope|definitions?/.test(text);
      if (isElectricalPhysicalCondition && isBroadElectrical) {
        score -= 110; penalties.push('Broad electrical scope/work-practice language is supporting context, not the direct physical-condition candidate.');
      }
      const isBroadElectricalScopeCitation = /1910\.303\(b\)\(1\)|1910\.301|1910\.331/.test(citation);
      if (isBroadElectricalScopeCitation) {
        const hasDirectElectricalEvidence = /\b(open breaker slot|missing cover|panel|breaker|cord|cable|wiring|receptacle|outlet|plug|conductor|energized|live parts?|shock|arc flash|damaged insulation)\b/i.test(observation);
        if (!hasDirectElectricalEvidence) {
          score -= 230;
          penalties.push('Broad electrical scope/work-practice language is not the observed deficiency without direct electrical evidence.');
          exclude = true;
        } else if (!/\b(open breaker slot|missing cover|open electrical panel|damaged cord|frayed cord|exposed conductor|live parts?|arc flash)\b/i.test(observation)) {
          score -= 120;
          penalties.push('Broad electrical scope language is supporting context only for a direct electrical condition.');
        }
      }

      const isCordDamageObservation =
        /\b(damaged|frayed|cut|exposed insulation|exposed conductor)\b.*\b(cord|cable|extension cord|power cord)\b|\b(cord|cable|extension cord|power cord)\b.*\b(damaged|frayed|cut|exposed insulation|exposed conductor)\b/.test(observation);
      const cordUseStatus = /\b(energized|in use|used|plugged|connected|remains|still)\b/.test(observation);
      if (isCordDamageObservation) {
        if (/1910\.303\(g\)\(2\)\(i\)/.test(citation)) {
          score -= 240;
          penalties.push('Live-parts guarding citation is not the direct damaged-cord condition without exposed enclosure parts.');
          exclude = true;
        }
        if (/1910\.305\(g\)\(1\)\(iii\)|1910\.305\(g\)(?!\()/i.test(citation)) {
          score -= 140;
          penalties.push('Broad flexible-cord parent/subsection is supporting context rather than the direct damaged-cord citation.');
        }
        if (/1910\.334\(a\)\(2\)\(ii\)/.test(citation)) {
          if (cordUseStatus) {
            score += 45;
            reasons.push('Direct match: defective portable electric equipment remains in use.');
          } else {
            score -= 90;
            penalties.push('Portable electric equipment remaining-in-use context is not established.');
          }
        }
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
      const hasWalkingSurfaceFailure = /\b(walkway|floor|aisle|travelway|walking surface|passageway)\b.*\b(wet|oil|spill|slip|trip|debris|clutter|blocked|obstructed|uneven|hole|leak|leaking|release|residue|oily)\b|\b(wet|oil|spill|slip|trip|debris|clutter|blocked|obstructed|uneven|hole|leak|leaking|release|residue|oily)\b.*\b(walkway|floor|aisle|travelway|walking surface|passageway)\b/.test(observation);
      if (isWalkingSurfaceCitation && !hasWalkingSurfaceFailure) {
        score -= 210; penalties.push('No walking-surface, housekeeping, access-route, or same-level-fall condition supports this family.'); exclude = true;
      }

      const hasScaffoldEvidence = /\bscaffold|scaffolding|guardrail|midrail|toprail|plank|mudsill|toe board|toeboard\b/i.test(observation);
      if (hasScaffoldEvidence) {
        if (/1926\.451/.test(citation)) {
          score += 190;
          reasons.push('Direct match: scaffold platform guardrail or access deficiency.');
        }
        if (/1926\.502|1926\.503|1926\.454/.test(citation)) {
          score += 55;
          reasons.push('Supporting scaffold fall-protection or training context.');
        }
        if (/(1910\.28|1910\.29|1926\.501)/.test(citation)) {
          score -= 120;
          penalties.push('Broad fall-protection language is supporting context when scaffold-specific requirements are present.');
        }
      }

      const hasNoiseEvidence = /\b(noise|loud|hearing|hearing conservation|dosimetry|crusher noise|grinder noise|jackhammer noise)\b/i.test(observation);
      if (hasNoiseEvidence) {
        if (/1910\.95|1926\.52|62\.110/.test(citation)) {
          score += 170;
          reasons.push('Direct match: occupational noise exposure or hearing-conservation assessment.');
        }
        if (/1910\.132|1926\.95/.test(citation) && !/\b(noise|hearing|dosimetry|grinder|crusher|jackhammer)\b/i.test(observation)) {
          score -= 110;
          penalties.push('PPE is supporting context, not the primary noise-exposure citation.');
        }
      }

      const hasSilicaEvidence = /\b(silica|respirable dust|dust cloud|crusher dust|aggregate dust|grinder dust|crusher|grinder)\b/i.test(observation);
      if (hasSilicaEvidence) {
        if (/1910\.1053|1926\.1153|56\.5002|56\.5005/.test(citation)) {
          score += 180;
          reasons.push('Direct match: respirable crystalline silica or dusty mineral exposure.');
        }
        if (/1910\.132|1926\.95/.test(citation) && /\b(no|without|missing|inadequate)\b.*\b(ppe|respirator|mask|goggles|face shield)\b/i.test(observation)) {
          score -= 90;
          penalties.push('PPE is supporting context and should not outrank silica exposure controls.');
        }
      }

      if (hasHotWorkEvidence) {
        if (/1910\.252|1926\.352|56\.46/.test(citation)) {
          score += 165;
          reasons.push('Direct match: hot work or welding with combustible ignition concern.');
        }
        if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !/\b(servicing|maintenance|unjam|jam|energy isolation|lockout)\b/i.test(observation)) {
          score -= 170;
          penalties.push('Hazardous-energy control is not the primary citation family without servicing or energy-isolation evidence.');
          exclude = true;
        }
        if (/1910\.146|1926\.1203|(?:56|57)\.18001/.test(citation)) {
          score -= 120;
          penalties.push('Hot work does not establish confined-space applicability without entry or atmospheric evidence.');
        }
      }

      const hasGasOdorEvidence = /\b(natural gas odor|smell of gas|gas odor|gas leak|gas smell)\b/i.test(observation);
      if (hasGasOdorEvidence) {
        if (/1910\.101|1926\.350|(?:56|57)\.1600[56]/.test(citation)) {
          score -= 220;
          penalties.push('Generic gas odor is not compressed-gas-cylinder storage.');
          exclude = true;
        }
        if (/fire_protection|fire|explosion|ventilation|fuel gas|odor/i.test(String(input.inspectionIntelligence?.hazardCandidates?.[0]?.domain || primaryHazardFamily || ''))) {
          score += 110;
          reasons.push('Direct match: gas odor or leak requires ignition and ventilation review.');
        }
      }

      const isMobileEquipmentCitation = /1910\.178(?:\(p\)\(1\)|\(l\))?|1926\.602|30 CFR 56\.9100(?:\(a\))?/i.test(citation);
      if (isMobileEquipmentCitation) {
        const hasMobileTrafficEvidence = /\b(forklift|loader|haul truck|truck|vehicle|mobile equipment|traffic control|equipment passes|backing|spotter|pedestrian|blind corner|haul road|same aisle|same route|no traffic control|right of way)\b/i.test(observation);
        if (!hasMobileTrafficEvidence) {
          score -= 230;
          penalties.push('Mobile equipment or traffic-control evidence is not established for this citation.');
          exclude = true;
        }
      }

      const hasFloorOpening = /\b(floor hole|floor opening|open hole|uncovered opening|skylight)\b/.test(observation);
      const isFloorOpeningCitation = /1910\.28|1910\.29|1926\.50[12]|(?:56|57)\.11012/.test(citation);
      if (hasFloorOpening) {
        if (isFloorOpeningCitation) {
          score += 180;
          reasons.push('Direct match: floor opening or hole requires cover, guarding, or fall protection.');
        }
        if (isWalkingSurfaceCitation) {
          score -= 90;
          penalties.push('Walking-surface contamination is secondary when the observation describes an opening or hole.');
        }
      }

      const isHousekeepingTripText = /(trip|slip|grease|cords|floor passageway|passageway|housekeeping|walking surface|obstruction|clutter|boxes|scrap|debris|hallway)/i.test(observation);
      const isHousekeepingTripCitation = /1910\.22\(a\)\(3\)|1926\.25\(a\)|(?:56|57)\.20003\(a\)/.test(citation);
      if (isHousekeepingTripText) {
        if (isHousekeepingTripCitation) {
          score += 165;
          reasons.push('Direct match: housekeeping/trip hazard across a walking or travel path.');
        }
        if (/1910\.22\(a\)$/i.test(citation)) {
          score += 45;
          reasons.push('Housekeeping is relevant, but the subsection-level citation is more specific.');
        }
      }

      const isHazcomCitation = /1910\.1200|1926\.59|47\./i.test(citation) || /hazard communication|label/i.test(text);
      const isWalkingSurfaceOrReleaseCitation = /1910\.22|1926\.25|(?:56|57)\.(?:20003|4102|11001)/.test(citation) || /(spill|release|containment)/i.test(text);
      const isFlammableLiquidCitation = /1910\.106|1926\.152|(?:56|57)\.4100?/i.test(citation) || /flammable liquid|flammable-liquid|combustible liquid/i.test(text);
      if (hasSpillReleasePathway) {
        if (isWalkingSurfaceOrReleaseCitation) {
          score += 180;
          reasons.push('Direct match: spill or release contaminating a walking surface or release path.');
        }
        if (/56\.4102|57\.4102/i.test(citation) || /(spill|release|containment)/i.test(text)) {
          score += 85;
          reasons.push('Direct match: release control for material reaching a drain, soil, or water pathway.');
        }
        if (isHazcomCitation) {
          score -= 170;
          penalties.push('HazCom labeling is supporting context only when the dominant exposure pathway is contaminated walking surface or release control.');
          if (!hasHazComIdentityEvidence) {
            score -= 40;
            penalties.push('HazCom identity evidence is not present.');
          }
        }
        if (isFlammableLiquidCitation && !/\b(flammable|combustible|flash point|ignition|vapor|fuel|gasoline|solvent)\b/i.test(observation)) {
          score -= 120;
          penalties.push('Flammable-liquid storage/handling is not the dominant observed deficiency when the condition is a spill or release to a walking surface.');
        }
      } else if (isHazcomCitation && hasHazComIdentityEvidence) {
        score += 40;
        reasons.push('Direct match: chemical identity or workplace labeling is the observed deficiency.');
      }

      const isLOTOCitation = /1910\.147|(?:56|57)\.12016/i.test(citation);
      if (isLOTOCitation) {
        if (!hasServicingEnergyEvidence) {
          score -= 190;
          penalties.push('Hazardous-energy control is not the observed deficiency without servicing, maintenance, jam-clearing, or energy-isolation evidence.');
          if (hasHazComIdentityEvidence || hasSpillReleasePathway) {
            score -= 20;
            penalties.push('Container/chemical spill evidence points away from lockout/tagout as the primary citation family.');
          }
          exclude = true;
        } else {
          score += 120;
          reasons.push('Direct match: servicing or energy-isolation evidence supports hazardous-energy control.');
        }
      }

      const isConfinedSpaceCitation = /1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation);
      if (isConfinedSpaceCitation) {
        if (!hasConfinedSpaceEvidence) {
          score -= 220;
          penalties.push('Confined-space applicability is not established without entry, configuration, or atmospheric evidence.');
          exclude = true;
        } else if (!/\b(entry|enter|inside|permit|required)\b/i.test(observation)) {
          score -= 120;
          penalties.push('A space was mentioned, but entry or permit-required context is not established.');
        }
      }

      if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) {
        score -= 150;
        penalties.push('Horn or backup-alarm evidence is not established for this mobile-equipment citation.');
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
    const directActive = active.filter((candidate) =>
      candidate.citationRanking?.directCandidate === true ||
      candidate.evidenceFitReasons?.some((reason: string) => reason.startsWith('Direct match:')) ||
      (
        candidate.evidenceFit?.status === 'active' &&
        candidate.matchingReasons?.some((reason: string) => /^(scenario:|direct applicability:)/i.test(reason))
      ),
    );
    const topScore = directActive[0]?.directnessScore;
    const explained = directActive.map((candidate, index) => ({
      ...candidate,
      citationRanking: {
        ...candidate.citationRanking,
        outrankedBroaderCandidates: index === 0 && active.some((other) => other !== candidate && other.directnessScore < topScore),
      },
    }));
    const supportingStandards = active.filter((candidate) => !directActive.includes(candidate)).map((candidate) => ({
      ...candidate,
      candidateStatus: 'supporting_context',
      supportReason: candidate.citationRanking?.penalties?.length
        ? candidate.citationRanking.penalties.join(' ')
        : 'Relevant standards context is retained separately because direct condition/component applicability is not established.',
    }));
    const priorNeedsMoreEvidence = input.excludedStandards.filter((candidate) =>
      candidate?.candidateStatus === 'needs_more_evidence' &&
      candidate?.scopeFit !== 'mismatch' &&
      (
        !needsMoreEvidencePattern ||
        needsMoreEvidencePattern.test(`${candidateText(candidate)} ${citationOf(candidate)}`)
      ),
    );
    const hardExcluded = input.excludedStandards.filter((candidate) => !priorNeedsMoreEvidence.includes(candidate));

    return {
      suggestedStandards: explained.slice(0, 5),
      supportingStandards,
      needsMoreEvidenceStandards: priorNeedsMoreEvidence,
      excludedStandards: [...hardExcluded, ...newlyExcluded]
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
    direct(/\b(open breaker slot|missing (?:panel )?cover|missing cover plate|empty space in (?:the )?electrical panel|breaker or blank should be|unused opening|exposed (?:live|energized) parts?|open electrical panel)\b/, /1910\.303\(g\)\(2\)\(i\)|1926\.403\(i\)\(2\)\(i\)|(?:56|57)\.12032/, 'Direct match: exposed energized parts or electrical enclosure opening/cover guarding.');
    direct(/\b(blocked|obstructed|storage|pallets?|boxes?)\b.*\b(panel|disconnect|switchboard)\b|\b(panel|disconnect|switchboard)\b.*\b(blocked|obstructed|clearance)\b/, /1910\.303\(g\)\(1\)|1926\.403\(i\)\(1\)|(?:56|57)\.12004/, 'Direct match: electrical equipment access and working-space obstruction.');
    direct(/\b(damaged|frayed|cut|exposed insulation)\b.*\bcord\b|\bcord\b.*\b(damaged|frayed|cut|wet)\b/, /1910\.(?:305\(g\)|334\(a\)\(2\)\(ii\))|1926\.(?:404\(b\)\(1\)\(ii\)|405)/, 'Direct match: flexible-cord condition, use, and electrical exposure.');
    direct(/\b(daisy[- ]chain|power strip|temporary wiring|overloaded extension)\b/, /1910\.305\(g\)|1926\.405/, 'Direct match: flexible or temporary wiring configuration.');
    direct(/\b(rotating shaft|rotating coupling|exposed shaft|unguarded shaft)\b/, /1910\.219|1910\.212|1926\.300|(?:56|57)\.14107/, 'Direct match: exposed rotating machine component.');
    direct(/\b(conveyor|tail pulley|head pulley|nip point)\b.*\b(guard|unguarded|missing|exposed|cleanup)\b/, /1910\.212|1926\.300|(?:56|57)\.14107|(?:56|57)\.12016/, 'Direct match: conveyor guarding or servicing exposure.');
    direct(/\bpoint of operation\b/, /1910\.212\(a\)\(3\)|1926\.300/, 'Direct match: point-of-operation guarding.');
    direct(/\b(open|open container|uncovered|leaking|spill(?:ed)?|release|residue|used oil|waste oil|oily waste)\b.*\b(floor|walkway|aisle|travelway|pedestrian|drain|maintenance area|maintenance bay|shop floor|work area)\b|\b(floor|walkway|aisle|travelway|pedestrian|drain|maintenance area|maintenance bay|shop floor|work area)\b.*\b(open|open container|uncovered|leaking|spill(?:ed)?|release|residue|used oil|waste oil|oily waste)\b/, /1910\.22|1926\.25|(?:56|57)\.(?:20003|4102)/, 'Direct match: spill or release contaminating a walking surface or release pathway.');
    direct(/\b(wet|oil|spill|slippery)\b.*\b(floor|walkway|aisle)\b/, /1910\.22|1926\.25|(?:56|57)\.20003/, 'Direct match: walking-working surface contamination.');
    direct(/\b(floor hole|floor opening|open hole|uncovered opening)\b/, /1910\.(?:28|29)|1926\.50[12]|(?:56|57)\.11012/, 'Direct match: floor-opening cover or guard protection.');
    direct(/\b(platform|edge)\b.*\b(without|missing|no|unguarded)\b.*\b(guardrail|fall protection|fall arrest)\b/, /1910\.28|1926\.501|(?:56|57)\.15005/, 'Direct match: elevated edge/platform fall protection.');
    direct(/\b(scaffold|scaffolding|scaffold platform)\b.*\b(without|missing|no|unguarded|open)\b.*\b(guardrail|toprail|midrail|plank|toe board|toeboard|fall protection)/, /1926\.451|1926\.502|1926\.503|1926\.454/, 'Direct match: scaffold-specific guardrail or platform protection.');
    direct(/\b(crusher|grinder|jackhammer|saw|noise exposure|hearing conservation)\b.*\b(noisy|loud|high noise|without hearing protection|not measured|unknown)/, /1910\.95|1926\.52|30 CFR 62\.110/, 'Direct match: occupational noise exposure and hearing conservation.');
    direct(/\b(silica|respirable dust|crusher dust|aggregate dust|grinder dust)\b.*\b(exposure|dust|sampling|not sampled|no sampling|unknown duration)/, /1910\.1053|1926\.1153|30 CFR 56\.500[25]|30 CFR 57\.500[25]/, 'Direct match: respirable crystalline silica or dusty mineral exposure.');
    direct(/\b(hot work|welding|cutting|brazing|torch)\b.*\b(combustible|fire watch|permit|spark|ignition|nearby)/, /1910\.252|1926\.352|(?:56|57)\.46/, 'Direct match: hot work with combustible ignition concern.');
    direct(/\b(damaged|broken|defective)\b.*\bladder\b|\bladder\b.*\b(damaged|broken|defective)\b/, /1910\.23|1926\.1053|(?:56|57)\.11011/, 'Direct match: ladder condition and continued use.');
    direct(/\b(unlabeled|no label|missing label)\b.*\b(chemical|container|drum|bottle)\b/, /1910\.1200|1926\.59/, 'Direct match: workplace chemical-container labeling.');
    direct(/\b(crusher|screen|drill)\b.*\bnoise\b|\bnoise exposure\b.*\bcrusher\b/, /30 CFR 62\./, 'Direct match: mining occupational-noise exposure and monitoring.');

    const hasMobileTerm = /\b(loader|forklift|truck|vehicle|mobile equipment|haulage|traffic|haul road|stockpile|blind corner)\b/i.test(observation);
    const hasMobileMech = /\b(operating|control|pedestrian|backing|horn|alarm|speed|movement|haul|stockpile|right-of-way)\b/i.test(observation);
    if (hasMobileTerm && hasMobileMech && /1910\.178|1926\.60[12]|(?:56|57)\.(?:9100|9200|9300)/i.test(citation)) {
      adjust(150);
      reasons.push('Direct match: mobile equipment, vehicle, or traffic control interaction.');
    }

    if (/\bpanel|breaker|enclosure\b/.test(observation) && /1910\.306/.test(citation)) {
      penalties.push('General panel/breaker evidence does not establish specific-purpose electrical equipment.');
    }
  }
}
