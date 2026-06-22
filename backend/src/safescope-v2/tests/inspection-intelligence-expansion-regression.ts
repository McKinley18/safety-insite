import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

type Scenario = {
  name: string;
  observation: string;
  siteType?: string;
  expectedDomain: SafeScopeReasoningDomain;
  expectedTerms: RegExp[];
  expectedCitation?: RegExp;
  expectedConfidence?: 'moderate' | 'high';
};

const scenarios: Scenario[] = [
  { name: 'wet floor without controls', observation: 'Wet slippery floor in the warehouse pedestrian aisle without signs or barricades.', siteType: 'warehouse', expectedDomain: 'walking_working_surfaces', expectedTerms: [/traction|friction/i, /barricade/i], expectedCitation: /1910\.22/ },
  { name: 'snow and ice at entry', observation: 'Snow and ice tracked into the facility entry walking surface.', siteType: 'facility', expectedDomain: 'walking_working_surfaces', expectedTerms: [/traction|slip/i, /entry|weather/i], expectedCitation: /1910\.22/ },
  { name: 'hose crossing walkway', observation: 'Air hose crossing the main shop walkway used by employees.', siteType: 'shop', expectedDomain: 'walking_working_surfaces', expectedTerms: [/foot can catch|trip/i, /reroute/i], expectedCitation: /1910\.22/ },
  { name: 'damaged grating', observation: 'Damaged loose grating on a poorly lit plant walkway.', siteType: 'plant', expectedDomain: 'walking_working_surfaces', expectedTerms: [/stable.*footing|shift/i, /qualified repair|load rating/i], expectedCitation: /1910\.22/ },
  { name: 'uncovered floor hole', observation: 'Uncovered floor hole with employees working beside the opening at a construction site.', siteType: 'construction', expectedDomain: 'fall_protection', expectedTerms: [/through the opening/i, /cover rating|load-rated/i], expectedCitation: /1926\.501/ },
  { name: 'scaffold guardrail missing', observation: 'Construction scaffold platform is missing toprail and midrail while employees work above the lower level.', siteType: 'construction', expectedDomain: 'scaffolds', expectedTerms: [/platform edge|fall/i, /competent person/i], expectedCitation: /1926\.451/ },
  { name: 'aerial lift ambiguity', observation: 'Boom lift harness and anchor status are unknown during elevated construction work.', siteType: 'construction', expectedDomain: 'fall_protection', expectedTerms: [/ejection/i, /manufacturer/i], expectedCitation: /1926\.453/, expectedConfidence: 'moderate' },
  { name: 'fall height unknown', observation: 'Possible roof edge fall hazard; height is unknown and employee approach distance was not measured.', siteType: 'construction', expectedDomain: 'fall_protection', expectedTerms: [/height.*incomplete|fall distance/i, /measured/i], expectedCitation: /1926\.501/, expectedConfidence: 'moderate' },
  { name: 'daisy chained strips', observation: 'Two power strips are daisy-chained to supply multiple tools in the warehouse.', siteType: 'warehouse', expectedDomain: 'electrical', expectedTerms: [/excessive current|heat/i, /load calculation|rating/i], expectedCitation: /1910\.305/ },
  { name: 'blocked electrical panel', observation: 'Pallets and boxes obstruct the electrical panel and disconnect in the plant.', siteType: 'plant', expectedDomain: 'electrical', expectedTerms: [/working space|clearance/i, /measured clearance/i], expectedCitation: /1910\.303/ },
  { name: 'exposed fan blade', observation: 'Exposed unguarded fan blade is within reach of a machine operator.', siteType: 'plant', expectedDomain: 'machine_guarding', expectedTerms: [/catch|draw in|cut/i, /fixed|interlocked/i], expectedCitation: /1910\.212/ },
  { name: 'exposed auger', observation: 'Exposed auger and screw conveyor are accessible during normal operation.', siteType: 'plant', expectedDomain: 'machine_guarding', expectedTerms: [/pinch|crush|amputation/i, /danger zone/i], expectedCitation: /1910\.212/ },
  { name: 'maintenance energy unknown', observation: 'Machine maintenance is underway; energy isolation status is unknown.', siteType: 'plant', expectedDomain: 'lockout_tagout', expectedTerms: [/not established|zero-energy/i, /energy sources/i], expectedCitation: /1910\.147/, expectedConfidence: 'moderate' },
  { name: 'construction backing alarm', observation: 'Dump truck backing with obstructed rear view; alarm and spotter are not verified.', siteType: 'construction', expectedDomain: 'mobile_equipment', expectedTerms: [/blind area|reverse/i, /spotter/i], expectedCitation: /1926\.601/ },
  { name: 'mine dump berm', observation: 'At an aggregate mine dump point, the berm is missing beside a steep drop-off.', siteType: 'mine', expectedDomain: 'powered_haulage', expectedTerms: [/overtravel|rollover/i, /berm height|equipment size/i], expectedCitation: /56\.9300/ },
  { name: 'unstable pallets', observation: 'Unstable pallets are leaning into a busy warehouse aisle.', siteType: 'warehouse', expectedDomain: 'material_handling', expectedTerms: [/topple|collapse/i, /load rating|stabilize/i], expectedCitation: /1910\.176/ },
  { name: 'suspended load over crew', observation: 'Construction crew is standing under a suspended crane load.', siteType: 'construction', expectedDomain: 'cranes_rigging_hoisting', expectedTerms: [/fall.*swing|dropped/i, /exclusion zone/i], expectedCitation: /1926\.1425/ },
  { name: 'leaking chemical drum', observation: 'Leaking chemical drum beside a floor drain in the maintenance shop.', siteType: 'shop', expectedDomain: 'hazardous_materials', expectedTerms: [/containment loss|release/i, /chemical identit|sds/i], expectedCitation: /1910\.1200/ },
  { name: 'incompatible storage', observation: 'Oxidizer and fuel are incompatible chemicals stored together in the warehouse.', siteType: 'warehouse', expectedDomain: 'hazardous_materials', expectedTerms: [/incompatible|reactiv/i, /segregat/i], expectedCitation: /1910\.1200|1910\.106/ },
  { name: 'blocked extinguisher', observation: 'Fire extinguisher is blocked by stored cartons in the facility.', siteType: 'facility', expectedDomain: 'fire_protection', expectedTerms: [/response.*delay|reach/i, /clear access/i], expectedCitation: /1910\.157/ },
  { name: 'oxygen fuel gas separation', observation: 'Oxygen and acetylene cylinders are stored together with no separation or barrier.', siteType: 'shop', expectedDomain: 'fire_protection', expectedTerms: [/accelerate ignition|fire growth/i, /measured separation/i], expectedCitation: /1910\.253/ },
  { name: 'combustible wood dust', observation: 'Combustible wood dust accumulation surrounds ignition-capable equipment in an enclosed shop.', siteType: 'shop', expectedDomain: 'fire_protection', expectedTerms: [/dust cloud|secondary/i, /explosibility|combustib/i], expectedCitation: /1910\.307/ },
  { name: 'blocked eyewash', observation: 'Emergency eyewash is blocked near a corrosive chemical transfer station.', siteType: 'plant', expectedDomain: 'emergency_response', expectedTerms: [/flushing|tissue/i, /activation|flow/i], expectedCitation: /1910\.151/ },
  { name: 'possible confined space', observation: 'Possible confined space in a tank; entry criteria, atmosphere, and permit-space hazards are unknown.', siteType: 'plant', expectedDomain: 'confined_space', expectedTerms: [/criteria.*incomplete|evaluation/i, /testing|rescue/i], expectedCitation: /1910\.146/, expectedConfidence: 'moderate' },
  { name: 'dust without sampling', observation: 'Concrete silica dust exposure during grinding with no sampling and unknown task duration.', siteType: 'construction', expectedDomain: 'health_respiratory', expectedTerms: [/composition|duration|exposure level/i, /sampling|objective data/i], expectedCitation: /1926\.1153/, expectedConfidence: 'moderate' },
  { name: 'welding fumes ventilation', observation: 'Welding fumes accumulating inside an enclosed fabrication area with poor ventilation.', siteType: 'fabrication', expectedDomain: 'industrial_hygiene', expectedTerms: [/breathing zone|accumulate/i, /local exhaust/i], expectedCitation: /1910\.252/ },
  { name: 'noise without measurements', observation: 'High noise exposure near production equipment has not been measured.', siteType: 'plant', expectedDomain: 'noise_exposure', expectedTerms: [/level.*duration|dose/i, /dosimetry/i], expectedCitation: /1910\.95/, expectedConfidence: 'moderate' },
  { name: 'heat stress', observation: 'Employees perform heavy work in a hot environment with possible heat stress.', siteType: 'plant', expectedDomain: 'health_exposure', expectedTerms: [/body temperature|acclimat/i, /work\/rest|hydration/i], expectedConfidence: 'moderate' },
  { name: 'grinding PPE gap', observation: 'Employee grinding metal without goggles or face shield.', siteType: 'shop', expectedDomain: 'ppe', expectedTerms: [/eyes|face/i, /hazard assessment/i], expectedCitation: /1910\.132/ },
  { name: 'trench no protection', observation: 'Employee inside a construction trench without shoring, sloping, shield, or trench box.', siteType: 'construction', expectedDomain: 'excavation_trenching', expectedTerms: [/cave-in|collapse/i, /soil|depth/i], expectedCitation: /1926\.652/ },
  { name: 'trench water and egress', observation: 'Construction trench has water accumulation and no ladder or egress for the crew.', siteType: 'construction', expectedDomain: 'excavation_trenching', expectedTerms: [/water|unable to exit/i, /egress/i], expectedCitation: /1926\.651/ },
  { name: 'damaged sling', observation: 'Damaged frayed sling has an illegible capacity tag before a construction lift.', siteType: 'construction', expectedDomain: 'cranes_rigging_hoisting', expectedTerms: [/release|shift the load/i, /load.*angle|capacity/i], expectedCitation: /1926\.251/ },
  { name: 'mine highwall', observation: 'At a quarry, highwall cracks and loose rock are above an active haul road.', siteType: 'mine', expectedDomain: 'ground_control', expectedTerms: [/release rock|fall.*zone/i, /weather|blasting/i], expectedCitation: /56\.3200/ },
  { name: 'mine damaged cable', observation: 'Damaged electrical cable with exposed jacket lies along an aggregate mine plant travelway.', siteType: 'mine', expectedDomain: 'electrical', expectedTerms: [/insulation|mechanical damage/i, /de-energize/i], expectedCitation: /56\.12004/ },
  { name: 'mobile equipment proximity unclear', observation: 'Loader mobile equipment is nearby workers in the stock area; proximity and traffic overlap are unclear.', siteType: 'plant', expectedDomain: 'mobile_equipment', expectedTerms: [/not established|actual.*depends/i, /distance|route overlap/i], expectedCitation: /1910\.178/, expectedConfidence: 'moderate' },
];

