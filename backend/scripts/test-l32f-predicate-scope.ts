/**
 * L3-2f -- OFFLINE SUITE. Predicate-scope generalisation, token boundaries, nominal corrections and
 * control adequacy. NO NETWORK, NO DATABASE.
 *
 * Every assertion below is PAIRED wherever a repair could over-reach: the defect fixture must now
 * behave correctly AND the counter-fixture must keep its previous, correct behaviour. A repair that
 * closes one and breaks the other is not a repair, and five phases of this programme have proven it.
 *
 * Run: npm run test:l32f-predicate-scope
 */
import {
  isIrregularFinitePast, isFunctionWord, closesNounPhrase, couldBeFiniteLexicalVerb,
  hasParticipleShape, findWholeWordMatch, tokenMatchesWord, PREPOSITIONS, DETERMINERS,
} from '../src/safescope-v2/reasoning-l3/word-classes';
import { negationScopes, governingNegation } from '../src/safescope-v2/reasoning-l3/negation-scope';
import { nounPhraseHead, tokenRole } from '../src/safescope-v2/reasoning-l3/predicate-role';
import { controlAdequacyOf } from '../src/safescope-v2/reasoning-l3/control-adequacy';
import { L3_PROMPT_VERSION, L3_SYSTEM_PROMPT } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import {
  L3_SEMANTIC_BINDER_VERSION, L3_ADVISORY_REASONS, severityOf, bindEvidenceSemantically,
} from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';

let passed = 0; let failed = 0;
function check(name: string, ok: boolean, actual?: unknown): void {
  if (ok) { passed += 1; console.log(`ok    ${passed + failed}. ${name}`); return; }
  failed += 1;
  console.log(`FAIL  ${passed + failed}. ${name}${actual === undefined ? '' : ` -- got ${JSON.stringify(actual)}`}`);
}

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'ground_control'];

function bind(text: string, family: string, quote: string, state: HazardCandidate['conditionState'],
  rationale = 'the observation states this condition directly') {
  const { input } = buildReasoningInput({
    analysisId: 'l32f', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  });
  const src = input.authoritativeSources[0].text;
  const start = src.indexOf(quote);
  if (start < 0) throw new Error(`quote not verbatim: ${JSON.stringify(quote)}`);
  const c: HazardCandidate = {
    candidateKey: 'k1', hazardFamily: family, conditionState: state,
    evidence: [{ sourceId: 'observation-1', sourceType: 'observation', startOffset: start, endOffset: start + quote.length, quotedText: quote }],
    conditionRationale: rationale, independentHazardRationale: 'the only hazard described',
    uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null, regulatoryCandidateRefs: [],
  };
  const p: ReasoningProposal = {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: input.analysisId,
    outcome: 'ANALYZED', observationInterpretation: 'x', hazardCandidates: [c], jurisdictionProposal: null,
  };
  const v = validateReasoningProposal(p, input);
  if (v.state !== 'VALID' || !v.validated) return { survived: false, codes: v.issues.map(i => i.code) };
  const s = bindEvidenceSemantically(v.validated, input);
  return {
    survived: s.boundHazards.some(h => h.candidateKey === 'k1'),
    codes: [...new Set(s.issues.filter(i => i.severity === 'FATAL').map(i => i.code))],
    outcome: s,
  };
}

console.log('\n== 1. word classes are CLOSED and COMPLETE, which is the whole argument ==\n');

check('1.1 prepositions the old NP_TERMINATORS list omitted are present',
  ['against', 'beyond', 'per', 'regarding', 'versus', 'concerning'].every(p => PREPOSITIONS.includes(p)));
check('1.2 determiners include the negative determiner `no`', DETERMINERS.includes('no'));
check('1.3 a lexical noun is not a function word', !isFunctionWord('guardrail') && !isFunctionWord('roof'));
check('1.4 an irregular finite PAST form is recognised', isIrregularFinitePast('went') && isIrregularFinitePast('fell')
  && isIrregularFinitePast('took') && isIrregularFinitePast('broke'));
check('1.5 a past PARTICIPLE is NOT treated as finite -- this is what keeps RC-08 lists intact',
  !isIrregularFinitePast('worn') && !isIrregularFinitePast('broken') && !isIrregularFinitePast('torn')
  && !isIrregularFinitePast('taken') && !isIrregularFinitePast('gone'));
