import { SAFESCOPE_EQUIPMENT_KNOWLEDGE_REGISTRY } from './equipment-knowledge.registry';
import { SafeScopeEquipmentKnowledgeRecord } from './equipment-knowledge.types';

export type SafeScopeDetectedEquipmentContext = {
  engine: 'safescope_equipment_context_detector_v1';
  mode: 'read_only_test_only_context_detection';
  detectedEquipment: Array<{
    equipmentId: string;
    label: string;
    score: number;
    matchedAliases: string[];
    matchedScenarioTriggers: string[];
    commonHazardDomains: string[];
    inspectionFocusAreas: string[];
    evidenceQuestions: string[];
    verificationEvidence: string[];
    conflictNotes: string[];
  }>;
  primaryEquipment?: {
    equipmentId: string;
    label: string;
    score: number;
  };
  guardrails: {
    readOnly: true;
    contextOnly: true;
    doesNotModifyReasoning: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotOverrideRegulation: true;
    requiresQualifiedReview: true;
  };
};

export type SafeScopeEquipmentContextRequest = {
  hazardObservation: string;
  equipmentInvolved?: string;
  taskContext?: string;
  industryContext?: string;
  siteType?: string;
};

function includesTerm(text: string, term: string): boolean {
  return text.includes(term.toLowerCase());
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export class SafeScopeEquipmentContextDetectorService {
  detect(request: SafeScopeEquipmentContextRequest): SafeScopeDetectedEquipmentContext {
    const text = [
      request.hazardObservation,
      request.equipmentInvolved || '',
      request.taskContext || '',
      request.industryContext || '',
      request.siteType || '',
    ]
      .join(' ')
      .toLowerCase();

    const detectedEquipment = SAFESCOPE_EQUIPMENT_KNOWLEDGE_REGISTRY.records
      .map((record) => this.scoreRecord(record, text))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.equipmentId.localeCompare(b.equipmentId));

    const primary = detectedEquipment[0];

    return {
      engine: 'safescope_equipment_context_detector_v1',
      mode: 'read_only_test_only_context_detection',
      detectedEquipment,
      primaryEquipment: primary
        ? {
            equipmentId: primary.equipmentId,
            label: primary.label,
            score: primary.score,
          }
        : undefined,
      guardrails: {
        readOnly: true,
        contextOnly: true,
        doesNotModifyReasoning: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        doesNotOverrideRegulation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private scoreRecord(record: SafeScopeEquipmentKnowledgeRecord, text: string): SafeScopeDetectedEquipmentContext['detectedEquipment'][number] {
    const matchedAliases = record.aliases.filter((alias) => includesTerm(text, alias));
    const matchedScenarioTriggers = record.commonScenarioTriggers.filter((trigger) => includesTerm(text, trigger));

    const systemQuestionMatches = record.systems.flatMap((system) =>
      system.commonFailureModes.filter((failureMode) => includesTerm(text, failureMode)),
    );

    const score = matchedAliases.length * 10 + matchedScenarioTriggers.length * 5 + systemQuestionMatches.length * 3;

    const evidenceQuestions = unique(record.systems.flatMap((system) => system.evidenceQuestions));
    const verificationEvidence = unique(record.systems.flatMap((system) => system.verificationEvidence));

    return {
      equipmentId: record.equipmentId,
      label: record.label,
      score,
      matchedAliases,
      matchedScenarioTriggers: unique([...matchedScenarioTriggers, ...systemQuestionMatches]),
      commonHazardDomains: record.commonHazardDomains,
      inspectionFocusAreas: record.inspectionFocusAreas,
      evidenceQuestions,
      verificationEvidence,
      conflictNotes: record.conflictNotes,
    };
  }
}
