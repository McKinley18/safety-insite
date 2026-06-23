import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

type Scenario = {
  name: string;
  observation: string;
  siteType?: string;
  expectedDomains: SafeScopeReasoningDomain[];
  expectedCitations: RegExp[];
  forbiddenCitations?: RegExp[];
  mechanismKeywords: RegExp[];
  consequenceKeywords: RegExp[];
  evidenceKeywords: RegExp[];
  controlKeywords: RegExp[];
};

function textOf(value: unknown): string {
  return JSON.stringify(value || {});
}

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function hasAnyDomain(domains: SafeScopeReasoningDomain[], expected: SafeScopeReasoningDomain[]): boolean {
  return expected.some((domain) => domains.includes(domain));
}

const scenarios: Scenario[] = [
  {
    name: 'Open used-oil container near walkway',
    observation: 'An open container of used oil is sitting on the shop floor near a pedestrian walkway.',
    siteType: 'shop',
    expectedDomains: ['hazardous_materials', 'walking_working_surfaces'],
    expectedCitations: [/1910\.22|1910\.1200/],
    forbiddenCitations: [/1910\.101/, /1926\.350/],
    mechanismKeywords: [/spill|release/i, /walkway|pedestrian/i],
    consequenceKeywords: [/slip|fall|environment/i],
    evidenceKeywords: [/label/i, /secondary containment/i, /drain/i, /lid|closure/i],
    controlKeywords: [/close/i, /containment/i, /move/i, /clean/i],
  },
  {
    name: 'Leaking bucket or drum',
    observation: 'A five-gallon bucket containing oily waste is leaking onto the floor near the maintenance area.',
    siteType: 'maintenance shop',
    expectedDomains: ['hazardous_materials', 'walking_working_surfaces'],
    expectedCitations: [/1910\.22|1910\.1200/],
    forbiddenCitations: [/1910\.101/, /1926\.350/],
    mechanismKeywords: [/leak|release/i, /floor/i],
    consequenceKeywords: [/slip|fall|environment/i],
    evidenceKeywords: [/contents|sds|label|drain|oil/i],
    controlKeywords: [/transfer/i, /secondary containment/i, /clean/i],
  },
  {
    name: 'Debris in walkway',
    observation: 'Scrap material and hoses are lying across a designated pedestrian walkway.',
    siteType: 'warehouse',
    expectedDomains: ['walking_working_surfaces'],
    expectedCitations: [/1910\.22|1926\.25/],
    forbiddenCitations: [/1910\.101/],
    mechanismKeywords: [/trip|entangl/i, /walkway|pedestrian/i],
    consequenceKeywords: [/fall|sprain|strain/i],
    evidenceKeywords: [/designation|lighting|traffic|alternate route/i],
    controlKeywords: [/remove/i, /reroute/i, /clear walkway/i],
  },
  {
    name: 'Unsecured compressed gas cylinder near traffic',
    observation: 'An oxygen cylinder is standing unsecured near a shop aisle where mobile equipment passes.',
    siteType: 'shop',
    expectedDomains: ['compressed_gas', 'mobile_equipment'],
    expectedCitations: [/1910\.101|1926\.350/],
    mechanismKeywords: [/tip|valve|projectile|gas release/i],
    consequenceKeywords: [/strike|fire|impact/i],
    evidenceKeywords: [/cap/i, /chain|strap/i, /regulator/i, /fuel gas/i],
    controlKeywords: [/secure/i, /upright/i, /move/i, /segregat/i],
  },
  {
    name: 'Missing cylinder valve protection cap',
    observation: 'Acetylene cylinders are stored upright but several are missing valve protection caps.',
    siteType: 'shop',
    expectedDomains: ['compressed_gas', 'fire_protection'],
    expectedCitations: [/1910\.101|1910\.253|1926\.350/],
    mechanismKeywords: [/valve/i, /release|projectile/i],
    consequenceKeywords: [/fire|explosion|projectile/i],
    evidenceKeywords: [/cylinder/i, /oxygen/i, /regulator/i, /secured/i],
    controlKeywords: [/cap/i, /secure/i, /separate/i, /remove regulators/i],
  },
  {
    name: 'Open breaker slot / missing panel cover',
    observation: 'In the maintenance shop, an electrical panel has an open breaker slot and missing cover plate.',
    siteType: 'maintenance shop',
    expectedDomains: ['electrical'],
    expectedCitations: [/1910\.303\(g\)\(2\)\(i\)|1926\.403\(i\)\(2\)\(i\)|56\.12032/],
    mechanismKeywords: [/energized|live/i, /arc/i, /contact/i],
    consequenceKeywords: [/shock|burn|arc flash/i],
    evidenceKeywords: [/energized/i, /qualified/i, /temporary cover/i, /voltage/i],
    controlKeywords: [/restrict access/i, /de-energize/i, /cover/i, /qualified/i],
  },
  {
    name: 'Damaged cord in wet area',
    observation: 'A portable grinder has a damaged power cord lying on a damp floor.',
    siteType: 'shop',
    expectedDomains: ['electrical', 'walking_working_surfaces'],
    expectedCitations: [/1910\.334|1910\.305|1926\.404|1926\.405/],
    mechanismKeywords: [/shock|leakage|ground fault/i, /wet|damp/i],
    consequenceKeywords: [/shock|electrocution|burn/i],
    evidenceKeywords: [/gfci/i, /remove from service/i, /cord damage/i],
    controlKeywords: [/replace/i, /remove from service/i, /gfc/i, /dry/i],
  },
  {
    name: 'Conveyor tail pulley missing guard during cleanup',
    observation: 'At an aggregate plant, the conveyor tail pulley is missing a guard and miners clean spilled material near the moving belt.',
    siteType: 'surface aggregate mine',
    expectedDomains: ['machine_guarding_loto', 'machine_guarding'],
    expectedCitations: [/56\.14107|56\.12016|1910\.212|1910\.147/],
    mechanismKeywords: [/nip|caught|entangl/i, /cleanup/i],
    consequenceKeywords: [/amputation|crushing|fatal/i],
    evidenceKeywords: [/loto/i, /startup/i, /zero energy/i, /cleanup/i],
    controlKeywords: [/lock out/i, /guard/i, /restrict access/i, /cleanup source/i],
  },
  {
    name: 'Rotating shaft missing guard',
    observation: 'A rotating shaft on a shop machine is exposed at waist height with employees working next to it.',
    siteType: 'warehouse',
    expectedDomains: ['machine_guarding', 'machine_guarding_loto'],
    expectedCitations: [/1910\.219|1910\.212|56\.14107/],
    mechanismKeywords: [/entangl|caught in/i, /rotating shaft/i],
    consequenceKeywords: [/amputation|crushing|fatal/i],
    evidenceKeywords: [/guard/i, /rotating/i, /task|cleanup|lockout/i],
    controlKeywords: [/install/i, /stop/i, /lockout/i, /restrict access/i],
  },
  {
    name: 'Unstable stacked material near work area',
    observation: 'Palletized material is stacked unevenly and leaning toward a work area.',
    siteType: 'warehouse',
    expectedDomains: ['material_handling', 'walking_working_surfaces'],
    expectedCitations: [/1910\.176|56\.16001/],
    mechanismKeywords: [/collapse|topple|fall/i, /stack/i],
    consequenceKeywords: [/struck-by|crush|pinned/i],
    evidenceKeywords: [/stack height|weight|pallet|load rating/i],
    controlKeywords: [/restack/i, /barricade/i, /secure/i, /lower/i],
  },
];

