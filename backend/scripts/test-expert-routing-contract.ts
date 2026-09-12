/**
 * EXPERT HAZLENZ -- ROUTING CONTRACT AND METRIC. Deterministic; no provider, no network.
 *
 * THIS SUITE VALIDATES THE INSTRUMENT BEFORE THE INSTRUMENT IS POINTED AT A MODEL.
 *
 * A routing metric that cannot distinguish a correct silence from a miss would score the negative
 * controls as failures and reward a model for filling every list. So section B feeds the scorer
 * hand-built analyses whose right answer is known and asserts all four verdicts, and section C
 * replays the §100 defect shape and asserts the metric catches it.
 *
 * Sections:
 *   A. the v2 contract change      -- the duplicate free-text homes are gone
 *   B. the four verdicts           -- correct/incorrect x empty/populated
 *   C. EXPLANATION_ONLY_LOSS       -- detected when real, silent when not
 *   D. quote binding, fail-closed  -- the §100 invariant, still tested
 *   E. the fixture set             -- seven fixtures, two of them negative controls
 *
 * Run: npx ts-node scripts/test-expert-routing-contract.ts
 */
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysis, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  ROUTING_COLLECTIONS, scoreRouting, totalRouting,
  type ConceptProbe, type RoutingExpectations,
} from '../src/safescope-v2/expert-hazlenz/expert-routing-metrics';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  expertPromptIdentity, expertPromptIdentityMismatches,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/safescope-v2/expert-hazlenz/expert-normalization';

let passed = 0, failed = 0;
const assert = (c: unknown, m: string) => { if (c) { passed++; console.log(`ok    ${m}`); } else { failed++; console.log(`FAIL  ${m}`); } };
const section = (t: string) => console.log(`\n--- ${t}`);

const NOW = '2026-08-29T00:00:00.000Z';
const OBS = 'An extension cord ran through standing water to a sump pump while a worker reached into '
  + 'the pump housing to clear a blockage.';

