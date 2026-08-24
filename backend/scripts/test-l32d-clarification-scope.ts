/**
 * L3-2d -- clarification scope and condition-state ladder ordering. NO NETWORK, NO DATABASE.
 *
 * Two things are pinned here, and they are pinned differently on purpose.
 *
 *   D1 is DETERMINISTIC, so it is tested by driving the real binder. A clarification on a decided
 *      state is dropped, always, and the paired fixture proves a needed one is never touched.
 *   D2 is a PROMPT change, which no offline suite can prove. What CAN be pinned offline is the
 *      structural property the repair depends on -- that the required output shape is no longer
 *      inside the ordered ladder, and that the ACTIVE rung is not out-weighed by the rung beneath
 *      it. The behavioural proof for D2 is the ablation (`ablate-l32d-prompt.ts`) and the sealed
 *      holdout; this suite stops the structure silently drifting back.
 *
 * Run: npm run test:l32d-clarification-scope
 */
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_SYSTEM_PROMPT, L3_PROMPT_VERSION } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';

let passed = 0, failed = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) { passed += 1; return; }
  failed += 1; failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};

const FAM = ['machine_guarding', 'walking_working_surfaces', 'falls', 'electrical', 'lifting_rigging', 'chemical_storage', 'loto_stored_energy'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32d', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}
function ev(input: ReasoningInput, quote: string) {
  const text = input.authoritativeSources[0].text;
  const start = text.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not verbatim: ${JSON.stringify(quote)}`);
  return { sourceId: 'observation-1', sourceType: 'observation' as const, startOffset: start, endOffset: start + quote.length, quotedText: quote };
}
function cand(o: Partial<HazardCandidate> & Pick<HazardCandidate, 'candidateKey' | 'hazardFamily' | 'conditionState' | 'evidence'>): HazardCandidate {
  return {
    conditionRationale: 'stated rationale', independentHazardRationale: 'the only hazard described',
    uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null,
    regulatoryCandidateRefs: [], ...o,
  };
}
function prop(input: ReasoningInput, c: HazardCandidate[]): ReasoningProposal {
  return {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: input.analysisId, outcome: 'ANALYZED',
    observationInterpretation: 'x', hazardCandidates: c, jurisdictionProposal: null,
  };
}
function bind(label: string, input: ReasoningInput, c: HazardCandidate[]) {
  const v = validateReasoningProposal(prop(input, c), input);
  check(`${label}: deterministic validator accepts the fixture`, v.state === 'VALID', v.issues.map(i => i.code).join(',') || 'none');
  if (!v.validated) throw new Error(`fixture never reached the binder: ${label}`);
  return bindEvidenceSemantically(v.validated, input);
}
const hz = (r: any, key: string) => r.boundHazards.find((h: any) => h.candidateKey === key);
const QUESTION = { unresolvedFact: 'f', affectedDecision: 'condition_state' as const, branches: ['a', 'b'], question: 'what exactly did you see?' };

// ================================================================ 1. D1 -- clarification scope

/**
 * The rule, stated as the contract states it: `L3-INV-06` is a DECISION-BOUNDARY invariant. Six of
 * the eight condition states ARE the decision; two say it was not made. A question on one of the six
 * is not a clarification under the contract, and is dropped. A question on one of the two is, and is
 * never touched. Every row below is one half of that pair.
 */
function clarificationScope(): void {
  // Each state needs evidence that genuinely supports it. `checkStateSupported` is an L3-2/L3-2b
  // rule this phase must not touch, and it fatally rejects a state its evidence does not carry --
  // so a one-size fixture text would test the wrong thing entirely.
  const decided: Array<[HazardCandidate['conditionState'], string, string, string]> = [
    ['ACTIVE', 'The tongue guard on the bench grinder is gone.',
      'The tongue guard on the bench grinder is gone', 'the guard is decided present-and-missing'],
    ['CONTROLLED', 'The nip point on the roller is guarded by a fixed barrier that is installed and in place.',
      'guarded by a fixed barrier that is installed and in place', 'a control is decided in place'],
    ['CORRECTED', 'The cracked guard on the saw was found and was replaced with a new one the same morning.',
      'was replaced with a new one', 'the fix is decided done'],
    ['NEGATED', 'The survey found no exposed nip points anywhere on the machine.',
      'no exposed nip points', 'the condition is decided absent'],
    ['HYPOTHETICAL', 'If the interlock were bypassed during a jam clearance an operator could reach the ribbon.',
      'If the interlock were bypassed during a jam clearance an operator could reach the ribbon', 'the sentence is decided contingent'],
    ['REMOVED_FROM_SERVICE', 'The grinder was tagged out and taken out of service pending a new wheel guard.',
      'tagged out and taken out of service', 'the equipment is decided withdrawn'],
  ];
  for (const [state, text, quote, why] of decided) {
    const input = mk(text);
    const r = bind(`scope/drop/${state}`, input, [cand({
      candidateKey: 'k1', hazardFamily: 'machine_guarding', conditionState: state,
      evidence: [ev(input, quote)],
      conditionRationale: `the observation states this ${state} condition directly`,
      clarification: QUESTION,
    })]);
    const h = hz(r, 'k1');
    if (!h) { check(`scope/drop/${state}: candidate survives to be scored (${why})`, false, `removed by ${JSON.stringify(r.rejected)}`); continue; }
    check(`scope/drop/${state}: the question is dropped (${why})`, h.clarification === null, JSON.stringify(h.clarification));
    check(`scope/drop/${state}: the hazard itself is untouched`,
      h.hazardFamily === 'machine_guarding' && h.conditionState === state && h.evidence.length === 1);
    check(`scope/drop/${state}: the drop is recorded, never silent`,
      r.clarificationsDropped.some((d: any) => d.candidateKey === 'k1' && d.conditionState === state));
    check(`scope/drop/${state}: recorded as ADVISORY, not fatal`,
      r.issues.some((i: any) => i.code === 'SEMANTIC_CLARIFICATION_ON_DECIDED_STATE' && i.severity === 'ADVISORY'));
  }

  // THE PAIRED HALF. The two undecided states keep their question, always.
  const undecidedText = 'The tongue guard on the bench grinder is gone.';
  for (const state of ['INSUFFICIENT_EVIDENCE', 'UNKNOWN'] as const) {
    const input = mk(undecidedText);
    const r = bind(`scope/keep/${state}`, input, [cand({
      candidateKey: 'k1', hazardFamily: 'machine_guarding', conditionState: state,
      evidence: [ev(input, 'The tongue guard on the bench grinder is gone')],
      clarification: QUESTION,
    })]);
    const h = hz(r, 'k1');
    check(`scope/keep/${state}: the question is kept`, !!h && !!h.clarification, JSON.stringify(h?.clarification));
    check(`scope/keep/${state}: nothing is recorded as dropped`, r.clarificationsDropped.length === 0);
  }

  // A candidate with no question is not disturbed either way.
  {
    const input = mk(undecidedText);
    const r = bind('scope/none', input, [cand({
      candidateKey: 'k1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      evidence: [ev(input, 'The tongue guard on the bench grinder is gone')],
    })]);
    check('scope/none: a candidate with no clarification is untouched', hz(r, 'k1')?.clarification === null);
    check('scope/none: nothing is recorded as dropped', r.clarificationsDropped.length === 0);
  }
}

/**
 * ORDER MATTERS. The L3-2c impression gate DEMOTES an impression-only ACTIVE to
 * INSUFFICIENT_EVIDENCE precisely so a clarification has something to travel on. If the L3-2d scope
 * rule ran before that demotion it would delete the question the demotion exists to carry, and the
 * two repairs would cancel out. This is the fixture that proves they compose.
 */
function scopeRunsAfterDemotion(): void {
  const text = 'One of the sling legs on the spreader bar may be cut.';
  const input = mk(text);
  const r = bind('compose/demotion-then-scope', input, [cand({
    candidateKey: 'k1', hazardFamily: 'lifting_rigging', conditionState: 'ACTIVE',
    evidence: [ev(input, 'One of the sling legs on the spreader bar may be cut')],
  })]);
  const h = hz(r, 'k1');
  check('compose: the impression gate still demotes rather than deletes', !!h && h.conditionState === 'INSUFFICIENT_EVIDENCE', h?.conditionState);
  check('compose: the demoted candidate KEEPS its synthesized clarification', !!h?.clarification);
  check('compose: the scope rule did not drop it', r.clarificationsDropped.length === 0);
  check('compose: no ACTIVE is asserted', !r.boundHazards.some((x: any) => x.conditionState === 'ACTIVE'));
}

// ================================================================ 2. D2 -- ladder structure

function ladderStructure(): void {
  const lines = L3_SYSTEM_PROMPT.split('\n');
  const idx = (needle: string) => lines.findIndex(l => l.includes(needle));

  const active = idx('  ACTIVE ');
  const insufficient = idx('  INSUFFICIENT_EVIDENCE ');
  const unknown = idx('  UNKNOWN ');
  check('ladder: the ordered ladder still runs ACTIVE -> INSUFFICIENT_EVIDENCE -> UNKNOWN',
    active > 0 && insufficient > active && unknown > insufficient, `${active} ${insufficient} ${unknown}`);

  const activeLines = insufficient - active;
  const insufficientLines = unknown - insufficient;
  check('ladder: the INSUFFICIENT_EVIDENCE rung no longer out-weighs the ACTIVE rung',
    insufficientLines <= activeLines, `ACTIVE ${activeLines} lines, INSUFFICIENT_EVIDENCE ${insufficientLines} lines`);

  check('ladder: the required output shape is NOT inside the ordered ladder',
    !lines.slice(active, unknown + 1).some(l => l.includes('MUST emit a candidate')),
    'the L3-2c block is back inside the ladder');
  // NOTE the ladder carries a one-line POINTER containing the same words, so the SECTION must be
  // located by its own header line, not by the first occurrence of the phrase.
  const section = idx('ASKING A QUESTION -- AND WHEN NOT TO');
  check('ladder: the required output shape exists as its own section after the ladder',
    section > unknown && L3_SYSTEM_PROMPT.includes('MUST emit a candidate'), `section at ${section}, unknown at ${unknown}`);

  // L3-2d wrote this rule as "A NEGATION GOVERNS ONLY ITS OWN CLAUSE". L3-2e GENERALISED it after a
  // clause-position ablation showed the defect was not about negation at all: removing the negation
  // from D-NG-04 changed nothing, moving the clause changed everything. The rule is now "EVALUATE
  // EVERY CLAUSE, NOT ONLY THE FIRST", with the negation sentence folded inside it. The guarantee
  // L3-2d was protecting -- a clause rule stated where the ladder is read -- is strictly broader now,
  // so the assertion is rebound to the guarantee rather than to the old header.
  const clauseRule = idx('EVALUATE EVERY CLAUSE, NOT ONLY THE FIRST');
  check('ladder: the clause-scope rule is stated where the ladder is read',
    clauseRule > unknown && clauseRule < section, `clause rule at ${clauseRule}`);
  check('ladder: the clause rule still covers negation specifically',
    /governs only its own clause/.test(L3_SYSTEM_PROMPT));
  check('ladder: the anti-retreat rule is still present',
    L3_SYSTEM_PROMPT.includes('Do NOT retreat to INSUFFICIENT_EVIDENCE when the observation plainly describes a missing control'));

  check('prompt: the prohibition names every decided state',
    ['ACTIVE', 'CONTROLLED', 'CORRECTED', 'NEGATED', 'HYPOTHETICAL', 'REMOVED_FROM_SERVICE']
      .every(st => new RegExp(`DO NOT ASK[\\s\\S]{0,200}${st}`).test(L3_SYSTEM_PROMPT)));
  check('prompt: the prohibition states the required null', L3_SYSTEM_PROMPT.includes('`clarification: null`'));
  // A version PIN, not a guarantee -- each phase that edits the prompt legitimately advances it.
  // L3-2e moved it to v5; what this row protects is that the version is declared and moves forward.
  check('prompt: version is declared and has advanced past v3',
    /^hazlenz\.l3\.prompt\.v[4-9]/.test(L3_PROMPT_VERSION), L3_PROMPT_VERSION);

  // L3-2b/L3-2c prompt guarantees that must survive.
  check('prompt: the verbatim-quotation rule survives', /copied VERBATIM/.test(L3_SYSTEM_PROMPT));
  check('prompt: the governing-negation quoting rule survives', /MUST include any negation or control word/.test(L3_SYSTEM_PROMPT));
  check('prompt: RC-08\'s own sentence is still the worked example', /safety net or personal fall arrest system in use/.test(L3_SYSTEM_PROMPT));
  check('prompt: impressions-are-not-conditions survives', /IMPRESSIONS ARE NOT CONDITIONS/.test(L3_SYSTEM_PROMPT));
  check('prompt: the do-not-overcorrect counterweight survives', /BUT DO NOT OVERCORRECT/.test(L3_SYSTEM_PROMPT));
  check('prompt: no analysis id is emitted (L3-2b R5 reproducibility fix)', !/ANALYSIS ID/.test(L3_SYSTEM_PROMPT));
  check('prompt: no regulatory authority is granted', /You have NO authority over regulations/.test(L3_SYSTEM_PROMPT));
}

// ================================================================ 3. L3-2c mechanisms untouched

function l32cUntouched(): void {
  // H-AM-05: gate polarity, no condition vocabulary consulted.
  {
    const t = 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.';
    const input = mk(t);
    const r = bind('untouched/H-AM-05', input, [cand({
      candidateKey: 'k1', hazardFamily: 'walking_working_surfaces', conditionState: 'ACTIVE',
      evidence: [ev(input, t.replace(/\.$/, ''))],
    })]);
    check('untouched/H-AM-05: still ACTIVE', hz(r, 'k1')?.conditionState === 'ACTIVE', hz(r, 'k1')?.conditionState);
    check('untouched/H-AM-05: still carries no question', hz(r, 'k1')?.clarification === null);
  }
  // B10: the precision pole.
  {
    const t = 'The rail on the platform did not look right to me.';
    const input = mk(t);
    const r = bind('untouched/B10', input, [cand({
      candidateKey: 'k1', hazardFamily: 'walking_working_surfaces', conditionState: 'ACTIVE',
      evidence: [ev(input, t.replace(/\.$/, ''))],
    })]);
    check('untouched/B10: not ACTIVE', hz(r, 'k1')?.conditionState !== 'ACTIVE', hz(r, 'k1')?.conditionState);
    check('untouched/B10: still carries a question', !!hz(r, 'k1')?.clarification);
  }
  // H-FLD-141: bare-conjunction predicate scope.
  {
    const t = 'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.';
    const input = mk(t);
    const r = bind('untouched/H-FLD-141', input, [cand({
      candidateKey: 'g1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      evidence: [ev(input, 'the guard is missing')],
    })]);
    check('untouched/H-FLD-141: the guarding hazard survives', hz(r, 'g1')?.conditionState === 'ACTIVE', hz(r, 'g1')?.conditionState);
  }
  // RC-08: the negated list must still be governed across commas.
  {
    const t = 'Steel erectors were connecting at the second tier with no guardrail, safety net or personal fall arrest system in use.';
    const input = mk(t);
    const r = bind('untouched/RC-08', input, [cand({
      candidateKey: 'k1', hazardFamily: 'falls', conditionState: 'ACTIVE',
      evidence: [ev(input, 'no guardrail, safety net or personal fall arrest system in use')],
    })]);
    check('untouched/RC-08: the negated list still grounds an ACTIVE fall hazard', hz(r, 'k1')?.conditionState === 'ACTIVE');
  }
}

clarificationScope();
scopeRunsAfterDemotion();
ladderStructure();
l32cUntouched();

console.log(`\nL3-2d clarification scope suite: ${passed} passed, ${failed} failed`);
if (failures.length) { console.log('\nFAILURES:'); for (const f of failures) console.log(`  - ${f}`); }
process.exit(failed === 0 ? 0 : 1);
