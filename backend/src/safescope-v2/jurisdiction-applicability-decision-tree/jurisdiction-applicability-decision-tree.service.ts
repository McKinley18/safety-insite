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
    const { observationText, scenarioFamily } = input;
    const lowerText = observationText.toLowerCase();

    // Explicit high-authority mapping from scenarioFamily to canonical jurisdiction
    const scenarioFamilyMap: Record<string, Jurisdiction> = {
      'conveyor_cleanup': 'msha',
      'rotating_shaft_guarding': 'msha',
      'unguarded_conveyor_pulley': 'msha',
      'fall_protection_unprotected_edge': 'osha_construction',
      'chemical_label_sds_gap': 'osha_general_industry',
      'damaged_cord_wet_location': 'osha_general_industry',
      'electrical_panel_access': 'osha_general_industry',
      'housekeeping_slip_trip': 'osha_general_industry',
      'mobile_equipment_pedestrian_interaction': 'osha_general_industry',
      'point_of_operation_guarding': 'osha_general_industry'
    };
    
    const mshaSignals = [
        'mine', 'quarry', 'pit', 'crusher', 'screen', 'conveyor at mine', 
        'haul truck', 'loader at mine', 'miner', 'stockpile', 'scale house', 
        'mill', 'processing plant', 'aggregate', 'sand and gravel', 'surface mine', 'underground mine',
        'tail pulley', 'head pulley', 'feed conveyor', 'coal spillage', 'loose coal', 'unbolted'
    ];

    const oshaConstructionSignals = [
        'excavation', 'trench', 'scaffold', 'framing', 'roofing', 'demolition', 
        'construction site', 'temporary work platform', 'concrete placement', 
        'steel erection', 'ladder during construction', 'formwork', 'jobsite',
        'toe board', 'walk plank'
    ];

    const oshaGeneralIndustrySignals = [
        'warehouse', 'manufacturing', 'shop', 'maintenance shop', 'forklift aisle', 
        'powered industrial truck', 'machine shop', 'production floor', 
        'loading dock', 'facility', 'table saw', 'blade guard', 'wood cutting',
        'breaker panel', 'electrical breaker', 'extension cord', 'chemical container', 'workbench'
    ];

    const companyPolicySignals = [
        'site rule', 'company policy', 'internal procedure', 'housekeeping policy', 
        'visitor policy', 'ppe policy', 'owner requirement'
    ];

    const calOshaSignals = [
        'california', 'cal/osha', 'cal-osha', 'title 8', 'california state plan'
    ];

    const waDoshSignals = [
        'washington state', 'wa dosh', 'wisha', 'washington state plan', 'chapter 296'
    ];

    const matchedMSHA = mshaSignals.filter(s => lowerText.includes(s));
    const matchedOSHAConst = oshaConstructionSignals.filter(s => lowerText.includes(s));
    const matchedOSHAGen = oshaGeneralIndustrySignals.filter(s => lowerText.includes(s));
    const matchedPolicy = companyPolicySignals.filter(s => lowerText.includes(s));
    const matchedCalOsha = calOshaSignals.filter(s => lowerText.includes(s));
    const matchedWaDosh = waDoshSignals.filter(s => lowerText.includes(s));

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

    // Pre-populate based on high-authority scenario mapping
    const normalizedScenario = scenarioFamily ? scenarioFamily.replace(/-/g, '_') : undefined;
    if (normalizedScenario && scenarioFamilyMap[normalizedScenario]) {
      primaryJurisdiction = scenarioFamilyMap[normalizedScenario];
    }

    // Scoring and selection
    if (matchedMSHA.length > 0) {
        matchedJurisdictionSignals.push(...matchedMSHA);
        if (!allowedKnowledgeScopes.includes('msha')) {
            allowedKnowledgeScopes.push('msha');
        }
    }

    if (matchedOSHAConst.length > 0) {
        matchedJurisdictionSignals.push(...matchedOSHAConst);
        if (!allowedKnowledgeScopes.includes('osha_construction')) {
            allowedKnowledgeScopes.push('osha_construction');
        }
    }

    if (matchedOSHAGen.length > 0) {
        matchedJurisdictionSignals.push(...matchedOSHAGen);
        if (!allowedKnowledgeScopes.includes('osha_general_industry')) {
            allowedKnowledgeScopes.push('osha_general_industry');
        }
    }

    // Apply keyword-based fallback only if primaryJurisdiction is still unclear
    if (primaryJurisdiction === 'unclear') {
        let matchedCount = 0;
        let selectedJurisdiction: Jurisdiction = 'unclear';

        if (matchedMSHA.length > 0) {
            matchedCount++;
            selectedJurisdiction = 'msha';
        }
        if (matchedOSHAConst.length > 0) {
            matchedCount++;
            selectedJurisdiction = 'osha_construction';
        }
        if (matchedOSHAGen.length > 0) {
            matchedCount++;
            selectedJurisdiction = 'osha_general_industry';
        }

        if (matchedCount > 1) {
            primaryJurisdiction = 'mixed';
            conflictingJurisdictionSignals.push('Multiple jurisdiction signals matched in text');
        } else if (matchedCount === 1) {
            primaryJurisdiction = selectedJurisdiction;
        }
    }

    if (primaryJurisdiction !== 'unclear' && primaryJurisdiction !== 'mixed' && !allowedKnowledgeScopes.includes(primaryJurisdiction)) {
        allowedKnowledgeScopes.push(primaryJurisdiction);
    }

    if (matchedCalOsha.length > 0) {
        matchedJurisdictionSignals.push(...matchedCalOsha);
        if (primaryJurisdiction === 'unclear' || primaryJurisdiction === 'osha_general_industry' || primaryJurisdiction === 'osha_construction') {
            primaryJurisdiction = 'cal_osha';
            allowedKnowledgeScopes.push('cal_osha');
        } else {
            primaryJurisdiction = 'mixed';
            secondaryJurisdictions.push('cal_osha');
        }
    }

    if (matchedWaDosh.length > 0) {
        matchedJurisdictionSignals.push(...matchedWaDosh);
        if (primaryJurisdiction === 'unclear' || primaryJurisdiction === 'osha_general_industry' || primaryJurisdiction === 'osha_construction') {
            primaryJurisdiction = 'wa_dosh';
            allowedKnowledgeScopes.push('wa_dosh');
        } else {
            primaryJurisdiction = 'mixed';
            secondaryJurisdictions.push('wa_dosh');
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
