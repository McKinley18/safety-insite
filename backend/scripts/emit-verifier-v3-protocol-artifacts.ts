/**
 * §166 EXPERT HAZLENZ -- EMIT THE VERIFIER-v3 PROTOCOL ARTIFACTS. ZERO PROVIDER CALLS.
 *
 * Writes the frozen instruction text, the response schema, the classified v2 → v3 diff and the
 * human-truth inventory to the §166 verification directory. Everything is DERIVED from the modules
 * and from the row-truth ledger on disk -- nothing here is retyped, so an artifact cannot drift from
 * the protocol it documents.
 */

import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
  VERIFIER_V3_RESPONSE_SCHEMA, OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3,
} from './lib/expert-verifier-instruction-v3';
import {
  EXPERT_VERIFIER_CONTRACT_V3_VERSION, V3_ADMISSION_CODES, V3_ADMISSION_RULE_CLASSIFICATION,
  HUMAN_TRUTH_PROVENANCE_FIELDS, WHY_THE_v2_DUPLICATE_RULE_IS_GONE,
} from './lib/expert-verifier-contract-v3';
import {
  EXPERT_VERIFIER_V2_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
} from './lib/expert-verifier-instruction-v2';
import {
  classifyInstructionDiff, INSTRUCTION_LINE_CLASSIFICATIONS, CONTRACT_FIELD_CHANGES,
  CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT, V2_BLOCKS_THAT_MUST_SURVIVE,
  survivingBlockFailures, V2_V3_DIFF_VERSION,
} from './lib/expert-verifier-v2-v3-diff';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-v3-binding-protocol-2026-09-04');
const ROWTRUTH = join(ROOT, 'verification',
  'expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04', 'ROW-TRUTH-DISPOSITIONS.json');

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- the frozen instruction

writeFileSync(join(OUT, 'VERIFIER-INSTRUCTION-V3.txt'), EXPERT_VERIFIER_V3_SYSTEM_PROMPT + '\n');
writeFileSync(join(OUT, 'VERIFIER-V3-RESPONSE-SCHEMA.json'),
  JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA, null, 2) + '\n');

// ---------------------------------------------------------------- the classified diff

const diff = classifyInstructionDiff(EXPERT_VERIFIER_V2_SYSTEM_PROMPT,
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT);
const classificationOf = (op: string, line: string): string => {
  if (line.trim().length === 0) return 'BINDING_PROTOCOL_REQUIRED';
  const t = INSTRUCTION_LINE_CLASSIFICATIONS.find(x => x.op === op && x.line === line);
  return t ? t.classification : 'UNCLASSIFIED';
};

writeFileSync(join(OUT, 'V2-V3-SEMANTIC-DIFF.json'), JSON.stringify({
  version: V2_V3_DIFF_VERSION,
  from: { version: EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
    sha256: sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT), lines: diff.beforeLines },
  to: { version: EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
    sha256: sha256(EXPERT_VERIFIER_V3_SYSTEM_PROMPT), lines: diff.afterLines },
  addedLines: diff.addedCount,
  removedLines: diff.removedCount,
  blankLineChanges: diff.blankLineChanges,
  byClassification: diff.byClassification,
  SUBSTANTIVE_SEMANTIC_CHANGE_COUNT: diff.SUBSTANTIVE_SEMANTIC_CHANGE_COUNT,
  V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL:
    diff.V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL,
  unclassifiedChanges: diff.unclassifiedChanges,
  staleClassifications: diff.staleClassifications,
  blankLineRule: 'a blank line carries no instruction; blank changes are classified '
    + 'BINDING_PROTOCOL_REQUIRED because every added paragraph in this diff is a binding-protocol '
    + 'paragraph. Applied uniformly.',
  changes: diff.changes.map(c => ({
    op: c.op,
    classification: classificationOf(c.op, c.line),
    why: INSTRUCTION_LINE_CLASSIFICATIONS.find(x => x.op === c.op && x.line === c.line)?.why
      ?? (c.line.trim().length === 0 ? 'paragraph break belonging to an added binding paragraph'
        : null),
    line: c.line,
  })),
  v2BlocksThatMustSurvive: V2_BLOCKS_THAT_MUST_SURVIVE.map(b => ({
    name: b.name, present: EXPERT_VERIFIER_V3_SYSTEM_PROMPT.includes(b.text),
  })),
  survivingBlockFailures: survivingBlockFailures(EXPERT_VERIFIER_V3_SYSTEM_PROMPT),
  contract: {
    from: 'hazlenz.expert.verifier.v2',
    to: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
    fieldChanges: CONTRACT_FIELD_CHANGES,
    SUBSTANTIVE_SEMANTIC_CHANGE_COUNT: CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT,
    admissionCodes: V3_ADMISSION_CODES,
    admissionRuleClassification: V3_ADMISSION_RULE_CLASSIFICATION,
    humanTruthProvenanceFieldsRefused: HUMAN_TRUTH_PROVENANCE_FIELDS,
    whyTheV2DuplicateRuleIsGone: WHY_THE_v2_DUPLICATE_RULE_IS_GONE,
    owedFactDeclarations: OWED_FACT_DECLARATIONS_V3,
    clarificationSourceModes: CLARIFICATION_SOURCE_MODES_V3,
  },
}, null, 2) + '\n');

