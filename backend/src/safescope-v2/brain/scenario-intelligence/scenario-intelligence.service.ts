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
        text.includes('spillage');

      const hasConveyorPulleyOrRoller =
        text.includes('conveyor tail pulley') ||
        text.includes('tail pulley') ||
        text.includes('head pulley') ||
        text.includes('return roller') ||
        text.includes('roller nip point');

      const hasGuardingFailure =
        text.includes('unguarded') ||
        text.includes('guard is missing') ||
        text.includes('missing guard') ||
        text.includes('guard is removed') ||
        text.includes('guard removed') ||
        text.includes('no fixed guard') ||
        text.includes('no coupling guard') ||
        text.includes('blade guard is removed');

      if (
        (text.includes('table saw') || text.includes('press brake') || text.includes('point of operation') || text.includes('cutting blade') || text.includes('closing die')) &&
        (text.includes('hands') || text.includes('operator') || text.includes('employee')) &&
        hasGuardingFailure
      ) {
        return 'point_of_operation_guarding';
      }

      if (
        (text.includes('electrical panel') || text.includes('panel door') || text.includes('disconnects')) &&
        (text.includes('blocked') || text.includes('stored materials') || text.includes('working clearance'))
      ) {
        return 'electrical_panel_access';
      }

      if (
        (text.includes('forklift') || text.includes('mobile equipment') || text.includes('powered industrial truck')) &&
        (text.includes('pedestrian') || text.includes('shared pedestrian aisle') || text.includes('walking beside moving equipment')) &&
        (text.includes('no marked walkway') || text.includes('no separation barrier') || text.includes('shared'))
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
        if (hasTaskIndicator) {
          return family.taskIndicators.some(t => text.includes(t));
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