const input = (over: Partial<ExpertAnalysisInput> = {}): ExpertAnalysisInput => ({
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'a-1',
  authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
  inspectionContext: { location: 'plant', task: 'walkthrough' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['electrical', 'confined_space', 'wet_environment'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
  ...over,
});

const analysis = (over: Partial<ExpertAnalysis> = {}): ExpertAnalysis => ({
  contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
  analysisId: 'a-1',
  outcome: 'ANALYZED',
  expertHazardCandidates: [],
  decisionCriticalClarifications: [],
  crossHazardInsights: [],
  disagreements: [],
  expertExplanation: { summary: 'nothing notable.' },
  uncertainty: { statements: [] },
  ...over,
});

const clarification = (id: string, question: string) => ({
  clarificationId: id, question, whyItMatters: 'it changes the finding',
  affectedDecision: 'HAZARD_EXISTENCE' as const, criticality: 'BLOCKING' as const,
  evidenceGap: 'not stated in the observation',
});

const insight = (id: string, reasoning: string) => ({
  insightId: id, interactionKind: 'ELECTRICAL_WET_ENVIRONMENT' as const,
  participants: ['electrical', 'wet_environment'], reasoning, confidence: 'HIGH' as const,
});

const candidate = (key: string, family: string, reasoning: string) => ({
  candidateKey: key, hazardFamily: family, assertedConditionState: 'UNKNOWN' as const,
  groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE' as const,
  evidence: [], evidenceBasis: 'stated in the observation', reasoning,
  confidence: 'MODERATE' as const, relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC' as const,
  requiresUserConfirmation: true,
});

const expectations = (
  a: RoutingExpectations['expertHazardCandidates'], b: RoutingExpectations['decisionCriticalClarifications'],
  c: RoutingExpectations['crossHazardInsights'], d: RoutingExpectations['disagreements'],
): RoutingExpectations => ({
  expertHazardCandidates: a, decisionCriticalClarifications: b,
  crossHazardInsights: c, disagreements: d,
});

const LOTO_PROBE: ConceptProbe = {
  label: 'isolation / LOTO unknown', collection: 'decisionCriticalClarifications',
  pattern: /lock\s?out|lockout|isolat|de-?energi/i,
};
const INTERACTION_PROBE: ConceptProbe = {
  label: 'water + electrical', collection: 'crossHazardInsights',
  pattern: /(water|wet)[\s\S]{0,80}(electric|electrocut)|(electric|electrocut)[\s\S]{0,80}(water|wet)/i,
};

(function main() {
  // =====================================================================================
  section('A. the v2 contract change — the duplicate homes are gone');
  // =====================================================================================

  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'A.1 the analysis contract is v2 (subtractive change, so the version moved)');
  // v8 (§141 linkage contract). This literal has now moved v6 -> v7 -> v8, each time because a
  // SEPARATELY AUTHORIZED operation revised the prompt. It is re-anchored, never relaxed: the
  // property A.2 protects -- a recorded probe names the prompt version it actually ran under --
  // is unchanged, and A.2b below still pins the CONTENT hashes, which is what a label cannot do.
  // §147 moved it again, v9 -> v10, for the clarification-recall remediation, and §148 v10 -> v11
  // for the settlement-threshold narrowing and the affectedDecision routing disclosure.
  // §149 moved it again, v11 -> v12, for the unsupported-settlement repair.
  // §150 moved it again, v12 -> v13, for the retention-bridge repair.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15', 'A.2 the prompt is v15');
  // A.2b is NEW in §139 and makes A.2 stronger rather than replacing it. §138 established that the
  // LABEL alone does not identify the prompt -- three files declared v6 and two of them differed in
  // both the system prompt and the wire schema, which is why a preserved same-input probe had to be
  // refused as a control. A label pin can therefore pass while behaviour has moved underneath it;
  // the hashes cannot.
  {
    const id = expertPromptIdentity(input());
    assert(/^[0-9a-f]{64}$/.test(id.systemPromptSha256) && /^[0-9a-f]{64}$/.test(id.wireSchemaSha256),
      'A.2b prompt identity carries BOTH content hashes, not only the label');
    assert(expertPromptIdentityMismatches(id, id).length === 0,
      'A.2c an identity compares equal to itself');
    assert(expertPromptIdentityMismatches(
      { ...id, systemPromptSha256: 'x'.repeat(64) }, id).length === 1,
      'A.2d a moved system prompt is DETECTED even when the version label is unchanged');
    assert(expertPromptIdentityMismatches(
      { ...id, wireSchemaSha256: 'x'.repeat(64) }, id).length === 1,
      'A.2e a moved wire schema is DETECTED even when the version label is unchanged');
  }

  // v4 (§105). A.13 and A.15 asserted the v3 rule that `evidence` is NOT required. That rule went
  // STALE when §105 made grounding a required DECLARATION -- stale in the repository's precise
  // sense, the way G14 did in §103.4, not wrong-and-inconvenient. Deleting them or loosening them
  // would both have been wrong, because the PROPERTY they protect is still the one that matters:
  // §101 attempt 1 demanded a quote from every candidate and suppressed the entire collection, and
  // nothing here may bring that back. So they keep their strength and gain precision, and now prove
  // the property DIRECTLY -- that an unquotable hazard still survives the boundary -- instead of
  // proving it indirectly by the absence of a `required` entry. Nothing that used to fail passes.
  const candidateRequired = JSON.parse(JSON.stringify(buildExpertWireSchema(input())))
    .properties.expertHazardCandidates.items.required as string[];
  assert(candidateRequired.includes('groundingStatus') && candidateRequired.includes('evidence'),
    'A.13a a candidate must DECLARE its grounding — silence is no longer a legal answer');
  const unquotable = bindWireAnalysis({
    outcome: 'ANALYZED',
    expertHazardCandidates: [{
      candidateKey: 'u1', hazardFamily: 'electrical', assertedConditionState: 'UNKNOWN',
      groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
      evidenceBasis: 'inferred from context', reasoning: 'r', confidence: 'LOW',
      relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: true,
    }],
    decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
    expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  }, input());
  const unquotableResult = normalizeExpertOutput(unquotable.raw, input(), NOW);
  assert(unquotableResult.state === 'VALID'
    && unquotableResult.validated!.analysis.expertHazardCandidates.length === 1,
    'A.13 an unquotable hazard is still RAISED, not dropped — the §101 suppression cannot return');
  assert(candidateRequired.includes('reasoning') && candidateRequired.includes('hazardFamily'),
    'A.14 everything else about a candidate is still required');
  assert(EXPERT_SYSTEM_PROMPT.includes('NO_EXACT_QUOTE_AVAILABLE')
    && EXPERT_SYSTEM_PROMPT.includes('still raised, still reaches the reviewer'),
    'A.15 the prompt says so too, so the schema and the prompt cannot disagree');
  assert(EXPERT_SYSTEM_PROMPT.includes('an invented') && EXPERT_SYSTEM_PROMPT.includes('quote is rejected'),
    'A.16 and an INVENTED quote is still refused — the safety rule did not move');

  // The three free-text twins must be gone from the schema the provider is handed.
  const schema = JSON.stringify(buildExpertWireSchema(input()));
  for (const gone of ['whatMatters', 'whatIsMissing', 'howConditionsInteract']) {
    assert(!schema.includes(gone), `A.3 the wire schema no longer offers "${gone}"`);
  }
  assert(schema.includes('summary'), 'A.4 the schema still offers a synthesis summary');

  // And a provider that still sends them has them DROPPED, not carried through.
  const legacyShaped = normalizeExpertOutput({
    ...analysis(),
    expertExplanation: {
      summary: 'ok', whatMatters: ['a'], whatIsMissing: ['b'], howConditionsInteract: ['c'],
    },
  }, input(), NOW);
  assert(legacyShaped.state === 'VALID', 'A.5 a v1-shaped explanation still validates (summary is present)');
  assert(JSON.stringify(legacyShaped.validated?.analysis.expertExplanation) === '{"summary":"ok"}',
    'A.6 the v1 free-text twins are DROPPED at the boundary, not carried');

  // The schema must actually describe the distinctions the model has to make.
  //
  // §139 RE-ANCHORED, NOT RELAXED. Two needles were the worked-example questions "de-energized" and
  // "lockout/tagout". The property -- the schema teaches the distinctions rather than assuming them
  // -- is unchanged and is now tested against MORE schema guidance, not less: §138 verified that
  // all six `affectedDecision` members were undefined everywhere, and §137 measured those two
  // example questions being reproduced in 35 of 165 emitted clarifications. A needle that can only
  // be satisfied by restoring a measured overproduction driver would make this test enforce the
  // defect it exists to catch, so the needles now anchor on the DEFINITIONS that replaced them.
  for (const needle of ['Independent of hazards',
                        'worse together', 'Adding new context is NOT a disagreement',
                        'Not an overflow channel']) {
    assert(schema.includes(needle), `A.7 the schema states the distinction: "${needle}"`);
  }
  // A.7b: every affectedDecision member is now DEFINED in the schema, and the collision pairs the
  // audit measured are decided explicitly. This is the §139 repair, asserted where it must hold.
  for (const needle of ['HAZARD_EXISTENCE = does the hazardous condition exist',
                        'HAZARD_SEVERITY = the hazard exists',
                        'EXPOSURE = who or what is exposed',
                        'APPLICABILITY = whether a rule',
                        'REQUIRED_CONTROL = which control is required',
                        'REGULATORY_INTERPRETATION = what a SUPPLIED governed record means',
                        'is REQUIRED_CONTROL, not HAZARD_EXISTENCE']) {
    assert(schema.includes(needle), `A.7b the schema DEFINES the decision label: "${needle}"`);
  }
  assert(!/additional information|optional insights/i.test(schema),
    'A.8 no vague "additional information" / "optional insights" description survives');

  // The prompt gives an explicit ordered procedure, and asks for no hidden reasoning.
  assert(EXPERT_SYSTEM_PROMPT.includes('Fill the typed lists FIRST'),
    'A.9 the prompt orders typed collections before the summary');
  assert(EXPERT_SYSTEM_PROMPT.includes('THE NO-LOSS RULE'), 'A.10 the no-loss rule is stated');
  assert(EXPERT_SYSTEM_PROMPT.includes('Do not narrate your reasoning process'),
    'A.11 the prompt does NOT request chain-of-thought');
  assert(EXPERT_SYSTEM_PROMPT.includes('Do not invent a hazard, a question or an interaction to fill a list'),
    'A.12 the prompt guards against over-routing as explicitly as against under-routing');

  // =====================================================================================
  section('B. the four verdicts');
  // =====================================================================================

  const req = expectations('REQUIRED', 'REQUIRED', 'REQUIRED', 'REQUIRED');
  const forb = expectations('FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN');

  const emptyOnRequired = scoreRouting('t', analysis(), req, []);
  assert(emptyOnRequired.perCollection.every(c => c.verdict === 'INCORRECT_EMPTY'),
    'B.1 REQUIRED + empty = INCORRECT_EMPTY (a routing miss)');
  assert(emptyOnRequired.misses === 4 && emptyOnRequired.hits === 0 && emptyOnRequired.opportunities === 4,
    'B.2 four misses, zero hits, four opportunities');

  const emptyOnForbidden = scoreRouting('t', analysis(), forb, []);
  assert(emptyOnForbidden.perCollection.every(c => c.verdict === 'CORRECT_EMPTY'),
    'B.3 FORBIDDEN + empty = CORRECT_EMPTY — a correct silence is a HIT, not a blank');
  assert(emptyOnForbidden.hits === 4 && emptyOnForbidden.misses === 0,
    'B.4 a correct silence scores four hits');

  const full = analysis({
    expertHazardCandidates: [candidate('e1', 'confined_space', 'the sump may be a permit space')],
    decisionCriticalClarifications: [clarification('c1', 'Was the pump isolated?')],
    crossHazardInsights: [insight('x1', 'standing water raises the electrical consequence')],
    disagreements: [{ disagreementId: 'd1', target: 'DETERMINISTIC_RESULT', surface: 'HAZARD_RECOGNITION',
      targetRef: null, disagreementType: 'MAY_BE_INCOMPLETE', reasoning: 'r', confidence: 'LOW',
      recommendsReview: false }],
  });
  const populatedOnRequired = scoreRouting('t', full, req, []);
  assert(populatedOnRequired.perCollection.every(c => c.verdict === 'CORRECT_POPULATED'),
    'B.5 REQUIRED + populated = CORRECT_POPULATED');

  const populatedOnForbidden = scoreRouting('t', full, forb, []);
  assert(populatedOnForbidden.perCollection.every(c => c.verdict === 'INCORRECT_POPULATED'),
    'B.6 FORBIDDEN + populated = INCORRECT_POPULATED (over-routing)');
  assert(populatedOnForbidden.overRouted === 4 && populatedOnForbidden.misses === 0,
    'B.7 over-routing is counted separately from missing');

  const optional = scoreRouting('t', analysis(), expectations('OPTIONAL', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'), []);
  assert(optional.opportunities === 0 && optional.perCollection.every(c => c.verdict === 'NOT_SCORED'),
    'B.8 OPTIONAL creates no opportunity — a fixture that cannot say the right answer does not vote');

  // The zero-candidate survival flag is recorded independently of the verdicts.
  const zeroCand = scoreRouting('t', analysis({
    decisionCriticalClarifications: [clarification('c1', 'Was the bay de-energized?')],
  }), req, []);
  assert(zeroCand.zeroCandidateClarificationPresent,
    'B.9 a question with zero candidates beside it is recorded as such');
  assert(!scoreRouting('t', full, req, []).zeroCandidateClarificationPresent,
    'B.10 and is NOT recorded when a candidate is present');

  const totals = totalRouting([emptyOnRequired, emptyOnForbidden]);
  assert(totals.TYPED_ROUTING_OPPORTUNITIES === 8 && totals.TYPED_ROUTING_HITS === 4
      && totals.TYPED_ROUTING_MISSES === 4,
    'B.11 totals aggregate across fixtures');
  assert(ROUTING_COLLECTIONS.every(c => totals.byCollection[c].opportunities === 2),
    'B.12 totals break down per collection');

  // =====================================================================================
  section('C. EXPLANATION_ONLY_LOSS — the §100 defect, made measurable');
  // =====================================================================================

  // The §100 shape, ported to v2: the reasoning is real and it is ONLY in free text.
  const drained = analysis({
    outcome: 'NOTHING_TO_ADD',
    expertExplanation: {
      summary: 'The combination of standing water and electrical equipment creates a high-risk '
        + 'environment for the worker reaching into the pump housing.',
    },
    uncertainty: { statements: [
      'The observation does not establish whether the worker was properly de-energized before working on the pump',
      'The observation does not establish whether proper lockout/tagout procedures were followed',
    ] },
  });
  const drainedScore = scoreRouting('t', drained, expectations('OPTIONAL', 'REQUIRED', 'REQUIRED', 'OPTIONAL'),
    [LOTO_PROBE, INTERACTION_PROBE]);
  assert(drainedScore.explanationOnlyLosses.length === 2,
    'C.1 both drained concepts are detected as EXPLANATION_ONLY_LOSSES');
  assert(drainedScore.explanationOnlyLosses.some(l => l.collection === 'decisionCriticalClarifications' && l.foundIn === 'uncertainty'),
    'C.2 the loss names the collection it belonged in and where it was found instead');
  assert(drainedScore.explanationOnlyLosses.some(l => l.collection === 'crossHazardInsights' && l.foundIn === 'summary'),
    'C.3 a summary-only interaction is a loss');
  assert(drainedScore.misses === 2, 'C.4 and the same response also scores two routing misses');

  // Routed correctly: same concepts, now in the typed collections. ZERO losses.
  const routed = analysis({
    decisionCriticalClarifications: [clarification('c1', 'Was the pump isolated and locked out before entry?')],
    crossHazardInsights: [insight('x1', 'standing water plus energized electrical raises electrocution risk')],
    expertExplanation: { summary: 'The combination of standing water and electrical equipment matters here.' },
    uncertainty: { statements: [] },
  });
  const routedScore = scoreRouting('t', routed, expectations('OPTIONAL', 'REQUIRED', 'REQUIRED', 'OPTIONAL'),
    [LOTO_PROBE, INTERACTION_PROBE]);
  assert(routedScore.explanationOnlyLosses.length === 0,
    'C.5 the SAME concepts, typed correctly, produce ZERO losses even though the summary repeats them');
  assert(routedScore.hits === 2 && routedScore.misses === 0, 'C.6 and score as hits');

  // Never raised at all: not a routing loss. That is a reasoning observation, not this metric's job.
  const silent = scoreRouting('t', analysis(), expectations('OPTIONAL', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    [LOTO_PROBE, INTERACTION_PROBE]);
  assert(silent.explanationOnlyLosses.length === 0,
    'C.7 a concept the model never raised is NOT a routing loss — the metric does not score reasoning');

  // Uncertainty count is surfaced so "uncertainty as overflow" is visible rather than inferred.
  assert(drainedScore.uncertaintyStatementCount === 2 && routedScore.uncertaintyStatementCount === 0,
    'C.8 uncertainty volume is recorded, so a catch-all channel is observable');

  // =====================================================================================
  section('D. quote binding stays fail-closed');
  // =====================================================================================

  const goodQuote = 'standing water';
  const bound = bindWireAnalysis({
    outcome: 'ANALYZED',
    expertHazardCandidates: [{
      candidateKey: 'e1', hazardFamily: 'electrical', assertedConditionState: 'ACTIVE',
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: goodQuote }],
      evidenceBasis: 'b', reasoning: 'r', confidence: 'HIGH',
      relationshipToDeterministic: 'AGREES_WITH_DETERMINISTIC', requiresUserConfirmation: false,
    }],
    decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
    expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  }, input(), );
  const boundRef = (bound.raw.expertHazardCandidates as any[])[0].evidence[0];
  assert(boundRef.startOffset === OBS.indexOf(goodQuote) && boundRef.endOffset === boundRef.startOffset + goodQuote.length,
    'D.1 a real quote binds to the correct span — the model never supplies offsets');
  assert(bound.binding.bound === 1 && bound.binding.unbindable === 0, 'D.2 binding stats count it');
  assert(normalizeExpertOutput(bound.raw, input(), NOW).state === 'VALID',
    'D.3 the bound span then passes the boundary’s own equality re-check');

  const fabricated = bindWireAnalysis({
    outcome: 'ANALYZED',
    expertHazardCandidates: [{
      candidateKey: 'e1', hazardFamily: 'electrical', assertedConditionState: 'ACTIVE',
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: 'a phrase that is definitely not in the observation' }],
      evidenceBasis: 'b', reasoning: 'r', confidence: 'HIGH',
      relationshipToDeterministic: 'AGREES_WITH_DETERMINISTIC', requiresUserConfirmation: false,
    }],
    decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
    expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  }, input());
  const fabRef = (fabricated.raw.expertHazardCandidates as any[])[0].evidence[0];
  assert(fabRef.startOffset === -1 && fabRef.endOffset === -1,
    'D.4 an unbindable quote is PRESERVED with an unresolvable span, never dropped');
  assert(fabRef.quotedText === 'a phrase that is definitely not in the observation',
    'D.5 the attempted evidence text survives for the operator to see');
  assert(fabricated.binding.unbindable === 1, 'D.6 the binder counts it as unbindable');
  const fabResult = normalizeExpertOutput(fabricated.raw, input(), NOW);
  assert(fabResult.state === 'REJECTED' && fabResult.issues.some(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS'),
    'D.7 and the boundary REJECTS it — fail closed, no fabricated offset, no cleaner-looking result');

  // =====================================================================================
  section('E. the fixture set');
  // =====================================================================================

  assert(ROUTING_FIXTURES.length === 7, 'E.1 seven routing fixtures');
  const negatives = ROUTING_FIXTURES.filter(f =>
    ROUTING_COLLECTIONS.every(c => f.expectations[c] === 'FORBIDDEN'));
  assert(negatives.length === 2, 'E.2 two of them are full negative controls (R6, R7)');
  assert(ROUTING_FIXTURES.some(f => f.expectations.crossHazardInsights === 'REQUIRED'),
    'E.3 a wet/electrical interaction fixture requires crossHazardInsights');
  assert(ROUTING_FIXTURES.some(f => f.expectations.expertHazardCandidates === 'REQUIRED'),
    'E.4 an extra-plausible-hazard fixture requires expertHazardCandidates');
  const multi = ROUTING_FIXTURES.find(f => f.id === 'R5');
  assert(multi?.expectations.expertHazardCandidates === 'REQUIRED'
      && multi?.expectations.decisionCriticalClarifications === 'REQUIRED'
      && multi?.expectations.crossHazardInsights === 'REQUIRED',
    'E.5 the multi-collection fixture requires three collections at once');
  assert(ROUTING_FIXTURES.every(f => f.input.authoritativeSources.length > 0
      && f.input.authoritativeSources[0].text.length > 20),
    'E.6 every fixture carries a real synthetic observation');
  assert(ROUTING_FIXTURES.flatMap(f => f.probes).every(p =>
      ROUTING_COLLECTIONS.includes(p.collection)),
    'E.7 every concept probe names a real collection');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
