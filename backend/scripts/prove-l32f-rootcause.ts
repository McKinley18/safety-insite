/**
 * L3-2f -- F1..F4 ROOT-CAUSE PROOF, run against the UNPATCHED L3-2e code.
 *
 * `ROOT_CAUSE_BEFORE_REMEDIATION`. This program asserts nothing about any repair. It drives the REAL
 * modules and the REAL binder and records, for each fixture, the exact value the defective function
 * returned and which check consumed it -- so every L3-2f repair is measured against a demonstrated
 * mechanism rather than a described one.
 *
 * The entry contract requires that F1 and F2 be proven SEPARATELY rather than assumed independent,
 * and that F3 and F4 be shown to be what §35.5 says they are. The four are laid out so that a reader
 * can see which are one mechanism and which are genuinely distinct:
 *
 *   F1  negation-scope.ts::hasPredicate()   -- PREDICATE RECOGNITION as list membership.
 *   F2  predicate-role.ts::NP_TERMINATORS   -- NOUN-PHRASE BOUNDARY as list membership.
 *   F3  checkContradiction head test        -- SEMANTIC IDENTITY by substring containment.
 *   F4  checkStateSupported CORRECTED       -- ASSERTION as verb-only, refusing nominal predication.
 *
 * All four are instances of §32.5's pattern. They are NOT all the same function, and the proof
 * records which lexical set each one consults so the generalisation can be aimed correctly.
 *
 * Every defect fixture is PAIRED with a counter-fixture that must keep its current, correct
 * behaviour. A repair that closes the first and breaks the second is not a repair.
 *
 * NO NETWORK, NO DATABASE. Run: OUT=... npx ts-node scripts/prove-l32f-rootcause.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { negationScopes, governingNegation } from '../src/safescope-v2/reasoning-l3/negation-scope';
import { nounPhraseHead, tokenRole } from '../src/safescope-v2/reasoning-l3/predicate-role';

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32f-rc', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

/** Drives the real validator and the real binder over one hand-built candidate. */
function bind(text: string, family: string, quote: string, state: HazardCandidate['conditionState'],
  rationale = 'the observation states this condition directly') {
  const input = mk(text);
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
  if (v.state !== 'VALID' || !v.validated) {
    return { survived: false, fatalCodes: v.issues.map(i => i.code), detail: 'validator rejected' };
  }
  const s = bindEvidenceSemantically(v.validated, input);
  const fatal = s.issues.filter(i => i.severity === 'FATAL');
  return {
    survived: s.boundHazards.some(h => h.candidateKey === 'k1'),
    fatalCodes: [...new Set(fatal.map(i => i.code))],
    detail: fatal.map(i => i.detail).join(' | '),
  };
}

const out: any = { phase: 'L3-2f', role: 'ROOT_CAUSE_PROOF_AGAINST_UNPATCHED_L3_2E', generatedAt: new Date().toISOString(), findings: {} };

