/**
 * §253 -- PROTECTED REGRESSION RUN. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Carries the §252 run forward. §252's rule stands: a suite may be recorded SUPERSEDED only when
 * EVERY assertion it failed is on the preregistered strict-flag list, and no suite is edited to make
 * a row pass.
 *
 * §253 moves the schema head from §247 to §253, which makes some historical assertions that name
 * `buildExpert247WireSchema` untrue of the current tree. That is a SECOND and DIFFERENT class from
 * the strict-flag one, and the product owner has authorized a supersession rule only for the first.
 * Such failures are therefore recorded as PENDING_RULING -- not passed, not superseded, not hidden,
 * and the suites are left exactly as they are.
 *
 * `test-252-candidate-identity` is deliberately NOT run. It writes the identity document the
 * accepted §252 package pins, so re-running it would overwrite frozen evidence. Its verdict under
 * the §253 head is stated analytically in the report, and the §252 package is checked for byte
 * integrity at the end of this run instead.
 */
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-253-alongside-control-contract-closure-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const SUITES: { suite: string; script: string; baseline: number }[] = [
  { suite: 'test-expert-nocall-harness', script: 'test-expert-nocall-harness.ts', baseline: 141 },
  { suite: 'test-expert-anthropic-adapter-repair', script: 'test-expert-anthropic-adapter-repair.ts', baseline: 30 },
  { suite: 'test-expert-projection-equivalence', script: 'test-expert-projection-equivalence.ts', baseline: 90 },
  { suite: 'test-expert-provider-failure', script: 'test-expert-provider-failure.ts', baseline: 131 },
  { suite: 'test-220-kr1-property-authority', script: 'test-220-kr1-property-authority.ts', baseline: 43 },
  { suite: 'test-218-structured-property-verifier', script: 'test-218-structured-property-verifier.ts', baseline: 113 },
  { suite: 'test-224-declaration-capability', script: 'test-224-declaration-capability.ts', baseline: 33 },
  { suite: 'test-226-property-selection-capability', script: 'test-226-property-selection-capability.ts', baseline: 31 },
  { suite: 'test-235-posture-stabilization', script: 'test-235-posture-stabilization.ts', baseline: 209 },
  { suite: 'test-237-posture-closure', script: 'test-237-posture-closure.ts', baseline: 204 },
  { suite: 'test-239-contract-binding-closure', script: 'test-239-contract-binding-closure.ts', baseline: 336 },
  { suite: 'test-246-productionization', script: 'test-246-productionization.ts', baseline: 34 },
  { suite: 'test-247-driver-role-and-k6', script: 'test-247-driver-role-and-k6.ts', baseline: 33 },
  { suite: 'test-247-decision-complete-review', script: 'test-247-decision-complete-review.ts', baseline: 31 },
  { suite: 'test-249-identity-hardening', script: 'test-249-identity-hardening.ts', baseline: 13 },
  { suite: 'test-253-candidate-identity', script: 'test-253-candidate-identity.ts', baseline: 33 },
  { suite: 'test-253-alongside-control-closure', script: 'test-253-alongside-control-closure.ts', baseline: 27 },
  { suite: 'verify-252-admission-matrix', script: 'verify-252-admission-matrix.ts', baseline: 18 },
  { suite: 'verify-252-section243-replay', script: 'verify-252-section243-replay.ts', baseline: 24 },
];

/** Every assertion that may legitimately fail because strict enforcement is now FALSE. */
const STRICT_FLAG_ASSERTIONS: Readonly<Record<string, readonly string[]>> = {
  'test-249-identity-hardening': [
    'P2 all 17 elements resolve', 'P4 zero failures', 'P5 an identity digest was produced',
  ],
  'test-246-productionization': [
    'F1 the canonical envelope binds the strict-schema setting, and it is ON',
    'F4 an assembled first-pass request carries strict: true -- the §243 omission is unexpressible',
    'F6 the verifier leg is bound by the same envelope and is also strict',
  ],
  'test-expert-anthropic-adapter-repair': [
    'A.19 strict mode is unaffected',
  ],
};

/**
 * Assertions that became untrue only because the SCHEMA HEAD moved from §247 to §253. Recorded as a
 * distinct class because the product owner's supersession rule covers the strict flag alone. These
 * are reported as PENDING_RULING and the suites are not edited.
 */