check('1.6 noun-identical past forms are excluded on purpose',
  !isIrregularFinitePast('ground') && !isIrregularFinitePast('saw') && !isIrregularFinitePast('wound')
  && !isIrregularFinitePast('cut') && !isIrregularFinitePast('set'));
check('1.7 regular verb morphology is recognised without a list',
  couldBeFiniteLexicalVerb('entered') && couldBeFiniteLexicalVerb('climbed') && couldBeFiniteLexicalVerb('fitted')
  && couldBeFiniteLexicalVerb('operating'));
check('1.8 short -ed words stay excluded so they do not create phantom boundaries',
  !hasParticipleShape('used') && !hasParticipleShape('bed') && !hasParticipleShape('red'));
check('1.9 participial prepositions do NOT close a noun phrase on sight (they are homographs)',
  !closesNounPhrase('concerning') && !closesNounPhrase('following') && closesNounPhrase('against'));

console.log('\n== 2. F1 -- PREDICATE SCOPE. The recorded L3_2E_SCOPE_CONTRADICTION ==\n');

const WENT = 'No flammable atmosphere was detected at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening.';
const WAS = WENT.replace('fitter went inside', 'fitter was inside');
const comma = WENT.indexOf(',');
check('2.1 THE CONTRADICTION IS CLOSED: `went` now ends the scope at the comma',
  negationScopes(WENT)[0].to === comma, negationScopes(WENT)[0].to);
check('2.2 PAIR: `was` still ends the scope at the comma, exactly as before',
  negationScopes(WAS)[0].to === comma, negationScopes(WAS)[0].to);
check('2.3 the two now agree -- one sentence, one verb apart, one scope',
  negationScopes(WENT)[0].to === negationScopes(WAS)[0].to);
const hz = WENT.indexOf('the agitator still on line');
check('2.4 the hazard clause is no longer governed by the negation',
  governingNegation(WENT, hz, hz + 26) === null);
check('2.5 and the high-consequence finding survives the binder',
  bind(WENT, 'confined_space', 'the agitator still on line and nobody at the opening', 'ACTIVE',
    'the vessel was entered while the agitator remained on line and the opening was left unattended').survived);

const RC08 = 'Two men were working at the leading edge of the third lift with no guardrail, safety net or personal fall arrest system in use.';
check('2.6 COUNTER-FIXTURE RC-08: a coordinated negated list still crosses its commas',
  negationScopes(RC08).find(s => s.token.toLowerCase() === 'no')!.to > RC08.indexOf(','));
const WORN = 'The deck gang were landing steel with no hard hats, gloves or boots worn on the walkway.';
check('2.7 COUNTER-FIXTURE: a past participle in a list does NOT end the scope',
  negationScopes(WORN).find(s => s.token.toLowerCase() === 'no')!.to > WORN.indexOf(','));
const FELL = 'No edge protection had been signed off for the sixth lift, and the plasterer fell against the temporary handrail.';
check('2.8 a second irregular verb behaves the same way', negationScopes(FELL)[0].to === FELL.indexOf(','));
const ATTR = 'The extractor is running with no coupling cover and a broken retaining clip on the base frame.';
check('2.9 an irregular/participial form used ATTRIBUTIVELY does not end the scope',
  negationScopes(ATTR).find(s => s.token.toLowerCase() === 'no')!.to >= ATTR.indexOf('broken'));
const BARE = 'No isolation certificate was raised for the press and the setter took the interlock key out of the gate switch.';
check('2.10 a bare conjunction followed by a lexical finite verb DOES end the scope',
  negationScopes(BARE)[0].to === BARE.indexOf('and the setter'), negationScopes(BARE)[0].to);
const BARELIST = 'The roofers were working at the verge with no guardrail and no harness anchor point within reach.';
check('2.11 PAIR: a bare conjunction continuing a negated LIST does not',
  negationScopes(BARELIST).find(s => s.token.toLowerCase() === 'no')!.to > BARELIST.indexOf(' and '));

console.log('\n== 3. F2 -- NOUN-PHRASE TERMINATORS derived from a complete class ==\n');

