import { InspectionCitationRecoveryService } from '../inspection-intelligence/inspection-citation-recovery.service';
import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';

const reasoning = new SafeScopeReasoningOrchestratorService();
const recovery = new InspectionCitationRecoveryService();
const prohibited = /violation confirmed|citation issued|\bnoncompliant\b|definite violation|must cite/i;
let failures = 0;

function inspect(observation: string, siteType?: string) {
  const result = reasoning.reason({ hazardObservation: observation, siteType });
  const scopes = result.jurisdictionAssessment.likelyJurisdiction === 'msha'
    ? [siteType?.includes('underground') ? 'msha_mnm_underground' : 'msha_mnm_surface']
    : result.jurisdictionAssessment.likelyJurisdiction === 'osha_construction'
      ? ['osha_construction']
      : result.jurisdictionAssessment.likelyJurisdiction === 'osha_general_industry'
        ? ['osha_general']
        : ['all'];
  const recovered = recovery.recover({
    suggestedStandards: [],
    excludedStandards: [],
    inspectionIntelligence: result.inspectionIntelligence,
    scopes,
  });
  return { result, recovered };
}

function safeText(value: unknown): boolean {
  return !prohibited.test(JSON.stringify(value));
}

const sufficientCases = [
  ['mine conveyor guard', 'Aggregate mine conveyor tail pulley is missing its guard during cleanup.', 'surface aggregate mine', /30 CFR 56\./],
  ['open breaker slot', 'Open breaker slot exposes energized parts accessible to employees.', 'manufacturing plant', /1910\./],
  ['wet construction cord', 'Damaged extension cord is energized in a wet construction area.', 'construction site', /1926\./],
  ['unlabeled shop chemical', 'Unlabeled chemical container is in use in the maintenance shop.', 'industrial shop', /1910\./],
  ['used oil drain', 'Open used-oil container is leaking near a floor drain in the plant.', 'manufacturing plant', /1910\./],
  ['forklift pedestrians', 'Forklift operates near pedestrians without separation in the warehouse aisle.', 'warehouse', /1910\./],
  ['blocked exit', 'Emergency exit is blocked by stored pallets and employees use the route.', 'warehouse', /1910\./],
  ['unguarded platform', 'Employee works on an elevated platform without guardrail or fall arrest.', 'manufacturing plant', /1910\./],
  ['rotating shaft', 'Rotating shaft is exposed within reach because the machine guard is missing.', 'manufacturing plant', /1910\./],
  ['hot work combustibles', 'Hot work is underway near combustible material without fire watch evidence.', 'industrial shop', /1910\./],
  ['mine berm', 'Berm is missing at an elevated dump point used by haul trucks at the aggregate mine.', 'surface aggregate mine', /30 CFR 56\./],
  ['mine wet cable', 'Damaged trailing electrical cable lies in water at the surface aggregate mine.', 'surface aggregate mine', /30 CFR 56\./],
  ['crusher silica', 'Miners are exposed to crusher dust with silica concern and no sampling evidence.', 'surface aggregate mine', /30 CFR/],
  ['crusher noise', 'Crusher operators have high noise exposure without monitoring or hearing conservation evidence.', 'surface aggregate mine', /30 CFR/],
  ['damaged ladder in use', 'Employee is still using a damaged ladder with a broken rung.', 'manufacturing plant', /1910\./],
] as const;

for (const [name, observation, siteType, citationPattern] of sufficientCases) {
  const { result, recovered } = inspect(observation, siteType);
  const standards = recovered.suggestedStandards;
  const passed = result.inspectionIntelligence.conditionAssessment.citationEligible
    && standards.length > 0
    && standards.every((standard) => standard.status === 'candidate_standard' || standard.candidateStatus === 'candidate_standard')
    && standards.some((standard) => citationPattern.test(standard.citation))
    && recovered.decision.outcome === 'recovered_candidates'
    && result.inspectionIntelligence.guardrails.advisoryOnly
    && safeText({ result, recovered });
  if (passed) console.log(`PASS [sufficient] ${name}`);
  else { failures += 1; console.error(`FAIL [sufficient] ${name}`, { assessment: result.inspectionIntelligence.conditionAssessment, jurisdiction: result.jurisdictionAssessment, candidates: result.inspectionIntelligence.candidateStandards, recovered }); }
}

const mixedCases = [
  ['guarded conveyor and debris', 'Conveyor tail pulley is fully guarded, but debris creates a trip hazard in the nearby travelway.', 'manufacturing plant', 'walking_working_surfaces', 'machine_guarding'],
  ['secured cylinder and unlabeled chemical', 'Oxygen cylinder is secured upright with valve cap installed, but a nearby chemical container is unlabeled.', 'industrial shop', 'hazard_communication', 'compressed_gas'],
  ['clear exit and blocked extinguisher', 'Emergency exit is clear and unobstructed, but stored boxes block the fire extinguisher.', 'warehouse', 'fire_protection', 'emergency_preparedness'],
  ['locked machine and trip hazard', 'Machine is locked out with zero energy verified, but the removed guard is stored across the walkway creating a trip hazard.', 'manufacturing plant', 'slip_trip_fall', 'machine_guarding_loto'],
  ['separated forklift and blind corner', 'Forklift route is separated from pedestrians by barriers, but the blind corner has no warning sign or traffic control.', 'warehouse', 'traffic_control', 'mobile_equipment'],
] as const;