function runScenario(scenario: Scenario) {
  const service = new SafeScopeReasoningOrchestratorService();
  const result = service.reason({
    hazardObservation: scenario.observation,
    siteType: scenario.siteType,
  });

  const intelligence = result.inspectionIntelligence;
  const mechanism = intelligence.mechanismOfInjury;
  const mechanismText = textOf(mechanism);
  const chainText = textOf(intelligence.mechanismChain);
  const combinedText = `${textOf(intelligence)} ${textOf(result)}`;
  const domains = intelligence.hazardCandidates.map((candidate) => candidate.domain);
  const citations = intelligence.candidateStandards.map((standard) => standard.citation);

  const pass =
    hasAnyDomain(domains, scenario.expectedDomains) &&
    scenario.expectedCitations.some((pattern) => citations.some((citation) => pattern.test(citation))) &&
    (!scenario.forbiddenCitations || scenario.forbiddenCitations.every((pattern) => citations.every((citation) => !pattern.test(citation)))) &&
    includesAny(mechanismText, scenario.mechanismKeywords) &&
    includesAny(mechanismText, scenario.consequenceKeywords) &&
    includesAny(mechanismText, scenario.evidenceKeywords) &&
    includesAny(mechanismText, scenario.controlKeywords) &&
    includesAny(chainText, scenario.mechanismKeywords) &&
    intelligence.mechanismChain.initiatingCondition.length > 0 &&
    intelligence.mechanismChain.releaseOrFailureMode.length > 0 &&
    intelligence.mechanismChain.exposurePathway.length > 0 &&
    intelligence.mechanismChain.consequences.length > 0 &&
    intelligence.mechanismChain.evidenceGaps.length > 0 &&
    intelligence.evidenceGapQuestions.length >= 3 &&
    Object.values(intelligence.correctiveActions).every((tier) => tier.length > 0) &&
    intelligence.candidateStandards.length > 0 &&
    intelligence.candidateStandards.every((standard) => standard.status === 'candidate_standard') &&
    intelligence.guardrails.advisoryOnly &&
    intelligence.guardrails.candidateStandardsOnly &&
    intelligence.guardrails.doesNotDeclareViolation &&
    result.conclusionBoundary.doesNotDeclareViolation &&
    !/\b(violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i.test(combinedText);

  if (!pass) {
    console.error(`FAIL ${scenario.name}`, {
      domains,
      citations,
      mechanism: intelligence.mechanismOfInjury,
      chain: intelligence.mechanismChain,
      evidenceGapQuestions: intelligence.evidenceGapQuestions,
      correctiveActions: intelligence.correctiveActions,
      guardrails: intelligence.guardrails,
    });
  } else {
    console.log(`PASS ${scenario.name}`);
  }

  return pass;
}

let failures = 0;
for (const scenario of scenarios) {
  if (!runScenario(scenario)) failures += 1;
}

if (failures > 0) {
  process.exit(1);
}

console.log(`HazLenz mechanism-chain hardening: ${scenarios.length} passed, 0 failed`);
