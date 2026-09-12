/**
 * §157 EXPERT HAZLENZ -- VERIFIER v2 LOCAL ACCEPTANCE. ZERO PROVIDER CALLS.
 *
 * Proves the v2 admission rule locally before any hosted spend: the HS-H1 replay (Phase 5), the
 * negative nomination matrix over every §156 case (Phase 6), the adversarial nine (Phase 7), and the
 * containment matrix (Phase 9).
 *
 * ==================== WHAT THESE MATRICES DO AND DO NOT PROVE ====================
 *
 * They test the ADMISSION RULE -- a property of a nomination object, decidable from bytes. They do
 * NOT predict what a hosted model will nominate. A rule that admits the right shape and refuses the
 * wrong ones is necessary for v2 to be worth testing and is not evidence that v2 works. §156's own
 * lesson applies: local structure and hosted behaviour are different measurements.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  checkVerifierV2Output, verifierV2Effect, EXPERT_VERIFIER_CONTRACT_V2_VERSION,
  ADMISSION_RULE_CLASSIFICATION, DUPLICATE_OVERLAP_THRESHOLD, VERIFIER_FORBIDDEN_FIELDS,
  VERIFIER_VERDICTS,
} from './lib/expert-verifier-contract-v2';
import {
  EXPERT_VERIFIER_V2_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
} from './lib/expert-verifier-instruction-v2';

let passed = 0; let failed = 0;
function ok(label: string, cond: boolean, detail = ''): void {
  if (cond) { passed += 1; console.log(`ok    ${label}${detail ? '  ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${label}${detail ? '  ' + detail : ''}`); }
}

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-verifier-accuracy-2026-09-03');
interface PacketCase {
  caseId: string; observation: string;
  firstPass: { candidates: Array<Record<string, unknown>>; clarifications: unknown[];
    uncertainty: string[]; summary: string };
  unresolvedFacts: Array<{ ref: string; kind: string; text: string }>;
}
const packet = JSON.parse(readFileSync(join(OUT, 'VERIFIER-PACKET.json'), 'utf8')) as {
  cases: PacketCase[] };
const byId = new Map(packet.cases.map(c => [c.caseId, c]));
const key = (JSON.parse(readFileSync(join(OUT, 'SEALED-CASE-KEY.json'), 'utf8')) as {
  key: Array<{ caseId: string; draw: string; rowId: string }> }).key;
const rowOf = new Map(key.map(k => [k.caseId, `${k.draw} ${k.rowId}`]));

const inputFor = (caseId: string) => {
  const c = byId.get(caseId)!;
  return { analysisId: caseId, observation: c.observation,
    suppliedFacts: c.unresolvedFacts.map(f => ({ ref: f.ref, text: f.text })) };
};

/** A well-formed v2 verdict, used as the base for every mutation below. */
const baseAdd = (caseId: string, over: Record<string, unknown> = {}) => ({
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V2_VERSION,
  analysisId: caseId,
  verdict: 'ADD_OR_REPLACE_CLARIFICATION',
  rationale: 'A fact that changes the current action is unasked.',
  aboutUnresolvedFactRef: null,
  clarificationSourceMode: 'NOMINATED_FACT',
  proposedClarification: {
    question: 'A question naming the fact.', whyItMatters: 'It decides what is done now.',
    affectedDecision: 'REQUIRED_CONTROL', evidenceGap: 'The text does not state it.',
    replacesClarificationId: null,
  },
  nominatedFact: {
    missingFact: 'a fact the first pass did not raise',
    observationSpan: '', notEstablishedBecause: 'the span shows only that it was not observed',
    affectedDecision: 'REQUIRED_CONTROL',
    branchA: 'it was done', decisionIfA: 'work continues as observed',
    branchB: 'it was not done', decisionIfB: 'the machine comes out of service now',
    whyNecessaryNow: 'the work is happening at this moment',
  },
  ...over,
});

console.log('§157 EXPERT HAZLENZ — VERIFIER v2 LOCAL ACCEPTANCE');
console.log('='.repeat(100));
console.log(`  contract    ${EXPERT_VERIFIER_CONTRACT_V2_VERSION}`);
console.log(`  instruction ${EXPERT_VERIFIER_INSTRUCTION_V2_VERSION}\n`);

