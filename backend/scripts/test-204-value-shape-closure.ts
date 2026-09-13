/**
 * §204 -- VALUE-SHAPE CLOSURE SUITE (RT203-1/2/3, D05/D06/D07). DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Every required matrix case is its own counted assertion. For each RT finding the suite proves
 * three separately asserted facts -- GUARD_EXISTS, GUARD_CALLED, GUARD_REJECTS_ADVERSARIAL_INPUT --
 * plus the differential that the UNTOUCHED §203 boundary still shows the historical behavior, so
 * the closure's effect is measured rather than asserted.
 */

import {
  boundedGovernanceScan, boundedScanEffect, SCAN_MAX_DEPTH, SCAN_MAX_NODES,
} from './lib/expert-204-bounded-scan';
import {
  applyAdmittedDeclarations204, checkBindingDeclarations204, closureBindingEffect,
  freeTextViolations, FREE_TEXT_MAX_BYTES,
  type ClosureBindingCheckResult,
} from './lib/expert-204-closure-binding';
import {
  closureProjectionEffect, projectDeclaredOwedFacts204,
} from './lib/expert-204-closure-projection';
import {
  CLOSURE_ANCESTOR_CONTRACT_VERSION, CLOSURE_CONTRACT_VERSION, closureIdentityEffect,
} from './lib/expert-204-closure-identity';
import {
  applyAdmittedDeclarations203, checkBindingDeclarations203,
  type SuccessorClarificationDeclaration,
} from './lib/expert-203-successor-binding';
import { projectDeclaredOwedFacts203 } from './lib/expert-203-successor-projection';
import { DEFAULT_GOVERNED_TEXT_EXPOSURE } from './lib/expert-202-governed-binding-contract';
import {
  createOwedFactLedger, owedFact, type OwedFactLedger,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';

// ================================================================ harness

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) {
    passed += 1;
    console.log(`  PASS ${id}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${id}${detail ? ` -- ${detail}` : ''}`);
  }
}

// ================================================================ fixtures

const OBS = 'The panel door interlock is defeated with a zip tie. '
  + 'The forklift charger cable insulation is abraded near the plug.';
const SPAN_A = 'panel door interlock is defeated with a zip tie';
const SPAN_B = 'forklift charger cable insulation is abraded near the plug';
const KEY_A = 'VN.REQUIRED_CONTROL.OBS-1.4-51.1';

function unresolvedFact(factKey: string, evidenceSpan: string) {
  return owedFact({
    factKey,
    affectedDecision: 'REQUIRED_CONTROL',
    source: 'VERIFIER_NOMINATION',
    evidenceSpan,
    whyUnresolved: 'the observation does not establish whether a control is functioning',
    branchA: 'the control is functioning',
    branchB: 'the control is defeated',
    decisionDivergence: { ifA: 'no additional control is required', ifB: 'an additional control is required' },
    priority: 'OTHER',
  });
}

const emptyLedger: OwedFactLedger = createOwedFactLedger('DEVELOPMENT', []);
const oneFactLedger: OwedFactLedger =
  createOwedFactLedger('DEVELOPMENT', [unresolvedFact(KEY_A, SPAN_A)]);

function nomination(declarationId = 'D-NOM-1'): SuccessorClarificationDeclaration {
  return {
    declarationId,
    bindingMode: 'NOMINATED_NEW',
    coversFactKey: null,
    nomination: {
      factKey: 'VN.HAZARD_EXISTENCE.OBS-1.57-115.1',
      affectedDecision: 'HAZARD_EXISTENCE',
      evidenceSpan: SPAN_B,
      whyUnresolved: 'the span raises a distinct unresolved protective-function question',
      branchA: 'the second condition is controlled',
      branchB: 'the second condition is uncontrolled',
      decisionIfA: 'record the existing control as adequate',
      decisionIfB: 'require an additional control for the second condition',
    },
    question: 'Is the second condition controlled?',
    affectedDecision: 'HAZARD_EXISTENCE',
  };
}

function bound(declarationId = 'D-BND-1'): SuccessorClarificationDeclaration {
  return {
    declarationId,
    bindingMode: 'BOUND_TO_OWED_FACT',
    coversFactKey: KEY_A,
    nomination: null,
    question: 'Is the named control functioning?',
    affectedDecision: 'REQUIRED_CONTROL',
  };
}

/** A chain of n nested objects under one legal-shaped root; deepest object sits at depth n. */
function nest(depth: number, leaf: Record<string, unknown> = {}): Record<string, unknown> {
  let v: Record<string, unknown> = leaf;
  for (let i = 0; i < depth; i += 1) v = { a: v };
  return v;
}

const forge = <T,>(v: unknown): T => v as T;

console.log('=== §204 value-shape closure suite ===');

// ================================================================ RT203-1 (D05) -- bounded scan

