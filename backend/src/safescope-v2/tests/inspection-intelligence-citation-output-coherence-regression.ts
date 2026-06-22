import { InspectionCitationRecoveryService } from '../inspection-intelligence/inspection-citation-recovery.service';
import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SourceBackedApplicabilityGovernanceService } from '../source-backed-applicability-governance/sbag.service';

const reasoning = new SafeScopeReasoningOrchestratorService();
const recovery = new InspectionCitationRecoveryService();
const governance = new SourceBackedApplicabilityGovernanceService();
const prohibited = /violation confirmed|citation issued|\bnoncompliant\b|definite violation|must cite/i;
let failures = 0;

const broadElectrical = [
  { citation: '29 CFR 1910.306', title: 'Specific purpose equipment', score: 420, candidateStatus: 'active' },
  { citation: '29 CFR 1910.331', title: 'Scope of electrical safety-related work practices', score: 400, candidateStatus: 'active' },
  { citation: '29 CFR 1910.301', title: 'Introduction and scope', score: 390, candidateStatus: 'active' },
  { citation: '29 CFR 1910.132', title: 'General PPE requirements', score: 370, candidateStatus: 'active' },
  { citation: '29 CFR 1910.252', title: 'Welding and cutting', score: 350, candidateStatus: 'active' },
  { citation: '29 CFR 1910.101', title: 'Compressed gases', score: 340, candidateStatus: 'active' },
];

function scopesFor(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): string[] {
  const jurisdiction = result.jurisdictionAssessment.likelyJurisdiction;
  if (jurisdiction === 'osha_general_industry') return ['osha_general'];
  if (jurisdiction === 'osha_construction') return ['osha_construction'];
  if (jurisdiction === 'msha') {
    const mineType = result.inspectionIntelligence.miningContext.mineType;
    if (mineType === 'underground_metal_nonmetal') return ['msha_mnm_underground'];
    if (mineType === 'surface_coal') return ['msha_coal_surface'];
    if (mineType === 'underground_coal') return ['msha_coal_underground'];
    return ['msha_mnm_surface'];
  }
  return ['all'];
}

function inspect(observation: string, siteType?: string, legacy = broadElectrical, priorExcluded: any[] = []) {
  const result = reasoning.reason({ hazardObservation: observation, siteType });
  const output = recovery.recover({
    observation,
    suggestedStandards: legacy,
    excludedStandards: priorExcluded,
    inspectionIntelligence: result.inspectionIntelligence,
    scopes: scopesFor(result),
  });
  return { result, output };
}

function pass(name: string, condition: boolean, details?: unknown) {
  if (condition) console.log(`PASS ${name}`);
  else { failures += 1; console.error(`FAIL ${name}`, details); }
}

const breakerObservation = 'Open breaker slot and missing panel cover expose energized parts in a warehouse.';
const breaker = inspect(breakerObservation, 'warehouse');
const breakerSuggested = breaker.output.suggestedStandards.map((standard) => standard.citation);
const breakerSupporting = breaker.output.supportingStandards.map((standard) => standard.citation);
const breakerExcluded = breaker.output.excludedStandards.map((standard) => standard.citation);

pass('breaker direct candidate only front-facing', breakerSuggested.length === 1 && /1910\.303\(g\)\(2\)\(i\)/.test(breakerSuggested[0]), breaker.output);
pass('breaker specific-purpose candidate excluded', !breakerSuggested.includes('29 CFR 1910.306') && breakerExcluded.includes('29 CFR 1910.306'), breaker.output);
pass('breaker broad scope candidates supporting', !breakerSuggested.some((citation) => /1910\.(301|331)/.test(citation)) && /1910\.301/.test(breakerSupporting.join(' ')) && /1910\.331/.test(breakerSupporting.join(' ')), breaker.output);
pass('breaker advisory guardrails', breaker.result.inspectionIntelligence.guardrails.advisoryOnly && breaker.result.inspectionIntelligence.guardrails.candidateStandardsOnly && !prohibited.test(JSON.stringify(breaker)), breaker);
pass('breaker recovered metadata title', /guarding\/access to live parts/i.test(breaker.output.suggestedStandards[0]?.title || '') && /confirm exact subsection text/i.test(breaker.output.suggestedStandards[0]?.summary || ''), breaker.output.suggestedStandards[0]);

