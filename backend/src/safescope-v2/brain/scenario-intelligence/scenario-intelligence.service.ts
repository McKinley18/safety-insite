import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';
import { SCENARIO_FAMILY_REGISTRY } from '../scenario-family-knowledge/scenario-family.registry';

export class ScenarioIntelligenceService {
  evaluate(input: {
    text: string;
    classification: any;
    operationalReasoning: any;
    risk: any;
    suggestedStandards: any[];
    evidenceGaps: string[];
    confidence: number;
  }): ScenarioIntelligence {
    const text = input.text.toLowerCase();

    // Prefer highly specific precision scenarios before generic first-match routing.
    const priorityScenarioId = (() => {
      const hasCleanupIntent =
        text.includes('cleanup') ||
        text.includes('cleaning') ||
        text.includes('shoveling') ||
        text.includes('clear spillage') ||
        text.includes('clearing spillage') ||
        text.includes('spilled material') ||
        text.includes('spillage') ||
        text.includes('spill') ||
        text.includes('spilled') ||
        text.includes('clearing') ||
        text.includes('clear') ||
        text.includes('scrape') ||
        text.includes('scraping') ||
        text.includes('scraper') ||
        text.includes('build-up') ||
        text.includes('build up');

      const hasConveyorPulleyOrRoller =
        text.includes('conveyor tail pulley') ||
        text.includes('tail pulley') ||
        text.includes('head pulley') ||
        text.includes('return roller') ||
        text.includes('return pulley') ||
        text.includes('roller nip point') ||
        text.includes('pulley') ||
        text.includes('roller') ||
        text.includes('nip point');

      const hasGuardingFailure =
        text.includes('unguarded') ||
        text.includes('guard is missing') ||
        text.includes('missing guard') ||
        text.includes('guard is removed') ||
        text.includes('guard removed') ||
        text.includes('no fixed guard') ||
        text.includes('no coupling guard') ||
        text.includes('blade guard is removed') ||
        text.includes('missing its cage guard') ||
        text.includes('missing its side cover plate') ||
        text.includes('missing its cover plate') ||
        text.includes('missing cover plate') ||
        text.includes('missing cover') ||
        text.includes('no guard') ||
        text.includes('guard missing') ||
        text.includes('without a spindle guard') ||
        text.includes('no protective cage or guard') ||
        text.includes('no protective cage') ||
        text.includes('completely exposed') ||
        text.includes('exposed') ||
        text.includes('completely missing') ||
        text.includes('is completely missing') ||
        text.includes('unbolted') ||
        text.includes('unbolted and removed') ||
        text.includes('is unbolted') ||
        text.includes('was unbolted') ||
        text.includes('taken off') ||
        text.includes('was taken off') ||
        text.includes('taken off and not replaced') ||
        text.includes('side guards removed') ||
        text.includes('side guard was taken off') ||
        text.includes('side guard was taken') ||
        text.includes('protective side guards') ||
        text.includes('missing its protective side guards') ||
        text.includes('without its protective side guards') ||
        text.includes('missing its cage guard') ||
        text.includes('cage guard') ||
        text.includes('missing its safety guard') ||
        text.includes('safety guard') ||
        text.includes('no safety wheel guard') ||
        text.includes('wheel guard') ||
        text.includes('missing its tongue guard') ||
        text.includes('tongue guard') ||
        text.includes('missing its spark shield') ||
        text.includes('spark shield') ||
        text.includes('without the protective interlocked guard') ||
        text.includes('interlocked guard') ||
        text.includes('not secured') ||
        text.includes('is not secured') ||
        text.includes('not bolted') ||
        text.includes('cracked');

      const hasPointOfOperationEquipment =
        text.includes('table saw') ||
        text.includes('press brake') ||
        text.includes('drill press') ||
        text.includes('lathe') ||
        text.includes('grinder') ||
        text.includes('point of operation') ||
        text.includes('cutting blade') ||
        text.includes('closing die') ||
        text.includes('spindle guard') ||
        text.includes('chuck') ||
        text.includes('saw blade') ||
        text.includes('shear') ||
        text.includes('punch');

      if (hasPointOfOperationEquipment && hasGuardingFailure) {
        return 'point_of_operation_guarding';
      }

      if (
        (text.includes('electrical panel') || text.includes('panel door') || text.includes('disconnects') || text.includes('breaker panel') || text.includes('mcc') || text.includes('electrical cabinet')) &&
        (text.includes('blocked') || text.includes('stored materials') || text.includes('working clearance') || text.includes('open') || text.includes('swinging') || text.includes('missing cover') || text.includes('cover plates') || text.includes('breaker slots') || text.includes('broken') || text.includes('exposing') || text.includes('exposed'))
      ) {
        return 'electrical_panel_access';
      }

      if (
        (text.includes('forklift') || text.includes('mobile equipment') || text.includes('powered industrial truck') || text.includes('utility truck') || text.includes('utility tractor') || text.includes('tractor') || text.includes('vehicle')) &&
        (text.includes('pedestrian') || text.includes('pedestrians') || text.includes('shared pedestrian aisle') || text.includes('walking beside moving equipment') || text.includes('near employees') || text.includes('reversing') || text.includes('backup alarm') || text.includes('back up alarm'))
      ) {
        return 'mobile_equipment_pedestrian_interaction';
      }

      if (
        (text.includes('excavation') || text.includes('trench') || text.includes('trenching')) &&
        (text.includes('worker is inside') || text.includes('employee in trench') || text.includes('inside an excavation') || text.includes('unprotected trench')) &&
        (text.includes('no visible protective system') || text.includes('vertical walls') || text.includes('deeper than five feet') || text.includes('no trench box') || text.includes('no shoring') || text.includes('no sloping'))
      ) {
        return 'excavation_protective_system_ambiguity';
      }

      const hasCordEquipment =
        text.includes('cord') ||
        text.includes('extension cord') ||
        text.includes('power supply cord') ||
        text.includes('conductors') ||
        text.includes('power cord');

      const hasCordDamage =
        text.includes('frayed') ||
        text.includes('exposed wire') ||
        text.includes('exposed copper') ||
        text.includes('exposed conductor') ||
        text.includes('split') ||
        text.includes('damaged outer jacketing') ||
        text.includes('damaged jacketing') ||
        text.includes('cut') ||
        text.includes('cuts') ||
        text.includes('damaged insulation') ||
        text.includes('outer jacket of the');

      const hasWetLocation =
        text.includes('wet') ||
        text.includes('water') ||
        text.includes('puddle') ||
        text.includes('damp') ||
        text.includes('gutter') ||
        text.includes('pooling') ||
        text.includes('pooling water') ||
        text.includes('wash bay') ||
        text.includes('cellar walkway');

      if (hasCordEquipment && (hasCordDamage || hasWetLocation)) {
        return 'damaged_cord_wet_location';
      }

      const hasFallEquipmentOrSignal =
        text.includes('unprotected edge') ||
        text.includes('guardrail') ||
        text.includes('midrail') ||
        text.includes('ladder') ||
        text.includes('scaffold') ||
        text.includes('scaffolding') ||
        text.includes('elevated platform') ||
        text.includes('roof') ||
        text.includes('harness') ||
        text.includes('lanyard') ||
        text.includes('mezzanine') ||
        text.includes('scaffold tower');

      if (hasFallEquipmentOrSignal && (text.includes('fall') || text.includes('height') || text.includes('above') || text.includes('edge') || text.includes('tie-off') || text.includes('midrail') || text.includes('feet') || text.includes('ladder') || text.includes('uncompacted soil'))) {
        return 'fall_protection_unprotected_edge';
      }

      if (
        text.includes('conveyor') &&
        hasConveyorPulleyOrRoller &&
        hasCleanupIntent &&
        hasGuardingFailure
      ) {
        return 'conveyor-cleanup';
      }

      if (
        text.includes('conveyor') &&
        hasConveyorPulleyOrRoller &&
        hasGuardingFailure &&
        !hasCleanupIntent
      ) {
        return 'unguarded_conveyor_pulley';
      }

      const hasRotatingEquipmentSignal =
        text.includes('rotating shaft') ||
        text.includes('pump motor coupling') ||
        text.includes('motor coupling') ||
        text.includes('drive shaft') ||
        text.includes('exposed shaft') ||
        text.includes('coupling') ||
        text.includes('shaft') ||
        text.includes('fan');

      if (hasRotatingEquipmentSignal && hasGuardingFailure) {
        return 'rotating_shaft_guarding';
      }

      const hasHousekeepingEquipment =
        text.includes('spill') ||
        text.includes('leak') ||
        text.includes('pooled') ||
        text.includes('debris') ||
        text.includes('puddle') ||
        text.includes('hose') ||
        text.includes('hoses') ||
        text.includes('rope') ||
        text.includes('ropes') ||
        text.includes('grease') ||
        text.replace(/soil/g, '').includes('oil') ||
        text.includes('fluid') ||
        text.includes('housekeeping');

      const hasHousekeepingHazard =
        text.includes('slip') ||
        text.includes('trip') ||
        text.includes('slippery') ||
        text.includes('obstructed') ||
        text.includes('obstruction') ||
        text.includes('accumulation') ||
        text.includes('walkway') ||
        text.includes('path') ||
        text.includes('walk deck') ||
        text.includes('floor');

      if (hasHousekeepingEquipment && hasHousekeepingHazard && !hasFallEquipmentOrSignal) {
        return 'housekeeping_slip_trip';
      }

      return null;
    })();

    const priorityFamily = priorityScenarioId
      ? SCENARIO_FAMILY_REGISTRY.find(family => family.id === priorityScenarioId)
      : undefined;

    // Find best matching scenario family using the existing conservative first-match behavior.
    const matchedFamily = priorityFamily ?? SCENARIO_FAMILY_REGISTRY.find(family => {
      const phraseOrEquipMatch = family.commonObservationPhrases.some(phrase => text.includes(phrase)) ||
                               family.equipmentIndicators.some(indicator => text.includes(indicator));
      
      if (!phraseOrEquipMatch) return false;
      
      if (family.taskIndicators.length > 0) {
        const hasTaskIndicator = family.taskIndicators.some(t => text.includes(t));
        if (!hasTaskIndicator) {
          return false;
        }
      }
      
      return true;
    });

    if (matchedFamily) {
      return {
        scenarioFamilyId: matchedFamily.id,
        hazardCategory: matchedFamily.domain || 'unknown',
        equipment: matchedFamily.equipmentIndicators[0] || 'unknown',
        task: matchedFamily.taskIndicators[0] || 'unknown',
        unsafeCondition: matchedFamily.unsafeConditionIndicators[0] || 'unknown',
        operationalState: matchedFamily.operationalStateIndicators[0] || 'unknown',
        energySource: matchedFamily.energySourceIndicators[0] || 'unknown',
        mechanismOfInjury: matchedFamily.mechanismOfInjuryIndicators[0] || 'unknown',
        exposedPersonActivity: matchedFamily.exposureIndicators[0] || 'unknown',
        missingOrFailedControls: matchedFamily.missingOrFailedControlIndicators,
        hierarchyLevel: 'unknown', // Needs better mapping
        candidateStandardFamily: matchedFamily.candidateStandardFamilies[0] || 'unknown',
        evidenceGaps: matchedFamily.evidenceGaps,
        confidenceSignals: {
          score: input.confidence || 0.5,
          reasoning: ['Matched against scenario family: ' + matchedFamily.title]
        },
        qualifiedReviewRequired: matchedFamily.requiresQualifiedReview,
        advisoryOnly: matchedFamily.advisoryOnly,
        doesNotDeclareViolation: matchedFamily.doesNotDeclareViolation
      };
    }
    
    // Fallback if no match
    return {
      scenarioFamilyId: 'unknown',
      equipment: 'unknown',
      task: 'unknown',
      unsafeCondition: 'unknown',
      operationalState: 'unknown',
      energySource: 'unknown',
      mechanismOfInjury: input.classification?.mechanism || 'unknown',
      exposedPersonActivity: 'unknown',
      missingOrFailedControls: input.operationalReasoning?.missingControls || [],
      hazardCategory: input.classification?.hazard || 'unknown', // Added this
      hierarchyLevel: 'unknown',
      candidateStandardFamily: input.suggestedStandards?.[0]?.family || 'unknown',
      evidenceGaps: input.evidenceGaps || [],
      confidenceSignals: {
        score: input.confidence || 0,
        reasoning: ['Inferred from fused operational reasoning and observation.']
      },
      qualifiedReviewRequired: true,
      advisoryOnly: true,
      doesNotDeclareViolation: true,
    };
  }
}
