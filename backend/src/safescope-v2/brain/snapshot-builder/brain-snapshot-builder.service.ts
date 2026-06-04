import { hasAnyNonNegatedTerm, hasNonNegatedTerm } from '../../reasoning-orchestrator/negation-context.util';
import { SafeScopeBrainQueryOrchestratorService } from '../query-orchestrator/brain-query-orchestrator.service';
import { SAFESCOPE_MECHANISM_BRAIN_REGISTRY } from '../mechanism-brain/mechanism-knowledge.registry';
import {
  SafeScopeBrainSnapshot,
  SafeScopeBrainSnapshotInput,
} from './brain-snapshot-builder.types';
import {
  SafeScopeIndustryScope,
  SafeScopeMineScope,
} from '../safescope-brain.types';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function compactText(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ').trim();
}


function includesAny(text: string, terms: string[]): boolean {
  return hasAnyNonNegatedTerm(text, terms);
}

function normalizeMechanismId(value: unknown, contextText?: string): string | undefined {
  const raw = normalized(value);
  const context = normalized(contextText);
  const searchable = [raw, context].filter(Boolean).join(' ');

  if (!searchable.trim()) return undefined;

  const direct = SAFESCOPE_MECHANISM_BRAIN_REGISTRY.find(
    (record) => normalized(record.mechanismId) === raw,
  );
  if (direct) return direct.mechanismId;

  const label = SAFESCOPE_MECHANISM_BRAIN_REGISTRY.find(
    (record) => normalized(record.label) === raw,
  );
  if (label) return label.mechanismId;



  /*
   * Field Readiness Routing Pack v1.
   * These specialized mechanisms must be resolved before generic trigger
   * matching. The generic mechanism registry can otherwise over-match broad
   * words such as stored, open side, separation, guard, control, or cable.
   */
  if (
    includesAny(searchable, ['eyewash', 'eye wash', 'emergency shower', 'quick drenching', 'flushing facility']) &&
    includesAny(searchable, ['blocked', 'obstructed', 'not accessible', 'corrosive', 'caustic', 'chemical splash', 'acid', 'base'])
  ) {
    return 'emergency_equipment_access_failure';
  }

  if (
    includesAny(searchable, ['temporary stairway', 'stairway', 'stairs', 'stair rail', 'handrail', 'hand rail']) &&
    includesAny(searchable, ['missing handrail', 'missing hand rail', 'open side', 'construction access', 'no handrail', 'no hand rail'])
  ) {
    return 'fall_on_stairway';
  }

  if (
    includesAny(searchable, ['compressed gas cylinder', 'gas cylinder', 'cylinder valve cap', 'valve cap', 'unsecured cylinder', 'cylinder restraint']) &&
    includesAny(searchable, ['unsecured', 'not secured', 'missing cap', 'valve cap', 'storage', 'stored', 'restraint', 'chain'])
  ) {
    return 'compressed_gas_cylinder_release';
  }

  if (
    includesAny(searchable, ['hazcom', 'hazard communication', 'chemical storage', 'chemical containers', 'chemical container', 'acid', 'alkaline', 'caustic', 'corrosive', 'unlabeled', 'secondary containment', 'sds', 'safety data sheet']) &&
    includesAny(searchable, ['chemical', 'container', 'containers', 'storage', 'label', 'segregation', 'segregate', 'incompatible', 'secondary containment', 'sds'])
  ) {
    return 'chemical_exposure';
  }

  if (
    includesAny(searchable, ['oxygen cylinder', 'fuel gas cylinder', 'welding cylinder', 'acetylene', 'cylinder separation']) &&
    includesAny(searchable, ['stored together', 'not separated', 'separation', 'hot work', 'welding', 'cutting', 'fire', 'explosion'])
  ) {
    return 'fire_explosion';
  }

  if (
    includesAny(searchable, ['overhead work', 'falling object', 'falling material', 'dropped object', 'tools overhead', 'materials overhead', 'toe board', 'toeboard']) &&
    includesAny(searchable, ['employee below', 'employees below', 'below overhead', 'barricade', 'canopy', 'secured from falling', 'construction'])
  ) {
    return 'struck_by_falling_object';
  }

  if (
    includesAny(searchable, ['underground metal/nonmetal', 'metal/nonmetal underground', 'underground mnm', 'part 57', '57.8520', 'ventilation tubing', 'air quality', 'contaminant buildup']) &&
    includesAny(searchable, ['ventilation', 'airflow', 'tubing', 'contaminant', 'air quality', 'reduced airflow'])
  ) {
    return 'air_quality_contaminant_buildup';
  }

  if (
    includesAny(searchable, ['underground coal', 'coal mine', 'coal']) &&
    includesAny(searchable, ['trailing cable', 'power cable', 'damaged cable', 'cable insulation', 'cable jacket', '75.517'])
  ) {
    return 'shock_arc_flash';
  }

  if (
    includesAny(searchable, ['bloodborne', 'blood borne', 'blood', 'bodily fluid', 'bodily fluids', 'sharps', 'needle', 'contaminated needle', 'sharps container'])
  ) {
    return 'bloodborne_pathogen_exposure';
  }

  if (
    includesAny(searchable, ['hazcom', 'hazard communication', 'chemical storage', 'unlabeled container', 'secondary container', 'sds', 'safety data sheet']) &&
    includesAny(searchable, ['chemical', 'container', 'label', 'storage', 'segregation', 'incompatible'])
  ) {
    return 'chemical_exposure';
  }

  if (
    includesAny(searchable, ['damaged sling', 'rigging defect', 'wire rope', 'shackle', 'hook', 'rigging inspection'])
  ) {
    return 'rigging_failure';
  }

  if (
    includesAny(searchable, ['suspended load', 'hoisted load', 'under the load', 'load path', 'fall zone', 'crane load', 'tag line'])
  ) {
    return 'struck_by_suspended_load';
  }

  if (
    includesAny(searchable, ['dropped load', 'falling load', 'load shift', 'lost load control'])
  ) {
    return 'dropped_load';
  }

  if (
    includesAny(searchable, ['damaged sling', 'rigging defect', 'overloaded sling', 'wire rope', 'shackle', 'hook', 'pre-use inspection']) &&
    includesAny(searchable, ['rigging', 'sling', 'hoist', 'hoisting', 'lifting', 'load'])
  ) {
    return 'rigging_failure';
  }

  if (
    includesAny(searchable, ['suspended load', 'hoisted load', 'under the load', 'load path', 'fall zone', 'tag line'])
  ) {
    return 'struck_by_suspended_load';
  }

  if (
    includesAny(searchable, ['dropped load', 'falling load', 'load shift', 'lost load control'])
  ) {
    return 'dropped_load';
  }

  /*
   * High-risk mobile-equipment struck-by context must be resolved before
   * generic trigger matching. Some descriptive native labels contain broad
   * words such as "control" that can accidentally collide with unrelated
   * mechanism records.
   */
  if (
    includesAny(searchable, ['backup alarm', 'backing alarm', 'backing equipment', 'visibility-control', 'visibility control', 'struck by', 'haul truck backing'])
  ) {
    return 'struck_by';
  }

  if (
    includesAny(searchable, ['forklift', 'powered industrial truck']) &&
    includesAny(searchable, ['pedestrian', 'employees on foot', 'foot traffic'])
  ) {
    return 'pedestrian_strike';
  }

  if (
    includesAny(searchable, ['berm', 'dump point', 'edge control', 'run off', 'over edge'])
  ) {
    return 'run_off_embankment';
  }

  /*
   * P1D powered overhead door Brain mechanism precedence:
   * A fixed powered door closing/crush-zone case must not be treated as
   * walking-surface slip/trip or mobile-equipment pedestrian strike simply
   * because the observation mentions a pedestrian walkway.
   */
  if (
    includesAny(searchable, [
      'powered overhead door',
      'overhead door',
      'powered door',
      'dock door',
      'roll-up door',
      'roll up door',
      'bay door',
      'door closed quickly',
      'door closing',
      'photo-eye',
      'photo eye',
      'presence sensor',
      'reversing edge',
      'manual release',
    ]) &&
    includesAny(searchable, [
      'crush',
      'crush point',
      'pinch',
      'pinch point',
      'closed quickly',
      'closing',
      'employees pass under',
      'pass under the door',
      'pedestrian walkway',
      'walkway',
    ])
  ) {
    return 'powered_door_crush_point';
  }

  const trigger = SAFESCOPE_MECHANISM_BRAIN_REGISTRY.find((record) =>
    record.commonTriggerTerms.some((term) => hasNonNegatedTerm(searchable, term)),
  );
  if (trigger) return trigger.mechanismId;

  if (
    includesAny(searchable, ['loose roof', 'fractured roof', 'fall of ground', 'unsupported roof'])
  ) {
    return 'fall_of_ground';
  }

  if (
    includesAny(searchable, ['loose rib', 'rib fall', 'coal rib', 'unsupported rib'])
  ) {
    return 'rib_fall';
  }

  if (
    includesAny(searchable, ['exposed energized wiring', 'exposed wiring', 'live parts', 'energized wiring']) ||
    (searchable.includes('electrical') && includesAny(searchable, ['shock', 'energized', 'exposed']))
  ) {
    return searchable.includes('arc flash') || searchable.includes('damaged cable') || searchable.includes('damaged conductor')
      ? 'shock_arc_flash'
      : 'shock';
  }

  if (
    includesAny(searchable, ['elevated work platform', 'unprotected leading edge', 'fall hazard', 'aerial lift', 'open side'])
  ) {
    return 'fall_from_height';
  }

  if (
    includesAny(searchable, ['scaffold', 'missing guardrail', 'incomplete guardrail'])
  ) {
    return 'fall_from_height';
  }

  if (
    includesAny(searchable, ['extension ladder', 'portable ladder', 'ladder access', 'unsecured ladder'])
  ) {
    return 'fall_from_ladder';
  }

  if (
    includesAny(searchable, ['wet floor', 'spill', 'standing water', 'slick floor'])
  ) {
    return 'slip';
  }

  if (
    includesAny(searchable, ['loose material', 'obstruction', 'stored across', 'housekeeping', 'travelway'])
  ) {
    return 'trip';
  }

  if (
    includesAny(searchable, ['tail pulley', 'head pulley', 'return roller', 'conveyor', 'rotating'])
  ) {
    return includesAny(searchable, ['nip', 'pinch', 'unguarded', 'missing guard', 'exposes employees'])
      ? 'rotating_equipment_nip_point'
      : 'rotating_equipment';
  }

  if (
    includesAny(searchable, ['trench', 'excavation', 'cave-in', 'cave in', 'protective system'])
  ) {
    return 'collapse';
  }

  if (raw && raw !== 'unknown') return raw.replace(/\s+/g, '_');

  return undefined;
}


