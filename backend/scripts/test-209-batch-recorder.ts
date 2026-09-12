/**
 * §209 -- BATCH VERDICT RECORDER SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Every assertion below runs against a THROWAWAY FIXTURE PACKET in a temporary directory. The
 * live 177-slot §209 packet is never read for mutation and never written: the suite asserts, at
 * the end, that the authoritative worksheet's sha256 is byte-identical to the value it recorded
 * before the first fixture was built, and that no ledger has appeared.
 *
 * What is proved here:
 *
 *    1  a valid multi-line batch dry-runs with zero writes
 *    2  a valid multi-line batch applies
 *    3  a malformed FINAL line causes zero writes from the entire batch
 *    4  an unknown slot causes zero writes
 *    5  a duplicate slot causes zero writes
 *    6  an invalid verdict causes zero writes
 *    7  a missing reason, where §209 requires one, causes zero writes
 *    8  an existing verdict cannot be silently overwritten
 *    9  PRODUCT_OWNER attribution is required and preserved
 *   10  reasons are stored exactly as authored
 *   11  a batch produces the same records as sequential use of record-209-verdict.ts
 *   12  no semantic recommendation/inference field exists in the format or the output
 *   13  a dry run is mutation-free across the whole packet directory
 *   14  gates are not computed merely because a batch was recorded
 *   15  no provider-call path is reachable from the batch recorder
 *   16  single-verdict behaviour is unchanged by the boundary extraction
 */

import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let passed = 0;
let failed = 0;
const ok = (id: string, condition: boolean, detail = ''): void => {
  if (condition) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
};
const section = (t: string): void => console.log(`\n---------------- ${t}`);

const BACKEND = join(__dirname, '..');
const REPO = join(BACKEND, '..');
const TS_NODE = join(BACKEND, 'node_modules', '.bin', 'ts-node');
const BATCH = join(BACKEND, 'scripts', 'record-209-batch.ts');
const SINGLE = join(BACKEND, 'scripts', 'record-209-verdict.ts');
const LIVE_PACKET = join(REPO, 'verification',
  'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');
const LIVE_WORKSHEET = join(LIVE_PACKET, 'ADJUDICATION-WORKSHEET-209.json');
const LIVE_LEDGER = join(LIVE_PACKET, 'VERDICT-LEDGER-209.jsonl');

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

/**
 * The live packet's identity BEFORE this suite does anything at all.
 *
 * These assertions originally read "the packet is still empty", which was true when §209 had zero
 * verdicts. The packet has since been adjudicated to 177/177 by authorized product-owner batches,
 * so emptiness is no longer the invariant and asserting it would fail for the wrong reason. What
 * the suite always needed to prove is INVARIANCE ACROSS ITS OWN RUN: whatever the packet held when
 * the suite started, it holds when the suite finishes. That is strictly stronger than the original
 * check, because it now covers the ledger and the receipts as well as the worksheet.
 */
const liveWorksheetShaAtStart = sha256(readFileSync(LIVE_WORKSHEET));
const liveLedgerShaAtStart = existsSync(LIVE_LEDGER)
  ? sha256(readFileSync(LIVE_LEDGER)) : 'ABSENT';
const liveReceiptsAtStart = readdirSync(LIVE_PACKET)
  .filter(f => f.startsWith('BATCH-RECEIPT-209-')).sort().join(',');
const liveVerdictCountAtStart = (JSON.parse(readFileSync(LIVE_WORKSHEET, 'utf8'))
  .slots as any[]).filter(s => typeof s.verdict === 'string' && s.verdict.length > 0).length;

// ================================================================ fixtures

const STD = ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'];
const ALT = ['ORDINARY_NON_ESCALATING', 'SAFETY_SIGNIFICANT', 'PLAUSIBLY_LIFE_CRITICAL',
  'INDETERMINATE'];

const blankSlot = (slotId: string, caseId: string, axisId: string, vocab: string[],
  structural: string | null): Record<string, unknown> => ({
  slotId,
  kind: 'ROW_AXIS',
  caseId,
  factOrdinal: null,
  factKey: null,
  axisId,
  axisName: 'FIXTURE_AXIS',
  question: 'fixture',
  allowedVocabulary: vocab,
  contributesToGates: ['GF1'],
  structuralNotExercised: structural,
  fidelityDisclosure: null,
  pairingNote: null,
  verdict: null,
  attribution: null,
  recordedAt: null,
  recordedInBatch: null,
  revisionOf: null,
  reason: null,
});

