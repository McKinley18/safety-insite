/**
 * L3-2e -- syntactic role and observation availability. NO NETWORK, NO DATABASE.
 *
 * E1 is deterministic and is tested by driving the real binder: a token in a non-predicate role may
 * not delete or create a finding, and the SAME token in a true predicate role must keep working.
 * Every rejection fixture is paired with its recall counterpart; a repair that closes one and breaks
 * the other is not a repair, and this suite is what says so.
 *
 * E2 is a prompt change, which no offline suite can prove. What is pinned here is the bounded
 * detector's behaviour and the structural property the repair depends on -- that the clause rule and
 * the could-not-observe discriminator are present and concise. The behavioural proof is the sealed
 * holdout and `prove-l32e-e2-rootcause.ts`.
 *
 * Run: npm run test:l32e-syntactic-role
 */
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { tokenRole, nounPhraseHead, hasContrastiveAfter, findTokenOccurrences } from '../src/safescope-v2/reasoning-l3/predicate-role';
import { detectObservationGaps, observationAvailabilityOf } from '../src/safescope-v2/reasoning-l3/observation-availability';
import { L3_SYSTEM_PROMPT, L3_PROMPT_VERSION } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';

let passed = 0, failed = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) { passed += 1; return; }
  failed += 1; failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'scaffolds'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32e', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}