// =====================================================================================
// F1 -- negation-scope.ts::hasPredicate(). Predicate recognition as list membership.
// =====================================================================================
{
  const rows: any[] = [];

  // The measured contradiction, verbatim from blueprint 35.6.
  const WENT = 'No flammable atmosphere was detected at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening.';
  const WAS = 'No flammable atmosphere was detected at the manway, and the fitter was inside the vessel with the agitator still on line and nobody at the opening.';
  const HAZ = 'the agitator still on line and nobody at the opening';

  for (const [id, text, verb, expectScopeEndsAtComma] of [
    ['F1-DNG04-went', WENT, 'went', true],
    ['F1-DNG04-was', WAS, 'was (the PAIRED half -- already correct today)', true],
  ] as Array<[string, string, string, boolean]>) {
    const commaAt = text.indexOf(',');
    const scopes = negationScopes(text);
    const first = scopes[0];
    const hazStart = text.indexOf(HAZ);
    const gov = governingNegation(text, hazStart, hazStart + HAZ.length);
    // The rationale deliberately carries NO negation token: `checkNegationAddressed` steps aside when
    // the rationale itself negates, and that escape hatch would mask the scope defect under test.
    const r = bind(text, 'confined_space', HAZ, 'ACTIVE',
      'the vessel was entered while the agitator remained on line and the opening was left unattended');
    rows.push({
      id, verb, text,
      commaOffset: commaAt,
      negationScopeEnd: first ? first.to : null,
      scopeEndsAtComma: first ? first.to === commaAt : null,
      scopeCrossesTheComma: first ? first.to > commaAt : null,
      expectScopeEndsAtComma,
      hazardSpanGovernedByNegation: gov !== null,
      binderSurvived: r.survived, binderFatalCodes: r.fatalCodes, binderDetail: r.detail,
      highConsequence: true,
    });
  }

  // Why: the predicate test cannot see the verb.
  const probes = ['went', 'climbed', 'entered', 'fell', 'broke', 'cut', 'torn', 'was', 'is', 'operating', 'detected'];
  const FINITE_VERB_MARKERS_SNAPSHOT = ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'does', 'did', 'do',
    'will', 'would', 'can', 'could', 'should', 'must', 'remains', 'remained',
    'appears', 'appeared', 'shows', 'showed', 'sits', 'sat', 'stands', 'stood'];
  const visibility = probes.map(v => ({
    verb: v,
    inFiniteVerbMarkerList: FINITE_VERB_MARKERS_SNAPSHOT.includes(v),
    matchesParticipleRegex: /\b[a-z]{5,}(?:ing|ed)\b/i.test(v),
    visibleToHasPredicate: FINITE_VERB_MARKERS_SNAPSHOT.includes(v) || /\b[a-z]{5,}(?:ing|ed)\b/i.test(v),
  }));

  // The counter-fixture the repair must not break: RC-08's coordinated list crosses its commas.
  const RC08 = 'Two men were working at the leading edge of the third lift with no guardrail, safety net or personal fall arrest system in use.';
  const rc08Scope = negationScopes(RC08).find(s => s.token.toLowerCase() === 'no');
  const rc08Comma = RC08.indexOf(',');

  out.findings.F1 = {
    id: 'F1',
    defect: 'L3_2E_SCOPE_CONTRADICTION -- negation-scope.ts::hasPredicate()',
    responsibleFunction: 'backend/src/safescope-v2/reasoning-l3/negation-scope.ts::hasPredicate()',
    consumedBy: 'negationScopes() comma-boundary test -> governingNegation() -> checkNegationAddressed()',
    mechanism: 'predicate recognition is membership in FINITE_VERB_MARKERS (24 auxiliaries) OR a participle regex requiring five letters before -ing/-ed. A finite lexical verb that is neither -- "went" -- is invisible, so the comma is not treated as a clause boundary and the negation scope runs to the end of the sentence.',
    semanticExpectation: 'the comma before "and the fitter went inside" ends the negation scope, exactly as it does for "and the fitter was inside"',
    blueprintInvariant: 'L3-INV-11 (negation scope preserved in every evidence span); blueprint 35.6',
    defectClass: 'ANOTHER_MANIFESTATION -- seventh instance of the 32.5 closed-vocabulary pattern',
    rows, verbVisibility: visibility,
    counterFixture: {
      id: 'F1-RC08-list', text: RC08, commaOffset: rc08Comma,
      scopeEnd: rc08Scope ? rc08Scope.to : null,
      scopeCrossesComma: rc08Scope ? rc08Scope.to > rc08Comma : null,
      requirement: 'MUST STAY TRUE after the repair -- a coordinated negated list has no finite verb and must remain in scope',
    },
  };
}

