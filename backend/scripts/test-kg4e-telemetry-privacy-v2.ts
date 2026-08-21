/**
 * KG-4E -- the v2 privacy authority, run over the events the servers actually emitted.
 *
 * WHY THIS EXISTS RATHER THAN A REUSE OF KG-4B's SUITE. `test:kg4b-privacy-review` classifies the
 * 29 fields of `kg4b.shadow-comparison.v1`. KG-4C's v2 event carries six more -- `stage`,
 * `eligibilitySource`, `outputInvarianceVerdict`, `outputInvarianceHash`,
 * `outputInvarianceDifferingPaths`, `shadowProvenanceNull` -- which that suite cannot classify and
 * therefore reports as unclassified. That is a schema-version mismatch, not a privacy result, and
 * the correct response is NOT to edit KG-4B's evidence until it goes green.
 *
 * So this runs the actual authority: `assertShadowEventV2PrivacySafe()`, the guard the write path
 * itself calls before every emission. It is the same code, applied to the same events, after the
 * fact -- which also proves the guard was reached rather than skipped.
 *
 * Usage: ts-node scripts/test-kg4e-telemetry-privacy-v2.ts <events.jsonl>
 */

import { readFileSync } from 'fs';
import {
  assertShadowEventV2PrivacySafe, SHADOW_EVENT_V2_ALLOWED_FIELDS, PRIVACY_CANARY_PATTERNS,
} from '../src/standards/cutover/shadow-telemetry-sink';

const path = process.argv[2];
if (!path) throw new Error('usage: test-kg4e-telemetry-privacy-v2 <events.jsonl>');

const events = readFileSync(path, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));

const violations: string[] = [];
const fieldsSeen = new Set<string>();
let safe = 0;
for (const event of events) {
  for (const key of Object.keys(event)) fieldsSeen.add(key);
  try { assertShadowEventV2PrivacySafe(event); safe += 1; }
  catch (error) { violations.push((error as Error).message); }
}
const outside = [...fieldsSeen].filter((field) => !SHADOW_EVENT_V2_ALLOWED_FIELDS.includes(field));

console.log('events                     : ' + events.length);
console.log('pass the v2 privacy guard  : ' + safe);
console.log('violations                 : ' + violations.length +
  (violations.length ? ' -> ' + violations.slice(0, 5).join('; ') : ''));
console.log('distinct fields observed   : ' + fieldsSeen.size);
console.log('fields OUTSIDE v2 allowlist: ' + outside.length + (outside.length ? ' -> ' + outside.join(', ') : ''));
console.log('canary patterns applied    : ' + PRIVACY_CANARY_PATTERNS.length);

// NON-VACUITY: a guard that was handed nothing proves nothing.
if (!events.length) { console.error('  FAIL  NON-VACUITY: no events were checked'); process.exitCode = 1; }
if (violations.length || outside.length) process.exitCode = 1;