// GUARD_EXISTS
ok('RT1.exists', typeof boundedGovernanceScan === 'function'
  && SCAN_MAX_DEPTH === 32 && SCAN_MAX_NODES === 10_000);

// RT1-A scan completes below limit -- clean tree, and a forbidden key at depth 5 is found.
{
  const clean = boundedGovernanceScan({ a: { b: { c: 'x' } } });
  ok('RT1-A.clean', clean.outcome === 'SCAN_COMPLETE' && clean.findings.length === 0);
  const found = boundedGovernanceScan(nest(4, { citation: '29 CFR 1910.147' }));
  ok('RT1-A.found', found.outcome === 'SCAN_COMPLETE' && found.findings.length === 1
    && found.findings[0].key === 'citation');
}

// RT1-B exactly at the permitted boundary: deepest object at SCAN_MAX_DEPTH completes.
{
  const atLimit = boundedGovernanceScan(nest(SCAN_MAX_DEPTH));
  ok('RT1-B.at-limit', atLimit.outcome === 'SCAN_COMPLETE'
    && atLimit.maxDepthSeen === SCAN_MAX_DEPTH);
}

// RT1-C over limit fails closed -- depth, node count and cyclic input each named.
{
  const over = boundedGovernanceScan(nest(SCAN_MAX_DEPTH + 8));
  ok('RT1-C.depth', over.outcome === 'SCAN_LIMIT_EXCEEDED' && over.limit === 'DEPTH_LIMIT');
  const wide: Record<string, unknown> = {};
  for (let i = 0; i <= SCAN_MAX_NODES; i += 1) wide[`k${i}`] = { v: i };
  const nodes = boundedGovernanceScan(wide);
  ok('RT1-C.nodes', nodes.outcome === 'SCAN_LIMIT_EXCEEDED' && nodes.limit === 'NODE_LIMIT');
  const cyc: Record<string, unknown> = { x: {} };
  (cyc.x as Record<string, unknown>).self = cyc;
  const cycle = boundedGovernanceScan(cyc);
  ok('RT1-C.cycle', cycle.outcome === 'SCAN_LIMIT_EXCEEDED' && cycle.limit === 'CYCLE_DETECTED',
    'JSON.parse output cannot be cyclic; the bound must hold for programmatic callers anyway');
}

// GUARD_CALLED at the §204 binding boundary: an over-limit question fails closed.
{
  const deep = forge<SuccessorClarificationDeclaration>(
    { ...nomination('D-DEEP'), question: nest(SCAN_MAX_DEPTH + 8) },
  );
  const r = checkBindingDeclarations204([deep], emptyLedger, OBS);
  ok('RT1.called-binding', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'SCAN_LIMIT_EXCEEDED_FAIL_CLOSED') && r.admitted.length === 0);
  // Differential: the UNTOUCHED §203 boundary admits the same declaration (RT203-1/2 class).
  const d203 = checkBindingDeclarations203([deep], emptyLedger, OBS);
  ok('RT1.differential-203-admits', d203.admitted.length === 1,
    'the historical §203 behavior must remain measurable and unchanged');
}

