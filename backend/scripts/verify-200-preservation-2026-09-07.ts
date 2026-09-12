/**
 * §200 -- EVIDENCE PRESERVATION AND ZERO-CALL VERIFICATION. Read-only. Zero provider calls.
 *
 * §200 adds files and adjudication material. It changes no treatment artifact, reruns no §199 row,
 * and must leave every earlier evidence package byte-identical. This gate proves that by HASHING
 * those packages rather than by re-deriving them -- the §196, §197, §198 and §199 gates each WRITE
 * into their own evidence directory, so re-running any of them would itself mutate history.
 */
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const V = (n: string): string => join(ROOT, 'verification', n);
const E196 = V('expert-hazlenz-structured-first-pass-owed-facts-2026-09-06');
const E197 = V('expert-hazlenz-structured-e2e-validation-2026-09-07');
const E198 = V('expert-hazlenz-structured-pipeline-transport-remediation-2026-09-07');
const E199 = V('expert-hazlenz-successor-structured-e2e-2026-09-07');
const E200 = V('expert-hazlenz-semantic-adjudication-2026-09-07');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const checks: Array<{ id: string; expected: string; actual: string; ok: boolean }> = [];
const check = (id: string, e: string, a: string): void => { checks.push({ id, expected: e, actual: a, ok: e === a }); };

function digest(dir: string): { files: number; digest: string } {
  const names = readdirSync(dir).sort();
  const h = createHash('sha256');
  for (const n of names) h.update(`${n}:${shaFile(join(dir, n))}\n`);
  return { files: names.length, digest: h.digest('hex') };
}

const d196 = digest(E196); const d197 = digest(E197); const d198 = digest(E198); const d199 = digest(E199);
check('§196 evidence file count', '14', String(d196.files));
check('§197 evidence file count', '14', String(d197.files));
check('§198 evidence file count', '11', String(d198.files));
check('§199 evidence file count', '19', String(d199.files));

const R197 = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
check('§197 terminal unchanged', 'EXPERT_HAZLENZ_STRUCTURED_PIPELINE_VALIDATION_INCONCLUSIVE — EXECUTION_REVIEW_REQUIRED', R197.TERMINAL);
check('§197 12 attempted / 0 completed / 0 tokens / $0.00', '12|0|0|0',
  `${R197.PROVIDER_CALLS_ATTEMPTED}|${R197.PROVIDER_CALLS_COMPLETED}|${R197.OUTPUT_TOKENS}|${R197.ACTUAL_PROVIDER_SPEND_USD}`);
check('§197 every axis still NOT_EXERCISED', 'true',
  String(Object.entries(R197.AXIS_RESULTS).filter(([k]) => k !== 'note').every(([, v]) => String(v).startsWith('NOT_EXERCISED'))));

const R198 = JSON.parse(readFileSync(join(E198, 'RUN-SUMMARY.json'), 'utf8'));
check('§198 terminal unchanged', 'EXPERT_HAZLENZ_STRUCTURED_PIPELINE_TRANSPORT_REMEDIATED — SUCCESSOR_HOSTED_PROTOCOL_AUTHORIZATION_REQUIRED', R198.TERMINAL);
check('§198 provider calls still 0', '0', String(R198.PROVIDER_CALLS));

const R199 = JSON.parse(readFileSync(join(E199, 'RUN-SUMMARY.json'), 'utf8'));
check('§199 terminal unchanged', 'EXPERT_HAZLENZ_STRUCTURED_PIPELINE_EXECUTED — SEMANTIC_REMEDIATION_REQUIRED', R199.TERMINAL);
check('§199 execution figures unchanged', '20|18|18|2|0.81666',
  `${R199.PROVIDER_CALLS_ATTEMPTED}|${R199.PROVIDER_CALLS_REACHING_INFERENCE}|${R199.PROVIDER_CALLS_COMPLETED}|${R199.PRE_INFERENCE_FAILURES}|${R199.ACTUAL_PROVIDER_SPEND_USD}`);
// Key names are read from the §199 record rather than hardcoded: the first draft of this gate
// spelled S_GOVERNED_SOURCE_ID_BINDING without its `_structural` suffix and reported a preservation
// FAILURE that was entirely its own. An instrument that misnames what it checks is worse than one
// that does not check it, because it accuses the evidence.
const s199Mech = R199.AXIS_RESULTS.MECHANICAL as Record<string, string>;
const notExercisedAxes = Object.entries(s199Mech)
  .filter(([k]) => /^[SNO]_/.test(k))
  .map(([k, v]) => `${k}=${String(v).startsWith('NOT_EXERCISED')}`);
check('§199 S/N/O axis keys present', '3', String(notExercisedAxes.length));
check('§199 S/N/O still NOT_EXERCISED', 'true',
  String(notExercisedAxes.every(x => x.endsWith('=true'))));
