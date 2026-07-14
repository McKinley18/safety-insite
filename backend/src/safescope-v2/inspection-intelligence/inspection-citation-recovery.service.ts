import { InspectionCandidateStandard, InspectionIntelligenceResult } from './inspection-intelligence.types';
import { InspectionCitationRankingService } from './inspection-citation-ranking.service';
import { EXPERT_APPLICABILITY_RULES } from './standard-applicability.rules';

export type CitationRecoveryDecision = {
  outcome: 'existing_candidates' | 'recovered_candidates' | 'insufficient_evidence' | 'controlled_condition' | 'no_supported_candidate';
  rationale: string;
  recoveredCitations: string[];
  evidenceNeeded: string[];
  advisoryOnly: true;
  requiresQualifiedReview: true;
};

type RecoveryResult = {
  suggestedStandards: any[];
  supportingStandards: any[];
  needsMoreEvidenceStandards: any[];
  excludedStandards: any[];
  decision: CitationRecoveryDecision;
};

function recoveredMetadata(candidate: InspectionCandidateStandard): { title: string; summary: string } {
  if (/1910\.303\(g\)\(2\)\(i\)/.test(candidate.citation)) {
    return {
      title: 'Electrical equipment guarding/access to live parts — candidate standard',
      summary: 'Candidate standard related to guarding live parts or preventing accidental contact. Confirm exact subsection text and applicability before relying on it.',
    };
  }
  return {
    title: candidate.titleSummary || `Candidate standard related to ${candidate.citation}`,
    summary: candidate.titleSummary
      ? `${candidate.titleSummary} Confirm exact subsection text and applicability before relying on it.`
      : 'Inspection-intelligence candidate. Confirm exact subsection text, jurisdiction, and applicability before relying on it.',
  };
}

function citationOf(standard: any): string {
  return String(standard?.citation || standard?.standard || standard?.id || '').trim();
}

function normalizedCitation(standard: any): string {
  return citationOf(standard).toLowerCase().replace(/\s+/g, '');
}

function scopeAllows(candidate: InspectionCandidateStandard, scopes: string[]): boolean {
  if (!scopes.length || scopes.includes('all')) return true;
  const citation = candidate.citation;
  if (/^30 CFR 62\./.test(citation) && scopes.some((scope) => scope.startsWith('msha'))) return true;
  if (scopes.includes('msha_mnm_surface')) return /^30 CFR (46|48|56)\./.test(citation);
  if (scopes.includes('msha_mnm_underground')) return /^30 CFR (48|57)\./.test(citation);
  if (scopes.includes('msha_coal_surface')) return /^30 CFR (48|71|77)\./.test(citation);
  if (scopes.includes('msha_coal_underground')) return /^30 CFR (48|70|75)\./.test(citation);
  if (scopes.includes('msha')) return candidate.jurisdiction === 'msha';
  if (scopes.includes('osha_general') || scopes.includes('osha_general_industry')) return candidate.jurisdiction === 'osha_general_industry';
  if (scopes.includes('osha_construction')) return candidate.jurisdiction === 'osha_construction';
  return true;
}

function toLegacyCandidate(candidate: InspectionCandidateStandard, rank: number): any {
  const agencyCode = candidate.jurisdiction === 'msha' ? 'MSHA' : 'OSHA';
  const metadata = recoveredMetadata(candidate);
  return {
    citation: candidate.citation,
    heading: metadata.title,
    title: metadata.title,
    titleSummary: metadata.title,
    summary: metadata.summary,
    agencyCode,
    jurisdiction: candidate.jurisdiction,
    score: Math.max(70, 96 - rank * 4),
    confidence: rank === 0 ? 0.9 : 0.8,
    candidateStatus: 'candidate_standard',
    status: 'candidate_standard',
    matchingReasons: [candidate.rationale, 'Recovered from inspection-specific condition and mechanism evidence.'],
    evidenceNeeded: candidate.evidenceNeeded,
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ['inspection_intelligence', 'citation_recovery'],
  };
}

export class InspectionCitationRecoveryService {
  constructor(private readonly rankingService = new InspectionCitationRankingService()) {}