const fixtureWorksheet = (): Record<string, unknown> => {
  const slots = [
    blankSlot('FX-01.ROW.A', 'FX-01', 'A', STD, null),
    blankSlot('FX-01.ROW.B', 'FX-01', 'B', STD, null),
    blankSlot('FX-02.FACT1.C', 'FX-02', 'C', STD,
      'the row declared zero facts, so this fact axis had no opportunity to be exercised'),
    blankSlot('FX-03.FACT1.R_SAFETY', 'FX-03', 'R_SAFETY', ALT, null),
    blankSlot('FX-04.ROW.A', 'FX-04', 'A', STD, null),
    blankSlot('FX-05.ROW.A', 'FX-05', 'A', STD, null),
  ];
  // FX-04 is pre-populated so the no-overwrite rule has something real to refuse.
  (slots[4] as any).verdict = 'CORRECT';
  (slots[4] as any).attribution = 'PRODUCT_OWNER';
  (slots[4] as any).recordedAt = '2026-09-08T00:00:00.000Z';
  (slots[4] as any).recordedInBatch = 'FIXTURE-SEED';
  (slots[4] as any).reason = 'seeded by the fixture so no-overwrite can be exercised';
  return {
    artifact: 'SECTION_209_ADJUDICATION_WORKSHEET_FIXTURE',
    status: 'OPEN — 1 of 6 slots carry a PRODUCT_OWNER verdict',
    preregistrationIdentity: 'fixture0000000000000000000000000000000000000000000000000000000000',
    attributionRequired: 'PRODUCT_OWNER',
    verdictVocabulary: STD,
    slotCount: 6,
    slotsWithNoOpportunity: 1,
    suppliedVerdictCount: 1,
    slots,
    generatedAt: '2026-09-08T00:00:00.000Z',
  };
};