const specialPurpose = inspect('Open energized control enclosure on an overhead crane has missing covers at a warehouse.', 'warehouse');
pass('specific-purpose electrical remains separate context', !specialPurpose.output.suggestedStandards.some((standard) => standard.citation === '29 CFR 1910.306') && specialPurpose.output.supportingStandards.some((standard) => standard.citation === '29 CFR 1910.306'), specialPurpose.output);

const electricalPpe = inspect('Employee tests exposed energized panel parts without required electrical protective gloves or face protection.', 'warehouse');
pass('observed electrical PPE remains eligible context', [...electricalPpe.output.suggestedStandards, ...electricalPpe.output.supportingStandards].some((standard) => /1910\.13/.test(standard.citation)) && !electricalPpe.output.excludedStandards.some((standard) => /1910\.13/.test(standard.citation)), electricalPpe.output);

const blockedPanel = inspect('Pallets and stored boxes block working space and access to an electrical panel.', 'warehouse');
pass('blocked panel direct working-space candidate', /1910\.303\(g\)\(1\)/.test(blockedPanel.output.suggestedStandards[0]?.citation || '') && !blockedPanel.output.suggestedStandards.some((standard) => /1910\.13|1910\.33/.test(standard.citation)), blockedPanel.output);

const cord = inspect('Damaged flexible extension cord with exposed insulation remains energized in a wet warehouse area.', 'warehouse');
pass('cord direct candidates only', cord.output.suggestedStandards.length > 0 && cord.output.suggestedStandards.every((standard) => /1910\.(305|334)/.test(standard.citation)) && !cord.output.suggestedStandards.some((standard) => /1910\.(301|331)/.test(standard.citation)), cord.output);

const controlled = inspect('Electrical panel cover is intact and secured with no exposed energized parts.', 'warehouse');
pass('controlled electrical has no active suggestion', controlled.output.suggestedStandards.length === 0 && controlled.output.needsMoreEvidenceStandards.length > 0, controlled.output);

const mine = inspect('Aggregate mine conveyor tail pulley guard is missing during cleanup.', 'surface aggregate mine');
pass('MSHA Part 56 direct and OSHA suppressed', mine.output.suggestedStandards.length > 0 && mine.output.suggestedStandards.every((standard) => /30 CFR 56\./.test(standard.citation)) && !mine.output.suggestedStandards.some((standard) => /29 CFR/.test(standard.citation)), mine.output);

const coal = inspect('Surface coal mine haul truck is backing near a miner without verified traffic controls.', 'surface coal mine', broadElectrical);
pass('surface coal incomplete mapping does not force wrong part', !coal.output.suggestedStandards.some((standard) => /30 CFR (56|57|75)\.|29 CFR/.test(standard.citation)) && coal.result.inspectionIntelligence.miningContext.citationLimitations.length > 0, coal.output);

const unclear = inspect('Exposed rotating shaft is within reach; workplace jurisdiction is not stated.');
pass('unclear jurisdiction keeps alternatives coherent', unclear.result.jurisdictionAssessment.likelyJurisdiction === 'unclear' && unclear.result.inspectionIntelligence.evidenceGapQuestions.some((question) => /site type|jurisdiction/i.test(question)), unclear);

