import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';
import { MineType } from '../inspection-intelligence/mine-context.types';

type Scenario = {
  name: string;
  observation: string;
  siteType?: string;
  expectedMineType: MineType;
  expectedDomain: SafeScopeReasoningDomain;
  expectedTerms: RegExp[];
  expectedCitation?: RegExp;
  forbiddenCitation?: RegExp;
  expectCitationLimitation?: boolean;
  variation?: true;
};

const scenarios: Scenario[] = [
  { name: 'aggregate tail pulley cleanup', observation: 'At a surface aggregate mine, the conveyor tail pulley guard is missing while miners shovel cleanup material.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'machine_guarding_loto', expectedTerms: [/nip point|caught-in/i, /block.*motion|restart/i], expectedCitation: /56\.14107|56\.14105/, forbiddenCitation: /57\.|75\.|29 CFR/ },
  { name: 'crusher drive belt exposed', observation: 'Crusher drive belt and pulley are exposed without a guard at the surface stone plant.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'machine_guarding', expectedTerms: [/crusher|moving component/i, /entanglement|amputation/i], expectedCitation: /56\.14107/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'conveyor stop cord unclear', observation: 'Aggregate plant conveyor emergency stop pull cord is inoperative and its coverage is not verified.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'machine_guarding', expectedTerms: [/stop.*control|unable to stop/i, /functional test|operability/i], expectedCitation: /56\.14100|56\.14201/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'conveyor walkway ambiguity', observation: 'Quarry walkway beside an unguarded conveyor has no railing and safe clearance is unknown.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'walking_working_surfaces', expectedTerms: [/walkway|clearance/i, /caught-in|fall path/i], expectedCitation: /56\.11009|56\.14109/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'travelway opening', observation: 'Open hole beside a surface mine travelway has no railing, barrier, or cover.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'fall_protection', expectedTerms: [/opening|drop-off/i, /fall-to-lower/i], expectedCitation: /56\.11012/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'screen deck ladder', observation: 'Damaged ladder with a loose rung provides access to the screen deck at an aggregate mine.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'ladders', expectedTerms: [/ladder|anchorage|rung/i, /fall injury/i], expectedCitation: /56\.11003|56\.11011/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'mine travelway housekeeping', observation: 'Rock spillage and debris create a trip hazard in the crusher plant travelway.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'walking_working_surfaces', expectedTerms: [/spillage|debris/i, /same-level fall/i], expectedCitation: /56\.20003/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'dump point berm', observation: 'Surface mine elevated dump point has a low inadequate berm for the haul trucks.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'powered_haulage', expectedTerms: [/overtravel|rollover/i, /berm.*equipment/i], expectedCitation: /56\.9300/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'forklift pedestrian interaction', observation: 'At a surface mine, a forklift and pedestrians share the same aisle with no traffic control or spotter in the congested area.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/forklift|pedestrian/i, /struck-by|run-over|traffic/i], expectedCitation: /56\.9100|56\.14132/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'forklift backup alarm failure', observation: 'At a surface mine, the forklift backup alarm is not working and the operator backs through a blind area.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/backup alarm|blind|reverse/i, /traffic|struck-by/i], expectedCitation: /56\.9100|56\.14132/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'damaged forklift defect', observation: 'At a surface mine, a damaged forklift has a leaking hydraulic line and worn tires but remains in service.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/damaged|leak|worn/i, /defect|remove from service/i], expectedCitation: /56\.14100/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'mobile equipment brake defect', observation: 'At a surface mine, a pre-op inspection found a mobile equipment brake defect and the unit should not be returned to service.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/defect|pre-operational/i, /remove from service|return to operation/i], expectedCitation: /56\.14100/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'haul truck backing pedestrian', observation: 'Haul truck backing near a miner on foot at the quarry with no verified alarm, spotter, or traffic control.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/blind|reverse zone/i, /run-over|struck-by/i], expectedCitation: /56\.9100|56\.14132/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'loader pickup blind corner', observation: 'Loader and pickup meet at a blind corner on an aggregate mine road with unclear right of way.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/blind spots|right-of-way/i, /collision/i], expectedCitation: /56\.9100/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'unattended loader parking', observation: 'Surface mine loader is unattended on a grade; parking brake and wheel chocking are not verified.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/unattended|rolling/i, /chock|parking brake/i], expectedCitation: /56\.14207/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'highwall loose material', observation: 'Loose fractured material on the quarry highwall is above an active work area.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'ground_control', expectedTerms: [/unstable rock|release material/i, /fall.*zone|runout/i], expectedCitation: /56\.3200/, forbiddenCitation: /57\.|75\.|29 CFR/ },
  { name: 'feed hopper engulfment', observation: 'Miner is clearing bridged material inside a feed hopper at the aggregate plant with engulfment exposure.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'material_handling', expectedTerms: [/bridged|cave or slide/i, /engulfment|suffocation/i], expectedCitation: /56\.16002/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'wet damaged trailing cable', observation: 'Damaged trailing cable with exposed insulation lies in standing water at an underground metal mine heading.', expectedMineType: 'underground_metal_nonmetal', expectedDomain: 'electrical', expectedTerms: [/wet|water|energizing/i, /de-energize/i], expectedCitation: /57\.12004/, forbiddenCitation: /56\.|75\.|29 CFR/ },
  { name: 'open mine plant electrical panel', observation: 'Open energized electrical panel with a missing cover plate at a surface aggregate mine plant.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'electrical', expectedTerms: [/energized parts|arc/i, /qualified mine electrician/i], expectedCitation: /56\.12032/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'used oil drainage release', observation: 'Used oil container is leaking beside a drainage ditch at a surface stone mine shop.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'environmental_release', expectedTerms: [/drainage|spread liquid/i, /spill response|containment/i], expectedCitation: /56\.4102/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'mine shop oxygen cylinder', observation: 'Oxygen cylinder is unsecured with no valve cap at the aggregate mine maintenance shop.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'compressed_gas', expectedTerms: [/release pressure|projectile/i, /secure|cap/i], expectedCitation: /56\.4601/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'mine shop hot work', observation: 'Welding hot work beside fuel and oily combustible material in a quarry maintenance shop.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'welding_cutting_hot_work', expectedTerms: [/sparks|ignition/i, /fire watch|extinguishing/i], expectedCitation: /56\.4600/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'crusher noise no monitoring', observation: 'Crusher and screen noise exposure at a surface aggregate mine has no monitoring or hearing conservation evidence.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'noise_exposure', expectedTerms: [/dose|duration/i, /dosimetry|hearing conservation/i], expectedCitation: /62\.110/, forbiddenCitation: /29 CFR/ },
  { name: 'drill silica dust', observation: 'Surface mine drilling and crushing produces visible silica dust with no sampling and unknown duration.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'health_respiratory', expectedTerms: [/respirable dust|silica/i, /wet method|monitoring/i], expectedCitation: /56\.5002|56\.5005/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'contractor training ambiguity', observation: 'Independent contractor service technician will repair a crusher at a surface aggregate mine; task training and site-specific hazard awareness are not verified.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'training_procedure_gap', expectedTerms: [/contractor|site knowledge/i, /person classification|training/i], expectedCitation: /46\.7|46\.11/, forbiddenCitation: /56\.|57\.|29 CFR/ },
  { name: 'underground loose rib', observation: 'Loose rib and unsupported back are above miners traveling in an underground metal/nonmetal heading.', expectedMineType: 'underground_metal_nonmetal', expectedDomain: 'ground_control', expectedTerms: [/roof|rib|back/i, /withdraw|barricade/i], expectedCitation: /57\.3200/, forbiddenCitation: /56\.|75\.|29 CFR/ },
  { name: 'underground diesel exhaust', observation: 'Diesel exhaust and stagnant airflow are reported in an underground metal mine heading without DPM monitoring.', expectedMineType: 'underground_metal_nonmetal', expectedDomain: 'ventilation', expectedTerms: [/diesel particulate|airflow/i, /dpm|monitoring/i], expectedCitation: /57\.8520|57\.5060|57\.5071/, forbiddenCitation: /56\.|75\.|29 CFR/ },
  { name: 'coal belt fire guarding ambiguity', observation: 'Underground coal mine belt conveyor has damaged rollers, coal dust accumulation, and guarding is not verified.', expectedMineType: 'underground_coal', expectedDomain: 'fire_protection', expectedTerms: [/belt slippage|hot bearings|fire/i, /smoke|escape/i], expectedCitation: /75\.1722|75\.1731/, forbiddenCitation: /56\.|57\.|29 CFR/ },
  { name: 'coal roof context', observation: 'Underground coal mine has a loose coal rib and unsupported roof along a travel area.', expectedMineType: 'underground_coal', expectedDomain: 'ground_control', expectedTerms: [/roof|rib/i, /ground-fall|crushing/i], expectedCitation: /75\.202/, forbiddenCitation: /56\.|57\.|29 CFR/ },
  { name: 'coal methane ventilation', observation: 'Methane buildup and damaged ventilation controls are reported at an underground coal mine face.', expectedMineType: 'underground_coal', expectedDomain: 'ventilation', expectedTerms: [/methane|airflow/i, /withdraw|gas/i], expectedCitation: /75\.333/, forbiddenCitation: /56\.|57\.|29 CFR/ },
  { name: 'surface coal traffic mapping limitation', observation: 'At a surface coal mine, a haul truck is backing near a miner on foot without verified traffic controls.', expectedMineType: 'surface_coal', expectedDomain: 'mobile_equipment', expectedTerms: [/backing|reverse zone/i, /traffic rules|separate/i], forbiddenCitation: /56\.|57\.|75\.|29 CFR/, expectCitationLimitation: true },
  { name: 'underground mnm escapeway', observation: 'Underground nonmetal mine escapeway to the refuge is obstructed and route availability is not verified.', expectedMineType: 'underground_metal_nonmetal', expectedDomain: 'emergency_preparedness', expectedTerms: [/escape|refuge/i, /entrapment|smoke/i], expectedCitation: /57\.11050|57\.11053/, forbiddenCitation: /56\.|75\.|29 CFR/ },
  { name: 'coal dust mapping limitation', observation: 'Respirable coal dust exposure at an underground coal mine has no sampling evidence.', expectedMineType: 'underground_coal', expectedDomain: 'industrial_hygiene', expectedTerms: [/coal-mine dust|sampling/i, /citation.*incomplete|coal-specific/i], forbiddenCitation: /56\.|57\.|29 CFR/, expectCitationLimitation: true },
  { name: 'coal permissibility limitation', observation: 'Electrical permissibility of equipment in an underground coal mine is not verified.', expectedMineType: 'underground_coal', expectedDomain: 'industrial_hygiene', expectedTerms: [/permissibility|ignition/i, /approval plate|qualified/i], forbiddenCitation: /56\.|57\.|29 CFR/, expectCitationLimitation: true },
  { name: 'unclear mine contractor', observation: 'Contractor at a mine will perform equipment maintenance; mine type and task training are not verified.', expectedMineType: 'unclear_mine', expectedDomain: 'training_procedure_gap', expectedTerms: [/surface metal\/nonmetal|underground coal/i, /mine type is unclear/i], forbiddenCitation: /29 CFR|30 CFR (46|48|56|57|75|77)/, expectCitationLimitation: true },
  { name: 'mine blasting safety boundary', observation: 'Contractor entered a mine blast area; authorization and exclusion status are unclear.', expectedMineType: 'unclear_mine', expectedDomain: 'training_procedure_gap', expectedTerms: [/authorized blasting|no operational blasting/i, /keep.*unauthorized/i], forbiddenCitation: /29 CFR|30 CFR (56|57|75|77)/, expectCitationLimitation: true },

  { name: 'variation tail drum shoveling', variation: true, observation: 'At a gravel pit, a miner is shoveling beside an unshielded tail drum while the belt can move.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'machine_guarding_loto', expectedTerms: [/conveyor|caught-in/i, /disconnect power/i], expectedCitation: /56\.14107|56\.14105/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'variation screen sheave', variation: true, observation: 'Surface stone screen plant has an exposed drive sheave with no barrier within reach of the attendant.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'machine_guarding', expectedTerms: [/screen drive|moving component/i, /entanglement/i], expectedCitation: /56\.14107/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'variation pull cable', variation: true, observation: 'Quarry belt line pull cable is not working and miners travel beside the conveyor.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'machine_guarding', expectedTerms: [/stop|belt motion/i, /functional/i], expectedCitation: /56\.14100|56\.14201/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'variation catwalk belt', variation: true, observation: 'Aggregate crusher catwalk runs next to the belt flight without railing; clearance has not been verified.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'walking_working_surfaces', expectedTerms: [/clearance|safe access/i, /caught-in|fall/i], expectedCitation: /56\.11009|56\.14109/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'variation ladder rung', variation: true, observation: 'Screening plant service ladder has a broken rung and unstable footing.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'ladders', expectedTerms: [/rung|footing/i, /remove.*service/i], expectedCitation: /56\.11003|56\.11011/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'variation windrow edge', variation: true, observation: 'Open-pit mine haul road windrow is too low beside a drop-off.', expectedMineType: 'surface_metal_nonmetal', expectedDomain: 'powered_haulage', expectedTerms: [/overtravel|edge/i, /equipment size/i], expectedCitation: /56\.9300/, forbiddenCitation: /57\.|29 CFR/ },
  { name: 'variation LHD reverse', variation: true, observation: 'Underground hard rock mine LHD is reversing near miners on foot with alarm status unknown.', expectedMineType: 'underground_metal_nonmetal', expectedDomain: 'mobile_equipment', expectedTerms: [/reverse|blind/i, /run-over/i], expectedCitation: /57\.9100|57\.14132/, forbiddenCitation: /56\.|75\.|29 CFR/ },
  { name: 'variation underground cable', variation: true, observation: 'In a damp underground ore-mine drift, a power conductor has a crushed jacket from mobile traffic.', expectedMineType: 'underground_metal_nonmetal', expectedDomain: 'electrical', expectedTerms: [/mechanical|insulation/i, /routing|protection/i], expectedCitation: /57\.12004/, forbiddenCitation: /56\.|75\.|29 CFR/ },
];

function humanText(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): string {
  const intelligence = result.inspectionIntelligence;
  return JSON.stringify({
    miningContext: intelligence.miningContext,
    hazards: intelligence.hazardCandidates,
    mechanism: intelligence.mechanismChain,
    standards: intelligence.candidateStandards,
    questions: intelligence.evidenceGapQuestions,
    actions: intelligence.correctiveActions,
  });
}

const forbiddenFinalLanguage = /\b(confirmed|final|definitive) (msha )?violation\b|\bviolates?\b|\bfinal citation\b|\bnoncompliance\b/i;
const prohibitedBlastingInstructions = /\b(connect|wire|load|prime|stem|initiate|fire) (the )?(detonator|charge|blast|hole)\b/i;
const service = new SafeScopeReasoningOrchestratorService();
let failures = 0;

for (const scenario of scenarios) {
  const result = service.reason({ hazardObservation: scenario.observation, siteType: scenario.siteType });
  const intelligence = result.inspectionIntelligence;
  const text = humanText(result);
  const domains = intelligence.hazardCandidates.map((candidate) => candidate.domain);
  const citations = intelligence.candidateStandards.map((standard) => standard.citation).join(' ');
  const tierCounts = Object.values(intelligence.correctiveActions).map((tier) => tier.length);
  const passed = result.jurisdictionAssessment.likelyJurisdiction === 'msha'
    && intelligence.miningContext.detected
    && intelligence.miningContext.mineType === scenario.expectedMineType
    && domains.includes(scenario.expectedDomain)
    && scenario.expectedTerms.every((term) => term.test(text))
    && (!scenario.expectedCitation || scenario.expectedCitation.test(citations))
    && (!scenario.forbiddenCitation || !scenario.forbiddenCitation.test(citations))
    && (!scenario.expectCitationLimitation || intelligence.miningContext.citationLimitations.length > 0)
    && intelligence.mechanismChain.initiatingCondition.length > 0
    && intelligence.mechanismChain.releaseOrFailureMode.length > 0
    && intelligence.mechanismChain.exposurePathway.length > 0
    && intelligence.mechanismChain.consequences.length > 0
    && intelligence.evidenceGapQuestions.length >= 3
    && tierCounts.every((count) => count > 0)
    && intelligence.candidateStandards.every((standard) =>
      standard.jurisdiction === 'msha'
      && standard.status === 'candidate_standard'
      && standard.titleSummary.length > 0
      && standard.rationale.length > 0
      && standard.evidenceNeeded.length > 0
    )
    && !forbiddenFinalLanguage.test(text)
    && !prohibitedBlastingInstructions.test(text)
    && intelligence.guardrails.advisoryOnly
    && intelligence.guardrails.candidateStandardsOnly
    && intelligence.guardrails.doesNotDeclareViolation
    && intelligence.guardrails.requiresQualifiedReview;

  if (passed) console.log(`PASS ${scenario.variation ? '[variation] ' : ''}${scenario.name}`);
  else {
    failures += 1;
    console.error(`FAIL ${scenario.name}`, {
      jurisdiction: result.jurisdictionAssessment,
      miningContext: intelligence.miningContext,
      hazards: intelligence.hazardCandidates,
      citations,
      questions: intelligence.evidenceGapQuestions,
      tierCounts,
    });
  }
}

if (failures > 0) process.exit(1);
const variations = scenarios.filter((scenario) => scenario.variation).length;
console.log(`MSHA inspection intelligence regression: ${scenarios.length} passed, 0 failed (${variations} wording variations)`);
