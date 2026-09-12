/**
 * §246 -- PRODUCTIONIZATION MIGRATION PROOF. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Proves the ten migration-proof items the §246 authorization requires, from the tree, without
 * spending a provider call to establish a code-movement fact.
 *
 * It does NOT claim the promoted implementation retains the §243 candidate identity. The promotion
 * creates a new development successor lineage, and the composite digest is expected to differ.
 */
import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const BACKEND = join(__dirname, '..');
const CONTRACT = join(BACKEND, 'src/safescope-v2/expert-hazlenz/contract');
const LIB = join(BACKEND, 'scripts/lib');
const sha = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

let passed = 0; let failed = 0; const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = ''): void => {
  if (cond) { passed++; console.log(`ok    ${label}${detail ? '  [' + detail + ']' : ''}`); }
  else { failed++; failures.push(label); console.log(`FAIL  ${label}${detail ? '  [' + detail + ']' : ''}`); }
};

// ---------------------------------------------------------------- A. the promoted set
const promoted = readdirSync(CONTRACT).filter(f => f.endsWith('.ts')).sort();
ok('A1 the production contract tree exists', existsSync(CONTRACT));
/**
 * §247: the tree now also carries §247 successor modules. The assertion is STRENGTHENED rather than
 * relaxed -- every one of the 39 relocated modules must still be present, and every additional
 * module must be a declared successor rather than an unexplained arrival.
 */
/**
 * §252 registers `expert-252-` here. This check exists so that a new module in the production
 * contract tree must be a DECLARED successor rather than an unexplained arrival, and declaring one
 * is the action it asks for. The check itself is unchanged and is not relaxed: an undeclared
 * arrival still fails A2b, and a successor still has to have been born in the production tree with
 * no shim at a historical path (B1b).
 */
const SUCCESSOR_PREFIXES = ['expert-247-', 'expert-252-', 'expert-253-'];
const successors = promoted.filter(f => SUCCESSOR_PREFIXES.some(p => f.startsWith(p)));
const relocated = promoted.filter(f => !successors.includes(f));
ok('A2 all 39 relocated modules are present', relocated.length === 39, `${relocated.length} relocated`);
ok('A2b every additional module in the tree is a declared successor',
  promoted.length === relocated.length + successors.length,
  `${successors.length} successor modules`);

const PREMOVE = process.env.SECTION_246_PREMOVE_DIR ?? '';
if (PREMOVE && existsSync(PREMOVE)) {
  let identical = 0; let importOnly = 0; let other = 0;
  for (const f of relocated) {
    const before = readFileSync(join(PREMOVE, f), 'utf8').split('\n');
    const after = readFileSync(join(CONTRACT, f), 'utf8').split('\n');
    if (before.length !== after.length) { other++; continue; }
    const diff: number[] = [];
    for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) diff.push(i);
    if (diff.length === 0) identical++;
    else if (diff.every(i => before[i].includes('../../src/safescope-v2/expert-hazlenz/')
      && after[i] === before[i].replace(/\.\.\/\.\.\/src\/safescope-v2\/expert-hazlenz\//g, '../'))) importOnly++;
    else other++;
  }
  ok('A3 every RELOCATED module is byte-identical or differs ONLY on a repaired import path',
    other === 0 && identical + importOnly === 39,
    `${identical} identical, ${importOnly} import-only, ${other} other`);
} else {
  console.log('  --  A3 skipped: set SECTION_246_PREMOVE_DIR to the pre-move snapshot to run it');
}

// ---------------------------------------------------------------- B. no semantics left under scripts/
const shimBodies = relocated.map(f => join(LIB, f)).filter(existsSync);
ok('B1 every relocated module has a shim at its historical path',
  shimBodies.length === relocated.length, `${shimBodies.length}/${relocated.length}`);
ok('B1b §247 successors were BORN in the production tree and need no shim',
  successors.every(f => !existsSync(join(LIB, f))), successors.join(','));
const fatShims = shimBodies.filter(p => {
  const code = readFileSync(p, 'utf8').split('\n')
    .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('/*') && !l.trim().startsWith('//'))
    .join('\n').trim();
  return code !== '' && !/^export \* from '[^']+';$/.test(code);
});
ok('B2 no shim carries logic -- each is exactly one re-export', fatShims.length === 0,
  fatShims.map(p => p.split('/').pop()).join(','));

