import { Injectable } from '@nestjs/common';
import {
  ApplicabilitySupportLevel,
  CitationCandidateMode,
  SourceBackedApplicabilityGovernanceOutput,
} from './sbag.types';

@Injectable()
export class SourceBackedApplicabilityGovernanceService {
  private readonly engineVersion = '0.1.0';

  async evaluateApplicability(
    confidenceGovernance: any,
    evidenceSufficiency: any,
    causalRiskReasoning: any,
    defensibleCorrectiveAction: any,
    observationUnderstanding: any,
    calibrationMeta: any,
    outputPolicy: any,
    fusedText: string,
    standardFamilyCandidates: any[] = [],
    citationLevelCandidates: any[] = [],
    approvedKnowledgeContext: any = undefined
  ): Promise<SourceBackedApplicabilityGovernanceOutput> {
    const text = this.normalize(fusedText);
    const evidenceLevel = String(evidenceSufficiency?.sufficiencyLevel || 'insufficient');
    const maxConfidence = String(confidenceGovernance?.maximumSupportedConfidence || 'insufficient');
    const outputModes = outputPolicy?.allowedOutputModes || {};
    const outputStrength = String(outputPolicy?.allowedLanguageStrength || 'questions_only');

    const detectedJurisdiction = this.value(
      observationUnderstanding?.jurisdiction?.detected ||
      calibrationMeta?.jurisdiction ||
      this.detectJurisdictionFromText(text)
    );

    const jurisdictionClear =
      detectedJurisdiction !== 'unknown' &&
      detectedJurisdiction !== 'unclear' &&
      !text.includes('jurisdiction is unknown') &&
      !text.includes('site jurisdiction is unknown');

    const requiresJurisdictionConfirmation = !jurisdictionClear;

    const approvedKnowledgeRecords = this.extractApprovedKnowledgeRecords(approvedKnowledgeContext);
    const approvedKnowledgeAvailable = approvedKnowledgeRecords.length > 0;

    const candidateFamilies = this.collectStandardFamilies(
      calibrationMeta,
      standardFamilyCandidates,
      observationUnderstanding,
      text
    );

    const evidenceAllowsStandardFamily =
      ['sufficient', 'partially_sufficient'].includes(evidenceLevel) &&
      ['high', 'moderate', 'low'].includes(maxConfidence) &&
      outputStrength !== 'questions_only';

    const standardsAllowedByPolicy =
      outputStrength !== 'questions_only';

    const citationAllowedByPolicy =
      outputModes.canReferenceCitationCandidate === true;

    const canDiscussStandardFamily =
      evidenceAllowsStandardFamily &&
      standardsAllowedByPolicy &&
      jurisdictionClear &&
      candidateFamilies.length > 0;

    const sourceBackedSignals = approvedKnowledgeRecords.map((record: any) => {
      const citation = this.value(record?.citation || record?.standard || record?.id);
      const title = this.value(record?.title || record?.name || record?.standardFamily);
      return citation !== 'unknown' ? `${citation}: ${title}` : title;
    }).filter(signal => signal && signal !== 'unknown');

    const missingSourceNeeds = Array.from(new Set([
      approvedKnowledgeAvailable ? undefined : 'Approved/source-backed knowledge record for the applicable standard family.',
      jurisdictionClear ? undefined : 'Confirmed jurisdiction/site type.',
      evidenceLevel === 'sufficient' ? undefined : 'Sufficient evidence before stronger citation-candidate support.',
      citationAllowedByPolicy ? undefined : 'Output policy permission for citation-candidate discussion.',
    ].filter(Boolean) as string[]));

    const citationCandidateNames = this.collectCitationCandidates(citationLevelCandidates, approvedKnowledgeRecords);
    const advisoryCandidateAvailable = citationCandidateNames.length > 0;

    const sourceBackedCitationSupported =
      citationAllowedByPolicy &&
      jurisdictionClear &&
      evidenceLevel === 'sufficient' &&
      maxConfidence === 'high' &&
      approvedKnowledgeAvailable &&
      citationCandidateNames.length > 0;

    const citationCandidateMode: CitationCandidateMode =
      sourceBackedCitationSupported
        ? 'source_backed_candidate_with_review'
        : citationAllowedByPolicy && jurisdictionClear && advisoryCandidateAvailable
          ? 'candidate_only_with_review'
          : 'blocked';
    const canDiscussCitationCandidate = citationCandidateMode !== 'blocked';

    const applicabilitySupportLevel: ApplicabilitySupportLevel =
      sourceBackedCitationSupported ? 'supported' :
      canDiscussStandardFamily && approvedKnowledgeAvailable ? 'supported' :
      canDiscussStandardFamily ? 'partially_supported' :
      evidenceLevel === 'weak' || maxConfidence === 'low' ? 'weak' :
      'unsupported';

    const blockedFamilies = canDiscussStandardFamily ? [] : candidateFamilies;

    const applicabilityLimits = Array.from(new Set([
      'SafeScope may not declare a violation or create a citation.',
      'Applicability discussion requires qualified reviewer confirmation.',
      !jurisdictionClear ? 'Jurisdiction is not clear enough for standard-family or citation-candidate support.' : undefined,
      !evidenceAllowsStandardFamily ? 'Evidence or confidence is not strong enough for standard-family support.' : undefined,
      !approvedKnowledgeAvailable ? 'Approved/source-backed confirmation is unavailable; any inspection/applicability candidate remains advisory and requires qualified review.' : undefined,
      !citationAllowedByPolicy ? 'Output policy does not permit citation-candidate discussion.' : undefined,
    ].filter(Boolean) as string[]));

    const requiredReviewerConfirmations = Array.from(new Set([
      requiresJurisdictionConfirmation ? 'Confirm jurisdiction/site type before relying on applicability reasoning.' : undefined,
      'Confirm the standard family is applicable to the task, equipment, exposure, and site context.',
      'Confirm any source-backed record before referencing a citation candidate.',
      'Confirm SafeScope output remains advisory and does not declare a violation or create a citation.',
      ...missingSourceNeeds.map(need => `Confirm source need: ${need}`),
    ].filter(Boolean) as string[]));

    const jurisdictionReasons = Array.from(new Set([
      jurisdictionClear
        ? `Jurisdiction identified as ${detectedJurisdiction}.`
        : 'Jurisdiction is unclear or not confirmed.',
      requiresJurisdictionConfirmation
        ? 'Reviewer must confirm site type/jurisdiction before standards mapping.'
        : undefined,
    ].filter(Boolean) as string[]));

    const standardReasons = Array.from(new Set([
      canDiscussStandardFamily
        ? 'Evidence, confidence, output policy, and jurisdiction support standard-family discussion.'
        : advisoryCandidateAvailable && jurisdictionClear
          ? 'Source-backed standard-family support is limited, but an inspection/applicability citation candidate is preserved for qualified advisory review.'
          : 'Standard-family discussion is blocked or limited by evidence, jurisdiction, confidence, output policy, or missing family candidates.',
      approvedKnowledgeAvailable
        ? 'Approved/source-backed signals are available.'
        : 'No approved/source-backed records were provided for this applicability decision.',
    ]));

    const citationBlockedReasons = Array.from(new Set((citationCandidateMode === 'blocked' ? [
      'Citation-candidate support is blocked because no coherent advisory candidate path is available.',
      !jurisdictionClear ? 'Jurisdiction is unclear.' : undefined,
      !citationAllowedByPolicy ? 'Output policy blocks citation-candidate discussion.' : undefined,
      !advisoryCandidateAvailable ? 'No citation candidate was provided by inspection, applicability, or source-backed reasoning.' : undefined,
    ] : [
      !approvedKnowledgeAvailable ? 'Source-backed registry confirmation is unavailable for one or more advisory candidates.' : undefined,
      evidenceLevel !== 'sufficient' ? `Evidence sufficiency is ${evidenceLevel}; confirm missing facts before relying on the candidate.` : undefined,
      maxConfidence !== 'high' ? `Maximum supported confidence is ${maxConfidence}; qualified review remains required.` : undefined,
    ]).filter(Boolean) as string[]));

    return {
      engine: 'safescope_source_backed_applicability_governance_core',
      version: this.engineVersion,
      applicabilitySupportLevel,
      jurisdictionSupport: {
        detectedJurisdiction,
        jurisdictionClear,
        requiresJurisdictionConfirmation,
        reasons: jurisdictionReasons,
      },
      standardFamilySupport: {
        canDiscussStandardFamily,
        supportedFamilies: canDiscussStandardFamily ? candidateFamilies : [],
        blockedFamilies,
        reasons: standardReasons,
      },
      citationCandidateSupport: {
        canDiscussCitationCandidate,
        citationCandidateMode,
        candidates: citationCandidateMode === 'blocked' ? [] : citationCandidateNames,
        blockedReasons: citationBlockedReasons,
      },
      sourceSupport: {
        approvedKnowledgeAvailable,
        sourceBackedSignals,
        missingSourceNeeds,
      },
      applicabilityLimits,
      requiredReviewerConfirmations,
      decisionTrace: [
        'Evaluated source-backed applicability governance.',
        `Evidence sufficiency level: ${evidenceLevel}.`,
        `Maximum supported confidence: ${maxConfidence}.`,
        `Output policy language strength: ${outputStrength}.`,
        `Jurisdiction clear: ${jurisdictionClear}.`,
        `Approved/source-backed knowledge available: ${approvedKnowledgeAvailable}.`,
        `Applicability support level: ${applicabilitySupportLevel}.`,
        `Citation candidate mode: ${citationCandidateMode}.`,
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

  private collectStandardFamilies(
    calibrationMeta: any,
    standardFamilyCandidates: any[],
    observationUnderstanding: any,
    text: string
  ): string[] {
    const families = [
      calibrationMeta?.standardFamily,
      ...(Array.isArray(standardFamilyCandidates)
        ? standardFamilyCandidates.map(candidate => candidate?.standardFamily || candidate?.family || candidate?.id || candidate)
        : []),
      observationUnderstanding?.scenarioUnderstanding?.topScenario?.standardFamily,
      this.inferStandardFamily(text),
    ];

    return Array.from(new Set(
      families
        .map(item => this.value(item))
        .filter(item => item !== 'unknown' && item !== 'unclear')
    ));
  }

  private collectCitationCandidates(citationLevelCandidates: any[], approvedRecords: any[]): string[] {
    const candidates = [
      ...(Array.isArray(citationLevelCandidates)
        ? citationLevelCandidates.map(candidate => candidate?.citation || candidate?.standard || candidate?.id || candidate)
        : []),
      ...approvedRecords.map(record => record?.citation || record?.standard || record?.id),
    ];

    return Array.from(new Set(
      candidates
        .map(item => this.value(item))
        .filter(item => item !== 'unknown' && item !== 'unclear')
    ));
  }

  private extractApprovedKnowledgeRecords(context: any): any[] {
    if (!context) return [];
    if (Array.isArray(context)) return context;
    if (Array.isArray(context.records)) return context.records;
    if (Array.isArray(context.topRecords)) return context.topRecords;
    if (Array.isArray(context.approvedRecords)) return context.approvedRecords;
    if (Array.isArray(context.sourceBackedSignals)) return context.sourceBackedSignals;
    return [];
  }

  private inferStandardFamily(text: string): string {
    if (text.includes('conveyor') || text.includes('guard') || text.includes('lockout')) return 'machine_guarding_energy_control';
    if (text.includes('confined') || text.includes('tank') || text.includes('atmospheric')) return 'confined_space';
    if (text.includes('floor hole') || text.includes('open edge') || text.includes('fall')) return 'walking_working_surfaces_fall_protection';
    if (text.includes('electrical') || text.includes('energized')) return 'electrical';
    return 'unknown';
  }

  private detectJurisdictionFromText(text: string): string {
    if (text.includes('msha') || text.includes('mine')) return 'msha';
    if (text.includes('osha construction')) return 'osha_construction';
    if (text.includes('osha') || text.includes('general industry')) return 'osha_general_industry';
    return 'unknown';
  }

  private value(value: unknown): string {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized || 'unknown';
  }

  private normalize(text: string): string {
    return String(text || '').toLowerCase();
  }
}
