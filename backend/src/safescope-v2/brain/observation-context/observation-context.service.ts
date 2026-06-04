import { SafeScopeNormalizedObservationContext } from './observation-context.types';

export class ObservationContextService {
  normalize(rawObservation: string): SafeScopeNormalizedObservationContext {
    const text = rawObservation.toLowerCase();
    
    // Simple normalization mapping (to be expanded with synonyms and entity mapping)
    const normalizedText = this.cleanText(text);
    const matchedTerms = this.extractMatchedTerms(normalizedText);

    return {
      rawObservation,
      normalizedText,
      matchedTerms,
      detectedEquipment: this.inferEquipment(normalizedText),
      detectedTasks: this.inferTasks(normalizedText),
      detectedUnsafeConditions: this.inferUnsafeConditions(normalizedText),
      detectedOperationalStates: this.inferOperationalStates(normalizedText),
      detectedEnergySources: this.inferEnergySources(normalizedText),
      detectedMechanismsOfInjury: this.inferMechanisms(normalizedText),
      detectedExposureSignals: this.inferExposureSignals(normalizedText),
      detectedControls: [],
      detectedMissingOrFailedControls: [],
      detectedJurisdictionSignals: [],
      detectedIndustrySignals: [],
      ambiguitySignals: [],
      conflictSignals: [],
      photoLikeDescriptionSignals: [],
      employeeExposureKnown: false,
      employeeExposureUnclear: true,
      taskContextKnown: false,
      operationalStateKnown: false,
      confidenceSignals: { score: 0.5, reasoning: ['Initial normalization'] },
      evidenceGaps: { missingEvidence: [], ambiguities: [], conflicts: [] },
      trace: ['Normalized via ObservationContextService'],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      }
    };
  }

  private cleanText(text: string): string {
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ").trim();
  }

  private extractMatchedTerms(text: string): string[] {
    const synonyms: Record<string, string[]> = {
      'running': ['running', 'operating', 'energized', 'live'],
      'cleaning': ['cleaning', 'clearing', 'servicing', 'maintaining', 'repairing'],
      'no_guard': ['missing guard', 'removed guard', 'damaged guard', 'no guard'],
      'worker_exposed': ['employee nearby', 'miner exposed', 'worker in area', 'pedestrian nearby', 'employees below'],
      'electrical_damage': ['damaged cord', 'exposed wire', 'open panel', 'energized part'],
      'exit_blocked': ['blocked exit', 'obstructed egress', 'emergency access blocked'],
      'overhead_work': ['overhead', 'overhead work', 'falling object', 'falling material', 'object dropped', 'tool drop', 'material above workers'],
      'toe_board': ['toe board', 'canopy', 'debris net', 'barricade below', 'struck by falling object', 'falling object protection']
    };
    const matches: string[] = [];
    for (const [canonical, variants] of Object.entries(synonyms)) {
        if (variants.some(v => text.includes(v))) {
            matches.push(canonical);
        }
    }
    return matches;
  }
  
  private inferEquipment(text: string): string[] {
    const equipment = [];
    if (text.includes('conveyor')) equipment.push('conveyor');
    if (text.includes('door')) equipment.push('powered door');
    if (text.includes('panel') || text.includes('cord')) equipment.push('electrical equipment');
    if (text.includes('extinguisher')) equipment.push('fire extinguisher');
    return equipment;
  }
  
  private inferTasks(text: string): string[] {
    const tasks = [];
    if (text.includes('cleaning') || text.includes('maintenance')) tasks.push('maintenance');
    return tasks.length ? tasks : ['unknown'];
  }
  
  private inferUnsafeConditions(text: string): string[] {
    const conditions = [];
    if (text.includes('unguarded') || text.includes('no guard') || text.includes('guard missing')) conditions.push('unguarded');
    if (text.includes('damaged')) conditions.push('damaged');
    if (text.includes('blocked')) conditions.push('blocked');
    return conditions.length ? conditions : ['unknown'];
  }

  private inferOperationalStates(text: string): string[] {
    if (text.includes('running') || text.includes('operating')) return ['running'];
    return ['unknown'];
  }

  private inferEnergySources(text: string): string[] {
    return ['unknown'];
  }

  private inferMechanisms(text: string): string[] {
    return ['unknown'];
  }

  private inferExposureSignals(text: string): string[] {
    return ['unknown'];
  }
}
