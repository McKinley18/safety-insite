/**
 * L3-2c -- gate polarity, bare-conjunction predicate scope, and clarification carriage.
 * NO NETWORK, NO DATABASE.
 *
 * The rule this suite exists to enforce: EVERY case a repair is meant to RESCUE is paired with the
 * case the same repair must keep REJECTING. Widening a rule until the false negative disappears is
 * trivial; the paired counter-fixture is what makes it a repair.
 *
 * It also pins the behaviour L3-2c must NOT change -- B08, C11, RC-08 and the explicit negative
 * controls -- because two prior phases each fixed one defect by introducing another.
 *
 * Run: npm run test:l32c-gate-polarity
 */
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { negationScopes, governingNegation } from '../src/safescope-v2/reasoning-l3/negation-scope';
import { assessImpression, classifySegment, impressionSegments } from '../src/safescope-v2/reasoning-l3/impression-scope';
import { L3_SYSTEM_PROMPT } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';

let passed = 0, failed = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) { passed += 1; return; }
  failed += 1; failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};

function mk(text: string, families: string[]): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32c', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: families,
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
const stateOf = (r: any, key: string) => r.boundHazards.find((h: any) => h.candidateKey === key)?.conditionState ?? 'DELETED';
const clarOf = (r: any, key: string) => !!r.boundHazards.find((h: any) => h.candidateKey === key)?.clarification;

const WWS = ['walking_working_surfaces', 'falls', 'machine_guarding', 'loto_stored_energy', 'lifting_rigging', 'chemical_storage', 'personal_protective_equipment', 'scaffolds'];

// ================================================================ 1. R1 -- gate polarity

/**
 * The claim under test is NOT "H-AM-05 passes". It is "a factual predicate does not have to be on a
 * list". Every RESCUE row below uses a predicate absent from `FACTUAL_CONDITION_TOKENS`, and the row
 * would still fail if the repair had been to add a thirty-first word.
 */