// RT1-D a deeply nested authority-bearing field cannot evade the scan (depth 10 > the old 8).
{
  const buried = forge<SuccessorClarificationDeclaration>(
    { ...nomination('D-BURIED'), question: nest(9, { citation: '29 CFR 1910.147', approved: true }) },
  );
  const r = checkBindingDeclarations204([buried], emptyLedger, OBS);
  ok('RT1-D.binding', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'NESTED_FORBIDDEN_GOVERNANCE_FIELD') && r.admitted.length === 0);
  ok('RT1-D.203-admits', checkBindingDeclarations203([buried], emptyLedger, OBS)
    .admitted.length === 1, 'RT203-1 evidence reproduced against the untouched §203 boundary');

  // Projection boundary: same burial under a legal first-pass key, past the depth-8 walk.
  const fpDecl = {
    declarationId: 'FP-BURIED',
    governedEvidenceSourceIds: [nest(9, { citation: '29 CFR 1910.147' })],
  };
  const p204 = projectDeclaredOwedFacts204({
    declarations: [fpDecl], sources: [], suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  ok('RT1-D.projection', p204.closureRefusals.length === 1
    && p204.closureRefusals[0].closureViolations
      .some(v => v.code === 'NESTED_FORBIDDEN_GOVERNANCE_FIELD'));
  const p203 = projectDeclaredOwedFacts203({
    declarations: [fpDecl], sources: [], suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  ok('RT1-D.projection-203-missed', p203.boundaryRefusals
    .every(b => !b.codes.includes('NESTED_FORBIDDEN_GOVERNANCE_FIELD')),
  'the §203 depth-8 walk must still miss it -- historical behavior unchanged');
}

// RT1-E the limit-exceeded state cannot be misreported as clean.
{
  const exceeded = boundedGovernanceScan(nest(SCAN_MAX_DEPTH + 8));
  ok('RT1-E.no-findings-field', exceeded.outcome === 'SCAN_LIMIT_EXCEEDED'
    && !('findings' in exceeded),
  'the exceeded arm carries no findings field, so "zero findings" is not expressible on it');

  const deep = forge<SuccessorClarificationDeclaration>(
    { ...nomination('D-FORGE'), question: nest(SCAN_MAX_DEPTH + 8) },
  );
  const r = checkBindingDeclarations204([deep], emptyLedger, OBS);
  const forged: ClosureBindingCheckResult = { ...r, admitted: [deep] };
  let threw = false;
  try {
    applyAdmittedDeclarations204(emptyLedger, forged);
  } catch (e) {
    threw = String(e).includes('CLOSURE_REFUSED_DECLARATION_IN_APPLY');
  }
  ok('RT1-E.apply-fails-closed', threw,
    'a caller treating SCAN_LIMIT_EXCEEDED as success is refused at apply, loudly');
}

// ================================================================ RT203-2 (D06) -- free text

ok('RT2.exists', typeof freeTextViolations === 'function' && FREE_TEXT_MAX_BYTES === 4096);

// RT2-A valid ordinary free text accepted.
{
  const r = checkBindingDeclarations204([bound('D-OK-B'), nomination('D-OK-N')], oneFactLedger, OBS);
  ok('RT2-A.accepted', r.admitted.length === 2 && r.refused.length === 0);
  ok('RT2-A.whitespace-permitted',
    freeTextViolations('x', 'line one\n\tline two\r\n', true).length === 0);
}

// RT2-B oversized content rejected.
{
  const big = { ...nomination('D-BIG'), question: 'q'.repeat(FREE_TEXT_MAX_BYTES + 1) };
  const r = checkBindingDeclarations204([big], emptyLedger, OBS);
  ok('RT2-B.oversized', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'FREE_TEXT_OVER_MAX_BYTES') && r.admitted.length === 0);
}

// RT2-C raw NUL / control input rejected according to the explicit policy.
{
  const nul = { ...nomination('D-NUL'), question: `is it safe?${String.fromCharCode(0)}` };
  const r = checkBindingDeclarations204([nul], emptyLedger, OBS);
  ok('RT2-C.nul', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'FREE_TEXT_FORBIDDEN_CONTROL_BYTE') && r.admitted.length === 0);
  const bel = { ...nomination('D-BEL'), question: `ping${String.fromCharCode(7)}` };
  ok('RT2-C.other-control', checkBindingDeclarations204([bel], emptyLedger, OBS)
    .perDeclaration[0].closureViolations
    .some(v => v.code === 'FREE_TEXT_FORBIDDEN_CONTROL_BYTE'));
}

// RT2-D citation-shaped free text receives no governed authority.
{
  const cited = {
    ...nomination('D-CITE'),
    question: 'Per 29 CFR 1910.147(c)(4), is the lockout program documented?',
  };
  const r = checkBindingDeclarations204([cited], oneFactLedger, OBS);
  ok('RT2-D.admitted-as-text', r.admitted.length === 1,
    'structural closure only: the citation-shaped content is not judged, matched, or blocked');
  const surface = JSON.stringify({ per: r.perDeclaration, admittedCount: r.admitted.length });
  ok('RT2-D.no-provenance-emitted',
    !surface.includes('governedEvidence') && !surface.includes('knowledgeReleaseId')
    && !surface.includes('citationAuthority') && !surface.includes('governedProvenance'),
    'the §204 result surface carries no governed-provenance field derived from free text');
  const fx = closureBindingEffect();
  ok('RT2-D.effect', fx.emitsGovernedProvenance === false && fx.containsCitationDetector === false
    && fx.freeTextMayAcquireAuthority === false);
}

// RT2-E structured sourceId remains the only governed-binding authority; the admitted
// declaration passes through byte-identical (nothing added, nothing repaired).
{
  const n = nomination('D-PASS');
  const r = checkBindingDeclarations204([n], emptyLedger, OBS);
  ok('RT2-E.byte-identical', r.admitted.length === 1
    && r.admitted[0] === n && JSON.stringify(r.admitted[0]) === JSON.stringify(n),
  'governed provenance can only arise in the SEPARATE §202 governed stage from supplied sourceIds');
}

// RT2-F the governed stage's default exposure remains REDACTED.
ok('RT2-F.redacted-default', DEFAULT_GOVERNED_TEXT_EXPOSURE === 'REDACTED');

// ================================================================ RT203-3 (D07) -- affectedDecision

ok('RT3.exists', (CLOSURE_CONTRACT_VERSION as string) === 'hazlenz.expert.204-successor-closure.v1'
  && (CLOSURE_ANCESTOR_CONTRACT_VERSION as string) === 'hazlenz.expert.203-successor-boundary.v1');

// RT3-A valid affectedDecision accepted and preserved exactly.
{
  const b = bound('D-AD-OK');
  const r = checkBindingDeclarations204([b], oneFactLedger, OBS);
  ok('RT3-A.accepted', r.admitted.length === 1
    && r.admitted[0].affectedDecision === 'REQUIRED_CONTROL' && r.admitted[0] === b);
}

// RT3-B unknown enum rejected -- the RT203-3 carrier, on the BOUND path.
{
  const bogus = forge<SuccessorClarificationDeclaration>(
    { ...bound('D-AD-BOGUS'), affectedDecision: 'TOTALLY_BOGUS_DECISION' },
  );
  const r = checkBindingDeclarations204([bogus], oneFactLedger, OBS);
  ok('RT3-B.rejected', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'AFFECTED_DECISION_NOT_A_MEMBER') && r.admitted.length === 0);
  ok('RT3-B.203-admits', checkBindingDeclarations203([bogus], oneFactLedger, OBS)
    .admitted.length === 1, 'RT203-3 evidence reproduced against the untouched §203 boundary');
}

