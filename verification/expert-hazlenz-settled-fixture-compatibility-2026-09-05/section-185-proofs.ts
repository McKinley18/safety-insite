/**
 * §185 -- SETTLED OWED-FACT FIXTURE COMPATIBILITY PROOFS.
 *
 * Pure and local. Zero provider calls, zero database operations, zero prompt changes.
 *
 * Proves the whyUnresolved/status invariant in both directions, replays the ten recorded §184
 * product-owner rows through the real runtime types, and OBSERVES (never redesigns) the actual
 * provider projection.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  type OwedFact, type OwedFactStatus, OWED_FACT_STATUSES, WHY_UNRESOLVED_STATUS_INVARIANT,
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS, REQUIRED_AUTHORITY, TRANSITION_AUTHORITIES,
} from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  owedFact, owedFactDefects, createOwedFactLedger, transition, factOf,
} from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  projectOwedFact, projectOwedFactsForVerifier, runOwedFactCoverageStage,
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED,
} from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary';

const ROOT = join(__dirname, '..', '..');
const OUT = __dirname;
const SRC = join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/owed-facts');
const TRUTH = join(ROOT, 'verification/expert-hazlenz-owed-fact-truth-2026-09-05');
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const fsha = (p: string) => sha(readFileSync(p, 'utf8'));

const results: { id: string; ok: boolean; detail: string }[] = [];
const prove = (id: string, ok: boolean, detail = '') => {
  results.push({ id, ok, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${id}${detail ? `  [${detail}]` : ''}`);
};
const threw = (fn: () => unknown): boolean => {
  try { fn(); return false; } catch { return true; }
};

// ============================================================ recorded §184 truth
const truth = JSON.parse(readFileSync(join(TRUTH, 'OWED-FACT-TRUTH-CANDIDATES.json'), 'utf8'));
const rows: any[] = truth.rows;

/**
 * branchA/branchB are DERIVED MECHANICALLY from the approved factStatement, per
 * RUNTIME-FIXTURE-DERIVATION.md. Deterministic string surgery only -- no prose is authored, and
 * nothing is asserted that the factStatement does not already say.
 */
const branchesOf = (factStatement: string) => {
  const core = factStatement.replace(/^Whether\s+/, '').replace(/\.\s*$/, '');
  return { branchA: `established: ${core}`, branchB: `not established: ${core}` };
};

/**
 * SETTLED rows take `SETTLED_BY_EVIDENCE`. No status is added. §184 records these as settled FROM
 * THE OBSERVATION, and the establishing evidence is a span of that observation -- so the fact is
 * settled by evidence and the existing member describes the mechanism rather than approximating it.
 */
const statusOf = (r: any): OwedFactStatus =>
  (r.settledFromObservation ? 'SETTLED_BY_EVIDENCE' : 'UNRESOLVED');

const fixtureOf = (r: any): OwedFact => owedFact({
  factKey: r.factKey,
  affectedDecision: r.affectedDecision,
  source: 'DEVELOPMENT_HUMAN_TRUTH',
  evidenceSpan: r.evidenceSpan,
  whyUnresolved: r.whyUnresolved,
  ...branchesOf(r.factStatement),
  decisionDivergence: { ifA: r.decisionIfEstablished, ifB: r.decisionIfNotEstablished },
  priority: r.priority,
  status: statusOf(r),
  // acceptableEvidence derivation is §181/§184 work and is deliberately out of scope here. null is
  // valid by contract and manufactures nothing.
  acceptableEvidence: null,
});

const fixtures = rows.map(fixtureOf);
const byRow = new Map(rows.map((r, i) => [r.rowId, fixtures[i]]));

// ============================================================ 1-7 the invariant, both directions
const base = {
  factKey: 'owed:test:probe',
  affectedDecision: 'REQUIRED_CONTROL' as const,
  source: 'DEVELOPMENT_HUMAN_TRUTH' as const,
  evidenceSpan: 'a verbatim span',
  branchA: 'established: the probe fact',
  branchB: 'not established: the probe fact',
  decisionDivergence: { ifA: 'do X', ifB: 'do Y' },
  priority: 'REQUIRED_CONTROL' as const,
  acceptableEvidence: null,
};
const mk = (status: OwedFactStatus, why: string | null): OwedFact =>
  owedFact({ ...base, status, whyUnresolved: why });
const defectsOf = (status: OwedFactStatus, why: string | null) => owedFactDefects(mk(status, why));
const refuses = (status: OwedFactStatus, why: string | null, code: string) =>
  defectsOf(status, why).some(d => d.startsWith(code));

