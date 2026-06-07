import { Injectable } from '@nestjs/common';
import { 
  SourceIngestionInput, 
  IngestionDraftCandidate, 
  DuplicateConflictAnalysis, 
  PromotionDecisionInput, 
  PromotionResult,
  IngestionCandidateStatus
} from './source-ingestion-approved-update-workflow.types';
import { ApprovedKnowledgeRegistrySearchService } from '../approved-knowledge-registry/approved-knowledge-registry-search.service';
import { SourceFreshnessGovernanceService } from '../source-freshness-governance/source-freshness-governance.service';
import { JurisdictionApplicabilityDecisionTreeService } from '../jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.service';
import { ApprovedKnowledgeRecord, AuthorityAgency, AuthorityTier, Jurisdiction, SourceDateStatus } from '../approved-knowledge-registry/approved-knowledge-record.types';
import { ReviewerCandidateConsoleService } from '../reviewer-candidate-console/reviewer-candidate-console.service';
import { SafeScopePersistenceService } from '../persistence/persistence.service';

@Injectable()
export class SourceIngestionApprovedUpdateWorkflowService {
  constructor(
    private readonly searchService: ApprovedKnowledgeRegistrySearchService,
    private readonly freshnessService: SourceFreshnessGovernanceService,
    private readonly jurisdictionService: JurisdictionApplicabilityDecisionTreeService,
    private readonly consoleService: ReviewerCandidateConsoleService,
    private readonly persistence: SafeScopePersistenceService,
  ) {}

  async ingest(input: SourceIngestionInput): Promise<IngestionDraftCandidate> {
    const candidateId = `cand-${Date.now()}`;
    const normalizedSource = this.normalizeSource(input);
    const mapping = this.createMapping(input);
    
    // 1. Freshness Analysis
    const freshnessAnalysis = this.freshnessService.evaluate({
        agency: input.agency,
        authorityTier: input.authorityTier,
        citation: input.citation,
        title: input.title,
        sourceUrl: input.sourceUrl,
        effectiveDate: input.effectiveDate,
        revisionDate: input.revisionDate,
        lastVerifiedAt: input.verifiedAt,
        sourceDateStatus: input.sourceDateStatus
    });

    // 2. Jurisdiction Analysis
    const jurisdictionAnalysis = this.jurisdictionService.evaluate({
        observationText: input.sourceText
    });

    // 3. Duplicate and Conflict Detection
    const duplicateAnalysis = this.detectDuplicatesAndConflicts(input);

    // 4. Governance Decision
    let candidateStatus: IngestionCandidateStatus = 'needs_review';
    const governanceWarnings: string[] = [];
    const blockedReasons: string[] = [];

    if (freshnessAnalysis.useRestriction === 'blocked') {
        candidateStatus = 'blocked';
        blockedReasons.push('Source is superseded or blocked by freshness governance.');
    }
    
    if (duplicateAnalysis.duplicateStatus === 'exact_duplicate') {
        candidateStatus = 'rejected';
        blockedReasons.push('Exact duplicate of existing approved record found.');
    }

    if (input.agency === 'unknown' || input.authorityTier === 'unknown') {
        candidateStatus = 'needs_review';
        governanceWarnings.push('Source agency or authority tier is unknown.');
    }

    const advisoryBoundary = 'SafeScope source ingestion analysis is advisory only.';

    const candidate: IngestionDraftCandidate = {
      candidateId,
      candidateStatus,
      writeTarget: 'draft_only',
      mayPromoteToApproved: false,
      normalizedSource,
      mapping,
      duplicateAnalysis,
      freshnessAnalysis,
      jurisdictionAnalysis,
      reviewerQuestions: [
        ...freshnessAnalysis.updateQuestions,
        ...jurisdictionAnalysis.reviewerQuestions
      ],
      requiredReviewerChecks: [
        'Verify citation accuracy',
        'Verify source URL leads to official material',
        'Verify mapping of hazard families and mechanisms'
      ],
      governanceWarnings: [
          ...governanceWarnings,
          ...freshnessAnalysis.sourceWarnings
      ],
      advisoryBoundary
    };

    // Register in Candidate Console
    await this.consoleService.addCandidate({
        candidateType: 'source_ingestion',
        sourceSystem: 'source_ingestion_workflow',
        priority: 'high',
        domainIds: [input.mappedDomainId],
        hazardFamilies: input.mappedHazardFamilies,
        mechanisms: input.mappedMechanisms,
        jurisdiction: input.jurisdiction,
        authorityTier: input.authorityTier,
        sourceReferences: [input.sourceUrl, input.citation],
        summary: `New source ingestion: ${input.title} (${input.citation})`,
        proposedKnowledgeText: input.sourceText,
        evidenceBasis: 'Ingested source document',
        governanceFlags: candidate.governanceWarnings,
        requiredReviewSteps: candidate.requiredReviewerChecks
    });

    // 5. Persist Ingestion Event
    await this.persistence.save({
        type: 'source_ingestion_candidate',
        status: candidateStatus,
        payload: candidate,
        metadata: {
            agency: input.agency,
            citation: input.citation,
            jurisdiction: input.jurisdiction
        }
    });

    return candidate;
  }