for (const [phrase, want] of [
  [' deficiencies against the storage standard', 'deficiencies'],
  [' defects beyond the coupling', 'defects'],
  [' violations per the inspection checklist', 'violations'],
  [' concerns regarding the handover certificate', 'concerns'],
  [' hazard of any kind', 'hazard'],
  [' damage to the enclosure', 'damage'],
] as Array<[string, string]>) {
  check(`3.x head of "${phrase.trim()}" resolves to \`${want}\``, nounPhraseHead(phrase, 0) === want, nounPhraseHead(phrase, 0));
}
check('3.7 the DISC-05 negative control is refused again',
  !bind('The audit of the thinners store recorded no hazard of any kind and no deficiencies against the storage standard.',
    'chemical_storage', 'no deficiencies against the storage standard', 'ACTIVE', 'the store was audited').survived);
check('3.8 PAIR: a negated CONTROL before the same preposition is still an ACTIVE hazard',
  bind('There was no toe board against the open edge of the loading platform.',
    'falls', 'no toe board against the open edge of the loading platform', 'ACTIVE',
    'the open edge has no toe board').survived);

console.log('\n== 4. F3 -- TOKEN BOUNDARY. Containment is not identity ==\n');

check('4.1 a trailing participle is not taken as the head', nounPhraseHead(' hearing protection issued', 0) === 'protection');
check('4.2 the same on a different participle', nounPhraseHead(' accessory guard fitted', 0) === 'guard');
check('4.3 a phrase that is ONLY a participle keeps it', nounPhraseHead(' issued', 0) === 'issued');
check('4.4 `issue` no longer matches inside `issued`', findWholeWordMatch('issued', ['issue'], { allowInflection: true }) === null);
check('4.5 PAIR: `issue` still matches `issue`', findWholeWordMatch('issue', ['issue'], { allowInflection: true }) === 'issue');
check('4.6 declared NOMINAL inflection still works -- `deficienc` covers both forms',
  tokenMatchesWord('deficiency', 'deficienc', { allowInflection: true })
  && tokenMatchesWord('deficiencies', 'deficienc', { allowInflection: true }));
check('4.7 VERBAL inflection is NOT admitted as nominal inflection',
  !tokenMatchesWord('issued', 'issue', { allowInflection: true })
  && !tokenMatchesWord('concerning', 'concern', { allowInflection: true }));
check('4.8 no accidental match inside a longer unrelated word',
  findWholeWordMatch('harmless residue', ['harm']) === null
  && findWholeWordMatch('accessory bracket', ['access']) === null);
const NOISE = 'Two operators were running the pedestal grinders in the fettling bay all shift with no hearing protection issued.';
check('4.9 THE NOISE_EXPOSURE FINDING SURVIVES -- the single deletion that cost the family its coverage',
  bind(NOISE, 'noise_exposure', 'no hearing protection issued', 'ACTIVE',
    'the operators worked the shift without hearing protection').survived);
check('4.10 PAIR: a genuinely negated hazard is still refused',
  !bind('The pre-start inspection recorded no issue with any of the extraction hoods.',
    'machine_guarding', 'no issue with any of the extraction hoods', 'ACTIVE', 'the hoods were inspected').survived);

console.log('\n== 5. F4 -- NOMINAL CORRECTIONS, with both guards intact ==\n');

check('5.1 a correction NOUN as the object of an action verb now supports CORRECTED',
  bind('The frayed lifting sling was cut from the crane hook and the rigger drew a replacement from the stores cage.',
    'lifting_rigging', 'the rigger drew a replacement from the stores cage', 'CORRECTED',
    'the sling was replaced during the visit').survived);
check('5.2 PAIR: the verb form still works',
  bind('The frayed lifting sling was taken off the crane hook and was replaced from the stores cage.',
    'lifting_rigging', 'The frayed lifting sling was taken off the crane hook and was replaced from the stores cage', 'CORRECTED',
    'the sling was replaced during the visit').survived);
check('5.3 GUARD: a NEGATED nominal correction is still refused',
  !bind('The frayed lifting sling is still rigged and no replacement has been drawn from the stores cage.',
    'lifting_rigging', 'no replacement has been drawn from the stores cage', 'CORRECTED',
    'the sling was replaced during the visit').survived);
check('5.4 GUARD: naming a PROCEDURE still corrects nothing',
  !bind('The supervisor talked the crew through the sling replacement procedure while the frayed sling stayed rigged.',
    'lifting_rigging', 'the sling replacement procedure', 'CORRECTED',
    'the sling was replaced during the visit').survived);
