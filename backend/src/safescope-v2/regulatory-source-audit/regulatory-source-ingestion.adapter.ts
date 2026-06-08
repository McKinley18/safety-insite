import { Injectable } from '@nestjs/common';
import { DifferentialComparisonResult } from './regulatory-differential-comparison.service';
import { ReviewerCandidateConsoleService } from '../reviewer-candidate-console/reviewer-candidate-console.service';
import { UserGovernanceContext } from '../workspace-governance-access/workspace-governance.types';

@Injectable()
export class RegulatorySourceIngestionAdapter {
  constructor(private readonly consoleService: ReviewerCandidateConsoleService) {}

  async ingestCandidates(
    comparisons: DifferentialComparisonResult[], 
    user?: UserGovernanceContext
  ) {
    const createdCandidates = [];

    for (const comp of comparisons) {
      if (
        comp.classification === 'rejected_low_quality' || 
        comp.classification === 'rejected_unknown_authority' || 
        comp.classification === 'already_covered' || 
        comp.classification === 'exact_duplicate'
      ) {
        continue;
      }

      let candidateType: any = 'source_ingestion';
      let priority: any = 'medium';

      if (comp.candidate.recommendedUse === 'fatality_lesson_candidate') {
          priority = 'critical';
          // It's still a source ingestion, but maybe we flag it
      }

      const governanceFlags = [...comp.reasons];
      if (comp.classification === 'citation_overlap_review_required' || comp.classification === 'source_changed_review_required') {
          governanceFlags.push('OVERLAP_DETECTED');
      }

      const candidate = await this.consoleService.addCandidate({
          candidateType: 'source_ingestion',
          sourceSystem: comp.candidate.sourceSystem,
          priority,
          domainIds: [], // Would normally be mapped
          hazardFamilies: [], // Would normally be mapped
          mechanisms: [],
          jurisdiction: comp.candidate.jurisdiction,
          authorityTier: 'primary_regulation', // Simplified
          sourceReferences: [comp.candidate.sourceUrl, comp.candidate.rawCitation || ''],
          summary: `Differential Ingestion: ${comp.candidate.rawTitle}`,
          proposedKnowledgeText: comp.candidate.rawTextExcerpt,
          evidenceBasis: 'Automated differential comparison',
          governanceFlags,
          requiredReviewSteps: [
              'Verify citation accuracy',
              'Map to hazard families',
              'Extract evidence requirements',
              'Ensure advisory boundaries are maintained'
          ]
      }, user?.workspaceId);

      createdCandidates.push(candidate);
    }

    return createdCandidates;
  }
}
