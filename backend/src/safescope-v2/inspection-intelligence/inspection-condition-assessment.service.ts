import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';
import { InspectionConditionAssessment } from './inspection-condition-assessment.types';

type ControlPattern = {
  domains: SafeScopeReasoningDomain[];
  pattern: RegExp;
  evidence: string;
};

const CONTROL_PATTERNS: ControlPattern[] = [
  { domains: ['machine_guarding', 'machine_guarding_loto'], pattern: /\b(guard|guarding)\b[^.;]*\b(installed|in place|intact|secured|effective)\b|\b(fully )?guarded\b/, evidence: 'Machine guarding is described as installed and effective.' },
  { domains: ['machine_guarding_loto', 'lockout_tagout'], pattern: /\b(locked out|lockout applied|loto applied|de-energized)\b[^.;]*\b(verified|for maintenance|zero energy|blocked)|\b(equipment|machine|conveyor)\b[^.;]*\blocked out\b|\bzero[- ]energy (state )?(verified|confirmed)\b/, evidence: 'Hazardous energy is described as isolated and verified.' },
  { domains: ['compressed_gas'], pattern: /\b(cylinder|cylinders)\b[^.;]*\b(chained|secured|restrained)\b[^.;]*\b(upright|valve caps?|caps?)\b|\bvalve caps? (are )?installed\b[^.;]*\bsecured\b/, evidence: 'Cylinders are described as secured upright with valve protection.' },
  { domains: ['emergency_preparedness'], pattern: /\b(emergency )?(exit|exit route|egress)\b[^.;]*\b(clear|unobstructed|unblocked|marked and unobstructed)\b/, evidence: 'Emergency egress is described as clear and available.' },
  { domains: ['walking_working_surfaces', 'slip_trip_fall', 'slips_trips_falls'], pattern: /\b(floor|walkway|aisle|surface)\b[^.;]*\b(dry|clean and dry|clear and dry|free of (spills|debris))\b/, evidence: 'The walking surface is described as dry and clear.' },
  { domains: ['electrical'], pattern: /\bno exposed (energized|live) (parts|conductors)\b|\b(panel|enclosure) (cover )?(is )?(intact|closed|secured)\b|\bcord (is )?(undamaged|intact)\b/, evidence: 'Electrical guarding or conductor integrity is explicitly described as intact.' },
  { domains: ['mobile_equipment', 'traffic_control', 'powered_haulage'], pattern: /\b(no pedestrian exposure|pedestrians? (are )?separated|separated from pedestrians?)\b|\b(barrier|barriers|physical separation)\b[^.;]*\b(pedestrian|forklift|mobile equipment|traffic route)\b/, evidence: 'Pedestrian and mobile-equipment routes are described as separated.' },
  { domains: ['powered_haulage', 'mobile_equipment'], pattern: /\b(berm|guardrail|windrow)\b[^.;]*\b(present|installed|adequate|maintained)\b/, evidence: 'Edge control is described as present and adequate.' },
  { domains: ['fire_protection'], pattern: /\bfire extinguisher\b[^.;]*\b(accessible|unobstructed|clearly visible|readily available)\b/, evidence: 'Fire protection equipment is described as accessible.' },
  { domains: ['welding_cutting_hot_work', 'fire_protection'], pattern: /\b(hot work|welding|cutting)\b[^.;]*\b(combustibles? (removed|cleared|protected))\b[^.;]*\bfire watch (present|assigned|in place)\b/, evidence: 'Hot-work combustibles and fire-watch controls are described as in place.' },
  { domains: ['ladders'], pattern: /\b(ladder|stepladder|extension ladder)\b[^.;]*\b(removed from service|tagged out of service|destroyed and discarded)\b/, evidence: 'The defective ladder is described as removed from exposure.' },
  { domains: ['hazard_communication', 'hazardous_materials'], pattern: /\b(chemical )?(container|bottle|drum)\b[^.;]*\b(labeled|identified)\b[^.;]*\b(closed|sealed|capped)\b/, evidence: 'The chemical container is described as identified, labeled, and closed.' },
  { domains: ['fall_protection'], pattern: /\b(floor hole|floor opening|opening)\b[^.;]*\b(covered|guarded)\b[^.;]*\b(labeled|marked|secured|load[- ]rated)\b/, evidence: 'The opening is described as covered/guarded and identified.' },
];

const FALSE_POSITIVE_PATTERNS: Array<{ pattern: RegExp; signal: string }> = [
  { pattern: /\bfall meeting\b|\bfall planning meeting\b|\bfall schedule\b/, signal: 'Seasonal/meeting use of “fall”.' },
  { pattern: /\bhot work permit\b.*\b(filed|complete|completed|approved|closed)\b/, signal: 'Completed hot-work permit record without an observed control failure.' },
  { pattern: /\btraining (record|records)\b.*\b(reviewed|complete|current|verified)\b/, signal: 'Completed training-record review.' },
  { pattern: /\bnoise complaint\b.*\b(office conversation|conversation|meeting|email)\b/, signal: 'Non-exposure conversational use of “noise”.' },
  { pattern: /\bdust cover\b.*\b(installed|in place|closed|secured)\b/, signal: 'Equipment dust-cover terminology rather than airborne dust.' },
  { pattern: /\blocked out of (the |my |an )?(account|system|application|app)\b/, signal: 'Account-access use of “locked out”.' },
  { pattern: /\bguard (assigned|posted)\b.*\b(gate|entrance|door)\b/, signal: 'Security-guard terminology.' },
  { pattern: /\bchemical inventory\b.*\b(complete|completed|current|reviewed)\b/, signal: 'Chemical inventory administration without a reported container/exposure failure.' },
  { pattern: /\bcoal[- ]colored\b|\bcoal color(ed)?\b/, signal: 'Color description rather than coal-mine context.' },
  { pattern: /\bpit stop\b|\binspection pit\b/, signal: 'Non-mining pit terminology.' },
  { pattern: /\bquarry tile\b/, signal: 'Building-material use of “quarry”.' },
  { pattern: /\baggregate data\b|\bdata aggregation\b/, signal: 'Data-processing use of “aggregate”.' },
  { pattern: /\bmine the data\b|\bdata mining\b|\btext mining\b/, signal: 'Data-analysis use of “mine/mining”.' },
  { pattern: /\bcoal tar\b/, signal: 'Chemical/material use of “coal” without coal-mine context.' },
];

