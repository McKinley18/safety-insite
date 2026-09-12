/**
 * §209 -- COMPLETENESS AND ATTRIBUTION CHECK. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The check §209 requires BEFORE gates may be computed. It counts and validates; it decides no
 * semantic verdict, supplies none, and infers none. A missing judgment is reported as missing --
 * never filled, never defaulted, never inferred.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');
const WORKSHEET = join(OUT, 'ADJUDICATION-WORKSHEET-209.json');
const LEDGER = join(OUT, 'VERDICT-LEDGER-209.jsonl');

if (!existsSync(WORKSHEET)) throw new Error(`§209: no worksheet at ${WORKSHEET}`);
const worksheet = JSON.parse(readFileSync(WORKSHEET, 'utf8')) as any;
const slots = worksheet.slots as any[];

const ledger = existsSync(LEDGER)
  ? readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any)
  : [];

const supplied = slots.filter(s => typeof s.verdict === 'string' && s.verdict.length > 0);
const missing = slots.filter(s => s.verdict === null || s.verdict === undefined);
const notExercised = supplied.filter(s => s.verdict === 'NOT_EXERCISED');
const ambiguous = supplied.filter(s => s.verdict === 'AMBIGUOUS');
const frozenNoOpportunity = slots.filter(s => s.structuralNotExercised !== null);

// ---- attribution validation
const attributionFailures = supplied.filter(s => s.attribution !== 'PRODUCT_OWNER')
  .map(s => ({ slotId: s.slotId as string, attribution: s.attribution as unknown }));
const ledgerAttributionFailures = ledger.filter(e => e.attribution !== 'PRODUCT_OWNER')
  .map(e => ({ slotId: e.slotId as string, attribution: e.attribution as unknown }));
const notExercisedWithoutReason = notExercised
  .filter(s => typeof s.reason !== 'string' || s.reason.trim().length < 10)
  .map(s => s.slotId as string);
const scoredNoOpportunitySlots = frozenNoOpportunity
  .filter(s => typeof s.verdict === 'string' && s.verdict !== 'NOT_EXERCISED')
  .map(s => s.slotId as string);
const ledgerWithoutSlot = ledger
  .filter(e => !slots.some(s => s.slotId === e.slotId))
  .map(e => e.slotId as string);

const byAxis: Record<string, Record<string, number>> = {};
for (const s of slots) {
  const a = s.axisId as string;
  byAxis[a] ??= { slots: 0, supplied: 0, open: 0 };
  byAxis[a].slots += 1;
  if (typeof s.verdict === 'string' && s.verdict.length > 0) {
    byAxis[a].supplied += 1;
    byAxis[a][s.verdict as string] = (byAxis[a][s.verdict as string] ?? 0) + 1;
  } else byAxis[a].open += 1;
}

const byCase: Record<string, { slots: number; supplied: number; open: number }> = {};
for (const s of slots) {
  const c = s.caseId as string;
  byCase[c] ??= { slots: 0, supplied: 0, open: 0 };
  byCase[c].slots += 1;
  if (typeof s.verdict === 'string' && s.verdict.length > 0) byCase[c].supplied += 1;
  else byCase[c].open += 1;
}

const complete = missing.length === 0
  && attributionFailures.length === 0
  && ledgerAttributionFailures.length === 0
  && notExercisedWithoutReason.length === 0
  && scoredNoOpportunitySlots.length === 0
  && ledgerWithoutSlot.length === 0;

const out = {
  artifact: 'SECTION_209_COMPLETENESS_CHECK',
  preregistrationIdentity: worksheet.preregistrationIdentity,
  totalSlots: slots.length,
  suppliedProductOwnerVerdicts: supplied.length,
  notExercisedSlots: notExercised.length,
  ambiguousSlots: ambiguous.length,
  unresolvedOrMissingSlots: missing.length,
  frozenNoOpportunitySlots: frozenNoOpportunity.length,
  attributionValidation: {
    worksheetFailures: attributionFailures,
    ledgerFailures: ledgerAttributionFailures,
    allSuppliedVerdictsAreProductOwnerAttributed:
      attributionFailures.length === 0 && ledgerAttributionFailures.length === 0,
  },
  integrity: {
    notExercisedWithoutRecordedReason: notExercisedWithoutReason,
    frozenNoOpportunitySlotsScoredAsSomethingElse: scoredNoOpportunitySlots,
    ledgerEntriesWithNoMatchingSlot: ledgerWithoutSlot,
    ledgerEntryCount: ledger.length,
  },
  perAxis: byAxis,
  perCase: byCase,
  readyForGateComputation: complete,
  note: complete
    ? 'the instrument is complete and every supplied verdict is PRODUCT_OWNER-attributed'
    : 'the instrument is INCOMPLETE. Gates may be computed, but every gate with an open slot will '
      + 'report AWAITING_ADJUDICATION; no missing judgment is filled, defaulted or inferred.',
  generatedAt: new Date().toISOString(),
};

writeFileSync(join(OUT, 'COMPLETENESS-CHECK-209.json'), `${JSON.stringify(out, null, 2)}\n`);

console.log('================ §209 COMPLETENESS CHECK');
console.log(`  total slots                     : ${out.totalSlots}`);
console.log(`  PRODUCT_OWNER verdicts supplied : ${out.suppliedProductOwnerVerdicts}`);
console.log(`  NOT_EXERCISED                   : ${out.notExercisedSlots}`);
console.log(`  AMBIGUOUS                       : ${out.ambiguousSlots}`);
console.log(`  unresolved / missing            : ${out.unresolvedOrMissingSlots}`);
console.log(`  frozen no-opportunity slots     : ${out.frozenNoOpportunitySlots}`);
console.log(`  attribution failures            : `
  + `${attributionFailures.length + ledgerAttributionFailures.length}`);
console.log(`  verdict-ledger entries          : ${ledger.length}`);
console.log(`  ready for gate computation      : ${String(out.readyForGateComputation)}`);
console.log('');
console.log('  axis  slots supplied open');
for (const [a, v] of Object.entries(byAxis).sort()) {
  console.log(`  ${a.padEnd(9)} ${String(v.slots).padStart(3)} ${String(v.supplied).padStart(8)} `
    + `${String(v.open).padStart(4)}`);
}
console.log('\n  wrote COMPLETENESS-CHECK-209.json   provider calls: 0   database operations: 0');