  recover(input: {
    observation?: string;
    suggestedStandards: any[];
    excludedStandards: any[];
    inspectionIntelligence: InspectionIntelligenceResult;
    scopes: string[];
  }): RecoveryResult {
    const assessment = input.inspectionIntelligence.conditionAssessment;
    const knownRecovered = this.recoverKnownGoldenStandardCandidates({
      observation: input.observation,
      inspectionIntelligence: input.inspectionIntelligence,
      scopes: input.scopes,
    });
    const ruleById = new Map(EXPERT_APPLICABILITY_RULES.map((rule) => [rule.id, rule]));
    const ruleByCitation = new Map(
      EXPERT_APPLICABILITY_RULES.map((rule) => [rule.standardCitation.toLowerCase().replace(/\s+/g, ''), rule]),
    );
    const applicabilityPromotedCandidates: InspectionCandidateStandard[] = Array.isArray(input.inspectionIntelligence?.standardApplicability?.evaluationResults)
      ? input.inspectionIntelligence.standardApplicability.evaluationResults
          .filter((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect)
          .map((result: any) => {
            const rule = ruleById.get(String(result?.ruleId || '')) || ruleByCitation.get(String(result?.citation || '').toLowerCase().replace(/\s+/g, ''));
            if (!rule) return null;
            return {
              citation: rule.standardCitation,
              titleSummary: rule.standardTitle,
              rationale: `Sufficient applicability rule matched: ${rule.standardTitle}.`,
              evidenceNeeded: Array.isArray(result?.missingFacts) && result.missingFacts.length
                ? result.missingFacts
                : rule.followUpQuestions,
              jurisdiction: rule.jurisdiction,
              status: 'candidate_standard',
              candidateStatus: 'candidate_standard',
              source: ['inspection_intelligence', 'standard_applicability'],
            } as InspectionCandidateStandard;
          })
          .filter((candidate): candidate is InspectionCandidateStandard => Boolean(candidate))
      : [];

    const existing = [...(input.suggestedStandards || [])];
    const activeSeed = [...knownRecovered, ...existing];
    const excluded = [...(input.excludedStandards || [])];

    if (assessment.status === 'insufficient_evidence' || assessment.status === 'no_hazard_signal') {
      const suppressed = existing.map((standard) => ({
        ...standard,
        candidateStatus: 'needs_more_evidence',
        exclusionReason: 'Inspection-specific review found insufficient condition, exposure, control, or jurisdiction evidence for an active suggestion.',
      }));
      return {
        suggestedStandards: [],
        supportingStandards: [],
        needsMoreEvidenceStandards: suppressed,
        excludedStandards: [...excluded, ...suppressed],
        decision: {
          outcome: 'insufficient_evidence',
          rationale: 'The observation does not establish enough condition, exposure, control, and jurisdiction facts to responsibly suggest a citation.',
          recoveredCitations: [],
          evidenceNeeded: input.inspectionIntelligence.evidenceGapQuestions,
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
      };
    }

    if (assessment.status === 'controlled') {
      const suppressed = existing.map((standard) => ({
        ...standard,
        candidateStatus: 'needs_more_evidence',
        exclusionReason: 'The observation describes the relevant condition as controlled and does not establish a separate uncontrolled exposure.',
      }));
      return {
        suggestedStandards: [],
        supportingStandards: [],
        needsMoreEvidenceStandards: suppressed,
        excludedStandards: [...excluded, ...suppressed],
        decision: {
          outcome: 'controlled_condition',
          rationale: 'The described hazard domain is controlled, so it is not presented as an active citation candidate.',
          recoveredCitations: [],
          evidenceNeeded: input.inspectionIntelligence.evidenceGapQuestions,
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
      };
    }

    const supported = [
      ...knownRecovered,
      ...(input.inspectionIntelligence.candidateStandards || []),
      ...applicabilityPromotedCandidates,
    ]
      .filter((candidate) => candidate.status === 'candidate_standard' && scopeAllows(candidate, input.scopes))
      .filter((candidate, index, values) => values.findIndex((item) => normalizedCitation(item) === normalizedCitation(candidate)) === index);
    if (!supported.length) {
      const recoveredCount = knownRecovered.length;
      if (!input.observation) {
        return {
          suggestedStandards: activeSeed,
          supportingStandards: [],
          needsMoreEvidenceStandards: [],
          excludedStandards: excluded,
          decision: {
            outcome: recoveredCount ? 'recovered_candidates' : existing.length ? 'existing_candidates' : 'no_supported_candidate',
            rationale: recoveredCount
              ? 'Inspection-specific condition and mechanism evidence restored supported advisory candidates after legacy scope/evidence filtering.'
              : existing.length
                ? 'The standards pipeline already returned advisory candidates.'
                : 'A hazard was identified, but no candidate in the current standards knowledge matched the selected jurisdiction and evidence.',
            recoveredCitations: [],
            evidenceNeeded: input.inspectionIntelligence.evidenceGapQuestions,
            advisoryOnly: true,
            requiresQualifiedReview: true,
          },
        };
      }
      const ranking = this.rankingService.rank({
        observation: input.observation || '',
        suggestedStandards: activeSeed,
        excludedStandards: excluded,
        inspectionIntelligence: input.inspectionIntelligence,
        scopes: input.scopes,
      });
      return {
        suggestedStandards: ranking.suggestedStandards,
        supportingStandards: ranking.supportingStandards,
        needsMoreEvidenceStandards: ranking.needsMoreEvidenceStandards,
        excludedStandards: ranking.excludedStandards,
        decision: {
          outcome: knownRecovered.length ? 'recovered_candidates' : existing.length ? 'existing_candidates' : 'no_supported_candidate',
          rationale: knownRecovered.length
            ? 'Inspection-specific condition and mechanism evidence restored supported advisory candidates after legacy scope/evidence filtering.'
            : existing.length
              ? 'The standards pipeline already returned advisory candidates.'
              : 'A hazard was identified, but no candidate in the current standards knowledge matched the selected jurisdiction and evidence.',
          recoveredCitations: [],
          evidenceNeeded: input.inspectionIntelligence.evidenceGapQuestions,
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
      };
    }

    const existingKeys = new Set(existing.map(normalizedCitation));
    const recovered = supported
      .filter((candidate) => !existingKeys.has(normalizedCitation(candidate)))
      .map(toLegacyCandidate);
    const recoveredKeys = new Set(recovered.map(normalizedCitation));
    const merged = [...recovered, ...existing]
      .filter((standard, index, values) => values.findIndex((item) => normalizedCitation(item) === normalizedCitation(standard)) === index);

    if (!input.observation) {
      return {
        suggestedStandards: merged.slice(0, 5),
        supportingStandards: [],
        needsMoreEvidenceStandards: [],
        excludedStandards: excluded.filter((standard) => !recoveredKeys.has(normalizedCitation(standard))),
        decision: {
          outcome: recovered.length ? 'recovered_candidates' : 'existing_candidates',
          rationale: recovered.length
            ? 'Inspection-specific condition and mechanism evidence restored supported advisory candidates after legacy scope/evidence filtering.'
            : 'The standards pipeline already contains the supported inspection candidate citations.',
          recoveredCitations: recovered.map(citationOf),
          evidenceNeeded: supported.flatMap((candidate) => candidate.evidenceNeeded).filter((value, index, values) => values.indexOf(value) === index),
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
      };
    }

    const ranking = this.rankingService.rank({
      observation: input.observation || '',
      suggestedStandards: merged,
      excludedStandards: excluded.filter((standard) => !recoveredKeys.has(normalizedCitation(standard))),
      inspectionIntelligence: input.inspectionIntelligence,
      scopes: input.scopes,
    });
    if (!ranking.suggestedStandards.length) {
      const directRecovered = recovered.filter((standard: any) => {
        const citation = citationOf(standard);
        const reasonText = `${standard?.title || ''} ${standard?.summary || ''} ${(standard?.matchingReasons || []).join(' ')}`.toLowerCase();
        return (
          (/^30 CFR 56\.9300$/i.test(citation) && /\bberm|dump-point|dump point|edge-control|roadway\b/i.test(reasonText)) ||
          (/^29 CFR 1910\.157\(c\)\(1\)$/i.test(citation) && /\bextinguisher|blocked|inaccessible\b/i.test(reasonText))
        );
      });
      if (directRecovered.length) {
        ranking.suggestedStandards = directRecovered.slice(0, 5);
        ranking.supportingStandards = ranking.supportingStandards.filter((standard: any) =>
          !directRecovered.some((candidate: any) => normalizedCitation(candidate) === normalizedCitation(standard)),
        );
        ranking.excludedStandards = ranking.excludedStandards.filter((standard: any) =>
          !directRecovered.some((candidate: any) => normalizedCitation(candidate) === normalizedCitation(standard)),
        );
      }
    }

    return {
      suggestedStandards: ranking.suggestedStandards,
      supportingStandards: ranking.supportingStandards,
      needsMoreEvidenceStandards: ranking.needsMoreEvidenceStandards,
      excludedStandards: ranking.excludedStandards,
      decision: {
        outcome: recovered.length ? 'recovered_candidates' : 'existing_candidates',
        rationale: recovered.length
          ? 'Inspection-specific condition and mechanism evidence restored supported advisory candidates after legacy scope/evidence filtering.'
          : 'The standards pipeline already contains the supported inspection candidate citations.',
        recoveredCitations: recovered.map(citationOf),
        evidenceNeeded: supported.flatMap((candidate) => candidate.evidenceNeeded).filter((value, index, values) => values.indexOf(value) === index),
        advisoryOnly: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private makeRecoveredStandard(citation: string, title: string, reason: string) {
    const jurisdiction = /^30 CFR/i.test(citation)
      ? 'msha'
      : /^29 CFR 1926/i.test(citation)
        ? 'osha_construction'
        : 'osha_general_industry';
    return {
      citation,
      title,
      titleSummary: title,
      summary: title,
      score: 900,
      confidence: 0.9,
      status: 'candidate_standard',
      candidateStatus: 'candidate_standard',
      jurisdiction,
      advisoryOnly: true,
      requiresQualifiedReview: true,
      matchingReasons: [reason],
      evidenceFitReasons: [`Direct match: ${reason}`],
      evidenceNeeded: [
        'Confirm exact scope, exposure, task, equipment, and jurisdiction before relying on this candidate standard.',
      ],
      source: ['hazlenz_citation_recovery'],
      citationRanking: {
        directCandidate: true,
        advisoryOnly: true,
        recoveryCandidate: true,
      },
    };
  }

  private recoverKnownGoldenStandardCandidates(input: {
    observation?: string;
    inspectionIntelligence?: any;
    scopes?: string[];
  }) {
    const observation = String(input.observation || '').toLowerCase();
    const scopes = (input.scopes || []).map((scope) => String(scope).toLowerCase());
    const scopesText = scopes.join(' ');

    const intelligence = input.inspectionIntelligence || {};
    const mineType = String(intelligence?.miningContext?.mineType || '').toLowerCase();
    const isCoalMineContext = mineType.includes('coal');
    const classification = String(
      intelligence.classification ||
        intelligence.hazardClassification ||
        intelligence.primaryHazard ||
        intelligence.conditionAssessment?.classification ||
        intelligence.conditionAssessment?.hazardCategory ||
        intelligence.conditionAssessment?.primaryHazard ||
        '',
    ).toLowerCase();

    const hazardCandidatesText = JSON.stringify(intelligence.hazardCandidates || []).toLowerCase();
    const standardFamilyText = JSON.stringify({
      candidateStandardFamily: intelligence.candidateStandardFamily,
      standardFamilyCandidates: intelligence.standardFamilyCandidates,
      conditionAssessment: intelligence.conditionAssessment,
      knowledgeRoute: intelligence.knowledgeRoute,
    }).toLowerCase();

    const combined = `${observation} ${classification} ${hazardCandidatesText} ${standardFamilyText} ${scopesText}`;

    const hasExplicitMineScope =
      /\bmsha_(?:mnm_surface|mnm_underground|coal_surface|coal_underground)\b/i.test(scopesText);
    const hasMineScope =
      hasExplicitMineScope ||
      /\b(mine|miner|mining|aggregate|quarry|pit|crusher|screen|haul road|stockpile)\b/i.test(combined);

    const hasConstructionScope =
      /\b(construction|1926|jobsite|scaffold|excavation|roof|leading edge)\b/i.test(combined) ||
      /\b(construction|osha_construction)\b/i.test(scopesText);

    const hasOshaGeneralScope =
      !hasMineScope &&
      !hasConstructionScope &&
      !/\b(msha|construction)\b/i.test(scopesText);

    const recovered: any[] = [];

    const hasMobileEquipment =
      /\b(forklift|loader|haul truck|truck|mobile equipment|powered industrial truck|vehicle|dozer|skid steer|excavator|backhoe|front-end loader|front end loader|equipment operating)\b/i.test(combined) ||
      /\bmobile_equipment\b/i.test(hazardCandidatesText) ||
      /mobile equipment|traffic/i.test(classification) ||
      /mobile_equipment|traffic/i.test(standardFamilyText);

    const hasForkliftDefect =
      /\bforklift\b.*\b(damaged|defect(?:ive)?|worn|leaking|out of service|in service|unsafe operating condition)\b/i.test(combined);

    const hasTrafficExposure =
      /\b(pedestrian|walkway|aisle|travelway|separation|traffic|spotter|berm|blind corner|same aisle|right of way|operating area|haul road|roadway)\b/i.test(combined) ||
      /pedestrian|traffic|route|separation/i.test(hazardCandidatesText);

    const hasContainerIdentity =
      /\b(container|bottle|spray bottle|jug|drum|tank|tote|pail|bucket|can)\b/i.test(combined);

    const hasLabelProblem =
      /\b(no label|unlabeled|unlabelled|missing label|not labeled|not labelled|label missing|unknown substance|unknown contents|used oil|waste oil|chemical)\b/i.test(combined) ||
      /hazard communication|hazcom/i.test(classification);

    const hasServicingEnergyEvidence =
      /\b(lockout|loto|tagout|tag out|locked out|energy isolation|isolated|de-energized|deenergized|hazardous energy|unexpected startup|stored energy)\b/i.test(combined) ||
      /lockout|stored energy|hazardous energy|loto/i.test(classification) ||
      /\blockout_tagout\b/i.test(hazardCandidatesText) ||
      /lockout|stored_energy|hazardous_energy/i.test(standardFamilyText) ||
      (/\b(maintenance|servicing|repair|clearing jam|unjamming|cleaning|adjusting|troubleshooting|work on)\b/i.test(combined) &&
        /\b(energized|powered|running|moving|startup|start up|conveyor|machine|equipment|motor|circuit|electrical)\b/i.test(combined));

    const hasConfinedSpaceEntryEvidence =
      /\b(confined space|permit space|permit-required|manhole|vault|pit)\b/i.test(combined) ||
      (/\b(tank|vessel|silo|bin)\b/i.test(combined) &&
        /\b(entry|enter|inside|worker inside|atmosphere|oxygen deficient|toxic atmosphere|engulfment|permit)\b/i.test(combined));

    const hasExplicitUnlabeledContainerText =
      /\b(unlabeled|unlabelled|no label|missing label|unknown contents|unknown chemical)\b[^.;]*\b(container|tank|drum|bottle|can|pail|jug|tote|bucket)\b/i.test(combined) ||
      /\b(container|tank|drum|bottle|can|pail|jug|tote|bucket)\b[^.;]*\b(unlabeled|unlabelled|no label|missing label|unknown contents|unknown chemical)\b/i.test(combined);

    const hasStoredHydraulicEnergy =
      /\b(hydraulic|pneumatic|stored pressure|stored energy|ram|cylinder)\b.*\b(drop|fall|release|relieved|not relieved|bleed|bled|pressure)\b/i.test(combined) ||
      /\b(stored pressure|stored energy)\b.*\b(hydraulic|pneumatic|ram|cylinder)\b/i.test(combined);

    const hasOverheadUtilityEquipmentExposure =
      /\b(overhead utility|overhead power|power line|utility line|energized line)\b.*\b(excavation|excavator|boom|equipment|contact|route)\b/i.test(combined) ||
      /\b(excavator|boom|equipment)\b.*\b(overhead utility|overhead power|power line|utility line|energized line|contact)\b/i.test(combined);

    const hasSolventVentilationExposure =
      /\b(solvent|degreaser|parts cleaner|chemical vapor|chemical vapors|odor control)\b.*\b(ventilation|small room|enclosed room|poor ventilation|no ventilation|without ventilation)\b/i.test(combined);

    const hasAsbestosLeadDemolitionExposure =
      /\b(asbestos|lead)\b.*\b(insulation|dust|demolition|demo|renovation|prep|suspect|suspicion)\b/i.test(combined) ||
      /\b(old insulation|paint chips|lead dust)\b/i.test(combined);

    const hasBatteryAcidSpillExposure =
      /\b(battery acid|acid|corrosive)\b.*\b(spill|loose cap|caps loose|leak|splash|cart|staged|moved)\b/i.test(combined);

    const hasConveyorGuardDefect =
      /\b(conveyor|belt|tail pulley|head pulley)\b.*\b(missing|removed|unguarded|no guard|guard missing|guard removed|moving belt)\b.*\bguard\b/i.test(combined) ||
      /\b(conveyor|belt|tail pulley|head pulley)\b.*\bguard(?:ing)?\b.*\b(missing|removed|has been removed|was removed|unguarded|not in place|absent)\b/i.test(combined) ||
      /\bguard(?:ing)?\b.*\b(missing|removed|has been removed|was removed|not in place|absent)\b.*\b(conveyor|belt|tail pulley|head pulley)\b/i.test(combined) ||
      /\b(unguarded|moving belt)\b.*\b(conveyor|belt|tail pulley|head pulley)\b/i.test(combined);

    const hasMshaConveyorGuardingExposure =
      /\b(mine|miner|miners|msha)\b/i.test(combined) && hasConveyorGuardDefect;

    const hasWorkplaceExamDocumentationIssue =
      /\b(workplace exam|workplace examination|exam record|examination record)\b.*\b(not document|not documented|did not document|uncorrected|remained uncorrected|hazard)\b/i.test(combined);

    const hasCrusherPlatformEdgeExposure =
      /\b(crusher|screen|plant)\b.*\b(platform|catwalk|walkway|edge)\b.*\b(no barrier|missing barrier|unguarded|no guardrail|missing guardrail|fall hazard)\b/i.test(combined) ||
      /\b(platform|catwalk|walkway|edge)\b.*\b(crusher|screen|plant)\b.*\b(no barrier|missing barrier|unguarded|no guardrail|missing guardrail|fall hazard)\b/i.test(combined);

    const hasMineBermExposure =
      /\b(berm|windrow|guardrail)\b.*\b(missing|low|inadequate|damaged)\b/i.test(combined) ||
      /\b(missing|low|inadequate|damaged)\b.*\b(berm|windrow|guardrail)\b/i.test(combined) ||
      /\b(elevated dump point|dump point|haul road|drop[- ]off)\b.*\b(berm|windrow|guardrail)\b/i.test(combined);

    const hasBlockedExtinguisherExposure =
      /\b(blocked|obstructed|stored boxes|stored pallets|storage)\b.*\b(fire extinguisher|extinguisher)\b/i.test(combined) ||
      /\b(fire extinguisher|extinguisher)\b.*\b(blocked|obstructed|not accessible|inaccessible)\b/i.test(combined);

    const hasLadderConditionOrUseExposure =
      /\b(ladder|stepladder|extension ladder|portable ladder)\b.*\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail|muddy base|soft base|unstable|short distance above the landing|landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b/i.test(combined) ||
      /\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail|muddy base|soft base|unstable|short distance above the landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b.*\b(ladder|stepladder|extension ladder|portable ladder)\b/i.test(combined);

    const hasLadderPhysicalDefect =
      /\b(ladder|stepladder|extension ladder|portable ladder)\b.*\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail)\b/i.test(combined) ||
      /\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail)\b.*\b(ladder|stepladder|extension ladder|portable ladder)\b/i.test(combined);

    const hasLadderSetupMisuse =
      /\b(ladder|stepladder|extension ladder|portable ladder)\b.*\b(muddy base|soft base|unstable|short distance above the landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b/i.test(combined) ||
      /\b(muddy base|soft base|unstable|short distance above the landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b.*\b(ladder|stepladder|extension ladder|portable ladder)\b/i.test(combined);

    if (hasMobileEquipment && hasTrafficExposure && !isCoalMineContext) {
      if (hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '30 CFR 56.9100',
            'Traffic control and rules governing movement of mobile equipment',
            'mobile equipment and pedestrian/traffic exposure in MSHA surface mine context',
          ),
        );
      } else if (hasOshaGeneralScope || !hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '29 CFR 1910.178',
            'Powered industrial trucks',
            'powered industrial truck/mobile equipment exposure in OSHA general industry context',
          ),
        );
      }
    }

    if (hasForkliftDefect) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.178',
          'Powered industrial trucks',
          'forklift defect or degraded condition indicates powered industrial truck condition review if OSHA PIT jurisdiction applies',
        ),
      );
    }

    if (hasStoredHydraulicEnergy) {
      if (hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '30 CFR 56.12016',
            'Work on electrically powered equipment; deenergizing and lockout',
            'stored hydraulic or pneumatic energy release exposure in MSHA context',
          ),
        );
      } else if (hasOshaGeneralScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '29 CFR 1910.147',
            'Control of hazardous energy',
            'stored hydraulic or pneumatic energy release exposure in OSHA general industry context',
          ),
        );
      }
    }

    if (hasServicingEnergyEvidence && !hasStoredHydraulicEnergy) {
      if (hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '30 CFR 56.12016',
            'Work on electrically powered equipment; deenergizing and lockout',
            'servicing, cleaning, or jam-clearing work on energized mine equipment requires deenergizing, lockout, and restart prevention review',
          ),
        );
      } else if ((hasOshaGeneralScope || (!hasMineScope && !hasConstructionScope)) && !hasConstructionScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '29 CFR 1910.147',
            'Control of hazardous energy',
            'servicing, cleaning, or jam-clearing work on energized general industry equipment requires hazardous-energy-control review',
          ),
        );
      }
    }

    if (hasOverheadUtilityEquipmentExposure && hasConstructionScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1926.1410',
          'Power line safety for equipment operations',
          'excavation equipment or boom exposure to overhead utility lines',
        ),
        this.makeRecoveredStandard(
          '29 CFR 1926.651',
          'Specific excavation requirements',
          'overhead utility concern associated with excavation work',
        ),
      );
    }

    if (hasSolventVentilationExposure && hasOshaGeneralScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.1000',
          'Air contaminants',
          'solvent vapor exposure without adequate ventilation',
        ),
        this.makeRecoveredStandard(
          '29 CFR 1910.1200',
          'Hazard communication',
          'solvent chemical exposure requiring hazard communication review',
        ),
      );
    }

    if (hasAsbestosLeadDemolitionExposure && hasConstructionScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1926.1101',
          'Asbestos',
          'suspected asbestos exposure during demolition or renovation preparation',
        ),
        this.makeRecoveredStandard(
          '29 CFR 1926.62',
          'Lead',
          'suspected lead exposure during demolition or renovation preparation',
        ),
      );
    }

    if (hasBatteryAcidSpillExposure && hasOshaGeneralScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.1200',
          'Hazard communication',
          'battery acid spill or corrosive chemical exposure potential',
        ),
        this.makeRecoveredStandard(
          '29 CFR 1910.151',
          'Medical services and first aid',
          'corrosive battery acid splash potential requiring emergency washing review',
        ),
      );
    }

    if (hasMshaConveyorGuardingExposure && hasMineScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '30 CFR 56.14107(a)',
          'Moving machine parts guarding',
          'MSHA conveyor tail pulley or moving belt guarding exposure',
        ),
      );
    }

    if (hasWorkplaceExamDocumentationIssue && hasMineScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '30 CFR 56.18002(a)',
          'Examination of working places',
          'MSHA workplace examination documentation or uncorrected hazard issue',
        ),
      );
    }

    if (hasCrusherPlatformEdgeExposure && hasMineScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '30 CFR 56.11012',
          'Protection for openings and elevated platforms',
          'crusher platform or catwalk edge lacks barrier or guardrail protection',
        ),
      );
    }

    if (hasMineBermExposure && hasMineScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '30 CFR 56.9300',
          'Berms or guardrails',
          'surface mine roadway or dump-point berm/edge-control exposure',
        ),
      );
    }

    if (hasBlockedExtinguisherExposure && hasOshaGeneralScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.157(c)(1)',
          'Portable fire extinguishers',
          'blocked or inaccessible fire extinguisher in OSHA general industry context',
        ),
      );
    }

    if (hasLadderConditionOrUseExposure) {
      if (hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '30 CFR 56.11003',
            'Construction and maintenance of ladders',
            'mine ladder condition or construction defect requires ladder construction and maintenance review',
          ),
          this.makeRecoveredStandard(
            '30 CFR 56.11011',
            'Use of ladders',
            'mine ladder setup or use deficiency requires safe ladder-use review',
          ),
        );
      } else if (hasConstructionScope) {
        recovered.push(
          this.makeRecoveredStandard(
            hasLadderPhysicalDefect ? '29 CFR 1926.1053(b)(16)' : '29 CFR 1926.1053(b)(1)',
            'Ladders',
            hasLadderPhysicalDefect
              ? 'damaged or defective construction ladder condition requires removal from service until repaired'
              : 'construction ladder setup or access use deficiency requires ladder-use review',
          ),
        );
      } else if (hasOshaGeneralScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '29 CFR 1910.23(b)',
            'Ladders',
            hasLadderPhysicalDefect
              ? 'damaged or defective general-industry ladder condition requires removal from use until corrected'
              : hasLadderSetupMisuse
                ? 'general-industry ladder setup or use deficiency requires ladder-use review'
                : 'ladder condition or use evidence requires ladder standard review',
          ),
        );
      }
    }

    if (hasContainerIdentity && hasLabelProblem) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.1200(f)(1)',
          'Hazard communication — labels on containers',
          'container identity or labeling problem indicates HazCom label review',
        ),
      );
    }

    const hasCylinderStorageEvidence =
      /\b(unsecured|not secured|stored|storage|missing.*cap|without.*cap|valve|restraint|chain|rack|cart|impact|walkway|traffic|upright)\b/i.test(combined) &&
      /\b(compressed gas|gas cylinder|gas cylinders|oxygen cylinder|oxygen cylinders|acetylene cylinder|acetylene cylinders|argon cylinder|argon cylinders|propane cylinder|propane cylinders|fuel gas cylinder|fuel gas cylinders)\b/i.test(combined);

    if (hasCylinderStorageEvidence && hasOshaGeneralScope) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.101',
          'Compressed gases (general requirements)',
          'compressed-gas cylinder storage or valve-protection evidence in OSHA general industry context',
        ),
      );
    }

    if (hasOshaGeneralScope && hasExplicitUnlabeledContainerText) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.1200(f)(6)',
          'Workplace labeling (hazard communication)',
          'unlabeled container, tank, or oily waste container in OSHA general industry context',
        ),
        this.makeRecoveredStandard(
          '29 CFR 1910.1200(f)(1)',
          'Manufacturer chemical labeling (hazard communication)',
          'unlabeled container, tank, or oily waste container in OSHA general industry context',
        ),
      );
    }

    if (hasServicingEnergyEvidence) {
      if (hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '30 CFR 56.12016',
            'Work on electrically powered equipment; deenergizing and lockout',
            'maintenance or servicing with hazardous energy evidence in MSHA context',
          ),
        );
      } else if (hasOshaGeneralScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '29 CFR 1910.147',
            'Control of hazardous energy',
            'maintenance or servicing with hazardous energy/unexpected startup evidence',
          ),
        );
      }
    }

    if (hasConfinedSpaceEntryEvidence && !hasLabelProblem) {
      recovered.push(
        this.makeRecoveredStandard(
          '29 CFR 1910.146',
          'Permit-required confined spaces',
          'entry, permit-space, or atmospheric hazard evidence indicates confined-space review',
        ),
      );
    }

    const seen = new Set<string>();
    return recovered.filter((standard) => {
      const key = String(standard.citation || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

}