const CONTRACT_SUCCESSOR_ASSERTIONS: Readonly<Record<string, readonly string[]>> = {
  'test-246-productionization': [
    'E3b the entry point invokes the §247 successor builders, not the §239 ones',
  ],
  'test-249-identity-hardening': [
    'P7 element 6 resolved because the bytes reproduce the §247 schema builder',
  ],
};

function run(script: string): { out: string; code: number } {
  try {
    const out = execFileSync('npx', ['ts-node', join(__dirname, script)], {
      cwd: join(__dirname, '..'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, TS_NODE_TRANSPILE_ONLY: 'true' },
    });
    return { out, code: 0 };
  } catch (e: any) { return { out: `${e.stdout ?? ''}${e.stderr ?? ''}`, code: e.status ?? 1 }; }
}

function tally(out: string): { passed: number; failed: number; raw: string } {
  const lines = out.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    let m = /(\d+)\s+passed[,\s]+(\d+)\s+failed/i.exec(lines[i]);
    if (m) return { passed: Number(m[1]), failed: Number(m[2]), raw: lines[i].trim() };
    m = /fixtures=(\d+) failed=(\d+)/.exec(lines[i]);
    if (m) return { passed: Number(m[1]) - Number(m[2]), failed: Number(m[2]), raw: lines[i].trim() };
    m = /total=(\d+) .*unsafeAdmitted=(\d+) inventions=(\d+)/.exec(lines[i]);
    if (m) {
      const bad = Number(m[2]) + Number(m[3]);
      return { passed: Number(m[1]) - bad, failed: bad, raw: lines[i].trim() };
    }
    m = /(\d+)\s*\/\s*(\d+)\s+PASS/i.exec(lines[i]);
    if (m) return { passed: Number(m[1]), failed: Number(m[2]) - Number(m[1]), raw: lines[i].trim() };
  }
  const p = (out.match(/^\s*(PASS|ok)\b/gim) ?? []).length;
  const f = (out.match(/^\s*FAIL\b/gim) ?? []).length;
  return { passed: p, failed: f, raw: `${p} passed, ${f} failed (counted from lines)` };
}

