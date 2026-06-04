import { SafeScopeReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeEvidenceImportance = 'low' | 'medium' | 'high' | 'critical';

export type SafeScopeEvidenceBrainRecord = {
  evidenceId: string;
  hazardDomains: SafeScopeReasoningDomain[];
  mechanisms: string[];
  question: string;
  whyItMatters: string;
  importance: SafeScopeEvidenceImportance;
  acceptableEvidenceTypes: Array<
    | 'photo'
    | 'measurement'
    | 'employee_statement'
    | 'inspection_observation'
    | 'document_review'
    | 'qualified_person_review'
    | 'sampling_result'
    | 'equipment_record'
  >;
  defensibilityImpact: string;
};
