import { EvidenceGapQuestionRecord } from './evidence-gap-question.types';
import { EVIDENCE_GAP_QUESTION_REGISTRY } from './evidence-gap-question.registry';

export class EvidenceGapQuestionGeneratorService {
  generate(scenarioFamilyId: string): EvidenceGapQuestionRecord[] {
    // Generate evidence gap questions based on scenario family
    return EVIDENCE_GAP_QUESTION_REGISTRY.filter(q => q.scenarioFamilyId === scenarioFamilyId);
  }
}
