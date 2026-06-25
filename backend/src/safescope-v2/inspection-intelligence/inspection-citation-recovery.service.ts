import { InspectionCandidateStandard, InspectionIntelligenceResult } from './inspection-intelligence.types';
import { InspectionCitationRankingService } from './inspection-citation-ranking.service';

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
  if (scopes.includes('osha_general')) return candidate.jurisdiction === 'osha_general_industry';
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

    const supported = input.inspectionIntelligence.candidateStandards
      .filter((candidate) => candidate.status === 'candidate_standard' && scopeAllows(candidate, input.scopes));
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
    return {
      citation,
      title,
      titleSummary: title,
      summary: title,
      score: 900,
      confidence: 0.9,
      status: 'candidate_standard',
      candidateStatus: 'candidate_standard',
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

    const hasMineScope =
      /\b(msha|mine|miner|mining|aggregate|quarry|pit|crusher|screen|haul road|stockpile)\b/i.test(combined) ||
      /\b(msha|mine|mining)\b/i.test(scopesText);

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

    if (hasMobileEquipment && hasTrafficExposure && !isCoalMineContext) {
      if (hasMineScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '30 CFR 56.9100',
            'Traffic control and rules governing movement of mobile equipment',
            'mobile equipment and pedestrian/traffic exposure in MSHA surface mine context',
          ),
        );
      } else if (hasOshaGeneralScope) {
        recovered.push(
          this.makeRecoveredStandard(
            '29 CFR 1910.178',
            'Powered industrial trucks',
            'powered industrial truck/mobile equipment exposure in OSHA general industry context',
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
      /\b(oxygen|acetylene|argon|propane|compressed gas|gas)\b.*\bcylinders?\b/i.test(combined);

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
