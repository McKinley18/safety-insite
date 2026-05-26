/**
 * SafeScope adapter shared types.
 *
 * Contract only.
 * No production service calls.
 * No database writes.
 * Existing engine authority must be preserved.
 */

export interface SafeScopeNormalizedObservation {
  observationText?: string;
  imageEvidenceIds?: string[];
  inspectionId?: string;
  reportId?: string;
  siteId?: string;
  companyId?: string;
  regulatoryContext?: 'MSHA' | 'OSHA_GENERAL' | 'OSHA_CONSTRUCTION' | 'MIXED';
  industryContext?: string;
  equipmentContext?: string;
  userRole?: string;
  priorFindingIds?: string[];
}

export interface SafeScopeAdapterContext {
  normalizedObservation: SafeScopeNormalizedObservation;
  classification?: unknown;
  standardsMatches?: unknown[];
  sourceMatches?: unknown[];
  riskAssessment?: unknown;
  correctiveActions?: unknown[];
  reviewFlags?: unknown;
  auditTrace?: unknown;
  metadata?: Record<string, unknown>;
}

export interface SafeScopeAdapterDiagnostic {
  adapterName: string;
  status: 'not_called' | 'stubbed' | 'called' | 'failed';
  notes?: string[];
  confidence?: number;
}

export interface SafeScopeAdapterResult<T> {
  data: T;
  diagnostic: SafeScopeAdapterDiagnostic;
  readOnly: true;
  databaseWriteAllowed: false;
}
