import { Injectable } from '@nestjs/common';
import { 
  SourceFreshnessInput, 
  SourceFreshnessGovernanceResult, 
  FreshnessStatus, 
  AuthorityStatus, 
  UseRestriction 
} from './source-freshness-governance.types';

@Injectable()
export class SourceFreshnessGovernanceService {

  evaluate(input: SourceFreshnessInput): SourceFreshnessGovernanceResult {
    let freshnessStatus: FreshnessStatus = 'unknown';
    let authorityStatus: AuthorityStatus = 'unknown_authority';
    let useRestriction: UseRestriction = 'review_required';
    let freshnessScore = 0.5;
    let confidenceImpact = 0;
    
    const requiredReviewerActions: string[] = [];
    const sourceWarnings: string[] = [];
    const updateQuestions: string[] = [];
    const advisoryBoundary = 'SafeScope source freshness governance is advisory only.';

    // 1. Map Authority Status
    const tier = (input.authorityTier || '').toLowerCase();
    if (tier === 'primary_regulation') {
        authorityStatus = 'primary_authority';
    } else if (tier === 'official_guidance') {
        authorityStatus = 'official_guidance';
    } else if (tier === 'consensus_standard') {
        authorityStatus = 'consensus_reference';
    } else if (tier === 'company_policy') {
        authorityStatus = 'company_policy';
    }

    // 2. Freshness Logic
    const status = (input.sourceDateStatus || '').toLowerCase();
    const hasDates = input.effectiveDate || input.revisionDate;
    
    if (status === 'superseded' || input.supersededBy) {
        freshnessStatus = 'superseded';
        useRestriction = 'blocked';
        freshnessScore = 0;
        confidenceImpact = -1.0;
        sourceWarnings.push('This source has been superseded by a newer version or regulation.');
        requiredReviewerActions.push('Replace this record with current authority version.');
    } else if (status === 'stale') {
        freshnessStatus = 'stale';
        useRestriction = 'caution';
        freshnessScore = 0.3;
        confidenceImpact = -0.3;
        sourceWarnings.push('The source date status is marked as stale.');
        updateQuestions.push('Is there a more recent revision of this standard available?');
    } else if (status === 'current') {
        freshnessStatus = 'current';
        useRestriction = 'allowed';
        freshnessScore = 1.0;
        if (!hasDates) {
            freshnessStatus = 'missing_source_date';
            useRestriction = 'review_required';
            sourceWarnings.push('Record is marked current but lacks specific effective or revision dates.');
        }
    } else if (!hasDates) {
        freshnessStatus = 'missing_source_date';
        useRestriction = 'review_required';
        freshnessScore = 0.2;
        sourceWarnings.push('Primary source dates are missing.');
    }

    // 3. Last Verified Check
    if (input.lastVerifiedAt) {
        const lastVerified = new Date(input.lastVerifiedAt).getTime();
        const now = Date.now();
        const daysOld = (now - lastVerified) / (1000 * 60 * 60 * 24);
        
        if (daysOld > 365) {
            freshnessStatus = 'stale';
            if (useRestriction === 'allowed') useRestriction = 'caution';
            sourceWarnings.push(`Source has not been verified in over a year (${Math.round(daysOld)} days old).`);
            updateQuestions.push('When was the last time the source URL was checked for updates?');
        }
    }

    // 4. Authority Tier restrictions
    if (authorityStatus === 'company_policy') {
        sourceWarnings.push('This is internal company policy, not a regulatory standard.');
        if (useRestriction === 'allowed') freshnessScore *= 0.9;
    } else if (authorityStatus === 'consensus_reference') {
        sourceWarnings.push('This is a consensus standard (e.g. ANSI/NFPA) and may not have direct regulatory enforcement.');
    }

    return {
      freshnessStatus,
      authorityStatus,
      useRestriction,
      freshnessScore,
      confidenceImpact,
      requiredReviewerActions,
      sourceWarnings,
      updateQuestions,
      advisoryBoundary
    };
  }
}
