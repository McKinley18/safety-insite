/**
 * §212 PM-1 CLASS 1 GATE -- THE PROJECTION MODULE'S CURRENT ANCESTRY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. READ-ONLY.
 *
 * `verify-203-source-integrity` asserts the HISTORICAL state and correctly reports it as diverged:
 * the file has legitimately moved since §203 recorded it, and that gate is left alone so the
 * historical record keeps saying what was true when it was written.
 *
 * This gate asserts the CURRENT state. Together they say the whole thing: the file was aab67e0b…,
 * §210E advanced it for a recorded reason, and it is bc47df39… now and has not moved since.
 */

import {
  SUCCESSOR_ANCESTRY_PIN_212, evaluateNarrowedInvariants, successorAncestryHolds,
} from './lib/expert-212-pm1-assertion-repair';
import { buildAncestrySuccessor } from './lib/expert-210j-ancestry-successor';

const L: string[] = [];
let failed = 0;
const check = (id: string, held: boolean, detail: string): void => {
  if (!held) failed += 1;
  L.push(`${held ? 'OK  ' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`);
};

L.push('§212 PM-1 CLASS 1 — PROJECTION MODULE ANCESTRY GATE');
L.push('');

const pin = successorAncestryHolds();
check('successor pin holds', pin.holds, `${pin.observed.slice(0, 16)}…`);
check('prior hash is preserved, not overwritten',
  SUCCESSOR_ANCESTRY_PIN_212.priorSha256
    === 'aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c'
  && SUCCESSOR_ANCESTRY_PIN_212.priorHashWasWrong === false,
  `${SUCCESSOR_ANCESTRY_PIN_212.priorSha256.slice(0, 16)}…`);

const anc = buildAncestrySuccessor();
check('the transition is attributed only on marks present in the file',
  anc.classification === 'ADVANCED_BY_A_LATER_AUTHORIZED_SECTION' && anc.marksAbsent.length === 0,
  anc.marksPresent.join(', '));
check('the modifying section is recorded',
  SUCCESSOR_ANCESTRY_PIN_212.modifyingSection === '§210E',
  SUCCESSOR_ANCESTRY_PIN_212.reasonForChange);

for (const r of evaluateNarrowedInvariants()) check(r.id, r.holds, r.detail);

L.push('');
L.push('LINEAGE');
L.push(`  prior     ${SUCCESSOR_ANCESTRY_PIN_212.priorSha256}   §203, historical, PRESERVED`);
L.push(`  advanced  ${SUCCESSOR_ANCESTRY_PIN_212.modifyingSection} — `
  + `${SUCCESSOR_ANCESTRY_PIN_212.reasonForChange}`);
L.push(`  current   ${SUCCESSOR_ANCESTRY_PIN_212.currentSha256}   §212 successor pin`);
L.push('');
L.push('verify-203-source-integrity remains a HISTORICAL gate and is expected to report the');
L.push('divergence. That is not a HazLenz behavioural failure and must not be reported as one.');
L.push('');
L.push(`RESULT: ${failed === 0 ? 'PASS' : 'FAIL'}   PROVIDER CALLS = 0   DATABASE OPERATIONS = 0`);

console.log(L.join('\n'));
if (failed > 0) process.exit(1);
