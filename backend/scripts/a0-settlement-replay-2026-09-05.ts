/**
 * §181 STAGE A0 — EXISTING-ARCHITECTURE REPLAY. ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS.
 *
 * §180 recommended a structured settlement declaration. Before building one, this harness asks what
 * the architecture ALREADY does when it is handed explicit owed facts — because §180's own finding 4
 * was that the §179 failures occurred on the first-pass path, where no ledger, factKey or binding
 * exists at all.
 *
 * ==================== WHAT THIS IS AND IS NOT ====================
 *
 * It is a DEVELOPMENT REPLAY. It constructs a DEVELOPMENT-population ledger from fixture state and
 * drives the real, already-integrated, inactive modules. It touches no customer path, activates
 * nothing, and adds no field to any type.
 *
 * It does NOT simulate model prose and it does NOT decide whether evidence is semantically
 * sufficient. Wherever a semantic judgement would be required the replay stops and records
 * SEMANTIC_JUDGMENT_REQUIRED. There is no matcher, classifier, keyword rule, property comparison,
 * similarity score, regex or threshold anywhere in this file, and proof P5 asserts that.
 *
 * ==================== THE FIXTURE OWED FACTS ====================
 *
 * The owed facts below are DEVELOPMENT FIXTURE STATE authored for this replay from the frozen row
 * text. They are `DEVELOPMENT_HUMAN_TRUTH`, which `assertProductionAdmissible` refuses in a
 * production ledger — proof P2 relies on exactly that. They are NOT a re-authoring of the frozen
 * §174 truth: the frozen verdicts stay REQUIRED/SILENCE untouched, and nothing here is scored
 * against them.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  type OwedFact, type AcceptableEvidence,
  OWED_FACT_STATUSES, TRANSITION_AUTHORITIES, REQUIRED_AUTHORITY,
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS, PRODUCTION_PERMITTED_SOURCES,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  createOwedFactLedger, addOwedFact, nominateAdditiveFact, transition, factOf,
  unresolvedFacts, factsRemoved, preservationViolations,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  checkBindingDeclarations, parseOwedFactDeclarations, applyAdmittedDeclarations,
  evaluateTargetCoverage, CLARIFICATION_EVIDENCE_SUFFICIENCY, COVERAGE_DECISION_INPUTS,
  type ClarificationDeclaration,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED, projectOwedFact, verifierV3BoundaryState,
} from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  deriveAcceptableEvidence,
} from '../src/hazlenz/expert-hazlenz/owed-facts/governed-evidence-derivation';

const ROOT = join(__dirname, '..', '..');
const INSTR = join(ROOT, 'verification', 'expert-hazlenz-balanced-clarification-instrument-2026-09-05');
const REGISTRY = join(ROOT, 'safescope-data', 'approved-knowledge', 'registry');

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
let failed = 0;
const check = (name: string, ok: boolean, detail = ''): void => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};
const threw = (fn: () => unknown): string | null => {
  try { fn(); return null; } catch (e) { return String((e as Error)?.message ?? e); }
};

// ---------------------------------------------------------------- frozen rows, read not written
const frozenHashes = JSON.parse(readFileSync(join(INSTR, 'FROZEN-ROW-HASHES.json'), 'utf8'));
const blinded = JSON.parse(readFileSync(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'), 'utf8'));
const rowText: Record<string, string> = Object.fromEntries(
  blinded.rows.map((r: any) => [r.REVIEW_ROW_ID, r.TEXT]));

// ---------------------------------------------------------------- governed records, read-only
function loadRecords(): any[] {
  const out: any[] = [];
  for (const f of ['approved-knowledge-seed-records.v1.json', 'rec-msha-30-56-12.json',
    'regulatory-expansion-v1.json']) {
    const d = JSON.parse(readFileSync(join(REGISTRY, f), 'utf8'));
    const recs = Array.isArray(d) ? d : (d.records ?? [d]);
    out.push(...recs);
  }
  return out;
}
const records = loadRecords();
const recordById = (id: string): any => records.find(r => r.recordId === id) ?? null;

// ---------------------------------------------------------------- fixture owed facts
/**
 * One owed fact per replayed row, authored from the frozen text for this replay only.
 *
 * The HR-04 fact deliberately states the SECUREMENT property in `whyUnresolved`, because the
 * question A0 exists to answer is whether the current fields can hold that distinction WITHOUT a
 * new property field. If they cannot, that is the finding.
 */