const VAGUE_DOMAIN_PATTERNS: Array<{ domain: SafeScopeReasoningDomain; pattern: RegExp; reason: string }> = [
  { domain: 'fall_protection', pattern: /\b(possible|maybe|potential) fall hazard\b|\bfall concern\b/, reason: 'Fall height, edge/opening geometry, task, proximity, and controls are not stated.' },
  { domain: 'electrical', pattern: /\b(maybe|possible|potential) electrical (issue|concern|problem)\b/, reason: 'Equipment, voltage, energized condition, defect, and exposure are not stated.' },
  { domain: 'hazard_communication', pattern: /\bchemical container (observed|present|noted)\b/, reason: 'Chemical identity, label, closure, condition, and exposure route are not stated.' },
  { domain: 'lockout_tagout', pattern: /\bequipment maintenance (occurring|underway|in progress)\b/, reason: 'The servicing task, hazardous energy, danger-zone access, and isolation status are not stated.' },
  { domain: 'industrial_hygiene', pattern: /\bdust (in|observed in|present in) the area\b/, reason: 'Dust identity, generation task, duration, concentration, and exposure are not stated.' },
  { domain: 'mobile_equipment', pattern: /\bmobile equipment nearby\b|\b(forklift|loader|truck) nearby\b/, reason: 'Operating state, proximity, route overlap, visibility, and pedestrian exposure are not stated.' },
  { domain: 'unknown', pattern: /\bmine site issue\b|\bissue at (the )?mine site\b/, reason: 'Mine type, location, equipment, task, condition, and exposure are not stated.' },
  { domain: 'training_procedure_gap', pattern: /\btraining concern\b|\bpossible training issue\b/, reason: 'Worker role, assigned task, jurisdiction, required training, and record status are not stated.' },
  { domain: 'confined_space', pattern: /^\s*possible (confined|permit) space[.!?]?\s*$/, reason: 'Space configuration, entry, atmosphere, internal hazards, and permit-space criteria are not stated.' },
  { domain: 'fall_protection', pattern: /\bfall hazard (reported|noted)\b/, reason: 'Fall distance, surface/opening type, employee exposure, task, and controls are not stated.' },
  { domain: 'electrical', pattern: /\belectrical concern (at|near) (the )?panel\b/, reason: 'Voltage, equipment condition, energized exposure, access, and defect evidence are not stated.' },
];

const UNCONTROLLED_SIGNAL = /\b(missing|unguarded|unsecured|exposed|damaged|frayed|blocked|obstructed|leaking|spill|inoperative|defective|broken|without|no guard|no barrier|not verified|failed|unsafe)\b|\b(guard removed|removed guard)\b/i;

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export class InspectionConditionAssessmentService {
  assess(value: string): InspectionConditionAssessment {
    const text = String(value || '').toLowerCase();
    const falsePositiveSignals = FALSE_POSITIVE_PATTERNS.filter((item) => item.pattern.test(text)).map((item) => item.signal);
    const controls = CONTROL_PATTERNS.filter((item) => item.pattern.test(text));
    const unsafeText = text
      .replace(/\bno exposed (energized|live) (parts|conductors)\b/g, ' ')
      .replace(/\bcombustibles? (removed|cleared|protected)\b/g, ' ')
      .replace(/[^.;]*\b(ladder|stepladder|extension ladder)\b[^.;]*\bremoved from service\b[^.;]*/g, ' ')
      .replace(/\b(guard|guarding)\b[^.;]*\b(installed|in place|intact|secured|effective)\b/g, ' ')
      .replace(/\b(no pedestrian exposure|no hazard exposure)\b/g, ' ');
    const hasActualHazardFailure = UNCONTROLLED_SIGNAL.test(unsafeText);

    if (falsePositiveSignals.length > 0 && !hasActualHazardFailure) {
      return {
        status: 'no_hazard_signal', controlledDomains: [], controlEvidence: [], likelyDomains: [], uncertaintyReasons: [],
        falsePositiveSignals, citationEligible: false,
      };
    }

    const vague = VAGUE_DOMAIN_PATTERNS.filter((item) => item.pattern.test(text));

    if (vague.length > 0 && !hasActualHazardFailure) {
      return {
        status: 'insufficient_evidence', controlledDomains: [], controlEvidence: [],
        likelyDomains: unique(vague.map((item) => item.domain)),
        uncertaintyReasons: unique(vague.map((item) => item.reason)), falsePositiveSignals: [], citationEligible: false,
      };
    }

    if (controls.length > 0 && !hasActualHazardFailure) {
      return {
        status: 'controlled', controlledDomains: unique(controls.flatMap((item) => item.domains)),
        controlEvidence: unique(controls.map((item) => item.evidence)), likelyDomains: [], uncertaintyReasons: [],
        falsePositiveSignals: [], citationEligible: false,
      };
    }

    return {
      status: 'uncontrolled', controlledDomains: unique(controls.flatMap((item) => item.domains)),
      controlEvidence: unique(controls.map((item) => item.evidence)), likelyDomains: [], uncertaintyReasons: [],
      falsePositiveSignals: [], citationEligible: true,
    };
  }
}