function resolveHighPriorityPhysicalMechanism(searchable: string): string | undefined {

  if (
    includesAny(searchable, ['heat stress', 'heat illness', 'hot environment', 'wbgt', 'heat index', 'high temperature', 'radiant heat', 'dehydration', 'working in heat']) &&
    includesAny(searchable, ['worker', 'employee', 'exposure', 'outdoor', 'hydration', 'shade', 'acclimatization', 'work rest', 'work-rest', 'symptom', 'cooling', 'water', 'heat'])
  ) {
    return 'heat_illness';
  }

  if (
    includesAny(searchable, ['cold stress', 'cold exposure', 'hypothermia', 'frostbite', 'wind chill', 'freezing temperature', 'cold weather', 'cold work', 'freezing conditions', 'cold injury']) &&
    includesAny(searchable, ['worker', 'employee', 'exposure', 'outdoor', 'prolonged', 'glove', 'gloves', 'hands', 'feet', 'symptom', 'warming', 'warm up', 'wet clothing'])
  ) {
    return 'cold_stress';
  }

  if (
    includesAny(searchable, ['noise', 'loud', 'decibel', 'dba', 'sound level', 'hearing conservation', 'audiogram', 'dosimetry']) &&
    includesAny(searchable, ['exposure', 'worker', 'employee', 'crusher', 'compressor', 'saw', 'jackhammer', 'hearing protection', 'survey', 'monitoring', 'dose'])
  ) {
    return 'noise_induced_hearing_loss';
  }

  if (
    includesAny(searchable, ['manual lifting', 'heavy lift', 'lifting heavy', 'awkward posture', 'repetitive motion', 'overexertion', 'ergonomic', 'ergonomics', 'twisting', 'material handling by hand']) &&
    includesAny(searchable, ['worker', 'employee', 'box', 'boxes', 'lift', 'lifting', 'handling', 'repetitive', 'posture', 'reach', 'strain', 'sprain'])
  ) {
    return 'overexertion';
  }
  if (includesAny(searchable, ['fire extinguisher', 'extinguisher']) && includesAny(searchable, ['blocked', 'obstructed', 'not accessible', 'missing', 'expired'])) {
    return 'fire_extinguisher_access_failure';
  }

  if (includesAny(searchable, ['hot work', 'welding', 'cutting', 'torch cutting', 'grinding sparks']) && includesAny(searchable, ['fire watch', 'combustible', 'flammable', 'sparks', 'ignition'])) {
    return 'hot_work_ignition';
  }

  if (
    includesAny(searchable, [
      'without eye protection',
      'without face protection',
      'without eye and face protection',
      'without eye or face protection',
      'no eye protection',
      'no face protection',
      'no eye and face protection',
      'no eye or face protection',
      'missing eye protection',
      'missing face protection',
      'missing eye and face protection',
      'not wearing safety glasses',
      'not wearing goggles',
      'not wearing face shield',
      'grinding without eye',
      'grinding without face',
      'grinding without eye and face',
    ]) ||
    (
      includesAny(searchable, ['eye protection', 'face shield', 'safety glasses', 'goggles', 'eye and face protection']) &&
      includesAny(searchable, ['without', 'no ', 'missing', 'not wearing'])
    )
  ) {
    return 'eye_face_ppe_gap';
  }

  if (includesAny(searchable, ['hand protection', 'gloves', 'cut resistant', 'sharp material', 'sharp metal', 'sharp edge']) && includesAny(searchable, ['without', 'no ', 'missing', 'not wearing', 'handling'])) {
    return 'hand_ppe_gap';
  }

  if (includesAny(searchable, ['grinder', 'abrasive wheel', 'cutoff wheel', 'cut-off wheel', 'grinding wheel']) && includesAny(searchable, ['missing guard', 'guard removed', 'no guard', 'damaged guard', 'wheel guard'])) {
    return 'abrasive_wheel_failure';
  }

  if (includesAny(searchable, ['defective tool', 'damaged tool', 'broken handle', 'portable power tool', 'power tool', 'hand tool', 'tool cord', 'extension cord']) && includesAny(searchable, ['defective', 'damaged', 'broken', 'frayed cord', 'damaged cord', 'cord insulation', 'missing ground pin', 'cracked', 'unsafe', 'tagged out', 'removed from service'])) {
    return 'defective_tool_contact';
  }

  if (
    includesAny(searchable, ['stacked unevenly', 'unevenly stacked', 'leaning into', 'leaning pallet', 'palletized material', 'unstable stack', 'improper stacking']) &&
    includesAny(searchable, ['aisle', 'employee aisle', 'travelway', 'falling material', 'falling material exposure', 'material storage', 'warehouse'])
  ) {
    return 'unstable_stack_collapse';
  }

  if (includesAny(searchable, ['overhead storage', 'stored overhead', 'overhead stored', 'falling object', 'falling material', 'object fell', 'material fell', 'material stored overhead', 'stored above employees'])) {
    return 'falling_object_material';
  }

  if (includesAny(searchable, ['unstable stack', 'stacked unevenly', 'unevenly stacked', 'leaning into', 'leaning pallet', 'leaning into employee aisle', 'leaning into an employee aisle', 'palletized material', 'stacked material', 'material was stacked', 'improper stacking', 'stacked unevenly', 'unevenly stacked', 'stacked material', 'leaning pallet', 'improper stacking', 'rack collapse', 'pallets stacked', 'stacked boxes', 'leaning stack', 'unstable pallet'])) {
    return 'unstable_stack_collapse';
  }

  return undefined;
}

