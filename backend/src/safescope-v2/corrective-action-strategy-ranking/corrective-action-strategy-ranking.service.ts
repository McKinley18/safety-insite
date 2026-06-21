import { Injectable } from '@nestjs/common';
import { 
  CorrectiveActionStrategyResult, 
  RankedAction, 
  ActionPosture, 
  ActionType, 
  Priority 
} from './corrective-action-strategy-ranking.types';
import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { ObservationNarrativeSynthesisResult } from '../observation-narrative-synthesis/observation-narrative-synthesis.types';
import { CrossDomainCausalChainResult } from '../cross-domain-causal-chain/cross-domain-causal-chain.types';

@Injectable()
export class CorrectiveActionStrategyRankingService {

  rank(input: {
    observationText: string;
    taxonomyRoute: any;
    approvedKnowledgeMatches: any[];
    scenarioMatches: any[];
    evaluatedScenarios: any[];
    evidenceWeighting: EvidenceWeightingResult;
    multiHazardAnalysis: MultiHazardDecompositionResult;
    narrativeSynthesis: ObservationNarrativeSynthesisResult;
    causalChainAnalysis: CrossDomainCausalChainResult;
    context?: any;
  }): CorrectiveActionStrategyResult {
    const { 
      observationText, 
      evidenceWeighting, 
      multiHazardAnalysis, 
      causalChainAnalysis,
      evaluatedScenarios
    } = input;
    
    const rankingRationale: string[] = [];
    const allActions: RankedAction[] = [];
    
    const isConflicting = evidenceWeighting.evidenceGrade === 'conflicting';
    const isInsufficient = evidenceWeighting.evidenceGrade === 'insufficient' || evidenceWeighting.evidenceGrade === 'weak';
    const hasActiveExposure = /employee|person|worker|exposed|nearby|within reach|access|walkway|travel path|pedestrian/i.test(observationText);
    const hasSeriousMechanism = causalChainAnalysis.compoundRiskLevel === 'high' || causalChainAnalysis.compoundRiskLevel === 'critical';
    const hasClearHazardControlBasis = this.hasClearHazardControlBasis(observationText, input);

    // 1. Determine Action Posture
    let actionPosture: ActionPosture = 'monitor';
    if (isConflicting) {
      actionPosture = 'questions_only';
      rankingRationale.push('Evidence is conflicting; prioritizing verification questions.');
    } else if (isInsufficient && hasClearHazardControlBasis) {
      actionPosture = 'verify_then_act';
      rankingRationale.push('Evidence needs verification, but the hazard mechanism and control direction are clear enough for cautious advisory action.');
    } else if (isInsufficient) {
      actionPosture = 'questions_only';
      rankingRationale.push('Evidence is weak; prioritizing verification questions.');
    } else if (hasActiveExposure && hasSeriousMechanism) {
      actionPosture = 'act_now';
      rankingRationale.push('Active exposure and high-severity hazard detected; immediate control required.');
    } else if (causalChainAnalysis.primaryCausalChain.length > 0) {
      actionPosture = 'verify_then_act';
      rankingRationale.push('Compound hazard interaction detected; verify conditions before full corrective action.');
    } else if (hasSeriousMechanism) {
      actionPosture = 'escalate_review';
      rankingRationale.push('High severity potential requires qualified reviewer escalation.');
    }

    // 2. Add Domain-Specific Actions (Deterministic Mock for v1)
    const lowerText = observationText.toLowerCase();
    
    // Machine Guarding / LOTO
    if (lowerText.includes('conveyor') || lowerText.includes('guard') || lowerText.includes('loto')) {
      if (lowerText.includes('unguarded') || lowerText.includes('removed')) {
        allActions.push(this.createAction('mg-01', 'immediate', 'critical', 'Physical Guarding', 'Install temporary barrier or stop equipment.', 'Direct nip-point exposure detected.'));
        allActions.push(this.createAction('mg-02', 'permanent', 'high', 'Engineering Control', 'Install fixed physical guard.', 'Permanent solution for rotating equipment hazard.'));
      }
      if (!lowerText.includes('locked out') && lowerText.includes('energized')) {
        allActions.push(this.createAction('loto-01', 'immediate', 'critical', 'Hazardous Energy Control', 'De-energize and Lock Out Tag Out (LOTO) equipment.', 'Unexpected startup risk detected.'));
      }
    }

    // Electrical
    if (lowerText.includes('cord') || lowerText.includes('wire') || lowerText.includes('panel')) {
      if (lowerText.includes('damaged') || lowerText.includes('exposed')) {
        allActions.push(this.createAction('elec-01', 'immediate', 'critical', 'Isolation', 'Remove damaged equipment from service.', 'Electric shock pathway exists.'));
      }
    }

    // Fall Protection
    if (lowerText.includes('edge') || lowerText.includes('platform') || lowerText.includes('fall')) {
      allActions.push(this.createAction('fall-01', 'immediate', 'high', 'Fall Protection', 'Restrict access to the unprotected edge.', 'Fall from height risk.'));
    }

    // 3. Add Weak Actions to Avoid
    const weakActions: RankedAction[] = [];
    if (hasSeriousMechanism) {
        weakActions.push(this.createAction('weak-01', 'weak_action_to_avoid', 'low', 'Administrative', 'Relying solely on "being careful" or "paying attention".', 'Administrative controls do not eliminate the hazard source.'));
        weakActions.push(this.createAction('weak-02', 'weak_action_to_avoid', 'low', 'Administrative', '"Retrain only" without physical controls.', 'Training alone is insufficient for serious physical hazards.'));
    }

    // 4. Add Verification Steps and Questions
    const verificationSteps: RankedAction[] = [];
    const supervisorQuestions: RankedAction[] = [];
    
    if (isConflicting || isInsufficient) {
        verificationSteps.push(this.createAction('ver-01', 'verification', 'high', 'Fact Finding', 'Verify the actual energy state and employee exposure.', 'Conflicting evidence in observation.'));
        evidenceWeighting.reviewerQuestions.forEach((q, i) => {
            supervisorQuestions.push(this.createAction(`q-${i}`, 'question', 'medium', 'Review', q, 'Required to clarify observation.'));
        });
    }

    // 5. Final Categorization and Result
    return {
      strategyVersion: 'v1',
      rankedActions: allActions.sort((a, b) => this.priorityToLevel(b.priority) - this.priorityToLevel(a.priority)),
      immediateControls: allActions.filter(a => a.actionType === 'immediate'),
      interimControls: allActions.filter(a => a.actionType === 'interim'),
      permanentControls: allActions.filter(a => a.actionType === 'permanent'),
      verificationSteps,
      weakActionsToAvoid: weakActions,
      supervisorQuestions,
      rankingRationale,
      confidence: evidenceWeighting.finalEvidenceConfidence / 10,
      actionPosture,
      advisoryBoundary: 'SafeScope corrective action strategies are advisory only.'
    };
  }