  async promote(input: PromotionDecisionInput): Promise<PromotionResult> {
    const { candidate, reviewerDecision, reviewerName, reviewerRole, sourceVerified, duplicateReviewed, jurisdictionConfirmed } = input;
    
    const reasons: string[] = [];
    let promotionStatus: any = 'held_for_review';
    let canWriteApprovedRegistry = false;

    if (reviewerDecision === 'reject') {
        promotionStatus = 'rejected';
        reasons.push('Reviewer rejected promotion.');
    } else if (reviewerDecision === 'approve') {
        const canPromote = 
            sourceVerified && 
            (candidate.duplicateAnalysis.duplicateStatus === 'none' || duplicateReviewed) &&
            jurisdictionConfirmed &&
            candidate.candidateStatus !== 'blocked' &&
            candidate.candidateStatus !== 'rejected';

        if (canPromote) {
            promotionStatus = 'promoted';
            canWriteApprovedRegistry = false; // Dry-run as per requirements
            reasons.push('All governance checks passed and human approval received.');
        } else {
            promotionStatus = 'blocked';
            if (!sourceVerified) reasons.push('Source verification required.');
            if (candidate.duplicateAnalysis.duplicateStatus !== 'none' && !duplicateReviewed) reasons.push('Duplicate review required.');
            if (!jurisdictionConfirmed) reasons.push('Jurisdiction confirmation required.');
        }
    }

    let approvedRecordDraft: ApprovedKnowledgeRecord | undefined = undefined;
    if (promotionStatus === 'promoted') {
        approvedRecordDraft = {
            recordId: candidate.normalizedSource.sourceId,
            version: '1.0.0',
            status: 'approved',
            authority: {
                agency: candidate.normalizedSource.agency as AuthorityAgency,
                authorityTier: candidate.normalizedSource.authorityTier as AuthorityTier,
                jurisdiction: candidate.normalizedSource.jurisdiction as Jurisdiction,
                sourceUrl: candidate.normalizedSource.sourceUrl,
                citation: candidate.normalizedSource.citation,
                title: candidate.normalizedSource.title,
                effectiveDate: candidate.normalizedSource.effectiveDate,
                revisionDate: candidate.normalizedSource.revisionDate,
                sourceDateStatus: candidate.normalizedSource.sourceDateStatus as SourceDateStatus
            },
            mapping: candidate.mapping,
            applicability: {
                plainLanguageSummary: 'Advisory assessment based on ingested source.',
                appliesWhen: 'Task matches identified contexts.',
                doesNotApplyWhen: 'None specified.',
                requiredReviewerChecks: []
            },
            correctiveActionLinks: {
                preferredControlFamilies: [],
                verificationMethods: [],
                commonWeakActionsToAvoid: []
            },
            governance: {
                approvedBy: reviewerName,
                approvedAt: new Date().toISOString(),
                reviewerRole: reviewerRole,
                changeReason: 'Source ingestion promotion',
                supersedesRecordIds: [],
                duplicateKeys: [],
                advisoryOnly: true,
                doesNotDeclareViolation: true,
                doesNotCreateCitation: true,
                requiresQualifiedReview: true
            }
        };
    }

    const result: PromotionResult = {
      promotionStatus,
      canWriteApprovedRegistry,
      reasons,
      approvedRecordDraft,
      auditTrail: {
          promotedAt: new Date().toISOString(),
          promotedBy: reviewerName,
          role: reviewerRole,
          decision: reviewerDecision
      }
    };

    // 5. Persist Promotion Event
    await this.persistence.save({
        type: 'source_promotion_audit',
        status: promotionStatus,
        payload: result,
        metadata: {
            candidateId: candidate.candidateId,
            reviewerName,
            reviewerRole
        }
    });

    return result;
  }

  private normalizeSource(input: SourceIngestionInput): any {
      return {
          sourceId: input.sourceId,
          agency: input.agency,
          jurisdiction: input.jurisdiction,
          authorityTier: input.authorityTier,
          citation: input.citation,
          title: input.title,
          sourceUrl: input.sourceUrl,
          effectiveDate: input.effectiveDate,
          revisionDate: input.revisionDate,
          sourceDateStatus: input.sourceDateStatus
      };
  }

  private createMapping(input: SourceIngestionInput): any {
      return {
          domainId: input.mappedDomainId,
          standardFamily: input.mappedStandardFamily,
          hazardFamilies: input.mappedHazardFamilies,
          mechanisms: input.mappedMechanisms,
          equipmentGroups: input.mappedEquipmentGroups,
          taskContexts: input.mappedTaskContexts,
          applicabilitySignals: input.applicabilitySignals,
          requiredFacts: input.requiredFacts,
          disqualifyingFacts: input.disqualifyingFacts,
          evidenceQuestions: input.evidenceQuestions
      };
  }

  private detectDuplicatesAndConflicts(input: SourceIngestionInput): DuplicateConflictAnalysis {
      const existing = this.searchService.search({
          standardFamily: input.mappedStandardFamily
      });

      const exactMatch = existing.find((r: ApprovedKnowledgeRecord) => r.authority.citation === input.citation);
      if (exactMatch) {
          return {
              duplicateStatus: 'exact_duplicate',
              conflictStatus: 'none',
              matchedExistingRecordIds: [exactMatch.recordId],
              conflictReasons: ['Matching citation found in approved registry.'],
              recommendedDisposition: 'Reject duplicate'
          };
      }

      const possibleMatch = existing.find((r: ApprovedKnowledgeRecord) => r.mapping.domainId === input.mappedDomainId);
      if (possibleMatch) {
          return {
              duplicateStatus: 'possible_duplicate',
              conflictStatus: 'metadata_conflict',
              matchedExistingRecordIds: [possibleMatch.recordId],
              conflictReasons: ['Overlapping domain and standard family.'],
              recommendedDisposition: 'Review for possible merge'
          };
      }

      return {
          duplicateStatus: 'none',
          conflictStatus: 'none',
          matchedExistingRecordIds: [],
          conflictReasons: [],
          recommendedDisposition: 'Accept as new candidate'
      };
  }
}
