import { Injectable } from '@nestjs/common';
import { HazardCondition } from '../../standards/entities/hazard-condition.entity';
import { ClassificationResult } from './types';

@Injectable()
export class MatchEngine {
  classify(description: string, taxonomy: HazardCondition[]): ClassificationResult {
    const tokens = description.toLowerCase().split(/\s+/);
    
    // Deterministic match logic
    const matches = taxonomy.filter(cond => 
       cond.keywords.some(k => tokens.includes(k)) &&
       !cond.suppressors.some(s => tokens.includes(s))
    );

    return {
      conditionId: matches[0]?.id || 'unknown',
      confidence: matches.length > 0 ? 0.8 : 0,
      evidenceTokens: [],
      reasoning: 'Deterministic keyword match pass'
    };
  }
}
