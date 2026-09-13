import { Injectable } from '@nestjs/common';
import { ReviewerCandidateConsoleService } from '../reviewer-candidate-console/reviewer-candidate-console.service';

@Injectable()
export class RegulatoryCrawlerService {
  constructor(
    private readonly consoleService: ReviewerCandidateConsoleService,
  ) {}

  /**
   * Simulates querying federal regulatory registries, finding modifications,
   * and auto-indexing them as draft candidates in the Reviewer Console.
   */
  public async checkForUpdates(): Promise<any[]> {
    const proposedUpdates = [
      {
        summary: 'Proposed Rule: 1910.150 Heat Injury and Illness Prevention in Outdoor and Indoor Work Settings.',
        proposedKnowledgeText: 'OSHA is proposing a standard to protect employees from heat-related injury and illness. Employers must provide cool drinking water, shaded break areas, and acclimatization protocols when temperatures exceed 80°F.',
        sourceReferences: ['Federal Register Vol. 91, No. 102'],
        jurisdiction: 'osha_general_industry',
        authorityTier: 'primary_regulation',
        domainIds: ['walking_working_surfaces'],
        hazardFamilies: ['environmental_exposure'],
        priority: 'critical' as const,
        candidateType: 'source_ingestion' as const,
        sourceSystem: 'regulatory_crawler_v1',
        evidenceBasis: 'Crawler detected Federal Register notice for OSHA Heat Stress Proposed Rule.',
        requiredReviewSteps: ['Verify standard number allocation', 'Map to corporate heat stress training modules.'],
        governanceFlags: ['PROPOSED_RULE', 'CRAWLER_AUTO_INGEST']
      }
    ];

    const added: any[] = [];
    for (const update of proposedUpdates) {
      const candidate = await this.consoleService.addCandidate({
        ...update,
        domainIds: update.domainIds,
        hazardFamilies: update.hazardFamilies,
        mechanisms: ['heat_stress'],
        proposedChange: { type: 'addition', standard: '1910.150' }
      });
      added.push(candidate);
    }
    return added;
  }
}