export class SafeScopeBrainSnapshotBuilderService {
  constructor(
    private readonly brainQueryOrchestrator = new SafeScopeBrainQueryOrchestratorService(),
  ) {}

  build(input: SafeScopeBrainSnapshotInput): SafeScopeBrainSnapshot {
    const text = normalized(
      compactText([
        input.hazardObservation,
        input.siteType,
        input.taskContext,
        input.industryContext,
        input.equipmentInvolved,
        input.primaryCitation,
      ]),
    );
    const canonicalMechanismId = normalizeMechanismId(input.mechanismId, text);

    const industryScope = this.resolveIndustryScope(input, text);
    const mineScope = this.resolveMineScope(input, text);

    const situationalAwarenessPacket = this.brainQueryOrchestrator.query({
      jurisdiction: input.jurisdiction,
      industryScope,
      mineScope,
      hazardDomain: input.hazardDomain,
      mechanism: canonicalMechanismId,
      citation: input.primaryCitation,
      text,
      approvedOnly: true,
      limit: 5,
      scenarioLabel: 'safescope-reasoning-run',
    });

    const brainLikelyCitation = situationalAwarenessPacket.summary.likelyCitation;
    const brainLikelyMechanism = situationalAwarenessPacket.summary.likelyMechanism;

    const citationAlignedWithNativeReasoning =
      !input.primaryCitation ||
      !brainLikelyCitation ||
      input.primaryCitation === brainLikelyCitation;

    const mechanismAlignedWithNativeReasoning =
      !input.mechanismId ||
      !brainLikelyMechanism ||
      input.mechanismId === brainLikelyMechanism;

    const notes = [
      'Brain snapshot is read-only situational awareness.',
      'Brain snapshot does not create citations, declare violations, override regulations, or bypass qualified review.',
    ];

    if (!citationAlignedWithNativeReasoning) {
      notes.push('Brain likely citation differs from native reasoning citation; qualified review is required.');
    }

    if (!mechanismAlignedWithNativeReasoning) {
      notes.push('Brain likely mechanism differs from native reasoning mechanism; qualified review is required.');
    }

    return {
      engine: 'safescope_brain_snapshot_builder',
      mode: 'read_only_reasoning_context_snapshot',
      generatedAt: new Date(0).toISOString(),
      input,
      queryContext: {
        jurisdiction: input.jurisdiction,
        industryScope,
        mineScope,
        hazardDomain: input.hazardDomain,
        mechanismId: canonicalMechanismId,
        text,
      },
      situationalAwarenessPacket,
      alignment: {
        citationAlignedWithNativeReasoning,
        mechanismAlignedWithNativeReasoning,
        nativePrimaryCitation: input.primaryCitation,
        brainLikelyCitation,
        nativeMechanism: input.mechanismId,
        brainLikelyMechanism,
        notes,
      },
      boundary: {
        readOnly: true,
        canCreateCitation: false,
        canDeclareViolation: false,
        canOverrideRegulation: false,
        canBypassHumanReview: false,
        canModifyProductionReasoning: false,
        requiresQualifiedReview: true,
      },
    };
  }