check('5.5 GUARD: a PLANNED replacement is not a correction',
  !bind('The frayed sling is still on the hook and we have scheduled a replacement for next week.',
    'lifting_rigging', 'we have scheduled a replacement for next week', 'CORRECTED',
    'the sling was replaced during the visit').survived);

console.log('\n== 6. F5/F6 -- CONTROL ADEQUACY. It RECORDS; it does not decide ==\n');

check('6.1 warning tape is recorded as a MENTION, not a control',
  controlAdequacyOf('An active floor opening is marked with standard warning tape.').adequacy === 'CONTROL_MENTION');
check('6.2 a sign is the same',
  controlAdequacyOf('A DANGER OPEN PIT sign is wired to the post beside the open sump.').adequacy === 'CONTROL_MENTION');
check('6.3 a briefing is the same',
  controlAdequacyOf('The crew were told about it in the morning briefing.').adequacy === 'CONTROL_MENTION');
check('6.4 a bolted cover is recorded as EFFECTIVE',
  controlAdequacyOf('The opening is closed with a load-rated steel plate bolted down at all four corners.').adequacy === 'CONTROL_EFFECTIVE');
check('6.5 a fixed guardrail is EFFECTIVE',
  controlAdequacyOf('A fixed double guardrail and toeboard is on all open sides.').adequacy === 'CONTROL_EFFECTIVE');
check('6.6 effective PLUS a warning is not downgraded to a warning',
  controlAdequacyOf('The stair void is boarded over with a secured deck and warning tape is run around the edge.')
    .adequacy === 'CONTROL_EFFECTIVE_WITH_WARNING');
check('6.7 a morphological absence is recorded as ABSENT, and outranks the word `fitted`',
  controlAdequacyOf('The operator was reaching across an unguarded drive belt.').adequacy === 'CONTROL_ABSENT'
  && controlAdequacyOf('No guardrail was fitted along the open edge.').adequacy === 'CONTROL_ABSENT');
check('6.8 the un- test is WHOLE-WORD, so it does not repeat the DISC-06 mistake',
  controlAdequacyOf('The load was carried under the walkway in a union fitting.').adequacy !== 'CONTROL_ABSENT');
check('6.9a LIMITATION, RECORDED: adequacy is judged from control LANGUAGE, not against this hazard.',
  controlAdequacyOf('A DANGER sign is fixed to the handrail post beside the open pit.').adequacy
    === 'CONTROL_EFFECTIVE_WITH_WARNING');
check('6.9b which is exactly why it is ADVISORY and decides nothing -- the prompt makes the judgement',
  severityOf('SEMANTIC_CONTROL_ADEQUACY_RECORDED') === 'ADVISORY');
check('6.9 no control language reads as UNSPECIFIED',
  controlAdequacyOf('The stock was counted in the despatch aisle.').adequacy === 'UNSPECIFIED');
check('6.10 IT DECIDES NOTHING: the code is ADVISORY and can never be fatal',
  L3_ADVISORY_REASONS.includes('SEMANTIC_CONTROL_ADEQUACY_RECORDED')
  && severityOf('SEMANTIC_CONTROL_ADEQUACY_RECORDED') === 'ADVISORY');
const tapeBind = bind('An active floor opening is marked with standard warning tape next to an unprotected edge.',
  'falls', 'An active floor opening is marked with standard warning tape next to an unprotected edge', 'ACTIVE',
  'the opening is open with only tape around it');
check('6.11 and an ACTIVE candidate over warning-tape evidence is NOT removed by it', tapeBind.survived);
check('6.12 while the adequacy is still recorded on it',
  (tapeBind.outcome?.controlAdequacy ?? []).some(r => r.candidateKey === 'k1'));

console.log('\n== 7. the reasoning contract carries the control-adequacy test ==\n');

check('7.1 prompt version advanced to v6', L3_PROMPT_VERSION === 'hazlenz.l3.prompt.v6', L3_PROMPT_VERSION);
check('7.2 binder version advanced to v6', L3_SEMANTIC_BINDER_VERSION === 'hazlenz.l3.semantic-binder.v6', L3_SEMANTIC_BINDER_VERSION);
check('7.3 the prompt states that a warning is not a control',
  /CONTROL ADEQUACY TEST -- A WARNING IS NOT A CONTROL/.test(L3_SYSTEM_PROMPT));
