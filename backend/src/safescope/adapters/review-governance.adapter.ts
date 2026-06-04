import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * Human review and governance authority must be preserved.
 */
export interface ReviewGovernanceAdapter {
  evaluateReview(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<unknown>>;
}