  private resolveIndustryScope(
    input: SafeScopeBrainSnapshotInput,
    text: string,
  ): SafeScopeIndustryScope {
    if (input.jurisdiction === 'osha_construction') return 'construction';
    if (input.jurisdiction === 'osha_general_industry') return 'general_industry';
    if (input.jurisdiction === 'msha') return 'mining';

    if (text.includes('construction') || text.includes('jobsite')) return 'construction';
    if (text.includes('mine') || text.includes('mining') || text.includes('msha')) return 'mining';
    if (text.includes('facility') || text.includes('general industry') || text.includes('warehouse')) return 'general_industry';

    return 'unknown';
  }

  private resolveMineScope(
    input: SafeScopeBrainSnapshotInput,
    text: string,
  ): SafeScopeMineScope {
    if (input.jurisdiction !== 'msha') return 'not_applicable';

    const coal = text.includes('coal');
    const underground = text.includes('underground') || text.includes('ug');
    const surface = text.includes('surface');
    const mnm =
      text.includes('metal/nonmetal') ||
      text.includes('metal nonmetal') ||
      text.includes('mnm') ||
      text.includes('mill') ||
      text.includes('aggregate') ||
      text.includes('quarry');

    if (coal && underground) return 'coal_underground';
    if (coal && surface) return 'coal_surface';
    if (mnm && underground) return 'metal_nonmetal_underground';
    if (mnm && surface) return 'metal_nonmetal_surface';
    if (underground) return 'metal_nonmetal_underground';
    if (surface) return 'metal_nonmetal_surface';

    return 'unknown';
  }
}
