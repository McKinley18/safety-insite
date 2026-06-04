import { CitationLevelCandidateReview } from './citation-review.types';
import { SourceGovernanceService } from '../source-governance/source-governance.service';
import { ApprovedSourceRecord } from '../source-governance/source-governance.types';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';

export class CitationReviewBrainService {
  private governanceService = new SourceGovernanceService();

  evaluate(
    scenarioIntelligence: ScenarioIntelligence,
    evidenceGaps: string[]
  ): CitationLevelCandidateReview[] {
    // This is where we map scenario intelligence to approved source governance.
    // Placeholder logic: Filter all approved sources that match the hazard domain.
    
    // In a full implementation, we would query the approved source registry
    // and match based on the scenarioIntelligence context.
    
    // Example: Map some specific scenario families to citations
    const candidates: CitationLevelCandidateReview[] = [];
    
    if (scenarioIntelligence.scenarioFamilyId === 'conveyor-cleanup') {
       candidates.push(this.createCandidate('osha-1910-147-loto', scenarioIntelligence, evidenceGaps));
    }
    
    return candidates;
  }

  private createCandidate(sourceId: string, scenarioIntelligence: ScenarioIntelligence, evidenceGaps: string[]): CitationLevelCandidateReview {
    const record = this.governanceService.getRecord(sourceId) as ApprovedSourceRecord;
    
    return {
      id: `review-${sourceId}`,
      sourceId: record.id,
      citation: record.citation || 'unknown',
      title: record.title,
      agency: record.agency,
      jurisdiction: record.jurisdiction,
      industryScope: record.industryScope,
      authorityTier: record.authorityTier,
      approvalStatus: record.approvalStatus,
      relatedStandardFamily: record.standardFamily || 'unknown',
      relatedScenarioFamilies: [scenarioIntelligence.scenarioFamilyId],
      relatedHazardDomains: record.hazardDomains || [], // Wait, need to fix source governance types to include hazardDomains
      relatedEquipmentIndicators: [],
      relatedTaskIndicators: [],
      relatedMechanismIndicators: [],
      relatedExposureIndicators: [],
      requiredEvidence: record.evidenceRequiredBeforeUse || [],
      missingEvidence: evidenceGaps,
      evidenceSatisfied: evidenceGaps.length === 0,
      confidence: scenarioIntelligence.confidenceSignals.score,
      confidenceBoosters: [],
      confidenceReducers: evidenceGaps,
      humanReviewTriggers: ['Critical hazard interaction'],
      applicabilityNotes: record.applicabilityNotes || [],
      prohibitedUses: record.prohibitedUses || [],
      advisoryGuardrails: {
        advisoryOnly: record.advisoryGuardrails?.advisoryOnly ?? true,
        doesNotDeclareViolation: record.advisoryGuardrails?.doesNotDeclareViolation ?? true,
        requiresQualifiedReview: record.advisoryGuardrails?.requiresQualifiedReview ?? true
      },
      sourceTrace: ['Governed by SourceGovernanceService']
    };
  }
}