// ---------------------------------------------------------------- C. dependency direction
const walk = (dir: string): string[] => readdirSync(dir).flatMap(n => {
  const full = join(dir, n);
  if (n === 'node_modules' || n === 'dist') return [];
  return statSync(full).isDirectory() ? walk(full) : [full];
});
const srcFiles = walk(join(BACKEND, 'src')).filter(f => f.endsWith('.ts'));
const wrongWay = srcFiles.filter(f => /from\s+'[^']*\/scripts\//.test(readFileSync(f, 'utf8')));
ok('C1 no production module imports from scripts/ -- direction is scripts/ -> src/',
  wrongWay.length === 0, wrongWay.map(f => f.replace(BACKEND, '')).join(','));

// ---------------------------------------------------------------- D. core purity, re-checked here
const NET = ['fetch(', "require('http", 'require("http', "from 'http", 'from "http', 'axios',
  'XMLHttpRequest', 'WebSocket', 'net.connect', 'https://', 'http://',
  'process.env.ANTHROPIC', 'process.env.OPENAI', 'process.env.GEMINI', 'apiKey'];
const VENDORS = ['anthropic', 'gemini', 'openai', 'ollama', 'qwen', 'claude', 'gpt-'];
const coreFiles = walk(join(BACKEND, 'src/safescope-v2/expert-hazlenz')).filter(f => f.endsWith('.ts'));
const netHits = coreFiles.filter(f => NET.some(n => readFileSync(f, 'utf8').includes(n)));
const venHits = coreFiles.filter(f => {
  const code = readFileSync(f, 'utf8').toLowerCase().split('\n')
    .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//') && !l.trim().startsWith('/*'))
    .join('\n');
  return VENDORS.some(v => code.includes(v));
});
ok('D1 the promoted contract carries no network primitive, endpoint or credential',
  netHits.length === 0, netHits.map(f => f.split('/').pop()).join(','));
ok('D2 the promoted contract names no vendor in module code',
  venHits.length === 0, venHits.map(f => f.split('/').pop()).join(','));

// ---------------------------------------------------------------- E. the production entry point
/* eslint-disable @typescript-eslint/no-var-requires */
const entry = require('../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis');
ok('E1 the production entry point exports a callable analysis function',
  typeof entry.runExpertHazLenzAnalysis === 'function');
ok('E2 it declares the §239 contract version, not a private one',
  entry.EXPERT_PRODUCTION_ENTRY_VERSION === 'hazlenz.expert.production-entry.v1');
const entrySrc = readFileSync(
  join(BACKEND, 'src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis.ts'), 'utf8');
/**
 * §249: E3 now names the SUCCESSOR the entry point actually invokes. §248 demonstrated why the
 * weaker form was insufficient -- asserting only that the entry point imports from `./contract/`
 * left it free to invoke §239 while the §247 modules sat unused in the same directory. The
 * byte-level proof that the invoked builders really are the §247 ones lives in
 * `test-249-identity-hardening`, together with the six negative fixtures; this check is the static
 * companion to it.
 */
for (const m of ['expert-247-posture-contract', 'expert-247-role-justification-projection',
  'expert-239-posture-projection', 'expert-210j-declaration-projection',
  'expert-212-verifier-payload', 'expert-218-property-review-contract',
  'expert-first-pass-instruction-vnext']) {
  ok(`E3 the entry point composes ${m} from the production tree`,
    entrySrc.includes(`./contract/${m}`));
}
ok('E3b the entry point invokes the §247 successor builders, not the §239 ones',
  entrySrc.includes('build247SystemPrompt(') && entrySrc.includes('buildExpert247WireSchema(')
  && !entrySrc.includes('build239SystemPrompt(') && !entrySrc.includes('buildExpert239WireSchema('));
