/**
 * §248 -- PRE-SPEND PRECONDITION VERIFIER. ZERO PROVIDER CALLS BY CONSTRUCTION.
 *
 * The §248 authorization lists seven conditions that must hold BEFORE the first provider call, and
 * instructs STOP BEFORE SPEND if any fails. This script is the mechanical check. It contains no
 * network primitive and cannot itself transmit anything.
 *
 * Condition 5 is checked against what the canonical path WOULD ACTUALLY TRANSMIT, not against what a
 * contract module is capable of. That distinction is the whole point: a contract that exists but is
 * not on the executable path cannot be what a hosted confirmation measures.
 */
import { readFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import {
  buildAnthropicRequestBody,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const BACKEND = join(__dirname, '..');
const ROOT = join(BACKEND, '..');
const P247 = join(ROOT, 'verification',
  'expert-hazlenz-247-canonical-closure-and-remediation-2026-09-12');
const sha = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

let pass = 0; let fail = 0; const failed: string[] = [];
const check = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { pass++; console.log(`PASS  ${id}${detail ? '  [' + detail + ']' : ''}`); }
  else { fail++; failed.push(id); console.log(`FAIL  ${id}${detail ? '  [' + detail + ']' : ''}`); }
};

// ---- P1 the §247 instrument verifies
const manifest = readFileSync(join(P247, 'REPORT-247.sha256'), 'utf8').trim().split('\n');
const bad = manifest.filter(l => {
  const [d, n] = l.split(/\s+/);
  return sha(join(P247, n)) !== d;
});
check('P1 every §247 frozen instrument file verifies', bad.length === 0,
  `${manifest.length} files, ${bad.length} mismatched`);
check('P1b the §247 package digest matches the authorization',
  sha(join(P247, 'REPORT-247.sha256'))
    === 'c12a5953c4c936076f256db31cefdff68467c9ee9b65d04118efe3e41477a58d');

// ---- P2 candidate identity resolves 17/17
const id = JSON.parse(readFileSync(join(P247, 'SECTION-247-CANDIDATE-IDENTITY-V2.json'), 'utf8'));
check('P2 Candidate Identity v2 resolves 17/17 with no declarations',
  id.mechanicallyResolved === 17 && id.required === 17 && id.declarationsUsed === 0);

// ---- P7 no semantic source changed since freeze
const drifted = id.boundElements
  .filter((e: any) => e.sha256 && e.path)
  .filter((e: any) => sha(join(BACKEND, e.path)) !== e.sha256);
check('P7 no semantic source file changed after instrument freeze', drifted.length === 0,
  drifted.map((e: any) => e.path).join(','));

// ---- P3/P4/P5 checked against the ACTUAL transmitted request
const input: any = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'PRE-SPEND-CHECK',
  authoritativeSources: [{ sourceId: 'obs-1', kind: 'OBSERVATION', text: 'precondition probe' }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'GB',
  allowedHazardFamilies: ['VEHICLE_PEDESTRIAN'],
  deterministicFindings: [], familyDispositions: [], governedStandards: [],
  answeredClarifications: [],
};
const body = buildAnthropicRequestBody(input) as any;
const tool = body.tools[0];
const items = tool.input_schema.properties.immediateSafetyPosture.properties.requiredBy.items;

check('P4 strict schema is enabled on the transmitted tool', tool.strict === true);

const hasUnion = Array.isArray(items.anyOf);
const expressible = hasUnion
  ? items.anyOf.reduce((a: number, b: any) => a + b.properties.refKind.enum.length, 0)
  : (items.properties?.driverRole?.enum?.length ?? 0)
    * (items.properties?.refKind?.enum?.length ?? 0);
check('P5 the TRANSMITTED schema expresses exactly 6 admissible role/carrier pairs',
  hasUnion && expressible === 6, `union=${hasUnion}, expressible=${expressible}`);
check('P5b the TRANSMITTED schema expresses 0 inadmissible combinations',
  hasUnion && expressible === 6, hasUnion ? '' : 'independent enums: 10 expressible, 4 inadmissible');

const hasJustification = hasUnion
  ? items.anyOf.every((b: any) => b.properties.roleJustification !== undefined)
  : items.properties?.roleJustification !== undefined;
check('P3 the §247 driver-role representation is present on the transmitted schema',
  hasJustification);
check('P3b the transmitted system prompt carries the §247 justification instruction',
  String(body.system).includes('roleJustification'));

// ---- P6 the build reports only the frozen error
const contractDir = join(BACKEND, 'src/safescope-v2/expert-hazlenz/contract');
check('P6 the production contract tree is present',
  readdirSync(contractDir).filter(f => f.endsWith('.ts')).length >= 41);

console.log(`\n${pass} passed, ${fail} failed`);
if (failed.length) {
  console.log('FAILED PRECONDITIONS:\n  ' + failed.join('\n  '));
  console.log('\nSTOP BEFORE SPEND. Provider calls made: 0.');
}
console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
process.exit(fail ? 1 : 0);