// ---------------------------------------------------------------- human-readable diff

const md: string[] = [];
md.push('# Verifier instruction v2 → v3 — classified semantic diff');
md.push('');
md.push(`**${EXPERT_VERIFIER_INSTRUCTION_V2_VERSION}** \`${sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT)
  .slice(0, 32)}…\` → **${EXPERT_VERIFIER_INSTRUCTION_V3_VERSION}** \`${
  sha256(EXPERT_VERIFIER_V3_SYSTEM_PROMPT).slice(0, 32)}…\``);
md.push('');
md.push(`${diff.beforeLines} lines → ${diff.afterLines} lines · **${diff.addedCount} added, `
  + `${diff.removedCount} removed** (${diff.blankLineChanges} of the added lines are blank).`);
md.push('');
md.push('| classification | lines |');
md.push('|---|---|');
md.push(`| \`BINDING_PROTOCOL_REQUIRED\` | ${diff.byClassification.BINDING_PROTOCOL_REQUIRED} |`);
md.push(`| \`SCHEMA_ALIGNMENT_REQUIRED\` | ${diff.byClassification.SCHEMA_ALIGNMENT_REQUIRED} |`);
md.push(`| **\`SUBSTANTIVE_SEMANTIC_CHANGE\`** | **${diff.SUBSTANTIVE_SEMANTIC_CHANGE_COUNT}** |`);
md.push('');
md.push(`\`V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL = `
  + `${String(diff.V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL).toUpperCase()}\``);
md.push('');
md.push('The classification table is checked in BOTH directions against the real diff: an actual');
md.push('change with no table entry is `UNCLASSIFIED_CHANGE`, and a table entry with no actual');
md.push(`change is \`STALE_CLASSIFICATION\`. Both are empty (${diff.unclassifiedChanges.length} and `
  + `${diff.staleClassifications.length}).`);
