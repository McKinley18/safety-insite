/**
 * §202 -- BUILD THE ADJUDICATION SESSION ARTIFACTS.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * Reads the frozen §200 worksheet and the frozen §199 raw first-pass and verifier logs, and writes
 * exactly three files into `verification/expert-hazlenz-governed-stage-integration-2026-09-07/`:
 *
 *   ADJUDICATION-WORKSHEET-202.json     every slot, its question, its vocabulary, its provenance
 *   ADJUDICATION-PRESENTATION-PACKET.md the read-aloud material, one self-contained unit at a time
 *   ADJUDICATION-SESSION-202.md         how the session runs and what the recorder refuses
 *
 * It writes nowhere else. `resolveSection202Path` refuses any target outside that directory, and no
 * other path is constructed anywhere in this file.
 *
 * IT SUPPLIES NO SEMANTIC VERDICT. The only non-null verdicts it emits are the 24 structurally
 * pre-filled `NOT_EXERCISED` values copied verbatim out of §200.
 *
 *   npx tsx backend/scripts/build-202-adjudication-session.ts            (from the repository root)
 *   npx tsx backend/scripts/build-202-adjudication-session.ts --dry-run  (build and report, write nothing)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  FROZEN_SLOT_SPLIT, SECTION_202_GROUPING_VERSION, SECTION_202_OUTPUT_FILES,
  buildSection202, resolveSection202Path,
} from './lib/expert-202-adjudication-grouping';

const REPO_ROOT = join(__dirname, '..', '..');
const DRY_RUN = process.argv.includes('--dry-run');

const built = buildSection202(REPO_ROOT);
const c = built.worksheet.completeness;

const outputs: ReadonlyArray<{ file: (typeof SECTION_202_OUTPUT_FILES)[number]; body: string }> = [
  { file: 'ADJUDICATION-WORKSHEET-202.json', body: JSON.stringify(built.worksheet, null, 2) + '\n' },
  { file: 'ADJUDICATION-PRESENTATION-PACKET.md', body: built.packetMarkdown },
  { file: 'ADJUDICATION-SESSION-202.md', body: built.sessionMarkdown },
];

if (!DRY_RUN) {
  for (const o of outputs) writeFileSync(resolveSection202Path(REPO_ROOT, o.file), o.body, 'utf8');
}

// ---------------------------------------------------------------- report

const line = '='.repeat(100);
console.log(line);
console.log(`  §202 ADJUDICATION SESSION ARTIFACTS  ·  ${SECTION_202_GROUPING_VERSION}`);
console.log(line);
console.log(`  review units:            ${built.units.length}`);
console.log(`  total slots (headline):  ${c.totalSlots}   (frozen expectation ${FROZEN_SLOT_SPLIT.totalSlots})`);
console.log(`  structurally pre-filled: ${c.structurallyPrefilled}   (frozen expectation ${FROZEN_SLOT_SPLIT.structurallyPrefilled})`);
console.log(`  genuinely open:          ${c.genuinelyOpen}  (frozen expectation ${FROZEN_SLOT_SPLIT.genuinelyOpen})`);
console.log(`  supplied:                ${c.supplied}`);
console.log(`  remaining:               ${c.remaining}`);
console.log(`  supplementary slots:     ${c.supplementaryTotalSlots}  (counted separately, not in the 152)`);
console.log(line);

const splitMatches = c.totalSlots === FROZEN_SLOT_SPLIT.totalSlots
  && c.structurallyPrefilled === FROZEN_SLOT_SPLIT.structurallyPrefilled
  && c.genuinelyOpen === FROZEN_SLOT_SPLIT.genuinelyOpen
  && c.supplied === FROZEN_SLOT_SPLIT.supplied;
console.log(`  FROZEN SPLIT 152/24/128/0: ${splitMatches ? 'REPRODUCED' : 'DIVERGED'}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  SEMANTIC VERDICTS SUPPLIED BY THIS BUILDER: 0');
console.log(line);

console.log('\n  units and their open questions:');
for (const u of built.units) {
  const mine = u.slotIds.map(id => built.worksheet.slots.find(s => s.slotId === id)!);
  const open = mine.filter(s => !s.structurallyPrefilled).length;
  const prefilled = mine.length - open;
  console.log(
    `    ${u.unitId}  ${u.kind.padEnd(24)} ${u.rowId.padEnd(6)} `
    + `open ${String(open).padStart(2)}  headline ${String(u.headlineSlotCount).padStart(2)}  `
    + `supplementary ${String(u.supplementarySlotCount).padStart(2)}  `
    + `prefilled ${prefilled}`);
}

console.log('\n  written:');
for (const o of outputs) {
  console.log(`    ${DRY_RUN ? '(dry run, not written) ' : ''}`
    + `verification/expert-hazlenz-governed-stage-integration-2026-09-07/${o.file}`
    + `  ${o.body.length} bytes`);
}

if (!splitMatches) {
  console.log('\n  THE FROZEN SPLIT WAS NOT REPRODUCED — the §200 source has changed or the '
    + 'grouping is wrong. Stopping non-zero.');
  process.exit(1);
}
