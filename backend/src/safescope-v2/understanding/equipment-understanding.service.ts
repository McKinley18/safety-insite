import { SafeScopeUnderstandingEquipment } from './safescope-understanding.types';

export class EquipmentUnderstandingService {
  evaluate(normalizedText: string): SafeScopeUnderstandingEquipment {
    const evidence: string[] = [];

    let category = 'unknown';
    let specificEquipment = 'unknown';
    let component = 'unknown';
    let motion = 'unknown';
    let operationalState = 'unknown';

    if (this.hasAny(normalizedText, ['conveyor', 'belt conveyor', 'belt'])) {
      category = 'conveyor';
      specificEquipment = 'conveyor';
      evidence.push('Conveyor language detected.');

      if (this.hasAny(normalizedText, ['tail pulley', 'conveyor tail pulley', 'return end'])) {
        component = 'tail_pulley';
        evidence.push('Tail pulley or return-end component detected.');
      } else if (this.hasAny(normalizedText, ['head pulley', 'drive pulley', 'conveyor drive'])) {
        component = 'head_pulley_or_drive';
        evidence.push('Head pulley, drive pulley, or conveyor drive component detected.');
      } else if (this.hasAny(normalizedText, ['return roller', 'roller', 'idler'])) {
        component = 'roller_or_idler';
        evidence.push('Roller or idler component detected.');
      }

      if (this.hasAny(normalizedText, ['running', 'moving', 'operating', 'in motion', 'energized'])) {
        motion = 'moving';
        operationalState = 'operating';
        evidence.push('Operating or moving conveyor state detected.');
      }
    }

    if (this.hasAny(normalizedText, ['forklift', 'powered industrial truck', 'mobile equipment', 'haul truck', 'loader'])) {
      category = 'mobile_equipment';
      specificEquipment = this.firstPresent(normalizedText, ['forklift', 'haul truck', 'loader', 'powered industrial truck', 'mobile equipment']);
      motion = this.hasAny(normalizedText, ['moving', 'traveling', 'backing', 'operating']) ? 'moving' : motion;
      operationalState = motion === 'moving' ? 'operating' : operationalState;
      evidence.push('Mobile equipment language detected.');
    }

    if (this.hasAny(normalizedText, ['electrical panel', 'panel', 'disconnect', 'breaker panel'])) {
      category = 'electrical_equipment';
      specificEquipment = this.firstPresent(normalizedText, ['electrical panel', 'breaker panel', 'disconnect', 'panel']);
      component = this.hasAny(normalizedText, ['door', 'panel door']) ? 'panel_door' : component;
      operationalState = this.hasAny(normalizedText, ['energized', 'live', 'in use']) ? 'energized' : operationalState;
      evidence.push('Electrical equipment language detected.');
    }

    if (this.hasAny(normalizedText, ['cord', 'extension cord', 'damaged insulation', 'exposed conductor'])) {
      category = 'electrical_cord';
      specificEquipment = this.firstPresent(normalizedText, ['extension cord', 'electrical cord', 'cord']);
      component = this.hasAny(normalizedText, ['insulation', 'conductor']) ? 'cord_insulation_or_conductor' : component;
      operationalState = this.hasAny(normalizedText, ['energized', 'plugged in', 'in use']) ? 'energized' : operationalState;
      evidence.push('Electrical cord language detected.');
    }

    if (this.hasAny(normalizedText, ['trench', 'excavation', 'excavator'])) {
      category = 'excavation';
      specificEquipment = this.firstPresent(normalizedText, ['trench', 'excavation', 'excavator']);
      component = this.hasAny(normalizedText, ['wall', 'vertical wall', 'sidewall']) ? 'excavation_wall' : component;
      operationalState = this.hasAny(normalizedText, ['active', 'worker inside', 'employee in trench']) ? 'active_excavation' : operationalState;
      evidence.push('Excavation or trenching language detected.');
    }

    if (this.hasAny(normalizedText, ['fire extinguisher', 'extinguisher'])) {
      category = 'fire_protection_equipment';
      specificEquipment = 'fire_extinguisher';
      component = this.hasAny(normalizedText, ['tag', 'inspection tag']) ? 'inspection_tag' : component;
      operationalState = 'emergency_readiness';
      evidence.push('Fire extinguisher language detected.');
    }

    const score = evidence.length ? Math.min(0.95, 0.35 + evidence.length * 0.18) : 0.2;

    return {
      category,
      specificEquipment,
      component,
      motion,
      operationalState,
      confidence: {
        score,
        reasons: evidence.length ? evidence : ['No strong equipment signal detected.']
      }
    };
  }

  private hasAny(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term));
  }

  private firstPresent(text: string, terms: string[]): string {
    return terms.find((term) => text.includes(term)) || 'unknown';
  }
}
