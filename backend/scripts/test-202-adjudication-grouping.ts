/**
 * §202 -- ADJUDICATION GROUPING AND VERDICT-RECORDING PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO SEMANTIC SELF-GRADING.
 *
 * Every case is written against the REAL frozen §199/§200 evidence rather than a fixture, because a
 * fixture proves the code agrees with the code's author and the §200 worksheet is the thing that
 * actually has to be adjudicated.
 *
 * THE DECISIVE SECTIONS ARE C AND D. C proves the frozen 152/24/128 split is REPRODUCED — derived
 * independently from the §200 worksheet's own fields and then checked against §200's own completeness
 * block, so a divergence surfaces as a failure rather than as a quietly different number. D proves
 * that no verdict can enter the worksheet except from the product owner, that the 24 structural slots
 * cannot be written at all, that a value outside a slot's vocabulary is refused rather than coerced,
 * and that a supplied string is stored byte for byte.
 *
 * WHAT THIS SUITE DOES NOT DO. It supplies no semantic verdict about any §199 model output, judges
 * no §200 axis, and asserts nothing about whether any declaration, projection or verifier verdict is
 * right. Section G asserts the ABSENCE of any such judgement in the §202 sources themselves.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import {
  FROZEN_SLOT_SPLIT, PRODUCT_OWNER_ATTRIBUTION, Q_LOSS_SCALE,
  R_FLOOR_IMPACT_SCALE_SECTION_202_PROPOSED, R_SAFETY_CLASSIFICATION_SCALE,
  SECTION_199_DIR, SECTION_200_DIR, SECTION_202_DIR, SECTION_202_GROUPING_VERSION,
  SECTION_202_OUTPUT_FILES, VERDICT_VOCABULARY, VOCABULARY_SOURCE,
  ADDITIVE_FIELDS,
  buildReviewUnitsAndSlots, buildSection202, buildWorksheet202, loadFrozenEvidence, orderRowIds,
  recordAdditive, recordVerdict, renderPresentationPacket, resolveSection202Path,
  type VerdictSlot, type Worksheet202,
} from './lib/expert-202-adjudication-grouping';

const ROOT = join(__dirname, '..', '..');
const V200 = join(ROOT, 'verification', SECTION_200_DIR);
const V199 = join(ROOT, 'verification', SECTION_199_DIR);

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------- shared build

const evidence = loadFrozenEvidence(ROOT);
const ws200 = evidence.worksheet200;
const built = buildReviewUnitsAndSlots(evidence);
const worksheet = buildWorksheet202(evidence, built);
const slotById = new Map<string, VerdictSlot>(worksheet.slots.map(s => [s.slotId, s]));

const freshWorksheet = (): Worksheet202 =>
  buildWorksheet202(evidence, buildReviewUnitsAndSlots(evidence));

// =================================================================== A. the frozen sources

console.log('\n--- A. the frozen §195–§201 sources are present and unmodified ---\n');

ok('A1. the §200 worksheet is readable and is the file this module was written against',
  evidence.worksheet200Sha256
    === '07dbb1707fa7bca43438ad2e7daade8c53d39acf0af9ea10513b1b37af9900f2',
  evidence.worksheet200Sha256);

ok('A2. the §200 session document is unmodified',
  evidence.session200Sha256
    === 'ea70f67c2e297114f711ab1796550e1c00855ddeef1fa109bb809a2fa3e31278',
  evidence.session200Sha256);

ok('A3. the §199 raw first-pass log is unmodified',
  evidence.firstPass199Sha256
    === 'eafc0f2e2d4385c43f3c6a8fad480075a6d9e867a5b31f2efaa0d7a9ff052204',
  evidence.firstPass199Sha256);

ok('A4. the §199 raw verifier log is unmodified',
  evidence.verifier199Sha256
    === '351d52c47d6be6d7ce6cf5998f18a644a982c2191ad697c24108913f4470684c',
  evidence.verifier199Sha256);

ok('A5. the §199 preregistration sha256 recorded in §200 matches the §199 file itself',
  sha(readFileSync(join(V199, 'PREREGISTRATION.json')))
    === String(ws200.section199PreregistrationSha256),
  String(ws200.section199PreregistrationSha256));

ok('A6. §200 is still PENDING_HUMAN_ADJUDICATION at 0 supplied',
  ws200.status === 'PENDING_HUMAN_ADJUDICATION' && ws200.completeness.verdictsSupplied === 0,
  `${ws200.status} / ${ws200.completeness.verdictsSupplied} supplied`);

// =================================================================== B. grouping determinism

console.log('\n--- B. grouping determinism ---\n');

const rebuiltA = buildReviewUnitsAndSlots(evidence);
const rebuiltB = buildReviewUnitsAndSlots(loadFrozenEvidence(ROOT));

ok('B1. two builds from the same evidence produce byte-identical units',
  JSON.stringify(rebuiltA.units) === JSON.stringify(rebuiltB.units));

ok('B2. two builds from the same evidence produce byte-identical slots',
  JSON.stringify(rebuiltA.slots) === JSON.stringify(rebuiltB.slots));

ok('B3. two builds produce a byte-identical presentation packet',
  renderPresentationPacket(buildWorksheet202(evidence, rebuiltA), rebuiltA.units, ws200)
    === renderPresentationPacket(buildWorksheet202(evidence, rebuiltB), rebuiltB.units, ws200));

ok('B4. no output carries a wall-clock timestamp of its own',
  !/"builtAt"|"generatedAt"|"now"\s*:/.test(JSON.stringify(worksheet))
    && !/Date\.now\(\)|new Date\(\)/.test(
      readFileSync(join(__dirname, 'lib', 'expert-202-adjudication-grouping.ts'), 'utf8')),
  'determinism depends on the module never reading a clock');

ok('B5. the row order rule is mechanical: ascending rowId with a matched partner pulled forward',
  JSON.stringify(orderRowIds(ws200.rows))
    === JSON.stringify(['SF-01', 'SF-03', 'SF-02', 'SF-04', 'SF-06', 'SF-05', 'SF-12',
      'SF-07', 'SF-08', 'SF-11', 'SG-01', 'SG-02']),
  orderRowIds(ws200.rows).join(' '));

ok('B6. every row in §200 appears exactly once in the order',
  new Set(orderRowIds(ws200.rows)).size === (ws200.rows as any[]).length,
  `${(ws200.rows as any[]).length} rows`);

ok('B7. every slot id is unique',
  new Set(worksheet.slots.map(s => s.slotId)).size === worksheet.slots.length,
  `${worksheet.slots.length} slots`);

ok('B8. every unit slotId resolves to a real slot, and every slot belongs to exactly one unit',
  worksheet.reviewUnits.every(u => u.slotIds.every(id => slotById.has(id)))
    && worksheet.reviewUnits.flatMap(u => u.slotIds).length === worksheet.slots.length,
  `${worksheet.reviewUnits.flatMap(u => u.slotIds).length} unit references`);

ok('B9. each slot names the unit that presents it, consistently',
  worksheet.reviewUnits.every(u =>
    u.slotIds.every(id => slotById.get(id)!.provenance.reviewUnitId === u.unitId)));

ok('B10. unit ordinals are 1..n in document order',
  worksheet.reviewUnits.every((u, i) => u.ordinal === i + 1));

ok('B11. a row unit is immediately followed by the units for the facts projected from that row',
  (() => {
    const units = worksheet.reviewUnits;
    for (let i = 0; i < units.length; i += 1) {
      if (units[i].kind !== 'PROJECTED_FACT' && units[i].kind !== 'REFUSED_DECLARATION') continue;
      // walk back to the nearest row unit; it must be the same rowId
      let j = i - 1;
      while (j >= 0 && units[j].kind !== 'ROW_FIRST_PASS_BEHAVIOUR') j -= 1;
      if (j < 0 || units[j].rowId !== units[i].rowId) return false;
    }
    return true;
  })());

ok('B12. matched pairs are adjacent at row-unit level',
  (() => {
    const rowUnits = worksheet.reviewUnits.filter(u => u.kind === 'ROW_FIRST_PASS_BEHAVIOUR');
    const idx = new Map(rowUnits.map((u, i) => [u.rowId, i]));
    const byId = new Map<string, any>((ws200.rows as any[]).map(r => [r.rowId, r]));
    for (const u of rowUnits) {
      const partner = byId.get(u.rowId)?.pairedWith;
      if (!partner || !idx.has(partner)) continue;
      if (Math.abs(idx.get(u.rowId)! - idx.get(partner)!) !== 1) return false;
    }
    return true;
  })(),
  'SF-01/SF-03 and SF-05/SF-12');

// =================================================================== C. the slot counts

console.log('\n--- C. the frozen 152 / 24 / 128 split, derived independently then checked ---\n');

// Derived from the §200 worksheet's own shape, not from any number written in this file.
const derivedRowSlots = (ws200.rows as any[])
  .reduce((n, r) => n + Object.keys(r.verdicts ?? {}).length, 0);
const derivedFactSlots = (ws200.facts as any[])
  .reduce((n, f) => n + Object.keys(f.verdicts ?? {}).length, 0);
const derivedPrefilled = (ws200.facts as any[])
  .reduce((n, f) => n + Object.values(f.verdicts ?? {}).filter(v => v !== null).length, 0);
const derivedTotal = derivedRowSlots + derivedFactSlots;
const derivedOpen = derivedTotal - derivedPrefilled;

ok('C1. independently derived total from the §200 worksheet shape is 152',
  derivedTotal === 152, `${derivedRowSlots} row + ${derivedFactSlots} fact = ${derivedTotal}`);

ok('C2. independently derived structurally pre-filled count is 24',
  derivedPrefilled === 24, `${derivedPrefilled}`);

ok('C3. independently derived genuinely open count is 128',
  derivedOpen === 128, `${derivedTotal} - ${derivedPrefilled} = ${derivedOpen}`);

ok('C4. the derivation agrees with §200\'s own completeness block',
  ws200.completeness.verdictSlotsTotal === derivedTotal
    && ws200.completeness.prefilledNotExercised === derivedPrefilled
    && ws200.completeness.verdictsSupplied === 0,
  `§200 says ${ws200.completeness.verdictSlotsTotal} / ${ws200.completeness.prefilledNotExercised}`);

ok('C5. the §202 worksheet reproduces the frozen split exactly',
  worksheet.completeness.totalSlots === FROZEN_SLOT_SPLIT.totalSlots
    && worksheet.completeness.structurallyPrefilled === FROZEN_SLOT_SPLIT.structurallyPrefilled
    && worksheet.completeness.genuinelyOpen === FROZEN_SLOT_SPLIT.genuinelyOpen
    && worksheet.completeness.supplied === FROZEN_SLOT_SPLIT.supplied
    && worksheet.completeness.remaining === FROZEN_SLOT_SPLIT.genuinelyOpen,
  `${worksheet.completeness.totalSlots}/${worksheet.completeness.structurallyPrefilled}`
  + `/${worksheet.completeness.genuinelyOpen}/${worksheet.completeness.supplied}`);

ok('C6. the 24 pre-filled slots are exactly axes N, S and T on the eight projected facts',
  (() => {
    const pre = worksheet.slots.filter(s => s.structurallyPrefilled);
    const axes = new Set(pre.map(s => s.axisId));
    const facts = new Set(pre.map(s => s.provenance.factKey));
    return pre.length === 24 && facts.size === 8
      && axes.size === 3 && ['N', 'S', 'T'].every(a => axes.has(a));
  })());

ok('C7. every pre-filled slot carries the literal value NOT_EXERCISED',
  worksheet.slots.filter(s => s.structurallyPrefilled).every(s => s.verdict === 'NOT_EXERCISED'));

ok('C8. every pre-filled value is byte-identical to the value §200 holds',
  (() => {
    for (const f of ws200.facts as any[]) {
      for (const [axisKey, value] of Object.entries(f.verdicts ?? {})) {
        if (value === null) continue;
        const s = slotById.get(`FACT:${f.factKey}:${axisKey}`);
        if (!s || s.verdict !== value) return false;
      }
    }
    return true;
  })(),
  'carried forward, not reinterpreted');

ok('C9. no pre-filled slot is presented as open anywhere in the packet',
  (() => {
    const packet = renderPresentationPacket(worksheet, built.units, ws200);
    // every pre-filled slot id appears only under the carried-forward heading
    return worksheet.slots.filter(s => s.structurallyPrefilled)
      .every(s => {
        const i = packet.indexOf(s.slotId);
        if (i < 0) return false;
        const before = packet.slice(Math.max(0, i - 2000), i);
        return before.includes('Carried forward unchanged and NOT open for judgement')
          && !/\*\*Q\d+\. Axis [NST] /.test(before.slice(before.lastIndexOf('Carried forward')));
      });
  })());

ok('C10. exactly 128 slots are open, null, and count toward the 152',
  worksheet.slots
    .filter(s => s.countsTowardHeadlineTotal && !s.structurallyPrefilled)
    .filter(s => s.verdict === null).length === 128);

ok('C11. the 58 supplementary fields §200 leaves out of its 152 are carried and counted separately',
  worksheet.completeness.supplementaryTotalSlots === 58
    && worksheet.slots.filter(s => s.kind === 'FACT_VERIFIER_SUB_AXIS').length === 56
    && worksheet.slots.filter(s => s.kind === 'REFUSED_DECLARATION_QUESTION').length === 2,
  `${worksheet.completeness.supplementaryTotalSlots} supplementary`);

ok('C12. total slots carried = 152 headline + 58 supplementary = 210',
  worksheet.slots.length === 210, `${worksheet.slots.length}`);

ok('C13. the 8 row-axis slots on the two rows that never reached inference are carried unfilled, '
  + 'and the tension is escalated rather than resolved',
  (() => {
    const sg = worksheet.slots.filter(s =>
      s.kind === 'ROW_AXIS' && (s.provenance.rowId === 'SG-01' || s.provenance.rowId === 'SG-02'));
    return sg.length === 8 && sg.every(s => s.verdict === null && !s.structurallyPrefilled)
      && sg.every(s => (s.applicabilityNote ?? '').includes('REJECTED BEFORE INFERENCE'))
      && worksheet.openQuestionsForTheProductOwner.some(q => q.includes('SG-01'));
  })());

// =================================================================== D. the recording function

console.log('\n--- D. recordVerdict: the only way a verdict enters the worksheet ---\n');

const OPEN_ROW_SLOT = 'ROW:SF-01:A_FIRST_PASS_GAP_RECALL';
const OPEN_FACT_SLOT = 'FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS';
const PREFILLED_SLOT = 'FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY';
const Q_SLOT = 'FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:Q_OWED_PROPERTY_LOSS_IMPACT';
const R_CLASS_SLOT = 'FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:R_SAFETY_CLASSIFICATION';
const SUB_SLOT = 'FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:TARGET_TOPIC_REACH';
const REFUSED_SLOT = 'REFUSED:SF-05:decl1:STRUCTURAL_REFUSAL_CORRECTNESS';

ok('D0. the slot ids the recording cases use all exist',
  [OPEN_ROW_SLOT, OPEN_FACT_SLOT, PREFILLED_SLOT, Q_SLOT, R_CLASS_SLOT, SUB_SLOT, REFUSED_SLOT]
    .every(id => slotById.has(id)));

// --- attribution

for (const bad of ['MODEL', 'CLAUDE', 'AGENT_A', 'ORCHESTRATOR', 'product_owner', 'PRODUCT OWNER',
  ' PRODUCT_OWNER', 'PRODUCT_OWNER ', '', 'HUMAN', 'AI_ASSISTED', 'SECTION_202']) {
  const w = freshWorksheet();
  const r = recordVerdict(w, OPEN_ROW_SLOT, 'CORRECT', bad);
  ok(`D1. attribution ${JSON.stringify(bad)} is refused`,
    r.ok === false && r.refusalCode === 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER'
      && w.slots.find(s => s.slotId === OPEN_ROW_SLOT)!.verdict === null);
}

ok('D2. the only accepted attribution is the exact string PRODUCT_OWNER',
  (() => {
    const w = freshWorksheet();
    const r = recordVerdict(w, OPEN_ROW_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return r.ok === true
      && w.slots.find(s => s.slotId === OPEN_ROW_SLOT)!.attribution === 'PRODUCT_OWNER';
  })());

ok('D3. attribution is checked BEFORE the slot is resolved, so a bad attribution cannot probe '
  + 'the slot space',
  (() => {
    const r = recordVerdict(freshWorksheet(), 'NO:SUCH:SLOT', 'CORRECT', 'MODEL');
    return r.ok === false && r.refusalCode === 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER';
  })());

// --- pre-filled protection

for (const v of ['CORRECT', 'INCORRECT', 'PARTIALLY_CORRECT', 'AMBIGUOUS', 'NOT_EXERCISED']) {
  const w = freshWorksheet();
  const r = recordVerdict(w, PREFILLED_SLOT, v, PRODUCT_OWNER_ATTRIBUTION);
  ok(`D4. a structurally pre-filled slot refuses ${v}, even the identical value`,
    r.ok === false && r.refusalCode === 'STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE'
      && w.slots.find(s => s.slotId === PREFILLED_SLOT)!.verdict === 'NOT_EXERCISED');
}

ok('D5. every one of the 24 pre-filled slots refuses a write',
  (() => {
    const w = freshWorksheet();
    const pre = w.slots.filter(s => s.structurallyPrefilled);
    return pre.length === 24 && pre.every(s => {
      const r = recordVerdict(w, s.slotId, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
      return r.ok === false && r.refusalCode === 'STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE';
    }) && w.slots.filter(s => s.structurallyPrefilled).every(s => s.verdict === 'NOT_EXERCISED');
  })());

// --- vocabulary

for (const bad of ['correct', 'Correct', 'CORRECT ', ' CORRECT', 'CORRECT.', 'YES', 'PASS',
  'TRUTH_SPECIFICATION_DEFECT', 'PARTIAL', 'OK', '', 'NULL', 'CORRECT\n']) {
  const w = freshWorksheet();
  const r = recordVerdict(w, OPEN_ROW_SLOT, bad, PRODUCT_OWNER_ATTRIBUTION);
  ok(`D6. value ${JSON.stringify(bad)} is refused rather than coerced`,
    r.ok === false && r.refusalCode === 'VALUE_NOT_IN_ALLOWED_VOCABULARY'
      && w.slots.find(s => s.slotId === OPEN_ROW_SLOT)!.verdict === null);
}

ok('D7. every member of a slot\'s own vocabulary is accepted on that slot',
  (() => {
    for (const [slotId, vocab] of [
      [OPEN_ROW_SLOT, VERDICT_VOCABULARY],
      [OPEN_FACT_SLOT, VERDICT_VOCABULARY],
      [Q_SLOT, Q_LOSS_SCALE],
      [R_CLASS_SLOT, R_SAFETY_CLASSIFICATION_SCALE],
    ] as Array<[string, readonly string[]]>) {
      for (const v of vocab) {
        const w = freshWorksheet();
        if (recordVerdict(w, slotId, v, PRODUCT_OWNER_ATTRIBUTION).ok !== true) return false;
      }
    }
    return true;
  })());

ok('D8. axis Q rejects a verdict-vocabulary member, and the verdict axes reject a Q-scale member',
  (() => {
    const a = recordVerdict(freshWorksheet(), Q_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    const b = recordVerdict(
      freshWorksheet(), OPEN_FACT_SLOT, 'NO_OBSERVABLE_LOSS', PRODUCT_OWNER_ATTRIBUTION);
    return a.ok === false && a.refusalCode === 'VALUE_NOT_IN_ALLOWED_VOCABULARY'
      && b.ok === false && b.refusalCode === 'VALUE_NOT_IN_ALLOWED_VOCABULARY';
  })(),
  'the vocabulary is per slot, not global');

ok('D9. the R floor-impact slot carries the §202-proposed vocabulary and is flagged as such',
  (() => {
    const s = slotById.get('FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:R_PRIORITY_FLOOR_IMPACT')!;
    return s.vocabularySource === VOCABULARY_SOURCE.SECTION_202_PROPOSED
      && JSON.stringify(s.allowedVocabulary)
        === JSON.stringify(R_FLOOR_IMPACT_SCALE_SECTION_202_PROPOSED)
      && worksheet.openQuestionsForTheProductOwner.some(q => q.includes('R_PRIORITY_FLOOR_IMPACT'));
  })());

ok('D10. every supplementary slot declares that §200 enumerated no vocabulary for it',
  worksheet.slots.filter(s => !s.countsTowardHeadlineTotal)
    .every(s => s.vocabularySource === VOCABULARY_SOURCE.SECTION_200_APPLIED_BY_202));

ok('D11. an unknown slot id is refused',
  (() => {
    const r = recordVerdict(freshWorksheet(), 'FACT:nope:C', 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return r.ok === false && r.refusalCode === 'UNKNOWN_SLOT';
  })());

// --- idempotence and verbatim preservation

ok('D12. recording the identical verdict twice succeeds and changes nothing the second time',
  (() => {
    const w = freshWorksheet();
    const a = recordVerdict(w, OPEN_FACT_SLOT, 'AMBIGUOUS', PRODUCT_OWNER_ATTRIBUTION);
    const b = recordVerdict(w, OPEN_FACT_SLOT, 'AMBIGUOUS', PRODUCT_OWNER_ATTRIBUTION);
    return a.ok === true && a.changed === true
      && b.ok === true && b.changed === false
      && w.completeness.supplied === 1;
  })());

ok('D13. recording the same verdict ten times leaves supplied at 1',
  (() => {
    const w = freshWorksheet();
    for (let i = 0; i < 10; i += 1) {
      recordVerdict(w, OPEN_FACT_SLOT, 'INCORRECT', PRODUCT_OWNER_ATTRIBUTION);
    }
    return w.completeness.supplied === 1 && w.completeness.remaining === 127;
  })());

ok('D14. a DIFFERENT verdict over a supplied one is refused without an explicit revision',
  (() => {
    const w = freshWorksheet();
    recordVerdict(w, OPEN_FACT_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    const r = recordVerdict(w, OPEN_FACT_SLOT, 'INCORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return r.ok === false
      && r.refusalCode === 'CONFLICTING_REVISION_REQUIRES_EXPLICIT_REVISION_FLAG'
      && w.slots.find(s => s.slotId === OPEN_FACT_SLOT)!.verdict === 'CORRECT';
  })());

ok('D15. an explicit revision is accepted and the count stays correct',
  (() => {
    const w = freshWorksheet();
    recordVerdict(w, OPEN_FACT_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    const r = recordVerdict(
      w, OPEN_FACT_SLOT, 'INCORRECT', PRODUCT_OWNER_ATTRIBUTION, { revision: true });
    return r.ok === true
      && w.slots.find(s => s.slotId === OPEN_FACT_SLOT)!.verdict === 'INCORRECT'
      && w.completeness.supplied === 1;
  })());

ok('D16. the supplied string is stored byte for byte, with no normalisation',
  (() => {
    const w = freshWorksheet();
    for (const v of VERDICT_VOCABULARY) {
      const w2 = freshWorksheet();
      recordVerdict(w2, OPEN_ROW_SLOT, v, PRODUCT_OWNER_ATTRIBUTION);
      const stored = w2.slots.find(s => s.slotId === OPEN_ROW_SLOT)!.verdict!;
      if (stored !== v || Buffer.compare(Buffer.from(stored), Buffer.from(v)) !== 0) return false;
    }
    recordVerdict(w, Q_SLOT, 'NEIGHBOURING_PROPERTY_AMBIGUITY', PRODUCT_OWNER_ATTRIBUTION);
    return w.slots.find(s => s.slotId === Q_SLOT)!.verdict === 'NEIGHBOURING_PROPERTY_AMBIGUITY';
  })());

ok('D17. recordedAt is only ever the caller\'s string; the module reads no clock',
  (() => {
    const w = freshWorksheet();
    recordVerdict(w, OPEN_ROW_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION,
      { recordedAt: '2026-09-07T00:00:00.000Z' });
    const a = w.slots.find(s => s.slotId === OPEN_ROW_SLOT)!.recordedAt;
    const w2 = freshWorksheet();
    recordVerdict(w2, OPEN_ROW_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return a === '2026-09-07T00:00:00.000Z'
      && w2.slots.find(s => s.slotId === OPEN_ROW_SLOT)!.recordedAt === null;
  })());

ok('D18. supplementary slots are supplied into their own counter, never into the 152',
  (() => {
    const w = freshWorksheet();
    recordVerdict(w, SUB_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    recordVerdict(w, REFUSED_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return w.completeness.supplied === 0 && w.completeness.remaining === 128
      && w.completeness.supplementarySupplied === 2
      && w.completeness.supplementaryRemaining === 56;
  })());

ok('D19. filling all 128 open headline slots flips the status, and no other slot is touched',
  (() => {
    const w = freshWorksheet();
    for (const s of w.slots.filter(x => x.countsTowardHeadlineTotal && !x.structurallyPrefilled)) {
      const r = recordVerdict(w, s.slotId, s.allowedVocabulary[0], PRODUCT_OWNER_ATTRIBUTION);
      if (r.ok !== true) return false;
    }
    return w.completeness.supplied === 128 && w.completeness.remaining === 0
      && w.status === 'PRODUCT_OWNER_ADJUDICATION_COMPLETE_ON_THE_152'
      && w.slots.filter(x => x.structurallyPrefilled).every(x => x.verdict === 'NOT_EXERCISED')
      && w.slots.filter(x => x.structurallyPrefilled).every(x => x.attribution === null);
  })(),
  'a full session leaves the 24 structural slots exactly as §200 left them');

ok('D20. a refused write leaves the worksheet completeness untouched',
  (() => {
    const w = freshWorksheet();
    const before = JSON.stringify(w.completeness);
    recordVerdict(w, OPEN_ROW_SLOT, 'garbage', PRODUCT_OWNER_ATTRIBUTION);
    recordVerdict(w, OPEN_ROW_SLOT, 'CORRECT', 'MODEL');
    recordVerdict(w, PREFILLED_SLOT, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return JSON.stringify(w.completeness) === before;
  })());

// --- the additive channel

ok('D21. every review unit carries the two additive fields, both null',
  worksheet.reviewUnits.every(u =>
    u.truthSpecificationDefect === null && u.reviewerNotes === null
      && u.additiveAttribution === null)
    && ADDITIVE_FIELDS.length === 2);

ok('D22. an additive finding requires PRODUCT_OWNER attribution',
  (() => {
    const w = freshWorksheet();
    const r = recordAdditive(w, 'U01', 'truthSpecificationDefect', 'text', 'MODEL');
    return r.ok === false && r.refusalCode === 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER'
      && w.reviewUnits[0].truthSpecificationDefect === null;
  })());

ok('D23. an additive finding is stored verbatim and does not touch any verdict slot or count',
  (() => {
    const w = freshWorksheet();
    const text = 'the preregistered expectation lists no acceptable alternative at all';
    const r = recordAdditive(w, 'U02', 'truthSpecificationDefect', text, PRODUCT_OWNER_ATTRIBUTION);
    const u = w.reviewUnits.find(x => x.unitId === 'U02')!;
    return r.ok === true && u.truthSpecificationDefect === text
      && u.additiveAttribution === 'PRODUCT_OWNER'
      && w.completeness.supplied === 0 && w.completeness.remaining === 128
      && w.slots.every(s => s.verdict === null || s.structurallyPrefilled);
  })());

ok('D24. an unknown unit or an unknown additive field is refused',
  (() => {
    const w = freshWorksheet();
    const a = recordAdditive(w, 'U99', 'reviewerNotes', 'x', PRODUCT_OWNER_ATTRIBUTION);
    const b = recordAdditive(
      w, 'U01', 'verdict' as never, 'CORRECT', PRODUCT_OWNER_ATTRIBUTION);
    return a.ok === false && a.refusalCode === 'UNKNOWN_REVIEW_UNIT'
      && b.ok === false && b.refusalCode === 'UNKNOWN_ADDITIVE_FIELD';
  })(),
  'the additive channel cannot be used to reach a verdict field');

// =================================================================== E. the review units

console.log('\n--- E. review units are self-contained and carry the required material ---\n');

const packet = renderPresentationPacket(worksheet, built.units, ws200);
const units = built.units;

ok('E1. 21 review units',
  units.length === 21, `${units.length}`);

ok('E2. 12 row units, 8 projected-fact units, 1 refused-declaration unit',
  units.filter(u => u.kind === 'ROW_FIRST_PASS_BEHAVIOUR').length === 12
    && units.filter(u => u.kind === 'PROJECTED_FACT').length === 8
    && units.filter(u => u.kind === 'REFUSED_DECLARATION').length === 1);

ok('E3. every unit carries the AI-assisted / not-product-owner-reviewed disclosure',
  units.every(u =>
    u.evidence.truthProvenanceDisclosure.some(d =>
      d.includes('AI-ASSISTED') && d.includes('NOT PREVIOUSLY PRODUCT-OWNER REVIEWED'))));

ok('E4. the disclosure appears once per unit in the rendered packet, not once at the top',
  (packet.match(/### 3\. Truth-specification provenance/g) ?? []).length === 21,
  `${(packet.match(/### 3\. Truth-specification provenance/g) ?? []).length} occurrences`);

ok('E5. every unit carries the observation text verbatim from §200',
  (() => {
    const byId = new Map<string, any>((ws200.rows as any[]).map(r => [r.rowId, r]));
    return units.every(u =>
      u.evidence.observation === byId.get(u.rowId).observation);
  })());

ok('E6. every unit carries the frozen expected intent',
  units.every(u =>
    Array.isArray(u.evidence.frozenExpectedIntent.establishedByTheText)
      && Array.isArray(u.evidence.frozenExpectedIntent.notEstablishedByTheText)
      && typeof u.evidence.frozenExpectedIntent.designIntent === 'string'));

ok('E7. the ten sections appear in the required order in every unit',
  (() => {
    const order = ['### 1. The observation', '### 2. The frozen expected semantic intent',
      '### 3. Truth-specification provenance', '### 4. The raw first-pass response',
      '### 5. The declaration', '### 6. Admission and refusal', '### 7. The projected OwedFact',
      '### 8. Verifier v3.3 output', '### 9. Neutral deterministic observations',
      '### 10. The questions'];
    for (const u of units) {
      const start = packet.indexOf(`## ${u.unitId} ·`);
      const end = u.ordinal < 21
        ? packet.indexOf(`## U${String(u.ordinal + 1).padStart(2, '0')} ·`) : packet.length;
      const body = packet.slice(start, end);
      let cursor = -1;
      for (const h of order) {
        const i = body.indexOf(h);
        if (i < 0 || i < cursor) return false;
        cursor = i;
      }
    }
    return true;
  })());

ok('E8. every projected-fact unit shows the declaration, the projected OwedFact, exactly what the '
  + 'verifier received, and the verifier output',
  units.filter(u => u.kind === 'PROJECTED_FACT').every(u =>
    u.evidence.declarations.length === 1
      && u.evidence.projectedOwedFact !== null
      && u.evidence.whatTheVerifierActuallyReceived !== null
      && u.evidence.verifier !== null));

ok('E9. every projected-fact unit exposes the missingFact field pair axis Q measures',
  units.filter(u => u.kind === 'PROJECTED_FACT').every(u =>
    typeof u.evidence.missingFactInDeclaration === 'string'
      && u.evidence.missingFactCarriedIntoProjectedOwedFact === false));

ok('E10. the refusal codes and detail are shown on the refused-declaration unit',
  (() => {
    const u = units.find(x => x.kind === 'REFUSED_DECLARATION')!;
    return u.rowId === 'SF-05' && u.declarationId === 'decl1'
      && u.evidence.admission.refusalCodes.length === 2
      && u.evidence.admission.refusalCodes.every(c => c === 'REQUIRED_FIELD_MISSING')
      && u.evidence.admission.refusalDetail.join(' ').includes('decisionIfA is empty');
  })());

ok('E11. the refused-declaration unit keeps the structural and the semantic question separate',
  (() => {
    const u = units.find(x => x.kind === 'REFUSED_DECLARATION')!;
    const s = u.slotIds.map(id => slotById.get(id)!);
    return s.length === 2
      && s[0].axisId === 'STRUCTURAL_REFUSAL_CORRECTNESS'
      && s[1].axisId === 'UNDERLYING_SEMANTIC_INTENT'
      && s[0].question !== s[1].question;
  })());

ok('E12. the two rows that never reached inference carry the provider error rather than an output',
  units
    .filter(u => u.rowId === 'SG-01' || u.rowId === 'SG-02')
    .every(u => u.evidence.rawFirstPass.reachedInference === false
      && u.evidence.rawFirstPass.httpStatus === 400
      && String(u.evidence.rawFirstPass.providerErrorMessage).includes('compiled grammar')));

ok('E13. the §200 noisy-metric disclosure is carried into every unit',
  units.every(u =>
    u.evidence.neutralObservationCaveats.some(c =>
      c.includes('DISCLOSED AS NOISY') && c.includes('WEAK POINTER'))));

ok('E14. the neutral observations are copied verbatim from §200',
  (() => {
    const rows = new Map<string, any>((ws200.rows as any[]).map(r => [r.rowId, r]));
    const facts = new Map<string, any>((ws200.facts as any[]).map(f => [f.factKey, f]));
    return units.every(u => {
      const expected = u.kind === 'PROJECTED_FACT'
        ? facts.get(u.factKey!).neutralObservations
        : rows.get(u.rowId).neutralObservations;
      return JSON.stringify(u.evidence.neutralObservations) === JSON.stringify(expected);
    });
  })());

ok('E15. slot counts per unit: 4 on every row unit, 20 on every fact unit, 2 on the refused unit',
  units.every(u =>
    (u.kind === 'ROW_FIRST_PASS_BEHAVIOUR' && u.slotIds.length === 4)
    || (u.kind === 'PROJECTED_FACT' && u.slotIds.length === 20)
    || (u.kind === 'REFUSED_DECLARATION' && u.slotIds.length === 2)));

ok('E16. every open slot in the packet is printed with its axis id, its question and its vocabulary',
  worksheet.slots.filter(s => !s.structurallyPrefilled).every(s =>
    packet.includes(`slot id: \`${s.slotId}\``)
      && packet.includes(s.question.slice(0, 40))
      && s.allowedVocabulary.every(v => packet.includes(`\`${v}\``))));

ok('E17. every slot records its §199 row, its §200 pointer and the §200 worksheet sha256',
  worksheet.slots.every(s =>
    typeof s.provenance.rowId === 'string' && s.provenance.rowId.length > 0
      && s.provenance.section200Pointer.startsWith('/')
      && s.provenance.section200WorksheetSha256 === evidence.worksheet200Sha256));

ok('E18. every §200 pointer resolves to a field that actually exists in the §200 worksheet',
  worksheet.slots.every(s => {
    const parts = s.provenance.section200Pointer.split('/').filter(Boolean);
    let node: any = ws200;
    for (const p of parts) {
      const key = /^\d+$/.test(p) ? Number(p) : p;
      if (node === null || node === undefined || !(key in node)) return false;
      node = node[key as keyof typeof node];
    }
    return node === null || typeof node === 'string';
  }));

// =================================================================== F. the output boundary

console.log('\n--- F. the builder never writes outside the §202 directory ---\n');

const LIB_SRC = readFileSync(join(__dirname, 'lib', 'expert-202-adjudication-grouping.ts'), 'utf8');
const BUILD_SRC = readFileSync(join(__dirname, 'build-202-adjudication-session.ts'), 'utf8');

ok('F1. resolveSection202Path returns a path inside the §202 directory',
  resolveSection202Path(ROOT, 'ADJUDICATION-WORKSHEET-202.json')
    === join(ROOT, 'verification', SECTION_202_DIR, 'ADJUDICATION-WORKSHEET-202.json'));

for (const bad of ['../x.json', '../../etc/passwd', 'a/b.json', 'a\\b.json', '',
  `../${SECTION_200_DIR}/ADJUDICATION-WORKSHEET.json`,
  `../${SECTION_199_DIR}/RUN-SUMMARY.json`, './x.json', '..']) {
  let threw = false;
  try { resolveSection202Path(ROOT, bad); } catch { threw = true; }
  ok(`F2. resolveSection202Path refuses ${JSON.stringify(bad)}`, threw);
}

ok('F3. the builder writes only through resolveSection202Path',
  (() => {
    const writes = BUILD_SRC.match(/writeFileSync\s*\(([^,]+),/g) ?? [];
    return writes.length > 0 && writes.every(w => w.includes('resolveSection202Path'));
  })(),
  `${(BUILD_SRC.match(/writeFileSync/g) ?? []).length} write call(s)`);

ok('F4. neither §202 source contains any other filesystem mutation call',
  !/\b(appendFileSync|rmSync|unlinkSync|mkdirSync|renameSync|copyFileSync|truncateSync|writeFile|createWriteStream)\b/
    .test(LIB_SRC + BUILD_SRC));

ok('F5. the library itself performs no write at all',
  !/writeFileSync/.test(LIB_SRC), 'the library only reads frozen evidence and renders strings');

ok('F6. no §202 source names a §195–§201 evidence path as a write target',
  (() => {
    const combined = LIB_SRC + BUILD_SRC;
    // every occurrence of an evidence directory constant must be in a read or a label context
    return !/writeFileSync[\s\S]{0,200}(SECTION_199_DIR|SECTION_200_DIR)/.test(combined);
  })());

ok('F7. the three declared output files are exactly what the builder writes',
  SECTION_202_OUTPUT_FILES.length === 3
    && SECTION_202_OUTPUT_FILES.every(f => BUILD_SRC.includes(f)));

/** comments state intent; only executable lines can actually reach a file. */
const stripComments = (src: string): string => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');