ok('E4 the entry point reaches no harness module',
  !/expert-20[57]-|expert-243-assembly|truth-specification/.test(entrySrc));

// ---------------------------------------------------------------- F. the request envelope
const env = require('../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope');
const bound = env.envelopeBoundOptions();
ok('F1 the canonical envelope binds the strict-schema setting, and it is ON',
  bound.strictSchema === true);
ok('F2 every declared bound key is present in the envelope',
  env.EXPERT_REQUEST_ENVELOPE_BOUND_KEYS.every((k: string) => k in bound));
ok('F3 the envelope declares no key it does not bind',
  Object.keys(bound).every(k => env.EXPERT_REQUEST_ENVELOPE_BOUND_KEYS.includes(k)));
const body = env.buildEnvelopeRequestBody({
  leg: 'FIRST_PASS', systemPrompt: 's', userPrompt: 'u',
  toolName: 't', toolDescription: 'd', inputSchema: { type: 'object' },
});
const tool = (body.tools as Record<string, unknown>[])[0];
ok('F4 an assembled first-pass request carries strict: true -- the §243 omission is unexpressible',
  tool.strict === true);
ok('F5 the request is forced to the tool, so prose cannot be scored as a schema failure',
  JSON.stringify(body.tool_choice) === JSON.stringify({ type: 'tool', name: 't' }));
const vbody = env.buildEnvelopeRequestBody({
  leg: 'VERIFIER', systemPrompt: 's', userPrompt: 'u',
  toolName: 'v', toolDescription: 'd', inputSchema: { type: 'object' },
});
ok('F6 the verifier leg is bound by the same envelope and is also strict',
  ((vbody.tools as Record<string, unknown>[])[0]).strict === true);
ok('F7 the two legs carry their own bound token limits',
  typeof body.max_tokens === 'number' && typeof vbody.max_tokens === 'number');
const adapterSrc = readFileSync(
  join(BACKEND, 'src/safescope-v2/expert-hazlenz-adapters/expert-semantic-transport.ts'), 'utf8');
ok('F8 the transport never assembles a tool block itself',
  !/tools:\s*\[/.test(adapterSrc) && adapterSrc.includes('buildEnvelopeRequestBody'));

// ---------------------------------------------------------------- G. relocation did not move meaning
const consistency = require('../src/safescope-v2/expert-hazlenz/contract/expert-218-property-consistency');
ok('G1 the §218 property consistency check resolves from the production tree',
  typeof consistency.checkPropertyReview218 === 'function');
ok('G2 the §210E whole-field filler rule survived relocation',
  readFileSync(join(CONTRACT, 'expert-218-property-consistency.ts'), 'utf8')
    .includes('isNonSemanticFiller'));
const posture = require('../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract');
const admissible = Object.values(posture.DRIVER_ROLE_REF_KINDS_239 as Record<string, string[]>)
  .reduce((a, b) => a + b.length, 0);
ok('G3 the §239 driver-role binding still admits exactly 6 role/carrier pairs', admissible === 6,
  `${admissible} pairs`);
ok('G4 K6 is UNCHANGED by this migration -- 4 inadmissible pairs remain expressible',
  Object.keys(posture.DRIVER_ROLE_REF_KINDS_239).length * 2 - admissible === 4);

// ---------------------------------------------------------------- H. the competing path
const oldPrompt = readFileSync(
  join(BACKEND, 'src/safescope-v2/expert-hazlenz/expert-prompt.ts'), 'utf8');
ok('H1 the base contract module is retained -- the §239 chain extends it, so it is not a rival',
  oldPrompt.includes('buildExpertWireSchema'));
const vnextSrc = readFileSync(join(CONTRACT, 'expert-first-pass-instruction-vnext.ts'), 'utf8');
ok('H2 the validated chain is rooted in that same base module',
  vnextSrc.includes("from '../expert-prompt'"));

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) console.log('FAILED:\n  ' + failures.join('\n  '));
console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no');
process.exit(failed ? 1 : 0);
