import { Injectable } from '@nestjs/common';
import { 
  OfflineReasoningInput, 
  OfflineReasoningResult 
} from './offline-reasoning-mobile-resilience.types';

@Injectable()
export class OfflineReasoningMobileResilienceService {
  private readonly serviceVersion = '1.0.0';
  private readonly advisoryBoundary = 'SafeScope offline reasoning is advisory only and utilizes limited local knowledge summaries. Results are not final until verified online.';

  evaluate(input: OfflineReasoningInput): OfflineReasoningResult {
    const { observationText, offlineKnowledgePackVersion } = input;
    const lowerText = observationText.toLowerCase();
    const offlineTraceId = 'off-trace-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const likelyHazardDomains: string[] = [];
    const evidenceGaps: string[] = [];
    const supervisorQuestions: string[] = [];
    const offlineRestrictions: string[] = [
        'Cannot verify against latest regulatory updates',
        'Cannot perform full cross-domain causal reasoning',
        'Cannot promote knowledge candidates',
        'Prohibited language filtering is limited'
    ];

    // Simple deterministic domain detection
    if (lowerText.includes('guard') || lowerText.includes('nip point')) likelyHazardDomains.push('machine_guarding');
    if (lowerText.includes('lock') || lowerText.includes('energized')) likelyHazardDomains.push('lockout_tagout');
    if (lowerText.includes('cord') || lowerText.includes('wire')) likelyHazardDomains.push('electrical');
    if (lowerText.includes('fall') || lowerText.includes('edge')) likelyHazardDomains.push('fall_protection');
    if (lowerText.includes('spill') || lowerText.includes('wet')) likelyHazardDomains.push('slips_trips_falls');
    if (lowerText.includes('chemical') || lowerText.includes('label')) likelyHazardDomains.push('hazard_communication');

    let confidenceCeiling = 0.4;
    let advisorySummary = 'Offline advisory: Hazard identified as potentially ' + (likelyHazardDomains[0] || 'unknown') + '.';

    if (!offlineKnowledgePackVersion) {
        confidenceCeiling = 0.2;
        advisorySummary = 'Offline advisory (no knowledge pack): Observation captured. High uncertainty due to missing local knowledge.';
        evidenceGaps.push('Knowledge pack missing or unverified.');
    } else if (offlineKnowledgePackVersion.includes('stale')) {
        confidenceCeiling = 0.3;
        offlineRestrictions.push('Local knowledge pack is stale/outdated.');
    }

    if (likelyHazardDomains.length === 0) {
        advisorySummary = 'Offline advisory: Limited signals detected in observation.';
        supervisorQuestions.push('Can you provide more detail about the equipment or task involved?');
    } else {
        supervisorQuestions.push('Has the area been secured until online verification?');
    }

    return {
      version: this.serviceVersion,
      mode: 'offline_limited_advisory',
      offlineAvailable: true,
      confidenceCeiling,
      advisorySummary,
      likelyHazardDomains,
      evidenceGaps,
      requiredSyncActions: [
          'Sync observation with Sentinel backend',
          'Review full SafeScope reasoning trace once online',
          'Verify against latest citations'
      ],
      supervisorQuestions,
      offlineRestrictions,
      offlineTraceId,
      requiresHumanReview: true,
      requiresOnlineVerification: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      cannotPromoteKnowledge: true,
      advisoryBoundary: this.advisoryBoundary
    };
  }
}