ok('F8. no §202 CODE references backend/package.json or any tsconfig at all',
  !/package\.json|tsconfig/.test(stripComments(LIB_SRC) + stripComments(BUILD_SRC)),
  'those are orchestrator-owned; the entries needed are reported instead');

// =================================================================== G. no semantic self-grading

console.log('\n--- G. no §202 source supplies, ranks or nudges toward a semantic verdict ---\n');

const TEST_SRC = readFileSync(__filename.replace(/\.js$/, '.ts'), 'utf8');

ok('G1. no §202 source assigns a verdict value to a §200 axis field',
  !/(verdicts|verifierSubAxes)\s*(\[[^\]]*\])?\s*[.:][A-Za-z_]*\s*=\s*['"](CORRECT|PARTIALLY_CORRECT|INCORRECT|AMBIGUOUS|TRUTH_SPECIFICATION_DEFECT)['"]/
    .test(LIB_SRC + BUILD_SRC));

ok('G2. the library assigns a slot verdict from exactly two places: the §200 carry-forward and '
  + 'recordVerdict',
  (LIB_SRC.match(/^\s*(slot\.verdict|verdict:)\s*[=:]/gm) ?? []).length
    + (LIB_SRC.match(/verdict: isPrefilled/g) ?? []).length >= 1
    && (LIB_SRC.match(/slot\.verdict = /g) ?? []).length === 1,
  'one assignment, inside recordVerdict, after four refusals');