console.log('\n--- 1..7 THE INVARIANT, STRICT IN BOTH DIRECTIONS');
prove('1 UNRESOLVED_NULL_WHY_REFUSED',
  refuses('UNRESOLVED', null, 'WHY_UNRESOLVED_MISSING')
  && threw(() => createOwedFactLedger('DEVELOPMENT', [mk('UNRESOLVED', null)])),
  'defect + ledger admission throws');
prove('2 UNRESOLVED_BLANK_WHY_REFUSED',
  refuses('UNRESOLVED', '', 'WHY_UNRESOLVED_MISSING')
  && refuses('UNRESOLVED', '   ', 'WHY_UNRESOLVED_MISSING'),
  'empty and whitespace-only both refused');
prove('3 UNRESOLVED_NONBLANK_WHY_ACCEPTED',
  defectsOf('UNRESOLVED', 'the observation does not state the current securement').length === 0);
prove('4 SETTLED_BY_EVIDENCE_NULL_WHY_ACCEPTED',
  defectsOf('SETTLED_BY_EVIDENCE', null).length === 0);
prove('5 COVERED_NULL_WHY_ACCEPTED',
  defectsOf('COVERED', null).length === 0,
  'stands in for the authorization\'s SETTLED_BY_OBSERVATION: no such status exists');
prove('6 REJECTED_BY_ARBITRATION_NULL_WHY_ACCEPTED',
  defectsOf('REJECTED_BY_ARBITRATION', null).length === 0,
  'stands in for the authorization\'s NOT_APPLICABLE: no such status exists');
prove('7 NON_UNRESOLVED_NONBLANK_WHY_REFUSED',
  (['COVERED', 'SETTLED_BY_EVIDENCE', 'REJECTED_BY_ARBITRATION'] as const).every(s =>
    refuses(s, 'any sentence at all', 'WHY_UNRESOLVED_PRESENT_ON_NON_UNRESOLVED_FACT')
    && refuses(s, '', 'WHY_UNRESOLVED_PRESENT_ON_NON_UNRESOLVED_FACT')),
  'nonblank AND empty-string both refused on all three terminal statuses; only null passes');
prove('7b INVARIANT_TABLE_COVERS_EVERY_STATUS',
  OWED_FACT_STATUSES.every(s => s in WHY_UNRESOLVED_STATUS_INVARIANT)
  && Object.keys(WHY_UNRESOLVED_STATUS_INVARIANT).length === OWED_FACT_STATUSES.length,
  `${OWED_FACT_STATUSES.length} statuses, no status added`);

// ============================================================ 8-11 the ten-row replay
console.log('\n--- 8..11 TEN-ROW §184 REPLAY');
/**
 * ONE LEDGER PER ROW, and that is structural rather than convenient. Both members of a pair share a
 * factKey by §184 design, and a ledger deduplicates on exact factKey identity -- so the ten rows are
 * ten independent analyses of the same five facts under different observations, never one set.
 */
const ledgers = fixtures.map(f => createOwedFactLedger('DEVELOPMENT', [f]));
const ledger = ledgers[rows.findIndex(r => r.rowId === 'HR-04')];
const representable = fixtures.filter((f, i) =>
  owedFactDefects(f).length === 0 && ledgers[i].facts.length === 1).length;
prove('8 TEN_ROW_FIXTURE_STRUCTURALLY_REPRESENTABLE',
  representable === 10, `${representable} / 10 admitted, one DEVELOPMENT ledger per row`);
prove('9 SETTLED_FIXTURE_TYPE_MISMATCH = FALSE',
  rows.filter(r => r.settledFromObservation)
    .every(r => owedFactDefects(byRow.get(r.rowId)!).length === 0),
  'all five SILENCE rows admit to a ledger with whyUnresolved null');

const manufactured = fixtures.filter(f =>
  f.status !== 'UNRESOLVED' && f.whyUnresolved !== null).length;
const synthetic = ['already resolved', 'not unresolved', 'settled', 'no uncertainty', 'n/a', 'none'];
const syntheticFound = fixtures.filter(f =>
  typeof f.whyUnresolved === 'string'
  && synthetic.some(s => f.whyUnresolved!.toLowerCase().trim() === s)).length;
prove('10 FALSE_UNCERTAINTY_TEXT_MANUFACTURED = 0',
  manufactured === 0 && syntheticFound === 0,
  `${manufactured} non-null on settled · ${syntheticFound} synthetic stand-ins`);