function humanFacingText(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): string {
  const intelligence = result.inspectionIntelligence;
  return JSON.stringify({
    hazards: intelligence.hazardCandidates,
    mechanism: intelligence.mechanismChain,
    standards: intelligence.candidateStandards,
    questions: intelligence.evidenceGapQuestions,
    actions: intelligence.correctiveActions,
  });
}

const forbiddenFinalLanguage = /\b(confirmed|final|definitive) violation\b|\bviolates?\b|\bfinal citation\b|\bnoncompliance\b/i;
const service = new SafeScopeReasoningOrchestratorService();
let failures = 0;

for (const scenario of scenarios) {
  const result = service.reason({ hazardObservation: scenario.observation, siteType: scenario.siteType });
  const intelligence = result.inspectionIntelligence;
  const text = humanFacingText(result);
  const candidate = intelligence.hazardCandidates.find((item) => item.domain === scenario.expectedDomain);
  const citations = intelligence.candidateStandards.map((standard) => standard.citation).join(' ');
  const tierCounts = Object.values(intelligence.correctiveActions).map((tier) => tier.length);
  const passed = Boolean(candidate)
    && (!scenario.expectedConfidence || candidate?.confidence === scenario.expectedConfidence)
    && scenario.expectedTerms.every((term) => term.test(text))
    && (!scenario.expectedCitation || scenario.expectedCitation.test(citations))
    && intelligence.mechanismChain.initiatingCondition.length > 0
    && intelligence.mechanismChain.releaseOrFailureMode.length > 0
    && intelligence.mechanismChain.exposurePathway.length > 0
    && intelligence.mechanismChain.consequences.length > 0
    && intelligence.evidenceGapQuestions.length >= 3
    && tierCounts.every((count) => count > 0)
    && intelligence.candidateStandards.every((standard) =>
      standard.status === 'candidate_standard'
      && standard.titleSummary.length > 0
      && standard.rationale.length > 0
      && standard.evidenceNeeded.length > 0
    )
    && !forbiddenFinalLanguage.test(text)
    && intelligence.guardrails.advisoryOnly
    && intelligence.guardrails.candidateStandardsOnly
    && intelligence.guardrails.doesNotDeclareViolation
    && intelligence.guardrails.requiresQualifiedReview;

  if (passed) console.log(`PASS ${scenario.name}`);
  else {
    failures += 1;
    console.error(`FAIL ${scenario.name}`, {
      candidates: intelligence.hazardCandidates,
      citations,
      questions: intelligence.evidenceGapQuestions,
      tierCounts,
      forbiddenLanguage: forbiddenFinalLanguage.test(text),
    });
  }
}

if (failures > 0) process.exit(1);
console.log(`Inspection intelligence expansion regression: ${scenarios.length} passed, 0 failed`);
