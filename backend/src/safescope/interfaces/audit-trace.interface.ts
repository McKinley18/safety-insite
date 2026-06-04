import { EngineDiagnostic } from './engine-diagnostic.interface';

export interface AuditTrace {
  traceId: string;
  engines: EngineDiagnostic[];
  createdAt: string;
  notes: string[];
}
