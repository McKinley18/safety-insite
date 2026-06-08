import { AuthorityAgency, AuthorityTier, Jurisdiction } from '../approved-knowledge-registry/approved-knowledge-record.types';

export type PromotionReadinessStatus = 
    | 'ready_for_reviewer'
    | 'needs_source_lookup'
    | 'duplicate_or_overlap'
    | 'unsafe_to_promote'
    | 'insufficient_metadata';

export interface MetadataSuggestion {
    agency: AuthorityAgency;
    jurisdiction: Jurisdiction;
    authorityTier: AuthorityTier;
    normalizedCitation: string;
    hazardFamilies: string[];
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}

export interface NormalizationCandidate {
    recordId: string;
    title: string;
    originalAgency: string;
    originalJurisdiction: string;
    originalCitation: string;
    originalHazardFamilies: string[];
    
    suggestion: MetadataSuggestion | null;
    promotionReadiness: PromotionReadinessStatus;
    governanceWarnings: string[];
}

export interface RegulatoryMetadataNormalizationReport {
    reportVersion: string;
    generatedAt: string;
    summary: {
        totalRecordsProcessed: number;
        totalUnknownMetadataFound: number;
        suggestionsGenerated: number;
        readyForReviewerCount: number;
        needsSourceLookupCount: number;
        duplicateOverlapCount: number;
        unsafeToPromoteCount: number;
        insufficientMetadataCount: number;
    };
    candidates: NormalizationCandidate[];
}
