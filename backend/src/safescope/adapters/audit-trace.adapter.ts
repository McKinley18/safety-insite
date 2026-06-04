import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * Audit persistence must be added only after explicit governance review.
 */
export interface AuditTraceAdapter {
  buildAuditTrace(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<unknown>>;
}
