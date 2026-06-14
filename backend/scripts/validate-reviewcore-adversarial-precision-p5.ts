import { SafeScopeMechanismIntelligenceService } from '../src/safescope-v2/mechanism-intelligence/mechanism-intelligence.service';
import { SafeScopeStandardsIntentIntelligenceService } from '../src/safescope-v2/standards-intent-intelligence/standards-intent-intelligence.service';
import { SafeScopeRegulatoryApplicabilityService } from '../src/safescope-v2/regulatory-applicability/regulatory-applicability.service';
import { SafeScopeControlEffectivenessService } from '../src/safescope-v2/control-effectiveness/control-effectiveness.service';

type CaseType = 'positive' | 'controlled';

type AdversarialCase = {
  id: string;
  domain: string;
  type: CaseType;
  classification: string;
  observationText: string;
  expectedAny: string[];
  controlledSignals?: string[];
  suggestedStandard: {
    citation: string;
    title: string;
    summary: string;
  };
  riskBand: 'Low' | 'Moderate' | 'High' | 'Critical';
};

const forbiddenFinalDecisionPhrases = [
  'citation issued',
  'violation issued',
  'guaranteed compliance',
  'no human review required',
];

const cases: AdversarialCase[] = [
  {
    id: 'P5-CRANE-POS-001',
    domain: 'cranes_rigging_hoisting',
    type: 'positive',
    classification: 'Cranes and hoists',
    observationText: 'Worker is standing under an active suspended load during a crane lift. Tag line control is unclear and the load path crosses the work area.',
    expectedAny: ['gravity', 'struck_by', 'crush', 'load'],
    suggestedStandard: { citation: 'candidate-crane-rigging', title: 'Cranes and rigging candidate', summary: 'Suspended load and rigging safety review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-CRANE-POS-002',
    domain: 'cranes_rigging_hoisting',
    type: 'positive',
    classification: 'Cranes and hoists',
    observationText: 'Damaged sling is being used for an active lift with workers near the suspended load.',
    expectedAny: ['gravity', 'struck_by', 'crush', 'sling'],
    suggestedStandard: { citation: 'candidate-crane-rigging', title: 'Rigging candidate', summary: 'Rigging condition and suspended load review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-CRANE-CTRL-001',
    domain: 'cranes_rigging_hoisting',
    type: 'controlled',
    classification: 'Cranes and hoists',
    observationText: 'The load has been landed, cribbed, and released from the hook. No worker is under a suspended load.',
    expectedAny: ['gravity', 'struck_by', 'crush', 'load'],
    controlledSignals: ['landed', 'cribbed', 'released', 'no worker'],
    suggestedStandard: { citation: 'candidate-crane-rigging', title: 'Cranes and rigging candidate', summary: 'Suspended load and rigging safety review.' },
    riskBand: 'Moderate',
  },
  {
    id: 'P5-CRANE-CTRL-002',
    domain: 'cranes_rigging_hoisting',
    type: 'controlled',
    classification: 'Cranes and hoists',
    observationText: 'Damaged sling was tagged out, removed from service, and stored in the reject bin before any lift occurred.',
    expectedAny: ['gravity', 'struck_by', 'crush', 'sling'],
    controlledSignals: ['tagged out', 'removed from service', 'reject bin'],
    suggestedStandard: { citation: 'candidate-crane-rigging', title: 'Rigging candidate', summary: 'Rigging condition and suspended load review.' },
    riskBand: 'Moderate',
  },

  {
    id: 'P5-BBP-POS-001',
    domain: 'bloodborne_pathogens',
    type: 'positive',
    classification: 'Bloodborne Pathogens',
    observationText: 'Used needle with possible blood contamination is found loose on a workbench outside a sharps container.',
    expectedAny: ['biological', 'blood', 'sharps', 'needle', 'exposure'],
    suggestedStandard: { citation: 'candidate-bbp', title: 'Bloodborne pathogens candidate', summary: 'Sharps and body fluid exposure review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-BBP-POS-002',
    domain: 'bloodborne_pathogens',
    type: 'positive',
    classification: 'Bloodborne Pathogens',
    observationText: 'Body fluid cleanup is occurring without trained personnel, PPE, disinfectant, or decontamination procedure documented.',
    expectedAny: ['biological', 'blood', 'body fluid', 'decontamination', 'ppe'],
    suggestedStandard: { citation: 'candidate-bbp', title: 'Bloodborne pathogens candidate', summary: 'Body fluid cleanup exposure review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-BBP-CTRL-001',
    domain: 'bloodborne_pathogens',
    type: 'controlled',
    classification: 'Bloodborne Pathogens',
    observationText: 'Unused sterile packaged needle is sealed inside a first aid cabinet with no blood or body fluid exposure.',
    expectedAny: ['biological', 'blood', 'sharps', 'needle'],
    controlledSignals: ['unused', 'sterile', 'packaged', 'sealed', 'no blood'],
    suggestedStandard: { citation: 'candidate-bbp', title: 'Bloodborne pathogens candidate', summary: 'Sharps and body fluid exposure review.' },
    riskBand: 'Low',
  },
  {
    id: 'P5-BBP-CTRL-002',
    domain: 'bloodborne_pathogens',
    type: 'controlled',
    classification: 'Bloodborne Pathogens',
    observationText: 'Red paint spill is clearly identified by label and SDS as non-biological material with no blood or body fluid source.',
    expectedAny: ['biological', 'blood', 'body fluid', 'paint'],
    controlledSignals: ['paint', 'label', 'sds', 'non-biological', 'no blood'],
    suggestedStandard: { citation: 'candidate-bbp', title: 'Bloodborne pathogens candidate', summary: 'Body fluid exposure review.' },
    riskBand: 'Low',
  },

  {
    id: 'P5-ERGO-POS-001',
    domain: 'ergonomics',
    type: 'positive',
    classification: 'Ergonomics',
    observationText: 'Employees repeatedly lift heavy bags from floor level while twisting and reaching away from the body for a full shift.',
    expectedAny: ['overexertion', 'sprain', 'strain', 'biomechanical', 'ergonomic'],
    suggestedStandard: { citation: 'candidate-ergonomics', title: 'Ergonomics candidate', summary: 'Manual material handling ergonomic risk review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-ERGO-POS-002',
    domain: 'ergonomics',
    type: 'positive',
    classification: 'Ergonomics',
    observationText: 'Forceful repetitive hand task is performed for long duration with awkward wrist posture and no job rotation.',
    expectedAny: ['overexertion', 'sprain', 'strain', 'biomechanical', 'repetitive'],
    suggestedStandard: { citation: 'candidate-ergonomics', title: 'Ergonomics candidate', summary: 'Repetitive forceful task ergonomic review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-ERGO-CTRL-001',
    domain: 'ergonomics',
    type: 'controlled',
    classification: 'Ergonomics',
    observationText: 'One-time light lift is completed at waist height with neutral posture and no repetition or forceful exertion.',
    expectedAny: ['overexertion', 'sprain', 'strain', 'biomechanical'],
    controlledSignals: ['one-time', 'light', 'neutral posture', 'no repetition'],
    suggestedStandard: { citation: 'candidate-ergonomics', title: 'Ergonomics candidate', summary: 'Manual material handling ergonomic risk review.' },
    riskBand: 'Low',
  },
  {
    id: 'P5-ERGO-CTRL-002',
    domain: 'ergonomics',
    type: 'controlled',
    classification: 'Ergonomics',
    observationText: 'Mechanical lift assist is used, workstation height is adjusted, and forceful manual lifting is reduced.',
    expectedAny: ['overexertion', 'sprain', 'strain', 'biomechanical'],
    controlledSignals: ['mechanical lift', 'adjusted', 'reduced', 'assist'],
    suggestedStandard: { citation: 'candidate-ergonomics', title: 'Ergonomics candidate', summary: 'Ergonomic control review.' },
    riskBand: 'Moderate',
  },

  {
    id: 'P5-IH-POS-001',
    domain: 'industrial_hygiene',
    type: 'positive',
    classification: 'Respirable Dust / Silica',
    observationText: 'Dry cutting concrete creates visible respirable dust with no wet method, no local exhaust, and no exposure sampling record.',
    expectedAny: ['inhalation', 'silica', 'dust', 'sampling', 'exposure'],
    suggestedStandard: { citation: 'candidate-industrial-hygiene', title: 'Industrial hygiene candidate', summary: 'Airborne exposure assessment review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-IH-POS-002',
    domain: 'industrial_hygiene',
    type: 'positive',
    classification: 'Welding Health Hazard',
    observationText: 'Welding fumes collect in an enclosed area with no local exhaust ventilation and workers nearby.',
    expectedAny: ['inhalation', 'fume', 'ventilation', 'exposure'],
    suggestedStandard: { citation: 'candidate-industrial-hygiene', title: 'Industrial hygiene candidate', summary: 'Welding fume exposure review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-IH-CTRL-001',
    domain: 'industrial_hygiene',
    type: 'controlled',
    classification: 'Respirable Dust / Silica',
    observationText: 'Wet method and local exhaust are verified during concrete cutting; exposure monitoring is pending for final review.',
    expectedAny: ['inhalation', 'silica', 'dust', 'monitoring', 'ventilation'],
    controlledSignals: ['wet method', 'local exhaust', 'verified', 'monitoring pending'],
    suggestedStandard: { citation: 'candidate-industrial-hygiene', title: 'Industrial hygiene candidate', summary: 'Airborne exposure assessment review.' },
    riskBand: 'Moderate',
  },
  {
    id: 'P5-IH-CTRL-002',
    domain: 'industrial_hygiene',
    type: 'controlled',
    classification: 'Welding Health Hazard',
    observationText: 'Outdoor welding is performed with active local exhaust capture, no enclosed area, and no nearby worker exposure observed.',
    expectedAny: ['inhalation', 'fume', 'ventilation', 'exposure'],
    controlledSignals: ['outdoor', 'active local exhaust', 'no nearby worker'],
    suggestedStandard: { citation: 'candidate-industrial-hygiene', title: 'Industrial hygiene candidate', summary: 'Welding fume exposure review.' },
    riskBand: 'Moderate',
  },

  {
    id: 'P5-EP-POS-001',
    domain: 'emergency_preparedness',
    type: 'positive',
    classification: 'Emergency Preparedness',
    observationText: 'Emergency exit route is blocked by stored material in an occupied production area.',
    expectedAny: ['egress', 'emergency', 'delayed', 'exit'],
    suggestedStandard: { citation: 'candidate-emergency-preparedness', title: 'Emergency preparedness candidate', summary: 'Emergency egress and response readiness review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-FIRE-POS-001',
    domain: 'fire_protection',
    type: 'positive',
    classification: 'Fire / Hot Work',
    observationText: 'Hot work is occurring near combustibles with blocked extinguisher access and no fire watch assigned.',
    expectedAny: ['fire', 'burn', 'explosion', 'extinguisher', 'hot work'],
    suggestedStandard: { citation: 'candidate-fire-protection', title: 'Fire protection candidate', summary: 'Hot work and extinguisher readiness review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-EP-CTRL-001',
    domain: 'emergency_preparedness',
    type: 'controlled',
    classification: 'Emergency Preparedness',
    observationText: 'Temporary storage is outside the required exit path; emergency route remains clear and marked.',
    expectedAny: ['egress', 'emergency', 'exit'],
    controlledSignals: ['outside', 'route remains clear', 'marked'],
    suggestedStandard: { citation: 'candidate-emergency-preparedness', title: 'Emergency preparedness candidate', summary: 'Emergency egress review.' },
    riskBand: 'Low',
  },
  {
    id: 'P5-FIRE-CTRL-001',
    domain: 'fire_protection',
    type: 'controlled',
    classification: 'Fire / Hot Work',
    observationText: 'Hot work permit is active, combustibles are removed, extinguisher is accessible, and fire watch is assigned.',
    expectedAny: ['fire', 'hot work', 'extinguisher', 'fire watch'],
    controlledSignals: ['permit', 'removed', 'accessible', 'fire watch assigned'],
    suggestedStandard: { citation: 'candidate-fire-protection', title: 'Fire protection candidate', summary: 'Hot work and extinguisher readiness review.' },
    riskBand: 'Moderate',
  },

  {
    id: 'P5-HAZMAT-POS-001',
    domain: 'hazardous_materials',
    type: 'positive',
    classification: 'Hazard Communication',
    observationText: 'Unlabeled leaking chemical container with unknown contents is located near employees in a maintenance area.',
    expectedAny: ['chemical', 'identity', 'sds', 'label', 'containment'],
    suggestedStandard: { citation: 'candidate-hazardous-materials', title: 'Hazardous materials candidate', summary: 'Chemical identity, labeling, and containment review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-HAZMAT-POS-002',
    domain: 'hazardous_materials',
    type: 'positive',
    classification: 'Hazard Communication',
    observationText: 'Incompatible chemicals are stored together with no segregation, no containment, and employees nearby.',
    expectedAny: ['chemical', 'compatibility', 'segregation', 'containment'],
    suggestedStandard: { citation: 'candidate-hazardous-materials', title: 'Hazardous materials candidate', summary: 'Chemical storage compatibility review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-HAZMAT-CTRL-001',
    domain: 'hazardous_materials',
    type: 'controlled',
    classification: 'Hazard Communication',
    observationText: 'Sealed labeled chemical container is stored compatibly with SDS available and secondary containment verified.',
    expectedAny: ['chemical', 'sds', 'label', 'containment'],
    controlledSignals: ['sealed', 'labeled', 'sds available', 'compatibly', 'containment verified'],
    suggestedStandard: { citation: 'candidate-hazardous-materials', title: 'Hazardous materials candidate', summary: 'Chemical storage review.' },
    riskBand: 'Moderate',
  },
  {
    id: 'P5-HAZMAT-CTRL-002',
    domain: 'hazardous_materials',
    type: 'controlled',
    classification: 'Hazard Communication',
    observationText: 'Empty clean container is labeled empty, staged for disposal, and has no residue or employee exposure.',
    expectedAny: ['chemical', 'label', 'residue', 'exposure'],
    controlledSignals: ['empty', 'clean', 'no residue', 'no employee exposure'],
    suggestedStandard: { citation: 'candidate-hazardous-materials', title: 'Hazardous materials candidate', summary: 'Chemical container review.' },
    riskBand: 'Low',
  },

  {
    id: 'P5-TRENCH-POS-001',
    domain: 'trenching_and_excavation',
    type: 'positive',
    classification: 'Trenching Excavation',
    observationText: 'Worker is inside a trench deeper than five feet with vertical walls and no protective system visible.',
    expectedAny: ['engulfment', 'crush', 'cave', 'falling', 'gravity'],
    suggestedStandard: { citation: 'candidate-trenching', title: 'Trenching candidate', summary: 'Excavation protective system review.' },
    riskBand: 'Critical',
  },
  {
    id: 'P5-ROOF-POS-001',
    domain: 'roof_rib_control',
    type: 'positive',
    classification: 'Ground Control',
    observationText: 'Worker is below loose highwall material with visible cracks and no barricade or scaling completed.',
    expectedAny: ['struck', 'crush', 'falling', 'gravity', 'loose'],
    suggestedStandard: { citation: 'candidate-ground-control', title: 'Ground control candidate', summary: 'Highwall and loose material review.' },
    riskBand: 'High',
  },
  {
    id: 'P5-TRENCH-CTRL-001',
    domain: 'trenching_and_excavation',
    type: 'controlled',
    classification: 'Trenching Excavation',
    observationText: 'Trench is barricaded as a no-entry area, trench box is installed, and competent-person inspection is documented.',
    expectedAny: ['engulfment', 'crush', 'trench', 'inspection'],
    controlledSignals: ['barricaded', 'no-entry', 'trench box', 'inspection documented'],
    suggestedStandard: { citation: 'candidate-trenching', title: 'Trenching candidate', summary: 'Excavation protective system review.' },
    riskBand: 'Moderate',
  },
  {
    id: 'P5-ROOF-CTRL-001',
    domain: 'roof_rib_control',
    type: 'controlled',
    classification: 'Ground Control',
    observationText: 'Loose highwall material has been scaled, the area is barricaded, and no worker exposure is present.',
    expectedAny: ['struck', 'crush', 'falling', 'gravity', 'loose'],
    controlledSignals: ['scaled', 'barricaded', 'no worker exposure'],
    suggestedStandard: { citation: 'candidate-ground-control', title: 'Ground control candidate', summary: 'Highwall and loose material review.' },
    riskBand: 'Moderate',
  },
];

const mechanismService = new SafeScopeMechanismIntelligenceService();
const standardsIntentService = new SafeScopeStandardsIntentIntelligenceService();
const applicabilityService = new SafeScopeRegulatoryApplicabilityService();
const controlEffectivenessService = new SafeScopeControlEffectivenessService();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function flatten(value: unknown): string {
  return JSON.stringify(value ?? '').toLowerCase();
}

function includesAny(blob: string, terms: string[]) {
  return terms.some((term) => blob.includes(term.toLowerCase()));
}

const summary: Record<string, { positive: number; controlled: number }> = {};

for (const testCase of cases) {
  const mechanism = mechanismService.evaluate({
    classification: testCase.classification,
    observationText: testCase.observationText,
    risk: { riskBand: testCase.riskBand },
    suggestedStandards: [testCase.suggestedStandard],
    evidenceContract: {
      missingInputs: testCase.type === 'positive' ? ['field verification required'] : ['closure verification required'],
      reviewTriggers: ['qualified review required'],
    },
    expertObservations: { humanReviewTriggers: ['qualified review required'] },
    knowledgeMatches: [],
  } as any);

  const standardsIntent = standardsIntentService.evaluate({
    classification: testCase.classification,
    observationText: testCase.observationText,
    suggestedStandards: [testCase.suggestedStandard],
    risk: { riskBand: testCase.riskBand },
    mechanismIntelligence: mechanism,
    evidenceSufficiency: {
      sufficientForStandardsRecommendation: testCase.type === 'positive',
      missingCriticalEvidence: testCase.type === 'positive' ? ['field verification required'] : ['do not finalize from control claim alone'],
    },
    safetyHealthDomainMatrix: {
      primaryDomain: testCase.classification,
      hazardousEnergies: mechanism.primaryEnergySources,
      injuryMechanisms: mechanism.injuryMechanisms,
      evidenceRequired: mechanism.evidenceNeeded,
      relatedDomains: [],
      mitigationStrategies: [],
      strongControls: [],
      weakControls: [],
    },
  } as any);

  const applicability = applicabilityService.evaluate({
    classification: testCase.classification,
    observationText: testCase.observationText,
    suggestedStandards: [testCase.suggestedStandard],
    evidenceTexts: testCase.type === 'positive' ? [testCase.observationText] : [testCase.observationText, 'Controls require field verification before closure.'],
    risk: { riskBand: testCase.riskBand },
    evidenceSufficiency: {
      sufficientForStandardsRecommendation: testCase.type === 'positive',
      missingCriticalEvidence: testCase.type === 'positive' ? ['field verification required'] : ['controlled condition requires verification before closure'],
    },
  } as any);

  const controlEffectiveness = controlEffectivenessService.evaluate({
    classification: testCase.classification,
    observationText: testCase.observationText,
    existingControls: testCase.type === 'controlled' ? (testCase.controlledSignals ?? []) : [],
    proposedControls: testCase.type === 'positive' ? [] : (testCase.controlledSignals ?? []),
    risk: { riskBand: testCase.riskBand },
    evidenceSufficiency: { sufficientForClosure: false },
    actionQuality: { closureBlockers: ['qualified review and verification required before closure'] },
    causalChain: { requiresQualifiedReview: true, criticalBreakPoints: ['verify control effectiveness'] },
  } as any);

  const blob = flatten({ mechanism, standardsIntent, applicability, controlEffectiveness });

  for (const phrase of forbiddenFinalDecisionPhrases) {
    assert(!blob.includes(phrase), `${testCase.id}: prohibited final-decision phrase found: ${phrase}`);
  }

  assert(mechanism.canInventCitations === false, `${testCase.id}: mechanism must not invent citations`);
  assert(mechanism.canOverrideStandards === false, `${testCase.id}: mechanism must not override standards`);
  assert(mechanism.canReduceHumanReview === false, `${testCase.id}: mechanism must not reduce human review`);

  assert(standardsIntent.canInventStandards === false, `${testCase.id}: standards intent must not invent standards`);
  assert(standardsIntent.canDeclareViolation === false, `${testCase.id}: standards intent must not declare violation`);
  assert(standardsIntent.canFinalizeApplicabilityWithoutEvidence === false, `${testCase.id}: standards intent must not finalize without evidence`);
  assert(standardsIntent.requiresQualifiedReview === true, `${testCase.id}: standards intent must require review`);

  assert(applicability.canInventStandards === false, `${testCase.id}: applicability must not invent standards`);
  assert(applicability.canDeclareViolation === false, `${testCase.id}: applicability must not declare violation`);
  assert(applicability.canFinalizeApplicabilityWithoutEvidence === false, `${testCase.id}: applicability must not finalize without evidence`);
  assert(applicability.canReduceHumanReview === false, `${testCase.id}: applicability must not reduce review`);
  assert(applicability.requiresQualifiedReview === true, `${testCase.id}: applicability must require review`);

  assert(controlEffectiveness.canAssumeControlEffectiveness === false, `${testCase.id}: controls must not assume effectiveness`);
  assert(controlEffectiveness.canCloseWithoutVerification === false, `${testCase.id}: controls must not close without verification`);
  assert(controlEffectiveness.canReduceHumanReview === false, `${testCase.id}: controls must not reduce review`);

  if (testCase.type === 'positive') {
    assert(mechanism.requiresQualifiedReview === true, `${testCase.id}: positive high-risk case must require review`);
    assert(includesAny(blob, testCase.expectedAny), `${testCase.id}: expected mechanism/evidence signal missing. Expected one of ${testCase.expectedAny.join(', ')}`);
  }

  if (testCase.type === 'controlled') {
    const controlledInputBlob = `${testCase.observationText} ${(testCase.controlledSignals ?? []).join(' ')}`.toLowerCase();

    assert(controlEffectiveness.effectivenessRating !== 'effective' || controlEffectiveness.closureReadinessBlockers.length > 0, `${testCase.id}: controlled case must not become autonomous closure`);
    assert(controlEffectiveness.closureReadinessBlockers.length > 0 || controlEffectiveness.verificationNeeded.length > 0, `${testCase.id}: controlled case must preserve verification need`);
    assert(includesAny(controlledInputBlob, testCase.controlledSignals ?? []), `${testCase.id}: controlled scenario must include explicit control facts`);
  }

  summary[testCase.domain] ??= { positive: 0, controlled: 0 };
  summary[testCase.domain][testCase.type] += 1;
}

const totals = {
  total: cases.length,
  positive: cases.filter((item) => item.type === 'positive').length,
  controlled: cases.filter((item) => item.type === 'controlled').length,
  domains: Object.keys(summary).length,
};

console.log('✅ ReviewCore P5 adversarial precision validation passed.');
console.log(JSON.stringify({ totals, byDomain: summary }, null, 2));
