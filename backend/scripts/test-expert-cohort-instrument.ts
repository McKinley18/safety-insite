/**
 * EXPERT HAZLENZ -- ZERO-PROVIDER-CALL validation of the formal cohort instrument. §121.
 *
 * Proves the measurement contract, the canonical input constructor, the seventeen scorers and the
 * harness do what they claim, using ONLY development material. No provider of any kind is
 * constructed, and the harness's own invocation counter is asserted to be zero at the end.
 *
 * This suite establishes MECHANICS. It is not, and may not become, a measurement of any model:
 * every analysis it scores is a hand-built object, and `EVALUATION_CORPUS_POLICY` makes development
 * material "never a source of a gate result".
 */

import { createHash } from 'crypto';
import {
  EXPERT_MEASUREMENT_CONTRACT, EXPERT_ADJUDICATION_RUBRICS,
  assertContractMatchesPlan, frozenFieldsFor, gatedMeasureIds, reportedMeasureIds, specFor,
  zeroOpportunityTreatmentFor,
} from '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import { EXPERT_EVALUATION_MEASURES, EVALUATION_CORPUS_POLICY } from '../src/hazlenz/expert-hazlenz/expert-evaluation-plan';
import { EXPERT_CONDITION_STATES } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  classifyRow, truthOnlyStrings, validateCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  CONDITION_MAPPING_RESOLUTIONS, DETERMINISTIC_TO_EXPERT_CONDITION_STATE,
  PLANNED_FUTURE_REPRESENTATION_DEBT,
  buildExpertAnalysisInput, buildExpertAnalysisInputFromAnalysis, permuteForOrderSensitivity,
  toCanonicalExpertInputSource, toExpertConditionState,
} from '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { projectDeterministicDispositions } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import {
  buildExpertUserPrompt, EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  adjudicateFamilies, buildAdjudicationQueue, buildScoringReport, scoredFieldProjection,
  scorerCoverageProblems, scoreAllMeasures,
  scoreM01, scoreM02, scoreM03, scoreM04, scoreM05, scoreM06, scoreM07, scoreM08,
  scoreM09, scoreM10, scoreM11, scoreM12, scoreM13, scoreM14, scoreM15, scoreM16, scoreM17,
  type AdjudicationRecord, type CohortRunRecord, type MeasureResult,
} from '../src/hazlenz/expert-hazlenz/expert-measure-scorers';
import {
  INVALID_ROWS, VALIDATION_ROWS,
  V1_FULL_OPPORTUNITY, V2_NO_CLARIFICATION_OWED, V3_NEGATIVE_CONTROL,
  V4_NO_GOVERNED_RECORD, V5_RECALL_OPPORTUNITY, V6_DISAGREEMENT_OPPORTUNITY,
  analysis, buildRecord, candidate, clarification, disagreement, insight,
} from '../src/hazlenz/expert-hazlenz/fixtures/cohort-validation-fixtures';
import {
  FORMAL_COHORT_COMPOSITION_REQUIREMENTS, MEASURED_COST_MODEL, MINIMUM_DEFENSIBLE_ROWS,
  RECOMMENDED_CALL_TOPOLOGY, conservativeMaximumSpendUsd, evaluateComposition,
  minimumDenominatorFor, projectedCostUsd,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import {
  providerInvocationCount, resetProviderInvocationCount, runDeterministicSide, runFormalCohort,
} from './lib/expert-cohort-harness';

let passed = 0; let failed = 0;
const matrix: Array<{ section: string; check: string; ok: boolean; detail: string }> = [];

function assert(ok: boolean, label: string, detail = ''): void {
  const section = label.split('.')[0];
  matrix.push({ section, check: label, ok, detail });
  if (ok) { passed += 1; console.log(`  PASS  ${label}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? ` -- ${detail}` : ''}`); }
}

function value(r: MeasureResult): string {
  return `${r.state}${r.value === null ? '' : ` ${r.value}`} (${r.numerator}/${r.denominator})`;
}

async function main(): Promise<void> {
  resetProviderInvocationCount();

  // =====================================================================================
  console.log('\nA. THE MEASUREMENT CONTRACT IS A FAITHFUL READING OF THE PLAN\n');
  // =====================================================================================

  const contractProblems = assertContractMatchesPlan();
  assert(contractProblems.length === 0,
    'A.1 the contract matches the frozen plan exactly', contractProblems.join(' | '));
  assert(EXPERT_MEASUREMENT_CONTRACT.length === 17, 'A.2 seventeen executable specs');
  assert(EXPERT_EVALUATION_MEASURES.length === 17, 'A.3 the plan still has seventeen measures');
  assert(gatedMeasureIds().length === 12 && reportedMeasureIds().length === 5,
    'A.4 twelve HARD_GATEs and five MEASURED_AND_REPORTED, unchanged',
    `${gatedMeasureIds().length}/${reportedMeasureIds().length}`);

  for (const id of gatedMeasureIds()) {
    assert(zeroOpportunityTreatmentFor(id) === 'UNMEASURED_GATE_FAILS',
      `A.5 ${id}: zero opportunity on a hard gate is UNMEASURED, never N/A`);
  }
  assert(reportedMeasureIds().every(id => zeroOpportunityTreatmentFor(id) === 'REPORTED_AS_NO_OPPORTUNITY'),
    'A.6 reported measures report no-opportunity rather than failing');

  const adjudicated = EXPERT_MEASUREMENT_CONTRACT.filter(s => s.requiresAdjudication).map(s => s.id);
  assert(adjudicated.length === 3
      && adjudicated.includes('M06_UNSUPPORTED_REGULATORY_ASSERTIONS')
      && adjudicated.includes('M07_GOVERNED_RECORD_GROUNDING')
      && adjudicated.includes('M09_CLARIFICATION_QUALITY'),
    'A.7 exactly three measures need a level-3 rubric, and they are named', adjudicated.join(','));
  assert(EXPERT_MEASUREMENT_CONTRACT.filter(s => s.truthPrecedence === 'DETERMINISTIC_MACHINE_DERIVED').length
      + EXPERT_MEASUREMENT_CONTRACT.filter(s => s.truthPrecedence === 'ENCODED_CASE_TRUTH').length === 14,
    'A.8 fourteen of seventeen resolve at precedence level 1 or 2');
  assert(EXPERT_ADJUDICATION_RUBRICS.every(r => r.verdicts.length >= 2 && r.forbiddenInputs.length > 0),
    'A.9 every rubric has a closed verdict set and states what the adjudicator may not consider');
  assert(frozenFieldsFor('M17_CROSS_PROCESS_REPRODUCIBILITY').disposition === 'MEASURED_AND_REPORTED',
    'A.10 M17 remains REPORTED -- promotion is a governance act elsewhere');
  assert(scorerCoverageProblems().length === 0,
    'A.11 a scorer exists for every measure the contract defines', scorerCoverageProblems().join('|'));
  assert(EVALUATION_CORPUS_POLICY.reserved.length === 3,
    'A.12 the reserved corpus list is unchanged by this operation');

  // =====================================================================================
  console.log('\nB. COHORT ROWS: THE TOTALITY RULE IS ENFORCED AT FREEZE TIME\n');
  // =====================================================================================

  for (const row of VALIDATION_ROWS) {
    const problems = validateCohortRow(row);
    assert(problems.length === 0, `B.1 ${row.source.rowId} is a valid row`,
      problems.map(p => p.code).join(','));
  }
  const x1 = validateCohortRow(INVALID_ROWS[0]);
  assert(x1.some(p => p.code === 'TRUTH_BUCKETS_INCOMPLETE'),
    'B.2 a family in the vocabulary but in no bucket is REJECTED', x1.map(p => p.code).join(','));
  const x2 = validateCohortRow(INVALID_ROWS[1]);
  assert(x2.some(p => p.code === 'TRUTH_BUCKETS_OVERLAP'),
    'B.3 a family in two buckets is REJECTED', x2.map(p => p.code).join(','));

  const v1Classes = classifyRow(V1_FULL_OPPORTUNITY);
  assert(v1Classes.includes('MULTI_HAZARD') && v1Classes.includes('CROSS_HAZARD_INTERACTION')
      && v1Classes.includes('GOVERNED_RECORD_SUPPLIED') && v1Classes.includes('CLARIFICATION_OWED')
      && v1Classes.includes('LIFE_CRITICAL_PRESENT'),
    'B.4 case classes are computed from the row, not declared on it', v1Classes.join(','));
  assert(classifyRow(V2_NO_CLARIFICATION_OWED).includes('CLARIFICATION_NOT_OWED'),
    'B.5 the zero-owed class is detectable, which is what M10 needs');
  assert(classifyRow(V6_DISAGREEMENT_OPPORTUNITY).includes('DISAGREEMENT_OPPORTUNITY'),
    'B.6 an unapproved supplied record is a disagreement opportunity');

  // =====================================================================================
  console.log('\nC. THE CANONICAL CONSTRUCTOR IS THE PERMANENT PATH\n');
  // =====================================================================================

  const ENGINE_STATES = ['ACTIVE', 'UNKNOWN', 'CONTRADICTORY', 'SAFE_VERIFIED', 'HISTORICAL',
    'INTERMITTENT', 'PLANNED_FUTURE'];
  assert(ENGINE_STATES.every(s => DETERMINISTIC_TO_EXPERT_CONDITION_STATE[s] !== undefined),
    'C.1 the condition-state map is TOTAL over the engine vocabulary');
  assert(Object.keys(DETERMINISTIC_TO_EXPERT_CONDITION_STATE).length === ENGINE_STATES.length,
    'C.2 and carries no member the engine cannot emit');
  let threw = false;
  try { toExpertConditionState('SOMETHING_NEW'); } catch { threw = true; }
  assert(threw, 'C.3 an unmapped state THROWS rather than defaulting to ACTIVE');
  assert(toExpertConditionState(undefined) === 'UNKNOWN',
    'C.4 an absent state maps to UNKNOWN, which is an exact member rather than a fallback');
  assert(CONDITION_MAPPING_RESOLUTIONS.length === 2,
    'C.5 both interpretive mappings are declared with their status rather than buried');

  // §122: HISTORICAL is resolved from the engine's own correctionStatus discriminator.
  assert(toExpertConditionState('HISTORICAL', 'verified') === 'CORRECTED',
    'C.5a HISTORICAL with a VERIFIED correction is CORRECTED -- the one branch that asserts the '
    + 'hazard was put right');
  assert(toExpertConditionState('HISTORICAL', 'reported') === 'INSUFFICIENT_EVIDENCE'
      && toExpertConditionState('HISTORICAL', 'not_stated') === 'INSUFFICIENT_EVIDENCE'
      && toExpertConditionState('HISTORICAL', undefined) === 'INSUFFICIENT_EVIDENCE',
    'C.5b HISTORICAL without a verified correction is INSUFFICIENT_EVIDENCE -- the engine said the '
    + 'current status was not established, so Expert is not told it was fixed');
  assert(CONDITION_MAPPING_RESOLUTIONS.find(m => m.from === 'HISTORICAL')?.status
      === 'RESOLVED_FROM_PRODUCTION_SEMANTICS',
    'C.5c HISTORICAL is recorded as RESOLVED from production semantics');
  // §123: PLANNED_FUTURE resolved BY THE PRODUCT OWNER, with the approximation recorded as debt.
  assert(CONDITION_MAPPING_RESOLUTIONS.find(m => m.from === 'PLANNED_FUTURE')?.status
      === 'RESOLVED_BY_PRODUCT_OWNER_WITH_RECORDED_DEBT',
    'C.5d PLANNED_FUTURE is recorded as resolved by the product owner, with debt');
  assert(toExpertConditionState('PLANNED_FUTURE') === 'HYPOTHETICAL',
    'C.5e PLANNED_FUTURE maps to HYPOTHETICAL -- the frozen canonical mapping');
  assert(toExpertConditionState('PLANNED_FUTURE', 'verified') === 'HYPOTHETICAL'
      && toExpertConditionState('PLANNED_FUTURE', 'planned') === 'HYPOTHETICAL',
    'C.5f and correctionStatus does NOT discriminate it -- only HISTORICAL branches on that');
  assert(toExpertConditionState('PLANNED_FUTURE') !== 'INSUFFICIENT_EVIDENCE',
    'C.5g it is NOT INSUFFICIENT_EVIDENCE: the engine positively knows the activity is planned, so '
    + 'reporting uncertainty would be false');
  assert(PLANNED_FUTURE_REPRESENTATION_DEBT.open === true
      && PLANNED_FUTURE_REPRESENTATION_DEBT.notResolvableHere === true,
    'C.5h PLANNED_FUTURE_REPRESENTATION_DEBT is OPEN and recorded in code, not absorbed');
  assert(!(EXPERT_CONDITION_STATES as readonly string[]).includes('PLANNED_FUTURE')
      && !(EXPERT_CONDITION_STATES as readonly string[]).includes('SCHEDULED'),
    'C.5i the eight-state vocabulary was NOT expanded by this operation');

  const det = runDeterministicSide(V1_FULL_OPPORTUNITY);
  const built = buildExpertAnalysisInputFromAnalysis(det.analysisState);
  assert(built.contractVersion === 'hazlenz.expert.input.v1',
    'C.6 the constructor emits the frozen input contract version');
  assert(built.authoritativeSources[0].sourceId === 'observation'
      && built.authoritativeSources[0].text === V1_FULL_OPPORTUNITY.source.observation,
    'C.7 the observation is source 0, verbatim, so an evidence offset binds');
  assert(built.deterministicFindings.every(f => f.isLifeCritical === false),
    'C.8 the model is shown NO life-criticality -- production establishes none, so neither does this');
  assert(det.lifeCriticalFindingKeys.length >= 0
      && det.deterministic.findings.some(f => f.isLifeCritical) === (det.lifeCriticalFindingKeys.length > 0),
    'C.9 the corpus life-criticality label reaches the MERGE side only');

  // The §119 projection semantics survive the constructor: same decisions in, same rows out.
  const handProjected = projectDeterministicDispositions(
    det.analysisState.applicabilityDecisions ?? [],
    toCanonicalExpertInputSource(det.analysisState).evidenceQuotesByFamily,
  );
  assert(JSON.stringify(built.deterministicFamilyDispositions) === JSON.stringify(handProjected),
    'C.10 the constructor projects EXACTLY what projectDeterministicDispositions produces');

  const absentSource = toCanonicalExpertInputSource({ ...det.analysisState, applicabilityDecisions: undefined });
  const absentInput = buildExpertAnalysisInput(absentSource);
  assert(!('deterministicFamilyDispositions' in absentInput),
    'C.11 ABSENT stays absent -- no decisions offered means the field is not set at all');
  const emptyInput = buildExpertAnalysisInput({ ...absentSource, applicabilityDecisions: [] });
  assert(Array.isArray(emptyInput.deterministicFamilyDispositions)
      && emptyInput.deterministicFamilyDispositions.length === 0,
    'C.12 an evaluation that projected nothing yields [], which is a different fact from absent');
  assert(buildExpertUserPrompt(absentInput) === buildExpertUserPrompt(emptyInput),
    'C.13 undefined and [] render identically -- neither synthesises a NOT_APPLICABLE');

  const permuted = permuteForOrderSensitivity(built);
  assert(permuted.authoritativeSources[0].sourceId === 'observation',
    'C.14 the permutation never moves the observation, whose offsets are bound against');
  assert(JSON.stringify([...permuted.deterministicFindings].reverse())
      === JSON.stringify(built.deterministicFindings),
    'C.15 the permutation is exact reversal -- no parameter, no seed, nothing to tune');
  const asSortedJson = (xs: unknown[]) =>
    JSON.stringify(xs.map(x => JSON.stringify(x)).sort());
  assert(asSortedJson(permuted.deterministicFindings) === asSortedJson(built.deterministicFindings)
      && asSortedJson(permuted.governedStandards) === asSortedJson(built.governedStandards),
    'C.16 the permutation changes ORDER ONLY: same members, same fields');
  // §139 RE-ANCHORED, NOT RELAXED. C.17 proved that the COHORT-INSTRUMENT operation redesigned no
  // prompt. That property is unchanged: nothing in this file's operation touches the prompt. The
  // literal moved because §139, a separately authorized remediation, revised it. C.17b keeps the
  // real guarantee -- the system prompt still knows nothing about the evaluation apparatus.
  // §141 re-anchored again, same reasoning: the linkage remediation revised the prompt under its
  // own authorization, and this file's operation still touches nothing in it.
  // §147 re-anchored to v10 for the clarification-recall remediation. §148 re-anchored to v11 for
  // the settlement-threshold narrowing and the affectedDecision routing disclosure. Same reasoning a
  // fifth time: this pin tests that the version is DECLARED and PINNED, not which label it carries.
  // §149 re-anchored a sixth time, v11 -> v12, for the unsupported-settlement repair.
  // §150 re-anchored a seventh time, v12 -> v13, for the retention-bridge repair.
  // §177 re-anchored an eighth time, v13 -> v14, for the §176 temporal-sufficiency repair. The
  // prompt TEXT changed in §176 while this literal did not, which left v13 naming two different
  // behaviours; §177 is the authorized alignment. The system-prompt bytes are unchanged by the
  // bump itself -- the version string does not appear in the prompt text.
  // §178 re-anchored a ninth time, v14 -> v15, for the control-property-sufficiency repair.
  // Unlike §177 the prompt TEXT genuinely changed, so the bump and the behaviour move together.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'C.17 the prompt semantic version is pinned to the current authorized version (v15)',
    EXPERT_PROMPT_VERSION);
  assert(createHash('sha256').update(EXPERT_SYSTEM_PROMPT).digest('hex').length === 64
      && !EXPERT_SYSTEM_PROMPT.includes('cohort') && !EXPERT_SYSTEM_PROMPT.includes('truth'),
    'C.18 and the system prompt mentions neither the cohort nor any truth key');

  // =====================================================================================
  console.log('\nD. THE TRUTH KEY CANNOT REACH THE MODEL\n');
  // =====================================================================================

  let leaks = 0;
  for (const row of VALIDATION_ROWS) {
    const state = runDeterministicSide(row);
    const input = buildExpertAnalysisInputFromAnalysis(state.analysisState);
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(input)}\n${JSON.stringify(input)}`;
    for (const secret of truthOnlyStrings(row)) {
      if (rendered.includes(secret)) { leaks += 1; console.log(`      LEAK ${row.source.rowId}: ${secret}`); }
    }
  }
  assert(leaks === 0,
    'D.1 TRUTH_LEAK = 0 across every validation row, in the system prompt, the user prompt and the '
    + 'serialized input', `${leaks} leak(s)`);
  assert(typeof (buildExpertAnalysisInput as unknown as { length: number }).length === 'number',
    'D.2 the constructor has ONE parameter, and no parameter of it can carry a truth key');

  // =====================================================================================
  console.log('\nE. SCORER MECHANICS -- POSITIVE, NEGATIVE AND BOUNDARY\n');
  // =====================================================================================

  // ---- M01: recall of a family the deterministic engine did not surface.
  const m01Hit = buildRecord(V5_RECALL_OPPORTUNITY, [{
    analysis: analysis('V5', {
      expertHazardCandidates: [candidate({ hazardFamily: 'electrical',
        relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC' })],
    }),
  }], ['machine_guarding']);
  const r01 = scoreM01([m01Hit]);
  assert(r01.state === 'MEASURED' && r01.numerator === 1 && r01.denominator === 1,
    'E.M01.1 a family the engine missed and Expert raised counts as recovered', value(r01));

  const m01Dup = buildRecord(V5_RECALL_OPPORTUNITY, [{
    analysis: analysis('V5', {
      expertHazardCandidates: [
        candidate({ candidateKey: 'a', hazardFamily: 'electrical' }),
        candidate({ candidateKey: 'b', hazardFamily: 'electrical' }),
        candidate({ candidateKey: 'c', hazardFamily: 'electrical' }),
      ],
    }),
  }], ['machine_guarding']);
  assert(scoreM01([m01Dup]).numerator === 1,
    'E.M01.2 repeating a family cannot inflate recall -- counted once per (row, family)');

  const m01None = buildRecord(V5_RECALL_OPPORTUNITY, [{ analysis: analysis('V5') }],
    ['machine_guarding', 'electrical']);
  const r01none = scoreM01([m01None]);
  assert(r01none.state === 'NO_OPPORTUNITY',
    'E.M01.3 no missed family is NO_OPPORTUNITY on a REPORTED measure, never a silent zero', value(r01none));

  // ---- M02: exact threshold boundary, and one step past it.
  const fiveCandidates = (forbiddenCount: number) => buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', {
      expertHazardCandidates: [
        ...Array.from({ length: forbiddenCount }, (_, i) =>
          candidate({ candidateKey: `x${i}`, hazardFamily: 'confined_space' })),
        ...Array.from({ length: 5 - forbiddenCount }, (_, i) =>
          candidate({ candidateKey: `y${i}`, hazardFamily: 'machine_guarding' })),
      ],
    }),
  }]);
  const r02at = scoreM02([fiveCandidates(1)]);
  assert(r02at.state === 'MEASURED' && r02at.value === 0.2,
    'E.M02.1 EXACT THRESHOLD: 1 forbidden of 5 is 0.20, which a MAX 0.20 ceiling admits', value(r02at));
  const r02over = scoreM02([fiveCandidates(2)]);
  assert(r02over.value === 0.4 && r02over.value! > frozenFieldsFor('M02_EXPERT_CANDIDATE_FALSE_POSITIVES').threshold!,
    'E.M02.2 ONE STEP PAST: 2 of 5 is 0.40 and exceeds the ceiling', value(r02over));
  const r02clean = scoreM02([fiveCandidates(0)]);
  assert(r02clean.value === 0, 'E.M02.3 no forbidden family is 0.00', value(r02clean));

  const m02Unclassified = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', {
      expertHazardCandidates: [candidate({ hazardFamily: 'mobile_equipment' })],
    }),
  }]);
  const r02unc = scoreM02([m02Unclassified]);
  assert(r02unc.state === 'UNMEASURED',
    'E.M02.4 MISSING TRUTH: a family outside all three buckets is UNMEASURED, not assumed benign',
    value(r02unc));

  const r02none = scoreM02([buildRecord(V1_FULL_OPPORTUNITY, [{ analysis: analysis('V1') }])]);
  assert(r02none.state === 'UNMEASURED' && /HARD_GATE/.test(r02none.reason ?? ''),
    'E.M02.5 ZERO OPPORTUNITY on a hard gate is UNMEASURED and says why', value(r02none));

  // ---- M03 / M08: merge invariants, split without double-counting.
  const m03Clean = buildRecord(V1_FULL_OPPORTUNITY, [{ analysis: analysis('V1') }]);
  assert(scoreM03([m03Clean]).value === 0, 'E.M03.1 an untouched merge has zero violations');
  const m03Broken = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1'), dropFindingsFromMerge: true,
  }]);
  const r03 = scoreM03([m03Broken]);
  assert(r03.value !== null && r03.value > 0,
    'E.M03.2 a deterministic finding dropped from the merge is COUNTED', value(r03));
  assert(scoreM08([m03Broken]).value === 0,
    'E.M08.1 a retention violation is M03\'s, not M08\'s -- one violation never fails two families');

  // ---- M04: life-critical retention, and the failure case.
  const r04ok = scoreM04([m03Clean]);
  assert(r04ok.state === 'MEASURED' && r04ok.value === 1,
    'E.M04.1 life-critical findings survive an ordinary merge', value(r04ok));
  const r04bad = scoreM04([m03Broken]);
  assert(r04bad.state === 'MEASURED' && r04bad.value === 0,
    'E.M04.2 a dropped life-critical finding drives retention to 0.00 and fails the floor', value(r04bad));
  const r04none = scoreM04([buildRecord(V2_NO_CLARIFICATION_OWED, [{ analysis: analysis('V2') }])]);
  assert(r04none.state === 'UNMEASURED',
    'E.M04.3 a cohort with no life-critical row cannot measure the floor, and says so', value(r04none));

  // ---- M05: fabricated citations, both halves of the numerator.
  const r05clean = scoreM05([m03Clean]);
  assert(r05clean.value === 0, 'E.M05.1 clean output emits no citation-shaped string');
  const m05Rejected = buildRecord(V1_FULL_OPPORTUNITY, [{
    layerStatus: 'OUTPUT_REJECTED', analysis: null,
    issues: [{ code: 'CITATION_SHAPED_TEXT_NOT_PERMITTED', detail: 'smuggled 29 CFR 1910.212' }],
  }]);
  assert(scoreM05([m05Rejected]).value === 1,
    'E.M05.2 MALFORMED OBJECT: a boundary rejection for a smuggled citation is counted');
  const m05Survived = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1'), smuggleCitationIntoMerge: 'see 29 CFR 1910.212(a)(1)',
  }]);
  assert(scoreM05([m05Survived]).value === 1,
    'E.M05.3 a citation that SURVIVED to the merge is counted even with no boundary issue');

  // ---- M06 / M07: the detector, the queue, and fail-closed on an incomplete queue.
  const regAnalysis = analysis('V1', {
    expertHazardCandidates: [candidate({
      reasoning: 'OSHA requires machine guarding at the point of operation for this class of press',
    })],
    expertExplanation: { summary: 'The press lacks a guard and the operator reached in.' },
  });
  const m06Record = buildRecord(V1_FULL_OPPORTUNITY, [{ analysis: regAnalysis }]);
  const queue = buildAdjudicationQueue([m06Record]);
  const regItems = queue.filter(q => q.kind === 'REGULATORY_STATEMENT');
  assert(regItems.length === 1 && regItems[0].assertsObligation === true,
    'E.M06.1 the level-1 detector finds the regulatory statement and flags the obligation mechanically',
    JSON.stringify(regItems.map(i => i.fieldPath)));
  assert(queue.every(q => q.itemId === buildAdjudicationQueue([m06Record])
      .find(x => x.fieldPath === q.fieldPath && x.kind === q.kind)?.itemId),
    'E.M06.2 the queue is DETERMINISTIC -- the same records produce the same item ids');

  const r06missing = scoreM06([m06Record], []);
  assert(r06missing.state === 'UNMEASURED' && /unadjudicated/.test(r06missing.reason ?? ''),
    'E.M06.3 FAIL CLOSED: an incomplete adjudication queue makes a HARD_GATE unmeasured', value(r06missing));
  assert(scoreM07([m06Record], []).state === 'UNMEASURED',
    'E.M07.1 M07 fails closed on the same incomplete queue');

  const unsupported: AdjudicationRecord[] = regItems.map(q => ({
    itemId: q.itemId, rubricId: q.rubricId, verdict: 'NOT_SUPPORTED_BY_SUPPLIED_RECORD',
    reason: 'the supplied record states a guarding duty but not for this press class',
  }));
  const r06 = scoreM06([m06Record], unsupported);
  assert(r06.state === 'MEASURED' && r06.numerator === 1 && r06.denominator === 1,
    'E.M06.4 an unsupported obligation on a governed-record row counts, over rows-with-records',
    value(r06));
  const r07 = scoreM07([m06Record], unsupported);
  assert(r07.state === 'MEASURED' && r07.value === 0,
    'E.M07.2 the same statement scores 0.00 grounding -- one adjudication, two measures', value(r07));

  const supported: AdjudicationRecord[] = regItems.map(q => ({
    itemId: q.itemId, rubricId: q.rubricId, verdict: 'SUPPORTED_BY_SUPPLIED_RECORD',
    supportingCitation: '29 CFR 1910.212(a)(1)',
    reason: 'the approved text states the guarding duty this statement asserts',
  }));
  assert(scoreM07([m06Record], supported).value === 1 && scoreM06([m06Record], supported).value === 0,
    'E.M07.3 a supported statement is grounded and is not an unsupported assertion');

  const m06NoRecord = buildRecord(V4_NO_GOVERNED_RECORD, [{ analysis: regAnalysis }]);
  const noRecordItems = buildAdjudicationQueue([m06NoRecord]).filter(q => q.kind === 'REGULATORY_STATEMENT');
  const noRecordVerdicts: AdjudicationRecord[] = noRecordItems.map(q => ({
    itemId: q.itemId, rubricId: q.rubricId, verdict: 'NOT_SUPPORTED_BY_SUPPLIED_RECORD',
    reason: 'no record was supplied on this row',
  }));
  const r06excl = scoreM06([m06NoRecord], noRecordVerdicts);
  assert(r06excl.state === 'UNMEASURED' && r06excl.supplementary.statementsExcludedForNoGovernedRecord === 1,
    'E.M06.5 a no-record row is EXCLUDED from M06 and the exclusion is reported, not hidden',
    JSON.stringify(r06excl.supplementary));
  assert(scoreM07([m06NoRecord], noRecordVerdicts).state === 'MEASURED',
    'E.M07.4 the same statement still counts in M07, whose denominator is all statements');

  // ---- M09: appropriate, mis-declared, and unmapped clarifications.
  const goodClar = clarification({ clarificationId: 'q1', affectedDecision: 'REQUIRED_CONTROL' });
  const mismatchedClar = clarification({ clarificationId: 'q2', affectedDecision: 'HAZARD_SEVERITY' });
  const m09Record = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', { decisionCriticalClarifications: [goodClar, mismatchedClar] }),
  }]);
  const clarItems = buildAdjudicationQueue([m09Record]).filter(q => q.kind === 'CLARIFICATION_MAPPING');
  assert(clarItems.length === 2 && clarItems.every(q => (q.candidateGaps ?? []).length === 2),
    'E.M09.1 every emitted clarification is queued with the row\'s authored gaps');
  const clarVerdicts: AdjudicationRecord[] = [
    { itemId: `V1::CLR::q1`, rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1', verdict: 'MAPPED_TO_GAP',
      mappedGapId: 'V1-G1', reason: 'asks the lockout question the gap describes' },
    { itemId: `V1::CLR::q2`, rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1', verdict: 'MAPPED_TO_GAP',
      mappedGapId: 'V1-G1', reason: 'also about the lockout state' },
  ];
  const r09 = scoreM09([m09Record], clarVerdicts);
  assert(r09.state === 'MEASURED' && r09.numerator === 1 && r09.denominator === 2,
    'E.M09.2 APPROPRIATE CLARIFICATION counts; a mis-declared affectedDecision does not', value(r09));
  assert(r09.supplementary.affectedDecisionMismatch === 1,
    'E.M09.3 the decision comparison is the SCORER\'s, over a closed vocabulary');
  const r09unmapped = scoreM09([m09Record], [
    { itemId: 'V1::CLR::q1', rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1', verdict: 'MAPPED_TO_NO_GAP', reason: 'off-topic' },
    { itemId: 'V1::CLR::q2', rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1', verdict: 'MAPPED_TO_NO_GAP', reason: 'off-topic' },
  ]);
  assert(r09unmapped.value === 0 && r09unmapped.supplementary.mappedToNoGap === 2,
    'E.M09.4 questions that match no authored gap score zero and are reported', value(r09unmapped));

  const m09Silent = buildRecord(V1_FULL_OPPORTUNITY, [{ analysis: analysis('V1') }]);
  const r09silent = scoreM09([m09Silent], []);
  assert(r09silent.state === 'UNMEASURED',
    'E.M09.5 MISSING REQUIRED CLARIFICATION: silence cannot score 1.00 -- with nothing emitted the '
    + 'precision measure has no denominator and the gate fails', value(r09silent));

  // ---- M10: the unnecessary-question control, at and past the boundary.
  const zeroOwedRows = (askingCount: number): CohortRunRecord[] =>
    Array.from({ length: 20 }, (_, i) => buildRecord(
      { ...V2_NO_CLARIFICATION_OWED, source: { ...V2_NO_CLARIFICATION_OWED.source, rowId: `Z${i}` } },
      [{ analysis: analysis(`Z${i}`, {
        decisionCriticalClarifications: i < askingCount ? [clarification()] : [],
      }) }]));
  const r10at = scoreM10(zeroOwedRows(3));
  assert(r10at.value === 0.15 && r10at.value <= frozenFieldsFor('M10_UNNECESSARY_QUESTION_RATE').threshold!,
    'E.M10.1 EXACT THRESHOLD: 3 asking of 20 zero-owed rows is 0.15 and is admitted', value(r10at));
  const r10over = scoreM10(zeroOwedRows(4));
  assert(r10over.value === 0.2 && r10over.value! > 0.15,
    'E.M10.2 ONE STEP PAST: 4 of 20 is 0.20 and exceeds the ceiling', value(r10over));
  const r10none = scoreM10([buildRecord(V1_FULL_OPPORTUNITY, [{ analysis: analysis('V1') }])]);
  assert(r10none.state === 'UNMEASURED',
    'E.M10.3 a cohort with no zero-owed row cannot measure this gate', value(r10none));

  // ---- M11: sibling routing, over-routing and the closed-vocabulary match.
  const m11Hit = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', { crossHazardInsights: [insight()] }),
  }]);
  const r11 = scoreM11([m11Hit]);
  assert(r11.state === 'MEASURED' && r11.value === 1 && r11.supplementary.spuriousInsights === 0,
    'E.M11.1 SIBLING ROUTING: a correct interaction in the right collection matches exactly', value(r11));
  const m11Wrong = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', {
      crossHazardInsights: [insight({ interactionKind: 'LOTO_STORED_ENERGY' })],
    }),
  }]);
  const r11wrong = scoreM11([m11Wrong]);
  assert(r11wrong.value === 0 && r11wrong.supplementary.spuriousInsights === 1,
    'E.M11.2 OVER-ROUTING: a wrong-kind insight is a miss AND is reported as spurious', value(r11wrong));
  const m11PartWrong = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', { crossHazardInsights: [insight({ participants: ['electrical'] })] }),
  }]);
  assert(scoreM11([m11PartWrong]).value === 0,
    'E.M11.3 an insight missing a recorded participant does not match');
  assert(scoreM11([buildRecord(V2_NO_CLARIFICATION_OWED, [{ analysis: analysis('V2') }])]).state === 'NO_OPPORTUNITY',
    'E.M11.4 a row with no recorded interaction is no opportunity, on a REPORTED measure');

  // ---- M12: the literal row-level incoherence test.
  const m12Bad = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', {
      expertHazardCandidates: [candidate({ assertedConditionState: 'ACTIVE' })],
      decisionCriticalClarifications: [clarification({ affectedDecision: 'HAZARD_EXISTENCE' })],
    }),
  }]);
  assert(scoreM12([m12Bad]).value === 1,
    'E.M12.1 an ACTIVE candidate beside an existence question is incoherent, as the plan words it');
  const m12Ok = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', {
      expertHazardCandidates: [candidate({ assertedConditionState: 'INSUFFICIENT_EVIDENCE' })],
      decisionCriticalClarifications: [clarification({ affectedDecision: 'HAZARD_EXISTENCE' })],
    }),
  }]);
  assert(scoreM12([m12Ok]).value === 0,
    'E.M12.2 questioning existence while asserting nothing active is coherent');

  // ---- M13: provider failure and partial execution.
  const m13Mixed: CohortRunRecord[] = [
    buildRecord(V1_FULL_OPPORTUNITY, [
      { analysis: analysis('V1') },
      { arm: 'PERMUTED', layerStatus: 'OUTPUT_REJECTED', analysis: null },
      { arm: 'CROSS_PROCESS', layerStatus: 'PROVIDER_FAILED', failureKind: 'TIMEOUT', analysis: null },
    ]),
  ];
  const r13 = scoreM13(m13Mixed);
  assert(r13.numerator === 2 && r13.denominator === 3,
    'E.M13.1 PROVIDER FAILURE is a miss; a boundary rejection PROVES callability and is a hit', value(r13));
  assert(r13.supplementary.TIMEOUT === 1,
    'E.M13.2 failures are broken out by kind, never summed into one number');

  // ---- M14 / M17: the frozen projection, and the pairing rules.
  const sameShape = analysis('V1', { expertHazardCandidates: [candidate()] });
  const proseDiff = analysis('V1', {
    expertHazardCandidates: [candidate({ reasoning: 'entirely different prose, same structure' })],
  });
  assert(scoredFieldProjection(sameShape) === scoredFieldProjection(proseDiff),
    'E.M14.1 the frozen projection IGNORES prose -- otherwise the gate is unreachable (the G9 error)');
  const shapeDiff = analysis('V1', { expertHazardCandidates: [candidate({ hazardFamily: 'electrical' })] });
  assert(scoredFieldProjection(sameShape) !== scoredFieldProjection(shapeDiff),
    'E.M14.2 and DOES see a changed family');
  const m14Stable = buildRecord(V1_FULL_OPPORTUNITY, [
    { arm: 'BASE', analysis: sameShape }, { arm: 'PERMUTED', analysis: proseDiff },
  ]);
  assert(scoreM14([m14Stable]).value === 0, 'E.M14.3 order-stable output scores 0.00');
  const m14Unstable = buildRecord(V1_FULL_OPPORTUNITY, [
    { arm: 'BASE', analysis: sameShape }, { arm: 'PERMUTED', analysis: shapeDiff },
  ]);
  assert(scoreM14([m14Unstable]).value === 1, 'E.M14.4 a changed shape under permutation scores 1.00');
  const m14Unpairable = buildRecord(V1_FULL_OPPORTUNITY, [
    { arm: 'BASE', analysis: sameShape },
    { arm: 'PERMUTED', layerStatus: 'PROVIDER_FAILED', failureKind: 'TIMEOUT', analysis: null },
  ]);
  assert(scoreM14([m14Unpairable]).state === 'UNMEASURED'
      && scoreM14([m14Unpairable]).supplementary.unpairableRows === 1,
    'E.M14.5 an unpairable row is EXCLUDED and COUNTED, never silently dropped');

  const m17Cross = buildRecord(V1_FULL_OPPORTUNITY, [
    { arm: 'BASE', analysis: sameShape, processId: 'proc-A' },
    { arm: 'CROSS_PROCESS', analysis: proseDiff, processId: 'proc-B' },
  ]);
  assert(scoreM17([m17Cross]).value === 1,
    'E.M17.1 identical scored fields across two processes is reproducible');
  const m17SameProc = buildRecord(V1_FULL_OPPORTUNITY, [
    { arm: 'BASE', analysis: sameShape, processId: 'proc-A' },
    { arm: 'CROSS_PROCESS', analysis: sameShape, processId: 'proc-A' },
  ]);
  const r17same = scoreM17([m17SameProc]);
  assert(r17same.state === 'NO_OPPORTUNITY' && r17same.supplementary.pairsRejectedForSameProcess === 1,
    'E.M17.2 a "cross-process" pair built in ONE process is refused and counted', value(r17same));
  assert(String(scoreM17([m17Cross]).supplementary.p2DeterminismControl) === 'ABSENT',
    'E.M17.3 the absent determinism control is carried on the result, not assumed away');

  // ---- M15 / M16: reported reliability arithmetic.
  const m15 = scoreM15([buildRecord(V1_FULL_OPPORTUNITY, [
    { latencyMs: 1000, analysis: analysis('V1') },
    { arm: 'PERMUTED', latencyMs: 5000, analysis: analysis('V1') },
    { arm: 'CROSS_PROCESS', latencyMs: 9000, analysis: analysis('V1') },
  ])]);
  assert(m15.value === 9000 && m15.supplementary.samples === 3,
    'E.M15.1 nearest-rank p95 over three samples is the largest, and the method is recorded', value(m15));
  const m16 = scoreM16([buildRecord(V1_FULL_OPPORTUNITY, [
    { costUsd: 0.03, analysis: analysis('V1') }, { arm: 'PERMUTED', costUsd: 0.03, analysis: analysis('V1') },
  ])]);
  assert(Math.abs((m16.value ?? 0) - 0.06) < 1e-9 && m16.supplementary.calls === 2,
    'E.M16.1 cost per ROW sums every call on that row', value(m16));

  // ---- exact binding vs fabricated / out-of-bounds evidence.
  const bindingIssues = buildRecord(V1_FULL_OPPORTUNITY, [{
    layerStatus: 'OUTPUT_REJECTED', analysis: null,
    issues: [
      { code: 'EVIDENCE_OUT_OF_BOUNDS', detail: 'offset beyond the source' },
      { code: 'EVIDENCE_TEXT_MISMATCH', detail: 'quoted text is not what the span says' },
      { code: 'GROUNDING_CLAIM_UNSUPPORTED', detail: 'claimed a quote and supplied none' },
    ],
  }]);
  const r13binding = scoreM13([bindingIssues]);
  assert(r13binding.numerator === 1,
    'E.BIND.1 FABRICATED and OUT-OF-BOUNDS quotes are a CONTENT rejection, and callability still holds');
  assert(scoreM02([bindingIssues]).state === 'UNMEASURED',
    'E.BIND.2 a rejected row contributes no candidates, so it cannot score well by saying nothing');

  // ---- deterministic agreement vs unsupported contradiction.
  const agreeing = buildRecord(V1_FULL_OPPORTUNITY, [{
    analysis: analysis('V1', {
      expertHazardCandidates: [candidate({ relationshipToDeterministic: 'AGREES_WITH_DETERMINISTIC' })],
    }),
  }]);
  assert(scoreM02([agreeing]).value === 0,
    'E.DET.1 DETERMINISTIC AGREEMENT on a present family is not a false positive');
  const contradicting = buildRecord(V3_NEGATIVE_CONTROL, [{
    analysis: analysis('V3', {
      expertHazardCandidates: [candidate({
        hazardFamily: 'confined_space', relationshipToDeterministic: 'CONTRADICTS_DETERMINISTIC',
      })],
      disagreements: [disagreement()],
    }),
  }], []);
  const rContra = scoreM02([contradicting]);
  assert(rContra.value === 1,
    'E.DET.2 UNSUPPORTED DETERMINISTIC CONTRADICTION on a forbidden family scores as a false positive',
    value(rContra));

  // =====================================================================================
  console.log('\nF. FAIL-CLOSED GATE ADJUDICATION\n');
  // =====================================================================================

  const emptyVerdicts = adjudicateFamilies(scoreAllMeasures([], []));
  assert(emptyVerdicts.length === 4 && emptyVerdicts.every(v => !v.passed),
    'F.1 with nothing measured, every gated family FAILS -- an unmeasured gate is not a passed one');
  assert(emptyVerdicts.every(v => v.failedGateIds.length > 0),
    'F.2 and each family names the gates that failed');
  assert(!Object.prototype.hasOwnProperty.call(emptyVerdicts[0], 'overall')
      && !Object.prototype.hasOwnProperty.call(emptyVerdicts[0], 'score'),
    'F.3 there is still no aggregate field to hide a safety failure in');

  const report = buildScoringReport([m03Broken], []);
  assert(report.failedGates.some(g => g.id === 'M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY'),
    'F.4 a single merge violation fails M03 and appears individually in the report');
  assert(report.failedGates.every(g => g.reason !== undefined),
    'F.5 every failed gate carries a state and a reason, so no failure is a bare number');
  assert(report.measuresUnmeasured.length > 0 && report.measuresNoOpportunity !== undefined,
    'F.6 unmeasured and no-opportunity measures are listed separately, never merged');
  assert(!('aggregate' in report) && !('score' in report),
    'F.7 the report itself has no aggregate');

  // =====================================================================================
  console.log('\nG. THE HARNESS MAKES NO CALL, AND CANNOT\n');
  // =====================================================================================

  const disabled = await runFormalCohort(VALIDATION_ROWS, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: ['BASE', 'PERMUTED', 'CROSS_PROCESS'], processId: 'proc-validation',
    nowIso: '2026-08-31T00:00:00.000Z',
  });
  assert(disabled.stopReason === 'PROVIDER_EXECUTION_DISABLED',
    'G.1 a DISABLED run stops for exactly that reason', disabled.stopReason);
  assert(disabled.rowProblems.length === 0, 'G.2 every validation row passed freeze-time validation');
  assert(disabled.requestsBuilt.length === VALIDATION_ROWS.length * 3,
    'G.3 every request was CONSTRUCTED through the canonical path without being sent',
    String(disabled.requestsBuilt.length));
  assert(disabled.records.every(r => r.calls.length === 0),
    'G.4 and no call record exists, because no call happened');
  assert(disabled.scoring === null,
    'G.5 a DISABLED run produces NO score -- development material may not yield a gate result');
  assert(providerInvocationCount() === 0,
    'G.6 HOSTED_CALLS = 0, measured by the harness\'s own counter rather than asserted',
    String(providerInvocationCount()));

  let refusedProvider = false;
  try {
    await runFormalCohort([V1_FULL_OPPORTUNITY], {
      mode: 'DISABLED', provider: {} as never, callCeiling: 1, spendCeilingUsd: 1,
      arms: ['BASE'], processId: 'p', nowIso: '2026-08-31T00:00:00.000Z',
    });
  } catch { refusedProvider = true; }
  assert(refusedProvider,
    'G.7 DISABLED mode REFUSES a provider -- a harness that accepts one cannot prove it did not use it');

  let refusedMissing = false;
  try {
    await runFormalCohort([V1_FULL_OPPORTUNITY], {
      mode: 'ENABLED', callCeiling: 1, spendCeilingUsd: 1,
      arms: ['BASE'], processId: 'p', nowIso: '2026-08-31T00:00:00.000Z',
    });
  } catch { refusedMissing = true; }
  assert(refusedMissing, 'G.8 ENABLED mode requires an explicit provider');

  const invalidRun = await runFormalCohort(INVALID_ROWS, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0, arms: ['BASE'],
    processId: 'p', nowIso: '2026-08-31T00:00:00.000Z',
  });
  assert(invalidRun.stopReason === 'COHORT_INVALID' && invalidRun.requestsBuilt.length === 0,
    'G.9 an invalid cohort stops BEFORE a request is built, let alone sent', invalidRun.stopReason);

  const det2 = runDeterministicSide(V1_FULL_OPPORTUNITY);
  assert(det2.familiesEmitted.length > 0,
    'G.10 the REAL deterministic engine ran and emitted families, at $0.00 and with no database',
    det2.familiesEmitted.join(','));
  assert(det2.analysisState.findingMetadataByKey !== undefined
      && Object.keys(det2.analysisState.findingMetadataByKey!).length === 0,
    'G.11 the harness supplies NO evaluation-only finding metadata to the model-facing state');
  assert(providerInvocationCount() === 0, 'G.12 still zero provider invocations after every check');

  // =====================================================================================
  console.log('\nI. COMPOSITION REQUIREMENTS AND CALL TOPOLOGY ARE DERIVED, NOT CHOSEN\n');
  // =====================================================================================

  for (const req of FORMAL_COHORT_COMPOSITION_REQUIREMENTS) {
    const ruleMin = minimumDenominatorFor(req.measureId);
    if (ruleMin === null) continue;
    assert(req.minimumOpportunities === ruleMin,
      `I.1 ${req.measureId}: the stated minimum equals the sizing rule`,
      `${req.minimumOpportunities} vs ${ruleMin}`);
  }
  assert(FORMAL_COHORT_COMPOSITION_REQUIREMENTS.length === 17,
    'I.2 every measure has a stated denominator source and opportunity floor');
  const outputDependent = FORMAL_COHORT_COMPOSITION_REQUIREMENTS
    .filter(r => r.source === 'MODEL_OUTPUT_DEPENDENT').map(r => r.measureId);
  assert(outputDependent.length === 3,
    'I.3 exactly three denominators are model-output-dependent and are named as such',
    outputDependent.join(','));
  assert(MINIMUM_DEFENSIBLE_ROWS >= (minimumDenominatorFor('M06_UNSUPPORTED_REGULATORY_ASSERTIONS') ?? 0)
      && MINIMUM_DEFENSIBLE_ROWS >= (minimumDenominatorFor('M14_ORDER_SENSITIVITY') ?? 0),
    'I.4 the minimum row count satisfies the two binding row-level constraints (M06 and M14)');
  assert(RECOMMENDED_CALL_TOPOLOGY.minimum.plannedCalls
      >= (minimumDenominatorFor('M13_PROVIDER_CALLABILITY') ?? 0),
    'I.5 the minimum topology already satisfies M13\'s 100-call floor',
    String(RECOMMENDED_CALL_TOPOLOGY.minimum.plannedCalls));
  assert(RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling > RECOMMENDED_CALL_TOPOLOGY.preferred.plannedCalls,
    'I.6 the hard ceiling sits above the preferred plan, so a designed run is never stopped by it');
  assert(conservativeMaximumSpendUsd(RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling)
      <= RECOMMENDED_CALL_TOPOLOGY.conservativeMaximumSpendUsd,
    'I.7 the declared conservative maximum covers the computed worst case',
    `${conservativeMaximumSpendUsd(200)} vs ${RECOMMENDED_CALL_TOPOLOGY.conservativeMaximumSpendUsd}`);
  // Tolerance is 1e-4 rather than exact because the recorded token means are rounded to whole
  // tokens; the fit itself reproduces every individual recorded cost with a zero residual.
  const meanResidual = Math.abs(projectedCostUsd(MEASURED_COST_MODEL.observedMeanInputTokens,
    MEASURED_COST_MODEL.observedMeanOutputTokens) - MEASURED_COST_MODEL.observedMeanCostUsd);
  assert(meanResidual < 1e-4,
    'I.8 the fitted cost model reproduces the MEASURED mean call cost from the real run',
    `residual ${meanResidual}`);

  const comp = evaluateComposition(VALIDATION_ROWS, {}, 'minimum');
  assert(!comp.rowCountSufficient && comp.gaps.length > 0,
    'I.9 the six development rows are correctly judged INSUFFICIENT as a formal cohort -- the '
    + 'checker is not a rubber stamp', `${comp.rowCount} rows, ${comp.gaps.length} gaps`);
  assert(comp.gaps.some(g => g.caseClass === 'GOVERNED_RECORD_SUPPLIED'),
    'I.10 and it names the binding shortfall');

  // =====================================================================================
  console.log('\nH. FROZEN HASHES\n');
  // =====================================================================================

  const hashOf = (obj: unknown) =>
    createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
  console.log(`      measurement contract   ${hashOf(EXPERT_MEASUREMENT_CONTRACT.map(s => ({ ...s }))) }`);
  console.log(`      adjudication rubrics   ${hashOf(EXPERT_ADJUDICATION_RUBRICS)}`);
  console.log(`      validation rows        ${hashOf(VALIDATION_ROWS)}`);
  console.log(`      spec/plan agreement    ${contractProblems.length === 0 ? 'PROVEN' : 'BROKEN'}`);

  console.log('\n--- VALIDATION MATRIX ---');
  const sections = Array.from(new Set(matrix.map(m => m.section)));
  for (const s of sections) {
    const rows = matrix.filter(m => m.section === s);
    console.log(`  ${s.padEnd(8)} ${rows.filter(r => r.ok).length}/${rows.length}`);
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  console.log(`HOSTED_CALLS = ${providerInvocationCount()}   RESERVED_MATERIAL_OPENED = FALSE   FORMAL_COHORT_SPENT = FALSE`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
