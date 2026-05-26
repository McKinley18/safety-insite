import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * Source Intelligence supports evidence and controls but must not override standards.
 */
export interface SourceIntelligenceRetrievalAdapter {
  retrieveSources(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<unknown[]>>;
}