const pairs = new Map<string, any[]>();
for (const r of rows) {
  if (!pairs.has(r.pairId)) pairs.set(r.pairId, []);
  pairs.get(r.pairId)!.push(r);
}
let pairOk = 0;
for (const [, ms] of pairs) {
  const [a, b] = ms;
  const fa = byRow.get(a.rowId)!; const fb = byRow.get(b.rowId)!;
  if (a.factKey === b.factKey && a.factStatement === b.factStatement
      && a.targetDecision === b.targetDecision
      && a.decisionIfEstablished === b.decisionIfEstablished
      && a.decisionIfNotEstablished === b.decisionIfNotEstablished
      && fa.branchA === fb.branchA && fa.branchB === fb.branchB
      && JSON.stringify(fa.decisionDivergence) === JSON.stringify(fb.decisionDivergence)) pairOk += 1;
}
prove('11 PAIR_SHARED_FACT_SEMANTICS_IDENTICAL', pairOk === 5, `${pairOk} / 5`);

// ============================================================ 12 §184 truth untouched
console.log('\n--- 12 §184 PRODUCT-OWNER TRUTH');
const truthHashes: Record<string, string> = {
  'OWED-FACT-TRUTH-CANDIDATES.json': '649a17df3730b1d67f20bda9b6231d0a5461902c985ce87fb7b2659e67798b0b',
  'PRODUCT-OWNER-REVIEW-PACKET.json': 'ce6b35a1bd0308f1a56be66947e7683bdc13b33ba94bfda1df697ac03d3cc5de',
  'PRODUCT-OWNER-REVIEW-PACKET.md': '070f40d0162cd7036af7f0a6b73bc8f5e4749e784a9207244ed456e839eb088e',
  'TRUTH-PROVENANCE.json': '1973abbd5130723e7caf276983c4af87fe04e30c9db534ac9a0226811035ab45',
  'SECTION-184-INTEGRITY.json': '172aaba1fbd22b95259a1bdef3d76a8d5dbd32b27d69b9784532d60a36ebeb36',
};
const truthUnchanged = Object.entries(truthHashes)
  .every(([f, h]) => fsha(join(TRUTH, f)) === h);
prove('12 §184_PRODUCT_OWNER_TRUTH_BYTE_IDENTICAL', truthUnchanged, '5 / 5 artifacts');

// ============================================================ 13-16 projection
console.log('\n--- 13..16 PROVIDER PROJECTION');
const WITHHELD = [
  'expectedClarificationDisposition', 'evaluationRationale', 'settledFromObservation',
  'productOwnerVerdict', 'productOwnerFinalText', 'sourceBasis', 'authoringNotes',
  'governedEvidenceClass', 'pairId', 'pairPartner', 'truthClass', 'PRODUCT_OWNER_REVIEWED',
];
const projections = rows.map((r, i) => ({ rowId: r.rowId, p: projectOwedFact(fixtures[i]) }));
const leaked = projections.filter(({ p }) => {
  const keys = Object.keys(p);
  const json = JSON.stringify(p);
  return WITHHELD.some(w => keys.includes(w) || json.includes(`"${w}"`));
});
prove('13 PROVIDER_PROJECTION_WITHHELD_EVALUATION_FIELDS',
  leaked.length === 0, `${10 - leaked.length} / 10 clean`);

const hr04 = projections.find(x => x.rowId === 'HR-04')!.p;
const hr04Rationale = rows.find(r => r.rowId === 'HR-04').evaluationRationale;
prove('14 HR04_PROVIDER_PAYLOAD_CONTAINS_NO_EVALUATION_RATIONALE',
  !JSON.stringify(hr04).includes(hr04Rationale)
  && !Object.keys(hr04).includes('evaluationRationale'));

const settledRows = rows.filter(r => r.settledFromObservation).map(r => r.rowId);
const settledClean = settledRows.filter(id =>
  projections.find(x => x.rowId === id)!.p.whyUnresolved === null).length;
prove('15 SETTLED_ROWS_PROVIDER_PAYLOAD_CONTAINS_NO_FALSE_WHY_UNRESOLVED',
  settledClean === 5, `${settledClean} / 5 project null`);

const unresRows = rows.filter(r => !r.settledFromObservation);
const retained = unresRows.filter(r =>
  projections.find(x => x.rowId === r.rowId)!.p.whyUnresolved === r.whyUnresolved).length;
prove('16 UNRESOLVED_ROWS_RETAIN_APPROVED_WHY_UNRESOLVED',
  retained === 5, `${retained} / 5 byte-identical to §184 text`);