// =====================================================================================
// F2 -- DISC-05. NP_TERMINATORS omits `against`, so the head resolves past the preposition.
// =====================================================================================
{
  const rows = [
    { id: 'F2-DISC05', phrase: 'no deficiencies against the storage standard',
      after: ' deficiencies against the storage standard', expectedHead: 'deficiencies',
      why: 'the head of the negated NP is "deficiencies"; "against the storage standard" is a prepositional post-modifier' },
    { id: 'F2-PAIR-of', phrase: 'no hazard of any kind', after: ' hazard of any kind', expectedHead: 'hazard',
      why: 'THE PAIRED HALF -- `of` IS in NP_TERMINATORS, so this one already resolves correctly today' },
    { id: 'F2-PAIR-to', phrase: 'no damage to the enclosure', after: ' damage to the enclosure', expectedHead: 'damage',
      why: 'THE PAIRED HALF -- `to` IS in NP_TERMINATORS' },
    { id: 'F2-other-preps', phrase: 'no defects beyond the coupling', after: ' defects beyond the coupling', expectedHead: 'defects',
      why: 'the same gap for a preposition nobody has listed yet -- `beyond`, `regarding`, `concerning`, `per`, `versus`' },
    { id: 'F2-other-preps-2', phrase: 'no violations per the inspection checklist', after: ' violations per the inspection checklist', expectedHead: 'violations',
      why: 'a fifth unlisted preposition; the list is the mechanism, not the word' },
  ].map(r => {
    const head = nounPhraseHead(r.after, 0);
    const HAZARD_NEGATION_OBJECTS = ['access', 'exposure', 'damage', 'deficienc', 'injur', 'violation',
      'hazard', 'defect', 'issue', 'problem', 'concern', 'finding', 'discrepanc', 'incident', 'harm'];
    return {
      ...r, actualHead: head,
      headCorrect: head === r.expectedHead,
      hazardObjectMatched: head ? (HAZARD_NEGATION_OBJECTS.find(o => head.includes(o)) ?? null) : null,
      guardWouldFire: head ? HAZARD_NEGATION_OBJECTS.some(o => head.includes(o)) : false,
    };
  });

  // Consequence at the binder: E-SR-06's negative control is no longer refused.
  const NEGCTRL = 'The audit of the thinners store recorded no hazard of any kind and no deficiencies against the storage standard.';
  const guarded = bind(NEGCTRL, 'chemical_storage', 'no deficiencies against the storage standard', 'ACTIVE',
    'the store was audited');

  out.findings.F2 = {
    id: 'F2',
    defect: 'L3-2E-DISC-05 -- NP_TERMINATORS is an incomplete preposition list',
    responsibleFunction: 'backend/src/safescope-v2/reasoning-l3/predicate-role.ts::nounPhraseHead() via NP_TERMINATORS',
    consumedBy: 'checkContradiction path (A) -- the negated-hazard guard',
    mechanism: 'the NP head is "the last content word before a LISTED terminator". `against` is not listed, so head resolution walks through the preposition and returns the object of the PP ("standard") instead of the head ("deficiencies"). The hazard-object guard then finds nothing and a genuinely negated hazard is no longer refused.',
    semanticExpectation: 'the head of "no deficiencies against the storage standard" is "deficiencies"',
    blueprintInvariant: 'blueprint 35.5 DISC-05; precision guard supporting L3-INV-04 (no default ACTIVE)',
    defectClass: 'ANOTHER_MANIFESTATION of F1 -- a BOUNDED STRUCTURAL PROPERTY (is this word a function word that closes a noun phrase?) implemented as membership in a hand-maintained list. Same mechanism, different list, different function.',
    sharesMechanismWith: 'F1',
    direction: 'PRECISION -- it fails to refuse, it does not delete',
    rows,
    binderConsequence: {
      id: 'F2-negctrl', text: NEGCTRL, survivedAsActive: guarded.survived,
      fatalCodes: guarded.fatalCodes,
      requirement: 'a NEGATED-hazard negative control claimed ACTIVE MUST be refused; today it is not',
    },
  };
}