// ==================================================================== PHASE 5
console.log('--- PHASE 5. HS-H1 REPLAY — does v2 have the AUTHORITY v1 lacked?\n');
{
  for (const caseId of ['VC-02', 'VC-13']) {
    const c = byId.get(caseId)!;
    const supplied = c.unresolvedFacts.map(f => f.ref);
    console.log(`  ${caseId} (${rowOf.get(caseId)})`);
    console.log(`      supplied facts: ${supplied.join(', ') || '(none)'}`);

    // Under v1 the ONLY way to raise an unsupplied fact was to name a ref outside the set, which is
    // exactly what VC-02 did and exactly what v1 refused.
    const v1Shaped = { ...baseAdd(caseId), clarificationSourceMode: undefined,
      nominatedFact: undefined, aboutUnresolvedFactRef: 'candidate:a-fact-outside-the-set' };
    const underV2AsSupplied = checkVerifierV2Output(
      { ...v1Shaped, clarificationSourceMode: 'SUPPLIED_FACT' }, inputFor(caseId));
    ok(`P5.1 ${caseId}: naming an unsupplied ref under SUPPLIED_FACT is still refused`,
      !underV2AsSupplied.admitted
        && underV2AsSupplied.codes.includes('SUPPLIED_MODE_MUST_NAME_A_SUPPLIED_FACT'),
      'the v1 rule survives where it was right');

    // The nomination path, with a real verbatim span taken from THIS observation. The span is
    // located generically -- first sentence of the observation -- not by any fixture knowledge.
    const span = c.observation.split('. ')[0];
    const nominated = checkVerifierV2Output(
      baseAdd(caseId, {
        nominatedFact: { ...baseAdd(caseId).nominatedFact, observationSpan: span,
          missingFact: 'whether a control the observation does not describe was carried out' },
      }), inputFor(caseId));
    ok(`P5.2 ${caseId}: a PROVED nomination is ADMITTED — the authority v1 lacked now exists`,
      nominated.admitted && nominated.nominationAdmitted,
      nominated.codes.join(',') || 'admitted');
  }
  console.log('\n  Both HS-H1 draws can now carry a nomination that v1 refused whole.');
  console.log('  THIS IS AUTHORITY, NOT RECOVERY. Whether a hosted verifier nominates the');
  console.log('  load-side fact rather than the chamber-instrument distractor is unmeasured here');
  console.log('  and is exactly what the hosted probe exists to find out.\n');
}

// ==================================================================== PHASE 6
console.log('--- PHASE 6. NEGATIVE NOMINATION MATRIX — the 7/7 specificity must survive\n');
{
  // A nomination whose two branches lead to the SAME action is the shape a legitimate-silence case
  // produces when a model over-reaches. It must be refused on EVERY case, with no exceptions.
  let refusedEverywhere = 0;
  const silenceCases = ['VC-01', 'VC-05', 'VC-07', 'VC-09', 'VC-10', 'VC-12', 'VC-15'];
  const excludedCases = ['VC-03', 'VC-06', 'VC-11', 'VC-14'];
  const correctRequired = ['VC-04', 'VC-08'];
  const all = [...silenceCases, ...excludedCases, ...correctRequired, 'VC-02', 'VC-13'];

  for (const caseId of all) {
    const c = byId.get(caseId)!;
    const span = c.observation.split('. ')[0];
    const converging = checkVerifierV2Output(baseAdd(caseId, {
      nominatedFact: { ...baseAdd(caseId).nominatedFact, observationSpan: span,
        branchA: 'the detail is one way', decisionIfA: 'the task continues under the same controls',
        branchB: 'the detail is the other way',
        decisionIfB: 'the task continues under the same controls' },
    }), inputFor(caseId));
    if (!converging.admitted && converging.codes.includes('DECISIONS_DO_NOT_DIVERGE')) {
      refusedEverywhere += 1;
    }
  }
  ok('P6.1 a converging-branch nomination is refused on ALL fifteen stored cases',
    refusedEverywhere === all.length, `${refusedEverywhere}/${all.length}`);

  // A nomination that merely renames a fact the first pass already supplied.
  let dupRefused = 0; let dupApplicable = 0;
  for (const caseId of all) {
    const c = byId.get(caseId)!;
    if (c.unresolvedFacts.length === 0) continue;
    dupApplicable += 1;
    const span = c.observation.split('. ')[0];
    const dup = checkVerifierV2Output(baseAdd(caseId, {
      nominatedFact: { ...baseAdd(caseId).nominatedFact, observationSpan: span,
        missingFact: c.unresolvedFacts[0].text },
    }), inputFor(caseId));
    if (!dup.admitted && dup.codes.includes('NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT')) {
      dupRefused += 1;
    }
  }
  ok('P6.2 a nomination restating a supplied fact is refused wherever a supplied fact exists',
    dupRefused === dupApplicable, `${dupRefused}/${dupApplicable}`);

  // Legitimate silence must remain expressible on every silence case, unchanged from v1.
  let silenceOk = 0;
  for (const caseId of silenceCases) {
    const r = checkVerifierV2Output({
      verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V2_VERSION, analysisId: caseId,
      verdict: 'NO_CLARIFICATION_REQUIRED',
      rationale: 'The unknown is real and the answer changes nothing done today.',
      aboutUnresolvedFactRef: byId.get(caseId)!.unresolvedFacts[0]?.ref ?? null,
      clarificationSourceMode: null, proposedClarification: null, nominatedFact: null,
    }, inputFor(caseId));
    if (r.admitted) silenceOk += 1;
  }
  ok('P6.3 NO_CLARIFICATION_REQUIRED remains expressible on all seven silence cases',
    silenceOk === silenceCases.length, `${silenceOk}/${silenceCases.length}`);

  // The §156 correct outcomes must all still be representable under v2.
  let representable = 0;
  for (const caseId of correctRequired) {
    const c = byId.get(caseId)!;
    const r = checkVerifierV2Output(baseAdd(caseId, {
      clarificationSourceMode: c.unresolvedFacts.length > 0 ? 'SUPPLIED_FACT' : 'NOMINATED_FACT',
      aboutUnresolvedFactRef: c.unresolvedFacts[0]?.ref ?? null,
      nominatedFact: c.unresolvedFacts.length > 0 ? null
        : { ...baseAdd(caseId).nominatedFact, observationSpan: c.observation.split('. ')[0] },
    }), inputFor(caseId));
    if (r.admitted) representable += 1;
  }
  ok('P6.4 both §156 correct recoveries remain representable under v2',
    representable === correctRequired.length, `${representable}/${correctRequired.length}`);

  ok('P6.5 NOMINATION_FALSE_POSITIVE_COUNT for the converging and duplicate shapes is ZERO across '
    + 'all fifteen stored cases', refusedEverywhere === all.length && dupRefused === dupApplicable,
    'no unproved nomination is admitted anywhere');
}

