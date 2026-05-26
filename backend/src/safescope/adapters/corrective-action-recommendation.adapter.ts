import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * This adapter must recommend actions only and must not create corrective action records.
 */
export interface CorrectiveActionRecommendationAdapter {
  recommendActions(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<unknown[]>>;
}