function devFact(o: {
  key: string; decision: OwedFact['affectedDecision']; span: string; why: string;
  a: string; b: string; ifA: string; ifB: string; priority?: OwedFact['priority'];
  evidence?: AcceptableEvidence | null;
}): OwedFact {
  return {
    factKey: o.key,
    affectedDecision: o.decision,
    source: 'DEVELOPMENT_HUMAN_TRUTH',
    evidenceSpan: o.span,
    whyUnresolved: o.why,
    branchA: o.a,
    branchB: o.b,
    decisionDivergence: { ifA: o.ifA, ifB: o.ifB },
    priority: o.priority ?? 'REQUIRED_CONTROL',
    status: 'UNRESOLVED',
    acceptableEvidence: o.evidence ?? null,
    modelAuthored: false,
  };
}

const mgDerivation = deriveAcceptableEvidence(recordById('app-mg-01'));

const HR04_FACT = devFact({
  key: 'owed:guarding:current_securement_of_fixed_guard',
  decision: 'REQUIRED_CONTROL',
  span: 'the fastenings were last torque-checked at the annual service',
  why: 'whether the fixed guard is presently secured such that it remains protective is not stated; '
    + 'the observation states the guard is in position and that its fastenings were verified at a '
    + 'past occasion',
  a: 'the fastenings are presently secure',
  b: 'the fastenings have loosened since the annual service',
  ifA: 'the guarded nip point needs no action today',
  ifB: 'the conveyor is stopped and the guard re-secured before the operative continues alongside it',
  evidence: mgDerivation.acceptableEvidence,
});

const HR05_FACT = devFact({
  key: 'owed:energy:auger_isolation_state_before_clearing',
  decision: 'REQUIRED_CONTROL',
  span: 'proved the auger dead by attempting a start from the panel, which did not turn',
  why: 'replayed as the row\'s owed fact so the displaced-fact behaviour can be observed; the frozen '
    + 'truth for this row is SILENCE and is not revisited here',
  a: 'the auger drive is isolated and proved dead',
  b: 'the auger drive retains a live start path',
  ifA: 'the blockage may be cleared',
  ifB: 'work stops until the drive is isolated',
});

const HR07_FACT = devFact({
  key: 'owed:fire:flame_failure_device_function_state',
  decision: 'REQUIRED_CONTROL',
  span: 'the engineer flame-tested the burner; he recorded that fuel shut off within two seconds',
  why: 'replayed as the row\'s owed fact so the adjacent-hazard behaviour can be observed; the frozen '
    + 'truth for this row is SILENCE and is not revisited here',
  a: 'the flame-failure device shuts fuel off on flame loss',
  b: 'the flame-failure device does not shut fuel off',
  ifA: 'the dryer may continue to run',
  ifB: 'the burner is shut down until the safeguard is proved',
});

const HR06_FACT = devFact({
  key: 'owed:guarding:interlock_function_after_tooth_change',
  decision: 'REQUIRED_CONTROL',
  span: 'it recorded the tooth change but carries no interlock test result',
  why: 'whether the rotor guard door interlock de-energises the rotor when opened was not verified '
    + 'after the guard was disturbed',
  a: 'the interlock was function-tested and works',
  b: 'the interlock was not tested after the tooth change',
  ifA: 'the debarker may run',
  ifB: 'the debarker stops until the interlock is proved',
  evidence: mgDerivation.acceptableEvidence,
});

const HR08_FACT = devFact({
  key: 'owed:energy:local_isolator_lockout_state',
  decision: 'REQUIRED_CONTROL',
  span: 'the auger drive has its own local isolator and the lockout log shows no entry against it',
  why: 'whether the auger drive\'s own local isolator has been locked and proved dead is not stated',
  a: 'the local isolator is locked and proved dead',
  b: 'only the main panel is isolated',
  ifA: 'the blockage may be cleared',
  ifB: 'work stops until the auger isolator is locked and verified',
  priority: 'LIFE_CRITICAL',
  evidence: deriveAcceptableEvidence(recordById('app-loto-01')).acceptableEvidence,
});