// RT3-C missing required value rejected.
{
  const noAd = { ...bound('D-AD-MISSING') } as Record<string, unknown>;
  delete noAd.affectedDecision;
  const r = checkBindingDeclarations204(
    [forge<SuccessorClarificationDeclaration>(noAd)], oneFactLedger, OBS,
  );
  ok('RT3-C.missing', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'AFFECTED_DECISION_NOT_A_MEMBER') && r.admitted.length === 0);
}

// RT3-D a caller-cast invalid value (past TypeScript) rejected.
{
  const cast = forge<SuccessorClarificationDeclaration>(
    { ...bound('D-AD-CAST'), affectedDecision: { evil: true } },
  );
  const r = checkBindingDeclarations204([cast], oneFactLedger, OBS);
  ok('RT3-D.cast', r.perDeclaration[0].closureViolations
    .some(v => v.code === 'AFFECTED_DECISION_NOT_A_MEMBER') && r.admitted.length === 0);
}

// RT3-E no coercion, no default substitution, no repair to a nearby member.
{
  const near = forge<SuccessorClarificationDeclaration>(
    { ...bound('D-AD-NEAR'), affectedDecision: 'REQUIRED_CONTROLS' },
  );
  const r = checkBindingDeclarations204([near], oneFactLedger, OBS);
  const refusedRaw = JSON.stringify(r.refused[0]);
  ok('RT3-E.no-repair', r.admitted.length === 0
    && refusedRaw.includes('"REQUIRED_CONTROLS"')
    && r.refused[0].affectedDecision === ('REQUIRED_CONTROLS' as never),
  'the near-member value is refused and survives UNMODIFIED on the refused record');
}

// ================================================================ differentials + effects

// Safe input: §204 and §203 agree exactly, and apply produces the identical ledger.
{
  const decls = [bound('D-SAFE-B'), nomination('D-SAFE-N')];
  const r204 = checkBindingDeclarations204(decls, oneFactLedger, OBS);
  const r203 = checkBindingDeclarations203(decls, oneFactLedger, OBS);
  ok('DIFF.admission', r204.admitted.length === r203.admitted.length
    && r204.admitted.every((d, i) => d === r203.admitted[i]));
  const a204 = applyAdmittedDeclarations204(oneFactLedger, r204);
  const a203 = applyAdmittedDeclarations203(oneFactLedger, r203);
  ok('DIFF.apply', JSON.stringify(a204.ledger) === JSON.stringify(a203.ledger),
    'byte-identical ledgers on the safe path: §204 adds refusals, never behavior for clean input');
}

// Effect claims hold as literals.
{
  const s = boundedScanEffect();
  const b = closureBindingEffect();
  const p = closureProjectionEffect();
  const i = closureIdentityEffect();
  ok('EFFECT.literals', s.recursionUnbounded === false && s.limitStateCarriesFindings === false
    && b.scanLimitMayReadAsClean === false && b.affectedDecisionMayBeRepaired === false
    && p.scanLimitMayReadAsClean === false && i.mutatesAnySection203Module === false
    && s.providerCalls === 0 && b.providerCalls === 0 && p.providerCalls === 0
    && i.providerCalls === 0 && b.databaseOperations === 0);
}

console.log(`\n§204 value-shape closure: ${passed} passed, ${failed} failed`);
console.log('PROVIDER CALLS = 0. DATABASE OPERATIONS = 0. No §203 module modified; the governed');
console.log('stage default remains REDACTED; free text remains NON-AUTHORITATIVE by structure.');
if (failed > 0) process.exit(1);
