import { Injectable } from '@nestjs/common';
import { 
  JurisdictionApplicabilityInput, 
  JurisdictionApplicabilityResult, 
  Jurisdiction, 
  ApplicabilityConfidence, 
  ApplicabilityStatus 
} from './jurisdiction-applicability-decision-tree.types';

@Injectable()
export class JurisdictionApplicabilityDecisionTreeService {

  evaluate(input: JurisdictionApplicabilityInput): JurisdictionApplicabilityResult {
    const { observationText } = input;
    const lowerText = observationText.toLowerCase();
    
    const mshaSignals = [
        'mine', 'quarry', 'pit', 'plant', 'crusher', 'screen', 'conveyor at mine', 
        'haul truck', 'loader at mine', 'miner', 'stockpile', 'scale house', 
        'mill', 'processing plant', 'aggregate', 'sand and gravel', 'surface mine', 'underground mine'
    ];

    const oshaConstructionSignals = [
        'excavation', 'trench', 'scaffold', 'framing', 'roofing', 'demolition', 
        'construction site', 'temporary work platform', 'concrete placement', 
        'steel erection', 'ladder during construction', 'formwork', 'jobsite'
    ];

    const oshaGeneralIndustrySignals = [
        'warehouse', 'manufacturing', 'shop', 'maintenance shop', 'forklift aisle', 
        'powered industrial truck', 'machine shop', 'production floor', 
        'loading dock', 'facility'
    ];

    const companyPolicySignals = [
        'site rule', 'company policy', 'internal procedure', 'housekeeping policy', 
        'visitor policy', 'ppe policy', 'owner requirement'
    ];

    const matchedMSHA = mshaSignals.filter(s => lowerText.includes(s));
    const matchedOSHAConst = oshaConstructionSignals.filter(s => lowerText.includes(s));
    const matchedOSHAGen = oshaGeneralIndustrySignals.filter(s => lowerText.includes(s));
    const matchedPolicy = companyPolicySignals.filter(s => lowerText.includes(s));

    let primaryJurisdiction: Jurisdiction = 'unclear';
    const secondaryJurisdictions: Jurisdiction[] = [];
    let applicabilityConfidence: ApplicabilityConfidence = 'low';
    let applicabilityStatus: ApplicabilityStatus = 'not_enough_information';
    const matchedJurisdictionSignals: string[] = [];
    const conflictingJurisdictionSignals: string[] = [];
    const missingJurisdictionFacts: string[] = [];
    const allowedKnowledgeScopes: string[] = [];
    const blockedKnowledgeScopes: string[] = [];
    const reviewerQuestions: string[] = [];

    // Scoring and selection
    if (matchedMSHA.length > 0) {
        matchedJurisdictionSignals.push(...matchedMSHA);
        if (primaryJurisdiction === 'unclear') {
            primaryJurisdiction = 'msha';
            allowedKnowledgeScopes.push('msha');
        } else {
            primaryJurisdiction = 'mixed';
            secondaryJurisdictions.push('msha');
        }
    }

    if (matchedOSHAConst.length > 0) {
        matchedJurisdictionSignals.push(...matchedOSHAConst);
        if (primaryJurisdiction === 'unclear') {
            primaryJurisdiction = 'osha_construction';
            allowedKnowledgeScopes.push('osha_construction');
        } else if (primaryJurisdiction === 'msha') {
            primaryJurisdiction = 'mixed';
            conflictingJurisdictionSignals.push('MSHA vs OSHA Construction');
            secondaryJurisdictions.push('osha_construction');
        } else {
            secondaryJurisdictions.push('osha_construction');
        }
    }

    if (matchedOSHAGen.length > 0) {
        matchedJurisdictionSignals.push(...matchedOSHAGen);
        if (primaryJurisdiction === 'unclear') {
            primaryJurisdiction = 'osha_general_industry';
            allowedKnowledgeScopes.push('osha_general_industry');
        } else if (primaryJurisdiction === 'msha') {
            primaryJurisdiction = 'mixed';
            conflictingJurisdictionSignals.push('MSHA vs OSHA General Industry');
            secondaryJurisdictions.push('osha_general_industry');
        } else {
            secondaryJurisdictions.push('osha_general_industry');
        }
    }

    if (matchedPolicy.length > 0 && primaryJurisdiction === 'unclear') {
        primaryJurisdiction = 'company_policy_only';
        applicabilityStatus = 'company_policy_only';
        matchedJurisdictionSignals.push(...matchedPolicy);
    }

    // Confidence and Review Requirement
    const humanReviewRequired = primaryJurisdiction === 'unclear' || primaryJurisdiction === 'mixed' || conflictingJurisdictionSignals.length > 0;
    
    if (primaryJurisdiction !== 'unclear' && primaryJurisdiction !== 'mixed') {
        applicabilityConfidence = 'high';
        applicabilityStatus = 'applicable';
    } else if (primaryJurisdiction === 'mixed') {
        applicabilityConfidence = 'moderate';
        applicabilityStatus = 'jurisdiction_conflict';
        reviewerQuestions.push('Please clarify if this activity falls under MSHA or OSHA jurisdiction.');
    } else {
        reviewerQuestions.push('Observation lacks clear jurisdiction signals. Is this a mine, construction site, or general facility?');
        missingJurisdictionFacts.push('Site/industry context missing from text.');
    }

    // Check for source match conflicts
    if (input.approvedKnowledgeMatches) {
        input.approvedKnowledgeMatches.forEach(match => {
            const agency = (match.authority?.agency || '').toLowerCase();
            if (primaryJurisdiction === 'msha' && agency === 'osha') {
                blockedKnowledgeScopes.push(match.recordId);
                reviewerQuestions.push(`Verify if OSHA ${match.authority.citation} applies to this MSHA site.`);
            }
            if (primaryJurisdiction === 'osha_general_industry' && agency === 'msha') {
                blockedKnowledgeScopes.push(match.recordId);
            }
        });
    }

    return {
      primaryJurisdiction,
      secondaryJurisdictions,
      applicabilityConfidence,
      applicabilityStatus,
      matchedJurisdictionSignals,
      conflictingJurisdictionSignals,
      missingJurisdictionFacts,
      allowedKnowledgeScopes,
      blockedKnowledgeScopes,
      humanReviewRequired,
      reviewerQuestions,
      reasoningSummary: `Jurisdiction identified as ${primaryJurisdiction} based on ${matchedJurisdictionSignals.length} signals.`,
      advisoryBoundary: 'SafeScope jurisdiction assessment is advisory and requires qualified legal/safety review.'
    };
  }
}