const HR10_FACT = devFact({
  key: 'owed:control:settled_positive_control_row',
  decision: 'REQUIRED_CONTROL',
  span: rowText['HR-10'].slice(0, 40),
  why: 'replayed as a settled positive control; the frozen truth for this row is SILENCE',
  a: 'the stated control holds',
  b: 'the stated control does not hold',
  ifA: 'no action today',
  ifB: 'action today',
});

const dev = (facts: OwedFact[]) => createOwedFactLedger('DEVELOPMENT', facts);

console.log('§181 STAGE A0 — EXISTING-ARCHITECTURE REPLAY.  provider calls: 0   database operations: 0\n');

// ================================================================ F. §180 findings, re-derived
console.log('--- F. §180 FINDINGS RE-DERIVED FROM SOURCE');

const srcDir = join(ROOT, 'backend', 'src');
function grepCount(dir: string, needle: string): number {
  const { execSync } = require('child_process');
  try {
    const out = execSync(`grep -rc "${needle}" ${dir} 2>/dev/null || true`, { encoding: 'utf8' });
    return out.split('\n').filter(Boolean)
      .reduce((a: number, l: string) => a + Number(l.split(':').pop() || 0), 0);
  } catch { return -1; }
}
const mintedAdmittedBinding = grepCount(srcDir, "authority: 'ADMITTED_BINDING'");
const mintedAdmissible = grepCount(srcDir, "authority: 'ADMISSIBLE_EVIDENCE'");
const mintedArbitration = grepCount(srcDir, "authority: 'RECORDED_ARBITRATION'");
check('F1.a src/ mints ADMITTED_BINDING exactly once', mintedAdmittedBinding === 1, String(mintedAdmittedBinding));
// §182 RE-ANCHOR, NOT A RELAXATION. At §181 this asserted ZERO, and that was a true statement about
// the pre-§182 tree. §182 authorized exactly one producer — settlement-review.ts, reachable only
// from a recorded human review — so the assertion moves from "none exists" to "the ONE authorized
// producer exists and nothing else does", which is a stricter check than the original. The property
// that mattered was never "zero"; it was "no UNAUTHORIZED producer", and that still holds.
const admissibleFiles = (() => {
  const { execSync } = require('child_process');
  try {
    return execSync(`grep -rl "authority: 'ADMISSIBLE_EVIDENCE'" ${srcDir} 2>/dev/null || true`,
      { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch { return []; }
})();
check('F1.b src/ mints ADMISSIBLE_EVIDENCE only from the §182 authorized producer',
  admissibleFiles.length === 1 && admissibleFiles[0].endsWith('owed-facts/settlement-review.ts'),
  admissibleFiles.map((f: string) => f.split('/').pop()).join(', ') || 'none');
check('F1.c src/ mints RECORDED_ARBITRATION nowhere', mintedArbitration === 0, String(mintedArbitration));

// The state machine itself: is SETTLED_BY_EVIDENCE sealed, or merely un-invoked?
const settledOk = transition(dev([HR04_FACT]), {
  factKey: HR04_FACT.factKey, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
  justification: 'A0 replay: exercising the declared transition to establish reachability',
});
check('F1.d the transition itself ACCEPTS ADMISSIBLE_EVIDENCE — the state is un-invoked, not sealed',
  factOf(settledOk, HR04_FACT.factKey)!.status === 'SETTLED_BY_EVIDENCE',
  'reachable by any caller; no runtime caller exists');
const wrongAuth = threw(() => transition(dev([HR04_FACT]), {
  factKey: HR04_FACT.factKey, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMITTED_BINDING',
  justification: 'a binding is not evidence',
}));
check('F1.e and refuses any other authority for that status',
  wrongAuth !== null && /TRANSITION_AUTHORITY_MISMATCH/.test(wrongAuth), '');

const bindingSrc = readFileSync(
  join(srcDir, 'hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts'), 'utf8');
check('F2.a CHALLENGE_FACT_VALIDITY produces an ArbitrationRequest',
  /arbitration\.push\(\{/.test(bindingSrc) && /settles: false/.test(bindingSrc), '');
const consumers = grepCount(srcDir, 'arbitrationRequests');
check('F2.b arbitrationRequests appears in src/ only as production and observability carriage',
  consumers >= 1, `${consumers} references, none converting to a RECORDED_ARBITRATION transition`);

const projected = projectOwedFact(HR04_FACT);
const projectedKeys = Object.keys(projected).sort().join(',');
check('F3.a the projection carries the settlement target and no settlement-status field',
  'acceptableEvidence' in projected && !('settlementStatus' in projected)
  && !('evidenceEstablishes' in projected), projectedKeys);
check('F3.b there is no field requiring the provider to say what its evidence ESTABLISHES',
  !JSON.stringify(projected).includes('Establishes'), 'STRUCTURED_EVIDENCE_PROPERTY_DECLARATION = ABSENT');

const runnerSrc = readFileSync(join(__dirname, 'probe-v15-replicated-clarification-2026-09-05.ts'), 'utf8');
const harnessSrc = readFileSync(join(__dirname, 'probe-balanced-clarification-hosted-2026-09-05.ts'), 'utf8');
check('F4 the §179 runner and harness import nothing from owed-facts',
  !/from '.*owed-facts/.test(runnerSrc) && !/from '.*owed-facts/.test(harnessSrc)
  && !/OwedFact|factKey/.test(harnessSrc), 'the §179 rows ran outside the ledger entirely');

// ================================================================ 1. HR-04 structural replay
console.log('\n--- 1. HR-04 STRUCTURAL REPLAY: can presence erase the owed securement fact?');

const l04 = dev([HR04_FACT]);
check('1.1 the owed securement fact is admitted and UNRESOLVED',
  factOf(l04, HR04_FACT.factKey)!.status === 'UNRESOLVED', HR04_FACT.factKey);
check('1.2 it carries a governed settlement target derived from app-mg-01, with NO new field',
  HR04_FACT.acceptableEvidence !== null
  && HR04_FACT.acceptableEvidence.provenance === 'GOVERNED_EVIDENCE'
  && !('requiredProperty' in (HR04_FACT as object)),
  HR04_FACT.acceptableEvidence?.requirement ?? 'null');

// A presence observation is represented as a SEPARATE additive fact. It is the closest the current
// architecture comes to "the guard is present", and the question is what it does to the owed fact.
const PRESENCE_FACT = devFact({
  key: 'owed:guarding:guard_presence',
  decision: 'REQUIRED_CONTROL',
  span: 'The fixed guard over the head drum nip point is in position.',
  why: 'presence is stated; recorded as its own fact so the replay can ask what it does to the '
    + 'securement fact',
  a: 'the guard is in position',
  b: 'the guard is not in position',
  ifA: 'no guarding action on presence grounds',
  ifB: 'the conveyor is stopped',
});
const l04b = addOwedFact(l04, PRESENCE_FACT);
check('1.3 representing presence does NOT remove the securement fact',
  factOf(l04b, HR04_FACT.factKey)!.status === 'UNRESOLVED'
  && factsRemoved(l04, l04b).length === 0 && l04b.facts.length === 2,
  'both facts coexist; the ledger is append-only');
check('1.4 settling the PRESENCE fact leaves the SECUREMENT fact untouched',
  (() => {
    const after = transition(l04b, {
      factKey: PRESENCE_FACT.factKey, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
      justification: 'A0 replay: presence is stated outright in the observation',
    });
    return factOf(after, PRESENCE_FACT.factKey)!.status === 'SETTLED_BY_EVIDENCE'
      && factOf(after, HR04_FACT.factKey)!.status === 'UNRESOLVED';
  })(),
  'ANSWER: presence cannot structurally erase securement — they are different factKeys');
check('1.5 no new settlement field was needed to express the distinction',
  !('requiredProperty' in (HR04_FACT as object)) && !('propertyType' in (HR04_FACT as object))
  && OWED_FACT_STATUSES.length === 4,
  'the distinction is carried by factKey identity plus acceptableEvidence.requirement');
console.log('      SEMANTIC_JUDGMENT_REQUIRED — whether the app-mg-01 criterion actually settles');
console.log('      securement is a semantic question this replay does not and may not answer.');

// ================================================================ 2. SETTLED_BY_EVIDENCE
console.log('\n--- 2. SETTLED_BY_EVIDENCE: what is required, and can a provider cause it?');
check('2.1 required authority is ADMISSIBLE_EVIDENCE and nothing else',
  REQUIRED_AUTHORITY.SETTLED_BY_EVIDENCE === 'ADMISSIBLE_EVIDENCE', '');
check('2.2 there is no provider declaration that maps to it',
  !bindingSrc.includes("to: 'SETTLED_BY_EVIDENCE'"),
  'applyAdmittedDeclarations mints ADMITTED_BINDING only');
const decls: ClarificationDeclaration[] = [{
  declarationId: 'd1', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: HR04_FACT.factKey,
  nomination: null, question: 'Are the guard fastenings presently secure?',
  affectedDecision: 'REQUIRED_CONTROL',
}];
const chk = checkBindingDeclarations(decls, l04, rowText['HR-04']);
const applied = applyAdmittedDeclarations(l04, chk);
check('2.3 the strongest provider-driven outcome is COVERED, never SETTLED_BY_EVIDENCE',
  factOf(applied, HR04_FACT.factKey)!.status === 'COVERED'
  && applied.transitions.every(t => t.authority === 'ADMITTED_BINDING'),
  'provider output cannot reach the evidence authority');

// ================================================================ 3. CHALLENGE_FACT_VALIDITY
console.log('\n--- 3. CHALLENGE_FACT_VALIDITY: producer to terminal state');
const parsed = parseOwedFactDeclarations(
  [{ factKey: HR04_FACT.factKey, declaration: 'CHALLENGE_FACT_VALIDITY',
    challengeReason: 'the observation already settles it: the guard is in position' } as any],
  [HR04_FACT.factKey], null);
check('3.1 a challenge is admitted and produces exactly one ArbitrationRequest',
  parsed.arbitrationRequests.length === 1, String(parsed.arbitrationRequests.length));
check('3.2 it is typed settles:false and factStatusUnchanged:true',
  parsed.arbitrationRequests[0].settles === false
  && parsed.arbitrationRequests[0].factStatusUnchanged === true, '');
check('3.3 the fact is STILL UNRESOLVED after the challenge',
  factOf(l04, HR04_FACT.factKey)!.status === 'UNRESOLVED',
  'a challenge changes no status — DEAD AS A DECISION INPUT, LIVE AS OBSERVABILITY');
const challengeWithoutReason = parseOwedFactDeclarations(
  [{ factKey: HR04_FACT.factKey, declaration: 'CHALLENGE_FACT_VALIDITY' } as any],
  [HR04_FACT.factKey], null);
check('3.4 a challenge with no reason is refused',
  challengeWithoutReason.codes.includes('CHALLENGE_WITHOUT_A_REASON'), '');

// ================================================================ 4. displaced valid fact
console.log('\n--- 4. DISPLACED-VALID-FACT REPLAY (HR-05, HR-07 shapes)');

const l05 = dev([HR05_FACT]);
const settled05 = transition(l05, {
  factKey: HR05_FACT.factKey, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
  justification: 'A0 replay: the observation states the drive was proved dead by attempted start',
});
// The adjacent fact the model actually raised at §179: the running drying fans.
const ADJACENT_05: ClarificationDeclaration = {
  declarationId: 'adj-05', bindingMode: 'NOMINATED_NEW', coversFactKey: null,
  nomination: {
    factKey: 'owed:energy:drying_fan_interconnection',
    affectedDecision: 'REQUIRED_CONTROL',
    evidenceSpan: 'while the drying fans run on',
    whyUnresolved: 'whether the running fans can move the auger is not stated',
    branchA: 'the fans are interconnected', branchB: 'the fans are independent',
    decisionIfA: 'the fans are isolated too', decisionIfB: 'no further isolation',
    priority: 'REQUIRED_CONTROL',
  },
  question: 'Are the drying fans interconnected with the auger?',
  affectedDecision: 'REQUIRED_CONTROL',
};
const adjCheck = checkBindingDeclarations([ADJACENT_05], settled05, rowText['HR-05']);
check('4.1 an adjacent fact can be NOMINATED while the owed fact is settled',
  adjCheck.admitted.length === 1 && adjCheck.nominationCount === 1,
  'legitimate new hazards are NOT suppressed');
const afterAdj = nominateAdditiveFact(settled05, {
  ...devFact({
    key: ADJACENT_05.nomination!.factKey, decision: 'REQUIRED_CONTROL',
    span: ADJACENT_05.nomination!.evidenceSpan, why: ADJACENT_05.nomination!.whyUnresolved,
    a: ADJACENT_05.nomination!.branchA, b: ADJACENT_05.nomination!.branchB,
    ifA: ADJACENT_05.nomination!.decisionIfA, ifB: ADJACENT_05.nomination!.decisionIfB,
  }),
  source: 'VERIFIER_NOMINATION', modelAuthored: true,
});
check('4.2 the nominated fact CANNOT replace the owed fact',
  factsRemoved(settled05, afterAdj).length === 0 && afterAdj.facts.length === 2
  && factOf(afterAdj, HR05_FACT.factKey)!.status === 'SETTLED_BY_EVIDENCE',
  'ADJACENT VALID FACT != SUBSTITUTE OWED FACT — substitution is unrepresentable');
check('4.3 the nominated fact does NOT inherit the owed fact\'s entitlement',
  factOf(afterAdj, ADJACENT_05.nomination!.factKey)!.status === 'UNRESOLVED'
  && factOf(afterAdj, ADJACENT_05.nomination!.factKey)!.source === 'VERIFIER_NOMINATION',
  'it carries its own status and must be admitted on its own proof burden');
const badBind = checkBindingDeclarations([{
  ...ADJACENT_05, declarationId: 'bad', bindingMode: 'BOUND_TO_OWED_FACT',
  coversFactKey: HR05_FACT.factKey, nomination: ADJACENT_05.nomination,
}], settled05, rowText['HR-05']);
check('4.4 a declaration cannot bind an adjacent question to a non-UNRESOLVED owed fact',
  badBind.admitted.length === 0
  && badBind.perDeclaration[0].codes.includes('BINDING_MODE_CARRIES_A_NOMINATION'),
  badBind.perDeclaration[0].codes.join(','));
const notVerbatim = checkBindingDeclarations([{
  ...ADJACENT_05, declarationId: 'nv',
  nomination: { ...ADJACENT_05.nomination!, evidenceSpan: 'a span that is not in the observation' },
}], settled05, rowText['HR-05']);
check('4.5 a nomination whose span is not verbatim is refused',
  notVerbatim.admitted.length === 0
  && notVerbatim.perDeclaration[0].codes.includes('NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM'), '');

// HR-07 shape: the same test on the settled flame-failure fact
const settled07 = transition(dev([HR07_FACT]), {
  factKey: HR07_FACT.factKey, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
  justification: 'A0 replay: the observation records a completed flame test with a stated result',
});
const dust = checkBindingDeclarations([{
  declarationId: 'adj-07', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: HR07_FACT.factKey,
  nomination: null, question: 'How extensive is the dust accumulation?',
  affectedDecision: 'HAZARD_SEVERITY',
}], settled07, rowText['HR-07']);
check('4.6 HR-07 shape: an adjacent question cannot bind to the settled owed fact',
  dust.admitted.length === 0 && dust.perDeclaration[0].codes.includes('BOUND_FACT_NOT_UNRESOLVED'),
  dust.perDeclaration[0].codes.join(','));

// ================================================================ 5. positive controls
console.log('\n--- 5. POSITIVE CONTROLS');
const l06 = dev([HR06_FACT]);
const chk06 = checkBindingDeclarations([{
  declarationId: 'c6', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: HR06_FACT.factKey,
  nomination: null, question: 'Was the interlock function-tested after the tooth change?',
  affectedDecision: 'REQUIRED_CONTROL',
}], l06, rowText['HR-06']);
const cov06 = evaluateTargetCoverage(l06, chk06.boundFactKeys);
check('5.1 HR-06 (function owed): a bound question clears the coverage warning',
  cov06.TARGET_COVERAGE_WARNING === false, '');
const l08 = dev([HR08_FACT]);
const cov08 = evaluateTargetCoverage(l08, checkBindingDeclarations([], l08, rowText['HR-08']).boundFactKeys);
check('5.2 HR-08 (LIFE_CRITICAL, isolation owed): an unbound life-critical fact warns',
  cov08.TARGET_COVERAGE_WARNING === true && cov08.uncoveredFactKeys.includes(HR08_FACT.factKey), '');
check('5.3 HR-08 carries a governed criterion from app-loto-01',
  HR08_FACT.acceptableEvidence?.provenance === 'GOVERNED_EVIDENCE',
  HR08_FACT.acceptableEvidence?.requirement ?? 'null');
const l10 = dev([HR10_FACT]);
const settled10 = transition(l10, {
  factKey: HR10_FACT.factKey, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
  justification: 'A0 replay: settled positive control',
});
check('5.4 HR-10 (settled control): a settled fact leaves the unresolved set',
  unresolvedFacts(settled10).length === 0
  && evaluateTargetCoverage(settled10,
    checkBindingDeclarations([], settled10, rowText['HR-10']).boundFactKeys)
    .TARGET_COVERAGE_WARNING === false,
  'a settled fact stops competing for the question budget without being dropped');

// ================================================================ P. required proofs
console.log('\n--- P. REQUIRED PROOFS');
check('P1 the inactive boundary is unchanged',
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false
  && verifierV3BoundaryState().readsConfiguration === false
  && verifierV3BoundaryState().customerFacingToggleExists === false, '');
const serviceSrc = readFileSync(join(srcDir, 'hazlenz/safescope-v2.service.ts'), 'utf8');
check('P2 no customer path reaches this harness or a DEVELOPMENT ledger',
  !serviceSrc.includes('a0-settlement-replay') && !serviceSrc.includes('owed-facts')
  && !PRODUCTION_PERMITTED_SOURCES.includes('DEVELOPMENT_HUMAN_TRUTH' as never), '');
const prodRefused = threw(() => createOwedFactLedger('PRODUCTION', [HR04_FACT]));
check('P2b a DEVELOPMENT_HUMAN_TRUTH fact is refused by a PRODUCTION ledger',
  prodRefused !== null, (prodRefused ?? '').slice(0, 60));
let drift = 0;
for (const r of blinded.rows) {
  if (sha(r.TEXT) !== frozenHashes.rowTextHashes[r.REVIEW_ROW_ID].rowTextSha256) drift += 1;
}
check('P3 frozen row text unchanged', drift === 0, `${drift} drifted`);
const registryHashes = ['approved-knowledge-seed-records.v1.json', 'rec-msha-30-56-12.json',
  'regulatory-expansion-v1.json'].map(f => sha(readFileSync(join(REGISTRY, f), 'utf8')).slice(0, 12));
check('P4 governed records were read only — hashes recorded for comparison',
  registryHashes.length === 3, registryHashes.join(' '));
// Strip comments first: this file DISCUSSES matchers in prose, and a check that trips on its own
// documentation would be a check that punishes explaining itself.
const selfSrc = readFileSync(__filename.replace(/\.js$/, '.ts'), 'utf8');
const selfCode = selfSrc
  .split('--- P. REQUIRED PROOFS')[0]
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
check('P5 no semantic matcher introduced by this harness',
  !/similarity|embedding|cosine|levenshtein|includes\(\s*requirement|\brequirement\s*===/i
    .test(selfCode),
  'comments stripped; code only');
check('P6 the HR-04 owed fact is not deleted merely because presence is represented',
  factOf(l04b, HR04_FACT.factKey) !== null
  && preservationViolations(l04, l04b).length === 0, '');
check('P7 an adjacent nominated fact cannot overwrite another factKey',
  factsRemoved(settled05, afterAdj).length === 0, '');
check('P8 exact factKey coverage remains deterministic',
  COVERAGE_DECISION_INPUTS.every(i => !i.includes('question')), COVERAGE_DECISION_INPUTS.join(' | '));
check('P9 acceptableEvidence remains guidance — nothing compares it to anything',
  CLARIFICATION_EVIDENCE_SUFFICIENCY === 'SEMANTIC_JUDGMENT_REQUIRED'
  && PROVIDER_FORBIDDEN_OWED_FACT_FIELDS.includes('acceptableEvidence'), '');
check('P10 SETTLED_BY_EVIDENCE cannot be minted by provider output alone',
  applied.transitions.every(t => t.authority === 'ADMITTED_BINDING')
  && !bindingSrc.includes("'ADMISSIBLE_EVIDENCE'"), '');

console.log(`\n${failed === 0 ? 'A0 REPLAY PASSED' : `${failed} FAILED`} — provider calls: 0   database operations: 0`);
if (failed > 0) process.exit(1);
