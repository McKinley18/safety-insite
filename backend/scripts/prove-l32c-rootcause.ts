/**
 * L3-2c PHASE 1 -- ROOT-CAUSE PROOF, RUN AGAINST THE UNPATCHED CODE.
 *
 * `ROOT_CAUSE_BEFORE_REMEDIATION`. This program asserts nothing about the repair. It executes the
 * REAL binder and the REAL negation-scope engine on the smallest fixtures that reproduce each
 * defect L3-2b root-caused, and prints the exact rejection or trigger condition, so that the repair
 * is measured against a demonstrated defect rather than a described one.
 *
 * R1 and R2 are proven independently and MUST NOT be credited to one change: R1 is exercised with a
 * sentence containing no negation-scope boundary at all, R2 with a sentence containing no subjective
 * impression at all.
 *
 * NO NETWORK, NO DATABASE. Run: npx ts-node scripts/prove-l32c-rootcause.ts
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

function mk(text: string, families: string[]): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32c-rootcause', observationText: text,
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
function run(input: ReasoningInput, c: HazardCandidate[]) {
  const v = validateReasoningProposal(prop(input, c), input);
  if (v.state !== 'VALID' || !v.validated) {
    return { validatorState: v.state, validatorIssues: v.issues.map(i => i.code), survived: [] as string[], activeKeys: [] as string[], states: [] as any[], demoted: [] as any[], fatal: [] as any[], issues: [] as any[] };
  }
  const s = bindEvidenceSemantically(v.validated, input);
  return {
    validatorState: v.state, validatorIssues: [] as string[],
    survived: s.boundHazards.map(h => h.candidateKey),
    // L3-2c: survival alone no longer answers the question -- a candidate refused as ACTIVE may be
    // DEMOTED and kept so a clarification can travel on it. The gate is read from the STATE.
    activeKeys: s.boundHazards.filter(h => h.conditionState === 'ACTIVE').map(h => h.candidateKey),
    states: s.boundHazards.map(h => ({ key: h.candidateKey, state: h.conditionState, hasClarification: !!h.clarification })),
    demoted: s.demoted,
    fatal: s.rejected,
    issues: s.issues.map(i => ({ code: i.code, severity: i.severity, key: i.candidateKey, detail: i.detail })),
  };
}

const FAM = ['walking_working_surfaces', 'falls', 'machine_guarding', 'loto_stored_energy', 'material_handling'];
const out: any = { phase: 'L3-2c', stage: 'ROOT_CAUSE_PROOF_BEFORE_ANY_PATCH', generatedAt: new Date().toISOString(), R1: {}, R2: {}, controls: {} };

// ================================================================ R1 -- impression-gate polarity
// H-AM-05 EXACTLY AS L3-2b MEASURED IT: the model quoted the WHOLE sentence, so the span carries its
// own negation and `checkNegationAddressed` steps aside -- the impression gate is then the only thing
// that can reject it, and it does. This is the documented failure path, reproduced.
{
  const text = 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.';
  const input = mk(text, FAM);
  const r = run(input, [cand({
    candidateKey: 'c1', hazardFamily: 'walking_working_surfaces', conditionState: 'ACTIVE',
    evidence: [ev(input, 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone')],
    conditionRationale: 'The hinge pin has failed and the gate is retained by one hinge.',
  })]);
  out.R1.H_AM_05_whole_sentence_span = {
    text, expectedByHoldout: 'ACTIVE survives (high-consequence)', observed: r,
    defectDemonstrated: r.activeKeys.length === 0,
    isolatedFromR2: r.fatal.every((f: any) => !f.codes.includes('SEMANTIC_NEGATION_UNADDRESSED')),
  };
}
// R1 WITH NO NEGATION ANYWHERE. `negationScopes` returns nothing here, so the R2 change cannot
// possibly repair this fixture -- it isolates the impression gate completely.
{
  const text = 'The mezzanine gate seemed wrong to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.';
  const input = mk(text, FAM);
  const r = run(input, [cand({
    candidateKey: 'c1', hazardFamily: 'walking_working_surfaces', conditionState: 'ACTIVE',
    evidence: [ev(input, 'The mezzanine gate seemed wrong to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone')],
    conditionRationale: 'The hinge pin has failed and the gate is retained by one hinge.',
  })]);
  out.R1.negation_free_isolate = {
    text, negationScopesInText: negationScopes(text), observed: r,
    defectDemonstrated: r.activeKeys.length === 0,
    isolatedFromR2: negationScopes(text).length === 0,
  };
}
// The SAME sentence with a narrow factual span, showing the SECOND, independent path by which
// H-AM-05 can die: bare `and` lets `not` scope over the factual clause. Recorded because L3-2b's
// NEXT_ACTION.md attributed H-AM-05 to the impression gate alone.
{
  const text = 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.';
  const input = mk(text, FAM);
  const r = run(input, [cand({
    candidateKey: 'c1', hazardFamily: 'walking_working_surfaces', conditionState: 'ACTIVE',
    evidence: [ev(input, 'the lower hinge pin is sheared off with the gate hanging on the top hinge alone')],
    conditionRationale: 'The hinge pin has failed and the gate is retained by one hinge.',
  })]);
  out.R1.H_AM_05_narrow_span_second_path = {
    text, observed: r,
    negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })),
    note: 'fails through SEMANTIC_NEGATION_UNADDRESSED -- the R2 defect, not the R1 defect',
  };
}
// The PRECISION pole that must keep failing: the hedge governs the only predication there is.
{
  const text = 'One of the sling legs on the spreader bar may be cut.';
  const input = mk(text, FAM.concat(['material_handling']));
  const r = run(input, [cand({
    candidateKey: 'c1', hazardFamily: 'material_handling', conditionState: 'ACTIVE',
    evidence: [ev(input, 'One of the sling legs on the spreader bar may be cut')],
  })]);
  out.R1.H_AM_02_precision_pole = { text, observed: r, notActive: r.activeKeys.length === 0 };
}
// B10 -- pure impression, must stay non-ACTIVE.
{
  const text = 'The rail on the platform did not look right to me.';
  const input = mk(text, FAM);
  const r = run(input, [cand({
    candidateKey: 'c1', hazardFamily: 'walking_working_surfaces', conditionState: 'ACTIVE',
    evidence: [ev(input, 'The rail on the platform did not look right to me')],
  })]);
  out.controls.B10 = { text, observed: r, notActive: r.activeKeys.length === 0 };
}
// H-AM-01 -- impression with a perception predicate, must stay non-ACTIVE.
{
  const text = 'The overhead door track struck me as odd when I walked underneath it.';
  const input = mk(text, FAM);
  const r = run(input, [cand({
    candidateKey: 'c1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
    evidence: [ev(input, 'The overhead door track struck me as odd when I walked underneath it')],
  })]);
  out.controls.H_AM_01 = { text, observed: r, notActive: r.activeKeys.length === 0 };
}

// ================================================================ R2 -- bare-conjunction predicate scope
// H-FLD-141's shape. NOTE: no subjective impression language anywhere, so nothing here can be
// repaired by the R1 change.
{
  const text = 'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.';
  const input = mk(text, FAM);
  const r = run(input, [
    cand({ candidateKey: 'loto', hazardFamily: 'loto_stored_energy', conditionState: 'ACTIVE',
      evidence: [ev(input, 'no LOTO is applied')] }),
    cand({ candidateKey: 'guard', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      evidence: [ev(input, 'the guard is missing')], independentHazardRationale: 'guarding is separate from energy isolation' }),
  ]);
  out.R2.H_FLD_141 = {
    text,
    negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })),
    governingNegationOverGuardSpan: (() => {
      const t = input.authoritativeSources[0].text;
      const at = t.indexOf('the guard is missing');
      const g = governingNegation(t, at, at + 'the guard is missing'.length);
      return g ? { ...g, governs: t.slice(g.from, g.to) } : null;
    })(),
    observed: r,
    defectDemonstrated: !r.activeKeys.includes('guard'),
  };
}
// RC-08's negated list -- the trap. `and` here continues the list; scope MUST cross it.
{
  const text = 'Two carpenters were framing the parapet at twenty six feet with no guardrail and no safety monitor assigned.';
  out.R2.RC08_negated_list_and = {
    text, negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })),
  };
}
{
  const text = 'working with no guardrail, safety net or personal fall arrest system in use';
  out.R2.RC08_negated_list_commas = {
    text, negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })),
  };
}
// A bare-conjunction continuation with NO finite verb: scope must still cross it.
{
  const text = 'The opening had no guardrail and no toeboard.';
  out.R2.bare_and_no_predicate = {
    text, negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })),
  };
}
// B08's bare `while` and C11's comma behaviour -- must be unchanged by R2.
{
  const text = 'An employee on a rolling scaffold at nine feet was using an angle grinder without a face shield while a propane forklift idled directly underneath refueling from a portable cylinder.';
  out.controls.B08 = { text, negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })) };
}
{
  const text = 'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing';
  out.controls.C11 = { text, negationScopes: negationScopes(text).map(s => ({ ...s, governs: text.slice(s.from, s.to) })) };
}

const path = process.env.OUT || '../verification/hazlenz-l3-2c-gate-polarity-2026-08-22/rootcause/proof-pre-patch.json';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({
  R1_H_AM_05_whole_span_defect_reproduced: out.R1.H_AM_05_whole_sentence_span.defectDemonstrated,
  R1_H_AM_05_whole_span_fatal: out.R1.H_AM_05_whole_sentence_span.observed.fatal,
  R1_H_AM_05_whole_span_isolated_from_R2: out.R1.H_AM_05_whole_sentence_span.isolatedFromR2,
  R1_negation_free_defect_reproduced: out.R1.negation_free_isolate.defectDemonstrated,
  R1_negation_free_fatal: out.R1.negation_free_isolate.observed.fatal,
  R1_negation_free_isolated_from_R2: out.R1.negation_free_isolate.isolatedFromR2,
  R1_H_AM_05_narrow_span_fatal: out.R1.H_AM_05_narrow_span_second_path.observed.fatal,
  R1_H_AM_02_not_active: out.R1.H_AM_02_precision_pole.notActive,
  R1_H_AM_02_states: out.R1.H_AM_02_precision_pole.observed.states,
  B10_not_active: out.controls.B10.notActive,
  B10_states: out.controls.B10.observed.states,
  H_AM_01_not_active: out.controls.H_AM_01.notActive,
  H_AM_01_states: out.controls.H_AM_01.observed.states,
  R2_H_FLD_141_defect_reproduced: out.R2.H_FLD_141.defectDemonstrated,
  R2_H_FLD_141_states: out.R2.H_FLD_141.observed.states,
  R2_H_FLD_141_fatal: out.R2.H_FLD_141.observed.fatal,
  R2_guard_span_governed_by: out.R2.H_FLD_141.governingNegationOverGuardSpan,
  RC08_and_scope: out.R2.RC08_negated_list_and.negationScopes.map((s: any) => s.governs),
  RC08_comma_scope: out.R2.RC08_negated_list_commas.negationScopes.map((s: any) => s.governs),
  bare_and_no_predicate_scope: out.R2.bare_and_no_predicate.negationScopes.map((s: any) => s.governs),
  B08_scope: out.controls.B08.negationScopes.map((s: any) => s.governs),
  C11_scope: out.controls.C11.negationScopes.map((s: any) => s.governs),
}, null, 2));
console.log(`\nwrote ${path}`);