// ============================================================ 17-18 authority and the gate
console.log('\n--- 17..18 AUTHORITY AND THE GATE');
const noModelAuthority = !(TRANSITION_AUTHORITIES as readonly string[])
  .some(a => /model|explanation|provider|verifier/i.test(a));
prove('17 PROVIDER_SETTLEMENT_AUTHORITY = NEVER',
  noModelAuthority
  && (PROVIDER_FORBIDDEN_OWED_FACT_FIELDS as readonly string[]).includes('status')
  && (PROVIDER_FORBIDDEN_OWED_FACT_FIELDS as readonly string[]).includes('settled')
  && REQUIRED_AUTHORITY.SETTLED_BY_EVIDENCE === 'ADMISSIBLE_EVIDENCE'
  && threw(() => transition(createOwedFactLedger('DEVELOPMENT', [mk('UNRESOLVED', 'because')]), {
    factKey: 'owed:test:probe', to: 'SETTLED_BY_EVIDENCE',
    authority: 'MODEL_EXPLANATION' as never, justification: 'fluent reasoning',
  })),
  'no model authority member exists and a forged one throws');

const stage = runOwedFactCoverageStage({
  ledger, coverage: { covered: [], uncovered: [] } as never, questions: [],
});
prove('18 FEATURE_OFF_CURRENT_PATH_INVARIANT',
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false
  && stage.attached === false && stage.attachment === null,
  'gate is the literal false; the stage attaches nothing');

// ============================================================ transition preservation
console.log('\n--- TRANSITION PRESERVATION (the one behavioural change)');
const before = createOwedFactLedger('DEVELOPMENT', [mk('UNRESOLVED', 'the observation does not state X')]);
const after = transition(before, {
  factKey: 'owed:test:probe', to: 'SETTLED_BY_EVIDENCE',
  authority: 'ADMISSIBLE_EVIDENCE', justification: 'a recorded review approved the settlement claim',
});
const movedFact = factOf(after, 'owed:test:probe')!;
prove('T1 transition nulls whyUnresolved so the settled fact stays valid',
  movedFact.whyUnresolved === null && owedFactDefects(movedFact).length === 0);
prove('T2 the sentence is PRESERVED on the transition record, not destroyed',
  after.transitions[0].whyUnresolvedAtTransition === 'the observation does not state X',
  'append-only ledger keeps the evidence the fact was once unresolved and why');

// ============================================================ projection OBSERVATION (no redesign)
const sampleUnres = projections.find(x => x.rowId === 'HR-04')!.p;
const sampleSettled = projections.find(x => x.rowId === 'HR-10')!.p;
const ledgerProjection = projectOwedFactsForVerifier(ledger);
const observation = {
  artifact: 'SECTION_185_PROVIDER_PROJECTION_OBSERVATION',
  note: 'OBSERVED ONLY. §185 changed no projection field and did not redesign the firewall.',
  projectedFieldsForUnresolvedRows: Object.keys(sampleUnres).sort(),
  projectedFieldsForSettledRows: Object.keys(sampleSettled).sort(),
  factStatementProjected: Object.keys(sampleUnres).includes('factStatement'),
  targetDecisionProjected: Object.keys(sampleUnres).includes('targetDecision'),
  whyUnresolvedOnUnresolvedRows: 'string, byte-identical to the §184 approved text',
  whyUnresolvedOnSettledRows: sampleSettled.whyUnresolved,
  ledgerLevelProjectionCountForSettledRow:
    projectOwedFactsForVerifier(ledgers[rows.findIndex(r => r.rowId === 'HR-10')]).length,
  ledgerLevelProjectionCountForUnresolvedRow: ledgerProjection.length,
  ledgerLevelProjectionNote:
    'projectOwedFactsForVerifier filters to unresolvedFacts(). A settled row\'s ledger therefore '
    + 'projects ZERO facts and an unresolved row\'s projects one, so the five settled rows never '
    + 'reach a verifier request through that function at all. A direct projectOwedFact call on a '
    + 'settled fact now yields whyUnresolved: null rather than an invented sentence.',
  withheldFieldsAsserted: WITHHELD,
  withheldFieldsFound: leaked.map(l => l.rowId),
  openGapsObservedNotFixed: [
    'PROJECTION-FIREWALL.json enforcementStatus remains DECLARATIVE; no runtime guard asserts the '
      + 'projected payload, this proof suite does it externally',
    'factStatement and targetDecision are still classified by the firewall as neither projected nor '
      + 'withheld. OBSERVED: neither appears in the actual projected payload.',
    'owedFact() accepts a terminal status directly, so a fact can be constructed as settled without '
      + 'a transition record. Pre-existing, unchanged by §185, and required by the §184 settled '
      + 'controls, which are settled from the observation and were never unresolved.',
  ],
  sampleUnresolvedPayload: sampleUnres,
  sampleSettledPayload: sampleSettled,
};