for (const [name, observation, siteType, activeDomain, controlledDomain] of mixedCases) {
  const { result, recovered } = inspect(observation, siteType);
  const domains = result.inspectionIntelligence.hazardCandidates.map((candidate) => candidate.domain);
  const passed = result.inspectionIntelligence.conditionAssessment.status === 'uncontrolled'
    && result.inspectionIntelligence.conditionAssessment.controlledDomains.includes(controlledDomain as any)
    && domains.includes(activeDomain as any)
    && !domains.includes(controlledDomain as any)
    && recovered.suggestedStandards.length > 0
    && safeText({ result, recovered });
  if (passed) console.log(`PASS [domain suppression] ${name}`);
  else { failures += 1; console.error(`FAIL [domain suppression] ${name}`, { assessment: result.inspectionIntelligence.conditionAssessment, domains, recovered }); }
}

const jurisdictionCases = [
  ['shaft unclear', 'Exposed rotating shaft is within employee reach; workplace type is not stated.', /1910|1926/],
  ['cord unclear', 'Damaged extension cord has exposed insulation and remains in use; construction versus facility context is unknown.', /1910|1926/],
  ['fall unclear', 'Employee is exposed at an unguarded elevated edge; platform, scaffold, or roof context is unclear.', /1910|1926/],
  ['chemical unclear', 'Unlabeled chemical container is open in a work area; mine versus non-mine jurisdiction is not established.', /1910|1926|30 CFR/],
  ['conveyor unclear', 'Conveyor nip point is exposed during cleanup; mine versus manufacturing context is not established.', /1910|1926|30 CFR/],
] as const;

for (const [name, observation, citationPattern] of jurisdictionCases) {
  const { result, recovered } = inspect(observation);
  const citations = recovered.suggestedStandards.map((standard) => standard.citation).join(' ');
  const passed = recovered.suggestedStandards.length > 0
    && citationPattern.test(citations)
    && result.inspectionIntelligence.evidenceGapQuestions.some((question) => /site type|jurisdiction|applies/i.test(question))
    && safeText({ result, recovered });
  if (passed) console.log(`PASS [jurisdiction] ${name}`);
  else { failures += 1; console.error(`FAIL [jurisdiction] ${name}`, { jurisdiction: result.jurisdictionAssessment, assessment: result.inspectionIntelligence.conditionAssessment, candidates: result.inspectionIntelligence.candidateStandards, recovered }); }
}

const vagueCases = [
  'possible electrical issue',
  'maybe a fall hazard',
  'chemical container observed',
  'dust in the area',
  'mobile equipment nearby',
  'training concern',
  'mine site issue',
  'maintenance ongoing',
  'noise concern',
  'hot work discussed',
] as const;

for (const observation of vagueCases) {
  const { result, recovered } = inspect(observation);
  const passed = result.inspectionIntelligence.conditionAssessment.status === 'insufficient_evidence'
    && result.inspectionIntelligence.candidateStandards.length === 0
    && recovered.suggestedStandards.length === 0
    && recovered.decision.outcome === 'insufficient_evidence'
    && recovered.decision.evidenceNeeded.length > 0
    && result.primaryCitation === undefined
    && safeText({ result, recovered });
  if (passed) console.log(`PASS [insufficient] ${observation}`);
  else { failures += 1; console.error(`FAIL [insufficient] ${observation}`, { assessment: result.inspectionIntelligence.conditionAssessment, primaryCitation: result.primaryCitation, recovered }); }
}

{
  const { result } = inspect('Emergency exit is blocked by stored material.', 'warehouse');
  const recovered = recovery.recover({ suggestedStandards: [], excludedStandards: [], inspectionIntelligence: result.inspectionIntelligence, scopes: ['osha_general'] });
  const apiShape = { suggestedStandards: recovered.suggestedStandards, inspectionIntelligence: result.inspectionIntelligence };
  const passed = apiShape.suggestedStandards.length > 0
    && apiShape.inspectionIntelligence.candidateStandards.length > 0
    && apiShape.suggestedStandards[0].citation === apiShape.inspectionIntelligence.candidateStandards[0].citation;
  if (passed) console.log('PASS [shape] legacy suggestedStandards exposes inspection candidate');
  else { failures += 1; console.error('FAIL [shape] compatibility shape', apiShape); }
}

{
  const { result } = inspect('Open breaker slot exposes energized parts.', 'manufacturing plant');
  const recovered = recovery.recover({
    suggestedStandards: [],
    excludedStandards: [{ citation: '29 CFR 1926.403(i)(2)(i)', candidateStatus: 'needs_more_evidence', exclusionReason: 'Construction jurisdiction not established.' }],
    inspectionIntelligence: result.inspectionIntelligence,
    scopes: ['osha_general'],
  });
  const passed = recovered.suggestedStandards.length > 0
    && recovered.excludedStandards.length === 1
    && recovered.suggestedStandards[0].citation !== recovered.excludedStandards[0].citation;
  if (passed) console.log('PASS [coexistence] valid suggestion and separate exclusion coexist');
  else { failures += 1; console.error('FAIL [coexistence]', recovered); }
}

{
  const { result } = inspect('possible electrical issue');
  const recovered = recovery.recover({
    suggestedStandards: [{ citation: '29 CFR 1910.303', candidateStatus: 'candidate_standard' }],
    excludedStandards: [],
    inspectionIntelligence: result.inspectionIntelligence,
    scopes: ['all'],
  });
  const passed = recovered.suggestedStandards.length === 0
    && recovered.excludedStandards.length === 1
    && recovered.excludedStandards[0].candidateStatus === 'needs_more_evidence';
  if (passed) console.log('PASS [suppression] insufficient evidence suppresses legacy candidate');
  else { failures += 1; console.error('FAIL [suppression]', recovered); }
}

if (failures > 0) process.exit(1);
console.log(`Inspection intelligence citation recovery regression: ${sufficientCases.length + mixedCases.length + jurisdictionCases.length + vagueCases.length + 3} passed, 0 failed`);