ok('G3. neither the grouping module nor the builder ranks, sorts or scores units by likely outcome',
  !/\b(likelyOutcome|expectedVerdict|probableVerdict|riskScore|suspicious|problemUnits|failLikely)\b/i
    .test(LIB_SRC + BUILD_SRC),
  'this suite is excluded because it must be able to NAME the identifiers it forbids');

ok('G4. the only sort in the grouping is the mechanical rowId sort',
  (LIB_SRC.match(/\.sort\(/g) ?? []).length === 1
    && /ascending\s*=\s*rows\.map\(r => r\.rowId as string\)\.slice\(\)\.sort\(\)/.test(LIB_SRC));

ok('G5. the packet uses none of the prohibited evaluative words about model output',
  (() => {
    // examine only prose the builder itself authored: the fenced JSON and the block quotes are
    // verbatim §199/§200 bytes and are not this document's prose.
    const authored = packet
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/^> .*$/gm, '')
      .replace(/^- .*$/gm, '')
      .replace(/^_.*_$/gm, '');
    return !/\b(correctly|incorrectly|looks right|appears to miss|should be|as expected|unfortunately|notably|clearly wrong|obviously)\b/i
      .test(authored);
  })());

ok('G6. the packet never states an implication of a neutral observation',
  (() => {
    // the one permitted occurrence is the quoted illustration in the neutrality rule itself,
    // which shows the reader the line the packet does not cross.
    const hits = packet.match(/therefore\s+[A-Z]\s+is\s+[A-Z_]+/g) ?? [];
    return hits.length === 1
      && packet.includes('"therefore D is INCORRECT" is a verdict, and no line in this packet '
        + 'draws it')
      && !/\bwhich means the model\b/i.test(packet)
      && !/\bso the model (did|failed|missed)\b/i.test(packet);
  })());