check('7.4 it names the administrative measures explicitly',
  /tape, bunting, cones, a sign, a placard, a label/.test(L3_SYSTEM_PROMPT));
check('7.5 it names what a real control does -- prevent contact',
  /PREVENT[S]?\b[\s\S]{0,80}contact with the hazard/.test(L3_SYSTEM_PROMPT));
check('7.6 it says a one-word absence is still an absence',
  /ABSENT CONTROLS -- HOW AN ABSENCE GETS WRITTEN/.test(L3_SYSTEM_PROMPT)
  && /"unguarded", "unsupported", "unprotected"/.test(L3_SYSTEM_PROMPT));
check('7.6b the CONDITION-STATE LADDER itself stays terse -- elaboration lives below it.',
  (() => {
    const ladder = L3_SYSTEM_PROMPT.slice(L3_SYSTEM_PROMPT.indexOf('CONDITION STATE --'),
      L3_SYSTEM_PROMPT.indexOf('EVALUATE EVERY CLAUSE'));
    // The ACTIVE rung may not swamp the one-line rungs above it -- lengthening it inside the ladder
    // cost `C-CS-05` its HYPOTHETICAL classification during development, and that is a measured
    // clarification-precision regression, not a stylistic preference.
    const active = ladder.slice(ladder.indexOf('  ACTIVE'), ladder.indexOf('  INSUFFICIENT_EVIDENCE'));
    return active.split('\n').length <= 6;
  })());
check('7.7 it forbids demanding proof of imminent harm on top of a STATED missing control',
  /do not also need it to prove the harm was imminent/.test(L3_SYSTEM_PROMPT));
check('7.7b AND it protects the could-not-observe rung: unconfirmed is not absent',
  /A control the inspector\s*\n?could not SEE is NOT an absent control/.test(L3_SYSTEM_PROMPT));
check('7.7c talking about a fix is not a fix',
  /TALKING ABOUT A FIX IS NOT A FIX/.test(L3_SYSTEM_PROMPT));
check('7.8 it does NOT make all administrative controls invalid',
  /a permit-to-work IS the control for an authorisation hazard/.test(L3_SYSTEM_PROMPT));
check('7.9 effective-plus-warning still resolves to the effective control',
  /effective control decides, and the state is CONTROLLED/.test(L3_SYSTEM_PROMPT));
check('7.10 L3-2e\'s clause rule is still present and unweakened',
  /EVALUATE EVERY CLAUSE, NOT ONLY THE FIRST/.test(L3_SYSTEM_PROMPT));
check('7.11 the could-not-observe discriminator is still present',
  /COULD NOT OBSERVE IS NOT THE SAME AS NOT ENOUGH EVIDENCE/.test(L3_SYSTEM_PROMPT));
check('7.12 the DO NOT ASK rung is unweakened -- the clarification axis must not regress',
  /DO NOT ASK when the ladder reached ACTIVE, CONTROLLED, CORRECTED/.test(L3_SYSTEM_PROMPT));

console.log('\n== 8. no prior guarantee was weakened ==\n');

check('8.1 L3-2e: a modifier still cannot assert a correction',
  tokenRole('a pile of discarded conveyor rollers', 9, 18) === 'ATTRIBUTIVE_MODIFIER');
check('8.2 L3-2e: an asserted predicate still asserts',
  tokenRole('the lead was discarded to the skip', 13, 22) === 'ASSERTED_PREDICATE');
check('8.3 L3-2d: D-FLD-175 still survives -- a modifier does not delete a high-consequence hazard',
  bind('Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
    'electrical', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris', 'ACTIVE').survived);
check('8.4 L3-2c: a negated correction is still not a correction',
  bind('Crew was changing the knives on the granulator and no lockout is applied at the disconnect.',
    'loto_stored_energy', 'no lockout is applied at the disconnect', 'ACTIVE').survived);
check('8.5 an unambiguous service withdrawal still contradicts ACTIVE',
  !bind('The grinder with the cracked wheel was removed from service and tagged before the shift ended.',
    'machine_guarding', 'The grinder with the cracked wheel was removed from service and tagged before the shift ended', 'ACTIVE').survived);

console.log(`\nL3-2f predicate scope suite: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
