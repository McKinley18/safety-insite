/**
 * §229 — PROTECTED VALIDATION LADDER. Local only. Zero provider calls, zero database operations.
 *
 * Run before and after cleanup. Every suite must produce the same result in both runs.
 */
import { execFileSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');

const LADDER: readonly { rung: string; suite: string; script: string }[] = [
  { rung: '2 first-pass contract', suite: '§210E final remediation',
    script: 'scripts/test-210e-final-remediation.ts' },
  { rung: '2 first-pass contract', suite: '§210J epistemic schema',
    script: 'scripts/test-210j-epistemic-schema-remediation.ts' },
  { rung: '2 first-pass contract', suite: '§210G alignment',
    script: 'scripts/test-210g-alignment-remediation.ts' },
  { rung: '3 declaration / property', suite: '§205 remediation and RR-7 preservation',
    script: 'scripts/test-205-remediation.ts' },
  { rung: '3 declaration / property', suite: '§224 declaration capability',
    script: 'scripts/test-224-declaration-capability.ts' },
  { rung: '3 declaration / property', suite: '§226 property selection capability',
    script: 'scripts/test-226-property-selection-capability.ts' },
  { rung: '4 verifier', suite: '§212 verifier architecture',
    script: 'scripts/test-212-verifier-architecture-remediation.ts' },
  { rung: '4 verifier', suite: '§214 verifier semantic / sibling containment',
    script: 'scripts/test-214-verifier-semantic-remediation.ts' },
  { rung: '4 verifier', suite: '§218 structured property verifier',
    script: 'scripts/test-218-structured-property-verifier.ts' },
  { rung: '6 property authority', suite: '§220 KR-1 property authority boundary',
    script: 'scripts/test-220-kr1-property-authority.ts' },
  { rung: '7 settlement', suite: 'clarification settlement',
    script: 'scripts/test-expert-clarification-settlement.ts' },
  { rung: '7 settlement', suite: 'unsupported settlement',
    script: 'scripts/test-expert-unsupported-settlement.ts' },
  { rung: '8 governed evidence', suite: 'grounding contract',
    script: 'scripts/test-expert-grounding-contract.ts' },
  { rung: '9 integrated local', suite: '§219 preregistration',
    script: 'scripts/test-219-preregistration.ts' },
  { rung: '9 integrated local', suite: '§221 integrated preregistration',
    script: 'scripts/test-221-preregistration.ts' },
  { rung: '1 targeted unit', suite: 'expert contract foundation',
    script: 'scripts/test-expert-contract-foundation.ts' },
  { rung: '1 targeted unit', suite: 'expert authority merge',
    script: 'scripts/test-expert-authority-merge.ts' },
];

interface Result {
  rung: string; suite: string; script: string; present: boolean;
  ok: boolean | null; exitCode: number | null; tailLine: string | null; durationMs: number;
}

const results: Result[] = [];
for (const x of LADDER) {
  if (!existsSync(join(ROOT, x.script))) {
    results.push({ ...x, present: false, ok: null, exitCode: null, tailLine: null, durationMs: 0 });
    continue;
  }
  const t0 = Date.now();
  let ok = true; let exitCode = 0; let out = '';
  try {
    out = execFileSync('npx', ['tsx', x.script], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180_000, env: { ...process.env, ANTHROPIC_API_KEY: '' },
    });
  } catch (e: any) {
    ok = false; exitCode = e.status ?? -1;
    out = `${e.stdout ?? ''}\n${e.stderr ?? ''}`;
  }
  const lines = out.split('\n').map(l => l.trim()).filter(Boolean);
  results.push({ ...x, present: true, ok, exitCode,
    tailLine: lines.length > 0 ? lines[lines.length - 1].slice(0, 160) : null,
    durationMs: Date.now() - t0 });
}

const present = results.filter(r => r.present);
const passed = present.filter(r => r.ok === true).length;
const failed = present.filter(r => r.ok === false);

const doc = {
  artifact: 'SECTION-229-PROTECTED-LADDER',
  ranAt: new Date().toISOString(),
  providerCalls: 0, databaseOperations: 0,
  suitesListed: LADDER.length, suitesPresent: present.length,
  suitesMissing: results.filter(r => !r.present).map(r => r.script),
  passed, failed: failed.length,
  failedSuites: failed.map(r => ({ suite: r.suite, exitCode: r.exitCode, tail: r.tailLine })),
  results,
};
const target = process.argv[2] ?? join(ROOT, '..', 'LADDER.json');
writeFileSync(target, JSON.stringify(doc, null, 2) + '\n');

for (const r of results) {
  const mark = !r.present ? 'MISS' : r.ok ? 'ok  ' : 'FAIL';
  console.log(`${mark} ${r.rung.padEnd(26)} ${r.suite.padEnd(44)} ${r.tailLine ?? ''}`.slice(0, 190));
}
console.log(`\n${passed}/${present.length} passed, ${failed.length} failed, `
  + `${results.length - present.length} missing`);
console.log(`written: ${target}`);