function bind(label: string, text: string, family: string, quote: string, state: HazardCandidate['conditionState'], rationale = 'the observation states this condition directly') {
  const input = mk(text);
  const src = input.authoritativeSources[0].text;
  const start = src.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not verbatim: ${JSON.stringify(quote)}`);
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
  check(`${label}: deterministic validator accepts the fixture`, v.state === 'VALID', v.issues.map(i => i.code).join(',') || 'none');
  if (!v.validated) throw new Error(`fixture never reached the binder: ${label}`);
  const s = bindEvidenceSemantically(v.validated, input);
  return { survived: s.boundHazards.some(h => h.candidateKey === 'k1'), issues: s, obs: s.observationAvailability };
}

// ================================================================ 1. the role analyser itself

function roleAnalyser(): void {
  const at = (t: string, w: string) => ({ s: t.toLowerCase().indexOf(w.toLowerCase()), e: t.toLowerCase().indexOf(w.toLowerCase()) + w.length });
  const role = (t: string, w: string, neg = false) => { const { s, e } = at(t, w); return tokenRole(t, s, e, neg); };

  check('role: participle after an auxiliary is an asserted predicate',
    role('the lead was discarded before we left', 'discarded') === 'ASSERTED_PREDICATE',
    role('the lead was discarded before we left', 'discarded'));
  check('role: the same participle before a noun is attributive',
    role('a pile of discarded conveyor rollers and debris', 'discarded') === 'ATTRIBUTIVE_MODIFIER',
    role('a pile of discarded conveyor rollers and debris', 'discarded'));
  check('role: an asserted predicate under a negation is reported as negated',
    role('no lockout is applied at the disconnect', 'applied', true) === 'NEGATED_PREDICATE');
  check('role: an adverb between auxiliary and participle does not break the predication',
    role('the guard was never refitted after the change', 'refitted') === 'ASSERTED_PREDICATE');
  check('role: punctuation between auxiliary and token DOES break it',
    role('the guard, discarded last year, was never found', 'discarded') !== 'ASSERTED_PREDICATE');
  check('role: a noun before another noun is attributive',
    role('without hazard warning labels of any kind', 'hazard') === 'ATTRIBUTIVE_MODIFIER');
  check('role: a noun ending its phrase is the head',
    role('found no damage was recorded', 'damage') === 'NP_HEAD');

  check('head: the head of "hazard warning labels" is labels',
    nounPhraseHead('no hazard warning labels of any kind', 3) === 'labels', String(nounPhraseHead('no hazard warning labels of any kind', 3)));
  check('head: the head of "damage to the enclosure" is damage',
    nounPhraseHead('no damage to the enclosure', 3) === 'damage', String(nounPhraseHead('no damage to the enclosure', 3)));
  check('head: an auxiliary ends the phrase',
    nounPhraseHead('no damage was found', 3) === 'damage', String(nounPhraseHead('no damage was found', 3)));

  check('contrastive: "although" is found after a negation scope',
    hasContrastiveAfter('no damage although the strap has been cut back', 10) === 'although');
  check('contrastive: a plain conjunction is not contrastive',
    hasContrastiveAfter('no damage and no exposed conductors', 10) === null);

  check('occurrences: a single-word token matches whole-word only',
    findTokenOccurrences('the setting was misapplied', ['applied']).length === 0);
  check('occurrences: a multi-word token matches as a phrase',
    findTokenOccurrences('it was removed from service and tagged', ['removed from service']).length === 1);
}

// ================================================================ 2. E1 -- paired role fixtures

/**
 * The claim is NOT "D-FLD-175 passes". It is that a token's ROLE decides whether it may act, and
 * every row proves that by keeping the token constant and changing only what it is doing.
 */
function pairedRoleFixtures(): void {
  const rows: Array<[string, string, string, string, HazardCandidate['conditionState'], boolean, string]> = [
    // label, text, family, quote, state, mustSurvive, note
    ['D-FLD-175/modifier', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
      'electrical', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris', 'ACTIVE', true, 'high-consequence; a modifier must not delete it'],
    ['PAIR/predicate', 'The damaged extension lead was found at the panel and was discarded before we left the area.',
      'electrical', 'The damaged extension lead was found at the panel and was discarded before we left the area', 'ACTIVE', false, 'the same token, genuinely predicated'],
    ['negated correction', 'Crew was changing the knives on the granulator and no lockout is applied at the disconnect.',
      'loto_stored_energy', 'no lockout is applied at the disconnect', 'ACTIVE', true, 'a negated correction is not a correction'],
    ['PAIR/unnegated correction', 'The crew stopped work and a full lockout was applied at the disconnect before the guard came off.',
      'loto_stored_energy', 'a full lockout was applied at the disconnect before the guard came off', 'ACTIVE', false, 'unnegated, it contradicts'],
    ['control removed', 'The chain guard has been removed from the drive and was not refitted after the belt change.',
      'machine_guarding', 'The chain guard has been removed from the drive and was not refitted after the belt change', 'ACTIVE', true, 'removing a GUARD creates the hazard'],
    ['PAIR/service withdrawal', 'The grinder with the cracked wheel was removed from service and tagged before the shift ended.',
      'machine_guarding', 'The grinder with the cracked wheel was removed from service and tagged before the shift ended', 'ACTIVE', false, 'the unambiguous form contradicts'],
    ['hazard word in a label NP', 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind.',
      'hazard_communication', 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind', 'ACTIVE', true, 'the NP head is "labels", a control'],
    ['PAIR/negated hazard head', 'The inspection of the switch room found no damage and no exposed conductors anywhere on the panels.',
      'electrical', 'The inspection of the switch room found no damage and no exposed conductors anywhere on the panels', 'ACTIVE', false, 'the head IS the hazard'],
    ['negation in a sibling clause', 'The survey found no damage to the enclosure although the earth conductor has been cut back and left unterminated.',
      'electrical', 'The survey found no damage to the enclosure although the earth conductor has been cut back and left unterminated', 'ACTIVE', true, 'a contrastive clause carries the hazard'],
    ['hazard word in an unrelated clause', 'The hazard register was reviewed this morning and the pit cover over the sump has been left off at the north end.',
      'walking_working_surfaces', 'The hazard register was reviewed this morning and the pit cover over the sump has been left off at the north end', 'ACTIVE', true, 'a neighbouring mention decides nothing'],
  ];
  for (const [label, text, family, quote, state, mustSurvive, note] of rows) {
    const r = bind(`e1/${label}`, text, family, quote, state);
    check(`e1/${label}: ${mustSurvive ? 'survives' : 'is refused'} (${note})`, r.survived === mustSurvive,
      `survived=${r.survived} codes=${JSON.stringify([...new Set(r.issues.issues.filter(i => i.severity === 'FATAL').map(i => i.code))])}`);
  }

  // ---- the ADMISSION direction: checkStateSupported must require an asserted predicate.
  const admits: Array<[string, string, string, string, HazardCandidate['conditionState'], boolean]> = [
    ['CORRECTED on a modifier', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
      'electrical', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris', 'CORRECTED', false],
    ['CORRECTED on a predicate', 'The cracked socket outlet at the bench was replaced with a new one before the end of the shift.',
      'electrical', 'The cracked socket outlet at the bench was replaced with a new one before the end of the shift', 'CORRECTED', true],
    ['CONTROLLED on a negated control', 'The crew reported that no guardrail was in place along the open edge of the deck.',
      'falls', 'no guardrail was in place along the open edge of the deck', 'CONTROLLED', false],
    ['CONTROLLED on a real control', 'A double guardrail with toeboard was in place along the open edge and was fixed at every standard.',
      'falls', 'A double guardrail with toeboard was in place along the open edge and was fixed at every standard', 'CONTROLLED', true],
    ['NEGATED keeps presence semantics', 'The guarding survey found no exposed nip points anywhere on the machine.',
      'machine_guarding', 'no exposed nip points', 'NEGATED', true],
    ['HYPOTHETICAL keeps presence semantics', 'If the interlock were bypassed an operator could reach the ribbon while it is turning.',
      'machine_guarding', 'If the interlock were bypassed an operator could reach the ribbon while it is turning', 'HYPOTHETICAL', true],
  ];
  for (const [label, text, family, quote, state, mustSurvive] of admits) {
    const r = bind(`e1/admit/${label}`, text, family, quote, state);
    check(`e1/admit/${label}: ${mustSurvive ? 'admitted' : 'refused'}`, r.survived === mustSurvive,
      `survived=${r.survived} codes=${JSON.stringify([...new Set(r.issues.issues.filter(i => i.severity === 'FATAL').map(i => i.code))])}`);
  }
}

// ================================================================ 3. E2 -- detector and prompt

function observationAvailability(): void {
  const gaps = (t: string) => detectObservationGaps(t);
  check('obs: an inability plus a perception verb is a gap',
    gaps('I was too far away to see whether they were tied off').length === 1);
  check('obs: the unobserved fact is captured',
    gaps('I was too far away to see whether they were tied off')[0].unobservedFact.includes('tied off'));
  check('obs: an inability WITHOUT a perception verb is not a gap',
    gaps('the guard could not be refitted before the shift ended').length === 0,
    'equipment failing is not an observation gap');
  check('obs: equipment failure wording is not a gap',
    gaps('the pothole protection failed to deploy during the function check').length === 0);
  check('obs: plain observation is UNSPECIFIED',
    observationAvailabilityOf('The tongue guard on the bench grinder is missing.') === 'UNSPECIFIED');
  check('obs: explicit inability is EXPLICITLY_NOT_OBSERVED',
    observationAvailabilityOf('I could not determine whether the disconnect was open.') === 'EXPLICITLY_NOT_OBSERVED');

  // RECORDING ONLY. The detector must never change a state or delete a candidate.
  const text = 'The rotating shaft on the mixer drive is completely unguarded at the coupling; I could not read the asset number on the frame.';
  const r = bind('e2/advisory-only', text, 'machine_guarding', 'The rotating shaft on the mixer drive is completely unguarded at the coupling', 'ACTIVE');
  check('e2: an observation gap does NOT delete the candidate', r.survived);
  check('e2: the gap is recorded on the outcome', r.obs.length === 1 && r.obs[0].availability === 'EXPLICITLY_NOT_OBSERVED');
  check('e2: it is recorded as ADVISORY, never fatal',
    r.issues.issues.some(i => i.code === 'SEMANTIC_OBSERVATION_GAP_RECORDED' && i.severity === 'ADVISORY')
    && !r.issues.issues.some(i => i.code === 'SEMANTIC_OBSERVATION_GAP_RECORDED' && i.severity === 'FATAL'));

  // ---- the prompt carries the discriminator, concisely.
  // REBOUND AT L3-2f, and recorded. This assertion pinned the literal string `v5`. Its GUARANTEE is
  // that the prompt version ADVANCES whenever the prompt text changes -- not that L3-2e's number is
  // final. L3-2f changed the prompt (the control-adequacy test) and moved the pin to v6, so the pin
  // is rebound to the guarantee it was always standing in for. The L3-2f suite pins the new literal.
  check('prompt: version has advanced beyond L3-2e\'s v5',
    /^hazlenz\.l3\.prompt\.v(\d+)$/.test(L3_PROMPT_VERSION)
    && Number(/v(\d+)$/.exec(L3_PROMPT_VERSION)![1]) >= 5, L3_PROMPT_VERSION);
  check('prompt: every clause must be evaluated, not only the first',
    /EVALUATE EVERY CLAUSE, NOT ONLY THE FIRST/.test(L3_SYSTEM_PROMPT));
  check('prompt: the clause rule still says a negation governs only its own clause',
    /a negation\s*\n?\s*governs only its own clause/.test(L3_SYSTEM_PROMPT) || /governs only its own clause/.test(L3_SYSTEM_PROMPT));
  check('prompt: could-not-observe is distinguished from insufficient evidence',
    /COULD NOT OBSERVE IS NOT THE SAME AS NOT ENOUGH EVIDENCE/.test(L3_SYSTEM_PROMPT));
  check('prompt: the discriminator turns on whether the unobserved fact DECIDES the candidate',
    /DECIDES this candidate/.test(L3_SYSTEM_PROMPT));
  check('prompt: both branches of the discriminator are stated',
    /it decides the candidate ->/.test(L3_SYSTEM_PROMPT) && /it decides nothing\s+->/.test(L3_SYSTEM_PROMPT));
  check('prompt: the discriminator is CONCISE -- at most 12 lines',
    (() => {
      const lines = L3_SYSTEM_PROMPT.split('\n');
      const a = lines.findIndex(l => l.includes('COULD NOT OBSERVE IS NOT THE SAME'));
      const b = lines.findIndex((l, i) => i > a && l.trim() === '');
      return a >= 0 && b - a <= 12;
    })());

  // ---- prior guarantees that must survive.
  check('prompt: L3-2d clarification prohibition survives', /DO NOT ASK when the ladder reached/.test(L3_SYSTEM_PROMPT));
  check('prompt: L3-2c required output shape survives', /MUST emit a candidate/.test(L3_SYSTEM_PROMPT));
  check('prompt: the verbatim-quotation rule survives', /copied VERBATIM/.test(L3_SYSTEM_PROMPT));
  check('prompt: RC-08 remains the worked example', /safety net or personal fall arrest system in use/.test(L3_SYSTEM_PROMPT));
  check('prompt: no analysis id (L3-2b R5)', !/ANALYSIS ID/.test(L3_SYSTEM_PROMPT));
  check('prompt: encodes no scenario answer key',
    !/D-FLD-175|D-NG-04|D-CR-04|conveyor rollers|asset number/.test(L3_SYSTEM_PROMPT));
}

// ================================================================ 4. prior mechanisms untouched

function priorUntouched(): void {
  const cases: Array<[string, string, string, string, HazardCandidate['conditionState'], boolean]> = [
    ['H-AM-05', 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.',
      'walking_working_surfaces', 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone', 'ACTIVE', true],
    ['H-FLD-141', 'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.',
      'machine_guarding', 'the guard is missing', 'ACTIVE', true],
    ['RC-08', 'Steel erectors were connecting at the second tier with no guardrail, safety net or personal fall arrest system in use.',
      'falls', 'no guardrail, safety net or personal fall arrest system in use', 'ACTIVE', true],
    ['B08', 'An employee on a rolling scaffold at nine feet was using an angle grinder without a face shield while a propane forklift idled directly underneath refueling from a portable cylinder.',
      'chemical_storage', 'a propane forklift idled directly underneath refueling from a portable cylinder', 'ACTIVE', true],
    ['C11', 'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing',
      'walking_working_surfaces', 'cardboard and pallets stacked under where the sparks were landing', 'ACTIVE', true],
  ];
  for (const [label, text, family, quote, state, mustSurvive] of cases) {
    const r = bind(`untouched/${label}`, text, family, quote, state);
    check(`untouched/${label}: still ${mustSurvive ? 'survives' : 'refused'}`, r.survived === mustSurvive,
      JSON.stringify([...new Set(r.issues.issues.filter(i => i.severity === 'FATAL').map(i => i.code))]));
  }
  // B10 must remain non-ACTIVE with a question (L3-2c impression gate + L3-2c demotion).
  const b10 = bind('untouched/B10', 'The rail on the platform did not look right to me.', 'walking_working_surfaces', 'The rail on the platform did not look right to me', 'ACTIVE');
  const h = b10.issues.boundHazards.find(x => x.candidateKey === 'k1');
  check('untouched/B10: demoted, not ACTIVE', !!h && h.conditionState === 'INSUFFICIENT_EVIDENCE', h?.conditionState);
  check('untouched/B10: still carries a question', !!h?.clarification);
}

roleAnalyser();
pairedRoleFixtures();
observationAvailability();
priorUntouched();

console.log(`\nL3-2e syntactic role suite: ${passed} passed, ${failed} failed`);
if (failures.length) { console.log('\nFAILURES:'); for (const f of failures) console.log(`  - ${f}`); }
process.exit(failed === 0 ? 0 : 1);
