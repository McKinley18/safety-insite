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
    const candidates: CitationLevelCandidateReview[] = [];
    
    // Example: Map some specific scenario families to citations with evidence gates
    if (scenarioIntelligence.scenarioFamilyId === 'conveyor-cleanup') {
       candidates.push(this.createCandidate('osha-1910-147-loto', scenarioIntelligence, evidenceGaps));
    }
    
    // Filter candidates based on authority and evidence status
    return candidates.filter(c => 
        this.governanceService.isAuthoritative(c.sourceId) && 
        c.evidenceSatisfied
    );
  }

  private createCandidate(sourceId: string, scenarioIntelligence: ScenarioIntelligence, evidenceGaps: string[]): CitationLevelCandidateReview {
    const record = this.governanceService.getRecord(sourceId) as ApprovedSourceRecord;
    
    const requiredEvidence = record.evidenceRequiredBeforeUse || [];
    const missingEvidence = requiredEvidence.filter(e => evidenceGaps.includes(e));
    const evidenceSatisfied = missingEvidence.length === 0;

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
      relatedHazardDomains: record.hazardDomains || [],
      relatedEquipmentIndicators: [],
      relatedTaskIndicators: [],
      relatedMechanismIndicators: [],
      relatedExposureIndicators: [],
      requiredEvidence: requiredEvidence,
      missingEvidence: missingEvidence,
      evidenceSatisfied: evidenceSatisfied,
      confidence: scenarioIntelligence.confidenceSignals.score,
      confidenceBoosters: [],
      confidenceReducers: missingEvidence,
      humanReviewTriggers: ['Critical hazard interaction'],
      applicabilityNotes: record.applicabilityNotes || [],
      prohibitedUses: record.prohibitedUses || [],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      },
      sourceTrace: ['Governed by SourceGovernanceService']
    };
  }
}