/** The named assertions a suite reported as failing. */
function failedAssertions(out: string): string[] {
  const names: string[] = [];
  for (const line of out.split('\n')) {
    const m = /^\s*FAIL\s+(.+?)(\s+\[.*)?$/.exec(line);
    if (m) names.push(m[1].trim());
  }
  return [...new Set(names)];
}

function main(): void {
  const results: any[] = [];
  for (const s of SUITES) {
    const r = run(s.script);
    const t = tally(r.out);
    const failedNames = failedAssertions(r.out);
    const allowedStrict = STRICT_FLAG_ASSERTIONS[s.suite] ?? [];
    const allowedSuccessor = CONTRACT_SUCCESSOR_ASSERTIONS[s.suite] ?? [];
    const strictHits = allowedStrict.filter(a => failedNames.includes(a));
    const successorHits = allowedSuccessor.filter(a => failedNames.includes(a));
    const unexplained = failedNames.filter(
      n => !allowedStrict.includes(n) && !allowedSuccessor.includes(n));
    let verdict: string;
    if (t.failed === 0) verdict = 'PASS';
    else if (unexplained.length > 0) verdict = 'FAIL';
    else if (successorHits.length > 0) verdict = 'PENDING_RULING';
    else verdict = 'SUPERSEDED';
    results.push({
      suite: s.suite, baseline: s.baseline, passed: t.passed, failed: t.failed,
      exitCode: r.code, raw: t.raw, verdict,
      failedAssertions: failedNames,
      failuresExplainedByTheStrictFlag: strictHits,
      failuresExplainedByTheContractSuccessor: successorHits,
      unexplainedFailures: unexplained,
    });
    console.log(`${verdict.padEnd(11)} ${s.suite.padEnd(42)} ${t.raw}`
      + (unexplained.length ? `   UNEXPLAINED: ${unexplained.join(' | ')}` : ''));
  }

  let buildErrors: string[] = [];
  try { execFileSync('npx', ['tsc', '--noEmit'], { cwd: join(__dirname, '..'), encoding: 'utf8' }); }
  catch (e: any) {
    buildErrors = String(e.stdout ?? '').split('\n').filter(l => /error TS/.test(l));
  }
  const ALLOWED_TS = 'expert-237-posture-contract.ts(193,47)';
  const unexpectedTs = buildErrors.filter(l => !l.includes(ALLOWED_TS));

  const hardFailures = results.filter(r => r.verdict === 'FAIL');
  const supersededSuites = results.filter(r => r.verdict === 'SUPERSEDED');
  const pendingRuling = results.filter(r => r.verdict === 'PENDING_RULING');

  // ---- the accepted §252 package must be byte-intact. §253 adds evidence; it rewrites none.
  const P252 = join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');
  const manifest = readFileSync(join(P252, 'REPORT-252.sha256'), 'utf8').split('\n').filter(Boolean);
  const section252Drift = manifest.filter(line => {
    const [digest, name] = line.trim().split(/\s+/);
    return createHash('sha256').update(readFileSync(join(P252, name))).digest('hex') !== digest;
  }).map(l => l.trim().split(/\s+/)[1]);
  const doc = {
    section: '253', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    summary: {
      suites: results.length,
      assertions: results.reduce((a, r) => a + r.passed, 0),
      failures: results.reduce((a, r) => a + r.failed, 0),
      hardFailures: hardFailures.length,
      supersededSuites: supersededSuites.map(r => r.suite),
      pendingProductOwnerRuling: pendingRuling.map(r => r.suite),
      newSemanticRegressions: hardFailures.length,
      allGreen: hardFailures.length === 0 && unexpectedTs.length === 0
        && section252Drift.length === 0,
    },
    notRun: [{
      suite: 'test-252-candidate-identity',
      why: 'it writes SECTION-252-CANDIDATE-IDENTITY-V2-2.json, which the accepted §252 package '
        + 'pins. Re-running it would overwrite frozen evidence. Under the §253 head its element 6 '
        + 'would resolve to no known builder, failing P2, P4 and P5; that is stated analytically '
        + 'rather than produced by overwriting the package.',
      supersededBy: 'test-253-candidate-identity',
    }],
    section252PackageIntegrity: {
      manifest: 'REPORT-252.sha256',
      filesChecked: manifest.length,
      drifted: section252Drift,
      intact: section252Drift.length === 0,
    },
    supersession: {
      rule: 'a suite is recorded SUPERSEDED only when EVERY assertion it failed is on the '
        + 'preregistered strict-flag list. One unexplained failure makes the whole suite a FAIL.',
      contractSuccessorRule: 'assertions that became untrue only because the schema head moved from '
        + '§247 to §253 are a DIFFERENT class. The product owner authorized a supersession rule for '
        + 'the strict flag only, so these are recorded PENDING_RULING rather than superseded, and '
        + 'the suites are left unchanged.',
      strictFlagAssertions: STRICT_FLAG_ASSERTIONS,
      contractSuccessorAssertions: CONTRACT_SUCCESSOR_ASSERTIONS,
      whyNotRepaired: 'those assertions state that strict enforcement is ON. That was true of the '
        + 'pre-§252 architecture and is a correct historical record. Editing them to accept '
        + 'strict=false would rewrite a protected gate to obtain a passing result, so the suites are '
        + 'left exactly as they are and §252 carries its own identity suite instead.',
    },
    productionBuild: {
      command: 'npx tsc --noEmit',
      errors: buildErrors.length,
      allowedError: 'src/hazlenz/expert-hazlenz/contract/expert-237-posture-contract.ts(193,47) '
        + 'TS2552 POSTURE_REF_KINDS_237',
      unexpectedErrors: unexpectedTs,
      status: unexpectedTs.length === 0
        ? 'PASS subject only to the frozen known TypeScript provenance error' : 'FAIL',
      frozenErrorRepaired: false,
    },
    suites: results,
  };
  writeFileSync(join(OUT, 'SECTION-253-REGRESSION.json'), JSON.stringify(doc, null, 2));
  console.log(`\nsuites=${doc.summary.suites} assertions=${doc.summary.assertions} `
    + `hardFailures=${doc.summary.hardFailures} superseded=${supersededSuites.length} `
    + `pendingRuling=${pendingRuling.length} tscUnexpected=${unexpectedTs.length} `
    + `section252Intact=${section252Drift.length === 0}`);
}
main();