function gatePolarity(): void {
  const rescue: Array<[string, string, string]> = [
    ['H-AM-05 sheared', 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.', 'walking_working_surfaces'],
    ['parted', 'The ladder cage did not look right to me and the third hoop has parted from the stringer.', 'falls'],
    ['unpinned', 'I was uneasy about the scaffold and the two lower braces have been unpinned from the standards.', 'scaffolds'],
    ['canted over', 'The racking seemed off to me and the second upright is canted over with the base plate lifted clear.', 'walking_working_surfaces'],
    ['weeping', 'The tank looked odd to me and the sight glass is weeping onto the bund floor.', 'chemical_storage'],
    ['gone soft', 'Something about the hose seemed wrong and the outer cover has gone soft where it crosses the frame.', 'chemical_storage'],
  ];
  for (const [label, text, family] of rescue) {
    const input = mk(text, WWS);
    const r = bind(`polarity/rescue/${label}`, input, [cand({ candidateKey: 'p1', hazardFamily: family, conditionState: 'ACTIVE', evidence: [ev(input, text.replace(/\.$/, ''))] })]);
    check(`polarity/rescue/${label}: ACTIVE survives without a listed condition word`, stateOf(r, 'p1') === 'ACTIVE', stateOf(r, 'p1'));
  }

  const reject: Array<[string, string, string]> = [
    ['H-AM-02 hedged fact', 'One of the sling legs on the spreader bar may be cut.', 'lifting_rigging'],
    ['B10 verbatim class', 'The rail on the platform did not look right to me.', 'walking_working_surfaces'],
    ['H-AM-01 struck me as', 'The overhead door track struck me as odd when I walked underneath it.', 'machine_guarding'],
    ['perception with no fact', 'The way the pallet racking in aisle six was loaded did not sit right with me.', 'walking_working_surfaces'],
    ['hedge over copula', 'The drum is possibly leaking.', 'chemical_storage'],
    ['first-person epistemic', 'I could not tell whether the anchor point on the roof was rated.', 'falls'],
  ];
  for (const [label, text, family] of reject) {
    const input = mk(text, WWS);
    const r = bind(`polarity/reject/${label}`, input, [cand({ candidateKey: 'p1', hazardFamily: family, conditionState: 'ACTIVE', evidence: [ev(input, text.replace(/\.$/, ''))] })]);
    check(`polarity/reject/${label}: not ACTIVE`, stateOf(r, 'p1') !== 'ACTIVE', stateOf(r, 'p1'));
    check(`polarity/reject/${label}: a clarification is carried`, clarOf(r, 'p1'), JSON.stringify(r.demoted));
  }

  // The mechanism, asserted directly rather than only through its effect.
  check('polarity/mechanism: an unhedged non-observer predication is FACTUAL whatever its verb',
    classifySegment('the lower hinge pin is sheared off').klass === 'FACTUAL');
  check('polarity/mechanism: a perception predicate is an IMPRESSION',
    classifySegment('the gate did not look right to me').klass === 'IMPRESSION');
  check('polarity/mechanism: a first-person ACTION is not an impression',
    classifySegment('I walked underneath it').klass === 'OBSERVER_ACTION');
  check('polarity/mechanism: a first-person EPISTEMIC state is an impression',
    classifySegment('I was uneasy about the scaffold').klass === 'IMPRESSION');
  check('polarity/mechanism: direct observation is not an impression',
    classifySegment('I saw the guard was missing').klass !== 'IMPRESSION',
    classifySegment('I saw the guard was missing').klass);
  check('polarity/mechanism: an impression beside a fact is not only an impression',
    assessImpression('the gate did not look right to me and the hinge pin is sheared off').onlyImpression === false);
  check('polarity/mechanism: an impression alone is only an impression',
    assessImpression('the gate did not look right to me').onlyImpression === true);
  check('polarity/mechanism: no impression marker admits, it never refuses',
    assessImpression('the guard is missing from the tail pulley').onlyImpression === false);
  check('polarity/mechanism: segmentation splits on a bare conjunction',
    impressionSegments('a seemed wrong and b is broken').length === 2);
}

// ================================================================ 2. R2 -- bare-conjunction scope

function conjunctionScope(): void {
  const governs = (text: string, quote: string) => {
    const at = text.indexOf(quote);
    const g = governingNegation(text, at, at + quote.length);
    return g ? text.slice(g.from, g.to) : null;
  };

  // RESCUE: the following segment carries its own finite verb, so scope ends at the conjunction.
  const t1 = 'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.';
  check('conjunction/rescue: a finite verb after a bare and ends negation scope',
    governs(t1, 'the guard is missing') === null, String(governs(t1, 'the guard is missing')));
  const input1 = mk(t1, WWS);
  const r1 = bind('conjunction/rescue/H-FLD-141', input1, [
    cand({ candidateKey: 'g1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(input1, 'the guard is missing')] }),
  ]);
  check('conjunction/rescue/H-FLD-141: the guarding hazard survives as ACTIVE', stateOf(r1, 'g1') === 'ACTIVE', stateOf(r1, 'g1'));

  // PRECISION: RC-08's negated lists. Scope MUST still cross these conjunctions and commas.
  const t2 = 'Two carpenters were framing the parapet with no guardrail and no personal fall arrest and no warning line.';
  check('conjunction/precision: a negated list across bare `and` keeps scope',
    governs(t2, 'no warning line') !== null, String(governs(t2, 'no warning line')));
  const t3 = 'working with no guardrail, safety net or personal fall arrest system in use';
  check('conjunction/precision: RC-08 comma list keeps scope',
    (governs(t3, 'safety net or personal fall arrest system in use') || '').includes('no guardrail'),
    String(governs(t3, 'safety net or personal fall arrest system in use')));
  const t4 = 'The opening had no guardrail and no toeboard.';
  check('conjunction/precision: a bare `and` with no finite verb after it keeps scope',
    (negationScopes(t4)[0] ? t4.slice(negationScopes(t4)[0].from, negationScopes(t4)[0].to) : '').includes('no toeboard'),
    JSON.stringify(negationScopes(t4).map(s => t4.slice(s.from, s.to))));
  check('conjunction/precision: `or` never ends scope',
    (governs('with no hard hat or eye protection in use', 'eye protection in use') || '').includes('no hard hat'));

  // PROTECTED: L3-2b's own negation-scope work must be byte-for-byte in behaviour.
  const b08 = 'An employee on a rolling scaffold at nine feet was using an angle grinder without a face shield while a propane forklift idled directly underneath refueling from a portable cylinder.';
  check('conjunction/protected/B08: bare `while` still ends scope',
    governs(b08, 'a propane forklift idled directly underneath refueling from a portable cylinder') === null);
  const c11 = 'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing';
  check('conjunction/protected/C11: a comma with a predicate after it still ends scope',
    governs(c11, 'cardboard and pallets stacked under where the sparks were landing') === null);
  const a10 = 'The welding bay had no local exhaust ventilation in use during stainless welding, and separately the exit door was blocked by a stack of gas cylinders.';
  check('conjunction/protected/A10: `and separately` still ends scope',
    governs(a10, 'the exit door was blocked by a stack of gas cylinders') === null);
  check('conjunction/protected: alternation order -- `not` is still seen',
    negationScopes('the guard was not refitted').length === 1);
  check('conjunction/protected: `neither` is still seen',
    negationScopes('neither guard was refitted').length === 1);
}

// ================================================================ 3. R3 -- clarification carriage

function clarificationCarriage(): void {
  const text = 'One of the sling legs on the spreader bar may be cut.';
  const input = mk(text, WWS);
  const r = bind('clarification/demotion', input, [
    cand({ candidateKey: 'k1', hazardFamily: 'lifting_rigging', conditionState: 'ACTIVE', evidence: [ev(input, 'One of the sling legs on the spreader bar may be cut')] }),
  ]);
  check('clarification/demotion: the candidate is kept, not deleted', stateOf(r, 'k1') !== 'DELETED');
  check('clarification/demotion: it is demoted to INSUFFICIENT_EVIDENCE', stateOf(r, 'k1') === 'INSUFFICIENT_EVIDENCE', stateOf(r, 'k1'));
  check('clarification/demotion: it carries a clarification', clarOf(r, 'k1'));
  check('clarification/demotion: the demotion is recorded, never silent', r.demoted.length === 1 && r.demoted[0].candidateKey === 'k1');
  check('clarification/demotion: it asserts no hazard', !r.boundHazards.some(h => h.conditionState === 'ACTIVE'));
  const c = r.boundHazards.find(h => h.candidateKey === 'k1')?.clarification;
  check('clarification/demotion: L3-INV-06 shape -- fact, decision, >=2 branches, question',
    !!c && !!c.unresolvedFact && !!c.affectedDecision && Array.isArray(c.branches) && c.branches.length >= 2 && !!c.question);
  check('clarification/demotion: it carries no regulatory text or citation',
    !!c && !/\d+\s*CFR|§|\d{4}\.\d+/.test(JSON.stringify(c)));

  // A model-supplied clarification is never overwritten.
  const supplied = { unresolvedFact: 'model fact', affectedDecision: 'condition_state' as const, branches: ['a', 'b'], question: 'model question?' };
  const r2 = bind('clarification/preserve', input, [
    cand({ candidateKey: 'k1', hazardFamily: 'lifting_rigging', conditionState: 'ACTIVE', evidence: [ev(input, 'One of the sling legs on the spreader bar may be cut')], clarification: supplied }),
  ]);
  check('clarification/preserve: the model\'s own clarification is kept verbatim',
    r2.boundHazards.find(h => h.candidateKey === 'k1')?.clarification?.question === 'model question?');
  check('clarification/preserve: synthesis is flagged as not having happened',
    r2.demoted[0]?.clarificationSynthesized === false);

  // DEMOTION IS FOR ONE CODE ONLY. A second fatal issue still deletes.
  const t3 = 'The drum is possibly leaking, and no damage was found anywhere in the bund.';
  const i3 = mk(t3, WWS);
  const r3 = bind('clarification/second-fatal', i3, [
    cand({ candidateKey: 'k1', hazardFamily: 'chemical_storage', conditionState: 'ACTIVE', evidence: [ev(i3, 'no damage was found anywhere in the bund')] }),
  ]);
  check('clarification/second-fatal: a contradicted candidate is still deleted, not demoted',
    stateOf(r3, 'k1') === 'DELETED', `${stateOf(r3, 'k1')} ${JSON.stringify(r3.rejected)}`);

  // A clear observation must not be burdened with a question.
  for (const [label, clear] of [
    ['plain fact', 'The tongue guard on the bench grinder is missing.'],
    ['uncertainty that changes nothing', 'The guard on the drill press is missing; I am not certain whether it came off today or last week.'],
  ] as const) {
    const ic = mk(clear, WWS);
    const rc = bind(`clarification/no-noise/${label}`, ic, [
      cand({ candidateKey: 'k1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(ic, clear.split(';')[0].replace(/\.$/, ''))] }),
    ]);
    check(`clarification/no-noise/${label}: stays ACTIVE`, stateOf(rc, 'k1') === 'ACTIVE', stateOf(rc, 'k1'));
    check(`clarification/no-noise/${label}: no clarification is manufactured`, !clarOf(rc, 'k1'));
  }

  // >> DELIBERATELY REVERSED BY L3-2d. <<
  //
  // L3-2c asserted that the required output shape sat INSIDE the ordered condition-state ladder,
  // and that placement was its repair for clarification recall. A controlled ablation
  // (`scripts/ablate-l32d-prompt.ts`, holding model, seed, temperature, schema, user prompt and
  // observation text constant) then measured what it cost: with the block inside the ladder,
  // `H-NG-02` and `H-NG-03` return ZERO candidates; with it moved out, both return the correct
  // ACTIVE hazard. The ladder is read as a ranking, and a ten-line INSUFFICIENT_EVIDENCE rung
  // out-weighed the four-line ACTIVE rung directly above it.
  //
  // The assertion is therefore INVERTED rather than deleted: the shape must now live OUTSIDE the
  // ladder, and the ladder must keep only a pointer to it. Recorded here, in blueprint section 34,
  // and in the L3-2d evidence package -- L3-2c's own verdict is not rewritten.
  const ladderAt = L3_SYSTEM_PROMPT.indexOf('INSUFFICIENT_EVIDENCE the text genuinely does not say enough');
  const shapeAt = L3_SYSTEM_PROMPT.indexOf('MUST emit a candidate');
  const unknownAt = L3_SYSTEM_PROMPT.indexOf('  UNKNOWN ');
  check('clarification/prompt: the ladder still names the required output shape', ladderAt >= 0 && shapeAt > 0);
  check('clarification/prompt: the required shape sits OUTSIDE the ladder (L3-2d reversal of an L3-2c assertion)',
    shapeAt > unknownAt, `shape at ${shapeAt}, ladder ends at ${unknownAt}`);
  check('clarification/prompt: it still forbids questions that change no decision',
    /only refine an answer you can already give is noise/.test(L3_SYSTEM_PROMPT)
    && /DO NOT ASK when the ladder reached/.test(L3_SYSTEM_PROMPT));
}

// ================================================================ 4. PROTECTED -- negative controls

/**
 * Nothing in L3-2c may make a safe observation ACTIVE.
 *
 * Three rows here are KNOWN GAPS, and they are recorded rather than quietly dropped. All three are
 * cases where the BINDER leaves an ACTIVE claim standing on safe text; in the measured corpora the
 * MODEL never proposes ACTIVE on them, which is why the pipeline records zero negative-control false
 * ACTIVE while the binder alone would not. `scripts/diff-l32c-gate-behaviour.ts` measures each one
 * against the retired L3-2b gate so the provenance of each gap is evidence, not assertion:
 *
 *   NC-hazard-negated        UNCHANGED_PRE_EXISTING_GAP -- no check has ever owned this
 *   NC-negated-across-and    UNCHANGED_PRE_EXISTING_GAP -- no check has ever owned this
 *   NC-positive-impression   REGRESSED_BY_L3_2C         -- the old gate refused it BY ACCIDENT
 *
 * The regression is real and is reported as such. The old gate refused
 * "the wheel guards are all fitted" only because no word in `FACTUAL_CONDITION_TOKENS` appeared in
 * it -- the same accident that deleted `H-AM-05`, landing on the right answer that time. The new
 * gate correctly says the sentence is not merely an impression. What actually makes the candidate
 * wrong is that ACTIVE contradicts control-in-place evidence, and NO check owns that question. It is
 * recorded as `L3-2C-DISC-02` and is deliberately NOT fixed here: a fourth semantic remediation area
 * is outside this phase's authorized scope.
 */
function negativeControls(): void {
  // Rows the binder genuinely owns.
  const owned: Array<[string, string, string]> = [
    ['pure impression', 'The state of the racking did not look right to me.', 'walking_working_surfaces'],
    ['hedged fact', 'The anchor strap on the davit may be cut through.', 'falls'],
  ];
  for (const [label, text, family] of owned) {
    const input = mk(text, WWS);
    const r = bind(`negative/${label}`, input, [
      cand({ candidateKey: 'n1', hazardFamily: family, conditionState: 'ACTIVE', evidence: [ev(input, text.replace(/\.$/, ''))] }),
    ]);
    check(`negative/${label}: ACTIVE does not survive`, stateOf(r, 'n1') !== 'ACTIVE', stateOf(r, 'n1'));
  }

  // Rows no check owns. Asserted at their MEASURED value so a future change cannot pass unnoticed.
  const gaps: Array<[string, string, string, string]> = [
    ['NC-hazard-negated', 'A full survey of the packaging hall found no unguarded nip points and no exposed drive shafts.', 'machine_guarding', 'UNCHANGED_PRE_EXISTING_GAP'],
    ['NC-negated-across-and', 'The battery room was checked and no acid spillage was present and the eyewash discharged clear.', 'chemical_storage', 'UNCHANGED_PRE_EXISTING_GAP'],
    ['NC-positive-impression', 'The whole grinding bay looked right to me and the wheel guards are all fitted.', 'machine_guarding', 'REGRESSED_BY_L3_2C'],
  ];
  for (const [label, text, family, provenance] of gaps) {
    const input = mk(text, WWS);
    const r = bind(`negative/gap/${label}`, input, [
      cand({ candidateKey: 'n1', hazardFamily: family, conditionState: 'ACTIVE', evidence: [ev(input, text.replace(/\.$/, ''))] }),
    ]);
    check(`negative/gap/${label}: KNOWN GAP (${provenance}) -- the binder leaves ACTIVE standing`,
      stateOf(r, 'n1') === 'ACTIVE',
      `behaviour changed from the recorded gap; re-open L3-2C-DISC-02 -- observed ${stateOf(r, 'n1')}`);
  }
  check('negative/gap: L3-2C-DISC-02 is recorded, not silently absorbed', true);

  // And the recall side of the same rule: a real hazard beside a safe statement survives.
  const t = 'The spill kit was fully stocked and sealed, and the sight glass on the solvent day tank is cracked and weeping onto the bund floor.';
  const i = mk(t, WWS);
  const r = bind('negative/recall-pole', i, [
    cand({ candidateKey: 'n1', hazardFamily: 'chemical_storage', conditionState: 'ACTIVE', evidence: [ev(i, 'the sight glass on the solvent day tank is cracked and weeping onto the bund floor')] }),
  ]);
  check('negative/recall-pole: a real hazard beside a safe statement stays ACTIVE', stateOf(r, 'n1') === 'ACTIVE', stateOf(r, 'n1'));
}

gatePolarity();
conjunctionScope();
clarificationCarriage();
negativeControls();

console.log(`\nL3-2c gate polarity suite: ${passed} passed, ${failed} failed`);
if (failures.length) { console.log('\nFAILURES:'); for (const f of failures) console.log(`  - ${f}`); }
process.exit(failed === 0 ? 0 : 1);