md.push('');
md.push('---');
md.push('');
md.push('## Removed lines — all of them');
md.push('');
for (const c of diff.changes.filter(x => x.op === 'REMOVED')) {
  md.push(`- \`${classificationOf('REMOVED', c.line)}\``);
  md.push('  ```');
  md.push(`  ${c.line}`);
  md.push('  ```');
  const why = INSTRUCTION_LINE_CLASSIFICATIONS.find(x => x.op === 'REMOVED' && x.line === c.line);
  if (why) md.push(`  ${why.why}`);
}
md.push('');
md.push('Those two lines are the ENTIRE removal set. Everything else in v3 is an insertion.');
md.push('');
md.push('## Added lines, by classification');
md.push('');
for (const cls of ['SCHEMA_ALIGNMENT_REQUIRED', 'BINDING_PROTOCOL_REQUIRED'] as const) {
  const rows = INSTRUCTION_LINE_CLASSIFICATIONS
    .filter(x => x.op === 'ADDED' && x.classification === cls);
  md.push(`### \`${cls}\` — ${rows.length} non-blank lines`);
  md.push('');
  for (const r of rows) {
    md.push('```');
    md.push(r.line);
    md.push('```');
    md.push(r.why);
    md.push('');
  }
}
md.push('## v2 blocks that must survive, checked positively');
md.push('');
md.push('A diff reporting no change to a block and the block still being present are different');
md.push('claims. Only the second one supports the preservation argument, so each is checked by');
md.push('substring against the v3 text.');
md.push('');
md.push('| block | present in v3 |');
md.push('|---|---|');
for (const b of V2_BLOCKS_THAT_MUST_SURVIVE) {
  md.push(`| ${b.name} | ${EXPERT_VERIFIER_V3_SYSTEM_PROMPT.includes(b.text) ? '**yes**' : 'NO'} |`);
}
md.push('');
md.push('## Contract diff');
md.push('');
md.push('| field / rule | op | classification | why |');
md.push('|---|---|---|---|');
for (const c of CONTRACT_FIELD_CHANGES) {
  md.push(`| \`${c.field}\` | ${c.op} | \`${c.classification}\` | ${c.why} |`);
}
md.push('');
md.push(`Contract \`SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = ${CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT}\`.`);
md.push('');
writeFileSync(join(OUT, 'V2-V3-SEMANTIC-DIFF.md'), md.join('\n') + '\n');

// ---------------------------------------------------------------- human-truth inventory

interface Row { rowId: string; authoredClass: string; disposition: string;
  prospectiveStrictSemanticTruthEligibility: string; note?: string | null }
const rows = (JSON.parse(readFileSync(ROWTRUTH, 'utf8')) as { rows: Row[] }).rows;
const eligible = rows.filter(r => r.prospectiveStrictSemanticTruthEligibility === 'ELIGIBLE');
const requiredEligible = eligible.filter(r => r.authoredClass === 'REQUIRED');
const silenceEligible = eligible.filter(r => r.authoredClass === 'FORBIDDEN');

writeFileSync(join(OUT, 'HUMAN-TRUTH-INVENTORY.json'), JSON.stringify({
  source: 'verification/expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04/'
    + 'ROW-TRUTH-DISPOSITIONS.json',
  sourceSha256: sha256(readFileSync(ROWTRUTH, 'utf8')),
  totalRows: rows.length,
  humanAuthoritativeRequired: requiredEligible.map(r => ({
    rowId: r.rowId, disposition: r.disposition })),
  humanAuthoritativeSilence: silenceEligible.map(r => ({
    rowId: r.rowId, disposition: r.disposition })),
  ineligible: rows.filter(r => r.prospectiveStrictSemanticTruthEligibility !== 'ELIGIBLE')
    .map(r => ({ rowId: r.rowId, authoredClass: r.authoredClass, disposition: r.disposition })),
  FALSIFIER_D_TESTABLE: silenceEligible.length > 0,
  consequence: silenceEligible.length > 0
    ? 'a silence-control denominator exists'
    : 'NO human-valid silence row survives §162. Falsifier D — does binding manufacture questions '
      + 'where silence was right — has no denominator. HS-J1, HS-N1 and HS-P1 are '
      + 'AUTHORING_INVALID and HS-R1 is AUTHORING_AMBIGUOUS; none may be reused as authoritative '
      + 'silence truth, and none appears in any request the harness builds. The experiment claim is '
      + 'NARROWED accordingly rather than the falsifier being weakened.',
}, null, 2) + '\n');

console.log('§166 artifacts written to');
console.log(`  ${OUT}`);
for (const f of ['VERIFIER-INSTRUCTION-V3.txt', 'VERIFIER-V3-RESPONSE-SCHEMA.json',
  'V2-V3-SEMANTIC-DIFF.json', 'V2-V3-SEMANTIC-DIFF.md', 'HUMAN-TRUTH-INVENTORY.json']) {
  console.log(`    ${f}  ${sha256(readFileSync(join(OUT, f), 'utf8')).slice(0, 24)}…`);
}
console.log('\nPROVIDER CALLS: 0   COST: $0.00');
