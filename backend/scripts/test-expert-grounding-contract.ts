/**
 * EXPERT HAZLENZ -- §105. The four defects the §104 hosted probe PROVED, frozen as deterministic
 * cases so they cannot come back silently.
 *
 * ==================== WHY THESE ARE DETERMINISTIC AND NOT MODEL CALLS ====================
 *
 * §104 measured the defects against a hosted model. A regression suite that re-measured them the
 * same way would be a spend gate and a flake gate at once, and it would prove nothing on a day the
 * provider happened to answer well. What can be frozen deterministically is the CONTRACT PROPERTY
 * each defect violated -- what the schema demands, what the boundary accepts, and what it refuses --
 * and that is what this file asserts. The model-facing half is measured separately and at zero cost
 * by `probe:expert-grounding-repair`.
 *
 * A -- a clarification must survive with NO candidate beside it.
 * B -- three collections must be able to populate in ONE response, none subsuming another.
 * C -- an empty string must not reach the boundary, and a negative control must stay empty.
 * D -- grounding must be DECLARED, and a false declaration must fail closed.
 *
 * NO PROVIDER IS CALLED. $0.00.
 */

import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_GROUNDING_STATUSES, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  ANALYSIS_FATAL_REASONS, normalizeExpertOutput,
} from '../src/safescope-v2/expert-hazlenz/expert-normalization';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}`); }
}

const NOW = '2026-08-30T00:00:00.000Z';
const OBS = 'An extension cord ran through standing water to a sump pump while a worker reached '
  + 'into the pump housing to clear a blockage.';

function input(): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: 'g-1',
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
    inspectionContext: { location: 'Plant 2', task: 'walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['electrical', 'wet_environment', 'confined_space', 'machine_guarding'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  };
}

const wire = (over: Record<string, unknown> = {}) => ({
  outcome: 'ANALYZED',
  expertHazardCandidates: [], decisionCriticalClarifications: [],
  crossHazardInsights: [], disagreements: [],
  expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  ...over,
});

const cand = (over: Record<string, unknown> = {}) => ({
  candidateKey: 'c1', hazardFamily: 'electrical', assertedConditionState: 'UNKNOWN',
  groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
  evidenceBasis: 'b', reasoning: 'r', confidence: 'LOW',
  relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: true,
  ...over,
});

const clar = (id = 'q1') => ({
  clarificationId: id, question: 'Is the circuit de-energized?',
  whyItMatters: 'it decides whether work may proceed', affectedDecision: 'HAZARD_EXISTENCE',
  criticality: 'BLOCKING', evidenceGap: 'the energization state is not stated',
});

const insight = () => ({
  insightId: 'i1', interactionKind: 'ELECTRICAL_WET_ENVIRONMENT', participants: ['electrical', 'wet_environment'],
  reasoning: 'water lowers the threshold for electrical injury', confidence: 'HIGH',
});

const run = (over: Record<string, unknown>) =>
  normalizeExpertOutput(bindWireAnalysis(wire(over), input()).raw, input(), NOW);

console.log('§105 EXPERT GROUNDING + ROUTING CONTRACT — deterministic, zero provider calls\n');

// ============================================================ A. independent clarification
console.log('--- A. a clarification survives with NO candidate beside it');
{
  const r = run({ expertHazardCandidates: [], decisionCriticalClarifications: [clar()] });
  assert(r.state === 'VALID', 'A.1 a zero-candidate response is VALID');
  assert(r.validated!.analysis.expertHazardCandidates.length === 0,
    'A.2 the candidate list is genuinely empty');
  assert(r.validated!.analysis.decisionCriticalClarifications.length === 1,
    'A.3 and the clarification SURVIVED — it does not depend on a candidate existing');

  const schema = JSON.parse(JSON.stringify(buildExpertWireSchema(input())));
  const clarDesc = String(schema.properties.decisionCriticalClarifications.description);
  // §139 RE-ANCHORED, NOT RELAXED. A.4 used to match the literal phrase "populate this even when
  // the hazard list is empty". The PROPERTY it protects -- blueprint 39.5.1, a clarification must
  // not require a candidate -- is unchanged and is still asserted here. The phrase moved because
  // §137 measured it as one of five statements pushing the model to POPULATE the collection (165
  // clarifications against 20 authored gaps), against a single sentence discouraging it. Keeping a
  // regex that can only be satisfied by re-adding an overproduction instruction would have made the
  // test enforce the defect. So A.4 now proves the invariant BEHAVIOURALLY as well as textually,
  // which is strictly stronger than matching one sentence: A.1-A.3 above already showed a
  // candidate-free clarification surviving the real boundary.
  assert(/independent of hazards/i.test(clarDesc) && /with no candidate/i.test(clarDesc),
    'A.4 the SCHEMA states the independence invariant, so a model reading only the schema learns it');
  assert(/empty by default/i.test(clarDesc),
    'A.4b and the SCHEMA states empty-by-default, so independence is not read as an invitation');
  assert(EXPERT_SYSTEM_PROMPT.includes('This list does NOT need a hazard candidate'),
    'A.5 the prompt says so too');
}

// ============================================================ B. sibling emission
console.log('\n--- B. three collections populate independently in ONE response');
{
  const r = run({
    expertHazardCandidates: [cand()], decisionCriticalClarifications: [clar()],
    crossHazardInsights: [insight()],
  });
  const a = r.validated!.analysis;
  assert(r.state === 'VALID', 'B.1 the multi-collection response is VALID');
  assert(a.expertHazardCandidates.length === 1 && a.decisionCriticalClarifications.length === 1
    && a.crossHazardInsights.length === 1,
    'B.2 all three SURVIVED together — no field subsumes or suppresses a sibling');

  const schema = JSON.parse(JSON.stringify(buildExpertWireSchema(input())));
  const props = Object.keys(schema.properties);
  for (const c of ['expertHazardCandidates', 'decisionCriticalClarifications',
                   'crossHazardInsights', 'disagreements']) {
    assert(props.includes(c) && schema.required.includes(c),
      `B.3 ${c} is a required sibling of the others`);
  }
}

// ============================================================ C. ordering + emptiness
console.log('\n--- C. outcome is decided LAST, and an empty string never reaches the boundary');
{
  const schema = JSON.parse(JSON.stringify(buildExpertWireSchema(input())));
  const props = Object.keys(schema.properties);
  // THE §105 ORDERING REPAIR. Structured decoding emits properties in schema order, so `outcome`
  // first meant the producer committed before it had enumerated anything. §104 measured hosted R1
  // and R5 returning every collection empty, and 27/27 local NOTHING_TO_ADD alongside populated
  // collections. This assertion is the repair, frozen.
  assert(props.indexOf('outcome') === props.length - 1,
    'C.1 outcome is the LAST property — a consequence of the lists, not a commitment before them');
  for (const c of ['expertHazardCandidates', 'decisionCriticalClarifications', 'crossHazardInsights']) {
    assert(props.indexOf(c) < props.indexOf('outcome'),
      `C.2 ${c} is decided BEFORE outcome`);
  }

  const candProps = schema.properties.expertHazardCandidates.items.properties;
  assert(candProps.reasoning.minLength === 1 && candProps.evidenceBasis.minLength === 1,
    'C.3 required candidate strings carry minLength:1 — the transport refuses what the boundary would');
  const clarProps = schema.properties.decisionCriticalClarifications.items.properties;
  assert(clarProps.question.minLength === 1 && clarProps.whyItMatters.minLength === 1,
    'C.4 required clarification strings carry minLength:1');

  // The boundary's own refusal is unchanged and still independent of the schema.
  const empty = run({ expertHazardCandidates: [cand({ reasoning: '' })] });
  assert(empty.validated!.analysis.expertHazardCandidates.length === 0
    && empty.issues.some(i => i.code === 'CANDIDATE_MALFORMED'),
    'C.5 and an empty string that arrives anyway is STILL refused at the boundary');

  const negative = run({});
  assert(negative.state === 'VALID' && negative.validated!.analysis.expertHazardCandidates.length === 0
    && negative.validated!.analysis.decisionCriticalClarifications.length === 0,
    'C.6 a genuinely empty response is VALID — the negative control is not forced to invent');

  const inconsistent = run({ outcome: 'NOTHING_TO_ADD', decisionCriticalClarifications: [clar()] });
  assert(inconsistent.issues.some(i => i.code === 'OUTCOME_INCONSISTENT_WITH_CONTENT'),
    'C.7 NOTHING_TO_ADD carrying content is RECORDED as an inconsistency');
  assert(inconsistent.state === 'VALID'
    && inconsistent.validated!.analysis.decisionCriticalClarifications.length === 1,
    'C.8 but it is not fatal and the content is not discarded over a label');
  assert(!ANALYSIS_FATAL_REASONS.includes('OUTCOME_INCONSISTENT_WITH_CONTENT'),
    'C.9 the label mismatch is explicitly NOT fatal');
}

// ============================================================ D. grounding
console.log('\n--- D. grounding is DECLARED, and a false declaration fails closed');
{
  const schema = JSON.parse(JSON.stringify(buildExpertWireSchema(input())));
  const req = schema.properties.expertHazardCandidates.items.required as string[];
  assert(req.includes('groundingStatus') && req.includes('evidence'),
    'D.1 a candidate MUST declare grounding and MUST carry the evidence key');
  assert(EXPERT_GROUNDING_STATUSES.length === 2,
    'D.2 there are exactly two declarations — no third, silent option');

  // Grounding is required only where it is semantically meaningful. Nothing else gained a field.
  for (const c of ['decisionCriticalClarifications', 'crossHazardInsights', 'disagreements']) {
    const r2 = schema.properties[c].items.required as string[];
    assert(!r2.includes('groundingStatus') && !r2.includes('evidence'),
      `D.3 ${c} is NOT forced to carry evidence — no fake grounding on a non-observational object`);
  }

  const quoted = run({ expertHazardCandidates: [cand({
    groundingStatus: 'EXACT_QUOTE_SUPPLIED',
    evidence: [{ sourceId: 'obs-1', quotedText: 'standing water' }] })] });
  const ref = quoted.validated!.analysis.expertHazardCandidates[0].evidence[0];
  assert(quoted.state === 'VALID' && ref.startOffset === OBS.indexOf('standing water'),
    'D.4 an honest exact quote binds and the candidate is GROUNDED');

  const survives = run({ expertHazardCandidates: [cand()] });
  assert(survives.state === 'VALID'
    && survives.validated!.analysis.expertHazardCandidates.length === 1
    && survives.validated!.analysis.expertHazardCandidates[0].evidence.length === 0,
    'D.5 NO_EXACT_QUOTE_AVAILABLE still RAISES the candidate, ungrounded — §101 cannot return');

  const claimedNotSupplied = run({
    expertHazardCandidates: [cand({ groundingStatus: 'EXACT_QUOTE_SUPPLIED', evidence: [] })],
    decisionCriticalClarifications: [clar()] });
  assert(claimedNotSupplied.issues.some(i => i.code === 'GROUNDING_CLAIM_UNSUPPORTED')
    && claimedNotSupplied.validated!.analysis.expertHazardCandidates.length === 0,
    'D.6 claiming a quote and supplying none FAILS CLOSED — the candidate does not cross');
  assert(claimedNotSupplied.validated!.analysis.decisionCriticalClarifications.length === 1,
    'D.6b and the refusal is ITEM-SCOPED — honest siblings are not destroyed with the liar');

  const deniedButSupplied = run({ expertHazardCandidates: [cand({
    groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE',
    evidence: [{ sourceId: 'obs-1', quotedText: 'standing water' }] })] });
  assert(deniedButSupplied.issues.some(i => i.code === 'GROUNDING_CLAIM_UNSUPPORTED')
    && deniedButSupplied.validated!.analysis.expertHazardCandidates.length === 0,
    'D.7 declaring no quote and then supplying one is equally a false declaration');

  // ADVERSARIAL: fabricated. Absent from the source even after aggressive normalization.
  const fabricated = run({ expertHazardCandidates: [cand({
    groundingStatus: 'EXACT_QUOTE_SUPPLIED',
    evidence: [{ sourceId: 'obs-1', quotedText: 'a phrase that is definitely not present' }] })] });
  assert(fabricated.state === 'REJECTED'
    && fabricated.issues.some(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS'),
    'D.8 a FABRICATED quote still fails closed — the §105 rule sits beside that check, not over it');

  // ADVERSARIAL: unbindable paraphrase. Real words, real meaning, not a verbatim span.
  const paraphrase = run({ expertHazardCandidates: [cand({
    groundingStatus: 'EXACT_QUOTE_SUPPLIED',
    evidence: [{ sourceId: 'obs-1', quotedText: 'a cord running through water' }] })] });
  assert(paraphrase.state === 'REJECTED'
    && paraphrase.issues.some(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS'),
    'D.9 an UNBINDABLE paraphrase is refused — approximate matching is never accepted');

  const bindStat = bindWireAnalysis(wire({ expertHazardCandidates: [cand({
    groundingStatus: 'EXACT_QUOTE_SUPPLIED',
    evidence: [{ sourceId: 'obs-1', quotedText: 'a cord running through water' }] })] }), input());
  const kept = (bindStat.raw.expertHazardCandidates as any[])[0].evidence[0];
  assert(kept.quotedText === 'a cord running through water' && kept.startOffset === -1,
    'D.10 and the attempted text is PRESERVED for the operator, never tidied away');

  const badStatus = run({ expertHazardCandidates: [cand({ groundingStatus: 'MAYBE' })] });
  assert(badStatus.issues.some(i => i.code === 'GROUNDING_STATUS_INVALID')
    && badStatus.validated!.analysis.expertHazardCandidates.length === 0,
    'D.11 an unrecognised declaration drops the candidate');
  assert(badStatus.state === 'VALID',
    'D.12 but bad FORMATTING is not an unfounded ASSERTION, so it is not fatal');
  assert(!ANALYSIS_FATAL_REASONS.includes('GROUNDING_CLAIM_UNSUPPORTED')
    && !ANALYSIS_FATAL_REASONS.includes('GROUNDING_STATUS_INVALID'),
    'D.13 neither §105 code is fatal — a false claim kills its candidate, not the analysis');
  assert(ANALYSIS_FATAL_REASONS.includes('EVIDENCE_OUT_OF_BOUNDS')
    && ANALYSIS_FATAL_REASONS.includes('EVIDENCE_TEXT_MISMATCH'),
    'D.13b and the PRE-EXISTING evidence rules are untouched — §105 added, it did not relax');

  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'D.14 the NORMALIZED contract is unchanged — only the wire form moved');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log(`  FAILED: ${f}`); process.exit(1); }
