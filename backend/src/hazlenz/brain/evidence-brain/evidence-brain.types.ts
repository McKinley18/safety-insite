import { HazLenzReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzEvidenceImportance = 'low' | 'medium' | 'high' | 'critical';

export type HazLenzEvidenceBrainRecord = {
  evidenceId: string;
  hazardDomains: HazLenzReasoningDomain[];
  mechanisms: string[];
  question: string;
  whyItMatters: string;
  importance: HazLenzEvidenceImportance;
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