// ==================================================================== PHASE 7
console.log('\n--- PHASE 7. ADVERSARIAL — nine reasons that are NOT reasons to nominate\n');
{
  const OBS = 'A worker is using a bench grinder with the tool rest set and the eye shield in '
    + 'place. He is wearing safety glasses under a face shield. The observation does not record '
    + 'the wheel manufacturer or the date the wheel was fitted.';
  const input = { analysisId: 'ADV', observation: OBS,
    suppliedFacts: [{ ref: 'uncertainty:0', text: 'the wheel manufacturer is not recorded' }] };
  const nom = (over: Record<string, unknown>) => checkVerifierV2Output({
    ...baseAdd('ADV'), nominatedFact: { ...baseAdd('ADV').nominatedFact,
      observationSpan: 'the tool rest set and the eye shield in place', ...over },
  }, input);

  const converge = (a: string) => ({ decisionIfA: a, decisionIfB: a });
  const cases: Array<[string, Record<string, unknown>]> = [
    ['A.1 information is merely missing', { missingFact: 'the wheel fitting date',
      ...converge('grinding continues under the observed controls') }],
    ['A.2 severity could be calculated more precisely', { missingFact: 'the daily grinding duration',
      ...converge('grinding continues under the observed controls') }],
    ['A.3 documentation could be improved', { missingFact: 'whether a wheel register is kept',
      ...converge('grinding continues; a record would be tidier') }],
    ['A.4 another control might conceivably exist', { missingFact: 'whether LEV is also fitted',
      ...converge('grinding continues under the observed controls') }],
    ['A.5 an inspector could gather more evidence', { missingFact: 'the wheel speed rating',
      ...converge('grinding continues under the observed controls') }],
    ['A.6 a candidate sits at INSUFFICIENT_EVIDENCE', { missingFact: 'the wheel condition',
      ...converge('grinding continues under the observed controls') }],
    ['A.7 the fact is interesting', { missingFact: 'what the worker is grinding',
      ...converge('grinding continues under the observed controls') }],
    ['A.8 a hypothetical answer could theoretically matter one day',
      { missingFact: 'whether the wheel will later be swapped',
        ...converge('grinding continues under the observed controls') }],
    ['A.9 the first pass was empty or uncertain', { missingFact: 'anything at all',
      ...converge('grinding continues under the observed controls') }],
  ];
  let refused = 0;
  for (const [label, over] of cases) {
    const r = nom(over);
    const good = !r.admitted && r.codes.includes('DECISIONS_DO_NOT_DIVERGE');
    if (good) refused += 1;
    ok(`P7 ${label} — refused, because both branches lead to the same action`, good,
      r.codes.join(',') || 'ADMITTED (should not be)');
  }
  ok('P7.10 all nine adversarial shapes refused', refused === 9, `${refused}/9`);

  // And the control: a nomination that DOES diverge is admitted, so the rule is not simply strict.
  const real = nom({ missingFact: 'whether the wheel was ring-tested before it was fitted',
    branchA: 'it was ring-tested and passed', decisionIfA: 'grinding continues',
    branchB: 'it was not ring-tested', decisionIfB: 'the grinder is taken out of use now' });
  ok('P7.11 CONTROL — a genuinely diverging nomination IS admitted, so the rule is discriminating '
    + 'rather than merely strict', real.admitted && real.nominationAdmitted,
    real.codes.join(',') || 'admitted');
}

