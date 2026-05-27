import {
  CorrectiveActionRecommendationAdapter,
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
} from './';
import {
  getCorrectiveActionIntelligence,
} from '../../safescope-v2/intelligence/corrective-action-intelligence';

/**
 * Read-only Corrective Action Recommendation Adapter.
 *
 * Adapter boundary only.
 * Calls SafeScope v2 getCorrectiveActionIntelligence().
 * No database writes.
 * No AppModule wiring.
 * No production endpoint exposure.
 * Does not call CorrectiveActionsService.create/updateStatus/close.
 * Recommendations only; no corrective action records are created.
 */
export class CorrectiveActionRecommendationServiceAdapter
  implements CorrectiveActionRecommendationAdapter
{
  async recommendActions(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<unknown[]>> {
    const classificationData = context.classification as any;
    const classification =
      classificationData?.classification ||
      classificationData?.hazardCategory ||
      classificationData?.family ||
      'Review Required';

    const sourceMatches = Array.isArray(context.sourceMatches)
      ? context.sourceMatches
      : [];

    const standardsMatches = Array.isArray(context.standardsMatches)
      ? context.standardsMatches
      : [];

    const sourceAnalysis = {
      primaryRegulatoryBasis: standardsMatches.length
        ? standardsMatches
        : sourceMatches.filter((source: any) => source?.citationAuthority === 'primary'),
      supportiveGuidance: sourceMatches,
    };

    const evidenceGap = {
      criticalQuestions: [
        ...(classificationData?.requiresHumanReview ? ['Confirm final hazard classification before closure.'] : []),
        ...((context.riskAssessment as any)?.requiresShutdown
          ? ['Confirm exposure is controlled before work continues.']
          : []),
      ],
      closureEvidenceNeeded: [
        'Photo or field verification of completed corrective action.',
        'Supervisor sign-off confirming exposure has been controlled.',
      ],
    };

    const result = getCorrectiveActionIntelligence(
      classification,
      context.riskAssessment,
      sourceAnalysis,
      evidenceGap,
    );

    return {
      data: [result],
      diagnostic: {
        adapterName: 'CorrectiveActionRecommendationServiceAdapter',
        status: 'called',
        notes: [
          'Read-only SafeScope v2 corrective action intelligence adapter called.',
          'No database writes performed by adapter.',
          'Corrective action recommendations only; no corrective action records created.',
          'CorrectiveActionsService.create/updateStatus/close were not called.',
        ],
        confidence: 0.8,
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
