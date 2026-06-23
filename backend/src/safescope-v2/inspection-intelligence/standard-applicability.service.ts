import { Injectable } from '@nestjs/common';
import { EXPERT_APPLICABILITY_RULES } from './standard-applicability.rules';
import { EvidenceSufficiencyGateService } from './evidence-sufficiency-gate.service';
import { FollowUpQuestionIntelligenceService } from './follow-up-question-intelligence.service';
import { StandardApplicabilityResult, ExpertApplicabilityRule, EvidenceGateResult } from './standard-applicability.types';
import { SafeScopeJurisdiction } from '../reasoning-orchestrator/reasoning-orchestrator.types';

@Injectable()
export class StandardApplicabilityService {
  constructor(
    private readonly gateService = new EvidenceSufficiencyGateService(),
    private readonly questionService = new FollowUpQuestionIntelligenceService(),
  ) {}

  evaluate(text: string, jurisdiction: SafeScopeJurisdiction): StandardApplicabilityResult {
    const matchedRules: ExpertApplicabilityRule[] = [];
    const evaluationResults: EvidenceGateResult[] = [];
    const suggestedStandards: string[] = [];
    const needsMoreEvidenceStandards: string[] = [];
    
    const lowerText = text.toLowerCase();

    // 1. Find matched rules based on appliesWhen and jurisdiction match
    for (const rule of EXPERT_APPLICABILITY_RULES) {
      // Check jurisdiction match
      if (jurisdiction !== 'unclear' && rule.jurisdiction !== 'all' && rule.jurisdiction !== jurisdiction) {
        continue;
      }

      // Check appliesWhen patterns
      let matchesKeywords = false;
      for (const pattern of rule.appliesWhen) {
        if (pattern.test(lowerText)) {
          matchesKeywords = true;
          break;
        }
      }

      if (matchesKeywords) {
        matchedRules.push(rule);
      }
    }

    // 2. Evaluate evidence sufficiency gates
    const failedRules: ExpertApplicabilityRule[] = [];
    for (const rule of matchedRules) {
      const gateResult = this.gateService.evaluate(rule, text);
      evaluationResults.push(gateResult);

      if (gateResult.isSufficient) {
        if (!suggestedStandards.includes(rule.standardCitation)) {
          suggestedStandards.push(rule.standardCitation);
        }
      } else {
        if (!gateResult.excludedByDoNotSelect) {
          failedRules.push(rule);
          if (!needsMoreEvidenceStandards.includes(rule.standardCitation)) {
            needsMoreEvidenceStandards.push(rule.standardCitation);
          }
        }
      }
    }

    // 3. Generate follow-up questions for failed rules
    const followUpQuestions = this.questionService.generateQuestions(failedRules);

    return {
      matchedRules: matchedRules.map((rule) => ({
        id: rule.id,
        citation: rule.standardCitation,
        standardTitle: rule.standardTitle,
        jurisdiction: rule.jurisdiction,
        hazardFamily: rule.hazardFamily,
      })),
      evaluationResults,
      suggestedStandards,
      needsMoreEvidenceStandards,
      followUpQuestions,
    };
  }
}
