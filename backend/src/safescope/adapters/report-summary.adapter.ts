import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Contract only.
 * No production service calls.
 * No database writes.
 * Existing report/executive summary authority must be preserved.
 */
export interface ReportSummaryAdapter {
  summarizeReport(context: SafeScopeAdapterContext): Promise<SafeScopeAdapterResult<string>>;
}
