import { Injectable } from '@nestjs/common';
import { 
  RiskVerificationResidualRiskResult, 
  VerificationStatus, 
  ResidualRiskLevel, 
  ActionEffectiveness 
} from './risk-verification-residual-risk.types';
import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { CrossDomainCausalChainResult } from '../cross-domain-causal-chain/cross-domain-causal-chain.types';
import { CorrectiveActionStrategyResult } from '../corrective-action-strategy-ranking/corrective-action-strategy-ranking.types';

@Injectable()
export class RiskVerificationResidualRiskService {

  evaluate(input: {
    observationText: string;
    hazardRoute: any;
    evidenceWeighting: EvidenceWeightingResult;
    multiHazardAnalysis: MultiHazardDecompositionResult;
    causalChains: CrossDomainCausalChainResult;
    correctiveActionStrategy: CorrectiveActionStrategyResult;
    proposedActions?: string[];
    completedActions?: string[];
    context?: any;
  }): RiskVerificationResidualRiskResult {
    const { 
      observationText, 
      evidenceWeighting, 
      multiHazardAnalysis,
      causalChains, 
      completedActions = [] 
    } = input;
    
    const lowerText = observationText.toLowerCase();
    const actionText = completedActions.join(' ').toLowerCase();
    
    let verificationStatus: VerificationStatus = 'verification_needed';
    let residualRiskLevel: ResidualRiskLevel = 'moderate';
    let actionEffectiveness: ActionEffectiveness = 'unknown';
    
    const addressedMechanisms: string[] = [];
    const unaddressedMechanisms: string[] = [...causalChains.plausibleInjuryMechanisms];
    const verificationSteps: string[] = [];
    const residualRiskReasons: string[] = [];
    const additionalControlsNeeded: string[] = [];
    const weakActionWarnings: string[] = [];
    const reviewerQuestions: string[] = [];
    
    const isConflicting = evidenceWeighting.evidenceGrade === 'conflicting';
    const isInsufficient = evidenceWeighting.evidenceGrade === 'insufficient';
    
    // 1. Detect Weak Actions
    const weakActionPatterns = [
        /be careful/i, 
        /retrain/i, 
        /monitor/i, 
        /talk to/i, 
        /sign only/i, 
        /remind/i, 
        /clean later/i, 
        /inspect later/i,
        /pay attention/i
    ];
    
    const foundWeakActions = weakActionPatterns.filter(pattern => pattern.test(actionText));
    if (foundWeakActions.length > 0) {
        actionEffectiveness = 'weak';
        weakActionWarnings.push(`Weak actions detected (administrative-only). Physical hazards require engineering or isolation controls.`);
        residualRiskLevel = 'high';
        residualRiskReasons.push('Proposed actions rely on administrative controls rather than hazard elimination or engineering isolation.');
    }
    
    // 2. Detect Strong Actions
    const strongActionPatterns = [
        /remove from service/i, 
        /isolate energy/i, 
        /lock out/i, 
        /tag out/i, 
        /install guard/i, 
        /replace guard/i, 
        /barricade/i, 
        /exclusion zone/i, 
        /repair/i, 
        /replace damaged/i, 
        /stop work/i, 
        /test atmosphere/i
    ];
    
    const foundStrongActions = strongActionPatterns.filter(pattern => pattern.test(actionText));
    if (foundStrongActions.length > 0) {
        actionEffectiveness = 'effective';
        verificationStatus = 'partially_verified';
        residualRiskLevel = 'low';
        addressedMechanisms.push(...unaddressedMechanisms.splice(0, unaddressedMechanisms.length));
    }

    // 3. Handle Special Cases (Interactions)
    if (isConflicting) {
        verificationStatus = 'escalation_required';
        residualRiskLevel = 'unknown';
        reviewerQuestions.push('Conflicting evidence detected. High-level review required to verify actual site conditions.');
    }
    
    if (lowerText.includes('conveyor') && (lowerText.includes('unguarded') || lowerText.includes('removed'))) {
        if (/retrain|remind|talk to|careful/.test(actionText)) {
            residualRiskLevel = 'high';
            residualRiskReasons.push('Machine guarding gaps require physical isolation or guarding; training does not eliminate the rotating parts exposure.');
        }
    }

    if (lowerText.includes('wet') && lowerText.includes('spill')) {
        if (actionText.includes('clean')) {
            verificationStatus = 'residual_risk_remaining';
            verificationSteps.push('Verify surface is dry and non-slip before removing barricades.');
            residualRiskLevel = 'moderate';
            residualRiskReasons.push('Cleaning action taken, but moisture may still create conductive or slip hazards.');
        }
    }

    // 4. Multi-hazard unresolved risk
    if (multiHazardAnalysis?.isMultiHazard && completedActions.length < multiHazardAnalysis.hazardCount) {
        verificationStatus = 'residual_risk_remaining';
        residualRiskLevel = 'high';
        residualRiskReasons.push('Multiple hazards detected but only partial corrective action provided.');
    }

    return {
      verificationStatus,
      residualRiskLevel,
      actionEffectiveness,
      addressedMechanisms,
      unaddressedMechanisms,
      verificationSteps,
      residualRiskReasons,
      additionalControlsNeeded,
      weakActionWarnings,
      reviewerQuestions,
      confidenceAdjustment: isConflicting ? -0.5 : 0,
      advisoryBoundary: 'SafeScope risk verification and residual risk reassessment is advisory only.'
    };
  }
}
