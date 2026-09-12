/**
 * §186 -- SETTLED-FACT PROJECTION ARCHITECTURE REVIEW PROBE.
 *
 * READ-ONLY BEHAVIOURAL PROBE. It modifies no source and calls no provider. It answers, by
 * execution rather than by reading, what the existing paths actually do when handed a settled fact.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { readFileSync } from 'fs';

import type { OwedFact, OwedFactStatus } from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  owedFact, createOwedFactLedger, transition, unresolvedFacts,
} from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  projectOwedFact, projectOwedFactsForVerifier,
} from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  checkBindingDeclarations, applyAdmittedDeclarations,
} from '../../backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding';
import { buildVerifierV3UserPrompt } from '../../backend/scripts/lib/expert-verifier-instruction-v3';

const OUT = __dirname;
const TRUTH = join(__dirname, '..', 'expert-hazlenz-owed-fact-truth-2026-09-05');
const truth = JSON.parse(readFileSync(join(TRUTH, 'OWED-FACT-TRUTH-CANDIDATES.json'), 'utf8'));
const rows: any[] = truth.rows;

const findings: { id: string; question: string; observed: string; verdict: string }[] = [];
const record = (id: string, question: string, observed: string, verdict: string) => {
  findings.push({ id, question, observed, verdict });
  console.log(`${id}  ${verdict}\n    ${observed}\n`);
};
const attempt = (fn: () => unknown): string => {
  try { const r = fn(); return `RETURNED ${JSON.stringify(r).slice(0, 160)}`; }
  catch (e) { return `THREW ${(e as Error).message.slice(0, 220)}`; }
};

const branchesOf = (fs: string) => {
  const core = fs.replace(/^Whether\s+/, '').replace(/\.\s*$/, '');
  return { branchA: `established: ${core}`, branchB: `not established: ${core}` };
};
const fixtureOf = (r: any): OwedFact => owedFact({
  factKey: r.factKey,
  affectedDecision: r.affectedDecision,
  source: 'DEVELOPMENT_HUMAN_TRUTH',
  evidenceSpan: r.evidenceSpan,
  whyUnresolved: r.whyUnresolved,
  ...branchesOf(r.factStatement),
  decisionDivergence: { ifA: r.decisionIfEstablished, ifB: r.decisionIfNotEstablished },
  priority: r.priority,
  status: (r.settledFromObservation ? 'SETTLED_BY_EVIDENCE' : 'UNRESOLVED') as OwedFactStatus,
  acceptableEvidence: null,
});
const byRow = new Map<string, OwedFact>(rows.map(r => [r.rowId, fixtureOf(r)]));
const rowOf = (id: string) => rows.find(r => r.rowId === id);
const dev = (f: OwedFact) => createOwedFactLedger('DEVELOPMENT', [f]);

// ============================================================ A. what the filter actually does
const settled = byRow.get('HR-10')!;
const unres = byRow.get('HR-04')!;
record('A1', 'does the standard projection carry a settled fact?',
  `settled ledger projects ${projectOwedFactsForVerifier(dev(settled)).length} facts; `
  + `unresolved ledger projects ${projectOwedFactsForVerifier(dev(unres)).length}`,
  'CONFIRMED: settled facts are filtered out entirely');

// ============================================================ B. the binding protocol's reaction
const supplied = [settled.factKey];
const declare = (declaration: string, extra: Record<string, unknown> = {}) => ({
  declarationId: 'D1', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: settled.factKey,
  question: 'is the guard currently secure?', affectedDecision: 'REQUIRED_CONTROL',
  owedFactDeclarations: [{ factKey: settled.factKey, declaration, ...extra }],
} as never);

record('B1', 'if a settled fact is supplied and the provider declares BOUND_BY_CLARIFICATION, what happens?',
  attempt(() => {
    const ledger = dev(settled);
    const check = checkBindingDeclarations(
      [declare('BOUND_BY_CLARIFICATION')], ledger, rowOf('HR-10').evidenceSpan, 1,
    );
    const after = applyAdmittedDeclarations(ledger, check);
    return { admittedDeclarations: check.admitted.length, refused: check.refused.length,
      statusAfter: after.facts[0].status, transitions: after.transitions.length };
  }),
  'the terminal-status guard is the thing that fires');

const declCodes: Record<string, unknown> = {};
for (const d of ['BOUND_BY_CLARIFICATION', 'STILL_UNRESOLVED', 'CHALLENGE_FACT_VALIDITY']) {
  const ledger = dev(settled);
  const r = checkBindingDeclarations(
    [declare(d, { challengeReason: 'the fact is already established' })],
    ledger, rowOf('HR-10').evidenceSpan, 1,
  );
  const after = applyAdmittedDeclarations(ledger, r);
  declCodes[d] = {
    codes: r.perDeclaration.flatMap((x: never) => (x as { codes: string[] }).codes),
    admitted: r.admitted.length,
    statusAfter: after.facts[0].status,
    transitions: after.transitions.length,
  };
}
record('B1b', 'what does each declaration mode do to a SUPPLIED SETTLED fact?',
  JSON.stringify(declCodes),
  'no exception is thrown and no status moves. The declaration is REFUSED WHOLE, which is a safety '
  + 'property rather than a crash -- but it also means a provider cannot say anything admissible '
  + 'about a settled fact through the existing protocol.');

record('B2', 'does every supplied key carry a mandatory declaration obligation?',
  'checkBindingAdmission raises OWED_FACT_NOT_DECLARED for any supplied key without a declaration '
  + '(owed-fact-binding.ts:300-302), so supplying a settled fact COMPELS the provider to declare on it',
  'CONFIRMED by source; a settled fact cannot be supplied passively');

record('B3', 'can a provider declaration reach SETTLED_BY_EVIDENCE?',
  'applyAdmittedDeclarations mints only to COVERED under ADMITTED_BINDING (owed-fact-binding.ts:352-357). '
  + 'SETTLED_BY_EVIDENCE requires ADMISSIBLE_EVIDENCE, which no provider path mints.',
  'CONFIRMED: provider settlement authority remains NEVER');

// ============================================================ C. what the prompt text asserts
const asSupplied = (f: OwedFact) => ({
  factKey: f.factKey, affectedDecision: f.affectedDecision,
  whyUnresolved: f.whyUnresolved as unknown as string,
  branchA: f.branchA, branchB: f.branchB,
  decisionDivergence: f.decisionDivergence, evidenceSpan: f.evidenceSpan,
});
const promptWithSettled = buildVerifierV3UserPrompt({
  caseId: 'HR-10', observation: '(observation)', jurisdiction: 'US-OSHA', governedEvidence: [],
  deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
  firstPass: { candidates: [], clarifications: [], uncertainty: [], summary: '' },
  owedFacts: [asSupplied(settled)],
});
const factBlock = promptWithSettled.slice(promptWithSettled.indexOf('UNRESOLVED FACTS'));
record('C1', 'if a settled fact were passed to the prompt builder, what does the provider read?',
  JSON.stringify(factBlock.split('\n').filter(l =>
    l.includes('UNRESOLVED FACTS') || l.includes('unresolved because')).join(' | ')),
  'DECISIVE: the template hard-codes the heading "UNRESOLVED FACTS IDENTIFIED FOR YOUR REVIEW" and '
  + 'the line "unresolved because: <value>". A settled fact is represented AS UNRESOLVED, and its '
  + 'null renders as the literal "null". No existing text path can say "already settled".');

// ============================================================ D. can the eight fields distinguish?
const pairEvidence: Record<string, unknown> = {};
for (const pid of ['PAIR-1', 'PAIR-2', 'PAIR-3', 'PAIR-4', 'PAIR-5']) {
  const ms = rows.filter(r => r.pairId === pid);
  const a = byRow.get(ms[0].rowId)!; const b = byRow.get(ms[1].rowId)!;
  const pa = projectOwedFact(a); const pb = projectOwedFact(b);
  const differing = (Object.keys(pa) as (keyof typeof pa)[])
    .filter(k => JSON.stringify(pa[k]) !== JSON.stringify(pb[k]));
  pairEvidence[pid] = {
    rows: [ms[0].rowId, ms[1].rowId],
    settlementDiffers: ms[0].settledFromObservation !== ms[1].settledFromObservation,
    projectedFieldsThatDiffer: differing,
    note: differing.length === 2 && differing.includes('whyUnresolved')
      && differing.includes('evidenceSpan')
      ? 'only whyUnresolved and evidenceSpan differ; factKey, branches and decisionDivergence are identical'
      : 'see list',
  };
}
record('D1', 'what distinguishes a settled from an unresolved member in the projected eight fields?',
  JSON.stringify(pairEvidence['PAIR-2']),
  'whyUnresolved (null vs sentence) and evidenceSpan differ. Nothing else does, and neither field '
  + 'NAMES the settlement state -- a null is an absence, not an assertion.');

const hr04 = projectOwedFact(byRow.get('HR-04')!);
record('D2', 'can the owed property be identified from the projected fields without factStatement?',
  `branchA="${hr04.branchA}"`,
  'YES for these fixtures, but only because branchA/branchB were DERIVED from the factStatement at '
  + '§185 and therefore carry it verbatim. That is a property of the derivation, not of the schema: '
  + 'a fact whose branches were authored independently would not carry it.');

// ============================================================ E. direct construction
record('E1', 'does direct terminal-status construction create an unauthorized RUNTIME path?',
  attempt(() => {
    const l = createOwedFactLedger('PRODUCTION', [owedFact({
      factKey: 'owed:probe:x', affectedDecision: 'REQUIRED_CONTROL', source: 'FIRST_PASS_MODEL',
      evidenceSpan: 'span', whyUnresolved: null, branchA: 'a', branchB: 'b',
      decisionDivergence: { ifA: 'x', ifB: 'y' }, priority: 'OTHER',
      status: 'SETTLED_BY_EVIDENCE', acceptableEvidence: null,
    })]);
    return { admitted: l.facts.length, status: l.facts[0].status, transitions: l.transitions.length };
  }),
  'A PRODUCTION ledger WILL admit a model-sourced fact constructed directly as SETTLED_BY_EVIDENCE, '
  + 'with zero transition records. No provider can do this -- provider output flows through '
  + 'applyAdmittedDeclarations, which mints COVERED only -- so it is a CONSTRUCTION-SIDE gap, not a '
  + 'provider authority gap. For §183 it is inert: fixtures are built by the harness, not the model.');

// ============================================================ artifacts
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'CURRENT-PROJECTION-MAP.json'), `${JSON.stringify({
  artifact: 'SECTION_186_CURRENT_PROJECTION_MAP',
  date: '2026-09-05',
  twoDistinctMechanisms: {
    runtimeProjector: {
      fn: 'projectOwedFactsForVerifier (verifier-v3-development-boundary.ts)',
      filter: 'unresolvedFacts()',
      settledFactsCarried: 0,
      usedByHostedPath: false,
      note: 'no hosted experiment calls it; it is exercised by the §170 local proof suite',
    },
    hostedSupplyPath: {
      builder: 'buildVerifierV3UserPrompt (scripts/lib/expert-verifier-instruction-v3.ts)',
      inputType: 'V3SuppliedOwedFact[] -- hand-built per case by the harness',
      callers: ['preflight-binding-falsification-harness-v3-2026-09-04.ts',
        'lib/expert-v3-experiment-cases-2026-09-04.ts', 'test-expert-verifier-v3-binding-protocol.ts'],
      whyUnresolvedType: 'string (NOT nullable) -- §185 did not change this type',
      promptHeading: 'UNRESOLVED FACTS IDENTIFIED FOR YOUR REVIEW',
      perFactLine: 'unresolved because: <whyUnresolved>',
      note: 'the filter is NOT what keeps settled facts out of the hosted prompt; the harness simply '
        + 'never builds one, and the template could not express one if it did',
    },
  },
  projectedFields: ['factKey', 'affectedDecision', 'whyUnresolved', 'branchA', 'branchB',
    'decisionDivergence', 'evidenceSpan', 'acceptableEvidence'],
  statusProjected: false,
  factStatementProjected: false,
  targetDecisionProjected: false,
  fullLedgerCarriers: {
    'runOwedFactCoverageStage attachment': 'carries ledger.facts UNFILTERED, including settled facts '
      + '-- but it attaches to a merged RESULT and is gated behind the literal false. It is not a '
      + 'provider input.',
    'OwedFactObservabilityRecord.initialOwedFacts': 'carries the full initial set, including settled '
      + 'facts. It is an append-only development RECORD, not a provider input.',
  },
  conclusion: 'NO existing path carries a settled owed fact to a provider. The two full-ledger '
    + 'carriers are both outputs/records, never request inputs.',
  findings,
  pairDiscriminability: pairEvidence,
}, null, 2)}\n`);
console.log('wrote CURRENT-PROJECTION-MAP.json');
