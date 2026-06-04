import {
  AuthorityTier,
  HazardDomain,
  KnowledgeRecord,
  KnowledgeUseBoundary,
  ReviewStatus,
  SourceType,
} from './knowledge-intake.types';
import { validateGuardrails } from './knowledge-intake.guardrails';

const VALID_SOURCE_TYPES: SourceType[] = [
  'cfr',
  'interpretation_letter',
  'policy_manual',
  'accident_report',
  'technical_standard',
];

const VALID_AUTHORITY_TIERS: AuthorityTier[] = [
  'federal_regulation',
  'agency_policy',
  'industry_standard',
  'expert_reference',
];

const VALID_REVIEW_STATUSES: ReviewStatus[] = [
  'unreviewed',
  'pending_review',
  'approved_by_human',
  'rejected',
];

const VALID_HAZARD_DOMAINS: HazardDomain[] = [
  'electrical',
  'chemical',
  'mechanical',
  'structural',
  'operational',
];

const VALID_SOURCE_BOUNDARIES: KnowledgeUseBoundary[] = [
  'advisory',
  'mandatory',
  'prohibited',
];

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidHttpsUrl(value: unknown): boolean {
  if (!isNonEmptyString(value)) return false;

  try {
    const parsed = new URL(String(value));
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidIsoDate(value: unknown): boolean {
  if (!isNonEmptyString(value)) return false;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed);
}

function hasAtLeastOneString(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => isNonEmptyString(item));
}

function hasOnlyKnownValues<T extends string>(value: unknown, allowed: T[]): boolean {
  return Array.isArray(value) && value.every((item) => allowed.includes(item));
}

export class KnowledgeRecordValidatorService {
  validate(record: KnowledgeRecord): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isNonEmptyString(record.recordId)) errors.push('Missing recordId');
    if (!isNonEmptyString(record.sourceAuthority)) errors.push('Missing sourceAuthority');
    if (!isNonEmptyString(record.citation)) errors.push('Missing citation');
    if (!isNonEmptyString(record.title)) errors.push('Missing title');
    if (!isNonEmptyString(record.sourceUrl)) errors.push('Missing sourceUrl');
    if (!isNonEmptyString(record.retrievedAt)) errors.push('Missing retrievedAt');
    if (!isNonEmptyString(record.jurisdiction)) errors.push('Missing jurisdiction');
    if (!isNonEmptyString(record.standardIntent)) errors.push('Missing standardIntent');

    if (!isValidHttpsUrl(record.sourceUrl)) errors.push('sourceUrl must be a valid HTTPS URL');
    if (!isValidIsoDate(record.retrievedAt)) errors.push('retrievedAt must be a valid date or ISO timestamp');

    if (!VALID_SOURCE_TYPES.includes(record.sourceType)) {
      errors.push(`Invalid sourceType: ${record.sourceType}`);
    }

    if (!VALID_AUTHORITY_TIERS.includes(record.authorityTier)) {
      errors.push(`Invalid authorityTier: ${record.authorityTier}`);
    }

    if (!VALID_REVIEW_STATUSES.includes(record.reviewStatus)) {
      errors.push(`Invalid reviewStatus: ${record.reviewStatus}`);
    }

    if (!VALID_SOURCE_BOUNDARIES.includes(record.sourceBoundary)) {
      errors.push(`Invalid sourceBoundary: ${record.sourceBoundary}`);
    }

    if (!Array.isArray(record.hazardDomains) || record.hazardDomains.length === 0) {
      errors.push('hazardDomains must contain at least one domain');
    } else if (!hasOnlyKnownValues(record.hazardDomains, VALID_HAZARD_DOMAINS)) {
      errors.push(`hazardDomains contains unsupported value(s): ${record.hazardDomains.join(', ')}`);
    }

    if (!hasAtLeastOneString(record.applicabilityTriggers)) {
      errors.push('applicabilityTriggers must contain at least one item');
    }

    if (!hasAtLeastOneString(record.evidenceNeeded)) {
      errors.push('evidenceNeeded must contain at least one item');
    }

    if (!hasAtLeastOneString(record.nonApplicabilityQuestions)) {
      errors.push('nonApplicabilityQuestions must contain at least one item');
    }

    if (record.authorityTier === 'federal_regulation' && record.sourceBoundary !== 'mandatory') {
      errors.push('federal_regulation records must use sourceBoundary "mandatory"');
    }

    if (record.authorityTier !== 'federal_regulation' && record.sourceBoundary === 'mandatory') {
      errors.push('non-regulatory records must not use sourceBoundary "mandatory"');
    }

    if (record.sourceType === 'accident_report' && record.sourceBoundary === 'mandatory') {
      errors.push('accident_report records must not be treated as mandatory regulatory requirements');
    }

    try {
      validateGuardrails(record);
    } catch (e: any) {
      errors.push(e.message);
    }

    return { isValid: errors.length === 0, errors };
  }
}