const needs = inspect(
  breakerObservation,
  'warehouse',
  broadElectrical,
  [{ citation: '29 CFR 1910.333', candidateStatus: 'needs_more_evidence', scopeFit: 'neutral', evidenceExclusionReason: 'Work-practice task evidence is missing.' }],
);
pass('needs-more-evidence bucket separate', needs.output.needsMoreEvidenceStandards.some((standard) => standard.citation === '29 CFR 1910.333') && !needs.output.suggestedStandards.some((standard) => standard.citation === '29 CFR 1910.333'), needs.output);
pass('suggested and excluded coexist', breaker.output.suggestedStandards.length > 0 && breaker.output.excludedStandards.length > 0, breaker.output);
pass('supporting separate from suggested', breaker.output.supportingStandards.length > 0 && breaker.output.supportingStandards.every((standard) => !breakerSuggested.includes(standard.citation)), breaker.output);

const directDomainCases = [
  ['walking surface', 'Oil spill makes the warehouse walkway wet and slippery.', 'warehouse', /1910\.22/],
  ['machine shaft', 'Exposed rotating shaft is within reach because its guard is missing.', 'factory', /1910\.(212|219)/],
  ['chemical label', 'Unlabeled chemical container is used at a warehouse workbench.', 'warehouse', /1910\.1200/],
  ['platform fall', 'Employee works on an elevated platform without guardrail or fall arrest.', 'factory', /1910\.28/],
  ['damaged ladder', 'Employee uses a damaged ladder with a broken rung.', 'warehouse', /1910\.23/],
] as const;

for (const [name, observation, siteType, expected] of directDomainCases) {
  const reviewed = inspect(observation, siteType);
  pass(`${name} direct front-facing family`, reviewed.output.suggestedStandards.length > 0 && expected.test(reviewed.output.suggestedStandards[0].citation) && reviewed.output.suggestedStandards.every((standard) => standard.citationRanking?.directCandidate || standard.evidenceFitReasons?.some((reason: string) => reason.startsWith('Direct match:'))), reviewed.output);
}

async function governanceTests() {
  const clear = await governance.evaluateApplicability(
    { maximumSupportedConfidence: 'moderate' },
    { sufficiencyLevel: 'partially_sufficient' },
    {}, {},
    { jurisdiction: { detected: 'osha_general_industry' } },
    { jurisdiction: 'osha_general_industry', standardFamily: 'electrical' },
    { allowedOutputModes: { canReferenceCitationCandidate: true }, allowedLanguageStrength: 'advisory' },
    breakerObservation,
    [{ standardFamily: 'electrical' }],
    [{ citation: '29 CFR 1910.303(g)(2)(i)' }],
  );
  const clearText = JSON.stringify(clear);
  pass('clear governance preserves advisory candidate', clear.jurisdictionSupport.jurisdictionClear && clear.citationCandidateSupport.citationCandidateMode === 'candidate_only_with_review' && clear.citationCandidateSupport.candidates.includes('29 cfr 1910.303(g)(2)(i)'), clear);
  pass('clear governance has no contradictory block message', !/jurisdiction is unclear|no citation candidate was provided|support is blocked because no coherent/i.test(clearText), clear);
  pass('clear governance states source limitation accurately', /source-backed registry confirmation is unavailable/i.test(clearText) && clear.advisoryGuardrails.requiresQualifiedReview, clear);

  const unknown = await governance.evaluateApplicability(
    { maximumSupportedConfidence: 'low' }, { sufficiencyLevel: 'weak' }, {}, {},
    { jurisdiction: { detected: 'unclear' } },
    { jurisdiction: 'unclear', standardFamily: 'electrical' },
    { allowedOutputModes: { canReferenceCitationCandidate: true }, allowedLanguageStrength: 'advisory' },
    'Possible electrical issue; site type is unknown.',
    [{ standardFamily: 'electrical' }], [],
  );
  pass('unclear governance blocks consistently', unknown.citationCandidateSupport.citationCandidateMode === 'blocked' && unknown.jurisdictionSupport.requiresJurisdictionConfirmation && /jurisdiction is unclear/i.test(JSON.stringify(unknown)), unknown);

  if (failures > 0) process.exit(1);
  console.log('Inspection intelligence citation output coherence regression: 25 passed, 0 failed');
}

governanceTests().catch((error) => { console.error(error); process.exit(1); });