ok('G7. the unit order rule is declared as mechanical and content-independent in the packet',
  packet.includes('THE ORDER IS MECHANICAL AND CARRIES NO INFORMATION ABOUT ANY UNIT\'S CONTENT'));

ok('G8. no unit headline or index label characterises a unit as a problem',
  units.every(u =>
    !/\b(defect|failure|problem|miss|wrong|error|suspect|concern)\b/i.test(u.headline)));

ok('G9. the worksheet declares the product owner as the sole semantic oracle',
  worksheet.semanticOracle.includes('THE PRODUCT OWNER, SOLELY')
    && worksheet.writtenBy.includes('THIS MODEL FILLED NONE'));

ok('G10. TRUTH_SPECIFICATION_DEFECT is never a member of any slot vocabulary',
  worksheet.slots.every(s => !s.allowedVocabulary.includes('TRUTH_SPECIFICATION_DEFECT')),
  '§200 records it additively, not as a verdict value');

ok('G11. the §200 truth-provenance block is carried into the §202 worksheet unchanged',
  JSON.stringify(worksheet.truthProvenance) === JSON.stringify(ws200.TRUTH_PROVENANCE));

ok('G12. this suite supplies no §200 semantic verdict of its own',
  (() => {
    // every verdict literal in this file is an argument to recordVerdict in a refusal or
    // vocabulary case, or a member of a declared vocabulary constant.
    const assignments = TEST_SRC.match(
      /verdicts\.[A-Za-z_]+\s*=\s*['"]/g) ?? [];
    return assignments.length === 0;
  })());

// =================================================================== H. the built artifacts

console.log('\n--- H. the artifacts the builder produces ---\n');

const artifacts = buildSection202(ROOT);

ok('H1. buildSection202 reproduces the same worksheet as the piecewise build',
  JSON.stringify(artifacts.worksheet) === JSON.stringify(worksheet));

ok('H2. the worksheet serialises to valid JSON and round-trips',
  (() => {
    const s = JSON.stringify(artifacts.worksheet, null, 2);
    const back = JSON.parse(s);
    return back.completeness.totalSlots === 152 && back.slots.length === 210;
  })());

ok('H3. the packet is non-trivial and names all 21 units',
  artifacts.packetMarkdown.length > 100_000
    && units.every(u => artifacts.packetMarkdown.includes(`## ${u.unitId} ·`)),
  `${artifacts.packetMarkdown.length} bytes`);

ok('H4. the session document states the counts and the refusal table',
  artifacts.sessionMarkdown.includes('| genuinely open | **128** |')
    && artifacts.sessionMarkdown.includes('ATTRIBUTION_MUST_BE_PRODUCT_OWNER')
    && artifacts.sessionMarkdown.includes('STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE'));

ok('H5. the packet reproduces every §200 axis definition',
  (ws200.rowAxes as any[]).every(a => artifacts.packetMarkdown.includes(`#### ${a.id} — ${a.name}`))
    && (ws200.factAxes as any[]).every(a =>
      artifacts.packetMarkdown.includes(`#### ${a.id} — ${a.name}`)));

ok('H6. the packet carries the sha256 of every frozen source it derives from',
  [evidence.worksheet200Sha256, evidence.session200Sha256,
    evidence.firstPass199Sha256, evidence.verifier199Sha256]
    .every(h => artifacts.packetMarkdown.includes(h)));

ok('H7. the §195–§201 evidence directories are untouched by this suite',
  sha(readFileSync(join(V200, 'ADJUDICATION-WORKSHEET.json'))) === evidence.worksheet200Sha256
    && sha(readFileSync(join(V199, 'RAW-FIRST-PASS-OUTPUTS.jsonl')))
      === evidence.firstPass199Sha256,
  're-read after the whole suite ran');

ok('H8. the §202 output directory exists and holds the ownership map it was created with',
  existsSync(join(ROOT, 'verification', SECTION_202_DIR, 'FILE-OWNERSHIP-MAP.md')));

// ---------------------------------------------------------------- report

const bar = '='.repeat(100);
console.log('\n' + bar);
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${SECTION_202_GROUPING_VERSION}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log(`  SLOT SPLIT: ${worksheet.completeness.totalSlots} total · `
  + `${worksheet.completeness.structurallyPrefilled} structurally pre-filled · `
  + `${worksheet.completeness.genuinelyOpen} genuinely open · `
  + `${worksheet.completeness.supplied} supplied`);
console.log(`  REVIEW UNITS: ${units.length}`);
console.log('  SEMANTIC VERDICTS SUPPLIED BY THIS SUITE: 0');
console.log(bar);
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
