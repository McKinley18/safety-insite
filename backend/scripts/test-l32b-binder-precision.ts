/**
 * L3-2b -- binder precision, negation scope, and clarification policy. NO NETWORK, NO DATABASE.
 *
 * The L3-2 suite proves unsafe output cannot validate. This one proves the opposite direction, which
 * is what L3-2 got wrong: SAFE, CORRECT output must not be rejected either. Every fixture below is a
 * proposal the deterministic validator accepts, driven through the real semantic binder.
 *
 * Each PRECISION case is paired with the RECALL case it must not break. Widening a rule until the
 * false negative disappears is easy; the paired counter-fixture is what stops that being the fix.
 *
 * Run: npm run test:l32b-binder-precision
 */
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically, severityOf } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { governingNegation, negationScopes, containsNegation } from '../src/safescope-v2/reasoning-l3/negation-scope';
import { buildUserPrompt, L3_SYSTEM_PROMPT } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';

let passed = 0, failed = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) { passed += 1; return; }
  failed += 1; failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};

// ---------------------------------------------------------------- helpers

function mk(text: string, families: string[], advisory?: Array<{ signalId: string; kind: any; value: string }>): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32b', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: families, advisorySignals: advisory,
  }).input;
}

function ev(input: ReasoningInput, quote: string) {
  const text = input.authoritativeSources[0].text;
  const start = text.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not present verbatim: ${JSON.stringify(quote)}`);
  return { sourceId: 'observation-1', sourceType: 'observation' as const, startOffset: start, endOffset: start + quote.length, quotedText: quote };
}

function cand(over: Partial<HazardCandidate> & Pick<HazardCandidate, 'candidateKey' | 'hazardFamily' | 'conditionState' | 'evidence'>): HazardCandidate {
  return {
    conditionRationale: 'stated rationale', independentHazardRationale: 'the only hazard described',
    uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null,
    regulatoryCandidateRefs: [], ...over,
  };
}

function prop(input: ReasoningInput, candidates: HazardCandidate[], outcome: ReasoningProposal['outcome'] = 'ANALYZED'): ReasoningProposal {
  return {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: input.analysisId, outcome,
    observationInterpretation: 'x', hazardCandidates: candidates, jurisdictionProposal: null,
  };
}

/** Drives the real validator then the real binder, and fails loudly if the fixture never got there. */
function bind(label: string, input: ReasoningInput, candidates: HazardCandidate[]) {
  const v = validateReasoningProposal(prop(input, candidates), input);
  check(`${label}: deterministic validator accepts the fixture`, v.state === 'VALID', v.issues.map(i => i.code).join(',') || 'none');
  if (!v.validated) return { boundHazards: [], rejected: [], issues: [], clarificationExpected: [] } as any;
  return bindEvidenceSemantically(v.validated, input);
}

const codes = (r: any) => [...new Set(r.issues.map((i: any) => i.code))] as string[];
const fatalCodes = (r: any) => [...new Set(r.issues.filter((i: any) => i.severity === 'FATAL').map((i: any) => i.code))] as string[];

// ================================================================ 1. NEGATION SCOPE (Phase 4)

function negationScope(): void {
  const cases: Array<[string, string, string, boolean]> = [
    ['direct negation', 'The extinguisher was not inspected this year.', 'inspected this year', true],
    ['immediately preceding negation', 'The panel had no cover installed.', 'cover installed', true],
    ['negated list across commas (RC-08)', 'A worker was at the leading edge with no guardrail, safety net or personal fall arrest system in use.', 'safety net or personal fall arrest system in use', true],
    ['negated list continuation', 'The machine had no guard, no interlock and no warning label.', 'no interlock', true],
    ['comma then new predication (C11)', 'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing', 'cardboard and pallets stacked under where the sparks were landing', false],
    ['semicolon boundary', 'There was no damage to the sling; the hook latch was bent.', 'the hook latch was bent', false],
    ['bare subordinator "while" (B08)', 'He was using a grinder without a face shield while a propane forklift idled underneath refueling from a cylinder.', 'a propane forklift idled underneath refueling from a cylinder', false],
    ['", and separately" (A10)', 'The bay had no local exhaust ventilation in use, and separately the exit door was blocked by cylinders.', 'the exit door was blocked by cylinders', false],
    ['contrastive "however"', 'We found no deficiencies, however the ladder rung was cracked.', 'the ladder rung was cracked', false],
    ['contrastive "but"', 'The east guard was not missing but the west guard had been taken off.', 'the west guard had been taken off', false],
    ['contrastive "although"', 'The rail was intact although no toeboard was fitted.', 'no toeboard was fitted', true],
    ['affirmative then negation', 'The hoist was overloaded and no load chart was posted.', 'The hoist was overloaded', false],
    ['span before the negation', 'The guard was missing and no one was nearby.', 'The guard was missing', false],
    ['sentence boundary', 'No injuries occurred. The scaffold plank was cracked.', 'The scaffold plank was cracked', false],
  ];
  for (const [label, text, span, expectGoverned] of cases) {
    const at = text.indexOf(span);
    check(`negation/${label}: fixture present`, at >= 0);
    if (at < 0) continue;
    const g = governingNegation(text, at, at + span.length);
    check(`negation/${label}: governed=${expectGoverned}`, (g !== null) === expectGoverned,
      g ? `governed by '${g.token}' [${g.from},${g.to})` : 'not governed');
  }
  // the alternation-order defect found during L3-2b: `no` must not shadow `not`/`none`/`nor`
  for (const t of ['not', 'none', 'nor', 'neither', 'never']) {
    check(`negation/token '${t}' is detected`, containsNegation(`the guard was ${t} there`) !== null);
  }
  check('negation/scopes are found at all', negationScopes('no guard and not locked').length === 2);
}

// ================================================================ 2. EVIDENCE SELECTIVITY (Phase 3)

function evidenceSelectivity(): void {
  const TEXT = 'The bench grinder tongue guard is missing and the work rest is set half an inch from the wheel.';
  const input = mk(TEXT, ['machine_guarding', 'electrical']);

  // exact narrow clause
  let r = bind('selectivity/narrow', input, [cand({ candidateKey: 'n1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(input, 'tongue guard is missing')] })]);
  check('selectivity/narrow clause survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));

  // whole supporting sentence -- the B08 repair
  r = bind('selectivity/whole-sentence', input, [cand({ candidateKey: 'w1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(input, TEXT)] })]);
  check('selectivity/whole supporting sentence survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));
  check('selectivity/whole sentence raises no FATAL issue', fatalCodes(r).length === 0, JSON.stringify(fatalCodes(r)));

  // two candidates both citing the whole source: advisory, never fatal
  r = bind('selectivity/two-whole', input, [
    cand({ candidateKey: 'a', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(input, TEXT)] }),
    cand({ candidateKey: 'b', hazardFamily: 'electrical', conditionState: 'ACTIVE', evidence: [ev(input, TEXT)], independentHazardRationale: 'separate electrical concern' }),
  ]);
  check('selectivity/non-selective is reported', codes(r).includes('SEMANTIC_EVIDENCE_NOT_SELECTIVE'), JSON.stringify(codes(r)));
  check('selectivity/non-selective is ADVISORY, not fatal', severityOf('SEMANTIC_EVIDENCE_NOT_SELECTIVE') === 'ADVISORY');
  check('selectivity/machine_guarding candidate is NOT deleted', r.boundHazards.some((h: any) => h.candidateKey === 'a'), JSON.stringify(r.rejected));

  // harmless contextual text alongside the supporting clause
  const CTX = 'During the Tuesday walkthrough of the north bay the bench grinder tongue guard was found missing.';
  const ctxInput = mk(CTX, ['machine_guarding']);
  r = bind('selectivity/contextual', ctxInput, [cand({ candidateKey: 'c1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(ctxInput, CTX)] })]);
  check('selectivity/harmless context survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));

  // unrelated hazard text cannot ground a different family
  const UNREL = 'The first aid cabinet was restocked on Monday and the eyewash station was flushed.';
  const unrelInput = mk(UNREL, ['machine_guarding', 'first_aid_eyewash_safety_shower_access']);
  r = bind('selectivity/unrelated', unrelInput, [cand({ candidateKey: 'u1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(unrelInput, UNREL)] })]);
  // L3-2b, measured correction: this is reported but NOT fatal. Making it fatal deleted 8 correct
  // candidates in 30 development scenarios, one of them high-consequence. A wrong family label on a
  // real hazard is a quality defect; deleting the hazard over the label is a safety defect.
  check('selectivity/unrelated text is reported',
    codes(r).includes('SEMANTIC_EVIDENCE_UNRELATED_TO_FAMILY') || codes(r).includes('SEMANTIC_FAMILY_SUPPORT_NOT_EVIDENT'),
    JSON.stringify(codes(r)));
  check('selectivity/family mismatch is ADVISORY, not fatal',
    severityOf('SEMANTIC_EVIDENCE_UNRELATED_TO_FAMILY') === 'ADVISORY');

  // contradiction inside broad evidence
  const CONTRA = 'The tongue guard was missing at the start of the shift. The guard was replaced before lunch and the machine was returned to service.';
  const contraInput = mk(CONTRA, ['machine_guarding']);
  r = bind('selectivity/contradiction', contraInput, [cand({ candidateKey: 'x1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(contraInput, 'The tongue guard was missing at the start of the shift'), ev(contraInput, 'The guard was replaced before lunch')] })]);
  check('selectivity/unhandled contradiction is fatal',
    fatalCodes(r).includes('SEMANTIC_EVIDENCE_CONTRADICTS_STATE'), JSON.stringify(codes(r)));

  // ...but an ACTIVE claim that ADDRESSES the contradiction stands
  r = bind('selectivity/contradiction-addressed', contraInput, [cand({ candidateKey: 'x2', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(contraInput, 'The tongue guard was missing at the start of the shift'), ev(contraInput, 'The guard was replaced before lunch')], conditionRationale: 'The guard was replaced, however exposure had already occurred during the shift.' })]);
  check('selectivity/addressed contradiction survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));

  // action-only text
  const ACT = 'We will schedule a machine guarding audit for the grinder next quarter.';
  const actInput = mk(ACT, ['machine_guarding']);
  r = bind('selectivity/action-only', actInput, [cand({ candidateKey: 'p1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE', evidence: [ev(actInput, ACT)] })]);
  check('selectivity/action-only cannot establish a condition',
    fatalCodes(r).includes('SEMANTIC_ACTION_NOT_CONDITION_EVIDENCE'), JSON.stringify(codes(r)));
}

// ================================================================ 3. STATE SUPPORT (Phase 4 / D02)

function stateSupport(): void {
  const LOTO = "The line was shut down, the main disconnect was locked out with each worker's personal lock, and voltage was verified absent at the load side before work began.";
  const input = mk(LOTO, ['loto_stored_energy']);
  let r = bind('state/loto-controlled', input, [cand({ candidateKey: 'l1', hazardFamily: 'loto_stored_energy', conditionState: 'CONTROLLED', evidence: [ev(input, LOTO)] })]);
  check('state/CONTROLLED accepts isolation language (D02)', r.boundHazards.length === 1, JSON.stringify(codes(r)));

  const CORR = 'The frayed cord was found during the walk and was replaced with a new one before the end of the shift.';
  const corrInput = mk(CORR, ['electrical']);
  r = bind('state/corrected', corrInput, [cand({ candidateKey: 'c1', hazardFamily: 'electrical', conditionState: 'CORRECTED', evidence: [ev(corrInput, 'was replaced with a new one before the end of the shift')] })]);
  check('state/supported CORRECTED survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));

  // unsupported CORRECTED must still be refused -- the recall counter-case
  const MIX = 'The tongue guard is missing, and the extension cord was replaced this morning.';
  const mixInput = mk(MIX, ['machine_guarding', 'electrical']);
  r = bind('state/unsupported-corrected', mixInput, [cand({ candidateKey: 'm1', hazardFamily: 'machine_guarding', conditionState: 'CORRECTED', evidence: [ev(mixInput, 'The tongue guard is missing')] })]);
  check('state/CORRECTED from a neighbouring clause is still refused',
    fatalCodes(r).includes('SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE'), JSON.stringify(codes(r)));

  const RFS = 'The forklift was tagged out of service and removed from the floor after the mast line failed.';
  const rfsInput = mk(RFS, ['mobile_equipment']);
  r = bind('state/removed', rfsInput, [cand({ candidateKey: 'r1', hazardFamily: 'mobile_equipment', conditionState: 'REMOVED_FROM_SERVICE', evidence: [ev(rfsInput, 'tagged out of service and removed from the floor')] })]);
  check('state/REMOVED_FROM_SERVICE survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));

  const HYP = 'If the guard were removed during cleaning, the operator could reach the point of operation.';
  const hypInput = mk(HYP, ['machine_guarding']);
  r = bind('state/hypothetical', hypInput, [cand({ candidateKey: 'h1', hazardFamily: 'machine_guarding', conditionState: 'HYPOTHETICAL', evidence: [ev(hypInput, HYP)] })]);
  check('state/HYPOTHETICAL survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));
}

// ================================================================ 4. SUBJECTIVE AMBIGUITY (Phase 5)

function subjectiveAmbiguity(): void {
  const cases: Array<[string, string, string, boolean]> = [
    // label, text, family, expectFatal
    ['B10 verbatim class', 'The rail on the platform did not look right to me.', 'walking_working_surfaces', true],
    ['seemed unsafe', 'The scaffold seemed unsafe when I walked past it.', 'scaffolds', true],
    ['might be damaged', 'The sling might be damaged.', 'lifting_rigging', true],
    ['possibly leaking', 'The drum is possibly leaking.', 'chemical_storage', true],
    ['i think defective', 'I think the ladder is defective.', 'walking_working_surfaces', true],
    ['impression PLUS a fact', 'The handrail seemed loose and three balusters are missing from the run.', 'walking_working_surfaces', false],
    ['pure fact, no impression', 'The handrail is missing along twelve feet of the mezzanine edge.', 'walking_working_surfaces', false],
  ];
  for (const [label, text, family, expectFatal] of cases) {
    const input = mk(text, [family]);
    const r = bind(`subjective/${label}`, input, [cand({ candidateKey: 's1', hazardFamily: family, conditionState: 'ACTIVE', evidence: [ev(input, text)] })]);
    const fatal = fatalCodes(r).includes('SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE');
    check(`subjective/${label}: ACTIVE ${expectFatal ? 'refused' : 'allowed'}`, fatal === expectFatal, JSON.stringify(codes(r)));
    if (expectFatal) {
      check(`subjective/${label}: clarification is flagged as expected`,
        r.clarificationExpected.includes('s1'), JSON.stringify(r.clarificationExpected));
    }
  }

  // The same subjective observation at a non-asserting state must NOT be penalised.
  const t = 'The rail on the platform did not look right to me.';
  const input = mk(t, ['walking_working_surfaces']);
  const r = bind('subjective/insufficient-state', input, [cand({ candidateKey: 'i1', hazardFamily: 'walking_working_surfaces', conditionState: 'INSUFFICIENT_EVIDENCE', evidence: [ev(input, t)] })]);
  check('subjective/INSUFFICIENT_EVIDENCE on the same text is accepted', r.boundHazards.length === 1, JSON.stringify(codes(r)));
}

// ================================================================ 5. CLARIFICATION POLICY (Phase 5)

function clarificationPolicy(): void {
  // L3-2d moved this section and renamed its header from "WHEN TO ASK A CLARIFICATION" to
  // "ASKING A QUESTION -- AND WHEN NOT TO", because the section now carries a prohibition as well as
  // a permission. The GUARANTEE L3-2b was asserting -- that the prompt states when to ask -- is
  // unchanged, so the assertion is rebound to the guarantee rather than to the old sentence.
  check('clarification/prompt states when to ask',
    /ASK when the ladder lands on INSUFFICIENT_EVIDENCE/.test(L3_SYSTEM_PROMPT));
  check('clarification/prompt names the four decisions it may change',
    L3_SYSTEM_PROMPT.includes('whether a hazard exists at all')
    && L3_SYSTEM_PROMPT.includes('the condition state')
    && L3_SYSTEM_PROMPT.includes('which hazard family applies')
    && L3_SYSTEM_PROMPT.includes('high-consequence'));
  // L3-2d rewrote this sentence and STRENGTHENED it: the prompt now also forbids a question on any
  // already-decided state outright. Both halves are asserted so the guarantee cannot weaken.
  check('clarification/prompt warns against noise questions',
    /only refine an answer you can already give is noise/.test(L3_SYSTEM_PROMPT)
    && /DO NOT ASK when the ladder reached/.test(L3_SYSTEM_PROMPT));
  check('clarification/prompt states the impression rule', L3_SYSTEM_PROMPT.includes('IMPRESSIONS ARE NOT CONDITIONS'));
  check('clarification/prompt encodes no scenario answer key',
    !L3_SYSTEM_PROMPT.includes('rail on the platform') && !L3_SYSTEM_PROMPT.includes('B10'));

  // R5 -- the volatile analysis id must be gone from the prompt.
  const input = mk('The guard is missing.', ['machine_guarding']);
  const userPrompt = buildUserPrompt(input);
  check('clarification/analysis id is not in the prompt', !userPrompt.includes('l32b') && !userPrompt.includes('ANALYSIS ID'), userPrompt.slice(0, 80));

  // A supplied, well-formed clarification must survive the pipeline.
  const t = 'The rail on the platform did not look right to me.';
  const cinput = mk(t, ['walking_working_surfaces']);
  const r = bind('clarification/supplied', cinput, [cand({
    candidateKey: 'q1', hazardFamily: 'walking_working_surfaces', conditionState: 'INSUFFICIENT_EVIDENCE',
    evidence: [ev(cinput, t)],
    clarification: { unresolvedFact: 'what specifically was wrong with the rail',
      affectedDecision: 'hazard_identity', branches: ['the rail is loose or missing components', 'the rail is intact and merely looked unusual'],
      question: 'What did you observe about the rail itself -- is it loose, missing sections, or damaged?' },
  })]);
  check('clarification/a well-formed clarification survives', r.boundHazards.length === 1, JSON.stringify(codes(r)));
  check('clarification/no clarification-expected advisory when one was supplied',
    !r.clarificationExpected.includes('q1'), JSON.stringify(r.clarificationExpected));
}

// ================================================================ 6. SAFETY RECALL PRESERVED

function safetyRecallPreserved(): void {
  // RC-08 itself. NOTE, corrected during L3-2b: the L3-1 mechanical rule fires only when the word
  // IMMEDIATELY before the span is a negation, and here that word is "guardrail". So the mechanical
  // half does NOT catch this span -- the semantic binder does, by carrying `no` across the negated
  // list. This is precisely the division of labour the L3-1 entry contract described, and asserting
  // it the other way round (as first written) would have been asserting a guarantee that is not there.
  const RC08 = 'A worker was on the leading edge at 18 feet with no guardrail, safety net or personal fall arrest system in use.';
  const input = mk(RC08, ['falls']);
  const rRc08 = bind('recall/RC-08', input, [cand({
    candidateKey: 'rc08', hazardFamily: 'falls', conditionState: 'ACTIVE',
    evidence: [ev(input, 'safety net or personal fall arrest system in use')],
    conditionRationale: 'A fall arrest system is in use.',
  })]);
  check('recall/RC-08 negated-list span is caught by the semantic binder',
    fatalCodes(rRc08).includes('SEMANTIC_NEGATION_UNADDRESSED'), JSON.stringify(codes(rRc08)));
  check('recall/RC-08 candidate does not survive', rRc08.boundHazards.length === 0);

  // A negation further away, not adjacent: the binder must still catch it.
  const FAR = 'The inspector confirmed that at no time during the walkthrough was the west platform guardrail found missing.';
  const farInput = mk(FAR, ['falls']);
  const r = bind('recall/distant negation', farInput, [cand({
    candidateKey: 'f1', hazardFamily: 'falls', conditionState: 'ACTIVE',
    evidence: [ev(farInput, 'guardrail found missing')], conditionRationale: 'A guardrail is missing.',
  })]);
  check('recall/distant governing negation is still caught',
    fatalCodes(r).includes('SEMANTIC_NEGATION_UNADDRESSED'), JSON.stringify(codes(r)));

  // Explicit negative control must not produce an ACTIVE survivor.
  const SAFE = 'The fixed machine guard is interlocked, was function tested this morning, and no access to the point of operation is possible.';
  const safeInput = mk(SAFE, ['machine_guarding']);
  const r2 = bind('recall/negative control', safeInput, [cand({
    candidateKey: 'g1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
    evidence: [ev(safeInput, 'no access to the point of operation is possible')],
    conditionRationale: 'Access is possible.',
  })]);
  check('recall/negative control ACTIVE is refused', r2.boundHazards.length === 0, JSON.stringify(codes(r2)));

  // Advisory hint with unsupported evidence is still refused (L3-INV-12).
  const HINT = 'The parts washer area was tidy and every container was closed and labeled.';
  const hintInput = mk(HINT, ['hazard_communication', 'noise_exposure'], [{ signalId: 's1', kind: 'lexical_family_hint', value: 'noise_exposure' }]);
  const r3 = bind('recall/advisory echo', hintInput, [cand({
    candidateKey: 'e1', hazardFamily: 'noise_exposure', conditionState: 'ACTIVE',
    evidence: [ev(hintInput, 'The parts washer area was tidy')], conditionRationale: 'loud',
  })]);
  check('recall/advisory-only grounding is reported',
    codes(r3).includes('SEMANTIC_ADVISORY_ECHO'), JSON.stringify(codes(r3)));
  check('recall/advisory echo remains FATAL', severityOf('SEMANTIC_ADVISORY_ECHO') === 'FATAL');
  check('recall/advisory-echo candidate is removed', r3.boundHazards.length === 0, JSON.stringify(r3.rejected));
}

// ================================================================

function main(): void {
  negationScope();
  evidenceSelectivity();
  stateSupport();
  subjectiveAmbiguity();
  clarificationPolicy();
  safetyRecallPreserved();

  process.stdout.write(`\nL3-2b binder precision suite: ${passed} passed, ${failed} failed\n`);
  if (failures.length) {
    process.stdout.write('\nFAILURES:\n');
    for (const f of failures) process.stdout.write(`  - ${f}\n`);
  }
  process.exit(failed === 0 ? 0 : 1);
}

main();