let fixtureSeq = 0;
const ROOT = mkdtempSync(join(tmpdir(), 'insite-209-batch-'));
const newPacket = (): string => {
  fixtureSeq += 1;
  const dir = join(ROOT, `packet-${fixtureSeq}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'ADJUDICATION-WORKSHEET-209.json'),
    `${JSON.stringify(fixtureWorksheet(), null, 2)}\n`);
  writeFileSync(join(dir, 'GATE-RESULTS-209.json'),
    `${JSON.stringify({ artifact: 'FIXTURE_GATES', gates: {} }, null, 2)}\n`);
  return dir;
};

const writeBatchFile = (name: string, content: string): string => {
  const p = join(ROOT, name);
  writeFileSync(p, content);
  return p;
};

interface Run { status: number; stdout: string; stderr: string }
const run = (script: string, args: string[]): Run => {
  const r = spawnSync(TS_NODE, ['-T', script, ...args], { cwd: BACKEND, encoding: 'utf8' });
  return { status: r.status ?? -1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
};
const batch = (dir: string, fileArg: string, extra: string[] = []): Run =>
  run(BATCH, [`--file=${fileArg}`, '--attribution=PRODUCT_OWNER', '--batch=FX-BATCH-1',
    `--packet-dir=${dir}`, ...extra]);

const snapshot = (dir: string): string => {
  const entries = readdirSync(dir).sort();
  return entries.map(e => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? `${e}/DIR` : `${e}:${sha256(readFileSync(p))}`;
  }).join('\n');
};

const worksheetOf = (dir: string): any =>
  JSON.parse(readFileSync(join(dir, 'ADJUDICATION-WORKSHEET-209.json'), 'utf8'));
const ledgerOf = (dir: string): any[] => {
  const p = join(dir, 'VERDICT-LEDGER-209.jsonl');
  return existsSync(p)
    ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
};
const receiptsOf = (dir: string): string[] =>
  readdirSync(dir).filter(f => f.startsWith('BATCH-RECEIPT-209-'));

/** The reasons below are fixture text authored by this suite for its own six fixture slots. */
const VALID_BATCH = [
  '# a product-owner-authored fixture file',
  '',
  'FX-01.ROW.A | CORRECT | the declared set matched the frozen expectation for this fixture row',
  'FX-01.ROW.B  |  PARTIALLY_CORRECT  |  one element was short of the frozen expectation | note',
  'FX-02.FACT1.C | NOT_EXERCISED | the fixture row declared zero facts so nothing could be scored',
  'FX-03.FACT1.R_SAFETY | SAFETY_SIGNIFICANT | fixture classification supplied by the author',
  'FX-05.ROW.A | AMBIGUOUS |',
  '',
].join('\n');

// ================================================================ 1 & 13. dry run

section('1 + 13. DRY RUN IS COMPLETE AND MUTATION-FREE');

const p1 = newPacket();
const f1 = writeBatchFile('valid.txt', VALID_BATCH);
const before1 = snapshot(p1);
const dry = batch(p1, f1, ['--dry-run']);
const after1 = snapshot(p1);

ok('DRY.exit-zero', dry.status === 0, `status ${dry.status}`);
ok('DRY.parsed-every-judgment', /parsed judgments\s+:\s*5/.test(dry.stdout));
ok('DRY.counted-comment-and-blank-lines',
  /comment lines\s+:\s*1/.test(dry.stdout) && /blank lines\s+:\s*1/.test(dry.stdout));
ok('DRY.reports-what-it-would-write', /verdicts this batch would write\s+:\s*5/.test(dry.stdout));
ok('DRY.reports-zero-written', /verdicts written\s+:\s*0/.test(dry.stdout));
ok('DRY.lists-skipped-lines-so-none-vanish-quietly',
  dry.stdout.includes('SKIPPED, NOT RECORDED'));
ok('DRY.no-ledger-created', !existsSync(join(p1, 'VERDICT-LEDGER-209.jsonl')));
ok('DRY.no-receipt-written', receiptsOf(p1).length === 0);
ok('DRY.packet-directory-byte-identical', before1 === after1);
ok('DRY.supplied-count-unchanged', worksheetOf(p1).suppliedVerdictCount === 1);
ok('DRY.declares-zero-provider-calls', dry.stdout.includes('provider calls: 0'));

// ================================================================ 2, 9, 10. apply

section('2 + 9 + 10. A VALID BATCH APPLIES, ATTRIBUTED AND VERBATIM');

const p2 = newPacket();
const applied = batch(p2, f1);
const ws2 = worksheetOf(p2);
const led2 = ledgerOf(p2);

ok('APPLY.exit-zero', applied.status === 0, `status ${applied.status} ${applied.stderr.slice(0, 200)}`);
ok('APPLY.five-ledger-entries', led2.length === 5, `${led2.length} entries`);
ok('APPLY.supplied-count-is-one-plus-five', ws2.suppliedVerdictCount === 6);
ok('APPLY.status-recomputed', ws2.status === 'ALL SLOTS CARRY A PRODUCT_OWNER VERDICT', ws2.status);
ok('APPLY.receipt-written', receiptsOf(p2).length === 1, receiptsOf(p2).join(','));

const slotById = (w: any, id: string): any => w.slots.find((s: any) => s.slotId === id);
ok('ATTRIB.every-slot-product-owner',
  ws2.slots.every((s: any) => s.verdict === null || s.attribution === 'PRODUCT_OWNER'));
ok('ATTRIB.every-ledger-entry-product-owner',
  led2.every(e => e.attribution === 'PRODUCT_OWNER'));
ok('ATTRIB.non-product-owner-is-refused', (() => {
  const p = newPacket();
  const r = run(BATCH, [`--file=${f1}`, '--attribution=AGENT', '--batch=FX-BATCH-1',
    `--packet-dir=${p}`]);
  return r.status !== 0 && r.stderr.includes('ATTRIBUTION_MUST_BE_PRODUCT_OWNER')
    && ledgerOf(p).length === 0 && worksheetOf(p).suppliedVerdictCount === 1;
})());

ok('VERBATIM.reason-preserved-exactly',
  slotById(ws2, 'FX-01.ROW.A').reason
    === 'the declared set matched the frozen expectation for this fixture row');
ok('VERBATIM.pipes-inside-a-reason-stay-in-the-reason',
  slotById(ws2, 'FX-01.ROW.B').reason
    === 'one element was short of the frozen expectation | note',
  String(slotById(ws2, 'FX-01.ROW.B').reason));
ok('VERBATIM.empty-reason-records-null-not-invented-text',
  slotById(ws2, 'FX-05.ROW.A').reason === null);
ok('VERBATIM.verdict-not-normalised-or-reinterpreted',
  slotById(ws2, 'FX-05.ROW.A').verdict === 'AMBIGUOUS'
  && slotById(ws2, 'FX-02.FACT1.C').verdict === 'NOT_EXERCISED'
  && slotById(ws2, 'FX-03.FACT1.R_SAFETY').verdict === 'SAFETY_SIGNIFICANT',
  'AMBIGUOUS and NOT_EXERCISED are not promoted to anything else');
ok('VERBATIM.receipt-keeps-the-untrimmed-authored-reason', (() => {
  const rec = JSON.parse(readFileSync(join(p2, receiptsOf(p2)[0]), 'utf8'));
  const j = rec.judgments.find((x: any) => x.slotId === 'FX-01.ROW.B');
  return j.reasonAsAuthoredUntrimmed === '  one element was short of the frozen expectation | note';
})());
ok('IDENTITY.receipt-pins-the-input-file', (() => {
  const rec = JSON.parse(readFileSync(join(p2, receiptsOf(p2)[0]), 'utf8'));
  return rec.input.sha256 === sha256(readFileSync(f1))
    && rec.input.physicalLineCount === 7
    && rec.input.parsedJudgmentCount === 5
    && rec.input.skippedLines.length === 2
    && rec.preregistrationIdentity === ws2.preregistrationIdentity
    && rec.ledger.appendedEntryCount === 5;
})());

// ================================================================ 3-8. atomicity

section('3-8. EVERY REFUSAL CLASS WRITES ZERO VERDICTS');

const rejects = (id: string, content: string, expectedCode: string): void => {
  const dir = newPacket();
  const f = writeBatchFile(`${id}.txt`, content);
  const before = snapshot(dir);
  const r = batch(dir, f);
  const after = snapshot(dir);
  ok(`${id}.exit-nonzero`, r.status !== 0, `status ${r.status}`);
  ok(`${id}.names-${expectedCode}`, r.stderr.includes(expectedCode),
    r.stderr.split('\n').filter(l => l.trim().length > 0).slice(0, 3).join(' / '));
  ok(`${id}.zero-ledger-entries`, ledgerOf(dir).length === 0);
  ok(`${id}.no-receipt`, receiptsOf(dir).length === 0);
  ok(`${id}.packet-byte-identical`, before === after);
};

// 3 -- the four leading lines are individually valid; only the LAST line is malformed.
rejects('MALFORMED_FINAL_LINE', [
  'FX-01.ROW.A | CORRECT | a valid first judgment authored by the product owner',
  'FX-01.ROW.B | CORRECT | a valid second judgment authored by the product owner',
  'FX-05.ROW.A | CORRECT | a valid third judgment authored by the product owner',
  'FX-02.FACT1.C NOT_EXERCISED no delimiters at all',
].join('\n'), 'MALFORMED_DELIMITER_STRUCTURE');

// 4
rejects('UNKNOWN_SLOT', [
  'FX-01.ROW.A | CORRECT | a valid judgment authored by the product owner',
  'FX-99.ROW.Z | CORRECT | this slot is not in the instrument',
].join('\n'), 'UNKNOWN_SLOT');

// 5
rejects('DUPLICATE_SLOT', [
  'FX-01.ROW.A | CORRECT | the first judgment for this slot',
  'FX-01.ROW.B | CORRECT | an unrelated valid judgment',
  'FX-01.ROW.A | INCORRECT | a second, conflicting judgment for the same slot',
].join('\n'), 'DUPLICATE_SLOT_IN_BATCH');

// 6
rejects('INVALID_VERDICT', [
  'FX-01.ROW.A | CORRECT | a valid judgment authored by the product owner',
  'FX-01.ROW.B | MOSTLY_FINE | not a member of this slot vocabulary',
].join('\n'), 'VALUE_NOT_IN_ALLOWED_VOCABULARY');

// 6b -- per-slot vocabulary, not a single global one
rejects('WRONG_VOCABULARY_FOR_SLOT', [
  'FX-03.FACT1.R_SAFETY | CORRECT | CORRECT is valid elsewhere but not on this axis',
].join('\n'), 'VALUE_NOT_IN_ALLOWED_VOCABULARY');

// 7
rejects('MISSING_REQUIRED_REASON', [
  'FX-01.ROW.A | CORRECT | a valid judgment authored by the product owner',
  'FX-02.FACT1.C | NOT_EXERCISED |',
].join('\n'), 'NOT_EXERCISED_REQUIRES_A_REASON');

// 7b
rejects('EMPTY_VERDICT_FIELD', [
  'FX-01.ROW.A |  | the verdict field is empty',
].join('\n'), 'EMPTY_VERDICT_FIELD');

// 8
rejects('NO_SILENT_OVERWRITE', [
  'FX-01.ROW.A | CORRECT | a valid judgment authored by the product owner',
  'FX-04.ROW.A | INCORRECT | an attempt to overwrite a recorded product-owner judgment',
].join('\n'), 'SLOT_ALREADY_CARRIES_A_VERDICT');

// 8b -- even an identical value is refused; the batch has no revision mode at all
rejects('NO_OVERWRITE_EVEN_WITH_SAME_VALUE', [
  'FX-04.ROW.A | CORRECT | the same value the slot already carries',
].join('\n'), 'SLOT_ALREADY_CARRIES_A_VERDICT');

// frozen no-opportunity slot
rejects('NO_OPPORTUNITY_SLOT', [
  'FX-02.FACT1.C | CORRECT | scoring a slot frozen as having had no opportunity',
].join('\n'), 'NO_OPPORTUNITY_SLOT_TAKES_ONLY_NOT_EXERCISED');

// encoding
{
  const dir = newPacket();
  const f = join(ROOT, 'bad-encoding.txt');
  writeFileSync(f, Buffer.concat([
    Buffer.from('FX-01.ROW.A | CORRECT | reason with a bad byte '), Buffer.from([0xff, 0xfe]),
    Buffer.from('\n')]));
  const r = batch(dir, f);
  ok('MALFORMED_ENCODING.refused',
    r.status !== 0 && r.stderr.includes('BATCH_FILE_MALFORMED_ENCODING'));
  ok('MALFORMED_ENCODING.zero-writes', ledgerOf(dir).length === 0);
}

// every refusal in the file is reported, not just the first
{
  const dir = newPacket();
  const f = writeBatchFile('many-refusals.txt', [
    'FX-99.ROW.Z | CORRECT | unknown slot',
    'FX-01.ROW.B | MOSTLY_FINE | invalid verdict',
    'FX-02.FACT1.C | NOT_EXERCISED |',
  ].join('\n'));
  const r = batch(dir, f);
  ok('REPORT.all-refusals-reported-at-once',
    r.stderr.includes('UNKNOWN_SLOT') && r.stderr.includes('VALUE_NOT_IN_ALLOWED_VOCABULARY')
    && r.stderr.includes('NOT_EXERCISED_REQUIRES_A_REASON') && /3 refusal\(s\)/.test(r.stderr));
  ok('REPORT.zero-writes', ledgerOf(dir).length === 0);
}

// an empty / all-comment file is refused rather than reported as a success
{
  const dir = newPacket();
  const f = writeBatchFile('all-comments.txt', '# nothing but a header\n\n');
  const r = batch(dir, f);
  ok('NO_JUDGMENTS.refused', r.status !== 0 && r.stderr.includes('NO_JUDGMENTS_SUPPLIED'));
}

// a second batch may populate slots still open
{
  const dir = newPacket();
  const fa = writeBatchFile('first-half.txt',
    'FX-01.ROW.A | CORRECT | the first half of the adjudication\n');
  const fb = writeBatchFile('second-half.txt',
    'FX-01.ROW.B | INCORRECT | the second half of the adjudication\n');
  const ra = run(BATCH, [`--file=${fa}`, '--attribution=PRODUCT_OWNER', '--batch=FX-A',
    `--packet-dir=${dir}`]);
  const rb = run(BATCH, [`--file=${fb}`, '--attribution=PRODUCT_OWNER', '--batch=FX-B',
    `--packet-dir=${dir}`]);
  const led = ledgerOf(dir);
  ok('APPEND_ONLY.second-batch-fills-still-open-slots',
    ra.status === 0 && rb.status === 0 && led.length === 2
    && led[0].batch === 'FX-A' && led[1].batch === 'FX-B'
    && worksheetOf(dir).suppliedVerdictCount === 3);
  ok('APPEND_ONLY.two-receipts-retained', receiptsOf(dir).length === 2);
}

// the batch recorder refuses --revision outright
{
  const dir = newPacket();
  const r = run(BATCH, [`--file=${f1}`, '--attribution=PRODUCT_OWNER', '--batch=FX-R',
    `--packet-dir=${dir}`, '--revision']);
  ok('NO_REVISION_MODE.refused',
    r.status !== 0 && r.stderr.includes('BATCH_RECORDER_HAS_NO_REVISION_MODE')
    && ledgerOf(dir).length === 0);
}

// ================================================================ 11. equivalence

section('11. A BATCH PRODUCES THE SAME RECORDS AS SEQUENTIAL USE OF record-209-verdict.ts');

const EQ_LINES = [
  { slot: 'FX-01.ROW.A', verdict: 'CORRECT', reason: 'the frozen expectation was met on this row' },
  { slot: 'FX-01.ROW.B', verdict: 'AMBIGUOUS', reason: 'the evidence supports two readings' },
  { slot: 'FX-05.ROW.A', verdict: 'NOT_EXERCISED', reason: 'the opportunity did not materialise' },
];

const pBatch = newPacket();
const fEq = writeBatchFile('equivalence.txt',
  `${EQ_LINES.map(l => `${l.slot} | ${l.verdict} | ${l.reason}`).join('\n')}\n`);
const rBatch = run(BATCH, [`--file=${fEq}`, '--attribution=PRODUCT_OWNER', '--batch=EQ',
  `--packet-dir=${pBatch}`]);

const pSeq = newPacket();
let seqOk = true;
for (const l of EQ_LINES) {
  const r = run(SINGLE, [`--slot=${l.slot}`, `--verdict=${l.verdict}`,
    '--attribution=PRODUCT_OWNER', '--batch=EQ', `--reason=${l.reason}`,
    `--packet-dir=${pSeq}`]);
  if (r.status !== 0) { seqOk = false; console.log(`      sequential run failed: ${r.stderr}`); }
}

const stripTime = (v: any): any => JSON.parse(JSON.stringify(v),
  (k, val) => (k === 'recordedAt' || k === 'generatedAt' ? '<TIME>' : val));

ok('EQUIV.both-paths-succeeded', rBatch.status === 0 && seqOk);
ok('EQUIV.worksheets-identical-modulo-timestamps',
  JSON.stringify(stripTime(worksheetOf(pBatch))) === JSON.stringify(stripTime(worksheetOf(pSeq))));
ok('EQUIV.ledger-entries-identical-modulo-timestamps',
  JSON.stringify(stripTime(ledgerOf(pBatch))) === JSON.stringify(stripTime(ledgerOf(pSeq))));
ok('EQUIV.ledger-entry-key-set-is-unchanged', (() => {
  const keys = Object.keys(ledgerOf(pBatch)[0]).sort().join(',');
  return keys === ['slotId', 'caseId', 'axisId', 'factKey', 'verdict', 'attribution', 'batch',
    'reason', 'revisionOf', 'recordedAt', 'preregistrationIdentity'].sort().join(',');
})(), Object.keys(ledgerOf(pBatch)[0]).join(','));

// ================================================================ 16. single-verdict behaviour

section('16. SINGLE-VERDICT REFUSAL SEMANTICS SURVIVED THE EXTRACTION');

const single = (dir: string, args: string[]): Run =>
  run(SINGLE, [...args, `--packet-dir=${dir}`]);

{
  const d = newPacket();
  const noArgs = run(SINGLE, [`--packet-dir=${d}`]);
  ok('SINGLE.usage-when-arguments-absent',
    noArgs.status === 1 && noArgs.stderr.includes('§209 usage:')
    && noArgs.stderr.includes('THIS SCRIPT DERIVES NOTHING.'));

  // The `detail` strings below are transcribed from record-209-verdict.ts AS IT STOOD BEFORE the
  // refusal ladder was lifted into lib/section-209-recording-boundary.ts. Asserting the whole of
  // stderr, byte for byte, is what makes "the extraction preserved behaviour" a measurement rather
  // than a claim: a reworded refusal is as much a behaviour change as a missing one.
  const cases: [string, string[], string, string][] = [
    ['unknown-slot', ['--slot=FX-99.ROW.Z', '--verdict=CORRECT', '--attribution=PRODUCT_OWNER',
      '--batch=B'], 'UNKNOWN_SLOT',
    'FX-99.ROW.Z is not a slot in the frozen §209 instrument'],
    ['attribution', ['--slot=FX-01.ROW.A', '--verdict=CORRECT', '--attribution=AGENT',
      '--batch=B'], 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER',
    'attribution "AGENT" was supplied. Only a product owner may author a verdict; no agent, '
      + 'scorer, heuristic, language model or code path may.'],
    ['vocabulary', ['--slot=FX-01.ROW.A', '--verdict=NOPE', '--attribution=PRODUCT_OWNER',
      '--batch=B'], 'VALUE_NOT_IN_ALLOWED_VOCABULARY',
    '"NOPE" is not permitted on FX-01.ROW.A. Permitted: CORRECT, PARTIALLY_CORRECT, INCORRECT, '
      + 'AMBIGUOUS, NOT_EXERCISED'],
    ['not-exercised-reason', ['--slot=FX-01.ROW.A', '--verdict=NOT_EXERCISED',
      '--attribution=PRODUCT_OWNER', '--batch=B'], 'NOT_EXERCISED_REQUIRES_A_REASON',
    'NOT_EXERCISED is permitted only where the design targeted an axis and the opportunity did not '
      + 'materialise, and it must carry a recorded reason naming what did not materialise. A '
      + 'vacuous CORRECT is forbidden and so is an unexplained NOT_EXERCISED.'],
    ['no-opportunity', ['--slot=FX-02.FACT1.C', '--verdict=CORRECT',
      '--attribution=PRODUCT_OWNER', '--batch=B'], 'NO_OPPORTUNITY_SLOT_TAKES_ONLY_NOT_EXERCISED',
    'FX-02.FACT1.C was frozen as having no opportunity before adjudication began. Its frozen '
      + 'reason is: the row declared zero facts, so this fact axis had no opportunity to be '
      + 'exercised'],
    ['conflicting-revision', ['--slot=FX-04.ROW.A', '--verdict=INCORRECT',
      '--attribution=PRODUCT_OWNER', '--batch=B'], 'CONFLICTING_REVISION_REQUIRES_EXPLICIT_FLAG',
    'FX-04.ROW.A already carries "CORRECT" and "INCORRECT" was supplied. Pass --revision with a '
      + '--reason to record a revision; both values are retained in the ledger.'],
    ['revision-reason', ['--slot=FX-04.ROW.A', '--verdict=INCORRECT',
      '--attribution=PRODUCT_OWNER', '--batch=B', '--revision'], 'REVISION_REQUIRES_A_REASON',
    'a revision must carry a recorded reason, and the reason must not be the gate outcome.'],
  ];
  for (const [id, args, code, detail] of cases) {
    const dd = newPacket();
    const r = single(dd, args);
    const expected = `§209 REFUSED: ${code}\n  ${detail}\n  NOTHING WAS WRITTEN.\n`;
    ok(`SINGLE.refuses-${id}`,
      r.status === 1 && r.stderr === expected && ledgerOf(dd).length === 0,
      r.stderr === expected ? code : `stderr diverged: ${JSON.stringify(r.stderr)}`);
  }

  // The batch recorder relays those same strings, unedited, under the line that produced them.
  ok('SINGLE.batch-relays-the-identical-refusal-text', (() => {
    const dd = newPacket();
    const f = writeBatchFile('relay.txt', 'FX-01.ROW.A | NOPE | a reason\n');
    const r = batch(dd, f);
    return r.stderr.includes('"NOPE" is not permitted on FX-01.ROW.A. Permitted: CORRECT, '
      + 'PARTIALLY_CORRECT, INCORRECT, AMBIGUOUS, NOT_EXERCISED');
  })());

  const dRev = newPacket();
  const rev = single(dRev, ['--slot=FX-04.ROW.A', '--verdict=INCORRECT',
    '--attribution=PRODUCT_OWNER', '--batch=B', '--revision',
    '--reason=the product owner revised this judgment on review']);
  const revLedger = ledgerOf(dRev);
  ok('SINGLE.revision-still-works-and-retains-the-replaced-value',
    rev.status === 0 && revLedger.length === 1 && revLedger[0].revisionOf === 'CORRECT'
    && rev.stdout.includes('revision of "CORRECT"'));
  ok('SINGLE.records-and-reports-the-count',
    rev.stdout.includes('§209 RECORDED  FX-04.ROW.A  INCORRECT  PRODUCT_OWNER  batch=B')
    && rev.stdout.includes('1 of 6 slots now carry a verdict')
    && rev.stdout.includes('provider calls: 0   database operations: 0'));
}

// ================================================================ 12. no semantic fields

section('12. NO RECOMMENDATION OR INFERENCE FIELD EXISTS IN THE FORMAT OR THE OUTPUT');

const SEMANTIC_KEY = /suggest|recommend|infer|predict|confidence|probab|likelihood|score|proposed|derived|autofill|prefill/i;
const collectKeys = (v: unknown, into: string[]): void => {
  if (Array.isArray(v)) { for (const x of v) collectKeys(x, into); return; }
  if (v !== null && typeof v === 'object') {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      into.push(k); collectKeys(val, into);
    }
  }
};
{
  const receiptKeys: string[] = [];
  collectKeys(JSON.parse(readFileSync(join(p2, receiptsOf(p2)[0]), 'utf8')), receiptKeys);
  const ledgerKeys: string[] = [];
  collectKeys(led2, ledgerKeys);
  const wsKeys: string[] = [];
  collectKeys(ws2, wsKeys);
  ok('NO_SEMANTICS.receipt-has-no-recommendation-key',
    !receiptKeys.some(k => SEMANTIC_KEY.test(k)),
    receiptKeys.filter(k => SEMANTIC_KEY.test(k)).join(','));
  ok('NO_SEMANTICS.ledger-has-no-recommendation-key',
    !ledgerKeys.some(k => SEMANTIC_KEY.test(k)));
  ok('NO_SEMANTICS.worksheet-gained-no-recommendation-key',
    !wsKeys.some(k => SEMANTIC_KEY.test(k)));
  ok('NO_SEMANTICS.grammar-has-exactly-three-fields', (() => {
    // a fourth `|` is reason text, never a fourth field the recorder could read a hint from
    const d = newPacket();
    const f = writeBatchFile('four-fields.txt',
      'FX-01.ROW.A | CORRECT | a reason | CONFIDENCE=high\n');
    const r = run(BATCH, [`--file=${f}`, '--attribution=PRODUCT_OWNER', '--batch=F4',
      `--packet-dir=${d}`]);
    return r.status === 0
      && slotById(worksheetOf(d), 'FX-01.ROW.A').reason === 'a reason | CONFIDENCE=high';
  })());
}

// ================================================================ 14. gates untouched

section('14. RECORDING A BATCH DOES NOT COMPUTE A GATE');

{
  const gateShaBefore = sha256(readFileSync(join(p2, 'GATE-RESULTS-209.json')));
  ok('GATES.results-file-untouched-by-the-apply',
    gateShaBefore === sha256(readFileSync(join(p2, 'GATE-RESULTS-209.json'))));
  ok('GATES.no-completeness-check-was-produced',
    !existsSync(join(p2, 'COMPLETENESS-CHECK-209.json')),
    'the batch does not run the completeness check or the gate computation on its own');
  ok('GATES.apply-output-says-so', applied.stdout.includes('gates were NOT computed'));
  ok('GATES.receipt-records-it', (() => {
    const rec = JSON.parse(readFileSync(join(p2, receiptsOf(p2)[0]), 'utf8'));
    return rec.gateComputationPerformed === false;
  })());
}

// ================================================================ 15. no provider path

section('15. NO PROVIDER-CALL PATH IS REACHABLE FROM THE BATCH RECORDER');

const ALLOWED_BUILTINS = new Set(['fs', 'path', 'crypto', 'util', 'os']);
const IMPORT_RE = /(?:from\s*|require\(\s*)['"]([^'"]+)['"]/g;
const NETWORK_RE = /anthropic|openai|@ai-sdk|axios|node-fetch|undici|\bfetch\s*\(|https?:\/\/|child_process|websocket|\bnet\b|dgram|http2/i;

const closure = new Map<string, string>();
const externals = new Set<string>();
const walk = (fileAbs: string): void => {
  if (closure.has(fileAbs)) return;
  const src = readFileSync(fileAbs, 'utf8');
  closure.set(fileAbs, src);
  for (const m of src.matchAll(IMPORT_RE)) {
    const spec = m[1];
    if (!spec.startsWith('.')) { externals.add(spec); continue; }
    const base = join(fileAbs, '..', spec);
    const candidate = [`${base}.ts`, join(base, 'index.ts')].find(c => existsSync(c));
    if (candidate === undefined) { externals.add(`UNRESOLVED:${spec}`); continue; }
    walk(candidate);
  }
};
walk(BATCH);

/** Comments explain what the recorder refuses to do; only executable text is scanned. */
const stripComments = (s: string): string =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !/^\s*\*/.test(l))
    .map(l => l.replace(/(^|\s)\/\/.*$/, '')).join('\n');

ok('CLOSURE.is-two-files', closure.size === 2, [...closure.keys()].map(k => k.split('/').pop()).join(', '));
ok('CLOSURE.imports-only-node-builtins',
  [...externals].every(e => ALLOWED_BUILTINS.has(e)), [...externals].join(', '));
ok('CLOSURE.reaches-nothing-under-src',
  ![...closure.keys()].some(k => k.includes(`${join(BACKEND, 'src')}`)));
ok('CLOSURE.no-network-or-sdk-reference-in-executable-code', (() => {
  const hits: string[] = [];
  for (const [f, src] of closure) {
    const code = stripComments(src);
    const m = code.match(NETWORK_RE);
    if (m !== null) hits.push(`${f.split('/').pop()}:${m[0]}`);
  }
  if (hits.length > 0) console.log(`      ${hits.join(', ')}`);
  return hits.length === 0;
})());
ok('CLOSURE.no-environment-read-that-could-carry-a-key',
  ![...closure.values()].some(s => /process\.env/.test(stripComments(s))));
ok('CLOSURE.declares-zero-provider-calls-in-its-output',
  applied.stdout.includes('provider calls: 0   database operations: 0'));

// ================================================================ live packet untouched

section('AUTHORITATIVE §209 PACKET WAS NEVER TOUCHED');

ok('LIVE.worksheet-sha256-unchanged',
  sha256(readFileSync(LIVE_WORKSHEET)) === liveWorksheetShaAtStart, liveWorksheetShaAtStart);
ok('LIVE.verdict-ledger-unchanged',
  (existsSync(LIVE_LEDGER) ? sha256(readFileSync(LIVE_LEDGER)) : 'ABSENT') === liveLedgerShaAtStart,
  liveLedgerShaAtStart === 'ABSENT' ? 'still absent' : 'byte-identical');
ok('LIVE.batch-receipts-unchanged',
  receiptsOf(LIVE_PACKET).sort().join(',') === liveReceiptsAtStart,
  `${receiptsOf(LIVE_PACKET).length} receipt(s), none added or removed by this suite`);
ok('LIVE.product-owner-verdict-count-unchanged',
  (JSON.parse(readFileSync(LIVE_WORKSHEET, 'utf8')).slots as any[])
    .filter(s => typeof s.verdict === 'string' && s.verdict.length > 0).length
  === liveVerdictCountAtStart,
  `${liveVerdictCountAtStart} verdict(s) before and after`);

// ================================================================

console.log('');
console.log(`  fixtures: ${ROOT}`);
console.log(`\n================ §209 BATCH RECORDER SUITE: ${passed} passed, ${failed} failed`);
console.log('  provider calls: 0   database operations: 0');
process.exit(failed === 0 ? 0 : 1);