// =====================================================================================
// F3 -- DISC-06. Substring containment used as semantic identity, plus a head-resolution bug.
// =====================================================================================
{
  const HAZARD_NEGATION_OBJECTS = ['access', 'exposure', 'damage', 'deficienc', 'injur', 'violation',
    'hazard', 'defect', 'issue', 'problem', 'concern', 'finding', 'discrepanc', 'incident', 'harm'];

  const rows = [
    { id: 'F3-DISC06', phrase: 'no hearing protection issued', after: ' hearing protection issued',
      expectedHead: 'protection', mustGuardFire: false,
      why: 'the head is "protection" -- a CONTROL, whose absence IS the hazard. "issued" is a post-modifying participle. Deleting this finding is why noise_exposure is NOT_YET_SEALED_VALIDATED.' },
    { id: 'F3-PAIR-issue', phrase: 'no issue was found', after: ' issue was found',
      expectedHead: 'issue', mustGuardFire: true,
      why: 'THE PAIRED HALF -- here "issue" really IS the head and really IS a hazard object. The guard must keep firing.' },
    { id: 'F3-harm-in-harmless', phrase: 'no harmless residue', after: ' harmless residue',
      expectedHead: 'residue', mustGuardFire: false,
      why: 'substring containment also matches `harm` inside `harmless` -- the same defect on a different token' },
    { id: 'F3-concern-in-concerning', phrase: 'no concerning wear', after: ' concerning wear',
      expectedHead: 'wear', mustGuardFire: false,
      why: '`concern` inside `concerning`, an attributive participle' },
    { id: 'F3-access-in-accessory', phrase: 'no accessory guard fitted', after: ' accessory guard fitted',
      expectedHead: 'guard', mustGuardFire: false,
      why: '`access` inside `accessory` -- an unrelated token entirely' },
  ].map(r => {
    const head = nounPhraseHead(r.after, 0);
    const matched = head ? (HAZARD_NEGATION_OBJECTS.find(o => head.includes(o)) ?? null) : null;
    return {
      ...r, actualHead: head, headCorrect: head === r.expectedHead,
      substringMatchedObject: matched,
      guardFires: matched !== null,
      guardFiresCorrectly: (matched !== null) === r.mustGuardFire,
      twoIndependentFaults: r.id === 'F3-DISC06'
        ? 'head resolution returns the trailing participle AND substring containment then matches `issue` inside `issued`'
        : 'substring containment alone',
    };
  });

  // Consequence at the binder: the noise_exposure finding is deleted.
  const NOISE = 'Two operators were running the pedestal grinders in the fettling bay all shift with no hearing protection issued.';
  const del = bind(NOISE, 'noise_exposure', 'no hearing protection issued', 'ACTIVE',
    'the operators worked the shift without hearing protection');

  out.findings.F3 = {
    id: 'F3',
    defect: 'L3-2E-DISC-06 -- substring containment used as semantic identity',
    responsibleFunction: 'semantic-evidence-binding.ts::checkContradiction path (A), `HAZARD_NEGATION_OBJECTS.find(o => head.includes(o))`, over a head supplied by predicate-role.ts::nounPhraseHead()',
    consumedBy: 'checkContradiction path (A)',
    mechanism: 'TWO independent faults compose. (i) nounPhraseHead() returns the trailing past participle "issued" because a participle is a content word and nothing marks it as a post-modifier. (ii) the hazard-object test is `head.includes(o)`, so the stem `issue` matches inside `issued`. Either alone would be survivable; together they delete a correct high-value finding.',
    semanticExpectation: 'the head of "no hearing protection issued" is "protection", a control, and the guard must NOT fire',
    blueprintInvariant: 'blueprint 35.5 DISC-06; hazard-recall, governed by the advancement gate',
    defectClass: 'ANOTHER_MANIFESTATION -- the same 32.5 pattern expressed as containment rather than membership. `head.includes(o)` is an UNBOUNDED admission rule: it makes every token that merely contains a listed stem a member of the set.',
    direction: 'RECALL -- it deletes correct findings. This is the high-consequence direction.',
    rows,
    binderConsequence: {
      id: 'F3-noise', text: NOISE, survived: del.survived, fatalCodes: del.fatalCodes, detail: del.detail,
      requirement: 'MUST survive after the repair -- this single deletion is the whole reason noise_exposure has no sealed validation',
    },
  };
}

