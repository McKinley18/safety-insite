import { Injectable } from '@nestjs/common';
import { NormalizedCitation, DeduplicationResult, DuplicateClassification } from './approved-knowledge-citation-normalization.types';
import { ApprovedKnowledgeRecord } from './approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgeCitationNormalizationService {
  
  normalize(citation: string, agency: string): NormalizedCitation {
    const original = citation.trim();
    const isPlaceholder = original.toLowerCase().includes('placeholder') || original.toLowerCase().includes('review_required');
    
    if (isPlaceholder) {
      return { canonical: 'placeholder_review_required', original, agency, parts: [], isPlaceholder: true };
    }

    let canonical = original;
    
    // Normalize OSHA
    if (agency.toUpperCase() === 'OSHA') {
        // Remove §, 29 CFR, spaces
        canonical = original.replace(/§/g, '').replace(/29\s*CFR\s*/i, '').replace(/\s+/g, '');
        // Ensure format is like 1910.147
    }
    
    // Normalize MSHA
    if (agency.toUpperCase() === 'MSHA') {
        canonical = original.replace(/30\s*CFR\s*/i, '').replace(/\s+/g, '');
    }

    const parts = canonical.split(/[.(]/).filter(p => p.length > 0);

    return {
      canonical,
      original,
      agency: agency.toUpperCase(),
      parts,
      isPlaceholder: false
    };
  }

  evaluateOverlap(newRecord: Partial<ApprovedKnowledgeRecord>, existingRecords: ApprovedKnowledgeRecord[]): DeduplicationResult {
    const newCitation = this.normalize(newRecord.authority?.citation || '', newRecord.authority?.agency || '');
    
    if (newCitation.isPlaceholder) {
        return {
            status: 'placeholder_review_required',
            normalizedCitation: newCitation.canonical,
            reason: 'Record uses a placeholder citation that requires qualified review.',
            conflictingRecordIds: []
        };
    }

    const overlaps = existingRecords.filter(r => {
        const existingCitation = this.normalize(r.authority.citation, r.authority.agency);
        return existingCitation.canonical === newCitation.canonical && r.authority.agency === newCitation.agency;
    });

    if (overlaps.length === 0) {
        return {
            status: 'no_duplicate',
            normalizedCitation: newCitation.canonical,
            reason: 'No overlapping citations found.',
            conflictingRecordIds: []
        };
    }

    // Check for true duplicate: same citation AND same domain
    const exactDuplicates = overlaps.filter(r => r.mapping.domainId === newRecord.mapping?.domainId);
    if (exactDuplicates.length > 0) {
        return {
            status: 'duplicate_blocked',
            normalizedCitation: newCitation.canonical,
            reason: 'Exact duplicate citation and domain found.',
            conflictingRecordIds: exactDuplicates.map(r => r.recordId)
        };
    }

    // Check for legitimate shared citation: same citation but different domain or specific applicability
    // In this v1, we allow shared citations if the domain is different and they don't have conflicting signals.
    // For simplicity, we'll mark as allowed if domains differ.
    const sharedAllowed = overlaps.every(r => r.mapping.domainId !== newRecord.mapping?.domainId);
    if (sharedAllowed) {
        return {
            status: 'shared_citation_allowed',
            normalizedCitation: newCitation.canonical,
            reason: 'Citation is shared across different safety domains or hazard types.',
            conflictingRecordIds: overlaps.map(r => r.recordId)
        };
    }

    return {
        status: 'overlap_review_required',
        normalizedCitation: newCitation.canonical,
        reason: 'Complex overlap detected with existing citation. Requires manual review of applicability and jurisdiction.',
        conflictingRecordIds: overlaps.map(r => r.recordId)
    };
  }
}