// ==================================================================== PHASE 9
console.log('\n--- PHASE 9. LOCAL ACCEPTANCE / CONTAINMENT\n');
{
  const OBS = byId.get('VC-08')!.observation;
  const input = { analysisId: 'VC-08', observation: OBS,
    suppliedFacts: byId.get('VC-08')!.unresolvedFacts.map(f => ({ ref: f.ref, text: f.text })) };
  const span = OBS.split('. ')[0];
  const good = baseAdd('VC-08', { nominatedFact: { ...baseAdd('VC-08').nominatedFact,
    observationSpan: span, missingFact: 'a control the text does not describe' } });

  ok('P9.1 a fully proved nomination is admitted', checkVerifierV2Output(good, input).admitted);
  ok('P9.2 NOMINATION MAX = 1 — a list is refused',
    checkVerifierV2Output({ ...good, nominatedFact: [good.nominatedFact, good.nominatedFact] },
      input).codes.includes('MORE_THAN_ONE_NOMINATION'));
  ok('P9.3 a span that is NOT verbatim in the observation is refused',
    checkVerifierV2Output({ ...good, nominatedFact: { ...good.nominatedFact,
      observationSpan: 'a span the observation never contained' } }, input)
      .codes.includes('OBSERVATION_SPAN_NOT_VERBATIM'),
    'the no-invented-hazard rule, enforced by byte equality');
  ok('P9.4 a missing branch proof rejects the nomination',
    checkVerifierV2Output({ ...good, nominatedFact: { ...good.nominatedFact, branchB: '' } },
      input).codes.includes('NOMINATION_FIELD_MISSING'));
  ok('P9.5 identical branches are refused',
    checkVerifierV2Output({ ...good, nominatedFact: { ...good.nominatedFact,
      branchA: 'the same thing', branchB: 'the same thing' } }, input)
      .codes.includes('BRANCHES_IDENTICAL'));
  ok('P9.6 a non-decision-critical fact — converging decisions — is refused',
    checkVerifierV2Output({ ...good, nominatedFact: { ...good.nominatedFact,
      decisionIfA: 'work continues', decisionIfB: 'work continues' } }, input)
      .codes.includes('DECISIONS_DO_NOT_DIVERGE'));
  ok('P9.7 a missing affectedDecision is refused',
    checkVerifierV2Output({ ...good, nominatedFact: { ...good.nominatedFact,
      affectedDecision: '' } }, input).codes.includes('NOMINATION_FIELD_MISSING'));
  ok('P9.8 an affectedDecision outside the frozen enum is refused',
    checkVerifierV2Output({ ...good, nominatedFact: { ...good.nominatedFact,
      affectedDecision: 'SOMETHING_NEW' } }, input)
      .codes.includes('AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER'));
  ok('P9.9 a nomination on a non-ADD verdict is refused',
    checkVerifierV2Output({ ...good, verdict: 'NO_CLARIFICATION_REQUIRED',
      proposedClarification: null }, input)
      .codes.includes('NOMINATION_NOT_PERMITTED_FOR_THIS_VERDICT'));
  ok('P9.10 SUPPLIED_FACT mode may not carry a nomination',
    checkVerifierV2Output({ ...good, clarificationSourceMode: 'SUPPLIED_FACT',
      aboutUnresolvedFactRef: input.suppliedFacts[0].ref }, input)
      .codes.includes('NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE'));
  ok('P9.11 an ADD verdict with no source mode is refused',
    checkVerifierV2Output({ ...good, clarificationSourceMode: null, nominatedFact: null }, input)
      .codes.includes('SOURCE_MODE_MISSING_ON_A_CLARIFICATION'));

  // Containment: the forbidden fields, and the effect map.
  let forbiddenCaught = 0;
  for (const f of VERIFIER_FORBIDDEN_FIELDS) {
    const r = checkVerifierV2Output({ ...good, [f]: 1 }, input);
    if (r.detail.includes(`FORBIDDEN_FIELD:${f}`)) forbiddenCaught += 1;
  }
  ok('P9.12 every forbidden field is enforced under v2, not merely listed',
    forbiddenCaught === VERIFIER_FORBIDDEN_FIELDS.length,
    `${forbiddenCaught}/${VERIFIER_FORBIDDEN_FIELDS.length}`);

  const eff = verifierV2Effect('ADD_OR_REPLACE_CLARIFICATION', 'NOMINATED_FACT');
  ok('P9.13 a NOMINATED fact cannot mutate candidates or candidate states',
    eff.candidatesMayChange === false && eff.candidateStatesMayChange === false);
  ok('P9.14 it cannot alter deterministic output', eff.deterministicMayChange === false);
  ok('P9.15 it cannot introduce citations', eff.citationsMayChange === false);
  ok('P9.16 it cannot change risk or corrective actions',
    eff.riskMayChange === false && eff.correctiveActionsMayChange === false);
  ok('P9.17 it cannot add insights or disagreements',
    eff.insightsMayChange === false && eff.disagreementsMayChange === false);
  ok('P9.18 THE ONLY COLLECTION A NOMINATION CAN AFFECT IS decisionCriticalClarifications',
    eff.affectedCollections.length === 1
      && eff.affectedCollections[0] === 'decisionCriticalClarifications',
    eff.affectedCollections.join(',') || 'none');
  const silent = verifierV2Effect('NO_CLARIFICATION_REQUIRED', null);
  ok('P9.19 a silence verdict changes nothing at all',
    silent.clarificationsMayChange === false && silent.affectedCollections.length === 0);
  ok('P9.20 ABSTAIN remains a distinct member and is not merged with NO_CLARIFICATION_REQUIRED',
    VERIFIER_VERDICTS.includes('ABSTAIN')
      && VERIFIER_VERDICTS.includes('NO_CLARIFICATION_REQUIRED')
      && new Set(VERIFIER_VERDICTS).size === VERIFIER_VERDICTS.length,
    VERIFIER_VERDICTS.join(' | '));

  // The instruction must still carry no fixture vocabulary.
  const leaks = [/autoclave/i, /cooling hold/i, /spray booth/i, /flame.failure/i, /debarker/i,
    /fryer/i, /\btyres?\b/i, /\btires?\b/i, /HS-[A-R]\d/, /kerb/i, /grinder/i, /VC-\d\d/]
    .filter(re => re.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT));
  ok('P9.21 instruction v2 encodes no evaluation-set vocabulary', leaks.length === 0,
    `${leaks.length} matches across 12 patterns`);
  ok('P9.22 instruction v2 does not say "look for anything else wrong" and does not ask for a fresh '
    + 'hazard analysis',
    !/anything else wrong/i.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT)
      && !/re-?analys|fresh (hazard )?analysis/i.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT
        .replace('You do not re-analyse the hazards.', '')),
    'checked');
  ok('P9.23 instruction v2 states plainly that NO is the usual answer to the nomination question',
    /THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER/.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT));
  ok('P9.24 instruction v2 still states no quota and no expected ratio',
    /no expected number of questions, no expected number of silences, and no expected number/
      .test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT.replace(/\n/g, ' ')));

  const semantic = Object.values(ADMISSION_RULE_CLASSIFICATION)
    .filter(v => v.startsWith('SEMANTIC')).length;
  ok('P9.25 the admission rule declares WHICH conditions it cannot decide — three are the '
    + "verifier's own semantic assertions, attested by required proof fields and not verifiable here",
    semantic === 3, `${semantic} semantic, ${Object.keys(ADMISSION_RULE_CLASSIFICATION).length - semantic} deterministic`);
  ok('P9.26 the duplicate threshold is high enough that shared vocabulary is not a duplicate',
    DUPLICATE_OVERLAP_THRESHOLD >= 0.8, String(DUPLICATE_OVERLAP_THRESHOLD));
}

console.log(`\n${passed} passed, ${failed} failed`);
console.log('PROVIDER_CALLS = 0   FIRST_PASS_INVOCATIONS = 0   PRODUCTION_FILES_CHANGED = 0');
if (failed > 0) process.exit(1);
