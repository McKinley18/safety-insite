import { Injectable } from '@nestjs/common';
import {
  ApprovedSourceKnowledgeIntakeGovernanceOutput,
  AuthorityTier,
  IntakeDecision,
  MappingConfidence,
} from './approved-source-knowledge-intake-governance.types';

@Injectable()
export class ApprovedSourceKnowledgeIntakeGovernanceService {
  private readonly engineVersion = '0.1.0';

  async evaluateIntake(
    sourceMetadata: any,
    context: any = {}
  ): Promise<ApprovedSourceKnowledgeIntakeGovernanceOutput> {
    const sourceText = this.normalize(
      [
        sourceMetadata?.agency,
        sourceMetadata?.authorityTier,
        sourceMetadata?.jurisdiction,
        sourceMetadata?.sourceUrl,
        sourceMetadata?.citation,
        sourceMetadata?.title,
        sourceMetadata?.effectiveDate,
        sourceMetadata?.revisionDate,
        sourceMetadata?.standardFamily,
        sourceMetadata?.sourceText,
        sourceMetadata?.text,
      ].filter(Boolean).join(' ')
    );

    const agency = this.detectAgency(sourceMetadata, sourceText);
    const authorityTier = this.detectAuthorityTier(sourceMetadata, sourceText);
    const jurisdiction = this.value(sourceMetadata?.jurisdiction || sourceMetadata?.siteJurisdiction || agency);
    const citation = this.value(sourceMetadata?.citation || sourceMetadata?.standard || sourceMetadata?.reference);
    const title = this.value(sourceMetadata?.title || sourceMetadata?.name);
    const sourceUrl = this.value(sourceMetadata?.sourceUrl || sourceMetadata?.url || sourceMetadata?.link);
    const effectiveDate = this.value(sourceMetadata?.effectiveDate);
    const revisionDate = this.value(sourceMetadata?.revisionDate || sourceMetadata?.lastUpdated || sourceMetadata?.updatedAt);
    const sourceDateStatus = this.sourceDateStatus(effectiveDate, revisionDate, sourceMetadata?.sourceDateStatus);

    const hasCitation = citation !== 'unknown';
    const hasTitle = title !== 'unknown';
    const hasJurisdiction = jurisdiction !== 'unknown' && jurisdiction !== 'unclear';
    const hasEffectiveDate = effectiveDate !== 'unknown';
    const hasRevisionDate = revisionDate !== 'unknown';
    const hasSourceUrl = sourceUrl !== 'unknown';

    const qualityScore = [
      hasCitation,
      hasTitle,
      hasJurisdiction,
      hasEffectiveDate,
      hasRevisionDate,
      hasSourceUrl,
    ].filter(Boolean).length / 6;

    const standardFamily = this.value(
      sourceMetadata?.standardFamily ||
      context?.standardFamily ||
      this.inferStandardFamily(sourceText)
    );

    const hazardFamilies = this.unique([
      ...(Array.isArray(sourceMetadata?.hazardFamilies) ? sourceMetadata.hazardFamilies : []),
      sourceMetadata?.hazardFamily,
      context?.hazardFamily,
      this.inferHazardFamily(sourceText),
    ]);

    const mechanisms = this.unique([
      ...(Array.isArray(sourceMetadata?.mechanisms) ? sourceMetadata.mechanisms : []),
      sourceMetadata?.mechanism,
      context?.mechanism,
      this.inferMechanism(sourceText),
    ]);

    const equipmentGroups = this.unique([
      ...(Array.isArray(sourceMetadata?.equipmentGroups) ? sourceMetadata.equipmentGroups : []),
      sourceMetadata?.equipmentGroup,
      context?.equipmentGroup,
      this.inferEquipmentGroup(sourceText),
    ]);

    const applicabilitySignals = this.unique([
      standardFamily !== 'unknown' ? `standard family mapped: ${standardFamily}` : undefined,
      hazardFamilies.length ? `hazard families mapped: ${hazardFamilies.join(', ')}` : undefined,
      mechanisms.length ? `mechanisms mapped: ${mechanisms.join(', ')}` : undefined,
      equipmentGroups.length ? `equipment groups mapped: ${equipmentGroups.join(', ')}` : undefined,
    ]);

    const mappingConfidence: MappingConfidence =
      standardFamily !== 'unknown' && hazardFamilies.length && mechanisms.length ? 'high' :
      standardFamily !== 'unknown' && (hazardFamilies.length || mechanisms.length) ? 'moderate' :
      standardFamily !== 'unknown' ? 'low' :
      'insufficient';

    const existingRecords = Array.isArray(context?.existingApprovedKnowledge)
      ? context.existingApprovedKnowledge
      : Array.isArray(context?.existingRecords)
        ? context.existingRecords
        : [];

    const duplicateKeys = this.findDuplicateKeys(sourceMetadata, existingRecords, {
      citation,
      title,
      jurisdiction,
      standardFamily,
    });

    const possibleDuplicate = duplicateKeys.length > 0;
    const duplicateReasons = possibleDuplicate
      ? duplicateKeys.map(key => `Potential duplicate matched on ${key}.`)
      : [];

    const blockedReasons: string[] = [];
    const governanceWarnings: string[] = [];

    if (agency === 'unknown') blockedReasons.push('Source agency/authority is unknown.');
    if (authorityTier === 'unknown') blockedReasons.push('Authority tier is unknown.');
    if (!hasJurisdiction) blockedReasons.push('Jurisdiction is missing or unclear.');
    if (!hasCitation) blockedReasons.push('Citation/reference is missing.');
    if (!hasTitle) blockedReasons.push('Source title is missing.');
    if (!hasSourceUrl) governanceWarnings.push('Source URL is missing and should be confirmed before approval.');
    if (sourceDateStatus === 'unknown') governanceWarnings.push('Source date status is unknown because effective/revision date is missing.');
    if (sourceDateStatus === 'outdated') governanceWarnings.push('Source appears outdated and requires reviewer confirmation before use.');
    if (mappingConfidence === 'insufficient') governanceWarnings.push('Mapping confidence is insufficient and requires reviewer mapping.');

    let intakeDecision: IntakeDecision = 'blocked';

    const minimumQualityForCandidate =
      hasCitation &&
      hasTitle &&
      hasJurisdiction &&
      hasSourceUrl &&
      mappingConfidence !== 'insufficient';

    if (blockedReasons.length > 0) {
      intakeDecision = hasCitation || hasTitle ? 'rejected' : 'blocked';
    } else if (possibleDuplicate) {
      intakeDecision = 'needs_review';
      governanceWarnings.push('Possible duplicate requires merge review before candidate approval.');
    } else if (
      minimumQualityForCandidate &&
      ['primary_regulation', 'official_guidance'].includes(authorityTier) &&
      sourceDateStatus !== 'outdated'
    ) {
      intakeDecision = 'approved_candidate';
    } else if (
      ['consensus_standard', 'company_policy'].includes(authorityTier) ||
      sourceDateStatus === 'outdated' ||
      sourceDateStatus === 'unknown' ||
      qualityScore < 1 ||
      mappingConfidence === 'low'
    ) {
      intakeDecision = 'needs_review';
    }

    const reviewerRequirements = this.unique([
      'Qualified reviewer approval is required before this source can become approved knowledge.',
      'Confirm source authority tier, jurisdiction, citation, title, and source URL.',
      'Confirm effective/revision date and whether the source is current.',
      'Confirm standard-family, hazard-family, mechanism, equipment, and applicability mapping.',
      possibleDuplicate ? 'Review possible duplicate and determine whether to merge, reject, or keep separate.' : undefined,
      authorityTier === 'consensus_standard' ? 'Escalate consensus standard mapping for applicability review before approval.' : undefined,
      authorityTier === 'company_policy' ? 'Confirm company policy scope and prevent it from overriding regulatory source hierarchy.' : undefined,
    ]);

    const auditTrailRequirements = [
      'Record original source metadata and normalized duplicate keys.',
      'Record reviewer identity, decision, timestamp, and mapping edits.',
      'Record authority tier, jurisdiction, citation, title, source URL, effective date, and revision date.',
      'Record duplicate review outcome if possible duplicate is detected.',
      'Record confirmation that no automatic approved-knowledge promotion occurred.',
    ];

    const decisionTrace = [
      'Evaluated approved source knowledge intake governance.',
      `Agency: ${agency}.`,
      `Authority tier: ${authorityTier}.`,
      `Jurisdiction: ${jurisdiction}.`,
      `Quality score: ${qualityScore.toFixed(2)}.`,
      `Source date status: ${sourceDateStatus}.`,
      `Mapping confidence: ${mappingConfidence}.`,
      `Possible duplicate: ${possibleDuplicate}.`,
      `Intake decision: ${intakeDecision}.`,
      'Preserved advisory-only boundary and qualified-review requirement.',
    ];

    return {
      engine: 'safescope_approved_source_knowledge_intake_governance_core',
      version: this.engineVersion,
      intakeDecision,
      sourceAuthority: {
        agency,
        authorityTier,
        jurisdiction,
        sourceUrl,
        citation,
        title,
        effectiveDate,
        revisionDate,
        sourceDateStatus,
      },
      sourceQuality: {
        hasCitation,
        hasTitle,
        hasJurisdiction,
        hasEffectiveDate,
        hasRevisionDate,
        hasSourceUrl,
        qualityScore: Number(qualityScore.toFixed(2)),
      },
      duplicateGovernance: {
        possibleDuplicate,
        duplicateKeys,
        duplicateReasons,
        recommendedMergeAction: possibleDuplicate ? 'review_merge' : 'none',
      },
      mappingGovernance: {
        standardFamily,
        hazardFamilies,
        mechanisms,
        equipmentGroups,
        applicabilitySignals,
        mappingConfidence,
      },
      reviewerRequirements,
      blockedReasons,
      governanceWarnings,
      auditTrailRequirements,
      decisionTrace,
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private detectAgency(source: any, text: string): string {
    const explicit = this.value(source?.agency);
    if (explicit !== 'unknown') return explicit.toLowerCase();
    if (text.includes('osha')) return 'osha';
    if (text.includes('msha')) return 'msha';
    if (text.includes('ansi')) return 'ansi';
    if (text.includes('nfpa')) return 'nfpa';
    if (text.includes('company policy') || text.includes('site policy')) return 'company_policy';
    return 'unknown';
  }

  private detectAuthorityTier(source: any, text: string): AuthorityTier {
    const explicit = this.value(source?.authorityTier || source?.tier);
    if (['primary_regulation', 'official_guidance', 'consensus_standard', 'company_policy', 'unknown'].includes(explicit)) {
      return explicit as AuthorityTier;
    }

    if (text.includes('primary regulation') || text.includes('regulation') || text.includes('cfr')) return 'primary_regulation';
    if (text.includes('official guidance') || text.includes('guidance') || text.includes('interpretation')) return 'official_guidance';
    if (text.includes('ansi') || text.includes('nfpa') || text.includes('consensus')) return 'consensus_standard';
    if (text.includes('company policy') || text.includes('site policy')) return 'company_policy';

    return 'unknown';
  }

  private sourceDateStatus(effectiveDate: string, revisionDate: string, explicit: unknown): 'current' | 'outdated' | 'unknown' {
    const normalized = this.value(explicit);
    const dateText = `${effectiveDate} ${revisionDate} ${normalized}`.toLowerCase();

    if (dateText.includes('outdated') || dateText.includes('superseded') || dateText.includes('expired')) {
      return 'outdated';
    }

    if (['current', 'unknown'].includes(normalized)) {
      return normalized as 'current' | 'unknown';
    }

    if (effectiveDate !== 'unknown' || revisionDate !== 'unknown') return 'current';
    return 'unknown';
  }

  private findDuplicateKeys(source: any, records: any[], current: any): string[] {
    const keys: string[] = [];

    for (const record of records) {
      const recordCitation = this.value(record?.citation || record?.standard || record?.reference);
      const recordTitle = this.value(record?.title || record?.name);
      const recordJurisdiction = this.value(record?.jurisdiction || record?.agency);
      const recordFamily = this.value(record?.standardFamily || record?.family);

      if (current.citation !== 'unknown' && current.citation === recordCitation) keys.push(`citation:${current.citation}`);
      if (current.title !== 'unknown' && current.title === recordTitle) keys.push(`title:${current.title}`);
      if (
        current.standardFamily !== 'unknown' &&
        current.standardFamily === recordFamily &&
        current.jurisdiction !== 'unknown' &&
        current.jurisdiction === recordJurisdiction
      ) {
        keys.push(`jurisdiction-standard-family:${current.jurisdiction}:${current.standardFamily}`);
      }
    }

    return this.unique(keys);
  }

  private inferStandardFamily(text: string): string {
    if (text.includes('lockout') || text.includes('conveyor') || text.includes('machine guard')) return 'machine_guarding_energy_control';
    if (text.includes('confined space') || text.includes('tank entry') || text.includes('atmospheric')) return 'confined_space';
    if (text.includes('floor hole') || text.includes('walking-working') || text.includes('fall protection')) return 'walking_working_surfaces_fall_protection';
    if (text.includes('hazard communication') || text.includes('chemical label')) return 'hazard_communication';
    return 'unknown';
  }

  private inferHazardFamily(text: string): string {
    if (text.includes('lockout') || text.includes('conveyor')) return 'machine_guarding';
    if (text.includes('confined')) return 'confined_space';
    if (text.includes('floor hole') || text.includes('fall')) return 'fall_protection';
    if (text.includes('chemical')) return 'hazard_communication';
    return 'unknown';
  }

  private inferMechanism(text: string): string {
    if (text.includes('unexpected startup') || text.includes('lockout')) return 'unexpected_startup';
    if (text.includes('nip point') || text.includes('conveyor')) return 'rotating_equipment_nip_point';
    if (text.includes('fall')) return 'fall_from_height';
    if (text.includes('atmospheric') || text.includes('confined')) return 'atmospheric_hazard_engulfment_or_entrapment';
    if (text.includes('chemical')) return 'chemical_exposure_unknown_agent';
    return 'unknown';
  }

  private inferEquipmentGroup(text: string): string {
    if (text.includes('conveyor')) return 'conveyor';
    if (text.includes('tank')) return 'confined_space';
    if (text.includes('floor hole')) return 'walking_working_surface';
    return 'unknown';
  }

  private unique(values: unknown[]): string[] {
    return Array.from(new Set(
      values
        .map(value => this.value(value))
        .filter(value => value !== 'unknown' && value !== 'unclear' && value !== '')
    ));
  }

  private value(value: unknown): string {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized || 'unknown';
  }

  private normalize(value: unknown): string {
    return String(value ?? '').toLowerCase();
  }
}
