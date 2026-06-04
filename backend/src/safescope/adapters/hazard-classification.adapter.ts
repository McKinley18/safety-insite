import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * Existing engine authority must be preserved.
 */
export interface HazardClassificationAdapter {
  classify(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<unknown>>;
}
