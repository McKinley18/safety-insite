import { Injectable } from '@nestjs/common';
import { RegulatorySourceConnectorResult } from './connectors/regulatory-source-connector.types';
import { RegulatorySourceInventory } from './regulatory-source-audit.types';
import { ApprovedKnowledgeCitationNormalizationService } from '../approved-knowledge-registry/approved-knowledge-citation-normalization.service';

export type ComparisonClassification = 
  | 'already_covered'
  | 'exact_duplicate'
  | 'citation_overlap_review_required'
  | 'source_changed_review_required'
  | 'missing_from_safescope'
  | 'supplemental_candidate'
  | 'rejected_low_quality'
  | 'rejected_unknown_authority';

export interface DifferentialComparisonResult {
  candidate: RegulatorySourceConnectorResult;
  classification: ComparisonClassification;
  matchedRecordIds: string[];
  reasons: string[];
}

@Injectable()
export class RegulatoryDifferentialComparisonService {
  constructor(private readonly normalizationService: ApprovedKnowledgeCitationNormalizationService) {}

  compare(
    sourceCandidates: RegulatorySourceConnectorResult[],
    inventory: RegulatorySourceInventory
  ): DifferentialComparisonResult[] {
    return sourceCandidates.map(candidate => this.compareSingle(candidate, inventory));
  }

  private compareSingle(
    candidate: RegulatorySourceConnectorResult,
    inventory: RegulatorySourceInventory
  ): DifferentialComparisonResult {
    const result: DifferentialComparisonResult = {
      candidate,
      classification: 'missing_from_safescope',
      matchedRecordIds: [],
      reasons: []
    };

    if (candidate.agency === 'UNKNOWN' || candidate.jurisdiction === 'unknown') {
      result.classification = 'rejected_unknown_authority';
      result.reasons.push('Candidate has unknown agency or jurisdiction.');
      return result;
    }

    if (!candidate.rawTextExcerpt || candidate.rawTextExcerpt.length < 50) {
      result.classification = 'rejected_low_quality';
      result.reasons.push('Candidate lacks sufficient raw text excerpt.');
      return result;
    }

    if (candidate.recommendedUse === 'fatality_lesson_candidate' || candidate.recommendedUse === 'supplemental_context_candidate') {
       result.classification = 'supplemental_candidate';
       result.reasons.push(`Candidate is marked for supplemental use: ${candidate.recommendedUse}.`);
       return result;
    }

    const normalizedCandidateCitation = candidate.rawCitation 
      ? this.normalizationService.normalize(candidate.rawCitation, candidate.agency).canonical
      : null;

    if (normalizedCandidateCitation && inventory.citationMap[normalizedCandidateCitation]) {
      const matchedIds = inventory.citationMap[normalizedCandidateCitation];
      result.matchedRecordIds = matchedIds;

      // Simplistic check for already covered vs source changed
      const approvedMatch = inventory.details.approvedRecords.find(r => matchedIds.includes(r.recordId));
      if (approvedMatch) {
         if (approvedMatch.revisionDate && candidate.sourceRevisionDate && approvedMatch.revisionDate !== candidate.sourceRevisionDate) {
             result.classification = 'source_changed_review_required';
             result.reasons.push('Source revision date differs from approved record.');
         } else {
             result.classification = 'already_covered';
             result.reasons.push('Exact citation match found in approved records with matching revision dates.');
         }
      } else {
          // It's a draft
          result.classification = 'citation_overlap_review_required';
          result.reasons.push('Citation overlaps with an existing draft candidate.');
      }
    } else {
      result.classification = 'missing_from_safescope';
      result.reasons.push('No matching citation found in inventory.');
    }

    return result;
  }
}
