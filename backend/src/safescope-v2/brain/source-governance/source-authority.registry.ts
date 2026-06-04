// Extending SourceAuthorityRegistry
export type AuthorityTier = 'binding_regulation' | 'authoritative_guidance' | 'industry_best_practice' | 'internal_validation';

export interface SourceAuthorityEntry {
  sourceId: string;
  agency: 'MSHA' | 'OSHA' | 'NIOSH' | 'SentinelSafety';
  authorityTier: AuthorityTier;
  jurisdiction: 'msha' | 'osha_general_industry' | 'osha_construction' | 'cross_domain';
  citationPattern?: RegExp;
  sourceTitle: string;
  sourceUrl: string;
  canCreateCitation: boolean;
  canDeclareViolation: boolean;
  advisoryOnly: boolean;
  requiresQualifiedReview: boolean;
  notes?: string;
}

export const SOURCE_AUTHORITY_REGISTRY: SourceAuthorityEntry[] = [
  {
    sourceId: 'msha_30_cfr',
    agency: 'MSHA',
    authorityTier: 'binding_regulation',
    jurisdiction: 'msha',
    citationPattern: /30 CFR \d+\.\d+/,
    sourceTitle: '30 Code of Federal Regulations',
    sourceUrl: 'https://www.ecfr.gov/current/title-30',
    canCreateCitation: true,
    canDeclareViolation: true,
    advisoryOnly: false,
    requiresQualifiedReview: false
  },
  {
    sourceId: 'osha_29_cfr',
    agency: 'OSHA',
    authorityTier: 'binding_regulation',
    jurisdiction: 'osha_general_industry',
    citationPattern: /29 CFR \d+\.\d+/,
    sourceTitle: '29 Code of Federal Regulations',
    sourceUrl: 'https://www.ecfr.gov/current/title-29',
    canCreateCitation: true,
    canDeclareViolation: true,
    advisoryOnly: false,
    requiresQualifiedReview: false
  },
  {
    sourceId: 'msha_ppm',
    agency: 'MSHA',
    authorityTier: 'authoritative_guidance',
    jurisdiction: 'msha',
    sourceTitle: 'MSHA Program Policy Manual',
    sourceUrl: 'https://www.msha.gov/ppm',
    canCreateCitation: false,
    canDeclareViolation: false,
    advisoryOnly: true,
    requiresQualifiedReview: true,
    notes: 'Program Policy Manual guidance requires qualified review.'
  }
];
