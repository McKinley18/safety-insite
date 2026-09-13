import { KnowledgeRecord } from './knowledge-intake.types';

export const validateGuardrails = (record: KnowledgeRecord): void => {
  if (record.reviewStatus === 'approved_by_human') {
    throw new Error(`Guardrail violation: Record ${record.recordId} cannot have reviewStatus 'approved_by_human' set automatically.`);
  }
  if (record.approvedForUse === true) {
    throw new Error(`Guardrail violation: Record ${record.recordId} cannot have approvedForUse 'true' set automatically.`);
  }
};
