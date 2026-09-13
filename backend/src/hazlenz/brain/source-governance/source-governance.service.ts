import { ApprovedSourceRecord, ApprovalStatus } from './source-governance.types';
import { APPROVED_SOURCE_REGISTRY } from './source-governance.registry';

export class SourceGovernanceService {
  isAuthoritative(sourceId: string): boolean {
    const record = this.getRecord(sourceId);
    return record !== undefined && record.approvalStatus === 'approved' && !record.deprecated;
  }

  getRecord(sourceId: string): ApprovedSourceRecord | undefined {
    return APPROVED_SOURCE_REGISTRY.find(r => r.id === sourceId);
  }
  
  // Can be used to check if a source reference is valid before being used in reasoning
  validateSource(sourceId: string): { valid: boolean; reason?: string } {
      const record = this.getRecord(sourceId);
      if (!record) return { valid: false, reason: 'Source record not found.' };
      if (record.approvalStatus === 'rejected') return { valid: false, reason: 'Source record rejected.' };
      if (record.deprecated) return { valid: false, reason: 'Source record deprecated.' };
      return { valid: true };
  }
}