// =====================================================================================
// F4 -- DISC-07. CORRECTED requires a VERB, refusing a nominal correction.
// =====================================================================================
{
  const rows: any[] = [];
  const cases = [
    { id: 'F4-DISC07', text: 'The frayed sling was taken off the crane and the rigger drew a replacement from the store before the next lift.',
      quote: 'the rigger drew a replacement from the store before the next lift', state: 'CORRECTED' as const,
      token: 'replacement', mustSurvive: true,
      why: 'the correction is real and asserted -- it is simply expressed as the OBJECT of an action verb rather than as a correction verb' },
    { id: 'F4-PAIR-verb', text: 'The frayed sling was taken off the crane and was replaced from the store before the next lift.',
      quote: 'The frayed sling was taken off the crane and was replaced from the store', state: 'CORRECTED' as const,
      token: 'replaced', mustSurvive: true,
      why: 'THE PAIRED HALF -- the verb form already passes today' },
    { id: 'F4-NEG-guard', text: 'The frayed sling is still rigged on the crane and no replacement has been drawn from the store.',
      quote: 'no replacement has been drawn from the store', state: 'CORRECTED' as const,
      token: 'replacement (NEGATED)', mustSurvive: false,
      why: 'THE NEGATION GUARD -- a negated nominal correction is not a correction. It must stay refused.' },
    { id: 'F4-MENTION-only', text: 'The rigger talked through the replacement procedure for frayed slings while the frayed sling stayed rigged on the crane.',
      quote: 'The rigger talked through the replacement procedure for frayed slings', state: 'CORRECTED' as const,
      token: 'replacement (ATTRIBUTIVE, naming a procedure)', mustSurvive: false,
      why: 'CONTROL_MENTION, not CONTROL_EFFECTIVE -- naming a procedure corrects nothing. Must stay refused.' },
  ];
  for (const c of cases) {
    const r = bind(c.text, 'lifting_rigging', c.quote, c.state, 'the observation describes the corrective step taken');
    const idx = c.text.toLowerCase().indexOf(c.token.split(' ')[0].toLowerCase());
    rows.push({
      ...c,
      tokenRoleReturned: idx >= 0 ? tokenRole(c.text, idx, idx + c.token.split(' ')[0].length) : null,
      survived: r.survived, fatalCodes: r.fatalCodes, detail: r.detail,
      behavesCorrectlyToday: r.survived === c.mustSurvive,
    });
  }

  out.findings.F4 = {
    id: 'F4',
    defect: 'L3-2E-DISC-07 -- nominal corrections refused',
    responsibleFunction: 'semantic-evidence-binding.ts::checkStateSupported(), CORRECTED rule with requireAssertion:true, consuming predicate-role.ts::asserts()',
    consumedBy: 'checkStateSupported -> SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE',
    mechanism: 'L3-2e correctly required that a CORRECTED claim be ASSERTED rather than merely mentioned, and implemented "asserted" as role === ASSERTED_PREDICATE. That equates assertion with VERBHOOD. "drew a replacement" asserts a completed correction with a correction NOUN as the object of an action verb; tokenRole returns NP_HEAD and the claim is refused.',
    semanticExpectation: 'a correction noun that is the object of a completed action verb, not under a negation, supports CORRECTED',
    blueprintInvariant: 'blueprint 35.5 DISC-07; L3-INV-08 (model output is a proposal -- this vocabulary ADMITS, so it may be permissive, per the 35.1 asymmetry)',
    defectClass: 'DISTINCT MECHANISM, SAME FAMILY. F1/F2/F3 are all "membership or containment standing in for a structural property". F4 is the opposite error: a STRUCTURAL test (role) applied too narrowly, refusing a construction it was never meant to exclude. It is a regression introduced by L3-2e, not a surviving lexical gate.',
    sharesMechanismWith: null,
    direction: 'ADMISSION -- refuses a state the model correctly claimed',
    governingAsymmetry: 'blueprint 35.1 -- a vocabulary used to ADMIT may be permissive. The negation guard and the mention/effective distinction must both survive.',
    rows,
  };
}

// ---- summary
out.summary = {
  // F1 is proven by the CONTRADICTION -- the same sentence, one lexical verb apart, scoped two
  // different ways -- and by the resulting binder deletion of a high-consequence finding.
  F1_ROOT_CAUSE_PROVEN: (() => {
    const went = out.findings.F1.rows.find((r: any) => r.id === 'F1-DNG04-went');
    const was = out.findings.F1.rows.find((r: any) => r.id === 'F1-DNG04-was');
    return went.scopeCrossesTheComma === true && went.hazardSpanGovernedByNegation === true
      && went.binderSurvived === false
      && was.scopeEndsAtComma === true && was.hazardSpanGovernedByNegation === false
      && was.binderSurvived === true
      && out.findings.F1.counterFixture.scopeCrossesComma === true;
  })(),
  F2_ROOT_CAUSE_PROVEN: out.findings.F2.rows.some((r: any) => r.id === 'F2-DISC05' && r.headCorrect === false),
  F3_ROOT_CAUSE_PROVEN: out.findings.F3.rows.some((r: any) => r.id === 'F3-DISC06' && r.guardFiresCorrectly === false)
    && out.findings.F3.binderConsequence.survived === false,
  F4_ROOT_CAUSE_PROVEN: out.findings.F4.rows.some((r: any) => r.id === 'F4-DISC07' && r.behavesCorrectlyToday === false),
  sharedMechanism: 'F1, F2 and F3 are ONE mechanism in three functions: a bounded structural property of a clause or noun phrase (does this segment carry a predicate? does this word close a noun phrase? is this token that token?) decided by consulting a hand-maintained lexical set or by substring containment. F4 is the mirror image and is a L3-2e regression.',
};

const dest = process.env.OUT ?? '/tmp/l32f-rootcause.json';
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
console.log(`\nwritten: ${dest}`);