// ============================================================ artifacts
mkdirSync(OUT, { recursive: true });
const sourceHashes = {
  note: 'owed-facts/ is entirely untracked in git and no prior artifact pinned owed-fact-ledger.ts '
    + 'or verifier-v3-development-boundary.ts, so their PRE hashes were RECONSTRUCTED by inverting '
    + 'the recorded §185 edits rather than measured before the change. The method is validated: the '
    + 'same inversion reproduces owed-fact.types.ts at exactly the hash §184 recorded independently.',
  pre: {
    'owed-fact.types.ts': 'f77c7febb55a056271174c4efd4375506145344bd0748e5d56f93c698074c1d1',
    'owed-fact.types.ts_source': 'MEASURED -- recorded by §184 and re-verified before the edit',
    'owed-fact-ledger.ts': '8b5ce40e33f54272082f121b06c84b618e933d76504eec39ec5f63f7c88d0486',
    'owed-fact-ledger.ts_source': 'RECONSTRUCTED by inverting the §185 edits',
    'verifier-v3-development-boundary.ts': 'e9b20d034dd91e7a37df6bc129367ef255ae5d4ae652ede90c0dcb5efa9645fc',
    'verifier-v3-development-boundary.ts_source': 'RECONSTRUCTED by inverting the §185 edits',
  },
  post: {
    'owed-fact.types.ts': fsha(join(SRC, 'owed-fact.types.ts')),
    'owed-fact-ledger.ts': fsha(join(SRC, 'owed-fact-ledger.ts')),
    'verifier-v3-development-boundary.ts': fsha(join(SRC, 'verifier-v3-development-boundary.ts')),
  },
  unchanged: {
    'owed-fact-binding.ts': fsha(join(SRC, 'owed-fact-binding.ts')),
    'settlement-review.ts': fsha(join(SRC, 'settlement-review.ts')),
    'expert-prompt.ts': fsha(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts')),
  },
};

const allPass = results.every(r => r.ok);
writeFileSync(join(OUT, 'PROVIDER-PROJECTION-OBSERVATION.json'),
  `${JSON.stringify(observation, null, 2)}\n`);
writeFileSync(join(OUT, 'TEN-ROW-FIXTURE-REPLAY.json'), `${JSON.stringify({
  artifact: 'SECTION_185_TEN_ROW_FIXTURE_REPLAY',
  derivedFrom: 'verification/expert-hazlenz-owed-fact-truth-2026-09-05 (§184 recorded truth, byte-identical)',
  branchDerivation: 'branchA/branchB derived mechanically from the approved factStatement per '
    + 'RUNTIME-FIXTURE-DERIVATION.md. No prose authored.',
  statusMapping: 'settledFromObservation -> SETTLED_BY_EVIDENCE (existing member; no status added). '
    + 'The establishing evidence is a span of the observation, so the fact is settled by evidence.',
  acceptableEvidence: 'null on all ten. Derivation is §181/§184 work, deliberately out of §185 scope. '
    + 'null is valid by contract and manufactures nothing.',
  representable: `${representable} / 10`,
  rows: rows.map((r, i) => ({
    rowId: r.rowId,
    pairId: r.pairId,
    existingClarificationTruth: r.existingClarificationTruth,
    status: fixtures[i].status,
    whyUnresolved: fixtures[i].whyUnresolved,
    defects: owedFactDefects(fixtures[i]),
    projectedWhyUnresolved: projections[i].p.whyUnresolved,
  })),
}, null, 2)}\n`);
writeFileSync(join(OUT, 'SETTLED-FIXTURE-COMPATIBILITY-PROOFS.json'), `${JSON.stringify({
  artifact: 'SECTION_185_PROOFS',
  date: '2026-09-05',
  allPass,
  passed: results.filter(r => r.ok).length,
  total: results.length,
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  statusVocabularyNote:
    'The authorization named SETTLED_BY_OBSERVATION and NOT_APPLICABLE. Neither exists in this '
    + 'repository. Per the instruction to use the exact existing four statuses and add none, proofs '
    + '5 and 6 were run against COVERED and REJECTED_BY_ARBITRATION instead.',
  results,
  sourceHashes,
}, null, 2)}\n`);

console.log(`\n${results.filter(r => r.ok).length} / ${results.length} PASS`);
console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
process.exit(allPass ? 0 : 1);
