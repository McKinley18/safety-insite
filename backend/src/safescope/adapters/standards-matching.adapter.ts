import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * Standards Matching remains authoritative for regulatory citations.
 */
export interface StandardsMatchingAdapter {
  matchStandards(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<unknown[]>>;
}