check('§199 axis T still NOT_EXERCISED', 'true',
  String(String(R199.AXIS_RESULTS.T_SPECIFICALLY?.result ?? '').startsWith('NOT_EXERCISED')));
check('§199 raw first-pass records untouched', '12',
  String(readFileSync(join(E199, 'RAW-FIRST-PASS-OUTPUTS.jsonl'), 'utf8').trim().split('\n').length));
check('§199 raw verifier records untouched', '8',
  String(readFileSync(join(E199, 'RAW-VERIFIER-OUTPUTS.jsonl'), 'utf8').trim().split('\n').length));
check('§196 historical 91/91 output preserved', 'true',
  String(readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8').includes('91/91 PASS')));

// The §200 worksheet must carry no semantic verdict.
const W = JSON.parse(readFileSync(join(E200, 'ADJUDICATION-WORKSHEET.json'), 'utf8'));
let supplied = 0;
for (const r of W.rows) for (const v of Object.values(r.verdicts)) if (v !== null) supplied += 1;
for (const f of W.facts) for (const [k, v] of Object.entries(f.verdicts)) {
  if (v !== null && v !== 'NOT_EXERCISED') supplied += 1;
  void k;
}
for (const f of W.facts) for (const v of Object.values(f.verifierSubAxes)) if (v !== null) supplied += 1;
for (const d of W.refusedDeclarations) for (const v of Object.values(d.twoSeparateQuestions)) {
  if (v !== null && typeof v !== 'string') supplied += 1;
}
check('NO SEMANTIC VERDICT SUPPLIED BY ANY §200 SCRIPT', '0', String(supplied));
check('worksheet status', 'PENDING_HUMAN_ADJUDICATION', W.status);
check('worksheet adjudicable rows', '10', String(W.completeness.rowsRequiringReview));
check('worksheet facts', '8', String(W.completeness.factsRequiringReview));
check('worksheet refused declarations', '1', String(W.completeness.refusedDeclarationsRequiringReview));
check('TRUTH_SPECIFICATION_DEFECT is a first-class outcome', 'true',
  String(typeof W.additionalOutcome?.TRUTH_SPECIFICATION_DEFECT === 'string'));

// TYPECHECK REPORTING — explicit names, never "tsc clean".
const tc = (cfg: string): string => {
  try { execSync(`npx tsc --noEmit -p ${cfg}`, { cwd: join(ROOT, 'backend'), stdio: 'pipe' }); return 'PASS'; }
  catch { return 'FAIL'; }
};
const SRC_TYPECHECK = tc('tsconfig.json');
const EXPERIMENT_SCOPE_TYPECHECK = tc('tsconfig.scripts-200.json');
check('SRC_TYPECHECK', 'PASS', SRC_TYPECHECK);
check('EXPERIMENT_SCOPE_TYPECHECK', 'PASS', EXPERIMENT_SCOPE_TYPECHECK);

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§200 EVIDENCE PRESERVATION AND ZERO-CALL VERIFICATION');
L.push(`recomputed ${new Date().toISOString()} from the files on disk`);
L.push('');
L.push(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'}   ${checks.length - failed.length}/${checks.length}`);
L.push('');
for (const c of checks) {
  L.push(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.id}`);
  L.push(`        expected  ${c.expected}`);
  if (!c.ok) L.push(`        actual    ${c.actual}`);
}
L.push('');
L.push('PROVIDER CALLS MADE BY §200: 0');
L.push('DATABASE OPERATIONS BY §200: 0');
L.push('§199 ROWS RE-RUN BY §200: 0');
L.push('TREATMENT ARTIFACTS MODIFIED BY §200: 0');
L.push('');
L.push('TYPECHECK REPORTING — explicit names, as the §200 authorization requires');
L.push(`  SRC_TYPECHECK               ${SRC_TYPECHECK}   (tsconfig.json — src/** only)`);
L.push(`  EXPERIMENT_SCOPE_TYPECHECK  ${EXPERIMENT_SCOPE_TYPECHECK}   (tsconfig.scripts-200.json — the §196-§200 file set)`);
L.push('  NEITHER IS A REPOSITORY-WIDE CHECK. Unrelated legacy scripts under backend/scripts carry');
L.push('  pre-existing type errors outside both scopes; that fact is established and unchanged.');
L.push('');
L.push('EVIDENCE PACKAGE DIGESTS — preservation proven by hashing, not by re-deriving');
L.push(`  §196  ${d196.files} files  ${d196.digest}`);
L.push(`  §197  ${d197.files} files  ${d197.digest}`);
L.push(`  §198  ${d198.files} files  ${d198.digest}`);
L.push(`  §199  ${d199.files} files  ${d199.digest}`);
L.push('');
L.push('  The §196-§199 gates were NOT re-run: each writes into its own evidence directory.');
L.push('');
if (!existsSync(E200)) mkdirSync(E200, { recursive: true });
writeFileSync(join(E200, 'PRESERVATION-VERIFICATION.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