  private hasClearHazardControlBasis(observationText: string, input: {
    taxonomyRoute: any;
    approvedKnowledgeMatches: any[];
    scenarioMatches: any[];
    evaluatedScenarios: any[];
    causalChainAnalysis: CrossDomainCausalChainResult;
  }): boolean {
    const combined = [
      observationText,
      input.taxonomyRoute?.hazardDomain,
      input.taxonomyRoute?.candidateStandardFamily,
      input.taxonomyRoute?.classification,
      ...(Array.isArray(input.approvedKnowledgeMatches) ? input.approvedKnowledgeMatches.map((m: any) => `${m?.hazardFamily || ''} ${m?.standardFamily || ''} ${m?.equipmentFamily || ''}`) : []),
      ...(Array.isArray(input.scenarioMatches) ? input.scenarioMatches.map((m: any) => `${m?.hazardDomain || ''} ${m?.mechanism || ''}`) : []),
      ...(Array.isArray(input.evaluatedScenarios) ? input.evaluatedScenarios.map((m: any) => `${m?.hazardDomain || ''} ${m?.mechanism || ''}`) : []),
      ...(Array.isArray(input.causalChainAnalysis?.primaryCausalChain) ? input.causalChainAnalysis.primaryCausalChain : []),
    ].filter(Boolean).join(' ').toLowerCase();

    const hasMechanism =
      /cylinder|compressed gas|pressure|stored energy|electrical|shock|arc flash|fall|slip|trip|guard|pinch|caught|struck|chemical|spill|fire|explosion|loto|lockout|traffic|mobile equipment/i.test(combined);

    const hasControlFailure =
      /unsecured|missing|failed|damaged|exposed|unguarded|unprotected|open|leaking|spill|no guard|no restraint|no barricade|no cover|not locked out|blocked|defective/i.test(combined);

    const hasKnownHazardDomain =
      /compressed_gas|compressed gas|cylinder|electrical|fall|walking|machine|guard|chemical|hazcom|fire|explosion|loto|stored energy|mobile equipment|traffic|confined space|ppe|noise|silica|rigging|hoist|welding|ground control/i.test(combined);

    return hasMechanism && hasControlFailure && hasKnownHazardDomain;
  }

  private createAction(id: string, type: ActionType, priority: Priority, family: string, text: string, reason: string): RankedAction {
    return {
      id,
      actionType: type,
      priority,
      controlFamily: family,
      actionText: text,
      reason,
      linkedHazardDomains: [],
      linkedScenarioIds: [],
      linkedCausalChains: [],
      evidenceDependency: 'Direct observation',
      confidence: 0.9,
      requiresHumanVerification: true
    };
  }

  private priorityToLevel(p: Priority): number {
    switch (p) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
    }
  }
}
